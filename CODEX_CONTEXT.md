# TraderPath — Contexto para Continuación en Codex

> Este documento contiene toda la información que un agente necesita para continuar el desarrollo de TraderPath sin perder contexto.

---

## 1. QUÉ ES TRADERPATH

Un videojuego educativo web de trading financiero. El jugador aprende mercados financieros (crypto, forex, acciones, etc.) a través de misiones narrativas con personajes, mini-juegos interactivos, quizzes con feedback educativo, y progresión RPG con capital virtual.

**Principio pedagógico**: El jugador no puede ejecutar una acción que no comprende. Las misiones desbloquean mecánicas secuencialmente.

---

## 2. STACK TÉCNICO

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Estilos**: Tailwind CSS con design tokens custom (VDD v1.0)
- **Estado**: Zustand con persist middleware (localStorage)
- **DB**: Supabase (PostgreSQL + Auth + RLS) — conectado y funcionando
- **Fuentes**: Space Grotesk (display) + DM Sans (body) + JetBrains Mono (data)
- **Repo**: https://github.com/RonaldoBTC-code/traderpath

---

## 3. ESTADO ACTUAL (100% funcional)

### Lo que YA funciona:
- ✅ 15 misiones completas (Nivel 1: 5, Nivel 2: 5, Nivel 3 Crypto: 5)
- ✅ 10 mini-juegos interactivos implementados
- ✅ QuizEngine con aleatorización de preguntas y opciones
- ✅ Sistema de tutoriales educativos (MissionTutorial) antes de cada mini-juego
- ✅ Progresión: XP, capital virtual, rango, desbloqueo secuencial de misiones
- ✅ Persistencia en localStorage (sobrevive refresh)
- ✅ Autenticación con Supabase (registro + login)
- ✅ Base de datos con schema completo (6 tablas + RLS + triggers + funciones)
- ✅ Design system VDD v1.0 (tema oscuro gaming)
- ✅ 5 personajes con diálogos narrativos
- ✅ Build de producción sin errores
- ✅ TypeScript sin errores
- ✅ Dev tools (links directos a misiones, reset progress)

### Lo que FALTA (por orden de prioridad):

#### PRIORIDAD ALTA:
1. **Mini-juegos del Nivel 3 Crypto** (5 componentes placeholder):
   - `pair_calculator` — Calculadora de pares crypto
   - `dominance_gauge` — Indicador de BTC Dominance
   - `cycle_mapper` — Mapa del ciclo de 4 años
   - `timeframe_switcher` — Análisis multi-timeframe
   - `fear_greed_slider` — Análisis integrado crypto

2. **Sincronización de progreso con Supabase** — Actualmente solo localStorage. Falta:
   - Guardar completedMissions en `completed_missions` table
   - Guardar XP/capital en `player_progress` table
   - Cargar progreso desde DB al login
   - Mantener localStorage como cache + DB como source of truth

3. **Simulador de trading** con TradingView Lightweight Charts:
   - Gráfico de velas real
   - Panel de órdenes (Buy/Sell + SL + TP)
   - Checklist de 7 pasos pre-operación
   - Diario de trading obligatorio post-operación

#### PRIORIDAD MEDIA:
4. **WorldMap visual** — Mapa del mundo con nodos de misión clickeables
5. **Escenas educativas visuales** (Apple Market, Bounce Room, etc.)
6. **Sprites SVG de personajes** con estados/expresiones
7. **Animaciones de transición** entre zonas (Framer Motion)
8. **Sistema de logros** con popups animados
9. **Responsive completo** (mobile-first)

#### PRIORIDAD BAJA:
10. **Ciudades de mercado** con identidad visual propia
11. **Efectos de partículas** y ambient
12. **Deploy a Vercel**
13. **Sonido ambient** (lo-fi para cada zona)

---

## 4. ARQUITECTURA DE ARCHIVOS

```
src/
├── app/
│   ├── (auth)/login/page.tsx          — Login con Supabase
│   ├── (auth)/register/page.tsx       — Registro (crea profile + progress)
│   ├── (game)/layout.tsx              — Layout del juego (header HUD)
│   ├── (game)/dashboard/page.tsx      — Dashboard con mapa de misiones
│   ├── (game)/mission/[id]/page.tsx   — Motor universal de misiones
│   ├── auth/callback/route.ts         — OAuth callback
│   ├── layout.tsx                     — Root layout
│   ├── page.tsx                       — Landing
│   └── globals.css                    — Design tokens VDD v1.0
├── components/game/
│   ├── QuizEngine.tsx                 — Motor de quizzes (aleatorizado + hints)
│   ├── MissionTutorial.tsx            — Panel educativo reutilizable
│   ├── MatchTermMinigame.tsx          — Conectar términos ↔ definiciones
│   ├── CandlestickBuilder.tsx         — Construir velas (con tutorial integrado)
│   ├── ChartTapGame.tsx               — Clasificar tendencia en gráfico SVG
│   ├── RiskCalculator.tsx             — Calcular tamaño de posición
│   ├── CandleClassifier.tsx           — Boss N1: análisis integrado
│   ├── ZonePainter.tsx                — Clasificar zonas oferta/demanda
│   ├── PatternIdentifier.tsx          — Señal de patrones de velas
│   ├── OrderSimulator.tsx             — Tipo de orden por escenario
│   └── MarketPreview.tsx              — Gran Tour (7 mercados + selección)
├── components/narrative/
│   └── CharacterDialogue.tsx          — Burbujas de diálogo por personaje
├── hooks/
│   └── useHasMounted.ts              — Previene hydration errors
├── lib/content/
│   ├── level1.ts                     — 5 misiones N1 (tipos + data completa)
│   ├── level2.ts                     — 5 misiones N2 + 7 mercados
│   └── level3-crypto.ts             — 5 misiones N3 Crypto
├── lib/game/constants.ts             — Ranks, XP rewards, achievements
├── lib/supabase/                     — Clientes Supabase (browser + server)
├── lib/utils/format.ts               — formatCurrency/formatNumber deterministic
├── lib/utils/shuffle.ts              — Aleatorización segura (Fisher-Yates)
├── store/gameStore.ts                — Zustand store (persist + 3 niveles)
├── types/game.ts                     — Interfaces globales
└── middleware.ts                     — Auth session refresh
```

