"use client";

import type { CharacterId } from "@/lib/content/level1";
import ElViejoMarco from "./ElViejoMarco";
import Aria from "./Aria";
import ElEspeculador from "./ElEspeculador";
import LaSeñoritaFomo from "./LaSeñoritaFomo";
import DonPanico from "./DonPanico";
import Narrator from "./Narrator";

const AVATAR_COMPONENTS: Record<CharacterId, React.FC<{ size?: number }>> = {
  el_viejo_marco: ElViejoMarco,
  aria: Aria,
  el_especulador: ElEspeculador,
  "la_señorita_fomo": LaSeñoritaFomo,
  don_panico: DonPanico,
  narrator: Narrator,
};

interface CharacterAvatarProps {
  character: CharacterId;
  size?: number;
}

export default function CharacterAvatar({ character, size = 48 }: CharacterAvatarProps) {
  const Component = AVATAR_COMPONENTS[character];
  return <Component size={size} />;
}
