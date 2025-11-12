"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  useEffect(() => {
    router.replace(token ? "/dashboard" : "/signin");
  }, [token, router]);
  return null;
}
