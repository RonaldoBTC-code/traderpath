// ============================================================
// TraderPath — Level 1: "El Despertar del Especulador"
// Nivel fundacional universal (sin especialización de mercado)
// ============================================================

// ─── TIPOS BASE ────────────────────────────────────────────

export type CharacterId =
  | "el_viejo_marco"
  | "aria"
  | "el_especulador"
  | "la_señorita_fomo"
  | "don_panico"
  | "narrator"

export type DialogueType = "diary" | "aria_message" | "warning" | "tip" | "enemy_taunt"

export type MinigameType =
  | "candlestick_builder"
  | "candle_classifier"
  | "price_direction_quiz"
  | "chart_tap"
  | "match_term"

export type QuizDifficulty = "basico" | "intermedio" | "avanzado"

export interface DialogueEntry {
  id: string
  character: CharacterId
  type: DialogueType
  text: string
  /** Texto opcional que aparece debajo (notas del diario, firma, etc.) */
  footnote?: string
}

export interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
  feedback: string
}

export interface QuizQuestion {
  id: string
  difficulty: QuizDifficulty
  conceptEvaluated: string
  question: string
  options: QuizOption[]
  /** Explicación que aparece al revelar la respuesta */
  explanation: string
  /** Referencia al concepto en el GDD o material fuente */
  conceptRef?: string
}

export interface Minigame {
  id: string
  type: MinigameType
  title: string
  description: string
  instructions: string
  /** Parámetros de configuración específicos del tipo de mini-juego */
  config: Record<string, unknown>
  passingScore: number
  virtualCapitalReward: number
}

export interface MissionRewards {
  xp: number
  virtualCapital: number
  badge?: string
  unlocksCharacter?: CharacterId
}

export interface Mission {
  id: string
  order: number
  title: string
  subtitle: string
  description: string
  /** Objetivos de aprendizaje al completar la misión */
  learningObjectives: string[]
  /** Conceptos clave que se evalúan en esta misión */
  keyConcepts: string[]
  introDialogues: DialogueEntry[]
  outroDialogues: DialogueEntry[]
  quiz: QuizQuestion[]
  minigame?: Minigame
  rewards: MissionRewards
  /** Misiones previas requeridas (por id) */
  requiredMissions: string[]
}

export interface LevelConfig {
  id: string
  order: number
  title: string
  tagline: string
  description: string
  startingCapital: number
  totalMissions: number
  /** XP necesario para desbloquear el siguiente nivel */
  xpRequired: number
  missions: Mission[]
}

// ─── NIVEL 1 ────────────────────────────────────────────────

