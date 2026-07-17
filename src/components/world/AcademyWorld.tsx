"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Backpack,
  BookOpenCheck,
  Check,
  Coins,
  Compass,
  Gamepad2,
  LockKeyhole,
  Map,
  MapPin,
  MessageCircle,
  Palette,
  RotateCcw,
  Smartphone,
  Sparkles,
  Trophy,
  UserRound,
  X,
} from "lucide-react";
import { level1 } from "@/lib/content/level1";
import { level2 } from "@/lib/content/level2";
import { level3Crypto } from "@/lib/content/level3-crypto";
import { formatCurrency } from "@/lib/utils/format";
import { useGameStore, type MissionStatus } from "@/store/gameStore";
import {
  ACADEMY_GAME_EVENTS,
  type AcademyTarget,
  type AcademyWorldEvent,
  type WorldRoom,
} from "@/game/phaser/worldEvents";

interface GameHandle {
  destroy: (removeCanvas?: boolean, noReturn?: boolean) => void;
  events: { emit: (event: string, ...args: unknown[]) => boolean };
}

type MissionId = "m1_1" | "m1_2" | "m1_3";
type IntroStage = "meet-aria" | "find-token" | "enter-academy";
type OpenPanel =
  | { type: "aria" }
  | { type: "mission"; missionId: MissionId }
  | { type: "portal" }
  | { type: "intro-welcome" }
  | { type: "intro-reward" }
  | { type: "intro-gate" }
  | { type: "intro-locked" }
  | { type: "market-seller" }
  | { type: "market-buyer" }
  | { type: "market-board" }
  | { type: "market-practice" }
  | { type: "market-practice-locked" }
  | { type: "candle-open" }
  | { type: "candle-high" }
  | { type: "candle-low" }
  | { type: "candle-close" }
  | { type: "candle-direction" }
  | { type: "candle-direction-locked" }
  | { type: "candle-body" }
  | { type: "candle-body-locked" }
  | { type: "candle-upper-wick" }
  | { type: "candle-upper-wick-locked" }
  | { type: "candle-lower-wick" }
  | { type: "candle-lower-wick-locked" }
  | { type: "candle-practice" }
  | { type: "candle-practice-locked" }
  | null;
type IntroPanelState = Extract<Exclude<OpenPanel, null>, { type: `intro-${string}` }>;
type MarketPanelState = Extract<Exclude<OpenPanel, null>, { type: `market-${string}` }>;
type CandlePanelState = Extract<Exclude<OpenPanel, null>, { type: `candle-${string}` }>;
type AcademyPanelState = Exclude<OpenPanel, null | IntroPanelState | MarketPanelState | CandlePanelState>;

const INTRO_STORAGE_KEY = "traderpath-world-intro-v1";
const INTRO_REWARD_KEY = "traderpath-world-intro-reward-v1";
const MARKET_SELLER_KEY = "traderpath-market-seller-v1";
const MARKET_BUYER_KEY = "traderpath-market-buyer-v1";
const CANDLE_OPEN_KEY = "traderpath-candle-open-v1";
const CANDLE_HIGH_KEY = "traderpath-candle-high-v1";
const CANDLE_LOW_KEY = "traderpath-candle-low-v1";
const CANDLE_CLOSE_KEY = "traderpath-candle-close-v1";
const CANDLE_DIRECTION_KEY = "traderpath-candle-direction-v1";
const CANDLE_BODY_KEY = "traderpath-candle-body-v1";
const CANDLE_UPPER_WICK_KEY = "traderpath-candle-upper-wick-v1";
const CANDLE_LOWER_WICK_KEY = "traderpath-candle-lower-wick-v1";
const RETURN_ROOM_KEY = "traderpath-world-return-room-v1";
const AVATAR_COLORS = ["#F0C040", "#38BDF8", "#22C55E", "#F97316", "#D946EF"];

const MISSION_META = {
  m1_1: {
    title: "Mercado Plaza",
    subtitle: "Qué es un mercado y quién participa",
    target: "market-plaza" as AcademyTarget,
  },
  m1_2: {
    title: "Taller de Velas",
    subtitle: "Construye y comprende una vela OHLC",
    target: "candle-workshop" as AcademyTarget,
  },
  m1_3: {
    title: "Observatorio de Tendencias",
    subtitle: "Lee máximos, mínimos y estructura",
    target: "trend-observatory" as AcademyTarget,
  },
};

function isIntroPanel(panel: Exclude<OpenPanel, null>): panel is IntroPanelState {
  return panel.type === "intro-welcome"
    || panel.type === "intro-reward"
    || panel.type === "intro-gate"
    || panel.type === "intro-locked";
}

function isMarketPanel(panel: Exclude<OpenPanel, null>): panel is MarketPanelState {
  return panel.type === "market-seller"
    || panel.type === "market-buyer"
    || panel.type === "market-board"
    || panel.type === "market-practice"
    || panel.type === "market-practice-locked";
}

function isCandlePanel(panel: Exclude<OpenPanel, null>): panel is CandlePanelState {
  return panel.type.startsWith("candle-");
}

