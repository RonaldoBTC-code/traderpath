"use client";

import { useGameStore, type MissionStatus } from "@/store/gameStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { level1 } from "@/lib/content/level1";
import { level2 } from "@/lib/content/level2";
import { level3Crypto } from "@/lib/content/level3-crypto";
import BitcoinCityMap from "@/components/game/BitcoinCityMap";
import WorldHero from "@/components/game/WorldHero";
import Link from "next/link";

function getMissionStatusIcon(status: MissionStatus) {
  switch (status) {
    case "completed": return "✅";
    case "available": return "🟢";
    case "locked": return "🔒";
  }
}

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

  // Skeleton while hydrating
  if (!hasMounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-72 bg-tp-surface rounded-md" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-tp-surface border border-tp-border rounded-md h-24" />
          ))}
        </div>
        <div className="bg-tp-surface border border-tp-border rounded-md h-28" />
      </div>
    );
  }

  const currentLevel = currentLevelId === "level_2" ? level2 : currentLevelId === "level_3_crypto" ? level3Crypto : level1;
  const missions = currentLevel.missions;
  const bitcoinOnboardingRequired =
    currentLevelId === "level_3_crypto" &&
    !completedMissions.some((mission) => mission.levelId === "level_3_crypto" && mission.missionId === "m3c_0");
  const currentMission = bitcoinOnboardingRequired
    ? missions.find((mission) => mission.id === "m3c_0")
    : missions.find((mission) => mission.id === currentMissionId);
  const completedInLevel = completedMissions.filter((m) => m.levelId === currentLevelId).length;
  const simulatorUnlocked = completedMissions.some((mission) => mission.levelId === "level_1" && mission.missionId === "m1_4");

  return (
    <div className="space-y-8">
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-tp-surface border border-tp-border rounded-md p-4">
          <p className="text-tp-text-muted text-[10px] uppercase tracking-widest">Capital</p>
          <p className="font-data text-xl text-tp-demand mt-1">
            {formatCurrency(virtualCapital)}
          </p>
        </div>
        <div className="bg-tp-surface border border-tp-border rounded-md p-4">
          <p className="text-tp-text-muted text-[10px] uppercase tracking-widest">Experiencia</p>
          <p className="font-data text-xl text-tp-gold mt-1">
            {formatNumber(xp)} <span className="text-sm text-tp-text-muted">XP</span>
          </p>
        </div>
        <div className="bg-tp-surface border border-tp-border rounded-md p-4">
          <p className="text-tp-text-muted text-[10px] uppercase tracking-widest">Rango</p>
          <p className="font-display text-xl text-tp-text mt-1">{rank}</p>
        </div>
        <div className="bg-tp-surface border border-tp-border rounded-md p-4">
          <p className="text-tp-text-muted text-[10px] uppercase tracking-widest">Progreso</p>
          <p className="font-data text-xl text-tp-text mt-1">
            {completedInLevel}<span className="text-tp-text-muted">/{missions.length}</span>
          </p>
          {/* Mini progress bar */}
          <div className="w-full h-1.5 bg-tp-base rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-tp-gold rounded-full transition-all duration-500"
              style={{ width: `${(completedInLevel / missions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Current Mission CTA */}
      {currentMission && (
        <div className="bg-tp-surface border border-tp-gold/20 rounded-md p-6 shadow-gold">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-[10px] text-tp-gold uppercase tracking-widest font-semibold">Próxima misión</p>
              <h3 className="font-display text-lg font-bold mt-1">{currentMission.title}</h3>
              <p className="text-tp-text-muted text-sm mt-0.5">{currentMission.subtitle}</p>
              <p className="font-data text-xs text-tp-text-muted mt-2">
                +{currentMission.rewards.xp} XP · +{formatCurrency(currentMission.rewards.virtualCapital + (currentMission.minigame?.virtualCapitalReward ?? 0))}
              </p>
            </div>
            <Link
              href={`/mission/${currentMission.id}`}
              className="px-5 py-2.5 bg-tp-gold text-tp-base font-display font-bold rounded-sm hover:brightness-110 transition whitespace-nowrap"
            >
              Jugar →
            </Link>
          </div>
        </div>
      )}

      {/* Mission Path Map */}
      <div className="bg-tp-surface border border-tp-border rounded-md p-6">
        <h3 className="font-display text-lg font-bold mb-5">
          Mapa de Misiones
        </h3>
        <div className="space-y-2">
          {missions.map((mission, index) => {
            const status = getMissionStatus(currentLevelId, mission.id);
            const icon = getMissionStatusIcon(status);

            const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-sm border transition";
            const statusClasses = {
              completed: "border-tp-demand/30 bg-tp-demand/5",
              available: "border-tp-gold/40 bg-tp-gold/5 shadow-gold",
              locked: "border-tp-border bg-tp-base/50 opacity-50 cursor-not-allowed",
            };

            const content = (
              <>
                {/* Node indicator */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border ${
                  status === "completed" ? "border-tp-demand bg-tp-demand/20" :
                  status === "available" ? "border-tp-gold bg-tp-gold/20 animate-pulse-soft" :
                  "border-tp-border bg-tp-base"
                }`}>
                  {status === "completed" ? "✓" : status === "available" ? index + 1 : "🔒"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium truncate">{mission.title}</p>
                  <p className="text-xs text-tp-text-muted truncate">{mission.subtitle}</p>
                </div>
                {status === "available" && (
                  <span className="font-data text-xs text-tp-gold">+{mission.rewards.xp} XP</span>
                )}
                {status === "completed" && (
                  <span className="text-xs text-tp-demand">Completada</span>
                )}
              </>
            );

            if (status === "available") {
              return (
                <Link key={mission.id} href={`/mission/${mission.id}`} className={`${baseClasses} ${statusClasses[status]} hover:brightness-110`}>
                  {content}
                </Link>
              );
            }
            return (
              <div key={mission.id} className={`${baseClasses} ${statusClasses[status]}`}>
                {content}
              </div>
            );
          })}
        </div>
      </div>

      {/* Trading laboratory */}
      <div className={`rounded-md border p-6 ${simulatorUnlocked ? "border-tp-info/30 bg-tp-info/5 shadow-info" : "border-tp-border bg-tp-surface opacity-70"}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-tp-info">Laboratorio de mercado</p>
            <h3 className="mt-1 font-display text-lg font-bold">Simulador de Trading</h3>
            <p className="mt-1 max-w-xl text-sm text-tp-text-muted">
              {simulatorUnlocked ? "Practica con replay de mercado, checklist disciplinario y diario obligatorio." : "Se desbloquea al demostrar gestión de riesgo en la misión 1.4."}
            </p>
          </div>
          {simulatorUnlocked ? (
            <Link href="/simulator" className="rounded-sm bg-tp-info px-5 py-2.5 font-display font-bold text-tp-base">Entrar al simulador →</Link>
          ) : (
            <span className="rounded-sm border border-tp-border bg-tp-base px-4 py-2 text-xs text-tp-text-muted">🔒 Bloqueado</span>
          )}
        </div>
      </div>

      {/* Dev tools */}
      {process.env.NODE_ENV === "development" && <div className="pt-4 border-t border-tp-border space-y-3">
        <p className="text-[10px] text-tp-text-muted/60 uppercase tracking-widest">Dev Tools</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { resetProgress(); window.location.reload(); }}
            className="text-[10px] px-2 py-1 bg-tp-supply/10 border border-tp-supply/30 rounded-sm text-tp-supply hover:bg-tp-supply/20 transition font-data"
          >
            Reset Progress
          </button>
        </div>
        {/* Quick mission navigation */}
        <div>
          <p className="text-[10px] text-tp-text-muted/40 mb-1">Ir directo a misión (ignora bloqueo):</p>
          <div className="flex flex-wrap gap-1">
            {["m1_1","m1_2","m1_3","m1_4","m1_5","m2_1","m2_2","m2_3","m2_4","m2_5","m3c_0","m3c_1","m3c_2","m3c_3","m3c_4","m3c_5"].map((id) => (
              <Link key={id} href={`/mission/${id}?dev=true`}
                className="text-[9px] px-1.5 py-0.5 bg-tp-surface-alt border border-tp-border rounded-sm text-tp-text-muted hover:text-tp-gold hover:border-tp-gold/30 transition font-data">
                {id}
              </Link>
            ))}
          </div>
        </div>
      </div>}
    </div>
  );
}
