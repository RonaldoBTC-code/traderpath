import { getLevel3MarketForMission, isLevel3Market, LEVEL3_REGISTRY } from "@/lib/content/level3Registry";
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
  if (level === 3) return `level_3_${isLevel3Market(market) ? market : "crypto"}`;
  return "level_1";
}

/**
 * Legacy rows carry the schema default 'M1' (001_initial.sql). It means "first
 * mission of the level", so resolve it to that level's real first id instead
 * of guessing a spelling.
 */
function normalizeMissionId(missionId: string, level: number, market: string | null): string {
  if (missionId.toUpperCase() !== "M1") return missionId;
  if (level === 2) return "m2_1";
  if (level === 3 && isLevel3Market(market)) return LEVEL3_REGISTRY[market].missions[0]?.id ?? "m1_1";
  return "m1_1";
}

/**
 * Level 3 is stored as the integer 3 for every market. The market used to be
 * hard-coded to crypto on the way back, so a forex/stocks/commodities player
 * reloaded into someone else's level. The mission id identifies its market.
 */
function toCompletedMission(row: CompletedMissionRow, fallbackMarket: string | null): CompletedMissionEntry {
  const market = row.level_id === 3 ? getLevel3MarketForMission(row.mission_id) ?? fallbackMarket : null;
  return {
    levelId: levelNumberToId(row.level_id, market),
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
    const mission = toCompletedMission(row, player.current_market);
    completedById.set(`${mission.levelId}:${mission.missionId}`, mission);
  }
  const completedMissions = Array.from(completedById.values());

  return {
    xp: player.xp,
    virtualCapital: Number(player.virtual_capital),
    rank: player.rank,
    currentLevelId: levelNumberToId(player.level_id, player.current_market),
    currentMissionId: normalizeMissionId(player.mission_id, player.level_id, player.current_market),
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

  if (progress.marketChangeUsed && isLevel3Market(progress.marketSpecialization)) {
    const current = new Set(LEVEL3_REGISTRY[progress.marketSpecialization].missions.map((m) => m.id));
    const { data: level3Rows, error: level3Error } = await supabase
      .from("completed_missions")
      .select("mission_id")
      .eq("user_id", userId)
      .eq("level_id", 3);
    if (level3Error) throw level3Error;
    const stale = (level3Rows ?? []).map((row) => row.mission_id as string).filter((id) => !current.has(id));
    if (stale.length > 0) {
      // Needs the DELETE policy from 002_progress_fixes.sql; without it RLS
      // deletes nothing and reports no error, which is survivable (the stale
      // rows only resurface as completed missions of a level the player left).
      const { error: deleteError } = await supabase
        .from("completed_missions")
        .delete()
        .eq("user_id", userId)
        .eq("level_id", 3)
        .in("mission_id", stale);
      if (deleteError) throw deleteError;
    }
  }

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