export default function AcademyWorld() {
  const router = useRouter();
  const mountRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameHandle | null>(null);
  const [startResolved, setStartResolved] = useState(false);
  const [room, setRoom] = useState<WorldRoom>("welcome-harbor");
  const [ready, setReady] = useState(false);
  const [moving, setMoving] = useState(false);
  const [prompt, setPrompt] = useState("Preparando Mercado Vivo…");
  const [introStage, setIntroStage] = useState<IntroStage>("meet-aria");
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [passportOpen, setPassportOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [sellerVisited, setSellerVisited] = useState(false);
  const [buyerVisited, setBuyerVisited] = useState(false);
  const [candleOpenVisited, setCandleOpenVisited] = useState(false);
  const [candleHighVisited, setCandleHighVisited] = useState(false);
  const [candleLowVisited, setCandleLowVisited] = useState(false);
  const [candleCloseVisited, setCandleCloseVisited] = useState(false);
  const [candleDirectionVisited, setCandleDirectionVisited] = useState(false);
  const [candleBodyVisited, setCandleBodyVisited] = useState(false);
  const [candleUpperWickVisited, setCandleUpperWickVisited] = useState(false);
  const [candleLowerWickVisited, setCandleLowerWickVisited] = useState(false);

  const {
    xp,
    virtualCapital,
    rank,
    currentLevelId,
    currentMissionId,
    completedMissions,
    getMissionStatus,
    applyCapitalChange,
  } = useGameStore();

  const statusM11 = getMissionStatus("level_1", "m1_1");
  const statusM12 = getMissionStatus("level_1", "m1_2");
  const statusM13 = getMissionStatus("level_1", "m1_3");
  const currentLevel = currentLevelId === "level_2"
    ? level2
    : currentLevelId === "level_3_crypto"
      ? level3Crypto
      : level1;
  const completedInLevel = completedMissions.filter(
    (mission) => mission.levelId === currentLevelId
  ).length;

  useEffect(() => {
    const introCompleted = window.localStorage.getItem(INTRO_STORAGE_KEY) === "completed";
    const returnRoom = window.localStorage.getItem(RETURN_ROOM_KEY);
    window.localStorage.removeItem(RETURN_ROOM_KEY);
    setSellerVisited(window.localStorage.getItem(MARKET_SELLER_KEY) === "seen");
    setBuyerVisited(window.localStorage.getItem(MARKET_BUYER_KEY) === "seen");
    setCandleOpenVisited(window.localStorage.getItem(CANDLE_OPEN_KEY) === "seen");
    setCandleHighVisited(window.localStorage.getItem(CANDLE_HIGH_KEY) === "seen");
    setCandleLowVisited(window.localStorage.getItem(CANDLE_LOW_KEY) === "seen");
    setCandleCloseVisited(window.localStorage.getItem(CANDLE_CLOSE_KEY) === "seen");
    setCandleDirectionVisited(window.localStorage.getItem(CANDLE_DIRECTION_KEY) === "seen");
    setCandleBodyVisited(window.localStorage.getItem(CANDLE_BODY_KEY) === "seen");
    setCandleUpperWickVisited(window.localStorage.getItem(CANDLE_UPPER_WICK_KEY) === "seen");
    setCandleLowerWickVisited(window.localStorage.getItem(CANDLE_LOWER_WICK_KEY) === "seen");
    setRoom(
      introCompleted
        ? returnRoom === "market-plaza"
          ? "market-plaza"
          : returnRoom === "candle-workshop"
            ? "candle-workshop"
            : "academy-agora"
        : "welcome-harbor"
    );
    setStartResolved(true);
  }, []);

  const handleWorldEvent = useCallback((event: AcademyWorldEvent) => {
    if (event.type === "ready") {
      setReady(true);
      return;
    }
    if (event.type === "prompt") {
      setPrompt(event.message);
      return;
    }
    if (event.type === "moving") {
      setMoving(event.moving);
      return;
    }
    if (event.type === "introComplete") {
      window.localStorage.setItem(INTRO_STORAGE_KEY, "completed");
      setOpenPanel(null);
      setMapOpen(false);
      setReady(false);
      setRoom("academy-agora");
      return;
    }

    if (event.target === "intro-aria") setOpenPanel({ type: "intro-welcome" });
    if (event.target === "intro-token") {
      if (window.localStorage.getItem(INTRO_REWARD_KEY) !== "claimed") {
        applyCapitalChange(50);
        window.localStorage.setItem(INTRO_REWARD_KEY, "claimed");
      }
      setIntroStage("enter-academy");
      gameRef.current?.events.emit(ACADEMY_GAME_EVENTS.enableIntroGate);
      setOpenPanel({ type: "intro-reward" });
    }
    if (event.target === "intro-gate") setOpenPanel({ type: "intro-gate" });
    if (event.target === "intro-gate-locked") setOpenPanel({ type: "intro-locked" });
    if (event.target === "aria") setOpenPanel({ type: "aria" });
    if (event.target === "market-plaza") setOpenPanel({ type: "mission", missionId: "m1_1" });
    if (event.target === "candle-workshop") setOpenPanel({ type: "mission", missionId: "m1_2" });
    if (event.target === "trend-observatory") setOpenPanel({ type: "mission", missionId: "m1_3" });
    if (event.target === "bitcoin-portal") setOpenPanel({ type: "portal" });
    if (event.target === "market-seller") {
      window.localStorage.setItem(MARKET_SELLER_KEY, "seen");
      setSellerVisited(true);
      setOpenPanel({ type: "market-seller" });
    }
    if (event.target === "market-buyer") {
      window.localStorage.setItem(MARKET_BUYER_KEY, "seen");
      setBuyerVisited(true);
      setOpenPanel({ type: "market-buyer" });
    }
    if (event.target === "market-board") setOpenPanel({ type: "market-board" });
    if (event.target === "market-practice") setOpenPanel({ type: "market-practice" });
    if (event.target === "market-practice-locked") setOpenPanel({ type: "market-practice-locked" });
    if (event.target === "market-exit") {
      setOpenPanel(null);
      setReady(false);
      setRoom("academy-agora");
    }
    if (event.target === "candle-open") {
      window.localStorage.setItem(CANDLE_OPEN_KEY, "seen");
      setCandleOpenVisited(true);
      setOpenPanel({ type: "candle-open" });
    }
    if (event.target === "candle-high") {
      window.localStorage.setItem(CANDLE_HIGH_KEY, "seen");
      setCandleHighVisited(true);
      setOpenPanel({ type: "candle-high" });
    }
    if (event.target === "candle-low") {
      window.localStorage.setItem(CANDLE_LOW_KEY, "seen");
      setCandleLowVisited(true);
      setOpenPanel({ type: "candle-low" });
    }
    if (event.target === "candle-close") {
      window.localStorage.setItem(CANDLE_CLOSE_KEY, "seen");
      setCandleCloseVisited(true);
      setOpenPanel({ type: "candle-close" });
    }
    if (event.target === "candle-direction") {
      window.localStorage.setItem(CANDLE_DIRECTION_KEY, "seen");
      setCandleDirectionVisited(true);
      setOpenPanel({ type: "candle-direction" });
    }
    if (event.target === "candle-direction-locked") setOpenPanel({ type: "candle-direction-locked" });
    if (event.target === "candle-body") {
      window.localStorage.setItem(CANDLE_BODY_KEY, "seen");
      setCandleBodyVisited(true);
      setOpenPanel({ type: "candle-body" });
    }
    if (event.target === "candle-body-locked") setOpenPanel({ type: "candle-body-locked" });
    if (event.target === "candle-upper-wick") {
      window.localStorage.setItem(CANDLE_UPPER_WICK_KEY, "seen");
      setCandleUpperWickVisited(true);
      setOpenPanel({ type: "candle-upper-wick" });
    }
    if (event.target === "candle-upper-wick-locked") setOpenPanel({ type: "candle-upper-wick-locked" });
    if (event.target === "candle-lower-wick") {
      window.localStorage.setItem(CANDLE_LOWER_WICK_KEY, "seen");
      setCandleLowerWickVisited(true);
      setOpenPanel({ type: "candle-lower-wick" });
    }
    if (event.target === "candle-lower-wick-locked") setOpenPanel({ type: "candle-lower-wick-locked" });
    if (event.target === "candle-practice") setOpenPanel({ type: "candle-practice" });
    if (event.target === "candle-practice-locked") setOpenPanel({ type: "candle-practice-locked" });
    if (event.target === "candle-exit") {
      setOpenPanel(null);
      setReady(false);
      setRoom("academy-agora");
    }
  }, [applyCapitalChange]);

  useEffect(() => {
    if (!startResolved || !mountRef.current) return;
    let disposed = false;

    void import("@/game/phaser/createAcademyGame").then(({ createAcademyGame }) => {
      if (disposed || !mountRef.current) return;
      gameRef.current = createAcademyGame(mountRef.current, handleWorldEvent, room) as GameHandle;
    });

    return () => {
      disposed = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [handleWorldEvent, room, startResolved]);

  useEffect(() => {
    if (!ready) return;
    gameRef.current?.events.emit(ACADEMY_GAME_EVENTS.avatarColor, avatarColor);
  }, [avatarColor, ready]);

  useEffect(() => {
    if (!ready || room !== "market-plaza") return;
    gameRef.current?.events.emit(ACADEMY_GAME_EVENTS.marketProgress, {
      sellerVisited,
      buyerVisited,
    });
  }, [buyerVisited, ready, room, sellerVisited]);

  useEffect(() => {
    if (!ready || room !== "candle-workshop") return;
    gameRef.current?.events.emit(ACADEMY_GAME_EVENTS.candleProgress, {
      openVisited: candleOpenVisited,
      highVisited: candleHighVisited,
      lowVisited: candleLowVisited,
      closeVisited: candleCloseVisited,
      directionVisited: candleDirectionVisited,
      bodyVisited: candleBodyVisited,
      upperWickVisited: candleUpperWickVisited,
      lowerWickVisited: candleLowerWickVisited,
    });
  }, [
    candleBodyVisited,
    candleCloseVisited,
    candleDirectionVisited,
    candleHighVisited,
    candleLowVisited,
    candleLowerWickVisited,
    candleOpenVisited,
    candleUpperWickVisited,
    ready,
    room,
  ]);

  const focusTarget = (target: AcademyTarget) => {
    setMapOpen(false);
    gameRef.current?.events.emit(ACADEMY_GAME_EVENTS.focusTarget, target);
  };

  const chooseAvatarColor = (color: string) => {
    setAvatarColor(color);
    gameRef.current?.events.emit(ACADEMY_GAME_EVENTS.avatarColor, color);
  };

  const startTokenSearch = () => {
    setIntroStage("find-token");
    setOpenPanel(null);
    gameRef.current?.events.emit(ACADEMY_GAME_EVENTS.enableIntroToken);
  };

  const enterAcademy = () => {
    setOpenPanel(null);
    gameRef.current?.events.emit(ACADEMY_GAME_EVENTS.enterAcademy);
  };

  const replayWelcome = () => {
    window.localStorage.removeItem(INTRO_STORAGE_KEY);
    setPassportOpen(false);
    setOpenPanel(null);
    setIntroStage("meet-aria");
    setReady(false);
    setRoom("welcome-harbor");
  };

  const enterMarketPlaza = () => {
    setOpenPanel(null);
    setMapOpen(false);
    setPassportOpen(false);
    setReady(false);
    setRoom("market-plaza");
  };

  const enterCandleWorkshop = () => {
    setOpenPanel(null);
    setMapOpen(false);
    setPassportOpen(false);
    setReady(false);
    setRoom("candle-workshop");
  };

  const openMission = (missionId: string) => {
    const missionLevelId = missionId.startsWith("m1_") ? "level_1" : currentLevelId;
    const status = getMissionStatus(missionLevelId, missionId);
    if (status === "locked") return;
    router.push(`/mission/${missionId}`);
  };

  const openMarketPractice = () => {
    window.localStorage.setItem(RETURN_ROOM_KEY, "market-plaza");
    openMission("m1_1");
  };

  const openCandlePractice = () => {
    window.localStorage.setItem(RETURN_ROOM_KEY, "candle-workshop");
    openMission("m1_2");
  };

  const candleOhlcComplete = candleOpenVisited && candleHighVisited && candleLowVisited && candleCloseVisited;
  const candleConceptsComplete = candleDirectionVisited && candleBodyVisited && candleUpperWickVisited && candleLowerWickVisited;
  const candleOhlcCount = [candleOpenVisited, candleHighVisited, candleLowVisited, candleCloseVisited].filter(Boolean).length;
  const candleConceptCount = [candleDirectionVisited, candleBodyVisited, candleUpperWickVisited, candleLowerWickVisited].filter(Boolean).length;

  const objective = room === "welcome-harbor"
    ? introStage === "meet-aria"
      ? "Habla con ARIA"
      : introStage === "find-token"
        ? "Encuentra la Ficha de Mercado"
        : "Cruza la puerta de Academia Ágora"
    : room === "market-plaza"
      ? !sellerVisited
        ? "Habla con Elena para conocer la oferta"
        : !buyerVisited
          ? "Habla con Leo para conocer la demanda"
          : "Entra al aula y demuestra lo aprendido"
      : room === "candle-workshop"
        ? !candleOhlcComplete
          ? `Visita las estaciones OHLC (${candleOhlcCount}/4)`
          : !candleConceptsComplete
            ? `Comprende cuerpo y mechas (${candleConceptCount}/4)`
            : "Entra a la evaluación y demuestra lo aprendido"
      : "Visita el siguiente edificio educativo";

  const roomLabel = room === "welcome-harbor"
    ? "Puerto de Bienvenida"
    : room === "market-plaza"
      ? "Mercado Plaza"
      : room === "candle-workshop"
        ? "Taller de Velas"
        : "Academia Ágora";

  return (
    <section
      className="relative h-dvh min-h-[520px] w-full overflow-hidden bg-[#8ecdea] bg-cover bg-center text-tp-text"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(190, 227, 248, 0.18), rgba(234, 244, 254, 0.30)), url('/assets/traderpath-world-hero.png')",
      }}
    >
      <div
        ref={mountRef}
        className="absolute inset-0 overflow-hidden [&_canvas]:!block"
        aria-label={
          room === "welcome-harbor"
            ? "Puerto de Bienvenida jugable"
            : room === "market-plaza"
              ? "Mercado Plaza jugable"
              : room === "candle-workshop"
                ? "Taller de Velas jugable"
                : "Academia Ágora jugable"
        }
      />

      {(!ready || !startResolved) && (
        <div className="absolute inset-0 z-50 grid place-items-center overflow-hidden bg-[#bfe3f5]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_75%,rgba(37,142,165,.28),transparent_38%),linear-gradient(180deg,#d6ecfa,#bfe3f5)]" />
          <div className="relative text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-[28px] border border-tp-gold/30 bg-tp-gold/10 shadow-[0_0_70px_rgba(240,192,64,.18)]">
              <span className="font-display text-xl font-black text-tp-gold">TP</span>
            </div>
            <p className="mt-5 font-display text-xl font-bold">Mercado Vivo</p>
            <p className="mt-1 text-xs text-tp-text-muted/80">Preparando tu próxima aventura…</p>
            <div className="mx-auto mt-5 h-1.5 w-44 overflow-hidden rounded-full bg-tp-border/40">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-tp-gold to-[#fff0aa]" />
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 z-[45] flex items-center justify-center bg-[radial-gradient(circle_at_50%_30%,#d6ecfa,#bfe3f5_68%)] p-8 text-center sm:hidden">
        <div>
          <div className="mx-auto grid h-28 w-20 rotate-90 place-items-center rounded-[22px] border-2 border-tp-gold/60 bg-white/[0.04] shadow-[0_0_70px_rgba(240,192,64,.16)]">
            <Smartphone size={34} className="-rotate-90 text-tp-gold" />
          </div>
          <p className="mt-8 text-[9px] font-semibold uppercase tracking-[0.2em] text-tp-info">Modo de exploración</p>
          <h2 className="mt-2 font-display text-2xl font-bold">Gira tu dispositivo</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-tp-text-muted/80">Mercado Vivo está diseñado como un mundo panorámico. Usa la pantalla horizontal para caminar y descubrir cada edificio.</p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3 sm:p-5">
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-tp-border bg-[rgba(255,255,255,.82)] px-3 py-2 shadow-xl backdrop-blur-md">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-tp-gold text-[10px] font-black text-[#14222a]">TP</span>
          <span>
            <span className="block font-display text-xs font-bold leading-none">Mercado Vivo</span>
            <span className="mt-1 block text-[8px] uppercase tracking-[0.16em] text-tp-text-muted/80">
              {roomLabel}
            </span>
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center gap-2 rounded-2xl border border-tp-border bg-[rgba(255,255,255,.82)] px-3 py-2 shadow-xl backdrop-blur-md sm:flex">
            <Coins size={13} className="text-tp-demand" />
            <span className="font-data text-[10px] text-tp-demand">{formatCurrency(virtualCapital)}</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-tp-gold/25 bg-[rgba(255,255,255,.82)] px-3 py-2 shadow-xl backdrop-blur-md">
            <Sparkles size={13} className="text-tp-gold" />
            <span className="font-data text-[10px] text-tp-gold">{xp} XP</span>
          </div>
          <button
            type="button"
            onClick={() => setPassportOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-tp-border bg-[rgba(255,255,255,.82)] text-tp-text shadow-xl backdrop-blur-md transition hover:border-tp-info/45 hover:text-tp-info"
            aria-label="Abrir Pasaporte del Explorador"
          >
            <Backpack size={17} />
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-[82px] z-20 w-[min(430px,calc(100%-32px))] -translate-x-1/2 rounded-full border border-tp-border bg-[rgba(255,255,255,.78)] px-4 py-2 text-center shadow-xl backdrop-blur-md sm:top-5">
        <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-tp-gold">Objetivo</p>
        <p className="mt-0.5 truncate text-[10px] font-semibold sm:text-xs">{objective}</p>
      </div>

      <div className="absolute inset-x-0 bottom-3 z-20 flex items-end justify-between gap-2 px-3 sm:bottom-5 sm:px-5">
        <div className="flex gap-2">
          {room === "academy-agora" && (
            <button
              type="button"
              onClick={() => setMapOpen((current) => !current)}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-tp-border bg-[rgba(255,255,255,.86)] text-tp-text shadow-xl backdrop-blur-md transition hover:-translate-y-0.5 hover:border-tp-gold/50 hover:text-tp-gold"
              aria-label="Abrir mapa de Academia Ágora"
            >
              <Map size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setPaletteOpen((current) => !current)}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-tp-border bg-[rgba(255,255,255,.86)] text-tp-text shadow-xl backdrop-blur-md transition hover:-translate-y-0.5 hover:border-tp-info/50 hover:text-tp-info"
            aria-label="Personalizar avatar"
          >
            <Palette size={18} />
          </button>
        </div>

        <div className="pointer-events-none max-w-[540px] flex-1 rounded-full border border-tp-border bg-[rgba(255,255,255,.82)] px-4 py-2 text-center text-[9px] text-tp-text/85 shadow-xl backdrop-blur-md sm:text-[10px]">
          {moving ? "Caminando…" : prompt}
        </div>

        <button
          type="button"
          onClick={() => setPassportOpen(true)}
          className="grid h-11 w-11 place-items-center rounded-2xl border border-tp-border bg-[rgba(255,255,255,.86)] text-tp-text shadow-xl backdrop-blur-md transition hover:-translate-y-0.5 hover:border-tp-gold/50 hover:text-tp-gold"
          aria-label="Abrir misiones"
        >
          <BookOpenCheck size={18} />
        </button>
      </div>

      {mapOpen && room === "academy-agora" && (
        <div className="absolute bottom-20 left-3 z-30 w-[min(370px,calc(100%-24px))] rounded-3xl border border-tp-border bg-[rgba(255,255,255,.96)] p-4 shadow-2xl backdrop-blur-xl sm:left-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-tp-info">Mapa ilustrado</p>
              <p className="font-display text-sm font-bold">Distritos de aprendizaje</p>
            </div>
            <IconButton label="Cerrar mapa" onClick={() => setMapOpen(false)} />
          </div>
          <div className="mt-3 space-y-2">
            <MapDestination meta={MISSION_META.m1_1} status={statusM11} onClick={() => focusTarget("market-plaza")} />
            <MapDestination meta={MISSION_META.m1_2} status={statusM12} onClick={() => focusTarget("candle-workshop")} />
            <MapDestination meta={MISSION_META.m1_3} status={statusM13} onClick={() => focusTarget("trend-observatory")} />
            <button type="button" onClick={() => focusTarget("bitcoin-portal")} className="flex w-full items-center gap-3 rounded-2xl border border-tp-crypto/15 bg-orange-400/5 p-3 text-left transition hover:border-tp-crypto/30 hover:bg-orange-400/10">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-400/10 font-data font-bold text-tp-crypto">₿</span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold">Portal Bitcoin</span>
                <span className="block truncate text-[9px] text-tp-text-muted/80">Ciudad especializada · bloqueada</span>
              </span>
              <LockKeyhole size={13} className="text-tp-text-muted/80" />
            </button>
          </div>
        </div>
      )}

      {paletteOpen && (
        <div className="absolute bottom-20 left-3 z-30 rounded-3xl border border-tp-border bg-[rgba(255,255,255,.96)] p-3 shadow-2xl backdrop-blur-xl sm:left-5">
          <div className="mb-2 flex items-center justify-between gap-5">
            <p className="text-[9px] uppercase tracking-[0.16em] text-tp-info">Tu explorador</p>
            <IconButton label="Cerrar personalización" onClick={() => setPaletteOpen(false)} />
          </div>
          <div className="flex gap-2">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => chooseAvatarColor(color)}
                aria-label={`Usar color ${color}`}
                aria-pressed={avatarColor === color}
                className={`h-10 w-10 rounded-2xl border-2 transition hover:scale-105 ${avatarColor === color ? "border-white" : "border-transparent"}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      {passportOpen && (
        <PassportDrawer
          level={currentLevel}
          currentLevelId={currentLevelId}
          currentMissionId={currentMissionId}
          completed={completedInLevel}
          rank={rank}
          getMissionStatus={getMissionStatus}
          onClose={() => setPassportOpen(false)}
          onMission={openMission}
          onReplayWelcome={replayWelcome}
        />
      )}

      {openPanel && (
        isIntroPanel(openPanel)
          ? (
            <IntroPanel
              panel={openPanel}
              onClose={() => setOpenPanel(null)}
              onStartTokenSearch={startTokenSearch}
              onEnterAcademy={enterAcademy}
            />
          )
          : isMarketPanel(openPanel)
            ? (
              <MarketLessonPanel
                panel={openPanel}
                sellerVisited={sellerVisited}
                buyerVisited={buyerVisited}
                onClose={() => setOpenPanel(null)}
                onPractice={openMarketPractice}
              />
            )
            : isCandlePanel(openPanel)
              ? (
                <CandleLessonPanel
                  panel={openPanel}
                  ohlcCount={candleOhlcCount}
                  conceptCount={candleConceptCount}
                  onClose={() => setOpenPanel(null)}
                  onPractice={openCandlePractice}
                />
              )
              : (
            <AcademyPanel
              panel={openPanel}
              getMissionStatus={getMissionStatus}
              onClose={() => setOpenPanel(null)}
              onMission={openMission}
              onEnterMarket={enterMarketPlaza}
              onEnterCandleWorkshop={enterCandleWorkshop}
            />
          )
      )}
    </section>
  );
}

function MapDestination({
  meta,
  status,
  onClick,
}: {
  meta: (typeof MISSION_META)[keyof typeof MISSION_META];
  status: MissionStatus;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 text-left transition hover:border-tp-gold/25 hover:bg-white/[0.05]">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${status === "completed" ? "bg-tp-demand/10 text-tp-demand" : status === "available" ? "bg-tp-gold/10 text-tp-gold" : "bg-tp-base/60 text-tp-text-muted/80"}`}>
        {status === "completed" ? <Check size={15} /> : status === "available" ? <Compass size={15} /> : <LockKeyhole size={13} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold">{meta.title}</span>
        <span className="block truncate text-[9px] text-tp-text-muted/80">{meta.subtitle}</span>
      </span>
    </button>
  );
}

function PassportDrawer({
  level,
  currentLevelId,
  currentMissionId,
  completed,
  rank,
  getMissionStatus,
  onClose,
  onMission,
  onReplayWelcome,
}: {
  level: typeof level1 | typeof level2 | typeof level3Crypto;
  currentLevelId: string;
  currentMissionId: string;
  completed: number;
  rank: string;
  getMissionStatus: (levelId: string, missionId: string) => MissionStatus;
  onClose: () => void;
  onMission: (missionId: string) => void;
  onReplayWelcome: () => void;
}) {
  const progress = level.missions.length > 0 ? Math.round((completed / level.missions.length) * 100) : 0;
  return (
    <div className="absolute inset-0 z-40 flex justify-end bg-[#1E2A44]/30 backdrop-blur-[2px]">
      <aside className="h-full w-full max-w-[440px] overflow-y-auto border-l border-tp-border/80 bg-[linear-gradient(180deg,#ffffff,#eaf4fe)] p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-tp-gold">Documento del jugador</p>
            <h2 className="mt-1 font-display text-2xl font-bold">Pasaporte del Explorador</h2>
          </div>
          <IconButton label="Cerrar pasaporte" onClick={onClose} />
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-tp-border/80 bg-white/[0.04]">
          <div className="bg-[radial-gradient(circle_at_85%_10%,rgba(240,192,64,.22),transparent_40%)] p-5">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-tp-gold/30 bg-tp-gold/10 text-tp-gold"><UserRound size={24} /></span>
              <div>
                <p className="font-display text-lg font-bold">Explorador de Mercados</p>
                <p className="mt-1 font-data text-xs text-tp-info">{rank}</p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between text-[9px] uppercase tracking-widest text-tp-text-muted/80">
              <span>Progreso del distrito</span>
              <span className="font-data text-tp-gold">{progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-tp-base/80">
              <div className="h-full rounded-full bg-gradient-to-r from-tp-gold to-[#ffe889]" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-7 flex items-end justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.18em] text-tp-info">Distrito actual</p>
            <h3 className="mt-1 font-display text-lg font-bold">{level.title}</h3>
          </div>
          <span className="font-data text-[10px] text-tp-text-muted/80">{completed}/{level.missions.length}</span>
        </div>

        <div className="mt-3 space-y-2">
          {level.missions.map((mission, index) => {
            const status = getMissionStatus(currentLevelId, mission.id);
            const active = mission.id === currentMissionId;
            return (
              <button
                key={mission.id}
                type="button"
                disabled={status === "locked"}
                onClick={() => onMission(mission.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                  active
                    ? "border-tp-gold/40 bg-tp-gold/[0.08]"
                    : "border-white/[0.07] bg-white/[0.025] hover:border-tp-border"
                } disabled:cursor-not-allowed disabled:opacity-45`}
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-data text-xs ${
                  status === "completed"
                    ? "bg-tp-demand/10 text-tp-demand"
                    : status === "available"
                      ? "bg-tp-gold/10 text-tp-gold"
                      : "bg-tp-base/60 text-tp-text-muted/80"
                }`}>
                  {status === "completed" ? <Check size={16} /> : status === "locked" ? <LockKeyhole size={14} /> : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold">{mission.title}</span>
                  <span className="mt-0.5 block truncate text-[9px] text-tp-text-muted/80">{mission.subtitle}</span>
                </span>
                {active && <MapPin size={14} className="text-tp-gold" />}
              </button>
            );
          })}
        </div>

        <div className="mt-7 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
          <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-tp-text-muted/80"><Gamepad2 size={13} /> Recuerdos de viaje</p>
          <button type="button" onClick={onReplayWelcome} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-tp-border/80 px-4 py-2.5 text-xs text-tp-text/85 transition hover:border-tp-info/30 hover:text-tp-info">
            <RotateCcw size={14} /> Repetir la bienvenida
          </button>
        </div>
      </aside>
    </div>
  );
}

function IntroPanel({
  panel,
  onClose,
  onStartTokenSearch,
  onEnterAcademy,
}: {
  panel: IntroPanelState;
  onClose: () => void;
  onStartTokenSearch: () => void;
  onEnterAcademy: () => void;
}) {
  const content = {
    "intro-welcome": {
      eyebrow: "ARIA · guía de Mercado Vivo",
      title: "Aquí aprenderás explorando.",
      body: "Cada edificio representa una idea del mercado. Caminarás, hablarás con personajes y resolverás desafíos para abrir nuevas ciudades.",
      action: "Buscar mi primera ficha",
      onAction: onStartTokenSearch,
      icon: <MessageCircle size={14} />,
    },
    "intro-reward": {
      eyebrow: "Primer descubrimiento",
      title: "¡Conseguiste una Ficha de Mercado!",
      body: "Las fichas reconocen acciones importantes dentro del mundo. También recibiste $50 de capital virtual para comenzar tu recorrido.",
      action: "Ir hacia la academia",
      onAction: onClose,
      icon: <Trophy size={14} />,
    },
    "intro-gate": {
      eyebrow: "Destino desbloqueado",
      title: "Academia Ágora te espera.",
      body: "Al otro lado encontrarás Mercado Plaza, el Taller de Velas y el Observatorio de Tendencias.",
      action: "Entrar a Academia Ágora",
      onAction: onEnterAcademy,
      icon: <Sparkles size={14} />,
    },
    "intro-locked": {
      eyebrow: "Puerta de la academia",
      title: "Necesitas demostrar curiosidad.",
      body: "Habla con ARIA y encuentra la ficha dorada escondida en el puerto. Después la puerta reconocerá a tu explorador.",
      action: "Buscar a ARIA",
      onAction: onClose,
      icon: <LockKeyhole size={14} />,
    },
  }[panel.type];

  return (
    <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-2xl rounded-3xl border border-tp-gold/30 bg-[rgba(255,255,255,.97)] p-5 shadow-[0_25px_80px_rgba(30,42,68,.22)] backdrop-blur-xl sm:p-6">
      <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
      <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-gold">{content.icon}{content.eyebrow}</p>
      <h2 className="mt-2 pr-8 font-display text-xl font-bold sm:text-2xl">{content.title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-tp-text-muted">{content.body}</p>
      <button type="button" onClick={content.onAction} className="mt-5 flex items-center gap-2 rounded-2xl bg-tp-gold px-5 py-3 font-display text-sm font-bold text-[#14222a] shadow-[0_12px_34px_rgba(240,192,64,.22)] transition hover:-translate-y-0.5 hover:brightness-110">
        {content.action} <ArrowRight size={15} />
      </button>
    </div>
  );
}

function MarketLessonPanel({
  panel,
  sellerVisited,
  buyerVisited,
  onClose,
  onPractice,
}: {
  panel: MarketPanelState;
  sellerVisited: boolean;
  buyerVisited: boolean;
  onClose: () => void;
  onPractice: () => void;
}) {
  if (panel.type === "market-seller") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-2xl rounded-3xl border border-tp-gold/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-gold"><Coins size={13} /> Elena · vendedora de manzanas</p>
        <h2 className="mt-2 font-display text-xl font-bold">“Hoy puedo ofrecer 12 cestas.”</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">La <strong className="text-tp-text">oferta</strong> es la cantidad que los vendedores quieren y pueden vender a distintos precios. Si llegan más cosechas y la demanda no cambia, competirán por vender y el precio tenderá a bajar.</p>
        <div className="mt-4 rounded-2xl border border-tp-gold/20 bg-tp-gold/[0.06] p-3 text-xs text-tp-gold">Oferta = intención y capacidad de vender.</div>
        <button type="button" onClick={onClose} className="mt-5 flex items-center gap-2 rounded-2xl bg-tp-gold px-5 py-3 font-display text-sm font-bold text-[#14222a]">Entendido, buscar al comprador <ArrowRight size={15} /></button>
      </div>
    );
  }

  if (panel.type === "market-buyer") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-2xl rounded-3xl border border-tp-info/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-info"><UserRound size={13} /> Leo · comprador del barrio</p>
        <h2 className="mt-2 font-display text-xl font-bold">“Necesito 8 cestas para mi restaurante.”</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">La <strong className="text-tp-text">demanda</strong> es la cantidad que los compradores quieren y pueden adquirir a distintos precios. Si aparecen más compradores y la oferta no aumenta, competirán por las cestas y el precio tenderá a subir.</p>
        <div className="mt-4 rounded-2xl border border-tp-info/20 bg-tp-info/[0.06] p-3 text-xs text-tp-info">Demanda = intención y capacidad de comprar.</div>
        <button type="button" onClick={onClose} className="mt-5 flex items-center gap-2 rounded-2xl bg-tp-info px-5 py-3 font-display text-sm font-bold text-[#10202a]">Entendido, revisar el precio <ArrowRight size={15} /></button>
      </div>
    );
  }

  if (panel.type === "market-board") {
    const complete = sellerVisited && buyerVisited;
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-xl rounded-3xl border border-tp-border bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar explicación" onClick={onClose} className="absolute right-3 top-3" />
        <p className="text-[9px] uppercase tracking-[0.18em] text-tp-gold">Pizarra del mercado</p>
        <h2 className="mt-2 font-display text-xl font-bold">$2.00 es un precio de encuentro</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">
          {complete
            ? "No lo decidió una sola persona: apareció donde la cantidad ofrecida por vendedores pudo encontrarse con la cantidad demandada por compradores."
            : "Para comprender por qué existe este precio, todavía necesitas escuchar a Elena y a Leo."}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
          <div className={`rounded-2xl border p-3 ${sellerVisited ? "border-tp-demand/25 bg-tp-demand/5 text-tp-demand" : "border-tp-border/80 text-tp-text-muted/80"}`}>{sellerVisited ? "✓ Oferta comprendida" : "Oferta pendiente"}</div>
          <div className={`rounded-2xl border p-3 ${buyerVisited ? "border-tp-info/25 bg-tp-info/5 text-tp-info" : "border-tp-border/80 text-tp-text-muted/80"}`}>{buyerVisited ? "✓ Demanda comprendida" : "Demanda pendiente"}</div>
        </div>
      </div>
    );
  }

  if (panel.type === "market-practice-locked") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-lg rounded-3xl border border-tp-border bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-text-muted/80"><LockKeyhole size={13} /> Aula cerrada</p>
        <h2 className="mt-2 font-display text-xl font-bold">Observa antes de responder.</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">Habla con Elena y Leo. Cuando hayas comprendido oferta y demanda, la puerta reconocerá tu progreso.</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-xl rounded-3xl border border-tp-demand/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
      <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
      <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-demand"><Check size={13} /> Aula desbloqueada</p>
      <h2 className="mt-2 font-display text-xl font-bold">Ya viste las dos fuerzas del mercado.</h2>
      <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">Ahora demuestra que puedes distinguir quién ofrece, quién demanda y por qué cambia un precio.</p>
      <button type="button" onClick={onPractice} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-tp-gold px-5 py-3 font-display text-sm font-bold text-[#14222a]">Comenzar práctica M1.1 <ArrowRight size={15} /></button>
    </div>
  );
}

function CandleLessonPanelDraft({
  panel,
  ohlcCount,
  conceptCount,
  onClose,
  onPractice,
}: {
  panel: CandlePanelState;
  ohlcCount: number;
  conceptCount: number;
  onClose: () => void;
  onPractice: () => void;
}) {
  const DEMO = { open: 100, high: 110, low: 95, close: 108 };
  const bodyTop = Math.max(DEMO.open, DEMO.close);
  const bodyBottom = Math.min(DEMO.open, DEMO.close);
  const bullish = DEMO.close >= DEMO.open;

  if (panel.type === "candle-open") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-2xl rounded-3xl border border-tp-info/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-info"><Compass size={13} /> Estación Open · Apertura</p>
        <h2 className="mt-2 font-display text-xl font-bold">O = {DEMO.open} · el precio de inicio</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">La <strong className="text-tp-text">apertura (Open)</strong> es el primer precio negociado cuando comienza el período de la vela.</p>
        <button type="button" onClick={onClose} className="mt-5 flex items-center gap-2 rounded-2xl bg-tp-info px-5 py-3 font-display text-sm font-bold text-[#10202a]">Siguiente estación <ArrowRight size={15} /></button>
      </div>
    );
  }

  if (panel.type === "candle-high") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-2xl rounded-3xl border border-tp-gold/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-gold"><Sparkles size={13} /> Estación High · Máximo</p>
        <h2 className="mt-2 font-display text-xl font-bold">H = {DEMO.high} · el techo alcanzado</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">El <strong className="text-tp-text">máximo (High)</strong> es el precio más alto del período y define la mecha superior.</p>
        <button type="button" onClick={onClose} className="mt-5 flex items-center gap-2 rounded-2xl bg-tp-gold px-5 py-3 font-display text-sm font-bold text-[#14222a]">Siguiente estación <ArrowRight size={15} /></button>
      </div>
    );
  }

  if (panel.type === "candle-low") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-2xl rounded-3xl border border-tp-supply/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-supply"><Coins size={13} /> Estación Low · Mínimo</p>
        <h2 className="mt-2 font-display text-xl font-bold">L = {DEMO.low} · el suelo alcanzado</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">El <strong className="text-tp-text">mínimo (Low)</strong> es el precio más bajo del período.</p>
        <button type="button" onClick={onClose} className="mt-5 flex items-center gap-2 rounded-2xl bg-tp-supply px-5 py-3 font-display text-sm font-bold text-tp-text">Siguiente estación <ArrowRight size={15} /></button>
      </div>
    );
  }

  if (panel.type === "candle-close") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-2xl rounded-3xl border border-tp-demand/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-demand"><Check size={13} /> Estación Close · Cierre</p>
        <h2 className="mt-2 font-display text-xl font-bold">C = {DEMO.close} · el veredicto final</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">El <strong className="text-tp-text">cierre (Close)</strong> revela quién ganó: compradores o vendedores.</p>
        <button type="button" onClick={onClose} className="mt-5 flex items-center gap-2 rounded-2xl bg-tp-demand px-5 py-3 font-display text-sm font-bold text-[#10202a]">Explorar la mesa central <ArrowRight size={15} /></button>
      </div>
    );
  }

  if (panel.type === "candle-direction-locked") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-lg rounded-3xl border border-tp-border bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-text-muted/80"><LockKeyhole size={13} /> Estación bloqueada</p>
        <h2 className="mt-2 font-display text-xl font-bold">Primero lee los cuatro precios.</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">Visita Open, High, Low y Close. Progreso: {ohlcCount}/4.</p>
      </div>
    );
  }

  if (panel.type === "candle-direction") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-2xl rounded-3xl border border-tp-demand/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="text-[9px] uppercase tracking-[0.18em] text-tp-demand">Dirección de la vela</p>
        <h2 className="mt-2 font-display text-xl font-bold">{bullish ? "▲ Vela alcista" : "▼ Vela bajista"}</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">C ({DEMO.close}) {bullish ? ">" : "<"} O ({DEMO.open}): vela <strong className={bullish ? "text-tp-demand" : "text-tp-supply"}>{bullish ? "alcista" : "bajista"}</strong>.</p>
        <button type="button" onClick={onClose} className="mt-5 flex items-center gap-2 rounded-2xl bg-tp-gold px-5 py-3 font-display text-sm font-bold text-[#14222a]">Calcular el cuerpo <ArrowRight size={15} /></button>
      </div>
    );
  }

  if (panel.type === "candle-body-locked") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-lg rounded-3xl border border-tp-border bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <h2 className="mt-2 font-display text-xl font-bold">Primero comprende la dirección.</h2>
      </div>
    );
  }

  if (panel.type === "candle-body") {
    const bodySize = Math.abs(DEMO.close - DEMO.open);
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-2xl rounded-3xl border border-tp-gold/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <h2 className="mt-2 font-display text-xl font-bold">Cuerpo = |C − O| = {bodySize}</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">|{DEMO.close} − {DEMO.open}| = {bodySize} puntos de dominio.</p>
        <button type="button" onClick={onClose} className="mt-5 flex items-center gap-2 rounded-2xl bg-tp-gold px-5 py-3 font-display text-sm font-bold text-[#14222a]">Calcular mecha superior <ArrowRight size={15} /></button>
      </div>
    );
  }

  if (panel.type === "candle-upper-wick-locked") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-lg rounded-3xl border border-tp-border bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <h2 className="mt-2 font-display text-xl font-bold">Primero calcula el cuerpo.</h2>
      </div>
    );
  }

  if (panel.type === "candle-upper-wick") {
    const upperWick = DEMO.high - bodyTop;
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-2xl rounded-3xl border border-tp-info/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <h2 className="mt-2 font-display text-xl font-bold">Mecha sup. = {upperWick}</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">{DEMO.high} − max(O,C) = {upperWick}.</p>
        <button type="button" onClick={onClose} className="mt-5 flex items-center gap-2 rounded-2xl bg-tp-info px-5 py-3 font-display text-sm font-bold text-[#10202a]">Calcular mecha inferior <ArrowRight size={15} /></button>
      </div>
    );
  }

  if (panel.type === "candle-lower-wick-locked") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-lg rounded-3xl border border-tp-border bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <h2 className="mt-2 font-display text-xl font-bold">Primero calcula la mecha superior.</h2>
      </div>
    );
  }

  if (panel.type === "candle-lower-wick") {
    const lowerWick = bodyBottom - DEMO.low;
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-2xl rounded-3xl border border-tp-supply/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <h2 className="mt-2 font-display text-xl font-bold">Mecha inf. = {lowerWick}</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">min(O,C) − L = {bodyBottom} − {DEMO.low} = {lowerWick}.</p>
        <button type="button" onClick={onClose} className="mt-5 flex items-center gap-2 rounded-2xl bg-tp-demand px-5 py-3 font-display text-sm font-bold text-[#10202a]">¡Vela completa! <ArrowRight size={15} /></button>
      </div>
    );
  }

  if (panel.type === "candle-practice-locked") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-lg rounded-3xl border border-tp-border bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <h2 className="mt-2 font-display text-xl font-bold">Construye la vela antes de responder.</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">OHLC: {ohlcCount}/4 · Conceptos: {conceptCount}/4.</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-xl rounded-3xl border border-tp-demand/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
      <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
      <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-demand"><Check size={13} /> Evaluación desbloqueada</p>
      <h2 className="mt-2 font-display text-xl font-bold">Ya construiste tu primera vela.</h2>
      <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">Demuestra que puedes calcular dirección, cuerpo y mechas tú mismo.</p>
      <button type="button" onClick={onPractice} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-tp-gold px-5 py-3 font-display text-sm font-bold text-[#14222a]">Comenzar evaluación M1.2 <ArrowRight size={15} /></button>
    </div>
  );
}

