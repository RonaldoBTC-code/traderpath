export type AcademyTarget =
  | "aria"
  | "market-plaza"
  | "candle-workshop"
  | "trend-observatory"
  | "bitcoin-portal";

export type AcademyWorldEvent =
  | { type: "ready" }
  | { type: "prompt"; message: string }
  | { type: "interact"; target: AcademyTarget }
  | { type: "moving"; moving: boolean };

export type AcademyWorldEventHandler = (event: AcademyWorldEvent) => void;

export const ACADEMY_GAME_EVENTS = {
  avatarColor: "academy:avatar-color",
  focusTarget: "academy:focus-target",
} as const;
