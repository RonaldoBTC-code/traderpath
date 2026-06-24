"use client";

import { motion } from "framer-motion";

interface PlayerStatsBarProps {
  capital: number;
  xp: number;
  rank: string;
  streak: number;
  xpForNextRank: number;
}

export default function PlayerStatsBar({
  capital,
  xp,
  rank,
  streak,
  xpForNextRank,
}: PlayerStatsBarProps) {
  const xpProgress = Math.min((xp / xpForNextRank) * 100, 100);

  const formatNumber = (n: number) =>
    n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const stats = [
    {
      label: "Capital",
      value: `$${formatNumber(capital)}`,
      icon: "💰",
      color: "text-tp-accent-green",
      borderColor: "border-tp-accent-green/20",
      glowClass: "glow-green",
    },
    {
      label: "XP",
      value: formatNumber(xp),
      icon: "⚡",
      color: "text-tp-accent-blue",
      borderColor: "border-tp-accent-blue/20",
      glowClass: "glow-blue",
    },
    {
      label: "Rango",
      value: rank,
      icon: "🏆",
      color: "text-tp-accent-gold",
      borderColor: "border-tp-accent-gold/20",
      glowClass: "glow-gold",
    },
    {
      label: "Racha",
      value: `${streak} días`,
      icon: "🔥",
      color: streak > 0 ? "text-orange-400" : "text-tp-text-secondary/50",
      borderColor: streak > 0 ? "border-orange-400/20" : "border-tp-border/30",
      glowClass: "",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            className={`glass-card px-3.5 py-3 ${stat.glowClass}`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl bg-tp-bg-tertiary/80 border ${stat.borderColor} flex items-center justify-center text-base`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-tp-text-secondary/50 font-medium">
                  {stat.label}
                </p>
                <p className={`text-[15px] font-bold font-mono ${stat.color} leading-tight`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* XP Progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="glass-card px-4 py-3"
      >
        <div className="flex items-center justify-between text-[10px] mb-2">
          <span className="text-tp-accent-green font-semibold uppercase tracking-wider">
            {rank}
          </span>
          <span className="text-tp-text-secondary/60 font-mono">
            {formatNumber(xp)} / {formatNumber(xpForNextRank)} XP
          </span>
        </div>
        <div className="relative w-full h-2.5 bg-tp-bg-tertiary rounded-full overflow-hidden border border-tp-border/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-tp-accent-green via-cyan-400 to-tp-accent-blue rounded-full"
          />
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-full animate-[shimmer_2s_infinite]" />
        </div>
      </motion.div>
    </div>
  );
}
