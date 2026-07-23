// ============================================================
// TraderPath — Level 3: "Capital Corporativa"
// Ruta de especialización: ACCIONES (STOCKS)
// Requiere: Nivel 2 completado + especialización "stocks" elegida
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

// ─── TIPOS ESPECÍFICOS DE NIVEL 3 STOCKS ───────────────────

export type Level3StocksMinigameType =
  | Level2MinigameType
  | "sector_map"
  | "earnings_reaction"
  | "corporate_action_planner"
  | "sector_beta_gauge"
  | "stock_trade_plan_wizard"

export interface Level3StocksMinigame extends Omit<Level2Minigame, "type"> {
  type: Level3StocksMinigameType
}

export interface Level3StocksMission extends Omit<Level2Mission, "minigame"> {
  minigame?: Level3StocksMinigame
  referenceAssets: string[]
  stockConcepts: string[]
}

export interface Level3StocksConfig {
  id: string
  order: number
  specialization: "stocks"
  title: string
  tagline: string
  description: string
  cityName: string
  cityTagline: string
  startingCapitalEstimate: number
  totalMissions: number
  xpRequired: number
  missions: Level3StocksMission[]
}

// ─── NIVEL 3 — RUTA STOCKS ───────────────────────────────────

export const level3Stocks: Level3StocksConfig = {
  id: "level_3_stocks",
  order: 3,
  specialization: "stocks",
  title: "Capital Corporativa",
  tagline: "Detrás de cada ticker hay una empresa real, con resultados reales.",
  description: "En Capital Corporativa aprenderás a operar acciones: cómo se clasifican las empresas por tamaño y sector, por qué la temporada de resultados trimestrales mueve el precio más que cualquier patrón técnico, qué son los dividendos y las acciones corporativas, y cómo rotan los sectores a lo largo del ciclo económico.",
  cityName: "Capital Corporativa",
  cityTagline: "No todas las acciones son iguales, aunque coticen en la misma bolsa.",
  startingCapitalEstimate: 3_200,
  totalMissions: 5,
  xpRequired: 800,
  missions: [
    // ── MISIÓN 3S.1 — El Mapa de Capital Corporativa ──
    {
      id: "m3s_1",
      order: 1,
      title: "El Mapa de Capital Corporativa",
      subtitle: "No todas las acciones son iguales, aunque coticen en la misma bolsa",
      description: "Primera misión en Capital Corporativa. Aprenderás a clasificar empresas por capitalización de mercado (large, mid y small cap) y por sector, y a entender por qué un índice como el S&P 500 se comporta como una canasta diversificada en vez de como un solo activo.",
      learningObjectives: [
        "Calcular e interpretar la capitalización de mercado",
        "Distinguir large cap, mid cap y small cap",
        "Reconocer los principales sectores del mercado accionario",
        "Entender por qué un índice se mueve menos que una acción individual",
      ],
      keyConcepts: ["capitalización de mercado", "large cap", "mid cap", "small cap", "sector", "índice bursátil", "canasta de acciones", "liquidez"],
      stockConcepts: ["market cap tiers", "sector classification", "index as basket"],
      referenceAssets: ["AAPL", "MSFT", "NVDA", "S&P 500"],
      requiredMissions: ["m2_5"],
      introDialogues: [
        { id: "m3s1_intro_1", character: "narrator", type: "diary", text: "Capital Corporativa no es una sola torre. Es un distrito entero de rascacielos, cada uno con el nombre de una empresa real detrás de su ticker." },
        { id: "m3s1_intro_2", character: "el_viejo_marco", type: "diary", text: "En crypto y forex operabas activos que no eran dueños de nada. Aquí compras una fracción real de una empresa: sus fábricas, sus patentes, su flujo de caja. Eso cambia cómo debes pensar el riesgo.", footnote: "— Primera entrada desde Capital Corporativa" },
        { id: "m3s1_intro_3", character: "aria", type: "aria_message", text: "El tamaño de una empresa se mide por su capitalización de mercado: precio por acción × acciones en circulación. Large cap (generalmente sobre $10,000 millones), mid cap ($2,000-$10,000 millones) y small cap (menos de $2,000 millones) no son solo etiquetas — indican liquidez y volatilidad esperada." },
        { id: "m3s1_intro_4", character: "el_especulador", type: "enemy_taunt", text: "¿Sabes qué me gusta? Las small caps. Compras a $2, la acción se duplica en un día. El riesgo es para los que piensan demasiado." },
      ],
      outroDialogues: [
        { id: "m3s1_outro_1", character: "aria", type: "tip", text: "Un índice como el S&P 500 es una canasta: agrupa cientos de empresas de distintos sectores y tamaños. Por eso se mueve menos que una acción individual — una mala noticia de una sola empresa se diluye entre las demás." },
        { id: "m3s1_outro_2", character: "el_viejo_marco", type: "diary", text: "El Especulador no está del todo equivocado sobre el potencial de las small caps. Lo que omite es la otra cara: menor liquidez, spreads más anchos, y caídas tan rápidas como las subidas.", footnote: "— Entrada #2 desde Capital Corporativa" },
      ],
      quiz: [
        { id: "q_m3s1_01", difficulty: "basico", conceptEvaluated: "Cálculo de capitalización de mercado", question: "Una empresa tiene 2,000 millones de acciones en circulación, cada una cotizando a $50. ¿Cuál es su capitalización de mercado?", options: [
          { id: "a", text: "$100,000 millones", isCorrect: true, feedback: "Correcto. Capitalización = precio por acción × acciones en circulación = $50 × 2,000 millones." },
          { id: "b", text: "$50 millones", isCorrect: false, feedback: "Ese sería solo el precio de una acción, no la capitalización total de la empresa." },
          { id: "c", text: "$2,000 millones", isCorrect: false, feedback: "Ese es solo el número de acciones en circulación, sin multiplicar por el precio." },
          { id: "d", text: "$1,000 millones", isCorrect: false, feedback: "El cálculo correcto es precio × acciones en circulación, no una división." },
        ], explanation: "Capitalización de mercado = precio por acción × número de acciones en circulación. En este caso: $50 × 2,000,000,000 = $100,000,000,000 ($100,000 millones), lo que la ubicaría como una empresa large cap." },
        { id: "q_m3s1_02", difficulty: "basico", conceptEvaluated: "Large cap vs small cap", question: "¿Cuál es la diferencia principal entre operar una acción large cap y una small cap?", options: [
          { id: "a", text: "Las large cap no pueden subir de precio", isCorrect: false, feedback: "Las large cap sí pueden subir; suelen hacerlo con menor volatilidad relativa que las small cap." },
          { id: "b", text: "Las large cap suelen tener mayor liquidez y menor volatilidad relativa; las small cap suelen tener menor liquidez y mayor volatilidad", isCorrect: true, feedback: "Correcto. Mayor tamaño generalmente implica más liquidez y movimientos porcentuales más moderados, aunque no siempre." },
          { id: "c", text: "Las small cap siempre pagan dividendos más altos", isCorrect: false, feedback: "No hay una relación garantizada entre tamaño de empresa y política de dividendos." },
          { id: "d", text: "No hay ninguna diferencia relevante para un trader", isCorrect: false, feedback: "La diferencia en liquidez y volatilidad es muy relevante para el tamaño de posición y el riesgo." },
        ], explanation: "Las empresas large cap (como AAPL o MSFT) suelen tener alta liquidez y volatilidad relativamente más contenida. Las small cap suelen ofrecer mayor potencial de movimiento porcentual, pero con menor liquidez y spreads más amplios." },
        { id: "q_m3s1_03", difficulty: "intermedio", conceptEvaluated: "Sectores del mercado", question: "NVDA (semiconductores) y XOM (petróleo) cotizan en la misma bolsa. ¿Por qué es útil saber que pertenecen a sectores distintos?", options: [
          { id: "a", text: "No es útil — todas las acciones reaccionan exactamente igual a las noticias", isCorrect: false, feedback: "Empresas de sectores distintos suelen reaccionar de forma diferente ante los mismos eventos macroeconómicos." },
          { id: "b", text: "Porque cada sector reacciona de forma distinta a eventos económicos, tasas de interés y ciclos — diversificar por sector reduce el riesgo de una sola narrativa", isCorrect: true, feedback: "Correcto. Tecnología y energía, por ejemplo, responden de forma distinta a la misma noticia sobre tasas de interés o precios del petróleo." },
          { id: "c", text: "Porque el sector determina el color del logo de la empresa", isCorrect: false, feedback: "El sector es una clasificación económica, no una convención visual." },
          { id: "d", text: "Porque solo las empresas tecnológicas pueden subir de precio", isCorrect: false, feedback: "Empresas de cualquier sector pueden subir o bajar de precio." },
        ], explanation: "Los sectores (Tecnología, Energía, Salud, Financiero, Consumo, Servicios Públicos, etc.) agrupan empresas con sensibilidades económicas parecidas. Tener exposición a varios sectores reduce el riesgo de que una sola narrativa afecte toda tu cartera." },
        { id: "q_m3s1_04", difficulty: "avanzado", conceptEvaluated: "Índice como canasta", question: "El S&P 500 cae solo 0.3% en un día en que una de sus empresas (una large cap) se desploma 15% por un escándalo. ¿Por qué el índice apenas se mueve?", options: [
          { id: "a", text: "Porque el índice ignora las malas noticias corporativas", isCorrect: false, feedback: "El índice no ignora la noticia — sí la refleja, pero diluida entre cientos de empresas." },
          { id: "b", text: "Porque el índice es una canasta de cientos de empresas; el peso de una sola, aunque caiga fuerte, se diluye en el promedio ponderado del conjunto", isCorrect: true, feedback: "Correcto. Esa es la esencia de un índice: diversificación automática entre muchas empresas y sectores." },
          { id: "c", text: "Porque los índices tienen un límite legal de caída diaria", isCorrect: false, feedback: "Existen mecanismos de circuit breakers para el mercado completo, pero no es la razón de este ejemplo." },
          { id: "d", text: "Porque esa empresa no forma parte realmente del índice", isCorrect: false, feedback: "El escenario asume que sí forma parte del índice; su caída simplemente se diluye entre las demás." },
        ], explanation: "Un índice pondera cientos de empresas. El desplome de una sola, incluso una large cap, representa solo una fracción del total — por eso el índice se mueve mucho menos que la acción individual afectada." },
      ],
      minigame: {
        id: "mg_m3s1", type: "sector_map", title: "El Mapa de Capitalización",
        description: "Clasifica cada empresa según su capitalización de mercado y entiende qué implica cada categoría.",
        instructions: "Para cada empresa, observa su capitalización de mercado en miles de millones (B) y clasifícala: large cap, mid cap indice, small cap volátil. 4 de 6 para aprobar.",
        config: {
          scenarios: [
            { ticker: "AAPL", sector: "Tecnología", marketCapB: 2_900, answer: "large_cap_indice" },
            { ticker: "NVDA", sector: "Semiconductores", marketCapB: 1_800, answer: "large_cap_indice" },
            { ticker: "REGN", sector: "Biotecnología", marketCapB: 85, answer: "mid_cap" },
            { ticker: "ETSY", sector: "Comercio Electrónico", marketCapB: 6.5, answer: "mid_cap" },
            { ticker: "IONQ", sector: "Computación Cuántica", marketCapB: 1.4, answer: "small_cap_volatil" },
            { ticker: "GME", sector: "Retail", marketCapB: 4.8, answer: "mid_cap" },
          ],
          requiredCorrect: 4,
        },
        passingScore: 66, virtualCapitalReward: 130,
      },
      rewards: { xp: 130, virtualCapital: 220 },
    },
    // ── MISIÓN 3S.2 — Temporada de Resultados ──
    {
      id: "m3s_2",
      order: 2,
      title: "Temporada de Resultados",
      subtitle: "Cuatro veces al año, el precio deja de escuchar al gráfico",
      description: "Cada trimestre, las empresas públicas reportan resultados: ingresos, ganancias por acción (EPS) y guía a futuro. Aprenderás a interpretar si un resultado fue positivo, negativo o mixto, y por qué mantener una posición durante el reporte implica un riesgo distinto al de cualquier patrón técnico.",
      learningObjectives: [
        "Interpretar ganancias por acción (EPS) frente a las estimaciones de analistas",
        "Distinguir un resultado que supera, iguala o no alcanza las expectativas",
        "Entender el rol de la guía a futuro (guidance) en la reacción del precio",
        "Reconocer el riesgo de gap al mantener una posición durante un reporte pendiente",
      ],
      keyConcepts: ["EPS", "ganancias por acción", "ingresos", "estimados de analistas", "guidance", "beat", "miss", "gap de apertura", "riesgo de earnings"],
      stockConcepts: ["EPS surprise", "forward guidance", "earnings gap risk"],
      referenceAssets: ["AAPL", "TSLA", "MSFT", "NVDA", "AMZN"],
      requiredMissions: ["m3s_1"],
      introDialogues: [
        { id: "m3s2_intro_1", character: "aria", type: "aria_message", text: "Cuatro veces al año, cada empresa pública reporta resultados: cuánto ingresó (revenue), cuánto ganó por acción (EPS) y qué espera para el próximo trimestre (guidance). Ese día, el precio puede moverse más en minutos que en semanas de análisis técnico." },
        { id: "m3s2_intro_2", character: "el_viejo_marco", type: "diary", text: "Un patrón técnico perfecto no sobrevive a un mal reporte de resultados. Vi rupturas alcistas convertirse en caídas del 20% en el pre-market, el mismo día del reporte.", footnote: "— Entrada #5 desde Capital Corporativa" },
        { id: "m3s2_intro_3", character: "la_señorita_fomo", type: "enemy_taunt", text: "¡NVDA reporta mañana! ¡Compremos hoy antes del reporte para no perdernos la subida!" },
        { id: "m3s2_intro_4", character: "aria", type: "warning", text: "La Señorita FOMO ignora que el mercado no sube ni baja según lo esperado — sube o baja según la sorpresa respecto a lo que los analistas ya esperaban. Mantener una posición sin gestionar ese riesgo es aceptar un gap que tu Stop Loss no puede prevenir." },
      ],
      outroDialogues: [
        { id: "m3s2_outro_1", character: "aria", type: "tip", text: "No basta con ver si la empresa ganó dinero. Lo que mueve el precio es la sorpresa: ¿superó, igualó o no alcanzó lo que el mercado ya esperaba? Y la guía a futuro pesa tanto como el resultado del trimestre que acaba de cerrar." },
        { id: "m3s2_outro_2", character: "el_viejo_marco", type: "diary", text: "El Stop Loss no te protege de un gap. Si no quieres asumir ese riesgo, la decisión se toma antes del reporte, no después.", footnote: "— Entrada #8 desde Capital Corporativa" },
      ],
      quiz: [
        { id: "q_m3s2_01", difficulty: "basico", conceptEvaluated: "EPS y estimados de analistas", question: "Una empresa reporta EPS de $2.40 cuando los analistas esperaban $2.10. ¿Cómo se describe este resultado?", options: [
          { id: "a", text: "Beat — superó las expectativas", isCorrect: true, feedback: "Correcto. Cuando el resultado real supera el estimado, se le llama 'beat'." },
          { id: "b", text: "Miss — no alcanzó las expectativas", isCorrect: false, feedback: "Miss describe lo contrario: cuando el resultado real queda por debajo de lo esperado." },
          { id: "c", text: "Inline — resultado en línea con lo esperado", isCorrect: false, feedback: "Inline se usa cuando el resultado coincide con el estimado, no cuando lo supera." },
          { id: "d", text: "Guidance — proyección para el próximo trimestre", isCorrect: false, feedback: "Guidance se refiere a la proyección futura, no al resultado del trimestre reportado." },
        ], explanation: "Cuando el EPS reportado supera el estimado de los analistas, se describe como 'beat'. Cuando queda por debajo, es 'miss'. Cuando coincide, es 'inline'." },
        { id: "q_m3s2_02", difficulty: "intermedio", conceptEvaluated: "Guidance y reacción del precio", question: "Una empresa reporta EPS que supera las expectativas, pero baja su guía (guidance) para el próximo trimestre. ¿Qué reacción es más probable?", options: [
          { id: "a", text: "El precio sube con fuerza, sin excepción, porque el trimestre reportado fue bueno", isCorrect: false, feedback: "El mercado mira hacia adelante — una guía reducida puede pesar más que el resultado ya conocido." },
          { id: "b", text: "La reacción es mixta o incluso negativa, porque el mercado valora más las expectativas futuras que el resultado ya pasado", isCorrect: true, feedback: "Correcto. Los mercados son forward-looking: una guía débil puede eclipsar un buen resultado trimestral." },
          { id: "c", text: "El precio no se mueve — el guidance no afecta la cotización", isCorrect: false, feedback: "El guidance suele tener un impacto tan fuerte como el resultado del trimestre reportado, o más." },
          { id: "d", text: "El precio solo reacciona al ingreso (revenue), nunca al guidance", isCorrect: false, feedback: "El guidance es uno de los factores con mayor peso en la reacción del precio tras un reporte." },
        ], explanation: "Los mercados valoran el futuro, no solo el pasado. Un beat en EPS acompañado de una guía reducida frecuentemente genera una reacción mixta o negativa, porque el mercado ajusta sus expectativas hacia adelante." },
        { id: "q_m3s2_03", difficulty: "intermedio", conceptEvaluated: "Riesgo de gap en earnings", question: "Tienes una posición abierta en una acción y su reporte de resultados es mañana antes de la apertura. ¿Qué riesgo específico enfrentas que un Stop Loss normal no puede prevenir?", options: [
          { id: "a", text: "Ninguno — el Stop Loss funciona igual en cualquier situación", isCorrect: false, feedback: "Un gap de apertura puede saltarse tu Stop Loss por completo." },
          { id: "b", text: "El riesgo de gap: el precio puede abrir muy por debajo (o encima) de tu Stop Loss, sin que este se ejecute al nivel planeado", isCorrect: true, feedback: "Correcto. Si el precio abre con un salto (gap) por debajo de tu SL, la orden se ejecuta al primer precio disponible, no al nivel exacto que colocaste." },
          { id: "c", text: "El riesgo de que el bróker cierre la cuenta automáticamente", isCorrect: false, feedback: "Los brokers no cierran cuentas automáticamente por reportes de resultados." },
          { id: "d", text: "El riesgo de que la acción deje de cotizar permanentemente", isCorrect: false, feedback: "Un reporte de resultados no suspende la cotización de una acción de forma permanente." },
        ], explanation: "Fuera de horario de mercado, un mal reporte puede generar un gap de apertura: el precio abre muy por debajo del cierre anterior, saltándose cualquier Stop Loss intermedio. Por eso mantener una posición a través de earnings es una decisión de riesgo distinta al análisis técnico habitual." },
        { id: "q_m3s2_04", difficulty: "avanzado", conceptEvaluated: "Interpretación integrada de un reporte", question: "Una empresa reporta EPS en línea con lo esperado, ingresos ligeramente por debajo, y mantiene su guía sin cambios. ¿Cómo se describe mejor esta reacción esperada?", options: [
          { id: "a", text: "Claramente alcista — cualquier reporte que no sea un desastre es una señal de compra", isCorrect: false, feedback: "Un resultado mixto sin catalizador claro no suele generar una reacción claramente alcista." },
          { id: "b", text: "Mixta, con cautela — no hay una sorpresa clara en ninguna dirección que justifique una reacción fuerte", isCorrect: true, feedback: "Correcto. Sin un beat contundente ni una guía que sorprenda, el mercado suele reaccionar con cautela, sin una dirección dominante." },
          { id: "c", text: "Claramente bajista — cualquier ingreso por debajo de lo esperado es una señal de venta inmediata", isCorrect: false, feedback: "Un ingreso ligeramente por debajo de lo esperado, junto con EPS en línea y guía sin cambios, no constituye por sí solo una señal bajista contundente." },
          { id: "d", text: "Imposible de interpretar sin más información", isCorrect: false, feedback: "La combinación de datos ya permite una lectura razonable: ausencia de sorpresa clara en cualquier dirección." },
        ], explanation: "Sin una sorpresa clara (ni un beat contundente ni una guía que cambie las expectativas), el mercado tiende a reaccionar con cautela y sin una dirección dominante — el resultado no ofrece un catalizador fuerte en ningún sentido." },
      ],
      minigame: {
        id: "mg_m3s2", type: "earnings_reaction", title: "El Reporte de Resultados",
        description: "Interpreta cada reporte de resultados y decide la reacción esperada más probable.",
        instructions: "Para cada empresa, evalúa si ya reportó o si el reporte está pendiente, y su EPS/guidance si corresponde. Elige la reacción esperada más probable. 4 de 6 para aprobar.",
        config: {
          scenarios: [
            { ticker: "AAPL", status: "publicado", epsSurprise: "beat", guidance: "raised", answer: "reaccion_alcista_fuerte" },
            { ticker: "NVDA", status: "pendiente", daysToRelease: 2, answer: "evitar_entrar_pre_earnings" },
            { ticker: "TSLA", status: "publicado", epsSurprise: "miss", guidance: "lowered", answer: "reaccion_bajista" },
            { ticker: "MSFT", status: "publicado", epsSurprise: "inline", guidance: "maintained", answer: "reaccion_mixta_cautela" },
            { ticker: "AMZN", status: "publicado", epsSurprise: "beat", guidance: "lowered", answer: "reaccion_mixta_cautela" },
            { ticker: "XOM", status: "publicado", epsSurprise: "miss", guidance: "maintained", answer: "reaccion_bajista" },
          ],
          requiredCorrect: 4,
        },
        passingScore: 66, virtualCapitalReward: 150,
      },
      rewards: { xp: 145, virtualCapital: 250 },
    },
    // ── MISIÓN 3S.3 — Dividendos y Acciones Corporativas ──
    {
      id: "m3s_3",
      order: 3,
      title: "Dividendos y Acciones Corporativas",
      subtitle: "Un split no te hace más rico. Un dividendo tiene fecha de vencimiento.",
      description: "Aprenderás a interpretar los eventos corporativos que confunden a más principiantes: la fecha ex-dividendo, los splits de acciones y las recompras (buybacks). Ninguno de estos eventos, por sí solo, cambia el valor real de tu inversión.",
      learningObjectives: [
        "Entender qué es un dividendo y qué significa la fecha ex-dividendo",
        "Explicar por qué un split de acciones no cambia el valor total de una posición",
        "Interpretar el efecto de una recompra de acciones (buyback)",
        "Distinguir un ajuste técnico de precio de una ganancia o pérdida real",
      ],
      keyConcepts: ["dividendo", "fecha ex-dividendo", "rendimiento por dividendo", "split de acciones", "recompra de acciones", "buyback", "ajuste técnico de precio"],
      stockConcepts: ["ex-dividend date mechanics", "stock split value neutrality", "buyback signal"],
      referenceAssets: ["KO", "JNJ", "PG", "AAPL"],
      requiredMissions: ["m3s_2"],
      introDialogues: [
        { id: "m3s3_intro_1", character: "el_viejo_marco", type: "diary", text: "Un principiante una vez me preguntó, alarmado, por qué su acción 'perdió valor de la nada' el mismo día que se anunció un split 2:1. No perdió nada. El número cambió; el valor total, no.", footnote: "— Entrada #10 desde Capital Corporativa" },
        { id: "m3s3_intro_2", character: "aria", type: "aria_message", text: "Un dividendo es un pago que la empresa reparte entre sus accionistas. Para cobrarlo, debes poseer la acción antes de la fecha ex-dividendo. El día ex-dividendo, el precio suele abrir más bajo, aproximadamente por el monto del dividendo — eso no es una pérdida, es un ajuste." },
        { id: "m3s3_intro_3", character: "don_panico", type: "enemy_taunt", text: "¡Mi acción cayó $0.75 de la nada esta mañana! ¡Algo terrible debe estar pasando!" },
        { id: "m3s3_intro_4", character: "aria", type: "warning", text: "Don Pánico describe, sin saberlo, un ajuste normal por fecha ex-dividendo. Antes de asumir catástrofe, revisa el calendario corporativo del activo." },
      ],
      outroDialogues: [
        { id: "m3s3_outro_1", character: "aria", type: "tip", text: "Tres reglas simples: un split cambia el número de acciones y el precio nominal, no el valor total. Un ajuste ex-dividendo no es una pérdida. Una recompra reduce acciones en circulación y suele ser una señal moderadamente positiva, sin garantizar una subida." },
        { id: "m3s3_outro_2", character: "el_viejo_marco", type: "diary", text: "El mercado está lleno de eventos que parecen dramáticos y son, en realidad, aritmética. Aprende a distinguir un ajuste de una señal real.", footnote: "— Entrada #12 desde Capital Corporativa" },
      ],
      quiz: [
        { id: "q_m3s3_01", difficulty: "basico", conceptEvaluated: "Fecha ex-dividendo", question: "¿Qué debes hacer para tener derecho a cobrar el próximo dividendo de una empresa?", options: [
          { id: "a", text: "Comprar la acción en cualquier momento antes de que se pague el dividendo", isCorrect: false, feedback: "No basta con comprar antes del pago — debes poseerla antes de la fecha ex-dividendo específicamente." },
          { id: "b", text: "Poseer la acción antes de la fecha ex-dividendo", isCorrect: true, feedback: "Correcto. Si compras en o después de la fecha ex-dividendo, no recibirás el próximo pago." },
          { id: "c", text: "Poseer la acción después de la fecha de pago", isCorrect: false, feedback: "Para esa fecha, el derecho al dividendo ya se determinó según quién poseía la acción antes de la fecha ex-dividendo." },
          { id: "d", text: "No es necesario poseer la acción — todos los inversionistas del mercado reciben el dividendo", isCorrect: false, feedback: "Solo los accionistas registrados antes de la fecha ex-dividendo reciben el pago." },
        ], explanation: "La fecha ex-dividendo determina quién tiene derecho al próximo pago. Si compras la acción en o después de esa fecha, el vendedor —no tú— recibirá el dividendo de ese ciclo." },
        { id: "q_m3s3_02", difficulty: "basico", conceptEvaluated: "Split de acciones y valor", question: "Una empresa hace un split 2:1. El precio pasa de $150 a $75 por acción. ¿Qué le pasó al valor total de una posición de 10 acciones?", options: [
          { id: "a", text: "Se redujo a la mitad — de $1,500 a $750", isCorrect: false, feedback: "El número de acciones también se duplicó, así que el valor total no cambia." },
          { id: "b", text: "Se mantuvo igual — ahora tienes 20 acciones de $75, el mismo valor total de $1,500", isCorrect: true, feedback: "Correcto. Un split ajusta el número de acciones y el precio nominal, pero el valor total de la posición no cambia." },
          { id: "c", text: "Se duplicó — de $1,500 a $3,000", isCorrect: false, feedback: "Un split no crea valor nuevo — es un ajuste técnico, no una ganancia." },
          { id: "d", text: "Se volvió imposible de calcular", isCorrect: false, feedback: "El cálculo es directo: nuevo número de acciones × nuevo precio, que da el mismo total que antes." },
        ], explanation: "Un split 2:1 duplica el número de acciones y reduce el precio nominal a la mitad. 10 acciones de $150 ($1,500) se convierten en 20 acciones de $75 ($1,500) — el valor total no cambia." },
        { id: "q_m3s3_03", difficulty: "intermedio", conceptEvaluated: "Ajuste de precio ex-dividendo", question: "Una acción cierra en $50.00. Al día siguiente (fecha ex-dividendo, dividendo de $0.50), abre en $49.50 sin ninguna otra noticia relevante. ¿Cómo se interpreta esta caída?", options: [
          { id: "a", text: "Como una señal bajista fuerte que exige vender de inmediato", isCorrect: false, feedback: "La caída coincide exactamente con el monto del dividendo — es un ajuste técnico, no una señal de venta." },
          { id: "b", text: "Como un ajuste técnico esperado por la fecha ex-dividendo, no como una pérdida de valor real", isCorrect: true, feedback: "Correcto. El precio se ajusta hacia abajo aproximadamente por el monto del dividendo repartido — el accionista recibe ese valor como efectivo, no lo pierde." },
          { id: "c", text: "Como un error del mercado que se corregirá solo", isCorrect: false, feedback: "No es un error — es el comportamiento esperado en una fecha ex-dividendo." },
          { id: "d", text: "Como evidencia de que la empresa está en problemas financieros", isCorrect: false, feedback: "Un ajuste ex-dividendo de este tamaño es rutinario y no indica problemas financieros por sí solo." },
        ], explanation: "En la fecha ex-dividendo, el precio de apertura típicamente se ajusta hacia abajo por aproximadamente el monto del dividendo. El accionista que tenía derecho al pago recibe ese valor en efectivo — no ha perdido valor, solo cambió de forma." },
        { id: "q_m3s3_04", difficulty: "avanzado", conceptEvaluated: "Recompra de acciones (buyback)", question: "Una empresa anuncia una recompra de acciones por $10,000 millones. ¿Cuál es la interpretación más precisa?", options: [
          { id: "a", text: "Garantiza que el precio subirá inmediatamente", isCorrect: false, feedback: "Un buyback no garantiza una subida de precio — es una señal, no una promesa." },
          { id: "b", text: "Reduce las acciones en circulación y suele interpretarse como una señal moderadamente positiva, sin garantizar una subida de precio", isCorrect: true, feedback: "Correcto. Al reducir el número de acciones en circulación, cada acción restante representa una porción mayor de la empresa — una señal favorable, pero no una garantía." },
          { id: "c", text: "Significa que la empresa está regalando dinero a cualquier inversionista", isCorrect: false, feedback: "Una recompra beneficia indirectamente a los accionistas existentes al reducir el número de acciones, no reparte efectivo directamente como un dividendo." },
          { id: "d", text: "Es idéntica en efecto a un dividendo en efectivo", isCorrect: false, feedback: "Un dividendo reparte efectivo directamente; un buyback reduce el número de acciones en circulación — mecanismos distintos." },
        ], explanation: "Un buyback reduce las acciones en circulación, lo que puede aumentar las ganancias por acción (EPS) y reflejar confianza de la administración en el valor de la empresa. Es una señal moderadamente positiva, pero no garantiza ningún movimiento de precio." },
      ],
      minigame: {
        id: "mg_m3s3", type: "corporate_action_planner", title: "El Planificador de Eventos Corporativos",
        description: "Interpreta cada evento corporativo y decide qué representa realmente para el valor de tu posición.",
        instructions: "Para cada situación, decide la interpretación correcta: ajuste técnico neutral, necesitas comprar antes de la fecha ex-dividendo, ya no calificas para el dividendo, o señal positiva sin garantía. 4 de 6 para aprobar.",
        config: {
          scenarios: [
            { situation: "PG anuncia un split 2:1: cada acción de $150 pasa a ser dos de $75.", answer: "no_es_descuento" },
            { situation: "KO paga un dividendo de $0.48 por acción. La fecha ex-dividendo es mañana y aún no compraste.", answer: "comprar_antes_ex_div" },
            { situation: "La fecha ex-dividendo de JNJ fue ayer. Compras hoy esperando cobrar el próximo pago programado.", answer: "ya_no_calificas" },
            { situation: "MSFT pasa su fecha ex-dividendo hoy; el precio abre $0.75 más bajo que el cierre de ayer, sin otras noticias.", answer: "efecto_neutral" },
            { situation: "AAPL anuncia una recompra de acciones por $10,000 millones.", answer: "positivo_sin_garantia" },
            { situation: "Una empresa completa una recompra que reduce 3% de sus acciones en circulación; el precio sube 2% ese día.", answer: "positivo_sin_garantia" },
          ],
          requiredCorrect: 4,
        },
        passingScore: 66, virtualCapitalReward: 150,
      },
      rewards: { xp: 155, virtualCapital: 250, badge: "analista_corporativo" },
    },
    // ── MISIÓN 3S.4 — Rotación Sectorial y Beta ──
    {
      id: "m3s_4",
      order: 4,
      title: "Rotación Sectorial y Beta",
      subtitle: "No todos los sectores prosperan al mismo tiempo",
      description: "El dinero institucional rota entre sectores según la fase del ciclo económico. Aprenderás qué es el beta de una acción, la diferencia entre sectores cíclicos y defensivos, y cómo ajustar tu exposición según el contexto de mercado.",
      learningObjectives: [
        "Interpretar el beta de una acción como medida de volatilidad relativa al mercado",
        "Distinguir sectores cíclicos de sectores defensivos",
        "Relacionar la fase del ciclo económico con el desempeño esperado por sector",
        "Ajustar la exposición sectorial según el contexto macroeconómico",
      ],
      keyConcepts: ["beta", "sector cíclico", "sector defensivo", "rotación sectorial", "ciclo económico", "expansión", "contracción"],
      stockConcepts: ["beta as relative volatility", "cyclical vs defensive sectors", "sector rotation by cycle phase"],
      referenceAssets: ["XLK (Tecnología)", "XLU (Utilities)", "XLY (Consumo Discrecional)", "XLP (Consumo Básico)"],
      requiredMissions: ["m3s_3"],
      introDialogues: [
        { id: "m3s4_intro_1", character: "aria", type: "aria_message", text: "El beta mide cuánto se mueve una acción o sector en relación al mercado general. Un beta de 1.4 significa que, en promedio, se mueve 40% más que el mercado. Un beta de 0.5 significa que se mueve la mitad." },
        { id: "m3s4_intro_2", character: "el_viejo_marco", type: "diary", text: "Tecnología y consumo discrecional suelen liderar cuando la economía se expande — la gente gasta con confianza. Servicios públicos y consumo básico se sostienen mejor cuando la economía se contrae — la gente sigue pagando la luz y comprando comida, pase lo que pase.", footnote: "— Entrada #15 desde Capital Corporativa" },
        { id: "m3s4_intro_3", character: "el_especulador", type: "enemy_taunt", text: "¿Sectores defensivos? Aburrido. Yo quiero el sector que suba más rápido, sin importar en qué fase esté la economía." },
        { id: "m3s4_intro_4", character: "aria", type: "warning", text: "El Especulador ignora que perseguir siempre el sector de mayor beta también significa asumir las caídas más pronunciadas cuando el ciclo cambia de dirección." },
      ],
      outroDialogues: [
        { id: "m3s4_outro_1", character: "aria", type: "tip", text: "En expansión, los sectores cíclicos (tecnología, consumo discrecional, industriales) suelen liderar. En contracción o incertidumbre, los sectores defensivos (utilities, consumo básico, salud) suelen ofrecer mayor estabilidad relativa." },
        { id: "m3s4_outro_2", character: "el_viejo_marco", type: "diary", text: "La rotación sectorial no es una ciencia exacta, pero ignorarla por completo es operar a ciegas sobre el contexto macroeconómico.", footnote: "— Entrada #18 desde Capital Corporativa" },
      ],
      quiz: [
        { id: "q_m3s4_01", difficulty: "basico", conceptEvaluated: "Qué mide el beta", question: "Una acción tiene un beta de 1.5. Si el mercado general sube 10%, ¿qué comportamiento sugiere el beta para esa acción (en promedio histórico)?", options: [
          { id: "a", text: "Subiría aproximadamente 15% — un movimiento amplificado respecto al mercado", isCorrect: true, feedback: "Correcto. Un beta de 1.5 sugiere una amplificación de aproximadamente 1.5 veces el movimiento del mercado, en promedio histórico." },
          { id: "b", text: "Subiría exactamente 10%, igual que el mercado", isCorrect: false, feedback: "Un beta de 1.5 sugiere un movimiento amplificado, no idéntico al del mercado." },
          { id: "c", text: "Bajaría 15%, en dirección opuesta al mercado", isCorrect: false, feedback: "Un beta positivo mayor a 1 sugiere movimiento en la misma dirección que el mercado, amplificado — no opuesto." },
          { id: "d", text: "El beta no tiene relación con el movimiento esperado de la acción", isCorrect: false, feedback: "El beta es precisamente una medida de la sensibilidad esperada de una acción frente al mercado general." },
        ], explanation: "El beta mide la volatilidad relativa al mercado. Un beta de 1.5 sugiere que, históricamente, la acción tiende a moverse un 50% más que el mercado en la misma dirección." },
        { id: "q_m3s4_02", difficulty: "basico", conceptEvaluated: "Sectores cíclicos vs defensivos", question: "¿Cuál de estos pares describe mejor la diferencia entre un sector cíclico y uno defensivo?", options: [
          { id: "a", text: "Cíclico: tiende a liderar en expansión económica. Defensivo: tiende a sostenerse mejor en contracción", isCorrect: true, feedback: "Correcto. Consumo discrecional y tecnología (cíclicos) dependen del gasto opcional; utilities y consumo básico (defensivos) cubren necesidades constantes." },
          { id: "b", text: "Cíclico: solo opera en verano. Defensivo: solo opera en invierno", isCorrect: false, feedback: "Los términos 'cíclico' y 'defensivo' se refieren al ciclo económico, no a estaciones del año." },
          { id: "c", text: "Cíclico: nunca paga dividendos. Defensivo: siempre paga dividendos", isCorrect: false, feedback: "La política de dividendos no define por sí sola si un sector es cíclico o defensivo." },
          { id: "d", text: "No hay diferencia real entre ambos términos", isCorrect: false, feedback: "La diferencia es real y relevante para decidir exposición sectorial según el contexto macroeconómico." },
        ], explanation: "Los sectores cíclicos (tecnología, consumo discrecional, industriales) dependen del gasto opcional y suelen liderar en expansión. Los defensivos (utilities, consumo básico, salud) cubren necesidades constantes y suelen sostenerse mejor en contracción." },
        { id: "q_m3s4_03", difficulty: "intermedio", conceptEvaluated: "Rotación sectorial según el ciclo", question: "La economía muestra señales claras de contracción: desempleo subiendo, gasto del consumidor cayendo. ¿Qué tipo de sectores suelen mostrar mejor desempeño relativo en este contexto?", options: [
          { id: "a", text: "Sectores cíclicos de alto beta, como consumo discrecional", isCorrect: false, feedback: "Los sectores cíclicos suelen sufrir más en contracción, no menos." },
          { id: "b", text: "Sectores defensivos de bajo beta, como utilities o consumo básico", isCorrect: true, feedback: "Correcto. En contracción, la demanda de bienes y servicios esenciales se mantiene más estable que el gasto discrecional." },
          { id: "c", text: "Cualquier sector, ya que el ciclo económico no afecta el desempeño relativo", isCorrect: false, feedback: "El ciclo económico sí influye de forma diferenciada en el desempeño relativo de los sectores." },
          { id: "d", text: "Solo el sector tecnológico, sin importar el contexto", isCorrect: false, feedback: "El sector tecnológico suele ser cíclico y de mayor beta, no defensivo." },
        ], explanation: "En contracción económica, los sectores defensivos (utilities, consumo básico, salud) suelen mostrar mayor estabilidad relativa porque la demanda de sus productos y servicios es menos sensible al ciclo económico." },
        { id: "q_m3s4_04", difficulty: "avanzado", conceptEvaluated: "Aplicación integrada de beta y ciclo", question: "El contexto macroeconómico muestra señales mixtas: ni clara expansión ni clara contracción. Un sector tiene beta 0.7. ¿Cómo deberías interpretar esta combinación?", options: [
          { id: "a", text: "Como una señal clara para sobreponderar agresivamente ese sector", isCorrect: false, feedback: "Un contexto de incertidumbre combinado con un beta moderado no ofrece una señal clara de sobreponderación agresiva." },
          { id: "b", text: "Como una posición de exposición neutral, seleccionando con cuidado en lugar de apostar fuerte a una sola dirección sectorial", isCorrect: true, feedback: "Correcto. Sin una señal clara de ciclo y con un beta moderado, la prudencia sugiere exposición neutral y selección cuidadosa, no una apuesta direccional fuerte." },
          { id: "c", text: "Como una señal clara para subponderar agresivamente ese sector", isCorrect: false, feedback: "Un beta moderado en un contexto incierto no justifica por sí solo una subponderación agresiva." },
          { id: "d", text: "El beta y el contexto de ciclo no se pueden combinar en un mismo análisis", isCorrect: false, feedback: "Combinar beta y contexto de ciclo es precisamente la forma de tomar decisiones de exposición sectorial informadas." },
        ], explanation: "Cuando el contexto de ciclo económico no es claro y el beta del sector es moderado (ni muy defensivo ni muy cíclico), la decisión prudente es mantener exposición neutral y seleccionar con cuidado, en vez de apostar fuerte en una sola dirección." },
      ],
      minigame: {
        id: "mg_m3s4", type: "sector_beta_gauge", title: "El Indicador de Rotación Sectorial",
        description: "Observa el sector, su beta y el contexto del ciclo económico. Decide la exposición correcta.",
        instructions: "Para cada combinación de sector, beta y contexto de mercado, decide: sobreponderar, subponderar, exposición neutral, o preferir sectores defensivos. 4 de 6 para aprobar.",
        config: {
          scenarios: [
            { sector: "Tecnología", beta: 1.4, marketTrend: "expansion", answer: "sobreponderar" },
            { sector: "Servicios Públicos (Utilities)", beta: 0.5, marketTrend: "contraccion", answer: "defensivo_preferido" },
            { sector: "Consumo Discrecional", beta: 1.3, marketTrend: "contraccion", answer: "subponderar" },
            { sector: "Salud", beta: 0.7, marketTrend: "incertidumbre", answer: "neutral_seleccionar" },
            { sector: "Industriales", beta: 1.2, marketTrend: "expansion", answer: "sobreponderar" },
            { sector: "Consumo Básico (Staples)", beta: 0.4, marketTrend: "expansion", answer: "neutral_seleccionar" },
          ],
          requiredCorrect: 4,
        },
        passingScore: 66, virtualCapitalReward: 160,
      },
      rewards: { xp: 165, virtualCapital: 280 },
    },
    // ── MISIÓN 3S.5 — El Gran Reto de Capital Corporativa (Boss Level 3) ──
    {
      id: "m3s_5",
      order: 5,
      title: "El Gran Reto de Capital Corporativa",
      subtitle: "Demuestra que puedes planear una operación con todo el contexto de una empresa real",
      description: "Misión Boss del Nivel 3 Stocks. Integrarás contexto sectorial, riesgo de concentración y earnings, y gestión de riesgo en acciones para construir y validar un plan de trading completo.",
      learningObjectives: [
        "Integrar contexto sectorial, riesgo de concentración/earnings y gestión de riesgo en un análisis completo",
        "Tomar una decisión de trading fundamentada en acciones",
        "Demostrar comprensión de los conceptos exclusivos del nivel 3 stocks",
      ],
      keyConcepts: ["síntesis nivel 3 stocks", "contexto sectorial", "riesgo de concentración", "riesgo de earnings", "gestión de riesgo en acciones", "decisión fundamentada"],
      stockConcepts: ["integración sector + concentración + earnings + sizing", "share-based position sizing", "trade plan wizard"],
      referenceAssets: ["NVDA", "MSFT", "AAPL"],
      requiredMissions: ["m3s_4"],
      introDialogues: [
        { id: "m3s5_intro_1", character: "el_viejo_marco", type: "diary", text: "Capital Corporativa tiene su propia prueba final. No pregunta si memorizaste qué es un dividendo. Pregunta si puedes combinar sector, concentración de cartera y calendario de resultados en una sola decisión, bajo presión de tiempo real.", footnote: "— Última entrada antes del Boss de Nivel 3 Stocks" },
        { id: "m3s5_intro_2", character: "aria", type: "aria_message", text: "Este reto integra todo el Nivel 3 Stocks: contexto sectorial, riesgo de concentración y earnings, y cálculo de posición en acciones. Tendrás un escenario completo y deberás: 1) leer el contexto sectorial, 2) evaluar el riesgo de concentración/earnings, 3) elegir la acción correcta, 4) trazar entrada con SL y TP, 5) calcular la posición en acciones." },
        { id: "m3s5_intro_3", character: "el_especulador", type: "enemy_taunt", text: "Esto está muy bien para un ejercicio de academia. En el mercado real, cuando el precio se mueve, nadie revisa sector, concentración y calendario de earnings antes de apretar el botón." },
        { id: "m3s5_intro_4", character: "el_viejo_marco", type: "diary", text: "El Especulador vuelve a tener razón en una cosa: el mercado no espera. Pero un trader que ya interiorizó este proceso no lo piensa paso a paso en el momento — lo reconoce de un vistazo, porque lo practicó aquí primero.", footnote: "— Respuesta al Especulador" },
      ],
      outroDialogues: [
        { id: "m3s5_outro_1", character: "aria", type: "aria_message", text: "Nivel 3 Stocks completado. Has demostrado que puedes operar acciones integrando contexto sectorial, riesgo de concentración, calendario de resultados y gestión de riesgo en acciones." },
        { id: "m3s5_outro_2", character: "el_viejo_marco", type: "diary", text: "Capital Corporativa sigue reportando, trimestre tras trimestre. La diferencia entre quienes sobreviven aquí y quienes no: los primeros aprendieron a leer la empresa detrás del ticker antes de leer solo el precio.", footnote: "— Entrada Final del Nivel 3, Capital Corporativa" },
        { id: "m3s5_outro_3", character: "narrator", type: "diary", text: "Las torres de Capital Corporativa siguen reportando sus números, trimestre tras trimestre. En algún lugar, una nueva ruta empieza a iluminarse." },
      ],
      quiz: [
        { id: "q_m3s5_01", difficulty: "avanzado", conceptEvaluated: "Integración: sector + concentración + earnings", question: "El contexto de mercado muestra expansión con tecnología liderando. Ya tienes MSFT (tecnología) en cartera. AAPL, del mismo sector, reporta earnings en 3 días. Consideras abrir NVDA (también tecnología). ¿Cuál es la lectura más completa?", options: [
          { id: "a", text: "Abrir NVDA sin cambios — es una empresa distinta a MSFT, así que no hay relación de riesgo", isCorrect: false, feedback: "MSFT y NVDA comparten sector (tecnología) y suelen tener sensibilidad correlacionada a las mismas narrativas macro." },
          { id: "b", text: "El sector tecnológico lidera en expansión, pero ya tienes exposición al sector vía MSFT y un peer reporta earnings pronto — conviene reducir el riesgo total antes de sumar más exposición al mismo sector", isCorrect: true, feedback: "Correcto. Buen contexto sectorial no significa ausencia de riesgo — la concentración existente y el calendario de earnings de un peer pesan en esta decisión." },
          { id: "c", text: "Cerrar todas las posiciones y evitar el sector tecnológico por completo", isCorrect: false, feedback: "Es una reacción desproporcionada — el objetivo es gestionar el riesgo, no evitarlo por completo." },
          { id: "d", text: "Duplicar MSFT en vez de abrir NVDA, para concentrar toda la convicción en una sola posición", isCorrect: false, feedback: "Duplicar la exposición en el mismo sector, con un peer reportando pronto, incrementa el riesgo en vez de gestionarlo." },
        ], explanation: "El contexto sectorial favorable no elimina el riesgo de concentración. Con MSFT ya en cartera y AAPL (mismo sector) reportando earnings pronto, la decisión prudente es reducir el riesgo total antes de sumar más exposición tecnológica." },
        { id: "q_m3s5_02", difficulty: "avanzado", conceptEvaluated: "Position sizing en acciones", question: "Capital $4,000, riesgo 2% ($80). Entrada NVDA en $120, Stop Loss en $114 (riesgo de $6 por acción). ¿Cuántas acciones puedes operar?", options: [
          { id: "a", text: "Aproximadamente 13 acciones", isCorrect: true, feedback: "Correcto. $80 ÷ $6 por acción ≈ 13.3 → 13 acciones, sin redondear hacia arriba." },
          { id: "b", text: "80 acciones", isCorrect: false, feedback: "Eso arriesgaría $480 — seis veces el límite de riesgo permitido." },
          { id: "c", text: "6 acciones", isCorrect: false, feedback: "Ese tamaño es menor al que realmente permite el riesgo calculado ($80 ÷ $6 ≈ 13.3)." },
          { id: "d", text: "1.33 acciones", isCorrect: false, feedback: "El resultado del cálculo es el número de acciones, no debe interpretarse como una fracción de acción en este contexto." },
        ], explanation: "Riesgo por acción = $120 − $114 = $6. Acciones = riesgo máximo ÷ riesgo por acción = $80 ÷ $6 ≈ 13.3 → 13 acciones, sin redondear hacia arriba." },
        { id: "q_m3s5_03", difficulty: "avanzado", conceptEvaluated: "Elegir la acción correcta dado el contexto", question: "Ya tienes una posición en MSFT (tecnología). Se presenta una oportunidad técnica en AAPL (mismo sector, reporta earnings en 3 días) y otra en NVDA (mismo sector, sin earnings próximos, setup técnico definido). ¿Cuál añade menos riesgo no gestionado a tu cartera actual?", options: [
          { id: "a", text: "AAPL, porque es la empresa más grande del sector", isCorrect: false, feedback: "El tamaño de la empresa no es el criterio relevante aquí — el riesgo de earnings inminente sí lo es." },
          { id: "b", text: "NVDA, porque no tiene un reporte de earnings inminente que añada riesgo de gap sobre una posición ya concentrada en el mismo sector", isCorrect: true, feedback: "Correcto. Aunque ambas comparten sector con MSFT, AAPL añade además un riesgo de gap por earnings inminente — NVDA permite gestionar mejor el riesgo total." },
          { id: "c", text: "AAPL, porque tiene el setup técnico más agresivo", isCorrect: false, feedback: "Un setup técnico agresivo no compensa el riesgo de gap de un reporte de earnings a 3 días de distancia." },
          { id: "d", text: "Ambas son equivalentes — el riesgo de earnings no es relevante si el setup técnico es válido", isCorrect: false, feedback: "El setup técnico es solo una parte del análisis; ignorar el riesgo de earnings inminente puede exponer a un gap no gestionado." },
        ], explanation: "Sumar una posición en el mismo sector que ya tienes concentrado (tecnología) implica cierto riesgo de por sí. Elegir además una empresa con earnings inminentes (AAPL) apila un riesgo de gap adicional. NVDA, sin ese catalizador cercano, permite gestionar mejor el riesgo total del portafolio." },
      ],
      minigame: {
        id: "mg_m3s5", type: "stock_trade_plan_wizard", title: "El Plan de Trading Integrado",
        description: "Escenario completo: recibe el contexto sectorial, de concentración y de earnings, y construye un plan de trading en 5 pasos.",
        instructions: "Contexto: expansión con tecnología liderando, ya tienes MSFT (tecnología) en cartera, AAPL (mismo sector) reporta earnings en 3 días. Completa: 1) lectura del contexto sectorial, 2) evaluación de riesgo de concentración/earnings, 3) elección de la acción a operar, 4) entrada+SL+TP con R:R 1:2 mínimo, 5) tamaño de posición en acciones al 2% con $4,000.",
        config: {
          scenario: {
            sectorContext: "expansion_tecnologia",
            earningsRisk: "AAPL reporta earnings en 3 días",
            currentHolding: "Ya tienes MSFT (tecnología) en cartera",
            stockToTrade: "NVDA",
            entryZoneLow: 118,
            entryZoneHigh: 122,
          },
          steps: 5, passingSteps: 4, capital: 4000, minRR: 2, maxRisk: 0.02,
        },
        passingScore: 80, virtualCapitalReward: 400,
      },
      rewards: { xp: 250, virtualCapital: 580, badge: "ciudadano_de_capital_corporativa" },
    },
  ],
}

