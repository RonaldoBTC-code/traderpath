"use client";

import { motion } from "framer-motion";
import CharacterAvatar from "@/components/narrative/characters";
import type { CharacterId } from "@/lib/content/level1";

interface CharacterAdvisorPanelProps {
  character: CharacterId;
  message: string;
}

export default function CharacterAdvisorPanel({
  character,
  message,
}: CharacterAdvisorPanelProps) {
  const characterNames: Record<CharacterId, string> = {
    el_viejo_marco: "El Viejo Marco",
    aria: "ARIA",
    el_especulador: "El Especulador",
    la_señorita_fomo: "La Señorita FOMO",
    don_panico: "Don Pánico",
    narrator: "Narrador",
  };

  const accentColors: Record<CharacterId, { border: string; glow: string; name: string; bg: string; bubble: string }> = {
    el_viejo_marco: {
      border: "border-tp-accent-gold/40",
      glow: "shadow-tp-accent-gold/10",
      name: "text-tp-accent-gold",
      bg: "from-tp-accent-gold/[0.08] to-transparent",
      bubble: "border-tp-accent-gold/20",
    },
    aria: {
      border: "border-tp-accent-blue/40",
      glow: "shadow-tp-accent-blue/10",
      name: "text-tp-accent-blue",
      bg: "from-tp-accent-blue/[0.08] to-transparent",
      bubble: "border-tp-accent-blue/20",
    },
    el_especulador: {
      border: "border-tp-accent-red/40",
      glow: "shadow-tp-accent-red/10",
      name: "text-tp-accent-red",
      bg: "from-tp-accent-red/[0.08] to-transparent",
      bubble: "border-tp-accent-red/20",
    },
    la_señorita_fomo: {
      border: "border-orange-400/40",
      glow: "shadow-orange-400/10",
      name: "text-orange-400",
      bg: "from-orange-400/[0.08] to-transparent",
      bubble: "border-orange-400/20",
    },
    don_panico: {
      border: "border-purple-400/40",
      glow: "shadow-purple-400/10",
      name: "text-purple-400",
      bg: "from-purple-400/[0.08] to-transparent",
      bubble: "border-purple-400/20",
    },
    narrator: {
      border: "border-tp-border/40",
      glow: "",
      name: "text-tp-text-secondary",
      bg: "from-tp-text-secondary/[0.04] to-transparent",
      bubble: "border-tp-border/20",
    },
  };

  const colors = accentColors[character];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.45, type: "spring", stiffness: 150 }}
      className={`relative overflow-hidden rounded-2xl border ${colors.border} backdrop-blur-xl bg-tp-bg-secondary/50 shadow-lg ${colors.glow}`}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${colors.bg} pointer-events-none`} />

      <div className="relative p-4 md:p-5 flex items-start gap-4">
        {/* Avatar area */}
        <div className="shrink-0 relative">
          {/* Glow ring behind avatar */}
          <div className={`absolute -inset-1 rounded-full ${colors.border} opacity-40 blur-sm`} />
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <CharacterAvatar character={character} size={56} />
          </motion.div>
        </div>

        {/* Dialogue bubble */}
        <div className="flex-1 min-w-0">
          {/* Character name with indicator */}
          <div className="flex items-center gap-2 mb-2">
            <p className={`text-xs font-bold ${colors.name}`}>
              {characterNames[character]}
            </p>
            <div className={`w-1.5 h-1.5 rounded-full bg-current ${colors.name} opacity-60 animate-pulse`} />
            <span className="text-[9px] text-tp-text-secondary/30 uppercase tracking-wider">Guía</span>
          </div>

          {/* Speech bubble */}
          <div className={`relative rounded-xl border ${colors.bubble} bg-tp-bg-tertiary/40 p-3`}>
            {/* Bubble arrow */}
            <div className={`absolute -left-2 top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] ${colors.bubble.replace("border-", "border-r-")}`} />
            <p className="text-[13px] text-tp-text-secondary/85 leading-relaxed">
              &quot;{message}&quot;
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
