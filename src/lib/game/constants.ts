import type { Rank, AchievementDef } from "@/types/game";

// ============================================================
// TRADERPATH — Game Constants
// ============================================================

export const RANKS: Rank[] = [
  { name: "Novato", minXP: 0, maxXP: 1000, level: 1 },
  { name: "Aprendiz", minXP: 1000, maxXP: 2500, level: 2 },
  { name: "Analista", minXP: 2500, maxXP: 5000, level: 3 },
  { name: "Estratega", minXP: 5000, maxXP: 8500, level: 4 },
  { name: "Operador", minXP: 8500, maxXP: 13000, level: 5 },
  { name: "Trader", minXP: 13000, maxXP: 18500, level: 6 },
  { name: "Profesional", minXP: 18500, maxXP: 25000, level: 7 },
  { name: "Leyenda", minXP: 25000, maxXP: null, level: 8 },
];

export const XP_REWARDS = {
  mission_complete: { base: 200, max: 400 },
  quiz_perfect: 150,
  diary_entry: 100,
  streak_bonus: 50,
  reto_final: { base: 500, max: 800 },
  gran_tour_visit: 50,
  gran_tour_complete: 200,
  first_operation: 400,
};

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_lesson",
    title: "Primer Paso",
    description: "Completa tu primera misión",
    icon: "📖",
    xpReward: 50,
  },
  {
    id: "foundations",
    title: "Fundamentos Sólidos",
    description: "Completa el Reto Final del Nivel 1",
    icon: "🏅",
    xpReward: 200,
  },
  {
    id: "first_operation",
    title: "Primera Operación",
    description: "Ejecuta tu primer trade en el simulador",
    icon: "📊",
    xpReward: 150,
  },
  {
    id: "pattern_collector",
    title: "Lector de Velas",
    description: "Desbloquea las 4 fichas de patrones de velas",
    icon: "🕯️",
    xpReward: 100,
  },
  {
    id: "market_forces",
    title: "Las Fuerzas del Mercado",
    description: "Completa el Reto Final del Nivel 2",
    icon: "📈",
    xpReward: 300,
  },
  {
    id: "grand_tour",
    title: "Explorador Global",
    description: "Visita los 7 distritos del Gran Tour",
    icon: "🌐",
    xpReward: 200,
  },
  {
    id: "streak_7",
    title: "Racha de Fuego",
    description: "7 días consecutivos de actividad",
    icon: "🔥",
    xpReward: 150,
  },
];

export const LEVEL_CAPITAL: Record<number, number> = {
  1: 1000,
  2: 1500,
  3: 2500,
  4: 4000,
  5: 6500,
  6: 10000,
  7: 20000,
};

export const CHECKLIST_ITEMS = [
  { id: 1, text: "Analicé el contexto general del mercado" },
  { id: 2, text: "Identifiqué la zona potencial de entrada" },
  { id: 3, text: "Definí el Stop Loss (punto de invalidación)" },
  { id: 4, text: "Definí el Take Profit (objetivo razonable)" },
  { id: 5, text: "Calculé la relación R:R (mínimo 1:2)" },
  { id: 6, text: "Calculé el tamaño de posición según el riesgo" },
  { id: 7, text: "El plan completo tiene sentido con confirmación" },
];

export const MARKETS = [
  {
    id: "crypto",
    name: "Criptomonedas",
    icon: "🟡",
    schedule: "24/7",
    volatility: 5,
    difficulty: 4,
    description: "Activos digitales descentralizados. Bitcoin, Ethereum y altcoins.",
  },
  {
    id: "forex",
    name: "Forex",
    icon: "💱",
    schedule: "Lun–Vie 24h",
    volatility: 3,
    difficulty: 4,
    description: "Pares de divisas. El mercado más grande del mundo.",
  },
  {
    id: "stocks",
    name: "Acciones",
    icon: "📈",
    schedule: "NYSE 9:30–16:00 ET",
    volatility: 3,
    difficulty: 3,
    description: "Fracciones de propiedad en empresas cotizadas.",
  },
  {
    id: "commodities",
    name: "Commodities",
    icon: "🥇",
    schedule: "CME ~24h",
    volatility: 3,
    difficulty: 4,
    description: "Oro, petróleo, trigo. Recursos naturales.",
  },
  {
    id: "indices",
    name: "Índices",
    icon: "📊",
    schedule: "Horario bursátil",
    volatility: 3,
    difficulty: 3,
    description: "Canastas de acciones que representan un mercado completo.",
  },
  {
    id: "futures",
    name: "Futuros",
    icon: "⚡",
    schedule: "CME Globex ~24h",
    volatility: 4,
    difficulty: 5,
    description: "Contratos con fecha de vencimiento y apalancamiento.",
  },
  {
    id: "etfs",
    name: "ETFs",
    icon: "🌐",
    schedule: "Horario bursátil",
    volatility: 2,
    difficulty: 2,
    description: "Fondos cotizados que diversifican automáticamente.",
  },
];
