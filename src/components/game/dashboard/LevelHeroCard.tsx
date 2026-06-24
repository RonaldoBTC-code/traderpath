"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface LevelHeroCardProps {
  levelOrder: number;
  title: string;
  tagline: string;
  activeMissionId: string;
  currentMissionIndex: number;
  totalMissions: number;
}

export default function LevelHeroCard({
  levelOrder,
  title,
  tagline,
  activeMissionId,
  currentMissionIndex,
  totalMissions,
}: LevelHeroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="relative overflow-hidden glass-card-strong bg-candles"
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-tp-accent-green/50 to-transparent" />

      {/* Corner glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-tp-accent-green/[0.08] rounded-full blur-3xl" />

      <div className="relative p-5 md:p-6">
        <div className="flex items-center gap-4">
          {/* Level number */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-tp-accent-green/25 to-cyan-400/10 border border-tp-accent-green/30 flex items-center justify-center shrink-0">
            <span className="text-2xl font-extrabold bg-gradient-to-b from-tp-accent-green to-cyan-300 bg-clip-text text-transparent">
              {levelOrder}
            </span>
          </div>

          {/* Level info */}
          <div className="flex-1">
            <p className="text-[9px] uppercase tracking-[0.15em] text-tp-accent-green/60 font-semibold">
              Nivel Actual
            </p>
            <h3 className="text-lg md:text-xl font-bold leading-tight mt-0.5">
              {title}
            </h3>
            <p className="text-[11px] text-tp-text-secondary/50 italic mt-1">
              &quot;{tagline}&quot;
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-5 flex items-center gap-3">
          <Link
            href={`/mission/${activeMissionId}`}
            className="btn-game-primary flex items-center gap-2"
          >
            <span>Continuar misión</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
          <span className="text-[10px] text-tp-text-secondary/40">
            Misión {currentMissionIndex + 1} de {totalMissions}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
