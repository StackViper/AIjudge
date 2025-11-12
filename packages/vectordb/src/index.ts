import { ChromaClient } from "chromadb";

// Get ChromaDB URL from environment (defaults to local Docker instance)
const chromaUrl = process.env.CHROMA_URL || "http://localhost:8000";

// Build ChromaDB client configuration
const chromaConfig: any = {
  path: chromaUrl,
};

// Only add auth if API key is provided (for hosted instances)
if (process.env.CHROMA_API_KEY) {
  chromaConfig.auth = {
    provider: "token",
    credentials: process.env.CHROMA_API_KEY,
  };
  
  // Optional tenant/database for multi-tenant hosted instances
  if (process.env.CHROMA_TENANT) {
    chromaConfig.tenant = process.env.CHROMA_TENANT;
  }
  if (process.env.CHROMA_DATABASE) {
    chromaConfig.database = process.env.CHROMA_DATABASE;
  }
}

console.log("🔧 ChromaDB config:", {
  url: chromaUrl,
  mode: process.env.CHROMA_API_KEY ? "hosted" : "local",
  hasApiKey: !!process.env.CHROMA_API_KEY,
});

export const vectorDB = new ChromaClient(chromaConfig);
