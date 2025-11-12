import { Router, Request, Response } from "express";
import { userMiddleware } from "../../middleware/userMiddleware.js";
import { client } from "@repo/db";
import { retrieveRelevantChunks } from "@repo/rag";
import { buildJudgePrompt, JudgeOutput, TurnItem } from "@repo/prompts/judgePrompt";

const router: Router = Router();

interface AuthRequest extends Request { userId?: string }

router.post("/cases/:caseId/verdict", userMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { caseId } = req.params;
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
    if (!caseId) return res.status(400).json({ error: "caseId is required" });

    // Fetch case details with sides and turns
    const theCase = await client.case.findUnique({
      where: { id: caseId },
      include: {
        sides: true,
        turns: { orderBy: { order: "asc" }, include: { side: true } },
        verdict: true,
      },
    });

    if (!theCase) return res.status(404).json({ error: "Case not found" });

    // Build turns view
    const turns: TurnItem[] = theCase.turns.map((t) => ({
      role: t.side.role as "CLAIMANT" | "RESPONDENT",
      order: t.order,
      message: t.message,
    }));

    // Aggregate a query from turns for evidence retrieval
    const query = turns.map((t) => `${t.role}: ${t.message}`).join("\n").slice(0, 8000);
    const evidence = await retrieveRelevantChunks(caseId, query, 5);

    // Build prompt
    const { system, user } = buildJudgePrompt(theCase.title, turns, evidence);

    // Call model via REST API
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      return res.status(502).json({ error: `OpenAI API error: ${resp.status} ${errText}` });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || "{}";
    let parsed: JudgeOutput;
    try {
      parsed = JSON.parse(content) as JudgeOutput;
    } catch {
      return res.status(502).json({ error: "Failed to parse model output" });
    }

    if (!parsed.summary || !parsed.reasoning || !parsed.finalText) {
      return res.status(502).json({ error: "Model output missing required fields" });
    }

    const verdict = await client.verdict.upsert({
      where: { caseId: caseId },
      create: {
        caseId: caseId,
        summary: parsed.summary,
        reasoning: parsed.reasoning,
        finalText: parsed.finalText,
        keyClaims: parsed.keyClaims || { claimant: [], respondent: [] },
        evidence: parsed.evidenceCredibility || [],
        precedents: parsed.legalPrecedents || [],
        nextSteps: parsed.nextSteps || [],
      },
      update: {
        summary: parsed.summary,
        reasoning: parsed.reasoning,
        finalText: parsed.finalText,
        keyClaims: parsed.keyClaims || { claimant: [], respondent: [] },
        evidence: parsed.evidenceCredibility || [],
        precedents: parsed.legalPrecedents || [],
        nextSteps: parsed.nextSteps || [],
      },
    });

    return res.status(201).json({ success: true, verdict });
  } catch (error: any) {
    console.error("Verdict generation error:", error);
    return res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

export default router;
