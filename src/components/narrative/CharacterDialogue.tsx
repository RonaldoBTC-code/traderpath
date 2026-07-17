"use client";

import type { DialogueEntry, CharacterId } from "@/lib/content/level1";
import CharacterAvatar from "@/components/narrative/characters";

const CHARACTER_CONFIG: Record<CharacterId, {
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  el_viejo_marco: {
    name: "El Viejo Marco",
    color: "text-tp-gold",
    bgColor: "bg-tp-gold/5",
    borderColor: "border-tp-gold/40",
  },
  aria: {
    name: "ARIA",
    color: "text-tp-info",
    bgColor: "bg-tp-info/5",
    borderColor: "border-tp-info/40",
  },
  el_especulador: {
    name: "El Especulador",
    color: "text-tp-supply",
    bgColor: "bg-tp-supply/5",
    borderColor: "border-tp-supply/40",
  },
  la_señorita_fomo: {
    name: "La Señorita FOMO",
    color: "text-[#DB2777]",
    bgColor: "bg-[#DB2777]/5",
    borderColor: "border-[#DB2777]/40",
  },
  don_panico: {
    name: "Don Pánico",
    color: "text-tp-indices",
    bgColor: "bg-tp-indices/5",
    borderColor: "border-tp-indices/40",
  },
  narrator: {
    name: "",
    color: "text-tp-text-muted",
    bgColor: "bg-tp-surface-alt",
    borderColor: "border-tp-border",
  },
};

interface Props {
  dialogue: DialogueEntry;
}

export default function CharacterDialogue({ dialogue }: Props) {
  const config = CHARACTER_CONFIG[dialogue.character];
  const isNarrator = dialogue.character === "narrator";

  if (isNarrator) {
    return (
      <div className={`${config.bgColor} border-2 ${config.borderColor} rounded-2xl p-5 animate-bounce-in`}>
        <p className="text-tp-text text-sm leading-relaxed">{dialogue.text}</p>
        {dialogue.footnote && (
          <p className="text-tp-text-muted/70 text-xs mt-3 italic">{dialogue.footnote}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 animate-bounce-in">
      <div className="mt-1 drop-shadow-sm">
        <CharacterAvatar character={dialogue.character} size={52} />
      </div>
      <div className={`relative flex-1 border-2 ${config.borderColor} rounded-2xl rounded-tl-sm bg-tp-surface p-5 shadow-[0_6px_18px_rgba(30,42,68,0.08)]`}>
        <p className={`${config.color} font-display text-xs font-bold uppercase tracking-widest mb-2`}>
          {config.name}
        </p>
        <p className="text-tp-text text-sm leading-relaxed">
          {"“"}{dialogue.text}{"”"}
        </p>
        {dialogue.footnote && (
          <p className="text-tp-text-muted/70 text-xs mt-3 italic">{dialogue.footnote}</p>
        )}
      </div>
    </div>
  );
}
