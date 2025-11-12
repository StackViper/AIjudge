"use client";
import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const { mutate, isPending, error } = useMutation<any, any, { name: string; email: string; password: string }>({
    mutationFn: async (body) => {
      const res = await api.post("/auth/signup", body);
      return res.data;
    },
    onSuccess: () => {
      router.push("/signin");
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ name, email, password });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? (
        <div className="text-sm text-red-600">{error?.response?.data?.error || "Signup failed"}</div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating account..." : "Sign up"}
      </Button>
      <div className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/signin" className="text-indigo-600 hover:text-indigo-500 font-medium">
          Sign in
        </Link>
      </div>
    </form>
  );
}
