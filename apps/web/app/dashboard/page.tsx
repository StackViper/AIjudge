"use client";
import * as React from "react";
import { useCases, useCreateCase } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Briefcase } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: cases, isLoading } = useCases();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [respondentEmail, setRespondentEmail] = React.useState("");

  const createCase = useCreateCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCase.mutate(
      { title, respondentEmail },
      {
        onSuccess: (data) => {
          setModalOpen(false);
          setTitle("");
          setRespondentEmail("");
          router.push(`/cases/${data.case.id}`);
        },
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Cases</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your legal disputes</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Case
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : !cases || cases.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cases yet</h3>
          <p className="text-sm text-gray-600 mb-6">Get started by creating your first case</p>
          <Button onClick={() => setModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Case
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {cases.map((caseItem: any, index: number) => {
            // Calculate turn counts for proper status display
            const claimantTurns = caseItem.turns?.filter((t: any) => t.side?.role === "CLAIMANT").length || 0;
            const respondentTurns = caseItem.turns?.filter((t: any) => t.side?.role === "RESPONDENT").length || 0;
            const bothSidesCompleted = claimantTurns >= 5 && respondentTurns >= 5;
            
            // Determine case status
            let statusText = "🔓 OPEN";
            let statusClass = "bg-green-100 text-green-800";
            
            if (caseItem.verdict) {
              statusText = "⚖️ CLOSED";
              statusClass = "bg-red-100 text-red-800 border border-red-200";
            } else if (bothSidesCompleted) {
              statusText = "⚖️ READY FOR VERDICT";
              statusClass = "bg-amber-100 text-amber-800 border border-amber-200";
            }
            
            return (
              <Card
                key={`${caseItem.id}-${index}`}
                className="p-5 hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                onClick={() => router.push(`/cases/${caseItem.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{caseItem.title}</h3>
                    <div className="flex items-center gap-4 text-sm mb-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                        {caseItem.userRole || "CLAIMANT"}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full font-medium ${statusClass}`}>
                        {statusText}
                      </span>
                    </div>
                  {caseItem.turns && caseItem.turns.length > 0 && (
                    <div className="text-sm text-gray-600">
                      Arguments: <span className="font-medium">
                        {claimantTurns}/5 (Claimant) vs {respondentTurns}/5 (Respondent)
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(caseItem.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Case</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {createCase.error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  {(createCase.error as any)?.response?.data?.error || "Failed to create case"}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="title">Case Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Breach of Contract Dispute"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="respondentEmail">Respondent Email</Label>
                <Input
                  id="respondentEmail"
                  type="email"
                  placeholder="respondent@example.com"
                  value={respondentEmail}
                  onChange={(e) => setRespondentEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={createCase.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createCase.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                {createCase.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Case"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
