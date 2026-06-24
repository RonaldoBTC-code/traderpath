// ============================================================
// TraderPath — Level 2: "El Territorio del Precio"
// Nivel fundacional universal — el puente hacia la especialización
// ============================================================

import type {
  CharacterId,
  DialogueEntry,
  QuizQuestion,
  MissionRewards,
  Mission,
} from "./level1"

// ─── TIPOS EXTENDIDOS PARA NIVEL 2 ─────────────────────────

export type Level2MinigameType =
  | "match_term"
  | "candlestick_builder"
  | "candle_classifier"
  | "price_direction_quiz"
  | "chart_tap"
  | "zone_painter"
  | "pattern_identifier"
  | "order_simulator"
  | "market_preview"

export interface Level2Minigame {
  id: string
  type: Level2MinigameType
  title: string
  description: string
  instructions: string
  config: Record<string, unknown>
  passingScore: number
  virtualCapitalReward: number
}

export interface Level2Mission extends Omit<Mission, "minigame"> {
  minigame?: Level2Minigame
}

// ─── ESPECIALIZACIÓN DE MERCADO ─────────────────────────────

export type MarketSpecialization =
  | "crypto"
  | "forex"
  | "stocks"
  | "commodities"
  | "indices"
  | "futures"
  | "etfs"

export interface MarketOption {
  id: MarketSpecialization
  name: string
  icon: string
  tagline: string
  description: string
  volatility: "alta" | "media" | "baja"
  liquidez: "muy_alta" | "alta" | "media" | "baja"
  capitalMinimo: number
  horario: string
  ejemplosActivos: string[]
  rasgoDistintivo: string
  uiColor: string
  curvaAprendizaje: "suave" | "moderada" | "pronunciada"
}

export interface Level2Config {
  id: string
  order: number
  title: string
  tagline: string
  description: string
  startingCapitalEstimate: number
  totalMissions: number
  xpRequired: number
  missions: Level2Mission[]
  markets: MarketOption[]
}

// ─── LOS 7 MERCADOS ─────────────────────────────────────────

export const marketOptions: MarketOption[] = [
  {
    id: "crypto",
    name: "Criptomonedas",
    icon: "₿",
    tagline: "El mercado que nunca duerme",
    description: "Activos digitales descentralizados con alta volatilidad y operaciones disponibles las 24 horas, los 7 días de la semana. El mercado con mayor potencial de retorno y también mayor riesgo.",
    volatility: "alta",
    liquidez: "alta",
    capitalMinimo: 100,
    horario: "24/7 — sin cierres ni feriados",
    ejemplosActivos: ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT"],
    rasgoDistintivo: "Opera las 24 horas. Alta volatilidad = oportunidades grandes, pero riesgo proporcional.",
    uiColor: "#F7931A",
    curvaAprendizaje: "moderada",
  },
  {
    id: "forex",
    name: "Forex (Divisas)",
    icon: "💱",
    tagline: "El mercado más líquido del mundo",
    description: "Intercambio de pares de divisas entre bancos, instituciones y traders. Con más de $7 billones negociados diariamente, es el mercado más líquido que existe.",
    volatility: "media",
    liquidez: "muy_alta",
    capitalMinimo: 100,
    horario: "Lunes 00:00 — Viernes 22:00 UTC (5 días, 24 horas)",
    ejemplosActivos: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CHF"],
    rasgoDistintivo: "Spreads muy bajos gracias a la liquidez institucional. Menos gaps que otros mercados.",
    uiColor: "#00B4D8",
    curvaAprendizaje: "moderada",
  },
  {
    id: "stocks",
    name: "Acciones",
    icon: "📈",
    tagline: "Propiedad fraccionada del mundo corporativo",
    description: "Fracciones de propiedad de empresas que cotizan en bolsa. Mercado influenciado por resultados financieros, noticias corporativas y ciclos económicos.",
    volatility: "media",
    liquidez: "alta",
    capitalMinimo: 500,
    horario: "NYSE/NASDAQ: Lunes–Viernes 09:30–16:00 EST",
    ejemplosActivos: ["AAPL", "TSLA", "NVDA", "AMZN", "MSFT"],
    rasgoDistintivo: "Los earnings trimestrales generan movimientos fuertes predecibles en fechas conocidas.",
    uiColor: "#22C55E",
    curvaAprendizaje: "moderada",
  },
  {
    id: "commodities",
    name: "Materias Primas",
    icon: "🥇",
    tagline: "Los activos que mueven el mundo real",
    description: "Oro, petróleo, plata, gas natural y productos agrícolas. Alta correlación con variables macroeconómicas y geopolíticas. Históricamente usados como cobertura contra inflación.",
    volatility: "media",
    liquidez: "alta",
    capitalMinimo: 500,
    horario: "Varía por activo. Oro: 23h/día. Petróleo: 23h/día. Agrícolas: horas de sesión específicas.",
    ejemplosActivos: ["XAU/USD (Oro)", "WTI Crudo", "XAG/USD (Plata)", "Gas Natural", "Cobre"],
    rasgoDistintivo: "Fuertemente influenciado por eventos globales: guerras, sanciones, clima, reservas.",
    uiColor: "#EAB308",
    curvaAprendizaje: "pronunciada",
  },
  {
    id: "indices",
    name: "Índices Bursátiles",
    icon: "📊",
    tagline: "El pulso de una economía entera",
    description: "Canastas de acciones que representan el rendimiento de un sector o economía. Menor volatilidad que acciones individuales — el movimiento de una empresa no mueve el índice entero.",
    volatility: "baja",
    liquidez: "muy_alta",
    capitalMinimo: 500,
    horario: "Horario de bolsa local. S&P500/Nasdaq: 09:30–16:00 EST",
    ejemplosActivos: ["S&P 500", "Nasdaq 100", "DAX 40", "FTSE 100", "Nikkei 225"],
    rasgoDistintivo: "Los datos macro (empleo, inflación, tasas de la Fed) tienen impacto directo e inmediato.",
    uiColor: "#818CF8",
    curvaAprendizaje: "suave",
  },
  {
    id: "futures",
    name: "Futuros",
    icon: "⏱️",
    tagline: "Contratos que apuestan al precio de mañana",
    description: "Contratos estandarizados para comprar o vender un activo a un precio fijado en una fecha futura. Se usan para cobertura y especulación. Requieren margen y tienen fecha de vencimiento.",
    volatility: "alta",
    liquidez: "alta",
    capitalMinimo: 1000,
    horario: "Varía por contrato. CME Group: casi 24 horas en días de semana.",
    ejemplosActivos: ["ES (S&P500 Futuro)", "NQ (Nasdaq Futuro)", "CL (Crudo WTI)", "GC (Oro)", "6E (EUR/USD)"],
    rasgoDistintivo: "El rollover entre contratos genera costos y requiere seguimiento activo de fechas.",
    uiColor: "#F97316",
    curvaAprendizaje: "pronunciada",
  },
  {
    id: "etfs",
    name: "ETFs",
    icon: "🗂️",
    tagline: "Diversificación en un solo instrumento",
    description: "Fondos cotizados en bolsa que agrupan múltiples activos. Menores costos que fondos mutuos, mayor liquidez, y exposición diversificada a sectores, países o temáticas.",
    volatility: "baja",
    liquidez: "alta",
    capitalMinimo: 200,
    horario: "Horario de bolsa del mercado donde cotiza",
    ejemplosActivos: ["SPY (S&P500)", "QQQ (Nasdaq)", "GLD (Oro)", "VTI (Mercado total USA)", "ARKK (Innovación)"],
    rasgoDistintivo: "Ideal para trading de tendencia de mediano plazo con menor exposición al riesgo individual.",
    uiColor: "#06B6D4",
    curvaAprendizaje: "suave",
  },
]

