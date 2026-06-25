"use client";

import type { DialogueEntry, CharacterId } from "@/lib/content/level1";

const CHARACTER_CONFIG: Record<CharacterId, {
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}> = {
  el_viejo_marco: {
    name: "El Viejo Marco",
    color: "text-tp-gold",
    bgColor: "bg-tp-gold/5",
    borderColor: "border-tp-gold/30",
    icon: "📖",
  },
  aria: {
    name: "ARIA",
    color: "text-tp-info",
    bgColor: "bg-tp-info/5",
    borderColor: "border-tp-info/30",
    icon: "💠",
  },
  el_especulador: {
    name: "El Especulador",
    color: "text-tp-supply",
    bgColor: "bg-tp-supply/5",
    borderColor: "border-tp-supply/30",
    icon: "📱",
  },
  la_señorita_fomo: {
    name: "La Señorita FOMO",
    color: "text-[#EC4899]",
    bgColor: "bg-[#EC4899]/5",
    borderColor: "border-[#EC4899]/30",
    icon: "🏃‍♀️",
  },
  don_panico: {
    name: "Don Pánico",
    color: "text-tp-info",
    bgColor: "bg-tp-info/5",
    borderColor: "border-tp-info/30",
    icon: "📰",
  },
  narrator: {
    name: "",
    color: "text-tp-text-muted",
    bgColor: "bg-tp-surface-alt",
    borderColor: "border-tp-border",
    icon: "✦",
  },
};

interface Props {
  dialogue: DialogueEntry;
}

export default function CharacterDialogue({ dialogue }: Props) {
  const config = CHARACTER_CONFIG[dialogue.character];

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-md p-5`}>
      {config.name && (
        <p className={`${config.color} text-xs font-semibold uppercase tracking-widest mb-2`}>
          {config.icon} {config.name}
        </p>
      )}
      <p className="text-tp-text text-sm leading-relaxed">
        {dialogue.character !== "narrator" && "\u201C"}{dialogue.text}{dialogue.character !== "narrator" && "\u201D"}
      </p>
      {dialogue.footnote && (
        <p className="text-tp-text-muted/50 text-xs mt-3 italic">
          {dialogue.footnote}
        </p>
      )}
    </div>
  );
}
