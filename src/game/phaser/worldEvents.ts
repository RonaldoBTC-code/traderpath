export type AcademyTarget =
  | "aria"
  | "market-plaza"
  | "candle-workshop"
  | "trend-observatory"
  | "bitcoin-portal";

export type WelcomeTarget =
  | "intro-aria"
  | "intro-token"
  | "intro-gate"
  | "intro-gate-locked";

export type WorldTarget = AcademyTarget | WelcomeTarget;
export type WorldRoom = "welcome-harbor" | "academy-agora";

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
} as const;
