// ============================================================
// TraderPath — Level 3: "El Mundo de los Bloques"
// Ruta de especialización: CRIPTOMONEDAS
// Requiere: Nivel 2 completado + especialización "crypto" elegida
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

// ─── TIPOS ESPECÍFICOS DE NIVEL 3 CRYPTO ───────────────────

export type Level3CryptoMinigameType =
  | Level2MinigameType
  | "dominance_gauge"
  | "cycle_mapper"
  | "volume_reader"
  | "fear_greed_slider"
  | "pair_calculator"
  | "timeframe_switcher"

export interface Level3Minigame extends Omit<Level2Minigame, "type"> {
  type: Level3CryptoMinigameType
}

export interface Level3Mission extends Omit<Level2Mission, "minigame"> {
  minigame?: Level3Minigame
  referenceAssets: string[]
  cryptoConcepts: string[]
}

export interface Level3CryptoConfig {
  id: string
  order: number
  specialization: "crypto"
  title: string
  tagline: string
  description: string
  cityName: string
  cityTagline: string
  startingCapitalEstimate: number
  totalMissions: number
  xpRequired: number
  missions: Level3Mission[]
}

// ─── NIVEL 3 — RUTA CRIPTO ──────────────────────────────────

export const level3Crypto: Level3CryptoConfig = {
  id: "level_3_crypto",
  order: 3,
  specialization: "crypto",
  title: "El Mundo de los Bloques",
  tagline: "Este mercado no cierra, no descansa y no perdona. Pero tampoco olvida.",
  description: "Bienvenido a Ciudad Nexus. Aquí el mercado opera las 24 horas, los 7 días de la semana, los 365 días del año. Aprenderás qué hace único al mundo crypto: su volatilidad, sus ciclos, la dominancia de Bitcoin, el halving, el Fear & Greed Index, y cómo aplicar análisis técnico en activos que pueden subir un 40% o caer un 30% en una sola semana.",
  cityName: "Ciudad Nexus",
  cityTagline: "El mercado que nunca duerme — neón, bloques y volatilidad eterna.",
  startingCapitalEstimate: 3_500,
  totalMissions: 5,
  xpRequired: 950,
  missions: [
    // ── MISIÓN 3C.1 — La Ciudad que Nunca Duerme ──
    {
      id: "m3c_1",
      order: 1,
      title: "La Ciudad que Nunca Duerme",
      subtitle: "El mercado más diferente que jamás operarás",
      description: "Primera misión en Ciudad Nexus. Descubrirás qué hace único al mercado crypto: disponibilidad 24/7, alta volatilidad estructural, CEX vs DEX, y los fundamentos de un par de trading.",
      learningObjectives: [
        "Entender qué hace diferente al mercado crypto de cualquier otro",
        "Distinguir entre CEX (exchange centralizado) y DEX (descentralizado)",
        "Comprender qué es un par de trading y cómo leer un order book básico",
        "Aplicar reglas de gestión de riesgo a la alta volatilidad crypto",
      ],
      keyConcepts: ["mercado 24/7", "CEX", "DEX", "par de trading", "order book", "volatilidad estructural", "spot trading", "USDT / stablecoin"],
      cryptoConcepts: ["CEX vs DEX", "trading pair", "stablecoin como refugio", "order book depth"],
      referenceAssets: ["BTC/USDT", "ETH/USDT"],
      requiredMissions: ["m2_5"],
      introDialogues: [
        { id: "m3c1_intro_1", character: "narrator", type: "diary", text: "Ciudad Nexus. Las pantallas nunca se apagan. Los bloques nunca dejan de minarse. El precio nunca deja de moverse." },
        { id: "m3c1_intro_2", character: "el_viejo_marco", type: "diary", text: "Llegaste al único mercado donde puedes perder dinero un domingo a las 3 de la mañana. Eso suena como una broma, pero no lo es. Aquí no hay horarios. No hay feriados. No hay campana de cierre. El mercado no descansa aunque tú lo hagas. Eso cambia todo.", footnote: "— El Viejo Marco, Primera Entrada desde Ciudad Nexus" },
        { id: "m3c1_intro_3", character: "aria", type: "aria_message", text: "Crypto opera 24/7/365. Eso tiene dos caras: más oportunidades, pero también más riesgo de que el precio se mueva mientras duermes. Por eso el Stop Loss no es opcional aquí — es el primer componente de cualquier operación. Empecemos por entender dónde ocurre el trading: los exchanges." },
        { id: "m3c1_intro_4", character: "el_especulador", type: "enemy_taunt", text: "24 horas, 7 días... Yo una vez operé 36 horas seguidas sin dormir. Me sentía imparable. El mercado eventualmente me demostró que no lo era. No repitas mi error." },
      ],
      outroDialogues: [
        { id: "m3c1_outro_1", character: "aria", type: "tip", text: "Recuerda: un CEX (Binance, Coinbase, Bybit) es conveniente y rápido, pero tú no controlas tus claves. Un DEX (Uniswap, dYdX) te da control total pero con más complejidad. Para trading activo, los CEX son el punto de partida estándar." },
        { id: "m3c1_outro_2", character: "el_viejo_marco", type: "diary", text: "El par BTC/USDT no significa que compras Bitcoin con dólares. Significa que usas USDT —un dólar digital— como moneda base. Entender eso parece trivial. No lo es.", footnote: "— Entrada #2 desde Nexus" },
      ],
      quiz: [
        { id: "q_m3c1_01", difficulty: "basico", conceptEvaluated: "Diferencia CEX vs DEX", question: "¿Cuál es la principal diferencia entre un CEX y un DEX?", options: [
          { id: "a", text: "Un CEX es más caro en comisiones que un DEX", isCorrect: false, feedback: "No necesariamente — los DEX tienen gas fees que pueden ser muy elevados según la red." },
          { id: "b", text: "En un CEX una empresa custodia tus activos; en un DEX tú controlas tus propias claves", isCorrect: true, feedback: "Correcto. 'Not your keys, not your coins' — en un CEX, confías en la plataforma. En un DEX, en el código." },
          { id: "c", text: "Un DEX solo opera criptomonedas y un CEX solo opera acciones", isCorrect: false, feedback: "Ambos operan criptomonedas. La diferencia está en la custodia y el modelo de operación." },
          { id: "d", text: "En un CEX el precio es más alto que en un DEX", isCorrect: false, feedback: "Los precios son similares entre exchanges gracias al arbitraje." },
        ], explanation: "CEX (Exchange Centralizado) = la plataforma guarda tus activos. Si el exchange quiebra (como FTX en 2022), tus fondos están en riesgo. DEX (Exchange Descentralizado) = tus fondos permanecen en tu wallet. El intercambio ocurre por smart contracts." },
        { id: "q_m3c1_02", difficulty: "basico", conceptEvaluated: "Par de trading y stablecoin", question: "En el par BTC/USDT, ¿qué rol cumple el USDT?", options: [
          { id: "a", text: "USDT es otra criptomoneda con alto potencial de revalorización", isCorrect: false, feedback: "USDT está diseñado para mantener siempre el valor de $1 USD." },
          { id: "b", text: "USDT es la moneda de cotización — el precio de BTC se expresa en USDT", isCorrect: true, feedback: "Correcto. En BTC/USDT, BTC es el activo que operas y USDT es la moneda con la que pagas/recibes." },
          { id: "c", text: "USDT es emitido por Bitcoin como recompensa a los mineros", isCorrect: false, feedback: "USDT es emitido por Tether, una empresa separada." },
          { id: "d", text: "USDT vale siempre 0.01 BTC", isCorrect: false, feedback: "USDT vale $1 USD independientemente del precio de Bitcoin." },
        ], explanation: "En un par de trading X/Y, X es el activo base (lo que compras) e Y es la moneda de cotización (con qué pagas). Las stablecoins como USDT, USDC o BUSD mantienen paridad con el dólar y son el refugio más común en crypto." },
        { id: "q_m3c1_03", difficulty: "intermedio", conceptEvaluated: "Volatilidad 24/7 y gestión de riesgo", question: "Tienes una posición larga en ETH y debes dormir 8 horas. ¿Cuál es la acción más prudente?", options: [
          { id: "a", text: "Cerrar la posición antes de dormir para evitar cualquier riesgo", isCorrect: false, feedback: "Cerrar siempre antes de dormir es excesivamente conservador." },
          { id: "b", text: "Verificar que el Stop Loss esté correctamente colocado y que el tamaño de la posición respete el 2% de riesgo", isCorrect: true, feedback: "Correcto. El Stop Loss trabaja mientras duermes — esa es su función principal en un mercado 24/7." },
          { id: "c", text: "Poner una alerta de precio y despertarse si suena", isCorrect: false, feedback: "Las alertas no reemplazan un Stop Loss. El mercado puede moverse más rápido que tu reacción." },
          { id: "d", text: "No hacer nada — el mercado crypto siempre se recupera", isCorrect: false, feedback: "Algunos activos crypto han caído 90%+ y no se recuperaron en años." },
        ], explanation: "En un mercado 24/7, el Stop Loss es tu guardián nocturno. El tamaño de la posición (máximo 2% de riesgo) asegura que incluso si el Stop Loss se ejecuta, la pérdida es manejable." },
        { id: "q_m3c1_04", difficulty: "avanzado", conceptEvaluated: "Order book básico", question: "En el order book de BTC/USDT, el lado 'bids' muestra...", options: [
          { id: "a", text: "Las órdenes de venta de BTC a diferentes precios", isCorrect: false, feedback: "Las órdenes de venta están en el lado 'asks'." },
          { id: "b", text: "Las órdenes de compra de BTC a diferentes precios — la demanda visible del mercado", isCorrect: true, feedback: "Correcto. Bids = compradores. El precio más alto del bid es el que un comprador está dispuesto a pagar ahora mismo." },
          { id: "c", text: "El historial de operaciones ejecutadas en el mercado", isCorrect: false, feedback: "El historial se muestra en 'trade history', no en el order book." },
          { id: "d", text: "Las comisiones que cobra el exchange", isCorrect: false, feedback: "Las comisiones son una estructura separada del order book." },
        ], explanation: "El order book tiene dos lados: Bids (compradores, verde) y Asks (vendedores, rojo). El spread es la diferencia entre el mejor ask y el mejor bid." },
      ],
      minigame: {
        id: "mg_m3c1", type: "pair_calculator", title: "Calculadora de Pares",
        description: "Calcula el tamaño de posición correcto respetando el 2% de riesgo para diferentes pares crypto.",
        instructions: "Para cada par, calcula cuántas unidades puedes comprar sin superar el 2% de riesgo. Considera: capital disponible, precio de entrada, y distancia al Stop Loss.",
        config: { capital: 3500, riskPct: 0.02, scenarios: [
          { pair: "BTC/USDT", entry: 95000, stopLoss: 93000, correctUnits: 0.035 },
          { pair: "ETH/USDT", entry: 3200, stopLoss: 3050, correctUnits: 0.466 },
          { pair: "SOL/USDT", entry: 185, stopLoss: 175, correctUnits: 7 },
          { pair: "BNB/USDT", entry: 620, stopLoss: 595, correctUnits: 2.8 },
          { pair: "XRP/USDT", entry: 0.62, stopLoss: 0.58, correctUnits: 1750 },
        ], tolerance: 0.05 },
        passingScore: 70, virtualCapitalReward: 150,
      },
      rewards: { xp: 140, virtualCapital: 250 },
    },
    // ── MISIÓN 3C.2 — El Rey Bitcoin ──
    {
      id: "m3c_2", order: 2, title: "El Rey Bitcoin", subtitle: "Entiende a BTC y entenderás el mercado crypto entero",
      description: "Bitcoin no es solo otro activo — es el activo que determina el estado emocional de todo el mercado crypto. Aprenderás qué es la dominancia de BTC, cómo se correlacionan las altcoins con él, y qué es el market cap total.",
      learningObjectives: ["Comprender qué es la BTC Dominance y por qué importa", "Entender la correlación entre BTC y las altcoins", "Leer el market cap total del mercado crypto", "Identificar cuándo las altcoins se desacoplan de BTC"],
      keyConcepts: ["BTC dominance", "altcoins", "market cap", "correlación", "altcoin season", "BTC como reserva de valor", "total crypto market cap", "desacoplamiento"],
      cryptoConcepts: ["BTC dominance index", "altseason indicator", "total market cap", "BTC.D chart"],
      referenceAssets: ["BTC/USDT", "ETH/USDT", "BTC.D (Dominance)", "TOTAL (Market Cap)"],
      requiredMissions: ["m3c_1"],
      introDialogues: [
        { id: "m3c2_intro_1", character: "el_viejo_marco", type: "diary", text: "Antes de operar cualquier altcoin, mira a Bitcoin. Si BTC está cayendo, las altcoins no van a salvar tu operación. Si BTC está en acumulación, el resto del mercado está esperando. BTC marca el ritmo. Todo lo demás baila.", footnote: "— Entrada #9 desde Nexus" },
        { id: "m3c2_intro_2", character: "aria", type: "aria_message", text: "La BTC Dominance (BTC.D) mide el porcentaje del market cap total que pertenece a Bitcoin. Cuando BTC.D sube, el dinero fluye hacia Bitcoin — señal de cautela. Cuando BTC.D baja, el dinero fluye hacia altcoins — potencial altseason." },
        { id: "m3c2_intro_3", character: "la_señorita_fomo", type: "enemy_taunt", text: "¿BTC dominance? ¡Mira ese altcoin que subió 200% en 3 días! ¡Entra ahora antes de que sea tarde!" },
        { id: "m3c2_intro_4", character: "aria", type: "warning", text: "La Señorita FOMO acaba de mostrar cómo se pierden carteras completas en crypto. Un altcoin que subió 200% en 3 días puede caer 80% en los próximos 3 días." },
      ],
      outroDialogues: [
        { id: "m3c2_outro_1", character: "aria", type: "tip", text: "Checklist antes de operar cualquier altcoin: 1) ¿En qué fase está BTC? 2) ¿BTC.D subiendo o bajando? 3) ¿El market cap total en expansión o contracción?" },
        { id: "m3c2_outro_2", character: "el_viejo_marco", type: "diary", text: "Vi traders perder fortunas en altcoins que 'siempre van a existir'. Muchas no existen hoy.", footnote: "— Entrada #14 desde Nexus" },
      ],
      quiz: [
        { id: "q_m3c2_01", difficulty: "basico", conceptEvaluated: "BTC Dominance", question: "La BTC Dominance está en 60%. ¿Qué significa esto?", options: [
          { id: "a", text: "Bitcoin vale $60,000", isCorrect: false, feedback: "La dominance es un porcentaje del market cap total, no el precio." },
          { id: "b", text: "El 60% del capital total invertido en crypto está en Bitcoin", isCorrect: true, feedback: "Correcto. BTC.D = market cap de BTC / market cap total × 100." },
          { id: "c", text: "Bitcoin sube un 60% este año", isCorrect: false, feedback: "La dominance no mide rendimiento porcentual." },
          { id: "d", text: "El 60% de los traders operan BTC", isCorrect: false, feedback: "La dominance mide capital, no número de traders." },
        ], explanation: "La BTC Dominance mide el porcentaje que representa el market cap de Bitcoin sobre el total de crypto. Alta (>60%) = inversores prefieren BTC. Baja (<40%) = posible altseason." },
        { id: "q_m3c2_02", difficulty: "intermedio", conceptEvaluated: "Correlación BTC–Altcoins", question: "Bitcoin cae un 15% en 24 horas. ¿Qué suele ocurrir con la mayoría de altcoins?", options: [
          { id: "a", text: "Las altcoins suben porque los inversores rotan de BTC a altcoins", isCorrect: false, feedback: "En caídas bruscas, el pánico afecta a todo el mercado." },
          { id: "b", text: "Las altcoins caen más que BTC en términos porcentuales — alta correlación bajista", isCorrect: true, feedback: "Correcto. Las altcoins tienen beta mayor — amplifican los movimientos de BTC." },
          { id: "c", text: "Las altcoins no se ven afectadas — son proyectos independientes", isCorrect: false, feedback: "En el corto plazo, la correlación del mercado crypto es muy alta." },
          { id: "d", text: "Solo las altcoins de bajo market cap caen", isCorrect: false, feedback: "La correlación afecta a todo el mercado." },
        ], explanation: "Las altcoins tienen 'beta' mayor respecto a BTC. Una caída del 15% en BTC puede ser 25-40% en altcoins medianas y 40-60% en pequeñas." },
        { id: "q_m3c2_03", difficulty: "intermedio", conceptEvaluated: "Altseason", question: "¿Qué condiciones típicamente preceden a una 'altseason'?", options: [
          { id: "a", text: "BTC en caída libre y dominance subiendo", isCorrect: false, feedback: "Dominance subiendo = dinero hacia BTC, no altcoins." },
          { id: "b", text: "BTC en consolidación o leve alza + BTC Dominance bajando desde niveles altos", isCorrect: true, feedback: "Correcto. Cuando BTC estabiliza y el capital rota hacia altcoins, BTC.D baja." },
          { id: "c", text: "Un tweet positivo de una figura pública sobre las altcoins", isCorrect: false, feedback: "Los tweets generan ruido pero no una altseason real." },
          { id: "d", text: "Más de 10,000 proyectos listados en exchanges", isCorrect: false, feedback: "El número de proyectos no determina las condiciones de mercado." },
        ], explanation: "Una altseason llega después de que BTC ha tenido un rally significativo. Los inversores rotan ese capital hacia altcoins buscando mayores retornos." },
        { id: "q_m3c2_04", difficulty: "avanzado", conceptEvaluated: "Market cap vs precio unitario", question: "Un trader dice: 'SOL a $200 y BTC a $95,000 — SOL es más barato, tiene más potencial.' ¿Qué error comete?", options: [
          { id: "a", text: "Confunde el precio unitario con el market cap — el verdadero indicador de tamaño", isCorrect: true, feedback: "Correcto. Un precio bajo no implica mayor potencial. Lo que importa es el market cap total." },
          { id: "b", text: "No comete error — SOL tiene más potencial porcentual", isCorrect: false, feedback: "El 'precio bajo' de SOL vs BTC no implica más potencial." },
          { id: "c", text: "Debería comparar SOL con ETH, no con BTC", isCorrect: false, feedback: "El problema es la lógica, no la comparación." },
          { id: "d", text: "SOL no es buena inversión porque está debajo de BTC", isCorrect: false, feedback: "El precio unitario no determina calidad." },
        ], explanation: "El precio unitario no indica potencial. Lo relevante es el market cap total y cuánto capital necesitaría entrar para que el precio doble." },
      ],
      minigame: {
        id: "mg_m3c2", type: "dominance_gauge", title: "El Indicador de Dominancia",
        description: "Observa BTC Dominance y precio BTC. Identifica la fase del ciclo en cada momento.",
        instructions: "Se mostrarán 6 momentos del mercado. Para cada uno: ¿BTC, altcoins, o esperar? 4 de 6 para aprobar.",
        config: { scenarios: [
          { btcDominance: 72, btcTrend: "bajista", answer: "esperar" },
          { btcDominance: 45, btcTrend: "alcista_consolidacion", answer: "altcoins" },
          { btcDominance: 58, btcTrend: "alcista_fuerte", answer: "btc" },
          { btcDominance: 65, btcTrend: "lateral", answer: "esperar" },
          { btcDominance: 38, btcTrend: "lateral", answer: "altcoins_con_cuidado" },
          { btcDominance: 55, btcTrend: "alcista_post_halving", answer: "btc_primero" },
        ], requiredCorrect: 4 },
        passingScore: 66, virtualCapitalReward: 150,
      },
      rewards: { xp: 160, virtualCapital: 250, badge: "observador_de_dominancia" },
    },
    // ── MISIÓN 3C.3 — Los Ciclos de la Luna ──
    {
      id: "m3c_3", order: 3, title: "Los Ciclos de la Luna", subtitle: "Crypto tiene estaciones. Aprender a reconocerlas lo cambia todo",
      description: "El mercado crypto opera en ciclos de 4 años vinculados al halving de Bitcoin. Aprenderás las 4 fases del ciclo, qué es el halving, y cómo el Fear & Greed Index captura el estado emocional del mercado.",
      learningObjectives: ["Identificar las 4 fases del ciclo del mercado crypto", "Entender qué es el halving de Bitcoin y su impacto histórico", "Usar el Fear & Greed Index como indicador de sentimiento", "Reconocer señales de techo y suelo de mercado"],
      keyConcepts: ["halving", "ciclo de 4 años", "acumulación", "distribución", "impulso", "capitulación", "Fear & Greed Index", "on-chain", "ATH"],
      cryptoConcepts: ["halving de Bitcoin", "ciclo de 4 años", "Fear & Greed Index", "supply shock", "miner selling"],
      referenceAssets: ["BTC/USDT"],
      requiredMissions: ["m3c_2"],
      introDialogues: [
        { id: "m3c3_intro_1", character: "el_viejo_marco", type: "diary", text: "He vivido cuatro halvings. Cada vez que lo veo, el mercado sigue un patrón similar. No idéntico. Pero similar. La acumulación silenciosa, el impulso que nadie creía, el éxtasis del ATH, la caída que duele más de lo que nadie admite. Y luego, otra vez desde el principio.", footnote: "— Entrada #18 desde Nexus" },
        { id: "m3c3_intro_2", character: "aria", type: "aria_message", text: "El ciclo crypto de 4 años tiene 4 fases: ACUMULACIÓN (precio bajo, nadie habla de crypto), IMPULSO (precio sube, el retail empieza a entrar), DISTRIBUCIÓN (ATH cercano, euforia total), CAPITULACIÓN (precio cae, pánico). El ciclo comienza de nuevo." },
        { id: "m3c3_intro_3", character: "don_panico", type: "enemy_taunt", text: "¡BTC cayó 80% desde el ATH! ¡Es el fin de las criptomonedas! ¡Vendí todo en el peor momento!" },
        { id: "m3c3_intro_4", character: "aria", type: "warning", text: "Don Pánico describió el error más costoso del ciclo bajista: vender en capitulación. Históricamente, 'crypto ha muerto' ha aparecido en cada ciclo bajista. En cada caso, el mercado se recuperó." },
      ],
      outroDialogues: [
        { id: "m3c3_outro_1", character: "aria", type: "tip", text: "Fear & Greed Index: 0-25 = Miedo Extremo (históricamente buenas zonas de compra LP), 25-50 = Miedo, 50-75 = Codicia, 75-100 = Codicia Extrema (históricamente malas zonas de entrada)." },
        { id: "m3c3_outro_2", character: "el_viejo_marco", type: "diary", text: "El halving no garantiza nada. Lo que sí cambia es la oferta: los mineros reciben menos BTC por bloque. Si la demanda se mantiene y la oferta baja, la presión es alcista. Pero el timing nunca es exacto.", footnote: "— Entrada #24 desde Nexus" },
      ],
      quiz: [
        { id: "q_m3c3_01", difficulty: "basico", conceptEvaluated: "Qué es el halving", question: "¿Qué ocurre en el halving de Bitcoin?", options: [
          { id: "a", text: "El precio de Bitcoin se divide a la mitad", isCorrect: false, feedback: "El halving no divide el precio — divide la recompensa de los mineros." },
          { id: "b", text: "La recompensa que reciben los mineros por validar bloques se reduce a la mitad", isCorrect: true, feedback: "Correcto. Cada ~4 años, la emisión de nuevos BTC se reduce 50%." },
          { id: "c", text: "La cantidad total de Bitcoin en circulación se reduce a la mitad", isCorrect: false, feedback: "El supply existente no se destruye — solo se reduce la tasa de emisión." },
          { id: "d", text: "El número de transacciones se reduce a la mitad", isCorrect: false, feedback: "La capacidad de transacciones no está vinculada al halving." },
        ], explanation: "El halving reduce a la mitad la recompensa de minería. En 2024, pasó de 6.25 a 3.125 BTC por bloque. Con menor oferta nueva y misma demanda, hay presión alcista." },
        { id: "q_m3c3_02", difficulty: "intermedio", conceptEvaluated: "Fases del ciclo", question: "Noticias: 'Bitcoin supera ATH. Celebridades invierten. Tu abuela pregunta cómo comprar crypto.' ¿En qué fase?", options: [
          { id: "a", text: "Acumulación — los smart money compran", isCorrect: false, feedback: "La acumulación ocurre en silencio." },
          { id: "b", text: "Distribución — euforia total, los primeros inversores están vendiendo", isCorrect: true, feedback: "Correcto. La euforia masiva y ATH en titulares son señales clásicas de distribución." },
          { id: "c", text: "Capitulación — el mercado está en pánico", isCorrect: false, feedback: "La capitulación es pánico, no euforia." },
          { id: "d", text: "Impulso — el precio acaba de empezar a subir", isCorrect: false, feedback: "El impulso ocurre antes de la cobertura mediática masiva." },
        ], explanation: "La euforia pública, nuevos ATH y el interés de personas ajenas al mercado son señales de distribución — la fase donde los inversores inteligentes realizan ganancias." },
        { id: "q_m3c3_03", difficulty: "intermedio", conceptEvaluated: "Fear & Greed Index", question: "Fear & Greed en 92 (Codicia Extrema). ¿Implicación para trader de corto plazo?", options: [
          { id: "a", text: "Señal perfecta para comprar", isCorrect: false, feedback: "Cuando todo el mundo ya compró, ¿quién queda para subir el precio?" },
          { id: "b", text: "Alta precaución — niveles de codicia extrema coinciden con techos de corto plazo", isCorrect: true, feedback: "Correcto. El exceso de optimismo es señal de posible corrección." },
          { id: "c", text: "El índice no tiene relevancia", isCorrect: false, feedback: "El sentimiento es un input valioso en extremos." },
          { id: "d", text: "El mercado seguirá subiendo indefinidamente", isCorrect: false, feedback: "Los mercados no suben infinitamente." },
        ], explanation: "El F&G Index agrega señales de volatilidad, volumen, redes sociales y dominance. En extremos, actúa como indicador contrarian." },
        { id: "q_m3c3_04", difficulty: "avanzado", conceptEvaluated: "Supply shock post-halving", question: "Después de un halving, ¿por qué los mineros pueden generar presión vendedora?", options: [
          { id: "a", text: "Porque reciben el doble de BTC", isCorrect: false, feedback: "Reciben la mitad." },
          { id: "b", text: "Porque sus costos no cambian pero sus ingresos en BTC se reducen — deben vender más BTC para cubrir gastos", isCorrect: true, feedback: "Correcto. Los mineros menos eficientes enfrentan presión y pueden capitular." },
          { id: "c", text: "Porque celebran vendiendo sus reservas", isCorrect: false, feedback: "Los mineros venden por necesidad, no celebración." },
          { id: "d", text: "Porque nuevos mineros inmediatamente venden", isCorrect: false, feedback: "La presión viene de los existentes con costos fijos." },
        ], explanation: "Post-halving, mineros con costos altos ganan la mitad de BTC por el mismo costo. Muchos deben vender reservas para pagar facturas, creando presión vendedora temporal." },
      ],
      minigame: {
        id: "mg_m3c3", type: "cycle_mapper", title: "Mapa del Ciclo",
        description: "Identifica en qué fase del ciclo ocurrió cada evento marcado en el gráfico histórico de BTC.",
        instructions: "Se mostrarán 8 puntos en el gráfico de BTC 2017-2024. Para cada punto: ¿acumulación, impulso, distribución, o capitulación? 6 de 8 para aprobar.",
        config: { chartRange: "2017-2024", events: [
          { date: "2018-12", price: 3200, answer: "capitulacion" },
          { date: "2019-06", price: 13000, answer: "impulso" },
          { date: "2020-03", price: 3800, answer: "capitulacion" },
          { date: "2020-10", price: 12000, answer: "acumulacion_tardia" },
          { date: "2021-04", price: 65000, answer: "distribucion_inicial" },
          { date: "2021-11", price: 69000, answer: "distribucion_maxima" },
          { date: "2022-06", price: 17500, answer: "capitulacion" },
          { date: "2023-10", price: 35000, answer: "acumulacion" },
        ], requiredCorrect: 6 },
        passingScore: 75, virtualCapitalReward: 160,
      },
      rewards: { xp: 170, virtualCapital: 250, badge: "cronista_del_ciclo" },
    },
    // ── MISIÓN 3C.4 — El Lenguaje de los Bloques ──
    {
      id: "m3c_4", order: 4, title: "El Lenguaje de los Bloques", subtitle: "Análisis técnico aplicado a la volatilidad crypto",
      description: "Aplicas el AT del Nivel 2 al contexto crypto: timeframes, ATR para medir volatilidad, volumen spot vs derivados, y niveles históricos de BTC.",
      learningObjectives: ["Elegir el timeframe correcto según operación crypto", "Usar ATR para dimensionar Stop Loss", "Distinguir volumen spot y derivados", "Identificar niveles históricos clave de BTC"],
      keyConcepts: ["ATR", "timeframes en crypto", "volumen spot", "volumen derivados", "open interest", "funding rate", "niveles históricos", "HTF vs LTF"],
      cryptoConcepts: ["ATR para SL en crypto", "HTF/LTF", "funding rate", "open interest"],
      referenceAssets: ["BTC/USDT", "ETH/USDT", "BTC perpetual futures"],
      requiredMissions: ["m3c_3"],
      introDialogues: [
        { id: "m3c4_intro_1", character: "aria", type: "aria_message", text: "El AT del Nivel 2 funciona igual en crypto. La diferencia está en la MAGNITUD. Un SL de 1% en EUR/USD puede ser suficiente. El mismo en ETH puede ejecutarse en 30 minutos de volatilidad normal. El ATR te dice cuánto se mueve realmente el activo." },
        { id: "m3c4_intro_2", character: "el_viejo_marco", type: "diary", text: "Un error que cometí al empezar en crypto: puse stops que usaba en forex. Todos se ejecutaban en minutos. Crypto respira diferente.", footnote: "— Entrada #29 desde Nexus" },
        { id: "m3c4_intro_3", character: "el_especulador", type: "enemy_taunt", text: "Timeframes, ATR, funding rate... Yo simplemente abro el gráfico de 1 minuto y opero lo que veo. Por eso a veces gano 500% y pierdo 400% al día siguiente." },
      ],
      outroDialogues: [
        { id: "m3c4_outro_1", character: "aria", type: "tip", text: "Framework de timeframes para crypto: Contexto (1D, 1W) → Zona de entrada (4H, 1H) → Afinar entrada (15min, 5min). Nunca operes sin revisar el HTF primero." },
        { id: "m3c4_outro_2", character: "el_viejo_marco", type: "diary", text: "El funding rate positivo alto significa que los long están pagando a los short. Cuando todos apuestan a la suba, el mercado a veces hace lo contrario.", footnote: "— Entrada #35 desde Nexus" },
      ],
      quiz: [
        { id: "q_m3c4_01", difficulty: "basico", conceptEvaluated: "ATR y Stop Loss en crypto", question: "El ATR diario de BTC es $3,000. ¿Qué implica para tu Stop Loss?", options: [
          { id: "a", text: "Tu SL debe ser exactamente $3,000", isCorrect: false, feedback: "El ATR es referencia, no el tamaño exacto del SL." },
          { id: "b", text: "Un SL menor a $3,000 podría ejecutarse por volatilidad normal, sin que el análisis sea incorrecto", isCorrect: true, feedback: "Correcto. Si BTC se mueve $3,000/día normalmente, un SL de $500 se activará por ruido." },
          { id: "c", text: "Deberías evitar operar BTC", isCorrect: false, feedback: "La solución es ajustar el tamaño de posición, no evitar el activo." },
          { id: "d", text: "ATR de $3,000 significa tendencia alcista", isCorrect: false, feedback: "El ATR mide volatilidad, no dirección." },
        ], explanation: "El ATR mide el rango promedio de movimiento. Si el ATR diario es $3,000, tu SL debe estar fuera de ese rango. Consecuentemente, reduce el tamaño de posición." },
        { id: "q_m3c4_02", difficulty: "intermedio", conceptEvaluated: "HTF vs LTF", question: "En 1D hay tendencia bajista clara. En 15min hay señal alcista. ¿Cómo interpretar?", options: [
          { id: "a", text: "La señal de 15min es más reciente, más confiable", isCorrect: false, feedback: "El HTF siempre tiene más peso estructural." },
          { id: "b", text: "La tendencia bajista del 1D tiene más peso — la señal de 15min puede ser un rebote dentro de la bajada", isCorrect: true, feedback: "Correcto. HTF > LTF en jerarquía." },
          { id: "c", text: "Abrir dos posiciones en ambas direcciones", isCorrect: false, feedback: "Eso cancela el riesgo pero también el beneficio." },
          { id: "d", text: "Ignorar el 1D — es muy lento", isCorrect: false, feedback: "Ignorar HTF es causa común de pérdidas." },
        ], explanation: "La jerarquía: HTF marca contexto. Una señal alcista en LTF dentro de tendencia bajista HTF es contra la corriente — menor probabilidad." },
        { id: "q_m3c4_03", difficulty: "intermedio", conceptEvaluated: "Funding Rate", question: "Funding Rate en BTC perpetuos está en +0.08% (muy positivo). ¿Qué indica?", options: [
          { id: "a", text: "Señal perfecta para abrir longs", isCorrect: false, feedback: "Funding alto = YA hay demasiados longs — posible squeeze." },
          { id: "b", text: "Los longs pagan mucho a los shorts — posible sobrecalentamiento y riesgo de long squeeze", isCorrect: true, feedback: "Correcto. Funding muy positivo = exceso de posiciones largas = mercado sobrecalentado." },
          { id: "c", text: "El exchange va a subir comisiones", isCorrect: false, feedback: "El funding es mecanismo de equilibrio, no comisiones." },
          { id: "d", text: "BTC va a subir 0.08%", isCorrect: false, feedback: "El funding es costo de mantener posiciones, no predicción." },
        ], explanation: "Funding Rate equilibra longs y shorts. Muy positivo (>0.05%) = mercado sobrecalentado — el mercado frecuentemente 'limpia' estas posiciones antes de subir." },
        { id: "q_m3c4_04", difficulty: "avanzado", conceptEvaluated: "Niveles históricos de BTC", question: "BTC rompe por encima de $69,000 (ATH previo). ¿Por qué es técnicamente significativo?", options: [
          { id: "a", text: "Porque $69K es un número redondo", isCorrect: false, feedback: "El significado va más allá de ser redondo." },
          { id: "b", text: "Era la resistencia máxima — al romperse, se convierte en soporte y abre price discovery", isCorrect: true, feedback: "Correcto. Al superar ATH, el activo entra en price discovery — sin resistencias previas." },
          { id: "c", text: "Porque los mineros venden en ATH", isCorrect: false, feedback: "Los mineros no venden en función de ATH específicos." },
          { id: "d", text: "Solo por cobertura mediática", isCorrect: false, feedback: "El significado técnico va más allá del FOMO mediático." },
        ], explanation: "El ATH previo es la resistencia más fuerte — donde holders en pérdida están breakeven. Al romperse, esa presión vendedora desaparece y el activo entra en price discovery." },
      ],
      minigame: {
        id: "mg_m3c4", type: "timeframe_switcher", title: "El Análisis Multicapa",
        description: "Analiza BTC/USDT en 3 timeframes y construye tu tesis de trading completa.",
        instructions: "Revisa 1W (macro), 4H (contexto), 1H (entrada). Responde preguntas sobre cada capa.",
        config: { asset: "BTC/USDT", timeframes: ["1W", "4H", "1H"], questionsPerTF: 2, requiredCorrect: 5 },
        passingScore: 80, virtualCapitalReward: 175,
      },
      rewards: { xp: 180, virtualCapital: 300 },
    },
    // ── MISIÓN 3C.5 — El Gran Reto Cripto (Boss Level 3) ──
    {
      id: "m3c_5", order: 5, title: "El Gran Reto Cripto", subtitle: "Demuestra que puedes leer el mercado más volátil del mundo",
      description: "Misión Boss del Nivel 3. Aplicarás todo lo aprendido: ciclos, dominancia, AT multicapa y gestión de riesgo adaptada a crypto.",
      learningObjectives: ["Integrar dominancia BTC, ciclo, AT y gestión de riesgo en un análisis completo", "Tomar una decisión de trading fundamentada en crypto", "Demostrar comprensión de los conceptos exclusivos del nivel 3"],
      keyConcepts: ["síntesis nivel 3 crypto", "análisis multicapa", "BTC dominance", "ciclo de mercado", "gestión de riesgo crypto", "decisión fundamentada"],
      cryptoConcepts: ["integración BTC.D + ciclo + AT", "position sizing con ATR", "price discovery", "altcoin timing"],
      referenceAssets: ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BTC.D", "Fear & Greed Index"],
      requiredMissions: ["m3c_4"],
      introDialogues: [
        { id: "m3c5_intro_1", character: "el_viejo_marco", type: "diary", text: "Ciudad Nexus tiene una prueba para todo el que llega hasta aquí. No es fácil. Pero tampoco es imposible si estudiaste bien. Yo fallé tres veces antes de pasarla. Tú tienes algo que yo no tenía: información organizada.", footnote: "— Última entrada antes del Boss de Nivel 3" },
        { id: "m3c5_intro_2", character: "aria", type: "aria_message", text: "Este reto integra todo el Nivel 3: ciclo, BTC Dominance, AT multicapa y cálculo de riesgo. Tendrás un escenario completo y deberás: 1) identificar la fase, 2) evaluar BTC o altcoins, 3) trazar entrada con SL y TP, 4) calcular posición correcta." },
        { id: "m3c5_intro_3", character: "el_especulador", type: "enemy_taunt", text: "Esto está bien para un análisis de academia. En el mercado real, cuando el precio mueve, no hay tiempo para todo esto." },
        { id: "m3c5_intro_4", character: "el_viejo_marco", type: "diary", text: "El Especulador tiene razón en que el mercado no espera. Pero la preparación debe ser lenta y meticulosa. La ejecución, cuando llega el momento correcto, es instantánea porque ya tienes el plan.", footnote: "— Respuesta al Especulador" },
      ],
      outroDialogues: [
        { id: "m3c5_outro_1", character: "aria", type: "aria_message", text: "Nivel 3 Crypto completado. Has demostrado que puedes analizar el mercado más volátil del mundo con estructura y disciplina. El Nivel 4 te llevará más profundo." },
        { id: "m3c5_outro_2", character: "el_viejo_marco", type: "diary", text: "Ciudad Nexus nunca cierra. Siempre habrá otro movimiento, otro ciclo, otra oportunidad. La diferencia entre los que sobreviven y los que no: los primeros tienen un sistema.", footnote: "— Entrada Final del Nivel 3, Ciudad Nexus" },
        { id: "m3c5_outro_3", character: "narrator", type: "diary", text: "Las pantallas de Ciudad Nexus parpadean. Una nueva ruta se ilumina. El Nivel 4 espera." },
      ],
      quiz: [
        { id: "q_m3c5_01", difficulty: "avanzado", conceptEvaluated: "Integración: ciclo + dominancia + AT", question: "BTC en $85K post-halving. BTC.D bajando de 62% a 56%. F&G en 71. Gráfico 4H: HH y HL. ¿Lectura más completa?", options: [
          { id: "a", text: "Señal perfecta de venta — F&G alto", isCorrect: false, feedback: "F&G en 71 es Codicia, no Extrema (>80). La estructura alcista en 4H matiza." },
          { id: "b", text: "BTC en impulso post-halving, dominance bajando señala rotación hacia altcoins. Cautela pero sesgo alcista", isCorrect: true, feedback: "Correcto. Múltiples indicadores apuntan a impulso con inicio de rotación." },
          { id: "c", text: "Es imposible analizar con tanta información", isCorrect: false, feedback: "El análisis multi-factor es más robusto. La clave es jerarquizar." },
          { id: "d", text: "Esperar señal perfecta", isCorrect: false, feedback: "La señal perfecta no existe. Trading es gestión de probabilidades." },
        ], explanation: "Post-halving + estructura 4H alcista = ciclo favorable. BTC.D bajando = rotación hacia altcoins. F&G 71 = optimismo sin euforia. Sesgo alcista en BTC, empezar a buscar altcoins de calidad." },
        { id: "q_m3c5_02", difficulty: "avanzado", conceptEvaluated: "Position sizing con ATR", question: "Capital: $3,500. ATR diario SOL: $18. Riesgo 2%. Entrada $185, SL a 1.5×ATR abajo. ¿Unidades?", options: [
          { id: "a", text: "2 unidades", isCorrect: false, feedback: "SL = $27. Riesgo = $70. $70/$27 = 2.59 → 2 sería conservador pero aceptable." },
          { id: "b", text: "Aproximadamente 2.5 unidades (redondeado a 2 para no superar riesgo)", isCorrect: true, feedback: "Correcto. SL = 1.5 × $18 = $27. $70 / $27 ≈ 2.59 → 2 unidades." },
          { id: "c", text: "10 unidades", isCorrect: false, feedback: "10 × $27 = $270 = 7.7% del capital. Demasiado." },
          { id: "d", text: "El ATR no se usa para SL", isCorrect: false, feedback: "El ATR es precisamente para dimensionar SL objetivamente." },
        ], explanation: "SL = 1.5 × ATR = $27. Riesgo máximo = 2% × $3,500 = $70. Unidades = $70 ÷ $27 = 2.59 → 2 unidades. Capital en riesgo: $54 = 1.54%." },
        { id: "q_m3c5_03", difficulty: "avanzado", conceptEvaluated: "Timing altcoins vs BTC", question: "BTC está en price discovery (sobre ATH). ¿Riesgo principal de comprar altcoins ahora?", options: [
          { id: "a", text: "Ninguno — si BTC sube, todo sube", isCorrect: false, feedback: "En price discovery, el capital puede concentrarse en BTC." },
          { id: "b", text: "BTC puede absorber todo el capital nuevo, dejando altcoins estáticas o bajando temporalmente", isCorrect: true, feedback: "Correcto. BTC en price discovery puede causar 'altcoin bleed'." },
          { id: "c", text: "Las altcoins son ilegales en ATH de BTC", isCorrect: false, feedback: "No existe tal regulación." },
          { id: "d", text: "Las altcoins siempre bajan exactamente lo mismo que BTC", isCorrect: false, feedback: "La correlación existe pero no es exacta." },
        ], explanation: "Cuando BTC entra en price discovery, el FOMO se concentra en Bitcoin. El nuevo capital va directamente a BTC. Esto puede causar 'altcoin bleed' temporal. La rotación llega después de que BTC desacelera." },
      ],
      minigame: {
        id: "mg_m3c5", type: "fear_greed_slider", title: "El Análisis Integrado Cripto",
        description: "Escenario completo: recibe datos del mercado crypto y construye un plan de trading en 5 pasos.",
        instructions: "Datos: BTC.D=58% (bajando), F&G=76, BTC 4H en corrección a zona demanda $87K-89K, post-halving semana 8. Completa: 1) Fase del ciclo, 2) ¿BTC o altcoin?, 3) Activo elegido, 4) Entrada+SL+TP con R:R 1:2.5, 5) Tamaño de posición al 2% con $3,500.",
        config: {
          scenario: { btcDominance: 58, fearGreed: 76, btcStructure: "correccion_a_zona_demanda", demandZone: { low: 87000, high: 89000 }, postHalvingWeek: 8 },
          steps: 5, passingSteps: 4, capital: 3500, minRR: 2.5, maxRisk: 0.02,
        },
        passingScore: 80, virtualCapitalReward: 400,
      },
      rewards: { xp: 250, virtualCapital: 600, badge: "ciudadano_de_nexus" },
    },
  ],
}

