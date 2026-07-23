// ============================================================
// TraderPath — Level 3: "Distrito FX"
// Ruta de especialización: FOREX (DIVISAS)
// Requiere: Nivel 2 completado + especialización "forex" elegida
// ============================================================

import type {
  CharacterId,
  DialogueEntry,
  QuizQuestion,
  MissionRewards,
} from "./level1"

import type {
  Level2Mission,
  Level2Minigame,
  Level2MinigameType,
} from "./level2"

// ─── TIPOS ESPECÍFICOS DE NIVEL 3 FOREX ────────────────────

export type Level3ForexMinigameType =
  | Level2MinigameType
  | "session_clock"
  | "pip_lot_calculator"
  | "correlation_matrix"
  | "news_impact_planner"
  | "trade_plan_wizard"

export interface Level3ForexMinigame extends Omit<Level2Minigame, "type"> {
  type: Level3ForexMinigameType
}

export interface Level3ForexMission extends Omit<Level2Mission, "minigame"> {
  minigame?: Level3ForexMinigame
  referenceAssets: string[]
  forexConcepts: string[]
}

export interface Level3ForexConfig {
  id: string
  order: number
  specialization: "forex"
  title: string
  tagline: string
  description: string
  cityName: string
  cityTagline: string
  startingCapitalEstimate: number
  totalMissions: number
  xpRequired: number
  missions: Level3ForexMission[]
}

// ─── NIVEL 3 — RUTA FOREX ───────────────────────────────────

