import { createClient } from "@/lib/supabase/client";
import type { CompletedMissionEntry, GameProgressSnapshot } from "@/store/gameStore";

interface PlayerProgressRow {
  level_id: number;
  mission_id: string;
  xp: number;
  rank: string;
  virtual_capital: number | string;
  current_market: string | null;
  market_change_used: boolean;
  streak_days: number;
  last_activity: string | null;
}

interface CompletedMissionRow {
  level_id: number;
  mission_id: string;
  score: number | null;
  completed_at: string;
}

function levelIdToNumber(levelId: string): number {
  if (levelId === "level_2") return 2;
  if (levelId.startsWith("level_3")) return 3;
  return 1;
}

function levelNumberToId(level: number, market: string | null): string {
  if (level === 2) return "level_2";
  if (level === 3) return `level_3_${market ?? "crypto"}`;
  return "level_1";
}

function normalizeMissionId(missionId: string, level: number): string {
  if (missionId !== "M1") return missionId;
  return level === 1 ? "m1_1" : missionId.toLowerCase();
}

function toCompletedMission(row: CompletedMissionRow): CompletedMissionEntry {
  return {
    levelId: levelNumberToId(row.level_id, row.level_id === 3 ? "crypto" : null),
    missionId: row.mission_id,
    score: row.score ?? 0,
    completedAt: row.completed_at,
  };
}

export async function loadRemoteProgress(userId: string): Promise<GameProgressSnapshot | null> {
  const supabase = createClient();
  const [progressResult, missionsResult] = await Promise.all([
    supabase
      .from("player_progress")
      .select("level_id, mission_id, xp, rank, virtual_capital, current_market, market_change_used, streak_days, last_activity")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("completed_missions")
      .select("level_id, mission_id, score, completed_at")
      .eq("user_id", userId)
      .order("completed_at", { ascending: true }),
  ]);

  if (progressResult.error) throw progressResult.error;
  if (missionsResult.error) throw missionsResult.error;
  if (!progressResult.data) return null;

  const player = progressResult.data as PlayerProgressRow;
  const completedById = new Map<string, CompletedMissionEntry>();
  for (const row of (missionsResult.data ?? []) as CompletedMissionRow[]) {
    const mission = toCompletedMission(row);
    completedById.set(`${mission.levelId}:${mission.missionId}`, mission);
  }
  const completedMissions = Array.from(completedById.values());

  return {
    xp: player.xp,
    virtualCapital: Number(player.virtual_capital),
    rank: player.rank,
    currentLevelId: levelNumberToId(player.level_id, player.current_market),
    currentMissionId: normalizeMissionId(player.mission_id, player.level_id),
    completedMissions,
    streakDays: player.streak_days,
    lastActivity: player.last_activity,
    marketSpecialization: player.current_market,
    marketChangeUsed: player.market_change_used,
  };
}

export async function saveRemoteProgress(userId: string, progress: GameProgressSnapshot): Promise<void> {
  const supabase = createClient();
  const { error: progressError } = await supabase
    .from("player_progress")
    .upsert(
      {
        user_id: userId,
        level_id: levelIdToNumber(progress.currentLevelId),
        mission_id: progress.currentMissionId,
        xp: progress.xp,
        rank: progress.rank,
        virtual_capital: progress.virtualCapital,
        current_market: progress.marketSpecialization,
        market_change_used: progress.marketChangeUsed,
        streak_days: progress.streakDays,
        last_activity: progress.lastActivity,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (progressError) throw progressError;
  if (progress.completedMissions.length === 0) return;

  const { data: existingRows, error: existingError } = await supabase
    .from("completed_missions")
    .select("level_id, mission_id")
    .eq("user_id", userId);

  if (existingError) throw existingError;

  const existing = new Set(
    (existingRows ?? []).map((row) => `${row.level_id}:${row.mission_id}`)
  );
  const missing = progress.completedMissions.filter(
    (mission) => !existing.has(`${levelIdToNumber(mission.levelId)}:${mission.missionId}`)
  );

  if (missing.length === 0) return;

  const { error: missionsError } = await supabase.from("completed_missions").insert(
    missing.map((mission) => ({
      user_id: userId,
      level_id: levelIdToNumber(mission.levelId),
      mission_id: mission.missionId,
      score: mission.score,
      completed_at: mission.completedAt,
    }))
  );

  if (missionsError) throw missionsError;
}
