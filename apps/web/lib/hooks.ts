"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

// TypeScript interfaces for case data
export interface Turn {
  id: string;
  caseId: string;
  sideId: string;
  message: string;
  order: number;
  createdAt: string;
  side: {
    id: string;
    role: "CLAIMANT" | "RESPONDENT" | "JUDGE";
    userId: string;
  };
}

export interface Verdict {
  id: string;
  caseId: string;
  summary: string;
  reasoning: string;
  finalText: string;
  createdAt: string;
}

export interface CaseData {
  id: string;
  title: string;
  createdAt: string;
  createdByUserId: string;
  userRole: "CLAIMANT" | "RESPONDENT" | null;
  turns: Turn[];
  verdict: Verdict | null;
}

// GET /cases/user/all
export function useCases() {
  return useQuery({
    queryKey: ["cases"],
    queryFn: async () => {
      const res = await api.get("/cases/user/all");
      return res.data;
    },
  });
}

// GET /cases/:caseId
export function useCase(caseId: string) {
  return useQuery<CaseData>({
    queryKey: ["case", caseId],
    queryFn: async (): Promise<CaseData> => {
      const res = await api.get(`/cases/${caseId}`);
      return res.data;
    },
    enabled: !!caseId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (replaces cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 2, // Only retry failed requests twice
  });
}

// POST /cases
export function useCreateCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { title: string; respondentEmail: string }) => {
      const res = await api.post("/cases", body);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cases"] });
    },
  });
}

// POST /cases/:caseId/documents/upload
export function useUploadDocument(caseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post(`/cases/${caseId}/documents/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case", caseId] });
    },
  });
}

// POST /cases/:caseId/turns
export function useSendTurn(caseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { content: string }) => {
      // Backend expects 'message' not 'content'
      const res = await api.post(`/cases/${caseId}/turns`, { message: body.content });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case", caseId] });
    },
  });
}

// POST /cases/:caseId/verdict
export function useGenerateVerdict(caseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post(`/cases/${caseId}/verdict`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case", caseId] });
    },
  });
}
