"use client";
import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignInForm() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const { mutate, isPending, error } = useMutation<{ token: string }, any, { email: string; password: string }>(
    {
      mutationFn: async (body) => {
        const res = await api.post("/auth/signin", body);
        return res.data;
      },
      onSuccess: (data) => {
        if (data?.token) {
          setToken(data.token);
          router.replace("/dashboard");
        }
      },
    }
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ email, password });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? (
        <div className="text-red-600 text-sm">{error?.response?.data?.error || "Signin failed"}</div>
      ) : null}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
      <div className="text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link href="/signup" className="text-indigo-600 hover:text-indigo-500 font-medium">
          Sign up
        </Link>
      </div>
    </form>
  );
}
