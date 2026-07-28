"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMissionById } from "@/lib/content/level1";
import { getLevel2MissionById } from "@/lib/content/level2";
import { getLevel3CryptoMissionById } from "@/lib/content/level3-crypto";
import { getLevel3ForexMissionById } from "@/lib/content/level3-forex";
import { getLevel3StocksMissionById } from "@/lib/content/level3-stocks";
import CharacterDialogue from "@/components/narrative/CharacterDialogue";
import QuizEngine from "@/components/game/QuizEngine";
import MatchTermMinigame from "@/components/game/MatchTermMinigame";
import SupplyDemandLab, { type SupplyDemandLabConfig } from "@/components/game/SupplyDemandLab";
import GaugeLab, { type GaugeLabConfig } from "@/components/game/GaugeLab";
import CandleLab, { type CandleLabConfig } from "@/components/game/CandleLab";
import StructureLab, { type StructureLabConfig } from "@/components/game/StructureLab";
import LevelLab, { type LevelLabConfig } from "@/components/game/LevelLab";
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
import SessionClock, { type SessionScenario } from "@/components/game/SessionClock";
import PipLotCalculator, { type PipLotScenario } from "@/components/game/PipLotCalculator";
import CorrelationMatrix, { type CorrelationScenario } from "@/components/game/CorrelationMatrix";
import NewsImpactPlanner, { type NewsScenario } from "@/components/game/NewsImpactPlanner";
import ForexTradePlanWizard, { type ForexScenario } from "@/components/game/ForexTradePlanWizard";
import SectorMap, { type SectorScenario } from "@/components/game/SectorMap";
import EarningsReaction, { type EarningsScenario } from "@/components/game/EarningsReaction";
import CorporateActionPlanner, { type CorporateActionScenario } from "@/components/game/CorporateActionPlanner";
import SectorBetaGauge, { type SectorBetaScenario } from "@/components/game/SectorBetaGauge";
import StockTradePlanWizard, { type StockScenario } from "@/components/game/StockTradePlanWizard";
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
      title: "Tu Puesto de Manzanas",
      learningObjective: "Descubrir, moviendo tú mismo los controles, qué hace que el precio suba o baje.",
      conceptExplanation: "Hoy tienes un puesto de manzanas. Puedes cambiar dos cosas: cuántos clientes llegan y cuántas manzanas tienes. El precio sale solo de esos dos números — nadie te va a dar la regla por adelantado, la vas a ver tú.",
      practicalExample: "Prueba y observa: sube los clientes y mira el precio. Después sube las manzanas y mira otra vez. ¿Notas hacia dónde se mueve cada vez?",
      stepByStepInstructions: [
        "Mueve el control de clientes y observa el precio.",
        "Mueve el control de manzanas y observa el precio.",
        "Resuelve el primer reto: sube el precio sin tocar las manzanas.",
        "Resuelve el segundo: baja el precio sin tocar los clientes.",
        "Responde qué fue lo que hizo subir el precio.",
      ],
      commonMistakes: ["Creer que el precio lo escribes tú — en el puesto el precio nace solo de cuántos quieren contra cuánto hay."],
      hint: "Fíjate en cuál es mayor: ¿los clientes o las manzanas?",
    },
    m1_2: {
      title: "Construye tu Vela",
      learningObjective: "Descubrir, armando la vela tú mismo, qué hace su color, su cuerpo y sus mechas.",
      conceptExplanation: "Tienes cuatro mandos —apertura, cierre, máximo y mínimo— y la vela se dibuja sola con lo que pongas. Nadie te dice qué la pone verde ni qué es una mecha: lo vas a ver moviéndolos.",
      practicalExample: "Prueba: sube el cierre por encima de la apertura y mira el color. Sube el máximo por encima del cuerpo y mira qué aparece arriba.",
      stepByStepInstructions: [
        "Mueve la apertura y el cierre y observa el color y el cuerpo.",
        "Mueve el máximo y el mínimo y observa las mechas.",
        "Reto 1: haz una vela verde.",
        "Reto 2: dale una mecha superior larga.",
        "Responde qué hace que la vela sea verde.",
      ],
      commonMistakes: ["Creer que el color depende del máximo o del volumen — solo depende de cierre contra apertura."],
      hint: "Para el color, fíjate solo en una cosa: ¿el cierre quedó por encima o por debajo de la apertura?",
    },
    m1_3: {
      title: "El Observatorio de Tendencias",
      learningObjective: "Descubrir, fabricándola tú, qué distingue una tendencia alcista de una bajista o lateral.",
      conceptExplanation: "Tienes un control que sube o baja cada nuevo máximo y mínimo del gráfico. La etiqueta (alcista, bajista o lateral) aparece sola según lo que hagas. No te doy la regla: la vas a ver.",
      practicalExample: "Prueba: sube el control y observa cómo la escalera de picos y valles asciende y la etiqueta cambia. Bájalo y mira qué pasa.",
      stepByStepInstructions: [
        "Mueve el control hacia arriba y observa el gráfico y su etiqueta.",
        "Muévelo hacia abajo y observa de nuevo.",
        "Reto 1: fabrica una tendencia alcista.",
        "Reto 2: fabrica una tendencia bajista.",
        "Responde qué define una tendencia alcista.",
      ],
      commonMistakes: ["Mirar una sola vela — la tendencia es la estructura de TODO el gráfico, no un movimiento suelto."],
      hint: "Fíjate en los picos y los valles: ¿cada uno queda más alto o más bajo que el anterior?",
    },
    m1_4: {
      title: "El Medidor de Riesgo",
      learningObjective: "Descubrir, moviendo tú los controles, qué hace que arriesgues más o menos de tu capital.",
      conceptExplanation: "Tienes un capital fijo y dos mandos: el tamaño de la posición (unidades) y la distancia del Stop Loss. Un medidor te muestra en vivo cuánto de tu capital pones en riesgo. Nadie te da la regla: la vas a ver en el medidor.",
      practicalExample: "Prueba: sube las unidades y mira el medidor. Vuelve a bajarlas y aleja el stop. ¿Cuál de los dos, o ambos, lo hacen subir?",
      stepByStepInstructions: [
        "Mueve el tamaño de la posición y observa el medidor.",
        "Mueve la distancia del Stop Loss y observa el medidor.",
        "Reto 1: baja el riesgo al 2% o menos sin tocar el stop.",
        "Reto 2: baja el riesgo al 2% o menos sin tocar las unidades.",
        "Responde qué hace subir el riesgo.",
      ],
      commonMistakes: ["Creer que el riesgo solo depende de una de las dos cosas — depende de ambas a la vez."],
      hint: "El riesgo sube si aumentas las unidades O si alejas el stop. ¿Por qué será?",
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
      title: "Las Zonas del Poder",
      learningObjective: "Descubrir, moviendo tú los controles, qué hace fuerte a una zona de oferta o demanda.",
      conceptExplanation: "Tienes una zona y dos mandos: con cuánta fuerza salió el precio de ella y cuántas veces volvió a tocarla. Un medidor te muestra su fuerza en vivo. No te doy la regla: la vas a ver.",
      practicalExample: "Prueba: sube la fuerza de salida y mira la zona fortalecerse; luego sube los retesteos y mírala debilitarse.",
      stepByStepInstructions: [
        "Mueve la fuerza de salida y observa la fuerza de la zona.",
        "Mueve los retesteos y observa de nuevo.",
        "Reto 1: haz una zona fresca y fuerte.",
        "Reto 2: quémala con retesteos.",
        "Responde qué hace fuerte a una zona.",
      ],
      commonMistakes: ["Creer que más toques fortalecen la zona — la queman."],
      hint: "Una zona nace de una salida FUERTE; cada vez que el precio vuelve, gasta parte de ella.",
    },
    m2_2: {
      title: "El Mapa del Precio",
      learningObjective: "Descubrir qué fortalece un nivel y en qué se convierte cuando se rompe.",
      conceptExplanation: "Tienes un nivel y dos mandos: cuántas veces el precio rebota en él, y un botón para romperlo. Su fuerza y su nombre cambian según lo que hagas. La regla la descubres tú.",
      practicalExample: "Prueba: sube los rebotes y mira el nivel fortalecerse; luego rómpelo y mira su nombre cambiar de Soporte a Resistencia.",
      stepByStepInstructions: [
        "Sube los rebotes y observa la fuerza del nivel.",
        "Pulsa 'Romper el nivel' y observa qué pasa.",
        "Reto 1: haz un soporte fuerte.",
        "Reto 2: rómpelo para convertirlo en resistencia.",
        "Responde en qué se convierte un soporte roto.",
      ],
      commonMistakes: ["Asumir que un soporte roto sigue siendo soporte — cambia de rol."],
      hint: "Cuantos más rebotes, más fuerte. Al romperse, el nivel cambia de rol.",
    },
    m2_3: {
      title: "El Taller de Patrones",
      learningObjective: "Descubrir, dándole forma a una vela, qué silueta es un martillo y cuál una estrella fugaz.",
      conceptExplanation: "Mueves los cuatro precios de una vela y su nombre de patrón aparece solo según la forma. No te listo los patrones: los vas a ver nacer.",
      practicalExample: "Prueba: cuerpo pequeño con mecha inferior larga → aparece 'Martillo'; cuerpo pequeño con mecha superior larga → 'Estrella fugaz'.",
      stepByStepInstructions: [
        "Mueve los cuatro precios y observa el nombre del patrón.",
        "Reto 1: haz un martillo (mecha inferior larga).",
        "Reto 2: haz una estrella fugaz (mecha superior larga).",
        "Responde qué hace que una vela sea un martillo.",
      ],
      commonMistakes: ["Fijarte en el color — el patrón lo define la silueta (cuerpo y mechas), no el color.", "Olvidar que un patrón solo vale con contexto (zona y tendencia)."],
      hint: "El martillo tiene el cuerpo arriba y una mecha inferior larga: el precio bajó y fue rechazado.",
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
    m3f_1: {
      title: "Las Cuatro Sesiones de Forex",
      learningObjective: "Ubicar las sesiones de Sídney, Tokio, Londres y Nueva York en horario UTC e identificar el overlap de mayor liquidez.",
      conceptExplanation: "Forex opera 24 horas, 5 días a la semana, repartido en cuatro sesiones regionales que se relevan. El overlap Londres-Nueva York (~13:00-17:00 UTC) concentra el mayor volumen del día. Fuera de los overlaps grandes, la liquidez baja y el spread puede ensancharse, especialmente cerca del rollover diario (~21:00-22:00 UTC).",
      practicalExample: "Son las 14:00 UTC: Londres y Nueva York están activas al mismo tiempo. Es un buen momento para operar con spreads ajustados. A las 23:00 UTC, ninguna sesión grande está en pleno funcionamiento — mejor esperar.",
      stepByStepInstructions: [
        "Observa la hora UTC del escenario.",
        "Identifica qué sesiones están activas en ese momento.",
        "¿Dos sesiones grandes se solapan? → Máxima liquidez.",
        "¿Solo una sesión activa? → Liquidez normal.",
        "¿Ninguna sesión grande activa? → Liquidez baja, mejor esperar.",
        "¿Cerca de las 21:00-22:00 UTC? → Cuidado con el rollover.",
      ],
      commonMistakes: ["Asumir que forex opera igual que crypto, sin sesiones.", "Ignorar el ensanchamiento de spread en horarios de baja liquidez."],
      hint: "El overlap Londres-Nueva York es tu referencia de máxima liquidez. El resto del día, ajusta tus expectativas.",
    },
    m3f_2: {
      title: "Pips, Lotes y Apalancamiento",
      learningObjective: "Calcular el tamaño de posición correcto en lotes usando la distancia del Stop Loss en pips y el valor del pip por lote.",
      conceptExplanation: "Un pip es la unidad mínima de movimiento en forex (0.0001 para la mayoría de pares, 0.01 para pares con yen). Un lote estándar son 100,000 unidades; mini lote, 10,000; micro lote, 1,000. El apalancamiento define el margen necesario para abrir una posición, no cuánto deberías arriesgar.",
      practicalExample: "Capital $3,000, riesgo 2% ($60). Stop Loss a 20 pips, valor del pip por lote $10. Lotes = $60 ÷ (20 × $10) = 0.3 lotes.",
      stepByStepInstructions: [
        "Calcula el riesgo máximo: capital × % de riesgo.",
        "Multiplica los pips de distancia del SL por el valor del pip por lote.",
        "Divide el riesgo máximo entre ese resultado.",
        "Ingresa el número de lotes.",
      ],
      commonMistakes: ["Confundir el apalancamiento disponible con el tamaño de posición recomendado.", "Olvidar que los pares con yen usan un pip distinto (0.01, no 0.0001)."],
      hint: "Fórmula clave: lotes = riesgo máximo ÷ (SL en pips × valor del pip por lote).",
    },
    m3f_3: {
      title: "Correlación entre Pares",
      learningObjective: "Leer un coeficiente de correlación entre dos pares y detectar sobre-exposición oculta.",
      conceptExplanation: "El coeficiente de correlación va de -1 a +1. Cerca de +1, los pares se mueven juntos — abrir ambos en la misma dirección duplica una sola apuesta. Cerca de -1, se mueven en direcciones opuestas — pueden compensarse entre sí. Cerca de 0, son prácticamente independientes.",
      practicalExample: "EUR/USD y GBP/USD suelen tener correlación positiva fuerte (~+0.85): abrir ambos largos no diversifica, concentra riesgo. EUR/USD y USD/CHF suelen tener correlación negativa fuerte (~-0.90): tienden a compensarse.",
      stepByStepInstructions: [
        "Observa el coeficiente de correlación entre los dos pares.",
        "¿Cerca de +1? → Misma dirección, fuerte.",
        "¿Cerca de -1? → Dirección opuesta, fuerte.",
        "¿Entre -0.3 y +0.3? → Prácticamente independientes.",
        "¿En un punto intermedio? → Relación moderada, no determinante.",
      ],
      commonMistakes: ["Pensar que operar varios pares siempre diversifica el riesgo.", "Tratar la correlación como una ley fija en vez de una tendencia estadística."],
      hint: "Antes de abrir una nueva posición, pregúntate qué correlación tiene con lo que ya tienes abierto.",
    },
    m3f_4: {
      title: "Calendario Económico y Noticias",
      learningObjective: "Decidir la acción más prudente según el nivel de impacto de un evento económico y su cercanía en el tiempo.",
      conceptExplanation: "Eventos como NFP, IPC o decisiones de tasas de interés suelen ensanchar el spread y aumentar el slippage antes y durante su publicación. Sin una posición abierta, lo prudente es evitar entrar justo antes. Con una posición y Stop Loss ajustado, conviene ampliar el SL o cerrar antes del evento.",
      practicalExample: "Faltan 3 minutos para el NFP y no tienes posición abierta → evita abrir una nueva. Tienes EUR/USD largo con SL ajustado y se acerca una decisión de tasas de la Fed → considera ampliar el SL o cerrar antes.",
      stepByStepInstructions: [
        "Observa el nivel de impacto del evento (bajo, medio, alto).",
        "Observa cuánto falta o cuánto pasó desde la publicación.",
        "¿Sin posición y evento de alto impacto cercano? → Evitar entrar.",
        "¿Evento recién publicado? → Esperar confirmación.",
        "¿Con posición abierta y SL ajustado? → Proteger la posición.",
        "¿Evento de bajo/medio impacto y lejano? → Operar con normalidad.",
      ],
      commonMistakes: ["Abrir posiciones nuevas justo antes de un evento de alto impacto.", "Dejar un Stop Loss muy ajustado sin revisar el calendario económico."],
      hint: "El calendario no predice la dirección — predice cuándo el mercado puede volverse errático.",
    },
    m3f_5: {
      title: "Plan de Trading Integrado — Forex",
      learningObjective: "Combinar contexto de sesión, riesgo de correlación y noticias, y gestión de riesgo en pips y lotes en un plan de trading completo.",
      conceptExplanation: "Un plan forex completo integra: 1) Contexto de sesión (¿hay liquidez suficiente?), 2) Riesgo de correlación y noticias (¿ya tienes exposición relacionada?), 3) Elección del par correcto, 4) Entrada + SL + TP con ratio mínimo, 5) Tamaño de posición en lotes al riesgo máximo permitido.",
      practicalExample: "Overlap Londres-NY activo + ya tienes EUR/USD largo + NFP en 12 minutos → reduce el riesgo total antes de sumar exposición, prioriza un par no correlacionado positivamente con tu posición existente, y calcula el tamaño en lotes respetando el 2% de riesgo.",
      stepByStepInstructions: [
        "Evalúa si el contexto de sesión ofrece suficiente liquidez.",
        "Evalúa el riesgo de correlación y noticias con tus posiciones existentes.",
        "Elige el par que no duplica el riesgo ya asumido.",
        "Traza entrada + SL + TP con ratio mínimo indicado.",
        "Calcula el tamaño de posición en lotes al riesgo máximo permitido.",
      ],
      commonMistakes: ["Ignorar una posición correlacionada ya abierta al elegir el nuevo par.", "Operar con el tamaño de lote incorrecto por no convertir pips a valor monetario."],
      hint: "Sigue la secuencia: sesión → correlación/noticias → par → entrada/SL/TP → tamaño. Si falta un paso, no operes.",
    },
    m3s_1: {
      title: "Market Cap y Sectores",
      learningObjective: "Clasificar empresas por capitalización de mercado (large/mid/small cap) y entender el rol de los sectores y los índices como canastas diversificadas.",
      conceptExplanation: "Capitalización de mercado = precio por acción × acciones en circulación. Large cap (sobre $10,000M) suele tener más liquidez y menor volatilidad relativa. Small cap (bajo $2,000M) suele tener mayor volatilidad y menor liquidez. Un índice como el S&P 500 diluye el riesgo de una sola empresa entre cientos de ellas.",
      practicalExample: "AAPL tiene una capitalización de casi $2,900,000 millones — claramente large cap, con alta liquidez. Una empresa con $1,400 millones de capitalización es small cap: más volátil, menos líquida.",
      stepByStepInstructions: [
        "Observa el ticker, el sector y la capitalización de mercado en miles de millones (B).",
        "Compara la cifra contra los umbrales: large cap ≥ $10,000M, mid cap entre $2,000M y $10,000M, small cap < $2,000M.",
        "Elige la clasificación correcta.",
        "Lee la explicación aunque hayas acertado.",
      ],
      commonMistakes: ["Confundir el precio por acción con la capitalización total.", "Asumir que una acción con precio bajo es necesariamente small cap (el precio nominal no determina el tamaño de la empresa)."],
      hint: "Capitalización = precio × acciones en circulación, no el precio por acción solo.",
    },
    m3s_2: {
      title: "Temporada de Resultados",
      learningObjective: "Interpretar EPS, ingresos y guidance frente a las expectativas de analistas, y reconocer el riesgo de gap al mantener una posición durante un reporte pendiente.",
      conceptExplanation: "Lo que mueve el precio no es si la empresa ganó dinero, sino si sorprendió (beat/miss/inline) respecto a lo que el mercado ya esperaba. La guía a futuro (guidance) pesa tanto como el resultado del trimestre. Mantener una posición con un reporte pendiente expone a un gap de apertura que ningún Stop Loss puede prevenir.",
      practicalExample: "AAPL reporta EPS de $2.40 contra $2.10 esperado (beat) y eleva su guía → reacción alcista fuerte esperada. NVDA reporta en 2 días → mejor evitar abrir una posición nueva hasta que se publique.",
      stepByStepInstructions: [
        "Observa si el reporte ya se publicó o está pendiente.",
        "Si está pendiente, la decisión prudente es evitar entrar antes.",
        "Si ya se publicó, compara EPS (beat/miss/inline) y guidance (raised/lowered/maintained).",
        "Beat + guía elevada → reacción alcista fuerte. Miss → reacción bajista. El resto → mixta, con cautela.",
      ],
      commonMistakes: ["Abrir una posición nueva justo antes de un reporte pendiente.", "Suponer que un buen EPS garantiza una reacción alcista sin revisar la guía."],
      hint: "Lo que mueve el precio es la sorpresa respecto a lo esperado, no el resultado en sí mismo.",
    },
    m3s_3: {
      title: "Dividendos y Acciones Corporativas",
      learningObjective: "Interpretar la fecha ex-dividendo, los splits de acciones y las recompras, distinguiendo un ajuste técnico de una ganancia o pérdida real.",
      conceptExplanation: "Para cobrar un dividendo debes poseer la acción antes de la fecha ex-dividendo. El precio suele ajustarse a la baja ese día, aproximadamente por el monto del dividendo — no es una pérdida real. Un split cambia el número de acciones y el precio nominal, pero no el valor total de la posición. Una recompra reduce las acciones en circulación y es una señal moderadamente positiva, sin garantía.",
      practicalExample: "Un split 2:1 convierte 10 acciones de $150 ($1,500 total) en 20 acciones de $75 ($1,500 total) — el valor no cambió. Un ajuste ex-dividendo de $0.75 en el precio de apertura no es una señal bajista: es el reflejo del dividendo pagado.",
      stepByStepInstructions: [
        "Lee la situación descrita: ¿split, fecha ex-dividendo, o recompra?",
        "Si es un split, recuerda que el valor total no cambia — no es un descuento real.",
        "Si es sobre la fecha ex-dividendo, determina si el jugador aún puede calificar para el pago o ya no.",
        "Si es una recompra, recuerda que es una señal positiva, pero no una garantía.",
      ],
      commonMistakes: ["Pensar que un split hace la acción 'más barata' en términos reales.", "Confundir un ajuste técnico ex-dividendo con una señal bajista real."],
      hint: "Pregúntate: ¿este evento cambia el valor total de la empresa, o solo la forma en que se representa?",
    },
    m3s_4: {
      title: "Rotación Sectorial y Beta",
      learningObjective: "Interpretar el beta como volatilidad relativa al mercado y decidir la exposición sectorial según la fase del ciclo económico.",
      conceptExplanation: "El beta mide cuánto se mueve una acción o sector respecto al mercado general: beta > 1 amplifica los movimientos, beta < 1 los amortigua. Los sectores cíclicos (tecnología, consumo discrecional, industriales) suelen liderar en expansión. Los defensivos (utilities, consumo básico, salud) suelen sostenerse mejor en contracción.",
      practicalExample: "Tecnología con beta 1.4 en expansión → sobreponderar. Utilities con beta 0.5 en contracción → preferir sectores defensivos. Salud con beta 0.7 en contexto incierto → exposición neutral.",
      stepByStepInstructions: [
        "Observa el sector, su beta y el contexto del ciclo económico.",
        "¿Contexto de expansión + beta alto? → Sobreponderar.",
        "¿Contexto de contracción + beta alto? → Subponderar.",
        "¿Contracción + beta bajo? → Preferir defensivos.",
        "¿Contexto incierto o beta moderado? → Exposición neutral.",
      ],
      commonMistakes: ["Perseguir siempre el sector de mayor beta sin importar el contexto económico.", "Ignorar la fase del ciclo económico al decidir exposición sectorial."],
      hint: "Combina siempre el beta (amplitud del movimiento) con el contexto del ciclo (dirección esperada), nunca uno solo.",
    },
    m3s_5: {
      title: "Plan de Trading Integrado — Stocks",
      learningObjective: "Combinar contexto sectorial, riesgo de concentración y earnings, y gestión de riesgo en acciones en un plan de trading completo.",
      conceptExplanation: "Un plan de acciones completo integra: 1) Contexto sectorial (¿el sector tiene viento a favor?), 2) Riesgo de concentración y earnings (¿ya tienes exposición al sector? ¿hay un reporte cercano?), 3) Elección de la acción correcta, 4) Entrada + SL + TP con ratio mínimo, 5) Tamaño de posición en acciones al riesgo máximo permitido.",
      practicalExample: "Expansión con tecnología liderando + ya tienes MSFT (tecnología) + AAPL reporta en 3 días → reduce el riesgo total, prioriza NVDA (mismo sector, sin earnings inminentes) sobre AAPL, y calcula el tamaño en acciones respetando el 2% de riesgo.",
      stepByStepInstructions: [
        "Evalúa si el contexto sectorial favorece mantener exposición.",
        "Evalúa el riesgo de concentración y earnings con tus posiciones existentes.",
        "Elige la acción que no duplica el riesgo ya asumido.",
        "Traza entrada + SL + TP con ratio mínimo indicado.",
        "Calcula el tamaño de posición en acciones al riesgo máximo permitido.",
      ],
      commonMistakes: ["Ignorar una posición correlacionada por sector ya abierta al elegir la nueva acción.", "Sumar el riesgo de un reporte de earnings inminente sin ajustar el plan."],
      hint: "Sigue la secuencia: sector → concentración/earnings → acción → entrada/SL/TP → tamaño. Si falta un paso, no operes.",
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
  if (levelId === "level_3_forex") return "Nivel 3 — Forex";
  if (levelId === "level_3_stocks") return "Nivel 3 — Stocks";
  return "Nivel";
}

export default function MissionPage() {
  const params = useParams();
  const router = useRouter();
  const hasMounted = useHasMounted();
  const missionId = params.id as string;

  const { isMissionCompleted, isMissionUnlocked, completeMission } = useGameStore();

  // Find mission in all levels
  const mission = getMissionById(missionId) || getLevel2MissionById(missionId) || getLevel3CryptoMissionById(missionId) || getLevel3ForexMissionById(missionId) || getLevel3StocksMissionById(missionId);
  const levelId = missionId.startsWith("m1_") ? "level_1"
    : missionId.startsWith("m2_") ? "level_2"
    : missionId.startsWith("m3f_") ? "level_3_forex"
    : missionId.startsWith("m3s_") ? "level_3_stocks"
    : "level_3_crypto";

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
    if (!mission) { router.push("/world"); return; }
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
        <button onClick={() => router.push("/world")} className="px-6 py-2 bg-tp-gold text-tp-text font-display font-bold rounded-sm hover:brightness-110 transition">
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
          <button onClick={handleIntroNext} className="px-6 py-2 bg-tp-gold text-tp-text font-display font-bold rounded-sm hover:brightness-110 transition">
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
                  className="mt-3 rounded-lg bg-tp-gold px-4 py-2 font-display text-xs font-bold text-tp-text"
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
            ) : mission.minigame.type === "supply_demand_lab" && mission.minigame.config?.challenges ? (
              <SupplyDemandLab
                config={mission.minigame.config as unknown as SupplyDemandLabConfig}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "gauge_lab" && mission.minigame.config?.challenges ? (
              <GaugeLab
                config={mission.minigame.config as unknown as GaugeLabConfig}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "candle_lab" && mission.minigame.config?.challenges ? (
              <CandleLab
                config={mission.minigame.config as unknown as CandleLabConfig}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "structure_lab" && mission.minigame.config?.challenges ? (
              <StructureLab
                config={mission.minigame.config as unknown as StructureLabConfig}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "level_lab" && mission.minigame.config?.challenges ? (
              <LevelLab
                config={mission.minigame.config as unknown as LevelLabConfig}
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
            ) : mission.minigame.type === "session_clock" && mission.minigame.config?.scenarios ? (
              <SessionClock
                scenarios={mission.minigame.config.scenarios as SessionScenario[]}
                requiredCorrect={mission.minigame.config.requiredCorrect as number}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "pip_lot_calculator" && mission.minigame.config?.scenarios ? (
              <PipLotCalculator
                capital={mission.minigame.config.capital as number}
                riskPct={mission.minigame.config.riskPct as number}
                scenarios={mission.minigame.config.scenarios as PipLotScenario[]}
                tolerance={mission.minigame.config.tolerance as number}
                passingScore={mission.minigame.passingScore}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "correlation_matrix" && mission.minigame.config?.scenarios ? (
              <CorrelationMatrix
                scenarios={mission.minigame.config.scenarios as CorrelationScenario[]}
                requiredCorrect={mission.minigame.config.requiredCorrect as number}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "news_impact_planner" && mission.minigame.config?.scenarios ? (
              <NewsImpactPlanner
                scenarios={mission.minigame.config.scenarios as NewsScenario[]}
                requiredCorrect={mission.minigame.config.requiredCorrect as number}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "trade_plan_wizard" && mission.minigame.config?.scenario ? (
              <ForexTradePlanWizard
                scenario={mission.minigame.config.scenario as ForexScenario}
                capital={mission.minigame.config.capital as number}
                minRR={mission.minigame.config.minRR as number}
                maxRisk={mission.minigame.config.maxRisk as number}
                passingSteps={mission.minigame.config.passingSteps as number}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "sector_map" && mission.minigame.config?.scenarios ? (
              <SectorMap
                scenarios={mission.minigame.config.scenarios as SectorScenario[]}
                requiredCorrect={mission.minigame.config.requiredCorrect as number}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "earnings_reaction" && mission.minigame.config?.scenarios ? (
              <EarningsReaction
                scenarios={mission.minigame.config.scenarios as EarningsScenario[]}
                requiredCorrect={mission.minigame.config.requiredCorrect as number}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "corporate_action_planner" && mission.minigame.config?.scenarios ? (
              <CorporateActionPlanner
                scenarios={mission.minigame.config.scenarios as CorporateActionScenario[]}
                requiredCorrect={mission.minigame.config.requiredCorrect as number}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "sector_beta_gauge" && mission.minigame.config?.scenarios ? (
              <SectorBetaGauge
                scenarios={mission.minigame.config.scenarios as SectorBetaScenario[]}
                requiredCorrect={mission.minigame.config.requiredCorrect as number}
                onComplete={handleMinigameComplete}
              />
            ) : mission.minigame.type === "stock_trade_plan_wizard" && mission.minigame.config?.scenario ? (
              <StockTradePlanWizard
                scenario={mission.minigame.config.scenario as StockScenario}
                capital={mission.minigame.config.capital as number}
                minRR={mission.minigame.config.minRR as number}
                maxRisk={mission.minigame.config.maxRisk as number}
                passingSteps={mission.minigame.config.passingSteps as number}
                onComplete={handleMinigameComplete}
              />
            ) : (
              <div className="space-y-3">
                <div className="bg-tp-base border border-tp-border rounded-sm p-4">
                  <p className="text-sm text-tp-text-muted italic">{mission.minigame.instructions}</p>
                </div>
                <button onClick={() => handleMinigameComplete()} className="px-6 py-2 bg-tp-gold text-tp-text font-display font-bold rounded-sm hover:brightness-110 transition">
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
          <button onClick={handleOutroNext} className="px-6 py-2 bg-tp-gold text-tp-text font-display font-bold rounded-sm hover:brightness-110 transition">
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
          <button onClick={() => router.push("/world")} className="px-6 py-3 bg-tp-gold text-tp-text font-display font-bold rounded-sm hover:brightness-110 transition">
            Volver al Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