export const level1: LevelConfig = {
  id: "level_1",
  order: 1,
  title: "El Despertar del Especulador",
  tagline: "El mercado ha existido antes que tú. Ahora es tu turno de entenderlo.",
  description:
    "Aprenderás los fundamentos del trading: qué son los mercados, cómo se mueven los precios, qué es una vela japonesa y cómo se lee un gráfico básico. Aquí no existe especialización aún — todos comienzan desde el mismo punto.",
  startingCapital: 1_000,
  totalMissions: 5,
  xpRequired: 500,
  missions: [
    // ──────────────────────────────────────────────────────
    // MISIÓN 1.1 — Bienvenido al Mercado
    // ──────────────────────────────────────────────────────
    {
      id: "m1_1",
      order: 1,
      title: "Bienvenido al Mercado",
      subtitle: "El lugar donde todo comienza",
      description:
        "Tu primer contacto con el mundo del trading. Descubrirás qué es un mercado financiero, quiénes participan en él y por qué los precios se mueven.",
      learningObjectives: [
        "Entender qué es un mercado financiero",
        "Identificar los actores principales del mercado",
        "Comprender la ley básica de oferta y demanda aplicada al precio",
      ],
      keyConcepts: ["mercado financiero", "oferta", "demanda", "precio", "liquidez"],
      requiredMissions: [],
      introDialogues: [
        {
          id: "m1_1_intro_1",
          character: "narrator",
          type: "diary",
          text: "Un diario viejo aparece frente a ti. Las páginas están amarillas, pero la tinta es clara.",
        },
        {
          id: "m1_1_intro_2",
          character: "el_viejo_marco",
          type: "diary",
          text: "Si estás leyendo esto, significa que decidiste entrar. Bien. El mercado es el único lugar en el mundo donde dos personas pueden llegar a un acuerdo y ambas creer que hicieron el mejor negocio. Uno vende porque cree que el precio bajará. El otro compra porque cree que subirá. Ambos tienen razón... hasta que el mercado decide quién estaba equivocado.",
          footnote: "— El Viejo Marco, Diario del Especulador, Entrada #1",
        },
        {
          id: "m1_1_intro_3",
          character: "aria",
          type: "aria_message",
          text: "Hola, soy ARIA — tu Asistente de Ruta para Inteligencia en el Arte del trading. Estaré contigo en cada misión. Un mercado financiero es simplemente un lugar (físico o digital) donde compradores y vendedores intercambian activos. El precio es el punto donde ambos se ponen de acuerdo.",
        },
        {
          id: "m1_1_intro_4",
          character: "el_especulador",
          type: "enemy_taunt",
          text: "¿Mercados? ¿Oferta y demanda? Eso es para los libros de texto. Yo opero por instinto. Y siempre gano... al principio.",
        },
      ],
      outroDialogues: [
        {
          id: "m1_1_outro_1",
          character: "aria",
          type: "aria_message",
          text: "Excelente. Ya sabes que un mercado es un sistema de acuerdos entre compradores y vendedores. El precio no es caprichoso — refleja el consenso colectivo en cada momento. Siguiente parada: las velas japonesas.",
        },
        {
          id: "m1_1_outro_2",
          character: "el_viejo_marco",
          type: "diary",
          text: "Hay traders que pasan años operando sin entender esto. El mercado no tiene piedad con los que ignoran sus fundamentos. Tú ya llevas ventaja.",
          footnote: "— Entrada #2",
        },
      ],
      quiz: [
        {
          id: "q_m1_1_01",
          difficulty: "basico",
          conceptEvaluated: "Definición de mercado financiero",
          question: "¿Qué es un mercado financiero?",
          options: [
            { id: "a", text: "Un lugar físico donde solo se vende oro y divisas", isCorrect: false, feedback: "Los mercados financieros no se limitan a activos físicos ni a un lugar." },
            { id: "b", text: "Un sistema donde compradores y vendedores intercambian activos a un precio acordado", isCorrect: true, feedback: "Correcto. El precio es el punto de acuerdo entre quienes compran y quienes venden." },
            { id: "c", text: "Una aplicación de tu banco para transferir dinero", isCorrect: false, feedback: "Eso sería banca digital, no un mercado financiero." },
            { id: "d", text: "El lugar donde el gobierno fija el precio de las acciones", isCorrect: false, feedback: "En los mercados libres, el precio no lo fija el gobierno — lo determina la oferta y la demanda." },
          ],
          explanation: "Un mercado financiero es cualquier espacio (físico o digital) donde se intercambian activos financieros. El precio surge del equilibrio entre lo que los compradores están dispuestos a pagar y lo que los vendedores están dispuestos a aceptar.",
        },
        {
          id: "q_m1_1_02",
          difficulty: "basico",
          conceptEvaluated: "Ley de oferta y demanda",
          question: "Si hay muchos más compradores que vendedores para un activo, ¿qué tiende a pasar con su precio?",
          options: [
            { id: "a", text: "El precio baja porque hay más demanda", isCorrect: false, feedback: "Más demanda sobre menos oferta empuja el precio en la dirección opuesta." },
            { id: "b", text: "El precio sube porque la demanda supera la oferta", isCorrect: true, feedback: "Exacto. Mayor demanda + menor oferta = precio sube." },
            { id: "c", text: "El precio no cambia, siempre es fijo", isCorrect: false, feedback: "En los mercados libres, los precios fluctúan constantemente." },
            { id: "d", text: "El precio sube solo si el gobierno lo autoriza", isCorrect: false, feedback: "Los mercados libres no requieren autorización gubernamental para mover precios." },
          ],
          explanation: "La ley de oferta y demanda es el motor de los precios. Más compradores que vendedores = el activo se vuelve más escaso = el precio sube. Es la base de todo lo que verás en los gráficos.",
        },
        {
          id: "q_m1_1_03",
          difficulty: "intermedio",
          conceptEvaluated: "Participantes del mercado",
          question: "¿Cuál de los siguientes NO es un participante típico de los mercados financieros?",
          options: [
            { id: "a", text: "Traders minoristas (personas individuales)", isCorrect: false, feedback: "Los traders minoristas son participantes activos del mercado." },
            { id: "b", text: "Fondos de inversión institucionales", isCorrect: false, feedback: "Las instituciones son los actores con mayor volumen en los mercados." },
            { id: "c", text: "Bancos centrales", isCorrect: false, feedback: "Los bancos centrales intervienen en mercados como forex con política monetaria." },
            { id: "d", text: "Ciudadanos que solo usan efectivo", isCorrect: true, feedback: "Correcto. Quien no participa en el intercambio de activos no es un participante de mercado." },
          ],
          explanation: "Los mercados financieros incluyen traders minoristas, instituciones, fondos de cobertura, bancos, bancos centrales y market makers. Alguien que solo usa efectivo y no invierte ni opera activos no interactúa directamente con estos mercados.",
        },
      ],
      minigame: {
        id: "mg_m1_1",
        type: "match_term",
        title: "Conecta los Conceptos",
        description: "Arrastra cada término a su definición correcta.",
        instructions: "Conecta cada palabra de la izquierda con su definición de la derecha. Tienes 60 segundos.",
        config: {
          timeLimit: 60,
          pairs: [
            { term: "Mercado", definition: "Sistema de intercambio de activos" },
            { term: "Precio", definition: "Acuerdo entre comprador y vendedor" },
            { term: "Liquidez", definition: "Facilidad para comprar o vender sin mover mucho el precio" },
            { term: "Demanda", definition: "Presión de los compradores sobre el activo" },
            { term: "Oferta", definition: "Cantidad disponible de un activo para vender" },
          ],
        },
        passingScore: 80,
        virtualCapitalReward: 50,
      },
      rewards: {
        xp: 80,
        virtualCapital: 100,
        badge: "primer_paso",
      },
    },
    // ──────────────────────────────────────────────────────
    // MISIÓN 1.2 — Las Velas del Tiempo
    // ──────────────────────────────────────────────────────
    {
      id: "m1_2",
      order: 2,
      title: "Las Velas del Tiempo",
      subtitle: "Cada vela cuenta una historia de 4 precios",
      description:
        "Aprenderás a leer velas japonesas: la unidad de información más fundamental en el análisis técnico. Entenderás qué representa cada parte de una vela y la diferencia entre alcista y bajista.",
      learningObjectives: [
        "Identificar las 4 partes de una vela japonesa (apertura, cierre, máximo, mínimo)",
        "Distinguir una vela alcista de una bajista",
        "Interpretar el tamaño del cuerpo y las mechas",
      ],
      keyConcepts: ["vela japonesa", "apertura", "cierre", "máximo", "mínimo", "cuerpo", "mecha", "alcista", "bajista"],
      requiredMissions: ["m1_1"],
      introDialogues: [
        {
          id: "m1_2_intro_1",
          character: "el_viejo_marco",
          type: "diary",
          text: "Los japoneses del siglo XVII ya usaban esto para operar arroz. Cada vela es una fotografía de la batalla entre compradores y vendedores durante un período de tiempo. Aprende a leerlas y el gráfico te hablará.",
          footnote: "— Entrada #7, sobre las velas de Munehisa Homma",
        },
        {
          id: "m1_2_intro_2",
          character: "aria",
          type: "aria_message",
          text: "Una vela japonesa registra 4 precios: Apertura (O), Máximo (H), Mínimo (L) y Cierre (C). El cuerpo muestra la diferencia entre apertura y cierre. Las mechas muestran los extremos alcanzados. Si el cierre es mayor que la apertura, la vela es verde (alcista). Si el cierre es menor, es roja (bajista).",
        },
        {
          id: "m1_2_intro_3",
          character: "la_señorita_fomo",
          type: "enemy_taunt",
          text: "¿Para qué aprender todo eso? ¡Si el precio sube, todos compran! No necesitas entender velas, solo seguir a la multitud... ¿verdad?",
        },
      ],
      outroDialogues: [
        {
          id: "m1_2_outro_1",
          character: "aria",
          type: "aria_message",
          text: "Ya puedes leer la historia básica de cada vela. Esto es la base de todo análisis técnico. Pronto verás patrones formados por múltiples velas.",
        },
        {
          id: "m1_2_outro_2",
          character: "el_especulador",
          type: "enemy_taunt",
          text: "Interesante. Yo también sé leer velas... cuando quiero. Pero prefiero operar por emoción. Es más emocionante.",
        },
      ],
      quiz: [
        {
          id: "q_m1_2_01",
          difficulty: "basico",
          conceptEvaluated: "Componentes de la vela japonesa",
          question: "¿Cuántos precios distintos registra una vela japonesa?",
          options: [
            { id: "a", text: "1 — solo el precio de cierre", isCorrect: false, feedback: "El cierre es importante, pero no es el único precio registrado." },
            { id: "b", text: "2 — apertura y cierre", isCorrect: false, feedback: "Apertura y cierre forman el cuerpo, pero falta información de los extremos." },
            { id: "c", text: "4 — apertura, máximo, mínimo y cierre", isCorrect: true, feedback: "Correcto. OHLC: Open, High, Low, Close." },
            { id: "d", text: "6 — incluye volumen y precio promedio", isCorrect: false, feedback: "El volumen y precio promedio son datos adicionales, no parte de la vela." },
          ],
          explanation: "OHLC: Open (Apertura), High (Máximo), Low (Mínimo), Close (Cierre). Son los 4 datos que componen cada vela. El cuerpo es la diferencia entre apertura y cierre; las mechas son los extremos.",
        },
        {
          id: "q_m1_2_02",
          difficulty: "basico",
          conceptEvaluated: "Vela alcista vs bajista",
          question: "En el estilo TradingView estándar, una vela verde (alcista) significa que...",
          options: [
            { id: "a", text: "El precio bajó durante ese período", isCorrect: false, feedback: "Verde = subida. Rojo = bajada." },
            { id: "b", text: "El precio cerró por encima de la apertura", isCorrect: true, feedback: "Correcto. El cierre fue mayor que la apertura, los compradores dominaron ese período." },
            { id: "c", text: "El activo vale más que ayer", isCorrect: false, feedback: "La vela solo compara apertura vs cierre del período, no el día anterior." },
            { id: "d", text: "El volumen fue alto", isCorrect: false, feedback: "El color de la vela no indica volumen, sino dirección del precio." },
          ],
          explanation: "Una vela verde (alcista) cierra por encima de donde abrió. Los compradores ganaron la batalla en ese período de tiempo. Una vela roja (bajista) cierra por debajo de la apertura.",
        },
        {
          id: "q_m1_2_03",
          difficulty: "intermedio",
          conceptEvaluated: "Lectura de mechas",
          question: "Una vela con un cuerpo pequeño y una mecha superior muy larga indica que...",
          options: [
            { id: "a", text: "Los compradores tuvieron control total del período", isCorrect: false, feedback: "El cuerpo pequeño muestra que ningún bando dominó claramente al cierre." },
            { id: "b", text: "El precio subió mucho pero fue rechazado y cerró cerca de donde abrió", isCorrect: true, feedback: "Exacto. La mecha superior larga es una señal de rechazo de precios altos." },
            { id: "c", text: "El activo tiene mucha liquidez", isCorrect: false, feedback: "La forma de la vela no indica directamente liquidez." },
            { id: "d", text: "El precio nunca bajó durante ese período", isCorrect: false, feedback: "La mecha inferior (si existe) mostraría cuánto bajó el precio." },
          ],
          explanation: "Una mecha superior larga con cuerpo pequeño es señal de rechazo. Los compradores intentaron subir el precio, pero los vendedores tomaron el control y lo devolvieron abajo. Es una de las señales más comunes en análisis técnico.",
        },
        {
          id: "q_m1_2_04",
          difficulty: "intermedio",
          conceptEvaluated: "Temporalidad de las velas",
          question: "Si estás en un gráfico de 4 horas (4H), cada vela representa...",
          options: [
            { id: "a", text: "El movimiento del precio durante 4 días", isCorrect: false, feedback: "4H significa 4 horas, no 4 días." },
            { id: "b", text: "La apertura, máximo, mínimo y cierre de exactamente 4 horas de trading", isCorrect: true, feedback: "Correcto. Cada vela en 4H captura 4 horas de actividad del mercado." },
            { id: "c", text: "El promedio de precio de la última semana", isCorrect: false, feedback: "Las velas no son promedios — registran los 4 precios clave del período." },
            { id: "d", text: "Solo el precio más alto y más bajo del día", isCorrect: false, feedback: "Eso sería el High y el Low diario, no una vela de 4H." },
          ],
          explanation: "La temporalidad (timeframe) define cuánto tiempo representa cada vela. Un gráfico 4H muestra velas de 4 horas. 1D = 1 día. 1W = 1 semana. La misma acción del precio se ve diferente según la temporalidad.",
        },
      ],
      minigame: {
        id: "mg_m1_2",
        type: "candlestick_builder",
        title: "Construye la Vela",
        description: "Usa los cuatro precios OHLC para calcular la dirección, el cuerpo y las dos mechas de cada vela.",
        instructions: "Recibirás O, H, L y C. Calcula: cuerpo = |C−O|, mecha superior = H−mayor(O,C), mecha inferior = menor(O,C)−L. Tienes 3 intentos por vela y necesitas 70% para aprobar.",
        config: {
          scenarios: [
            { open: 100, high: 120, low: 90, close: 115, expectedColor: "green" },
            { open: 110, high: 115, low: 85, close: 88, expectedColor: "red" },
            { open: 100, high: 130, low: 95, close: 101, expectedColor: "green", note: "Mecha superior larga" },
          ],
          maxAttempts: 3,
          gridHeight: 300,
        },
        passingScore: 70,
        virtualCapitalReward: 75,
      },
      rewards: {
        xp: 100,
        virtualCapital: 150,
      },
    },
    // ──────────────────────────────────────────────────────
    // MISIÓN 1.3 — El Lenguaje del Precio
    // ──────────────────────────────────────────────────────
    {
      id: "m1_3",
      order: 3,
      title: "El Lenguaje del Precio",
      subtitle: "Tendencias, rangos y la trampa de las emociones",
      description:
        "Aprenderás a identificar si el mercado está en tendencia alcista, tendencia bajista o en rango lateral. Conocerás tu primer villano real: tus propias emociones.",
      learningObjectives: [
        "Identificar tendencias alcistas, bajistas y movimientos laterales",
        "Entender qué son los máximos y mínimos (HH, HL, LH, LL)",
        "Reconocer cómo el miedo y la codicia afectan las decisiones de trading",
      ],
      keyConcepts: ["tendencia alcista", "tendencia bajista", "rango lateral", "HH/HL/LH/LL", "sesgo emocional", "FOMO", "pánico"],
      requiredMissions: ["m1_2"],
      introDialogues: [
        {
          id: "m1_3_intro_1",
          character: "el_viejo_marco",
          type: "diary",
          text: "El precio no es aleatorio. Tiene estructura. Sube formando picos cada vez más altos. Baja formando valles cada vez más profundos. O se queda girando en círculos sin ir a ningún lado. Tu trabajo es identificar en cuál de esos tres estados está.",
          footnote: "— Entrada #12",
        },
        {
          id: "m1_3_intro_2",
          character: "aria",
          type: "aria_message",
          text: "Una tendencia alcista forma Higher Highs (HH) y Higher Lows (HL): cada pico y cada valle son más altos que el anterior. Una bajista forma Lower Highs (LH) y Lower Lows (LL). Un rango lateral no tiene una dirección clara.",
        },
        {
          id: "m1_3_intro_3",
          character: "la_señorita_fomo",
          type: "enemy_taunt",
          text: "¡El precio está subiendo! ¡Todos están comprando! ¿No sientes el miedo a quedarte fuera? Yo entro ahora sin pensar — ¡la tendencia es clara!",
        },
        {
          id: "m1_3_intro_4",
          character: "don_panico",
          type: "enemy_taunt",
          text: "El precio bajó un 3%... ¡Todo se está derrumbando! ¡Vende ahora antes de perder todo! Eso es lo que dicen en las noticias...",
        },
      ],
      outroDialogues: [
        {
          id: "m1_3_outro_1",
          character: "aria",
          type: "tip",
          text: "Recuerda: FOMO (Fear Of Missing Out) y pánico son los dos enemigos más costosos del trader. La Señorita FOMO te hace entrar tarde en una tendencia. Don Pánico te hace salir en el peor momento. Tu arma contra ellos es el análisis.",
        },
        {
          id: "m1_3_outro_2",
          character: "el_viejo_marco",
          type: "diary",
          text: "Perdí mucho dinero siguiendo emociones. Gané más cuando aprendí a ignorarlas. Las emociones mienten. El precio, eventualmente, dice la verdad.",
          footnote: "— Entrada #19",
        },
      ],
      quiz: [
        {
          id: "q_m1_3_01",
          difficulty: "basico",
          conceptEvaluated: "Identificación de tendencia alcista",
          question: "¿Cuál es la característica de una tendencia alcista?",
          options: [
            { id: "a", text: "El precio sube sin bajar nunca", isCorrect: false, feedback: "Las tendencias siempre tienen retrocesos — no suben en línea recta." },
            { id: "b", text: "Cada máximo y mínimo son más altos que el anterior (HH y HL)", isCorrect: true, feedback: "Exacto. La estructura de HH y HL confirma una tendencia alcista." },
            { id: "c", text: "El precio se mueve dentro de un rango fijo", isCorrect: false, feedback: "Eso describe un rango lateral, no una tendencia." },
            { id: "d", text: "El precio sube solo en días de noticias positivas", isCorrect: false, feedback: "Las tendencias no dependen de noticias — son la estructura del mercado." },
          ],
          explanation: "Una tendencia alcista se confirma con Higher Highs (cada máximo supera al anterior) y Higher Lows (cada corrección termina más arriba que la anterior). Esa estructura de picos y valles ascendentes es la firma de la tendencia.",
        },
        {
          id: "q_m1_3_02",
          difficulty: "intermedio",
          conceptEvaluated: "FOMO como error de trading",
          question: "La Señorita FOMO representa el miedo a quedarse fuera del mercado. ¿Cuál es el error típico que causa?",
          options: [
            { id: "a", text: "Salir del mercado demasiado pronto por miedo", isCorrect: false, feedback: "Salir por miedo es el error de Don Pánico." },
            { id: "b", text: "Comprar cuando el precio ya subió mucho, entrando en un mal momento", isCorrect: true, feedback: "Correcto. FOMO hace que entres tarde, comprando en máximos justo antes de una corrección." },
            { id: "c", text: "No operar nunca por parálisis de análisis", isCorrect: false, feedback: "Eso sería otro sesgo cognitivo distinto al FOMO." },
            { id: "d", text: "Diversificar demasiado el portafolio", isCorrect: false, feedback: "La diversificación es una estrategia, no un error emocional." },
          ],
          explanation: "FOMO (Fear Of Missing Out) lleva a los traders a entrar en una posición cuando el precio ya subió significativamente, motivados por no querer perderse las ganancias. El resultado típico: entran en el peor momento y ven cómo el precio corrige inmediatamente.",
        },
        {
          id: "q_m1_3_03",
          difficulty: "basico",
          conceptEvaluated: "Rango lateral",
          question: "Un mercado en rango lateral significa que...",
          options: [
            { id: "a", text: "El precio sube muy lentamente", isCorrect: false, feedback: "Un movimiento lento hacia arriba sigue siendo una tendencia alcista." },
            { id: "b", text: "El precio oscila entre un soporte y una resistencia sin dirección clara", isCorrect: true, feedback: "Correcto. El rango lateral es una zona de indecisión entre compradores y vendedores." },
            { id: "c", text: "El activo ya no tiene valor", isCorrect: false, feedback: "El rango es solo una fase del mercado, no implica pérdida de valor." },
            { id: "d", text: "Es imposible operar con beneficios", isCorrect: false, feedback: "Hay estrategias específicas para operar en rangos laterales." },
          ],
          explanation: "Un rango lateral (también llamado consolidación) ocurre cuando el precio rebota entre un soporte (suelo) y una resistencia (techo) sin romper ninguno de los dos. Ni compradores ni vendedores tienen control dominante.",
        },
      ],
      minigame: {
        id: "mg_m1_3",
        type: "chart_tap",
        title: "Clasifica la Tendencia",
        description: "Observa el gráfico y decide: ¿alcista, bajista o lateral?",
        instructions: "Se mostrarán 5 gráficos distintos. Para cada uno, elige si la estructura del precio es alcista, bajista o lateral. Analiza los máximos y mínimos antes de responder.",
        config: {
          charts: [
            { id: "ct1", type: "bullish", hint: "Observa los máximos y mínimos ascendentes" },
            { id: "ct2", type: "bearish", hint: "Cada rebote es más bajo que el anterior" },
            { id: "ct3", type: "sideways", hint: "El precio rebota entre dos niveles" },
            { id: "ct4", type: "bullish", hint: "Tras el retroceso, el precio recupera y construye un nuevo HH" },
            { id: "ct5", type: "bearish", hint: "Cada intento de recuperación termina por debajo del anterior" },
          ],
          timePerChart: 15,
        },
        passingScore: 80,
        virtualCapitalReward: 80,
      },
      rewards: {
        xp: 110,
        virtualCapital: 150,
        unlocksCharacter: "el_especulador",
      },
    },
    // ──────────────────────────────────────────────────────
    // MISIÓN 1.4 — Tu Capital, Tu Responsabilidad
    // ──────────────────────────────────────────────────────
    {
      id: "m1_4",
      order: 4,
      title: "Tu Capital, Tu Responsabilidad",
      subtitle: "Gestión de riesgo básica: lo que separa traders de apostadores",
      description:
        "Aprenderás los conceptos fundamentales de gestión de riesgo: stop loss, take profit, y la regla del 1-2% de riesgo por operación. Sin esto, todo lo demás no sirve.",
      learningObjectives: [
        "Entender qué es un Stop Loss y por qué es esencial",
        "Comprender la diferencia entre riesgo y recompensa",
        "Aplicar la regla básica de riesgo por operación",
      ],
      keyConcepts: ["stop loss", "take profit", "riesgo/recompensa", "capital", "porcentaje de riesgo", "drawdown"],
      requiredMissions: ["m1_3"],
      introDialogues: [
        {
          id: "m1_4_intro_1",
          character: "el_viejo_marco",
          type: "diary",
          text: "La primera vez que operé sin Stop Loss, el mercado me enseñó la lección más cara de mi vida. Nunca más. El Stop Loss no es un signo de debilidad — es el muro que protege todo lo que tienes.",
          footnote: "— Entrada #31",
        },
        {
          id: "m1_4_intro_2",
          character: "aria",
          type: "aria_message",
          text: "Regla de oro: nunca arriesgues más del 1-2% de tu capital en una sola operación. Con $1,000 virtuales, eso significa que tu pérdida máxima por trade debe ser $10–$20. El Stop Loss es la orden que cierra tu posición automáticamente si el precio llega a ese nivel.",
        },
        {
          id: "m1_4_intro_3",
          character: "el_especulador",
          type: "enemy_taunt",
          text: "Stop Loss, ¿para qué? Si el análisis es correcto, el mercado volverá. Siempre vuelve... a veces. En las que no vuelve, toca esperar meses. O años. Pero las emociones son gratis, ¿no?",
        },
      ],
      outroDialogues: [
        {
          id: "m1_4_outro_1",
          character: "aria",
          type: "tip",
          text: "Un trader profesional puede tener una tasa de aciertos del 40% y ser rentable, siempre que su ratio riesgo/recompensa sea favorable (ej. 1:3). La gestión del riesgo es lo que convierte el trading en un oficio sostenible.",
        },
        {
          id: "m1_4_outro_2",
          character: "el_viejo_marco",
          type: "diary",
          text: "Los mejores traders que conocí no eran los más inteligentes. Eran los más disciplinados con el riesgo. Esa disciplina es lo más difícil de aprender y lo más valioso que existe en este oficio.",
          footnote: "— Entrada #47",
        },
      ],
      quiz: [
        {
          id: "q_m1_4_01",
          difficulty: "basico",
          conceptEvaluated: "Definición de Stop Loss",
          question: "¿Para qué sirve un Stop Loss?",
          options: [
            { id: "a", text: "Para asegurar que siempre tendrás ganancias", isCorrect: false, feedback: "El Stop Loss limita pérdidas, no garantiza ganancias." },
            { id: "b", text: "Para cerrar automáticamente una posición cuando el precio alcanza un nivel de pérdida predefinido", isCorrect: true, feedback: "Correcto. Es tu mecanismo de protección automática." },
            { id: "c", text: "Para pausar el mercado cuando el precio baja", isCorrect: false, feedback: "Los traders individuales no pueden pausar el mercado." },
            { id: "d", text: "Para aumentar tu posición cuando el precio sube", isCorrect: false, feedback: "Eso se llama pyramid o añadir a posición ganadora — diferente concepto." },
          ],
          explanation: "El Stop Loss es una orden condicionada que cierra tu posición automáticamente si el precio llega a un nivel de pérdida que defines antes de entrar. Es la herramienta más importante de gestión de riesgo.",
        },
        {
          id: "q_m1_4_02",
          difficulty: "intermedio",
          conceptEvaluated: "Regla del 1-2% de riesgo",
          question: "Con un capital de $1,000 y aplicando la regla del 2% de riesgo por operación, ¿cuánto es lo máximo que deberías perder en una sola operación?",
          options: [
            { id: "a", text: "$100", isCorrect: false, feedback: "$100 sería el 10% — demasiado agresivo para una sola operación." },
            { id: "b", text: "$20", isCorrect: true, feedback: "Correcto. 2% de $1,000 = $20 máximo por trade." },
            { id: "c", text: "$200", isCorrect: false, feedback: "$200 = 20% de tu capital en una sola operación. Eso es especulación extrema." },
            { id: "d", text: "El 50% de las ganancias anteriores", isCorrect: false, feedback: "El riesgo se calcula sobre el capital total, no sobre las ganancias." },
          ],
          explanation: "La regla del 1-2% protege tu capital de rachas perdedoras. Si arriesgas 2% por trade y tienes 10 pérdidas seguidas, aún conservas el 81% de tu capital. Si arriesgas 10%, 10 pérdidas seguidas te dejarían con $0.",
        },
        {
          id: "q_m1_4_03",
          difficulty: "intermedio",
          conceptEvaluated: "Ratio riesgo/recompensa",
          question: "¿Qué significa un ratio riesgo/recompensa de 1:3?",
          options: [
            { id: "a", text: "Por cada $3 que ganas, arriesgas $1", isCorrect: true, feedback: "Correcto. Tu potencial de ganancia es 3 veces tu riesgo máximo." },
            { id: "b", text: "Ganas 3 de cada 10 operaciones", isCorrect: false, feedback: "Eso describe tu tasa de acierto, no el ratio R:R." },
            { id: "c", text: "El precio sube 3 veces más de lo que baja", isCorrect: false, feedback: "El ratio R:R es entre tu pérdida máxima y tu ganancia objetivo, no la velocidad del precio." },
            { id: "d", text: "Necesitas 3 operaciones ganadoras por cada perdedora", isCorrect: false, feedback: "Con un 1:3 puedes ser rentable ganando solo el 25% de las operaciones." },
          ],
          explanation: "Un ratio 1:3 significa que arriesgas $1 para ganar $3. Con este ratio, si ganas solo el 30% de tus operaciones, eres rentable: 3 ganadoras × $3 = $9 — 7 perdedoras × $1 = $7. Ganancia neta: $2.",
        },
      ],
      minigame: {
        id: "mg_m1_4",
        type: "price_direction_quiz",
        title: "Calcula el Riesgo",
        description: "Dada una operación, calcula el tamaño correcto de posición para no superar el 2% de riesgo.",
        instructions: "Se te dará el precio de entrada, el Stop Loss y tu capital total. Calcula cuántas unidades puedes comprar para no arriesgar más del 2% del capital. Tienes 3 escenarios.",
        config: {
          riskPercentage: 0.02,
          scenarios: [
            {
              capital: 1000,
              entryPrice: 100,
              stopLoss: 95,
              correctUnits: 4,
              explanation: "Riesgo por unidad = $5. 2% de $1,000 = $20. $20 / $5 = 4 unidades.",
            },
            {
              capital: 2000,
              entryPrice: 50,
              stopLoss: 47,
              correctUnits: 13,
              explanation: "Riesgo por unidad = $3. 2% de $2,000 = $40. $40 / $3 = 13.3 → 13 unidades.",
            },
            {
              capital: 1500,
              entryPrice: 200,
              stopLoss: 190,
              correctUnits: 3,
              explanation: "Riesgo por unidad = $10. 2% de $1,500 = $30. $30 / $10 = 3 unidades.",
            },
          ],
        },
        passingScore: 66,
        virtualCapitalReward: 100,
      },
      rewards: {
        xp: 120,
        virtualCapital: 150,
      },
    },
    // ──────────────────────────────────────────────────────
    // MISIÓN 1.5 — El Desafío de Marco (Boss Level 1)
    // ──────────────────────────────────────────────────────
    {
      id: "m1_5",
      order: 5,
      title: "El Desafío de Marco",
      subtitle: "Demuestra que aprendiste a leer el mercado",
      description:
        "Misión final del Nivel 1. Aplicarás todo lo aprendido en un escenario integrado: identificar tendencia, leer velas, gestionar riesgo y tomar una decisión de operación fundamentada.",
      learningObjectives: [
        "Integrar conceptos de tendencia, velas y gestión de riesgo",
        "Tomar una decisión de trading con argumentación fundamentada",
        "Demostrar comprensión de los 4 conceptos clave del nivel",
      ],
      keyConcepts: ["síntesis de nivel 1", "velas japonesas", "tendencia", "stop loss", "riesgo/recompensa", "decisión de trading"],
      requiredMissions: ["m1_4"],
      introDialogues: [
        {
          id: "m1_5_intro_1",
          character: "el_viejo_marco",
          type: "diary",
          text: "Esta es mi última prueba para ti antes de que avances. No es difícil si realmente aprendiste. Es imposible si solo memorizaste.",
          footnote: "— Nota final del Nivel 1",
        },
        {
          id: "m1_5_intro_2",
          character: "aria",
          type: "aria_message",
          text: "Esta misión final combina todo el Nivel 1. Verás un escenario de mercado real y deberás: 1) identificar la tendencia, 2) leer las velas clave, 3) proponer un stop loss razonado, 4) calcular el tamaño de posición. Tienes 3 intentos para completar el desafío.",
        },
        {
          id: "m1_5_intro_3",
          character: "el_especulador",
          type: "enemy_taunt",
          text: "A ver si todo lo que estudiaste de verdad sirve... o si solo serás otro trader novato que pierde su primer capital.",
        },
      ],
      outroDialogues: [
        {
          id: "m1_5_outro_1",
          character: "el_viejo_marco",
          type: "diary",
          text: "Lo lograste. Pero recuerda: esto solo fue el comienzo. Hay mercados enteros que todavía no conoces. Cada uno tiene su propio carácter, sus propias trampas. Elige el tuyo con cuidado.",
          footnote: "— Final del Diario, Nivel 1",
        },
        {
          id: "m1_5_outro_2",
          character: "aria",
          type: "aria_message",
          text: "Nivel 1 completado. Has ganado acceso al Gran Mapa de los Mercados. Es hora de elegir tu especialización: Crypto, Forex, Acciones, Materias Primas, Índices, Futuros o ETFs. Esa decisión cambiará tu ruta de aprendizaje.",
        },
      ],
      quiz: [
        {
          id: "q_m1_5_01",
          difficulty: "intermedio",
          conceptEvaluated: "Integración: vela + tendencia",
          question: "Ves un gráfico con HH y HL consecutivos, y la última vela es bajista con mecha inferior larga. ¿Qué indica más probablemente?",
          options: [
            { id: "a", text: "La tendencia alcista terminó definitivamente", isCorrect: false, feedback: "Una sola vela bajista no cancela una tendencia alcista establecida." },
            { id: "b", text: "Una posible corrección o retroceso dentro de la tendencia alcista vigente", isCorrect: true, feedback: "Correcto. La mecha inferior larga sugiere rechazo de precios bajos — potencial continuación alcista." },
            { id: "c", text: "El activo perdió todo su valor", isCorrect: false, feedback: "Una vela bajista no implica pérdida total de valor." },
            { id: "d", text: "Debes vender inmediatamente con pánico", isCorrect: false, feedback: "Vender por una sola vela en medio de una tendencia es el error de Don Pánico." },
          ],
          explanation: "En una tendencia alcista (HH y HL), las velas bajistas son parte normal de las correcciones. Una mecha inferior larga indica que los compradores rechazaron los precios bajos, lo que es compatible con la continuación de la tendencia.",
        },
        {
          id: "q_m1_5_02",
          difficulty: "avanzado",
          conceptEvaluated: "Integración: riesgo en escenario real",
          question: "Tienes $1,000 de capital virtual. Quieres entrar en una operación larga a $50. Colocas el Stop Loss en $48. ¿Cuál es el tamaño máximo de posición respetando el 2% de riesgo?",
          options: [
            { id: "a", text: "5 unidades", isCorrect: false, feedback: "5 unidades × $2 de riesgo = $10 = 1% de riesgo. Es válido pero no es el máximo al 2%." },
            { id: "b", text: "10 unidades", isCorrect: true, feedback: "Correcto. Riesgo por unidad = $2. 2% de $1,000 = $20. $20 / $2 = 10 unidades." },
            { id: "c", text: "20 unidades", isCorrect: false, feedback: "20 × $2 = $40 = 4% de riesgo. Demasiado agresivo." },
            { id: "d", text: "50 unidades", isCorrect: false, feedback: "50 × $2 = $100 = 10% de riesgo. Eso es especulación extrema." },
          ],
          explanation: "Riesgo por unidad = entrada - stop loss = $50 - $48 = $2. Capital máximo en riesgo = 2% × $1,000 = $20. Unidades = $20 / $2 = 10 unidades. Ese es el tamaño de posición correcto.",
        },
        {
          id: "q_m1_5_03",
          difficulty: "avanzado",
          conceptEvaluated: "Síntesis de nivel",
          question: "¿Cuál de estas afirmaciones resume mejor la filosofía del Nivel 1?",
          options: [
            { id: "a", text: "El trading consiste en adivinar el precio futuro con exactitud", isCorrect: false, feedback: "El trading no es adivinanza — es gestión de probabilidades y riesgo." },
            { id: "b", text: "El mercado premia a quien sigue las emociones del momento", isCorrect: false, feedback: "Las emociones sin análisis son la fuente de pérdidas más común." },
            { id: "c", text: "Leer el contexto del precio + gestionar el riesgo = base del trading sostenible", isCorrect: true, feedback: "Correcto. Sin análisis de precio no sabes qué operar. Sin gestión de riesgo, no durarás en el mercado." },
            { id: "d", text: "Solo los expertos financieros pueden ser rentables", isCorrect: false, feedback: "El trading tiene una curva de aprendizaje, pero no requiere credenciales formales — requiere disciplina y método." },
          ],
          explanation: "El Nivel 1 establece dos pilares inseparables: análisis (leer velas, tendencias, contexto del precio) y gestión de riesgo (stop loss, tamaño de posición, ratio R:R). Ninguno funciona sin el otro.",
        },
      ],
      minigame: {
        id: "mg_m1_5",
        type: "candle_classifier",
        title: "El Juicio de Marco",
        description:
          "Escenario completo: analiza el gráfico, identifica la tendencia, lee las velas clave y toma la decisión de trading correcta.",
        instructions:
          "Tendrás un gráfico con 20 velas. Deberás responder 4 preguntas sobre él: 1) ¿cuál es la tendencia? 2) ¿cuál es la vela más significativa? 3) ¿dónde colocarías el stop loss? 4) ¿entras o esperas? Justifica cada respuesta.",
        config: {
          chartScenario: "btc_4h_range",
          candleCount: 20,
          priceRange: { low: 80600, high: 98000 },
          questions: [
            { step: 1, type: "trend_id" },
            { step: 2, type: "key_candle" },
            { step: 3, type: "stop_placement" },
            { step: 4, type: "entry_decision" },
          ],
          passingSteps: 3,
        },
        passingScore: 75,
        virtualCapitalReward: 200,
      },
      rewards: {
        xp: 150,
        virtualCapital: 250,
        badge: "fundamentos_dominados",
      },
    },
  ],
}

// ─── HELPERS ─────────────────────────────────────────────────

/** Retorna una misión por su id */
export function getMissionById(missionId: string): Mission | undefined {
  return level1.missions.find((m) => m.id === missionId)
}

/** Retorna todas las preguntas del nivel 1 en un array plano */
export function getAllLevel1Questions(): QuizQuestion[] {
  return level1.missions.flatMap((m) => m.quiz)
}

/** Calcula el XP total disponible en el nivel */
export function getTotalLevelXP(): number {
  return level1.missions.reduce((acc, m) => acc + m.rewards.xp, 0)
}

/** Calcula el capital virtual total disponible como recompensa en el nivel */
export function getTotalLevelCapitalRewards(): number {
  return level1.missions.reduce((acc, m) => {
    const missionCapital = m.rewards.virtualCapital
    const minigameCapital = m.minigame?.virtualCapitalReward ?? 0
    return acc + missionCapital + minigameCapital
  }, 0)
}

export default level1
