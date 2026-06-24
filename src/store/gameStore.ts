import { create } from "zustand";
import { persist } from "zustand/middleware";
import { level1 } from "@/lib/content/level1";
import { level2 } from "@/lib/content/level2";

// ─── TYPES ──────────────────────────────────────────────────

export type MissionStatus = "locked" | "available" | "completed";

interface CompletedMissionEntry {
  levelId: string;
  missionId: string;
  score: number;
  completedAt: string;
}

interface GameState {
  // Player data
  xp: number;
  virtualCapital: number;
  rank: string;
  currentLevelId: string;
  currentMissionId: string;
  completedMissions: CompletedMissionEntry[];
  streakDays: number;
  lastActivity: string | null;

  // Actions
  completeMission: (levelId: string, missionId: string, score: number) => void;
  isMissionCompleted: (levelId: string, missionId: string) => boolean;
  isMissionUnlocked: (levelId: string, missionId: string) => boolean;
  getCurrentMission: () => { levelId: string; missionId: string };
  getCurrentLevel: () => typeof level1 | typeof level2;
  getMissionStatus: (levelId: string, missionId: string) => MissionStatus;
  calculateRank: (totalXp: number) => string;
  resetProgress: () => void;
}

// ─── HELPERS ────────────────────────────────────────────────

const RANK_THRESHOLDS = [
  { name: "Leyenda", minXP: 25000 },
  { name: "Profesional", minXP: 18500 },
  { name: "Trader", minXP: 13000 },
  { name: "Operador", minXP: 8500 },
  { name: "Estratega", minXP: 5000 },
  { name: "Analista", minXP: 2500 },
  { name: "Aprendiz", minXP: 1000 },
  { name: "Novato", minXP: 0 },
];

function calculateRankFromXP(xp: number): string {
  for (const rank of RANK_THRESHOLDS) {
    if (xp >= rank.minXP) return rank.name;
  }
  return "Novato";
}

/** Get ordered missions for a level */
function getLevelMissions(levelId: string) {
  if (levelId === "level_1") return level1.missions;
  if (levelId === "level_2") return level2.missions;
  return [];
}

/** Get the next mission after the given one in the same level */
function getNextMission(levelId: string, missionId: string) {
  const missions = getLevelMissions(levelId);
  const currentIndex = missions.findIndex((m) => m.id === missionId);
  if (currentIndex === -1 || currentIndex >= missions.length - 1) return null;
  return missions[currentIndex + 1];
}

/** Get the next level after the given one */
function getNextLevelId(levelId: string): string | null {
  if (levelId === "level_1") return "level_2";
  if (levelId === "level_2") return null; // Future: level_3
  return null;
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
        const capitalReward = mission.rewards.virtualCapital;
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
          // There's a next mission in this level
          newCurrentMissionId = nextMission.id;
          console.log("Next mission unlocked:", nextMission.id);
        } else {
          // Level complete — check if there's a next level
          const nextLevelId = getNextLevelId(levelId);
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

        // First mission of current level is always available
        if (missionIndex === 0) {
          // But only if this level is unlocked
          // level_1 is always unlocked
          if (levelId === "level_1") return true;
          // level_2 is unlocked if level_1 is fully completed
          if (levelId === "level_2") {
            const l1Missions = getLevelMissions("level_1");
            return l1Missions.every((m) =>
              state.completedMissions.some((c) => c.levelId === "level_1" && c.missionId === m.id)
            );
          }
          return false;
        }

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
        if (state.currentLevelId === "level_2") return level2;
        return level1;
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
