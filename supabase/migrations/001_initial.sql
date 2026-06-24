-- ============================================================
-- TRADERPATH — Database Schema (Supabase/PostgreSQL)
-- Migration 001: Initial schema, RLS, triggers, and functions
-- ============================================================

-- ===================
-- TABLES
-- ===================

-- Perfiles de usuario
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progreso del jugador
CREATE TABLE player_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  level_id INTEGER NOT NULL DEFAULT 1,
  mission_id TEXT NOT NULL DEFAULT 'M1',
  xp INTEGER DEFAULT 0,
  rank TEXT DEFAULT 'Novato',
  virtual_capital DECIMAL(12,2) DEFAULT 1000.00,
  trade_coins INTEGER DEFAULT 0,
  current_market TEXT DEFAULT NULL,
  market_change_used BOOLEAN DEFAULT FALSE,
  streak_days INTEGER DEFAULT 0,
  last_activity DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Misiones completadas
CREATE TABLE completed_missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL,
  level_id INTEGER NOT NULL,
  score INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logros desbloqueados
CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Diario de trading
CREATE TABLE trading_diary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id TEXT,
  asset TEXT NOT NULL,
  direction TEXT CHECK (direction IN ('LONG', 'SHORT')),
  entry_price DECIMAL(12,4),
  stop_loss DECIMAL(12,4),
  take_profit DECIMAL(12,4),
  order_type TEXT,
  reasoning TEXT,
  outcome TEXT CHECK (outcome IN ('WIN', 'LOSS', 'OPEN', 'PENDING')),
  pnl DECIMAL(12,2),
  risk_reward DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Operaciones del simulador
CREATE TABLE simulator_operations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id TEXT,
  asset TEXT NOT NULL,
  direction TEXT NOT NULL,
  entry_price DECIMAL(12,4) NOT NULL,
  stop_loss DECIMAL(12,4) NOT NULL,
  take_profit DECIMAL(12,4) NOT NULL,
  capital_used DECIMAL(12,2),
  outcome TEXT,
  pnl DECIMAL(12,2),
  aria_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================
-- ROW LEVEL SECURITY
-- ===================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_diary ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulator_operations ENABLE ROW LEVEL SECURITY;

-- Policies: cada usuario solo ve sus propios datos

-- Profiles: SELECT/UPDATE solo propios, INSERT permitido para el trigger
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for auth trigger"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Player progress
CREATE POLICY "Users can view own progress"
  ON player_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON player_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for auth trigger on progress"
  ON player_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Completed missions
CREATE POLICY "Users see own missions"
  ON completed_missions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own missions"
  ON completed_missions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Achievements
CREATE POLICY "Users see own achievements"
  ON achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own achievements"
  ON achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trading diary
CREATE POLICY "Users see own diary"
  ON trading_diary FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own diary"
  ON trading_diary FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own diary"
  ON trading_diary FOR UPDATE
  USING (auth.uid() = user_id);

-- Simulator operations
CREATE POLICY "Users see own operations"
  ON simulator_operations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own operations"
  ON simulator_operations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ===================
-- STREAK TRIGGER
-- ===================

-- Function to update streak on player activity
CREATE OR REPLACE FUNCTION update_streak()
RETURNS TRIGGER AS $$
DECLARE
  prev_activity DATE;
  current_streak INTEGER;
BEGIN
  -- Get the previous last_activity and current streak from OLD row
  prev_activity := OLD.last_activity;
  current_streak := OLD.streak_days;

  -- If this is the first activity ever
  IF prev_activity IS NULL THEN
    NEW.streak_days := 1;
    NEW.last_activity := CURRENT_DATE;
    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  -- If already active today, no change to streak
  IF prev_activity = CURRENT_DATE THEN
    NEW.updated_at := NOW();
    RETURN NEW;
  END IF;

  -- If active yesterday, increment streak
  IF prev_activity = CURRENT_DATE - INTERVAL '1 day' THEN
    NEW.streak_days := current_streak + 1;
  ELSE
    -- Streak broken, reset to 1
    NEW.streak_days := 1;
  END IF;

  NEW.last_activity := CURRENT_DATE;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger fires on every update to player_progress
CREATE TRIGGER trigger_update_streak
  BEFORE UPDATE ON player_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_streak();

-- ===================
-- HELPER FUNCTIONS
-- ===================

