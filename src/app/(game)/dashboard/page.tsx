"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Coins,
  FlaskConical,
  LockKeyhole,
  Medal,
  Play,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { level1 } from "@/lib/content/level1";
import { level2 } from "@/lib/content/level2";
import { level3Crypto } from "@/lib/content/level3-crypto";
import BitcoinCityMap from "@/components/game/BitcoinCityMap";
import WorldHero from "@/components/game/WorldHero";

export default function DashboardPage() {
  const hasMounted = useHasMounted();
  const {
    xp,
    virtualCapital,
    rank,
    currentLevelId,
    currentMissionId,
    completedMissions,
    getMissionStatus,
    resetProgress,
  } = useGameStore();

  if (!hasMounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-[380px] rounded-3xl bg-tp-surface" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => <div key={item} className="h-24 rounded-2xl bg-tp-surface" />)}
        </div>
      </div>
    );
  }

  const currentLevel = currentLevelId === "level_2"
    ? level2
    : currentLevelId === "level_3_crypto"
      ? level3Crypto
      : level1;
  const missions = currentLevel.missions;
  const bitcoinOnboardingRequired = currentLevelId === "level_3_crypto"
    && !completedMissions.some((mission) => mission.levelId === "level_3_crypto" && mission.missionId === "m3c_0");
  const currentMission = bitcoinOnboardingRequired
    ? missions.find((mission) => mission.id === "m3c_0")
    : missions.find((mission) => mission.id === currentMissionId);
  const completedInLevel = completedMissions.filter((mission) => mission.levelId === currentLevelId).length;
  const simulatorUnlocked = completedMissions.some((mission) => mission.levelId === "level_1" && mission.missionId === "m1_4");

  const stats = [
    { label: "Capital", value: formatCurrency(virtualCapital), icon: Coins, color: "text-tp-demand", border: "hover:border-tp-demand/25" },
    { label: "Experiencia", value: `${formatNumber(xp)} XP`, icon: Sparkles, color: "text-tp-gold", border: "hover:border-tp-gold/25" },
    { label: "Rango", value: rank, icon: Medal, color: "text-tp-info", border: "hover:border-tp-info/25" },
    { label: "Progreso", value: `${completedInLevel}/${missions.length}`, icon: Trophy, color: "text-tp-text", border: "hover:border-tp-gold/25" },
  ];

  return (
    <div className="space-y-7">
      <WorldHero
        levelTitle={currentLevel.title}
        tagline={currentLevel.tagline}
        currentMissionId={currentMission?.id}
        completed={completedInLevel}
        total={missions.length}
      />

      {currentLevelId === "level_3_crypto" && (
        <BitcoinCityMap status={getMissionStatus("level_3_crypto", "m3c_0")} />
      )}

      <section aria-label="Estado del jugador" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={`tp-panel group rounded-2xl p-4 transition hover:-translate-y-0.5 ${border}`}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest text-tp-text-muted">{label}</p>
              <Icon size={16} className={`${color} opacity-70`} />
            </div>
            <p className={`mt-2 truncate font-data text-xl ${color}`}>{value}</p>
            {label === "Progreso" && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-tp-base">
                <div className="h-full rounded-full bg-tp-gold" style={{ width: `${(completedInLevel / missions.length) * 100}%` }} />
              </div>
            )}
          </div>
        ))}
      </section>

      {currentMission && (
        <section className="relative overflow-hidden rounded-3xl border border-tp-gold/20 bg-[linear-gradient(110deg,rgba(240,192,64,.12),rgba(19,24,39,.92)_45%)] p-5 shadow-gold sm:p-6">
          <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-tp-gold/10 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tp-gold text-tp-base shadow-[0_10px_25px_rgba(240,192,64,.2)] sm:flex">
                <Target size={22} />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-tp-gold">Objetivo activo</p>
                <h2 className="mt-1 font-display text-xl font-bold">{currentMission.title}</h2>
                <p className="mt-1 text-sm text-tp-text-muted">{currentMission.subtitle}</p>
                <p className="mt-2 font-data text-xs text-tp-text-muted">
                  +{currentMission.rewards.xp} XP · +{formatCurrency(currentMission.rewards.virtualCapital + (currentMission.minigame?.virtualCapitalReward ?? 0))}
                </p>
              </div>
            </div>
            <Link href={`/mission/${currentMission.id}`} className="flex items-center gap-2 rounded-2xl bg-tp-gold px-5 py-3 font-display font-bold text-tp-base transition hover:-translate-y-0.5 hover:brightness-110">
              <Play size={16} fill="currentColor" /> Jugar misión
            </Link>
          </div>
        </section>
      )}

      <section className="tp-panel rounded-3xl p-5 sm:p-7">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-tp-info">Tu travesía</p>
            <h2 className="mt-1 font-display text-2xl font-bold">Ruta de aprendizaje</h2>
          </div>
          <span className="hidden text-xs text-tp-text-muted sm:block">{completedInLevel} de {missions.length} hitos</span>
        </div>
        <div className="relative space-y-3 before:absolute before:bottom-7 before:left-[21px] before:top-7 before:w-px before:bg-gradient-to-b before:from-tp-demand before:via-tp-gold/60 before:to-tp-border">
          {missions.map((mission) => {
            const status = getMissionStatus(currentLevelId, mission.id);
            const stateClasses = {
              completed: "border-tp-demand/20 bg-tp-demand/[0.045]",
              available: "border-tp-gold/40 bg-tp-gold/[0.07] shadow-gold",
              locked: "border-white/[0.05] bg-tp-base/35 text-tp-text-muted cursor-not-allowed",
            };
            const content = (
              <>
                <span className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                  status === "completed"
                    ? "border-tp-demand/50 bg-[#102a24] text-tp-demand"
                    : status === "available"
                      ? "border-tp-gold bg-[#302a17] text-tp-gold shadow-[0_0_24px_rgba(240,192,64,.15)]"
                      : "border-tp-border bg-[#0d1220] text-tp-text-muted"
                }`}>
                  {status === "completed" ? <Check size={19} strokeWidth={2.5} /> : status === "available" ? <Play size={17} fill="currentColor" /> : <LockKeyhole size={16} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{mission.title}</span>
                  <span className="block truncate text-xs text-tp-text-muted">{mission.subtitle}</span>
                </span>
                {status === "available" && <span className="hidden items-center gap-1 font-data text-xs text-tp-gold sm:flex">+{mission.rewards.xp} XP <ArrowRight size={14} /></span>}
                {status === "completed" && <span className="hidden text-xs text-tp-demand sm:block">Completada</span>}
              </>
            );
            const classes = `relative flex items-center gap-4 rounded-2xl border px-3 py-4 transition sm:px-4 ${stateClasses[status]}`;

            return status === "available"
              ? <Link key={mission.id} href={`/mission/${mission.id}`} className={`${classes} hover:-translate-y-0.5 hover:brightness-110`}>{content}</Link>
              : <div key={mission.id} className={classes}>{content}</div>;
          })}
        </div>
      </section>

      <section className={`rounded-3xl border p-6 ${simulatorUnlocked ? "border-tp-info/30 bg-[linear-gradient(120deg,rgba(96,165,250,.10),rgba(19,24,39,.9))] shadow-info" : "border-tp-border bg-tp-surface opacity-70"}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-tp-info/25 bg-tp-info/10 text-tp-info sm:flex"><FlaskConical size={21} /></span>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-tp-info">Laboratorio de mercado</p>
              <h2 className="mt-1 font-display text-lg font-bold">Simulador de Trading</h2>
              <p className="mt-1 max-w-xl text-sm text-tp-text-muted">
                {simulatorUnlocked ? "Practica con replay de mercado, checklist disciplinario y diario obligatorio." : "Se desbloquea al demostrar gestión de riesgo en la misión 1.4."}
              </p>
            </div>
          </div>
          {simulatorUnlocked
            ? <Link href="/simulator" className="flex items-center gap-2 rounded-2xl bg-tp-info px-5 py-3 font-display font-bold text-tp-base">Entrar al simulador <ArrowRight size={16} /></Link>
            : <span className="flex items-center gap-2 rounded-xl border border-tp-border bg-tp-base px-4 py-2 text-xs text-tp-text-muted"><LockKeyhole size={14} /> Bloqueado</span>}
        </div>
      </section>

      {process.env.NODE_ENV === "development" && (
        <details className="border-t border-tp-border pt-4 text-xs text-tp-text-muted">
          <summary className="cursor-pointer select-none uppercase tracking-widest">Herramientas de desarrollo</summary>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => { resetProgress(); window.location.reload(); }} className="rounded-lg border border-tp-supply/30 bg-tp-supply/10 px-3 py-2 text-tp-supply">Reiniciar progreso</button>
            {["m1_1","m1_2","m1_3","m1_4","m1_5","m2_1","m2_2","m2_3","m2_4","m2_5","m3c_0","m3c_1","m3c_2","m3c_3","m3c_4","m3c_5"].map((id) => (
              <Link key={id} href={`/mission/${id}?dev=true`} className="rounded-lg border border-tp-border bg-tp-surface-alt px-2 py-1 font-data hover:border-tp-gold/30 hover:text-tp-gold">{id}</Link>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
