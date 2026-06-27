"use client";

import Link from "next/link";
import { Coins, Map, Sparkles, UserRound } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import { formatCurrency } from "@/lib/utils/format";
import GameProgressSync from "@/components/game/GameProgressSync";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const hasMounted = useHasMounted();
  const { xp, virtualCapital, rank } = useGameStore();

  return (
    <div className="min-h-screen bg-tp-base bg-[radial-gradient(circle_at_50%_-20%,rgba(96,165,250,0.10),transparent_38%)]">
      <GameProgressSync />
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0e1a]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="group flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-tp-gold/30 bg-tp-gold/10 text-tp-gold transition group-hover:rotate-3 group-hover:bg-tp-gold/15">
              <Map size={18} strokeWidth={2.2} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              <span className="text-tp-gold">Trader</span>
              <span className="text-tp-text">Path</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 sm:flex">
              <Coins size={14} className="text-tp-demand" />
              <span className="font-data text-xs text-tp-demand">
                {hasMounted ? formatCurrency(virtualCapital) : "$1,000"}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-tp-gold/20 bg-tp-gold/[0.07] px-3 py-2">
              <Sparkles size={14} className="text-tp-gold" />
              <span className="font-data text-xs text-tp-gold">
                {hasMounted ? `${xp} XP` : "0 XP"}
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-tp-info/25 bg-tp-info/10 text-tp-info sm:w-auto sm:gap-2 sm:px-3">
              <UserRound size={15} />
              <span className="hidden text-xs font-semibold text-tp-text sm:inline">
                {hasMounted ? rank : "Novato"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">{children}</main>
    </div>
  );
}