-- Function: increment_xp_and_capital
-- Atomically updates XP, determines new rank, and adjusts capital
CREATE OR REPLACE FUNCTION increment_xp_and_capital(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_capital_change DECIMAL DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
  new_xp INTEGER;
  new_capital DECIMAL(12,2);
  new_rank TEXT;
  result JSON;
BEGIN
  -- Update XP and capital atomically
  UPDATE player_progress
  SET
    xp = xp + p_xp_amount,
    virtual_capital = virtual_capital + p_capital_change
  WHERE user_id = p_user_id
  RETURNING xp, virtual_capital INTO new_xp, new_capital;

  -- Determine new rank based on XP thresholds
  new_rank := CASE
    WHEN new_xp >= 25000 THEN 'Leyenda'
    WHEN new_xp >= 18500 THEN 'Profesional'
    WHEN new_xp >= 13000 THEN 'Trader'
    WHEN new_xp >= 8500  THEN 'Operador'
    WHEN new_xp >= 5000  THEN 'Estratega'
    WHEN new_xp >= 2500  THEN 'Analista'
    WHEN new_xp >= 1000  THEN 'Aprendiz'
    ELSE 'Novato'
  END;

  -- Update rank if changed
  UPDATE player_progress
  SET rank = new_rank
  WHERE user_id = p_user_id AND rank != new_rank;

  -- Return the updated state
  result := json_build_object(
    'xp', new_xp,
    'rank', new_rank,
    'virtual_capital', new_capital
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: get_full_player_state
-- Returns complete player state in a single call (for dashboard)
CREATE OR REPLACE FUNCTION get_full_player_state(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  player_data JSON;
  missions_data JSON;
  achievements_data JSON;
  diary_stats JSON;
  result JSON;
BEGIN
  -- Get player progress + profile
  SELECT json_build_object(
    'level_id', pp.level_id,
    'mission_id', pp.mission_id,
    'xp', pp.xp,
    'rank', pp.rank,
    'virtual_capital', pp.virtual_capital,
    'trade_coins', pp.trade_coins,
    'current_market', pp.current_market,
    'market_change_used', pp.market_change_used,
    'streak_days', pp.streak_days,
    'last_activity', pp.last_activity,
    'username', p.username,
    'avatar_url', p.avatar_url
  )
  INTO player_data
  FROM player_progress pp
  JOIN profiles p ON p.id = pp.user_id
  WHERE pp.user_id = p_user_id;

  -- Get completed missions
  SELECT COALESCE(json_agg(json_build_object(
    'mission_id', cm.mission_id,
    'level_id', cm.level_id,
    'score', cm.score,
    'completed_at', cm.completed_at
  )), '[]'::json)
  INTO missions_data
  FROM completed_missions cm
  WHERE cm.user_id = p_user_id;

  -- Get unlocked achievements
  SELECT COALESCE(json_agg(json_build_object(
    'achievement_id', a.achievement_id,
    'unlocked_at', a.unlocked_at
  )), '[]'::json)
  INTO achievements_data
  FROM achievements a
  WHERE a.user_id = p_user_id;

  -- Get diary/trading statistics
  SELECT json_build_object(
    'total_operations', COUNT(*),
    'wins', COUNT(*) FILTER (WHERE outcome = 'WIN'),
    'losses', COUNT(*) FILTER (WHERE outcome = 'LOSS'),
    'open', COUNT(*) FILTER (WHERE outcome = 'OPEN'),
    'avg_rr', ROUND(COALESCE(AVG(risk_reward), 0)::numeric, 2),
    'total_pnl', COALESCE(SUM(pnl), 0)
  )
  INTO diary_stats
  FROM trading_diary
  WHERE user_id = p_user_id;

  -- Combine everything into a single JSON response
  result := json_build_object(
    'player', player_data,
    'completed_missions', missions_data,
    'achievements', achievements_data,
    'diary_stats', diary_stats
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ===================

-- Function: auto-create profile and player_progress on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile from auth metadata
  INSERT INTO profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'trader_' || LEFT(NEW.id::text, 8)
    )
  );

  -- Create initial player_progress
  INSERT INTO player_progress (user_id, level_id, mission_id, xp, virtual_capital)
  VALUES (NEW.id, 1, 'm1_1', 0, 1000.00);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: fires when a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
