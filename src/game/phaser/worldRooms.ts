import type { WorldRoom } from "@/game/phaser/worldEvents";

/**
 * Declarative metadata for every explorable room. Phaser-free on purpose so
 * React components can import labels without pulling the game engine into the
 * main bundle (scene factories live in createAcademyGame).
 *
 * Adding a room: add its id to WorldRoom (worldEvents.ts), an entry here, and
 * a scene factory in createAcademyGame.
 */
export interface WorldRoomMeta {
  label: string;
  ariaLabel: string;
  /** Rooms the player can be sent back to after finishing a practice mission. */
  returnable: boolean;
}

export const WORLD_ROOMS: Record<WorldRoom, WorldRoomMeta> = {
  "welcome-harbor": {
    label: "Puerto de Bienvenida",
    ariaLabel: "Puerto de Bienvenida jugable",
    returnable: false,
  },
  "academy-agora": {
    label: "Academia Ágora",
    ariaLabel: "Academia Ágora jugable",
    returnable: false,
  },
  "market-plaza": {
    label: "Mercado Plaza",
    ariaLabel: "Mercado Plaza jugable",
    returnable: true,
  },
  "candle-workshop": {
    label: "Taller de Velas",
    ariaLabel: "Taller de Velas jugable",
    returnable: true,
  },
};

export function isReturnableRoom(value: string | null | undefined): value is WorldRoom {
  return value != null && value in WORLD_ROOMS && WORLD_ROOMS[value as WorldRoom].returnable;
}
