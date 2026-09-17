// ============================================================
// Registro de niveles 3 (uno por mercado de especialización).
// Añadir un mercado nuevo requiere solo extender este archivo —
// gameStore.ts no debe volver a tocarse para cada mercado nuevo.
// ============================================================

import { level3Crypto } from "./level3-crypto"
import { level3Forex } from "./level3-forex"
import { level3Stocks } from "./level3-stocks"
import { level3Commodities } from "./level3-commodities"

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
  commodities: level3Commodities,
}

export function getLevel3ConfigByLevelId(levelId: string): Level3ConfigLike | undefined {
  if (!levelId.startsWith("level_3_")) return undefined
  return LEVEL3_REGISTRY[levelId.slice("level_3_".length)]
}

export function isLevel3Market(market: string | null | undefined): market is string {
  return !!market && Object.prototype.hasOwnProperty.call(LEVEL3_REGISTRY, market)
}

/**
 * Market that owns a level-3 mission id (`m3f_2` → "forex"), or undefined.
 *
 * The database stores level 3 as the bare integer 3, so the mission id is the
 * only place the market survives a round trip. Looked up in the registry rather
 * than by prefix so a market with a non-obvious prefix can't be misread.
 */
export function getLevel3MarketForMission(missionId: string): string | undefined {
  for (const [market, config] of Object.entries(LEVEL3_REGISTRY)) {
    if (config.missions.some((mission) => mission.id === missionId)) return market
  }
  return undefined
}
