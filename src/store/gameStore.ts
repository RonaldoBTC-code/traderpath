import { create } from "zustand";
import { persist } from "zustand/middleware";
import { level1 } from "@/lib/content/level1";
import { level2 } from "@/lib/content/level2";
import { level3Crypto } from "@/lib/content/level3-crypto";
import { RANKS } from "@/lib/game/constants";

// ─── TYPES ──────────────────────────────────────────────────

export type MissionStatus = "locked" | "available" | "completed";

export interface CompletedMissionEntry {
  levelId: string;
  missionId: string;
  score: number;
  completedAt: string;
}

export interface GameProgressSnapshot {
  xp: number;
  virtualCapital: number;
  rank: string;
  currentLevelId: string;
  currentMissionId: string;
  completedMissions: CompletedMissionEntry[];
  streakDays: number;
  lastActivity: string | null;
  marketSpecialization: string | null;
  marketChangeUsed: boolean;
}

interface GameState extends GameProgressSnapshot {
  // Player data
  xp: number;
  virtualCapital: number;
  rank: string;
  currentLevelId: string;
  currentMissionId: string;
  completedMissions: CompletedMissionEntry[];
  streakDays: number;
  lastActivity: string | null;
  marketSpecialization: string | null;
  marketChangeUsed: boolean;

  // Actions
  completeMission: (levelId: string, missionId: string, score: number) => void;
  isMissionCompleted: (levelId: string, missionId: string) => boolean;
  isMissionUnlocked: (levelId: string, missionId: string) => boolean;
  getCurrentMission: () => { levelId: string; missionId: string };
  getCurrentLevel: () => typeof level1 | typeof level2 | typeof level3Crypto;
  getMissionStatus: (levelId: string, missionId: string) => MissionStatus;
  calculateRank: (totalXp: number) => string;
  setMarketSpecialization: (market: string) => void;
  useMarketChange: (newMarket: string) => void;
  applyCapitalChange: (amount: number) => void;
  hydrateProgress: (progress: GameProgressSnapshot) => void;
  resetProgress: () => void;
}

// ─── HELPERS ────────────────────────────────────────────────

function calculateRankFromXP(xp: number): string {
  for (let index = RANKS.length - 1; index >= 0; index -= 1) {
    const rank = RANKS[index];
    if (xp >= rank.minXP) return rank.name;
  }
  return "Novato";
}

/** Get level config by id */
function getLevelConfig(levelId: string) {
  if (levelId === "level_1") return level1;
  if (levelId === "level_2") return level2;
  if (levelId === "level_3_crypto") return level3Crypto;
  return level1;
}

/** Get ordered missions for a level */
function getLevelMissions(levelId: string) {
  return getLevelConfig(levelId).missions;
}

/** Get the next mission after the given one in the same level */
function getNextMission(levelId: string, missionId: string) {
  const missions = getLevelMissions(levelId);
  const currentIndex = missions.findIndex((m) => m.id === missionId);
  if (currentIndex === -1 || currentIndex >= missions.length - 1) return null;
  return missions[currentIndex + 1];
}

/** Get the next level after the given one */
function getNextLevelId(levelId: string, specialization: string | null): string | null {
  if (levelId === "level_1") return "level_2";
  if (levelId === "level_2") {
    // After level 2, go to specialization
    if (specialization === "crypto") return "level_3_crypto";
    // Default to crypto for MVP
    return "level_3_crypto";
  }
  if (levelId === "level_3_crypto") return null; // Future: level_4
  return null;
}

/** Check if a level is unlocked based on completed missions */
function isLevelUnlocked(levelId: string, completedMissions: CompletedMissionEntry[], specialization: string | null): boolean {
  if (levelId === "level_1") return true;
  if (levelId === "level_2") {
    const l1Missions = getLevelMissions("level_1");
    return l1Missions.every((m) =>
      completedMissions.some((c) => c.levelId === "level_1" && c.missionId === m.id)
    );
  }
  if (levelId === "level_3_crypto") {
    if (specialization !== "crypto") return false;
    const l2Missions = getLevelMissions("level_2");
    return l2Missions.every((m) =>
      completedMissions.some((c) => c.levelId === "level_2" && c.missionId === m.id)
    );
  }
  return false;
}

const INITIAL_STATE = {
  xp: 0,
  virtualCapital: 1000,
  rank: "Novato",
  currentLevelId: "level_1",
  currentMissionId: "m1_1",
  completedMissions: [] as CompletedMissionEntry[],
  streakDays: 0,
  lastActivity: null as string | null,
  marketSpecialization: null as string | null,
  marketChangeUsed: false,
};

