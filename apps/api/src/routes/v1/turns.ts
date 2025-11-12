import { Router, Request, Response } from "express";
import { userMiddleware } from "../../middleware/userMiddleware.js";
import { client } from "@repo/db";

const router: Router = Router();

interface AuthRequest extends Request {
  userId?: string;
}

interface TurnBody {
  message: string;
}

router.post("/cases/:caseId/turns", userMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { caseId } = req.params;
    const userId = req.userId;
    const { message } = req.body as TurnBody;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!caseId) return res.status(400).json({ error: "caseId is required" });
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "message is required" });
    }

    // Find the user's side in this case
    const side = await client.side.findFirst({
      where: { caseId, userId },
    });

    if (!side) {
      return res.status(403).json({ error: "You are not a participant in this case" });
    }

    // Fetch existing turns ordered by order asc
    const turns = await client.turn.findMany({
      where: { caseId },
      orderBy: { order: "asc" },
      include: { side: true },
    });

    // Enforce alternating turns: CLAIMANT starts
    let expectedRole: "CLAIMANT" | "RESPONDENT" = "CLAIMANT";
    if (turns.length > 0) {
      const lastTurn = turns[turns.length - 1]!;
      expectedRole = lastTurn.side.role === "CLAIMANT" ? "RESPONDENT" : "CLAIMANT";
    }

    if (side.role !== expectedRole) {
      return res.status(400).json({
        error: `It is ${expectedRole}'s turn`,
      });
    }

    // Limit: Each side can send max 5 messages
    const sideCount = turns.filter((t) => t.sideId === side.id).length;
    if (sideCount >= 5) {
      return res.status(400).json({ error: "Message limit reached for your side (5)" });
    }

    const nextOrder = turns.length + 1;

    const turn = await client.turn.create({
      data: {
        caseId,
        sideId: side.id,
        message: message.trim(),
        order: nextOrder,
      },
    });

    return res.status(201).json({ success: true, turn });
  } catch (error: any) {
    console.error("Error creating turn:", error);
    return res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

export default router;
