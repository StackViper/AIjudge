"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  React.useEffect(() => {
    if (!token) router.replace("/signin");
  }, [token, router]);
  if (!token) return null;
  return <>{children}</>;
}