export const level3Forex: Level3ForexConfig = {
  id: "level_3_forex",
  order: 3,
  specialization: "forex",
  title: "Distrito FX",
  tagline: "El mercado más líquido del mundo no tiene un centro. Tiene cuatro relojes.",
  description: "En Distrito FX aprenderás a operar el mercado de divisas: cómo se reparte la liquidez entre las sesiones de Sídney, Tokio, Londres y Nueva York, la matemática de pips y lotes, por qué algunos pares se mueven juntos y otros en sentido contrario, y cómo el calendario económico puede convertir un buen plan en una mala operación si se ignora.",
  cityName: "Distrito FX",
  cityTagline: "Cuatro sesiones, un solo mercado. Aprende a leer el reloj antes de leer el gráfico.",
  startingCapitalEstimate: 3_000,
  totalMissions: 5,
  xpRequired: 800,
  missions: [
    // ── MISIÓN 3F.1 — La Ciudad de las Cuatro Sesiones ──
    {
      id: "m3f_1",
      order: 1,
      title: "La Ciudad de las Cuatro Sesiones",
      subtitle: "El mercado nunca cierra. Pero tampoco está siempre despierto igual.",
      description: "Primera misión en Distrito FX. A diferencia de crypto, forex no opera 24/7 — opera 24/5, repartido en cuatro sesiones que se relevan: Sídney, Tokio, Londres y Nueva York. Aprenderás cuándo se solapan (más liquidez, spreads ajustados) y cuándo hay huecos de baja actividad que conviene evitar.",
      learningObjectives: [
        "Ubicar las cuatro sesiones de forex en horario UTC",
        "Identificar el overlap Londres-Nueva York como el momento de mayor liquidez",
        "Reconocer zonas de baja liquidez y el horario de rollover",
        "Relacionar la sesión activa con el comportamiento del spread",
      ],
      keyConcepts: ["sesión de Sídney", "sesión de Tokio", "sesión de Londres", "sesión de Nueva York", "overlap", "liquidez", "spread", "rollover"],
      forexConcepts: ["London-NY overlap", "session liquidity", "rollover spread widening", "24/5 market"],
      referenceAssets: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD"],
      requiredMissions: ["m2_5"],
      introDialogues: [
        { id: "m3f1_intro_1", character: "narrator", type: "diary", text: "Distrito FX no tiene un solo horario de apertura. Tiene cuatro. Cuando una campana suena en Sídney, otra se prepara en Tokio. Cuando Londres enciende sus pantallas, Nueva York todavía duerme. Durante unas horas, las cuatro coexisten." },
        { id: "m3f1_intro_2", character: "el_viejo_marco", type: "diary", text: "En crypto aprendiste que el mercado nunca cierra. Aquí sí cierra — los fines de semana. Pero entre semana, forex se reparte en turnos. Y el error más común de un principiante no es operar en el turno equivocado. Es no saber en qué turno está.", footnote: "— Primera entrada desde Distrito FX" },
        { id: "m3f1_intro_3", character: "aria", type: "aria_message", text: "Cuatro sesiones, aproximadamente en UTC: Sídney 22:00–07:00, Tokio 00:00–09:00, Londres 08:00–17:00, Nueva York 13:00–22:00. Cuando dos sesiones grandes coinciden, la liquidez se multiplica. El solapamiento Londres–Nueva York (13:00–17:00 UTC) concentra el mayor volumen del día." },
        { id: "m3f1_intro_4", character: "el_especulador", type: "enemy_taunt", text: "¿Horarios? Yo opero cuando tengo una corazonada, sin importar la hora. A veces funciona. Cuando no funciona, casi siempre fue a las 21:00 UTC, con un spread que se comió media operación." },
      ],
      outroDialogues: [
        { id: "m3f1_outro_1", character: "aria", type: "tip", text: "Regla práctica: si puedes elegir cuándo operar, prioriza el overlap Londres-Nueva York. Si operas fuera de las sesiones grandes, ajusta tus expectativas de spread y evita entradas justo antes del rollover diario (~21:00-22:00 UTC)." },
        { id: "m3f1_outro_2", character: "el_viejo_marco", type: "diary", text: "El reloj no predice la dirección del precio. Solo te dice cuánta gente hay mirando la misma pantalla que tú en ese momento. Eso ya es información valiosa.", footnote: "— Entrada #2 desde Distrito FX" },
      ],
      quiz: [
        { id: "q_m3f1_01", difficulty: "basico", conceptEvaluated: "Solapamiento de sesiones", question: "¿Cuál es el momento de mayor liquidez del día en forex?", options: [
          { id: "a", text: "El overlap entre las sesiones de Londres y Nueva York", isCorrect: true, feedback: "Correcto. Dos de los centros financieros más grandes operando a la vez concentran el mayor volumen." },
          { id: "b", text: "La apertura de la sesión de Sídney", isCorrect: false, feedback: "Sídney es la sesión más pequeña de las cuatro." },
          { id: "c", text: "Cualquier hora del día — la liquidez es siempre igual", isCorrect: false, feedback: "La liquidez varía notablemente según qué sesiones están activas." },
          { id: "d", text: "La medianoche UTC, sin excepción", isCorrect: false, feedback: "Depende de qué sesiones coinciden, no de una hora fija universal." },
        ], explanation: "El overlap Londres-Nueva York (aprox. 13:00-17:00 UTC) es el momento donde coinciden los dos mayores centros financieros del mundo forex, generando el volumen más alto y spreads típicamente más ajustados." },
        { id: "q_m3f1_02", difficulty: "basico", conceptEvaluated: "Forex es 24/5, no 24/7", question: "¿En qué se diferencia forex de crypto respecto al horario del mercado?", options: [
          { id: "a", text: "Forex opera 24/7 igual que crypto", isCorrect: false, feedback: "Forex cierra los fines de semana; crypto no." },
          { id: "b", text: "Forex opera 24 horas, 5 días a la semana, repartido en sesiones regionales", isCorrect: true, feedback: "Correcto. El mercado forex sigue el horario laboral de los principales centros financieros, encadenados por zona horaria." },
          { id: "c", text: "Forex solo opera durante la sesión de Nueva York", isCorrect: false, feedback: "Forex opera en cuatro sesiones distintas, no solo una." },
          { id: "d", text: "Forex cierra cada noche sin excepción", isCorrect: false, feedback: "Dentro de la semana laboral, siempre hay alguna sesión activa — el relevo entre sesiones es continuo." },
        ], explanation: "A diferencia de crypto (24/7/365), forex sigue el ritmo de los mercados financieros tradicionales: cierra el viernes por la tarde (hora de Nueva York) y reabre el domingo por la noche con la apertura de Sídney." },
        { id: "q_m3f1_03", difficulty: "intermedio", conceptEvaluated: "Zonas de baja liquidez", question: "Son las 23:00 UTC — la sesión de Nueva York acaba de cerrar y la de Tokio todavía no arranca con fuerza. ¿Qué deberías esperar del mercado?", options: [
          { id: "a", text: "Volumen y liquidez más bajos de lo habitual — mayor cuidado con el spread", isCorrect: true, feedback: "Correcto. Esta franja horaria concentra menos participantes activos que los overlaps principales." },
          { id: "b", text: "El mayor volumen del día", isCorrect: false, feedback: "Es justamente lo contrario — la franja entre el cierre de Nueva York y el impulso de Tokio suele ser de las más silenciosas." },
          { id: "c", text: "Ningún cambio — la liquidez es constante todo el día", isCorrect: false, feedback: "La liquidez fluctúa fuertemente según qué sesiones están activas." },
          { id: "d", text: "Un cierre total del mercado hasta el lunes", isCorrect: false, feedback: "El mercado sigue abierto entre semana; solo cierra el fin de semana." },
        ], explanation: "Entre el cierre de Nueva York y el verdadero impulso de la sesión asiática hay una franja de menor actividad. No es peligrosa por sí sola, pero exige ajustar expectativas: spreads más anchos y movimientos menos confiables." },
        { id: "q_m3f1_04", difficulty: "intermedio", conceptEvaluated: "Rollover y spread", question: "¿Qué suele ocurrir con el spread alrededor del horario de rollover diario (~21:00-22:00 UTC)?", options: [
          { id: "a", text: "Se mantiene exactamente igual que el resto del día", isCorrect: false, feedback: "El rollover suele traer un ensanchamiento temporal del spread." },
          { id: "b", text: "Tiende a ensancharse temporalmente por la baja liquidez y el ajuste de posiciones overnight", isCorrect: true, feedback: "Correcto. Muchos brokers aplican el rollover cerca del cierre de Nueva York, cuando la liquidez ya está cayendo." },
          { id: "c", text: "Se estrecha porque los bancos centrales intervienen", isCorrect: false, feedback: "No hay una intervención sistemática de bancos centrales en ese horario específico." },
          { id: "d", text: "Desaparece por completo durante 5 minutos", isCorrect: false, feedback: "El spread no desaparece — se ensancha, no se elimina." },
        ], explanation: "El rollover (o swap) es el ajuste que aplican los brokers por mantener posiciones abiertas de un día para otro. Coincide con una ventana de baja liquidez, lo que típicamente ensancha el spread durante unos minutos." },
      ],
      minigame: {
        id: "mg_m3f1", type: "session_clock", title: "El Reloj de las Cuatro Sesiones",
        description: "Observa la hora UTC y decide la mejor acción según qué sesiones están activas.",
        instructions: "Para cada momento del día, identifica qué sesiones están activas y elige la decisión más prudente: operar con confianza, operar con cautela, esperar, o cuidado por rollover. 4 de 6 para aprobar.",
        config: {
          scenarios: [
            { utcHour: 14, pair: "GBP/USD", answer: "maxima_liquidez" },
            { utcHour: 9, pair: "EUR/USD", answer: "liquidez_normal" },
            { utcHour: 21, pair: "USD/JPY", answer: "cuidado_rollover" },
            { utcHour: 23, pair: "AUD/USD", answer: "liquidez_baja" },
            { utcHour: 3, pair: "USD/JPY", answer: "liquidez_normal" },
            { utcHour: 16, pair: "EUR/USD", answer: "maxima_liquidez" },
          ],
          requiredCorrect: 4,
        },
        passingScore: 66, virtualCapitalReward: 130,
      },
      rewards: { xp: 130, virtualCapital: 220 },
    },
    // ── MISIÓN 3F.2 — Pips, Lotes y Apalancamiento ──
    {
      id: "m3f_2",
      order: 2,
      title: "Pips, Lotes y Apalancamiento",
      subtitle: "El mismo 2% de riesgo, una matemática distinta",
      description: "La gestión de riesgo que ya conoces (arriesgar un % fijo del capital) se aplica en forex mediante una unidad propia: el pip. Aprenderás qué es un pip, cómo se miden los lotes (estándar, mini, micro) y cómo calcular el tamaño de posición correcto usando distancia en pips y valor del pip por lote.",
      learningObjectives: [
        "Definir qué es un pip y su valor según el par",
        "Distinguir lote estándar, mini y micro",
        "Entender qué es el apalancamiento y el margen requerido",
        "Calcular el tamaño de posición en lotes a partir del riesgo máximo permitido",
      ],
      keyConcepts: ["pip", "lote estándar", "mini lote", "micro lote", "apalancamiento", "margen", "valor del pip", "position sizing"],
      forexConcepts: ["pip value per lot", "standard/mini/micro lot", "leverage & margin", "pip-based position sizing"],
      referenceAssets: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CHF"],
      requiredMissions: ["m3f_1"],
      introDialogues: [
        { id: "m3f2_intro_1", character: "aria", type: "aria_message", text: "En crypto calculabas unidades a partir de un precio. En forex, la unidad de referencia es el pip — normalmente el cuarto decimal (0.0001) para la mayoría de pares, y el segundo decimal (0.01) para pares con yen japonés." },
        { id: "m3f2_intro_2", character: "el_viejo_marco", type: "diary", text: "Un lote estándar son 100,000 unidades de la divisa base. Un mini lote, 10,000. Un micro lote, 1,000. No necesitas operar lotes estándar para operar en serio — necesitas operar el tamaño que tu riesgo permite.", footnote: "— Entrada #4 desde Distrito FX" },
        { id: "m3f2_intro_3", character: "la_señorita_fomo", type: "enemy_taunt", text: "¡Con apalancamiento 1:500 puedes controlar $50,000 con solo $100! ¡Imagina las ganancias!" },
        { id: "m3f2_intro_4", character: "aria", type: "warning", text: "La Señorita FOMO solo contó la mitad de la historia. El apalancamiento amplifica ganancias Y pérdidas por igual. El margen que exige un broker no es tu límite de riesgo real — tu límite de riesgo lo defines tú, con el tamaño de posición." },
      ],
      outroDialogues: [
        { id: "m3f2_outro_1", character: "aria", type: "tip", text: "Fórmula central: lotes = riesgo máximo en dólares ÷ (distancia del Stop Loss en pips × valor del pip por lote). El apalancamiento determina cuánto margen necesitas para abrir la posición — no cuánto deberías arriesgar." },
        { id: "m3f2_outro_2", character: "el_viejo_marco", type: "diary", text: "Vi cuentas completas desaparecer en una tarde por confundir 'lo que el broker me permite abrir' con 'lo que debería abrir'. El apalancamiento es una herramienta, no una obligación de usarla al máximo.", footnote: "— Entrada #7 desde Distrito FX" },
      ],
      quiz: [
        { id: "q_m3f2_01", difficulty: "basico", conceptEvaluated: "Qué es un pip", question: "En el par EUR/USD, si el precio pasa de 1.0850 a 1.0851, ¿cuántos pips se movió?", options: [
          { id: "a", text: "1 pip", isCorrect: true, feedback: "Correcto. En la mayoría de pares, un pip es el cuarto decimal (0.0001)." },
          { id: "b", text: "10 pips", isCorrect: false, feedback: "10 pips sería un movimiento de 0.0010, no 0.0001." },
          { id: "c", text: "0.1 pips", isCorrect: false, feedback: "El pip completo ya se movió una unidad — no es una fracción." },
          { id: "d", text: "100 pips", isCorrect: false, feedback: "Eso sería un movimiento de 0.0100, cien veces mayor." },
        ], explanation: "Para la mayoría de pares (no-JPY), un pip equivale al cuarto decimal: 0.0001. Para pares con yen japonés (como USD/JPY), un pip equivale al segundo decimal: 0.01." },
        { id: "q_m3f2_02", difficulty: "basico", conceptEvaluated: "Lotes estándar/mini/micro", question: "¿Cuántas unidades de la divisa base representa un mini lote?", options: [
          { id: "a", text: "100,000", isCorrect: false, feedback: "Esas son las unidades de un lote estándar." },
          { id: "b", text: "10,000", isCorrect: true, feedback: "Correcto. Un mini lote equivale a la décima parte de un lote estándar." },
          { id: "c", text: "1,000", isCorrect: false, feedback: "Esas son las unidades de un micro lote." },
          { id: "d", text: "1", isCorrect: false, feedback: "Un lote nunca representa una sola unidad de divisa." },
        ], explanation: "Lote estándar = 100,000 unidades. Mini lote = 10,000 unidades. Micro lote = 1,000 unidades. Elegir el tamaño de lote correcto es clave para ajustar la posición al riesgo permitido." },
        { id: "q_m3f2_03", difficulty: "intermedio", conceptEvaluated: "Apalancamiento vs riesgo real", question: "Tu broker ofrece apalancamiento 1:500. ¿Significa esto que deberías arriesgar 500 veces más capital del que tienes?", options: [
          { id: "a", text: "Sí, para maximizar ganancias siempre conviene usar el apalancamiento máximo", isCorrect: false, feedback: "El apalancamiento máximo disponible no es una recomendación de uso — es solo el límite del broker." },
          { id: "b", text: "No — el apalancamiento define cuánto margen necesitas para abrir una posición, pero el riesgo que asumes lo defines tú con el tamaño de posición", isCorrect: true, feedback: "Correcto. El apalancamiento es una herramienta de acceso al mercado, no una instrucción de cuánto arriesgar." },
          { id: "c", text: "Sí, y además el broker garantiza que no perderás más del margen inicial", isCorrect: false, feedback: "Perder más del margen inicial es posible sin una gestión de riesgo adecuada." },
          { id: "d", text: "El apalancamiento no tiene relación con el riesgo", isCorrect: false, feedback: "Sí la tiene: a mayor apalancamiento, menor margen necesitas, pero el riesgo de la posición sigue determinado por su tamaño real." },
        ], explanation: "El apalancamiento reduce el margen requerido para abrir una posición de cierto tamaño. No cambia el hecho de que el riesgo real depende de cuántas unidades/lotes controlas y a qué distancia está tu Stop Loss." },
        { id: "q_m3f2_04", difficulty: "avanzado", conceptEvaluated: "Cálculo de lotes por riesgo", question: "Capital $3,000, riesgo 2% ($60). Tu Stop Loss está a 20 pips y el valor del pip por lote estándar es $10. ¿Cuántos lotes puedes operar?", options: [
          { id: "a", text: "0.3 lotes", isCorrect: true, feedback: "Correcto. $60 ÷ (20 pips × $10) = $60 ÷ $200 = 0.3 lotes." },
          { id: "b", text: "3 lotes", isCorrect: false, feedback: "Eso arriesgaría $600, diez veces el límite de riesgo." },
          { id: "c", text: "0.03 lotes", isCorrect: false, feedback: "Eso sería un riesgo diez veces menor al permitido — muy conservador respecto al cálculo exacto." },
          { id: "d", text: "20 lotes", isCorrect: false, feedback: "Ese tamaño arriesgaría muchísimo más del capital total disponible." },
        ], explanation: "Fórmula: lotes = riesgo máximo ÷ (distancia SL en pips × valor del pip por lote) = $60 ÷ (20 × $10) = 0.3 lotes." },
      ],
      minigame: {
        id: "mg_m3f2", type: "pip_lot_calculator", title: "Calculadora de Pips y Lotes",
        description: "Calcula el tamaño de posición correcto en lotes, respetando el 2% de riesgo, para diferentes pares forex.",
        instructions: "Para cada par, calcula cuántos lotes puedes operar sin superar el 2% de riesgo. Fórmula: lotes = riesgo máximo ÷ (SL en pips × valor del pip por lote).",
        config: {
          capital: 3000, riskPct: 0.02,
          scenarios: [
            { pair: "EUR/USD", stopLossPips: 20, pipValuePerLot: 10, correctLots: 0.3 },
            { pair: "GBP/USD", stopLossPips: 25, pipValuePerLot: 10, correctLots: 0.24 },
            { pair: "USD/JPY", stopLossPips: 15, pipValuePerLot: 9.1, correctLots: 0.44 },
            { pair: "AUD/USD", stopLossPips: 30, pipValuePerLot: 10, correctLots: 0.2 },
            { pair: "USD/CHF", stopLossPips: 18, pipValuePerLot: 10.8, correctLots: 0.31 },
          ],
          tolerance: 0.08,
        },
        passingScore: 70, virtualCapitalReward: 150,
      },
      rewards: { xp: 140, virtualCapital: 250 },
    },
    // ── MISIÓN 3F.3 — El Tablero de Correlaciones ──
    {
      id: "m3f_3",
      order: 3,
      title: "El Tablero de Correlaciones",
      subtitle: "Dos operaciones que en realidad son la misma apuesta",
      description: "Muchos pares de divisas comparten drivers comunes: si el dólar se fortalece, varios pares se mueven juntos (o en contra). Aprenderás a leer una matriz de correlación para detectar cuándo estás duplicando riesgo sin darte cuenta, y cuándo dos posiciones realmente se compensan.",
      learningObjectives: [
        "Entender qué mide un coeficiente de correlación entre pares",
        "Identificar pares con correlación positiva fuerte (se mueven juntos)",
        "Identificar pares con correlación negativa fuerte (se mueven en contra)",
        "Detectar sobre-exposición oculta al abrir múltiples posiciones 'diversificadas' que en realidad son la misma apuesta",
      ],
      keyConcepts: ["correlación positiva", "correlación negativa", "coeficiente de correlación", "sobre-exposición", "diversificación real vs aparente", "fortaleza del dólar"],
      forexConcepts: ["currency correlation matrix", "hidden overexposure", "positive vs negative pair correlation"],
      referenceAssets: ["EUR/USD", "GBP/USD", "USD/CHF", "AUD/USD", "USD/JPY"],
      requiredMissions: ["m3f_2"],
      introDialogues: [
        { id: "m3f3_intro_1", character: "el_viejo_marco", type: "diary", text: "Un trader nuevo una vez me dijo, orgulloso, que tenía cuatro posiciones abiertas para 'diversificar'. Las cuatro eran apuestas a que el dólar caería. No tenía cuatro operaciones. Tenía una operación, cuatro veces más grande de lo que creía.", footnote: "— Entrada #11 desde Distrito FX" },
        { id: "m3f3_intro_2", character: "aria", type: "aria_message", text: "La correlación mide qué tan parecido se mueven dos pares, en una escala de -1 a +1. Cerca de +1: se mueven juntos. Cerca de -1: se mueven en direcciones opuestas. Cerca de 0: son prácticamente independientes." },
        { id: "m3f3_intro_3", character: "don_panico", type: "enemy_taunt", text: "¡Tenía EUR/USD largo y USD/CHF largo al mismo tiempo! ¡Una posición ganaba mientras la otra perdía exactamente lo mismo! ¡No entendí nada!" },
        { id: "m3f3_intro_4", character: "aria", type: "warning", text: "Don Pánico describe una correlación negativa fuerte sin saberlo: EUR/USD y USD/CHF suelen moverse en direcciones opuestas. Abrir ambas 'largas' al mismo tiempo puede anular una posición con la otra." },
      ],
      outroDialogues: [
        { id: "m3f3_outro_1", character: "aria", type: "tip", text: "Antes de abrir una nueva posición, revisa qué correlación tiene con lo que ya tienes abierto. Correlación fuerte (positiva o negativa) no es mala en sí misma — el problema es no saber que existe." },
        { id: "m3f3_outro_2", character: "el_viejo_marco", type: "diary", text: "La correlación no es una ley física. Puede romperse cuando un evento afecta a una sola divisa del par. Úsala como contexto, no como certeza absoluta.", footnote: "— Entrada #13 desde Distrito FX" },
      ],
      quiz: [
        { id: "q_m3f3_01", difficulty: "basico", conceptEvaluated: "Qué mide la correlación", question: "Un coeficiente de correlación de +0.85 entre EUR/USD y GBP/USD significa que...", options: [
          { id: "a", text: "Ambos pares tienden a moverse en la misma dirección de forma consistente", isCorrect: true, feedback: "Correcto. Cerca de +1 indica una relación positiva fuerte — se mueven juntos la mayor parte del tiempo." },
          { id: "b", text: "Ambos pares siempre tienen exactamente el mismo precio", isCorrect: false, feedback: "La correlación mide dirección del movimiento, no igualdad de precio." },
          { id: "c", text: "Cuando uno sube, el otro baja siempre", isCorrect: false, feedback: "Eso describiría una correlación negativa (cercana a -1), no positiva." },
          { id: "d", text: "No existe ninguna relación entre ambos pares", isCorrect: false, feedback: "Un coeficiente de 0.85 es una relación fuerte, no ausencia de relación." },
        ], explanation: "El coeficiente de correlación va de -1 a +1. +0.85 es una correlación positiva fuerte: ambos pares tienden a moverse en la misma dirección, aunque no de forma perfecta ni garantizada." },
        { id: "q_m3f3_02", difficulty: "intermedio", conceptEvaluated: "Correlación negativa", question: "EUR/USD y USD/CHF suelen tener correlación fuertemente negativa. Si abres EUR/USD largo y USD/CHF largo al mismo tiempo, ¿qué ocurre normalmente?", options: [
          { id: "a", text: "Ambas posiciones ganan juntas — es una combinación perfecta", isCorrect: false, feedback: "Al ser correlación negativa, cuando una gana la otra tiende a perder, no a ganar junto con ella." },
          { id: "b", text: "Una posición tiende a compensar (o anular) a la otra, porque los pares se mueven en direcciones opuestas", isCorrect: true, feedback: "Correcto. Es casi una posición neutralizada — el riesgo neto termina siendo menor de lo que dos operaciones 'llenas' sugieren." },
          { id: "c", text: "No hay ninguna relación entre ambas operaciones", isCorrect: false, feedback: "Sí existe una relación fuerte — solo que en sentido contrario, no ausente." },
          { id: "d", text: "El bróker cierra automáticamente ambas posiciones", isCorrect: false, feedback: "Los brokers no cierran posiciones automáticamente por correlación." },
        ], explanation: "EUR/USD y USD/CHF suelen moverse en direcciones opuestas porque comparten el dólar en posiciones inversas frente a divisas europeas relacionadas. Combinarlas en la misma dirección de riesgo tiende a neutralizar el resultado neto." },
        { id: "q_m3f3_03", difficulty: "intermedio", conceptEvaluated: "Sobre-exposición oculta", question: "Abres posiciones largas en EUR/USD, GBP/USD y AUD/USD simultáneamente, pensando que 'diversificaste' en tres pares distintos. ¿Cuál es el riesgo real?", options: [
          { id: "a", text: "Ninguno — son tres pares diferentes, por lo tanto tres riesgos independientes", isCorrect: false, feedback: "Si los tres tienen correlación positiva entre sí, en la práctica es una sola apuesta ampliada, no tres independientes." },
          { id: "b", text: "Si los tres pares están correlacionados positivamente, en realidad estás triplicando una misma apuesta direccional al dólar, no diversificando", isCorrect: true, feedback: "Correcto. La 'diversificación aparente' entre pares correlacionados no reduce el riesgo — lo concentra." },
          { id: "c", text: "El riesgo se reduce automáticamente por operar tres pares distintos", isCorrect: false, feedback: "El número de pares no reduce el riesgo si están correlacionados entre sí." },
          { id: "d", text: "Solo importa el par con mayor apalancamiento", isCorrect: false, feedback: "El riesgo se acumula entre todas las posiciones correlacionadas, no solo en una." },
        ], explanation: "EUR/USD, GBP/USD y AUD/USD suelen compartir una correlación positiva moderada a fuerte frente al dólar. Abrir varias posiciones así puede sentirse como diversificación, pero matemáticamente concentra el riesgo en una sola dirección." },
        { id: "q_m3f3_04", difficulty: "avanzado", conceptEvaluated: "Correlación como contexto, no certeza", question: "¿Por qué la correlación entre dos pares NO debe tratarse como una regla fija e infalible?", options: [
          { id: "a", text: "Porque puede romperse temporalmente cuando un evento afecta a una sola divisa del par (por ejemplo, una noticia específica del Reino Unido que solo mueve la libra)", isCorrect: true, feedback: "Correcto. La correlación es estadística e histórica, no una ley — eventos específicos de una divisa pueden desviarla temporalmente." },
          { id: "b", text: "Porque las correlaciones cambian cada segundo de forma aleatoria y no sirven para nada", isCorrect: false, feedback: "Las correlaciones son relativamente estables en el corto-mediano plazo, aunque no perfectas." },
          { id: "c", text: "Porque solo aplica a criptomonedas, no a forex", isCorrect: false, feedback: "La correlación es un concepto aplicable y muy usado específicamente en forex." },
          { id: "d", text: "Porque los brokers manipulan la correlación para perjudicar a los traders", isCorrect: false, feedback: "La correlación surge de fundamentos macroeconómicos compartidos, no de manipulación del bróker." },
        ], explanation: "La correlación captura una tendencia estadística basada en datos históricos y drivers compartidos (como la fortaleza del dólar). Un evento específico de una sola divisa puede romper esa relación temporalmente — por eso se usa como contexto adicional, no como certeza." },
      ],
      minigame: {
        id: "mg_m3f3", type: "correlation_matrix", title: "El Tablero de Correlaciones",
        description: "Observa el coeficiente de correlación entre dos pares y clasifica la relación correctamente.",
        instructions: "Para cada combinación de pares, decide: ¿misma dirección fuerte, dirección opuesta fuerte, relación moderada, o prácticamente independientes? 4 de 6 para aprobar.",
        config: {
          scenarios: [
            { pairA: "EUR/USD", pairB: "GBP/USD", coefficient: 0.87, answer: "misma_direccion_fuerte" },
            { pairA: "EUR/USD", pairB: "USD/CHF", coefficient: -0.91, answer: "opuesta_fuerte" },
            { pairA: "USD/JPY", pairB: "AUD/USD", coefficient: 0.35, answer: "moderada" },
            { pairA: "EUR/USD", pairB: "USD/JPY", coefficient: -0.15, answer: "independiente" },
            { pairA: "GBP/USD", pairB: "AUD/USD", coefficient: 0.62, answer: "moderada" },
            { pairA: "USD/CHF", pairB: "USD/JPY", coefficient: 0.55, answer: "moderada" },
          ],
          requiredCorrect: 4,
        },
        passingScore: 66, virtualCapitalReward: 150,
      },
      rewards: { xp: 155, virtualCapital: 250, badge: "lector_de_correlaciones" },
    },
    // ── MISIÓN 3F.4 — El Calendario que Mueve el Mercado ──
    {
      id: "m3f_4",
      order: 4,
      title: "El Calendario que Mueve el Mercado",
      subtitle: "Los datos que hacen temblar al mercado tienen fecha y hora fijas",
      description: "A diferencia de crypto, forex está profundamente ligado a la macroeconomía: nóminas de empleo, inflación, decisiones de tasas de interés. Aprenderás a leer un calendario económico, distinguir niveles de impacto, y por qué operar justo antes o durante una publicación de alto impacto es una fuente distinta de riesgo.",
      learningObjectives: [
        "Identificar los eventos económicos de mayor impacto en forex (NFP, IPC, decisiones de tasas)",
        "Distinguir niveles de impacto: bajo, medio y alto",
        "Entender por qué el spread se ensancha alrededor de publicaciones de alto impacto",
        "Decidir cuándo evitar operar, esperar confirmación, o proteger una posición existente",
      ],
      keyConcepts: ["calendario económico", "NFP", "IPC / CPI", "decisión de tasas", "impacto alto/medio/bajo", "ensanchamiento de spread", "slippage en noticias"],
      forexConcepts: ["economic calendar", "high-impact news events", "spread widening around releases", "trading through news risk"],
      referenceAssets: ["EUR/USD", "USD/JPY", "GBP/USD", "AUD/USD"],
      requiredMissions: ["m3f_3"],
      introDialogues: [
        { id: "m3f4_intro_1", character: "aria", type: "aria_message", text: "En crypto, las noticias son impredecibles en su horario. En forex, muchos de los eventos que más mueven el mercado están agendados con semanas de anticipación: nóminas no agrícolas (NFP), inflación (IPC/CPI), decisiones de tasas de interés de bancos centrales." },
        { id: "m3f4_intro_2", character: "el_viejo_marco", type: "diary", text: "El calendario económico no predice la dirección. Predice el momento en que el mercado puede volverse errático. Eso, para un trader, vale tanto como saber hacia dónde va el precio.", footnote: "— Entrada #16 desde Distrito FX" },
        { id: "m3f4_intro_3", character: "el_especulador", type: "enemy_taunt", text: "¡Yo abro posiciones justo antes del NFP! ¡El movimiento es enorme, es la oportunidad perfecta!" },
        { id: "m3f4_intro_4", character: "aria", type: "warning", text: "El Especulador describe una de las formas más rápidas de perder una cuenta: el spread se ensancha antes de la publicación, el slippage puede saltarse tu Stop Loss, y la dirección inicial del movimiento a veces se revierte en minutos." },
      ],
      outroDialogues: [
        { id: "m3f4_outro_1", character: "aria", type: "tip", text: "Ante un evento de alto impacto: si no tienes posición, evita abrir una nueva justo antes. Si ya tienes una posición con Stop Loss ajustado, considera ampliarlo o cerrar antes del evento. Después de la publicación, espera a que el spread normalice antes de operar la reacción." },
        { id: "m3f4_outro_2", character: "el_viejo_marco", type: "diary", text: "No se trata de tenerle miedo al calendario. Se trata de no fingir que no existe.", footnote: "— Entrada #19 desde Distrito FX" },
      ],
      quiz: [
        { id: "q_m3f4_01", difficulty: "basico", conceptEvaluated: "Eventos de alto impacto", question: "¿Cuál de estos eventos suele clasificarse como de alto impacto para el dólar estadounidense?", options: [
          { id: "a", text: "Nóminas no agrícolas (NFP)", isCorrect: true, feedback: "Correcto. El NFP es uno de los datos económicos más observados y suele generar volatilidad significativa en pares con USD." },
          { id: "b", text: "El horario de apertura de un supermercado local", isCorrect: false, feedback: "No es un evento del calendario económico relevante para forex." },
          { id: "c", text: "El resultado de un partido deportivo", isCorrect: false, feedback: "No tiene relación con el calendario económico." },
          { id: "d", text: "El cambio de estación del año", isCorrect: false, feedback: "No es un evento económico programado." },
        ], explanation: "NFP (Non-Farm Payrolls), IPC/CPI (inflación) y las decisiones de tasas de interés de bancos centrales figuran habitualmente entre los eventos de mayor impacto en cualquier calendario económico." },
        { id: "q_m3f4_02", difficulty: "basico", conceptEvaluated: "Spread durante noticias", question: "¿Qué tiende a ocurrir con el spread justo antes y durante una publicación económica de alto impacto?", options: [
          { id: "a", text: "Se mantiene idéntico al resto del día", isCorrect: false, feedback: "En publicaciones de alto impacto, el spread casi siempre se ensancha temporalmente." },
          { id: "b", text: "Tiende a ensancharse, a veces de forma significativa, por la incertidumbre y la reducción momentánea de liquidez", isCorrect: true, feedback: "Correcto. Los proveedores de liquidez amplían el spread para protegerse de movimientos bruscos e impredecibles." },
          { id: "c", text: "Se reduce a cero durante unos segundos", isCorrect: false, feedback: "Ocurre lo contrario: el spread se ensancha, no desaparece." },
          { id: "d", text: "Solo cambia en pares con yen japonés", isCorrect: false, feedback: "El ensanchamiento de spread ante noticias de alto impacto afecta a la mayoría de pares relacionados con la divisa del evento." },
        ], explanation: "Durante eventos de alto impacto, la incertidumbre hace que los proveedores de liquidez reduzcan su exposición, lo que se traduce en spreads más anchos y mayor riesgo de slippage." },
        { id: "q_m3f4_03", difficulty: "intermedio", conceptEvaluated: "Decisión ante evento inminente sin posición abierta", question: "Faltan 3 minutos para la publicación del NFP y no tienes ninguna posición abierta. ¿Cuál es la decisión más prudente?", options: [
          { id: "a", text: "Abrir una posición grande justo antes para aprovechar el movimiento", isCorrect: false, feedback: "Esto expone a slippage y spread ancho sin ninguna ventaja informativa real." },
          { id: "b", text: "Evitar abrir nuevas posiciones hasta después de la publicación y la normalización del spread", isCorrect: true, feedback: "Correcto. Sin una posición que proteger, la decisión más prudente es esperar a que pase la incertidumbre inicial." },
          { id: "c", text: "Duplicar el tamaño de posición habitual para compensar el spread", isCorrect: false, feedback: "Duplicar el tamaño en un momento de mayor incertidumbre aumenta el riesgo, no lo compensa." },
          { id: "d", text: "No importa — el NFP no afecta al mercado forex", isCorrect: false, feedback: "El NFP es uno de los eventos que más volatilidad genera en pares con dólar." },
        ], explanation: "Sin una posición abierta que gestionar, no hay razón para asumir el riesgo de spread ancho y slippage de un evento de alto impacto. Esperar la confirmación posterior suele ser la decisión más prudente." },
        { id: "q_m3f4_04", difficulty: "avanzado", conceptEvaluated: "Proteger una posición existente ante noticias", question: "Tienes una posición abierta en EUR/USD con un Stop Loss ajustado (pocos pips de distancia) y faltan 15 minutos para una decisión de tasas de la Fed. ¿Qué deberías considerar?", options: [
          { id: "a", text: "No hacer nada — el Stop Loss protege la posición sin importar el evento", isCorrect: false, feedback: "Un SL muy ajustado puede saltar por el ruido del spread ampliado, no necesariamente por un movimiento real de mercado." },
          { id: "b", text: "Evaluar ampliar el Stop Loss o cerrar la posición antes del evento, dado que el spread ensanchado podría ejecutar el SL de forma prematura", isCorrect: true, feedback: "Correcto. Un SL muy ajustado frente a un evento de alto impacto corre el riesgo de activarse por el ensanchamiento del spread, no por un movimiento genuino del precio." },
          { id: "c", text: "Duplicar la posición para aprovechar el movimiento de la decisión de tasas", isCorrect: false, feedback: "Aumentar exposición justo antes de un evento de alta incertidumbre incrementa el riesgo, no lo gestiona." },
          { id: "d", text: "Cambiar el par operado a último momento", isCorrect: false, feedback: "Cambiar de par no resuelve el riesgo de la posición ya abierta en EUR/USD." },
        ], explanation: "Un Stop Loss muy ajustado es especialmente vulnerable al ensanchamiento de spread que ocurre alrededor de eventos de alto impacto. Ampliar el SL (respetando el riesgo máximo) o cerrar la posición son formas válidas de gestionar ese riesgo adicional." },
      ],
      minigame: {
        id: "mg_m3f4", type: "news_impact_planner", title: "El Planificador de Noticias",
        description: "Ante cada evento del calendario económico, decide la acción más prudente según su impacto y momento.",
        instructions: "Para cada evento, evalúa el nivel de impacto y el tiempo hasta/desde su publicación, y elige: evitar entrar, esperar confirmación, operar con normalidad, o proteger posiciones existentes. 4 de 6 para aprobar.",
        config: {
          scenarios: [
            { event: "NFP (Nóminas no agrícolas, EE.UU.)", impactLevel: "alto", minutesToRelease: -3, answer: "evitar_entrar" },
            { event: "IPC (CPI) EE.UU.", impactLevel: "alto", minutesToRelease: 2, answer: "esperar_confirmacion" },
            { event: "Ventas minoristas de Australia", impactLevel: "bajo", minutesToRelease: -10, answer: "operar_normal" },
            { event: "Decisión de tasas de la Reserva Federal (con posición EUR/USD abierta y SL ajustado)", impactLevel: "alto", minutesToRelease: -15, answer: "proteger_posiciones" },
            { event: "PMI manufacturero de Alemania", impactLevel: "medio", minutesToRelease: -20, answer: "operar_normal" },
            { event: "Discurso no programado de un gobernador de banco central", impactLevel: "medio", minutesToRelease: 1, answer: "esperar_confirmacion" },
          ],
          requiredCorrect: 4,
        },
        passingScore: 66, virtualCapitalReward: 160,
      },
      rewards: { xp: 165, virtualCapital: 280 },
    },
    // ── MISIÓN 3F.5 — El Gran Reto Forex (Boss Level 3) ──
    {
      id: "m3f_5",
      order: 5,
      title: "El Gran Reto Forex",
      subtitle: "Demuestra que puedes planear una operación con todo el contexto del mercado más líquido del mundo",
      description: "Misión Boss del Nivel 3 Forex. Integrarás sesiones y liquidez, riesgo de correlación y noticias, y gestión de riesgo en pips y lotes para construir y validar un plan de trading completo.",
      learningObjectives: [
        "Integrar contexto de sesión, riesgo de correlación/noticias y gestión de riesgo en un análisis completo",
        "Tomar una decisión de trading fundamentada en forex",
        "Demostrar comprensión de los conceptos exclusivos del nivel 3 forex",
      ],
      keyConcepts: ["síntesis nivel 3 forex", "contexto de sesión", "riesgo de correlación", "riesgo de noticias", "gestión de riesgo en pips y lotes", "decisión fundamentada"],
      forexConcepts: ["integración sesión + correlación + noticias + sizing", "pip-based risk management", "trade plan wizard"],
      referenceAssets: ["GBP/USD", "EUR/USD", "USD/CHF"],
      requiredMissions: ["m3f_4"],
      introDialogues: [
        { id: "m3f5_intro_1", character: "el_viejo_marco", type: "diary", text: "Distrito FX tiene su propia prueba final. No pregunta si memorizaste los horarios de las sesiones. Pregunta si puedes combinarlos, en tiempo real, con todo lo demás que aprendiste.", footnote: "— Última entrada antes del Boss de Nivel 3 Forex" },
        { id: "m3f5_intro_2", character: "aria", type: "aria_message", text: "Este reto integra todo el Nivel 3 Forex: contexto de sesión, riesgo de correlación y noticias, y cálculo de posición en pips y lotes. Tendrás un escenario completo y deberás: 1) leer el contexto de sesión, 2) evaluar el riesgo de correlación/noticias, 3) elegir el par correcto, 4) trazar entrada con SL y TP, 5) calcular la posición en lotes." },
        { id: "m3f5_intro_3", character: "el_especulador", type: "enemy_taunt", text: "Esto está muy bien para un ejercicio de academia. En el mercado real, cuando el precio se mueve, nadie tiene tiempo de revisar sesión, correlación y noticias a la vez." },
        { id: "m3f5_intro_4", character: "el_viejo_marco", type: "diary", text: "El Especulador vuelve a tener razón en una cosa: el mercado no espera. Pero un trader que ya interiorizó este proceso no lo piensa paso a paso en el momento — lo reconoce de un vistazo, porque lo practicó aquí primero.", footnote: "— Respuesta al Especulador" },
      ],
      outroDialogues: [
        { id: "m3f5_outro_1", character: "aria", type: "aria_message", text: "Nivel 3 Forex completado. Has demostrado que puedes leer el mercado más líquido del mundo integrando sesión, riesgo de correlación, calendario económico y gestión de riesgo en pips." },
        { id: "m3f5_outro_2", character: "el_viejo_marco", type: "diary", text: "Distrito FX sigue su reloj de cuatro tiempos, día tras día. La diferencia entre quienes sobreviven aquí y quienes no: los primeros aprendieron a leer la hora antes de leer el precio.", footnote: "— Entrada Final del Nivel 3, Distrito FX" },
        { id: "m3f5_outro_3", character: "narrator", type: "diary", text: "Las cuatro torres de Distrito FX siguen girando, relevándose en silencio. En algún lugar, una nueva ruta empieza a iluminarse." },
      ],
      quiz: [
        { id: "q_m3f5_01", difficulty: "avanzado", conceptEvaluated: "Integración: sesión + correlación + noticias", question: "Son las 14:00 UTC (overlap Londres-NY). Ya tienes EUR/USD largo abierto. Falta poco para el NFP. Consideras abrir GBP/USD largo también. ¿Cuál es la lectura más completa?", options: [
          { id: "a", text: "Abrir GBP/USD sin cambios — es un par distinto a EUR/USD, así que no hay relación de riesgo", isCorrect: false, feedback: "EUR/USD y GBP/USD suelen tener correlación positiva fuerte — no son riesgos independientes." },
          { id: "b", text: "Máxima liquidez por el overlap, pero GBP/USD está correlacionado con tu posición EUR/USD y el NFP se acerca — conviene reducir el riesgo total antes de sumar exposición", isCorrect: true, feedback: "Correcto. Buena liquidez no significa ausencia de riesgo — la correlación y el evento inminente pesan más en esta decisión." },
          { id: "c", text: "Cerrar todas las posiciones y no volver a operar forex", isCorrect: false, feedback: "Es una reacción desproporcionada — el objetivo es gestionar el riesgo, no evitarlo por completo." },
          { id: "d", text: "Duplicar EUR/USD en vez de abrir GBP/USD, para concentrar toda la convicción en un solo par", isCorrect: false, feedback: "Duplicar la exposición justo antes de un evento de alto impacto incrementa el riesgo, no lo gestiona." },
        ], explanation: "El overlap Londres-NY ofrece buena liquidez, pero GBP/USD y EUR/USD comparten correlación positiva fuerte. Sumado a un NFP inminente, la decisión prudente es reducir el riesgo total en vez de ampliarlo." },
        { id: "q_m3f5_02", difficulty: "avanzado", conceptEvaluated: "Position sizing en pips y lotes", question: "Capital $3,000, riesgo 2% ($60). Entrada GBP/USD en 1.2665, Stop Loss en 1.2645 (20 pips), valor del pip por lote estándar $10. ¿Cuántos lotes puedes operar?", options: [
          { id: "a", text: "0.3 lotes", isCorrect: true, feedback: "Correcto. $60 ÷ (20 pips × $10) = 0.3 lotes." },
          { id: "b", text: "3 lotes", isCorrect: false, feedback: "Eso arriesgaría $600 — diez veces el límite permitido." },
          { id: "c", text: "0.03 lotes", isCorrect: false, feedback: "Ese tamaño es diez veces menor al que realmente permite el riesgo calculado." },
          { id: "d", text: "2 lotes", isCorrect: false, feedback: "Ese tamaño arriesgaría muy por encima del 2% de capital permitido." },
        ], explanation: "Distancia SL = 1.2665 − 1.2645 = 0.0020 = 20 pips. Lotes = $60 ÷ (20 × $10) = 0.3 lotes." },
        { id: "q_m3f5_03", difficulty: "avanzado", conceptEvaluated: "Elegir el par correcto dado el contexto", question: "Ya tienes una posición larga en EUR/USD. Se presenta una oportunidad técnica en USD/CHF (fuertemente correlacionado en forma negativa con EUR/USD) y otra en GBP/USD (fuertemente correlacionado en forma positiva). ¿Cuál añade menos riesgo direccional duplicado a tu cartera actual?", options: [
          { id: "a", text: "GBP/USD, porque es el par más líquido", isCorrect: false, feedback: "La liquidez no es el criterio relevante aquí — la correlación con tu posición existente sí lo es." },
          { id: "b", text: "USD/CHF en dirección larga, porque su correlación negativa con EUR/USD tiende a compensar en vez de duplicar la exposición al dólar", isCorrect: true, feedback: "Correcto. Una posición con correlación negativa fuerte respecto a lo que ya tienes abierto reduce, en vez de amplificar, la concentración de riesgo direccional." },
          { id: "c", text: "GBP/USD, porque tiene el mismo tipo de setup técnico", isCorrect: false, feedback: "Un setup técnico similar en un par correlacionado positivamente amplifica el riesgo existente, no lo diversifica." },
          { id: "d", text: "Ambos son equivalentes — el par no importa si el setup técnico es válido", isCorrect: false, feedback: "El setup técnico es solo una parte del análisis; ignorar la correlación con posiciones existentes puede llevar a sobre-exposición oculta." },
        ], explanation: "Sumar una posición correlacionada positivamente (GBP/USD) a una posición ya abierta (EUR/USD) amplifica la misma apuesta direccional al dólar. Una posición correlacionada negativamente (USD/CHF) tiende a compensar en vez de duplicar el riesgo." },
      ],
      minigame: {
        id: "mg_m3f5", type: "trade_plan_wizard", title: "El Plan de Trading Integrado",
        description: "Escenario completo: recibe el contexto de sesión, correlación y noticias, y construye un plan de trading en 5 pasos.",
        instructions: "Contexto: overlap Londres-NY activo, ya tienes EUR/USD largo abierto, el NFP se publica en 12 minutos. Completa: 1) lectura del contexto de sesión, 2) evaluación de riesgo de correlación/noticias, 3) elección del par a operar, 4) entrada+SL+TP con R:R 1:2 mínimo, 5) tamaño de posición en lotes al 2% con $3,000.",
        config: {
          scenario: {
            session: "overlap_london_ny",
            newsEvent: "NFP en 12 minutos",
            correlationNote: "Ya tienes EUR/USD largo abierto",
            pairToTrade: "GBP/USD",
            entryZoneLow: 1.2650,
            entryZoneHigh: 1.2680,
            pipSize: 0.0001,
            pipValuePerLot: 10,
          },
          steps: 5, passingSteps: 4, capital: 3000, minRR: 2, maxRisk: 0.02,
        },
        passingScore: 80, virtualCapitalReward: 380,
      },
      rewards: { xp: 240, virtualCapital: 550, badge: "ciudadano_de_distrito_fx" },
    },
  ],
}