// ─── STORE ──────────────────────────────────────────────────

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      completeMission: (levelId: string, missionId: string, score: number) => {
        const state = get();

        // Prevent duplicate rewards
        if (state.isMissionCompleted(levelId, missionId)) {
          console.log("Mission already completed, skipping rewards:", missionId);
          return;
        }

        // Find mission data to get rewards
        const missions = getLevelMissions(levelId);
        const mission = missions.find((m) => m.id === missionId);
        if (!mission) {
          console.error("Mission not found:", missionId);
          return;
        }

        // Calculate new values
        const xpReward = mission.rewards.xp;
        const capitalReward = mission.rewards.virtualCapital + (mission.minigame?.virtualCapitalReward ?? 0);
        const newXP = state.xp + xpReward;
        const newCapital = state.virtualCapital + capitalReward;
        const newRank = calculateRankFromXP(newXP);

        // Add to completed missions
        const newCompleted: CompletedMissionEntry = {
          levelId,
          missionId,
          score,
          completedAt: new Date().toISOString(),
        };

        // Determine next mission/level
        const nextMission = getNextMission(levelId, missionId);
        let newCurrentLevelId = state.currentLevelId;
        let newCurrentMissionId = state.currentMissionId;

        if (nextMission) {
          newCurrentMissionId = nextMission.id;
          console.log("Next mission unlocked:", nextMission.id);
        } else {
          // Level complete — advance to next level
          const nextLevelId = getNextLevelId(levelId, state.marketSpecialization);
          if (nextLevelId) {
            const nextLevelMissions = getLevelMissions(nextLevelId);
            newCurrentLevelId = nextLevelId;
            newCurrentMissionId = nextLevelMissions[0]?.id || "";
            console.log("Level completed! Next level unlocked:", nextLevelId);
          } else {
            console.log("All available levels completed!");
          }
        }

        console.log("Mission completed:", missionId);
        console.log("XP updated:", newXP, `(+${xpReward})`);
        console.log("Capital updated:", newCapital, `(+${capitalReward})`);
        console.log("Rank:", newRank);

        set({
          xp: newXP,
          virtualCapital: newCapital,
          rank: newRank,
          currentLevelId: newCurrentLevelId,
          currentMissionId: newCurrentMissionId,
          completedMissions: [...state.completedMissions, newCompleted],
          lastActivity: new Date().toISOString().split("T")[0],
        });
      },

      isMissionCompleted: (levelId: string, missionId: string) => {
        return get().completedMissions.some(
          (m) => m.levelId === levelId && m.missionId === missionId
        );
      },

      isMissionUnlocked: (levelId: string, missionId: string) => {
        const state = get();
        const missions = getLevelMissions(levelId);
        const missionIndex = missions.findIndex((m) => m.id === missionId);

        if (missionIndex === -1) return false;

        // Check if the level itself is unlocked
        if (!isLevelUnlocked(levelId, state.completedMissions, state.marketSpecialization)) {
          return false;
        }

        // First mission of an unlocked level is always available
        if (missionIndex === 0) return true;

        // For other missions, the previous mission must be completed
        const previousMission = missions[missionIndex - 1];
        return state.completedMissions.some(
          (m) => m.levelId === levelId && m.missionId === previousMission.id
        );
      },

      getCurrentMission: () => {
        const state = get();
        return { levelId: state.currentLevelId, missionId: state.currentMissionId };
      },

      getCurrentLevel: () => {
        const state = get();
        return getLevelConfig(state.currentLevelId);
      },

      getMissionStatus: (levelId: string, missionId: string): MissionStatus => {
        const state = get();
        if (state.isMissionCompleted(levelId, missionId)) return "completed";
        if (state.isMissionUnlocked(levelId, missionId)) return "available";
        return "locked";
      },

      calculateRank: (totalXp: number) => {
        return calculateRankFromXP(totalXp);
      },

      setMarketSpecialization: (market: string) => {
        console.log("Market specialization set:", market);
        set({ marketSpecialization: market });
      },

      useMarketChange: (newMarket: string) => {
        const state = get();
        if (state.marketChangeUsed) {
          console.log("Market change already used — cannot change again.");
          return;
        }
        console.log("Market changed from", state.marketSpecialization, "to", newMarket);
        // Remove level 3 progress when changing market
        const filteredMissions = state.completedMissions.filter(
          (m) => !m.levelId.startsWith("level_3")
        );
        set({
          marketSpecialization: newMarket,
          marketChangeUsed: true,
          completedMissions: filteredMissions,
          // Reset to first mission of new level 3
          currentLevelId: `level_3_${newMarket}`,
          currentMissionId: `m3${newMarket.charAt(0)}_1`,
        });
      },

      applyCapitalChange: (amount: number) => {
        set((state) => ({
          virtualCapital: Math.max(0, Math.round((state.virtualCapital + amount) * 100) / 100),
          lastActivity: new Date().toISOString().split("T")[0],
        }));
      },

      hydrateProgress: (progress: GameProgressSnapshot) => {
        set({
          ...progress,
          rank: calculateRankFromXP(progress.xp),
        });
      },

      resetProgress: () => {
        console.log("Progress reset to initial state");
        set(INITIAL_STATE);
      },
    }),
    {
      name: "traderpath-progress",
    }
  )
);