---

## 5. FLUJO DE UNA MISIÓN

```
INTRO (diálogos narrativos)
  → TUTORIAL (MissionTutorial: objetivo + concepto + ejemplo + instrucciones)
    → MINI-JUEGO (componente interactivo específico)
      → QUIZ (preguntas aleatorizadas + feedback educativo)
        → OUTRO (diálogos de cierre)
          → RECOMPENSA (+XP, +Capital, badge)
            → DASHBOARD (siguiente misión desbloqueada)
```

---

## 6. SISTEMA DE PROGRESIÓN (gameStore.ts)

```typescript
State: {
  xp, virtualCapital, rank, currentLevelId, currentMissionId,
  completedMissions[], marketSpecialization, marketChangeUsed
}

Actions:
  completeMission(levelId, missionId, score) — suma XP/capital, desbloquea siguiente
  isMissionCompleted(levelId, missionId) — verifica si ya se completó
  isMissionUnlocked(levelId, missionId) — verifica prerrequisito
  getMissionStatus(levelId, missionId) → "locked" | "available" | "completed"
  setMarketSpecialization(market) — se elige en M2.5
  useMarketChange(newMarket) — cambio único permitido
  resetProgress() — dev tool
```

Flujo: `level_1` (5 missions) → `level_2` (5 missions, última = Gran Tour elige mercado) → `level_3_crypto` (5 missions)

---

## 7. DESIGN SYSTEM (VDD v1.0)

| Token | Hex | Uso |
|-------|-----|-----|
| tp-base | #0A0E1A | Fondo principal |
| tp-surface | #131827 | Cards, paneles |
| tp-surface-alt | #1C2233 | Hover states |
| tp-border | #1E2D45 | Bordes |
| tp-text | #E8EAF0 | Texto principal |
| tp-text-muted | #8894A8 | Texto secundario |
| tp-gold | #F0C040 | XP, logros, marca, CTAs |
| tp-demand | #22C55E | Positivo, ganancias |
| tp-supply | #EF4444 | Negativo, pérdidas |
| tp-info | #60A5FA | ARIA, información |
| tp-warning | #F59E0B | Precaución |

Fuentes: `font-display` (Space Grotesk), `font-body` (DM Sans), `font-data` (JetBrains Mono)

---

## 8. PERSONAJES

| ID | Nombre | Rol | Color |
|----|--------|-----|-------|
| el_viejo_marco | El Viejo Marco | Mentor | Gold |
| aria | ARIA | Guía IA | Info/Blue |
| el_especulador | El Especulador | Antagonista (codicia) | Supply/Red |
| la_señorita_fomo | La Señorita FOMO | Antagonista (FOMO) | Pink |
| don_panico | Don Pánico | Antagonista (pánico) | Blue frío |
| narrator | Narrador | Narrativa | Muted |

---

## 9. BASE DE DATOS (Supabase)

**URL**: `https://pxzhbhkztlvdswksptta.supabase.co`

Tablas: `profiles`, `player_progress`, `completed_missions`, `achievements`, `trading_diary`, `simulator_operations`

Funciones: `increment_xp_and_capital()`, `get_full_player_state()`

Trigger: `update_streak()` en `player_progress`

RLS: Cada usuario solo ve sus propios datos.

---

## 10. REGLAS DE DESARROLLO

1. **No usar tokens de color viejos** — solo `tp-base`, `tp-surface`, `tp-demand`, `tp-supply`, `tp-gold`, `tp-info`, `tp-text`, `tp-text-muted`, `tp-border`
2. **No provocar hydration errors** — usar `useHasMounted` o `useEffect` para cualquier dato de localStorage/aleatorización
3. **Build limpio obligatorio** — `npx tsc --noEmit` debe dar 0 errores antes de commit
4. **Progresión secuencial** — misiones se desbloquean una a una, nunca se puede saltar
5. **Feedback educativo** — nunca solo "correcto/incorrecto", siempre explicar POR QUÉ
6. **Dark mode siempre** — ningún fondo blanco o crema
7. **Mobile-first** — todos los componentes desde 375px
8. **No rehacer lo existente** — trabajar sobre la estructura actual

---

## 11. PRÓXIMO PASO RECOMENDADO

Implementar los 5 mini-juegos del Nivel 3 Crypto como componentes interactivos (actualmente son placeholders con botón "Completar"). Después, sincronizar el progreso con Supabase para que persista entre dispositivos.

---

*Documento de contexto para TraderPath. Última actualización: Junio 2026.*