// ─── HELPERS ─────────────────────────────────────────────────

/** Retorna una misión del nivel 3 forex por su id */
export function getLevel3ForexMissionById(missionId: string): Level3ForexMission | undefined {
  return level3Forex.missions.find((m) => m.id === missionId)
}

/** Retorna todas las preguntas del nivel 3 forex en array plano */
export function getAllLevel3ForexQuestions(): QuizQuestion[] {
  return level3Forex.missions.flatMap((m) => m.quiz)
}

/** Retorna los conceptos forex únicos de todo el nivel */
export function getAllForexConcepts(): string[] {
  return Array.from(new Set(level3Forex.missions.flatMap((m) => m.forexConcepts)))
}

/** Retorna los activos de referencia únicos del nivel */
export function getAllReferenceAssets(): string[] {
  return Array.from(new Set(level3Forex.missions.flatMap((m) => m.referenceAssets)))
}

/** Calcula XP total del nivel 3 forex */
export function getTotalLevel3ForexXP(): number {
  return level3Forex.missions.reduce((acc, m) => acc + m.rewards.xp, 0)
}

/** Calcula el capital virtual acumulable en el nivel */
export function getTotalLevel3ForexCapitalRewards(): number {
  return level3Forex.missions.reduce((acc, m) => {
    const missionCapital = m.rewards.virtualCapital
    const minigameCapital = m.minigame?.virtualCapitalReward ?? 0
    return acc + missionCapital + minigameCapital
  }, 0)
}

export default level3Forex
