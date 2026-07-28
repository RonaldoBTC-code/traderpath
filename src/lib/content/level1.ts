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
  | "supply_demand_lab"
  | "gauge_lab"
  | "candle_lab"
  | "structure_lab"

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
        "Tu primer contacto con los mercados, pero sin teoría: te damos un puesto de manzanas y descubres con tus propias manos por qué se mueven los precios.",
      learningObjectives: [
        "Descubrir, jugando, que el precio nace de la relación entre oferta y demanda",
        "Comprobar por ti mismo que más demanda que oferta sube el precio, y al revés lo baja",
        "Reconocer ese mismo motor en cualquier mercado real, del puesto de fruta al Bitcoin",
      ],
      keyConcepts: ["oferta", "demanda", "precio", "escasez", "acuerdo de mercado"],
      requiredMissions: [],
      introDialogues: [
        {
          id: "m1_1_intro_1",
          character: "narrator",
          type: "diary",
          text: "Un diario viejo aparece frente a ti. Junto a él, las llaves de un pequeño puesto de manzanas en la plaza del mercado.",
        },
        {
          id: "m1_1_intro_2",
          character: "el_viejo_marco",
          type: "diary",
          text: "Antes de los gráficos y las pantallas, hay que entender un puesto de fruta. Hoy el puesto es tuyo. Tú decides cuántas manzanas sacas; los clientes llegan solos. No te voy a dar la regla del precio — la vas a ver moverse con tus propias manos.",
          footnote: "— El Viejo Marco, Diario del Especulador, Entrada #1",
        },
        {
          id: "m1_1_intro_3",
          character: "aria",
          type: "aria_message",
          text: "Hola, soy ARIA, tu guía. Fíjate en algo: no te voy a explicar cómo se mueve el precio. Vas a jugar con tu puesto y descubrirlo tú. Llévate una sola pregunta en la cabeza: ¿qué hace que una manzana cueste más?",
        },
        {
          id: "m1_1_intro_4",
          character: "el_especulador",
          type: "enemy_taunt",
          text: "¿El precio? Bah. El precio se lo pongo yo y la gente paga lo que yo diga. Así de fácil. ¿Para qué complicarse?",
        },
      ],
      outroDialogues: [
        {
          id: "m1_1_outro_1",
          character: "aria",
          type: "aria_message",
          text: "Acabas de descubrir la ley de oferta y demanda — y nadie te la dictó, la viste. Más compradores que producto y el precio sube; más producto que compradores y baja. Le ponemos nombre solo ahora, que ya la entiendes de verdad. Siguiente parada: las velas japonesas.",
        },
        {
          id: "m1_1_outro_2",
          character: "el_viejo_marco",
          type: "diary",
          text: "Ese puesto de manzanas es todo mercado que vas a ver. Cambia 'manzanas' por Bitcoin, por dólares, por acciones: la fuerza es la misma, cuántos quieren contra cuánto hay. Aprendiste el motor. Lo demás son detalles.",
          footnote: "— Entrada #2",
        },
      ],
      quiz: [
        {
          id: "q_m1_1_01",
          difficulty: "basico",
          conceptEvaluated: "Aplicar oferta y demanda en el puesto",
          question: "En tu puesto llegó el doble de clientes y no cambiaste las manzanas. ¿Qué le pasa al precio de la manzana?",
          options: [
            { id: "a", text: "Sube: hay más gente queriendo que manzanas disponibles", isCorrect: true, feedback: "Correcto. Es justo lo que viste al mover el control de clientes: más demanda con la misma oferta empuja el precio arriba." },
            { id: "b", text: "Baja, porque llegó más gente al puesto", isCorrect: false, feedback: "Más gente no abarata: en el juego, subir los clientes subía el precio. Baja cuando sobran manzanas." },
            { id: "c", text: "No cambia: el precio es fijo", isCorrect: false, feedback: "En tu puesto el precio nunca fue fijo — se movía en cuanto cambiabas clientes o manzanas." },
            { id: "d", text: "Sube solo si tú decides subirlo a mano", isCorrect: false, feedback: "Nunca escribiste un precio: salía solo de la relación entre clientes y manzanas." },
          ],
          explanation: "Con la oferta (manzanas) fija, más demanda (clientes) sube el precio. Es la misma palanca que moviste en el laboratorio.",
        },
        {
          id: "q_m1_1_02",
          difficulty: "basico",
          conceptEvaluated: "Transferir la ley a un activo real",
          question: "De pronto muchísima gente quiere comprar Bitcoin y casi nadie quiere vender. Con lo que descubriste en el puesto, ¿qué esperarías del precio?",
          options: [
            { id: "a", text: "Sube: muchos compradores compitiendo por pocas unidades a la venta", isCorrect: true, feedback: "Correcto. Bitcoin, manzanas o lo que sea: muchos queriendo y poco disponible = precio arriba." },
            { id: "b", text: "Baja, porque hay mucho interés", isCorrect: false, feedback: "El mucho interés (demanda) empuja hacia arriba, no hacia abajo — igual que más clientes en tu puesto." },
            { id: "c", text: "Se queda igual: Bitcoin no sigue esa regla", isCorrect: false, feedback: "Todos los mercados siguen la misma fuerza de oferta y demanda; Bitcoin no es la excepción." },
            { id: "d", text: "Depende solo de la tecnología, no de compradores y vendedores", isCorrect: false, feedback: "La tecnología importa para otras cosas; el precio en el momento lo mueven compradores y vendedores." },
          ],
          explanation: "El motor del puesto es universal: más demanda que oferta sube el precio, sea fruta o Bitcoin. Aprender a verlo aquí te sirve para cualquier mercado.",
        },
        {
          id: "q_m1_1_03",
          difficulty: "intermedio",
          conceptEvaluated: "El precio es un acuerdo, no un capricho del vendedor",
          question: "El Especulador insistía en que él le pone el precio a lo que vende y la gente paga. ¿Por qué el mercado no funciona así?",
          options: [
            { id: "a", text: "Porque el precio surge del acuerdo entre compradores y vendedores: si pide demasiado y hay de sobra, nadie le compra", isCorrect: true, feedback: "Correcto. Un vendedor puede pedir lo que quiera, pero solo se vende al precio en que alguien acepta comprar." },
            { id: "b", text: "Porque una ley prohíbe subir los precios", isCorrect: false, feedback: "No hay tal ley en un mercado libre; lo que frena el precio es que nadie compre a ese nivel." },
            { id: "c", text: "Porque los vendedores siempre ponen el precio más bajo posible", isCorrect: false, feedback: "No siempre; pero aunque pida mucho, sin compradores dispuestos no hay venta." },
            { id: "d", text: "Porque el precio lo fija el gobierno", isCorrect: false, feedback: "En los mercados libres el precio no lo fija el gobierno, lo fija el encuentro entre oferta y demanda." },
          ],
          explanation: "El precio es el punto donde comprador y vendedor se ponen de acuerdo. Por eso el Especulador se equivoca: puede pedir lo que sea, pero el precio real es donde alguien acepta pagar — y eso depende de cuántos quieren contra cuánto hay.",
        },
      ],
      minigame: {
        id: "mg_m1_1",
        type: "supply_demand_lab",
        title: "Tu Puesto de Manzanas",
        description: "Mueve los clientes y las manzanas. Observa el precio. Descubre qué lo mueve.",
        instructions: "Cambia cuántos clientes llegan y cuántas manzanas tienes: el precio sale solo de esos dos números. Resuelve los dos retos y responde qué viste.",
        config: {
          scene: {
            alt: "Puesto de manzanas en la plaza del mercado",
            stall: { image: "/assets/missions/m1_1-stall.webp" },
            client: { image: "/assets/missions/m1_1-client.webp" },
            apple: { image: "/assets/missions/m1_1-apple.webp" },
            sign: { image: "/assets/missions/m1_1-sign.webp" },
          },
          basePrice: 1,
          clients: { min: 2, max: 24, start: 8 },
          apples: { min: 2, max: 24, start: 8 },
          challenges: [
            {
              id: "sube",
              prompt: "Haz que una manzana cueste al menos $2.00 — pero no puedes tocar las manzanas.",
              lock: "apples",
              compare: "gte",
              target: 2,
              successNote: "Con las mismas manzanas, más clientes hicieron subir el precio. Cuando muchos quieren lo mismo y no alcanza para todos, se paga más.",
            },
            {
              id: "baja",
              prompt: "Ahora haz que baje a $0.50 o menos — pero sin tocar los clientes.",
              lock: "clients",
              compare: "lte",
              target: 0.5,
              successNote: "Con los mismos clientes, más manzanas hicieron bajar el precio. Cuando sobra de algo, se paga menos por ello.",
            },
          ],
          question: {
            prompt: "En tu puesto, ¿qué hizo subir el precio de la manzana?",
            options: [
              { id: "a", text: "Que hubiera más clientes que manzanas", correct: true, feedback: "Eso mismo viste: más gente queriendo que manzanas disponibles empuja el precio arriba. Acabas de descubrir la oferta y la demanda." },
              { id: "b", text: "Que hubiera más manzanas que clientes", correct: false, feedback: "Al revés: cuando pusiste más manzanas, el precio bajó. Piensa en cuál era mayor cuando el precio subía." },
              { id: "c", text: "El precio sube solo con el tiempo", correct: false, feedback: "El precio no se movió solo — se movió cuando tú cambiabas clientes o manzanas." },
              { id: "d", text: "Que tú le pusieras un precio alto a mano", correct: false, feedback: "Nunca escribiste un precio: salía solo de los clientes y las manzanas. Eso es justo lo que descubriste." },
            ],
          },
        },
        passingScore: 70,
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
        "Descubre la vela japonesa construyéndola tú: mueve la apertura, el cierre y los extremos y mira cómo nacen el color, el cuerpo y las mechas.",
      learningObjectives: [
        "Descubrir que el color de la vela sale de comparar el cierre con la apertura",
        "Ver que el cuerpo es la distancia entre apertura y cierre, y las mechas lo que sobra hasta los extremos",
        "Reconocer una mecha larga como un rechazo de precios",
      ],
      keyConcepts: ["vela japonesa", "apertura", "cierre", "máximo", "mínimo", "cuerpo", "mecha", "alcista", "bajista"],
      requiredMissions: ["m1_1"],
      introDialogues: [
        {
          id: "m1_2_intro_1",
          character: "el_viejo_marco",
          type: "diary",
          text: "Los japoneses del siglo XVII ya operaban arroz con esto. Cada vela es una foto de la batalla entre compradores y vendedores. Hoy no te la voy a explicar: te doy los cuatro precios y tú armas la vela. Mira qué nace de cada uno.",
          footnote: "— Entrada #7, sobre las velas de Munehisa Homma",
        },
        {
          id: "m1_2_intro_2",
          character: "aria",
          type: "aria_message",
          text: "Tienes cuatro mandos: apertura, cierre, máximo y mínimo. La vela se dibuja sola con lo que pongas. No te digo qué la pone verde ni qué es una mecha — muévelos y descúbrelo tú.",
        },
        {
          id: "m1_2_intro_3",
          character: "la_señorita_fomo",
          type: "enemy_taunt",
          text: "¿Para qué tanto detalle? ¡Si el precio sube, todos compran! Solo hay que seguir a la multitud... ¿verdad?",
        },
      ],
      outroDialogues: [
        {
          id: "m1_2_outro_1",
          character: "aria",
          type: "aria_message",
          text: "Lo viste sin que te lo dictara: la vela es verde cuando el cierre queda por encima de la apertura, roja al revés. El cuerpo es esa distancia, y las mechas son lo que el precio estiró hasta los extremos y no sostuvo. Esa es la base de todo el análisis técnico.",
        },
        {
          id: "m1_2_outro_2",
          character: "el_especulador",
          type: "enemy_taunt",
          text: "Sí, sí, muy bonito. Yo también sé leer velas... cuando quiero. Prefiero operar por emoción, es más emocionante. Y más caro.",
        },
      ],
      quiz: [
        {
          id: "q_m1_2_01",
          difficulty: "basico",
          conceptEvaluated: "El color sale de cierre vs apertura",
          question: "En tu vela dejaste la apertura fija y subiste el cierre por encima de ella. ¿De qué color se puso?",
          options: [
            { id: "a", text: "Verde: el cierre quedó por encima de la apertura", isCorrect: true, feedback: "Correcto. Es lo que viste al mover el cierre: cierre arriba de la apertura = verde (alcista)." },
            { id: "b", text: "Roja", isCorrect: false, feedback: "Roja es cuando el cierre queda por DEBAJO de la apertura." },
            { id: "c", text: "Depende del volumen", isCorrect: false, feedback: "El color no mira el volumen, solo compara cierre con apertura." },
            { id: "d", text: "Depende del máximo", isCorrect: false, feedback: "El máximo hace la mecha superior, no el color." },
          ],
          explanation: "El color de la vela sale de una sola comparación: cierre contra apertura. Arriba = verde, abajo = roja.",
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
        type: "candle_lab",
        title: "Construye tu Vela",
        description: "Mueve la apertura, el cierre, el máximo y el mínimo. La vela se dibuja sola. Descubre qué nace de cada uno.",
        instructions: "Arrastra los cuatro precios y observa la vela. Resuelve los dos retos y responde qué la pone verde.",
        config: {
          priceMin: 2,
          priceMax: 20,
          open: { start: 11 },
          close: { start: 11 },
          high: { start: 12 },
          low: { start: 10 },
          scene: {
            alt: "Taller de Velas",
            backdrop: { image: "/assets/missions/m1_2-workshop.webp" },
          },
          challenges: [
            {
              id: "verde",
              metric: "direction",
              compare: "gte",
              target: 2,
              prompt: "Haz que la vela sea verde (alcista).",
              successNote: "El cierre quedó por encima de la apertura y la vela se puso verde. El color sale de comparar cierre con apertura.",
            },
            {
              id: "mecha",
              metric: "upperWick",
              compare: "gte",
              target: 3,
              prompt: "Ahora dale una mecha superior larga: sube el máximo bien por encima del cuerpo.",
              successNote: "La mecha superior es lo que el precio subió por encima del cuerpo y no sostuvo: un rechazo de precios altos.",
            },
          ],
          question: {
            prompt: "En tu vela, ¿qué hace que sea verde (alcista)?",
            options: [
              { id: "a", text: "Que el cierre quede por encima de la apertura", correct: true, feedback: "Eso viste: subir el cierre sobre la apertura la ponía verde. Acabas de descubrir el color de la vela." },
              { id: "b", text: "Que el máximo sea muy alto", correct: false, feedback: "El máximo hace la mecha superior, no el color. Una vela puede tener mecha larga y ser roja." },
              { id: "c", text: "Que el cuerpo sea grande", correct: false, feedback: "Un cuerpo grande puede ser verde o rojo; el color lo decide cierre vs apertura." },
              { id: "d", text: "Que el mínimo sea muy bajo", correct: false, feedback: "El mínimo hace la mecha inferior. El color solo mira cierre contra apertura." },
            ],
          },
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
        "Descubre la tendencia moviéndola tú: inclina la estructura de máximos y mínimos y mira cómo el gráfico —y su etiqueta— pasan de lateral a alcista o bajista.",
      learningObjectives: [
        "Descubrir que una tendencia alcista es una escalera de máximos y mínimos que suben",
        "Distinguir alcista, bajista y lateral por la dirección de esa estructura",
        "Reconocer cómo el FOMO y el pánico empujan a operar contra la estructura",
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
          text: "No te voy a dar los nombres todavía. Tienes un control que sube o baja cada nuevo máximo y mínimo. Muévelo y mira qué le pasa al gráfico y a su etiqueta. ¿Qué tiene que hacer la estructura para que se llame 'alcista'?",
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
          text: "Lo armaste tú: cuando cada máximo y cada mínimo quedan más altos que el anterior, eso es una tendencia alcista (los HH y HL); al revés, bajista; sin dirección, lateral. Y cuidado: el FOMO te hace entrar tarde en la tendencia y el pánico te saca en el peor momento. Tu arma contra ellos es leer la estructura.",
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
          conceptEvaluated: "Qué define una tendencia alcista",
          question: "Cuando en el laboratorio hiciste que cada nuevo máximo y mínimo quedara más alto que el anterior, ¿qué etiqueta apareció?",
          options: [
            { id: "a", text: "Alcista: la escalera de máximos y mínimos sube", isCorrect: true, feedback: "Correcto. Eso viste: máximos y mínimos ascendentes = tendencia alcista." },
            { id: "b", text: "Bajista", isCorrect: false, feedback: "Bajista aparece cuando cada máximo y mínimo queda más BAJO que el anterior." },
            { id: "c", text: "Lateral", isCorrect: false, feedback: "Lateral es cuando no suben ni bajan con claridad." },
            { id: "d", text: "Ninguna: la etiqueta no cambia", isCorrect: false, feedback: "La etiqueta sí cambiaba con la inclinación que le dabas a la estructura." },
          ],
          explanation: "Una tendencia alcista es una estructura de máximos y mínimos que suben (HH y HL). La fabricaste inclinando el control hacia arriba.",
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
        type: "structure_lab",
        title: "El Observatorio de Tendencias",
        description: "Inclina cada nuevo máximo y mínimo. Mira cómo el gráfico y su etiqueta cambian. Descubre qué define cada tendencia.",
        instructions: "Mueve el control y observa la estructura. Resuelve los dos retos y responde qué define una tendencia alcista.",
        config: {
          slope: { min: -6, max: 6, start: 0 },
          points: 7,
          trendThreshold: 8,
          scene: {
            alt: "Observatorio de Tendencias",
            backdrop: { image: "/assets/missions/m1_3-observatory.webp" },
          },
          challenges: [
            {
              id: "alcista",
              metric: "trend",
              compare: "gte",
              target: 12,
              prompt: "Fabrica una tendencia alcista.",
              successNote: "Subiste cada máximo y mínimo por encima del anterior: eso es una tendencia alcista (HH y HL).",
            },
            {
              id: "bajista",
              metric: "trend",
              compare: "lte",
              target: -12,
              prompt: "Ahora fabrica una tendencia bajista.",
              successNote: "Cada máximo y mínimo quedó más bajo que el anterior: tendencia bajista (LH y LL).",
            },
          ],
          question: {
            prompt: "¿Qué define una tendencia alcista?",
            options: [
              { id: "a", text: "Que cada máximo y cada mínimo queden más altos que el anterior", correct: true, feedback: "Eso fabricaste: máximos y mínimos ascendentes. Es la firma de una tendencia alcista." },
              { id: "b", text: "Que el precio suba sin bajar nunca", correct: false, feedback: "Toda tendencia tiene retrocesos; lo que importa es que la escalera siga subiendo." },
              { id: "c", text: "Que haya muchas velas verdes", correct: false, feedback: "Puede haber velas rojas dentro de una tendencia alcista; lo que manda es la estructura." },
              { id: "d", text: "Que salgan noticias buenas", correct: false, feedback: "La tendencia es la estructura del precio, no depende de las noticias." },
            ],
          },
        },
        passingScore: 70,
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
        "Descubre, moviendo tú mismo la posición y el stop, qué hace que arriesgues más o menos de tu capital en una sola operación.",
      learningObjectives: [
        "Descubrir que el riesgo de una operación nace del tamaño de la posición y de la distancia del Stop Loss",
        "Comprobar que más unidades o un stop más lejano suben el riesgo, y al revés lo bajan",
        "Reconocer por qué la regla del 2% protege tu capital de una mala racha",
      ],
      keyConcepts: ["stop loss", "tamaño de posición", "riesgo por operación", "regla del 2%", "capital"],
      requiredMissions: ["m1_3"],
      introDialogues: [
        {
          id: "m1_4_intro_1",
          character: "el_viejo_marco",
          type: "diary",
          text: "La primera vez que operé sin cuidar el riesgo, una sola operación se llevó lo de meses. Nunca más. Hoy vas a tener en tus manos los dos únicos mandos que deciden cuánto puedes perder — muévelos y míralo tú mismo.",
          footnote: "— Entrada #31",
        },
        {
          id: "m1_4_intro_2",
          character: "aria",
          type: "aria_message",
          text: "No te voy a dar la fórmula. Tienes un capital fijo y dos controles: cuántas unidades compras y a qué distancia pones el Stop Loss. Un medidor te dirá, en vivo, cuánto de tu capital pones en juego. Descúbrelo: ¿qué lo hace subir?",
        },
        {
          id: "m1_4_intro_3",
          character: "el_especulador",
          type: "enemy_taunt",
          text: "¿Medir el riesgo? Yo entro con todo y ya. Si sale bien, gano el doble que tú. Si sale mal... bueno, esa parte no me gusta contarla.",
        },
      ],
      outroDialogues: [
        {
          id: "m1_4_outro_1",
          character: "aria",
          type: "tip",
          text: "Lo viste sin que nadie te lo dictara: el riesgo = tamaño de la posición × distancia del stop. Por eso, para no pasar del 2%, si alejas el stop tienes que bajar las unidades. Ese 2% es el muro que te mantiene en el juego tras una mala racha.",
        },
        {
          id: "m1_4_outro_2",
          character: "el_viejo_marco",
          type: "diary",
          text: "Los mejores que conocí no eran los más listos: eran los más disciplinados con el riesgo. Arriesga 2% y aguantas diez pérdidas seguidas con el 81% intacto. Arriesga 10% y esas diez te dejan en cero.",
          footnote: "— Entrada #47",
        },
      ],
      quiz: [
        {
          id: "q_m1_4_01",
          difficulty: "basico",
          conceptEvaluated: "Aplicar: qué sube el riesgo",
          question: "En tu operación dejas el Stop Loss donde está y subes el número de unidades. ¿Qué le pasa al riesgo?",
          options: [
            { id: "a", text: "Sube: más unidades con el mismo stop arriesgan más", isCorrect: true, feedback: "Correcto. Es lo que viste: con el stop fijo, más unidades movían el medidor hacia arriba." },
            { id: "b", text: "Baja, porque repartes el riesgo en más unidades", isCorrect: false, feedback: "Al revés: cada unidad extra suma pérdida potencial. El medidor subía." },
            { id: "c", text: "No cambia: el riesgo solo depende del stop", isCorrect: false, feedback: "Depende de las dos cosas: unidades Y distancia del stop." },
            { id: "d", text: "Sube solo si el precio baja después", isCorrect: false, feedback: "El riesgo que mides es el potencial de la posición; no depende de lo que haga el precio luego." },
          ],
          explanation: "Riesgo = unidades × distancia del stop. Con el stop fijo, más unidades = más riesgo.",
        },
        {
          id: "q_m1_4_02",
          difficulty: "intermedio",
          conceptEvaluated: "Aplicar: el stop y el tamaño se compensan",
          question: "Quieres alejar el Stop Loss (darle más aire) pero sin pasar del 2% de riesgo. ¿Qué tienes que hacer con las unidades?",
          options: [
            { id: "a", text: "Bajarlas: un stop más lejos obliga a una posición más pequeña", isCorrect: true, feedback: "Correcto. Como el riesgo es unidades × distancia, si la distancia sube, las unidades tienen que bajar para no pasarte." },
            { id: "b", text: "Subirlas, para aprovechar el margen", isCorrect: false, feedback: "Eso dispararía el riesgo: subirían las dos partes de la multiplicación." },
            { id: "c", text: "Dejarlas igual: el stop no afecta al riesgo", isCorrect: false, feedback: "Sí lo afecta — un stop más lejano deja perder más por unidad." },
            { id: "d", text: "Nada, es imposible mantener el 2%", isCorrect: false, feedback: "Se puede: basta con reducir las unidades. Lo comprobaste en el segundo reto." },
          ],
          explanation: "El tamaño y la distancia del stop se compensan: para el mismo 2%, más aire en el stop significa menos unidades.",
        },
        {
          id: "q_m1_4_03",
          difficulty: "intermedio",
          conceptEvaluated: "Por qué el 2% protege",
          question: "El Especulador arriesga el 10% de su capital en cada operación. ¿Por qué eso es peligroso aunque acierte a veces?",
          options: [
            { id: "a", text: "Porque una racha de malas seguidas puede vaciar la cuenta: al 10%, diez pérdidas la dejan en cero", isCorrect: true, feedback: "Correcto. El 2% existe justo para sobrevivir a las malas rachas, que siempre llegan." },
            { id: "b", text: "Porque arriesgar mucho está prohibido", isCorrect: false, feedback: "No hay prohibición; el peligro es matemático, no legal." },
            { id: "c", text: "Porque el 10% da menos ganancia", isCorrect: false, feedback: "Puede dar más ganancia en las buenas — el problema es lo que hace en las malas." },
            { id: "d", text: "Porque el broker no lo permite", isCorrect: false, feedback: "El broker suele permitirlo; quien te protege eres tú con tu regla de riesgo." },
          ],
          explanation: "Arriesgar poco por operación (1-2%) te mantiene en el juego tras varias pérdidas seguidas. Arriesgar mucho te expone a quedar fuera con una sola mala racha.",
        },
      ],
      minigame: {
        id: "mg_m1_4",
        type: "gauge_lab",
        title: "El Medidor de Riesgo",
        description: "Mueve las unidades y el stop. Mira cuánto de tu capital pones en juego. Descubre qué lo mueve.",
        instructions: "Con tu capital fijo, cambia el tamaño de la posición y la distancia del Stop Loss. El medidor muestra el % en riesgo. Resuelve los dos retos y responde qué viste.",
        config: {
          capital: 1000,
          thresholdPct: 2,
          maxScalePct: 6,
          units: { min: 1, max: 12, start: 6, label: "Tamaño de la posición (unidades)", accent: "#e5960a" },
          stop: { min: 1, max: 12, start: 5, label: "Distancia del Stop Loss ($ por unidad)", accent: "#dc2626" },
          scene: {
            alt: "Bóveda: tu capital y el medidor de riesgo",
            backdrop: { image: "/assets/missions/m1_4-vault.webp" },
            coin: { image: "/assets/missions/m1_4-coin.webp" },
          },
          challenges: [
            {
              id: "baja_stop_fijo",
              prompt: "Baja el riesgo a 2% o menos SIN mover la distancia del stop.",
              lock: "stop",
              compare: "lte",
              target: 2,
              successNote: "Con el mismo stop, menos unidades bajaron el riesgo. El tamaño de la posición es una de las dos palancas.",
            },
            {
              id: "baja_unidades_fijas",
              prompt: "Otra vez a 2% o menos, pero ahora SIN cambiar las unidades.",
              lock: "units",
              compare: "lte",
              target: 2,
              successNote: "Con las mismas unidades, acercar el stop bajó el riesgo. La distancia del stop es la otra palanca.",
            },
          ],
          question: {
            prompt: "En tu operación, ¿qué hace que arriesgues más de tu capital?",
            options: [
              { id: "a", text: "Más unidades, o un Stop Loss más lejano", correct: true, feedback: "Eso viste: cualquiera de los dos subía el medidor. Riesgo = tamaño × distancia del stop." },
              { id: "b", text: "Menos unidades", correct: false, feedback: "Menos unidades bajaba el riesgo, no lo subía." },
              { id: "c", text: "Un Stop Loss más cercano", correct: false, feedback: "Acercar el stop bajaba el riesgo — fue justo el segundo reto." },
              { id: "d", text: "El riesgo no lo decides tú", correct: false, feedback: "Sí lo decides: con esos dos controles. Por eso puedes mantenerlo en el 2%." },
            ],
          },
        },
        passingScore: 70,
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
