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
import MissionTutorial, { type TutorialContent } from "@/components/game/MissionTutorial";
import { useGameStore } from "@/store/gameStore";
import { formatCurrency } from "@/lib/utils/format";

type Phase = "intro" | "tutorial" | "minigame" | "quiz" | "outro" | "complete";

// ─── TUTORIAL CONTENT PER MISSION ───────────────────────────

function getMissionTutorial(missionId: string): TutorialContent {
  const tutorials: Record<string, TutorialContent> = {
    m1_1: {
      title: "Oferta, Demanda y Precio",
      learningObjective: "Entender que el precio es el acuerdo entre compradores y vendedores, y que se mueve por oferta y demanda.",
      conceptExplanation: "Un mercado financiero es un lugar donde compradores y vendedores intercambian activos. El precio sube cuando hay más compradores que vendedores (demanda > oferta) y baja cuando hay más vendedores que compradores (oferta > demanda).",
      practicalExample: "Si 100 personas quieren comprar Bitcoin pero solo 10 quieren venderlo, el precio sube porque los compradores compiten. Si 100 quieren vender y solo 10 quieren comprar, el precio baja.",
      stepByStepInstructions: [
        "Lee cada término de la columna izquierda.",
        "Busca su definición correcta en la columna derecha.",
        "Haz clic en el término primero, luego en su definición.",
        "Si es correcto, la pareja se marca en verde.",
        "Si es incorrecto, se marca en rojo y puedes intentar de nuevo.",
      ],
      commonMistakes: ["Confundir 'liquidez' con 'demanda' — la liquidez es la facilidad de comprar/vender, no la presión compradora."],
      hint: "Piensa en un mercado de frutas: oferta es cuántas hay disponibles, demanda es cuántas personas las quieren.",
    },
    m1_2: {
      title: "Construir Velas Japonesas",
      learningObjective: "Entender cómo se forma una vela japonesa usando los datos Open, High, Low y Close.",
      conceptExplanation: "Una vela japonesa representa el movimiento del precio durante un período de tiempo. Tiene cuatro datos: Open (apertura), High (máximo alcanzado), Low (mínimo alcanzado), Close (cierre). Si Close > Open → vela alcista (verde). Si Close < Open → vela bajista (roja).",
      practicalExample: "Si BTC abre en $100, sube hasta $120 (High), baja hasta $90 (Low) y cierra en $115 (Close), la vela es ALCISTA porque cerró ($115) por encima de donde abrió ($100).",
      stepByStepInstructions: [
        "Observa el High y Low que te dan — son los límites de la vela.",
        "Lee si la vela debe ser alcista o bajista.",
        "Si es alcista: coloca Open DEBAJO del Close.",
        "Si es bajista: coloca Open ENCIMA del Close.",
        "Ambos valores deben estar entre Low y High.",
      ],
      commonMistakes: [
        "Poner Open mayor que High — imposible, High es el máximo.",
        "Confundir alcista con bajista — alcista = Close > Open.",
      ],
      hint: "Primero decide la dirección. Si es verde (alcista), Close debe ser mayor que Open. Siempre entre Low y High.",
    },
    m1_3: {
      title: "Identificar Tendencias",
      learningObjective: "Distinguir si un gráfico muestra tendencia alcista, bajista o lateral analizando la estructura de máximos y mínimos.",
      conceptExplanation: "Tendencia alcista: los máximos (HH) y mínimos (HL) son cada vez más altos. Bajista: los máximos (LH) y mínimos (LL) son cada vez más bajos. Lateral: el precio oscila sin dirección clara.",
      practicalExample: "Si el precio hace máximos en $100, $110, $120 y mínimos en $90, $95, $105 → eso es alcista porque cada pico y valle son más altos que el anterior.",
      stepByStepInstructions: [
        "Observa el gráfico completo de izquierda a derecha.",
        "Identifica los picos (máximos) y los valles (mínimos).",
        "¿Los picos son cada vez más altos? → Alcista.",
        "¿Los picos son cada vez más bajos? → Bajista.",
        "¿No hay dirección clara? → Lateral.",
      ],
      commonMistakes: ["Mirar solo las últimas velas — analiza TODO el gráfico.", "Confundir un retroceso temporal con cambio de tendencia."],
      hint: "Ignora las velas individuales. Mira la dirección general: ¿el gráfico sube, baja, o va de lado?",
    },
    m1_4: {
      title: "Cálculo de Riesgo",
      learningObjective: "Calcular cuántas unidades de un activo puedes comprar sin arriesgar más del 2% de tu capital.",
      conceptExplanation: "La regla del 2% dice: nunca arriesgues más del 2% de tu capital total en una sola operación. El riesgo por unidad = precio de entrada - stop loss. Unidades = (capital × 0.02) ÷ riesgo por unidad.",
      practicalExample: "Capital: $1,000. Entrada: $100. Stop Loss: $95. Riesgo por unidad = $5. Máximo riesgo = $1,000 × 0.02 = $20. Unidades = $20 ÷ $5 = 4 unidades.",
      stepByStepInstructions: [
        "Identifica tu capital total.",
        "Calcula el 2% de tu capital (capital × 0.02).",
        "Calcula el riesgo por unidad (entrada - stop loss).",
        "Divide: unidades = (2% del capital) ÷ (riesgo por unidad).",
        "Redondea hacia abajo para no superar el riesgo.",
      ],
      commonMistakes: ["Dividir al revés (riesgo ÷ capital)", "Olvidar redondear hacia abajo", "Usar más del 2% 'porque el análisis es bueno'"],
      hint: "Fórmula: Unidades = (Capital × 0.02) ÷ (Entrada - StopLoss)",
    },
    m1_5: {
      title: "Análisis Integrado",
      learningObjective: "Combinar lectura de tendencia, análisis de velas, colocación de stop loss y cálculo de posición en una decisión de trading completa.",
      conceptExplanation: "Un trade disciplinado requiere: 1) identificar tendencia, 2) leer velas en zonas clave, 3) definir dónde se invalida el escenario (stop loss), 4) calcular tamaño de posición.",
      practicalExample: "BTC en rango $80K-$98K. El precio toca resistencia por 4ª vez con Shooting Star. → Tendencia: lateral. → Vela: rechazo en resistencia. → SL: encima de resistencia. → Posición: según el 2%.",
      stepByStepInstructions: [
        "Identifica la tendencia del gráfico (alcista/bajista/lateral).",
        "Busca la vela más significativa en una zona clave.",
        "Define dónde colocarías el Stop Loss.",
        "Decide si entrar o esperar según toda la evidencia.",
      ],
      commonMistakes: ["Entrar sin confirmar la tendencia", "Poner SL donde el precio lo toca fácilmente", "No calcular posición antes de ejecutar"],
      hint: "Sigue la secuencia: tendencia → vela → stop → decisión. Si no puedes responder uno, no operes.",
    },
  };

  return tutorials[missionId] || {
    title: "Preparación",
    learningObjective: "Comprender el concepto principal de esta misión antes de practicar.",
    conceptExplanation: "Revisa los diálogos anteriores para entender el concepto.",
    practicalExample: "Aplica lo que aprendiste en los diálogos al ejercicio siguiente.",
    stepByStepInstructions: ["Lee las instrucciones del mini-juego.", "Aplica el concepto que acabas de aprender.", "Si no estás seguro, usa el botón de pista."],
    hint: "Usa la información de los diálogos como guía.",
  };
}

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
      // Go to tutorial if minigame exists, otherwise quiz or complete
      if (mission.minigame) setPhase("tutorial");
      else if (mission.quiz.length > 0) setPhase("quiz");
      else handleMissionComplete(100);
    }
  };

  const handleTutorialComplete = () => {
    setPhase("minigame");
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

      {/* Phase: Tutorial (before minigame) */}
      {phase === "tutorial" && mission.minigame && (
        <MissionTutorial
          tutorial={getMissionTutorial(mission.id)}
          onContinue={handleTutorialComplete}
        />
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