function AcademyPanel({
  panel,
  getMissionStatus,
  onClose,
  onMission,
  onEnterMarket,
  onEnterCandleWorkshop,
}: {
  panel: AcademyPanelState;
  getMissionStatus: (levelId: string, missionId: string) => MissionStatus;
  onClose: () => void;
  onMission: (missionId: string) => void;
  onEnterMarket: () => void;
  onEnterCandleWorkshop: () => void;
}) {
  if (panel.type === "aria") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-2xl rounded-3xl border border-tp-info/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-info"><MessageCircle size={13} /> ARIA · guía de la academia</p>
        <h2 className="mt-2 font-display text-xl font-bold">Elige un edificio y aprende haciendo.</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">Mercado Plaza explica quién participa. El Taller de Velas convierte precios en una vela. El Observatorio enseña a reconocer estructura y tendencia.</p>
        <button type="button" onClick={onEnterMarket} className="mt-5 flex items-center gap-2 rounded-2xl bg-tp-gold px-5 py-3 font-display text-sm font-bold text-[#14222a]">
          Entrar a Mercado Plaza <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  if (panel.type === "portal") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-xl rounded-3xl border border-tp-crypto/25 bg-[rgba(19,13,8,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="font-data text-xs font-bold text-tp-crypto">₿ PORTAL DE ESPECIALIZACIÓN</p>
        <h2 className="mt-2 font-display text-xl font-bold">Ciudad Bitcoin permanece cerrada</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">Completa los fundamentos y el Gran Tour. El portal se activará cuando elijas la ruta cripto.</p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-tp-border/40">
          <div className="h-full w-1/5 rounded-full bg-gradient-to-r from-orange-500 to-yellow-300" />
        </div>
      </div>
    );
  }

  const meta = MISSION_META[panel.missionId];
  const status = getMissionStatus("level_1", panel.missionId);
  return (
    <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-xl rounded-3xl border border-tp-gold/25 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
      <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
      <p className="text-[9px] uppercase tracking-[0.18em] text-tp-gold">Edificio educativo · {panel.missionId.toUpperCase()}</p>
      <h2 className="mt-2 font-display text-xl font-bold">{meta.title}</h2>
      <p className="mt-1 text-sm text-tp-text-muted/80">{meta.subtitle}</p>
      <div className={`mt-4 rounded-2xl border p-3 ${status === "locked" ? "border-tp-border/80 bg-white/[0.025]" : status === "completed" ? "border-tp-demand/25 bg-tp-demand/5" : "border-tp-gold/25 bg-tp-gold/5"}`}>
        <p className="text-xs font-semibold">{status === "locked" ? "Edificio bloqueado" : status === "completed" ? "Misión completada · puedes repetirla" : "Misión disponible"}</p>
        <p className="mt-1 text-[10px] text-tp-text/42">{status === "locked" ? "Completa el edificio anterior para recibir acceso." : "Tu progreso quedará guardado en el Pasaporte del Explorador."}</p>
      </div>
      <button type="button" disabled={status === "locked"} onClick={
        panel.missionId === "m1_1"
          ? onEnterMarket
          : panel.missionId === "m1_2"
            ? onEnterCandleWorkshop
            : () => onMission(panel.missionId)
      } className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-tp-gold px-4 py-3 font-display text-sm font-bold text-[#14222a] disabled:cursor-not-allowed disabled:opacity-35">
        {status === "locked" ? <LockKeyhole size={15} /> : <BookOpenCheck size={15} />}
        {panel.missionId === "m1_1"
          ? "Entrar a Mercado Plaza"
          : panel.missionId === "m1_2"
            ? "Entrar al Taller de Velas"
            : status === "completed"
              ? "Repetir misión"
              : "Entrar a la misión"}
      </button>
    </div>
  );
}

function CandleLessonPanel({
  panel,
  ohlcCount,
  conceptCount,
  onClose,
  onPractice,
}: {
  panel: CandlePanelState;
  ohlcCount: number;
  conceptCount: number;
  onClose: () => void;
  onPractice: () => void;
}) {
  const DEMO = { open: 100, high: 110, low: 95, close: 108 };
  const bodyTop = Math.max(DEMO.open, DEMO.close);
  const bodyBottom = Math.min(DEMO.open, DEMO.close);
  const bullish = DEMO.close >= DEMO.open;

  if (panel.type === "candle-open") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-2xl rounded-3xl border border-tp-info/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-info"><Compass size={13} /> Estación Open · Apertura</p>
        <h2 className="mt-2 font-display text-xl font-bold">O = {DEMO.open} · el precio de inicio</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">La <strong className="text-tp-text">apertura (Open)</strong> es el primer precio negociado cuando comienza el período de la vela. Marca el punto de partida de la batalla entre compradores y vendedores.</p>
        <div className="mt-4 rounded-2xl border border-tp-info/20 bg-tp-info/[0.06] p-3 font-data text-xs text-tp-info">Open = precio al abrir el período temporal.</div>
        <button type="button" onClick={onClose} className="mt-5 flex items-center gap-2 rounded-2xl bg-tp-info px-5 py-3 font-display text-sm font-bold text-[#10202a]">Siguiente estación <ArrowRight size={15} /></button>
      </div>
    );
  }

  if (panel.type === "candle-high") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-2xl rounded-3xl border border-tp-gold/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-gold"><Sparkles size={13} /> Estación High · Máximo</p>
        <h2 className="mt-2 font-display text-xl font-bold">H = {DEMO.high} · el techo alcanzado</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">El <strong className="text-tp-text">máximo (High)</strong> es el precio más alto que alcanzó el activo durante el período. Define la mecha superior de la vela.</p>
        <div className="mt-4 rounded-2xl border border-tp-gold/20 bg-tp-gold/[0.06] p-3 font-data text-xs text-tp-gold">High = precio más alto del período.</div>
        <button type="button" onClick={onClose} className="mt-5 flex items-center gap-2 rounded-2xl bg-tp-gold px-5 py-3 font-display text-sm font-bold text-[#14222a]">Siguiente estación <ArrowRight size={15} /></button>
      </div>
    );
  }

  if (panel.type === "candle-low") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-2xl rounded-3xl border border-tp-supply/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-supply"><Coins size={13} /> Estación Low · Mínimo</p>
        <h2 className="mt-2 font-display text-xl font-bold">L = {DEMO.low} · el suelo alcanzado</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">El <strong className="text-tp-text">mínimo (Low)</strong> es el precio más bajo del período. Los vendedores no lograron empujar el precio más abajo de este punto.</p>
        <div className="mt-4 rounded-2xl border border-tp-supply/20 bg-tp-supply/[0.06] p-3 font-data text-xs text-tp-supply">Low = precio más bajo del período.</div>
        <button type="button" onClick={onClose} className="mt-5 flex items-center gap-2 rounded-2xl bg-tp-supply px-5 py-3 font-display text-sm font-bold text-tp-text">Siguiente estación <ArrowRight size={15} /></button>
      </div>
    );
  }

  if (panel.type === "candle-close") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-2xl rounded-3xl border border-tp-demand/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-demand"><Check size={13} /> Estación Close · Cierre</p>
        <h2 className="mt-2 font-display text-xl font-bold">C = {DEMO.close} · el veredicto final</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">El <strong className="text-tp-text">cierre (Close)</strong> es el último precio negociado. Comparado con la apertura, revela quién ganó la batalla: compradores o vendedores.</p>
        <div className="mt-4 rounded-2xl border border-tp-demand/20 bg-tp-demand/[0.06] p-3 font-data text-xs text-tp-demand">Close = precio al cerrar el período.</div>
        <button type="button" onClick={onClose} className="mt-5 flex items-center gap-2 rounded-2xl bg-tp-demand px-5 py-3 font-display text-sm font-bold text-[#10202a]">Explorar la mesa central <ArrowRight size={15} /></button>
      </div>
    );
  }

  if (panel.type === "candle-direction-locked") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-lg rounded-3xl border border-tp-border bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-text-muted/80"><LockKeyhole size={13} /> Estación bloqueada</p>
        <h2 className="mt-2 font-display text-xl font-bold">Primero lee los cuatro precios.</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">Visita Open, High, Low y Close antes de calcular la dirección. Progreso: {ohlcCount}/4.</p>
      </div>
    );
  }

  if (panel.type === "candle-direction") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-2xl rounded-3xl border border-tp-demand/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="text-[9px] uppercase tracking-[0.18em] text-tp-demand">Dirección de la vela</p>
        <h2 className="mt-2 font-display text-xl font-bold">{bullish ? "▲ Vela alcista" : "▼ Vela bajista"}</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">Como C ({DEMO.close}) {bullish ? ">" : "<"} O ({DEMO.open}), esta vela es <strong className={bullish ? "text-tp-demand" : "text-tp-supply"}>{bullish ? "alcista (verde)" : "bajista (roja)"}</strong>. Los compradores {bullish ? "ganaron" : "perdieron"} el período.</p>
        <button type="button" onClick={onClose} className="mt-5 flex items-center gap-2 rounded-2xl bg-tp-gold px-5 py-3 font-display text-sm font-bold text-[#14222a]">Calcular el cuerpo <ArrowRight size={15} /></button>
      </div>
    );
  }

  if (panel.type === "candle-body-locked") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-lg rounded-3xl border border-tp-border bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-text-muted/80"><LockKeyhole size={13} /> Estación bloqueada</p>
        <h2 className="mt-2 font-display text-xl font-bold">Primero comprende la dirección.</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">Visita la estación de dirección antes de calcular el cuerpo.</p>
      </div>
    );
  }

  if (panel.type === "candle-body") {
    const bodySize = Math.abs(DEMO.close - DEMO.open);
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-2xl rounded-3xl border border-tp-gold/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="text-[9px] uppercase tracking-[0.18em] text-tp-gold">Cuerpo de la vela</p>
        <h2 className="mt-2 font-display text-xl font-bold">Cuerpo = |C − O| = {bodySize}</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">El cuerpo es la distancia entre apertura y cierre. Un cuerpo grande indica dominio claro; uno pequeño, indecisión.</p>
        <div className="mt-4 rounded-2xl border border-tp-gold/20 bg-tp-gold/[0.06] p-3 font-data text-xs text-tp-gold">|{DEMO.close} − {DEMO.open}| = {bodySize} puntos</div>
        <button type="button" onClick={onClose} className="mt-5 flex items-center gap-2 rounded-2xl bg-tp-gold px-5 py-3 font-display text-sm font-bold text-[#14222a]">Calcular mecha superior <ArrowRight size={15} /></button>
      </div>
    );
  }

  if (panel.type === "candle-upper-wick-locked") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-lg rounded-3xl border border-tp-border bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-text-muted/80"><LockKeyhole size={13} /> Estación bloqueada</p>
        <h2 className="mt-2 font-display text-xl font-bold">Primero calcula el cuerpo.</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">Comprende el cuerpo antes de medir las mechas.</p>
      </div>
    );
  }

  if (panel.type === "candle-upper-wick") {
    const upperWick = DEMO.high - bodyTop;
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-2xl rounded-3xl border border-tp-info/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="text-[9px] uppercase tracking-[0.18em] text-tp-info">Mecha superior</p>
        <h2 className="mt-2 font-display text-xl font-bold">Mecha sup. = H − max(O,C) = {upperWick}</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">La mecha superior muestra cuánto subió el precio antes de retroceder. {DEMO.high} − {bodyTop} = {upperWick}.</p>
        <button type="button" onClick={onClose} className="mt-5 flex items-center gap-2 rounded-2xl bg-tp-info px-5 py-3 font-display text-sm font-bold text-[#10202a]">Calcular mecha inferior <ArrowRight size={15} /></button>
      </div>
    );
  }

  if (panel.type === "candle-lower-wick-locked") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-lg rounded-3xl border border-tp-border bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-text-muted/80"><LockKeyhole size={13} /> Estación bloqueada</p>
        <h2 className="mt-2 font-display text-xl font-bold">Primero calcula la mecha superior.</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">Sigue el orden: dirección → cuerpo → mecha superior → mecha inferior.</p>
      </div>
    );
  }

  if (panel.type === "candle-lower-wick") {
    const lowerWick = bodyBottom - DEMO.low;
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-2xl rounded-3xl border border-tp-supply/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="text-[9px] uppercase tracking-[0.18em] text-tp-supply">Mecha inferior</p>
        <h2 className="mt-2 font-display text-xl font-bold">Mecha inf. = min(O,C) − L = {lowerWick}</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">La mecha inferior muestra cuánto bajó el precio antes de recuperarse. {bodyBottom} − {DEMO.low} = {lowerWick}.</p>
        <button type="button" onClick={onClose} className="mt-5 flex items-center gap-2 rounded-2xl bg-tp-demand px-5 py-3 font-display text-sm font-bold text-[#10202a]">¡Vela completa! <ArrowRight size={15} /></button>
      </div>
    );
  }

  if (panel.type === "candle-practice-locked") {
    return (
      <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-lg rounded-3xl border border-tp-border bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-text-muted/80"><LockKeyhole size={13} /> Evaluación cerrada</p>
        <h2 className="mt-2 font-display text-xl font-bold">Construye la vela antes de responder.</h2>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">OHLC: {ohlcCount}/4 · Conceptos: {conceptCount}/4. Completa todas las estaciones para desbloquear la evaluación.</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-x-3 bottom-20 z-30 mx-auto max-w-xl rounded-3xl border border-tp-demand/30 bg-[rgba(255,255,255,.97)] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
      <IconButton label="Cerrar diálogo" onClick={onClose} className="absolute right-3 top-3" />
      <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-demand"><Check size={13} /> Evaluación desbloqueada</p>
      <h2 className="mt-2 font-display text-xl font-bold">Ya construiste tu primera vela.</h2>
      <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">Comprendiste Open, High, Low, Close, dirección, cuerpo y mechas. Ahora demuestra que puedes calcularlos tú mismo.</p>
      <button type="button" onClick={onPractice} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-tp-gold px-5 py-3 font-display text-sm font-bold text-[#14222a]">Comenzar evaluación M1.2 <ArrowRight size={15} /></button>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  className = "",
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={`rounded-xl p-2 text-tp-text-muted/80 transition hover:bg-tp-base/60 hover:text-tp-text ${className}`}>
      <X size={16} />
    </button>
  );
}
