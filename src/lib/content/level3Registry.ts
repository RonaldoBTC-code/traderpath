// ============================================================
// Registro de niveles 3 (uno por mercado de especialización).
// Añadir un mercado nuevo requiere solo extender este archivo —
// gameStore.ts no debe volver a tocarse para cada mercado nuevo.
// ============================================================

import { level3Crypto } from "./level3-crypto"
import { level3Forex } from "./level3-forex"
import { level3Stocks } from "./level3-stocks"

// Forma estructural mínima que gameStore.ts necesita para ruteo/desbloqueo
// (getLevelMissions, completeMission). Deliberadamente NO es el tipo completo
// de cada config — ese vive en su propio archivo de contenido y en
// mission/[id]/page.tsx, donde sí se necesita el literal de minigame.type.
export interface Level3MissionLike {
  id: string
  rewards: { xp: number; virtualCapital: number; badge?: string }
  minigame?: { virtualCapitalReward?: number }
}

export interface Level3ConfigLike {
  id: string
  missions: Level3MissionLike[]
}

export const LEVEL3_REGISTRY: Record<string, Level3ConfigLike> = {
  crypto: level3Crypto,
  forex: level3Forex,
  stocks: level3Stocks,
}

// Reemplaza el heurístico `newMarket.charAt(0)` usado antes en
// useMarketChange, que colisiona entre commodities/crypto ("c") y
// futures/forex ("f"). Se completa un mercado a la vez, según se construye.
export const LEVEL3_MISSION_PREFIX: Record<string, string> = {
  crypto: "c",
  forex: "f",
  stocks: "s",
}

export function getLevel3ConfigByLevelId(levelId: string): Level3ConfigLike | undefined {
  if (!levelId.startsWith("level_3_")) return undefined
  return LEVEL3_REGISTRY[levelId.slice("level_3_".length)]
}
