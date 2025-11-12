"use client";
import * as React from "react";
import { useCase, useSendTurn, useGenerateVerdict, CaseData } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Loader2, Send, ArrowLeft, Scale, MessageSquare, Gavel } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function ArguePage({ params }: { params: { caseId: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: caseData, isLoading } = useCase(params.caseId);
  const sendTurn = useSendTurn(params.caseId);
  const generateVerdict = useGenerateVerdict(params.caseId);
  const [message, setMessage] = React.useState("");

  const userRole = caseData?.userRole || "CLAIMANT";
  const userSideTurns = caseData?.turns?.filter((t) => t.side?.role === userRole).length || 0;
  const canSendTurn = userSideTurns < 5 && !caseData?.verdict;
  
  // Check if both sides have completed their arguments (5 turns each)
  const claimantTurns = caseData?.turns?.filter((t) => t.side?.role === "CLAIMANT").length || 0;
  const respondentTurns = caseData?.turns?.filter((t) => t.side?.role === "RESPONDENT").length || 0;
  const bothSidesCompleted = claimantTurns >= 5 && respondentTurns >= 5 && !caseData?.verdict;

  // Auto-generate verdict when both sides complete
  React.useEffect(() => {
    if (bothSidesCompleted && !generateVerdict.isPending) {
      // Small delay to ensure UI updates first
      const timer = setTimeout(() => {
        generateVerdict.mutate();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [bothSidesCompleted, generateVerdict]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !canSendTurn) return;
    
    sendTurn.mutate(
      { content: message.trim() },
      {
        onSuccess: () => {
          setMessage("");
          // Case cache is automatically invalidated by useSendTurn hook
          // Argument counters will update in real-time
        },
      }
    );
  };

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

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pb-32">
      <Button
        variant="ghost"
        onClick={() => router.push(`/cases/${params.caseId}`)}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Case
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-600" />
          Submit Argument
        </h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">
            {userRole}
          </span>
          <span className="text-gray-600">
            Turns used: <span className="font-medium">{userSideTurns}/5</span>
          </span>
        </div>
      </div>

      {/* Turns Display */}
      {caseData.turns && caseData.turns.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Previous Arguments</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {caseData.turns.map((turn, idx: number) => {
              const isClaimant = turn.side?.role === "CLAIMANT";
              const isRespondent = turn.side?.role === "RESPONDENT";
              const isJudge = turn.side?.role === "JUDGE";

              if (isJudge) {
                return (
                  <div key={turn.id} className="flex justify-center my-6">
                    <div className="max-w-2xl w-full">
                      <div className="flex items-center justify-center mb-3">
                        <div className="bg-gradient-to-r from-amber-100 to-yellow-100 px-3 py-1 rounded-full border border-amber-300 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Scale className="w-3 h-3 text-amber-700" />
                            <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">Judge's Ruling</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4 shadow-lg">
                        <div className="text-base font-medium leading-relaxed p-3 rounded-lg bg-white/80 border border-amber-200">
                        <div className="font-bold text-xs uppercase mb-1 opacity-75 text-amber-700">
                          Judge rules:
                        </div>
                        {turn.message}
                      </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-amber-200">
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
                    <div className={`relative p-4 rounded-xl shadow-md ${
                      isClaimant
                        ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200"
                        : "bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200"
                    }`}>
                      {/* Arrow pointer */}
                      <div className={`absolute top-4 w-0 h-0 ${
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
                        {turn.message}
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

      {/* Argument Input - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto p-4">
          {sendTurn.error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                {(sendTurn.error as any)?.response?.data?.error || "Failed to send argument"}
              </p>
            </div>
          )}

          {!canSendTurn ? (
            <Card className="p-4 bg-gray-50">
              {caseData.verdict ? (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Gavel className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-semibold text-green-800">
                      ⚖️ Case CLOSED - Final verdict has been rendered
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                      STATUS: CLOSED
                    </span>
                  </div>
                  <Button
                    onClick={() => router.push(`/cases/${params.caseId}`)}
                    className="mt-2 bg-green-600 hover:bg-green-700"
                  >
                    View Full Verdict
                  </Button>
                </div>
              ) : bothSidesCompleted ? (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    <p className="text-sm font-semibold text-amber-800">
                      Both sides have completed arguments! AI Judge is analyzing the case...
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">
                    Generating verdict automatically
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600 text-center">
                  You have reached the maximum number of turns (5)
                </p>
              )}
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Write your argument as ${userRole}...`}
                className="flex-1 min-h-[80px] px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={sendTurn.isPending}
                required
              />
              <Button
                type="submit"
                disabled={!message.trim() || sendTurn.isPending}
                className="self-end bg-indigo-600 hover:bg-indigo-700"
              >
                {sendTurn.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
