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
  keyClaims: {
    claimant: string[];
    respondent: string[];
  };
  evidenceCredibility: {
    document: string;
    credibility: "High" | "Medium" | "Low";
    relevance: string;
  }[];
  legalPrecedents: {
    case: string;
    relevance: string;
  }[];
  nextSteps: string[];
}

export function buildJudgePrompt(
  caseTitle: string,
  turns: TurnItem[],
  evidence: EvidenceChunk[]
): { system: string; user: string } {
  const system = `You are an AI Judge specializing in objective and transparent reasoning.

You are given:
1. Side A (Claimant) case statement + their documents (parsed text)
2. Side B (Respondent) case statement + their documents (parsed text)
3. Relevant jurisdiction law framework (ex: Indian IPC & Evidence Act)

Your tasks:
- Identify and summarize key claims from both sides.
- Evaluate the credibility and relevance of each document.
- Retrieve or reference similar legal precedents if possible.
- Generate an initial unbiased judgment with a clear reasoning chain:
  (Facts → Legal rules → Application → Conclusion)

Always output in strict JSON format with these exact keys:
{
  "summary": "Case summary with key claims from both sides",
  "keyClaims": {
    "claimant": ["list of key claims from claimant"],
    "respondent": ["list of key claims from respondent"]
  },
  "evidenceCredibility": [
    {
      "document": "document excerpt or reference",
      "credibility": "High/Medium/Low",
      "relevance": "why this evidence matters"
    }
  ],
  "legalPrecedents": [
    {
      "case": "precedent case name",
      "relevance": "how this precedent applies"
    }
  ],
  "reasoning": "Legal reasoning trace: Facts → Legal rules → Application → Conclusion",
  "finalText": "Final judgment with clear conclusion",
  "nextSteps": ["Suggested real-world next steps like Notice, Appeal, Mediation"]
}

Maintain neutrality, clarity, and reference only verifiable facts.`;

  const turnsText = turns
    .sort((a, b) => a.order - b.order)
    .map((t) => `${t.order}. ${t.role}: ${t.message}`)
    .join("\n");

  const evidenceText = evidence
    .map((e, i) => `E${i + 1} (score:${e.score.toFixed(4)}): ${e.text}`)
    .join("\n");

  const user = `Case: ${caseTitle}

LEGAL FRAMEWORK: Indian Penal Code (IPC) and Indian Evidence Act apply unless otherwise specified.

ARGUMENTS FROM BOTH SIDES:
${turnsText}

EVIDENCE SUBMITTED:
${evidenceText}

Based on the above case, arguments, and evidence, provide your comprehensive legal analysis following the specified format. Consider:
1. Material facts from both sides
2. Credibility and weight of evidence presented
3. Applicable legal provisions under IPC/Evidence Act
4. Relevant legal precedents (if known)
5. Clear reasoning chain leading to conclusion

Return your response in the exact JSON format specified in the system prompt.`;

  return { system, user };
}
