export type AcademyTarget =
  | "aria"
  | "market-plaza"
  | "candle-workshop"
  | "trend-observatory"
  | "bitcoin-portal"
  // Sitios de M1.4 y M1.5. El mapa sólo tenía lugar para M1.1–M1.3, y
  // docs/VISUAL_DIRECTION.md §1 dice que el conocimiento vive en lugares.
  | "risk-vault"
  | "challenge-arena";

export type WelcomeTarget =
  | "intro-aria"
  | "intro-token"
  | "intro-gate"
  | "intro-gate-locked";

export type MarketTarget =
  | "market-seller"
  | "market-buyer"
  | "market-board"
  | "market-practice"
  | "market-practice-locked"
  | "market-exit";

export type CandleTarget =
  | "candle-open"
  | "candle-high"
  | "candle-low"
  | "candle-close"
  | "candle-direction"
  | "candle-direction-locked"
  | "candle-body"
  | "candle-body-locked"
  | "candle-upper-wick"
  | "candle-upper-wick-locked"
  | "candle-lower-wick"
  | "candle-lower-wick-locked"
  | "candle-practice"
  | "candle-practice-locked"
  | "candle-exit";

export type WorldTarget = AcademyTarget | WelcomeTarget | MarketTarget | CandleTarget;
export type WorldRoom = "welcome-harbor" | "academy-agora" | "market-plaza" | "candle-workshop";

export type AcademyWorldEvent =
  | { type: "ready"; room: WorldRoom }
  | { type: "prompt"; message: string }
  | { type: "interact"; target: WorldTarget }
  | { type: "moving"; moving: boolean }
  | { type: "introComplete" };

export type AcademyWorldEventHandler = (event: AcademyWorldEvent) => void;

export const ACADEMY_GAME_EVENTS = {
  avatarColor: "academy:avatar-color",
  focusTarget: "academy:focus-target",
  enableIntroToken: "world:intro-token",
  enableIntroGate: "world:intro-gate",
  enterAcademy: "world:enter-academy",
  marketProgress: "world:market-progress",
  candleProgress: "world:candle-progress",
} as const;
