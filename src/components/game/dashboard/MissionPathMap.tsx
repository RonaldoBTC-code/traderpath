"use client";

import { motion } from "framer-motion";
import MissionNode, { type MissionStatus } from "./MissionNode";
import type { Mission } from "@/lib/content/level1";

interface MissionPathMapProps {
  missions: Mission[];
  activeMissionId: string;
  completedMissions: string[];
}

export default function MissionPathMap({
  missions,
  activeMissionId,
  completedMissions,
}: MissionPathMapProps) {
  const getStatus = (mission: Mission): MissionStatus => {
    if (completedMissions.includes(mission.id)) return "completed";
    if (mission.id === activeMissionId) return "available";
    return "locked";
  };

  const completedCount = completedMissions.length;
  const progressPercent = (completedCount / missions.length) * 100;

  // Zigzag offsets for desktop — alternating left/right positions
  const getZigzagOffset = (index: number): string => {
    const pattern = [0, 1, 2, 1, 0]; // center, right, far-right, right, center
    const offset = pattern[index % pattern.length];
    if (offset === 0) return "md:ml-0";
    if (offset === 1) return "md:ml-[15%]";
    return "md:ml-[30%]";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.35 }}
      className="relative"
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-tp-accent-green/25 to-cyan-400/10 border border-tp-accent-green/35 flex items-center justify-center">
            <svg className="w-4.5 h-4.5 text-tp-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-base">Camino de Misiones</h3>
            <p className="text-[10px] text-tp-text-secondary/50">
              Completa cada misión para avanzar al siguiente nivel
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-1">
            {missions.map((m, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  getStatus(m) === "completed"
                    ? "bg-tp-accent-green"
                    : getStatus(m) === "available"
                    ? "bg-tp-accent-green animate-pulse"
                    : "bg-tp-border/40"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-mono text-tp-accent-green font-semibold">
            {completedCount}/{missions.length}
          </span>
        </div>
      </div>

      {/* The Path */}
      <div className="relative">
        {/* SVG path connectors for desktop */}
        <svg
          className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-0"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00C896" stopOpacity="0.5" />
              <stop offset={`${progressPercent}%`} stopColor="#00C896" stopOpacity="0.3" />
              <stop offset={`${progressPercent}%`} stopColor="#2A3F55" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#2A3F55" stopOpacity="0.15" />
            </linearGradient>
          </defs>
        </svg>

        {/* Mobile vertical connector line */}
        <div className="md:hidden absolute left-6 top-8 bottom-8 w-[2px]">
          <div className="h-full rounded-full overflow-hidden bg-tp-border/20">
            <div
              className="w-full bg-gradient-to-b from-tp-accent-green to-tp-accent-green/50 rounded-full transition-all duration-700"
              style={{ height: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Mission nodes with zigzag layout */}
        <div className="space-y-4 md:space-y-5 relative z-10">
          {missions.map((mission, index) => {
            const status = getStatus(mission);
            const zigzag = getZigzagOffset(index);
            const isLast = index === missions.length - 1;

            return (
              <div key={mission.id} className="relative">
                {/* Desktop connector SVG between nodes */}
                {index > 0 && (
                  <div className="hidden md:block absolute -top-5 left-0 right-0 h-5 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <path
                        d="M50 0 L50 20"
                        stroke={status === "locked" ? "rgba(42,63,85,0.3)" : "rgba(0,200,150,0.25)"}
                        strokeWidth="1"
                        strokeDasharray={status === "locked" ? "3,3" : "none"}
                        fill="none"
                      />
                    </svg>
                  </div>
                )}

                {/* Node with zigzag offset */}
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.45, type: "spring", stiffness: 150 }}
                  className={`relative ${zigzag} md:max-w-[75%] transition-all duration-300`}
                >
                  {/* Connector dot on the path line (mobile) */}
                  <div className="md:hidden absolute left-[19px] top-1/2 -translate-y-1/2 z-20">
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 ${
                        status === "completed"
                          ? "bg-tp-accent-green border-tp-accent-green"
                          : status === "available"
                          ? "bg-tp-accent-green border-tp-accent-green animate-pulse"
                          : "bg-tp-bg-tertiary border-tp-border/50"
                      }`}
                    />
                  </div>

                  {/* The mission node card */}
                  <div className="md:ml-0 ml-10">
                    <MissionNode
                      id={mission.id}
                      order={mission.order}
                      title={mission.title}
                      subtitle={mission.subtitle}
                      xpReward={mission.rewards.xp}
                      capitalReward={mission.rewards.virtualCapital}
                      status={status}
                      badge={mission.rewards.badge}
                    />
                  </div>
                </motion.div>

                {/* Final node marker */}
                {isLast && status === "locked" && (
                  <div className="hidden md:flex items-center justify-center mt-4">
                    <div className="flex items-center gap-2 text-[10px] text-tp-text-secondary/30">
                      <div className="w-8 h-[1px] bg-tp-border/20" />
                      <span className="uppercase tracking-wider">Reto Final</span>
                      <div className="w-8 h-[1px] bg-tp-border/20" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
