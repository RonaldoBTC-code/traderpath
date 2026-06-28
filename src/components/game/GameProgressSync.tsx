"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadRemoteProgress, saveRemoteProgress } from "@/lib/supabase/progress";
import { useGameStore, type GameProgressSnapshot } from "@/store/gameStore";

type SyncStatus = "idle" | "syncing" | "error";

function getSnapshot(): GameProgressSnapshot {
  const state = useGameStore.getState();
  return {
    xp: state.xp,
    virtualCapital: state.virtualCapital,
    rank: state.rank,
    currentLevelId: state.currentLevelId,
    currentMissionId: state.currentMissionId,
    completedMissions: state.completedMissions,
    streakDays: state.streakDays,
    lastActivity: state.lastActivity,
    marketSpecialization: state.marketSpecialization,
    marketChangeUsed: state.marketChangeUsed,
  };
}

async function saveWithRetry(userId: string, snapshot: GameProgressSnapshot) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await saveRemoteProgress(userId, snapshot);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export default function GameProgressSync() {
  const hydrateProgress = useGameStore((state) => state.hydrateProgress);
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<SyncStatus>("idle");
  const syncChain = useRef(Promise.resolve());

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;

      if (error || !data.user) {
        setReady(false);
        return;
      }

      try {
        const localProgress = getSnapshot();
        const remoteProgress = await loadRemoteProgress(data.user.id);
        if (!active) return;

        if (!remoteProgress || (remoteProgress.completedMissions.length === 0 && localProgress.completedMissions.length > 0)) {
          setStatus("syncing");
          await saveWithRetry(data.user.id, localProgress);
        } else {
          hydrateProgress(remoteProgress);
        }

        if (active) {
          setUserId(data.user.id);
          setReady(true);
          setStatus("idle");
        }
      } catch (syncError) {
        if (active) setStatus("error");
        console.error("No se pudo cargar el progreso remoto.", syncError);
      }
    };

    void initialize();
    return () => {
      active = false;
    };
  }, [hydrateProgress]);

  useEffect(() => {
    if (!ready || !userId) return;

    const unsubscribe = useGameStore.subscribe((state, previousState) => {
      if (
        state.xp === previousState.xp &&
        state.virtualCapital === previousState.virtualCapital &&
        state.currentLevelId === previousState.currentLevelId &&
        state.currentMissionId === previousState.currentMissionId &&
        state.completedMissions === previousState.completedMissions &&
        state.marketSpecialization === previousState.marketSpecialization &&
        state.marketChangeUsed === previousState.marketChangeUsed
      ) {
        return;
      }

      const snapshot = getSnapshot();
      setStatus("syncing");
      syncChain.current = syncChain.current
        .catch(() => undefined)
        .then(() => saveWithRetry(userId, snapshot))
        .then(() => setStatus("idle"))
        .catch((syncError) => {
          setStatus("error");
          console.error("No se pudo guardar el progreso remoto.", syncError);
        });
    });

    return unsubscribe;
  }, [ready, userId]);

  if (status === "idle") return null;

  return (
    <div
      role="status"
      className={`fixed bottom-3 right-3 z-[60] rounded-sm border px-3 py-2 text-[10px] shadow-lg ${
        status === "error"
          ? "border-tp-warning/50 bg-tp-base text-tp-warning"
          : "border-tp-info/40 bg-tp-base text-tp-info"
      }`}
    >
      {status === "error" ? "Sin conexión · progreso protegido localmente" : "Sincronizando progreso…"}
    </div>
  );
}
