import { Router, Request, Response } from "express";
import { userMiddleware } from "../../middleware/userMiddleware.js";
import { retrieveRelevantChunks } from "@repo/rag";

const router: Router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

router.post("/cases/:caseId/search", userMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { caseId } = req.params;
    const { query } = req.body as { query?: string };

    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    if (!caseId) return res.status(400).json({ error: "caseId is required" });
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({ error: "query is required" });
    }

    const results = await retrieveRelevantChunks(caseId, query.trim(), 5);

    return res.json({ results });
  } catch (error: any) {
    console.error("Search error:", error);
    return res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

export default router;
