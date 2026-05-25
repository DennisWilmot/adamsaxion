"use client";

import Link from "next/link";
import { ReactQueryProvider } from "@/client/pricewar/providers/QueryProvider";
import { UserAccountMenuLoader } from "@/components/UserAccountMenu";

export function GameShell({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <div className="min-h-screen bg-surface">
        <header className="border-b border-border bg-surface-raised">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-lg py-md">
            <Link href="/play" className="font-display text-lg font-bold text-foreground">
              The Price War
            </Link>
            <nav className="flex items-center gap-md text-sm">
              <Link href="/play" className="text-foreground-secondary hover:text-primary">
                Play
              </Link>
              <Link href="/play/history" className="text-foreground-secondary hover:text-primary">
                History
              </Link>
              <Link href="/lessons" className="text-foreground-secondary hover:text-primary">
                Lessons
              </Link>
              <UserAccountMenuLoader compact />
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-lg py-2xl">{children}</main>
      </div>
    </ReactQueryProvider>
  );
}
