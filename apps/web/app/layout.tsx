import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/query";
import { DevTools } from "@/components/DevTools";

export const metadata: Metadata = {
  title: "Judge AI",
  description: "Dispute resolution workspace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <DevTools />
          <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            <header className="border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--card)]/60">
              <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
                <div className="font-semibold">Judge AI</div>
              </div>
            </header>
            <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
