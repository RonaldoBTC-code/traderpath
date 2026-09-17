-- ============================================================
-- TRADERPATH — Migration 002: progress sync fixes
--
-- Proyecto demo, sin jugadores reales (Ronaldo, 15 sep 2026): no hace falta
-- backfill. Se añade como migración nueva para no reescribir 001, que puede
-- estar ya aplicada.
-- ============================================================

-- 1. Default de mission_id alineado con el juego ('m1_1', no 'M1').
--    handle_new_user() ya insertaba 'm1_1'; el default viejo solo afectaba a
--    filas creadas por otras vías. El cliente también normaliza 'M1' al leer.
ALTER TABLE player_progress ALTER COLUMN mission_id SET DEFAULT 'm1_1';

UPDATE player_progress
SET mission_id = 'm1_1'
WHERE mission_id = 'M1' AND level_id = 1;

-- 2. Borrar misiones propias. Al cambiar de mercado (useMarketChange) el
--    progreso de nivel 3 del mercado abandonado se elimina en local; sin esta
--    policy RLS no deja borrarlo en remoto y vuelve a aparecer al recargar.
CREATE POLICY "Users delete own missions"
  ON completed_missions FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Una misión cuenta una sola vez por jugador. El cliente ya deduplica antes
--    de insertar; esto lo garantiza aunque dos pestañas sincronicen a la vez
--    (la segunda inserción falla, GameProgressSync reintenta y el reintento ya
--    ve la fila y no inserta nada).
--    Se conserva la fila más antigua; ctid desempata filas con la misma fecha.
DELETE FROM completed_missions a
USING completed_missions b
WHERE a.user_id = b.user_id
  AND a.mission_id = b.mission_id
  AND (a.completed_at > b.completed_at
       OR (a.completed_at = b.completed_at AND a.ctid > b.ctid));

ALTER TABLE completed_missions
  ADD CONSTRAINT completed_missions_user_mission_unique UNIQUE (user_id, mission_id);