// ─── NIVEL 2 ─────────────────────────────────────────────────

export const level2: Level2Config = {
  id: "level_2",
  order: 2,
  title: "El Territorio del Precio",
  tagline: "El precio no miente. Solo tú puedes malinterpretarlo.",
  description: "Profundizarás en las estructuras que gobiernan el movimiento del precio: zonas de oferta y demanda, soportes y resistencias, patrones de velas clave y tipos de órdenes. Al completar este nivel elegirás tu mercado de especialización — la decisión que definirá tu ruta de aprendizaje.",
  startingCapitalEstimate: 2_500,
  totalMissions: 5,
  xpRequired: 750,
  markets: marketOptions,
  missions: [
    // ──────────────────────────────────────────────────────
    // MISIÓN 2.1 — Las Zonas del Poder
    // ──────────────────────────────────────────────────────
    {
      id: "m2_1",
      order: 1,
      title: "Las Zonas del Poder",
      subtitle: "Dónde el precio recuerda lo que pasó",
      description: "Las zonas de oferta y demanda son las huellas que deja el dinero institucional en el gráfico. Aprenderás a identificarlas, interpretarlas y distinguir cuándo siguen siendo válidas.",
      learningObjectives: [
        "Entender qué es una zona de demanda (verde) y una zona de oferta (roja)",
        "Identificar cómo se forman las zonas en el gráfico",
        "Distinguir entre zonas frescas y zonas quemadas",
        "Comprender la lógica institucional detrás de las zonas",
      ],
      keyConcepts: ["zona de demanda", "zona de oferta", "zona fresca", "zona quemada", "dinero institucional", "retesteo", "price memory"],
      requiredMissions: ["m1_5"],
      introDialogues: [
        { id: "m2_1_intro_1", character: "narrator", type: "diary", text: "El diario de Marco tiene una página doblada. La abres." },
        { id: "m2_1_intro_2", character: "el_viejo_marco", type: "diary", text: "Los grandes jugadores no pueden entrar y salir del mercado en un instante. Son demasiado grandes. Necesitan tiempo, y mientras lo hacen, dejan marcas en el gráfico. Esas marcas son las zonas. Aprende a verlas y estarás viendo lo que el 90% de los traders novatos ignoran.", footnote: "— El Viejo Marco, Entrada #52" },
        { id: "m2_1_intro_3", character: "aria", type: "aria_message", text: "Una zona de DEMANDA (verde) es un rango de precios donde hubo más compradores que vendedores — el precio subió rápido desde ahí. Si el precio regresa, probablemente encontrará compradores nuevamente. Una zona de OFERTA (roja) es lo opuesto: el precio cayó rápido desde ahí, dejando vendedores sin ejecutar." },
        { id: "m2_1_intro_4", character: "el_especulador", type: "enemy_taunt", text: "Zonas, niveles, marcas del institucional... Todo eso suena muy bien en teoría. Pero en el momento en que el precio llega a esa zona, el miedo te paraliza y no entras. Lo sé porque me pasó muchas veces. La disciplina es más difícil de lo que crees." },
      ],
      outroDialogues: [
        { id: "m2_1_outro_1", character: "aria", type: "tip", text: "Clave visual: verde = demanda = compradores. Rojo = oferta = vendedores. Cuando el precio toca una zona por primera vez después de formarse, es una zona fresca — mayor probabilidad de reacción. Cuando ya la tocó varias veces, empieza a perder validez." },
        { id: "m2_1_outro_2", character: "el_viejo_marco", type: "diary", text: "Una zona quemada es una zona que el precio atravesó sin respetar. No le des otra oportunidad. El mercado tampoco se la da.", footnote: "— Entrada #58" },
      ],
      quiz: [
        { id: "q_m2_1_01", difficulty: "basico", conceptEvaluated: "Definición de zona de demanda", question: "¿Qué caracteriza a una zona de demanda en el gráfico?", options: [
          { id: "a", text: "Un rango donde el precio subió lentamente durante días", isCorrect: false, feedback: "Las zonas de demanda se forman por movimientos rápidos y contundentes, no lentos." },
          { id: "b", text: "Un rango de precio desde donde el mercado salió al alza de forma fuerte y rápida", isCorrect: true, feedback: "Correcto. La velocidad y fuerza del movimiento indica que había órdenes institucionales acumuladas." },
          { id: "c", text: "Cualquier zona donde el precio bajó en el pasado", isCorrect: false, feedback: "Que el precio baje no crea una zona de demanda — se necesita un rebote alcista fuerte." },
          { id: "d", text: "El nivel exacto del precio de cierre del día anterior", isCorrect: false, feedback: "Las zonas son rangos de precio, no niveles puntuales." },
        ], explanation: "Una zona de demanda es un rango de precios donde el mercado aceleró al alza con fuerza. Eso indica que había órdenes compradoras (institucionales o minoristas) sin ejecutar. Cuando el precio regresa, esas órdenes pueden reactivarse." },
        { id: "q_m2_1_02", difficulty: "basico", conceptEvaluated: "Zona fresca vs zona quemada", question: "Una zona de oferta 'fresca' significa que...", options: [
          { id: "a", text: "El precio la visitó muchas veces sin romperla", isCorrect: false, feedback: "Múltiples visitas desgastan la zona — ya no es fresca." },
          { id: "b", text: "El precio aún no ha regresado a esa zona desde que se formó", isCorrect: true, feedback: "Correcto. Fresca = intacta. Las órdenes que la crearon aún no se ejecutaron." },
          { id: "c", text: "Se formó hace menos de 24 horas", isCorrect: false, feedback: "La frescura no depende del tiempo sino de si el precio la retocó o no." },
          { id: "d", text: "Es una zona que el precio nunca tocó en la historia", isCorrect: false, feedback: "La zona se forma la primera vez que el precio la visita — ese primer contacto la crea." },
        ], explanation: "Una zona fresca es aquella donde el precio formó la zona (rebotó fuertemente) pero aún no ha regresado a retestearla. Las órdenes que generaron el movimiento original siguen sin ejecutarse — mayor probabilidad de reacción al primer retesteo." },
        { id: "q_m2_1_03", difficulty: "intermedio", conceptEvaluated: "Lógica institucional de las zonas", question: "¿Por qué las instituciones (bancos, fondos) dejan 'huellas' en el gráfico en forma de zonas?", options: [
          { id: "a", text: "Porque publican sus operaciones obligatoriamente por regulación", isCorrect: false, feedback: "Las instituciones no anuncian sus órdenes — el gráfico las revela indirectamente." },
          { id: "b", text: "Porque sus órdenes son tan grandes que no pueden ejecutarse en un solo instante, y el precio mueve al llenarse parcialmente", isCorrect: true, feedback: "Correcto. Una orden de $500M no se ejecuta en un segundo — tarda tiempo y genera el patrón visible en el gráfico." },
          { id: "c", text: "Porque imitan lo que hacen los traders minoristas", isCorrect: false, feedback: "Es al revés — los minoristas suelen imitar (sin saberlo) los niveles institucionales." },
          { id: "d", text: "Porque los algoritmos de trading están programados para crear zonas visibles", isCorrect: false, feedback: "Los algoritmos buscan liquidez, no crear zonas decorativas." },
        ], explanation: "Los grandes jugadores (bancos, fondos de cobertura, bancos centrales) manejan volúmenes que el mercado no puede absorber instantáneamente. Necesitan tiempo para llenarse. Esa acumulación gradual deja una huella de precio visible como zona en el gráfico." },
        { id: "q_m2_1_04", difficulty: "avanzado", conceptEvaluated: "Validación de zona por retesteo", question: "El precio llega a una zona de demanda fresca, la toca y rebota al alza. ¿Qué le ocurre a esa zona?", options: [
          { id: "a", text: "La zona se fortalece porque el precio la respetó", isCorrect: false, feedback: "No exactamente — la zona fue validada, pero parte de las órdenes ya se consumieron." },
          { id: "b", text: "La zona pierde algo de 'carga' porque algunas órdenes se ejecutaron. Deja de ser completamente fresca.", isCorrect: true, feedback: "Correcto. Cada visita consume parte de las órdenes acumuladas. Demasiadas visitas vacían la zona." },
          { id: "c", text: "La zona desaparece y ya no es relevante", isCorrect: false, feedback: "Un solo retesteo no invalida la zona, pero sí la debilita parcialmente." },
          { id: "d", text: "La zona se convierte en zona de oferta automáticamente", isCorrect: false, feedback: "El role reversal (cambio de rol) ocurre cuando la zona se rompe, no cuando la respeta." },
        ], explanation: "Cada vez que el precio visita una zona, ejecuta parte de las órdenes que la crearon. Una zona que el precio toca 3-4 veces tiene menos 'combustible' que una zona fresca. La segunda y tercera visita aún pueden producir reacción, pero con menor probabilidad de un rebote fuerte." },
      ],
      minigame: {
        id: "mg_m2_1",
        type: "zone_painter",
        title: "Pinta las Zonas",
        description: "Observa el gráfico y dibuja las zonas de oferta y demanda que identifiques.",
        instructions: "Usa el pincel verde para marcar zonas de DEMANDA. Usa el pincel rojo para marcar zonas de OFERTA. Identifica al menos 3 de las 5 zonas. Tolerancia: ±2% del nivel correcto.",
        config: {
          chartId: "btc_4h_level2_zones",
          candleCount: 50,
          correctZones: [
            { type: "demand", low: 82000, high: 84500, strength: "fresca" },
            { type: "demand", low: 88500, high: 90000, strength: "retestada_1" },
            { type: "supply", low: 96000, high: 97500, strength: "fresca" },
            { type: "supply", low: 93000, high: 94200, strength: "fresca" },
            { type: "demand", low: 85500, high: 87000, strength: "quemada" },
          ],
          requiredCorrect: 3,
        },
        passingScore: 60,
        virtualCapitalReward: 100,
      },
      rewards: { xp: 120, virtualCapital: 200 },
    },
    // ──────────────────────────────────────────────────────
    // MISIÓN 2.2 — El Mapa del Precio
    // ──────────────────────────────────────────────────────
    {
      id: "m2_2",
      order: 2,
      title: "El Mapa del Precio",
      subtitle: "Soportes, resistencias y la psicología de los niveles",
      description: "Aprenderás la diferencia entre soporte/resistencia y zonas de oferta/demanda, cómo un soporte roto se convierte en resistencia (y viceversa), y por qué los niveles psicológicos importan.",
      learningObjectives: [
        "Distinguir soporte de resistencia",
        "Entender el role reversal (cambio de rol de niveles)",
        "Identificar niveles psicológicos y su importancia",
        "Reconocer la estructura de mercado en un gráfico real",
      ],
      keyConcepts: ["soporte", "resistencia", "role reversal", "nivel psicológico", "ruptura", "retesteo de ruptura", "estructura de mercado"],
      requiredMissions: ["m2_1"],
      introDialogues: [
        { id: "m2_2_intro_1", character: "el_viejo_marco", type: "diary", text: "Un soporte es donde el suelo sostuvo. Una resistencia es donde el techo detuvo. Pero lo que nadie te dice es que el suelo de hoy fue el techo de ayer. El mercado tiene memoria. Los niveles cambian de rol cuando se rompen.", footnote: "— Entrada #63" },
        { id: "m2_2_intro_2", character: "aria", type: "aria_message", text: "Un SOPORTE es un nivel de precio donde el mercado ha rebotado al alza históricamente. Una RESISTENCIA es donde el mercado ha frenado o invertido su alza. El Role Reversal ocurre cuando un soporte roto se convierte en resistencia, y viceversa. Los niveles psicológicos (números redondos como $100, $10,000, $1.0000) atraen órdenes porque los traders los usan como referencia intuitiva." },
        { id: "m2_2_intro_3", character: "la_señorita_fomo", type: "enemy_taunt", text: "¡El precio está rompiendo la resistencia! ¡Hay que entrar ya! ¿Qué si es una ruptura falsa? No importa, todos están entrando... ¡el precio seguirá subiendo!" },
        { id: "m2_2_intro_4", character: "aria", type: "warning", text: "Atención: la Señorita FOMO acaba de describir cómo se forman las 'bull traps' (trampas alcistas). Una ruptura sin retesteo confirmado puede ser falsa. La paciencia de esperar el retesteo es lo que separa el trading disciplinado de la especulación impulsiva." },
      ],
      outroDialogues: [
        { id: "m2_2_outro_1", character: "aria", type: "tip", text: "Mapa mental: soporte → el precio rebota arriba. Resistencia → el precio rebota abajo. Ruptura → el nivel cambia de rol. Retesteo → confirmación de la ruptura. Falsa ruptura (fakeout) → el precio no confirma y regresa." },
        { id: "m2_2_outro_2", character: "el_viejo_marco", type: "diary", text: "Los niveles que todo el mundo ve son los más respetados. No por magia — porque todo el mundo pone sus órdenes ahí. La profecía autocumplida del mercado.", footnote: "— Entrada #71" },
      ],
      quiz: [
        { id: "q_m2_2_01", difficulty: "basico", conceptEvaluated: "Definición de soporte", question: "Un soporte es un nivel de precio donde...", options: [
          { id: "a", text: "El precio siempre cae porque hay muchos vendedores", isCorrect: false, feedback: "Eso describe una resistencia, no un soporte." },
          { id: "b", text: "El precio ha encontrado compradores que frenan la caída y provocan rebotes al alza", isCorrect: true, feedback: "Correcto. El soporte es el 'suelo' donde los compradores superan a los vendedores." },
          { id: "c", text: "El precio nunca puede bajar", isCorrect: false, feedback: "Los soportes se rompen con frecuencia. No son garantías, son probabilidades." },
          { id: "d", text: "El activo está en su precio más bajo histórico", isCorrect: false, feedback: "Un soporte puede aparecer en cualquier nivel de precio, no solo en mínimos históricos." },
        ], explanation: "Un soporte es un nivel donde la demanda históricamente ha superado a la oferta, provocando rebotes alcistas. Mientras más veces el precio rebote en ese nivel, más fuerte es el soporte — hasta que se rompe." },
        { id: "q_m2_2_02", difficulty: "intermedio", conceptEvaluated: "Role reversal", question: "El precio estaba en $10,000 de soporte. Lo rompe a la baja y llega a $8,000. Luego rebota y regresa a $10,000. ¿Qué es ahora ese nivel de $10,000?", options: [
          { id: "a", text: "Sigue siendo un soporte igual que antes", isCorrect: false, feedback: "Rompió el soporte — ese nivel cambió de rol." },
          { id: "b", text: "Una resistencia (role reversal: el soporte roto se convierte en techo)", isCorrect: true, feedback: "Correcto. Role reversal clásico. El precio que antes era suelo, ahora es techo." },
          { id: "c", text: "Un nivel neutro sin relevancia", isCorrect: false, feedback: "Los niveles donde hubo actividad histórica nunca son neutrales." },
          { id: "d", text: "Una zona de demanda fuerte donde conviene comprar", isCorrect: false, feedback: "Después de un role reversal, ese nivel ahora favorece a los vendedores." },
        ], explanation: "Role reversal: un soporte roto se convierte en resistencia. El mercado 'recuerda' ese nivel. Quienes compraron cerca de $10,000 y ahora tienen pérdidas usarán el rebote hasta $10,000 para 'cerrar sus pérdidas' — generando presión vendedora." },
        { id: "q_m2_2_03", difficulty: "intermedio", conceptEvaluated: "Niveles psicológicos", question: "¿Por qué niveles como $100, $50,000 o 1.0000 en Forex actúan frecuentemente como soporte o resistencia?", options: [
          { id: "a", text: "Porque los algoritmos están programados explícitamente para operar en números redondos", isCorrect: false, feedback: "Aunque algunos algoritmos los usan, la razón principal es más simple." },
          { id: "b", text: "Porque los traders (humanos e instituciones) colocan órdenes en números redondos por conveniencia, concentrando liquidez ahí", isCorrect: true, feedback: "Correcto. Es una profecía autocumplida: todos ponen órdenes ahí porque todos creen que son importantes." },
          { id: "c", text: "Porque los reguladores fijan esos precios como límites legales", isCorrect: false, feedback: "Los mercados libres no tienen precios fijados por regulación en estos niveles." },
          { id: "d", text: "Porque el valor intrínseco de los activos siempre termina en números redondos", isCorrect: false, feedback: "Los activos financieros no tienen 'valor intrínseco' que termine en redondo." },
        ], explanation: "Los niveles psicológicos funcionan por acción colectiva. Los traders humanos e institucionales tienden a colocar stops, tomas de ganancias y entradas en números redondos. Esa concentración de órdenes genera reacciones reales en el precio." },
        { id: "q_m2_2_04", difficulty: "avanzado", conceptEvaluated: "Ruptura vs falsa ruptura", question: "El precio cierra una vela diaria por encima de una resistencia clave. ¿Cuál es el enfoque más prudente?", options: [
          { id: "a", text: "Comprar inmediatamente al mercado — la ruptura está confirmada", isCorrect: false, feedback: "Una sola vela de ruptura no es confirmación suficiente. Los fakeouts son frecuentes." },
          { id: "b", text: "Ignorar la ruptura — siempre son falsas", isCorrect: false, feedback: "Las rupturas reales existen y son oportunidades importantes. Ignorarlas es un error." },
          { id: "c", text: "Esperar un retesteo del nivel roto (ahora soporte) para entrar con mejor riesgo/recompensa", isCorrect: true, feedback: "Correcto. El retesteo post-ruptura ofrece una entrada de mayor calidad con stop loss más cercano." },
          { id: "d", text: "Vender en corto asumiendo que es una falsa ruptura", isCorrect: false, feedback: "Asumir que es falsa sin evidencia es especulación sin base — el error opuesto al FOMO." },
        ], explanation: "Las rupturas más confiables incluyen un retesteo del nivel roto. Si el precio rompe una resistencia y luego la retestea (ahora soporte), confirmando que el nivel cambió de rol, la entrada tiene mayor probabilidad de éxito y permite un stop loss más ceñido." },
      ],
      minigame: {
        id: "mg_m2_2",
        type: "chart_tap",
        title: "Identifica el Nivel",
        description: "En cada gráfico, toca el nivel correcto según la pregunta: soporte, resistencia, o role reversal.",
        instructions: "Se mostrarán 6 gráficos. En cada uno deberás tocar el precio correcto según se te pida. 4 de 6 para aprobar.",
        config: {
          scenarios: [
            { type: "identify_support", chartId: "sc_sr_01" },
            { type: "identify_resistance", chartId: "sc_sr_02" },
            { type: "identify_role_reversal", chartId: "sc_sr_03" },
            { type: "identify_support", chartId: "sc_sr_04" },
            { type: "identify_psychological_level", chartId: "sc_sr_05" },
            { type: "identify_role_reversal", chartId: "sc_sr_06" },
          ],
          tolerance: 0.015,
          requiredCorrect: 4,
        },
        passingScore: 66,
        virtualCapitalReward: 100,
      },
      rewards: { xp: 130, virtualCapital: 200 },
    },
    // ──────────────────────────────────────────────────────
    // MISIÓN 2.3 — Las Cartas del Especulador
    // ──────────────────────────────────────────────────────
    {
      id: "m2_3",
      order: 3,
      title: "Las Cartas del Especulador",
      subtitle: "Los patrones que el mercado repite",
      description: "Los patrones de velas son el idioma visual del mercado. Aprenderás los 6 patrones más comunes y significativos que aparecen en cualquier mercado y temporalidad.",
      learningObjectives: [
        "Identificar y nombrar 6 patrones clave de velas japonesas",
        "Entender qué señal da cada patrón (continuación o reversión)",
        "Contextualizarlos correctamente — un patrón sin contexto no vale nada",
      ],
      keyConcepts: ["doji", "martillo (hammer)", "estrella fugaz (shooting star)", "envolvente alcista", "envolvente bajista", "pin bar", "patrón de reversión", "patrón de continuación", "contexto de mercado"],
      requiredMissions: ["m2_2"],
      introDialogues: [
        { id: "m2_3_intro_1", character: "el_viejo_marco", type: "diary", text: "El mercado habla con velas. Pero habla en contexto. Un martillo en medio de una tendencia alcista no es señal de nada. El mismo martillo en una zona de demanda fresca, después de una corrección, es una señal de alta probabilidad. El patrón sin contexto es ruido.", footnote: "— Entrada #78" },
        { id: "m2_3_intro_2", character: "aria", type: "aria_message", text: "Los 6 patrones que verás hoy: DOJI (indecisión), HAMMER/PIN BAR (rechazo de precios bajos), SHOOTING STAR (rechazo de precios altos), ENGULFING ALCISTA (absorción bullish), ENGULFING BAJISTA (absorción bearish), ESTRELLA DE LA MAÑANA / TARDE (reversión en 3 velas). Cada uno tiene su señal y su contexto ideal." },
        { id: "m2_3_intro_3", character: "el_especulador", type: "enemy_taunt", text: "Ah, los patrones. Mi trampa favorita. Los veo, entro sin mirar el contexto, y el mercado me lleva en la dirección contraria. Muy entretenido, especialmente cuando es dinero real." },
        { id: "m2_3_intro_4", character: "aria", type: "warning", text: "El Especulador acaba de describir el error número uno con los patrones: operar en vacío. Un Doji en zona de oferta + tendencia bajista no es lo mismo que un Doji en zona de demanda + tendencia alcista. El contexto cambia todo." },
      ],
      outroDialogues: [
        { id: "m2_3_outro_1", character: "aria", type: "tip", text: "Regla de oro: patrón + zona + tendencia = señal de alta calidad. Si solo tienes el patrón, tienes el 30% de la información. Combínalo siempre con la estructura del mercado." },
        { id: "m2_3_outro_2", character: "el_viejo_marco", type: "diary", text: "Un patrón que aparece en el lugar correcto, en el momento correcto, es una de las experiencias más satisfactorias del análisis técnico. No porque garantice nada — sino porque muestra que el mercado sigue siendo coherente.", footnote: "— Entrada #85" },
      ],
      quiz: [
        { id: "q_m2_3_01", difficulty: "basico", conceptEvaluated: "Identificación del Doji", question: "Un Doji tiene un cuerpo extremadamente pequeño o inexistente. ¿Qué comunica al mercado?", options: [
          { id: "a", text: "Que el precio va a subir fuertemente", isCorrect: false, feedback: "El Doji por sí solo no indica dirección — indica indecisión." },
          { id: "b", text: "Que compradores y vendedores quedaron en equilibrio durante ese período — indecisión", isCorrect: true, feedback: "Correcto. El Doji es la vela de la indecisión: nadie ganó la batalla del período." },
          { id: "c", text: "Que el activo perdió liquidez", isCorrect: false, feedback: "Un Doji puede aparecer en activos de alta liquidez durante una pausa." },
          { id: "d", text: "Que el precio bajará en el siguiente período", isCorrect: false, feedback: "El Doji no predice dirección — el contexto es lo que le da significado." },
        ], explanation: "El Doji refleja equilibrio entre compradores y vendedores: el precio cerró donde abrió. Su potencia surge del contexto: un Doji en resistencia + tendencia alcista débil sugiere posible reversión. Un Doji en zona de demanda sugiere pausar la caída." },
        { id: "q_m2_3_02", difficulty: "basico", conceptEvaluated: "Hammer (Martillo) y Pin Bar", question: "Un Hammer tiene cuerpo pequeño en la parte superior y mecha inferior muy larga. ¿Qué indica cuando aparece en una zona de demanda?", options: [
          { id: "a", text: "Que el precio seguirá bajando — la mecha larga muestra debilidad compradora", isCorrect: false, feedback: "La mecha inferior larga muestra rechazo de precios bajos, no debilidad compradora." },
          { id: "b", text: "Posible reversión alcista — el precio intentó bajar pero fue rechazado fuertemente", isCorrect: true, feedback: "Correcto. Los compradores tomaron el control e impidieron que el precio cerrara abajo." },
          { id: "c", text: "Un movimiento lateral sin dirección", isCorrect: false, feedback: "El Hammer es un patrón de reversión, no de lateralidad." },
          { id: "d", text: "Señal de venta inmediata", isCorrect: false, feedback: "En zona de demanda, el Hammer indica potencial alza — no venta." },
        ], explanation: "El Hammer (martillo) tiene una mecha inferior que representa la distancia que el precio intentó bajar y fue rechazado. En zona de demanda, es una señal de alta probabilidad de reversión alcista." },
        { id: "q_m2_3_03", difficulty: "intermedio", conceptEvaluated: "Engulfing Bajista", question: "Un Engulfing Bajista aparece cuando...", options: [
          { id: "a", text: "Una vela verde grande absorbe completamente a la vela roja anterior", isCorrect: false, feedback: "Eso sería un Engulfing Alcista." },
          { id: "b", text: "Una vela roja grande cubre completamente el cuerpo de la vela verde anterior", isCorrect: true, feedback: "Correcto. Los vendedores absorbieron todo el movimiento alcista previo y más." },
          { id: "c", text: "Dos velas rojas aparecen seguidas con el mismo tamaño", isCorrect: false, feedback: "Dos velas iguales no forman un Engulfing — se necesita que una 'envuelva' a la otra." },
          { id: "d", text: "Una vela roja cierra 1% por debajo del cierre anterior", isCorrect: false, feedback: "El Engulfing requiere que la vela nueva cubra completamente el cuerpo de la anterior." },
        ], explanation: "El Engulfing Bajista es un patrón de dos velas: la segunda (roja) engloba completamente el cuerpo de la primera (verde). En zona de oferta o resistencia, es una señal potente de reversión bajista." },
        { id: "q_m2_3_04", difficulty: "avanzado", conceptEvaluated: "Contexto de patrones", question: "Aparece un Shooting Star en medio de una tendencia alcista fuerte, lejos de cualquier resistencia o zona de oferta. ¿Cómo deberías interpretarlo?", options: [
          { id: "a", text: "Señal de venta fuerte — la estrella fugaz siempre indica reversión", isCorrect: false, feedback: "Los patrones sin contexto generan señales falsas con frecuencia." },
          { id: "b", text: "Señal de baja calidad — sin zona ni resistencia que le dé contexto, la probabilidad de reversión es baja", isCorrect: true, feedback: "Correcto. Un patrón sin contexto de zona o estructura reduce significativamente su fiabilidad." },
          { id: "c", text: "Señal perfecta de compra — en tendencia alcista, todos los patrones son alcistas", isCorrect: false, feedback: "Los patrones de reversión bajista en tendencia alcista deben evaluarse con contexto." },
          { id: "d", text: "Es el momento ideal para doblar el tamaño de la posición alcista", isCorrect: false, feedback: "Una señal de reversión potencial, aunque débil, no es razón para aumentar riesgo." },
        ], explanation: "Los patrones necesitan contexto para ser válidos. Un Shooting Star en zona de oferta relevante es una señal poderosa. El mismo patrón en el medio de una tendencia fuerte, sin nivel clave cercano, tiene mucho menos peso estadístico." },
      ],
      minigame: {
        id: "mg_m2_3",
        type: "pattern_identifier",
        title: "La Carta Correcta",
        description: "Identifica el patrón de vela que aparece en el gráfico y selecciona su nombre y señal correcta.",
        instructions: "Se mostrarán 8 velas o grupos de velas. Para cada una: 1) nombra el patrón, 2) indica si la señal es alcista, bajista o neutra.",
        config: {
          patterns: [
            { id: "p1", pattern: "doji", signal: "neutral", contextBonus: "en_resistencia" },
            { id: "p2", pattern: "hammer", signal: "bullish", contextBonus: "en_demanda" },
            { id: "p3", pattern: "shooting_star", signal: "bearish", contextBonus: "en_oferta" },
            { id: "p4", pattern: "bullish_engulfing", signal: "bullish", contextBonus: "post_corrección" },
            { id: "p5", pattern: "bearish_engulfing", signal: "bearish", contextBonus: "en_oferta" },
            { id: "p6", pattern: "pin_bar_alcista", signal: "bullish", contextBonus: "en_demanda" },
            { id: "p7", pattern: "morning_star", signal: "bullish", contextBonus: "tras_tendencia_bajista" },
            { id: "p8", pattern: "evening_star", signal: "bearish", contextBonus: "tras_tendencia_alcista" },
          ],
          bonusEnabled: true,
        },
        passingScore: 70,
        virtualCapitalReward: 120,
      },
      rewards: { xp: 140, virtualCapital: 200, badge: "lector_de_velas" },
    },
    // ──────────────────────────────────────────────────────
    // MISIÓN 2.4 — Hablar el Idioma del Mercado
    // ──────────────────────────────────────────────────────
    {
      id: "m2_4",
      order: 4,
      title: "Hablar el Idioma del Mercado",
      subtitle: "Las órdenes: cómo le dices al mercado lo que quieres",
      description: "Aprenderás los tipos de órdenes disponibles en cualquier plataforma de trading: cuándo usar cada una, sus ventajas y sus riesgos.",
      learningObjectives: [
        "Distinguir entre orden de mercado y orden límite",
        "Entender cuándo usar cada tipo de orden",
        "Combinar Stop Loss y Take Profit correctamente en una operación",
        "Evitar los errores más comunes al colocar órdenes",
      ],
      keyConcepts: ["market order", "limit order", "stop limit", "take profit", "stop loss", "slippage", "fill price", "trailing stop"],
      requiredMissions: ["m2_3"],
      introDialogues: [
        { id: "m2_4_intro_1", character: "aria", type: "aria_message", text: "Tipos de órdenes principales: MARKET ORDER = ejecuta inmediatamente al precio actual (rápida, pero con posible slippage). LIMIT ORDER = se ejecuta solo si el precio llega a tu nivel deseado (más control, pero puede no ejecutarse). STOP LOSS = cierra la posición si el precio te va en contra. TAKE PROFIT = cierra la posición si el precio llega a tu objetivo." },
        { id: "m2_4_intro_2", character: "el_viejo_marco", type: "diary", text: "Tuve un error que me costó caro: confundí una orden límite con una orden stop. Entré en la dirección contraria a la que quería. El mercado no tiene piedad con los errores operativos. Conoce cada tipo de orden como la palma de tu mano antes de ejecutar.", footnote: "— Entrada #93" },
        { id: "m2_4_intro_3", character: "don_panico", type: "enemy_taunt", text: "¡El precio está bajando! ¡Vende ya! ¡No importa a qué precio — vende al mercado, ahora mismo! ¡No hay tiempo para órdenes límite!" },
        { id: "m2_4_intro_4", character: "aria", type: "warning", text: "Don Pánico acaba de describir una de las peores situaciones: ejecutar una Market Order en un momento de alta volatilidad genera slippage — recibes un precio muy diferente al que veías en pantalla." },
      ],
      outroDialogues: [
        { id: "m2_4_outro_1", character: "aria", type: "tip", text: "Checklist antes de cualquier operación: 1) ¿Dónde entra? 2) ¿Dónde está el Stop Loss? 3) ¿Dónde está el Take Profit? 4) ¿Qué tipo de orden usaré? 5) ¿Revisé el tamaño de posición? Si no puedes responder las 5, no abras la operación." },
        { id: "m2_4_outro_2", character: "el_viejo_marco", type: "diary", text: "La ejecución perfecta de un plan mediocre supera a la ejecución pésima de un plan perfecto. El análisis sin disciplina en la ejecución no vale nada.", footnote: "— Entrada #99" },
      ],
      quiz: [
        { id: "q_m2_4_01", difficulty: "basico", conceptEvaluated: "Market Order vs Limit Order", question: "Quieres comprar BTC en una zona de demanda a $85,000, pero el precio actual es $87,000. ¿Qué tipo de orden usarías?", options: [
          { id: "a", text: "Market Order — para no perder el movimiento", isCorrect: false, feedback: "Una Market Order te ejecutaría a $87,000 — no en la zona de demanda que analizaste." },
          { id: "b", text: "Limit Order de compra a $85,000 — se ejecuta solo si el precio llega a ese nivel", isCorrect: true, feedback: "Correcto. La Limit Order espera que el precio llegue a tu zona objetivo." },
          { id: "c", text: "Stop Loss Order a $85,000", isCorrect: false, feedback: "Un Stop Loss a $85,000 cerraría una posición existente, no abriría una nueva." },
          { id: "d", text: "No es posible entrar en $85,000 si el precio está en $87,000", isCorrect: false, feedback: "Una Limit Order permite programar una entrada a un precio futuro." },
        ], explanation: "La Limit Order de compra se coloca por debajo del precio actual — se ejecuta si el precio baja hasta ese nivel. Es la herramienta para entrar en zonas de demanda sin perseguir el precio." },
        { id: "q_m2_4_02", difficulty: "intermedio", conceptEvaluated: "Slippage en Market Orders", question: "¿Qué es el 'slippage' en una Market Order?", options: [
          { id: "a", text: "El costo de la comisión del broker", isCorrect: false, feedback: "Las comisiones son costos fijos — el slippage es variable e impredecible." },
          { id: "b", text: "La diferencia entre el precio que veías al ejecutar y el precio al que realmente se ejecutó la orden", isCorrect: true, feedback: "Correcto. En momentos de alta volatilidad o baja liquidez, el slippage puede ser significativo." },
          { id: "c", text: "Cuando una orden límite no se ejecuta", isCorrect: false, feedback: "Que una Limit Order no se ejecute es normal — no es slippage." },
          { id: "d", text: "El spread entre el precio de compra y venta", isCorrect: false, feedback: "El spread es la diferencia bid-ask, no el slippage." },
        ], explanation: "El slippage ocurre porque el mercado se mueve en el microsegundo entre que envías la orden y se ejecuta. En activos líquidos el slippage suele ser mínimo. En activos poco líquidos o en momentos de volatilidad extrema, puede ser sustancial." },
        { id: "q_m2_4_03", difficulty: "intermedio", conceptEvaluated: "Colocación correcta de Take Profit", question: "Entras largo en $80,000 con Stop Loss en $78,000. Tu ratio R:R objetivo es 1:3. ¿Dónde colocarías el Take Profit?", options: [
          { id: "a", text: "$82,000 (ratio 1:1)", isCorrect: false, feedback: "1:1 no es eficiente — para que sea rentable a largo plazo necesitas al menos 1:1.5 o más." },
          { id: "b", text: "$86,000 (ratio 1:3 — tres veces el riesgo de $2,000)", isCorrect: true, feedback: "Correcto. Riesgo = $2,000. 3× riesgo = $6,000. Take Profit = $80,000 + $6,000 = $86,000." },
          { id: "c", text: "$90,000 (ratio 1:5)", isCorrect: false, feedback: "1:5 sería ideal pero la pregunta pedía 1:3." },
          { id: "d", text: "$78,000 — donde está el Stop Loss", isCorrect: false, feedback: "$78,000 es el Stop Loss — poner el TP ahí significaría cerrar con pérdida." },
        ], explanation: "Riesgo por unidad = entrada - stop loss = $80,000 - $78,000 = $2,000. Para un ratio 1:3, el TP = entrada + (riesgo × 3) = $80,000 + $6,000 = $86,000." },
        { id: "q_m2_4_04", difficulty: "avanzado", conceptEvaluated: "Trailing Stop", question: "Un Trailing Stop se ajusta automáticamente conforme el precio se mueve a tu favor. ¿Cuál es su principal ventaja?", options: [
          { id: "a", text: "Garantiza ganancias sin importar cómo se mueva el precio", isCorrect: false, feedback: "Ninguna herramienta garantiza ganancias. El trailing stop protege ganancias, no las garantiza." },
          { id: "b", text: "Bloquea ganancias progresivamente mientras el precio sube, sin limitar el potencial alcista", isCorrect: true, feedback: "Correcto. El trailing stop sube con el precio pero nunca baja — protegiendo el beneficio acumulado." },
          { id: "c", text: "Cierra la posición exactamente en el máximo del movimiento", isCorrect: false, feedback: "El trailing stop tiene un rezago — nunca cierra exactamente en el máximo." },
          { id: "d", text: "Elimina la necesidad de tener un Stop Loss fijo", isCorrect: false, feedback: "El trailing stop reemplaza al Stop Loss fijo, pero tiene sus propias limitaciones." },
        ], explanation: "Un Trailing Stop de $500 en una posición larga: si el precio sube de $80,000 a $85,000, el stop se mueve a $84,500. Si sigue subiendo a $90,000, el stop queda en $89,500. Si el precio baja desde $90,000, cierra en $89,500 protegiendo $9,500 de ganancia." },
      ],
      minigame: {
        id: "mg_m2_4",
        type: "order_simulator",
        title: "Simulador de Órdenes",
        description: "Dado un escenario de mercado, selecciona y configura las órdenes correctas.",
        instructions: "Se presentarán 4 escenarios. En cada uno: 1) selecciona el tipo de orden, 2) ingresa entrada, 3) coloca SL, 4) coloca TP con ratio mínimo 1:2.",
        config: {
          scenarios: [
            { id: "os1", setup: "ETH en $3,000. Zona de demanda fresca en $2,800.", correctOrderType: "limit_buy", entryPrice: 2800, suggestedSL: 2700, minRR: 2 },
            { id: "os2", setup: "Ruptura de resistencia en $95,000 con volumen fuerte.", correctOrderType: "market_buy", entryPrice: "current", suggestedSL: 93000, minRR: 2 },
            { id: "os3", setup: "Posición larga desde $1.0850 EUR/USD. Precio en $1.1050. Quieres asegurar ganancias.", correctOrderType: "trailing_stop", trailAmount: 0.005, minRR: null },
            { id: "os4", setup: "Precio en $50,000. Zona de oferta en $52,000. Quieres vender ahí.", correctOrderType: "limit_sell", entryPrice: 52000, suggestedSL: 53500, minRR: 2 },
          ],
          capitalVirtual: 2500,
          riskPerTrade: 0.02,
        },
        passingScore: 75,
        virtualCapitalReward: 150,
      },
      rewards: { xp: 150, virtualCapital: 200 },
    },
    // ──────────────────────────────────────────────────────
    // MISIÓN 2.5 — El Gran Tour de los Mercados
    // ──────────────────────────────────────────────────────
    {
      id: "m2_5",
      order: 5,
      title: "El Gran Tour de los Mercados",
      subtitle: "Conoce los 7 mundos antes de elegir el tuyo",
      description: "Misión final del Nivel 2 y el puente hacia la especialización. Harás un recorrido por los 7 mercados disponibles y, al final, elegirás el tuyo. Esta decisión define tu ruta de aprendizaje para los niveles 3–7.",
      learningObjectives: [
        "Conocer las características básicas de los 7 mercados disponibles",
        "Entender qué hace único a cada mercado",
        "Tomar una decisión informada de especialización",
        "Completar el primer desafío integrado del nivel 2",
      ],
      keyConcepts: ["crypto", "forex", "acciones", "materias primas", "índices", "futuros", "ETFs", "especialización", "ruta de mercado"],
      requiredMissions: ["m2_4"],
      introDialogues: [
        { id: "m2_5_intro_1", character: "narrator", type: "diary", text: "El Viejo Marco dejó un mapa. No es el mapa de una ciudad — es el mapa de los mercados del mundo." },
        { id: "m2_5_intro_2", character: "el_viejo_marco", type: "diary", text: "Llegaste hasta aquí. Ya tienes las herramientas básicas. Pero el mundo de los mercados no es uno — son siete mundos diferentes, cada uno con su propio carácter, sus propias horas, sus propios riesgos. Yo elegí el mío tarde y pagué el precio de aprender en el equivocado. Tú tienes información que yo no tuve. Úsala bien.", footnote: "— Entrada #107 (la última antes de la especialización)" },
        { id: "m2_5_intro_3", character: "aria", type: "aria_message", text: "Esta es la misión más importante del recorrido universal. Después de esta misión, tu ruta cambia. Todos los niveles 3 a 7 estarán enfocados en tu mercado elegido: sus patrones específicos, su dinámica, sus mejores estrategias. La elección puede cambiarse una sola vez durante el juego — y con una misión de transición especial." },
        { id: "m2_5_intro_4", character: "el_especulador", type: "enemy_taunt", text: "Yo elegí el de mayor volatilidad sin pensar. Claro, también el que te puede hacer ganar 300% en un mes... o perder todo en tres días. Elección de carácter, diría yo." },
      ],
      outroDialogues: [
        { id: "m2_5_outro_1", character: "aria", type: "aria_message", text: "Has elegido tu mercado. A partir de ahora, el Nivel 3 estará personalizado: los gráficos, los escenarios, los desafíos y los conceptos avanzados corresponderán a los instrumentos de tu mercado. Bienvenido a la especialización." },
        { id: "m2_5_outro_2", character: "el_viejo_marco", type: "diary", text: "Un especulador que conoce profundamente un solo mercado supera a diez que conocen todos superficialmente. Ve profundo. Ese es el único consejo que necesitas ahora.", footnote: "— Última entrada del Diario Universal. La próxima la encontrarás en tu mercado." },
        { id: "m2_5_outro_3", character: "narrator", type: "diary", text: "El mapa del Viejo Marco brilla. Un camino se ilumina. Tu ruta de especialización comienza." },
      ],
      quiz: [
        { id: "q_m2_5_01", difficulty: "intermedio", conceptEvaluated: "Características del mercado Forex", question: "¿Cuál es la característica más distintiva del mercado Forex comparado con los otros 6?", options: [
          { id: "a", text: "Es el único mercado disponible las 24 horas", isCorrect: false, feedback: "Crypto también opera 24/7. Forex opera 24h pero solo 5 días a la semana." },
          { id: "b", text: "Es el mercado más líquido del mundo, con más de $7 billones operados diariamente", isCorrect: true, feedback: "Correcto. Esa liquidez se traduce en spreads muy bajos y menor impacto de órdenes individuales." },
          { id: "c", text: "Solo se puede operar con dinero real", isCorrect: false, feedback: "Forex también tiene cuentas demo y cuentas con capital virtual." },
          { id: "d", text: "Tiene la mayor volatilidad de todos los mercados", isCorrect: false, feedback: "Crypto tiende a tener mayor volatilidad porcentual que Forex." },
        ], explanation: "El mercado Forex mueve más de $7 billones diariamente — más que todas las bolsas de valores del mundo juntas. Esa liquidez masiva hace que los pares principales tengan spreads mínimos." },
        { id: "q_m2_5_02", difficulty: "intermedio", conceptEvaluated: "Diferencia entre índices y acciones individuales", question: "¿Por qué el trading de índices se considera generalmente de menor riesgo que operar acciones individuales?", options: [
          { id: "a", text: "Porque los índices no pueden bajar de valor", isCorrect: false, feedback: "Los índices pueden caer significativamente — en 2008 el S&P500 cayó ~50%." },
          { id: "b", text: "Porque al ser una canasta de empresas, el impacto de noticias negativas de una sola empresa se diluye", isCorrect: true, feedback: "Correcto. Si una empresa del S&P500 cae 50%, su impacto en el índice es mínimo." },
          { id: "c", text: "Porque los índices tienen stop loss automático incorporado", isCorrect: false, feedback: "No existe stop loss automático en índices." },
          { id: "d", text: "Porque el gobierno garantiza el valor de los índices", isCorrect: false, feedback: "Ningún gobierno garantiza el valor de instrumentos financieros privados." },
        ], explanation: "La diversificación inherente de un índice reduce el riesgo específico de empresa. En una acción individual, un escándalo puede generar caídas del 30-50% en horas. En un índice con 500 empresas, ese evento tiene un impacto marginal." },
        { id: "q_m2_5_03", difficulty: "avanzado", conceptEvaluated: "Regla de cambio de mercado", question: "En TraderPath, la Ruta de Especialización permite cambiar de mercado una sola vez. ¿Por qué esta restricción tiene sentido desde el punto de vista pedagógico?", options: [
          { id: "a", text: "Para hacer el juego más difícil artificialmente", isCorrect: false, feedback: "La restricción tiene un fundamento educativo real." },
          { id: "b", text: "Porque cada mercado requiere conocimiento profundo específico, y cambiar constantemente impide la maestría", isCorrect: true, feedback: "Correcto. En trading real, los mejores traders conocen profundamente uno o dos mercados." },
          { id: "c", text: "Porque todos los mercados son idénticos y no vale la pena cambiar", isCorrect: false, feedback: "Los mercados son significativamente diferentes en dinámica, horario y comportamiento." },
          { id: "d", text: "Porque es una limitación técnica del juego", isCorrect: false, feedback: "Es una decisión pedagógica deliberada, no una limitación técnica." },
        ], explanation: "En el trading real, la especialización profunda en un mercado supera a conocer muchos superficialmente. Cada mercado tiene su propia personalidad: crypto tiene sus halving cycles, forex tiene sus sesiones, commodities tienen su estacionalidad." },
      ],
      minigame: {
        id: "mg_m2_5",
        type: "market_preview",
        title: "El Gran Tour",
        description: "Explora los 7 mercados interactivamente antes de elegir el tuyo.",
        instructions: "Recorre los 7 mercados. Para cada uno: lee sus características, observa su gráfico de muestra y responde 3 preguntas rápidas. Al final, selecciona tu especialización.",
        config: {
          markets: ["crypto", "forex", "stocks", "commodities", "indices", "futures", "etfs"],
          questionsPerMarket: 3,
          sampleChartCandles: 20,
          selectionScreen: {
            title: "Elige tu Especialización",
            warning: "Esta decisión define tu ruta. Podrás cambiarla una sola vez mediante el Gran Tour de los Mercados.",
            confirmationRequired: true,
          },
          savesToProfile: true,
          profileField: "marketSpecialization",
        },
        passingScore: 60,
        virtualCapitalReward: 300,
      },
      rewards: { xp: 200, virtualCapital: 500, badge: "explorador_de_mercados" },
    },
  ],
}

