"use client";

import Link from "next/link";
import { useGameStore } from "@/store/gameStore";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { xp, virtualCapital, rank } = useGameStore();

  return (
    <div className="min-h-screen bg-tp-bg-primary">
      {/* Top header bar */}
      <header className="sticky top-0 z-50 border-b border-tp-border bg-tp-bg-secondary/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-bold">
            <span className="text-tp-accent-green">Trader</span>Path
          </Link>

          {/* Stats in header */}
          <div className="flex items-center gap-4 text-sm">
            <span className="font-mono text-tp-accent-green">${virtualCapital.toLocaleString()}</span>
            <span className="text-tp-text-secondary">{xp} XP</span>
            <span className="text-tp-accent-gold">{rank}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
