import { AuthGuard } from "@/lib/guards";

export default function CasesLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
