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

/**
 * Un destino tal como lo dibuja el minimapa: id del hotspot y la posición del
 * marcador en coordenadas de mundo. La escena es la única fuente de estas
 * coordenadas; el minimapa (React) sólo les añade el estado de misión. Así el
 * pin del minimapa no puede desalinearse del marcador del mundo.
 */
export interface MinimapDestination {
  id: AcademyTarget;
  x: number;
  y: number;
}

export type AcademyWorldEvent =
  | { type: "ready"; room: WorldRoom }
  | { type: "prompt"; message: string }
  | { type: "interact"; target: WorldTarget }
  | { type: "moving"; moving: boolean }
  | { type: "introComplete" }
  /**
   * Dimensiones del mundo y sus destinos, emitido una vez al crear la sala.
   * El minimapa lo usa para escalar mundo→píxel y colocar los pines.
   */
  | {
      type: "world";
      room: WorldRoom;
      width: number;
      height: number;
      destinations: MinimapDestination[];
    }
  /**
   * Estado vivo de la cámara: posición del jugador, rectángulo visible del
   * mundo y zoom. Emitido de forma acotada cuando algo se mueve. El minimapa
   * dibuja el punto del jugador (sin animación, 1:1) y el marco de la cámara.
   */
  | {
      type: "camera";
      playerX: number;
      playerY: number;
      viewX: number;
      viewY: number;
      viewWidth: number;
      viewHeight: number;
      zoom: number;
    };

export type AcademyWorldEventHandler = (event: AcademyWorldEvent) => void;

export const ACADEMY_GAME_EVENTS = {
  avatarColor: "academy:avatar-color",
  focusTarget: "academy:focus-target",
  // Zoom por pasos desde los botones del HUD: +1 acerca, -1 aleja. La rueda y
  // la pinza los maneja la escena directamente, anclados al puntero.
  zoomStep: "world:zoom-step",
  // Viajar a un punto del mundo desde el minimapa; la escena lo resuelve contra
  // la máscara de caminabilidad (nunca manda al jugador al agua).
  travelTo: "world:travel-to",
  enableIntroToken: "world:intro-token",
  enableIntroGate: "world:intro-gate",
  enterAcademy: "world:enter-academy",
  marketProgress: "world:market-progress",
  candleProgress: "world:candle-progress",
} as const;
