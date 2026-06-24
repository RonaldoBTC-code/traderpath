// ============================================================
// TRADERPATH — TypeScript Interfaces
// ============================================================

export interface PlayerProgress {
  id: string;
  user_id: string;
  level_id: number;
  mission_id: string;
  xp: number;
  rank: string;
  virtual_capital: number;
  trade_coins: number;
  current_market: string | null;
  market_change_used: boolean;
  streak_days: number;
  last_activity: string | null;
  updated_at: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export interface CompletedMission {
  id: string;
  user_id: string;
  mission_id: string;
  level_id: number;
  score: number | null;
  completed_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface TradingDiaryEntry {
  id: string;
  user_id: string;
  mission_id: string | null;
  asset: string;
  direction: "LONG" | "SHORT";
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  order_type: string;
  reasoning: string;
  outcome: "WIN" | "LOSS" | "OPEN" | "PENDING";
  pnl: number;
  risk_reward: number;
  created_at: string;
}

export interface SimulatorOperation {
  id: string;
  user_id: string;
  mission_id: string | null;
  asset: string;
  direction: string;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  capital_used: number;
  outcome: string | null;
  pnl: number | null;
  aria_feedback: string | null;
  created_at: string;
}

// Full player state returned by get_full_player_state RPC
export interface FullPlayerState {
  player: {
    level_id: number;
    mission_id: string;
    xp: number;
    rank: string;
    virtual_capital: number;
    trade_coins: number;
    current_market: string | null;
    market_change_used: boolean;
    streak_days: number;
    last_activity: string | null;
    username: string;
    avatar_url: string | null;
  };
  completed_missions: {
    mission_id: string;
    level_id: number;
    score: number | null;
    completed_at: string;
  }[];
  achievements: {
    achievement_id: string;
    unlocked_at: string;
  }[];
  diary_stats: {
    total_operations: number;
    wins: number;
    losses: number;
    open: number;
    avg_rr: number;
    total_pnl: number;
  };
}

// Rank thresholds
export interface Rank {
  name: string;
  minXP: number;
  maxXP: number | null;
  level: number;
}

// Achievement definition
export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
}

// Mission types
export type MissionType = "narrative" | "lesson" | "mini-game" | "quiz" | "simulator" | "final-challenge";

export interface Mission {
  id: string;
  levelId: number;
  title: string;
  type: MissionType;
  xpReward: number;
  description: string;
}
