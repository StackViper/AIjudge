"use client";
import * as React from "react";
import { useCase, useGenerateVerdict } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Loader2, Upload, MessageSquare, FileText, Scale, User, Gavel } from "lucide-react";

export default function CaseDetailPage({ params }: { params: { caseId: string } }) {
  const router = useRouter();
  const { data: caseData, isLoading } = useCase(params.caseId);
  const generateVerdict = useGenerateVerdict(params.caseId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card className="p-8 text-center">
          <p className="text-gray-600">Case not found</p>
        </Card>
      </div>
    );
  }

  const userRole = caseData.userRole || "CLAIMANT";
  const userSideTurns = caseData.turns?.filter((t: any) => t.side?.role === userRole).length || 0;
  const canSendTurn = userSideTurns < 5 && !caseData.verdict;
  
  // Check if both sides have completed their arguments (5 turns each)
  const claimantTurns = caseData.turns?.filter((t: any) => t.side?.role === "CLAIMANT").length || 0;
  const respondentTurns = caseData.turns?.filter((t: any) => t.side?.role === "RESPONDENT").length || 0;
  const bothSidesCompleted = claimantTurns >= 5 && respondentTurns >= 5 && !caseData.verdict;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Scale className="w-6 h-6 text-indigo-600" />
          <h1 className="text-3xl font-semibold text-gray-900">{caseData.title}</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">
            {userRole}
          </span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full font-medium ${
            caseData.verdict 
              ? "bg-red-100 text-red-800 border border-red-200" 
              : "bg-green-100 text-green-800"
          }`}>
            {caseData.verdict ? "⚖️ CLOSED" : "🔓 OPEN"}
          </span>
          {caseData.turns && caseData.turns.length > 0 && (
            <span className="text-gray-600">
              Arguments: <span className="font-medium">{claimantTurns}/5 (Claimant) vs {respondentTurns}/5 (Respondent)</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-8">
        <Button
          onClick={() => router.push(`/cases/${params.caseId}/upload`)}
          variant="outline"
          disabled={!!caseData.verdict || caseData.status === "CLOSED"}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Evidence
        </Button>
        <Button
          onClick={() => router.push(`/cases/${params.caseId}/argue`)}
          disabled={!canSendTurn || caseData.status === "CLOSED"}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          {caseData.status === "CLOSED" ? "Case Closed" : userSideTurns >= 5 ? "Turn Limit Reached" : "Submit Argument"}
        </Button>
        {bothSidesCompleted && !caseData.verdict && (
          <Button
            onClick={() => generateVerdict.mutate()}
            disabled={generateVerdict.isPending || caseData.status === "CLOSED"}
            className="bg-green-600 hover:bg-green-700"
          >
            {generateVerdict.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Gavel className="w-4 h-4 mr-2" />
            )}
            Generate Verdict
          </Button>
        )}
      </div>

      {/* Verdict Generation Success Message */}
      {bothSidesCompleted && !generateVerdict.isPending && (
        <Card className="p-4 mb-6 border-green-200 bg-green-50">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">
              Both sides have completed their arguments! Click "Generate Verdict" to get the AI judge's decision.
            </p>
          </div>
        </Card>
      )}

      {/* Verdict Generation Error */}
      {generateVerdict.error && (
        <Card className="p-4 mb-6 border-red-200 bg-red-50">
          <p className="text-sm text-red-800">
            Failed to generate verdict: {(generateVerdict.error as any)?.response?.data?.error || "Unknown error"}
          </p>
        </Card>
      )}

      {/* Sides */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Parties
        </h2>
        <div className="grid gap-3">
          {caseData.sides?.map((side: any) => (
            <div key={side.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900">{side.user?.email || "Unknown"}</span>
                <span className="text-xs text-gray-500 ml-2">({side.user?.name || "Unknown"})</span>
              </div>
              <span className="text-xs font-medium text-indigo-600 uppercase">{side.side}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Documents */}
      {caseData.documents && caseData.documents.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents
          </h2>
          <div className="space-y-2">
            {caseData.documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{doc.filename || "Document"}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Turns */}
      {caseData.turns && caseData.turns.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Arguments
          </h2>
          
          {/* Legend */}
          <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 to-red-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-600 shadow-sm" />
                <span className="text-sm font-bold text-blue-900">CLAIMANT</span>
                <span className="text-xs text-gray-600 ml-1">Plaintiff</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 font-medium">VS</div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 mr-1">Defendant</span>
                <span className="text-sm font-bold text-red-900">RESPONDENT</span>
                <div className="w-4 h-4 rounded-full bg-red-600 shadow-sm" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {caseData.turns.map((turn: any, idx: number) => {
              const isClaimant = turn.side?.role === "CLAIMANT";
              const isRespondent = turn.side?.role === "RESPONDENT";
              const isJudge = turn.side?.role === "JUDGE";

              if (isJudge) {
                return (
                  <div key={turn.id} className="flex justify-center my-6">
                    <div className="max-w-3xl w-full">
                      <div className="flex items-center justify-center mb-3">
                        <div className="bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-2 rounded-full border border-amber-300 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4 text-amber-700" />
                            <span className="text-sm font-bold text-amber-900 uppercase tracking-wide">Judge's Ruling</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6 shadow-lg">
                        <p className="text-gray-800 leading-relaxed text-base font-medium">{turn.message || turn.content}</p>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-amber-200">
                          <span className="text-xs text-amber-700 font-medium">
                            Official Court Statement
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(turn.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={turn.id} className={`flex ${isRespondent ? "justify-end" : "justify-start"} mb-4`}>
                  <div className={`max-w-lg ${isRespondent ? "text-right" : "text-left"}`}>
                    {/* Speaker Label */}
                    <div className={`flex items-center gap-2 mb-2 ${isRespondent ? "justify-end" : "justify-start"}`}>
                      {isClaimant && (
                        <>
                          <div className="w-3 h-3 rounded-full bg-blue-600 shadow-sm" />
                          <span className="text-sm font-bold text-blue-900 uppercase tracking-wide">
                            Claimant's Argument
                          </span>
                        </>
                      )}
                      {isRespondent && (
                        <>
                          <span className="text-sm font-bold text-red-900 uppercase tracking-wide">
                            Respondent's Rebuttal
                          </span>
                          <div className="w-3 h-3 rounded-full bg-red-600 shadow-sm" />
                        </>
                      )}
                    </div>
                    
                    {/* Message Card */}
                    <div className={`relative p-5 rounded-xl shadow-md ${
                      isClaimant
                        ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200"
                        : "bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200"
                    }`}>
                      {/* Arrow pointer */}
                      <div className={`absolute top-5 w-0 h-0 ${
                        isClaimant 
                          ? "left-[-8px] border-t-[8px] border-t-transparent border-r-[8px] border-r-blue-200 border-b-[8px] border-b-transparent"
                          : "right-[-8px] border-t-[8px] border-t-transparent border-l-[8px] border-l-red-200 border-b-[8px] border-b-transparent"
                      }`} />
                      
                      <div className={`text-base font-medium leading-relaxed mb-3 p-3 rounded-lg ${
                        isClaimant 
                          ? "bg-white/80 text-blue-900 border border-blue-200" 
                          : "bg-white/80 text-red-900 border border-red-200"
                      }`}>
                        <div className="font-bold text-xs uppercase mb-1 opacity-75">
                          {isClaimant ? "Claimant says:" : "Respondent says:"}
                        </div>
                        {turn.message || turn.content}
                      </div>
                      
                      <div className={`flex items-center justify-between text-xs ${
                        isClaimant ? "text-blue-600" : "text-red-600"
                      }`}>
                        <span className="font-medium">
                          {isClaimant ? "Plaintiff Statement" : "Defense Statement"}
                        </span>
                        <span>
                          {new Date(turn.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Verdict */}
      {caseData.verdict && (
        <Card className="p-6 border-2 border-indigo-200 bg-indigo-50">
          <h2 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
            <Scale className="w-6 h-6" />
            ⚖️ AI Judge Verdict
          </h2>
          <div className="space-y-6">
            {/* Case Summary */}
            {caseData.verdict.summary && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">📋 Case Summary</h3>
                <p className="text-base text-gray-900 leading-relaxed bg-white p-4 rounded-lg border border-indigo-100">
                  {caseData.verdict.summary}
                </p>
              </div>
            )}

            {/* Key Claims */}
            {caseData.verdict.keyClaims && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">🎯 Key Claims Identified</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">🔵 Claimant's Claims</h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      {(caseData.verdict.keyClaims as any)?.claimant?.map((claim: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{claim}</span>
                        </li>
                      )) || <li className="text-blue-600 italic">No claims identified</li>}
                    </ul>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-900 mb-2">🔴 Respondent's Claims</h4>
                    <ul className="space-y-1 text-sm text-red-800">
                      {(caseData.verdict.keyClaims as any)?.respondent?.map((claim: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>{claim}</span>
                        </li>
                      )) || <li className="text-red-600 italic">No claims identified</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Evidence Credibility */}
            {caseData.verdict.evidence && (caseData.verdict.evidence as any)?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">📄 Evidence Analysis</h3>
                <div className="space-y-3">
                  {(caseData.verdict.evidence as any)?.map((evidence: any, idx: number) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-gray-800 italic">"{evidence.document}"</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          evidence.credibility === 'High' ? 'bg-green-100 text-green-800' :
                          evidence.credibility === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {evidence.credibility} Credibility
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{evidence.relevance}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legal Precedents */}
            {caseData.verdict.precedents && (caseData.verdict.precedents as any)?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">⚖️ Legal Precedents</h3>
                <div className="space-y-3">
                  {(caseData.verdict.precedents as any)?.map((precedent: any, idx: number) => (
                    <div key={idx} className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <h4 className="font-semibold text-amber-900 mb-1">{precedent.case}</h4>
                      <p className="text-sm text-amber-800">{precedent.relevance}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legal Reasoning */}
            {caseData.verdict.reasoning && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">🧠 Legal Reasoning</h3>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-base text-gray-900 leading-relaxed whitespace-pre-line">
                    {caseData.verdict.reasoning}
                  </p>
                </div>
              </div>
            )}

            {/* Final Judgment */}
            {caseData.verdict.finalText && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">⚖️ Final Judgment</h3>
                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 rounded-lg border-2 border-indigo-300">
                  <p className="text-base font-semibold text-indigo-900 leading-relaxed">
                    {caseData.verdict.finalText}
                  </p>
                </div>
              </div>
            )}

            {/* Next Steps */}
            {caseData.verdict.nextSteps && (caseData.verdict.nextSteps as any)?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">🚀 Suggested Next Steps</h3>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <ul className="space-y-2 text-sm text-green-800">
                    {(caseData.verdict.nextSteps as any)?.map((step: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 font-bold mt-0.5">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-600 pt-4 border-t border-indigo-200">
              Rendered on {new Date(caseData.verdict.createdAt).toLocaleString()}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
