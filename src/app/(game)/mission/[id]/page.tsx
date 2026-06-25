"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMissionById } from "@/lib/content/level1";
import { getLevel2MissionById } from "@/lib/content/level2";
import { getLevel3CryptoMissionById } from "@/lib/content/level3-crypto";
import CharacterDialogue from "@/components/narrative/CharacterDialogue";
import QuizEngine from "@/components/game/QuizEngine";
import MatchTermMinigame from "@/components/game/MatchTermMinigame";
import ChartTapGame from "@/components/game/ChartTapGame";
import RiskCalculator from "@/components/game/RiskCalculator";
import CandlestickBuilder from "@/components/game/CandlestickBuilder";
import CandleClassifier from "@/components/game/CandleClassifier";
import ZonePainter from "@/components/game/ZonePainter";
import PatternIdentifier from "@/components/game/PatternIdentifier";
import OrderSimulator from "@/components/game/OrderSimulator";
import MarketPreview from "@/components/game/MarketPreview";
import { useGameStore } from "@/store/gameStore";
import { formatCurrency } from "@/lib/utils/format";

type Phase = "intro" | "minigame" | "quiz" | "outro" | "complete";

function getLevelLabel(levelId: string): string {
  if (levelId === "level_1") return "Nivel 1";
  if (levelId === "level_2") return "Nivel 2";
  if (levelId === "level_3_crypto") return "Nivel 3 — Crypto";
  return "Nivel";
}

