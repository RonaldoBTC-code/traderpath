"use client";

import { useState, useEffect } from "react";
import type { DialogueEntry, CharacterId } from "@/lib/content/level1";
import CharacterAvatar from "./characters";

const CHARACTER_CONFIG: Record<
  CharacterId,
  {
    name: string;
    color: string;
    bgColor: string;
    borderColor: string;
    role: string;
    textStyle: string;
  }
> = {
  el_viejo_marco: {
    name: "El Viejo Marco",
    color: "text-tp-accent-gold",
    bgColor: "bg-gradient-to-br from-tp-accent-gold/10 to-tp-bg-secondary",
    borderColor: "border-tp-accent-gold/40",
    role: "Mentor",
    textStyle: "italic",
  },
  aria: {
    name: "ARIA",
    color: "text-tp-accent-blue",
    bgColor: "bg-gradient-to-br from-tp-accent-blue/10 to-tp-bg-secondary",
    borderColor: "border-tp-accent-blue/40",
    role: "Asistente IA",
    textStyle: "",
  },
  el_especulador: {
    name: "El Especulador",
    color: "text-tp-accent-red",
    bgColor: "bg-gradient-to-br from-tp-accent-red/10 to-tp-bg-secondary",
    borderColor: "border-tp-accent-red/40",
    role: "Antagonista",
    textStyle: "",
  },
  la_señorita_fomo: {
    name: "La Señorita FOMO",
    color: "text-orange-400",
    bgColor: "bg-gradient-to-br from-orange-400/10 to-tp-bg-secondary",
    borderColor: "border-orange-400/40",
    role: "Villana",
    textStyle: "",
  },
  don_panico: {
    name: "Don Pánico",
    color: "text-purple-400",
    bgColor: "bg-gradient-to-br from-purple-400/10 to-tp-bg-secondary",
    borderColor: "border-purple-400/40",
    role: "Villano",
    textStyle: "",
  },
  narrator: {
    name: "Narrador",
    color: "text-tp-text-secondary",
    bgColor: "bg-tp-bg-tertiary",
    borderColor: "border-tp-border",
    role: "",
    textStyle: "italic",
  },
};

interface Props {
  dialogue: DialogueEntry;
}

export default function CharacterDialogue({ dialogue }: Props) {
  const config = CHARACTER_CONFIG[dialogue.character];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, [dialogue.id]);

  return (
    <div
      className={`${config.bgColor} border ${config.borderColor} rounded-2xl p-5 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      {/* Character header */}
      <div className="flex items-center gap-3 mb-3">
        {/* SVG Avatar */}
        <CharacterAvatar character={dialogue.character} size={48} />
        {/* Name & role */}
        <div>
          <p className={`${config.color} font-semibold text-sm`}>{config.name}</p>
          {config.role && (
            <p className="text-tp-text-secondary/60 text-[10px] uppercase tracking-wider">
              {config.role}
            </p>
          )}
        </div>
      </div>

      {/* Dialogue text */}
      <div className="pl-[60px]">
        <p
          className={`text-tp-text-primary text-[15px] leading-relaxed ${config.textStyle}`}
        >
          &quot;{dialogue.text}&quot;
        </p>
        {dialogue.footnote && (
          <p className="text-tp-text-secondary/50 text-xs mt-3 border-t border-tp-border/30 pt-2">
            {dialogue.footnote}
          </p>
        )}
      </div>
    </div>
  );
}
