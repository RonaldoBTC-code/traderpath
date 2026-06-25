"use client";

import Link from "next/link";
import { useGameStore } from "@/store/gameStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import { formatCurrency } from "@/lib/utils/format";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasMounted = useHasMounted();
  const { xp, virtualCapital, rank } = useGameStore();

  return (
    <div className="min-h-screen bg-tp-base">
      {/* Top header bar */}
      <header className="sticky top-0 z-50 border-b border-tp-border bg-tp-surface/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="font-display text-lg font-bold">
            <span className="text-tp-gold">Trader</span>
            <span className="text-tp-text">Path</span>
          </Link>

          {/* Stats in header */}
          <div className="flex items-center gap-4 text-sm">
            <span className="font-data text-tp-demand">
              {hasMounted ? formatCurrency(virtualCapital) : "$1,000"}
            </span>
            <span className="font-data text-tp-gold">
              {hasMounted ? `${xp} XP` : "0 XP"}
            </span>
            <span className="text-tp-text-muted">
              {hasMounted ? rank : "Novato"}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
