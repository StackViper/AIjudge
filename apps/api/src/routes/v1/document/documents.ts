import { Router, Request, Response } from "express";
import multer from "multer";
import { userMiddleware } from "../../../middleware/userMiddleware.js";
import { client } from "@repo/db";
import { extractTextFromPDF, chunkText, embedChunks } from "@repo/rag";

const router: Router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

// Configure multer for PDF uploads only, max 10MB
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory as buffer
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

/**
 * POST /cases/:caseId/documents/upload
 * Upload a PDF document, extract text, chunk it, and embed it
 */
router.post(
  "/cases/:caseId/documents/upload",
  userMiddleware,
  (req: AuthRequest, res: Response, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "File size exceeds 10MB limit" });
          }
          return res.status(400).json({ error: err.message });
        }
        // Handle fileFilter errors
        return res.status(400).json({ error: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      next();
    });
  },
  async (req: AuthRequest, res: Response) => {
    try {
      // Type guard: file is already checked in middleware, but TypeScript needs this
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { caseId } = req.params;
      const userId = req.userId;

      console.log("📄 Upload request:", {
        caseId,
        userId,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!caseId) {
        return res.status(400).json({ error: "caseId is required" });
      }

      // Determine sideId - find the side for this user in this case
      const side = await client.side.findFirst({
        where: {
          caseId,
          userId,
        },
      });

      if (!side) {
        return res.status(403).json({ error: "Unauthorized: You are not a participant in this case" });
      }

      console.log("✅ User authorized, side:", side.role);

      // Extract text from PDF
      console.log("📖 Extracting text from PDF...");
      const text = await extractTextFromPDF(req.file.buffer);
      console.log(`✅ Extracted ${text.length} characters`);

      // Save document to Postgres
      console.log("💾 Saving document to database...");
      const document = await client.document.create({
        data: {
          caseId,
          sideId: side.id,
          text,
        },
      });
      console.log("✅ Document saved:", document.id);

      // Chunk text
      const chunks = chunkText(text);
      console.log(`📦 Created ${chunks.length} chunks`);

      // Embed chunks and store in Chroma
      console.log("🔮 Embedding chunks in ChromaDB...");
      await embedChunks(caseId, document.id, side.id, chunks);
      console.log("✅ Chunks embedded successfully");

      return res.status(201).json({
        success: true,
        documentId: document.id,
        message: "Document uploaded and processed successfully",
      });
    } catch (error: any) {
      console.error("❌ Error uploading document:", error);
      console.error("Error details:", {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      });

      // Handle specific error types
      if (error?.message?.includes("Invalid PDF")) {
        return res.status(400).json({ error: "Invalid PDF file. Please upload a valid PDF document." });
      }

      if (error?.message?.includes("Failed to embed chunks")) {
        return res.status(500).json({ error: "ChromaDB connection error. Please check if ChromaDB is configured correctly." });
      }

      if (error?.code === "P2002") {
        return res.status(400).json({ error: "Document already exists" });
      }

      // Generic error response
      const errorMessage = error?.message || "Internal server error";
      return res.status(500).json({ error: errorMessage });
    }
  }
);

export default router;

