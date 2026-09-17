-- ============================================================
-- TRADERPATH — Migration 003: cierra las funciones SECURITY DEFINER
--
-- El linter de seguridad de Supabase (17 sep 2026) marcó las cuatro funciones
-- de 001 como ejecutables por `anon` y `authenticated` vía /rest/v1/rpc/...
-- Dos de ellas eran un agujero real, porque reciben el id del jugador como
-- parámetro y corren con privilegios del dueño (saltándose RLS):
--
--   increment_xp_and_capital(p_user_id, ...)  → cualquiera, sin sesión, podía
--                                               cambiar XP y capital de
--                                               CUALQUIER jugador.
--   get_full_player_state(p_user_id)          → cualquiera podía leer perfil,
--                                               progreso y estadísticas de
--                                               otro jugador.
--
-- El cliente no usa ninguna de las cuatro (el progreso se sincroniza con
-- upserts sujetos a RLS en src/lib/supabase/progress.ts), así que se revoca la
-- ejecución pública. service_role las conserva por si un backend las necesita.
--
-- Las dos restantes son funciones de trigger: Postgres comprueba EXECUTE al
-- crear el trigger, no al dispararlo, así que revocarlas no afecta al alta de
-- usuarios ni a la racha.
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.increment_xp_and_capital(uuid, integer, numeric) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_full_player_state(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_streak() FROM PUBLIC, anon, authenticated;

-- service_role solo tenía EXECUTE heredado de PUBLIC: se le devuelve explícito
-- a las dos funciones que un backend podría querer llamar.
GRANT EXECUTE ON FUNCTION public.increment_xp_and_capital(uuid, integer, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_full_player_state(uuid) TO service_role;

-- search_path fijo: una función SECURITY DEFINER que resuelve nombres con el
-- search_path del llamador puede ser engañada con objetos homónimos.
-- handle_new_user escribe en public.* y la llama supabase_auth_admin, cuyo
-- search_path no incluye public: por eso se fija explícitamente.
ALTER FUNCTION public.increment_xp_and_capital(uuid, integer, numeric) SET search_path = public;
ALTER FUNCTION public.get_full_player_state(uuid) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_streak() SET search_path = public;
