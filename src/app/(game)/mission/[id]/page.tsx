"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { level1, getMissionById } from "@/lib/content/level1";
import { level2, getLevel2MissionById } from "@/lib/content/level2";
import CharacterDialogue from "@/components/narrative/CharacterDialogue";
import QuizEngine from "@/components/game/QuizEngine";
import MatchTermMinigame from "@/components/game/MatchTermMinigame";
import { useGameStore } from "@/store/gameStore";
import { useHasMounted } from "@/hooks/useHasMounted";
import { formatCurrency } from "@/lib/utils/format";

type Phase = "intro" | "minigame" | "quiz" | "outro" | "complete";

export default function MissionPage() {
  const params = useParams();
  const router = useRouter();
  const missionId = params.id as string;

  const {
    currentLevelId,
    isMissionCompleted,
    isMissionUnlocked,
    completeMission,
  } = useGameStore();

  // Find mission in both levels
  const mission = getMissionById(missionId) || getLevel2MissionById(missionId);
  const levelId = missionId.startsWith("m1_") ? "level_1" : "level_2";

  const [phase, setPhase] = useState<Phase>("intro");
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [outroIndex, setOutroIndex] = useState(0);
  const [blocked, setBlocked] = useState(false);

  // Check if mission is accessible
  useEffect(() => {
    if (!mission) {
      router.push("/dashboard");
      return;
    }
    const unlocked = isMissionUnlocked(levelId, missionId);
    if (!unlocked) {
      setBlocked(true);
    }
  }, [mission, levelId, missionId, isMissionUnlocked, router]);

  if (blocked) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 space-y-4">
        <div className="text-4xl">🔒</div>
        <h2 className="text-xl font-bold text-tp-accent-red">Misión bloqueada</h2>
        <p className="text-tp-text-secondary">
          Debes completar las misiones anteriores para desbloquear esta.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-2 bg-tp-accent-green text-black font-semibold rounded-lg hover:brightness-110 transition"
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  if (!mission) return null;

  // Already completed — show completion state
  const alreadyCompleted = isMissionCompleted(levelId, missionId);

  const handleIntroNext = () => {
    if (dialogueIndex < mission.introDialogues.length - 1) {
      setDialogueIndex((i) => i + 1);
    } else {
      if (mission.minigame) setPhase("minigame");
      else if (mission.quiz.length > 0) setPhase("quiz");
      else {
        // Narrative-only mission — complete immediately
        handleMissionComplete(100);
      }
    }
  };

  const handleMinigameComplete = (minigameScore?: number) => {
    if (mission.quiz.length > 0) setPhase("quiz");
    else handleMissionComplete(minigameScore ?? 100);
  };

  const handleQuizComplete = (score: number, total: number) => {
    const percent = Math.round((score / total) * 100);
    // Boss mission requires 75%
    const isBoss = mission.id === "m1_5" || mission.id === "m2_5";
    if (isBoss && percent < 75) {
      // Failed — don't complete
      return;
    }
    handleMissionComplete(percent);
  };

  const handleMissionComplete = (score: number) => {
    if (!alreadyCompleted) {
      completeMission(levelId, missionId, score);
    }
    setPhase("outro");
    setOutroIndex(0);
  };

  const handleOutroNext = () => {
    if (outroIndex < mission.outroDialogues.length - 1) {
      setOutroIndex((i) => i + 1);
    } else {
      setPhase("complete");
    }
  };

  const handleFinish = () => {
    router.push("/dashboard");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Mission Header */}
      <div className="bg-tp-bg-secondary border border-tp-border rounded-xl p-4">
        <p className="text-tp-text-secondary text-xs uppercase tracking-wide">
          {levelId === "level_1" ? "Nivel 1" : "Nivel 2"} — Misión {mission.order}
        </p>
        <h2 className="text-xl font-bold mt-1">{mission.title}</h2>
        <p className="text-tp-text-secondary text-sm mt-0.5 italic">{mission.subtitle}</p>
        <div className="mt-2 flex gap-3 text-xs">
          <span className="text-tp-accent-green">+{mission.rewards.xp} XP</span>
          <span className="text-tp-accent-gold">+{formatCurrency(mission.rewards.virtualCapital)}</span>
          {alreadyCompleted && <span className="text-tp-text-secondary">(ya completada)</span>}
        </div>
      </div>

      {/* Phase: Intro Dialogues */}
      {phase === "intro" && (
        <div className="space-y-4">
          <CharacterDialogue dialogue={mission.introDialogues[dialogueIndex]} />
          <button
            onClick={handleIntroNext}
            className="px-6 py-2 bg-tp-accent-green text-black font-semibold rounded-lg hover:brightness-110 transition"
          >
            {dialogueIndex < mission.introDialogues.length - 1 ? "Continuar →" : "Comenzar misión →"}
          </button>
        </div>
      )}

      {/* Phase: Mini-game */}
      {phase === "minigame" && mission.minigame && (
        <div className="space-y-4">
          <div className="bg-tp-bg-secondary border border-tp-border rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-2">🎮 {mission.minigame.title}</h3>
            <p className="text-tp-text-secondary text-sm mb-3">{mission.minigame.description}</p>

            {/* Render real minigame based on type */}
            {mission.minigame.type === "match_term" && mission.minigame.config?.pairs ? (
              <MatchTermMinigame
                pairs={mission.minigame.config.pairs as { term: string; definition: string }[]}
                timeLimit={mission.minigame.config.timeLimit as number | undefined}
                onComplete={handleMinigameComplete}
              />
            ) : (
              /* Fallback for other minigame types (placeholder until implemented) */
              <div className="space-y-3">
                <div className="bg-tp-bg-primary border border-tp-border rounded-lg p-4">
                  <p className="text-sm text-tp-text-secondary italic">{mission.minigame.instructions}</p>
                </div>
                <button
                  onClick={() => handleMinigameComplete()}
                  className="px-6 py-2 bg-tp-accent-green text-black font-semibold rounded-lg hover:brightness-110 transition"
                >
                  Completar mini-juego →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase: Quiz */}
      {phase === "quiz" && mission.quiz.length > 0 && (
        <div className="bg-tp-bg-secondary border border-tp-border rounded-xl p-6">
          <QuizEngine
            questions={mission.quiz}
            onComplete={handleQuizComplete}
            minPassPercent={mission.id === "m1_5" || mission.id === "m2_5" ? 75 : undefined}
          />
        </div>
      )}

      {/* Phase: Outro Dialogues */}
      {phase === "outro" && (
        <div className="space-y-4">
          <CharacterDialogue dialogue={mission.outroDialogues[outroIndex]} />
          <button
            onClick={handleOutroNext}
            className="px-6 py-2 bg-tp-accent-green text-black font-semibold rounded-lg hover:brightness-110 transition"
          >
            {outroIndex < mission.outroDialogues.length - 1 ? "Continuar →" : "Finalizar →"}
          </button>
        </div>
      )}

      {/* Phase: Complete */}
      {phase === "complete" && (
        <div className="text-center space-y-4">
          <div className="text-4xl">🎉</div>
          <h3 className="text-xl font-bold text-tp-accent-green">¡Misión completada!</h3>
          {!alreadyCompleted && (
            <p className="text-tp-text-secondary">
              Has ganado <span className="text-tp-accent-green font-bold">+{mission.rewards.xp} XP</span>
              {" y "}
              <span className="text-tp-accent-gold font-bold">+{formatCurrency(mission.rewards.virtualCapital)}</span>
            </p>
          )}
          {mission.rewards.badge && (
            <p className="text-tp-accent-gold text-sm">🏆 Insignia: {mission.rewards.badge}</p>
          )}
          {/* Learning objectives recap */}
          <div className="bg-tp-bg-secondary border border-tp-border rounded-xl p-4 text-left mt-4">
            <p className="text-xs uppercase tracking-wide text-tp-text-secondary mb-2">Lo que aprendiste:</p>
            <ul className="space-y-1">
              {mission.learningObjectives.map((obj, i) => (
                <li key={i} className="text-sm text-tp-text-primary flex items-start gap-2">
                  <span className="text-tp-accent-green">✓</span> {obj}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={handleFinish}
            className="px-6 py-3 bg-tp-accent-green text-black font-semibold rounded-lg hover:brightness-110 transition"
          >
            Volver al Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
