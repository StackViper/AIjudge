"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setToken as setLocalToken, clearToken } from "@/lib/auth";

type AuthState = {
  token: string | null;
  setToken: (t: string) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (t) => {
        set({ token: t });
        setLocalToken(t);
      },
      clear: () => {
        set({ token: null });
        clearToken();
      },
    }),
    { name: "judgeai_auth" }
  )
);