// ─── HELPERS ─────────────────────────────────────────────────

/** Retorna una misión del nivel 3 stocks por su id */
export function getLevel3StocksMissionById(missionId: string): Level3StocksMission | undefined {
  return level3Stocks.missions.find((m) => m.id === missionId)
}

/** Retorna todas las preguntas del nivel 3 stocks en array plano */
export function getAllLevel3StocksQuestions(): QuizQuestion[] {
  return level3Stocks.missions.flatMap((m) => m.quiz)
}

/** Retorna los conceptos stocks únicos de todo el nivel */
export function getAllStockConcepts(): string[] {
  return Array.from(new Set(level3Stocks.missions.flatMap((m) => m.stockConcepts)))
}

/** Retorna los activos de referencia únicos del nivel */
export function getAllReferenceAssets(): string[] {
  return Array.from(new Set(level3Stocks.missions.flatMap((m) => m.referenceAssets)))
}

/** Calcula XP total del nivel 3 stocks */
export function getTotalLevel3StocksXP(): number {
  return level3Stocks.missions.reduce((acc, m) => acc + m.rewards.xp, 0)
}

/** Calcula el capital virtual acumulable en el nivel */
export function getTotalLevel3StocksCapitalRewards(): number {
  return level3Stocks.missions.reduce((acc, m) => {
    const missionCapital = m.rewards.virtualCapital
    const minigameCapital = m.minigame?.virtualCapitalReward ?? 0
    return acc + missionCapital + minigameCapital
  }, 0)
}

export default level3Stocks