// ─── HELPERS ─────────────────────────────────────────────────

/** Retorna una misión del nivel 2 por su id */
export function getLevel2MissionById(missionId: string): Level2Mission | undefined {
  return level2.missions.find((m) => m.id === missionId)
}

/** Retorna todas las preguntas del nivel 2 en un array plano */
export function getAllLevel2Questions(): QuizQuestion[] {
  return level2.missions.flatMap((m) => m.quiz)
}

/** Retorna la información de un mercado por su id */
export function getMarketById(marketId: MarketSpecialization): MarketOption | undefined {
  return marketOptions.find((m) => m.id === marketId)
}

/** Retorna los mercados ordenados por curva de aprendizaje (de suave a pronunciada) */
export function getMarketsByCurve(): MarketOption[] {
  const order = { suave: 0, moderada: 1, pronunciada: 2 }
  return [...marketOptions].sort((a, b) => order[a.curvaAprendizaje] - order[b.curvaAprendizaje])
}

/** Calcula el XP total disponible en el nivel 2 */
export function getTotalLevel2XP(): number {
  return level2.missions.reduce((acc, m) => acc + m.rewards.xp, 0)
}

/** Calcula el capital virtual total acumulable en el nivel 2 */
export function getTotalLevel2CapitalRewards(): number {
  return level2.missions.reduce((acc, m) => {
    const missionCapital = m.rewards.virtualCapital
    const minigameCapital = m.minigame?.virtualCapitalReward ?? 0
    return acc + missionCapital + minigameCapital
  }, 0)
}

export default level2
