"use client";

import { useGameStore, type MissionStatus } from "@/store/gameStore";
import { level1 } from "@/lib/content/level1";
import { level2 } from "@/lib/content/level2";
import Link from "next/link";

function getMissionStatusIcon(status: MissionStatus) {
  switch (status) {
    case "completed": return "✅";
    case "available": return "🟢";
    case "locked": return "🔒";
  }
}

function getMissionStatusColor(status: MissionStatus) {
  switch (status) {
    case "completed": return "border-tp-accent-green/50 bg-tp-accent-green/5";
    case "available": return "border-tp-accent-green bg-tp-accent-green/10";
    case "locked": return "border-tp-border opacity-50";
  }
}

export default function DashboardPage() {
  const {
    xp,
    virtualCapital,
    rank,
    currentLevelId,
    currentMissionId,
    completedMissions,
    streakDays,
    getMissionStatus,
    resetProgress,
  } = useGameStore();

  // Get current level data
  const currentLevel = currentLevelId === "level_2" ? level2 : level1;
  const missions = currentLevel.missions;

  // Find current mission data
  const currentMission = missions.find((m) => m.id === currentMissionId);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold">
          <span className="text-tp-accent-green">{currentLevel.title}</span>
        </h2>
        <p className="text-tp-text-secondary text-sm mt-1">
          {currentLevel.tagline}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-tp-bg-secondary border border-tp-border rounded-xl p-4">
          <p className="text-tp-text-secondary text-xs uppercase tracking-wide">Capital Virtual</p>
          <p className="text-xl font-mono font-bold text-tp-accent-green mt-1">
            ${virtualCapital.toLocaleString()}
          </p>
        </div>
        <div className="bg-tp-bg-secondary border border-tp-border rounded-xl p-4">
          <p className="text-tp-text-secondary text-xs uppercase tracking-wide">Experiencia</p>
          <p className="text-xl font-bold mt-1">
            {xp} <span className="text-sm text-tp-text-secondary">XP</span>
          </p>
        </div>
        <div className="bg-tp-bg-secondary border border-tp-border rounded-xl p-4">
          <p className="text-tp-text-secondary text-xs uppercase tracking-wide">Rango</p>
          <p className="text-xl font-bold text-tp-accent-gold mt-1">{rank}</p>
        </div>
        <div className="bg-tp-bg-secondary border border-tp-border rounded-xl p-4">
          <p className="text-tp-text-secondary text-xs uppercase tracking-wide">Misiones</p>
          <p className="text-xl font-bold mt-1">
            {completedMissions.filter((m) => m.levelId === currentLevelId).length}
            <span className="text-sm text-tp-text-secondary">/{missions.length}</span>
          </p>
        </div>
      </div>

      {/* Current Mission CTA */}
      {currentMission && (
        <div className="bg-tp-bg-secondary border border-tp-accent-green/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-tp-accent-green uppercase tracking-wide">Próxima misión</p>
              <h3 className="text-lg font-semibold mt-1">{currentMission.title}</h3>
              <p className="text-tp-text-secondary text-sm mt-0.5">{currentMission.subtitle}</p>
              <p className="text-xs text-tp-text-secondary mt-2">
                +{currentMission.rewards.xp} XP · +${currentMission.rewards.virtualCapital}
              </p>
            </div>
            <Link
              href={`/mission/${currentMission.id}`}
              className="px-5 py-2.5 bg-tp-accent-green text-black font-semibold rounded-lg hover:brightness-110 transition whitespace-nowrap"
            >
              Jugar →
            </Link>
          </div>
        </div>
      )}

      {/* Mission Path Map */}
      <div className="bg-tp-bg-secondary border border-tp-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Mapa de Misiones — {currentLevel.title}</h3>
        <div className="space-y-3">
          {missions.map((mission, index) => {
            const status = getMissionStatus(currentLevelId, mission.id);
            const statusIcon = getMissionStatusIcon(status);
            const statusColor = getMissionStatusColor(status);

            return (
              <div key={mission.id} className="flex items-center gap-3">
                {/* Connector line */}
                {index > 0 && (
                  <div className="absolute -mt-6 ml-4 w-0.5 h-3 bg-tp-border" />
                )}
                {/* Mission card */}
                {status === "available" ? (
                  <Link
                    href={`/mission/${mission.id}`}
                    className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border ${statusColor} hover:brightness-110 transition`}
                  >
                    <span className="text-lg">{statusIcon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{mission.title}</p>
                      <p className="text-xs text-tp-text-secondary">{mission.subtitle}</p>
                    </div>
                    <span className="text-xs text-tp-accent-green">+{mission.rewards.xp} XP</span>
                  </Link>
                ) : status === "completed" ? (
                  <div className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border ${statusColor}`}>
                    <span className="text-lg">{statusIcon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{mission.title}</p>
                      <p className="text-xs text-tp-text-secondary">{mission.subtitle}</p>
                    </div>
                    <span className="text-xs text-tp-accent-green">Completada</span>
                  </div>
                ) : (
                  <div className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border ${statusColor} cursor-not-allowed`}>
                    <span className="text-lg">{statusIcon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{mission.title}</p>
                      <p className="text-xs text-tp-text-secondary">{mission.subtitle}</p>
                    </div>
                    <span className="text-xs text-tp-text-secondary">Bloqueada</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dev reset button */}
      <div className="pt-4 border-t border-tp-border">
        <button
          onClick={() => { resetProgress(); window.location.reload(); }}
          className="text-xs text-tp-text-secondary/50 hover:text-tp-accent-red transition"
        >
          [DEV] Reset Progress
        </button>
      </div>
    </div>
  );
}
