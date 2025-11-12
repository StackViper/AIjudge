import { EmbeddingFunction } from "chromadb";
import { DefaultEmbeddingFunction } from "@chroma-core/default-embed";
import { OpenAI } from "openai";
import pdf from "pdf-parse";
import { v4 as uuidv4 } from "uuid";
import { vectorDB } from "@repo/vectordb";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const COLLECTION_NAME = "documents";

// Simple in-memory cache for embeddings
const embeddingCache = new Map<string, number[]>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const cacheTimestamps = new Map<string, number>();

/**
 * Extracts text content from a PDF file buffer
 * @param fileBuffer - Buffer containing PDF file data
 * @returns Promise resolving to extracted text string
 */
export async function extractTextFromPDF(
  fileBuffer: Buffer
): Promise<string> {
  try {
    // Validate file buffer size
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error("PDF file is empty or corrupted.");
    }
    
    // Check file size (limit to 50MB to prevent memory issues)
    if (fileBuffer.length > 50 * 1024 * 1024) {
      throw new Error("PDF file is too large. Please upload a file smaller than 50MB.");
    }
    
    const data = await pdf(fileBuffer);
    
    // Check if extracted text is meaningful
    if (!data.text || data.text.trim().length === 0) {
      throw new Error("PDF contains no readable text. The PDF might be scanned images only or password-protected.");
    }
    
    return data.text;
  } catch (error: any) {
    // Provide helpful error messages for common PDF issues
    if (error?.message?.includes("Command token too long")) {
      throw new Error("PDF file is corrupted or malformed. Please try saving the PDF again or use a different PDF.");
    }
    
    if (error?.message?.includes("bad XRef entry")) {
      throw new Error("PDF file has a broken structure. Please export the PDF again from the original document.");
    }
    
    if (error?.message?.includes("password")) {
      throw new Error("PDF is password-protected. Please remove the password protection and try again.");
    }
    
    if (error?.message?.includes("RangeError") || error?.message?.includes("out of memory")) {
      throw new Error("PDF file is too large or complex. Please try a smaller or simpler PDF.");
    }
    
    throw new Error(`Failed to extract text from PDF: ${error?.message || error}. Please ensure the PDF is not password-protected and contains readable text.`);
  }
}

/**
 * Chunks text into smaller pieces for embedding
 * @param text - The text to chunk
 * @param chunkSize - Maximum size of each chunk in characters (default: 1000)
 * @returns Array of text chunks
 */
export function chunkText(text: string, chunkSize: number = 1000): string[] {
  if (chunkSize <= 0) {
    throw new Error("chunkSize must be greater than 0");
  }

  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, i + chunkSize));
  }

  return chunks.length > 0 ? chunks : [text];
}

/**
 * Embeds text chunks using OpenAI and stores them in Chroma
 * @param caseId - The case ID
 * @param documentId - The document ID
 * @param sideId - The side ID
 * @param chunks - Array of text chunks to embed
 * @returns Promise that resolves when all chunks are embedded and stored
 */
export async function embedChunks(
  caseId: string,
  documentId: string,
  sideId: string,
  chunks: string[]
): Promise<void> {
  if (chunks.length === 0) {
    return;
  }

  try {
    // Get or create collection with default embedding function
    const collection = await vectorDB.getOrCreateCollection({
      name: COLLECTION_NAME,
      embeddingFunction: new DefaultEmbeddingFunction(),
    });

    // Generate embeddings for all chunks in parallel
    const embeddingPromises = chunks.map((chunk) =>
      openai.embeddings.create({
        model: "text-embedding-3-large",
        input: chunk,
      })
    );

    const embeddingResponses = await Promise.all(embeddingPromises);

    // Prepare data for Chroma
    const ids: string[] = [];
    const embeddings: number[][] = [];
    const documents: string[] = [];
    const metadatas: Array<{
      caseId: string;
      documentId: string;
      sideId: string;
      chunkIndex: number;
    }> = [];

    embeddingResponses.forEach((response, index) => {
      const embedding = response.data[0]?.embedding;
      if (!embedding) {
        throw new Error(`Failed to generate embedding for chunk ${index}`);
      }

      ids.push(uuidv4());
      embeddings.push(embedding);
      documents.push(chunks[index]!);
      metadatas.push({
        caseId,
        documentId,
        sideId,
        chunkIndex: index,
      });
    });

    // Add all embeddings to Chroma in a single batch
    await collection.add({
      ids,
      embeddings,
      documents,
      metadatas,
    });
  } catch (error) {
    throw new Error(`Failed to embed chunks: ${error}`);
  }
}

export interface RetrievedChunk {
  text: string;
  score: number;
  metadata: Record<string, any>;
}

/**
 * Get cached embedding or generate new one
 */
async function getCachedEmbedding(text: string): Promise<number[]> {
  const cacheKey = text.slice(0, 200); // Use first 200 chars as cache key
  const timestamp = cacheTimestamps.get(cacheKey);
  
  // Return cached embedding if still valid
  if (timestamp && Date.now() - timestamp < CACHE_TTL) {
    const cached = embeddingCache.get(cacheKey);
    if (cached) return cached;
  }
  
  // Generate new embedding
  const response = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: text,
  });
  
  const embedding = response.data[0]?.embedding;
  if (!embedding) {
    throw new Error("Failed to generate embedding");
  }
  
  // Cache the result
  embeddingCache.set(cacheKey, embedding);
  cacheTimestamps.set(cacheKey, Date.now());
  
  return embedding;
}

/**
 * Retrieve top-N relevant chunks for a case using semantic search
 */
export async function retrieveRelevantChunks(
  caseId: string,
  query: string,
  topN: number = 5
): Promise<RetrievedChunk[]> {
  try {
    const collection = await vectorDB.getOrCreateCollection({ 
      name: COLLECTION_NAME,
      embeddingFunction: undefined, // Disable default embedding function
    });

    const queryEmbedding = await getCachedEmbedding(query);

    const result = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topN,
      where: { caseId },
      include: ["documents", "metadatas", "distances"],
    } as any);

    // Chroma returns arrays per query; we used one query
    const docs = (result.documents?.[0] ?? []) as string[];
    const metas = (result.metadatas?.[0] ?? []) as Record<string, any>[];
    const distances = (result.distances?.[0] ?? []) as number[];

    const items: RetrievedChunk[] = docs.map((text, i) => {
      const distance = distances?.[i] ?? 0;
      const score = 1 / (1 + distance); // higher = more similar
      return { text, score, metadata: metas?.[i] ?? {} };
    });

    // Sort by score desc for consistency
    return items.sort((a, b) => b.score - a.score).slice(0, topN);
  } catch (error) {
    throw new Error(`Failed to retrieve relevant chunks: ${error}`);
  }
}