// ─── HELPERS ─────────────────────────────────────────────────

/** Retorna una misión del nivel 3 crypto por su id */
export function getLevel3CryptoMissionById(missionId: string): Level3Mission | undefined {
  return level3Crypto.missions.find((m) => m.id === missionId)
}

/** Retorna todas las preguntas del nivel 3 crypto en array plano */
export function getAllLevel3CryptoQuestions(): QuizQuestion[] {
  return level3Crypto.missions.flatMap((m) => m.quiz)
}

/** Retorna los conceptos crypto únicos de todo el nivel */
export function getAllCryptoConcepts(): string[] {
  return Array.from(new Set(level3Crypto.missions.flatMap((m) => m.cryptoConcepts)))
}

/** Retorna los activos de referencia únicos del nivel */
export function getAllReferenceAssets(): string[] {
  return Array.from(new Set(level3Crypto.missions.flatMap((m) => m.referenceAssets)))
}

/** Calcula XP total del nivel 3 crypto */
export function getTotalLevel3CryptoXP(): number {
  return level3Crypto.missions.reduce((acc, m) => acc + m.rewards.xp, 0)
}

/** Calcula el capital virtual acumulable en el nivel */
export function getTotalLevel3CryptoCapitalRewards(): number {
  return level3Crypto.missions.reduce((acc, m) => {
    const missionCapital = m.rewards.virtualCapital
    const minigameCapital = m.minigame?.virtualCapitalReward ?? 0
    return acc + missionCapital + minigameCapital
  }, 0)
}

export default level3Crypto
