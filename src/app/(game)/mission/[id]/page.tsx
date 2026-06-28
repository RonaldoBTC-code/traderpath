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
import PairCalculator, { type PairScenario } from "@/components/game/PairCalculator";
import DominanceGauge, { type DominanceScenario } from "@/components/game/DominanceGauge";
import CycleMapper, { type CycleEvent } from "@/components/game/CycleMapper";
import TimeframeSwitcher from "@/components/game/TimeframeSwitcher";
import CryptoIntegratedAnalysis, { type CryptoScenario } from "@/components/game/CryptoIntegratedAnalysis";
import BitcoinOriginGame from "@/components/game/BitcoinOriginGame";
import MissionMarketChart from "@/components/game/MissionMarketChart";
import { useHasMounted } from "@/hooks/useHasMounted";
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
      learningObjective: "Leer O, H, L y C para calcular la dirección, el cuerpo y las mechas de una vela.",
      conceptExplanation: "La dirección sale de comparar C con O. El cuerpo mide |C−O|. La mecha superior mide H−mayor(O,C) y la inferior mide menor(O,C)−L.",
      practicalExample: "Con O=100, H=120, L=90 y C=115: C>O, por eso es alcista. Cuerpo=15, mecha superior=5 y mecha inferior=10.",
      stepByStepInstructions: [
        "Lee los cuatro datos entregados: apertura, máximo, mínimo y cierre.",
        "Compara C con O para elegir alcista o bajista.",
        "Calcula el cuerpo con |C−O|.",
        "Calcula la mecha superior con H−mayor(O,C).",
        "Calcula la mecha inferior con menor(O,C)−L.",
      ],
      commonMistakes: [
        "Sumar C y O en vez de calcular su diferencia absoluta.",
        "Medir una mecha desde el precio equivocado: siempre parte del extremo del cuerpo.",
      ],
      hint: "Primero compara C con O. Después usa mayor(O,C) para la mecha superior y menor(O,C) para la inferior.",
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
    // ─── NIVEL 2 TUTORIALS ───
    m2_1: {
      title: "Zonas de Oferta y Demanda",
      learningObjective: "Identificar zonas donde el precio reaccionó con fuerza y clasificarlas como demanda (compradores) u oferta (vendedores).",
      conceptExplanation: "Una zona de demanda es un rango de precio desde donde el mercado subió con fuerza — ahí había compradores institucionales. Una zona de oferta es donde el precio cayó con fuerza — ahí había vendedores. Las zonas frescas (no retestadas) tienen mayor probabilidad de producir una reacción.",
      practicalExample: "Si BTC bajó hasta $82,000 y luego subió violentamente a $90,000, el rango $82,000-$84,000 es una zona de demanda fresca. Si el precio vuelve ahí, probablemente encuentre compradores de nuevo.",
      stepByStepInstructions: [
        "Selecciona el modo: Demanda (verde) u Oferta (rojo).",
        "Busca rangos de precio donde el mercado salió con FUERZA.",
        "Si subió fuerte desde ahí → es DEMANDA.",
        "Si cayó fuerte desde ahí → es OFERTA.",
        "Haz clic en la zona para clasificarla con el modo seleccionado.",
      ],
      commonMistakes: ["Confundir cualquier bajada con zona de oferta — necesita ser un movimiento FUERTE.", "Marcar zonas donde el precio solo pasó sin reacción."],
      hint: "Busca movimientos explosivos. Si el precio salió disparado desde un nivel, ahí hay una zona.",
    },
    m2_2: {
      title: "Soporte, Resistencia y Role Reversal",
      learningObjective: "Identificar niveles de soporte y resistencia, y entender cómo cambian de rol cuando se rompen.",
      conceptExplanation: "Soporte = nivel donde el precio rebota hacia arriba (compradores). Resistencia = nivel donde el precio rebota hacia abajo (vendedores). Role Reversal: cuando un soporte se rompe, se convierte en resistencia (y viceversa). El mercado tiene memoria.",
      practicalExample: "BTC tenía soporte en $10,000. El precio lo rompe y baja a $8,000. Cuando rebota y vuelve a $10,000, ese nivel ahora es RESISTENCIA — los que compraron ahí antes ahora venden para cerrar sus pérdidas.",
      stepByStepInstructions: [
        "Observa el gráfico y busca niveles donde el precio rebotó varias veces.",
        "Si rebotó ARRIBA → es soporte.",
        "Si rebotó ABAJO → es resistencia.",
        "Si un nivel se rompió, ahora tiene el rol OPUESTO.",
        "Toca el nivel correcto según la pregunta.",
      ],
      commonMistakes: ["Asumir que un soporte roto sigue siendo soporte.", "No esperar confirmación de ruptura (puede ser fakeout)."],
      hint: "Pregúntate: ¿el precio rebotó aquí antes? ¿Hacia arriba o hacia abajo? Si se rompió, el rol cambió.",
    },
    m2_3: {
      title: "Patrones de Velas y Contexto",
      learningObjective: "Identificar los 6 patrones principales de velas japonesas y entender que solo son válidos CON CONTEXTO (zona + tendencia).",
      conceptExplanation: "Los patrones de velas son señales visuales: Doji (indecisión), Hammer (rechazo de bajos), Shooting Star (rechazo de altos), Engulfing Alcista/Bajista (cambio de control), Morning/Evening Star (reversión en 3 velas). REGLA: patrón + zona + tendencia = señal válida. Patrón solo = ruido.",
      practicalExample: "Un Hammer aparece en una zona de demanda después de una corrección en tendencia alcista → señal de alta calidad. El mismo Hammer en medio de la nada sin zona ni contexto → no significa nada.",
      stepByStepInstructions: [
        "Se mostrará el nombre de un patrón de velas.",
        "Piensa: ¿este patrón indica señal alcista, bajista o neutral?",
        "Hammer/Engulfing Alcista/Morning Star → Alcista.",
        "Shooting Star/Engulfing Bajista/Evening Star → Bajista.",
        "Doji → Neutral (depende del contexto).",
      ],
      commonMistakes: ["Operar un patrón sin confirmar la zona donde aparece.", "Considerar el Doji como señal de compra o venta por sí solo."],
      hint: "Hammer = rechazo de precios bajos (alcista). Shooting Star = rechazo de precios altos (bajista). Doji = nadie ganó.",
    },
    m2_4: {
      title: "Tipos de Órdenes",
      learningObjective: "Distinguir cuándo usar cada tipo de orden: Market, Limit, Stop Loss, y Trailing Stop.",
      conceptExplanation: "Market Order = compra/vende AL INSTANTE al precio actual (rápido pero con posible slippage). Limit Order = solo se ejecuta si el precio llega a TU nivel (más control). Stop Loss = cierra tu posición si el precio va en contra. Trailing Stop = stop que se mueve a tu favor.",
      practicalExample: "Quieres comprar ETH en una zona de demanda a $2,800 pero el precio está en $3,000. Usas una Limit Buy a $2,800 → se ejecuta solo si ETH baja hasta ahí. Si usaras Market Order, comprarías a $3,000 (más caro).",
      stepByStepInstructions: [
        "Lee el escenario de mercado que se presenta.",
        "Identifica: ¿necesitas entrar YA o esperar un precio?",
        "Si necesitas entrar ya → Market Order.",
        "Si quieres esperar un precio específico → Limit Order.",
        "Si quieres proteger ganancias → Trailing Stop.",
        "Selecciona el tipo de orden correcto.",
      ],
      commonMistakes: ["Usar Market Order en mercados poco líquidos (slippage alto).", "Confundir Limit Buy con Stop Loss."],
      hint: "Market = velocidad. Limit = precisión. Stop Loss = protección. Trailing = protección dinámica.",
    },
    m2_5: {
      title: "Explorar los 7 Mercados",
      learningObjective: "Conocer las características de los 7 mercados financieros disponibles y elegir tu especialización de forma informada.",
      conceptExplanation: "Cada mercado tiene su personalidad: Crypto opera 24/7 con alta volatilidad. Forex es el más líquido. Acciones dependen de earnings. Commodities responden al clima y geopolítica. Índices diversifican. Futuros tienen vencimiento. ETFs son estables. Tu especialización define tu ruta.",
      practicalExample: "Si tienes tiempo flexible y te gusta la volatilidad → Crypto. Si prefieres estabilidad y horario fijo → Acciones o ETFs. Si quieres el mercado más líquido → Forex.",
      stepByStepInstructions: [
        "Haz clic en cada mercado para explorar sus características.",
        "Lee: volatilidad, liquidez, horario, activos ejemplo.",
        "Debes visitar los 7 mercados antes de poder elegir.",
        "Una vez visitados todos, selecciona tu especialización.",
        "Confirma tu elección — solo puedes cambiar una vez.",
      ],
      commonMistakes: ["Elegir por FOMO (porque un mercado 'da más dinero').", "No considerar tu disponibilidad horaria real."],
      hint: "No hay mercado 'mejor'. Hay mercados que se adaptan mejor a TU tiempo, tolerancia al riesgo y personalidad.",
    },
    // ─── NIVEL 3 CRYPTO TUTORIALS ───
    m3c_0: {
      title: "Ciudad Origen: Bitcoin",
      learningObjective: "Comprender Bitcoin como protocolo antes de estudiar BTC como activo de mercado.",
      conceptExplanation: "Bitcoin coordina un libro contable público sin una autoridad central. Las firmas autorizan gastos, los nodos verifican reglas y los mineros ordenan transacciones mediante prueba de trabajo. BTC es el símbolo de mercado, no el nombre de una empresa.",
      practicalExample: "Imagina un libro de cuentas copiado en miles de bibliotecas. Cualquiera puede proponer una nueva página, pero cada biblioteca comprueba las mismas reglas antes de aceptarla. Una página costosa de producir sigue siendo rechazada si contiene datos inválidos.",
      stepByStepInstructions: [
        "Recorre las cuatro estaciones en el orden que aparezcan.",
        "Lee el problema planteado por cada lugar.",
        "Elige una respuesta; las opciones se presentan al azar.",
        "Lee la explicación completa aunque hayas acertado.",
        "Consigue al menos 3 de 4 respuestas correctas.",
      ],
      commonMistakes: [
        "Confundir Bitcoin con una empresa o con su precio.",
        "Pensar que los mineros pueden cambiar las reglas por sí solos.",
        "Creer que la wallet almacena monedas como archivos.",
        "Compartir una frase de recuperación con una plataforma o supuesto soporte.",
      ],
      hint: "Pregunta siempre: ¿quién propone, quién verifica y quién controla las claves?",
    },
    m3c_1: {
      title: "El Mercado Crypto 24/7",
      learningObjective: "Entender las características únicas del mercado crypto: disponibilidad permanente, CEX vs DEX, pares de trading y gestión de riesgo nocturna.",
      conceptExplanation: "Crypto opera 24 horas, 7 días, 365 días. No hay campana de cierre. Un CEX custodia activos por sus usuarios; en un DEX la operación se ejecuta desde una wallet. El par BTC/USDT cotiza BTC en USDT, una stablecoin diseñada para seguir al dólar, aunque la paridad no está garantizada.",
      practicalExample: "Tienes una posición abierta en ETH a las 11PM y vas a dormir. Si no tienes Stop Loss, podrías despertar con una pérdida del 15%. Con SL colocado correctamente, la pérdida máxima es tu 2% planificado.",
      stepByStepInstructions: [
        "Lee el par de trading y el capital disponible.",
        "Calcula el riesgo: entrada - stop loss = riesgo por unidad.",
        "Calcula el 2% de tu capital.",
        "Divide: (2% del capital) ÷ (riesgo por unidad) = unidades.",
        "Ingresa el resultado.",
      ],
      commonMistakes: ["Operar sin SL en un mercado 24/7.", "No ajustar el tamaño de posición a la alta volatilidad crypto."],
      hint: "El SL es obligatorio en crypto porque el mercado se mueve mientras duermes. Calcula siempre el tamaño de posición primero.",
    },
    m3c_2: {
      title: "Bitcoin Dominance y Altcoins",
      learningObjective: "Interpretar la participación relativa de Bitcoin y combinarla con precio, liquidez y estructura antes de evaluar altcoins.",
      conceptExplanation: "BTC Dominance (BTC.D) estima el porcentaje del market cap cripto que corresponde a BTC. Si sube, Bitcoin gana participación relativa; si baja, las altcoins la ganan. La dominancia no explica por sí sola si el mercado está subiendo o bajando.",
      practicalExample: "BTC.D bajando + BTC estable o alcista puede acompañar una rotación hacia altcoins. BTC.D subiendo mientras todo cae puede significar que las altcoins pierden valor más rápido, no que esté entrando capital nuevo en Bitcoin.",
      stepByStepInstructions: [
        "Observa el valor de BTC Dominance.",
        "Observa la tendencia de BTC (alcista/bajista/lateral).",
        "Si BTC.D baja + BTC estable → altcoins.",
        "Si BTC.D sube + BTC alcista → BTC.",
        "Si BTC.D alta + BTC bajista → esperar.",
        "Selecciona la acción correcta.",
      ],
      commonMistakes: ["Comprar altcoins cuando BTC está cayendo.", "Ignorar la dominance y operar altcoins por FOMO."],
      hint: "Primero mira a Bitcoin. Si BTC no está bien, las altcoins estarán peor.",
    },
    m3c_3: {
      title: "Ciclos de 4 Años y Halving",
      learningObjective: "Identificar las 4 fases del ciclo crypto (acumulación, impulso, distribución, capitulación) y entender el impacto del halving.",
      conceptExplanation: "El halving reduce aproximadamente cada cuatro años el subsidio que reciben los mineros por bloque. Una emisión nueva menor puede afectar la oferta, pero no garantiza el precio. Acumulación, impulso, distribución y capitulación son modelos para estudiar conducta, no un calendario exacto.",
      practicalExample: "Entre 2022 y 2024 se observaron una caída profunda, una recuperación y un halving. Ese patrón ayuda a estudiar ciclos históricos, pero no permite asegurar que el siguiente ciclo tendrá la misma duración, profundidad o rendimiento.",
      stepByStepInstructions: [
        "Observa el punto marcado en el gráfico histórico.",
        "Analiza: ¿el precio está en máximos, mínimos, o medio?",
        "¿Hay euforia? → Distribución.",
        "¿Hay pánico? → Capitulación.",
        "¿Silencio total? → Acumulación.",
        "¿Subida fuerte? → Impulso.",
      ],
      commonMistakes: ["Vender en capitulación por pánico.", "Comprar en distribución por euforia.", "Pensar que 'esta vez es diferente'."],
      hint: "El ciclo se repite porque las emociones humanas se repiten. Miedo en suelos, codicia en techos.",
    },
    m3c_4: {
      title: "ATR y Análisis Multicapa",
      learningObjective: "Usar el ATR para medir la volatilidad real de un activo crypto y aplicar análisis multi-timeframe correctamente.",
      conceptExplanation: "ATR (Average True Range) mide cuánto se mueve el activo en promedio por período. Si el ATR diario de BTC es $3,000, un SL de $500 se activará por ruido normal. Multi-timeframe: el timeframe mayor (1D, 1W) marca la dirección; el menor (4H, 1H) marca la entrada.",
      practicalExample: "ATR diario de BTC = $3,000. Si tu SL está a $1,000 del precio, la volatilidad normal lo ejecutará en horas sin que tu análisis sea incorrecto. Solución: SL a 1.5×ATR = $4,500 y ajustar tamaño de posición.",
      stepByStepInstructions: [
        "Revisa el timeframe mayor (1W/1D) → identifica la tendencia macro.",
        "Baja al timeframe medio (4H) → identifica la zona de entrada.",
        "Baja al timeframe bajo (1H/15min) → busca la señal de entrada.",
        "Responde las preguntas sobre cada capa de análisis.",
        "La estructura de arriba hacia abajo manda.",
      ],
      commonMistakes: ["Operar en 15min sin ver el diario.", "Poner SL más pequeño que el ATR (se ejecuta por ruido).", "Confundir un rebote en LTF con cambio de tendencia en HTF."],
      hint: "HTF > LTF siempre. Si el diario es bajista y el 15min da señal alcista, probablemente es un rebote temporal.",
    },
    m3c_5: {
      title: "Análisis Integrado Cripto",
      learningObjective: "Combinar ciclo de mercado, BTC Dominance, análisis técnico multicapa y gestión de riesgo en un plan de trading completo para crypto.",
      conceptExplanation: "Un plan crypto completo integra: 1) Fase del ciclo (¿post-halving?), 2) BTC Dominance (¿BTC o altcoins?), 3) Análisis técnico (¿hay zona + señal?), 4) Tamaño de posición (ATR + 2% de riesgo). Sin los 4 pilares, estás especulando.",
      practicalExample: "BTC.D 58% bajando + F&G 76 + BTC 4H corrección a zona de demanda $87K-89K + post-halving semana 8 → sesgo alcista, buscar entrada en la zona con SL debajo + posición calculada al 2%.",
      stepByStepInstructions: [
        "Identifica la fase del ciclo actual.",
        "Lee BTC Dominance: ¿sube o baja?",
        "Decide: ¿operar BTC o altcoins?",
        "Traza entrada + SL + TP con ratio mínimo 1:2.5.",
        "Calcula tamaño de posición al 2% de riesgo.",
      ],
      commonMistakes: ["Saltarse la fase del ciclo e ir directo al gráfico.", "Operar altcoins cuando BTC está en price discovery.", "No respetar el 2% porque 'el setup es muy bueno'."],
      hint: "Sigue la secuencia: ciclo → dominance → zona → señal → riesgo. Si falta un paso, no operes.",
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
  const hasMounted = useHasMounted();
  const missionId = params.id as string;

  const { isMissionCompleted, isMissionUnlocked, completeMission } = useGameStore();

  // Find mission in all levels
  const mission = getMissionById(missionId) || getLevel2MissionById(missionId) || getLevel3CryptoMissionById(missionId);
  const levelId = missionId.startsWith("m1_") ? "level_1" : missionId.startsWith("m2_") ? "level_2" : "level_3_crypto";

  const [phase, setPhase] = useState<Phase>("intro");
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [outroIndex, setOutroIndex] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [earnedRewards, setEarnedRewards] = useState(false);
  const [minigameAttempt, setMinigameAttempt] = useState(0);
  const [assessmentFailure, setAssessmentFailure] = useState<string | null>(null);

  useEffect(() => {
    setBlocked(false);
    setPhase("intro");
    setDialogueIndex(0);
    setOutroIndex(0);
    setEarnedRewards(false);
    setMinigameAttempt(0);
    setAssessmentFailure(null);
    if (!mission) { router.push("/dashboard"); return; }
    // Development-only bypass for local QA.
    const params = new URLSearchParams(window.location.search);
    if (process.env.NODE_ENV === "development" && params.get("dev") === "true") return;
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
  const alreadyCompleted = hasMounted && isMissionCompleted(levelId, missionId);
  const totalCapitalReward = mission.rewards.virtualCapital + (mission.minigame?.virtualCapitalReward ?? 0);
  const passingScore = mission.minigame?.passingScore ?? 70;

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
    setAssessmentFailure(null);
    setPhase("minigame");
  };

  const handleMinigameComplete = (minigameScore?: number) => {
    const score = minigameScore ?? 100;
    if (score < passingScore) {
      setAssessmentFailure(`Obtuviste ${score}%. Necesitas ${passingScore}% para aprobar esta práctica.`);
      return;
    }
    setAssessmentFailure(null);
    if (mission.quiz.length > 0) setPhase("quiz");
    else handleMissionComplete(score);
  };

  const handleQuizComplete = (score: number, total: number) => {
    const percent = Math.round((score / total) * 100);
    if (percent < passingScore) return;
    handleMissionComplete(percent);
  };

  const handleMissionComplete = (score: number) => {
    if (!isMissionCompleted(levelId, missionId)) {
      completeMission(levelId, missionId, score);
      setEarnedRewards(true);
    }
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
          {totalCapitalReward > 0 && (
            <span className="font-data text-tp-demand">+{formatCurrency(totalCapitalReward)}</span>
          )}
          {alreadyCompleted && <span className="text-tp-text-muted">(ya completada)</span>}
        </div>
      </div>

      {(phase === "intro" || phase === "tutorial" || phase === "quiz") && (
        <MissionMarketChart missionId={mission.id} />
      )}

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
            {assessmentFailure && (
              <div role="alert" className="mb-4 rounded-xl border border-tp-supply/40 bg-tp-supply/10 p-4">
                <p className="font-display text-sm font-bold text-tp-supply">Práctica no superada</p>
                <p className="mt-1 text-xs leading-relaxed text-tp-text-muted">{assessmentFailure}</p>
                <button
                  type="button"
                  onClick={() => {
                    setAssessmentFailure(null);
                    setMinigameAttempt((attempt) => attempt + 1);
                  }}
                  className="mt-3 rounded-lg bg-tp-gold px-4 py-2 font-display text-xs font-bold text-tp-base"
                >
                  Repetir práctica
                </button>
              </div>
            )}
            <div key={minigameAttempt} className={assessmentFailure ? "pointer-events-none opacity-45" : ""}>
            {/* match_term */}
            {mission.minigame.type === "match_term" && mission.minigame.config?.pairs ? (
              <MatchTermMinigame
                pairs={mission.minigame.config.pairs as { term: string; definition: string }[]}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "chart_tap" && mission.minigame.config?.charts ? (
              <ChartTapGame
                charts={mission.minigame.config.charts as { id: string; type: "bullish" | "bearish" | "sideways"; hint: string }[]}
                passingScore={mission.minigame.passingScore}
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
            ) : mission.minigame.type === "pair_calculator" && mission.minigame.config?.scenarios ? (
              <PairCalculator
                capital={mission.minigame.config.capital as number}
                riskPct={mission.minigame.config.riskPct as number}
                scenarios={mission.minigame.config.scenarios as PairScenario[]}
                tolerance={mission.minigame.config.tolerance as number}
                passingScore={mission.minigame.passingScore}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "dominance_gauge" && mission.minigame.config?.scenarios ? (
              <DominanceGauge
                scenarios={mission.minigame.config.scenarios as DominanceScenario[]}
                requiredCorrect={mission.minigame.config.requiredCorrect as number}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "cycle_mapper" && mission.minigame.config?.events ? (
              <CycleMapper
                events={mission.minigame.config.events as CycleEvent[]}
                requiredCorrect={mission.minigame.config.requiredCorrect as number}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "timeframe_switcher" ? (
              <TimeframeSwitcher
                asset={mission.minigame.config.asset as string}
                timeframes={mission.minigame.config.timeframes as string[]}
                requiredCorrect={mission.minigame.config.requiredCorrect as number}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "fear_greed_slider" && mission.minigame.config?.scenario ? (
              <CryptoIntegratedAnalysis
                scenario={mission.minigame.config.scenario as CryptoScenario}
                capital={mission.minigame.config.capital as number}
                minRR={mission.minigame.config.minRR as number}
                maxRisk={mission.minigame.config.maxRisk as number}
                passingSteps={mission.minigame.config.passingSteps as number}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "bitcoin_origin" ? (
              <BitcoinOriginGame onComplete={handleMinigameComplete} />
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
        </div>
      )}

      {/* Phase: Quiz */}
      {phase === "quiz" && mission.quiz.length > 0 && (
        <div className="bg-tp-surface border border-tp-border rounded-md p-6">
          <QuizEngine
            questions={mission.quiz}
            onComplete={handleQuizComplete}
            minPassPercent={passingScore}
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
          {earnedRewards && (
            <p className="text-tp-text-muted">
              Has ganado <span className="font-data text-tp-gold font-bold">+{mission.rewards.xp} XP</span>
              {totalCapitalReward > 0 && (
                <>
                  {" y "}
                  <span className="font-data text-tp-demand font-bold">+{formatCurrency(totalCapitalReward)}</span>
                </>
              )}
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
