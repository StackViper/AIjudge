"use client";
import { create } from "zustand";

type CaseState = {
  turnsRemaining: Record<string, number>;
  setTurnsRemaining: (caseId: string, count: number) => void;
};

export const useCaseStore = create<CaseState>((set) => ({
  turnsRemaining: {},
  setTurnsRemaining: (caseId, count) =>
    set((state) => ({ turnsRemaining: { ...state.turnsRemaining, [caseId]: count } })),
}));
