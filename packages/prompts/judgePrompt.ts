export interface EvidenceChunk {
  text: string;
  score: number;
  metadata: Record<string, any>;
}

export interface TurnItem {
  role: "CLAIMANT" | "RESPONDENT";
  order: number;
  message: string;
}

export interface JudgeOutput {
  summary: string;
  reasoning: string;
  finalText: string;
}

export function buildJudgePrompt(
  caseTitle: string,
  turns: TurnItem[],
  evidence: EvidenceChunk[]
): { system: string; user: string } {
  const system = `You are an impartial judge. Follow due process and render a clear, lawful verdict. Respond in strict JSON with keys: summary, reasoning, finalText.`;

  const turnsText = turns
    .sort((a, b) => a.order - b.order)
    .map((t) => `${t.order}. ${t.role}: ${t.message}`)
    .join("\n");

  const evidenceText = evidence
    .map((e, i) => `E${i + 1} (score:${e.score.toFixed(4)}): ${e.text}`)
    .join("\n");

  const user = `Case: ${caseTitle}\n\nTurns:\n${turnsText}\n\nTop Evidence:\n${evidenceText}\n\nReturn JSON with keys exactly: summary, reasoning, finalText.`;

  return { system, user };
}
