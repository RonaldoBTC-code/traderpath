"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  Compass,
  LockKeyhole,
  Map,
  MapPin,
  MessageCircle,
  Palette,
  Sparkles,
  X,
} from "lucide-react";
import { useGameStore, type MissionStatus } from "@/store/gameStore";
import {
  ACADEMY_GAME_EVENTS,
  type AcademyTarget,
  type AcademyWorldEvent,
} from "@/game/phaser/worldEvents";

interface GameHandle {
  destroy: (removeCanvas?: boolean, noReturn?: boolean) => void;
  events: { emit: (event: string, ...args: unknown[]) => boolean };
}

type OpenPanel =
  | { type: "aria" }
  | { type: "mission"; missionId: "m1_1" | "m1_2" | "m1_3" }
  | { type: "portal" }
  | null;

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

export default function AcademyWorld() {
  const router = useRouter();
  const mountRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameHandle | null>(null);
  const [ready, setReady] = useState(false);
  const [moving, setMoving] = useState(false);
  const [prompt, setPrompt] = useState("Preparando Academia Ágora…");
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const { getMissionStatus, completedMissions } = useGameStore();

  const statusM11 = getMissionStatus("level_1", "m1_1");
  const statusM12 = getMissionStatus("level_1", "m1_2");
  const statusM13 = getMissionStatus("level_1", "m1_3");
  const completedFoundation = completedMissions.filter((mission) => mission.levelId === "level_1").length;

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
    if (event.target === "aria") setOpenPanel({ type: "aria" });
    if (event.target === "market-plaza") setOpenPanel({ type: "mission", missionId: "m1_1" });
    if (event.target === "candle-workshop") setOpenPanel({ type: "mission", missionId: "m1_2" });
    if (event.target === "trend-observatory") setOpenPanel({ type: "mission", missionId: "m1_3" });
    if (event.target === "bitcoin-portal") setOpenPanel({ type: "portal" });
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    let disposed = false;

    void import("@/game/phaser/createAcademyGame").then(({ createAcademyGame }) => {
      if (disposed || !mountRef.current) return;
      gameRef.current = createAcademyGame(mountRef.current, handleWorldEvent) as GameHandle;
    });

    return () => {
      disposed = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [handleWorldEvent]);

  const focusTarget = (target: AcademyTarget) => {
    setMapOpen(false);
    gameRef.current?.events.emit(ACADEMY_GAME_EVENTS.focusTarget, target);
  };

  const chooseAvatarColor = (color: string) => {
    setAvatarColor(color);
    gameRef.current?.events.emit(ACADEMY_GAME_EVENTS.avatarColor, color);
  };

  const openMission = (missionId: "m1_1" | "m1_2" | "m1_3") => {
    const status = getMissionStatus("level_1", missionId);
    if (status === "locked") return;
    router.push(`/mission/${missionId}`);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-tp-info">Primer mundo jugable · vertical slice</p>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Academia Ágora</h1>
          <p className="mt-1 max-w-2xl text-sm text-tp-text-muted">Camina, habla con ARIA y entra en los edificios para aprender. Haz clic sobre el suelo o un punto de interés.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-tp-gold/20 bg-tp-gold/[0.07] px-3 py-2">
          <Sparkles size={14} className="text-tp-gold" />
          <span className="font-data text-xs text-tp-gold">{completedFoundation}/5 fundamentos</span>
        </div>
      </div>

      <div className="relative h-[400px] overflow-hidden rounded-[28px] border border-white/10 bg-[#101b24] shadow-[0_30px_100px_rgba(0,0,0,.45)] sm:aspect-video sm:h-auto sm:min-h-[520px] sm:max-h-[720px]">
        <div ref={mountRef} className="absolute inset-0 overflow-hidden [&_canvas]:!block" aria-label="Mundo jugable Academia Ágora" />

        {!ready && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-[#0a1018]">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-tp-gold/20 border-t-tp-gold" />
              <p className="mt-3 text-xs text-tp-text-muted">Construyendo la ciudad…</p>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-[280px] rounded-2xl border border-white/15 bg-[#07101d]/75 p-3 shadow-xl backdrop-blur-md">
          <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-tp-gold">
            <BookOpenCheck size={12} /> Objetivo actual
          </p>
          <p className="mt-1 text-xs font-semibold text-white">Habla con ARIA y visita el Taller de Velas</p>
        </div>

        <div className="pointer-events-none absolute right-4 top-4 z-10 hidden rounded-2xl border border-white/15 bg-[#07101d]/70 px-3 py-2 text-right backdrop-blur-md sm:block">
          <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.15em] text-white/55"><MapPin size={11} /> Distrito central</p>
          <p className="mt-0.5 font-data text-[10px] text-tp-info">{moving ? "Caminando…" : "Explorando"}</p>
        </div>

        <div className="absolute inset-x-0 bottom-3 z-10 flex items-end justify-between gap-2 px-3 sm:px-4">
          <button
            type="button"
            onClick={() => setMapOpen((current) => !current)}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-[#07101d]/80 text-white shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:border-tp-gold/50 hover:text-tp-gold"
            aria-label="Abrir mapa de Academia Ágora"
          >
            <Map size={18} />
          </button>

          <div className="pointer-events-none max-w-[540px] flex-1 rounded-full border border-white/15 bg-[rgba(7,16,29,0.78)] px-4 py-2 text-center text-[10px] text-white/75 shadow-lg backdrop-blur">
            {prompt}
          </div>

          <button
            type="button"
            onClick={() => setPaletteOpen((current) => !current)}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-[#07101d]/80 text-white shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:border-tp-info/50 hover:text-tp-info"
            aria-label="Personalizar avatar"
          >
            <Palette size={18} />
          </button>
        </div>

        {mapOpen && (
          <div className="absolute bottom-16 left-3 z-30 w-[min(360px,calc(100%-24px))] rounded-2xl border border-white/15 bg-[rgba(7,16,29,0.95)] p-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.18em] text-tp-info">Mapa de la academia</p>
                <p className="font-display text-sm font-bold">Distritos de aprendizaje</p>
              </div>
              <button type="button" onClick={() => setMapOpen(false)} className="rounded-lg p-1.5 text-tp-text-muted hover:bg-white/5 hover:text-white" aria-label="Cerrar mapa"><X size={15} /></button>
            </div>
            <div className="mt-3 space-y-2">
              <MapDestination meta={MISSION_META.m1_1} status={statusM11} onClick={() => focusTarget("market-plaza")} />
              <MapDestination meta={MISSION_META.m1_2} status={statusM12} onClick={() => focusTarget("candle-workshop")} />
              <MapDestination meta={MISSION_META.m1_3} status={statusM13} onClick={() => focusTarget("trend-observatory")} />
              <button type="button" onClick={() => focusTarget("bitcoin-portal")} className="flex w-full items-center gap-3 rounded-xl border border-orange-300/15 bg-orange-400/5 p-3 text-left hover:border-orange-300/30">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-orange-400/10 font-data font-bold text-orange-300">₿</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold">Portal Bitcoin</span>
                  <span className="block truncate text-[9px] text-tp-text-muted">Ciudad especializada · bloqueada</span>
                </span>
                <LockKeyhole size={13} className="text-tp-text-muted" />
              </button>
            </div>
          </div>
        )}

        {paletteOpen && (
          <div className="absolute bottom-16 right-3 z-30 rounded-2xl border border-white/15 bg-[rgba(7,16,29,0.95)] p-3 shadow-2xl backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between gap-5">
              <p className="text-[9px] uppercase tracking-[0.16em] text-tp-info">Color del explorador</p>
              <button type="button" onClick={() => setPaletteOpen(false)} className="text-tp-text-muted hover:text-white" aria-label="Cerrar personalización"><X size={14} /></button>
            </div>
            <div className="flex gap-2">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => chooseAvatarColor(color)}
                  aria-label={`Usar color ${color}`}
                  aria-pressed={avatarColor === color}
                  className={`h-9 w-9 rounded-xl border-2 transition hover:scale-105 ${avatarColor === color ? "border-white" : "border-transparent"}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {openPanel && (
          <WorldPanel
            panel={openPanel}
            getMissionStatus={getMissionStatus}
            onClose={() => setOpenPanel(null)}
            onMission={openMission}
          />
        )}
      </div>

      <p className="text-center text-[10px] text-tp-text-muted">
        Prototipo original inspirado en la navegación social por salas. No utiliza personajes ni recursos de Club Penguin.
      </p>
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
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-left transition hover:border-tp-gold/25 hover:bg-white/[0.045]">
      <span className={`grid h-9 w-9 place-items-center rounded-lg ${status === "completed" ? "bg-tp-demand/10 text-tp-demand" : status === "available" ? "bg-tp-gold/10 text-tp-gold" : "bg-white/5 text-tp-text-muted"}`}>
        {status === "completed" ? <Check size={15} /> : status === "available" ? <Compass size={15} /> : <LockKeyhole size={13} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold">{meta.title}</span>
        <span className="block truncate text-[9px] text-tp-text-muted">{meta.subtitle}</span>
      </span>
    </button>
  );
}

function WorldPanel({
  panel,
  getMissionStatus,
  onClose,
  onMission,
}: {
  panel: Exclude<OpenPanel, null>;
  getMissionStatus: (levelId: string, missionId: string) => MissionStatus;
  onClose: () => void;
  onMission: (missionId: "m1_1" | "m1_2" | "m1_3") => void;
}) {
  if (panel.type === "aria") {
    return (
      <div className="absolute inset-x-3 bottom-16 z-40 mx-auto max-w-2xl rounded-2xl border border-tp-info/30 bg-[rgba(7,16,29,0.96)] p-5 shadow-2xl backdrop-blur-xl">
        <PanelClose onClose={onClose} />
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-tp-info"><MessageCircle size={13} /> ARIA · guía de la academia</p>
        <p className="mt-2 font-display text-lg font-bold">Bienvenido a Ágora, explorador.</p>
        <p className="mt-2 text-sm leading-relaxed text-tp-text-muted">
          Aquí no avanzas leyendo una lista. Caminas hasta el lugar que representa el concepto, practicas y demuestras lo aprendido. Empieza por Mercado Plaza; después te abriré el Taller de Velas.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => onMission("m1_1")} className="flex items-center gap-2 rounded-xl bg-tp-gold px-4 py-2 font-display text-xs font-bold text-tp-base">
            Ir a la primera misión <ArrowRight size={14} />
          </button>
          <button type="button" onClick={onClose} className="rounded-xl border border-tp-border px-4 py-2 text-xs text-tp-text-muted">Seguir explorando</button>
        </div>
      </div>
    );
  }

  if (panel.type === "portal") {
    return (
      <div className="absolute inset-x-3 bottom-16 z-40 mx-auto max-w-xl rounded-2xl border border-orange-300/25 bg-[rgba(19,13,8,0.96)] p-5 shadow-2xl backdrop-blur-xl">
        <PanelClose onClose={onClose} />
        <p className="font-data text-xs font-bold text-orange-300">₿ PORTAL DE ESPECIALIZACIÓN</p>
        <h2 className="mt-2 font-display text-xl font-bold">Ciudad Bitcoin permanece cerrada</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/60">Primero completa los fundamentos universales y el Gran Tour. El portal se activará cuando hayas elegido la ruta cripto.</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/5 rounded-full bg-gradient-to-r from-orange-500 to-yellow-300" />
        </div>
      </div>
    );
  }

  const meta = MISSION_META[panel.missionId];
  const status = getMissionStatus("level_1", panel.missionId);
  return (
    <div className="absolute inset-x-3 bottom-16 z-40 mx-auto max-w-xl rounded-2xl border border-tp-gold/25 bg-[rgba(7,16,29,0.96)] p-5 shadow-2xl backdrop-blur-xl">
      <PanelClose onClose={onClose} />
      <p className="text-[9px] uppercase tracking-[0.18em] text-tp-gold">Edificio educativo · {panel.missionId.toUpperCase()}</p>
      <h2 className="mt-2 font-display text-xl font-bold">{meta.title}</h2>
      <p className="mt-1 text-sm text-tp-text-muted">{meta.subtitle}</p>
      <div className={`mt-4 rounded-xl border p-3 ${status === "locked" ? "border-white/10 bg-white/[0.025]" : status === "completed" ? "border-tp-demand/25 bg-tp-demand/5" : "border-tp-gold/25 bg-tp-gold/5"}`}>
        <p className="text-xs font-semibold">
          {status === "locked" ? "Edificio bloqueado" : status === "completed" ? "Misión completada · puedes repetirla" : "Misión disponible"}
        </p>
        <p className="mt-1 text-[10px] text-tp-text-muted">
          {status === "locked" ? "Completa el edificio anterior para recibir acceso." : "La práctica se abrirá sin abandonar tu progreso actual."}
        </p>
      </div>
      <button
        type="button"
        disabled={status === "locked"}
        onClick={() => onMission(panel.missionId)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-tp-gold px-4 py-3 font-display text-sm font-bold text-tp-base disabled:cursor-not-allowed disabled:opacity-35"
      >
        {status === "locked" ? <LockKeyhole size={15} /> : <BookOpenCheck size={15} />}
        {status === "completed" ? "Repetir misión" : "Entrar a la misión"}
      </button>
    </div>
  );
}

function PanelClose({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" onClick={onClose} aria-label="Cerrar diálogo" className="absolute right-3 top-3 rounded-lg p-1.5 text-tp-text-muted transition hover:bg-white/5 hover:text-white">
      <X size={16} />
    </button>
  );
}