export default function MissionPage() {
  const params = useParams();
  const router = useRouter();
  const missionId = params.id as string;

  const { isMissionCompleted, isMissionUnlocked, completeMission } = useGameStore();

  // Find mission in all levels
  const mission = getMissionById(missionId) || getLevel2MissionById(missionId) || getLevel3CryptoMissionById(missionId);
  const levelId = missionId.startsWith("m1_") ? "level_1" : missionId.startsWith("m2_") ? "level_2" : "level_3_crypto";

  const [phase, setPhase] = useState<Phase>("intro");
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [outroIndex, setOutroIndex] = useState(0);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!mission) { router.push("/dashboard"); return; }
    // Allow dev bypass with ?dev=true in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get("dev") === "true") return;
    if (!isMissionUnlocked(levelId, missionId)) { setBlocked(true); }
  }, [mission, levelId, missionId, isMissionUnlocked, router]);

  if (blocked) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 space-y-4">
        <div className="text-4xl">🔒</div>
        <h2 className="font-display text-xl font-bold text-tp-supply">Misión bloqueada</h2>
        <p className="text-tp-text-muted">Debes completar las misiones anteriores para desbloquear esta.</p>
        <button onClick={() => router.push("/dashboard")} className="px-6 py-2 bg-tp-gold text-tp-base font-display font-bold rounded-sm hover:brightness-110 transition">
          Volver al Dashboard
        </button>
      </div>
    );
  }

  if (!mission) return null;
  const alreadyCompleted = isMissionCompleted(levelId, missionId);

  const handleIntroNext = () => {
    if (dialogueIndex < mission.introDialogues.length - 1) {
      setDialogueIndex((i) => i + 1);
    } else {
      if (mission.minigame) setPhase("minigame");
      else if (mission.quiz.length > 0) setPhase("quiz");
      else handleMissionComplete(100);
    }
  };

  const handleMinigameComplete = (minigameScore?: number) => {
    if (mission.quiz.length > 0) setPhase("quiz");
    else handleMissionComplete(minigameScore ?? 100);
  };

  const handleQuizComplete = (score: number, total: number) => {
    const percent = Math.round((score / total) * 100);
    const isBoss = mission.id === "m1_5" || mission.id === "m2_5" || mission.id === "m3c_5";
    if (isBoss && percent < 75) return; // Failed boss
    handleMissionComplete(percent);
  };

  const handleMissionComplete = (score: number) => {
    if (!alreadyCompleted) completeMission(levelId, missionId, score);
    setPhase("outro");
    setOutroIndex(0);
  };

  const handleOutroNext = () => {
    if (outroIndex < mission.outroDialogues.length - 1) setOutroIndex((i) => i + 1);
    else setPhase("complete");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Mission Header */}
      <div className="bg-tp-surface border border-tp-border rounded-md p-4">
        <p className="text-tp-text-muted text-[10px] uppercase tracking-widest">
          {getLevelLabel(levelId)} — Misión {mission.order}
        </p>
        <h2 className="font-display text-xl font-bold mt-1">{mission.title}</h2>
        <p className="text-tp-text-muted text-sm mt-0.5 italic">{mission.subtitle}</p>
        <div className="mt-2 flex gap-3 text-xs">
          <span className="font-data text-tp-gold">+{mission.rewards.xp} XP</span>
          <span className="font-data text-tp-demand">+{formatCurrency(mission.rewards.virtualCapital)}</span>
          {alreadyCompleted && <span className="text-tp-text-muted">(ya completada)</span>}
        </div>
      </div>

      {/* Phase: Intro */}
      {phase === "intro" && (
        <div className="space-y-4">
          <CharacterDialogue dialogue={mission.introDialogues[dialogueIndex]} />
          <button onClick={handleIntroNext} className="px-6 py-2 bg-tp-gold text-tp-base font-display font-bold rounded-sm hover:brightness-110 transition">
            {dialogueIndex < mission.introDialogues.length - 1 ? "Continuar →" : "Comenzar misión →"}
          </button>
        </div>
      )}

      {/* Phase: Mini-game */}
      {phase === "minigame" && mission.minigame && (
        <div className="space-y-4">
          <div className="bg-tp-surface border border-tp-border rounded-md p-6">
            <h3 className="font-display font-bold text-lg mb-2">🎮 {mission.minigame.title}</h3>
            <p className="text-tp-text-muted text-sm mb-4">{mission.minigame.description}</p>
            {/* match_term */}
            {mission.minigame.type === "match_term" && mission.minigame.config?.pairs ? (
              <MatchTermMinigame
                pairs={mission.minigame.config.pairs as { term: string; definition: string }[]}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "chart_tap" && mission.minigame.config?.charts ? (
              <ChartTapGame
                charts={mission.minigame.config.charts as { id: string; type: "bullish" | "bearish" | "sideways"; hint: string }[]}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "price_direction_quiz" && mission.minigame.config?.scenarios ? (
              <RiskCalculator
                scenarios={mission.minigame.config.scenarios as { capital: number; entryPrice: number; stopLoss: number; correctUnits: number; explanation: string }[]}
                riskPercentage={(mission.minigame.config.riskPercentage as number) || 0.02}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "candlestick_builder" && mission.minigame.config?.scenarios ? (
              <CandlestickBuilder
                scenarios={mission.minigame.config.scenarios as { open: number; high: number; low: number; close: number; expectedColor: "green" | "red"; note?: string }[]}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "candle_classifier" ? (
              <CandleClassifier onComplete={handleMinigameComplete} />
            ) : mission.minigame.type === "zone_painter" && mission.minigame.config?.correctZones ? (
              <ZonePainter
                correctZones={mission.minigame.config.correctZones as { type: "demand" | "supply"; low: number; high: number }[]}
                requiredCorrect={(mission.minigame.config.requiredCorrect as number) || 3}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "pattern_identifier" && mission.minigame.config?.patterns ? (
              <PatternIdentifier
                patterns={mission.minigame.config.patterns as { id: string; pattern: string; signal: "bullish" | "bearish" | "neutral" }[]}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "order_simulator" && mission.minigame.config?.scenarios ? (
              <OrderSimulator
                scenarios={mission.minigame.config.scenarios as { id: string; setup: string; correctOrderType: string }[]}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "market_preview" ? (
              <MarketPreview onComplete={handleMinigameComplete} />
            ) : (
              <div className="space-y-3">
                <div className="bg-tp-base border border-tp-border rounded-sm p-4">
                  <p className="text-sm text-tp-text-muted italic">{mission.minigame.instructions}</p>
                </div>
                <button onClick={() => handleMinigameComplete()} className="px-6 py-2 bg-tp-gold text-tp-base font-display font-bold rounded-sm hover:brightness-110 transition">
                  Completar mini-juego →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase: Quiz */}
      {phase === "quiz" && mission.quiz.length > 0 && (
        <div className="bg-tp-surface border border-tp-border rounded-md p-6">
          <QuizEngine
            questions={mission.quiz}
            onComplete={handleQuizComplete}
            minPassPercent={mission.id === "m1_5" || mission.id === "m2_5" || mission.id === "m3c_5" ? 75 : undefined}
          />
        </div>
      )}

      {/* Phase: Outro */}
      {phase === "outro" && (
        <div className="space-y-4">
          <CharacterDialogue dialogue={mission.outroDialogues[outroIndex]} />
          <button onClick={handleOutroNext} className="px-6 py-2 bg-tp-gold text-tp-base font-display font-bold rounded-sm hover:brightness-110 transition">
            {outroIndex < mission.outroDialogues.length - 1 ? "Continuar →" : "Finalizar →"}
          </button>
        </div>
      )}

      {/* Phase: Complete */}
      {phase === "complete" && (
        <div className="text-center space-y-4">
          <div className="text-4xl">🎉</div>
          <h3 className="font-display text-xl font-bold text-tp-demand">¡Misión completada!</h3>
          {!alreadyCompleted && (
            <p className="text-tp-text-muted">
              Has ganado <span className="font-data text-tp-gold font-bold">+{mission.rewards.xp} XP</span>
              {" y "}
              <span className="font-data text-tp-demand font-bold">+{formatCurrency(mission.rewards.virtualCapital)}</span>
            </p>
          )}
          {mission.rewards.badge && (
            <p className="text-tp-gold text-sm">🏆 Insignia: {mission.rewards.badge}</p>
          )}
          <div className="bg-tp-surface border border-tp-border rounded-md p-4 text-left mt-4">
            <p className="text-[10px] uppercase tracking-widest text-tp-text-muted mb-2">Lo que aprendiste:</p>
            <ul className="space-y-1">
              {mission.learningObjectives.map((obj, i) => (
                <li key={i} className="text-sm text-tp-text flex items-start gap-2">
                  <span className="text-tp-demand">✓</span> {obj}
                </li>
              ))}
            </ul>
          </div>
          <button onClick={() => router.push("/dashboard")} className="px-6 py-3 bg-tp-gold text-tp-base font-display font-bold rounded-sm hover:brightness-110 transition">
            Volver al Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
