"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export type MissionStatus = "available" | "locked" | "completed";

interface MissionNodeProps {
  id: string;
  order: number;
  title: string;
  subtitle?: string;
  xpReward: number;
  capitalReward: number;
  status: MissionStatus;
  badge?: string;
}

export default function MissionNode({
  id,
  order,
  title,
  subtitle,
  xpReward,
  capitalReward,
  status,
  badge,
}: MissionNodeProps) {
  const statusStyles = {
    available: {
      container: "border-tp-accent-green/50 bg-tp-accent-green/[0.06] shadow-lg shadow-tp-accent-green/10",
      node: "bg-gradient-to-br from-tp-accent-green to-cyan-400 text-tp-bg-primary shadow-lg shadow-tp-accent-green/40",
      title: "text-tp-text-primary",
      glow: true,
    },
    completed: {
      container: "border-tp-accent-green/25 bg-tp-accent-green/[0.03]",
      node: "bg-tp-accent-green/20 text-tp-accent-green border border-tp-accent-green/40",
      title: "text-tp-text-primary/70",
      glow: false,
    },
    locked: {
      container: "border-tp-border/20 bg-tp-bg-tertiary/30 opacity-50",
      node: "bg-tp-bg-tertiary border border-tp-border/30 text-tp-text-secondary/30",
      title: "text-tp-text-secondary/40",
      glow: false,
    },
  };

  const s = statusStyles[status];

  return (
    <motion.div
      whileHover={status !== "locked" ? { scale: 1.03, y: -3 } : {}}
      whileTap={status !== "locked" ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative"
    >
      <div
        className={`relative overflow-hidden rounded-2xl border backdrop-blur-sm p-4 transition-all duration-300 ${s.container} ${s.glow ? "animate-glow-pulse" : ""}`}
      >
        {/* Glow overlay for available */}
        {status === "available" && (
          <div className="absolute inset-0 bg-gradient-to-r from-tp-accent-green/[0.05] to-cyan-400/[0.03] pointer-events-none" />
        )}

        <div className="relative flex items-center gap-3.5">
          {/* Node circle */}
          <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${s.node}`}>
            {status === "completed" ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : status === "locked" ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <span className="text-base font-extrabold">{order}</span>
            )}
          </div>

          {/* Mission info */}
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-[14px] leading-tight ${s.title}`}>
              {title}
            </p>
            {subtitle && status !== "locked" && (
              <p className="text-tp-text-secondary/50 text-[11px] mt-0.5 truncate">
                {subtitle}
              </p>
            )}
            {/* Rewards */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] font-mono text-tp-accent-green/80 bg-tp-accent-green/10 px-1.5 py-0.5 rounded-md border border-tp-accent-green/15">
                +{xpReward} XP
              </span>
              <span className="text-[10px] font-mono text-tp-accent-gold/80 bg-tp-accent-gold/10 px-1.5 py-0.5 rounded-md border border-tp-accent-gold/15">
                +${capitalReward}
              </span>
              {badge && (
                <span className="text-[10px] bg-tp-accent-gold/10 px-1.5 py-0.5 rounded-md border border-tp-accent-gold/15">
                  🏆
                </span>
              )}
            </div>
          </div>

          {/* Action button */}
          {status === "available" && (
            <Link
              href={`/mission/${id}`}
              className="btn-game-primary text-[13px] px-5 py-2.5 shrink-0"
            >
              Jugar
            </Link>
          )}
          {status === "completed" && (
            <div className="shrink-0 w-8 h-8 rounded-xl bg-tp-accent-green/10 border border-tp-accent-green/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-tp-accent-green" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
