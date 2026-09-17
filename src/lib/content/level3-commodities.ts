// ============================================================
// TraderPath — Level 3: "Puerto de Materias"
// Ruta de especialización: MATERIAS PRIMAS (COMMODITIES)
// Requiere: Nivel 2 completado + especialización "commodities" elegida
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

// ─── TIPOS ESPECÍFICOS DE NIVEL 3 COMMODITIES ──────────────

export type Level3CommoditiesMinigameType =
  | Level2MinigameType
  | "supply_shock_planner"
  | "haven_industrial_gauge"
  | "dollar_commodity_correlation"
  | "seasonality_planner"
  | "commodity_trade_plan_wizard"

export interface Level3CommoditiesMinigame extends Omit<Level2Minigame, "type"> {
  type: Level3CommoditiesMinigameType
}

export interface Level3CommoditiesMission extends Omit<Level2Mission, "minigame"> {
  minigame?: Level3CommoditiesMinigame
  referenceAssets: string[]
  commodityConcepts: string[]
}

export interface Level3CommoditiesConfig {
  id: string
  order: number
  specialization: "commodities"
  title: string
  tagline: string
  description: string
  cityName: string
  cityTagline: string
  startingCapitalEstimate: number
  totalMissions: number
  xpRequired: number
  missions: Level3CommoditiesMission[]
}

// ─── NIVEL 3 — RUTA COMMODITIES ─────────────────────────────

export const level3Commodities: Level3CommoditiesConfig = {
  id: "level_3_commodities",
  order: 3,
  specialization: "commodities",
  title: "Puerto de Materias",
  tagline: "Aquí el precio no nace en una pantalla. Nace en la tierra, el pozo o la mina.",
  description: "En Puerto de Materias aprenderás a operar materias primas: cómo la oferta y demanda física mueve el precio más que cualquier patrón, por qué el oro y el petróleo reaccionan distinto al mismo titular, cómo el dólar empuja o frena a todo el sector, y por qué la estación del año importa tanto como el análisis técnico.",
  cityName: "Puerto de Materias",
  cityTagline: "Oro, energía, agricultura y oferta física.",
  startingCapitalEstimate: 3_200,
  totalMissions: 5,
  xpRequired: 800,
  missions: [
    // ── MISIÓN 3O.1 — Oferta y Demanda Física ──
    {
      id: "m3o_1",
      order: 1,
      title: "Oferta y Demanda Física",
      subtitle: "Detrás de cada vela hay un barco, un pozo o una cosecha",
      description: "Primera misión en Puerto de Materias. En el laboratorio moverás tú mismo la oferta física (recortes o aumentos de producción) y la demanda, y verás la presión sobre el precio emerger en un medidor centrado — hasta inducir que un recorte de oferta empuja al alza y una acumulación empuja a la baja.",
      learningObjectives: [
        "Inducir, moviendo oferta y demanda física, hacia dónde presiona el precio",
        "Entender cómo un recorte de producción (OPEC+) o una acumulación de inventarios mueven el precio",
        "Reconocer eventos climáticos y geopolíticos como fuentes de volatilidad de oferta",
        "Distinguir eventos con dirección clara de eventos con alta incertidumbre",
      ],
      keyConcepts: ["oferta física", "demanda física", "OPEC+", "inventarios de petróleo", "reporte EIA", "shock de oferta", "geopolítica de materias primas"],
      commodityConcepts: ["OPEC+ production decisions", "EIA inventory reports", "supply shock volatility"],
      referenceAssets: ["WTI Crudo", "Oro", "Gas Natural", "Cobre"],
      requiredMissions: ["m2_5"],
      introDialogues: [
        { id: "m3o1_intro_1", character: "narrator", type: "diary", text: "Puerto de Materias huele distinto a los otros distritos. Aquí no hay pantallas que muevan el precio primero — hay barcos, pozos y cosechas que lo mueven después." },
        { id: "m3o1_intro_2", character: "el_viejo_marco", type: "diary", text: "En acciones aprendiste a leer un reporte de resultados. Aquí aprenderás a leer un reporte de inventarios. El principio es el mismo: la sorpresa respecto a lo esperado mueve el precio, no el dato en sí mismo.", footnote: "— Primera entrada desde Puerto de Materias" },
        { id: "m3o1_intro_3", character: "aria", type: "aria_message", text: "La OPEC+ (Organización de Países Exportadores de Petróleo y aliados) decide periódicamente cuánto petróleo producir. Un recorte de producción reduce la oferta — presión alcista. Un aumento la incrementa — presión bajista. El reporte semanal de inventarios de la EIA mide cuánto crudo hay almacenado en EE.UU.: una acumulación mayor a la esperada suele presionar el precio a la baja." },
        { id: "m3o1_intro_4", character: "don_panico", type: "enemy_taunt", text: "¡Un huracán se dirige al Golfo de México! ¡El petróleo va a explotar al alza, vendo todo lo demás para comprar crudo ahora mismo!" },
      ],
      outroDialogues: [
        { id: "m3o1_outro_1", character: "aria", type: "tip", text: "Lo viste en el medidor: recortar la oferta o subir la demanda empuja el precio al alza; inundar el mercado de oferta lo empuja a la baja. Pero cuidado: no todo evento tiene dirección clara. Un recorte de la OPEC+ es alcista con bastante certeza; un huracán acercándose genera volatilidad en ambas direcciones hasta conocer el daño real." },
        { id: "m3o1_outro_2", character: "el_viejo_marco", type: "diary", text: "Don Pánico reacciona antes de saber. Un evento con final incierto no es una señal de entrada — es una señal de cautela.", footnote: "— Entrada #2 desde Puerto de Materias" },
      ],
      quiz: [
        { id: "q_m3o1_01", difficulty: "basico", conceptEvaluated: "OPEC+ y oferta", question: "La OPEC+ anuncia un recorte de producción de 1 millón de barriles diarios. ¿Qué presión ejerce esto sobre el precio del petróleo, en igualdad de otras condiciones?", options: [
          { id: "a", text: "Presión alcista — menos oferta disponible con la misma demanda", isCorrect: true, feedback: "Correcto. Reducir la oferta mientras la demanda se mantiene constante suele presionar el precio al alza." },
          { id: "b", text: "Presión bajista — la OPEC+ pierde relevancia en el mercado", isCorrect: false, feedback: "Un recorte de producción reduce la oferta disponible, lo contrario de una presión bajista." },
          { id: "c", text: "Ningún efecto — la OPEC+ no influye en el precio del petróleo", isCorrect: false, feedback: "La OPEC+ controla una porción significativa de la producción mundial de petróleo y sus decisiones sí influyen en el precio." },
          { id: "d", text: "Efecto impredecible sin ninguna dirección esperada", isCorrect: false, feedback: "Un recorte de producción tiene una dirección esperada razonablemente clara: presión alcista." },
        ], explanation: "La OPEC+ coordina la producción de una parte significativa del petróleo mundial. Un recorte reduce la oferta disponible; si la demanda no cae en la misma proporción, la presión sobre el precio suele ser alcista." },
        { id: "q_m3o1_02", difficulty: "basico", conceptEvaluated: "Reporte de inventarios EIA", question: "El reporte semanal de la EIA muestra una acumulación de inventarios de petróleo mayor a la esperada por el mercado. ¿Qué sugiere esto?", options: [
          { id: "a", text: "Que la oferta está superando a la demanda actual — presión bajista sobre el precio", isCorrect: true, feedback: "Correcto. Más petróleo almacenado del esperado sugiere que se está produciendo o importando más de lo que se está consumiendo." },
          { id: "b", text: "Que la demanda está superando ampliamente a la oferta", isCorrect: false, feedback: "Una acumulación de inventarios sugiere lo contrario: oferta superando a la demanda." },
          { id: "c", text: "Que el precio subirá con certeza en las próximas horas", isCorrect: false, feedback: "La dirección esperada es bajista, no alcista, aunque el mercado puede reaccionar con matices adicionales." },
          { id: "d", text: "Que el reporte de la EIA no tiene relación con el precio del petróleo", isCorrect: false, feedback: "El reporte de inventarios de la EIA es uno de los datos más observados por los traders de petróleo." },
        ], explanation: "Los inventarios de petróleo reflejan el balance entre producción/importación y consumo. Una acumulación mayor a la esperada indica exceso de oferta relativa, lo cual suele presionar el precio a la baja." },
        { id: "q_m3o1_03", difficulty: "intermedio", conceptEvaluated: "Eventos de alta incertidumbre", question: "Un huracán se dirige hacia plataformas petroleras del Golfo de México, pero aún no se sabe el daño que causará. ¿Cómo deberías interpretar este evento?", options: [
          { id: "a", text: "Como una señal de compra inmediata y agresiva, sin esperar más información", isCorrect: false, feedback: "Sin conocer el daño real, la dirección del movimiento sigue siendo incierta — reaccionar agresivamente antes de tiempo es prematuro." },
          { id: "b", text: "Como un evento de alta incertidumbre: genera volatilidad en ambas direcciones hasta que se conoce el impacto real", isCorrect: true, feedback: "Correcto. Antes de conocer el daño real, el mercado puede moverse en cualquier dirección según cambien las expectativas — la prudencia es la respuesta más razonable." },
          { id: "c", text: "Como un evento sin ninguna relevancia para el precio del petróleo", isCorrect: false, feedback: "Las plataformas del Golfo de México son una fuente relevante de producción — un huracán sí puede afectar el precio." },
          { id: "d", text: "Como una garantía de que el precio bajará", isCorrect: false, feedback: "Un huracán que amenaza infraestructura petrolera suele generar presión alcista por riesgo de interrupción, no bajista." },
        ], explanation: "Los eventos climáticos con desenlace incierto generan volatilidad en ambas direcciones: el mercado puede subir por temor a la interrupción de producción, o corregir si el daño resulta menor al esperado. La cautela es más apropiada que una reacción inmediata y direccional." },
        { id: "q_m3o1_04", difficulty: "avanzado", conceptEvaluated: "Fundamentos físicos vs narrativa", question: "¿Por qué es importante distinguir eventos con dirección clara (como un recorte de producción confirmado) de eventos con alta incertidumbre (como un desastre natural en curso)?", options: [
          { id: "a", text: "No es importante — todos los eventos deben tratarse exactamente igual", isCorrect: false, feedback: "Tratar todos los eventos igual ignora diferencias reales en el nivel de certeza sobre su impacto." },
          { id: "b", text: "Porque el nivel de certeza sobre el impacto debería influir en el tamaño de la reacción y el riesgo asumido", isCorrect: true, feedback: "Correcto. Un evento con dirección clara permite una reacción más decidida; uno con alta incertidumbre exige mayor cautela hasta que la situación se aclare." },
          { id: "c", text: "Porque solo los eventos climáticos afectan el precio de las materias primas", isCorrect: false, feedback: "Tanto eventos de producción como climáticos y geopolíticos pueden afectar el precio — el punto es el nivel de certeza de cada uno, no el tipo." },
          { id: "d", text: "Porque los eventos con alta incertidumbre nunca afectan el precio", isCorrect: false, feedback: "Los eventos de alta incertidumbre sí afectan el precio — generan volatilidad, aunque sin una dirección garantizada." },
        ], explanation: "El nivel de certeza sobre el impacto de un evento debería influir directamente en cómo se gestiona el riesgo: mayor certeza permite decisiones más decididas; mayor incertidumbre exige mayor cautela y, frecuentemente, esperar más información antes de actuar." },
      ],
      minigame: {
        id: "mg_m3o1", type: "level_lab", title: "El Balance Físico",
        description: "Mueve la oferta física (recortes o aumentos de producción) y la demanda, y observa la presión sobre el precio en un medidor centrado.",
        instructions: "El medidor crece a la derecha (alcista) o a la izquierda (bajista) desde el centro. Explóralo y resuelve los retos.",
        config: {
          region: "meter",
          regionLabel: "Presión sobre el precio",
          centered: true,
          roleName: "",
          inputs: [
            { key: "oferta", label: "Cambio en la oferta física (−3 recorte · +3 aumento)", min: -3, max: 3, start: 0, accent: "#EAB308" },
            { key: "demanda", label: "Cambio en la demanda física (−3 cae · +3 sube)", min: -3, max: 3, start: 0, accent: "#22C55E" },
          ],
          strength: { base: 0, weights: { oferta: -1, demanda: 1 } },
          maxStrength: 6,
          strengthWords: [
            { min: -6, text: "Presión bajista", tone: "bad" },
            { min: -1, text: "Equilibrio", tone: "good" },
            { min: 1, text: "Presión alcista", tone: "good" },
          ],
          challenges: [
            { id: "c_m3o1_1", prompt: "Provoca presión alcista: recorta la oferta (como un recorte de la OPEC+) o sube la demanda.", compare: "gte", target: 2, successNote: "Menos oferta o más demanda: el precio sube. Un recorte de producción es un evento de oferta con dirección clara." },
            { id: "c_m3o1_2", prompt: "Ahora provoca presión bajista: inunda el mercado de oferta o hunde la demanda.", compare: "lte", target: -2, successNote: "Más oferta (o menos demanda) presiona el precio a la baja: es lo que sugiere una acumulación de inventarios mayor a la esperada." },
          ],
          question: {
            prompt: "La OPEC+ anuncia un recorte de producción. En igualdad de condiciones, ¿qué presión ejerce sobre el precio del petróleo?",
            options: [
              { id: "a", text: "Alcista: menos oferta disponible con la misma demanda", correct: true, feedback: "Correcto. Lo viste: recortar la oferta empuja el medidor hacia el alza." },
              { id: "b", text: "Bajista: la OPEC+ pierde relevancia", correct: false, feedback: "Un recorte reduce la oferta; eso es presión alcista, no bajista." },
              { id: "c", text: "Ninguna: la producción no afecta el precio", correct: false, feedback: "La oferta física es uno de los motores del precio de una materia prima." },
              { id: "d", text: "Impredecible, sin dirección esperable", correct: false, feedback: "Un recorte confirmado tiene una dirección razonablemente clara: alcista." },
            ],
          },
          scene: {
            alt: "Puerto de Materias: muelles, barcos y tanques de crudo",
            backdrop: { image: "/assets/missions/m3o_1-oferta.webp" },
          },
        },
        passingScore: 66, virtualCapitalReward: 130,
      },
      rewards: { xp: 130, virtualCapital: 220 },
    },
    // ── MISIÓN 3O.2 — Refugio vs Cíclico ──
    {
      id: "m3o_2",
      order: 2,
      title: "Refugio vs Cíclico: Oro y Petróleo",
      subtitle: "La misma noticia, dos reacciones opuestas",
      description: "No todas las materias primas reaccionan igual al mismo contexto. En el laboratorio moverás tú mismo el ánimo del mercado entre risk-on y risk-off, y verás quién lidera — el oro (refugio) o el cobre (cíclico) — hasta inducir por qué el mismo titular los mueve en direcciones opuestas.",
      learningObjectives: [
        "Inducir, moviendo el contexto risk-on/risk-off, quién lidera entre oro y cobre",
        "Entender por qué el oro sube en contextos de aversión al riesgo (refugio)",
        "Entender por qué el cobre y el petróleo dependen del crecimiento económico (cíclicos)",
        "Reconocer al cobre como indicador adelantado de la salud económica ('Dr. Copper')",
      ],
      keyConcepts: ["activo refugio", "materia prima cíclica", "aversión al riesgo", "crecimiento económico", "Dr. Copper", "demanda industrial"],
      commodityConcepts: ["haven vs cyclical commodities", "risk-off gold demand", "copper as growth indicator"],
      referenceAssets: ["Oro", "Plata", "Petróleo WTI", "Cobre"],
      requiredMissions: ["m3o_1"],
      introDialogues: [
        { id: "m3o2_intro_1", character: "aria", type: "aria_message", text: "El oro y la plata suelen actuar como refugio: cuando el miedo domina el mercado, el capital busca protección en ellos. El petróleo y el cobre son cíclicos: su demanda depende de que las fábricas produzcan y la economía crezca." },
        { id: "m3o2_intro_2", character: "el_viejo_marco", type: "diary", text: "Los traders veteranos llaman al cobre 'Dr. Copper' — tiene un doctorado informal en economía. Cuando su precio cae con fuerza, suele anticipar preocupación real sobre el crecimiento global.", footnote: "— Entrada #6 desde Puerto de Materias" },
        { id: "m3o2_intro_3", character: "el_especulador", type: "enemy_taunt", text: "¿Refugio, cíclico? Todo sube o baja junto, no hay que complicarse tanto." },
        { id: "m3o2_intro_4", character: "aria", type: "warning", text: "El Especulador ignora que un mismo titular de crisis puede disparar el oro y hundir el cobre el mismo día — son respuestas a la misma noticia, pero desde ángulos opuestos." },
      ],
      outroDialogues: [
        { id: "m3o2_outro_1", character: "aria", type: "tip", text: "Lo viste con un solo control: al llevar el mercado al miedo (risk-off), el oro tomó la delantera; al llevarlo a la confianza (risk-on), fue el cobre. Antes de operar cualquier materia prima, pregúntate primero: ¿es refugio o cíclica? La misma noticia las mueve en direcciones opuestas." },
        { id: "m3o2_outro_2", character: "el_viejo_marco", type: "diary", text: "El oro no necesita que la economía vaya bien para subir. A veces sube precisamente porque va mal.", footnote: "— Entrada #9 desde Puerto de Materias" },
      ],
      quiz: [
        { id: "q_m3o2_01", difficulty: "basico", conceptEvaluated: "Oro como refugio", question: "¿Por qué el oro suele subir de precio durante episodios de fuerte aversión al riesgo en los mercados?", options: [
          { id: "a", text: "Porque las minas de oro producen menos durante las crisis", isCorrect: false, feedback: "La producción minera no cambia significativamente en el corto plazo por una crisis financiera." },
          { id: "b", text: "Porque los inversionistas buscan proteger capital en un activo percibido como reserva de valor, ajeno al sistema financiero tradicional", isCorrect: true, feedback: "Correcto. El oro ha sido históricamente percibido como refugio de valor en momentos de incertidumbre o pánico financiero." },
          { id: "c", text: "Porque el oro está correlacionado positivamente con las acciones tecnológicas", isCorrect: false, feedback: "El oro no tiene una correlación consistente y positiva con las acciones tecnológicas." },
          { id: "d", text: "Porque los bancos centrales prohíben la venta de oro en las crisis", isCorrect: false, feedback: "No existe tal prohibición generalizada durante episodios de aversión al riesgo." },
        ], explanation: "En momentos de pánico o incertidumbre, el capital tiende a buscar activos percibidos como reserva de valor y relativamente ajenos al sistema financiero — el oro ha cumplido históricamente ese rol." },
        { id: "q_m3o2_02", difficulty: "basico", conceptEvaluated: "Cobre como indicador cíclico", question: "¿Por qué se le llama 'Dr. Copper' al cobre entre los traders veteranos?", options: [
          { id: "a", text: "Porque fue descubierto por un médico", isCorrect: false, feedback: "El apodo no tiene relación con su origen o descubrimiento." },
          { id: "b", text: "Porque su demanda industrial amplia (construcción, electrónica, manufactura) hace que su precio a menudo anticipe la salud del crecimiento económico global", isCorrect: true, feedback: "Correcto. El cobre se usa en tantos sectores industriales que su precio suele reflejar expectativas reales sobre la actividad económica." },
          { id: "c", text: "Porque el cobre siempre se mueve igual que el oro", isCorrect: false, feedback: "El cobre y el oro suelen moverse de forma distinta, no igual — uno es cíclico y el otro es refugio." },
          { id: "d", text: "Porque solo los médicos pueden operar cobre legalmente", isCorrect: false, feedback: "No existe tal restricción — es un apodo informal sobre su valor como indicador económico." },
        ], explanation: "El cobre se utiliza en una enorme variedad de industrias. Cuando su precio cae con fuerza de forma sostenida, suele reflejar preocupación real sobre la demanda industrial global — de ahí el apodo informal 'Dr. Copper'." },
        { id: "q_m3o2_03", difficulty: "intermedio", conceptEvaluated: "Reacción divergente a la misma noticia", question: "Una noticia de fuerte incertidumbre geopolítica global provoca una caída generalizada en las bolsas mundiales. ¿Qué reacción es más probable en el oro y en el cobre respectivamente?", options: [
          { id: "a", text: "Ambos suben con fuerza por igual", isCorrect: false, feedback: "El oro y el cobre suelen reaccionar de forma distinta ante el mismo evento de aversión al riesgo." },
          { id: "b", text: "El oro tiende a subir (demanda de refugio), mientras el cobre tiende a caer (temor a menor crecimiento económico)", isCorrect: true, feedback: "Correcto. La misma noticia puede impulsar la demanda de refugio en el oro mientras deprime las expectativas de crecimiento que sostienen al cobre." },
          { id: "c", text: "Ambos caen con fuerza por igual", isCorrect: false, feedback: "El oro, como refugio, tiende a comportarse de forma distinta a un activo cíclico como el cobre en este contexto." },
          { id: "d", text: "Ninguno de los dos reacciona ante noticias geopolíticas", isCorrect: false, feedback: "Tanto el oro como el cobre suelen reaccionar ante eventos geopolíticos significativos, aunque en direcciones distintas." },
        ], explanation: "Un mismo evento de incertidumbre puede generar demanda de refugio (favoreciendo al oro) y simultáneamente temor a menor actividad económica (perjudicando al cobre) — direcciones opuestas desde la misma causa." },
        { id: "q_m3o2_04", difficulty: "avanzado", conceptEvaluated: "Clasificación aplicada", question: "El contexto de mercado muestra clara aversión al riesgo (risk-off). ¿Qué combinación de exposición tiene mejor lógica según lo aprendido?", options: [
          { id: "a", text: "Sobreponderar cobre y petróleo, ya que cualquier materia prima sube en tiempos de incertidumbre", isCorrect: false, feedback: "Los activos cíclicos como el cobre y el petróleo suelen sufrir, no beneficiarse, en contextos claros de risk-off." },
          { id: "b", text: "Favorecer refugios como oro o plata; ser cauteloso con cíclicos como cobre o petróleo, cuya demanda depende del crecimiento económico", isCorrect: true, feedback: "Correcto. El contexto de risk-off favorece la lógica de refugio y desfavorece la lógica cíclica/industrial." },
          { id: "c", text: "Ignorar la clasificación refugio/cíclico — no es relevante para la decisión", isCorrect: false, feedback: "La clasificación es precisamente la que permite anticipar reacciones divergentes ante el mismo contexto." },
          { id: "d", text: "Vender oro y comprar cobre, ya que ambos siempre se mueven igual", isCorrect: false, feedback: "Oro y cobre no se mueven igual — la premisa de la pregunta es incorrecta." },
        ], explanation: "En un contexto claro de aversión al riesgo, la lógica de refugio (oro, plata) suele verse favorecida, mientras que la lógica cíclica/industrial (cobre, petróleo) suele verse presionada por el temor a menor crecimiento económico." },
      ],
      minigame: {
        id: "mg_m3o2", type: "level_lab", title: "Refugio vs Cíclico",
        description: "Mueve el ánimo del mercado entre confianza (risk-on) y miedo (risk-off) y observa quién lidera: el oro o el cobre.",
        instructions: "El medidor se inclina a un lado u otro desde el centro. Explóralo y resuelve los retos.",
        config: {
          region: "meter",
          regionLabel: "¿Quién lidera: oro o cobre?",
          centered: true,
          roleName: "",
          inputs: [
            { key: "contexto", label: "Ánimo del mercado (−3 risk-on/confianza · +3 risk-off/miedo)", min: -3, max: 3, start: 0, accent: "#EAB308" },
          ],
          strength: { base: 0, weights: { contexto: 1 } },
          maxStrength: 3,
          strengthWords: [
            { min: -3, text: "Cobre lidera · cíclico (risk-on)", tone: "good" },
            { min: -1, text: "Sin líder claro", tone: "good" },
            { min: 1, text: "Oro lidera · refugio (risk-off)", tone: "good" },
          ],
          challenges: [
            { id: "c_m3o2_1", prompt: "Haz que el oro tome la delantera: lleva el mercado al miedo (risk-off).", compare: "gte", target: 2, successNote: "Risk-off: el capital busca refugio y el oro lidera. Su demanda no depende de que la economía crezca." },
            { id: "c_m3o2_2", prompt: "Ahora haz que el cobre lidere: lleva el mercado a la confianza (risk-on).", compare: "lte", target: -2, successNote: "Risk-on: con la economía en marcha, la demanda industrial del cobre (Dr. Copper) toma la delantera." },
          ],
          question: {
            prompt: "Una crisis geopolítica hunde las bolsas (risk-off). ¿Qué reacción es más probable en el oro y el cobre?",
            options: [
              { id: "a", text: "El oro tiende a subir (refugio) y el cobre a caer (temor a menor crecimiento)", correct: true, feedback: "Correcto. Lo viste: la misma noticia inclina el medidor hacia el oro y en contra del cobre." },
              { id: "b", text: "Ambos suben por igual", correct: false, feedback: "Reaccionan distinto: uno es refugio, el otro cíclico." },
              { id: "c", text: "Ambos caen por igual", correct: false, feedback: "El oro, como refugio, suele comportarse distinto a un cíclico en risk-off." },
              { id: "d", text: "Ninguno reacciona a la geopolítica", correct: false, feedback: "Ambos reaccionan, pero en direcciones opuestas." },
            ],
          },
          scene: {
            alt: "Puerto de Materias: lingotes de oro frente a bobinas de cobre",
            backdrop: { image: "/assets/missions/m3o_2-refugio.webp" },
          },
        },
        passingScore: 66, virtualCapitalReward: 150,
      },
      rewards: { xp: 145, virtualCapital: 250 },
    },
    // ── MISIÓN 3O.3 — El Dólar y las Materias Primas ──
    {
      id: "m3o_3",
      order: 3,
      title: "El Dólar y las Materias Primas",
      subtitle: "Casi todo lo que compras aquí se cotiza en la misma moneda",
      description: "La mayoría de las materias primas se cotizan en dólares. En el laboratorio moverás tú mismo la fuerza del dólar y un shock de oferta propio del activo, y verás en un medidor centrado cómo el dólar empuja el precio en sentido inverso — pero cómo un shock propio fuerte puede dominar por completo esa relación.",
      learningObjectives: [
        "Inducir la relación inversa entre la fuerza del dólar y el precio de una materia prima",
        "Descubrir que un shock de oferta propio del activo puede dominar sobre el efecto del dólar",
        "Usar el movimiento del dólar como contexto, no como certeza absoluta",
      ],
      keyConcepts: ["materias primas denominadas en dólares", "correlación inversa dólar-commodities", "índice del dólar (DXY)", "fundamentos propios del activo"],
      commodityConcepts: ["USD-denominated pricing", "inverse dollar correlation", "fundamentals overriding dollar effect"],
      referenceAssets: ["Oro", "Plata", "Petróleo WTI", "Cobre", "DXY (Índice del Dólar)"],
      requiredMissions: ["m3o_2"],
      introDialogues: [
        { id: "m3o3_intro_1", character: "el_viejo_marco", type: "diary", text: "Casi todo lo que se vende en Puerto de Materias se paga en la misma moneda: dólares. Eso significa que el dólar mismo es, en cierto modo, un participante silencioso en cada operación.", footnote: "— Entrada #12 desde Puerto de Materias" },
        { id: "m3o3_intro_2", character: "aria", type: "aria_message", text: "Cuando el dólar se debilita, se necesitan más dólares (devaluados) para comprar la misma cantidad de una materia prima — presión alcista en su precio expresado en dólares. Cuando el dólar se fortalece, ocurre lo contrario." },
        { id: "m3o3_intro_3", character: "la_señorita_fomo", type: "enemy_taunt", text: "¡El dólar se está debilitando! ¡Todas las materias primas van a dispararse, compra ya sin pensarlo!" },
        { id: "m3o3_intro_4", character: "aria", type: "warning", text: "La Señorita FOMO ignora que la relación con el dólar es real, pero no absoluta. Un evento de oferta propio del activo —como un recorte de producción o una sorpresa de inventarios— puede dominar por completo el efecto del dólar." },
      ],
      outroDialogues: [
        { id: "m3o3_outro_1", character: "aria", type: "tip", text: "Lo comprobaste tú: con el dólar fuerte fijo, un recorte de oferta propio bastó para dar vuelta el medidor y empujar la materia prima al alza. El dólar es una corriente de fondo; un shock de oferta directo y significativo es la ola que muchas veces decide. Úsalo como contexto, no como veto." },
        { id: "m3o3_outro_2", character: "el_viejo_marco", type: "diary", text: "El dólar es una corriente de fondo. Los fundamentos del activo son, muchas veces, la ola que realmente decide hacia dónde vas.", footnote: "— Entrada #15 desde Puerto de Materias" },
      ],
      quiz: [
        { id: "q_m3o3_01", difficulty: "basico", conceptEvaluated: "Relación inversa dólar-commodities", question: "El dólar estadounidense se debilita frente a otras divisas. En igualdad de otras condiciones, ¿qué presión ejerce esto sobre el precio del oro expresado en dólares?", options: [
          { id: "a", text: "Presión alcista — se necesitan más dólares devaluados para comprar la misma cantidad de oro", isCorrect: true, feedback: "Correcto. Un dólar más débil suele traducirse en precios más altos de materias primas expresados en esa misma moneda." },
          { id: "b", text: "Presión bajista — el oro pierde valor cuando el dólar se debilita", isCorrect: false, feedback: "La relación histórica suele ser la contraria: dólar débil, presión alcista sobre el oro en términos de dólares." },
          { id: "c", text: "Ningún efecto — el oro no tiene relación con el dólar", isCorrect: false, feedback: "El oro, al cotizarse en dólares, sí mantiene una relación relevante (aunque no absoluta) con la fortaleza del dólar." },
          { id: "d", text: "Un efecto aleatorio sin ninguna lógica esperable", isCorrect: false, feedback: "Existe una lógica esperable (relación inversa), aunque no se cumple de forma perfecta en todo momento." },
        ], explanation: "La mayoría de las materias primas se cotizan en dólares. Cuando el dólar se debilita frente a otras divisas, se requieren más dólares (ahora de menor poder adquisitivo relativo) para comprar la misma cantidad física del activo — presión alcista sobre su precio en dólares." },
        { id: "q_m3o3_02", difficulty: "intermedio", conceptEvaluated: "Cuándo los fundamentos dominan", question: "El dólar se está debilitando (lo que normalmente presionaría al petróleo al alza), pero simultáneamente la OPEC+ anuncia un aumento sorpresivo y significativo de producción. ¿Qué es más probable que domine el movimiento del precio del petróleo?", options: [
          { id: "a", text: "El efecto del dólar débil dominará siempre, sin excepción", isCorrect: false, feedback: "La relación con el dólar es real pero no absoluta — un evento de oferta propio y significativo puede dominar." },
          { id: "b", text: "El aumento sorpresivo de producción es un evento de oferta propio y significativo, con potencial de dominar sobre el efecto más general del dólar", isCorrect: true, feedback: "Correcto. Un shock de oferta directo y sorpresivo en el propio activo suele tener mayor peso que la correlación general con el dólar." },
          { id: "c", text: "Ambos efectos se anulan exactamente, sin movimiento neto", isCorrect: false, feedback: "No existe una relación matemática exacta que garantice una anulación perfecta entre ambos efectos." },
          { id: "d", text: "El dólar y la producción de petróleo no tienen ninguna relación entre sí", isCorrect: false, feedback: "Sí existe una relación relevante entre ambos factores, aunque no sea la única variable en juego." },
        ], explanation: "La correlación inversa con el dólar es un contexto general, no una ley determinista. Un evento de oferta propio, directo y significativo —como un aumento sorpresivo de producción de la OPEC+— puede dominar completamente el movimiento del precio, incluso en contra del efecto esperado del dólar." },
        { id: "q_m3o3_03", difficulty: "avanzado", conceptEvaluated: "Uso del dólar como contexto, no como certeza", question: "¿Cuál es la forma más prudente de usar el movimiento del dólar al analizar una materia prima?", options: [
          { id: "a", text: "Como la única señal necesaria, ignorando cualquier otro factor", isCorrect: false, feedback: "Ignorar los fundamentos propios del activo deja fuera información relevante que puede dominar el movimiento." },
          { id: "b", text: "Como una pieza más de contexto que se combina con los fundamentos propios del activo (oferta, demanda, eventos específicos)", isCorrect: true, feedback: "Correcto. El movimiento del dólar aporta contexto útil, pero debe combinarse con el análisis de los fundamentos propios de cada materia prima." },
          { id: "c", text: "Ignorarlo por completo — no tiene ninguna relación con las materias primas", isCorrect: false, feedback: "El dólar sí tiene una relación relevante con las materias primas, al ser la moneda de cotización de la mayoría de ellas." },
          { id: "d", text: "Usarlo solo para operar oro, nunca para otras materias primas", isCorrect: false, feedback: "La relación con el dólar aplica, en distintos grados, a la mayoría de las materias primas cotizadas en esa moneda, no solo al oro." },
        ], explanation: "El movimiento del dólar es una pieza de contexto útil pero no determinante por sí sola. La decisión más robusta combina la relación con el dólar con los fundamentos propios de la materia prima específica que se está analizando." },
      ],
      minigame: {
        id: "mg_m3o3", type: "level_lab", title: "El Dólar y el Shock Propio",
        description: "Mueve la fuerza del dólar y un shock de oferta propio del activo, y observa qué gana en el precio de la materia prima.",
        instructions: "El medidor crece a la derecha (sube) o a la izquierda (baja) desde el centro. Explora ambos controles y resuelve los retos.",
        config: {
          region: "meter",
          regionLabel: "Precio de la materia prima",
          centered: true,
          roleName: "",
          inputs: [
            { key: "dolar", label: "Fuerza del dólar (−3 débil · +3 fuerte)", min: -3, max: 3, start: 3, accent: "#38BDF8" },
            { key: "shock", label: "Shock de oferta propio (−3 más oferta · +3 recorte)", min: -3, max: 3, start: 0, accent: "#EAB308" },
          ],
          strength: { base: 0, weights: { dolar: -1, shock: 2 } },
          maxStrength: 9,
          strengthWords: [
            { min: -9, text: "Materia prima: baja", tone: "bad" },
            { min: -1, text: "Sin dirección clara", tone: "bad" },
            { min: 1, text: "Materia prima: sube", tone: "good" },
          ],
          challenges: [
            { id: "c_m3o3_1", prompt: "Sin shock propio, muestra la relación con el dólar: debilita el dólar y mira la materia prima subir.", lock: "shock", compare: "gte", target: 2, successNote: "Dólar débil → materia prima arriba: se necesitan más dólares devaluados para comprar lo mismo. Relación inversa." },
            { id: "c_m3o3_2", prompt: "Ahora el dólar queda fuerte y fijo: aplica un recorte de oferta propio y comprueba qué domina.", lock: "dolar", compare: "gte", target: 1, successNote: "Un recorte de oferta directo dominó al dólar fuerte y empujó el precio al alza. El shock propio pesa más que la correlación general." },
          ],
          question: {
            prompt: "El dólar se fortalece (presión bajista general) pero la OPEC+ recorta producción. ¿Qué es más probable que domine el petróleo?",
            options: [
              { id: "a", text: "El recorte: un shock de oferta directo y significativo puede dominar al efecto del dólar", correct: true, feedback: "Correcto. Lo viste: con el dólar fuerte fijo, el recorte dio vuelta el medidor al alza." },
              { id: "b", text: "El dólar fuerte domina siempre, sin excepción", correct: false, feedback: "La relación con el dólar es contexto, no una ley absoluta." },
              { id: "c", text: "Se anulan exactamente y no hay movimiento", correct: false, feedback: "No hay una anulación matemática garantizada entre ambos." },
              { id: "d", text: "El dólar no tiene relación con el petróleo", correct: false, feedback: "Sí la tiene: el petróleo se cotiza en dólares. Solo que un shock propio puede pesar más." },
            ],
          },
          scene: {
            alt: "Puerto de Materias: tablero del dólar frente a tanques de crudo",
            backdrop: { image: "/assets/missions/m3o_3-dolar.webp" },
          },
        },
        passingScore: 60, virtualCapitalReward: 140,
      },
      rewards: { xp: 150, virtualCapital: 250, badge: "lector_del_dolar" },
    },
    // ── MISIÓN 3O.4 — Estacionalidad en Materias Primas ──
    {
      id: "m3o_4",
      order: 4,
      title: "Estacionalidad en Materias Primas",
      subtitle: "El calendario también es un indicador",
      description: "Muchas materias primas siguen patrones estacionales ligados al clima y al calendario. En el laboratorio moverás tú mismo la estación del año, del verano al invierno, y verás subir la demanda de gas natural para calefacción — hasta inducir que el calendario también es un indicador.",
      learningObjectives: [
        "Inducir, moviendo la estación, por qué la demanda de gas natural sube en invierno",
        "Entender cómo la temporada de cosecha suele presionar a la baja el precio de productos agrícolas",
        "Distinguir un patrón estacional relevante de un período sin efecto estacional significativo",
      ],
      keyConcepts: ["estacionalidad", "demanda de calefacción", "temporada de manejo", "temporada de cosecha", "ciclo agrícola", "commodities agrícolas"],
      commodityConcepts: ["natural gas heating season", "harvest supply pressure", "seasonal demand patterns"],
      referenceAssets: ["Gas Natural", "Gasolina", "Maíz", "Soja"],
      requiredMissions: ["m3o_3"],
      introDialogues: [
        { id: "m3o4_intro_1", character: "aria", type: "aria_message", text: "Algunas materias primas tienen un calendario propio. El gas natural ve subir su demanda cada invierno, cuando millones de hogares lo usan para calefacción. La gasolina ve subir la suya en verano, con la temporada de manejo en Estados Unidos." },
        { id: "m3o4_intro_2", character: "el_viejo_marco", type: "diary", text: "En la temporada de cosecha, la oferta de maíz o soja se dispara de golpe. Más oferta disponible, con la misma demanda, suele presionar el precio a la baja — no por ninguna mala noticia, sino simplemente porque llegó la cosecha.", footnote: "— Entrada #18 desde Puerto de Materias" },
        { id: "m3o4_intro_3", character: "el_especulador", type: "enemy_taunt", text: "¿Estacionalidad? Yo compro cuando quiero, sin fijarme en el calendario. El mercado no le hace caso a las estaciones." },
        { id: "m3o4_intro_4", character: "aria", type: "warning", text: "El Especulador subestima un patrón que se repite año tras año con notable consistencia. Ignorar la estacionalidad no la vuelve irrelevante — solo te deja sin esa pieza de contexto." },
      ],
      outroDialogues: [
        { id: "m3o4_outro_1", character: "aria", type: "tip", text: "Lo viste al deslizar del verano al invierno: la demanda de gas se dispara por la calefacción. Lo mismo, al revés, ocurre en la cosecha del maíz — la oferta se dispara y presiona el precio a la baja. La estacionalidad no es una garantía, sino una tendencia histórica que se combina con el clima e inventarios del año en curso." },
        { id: "m3o4_outro_2", character: "el_viejo_marco", type: "diary", text: "El calendario no opera solo. Pero ignorarlo por completo es dejar pasar una pista que se repite, temporada tras temporada.", footnote: "— Entrada #21 desde Puerto de Materias" },
      ],
      quiz: [
        { id: "q_m3o4_01", difficulty: "basico", conceptEvaluated: "Estacionalidad del gas natural", question: "¿Por qué la demanda de gas natural suele aumentar en los meses de invierno en el hemisferio norte?", options: [
          { id: "a", text: "Porque las minas de gas natural cierran en verano", isCorrect: false, feedback: "El gas natural no se extrae de minas y su producción no se detiene estacionalmente por esa razón." },
          { id: "b", text: "Porque millones de hogares y negocios lo utilizan para calefacción durante el clima frío", isCorrect: true, feedback: "Correcto. La calefacción residencial y comercial es uno de los principales usos estacionales del gas natural." },
          { id: "c", text: "Porque el gas natural se vuelve ilegal de vender en verano", isCorrect: false, feedback: "No existe tal restricción legal estacional." },
          { id: "d", text: "Porque los precios de todas las materias primas suben en invierno por igual", isCorrect: false, feedback: "El patrón estacional invernal es específico del gas natural (y otros usos de calefacción), no un fenómeno generalizado a todas las materias primas." },
        ], explanation: "El gas natural se utiliza ampliamente para calefacción. Durante los meses fríos, la demanda residencial y comercial aumenta significativamente, generando presión estacional alcista sobre su precio." },
        { id: "q_m3o4_02", difficulty: "intermedio", conceptEvaluated: "Presión de oferta en cosecha", question: "Es temporada de cosecha de maíz en Estados Unidos. ¿Qué presión estacional es más probable sobre el precio, en igualdad de otras condiciones?", options: [
          { id: "a", text: "Presión alcista, porque la cosecha siempre genera escasez", isCorrect: false, feedback: "La cosecha aumenta la oferta disponible, no la reduce." },
          { id: "b", text: "Presión bajista, porque la oferta disponible aumenta de golpe con la misma demanda", isCorrect: true, feedback: "Correcto. Un aumento repentino de oferta, sin un cambio proporcional en la demanda, suele presionar el precio a la baja." },
          { id: "c", text: "Ningún efecto — la cosecha no afecta el precio del maíz", isCorrect: false, feedback: "La temporada de cosecha es uno de los eventos estacionales más relevantes para el precio de productos agrícolas." },
          { id: "d", text: "Un efecto completamente aleatorio, sin ninguna tendencia esperable", isCorrect: false, feedback: "Existe una tendencia estacional razonablemente consistente: más oferta disponible en cosecha, presión bajista." },
        ], explanation: "La temporada de cosecha incrementa bruscamente la oferta disponible de un producto agrícola. Sin un cambio proporcional en la demanda, esto suele generar presión bajista estacional sobre el precio." },
        { id: "q_m3o4_03", difficulty: "avanzado", conceptEvaluated: "Estacionalidad como contexto, no certeza", question: "¿Por qué la estacionalidad no debe tratarse como una garantía de movimiento de precio?", options: [
          { id: "a", text: "Porque nunca se repite de un año a otro, es completamente aleatoria", isCorrect: false, feedback: "Los patrones estacionales sí muestran una tendencia recurrente año tras año, aunque no sean perfectamente idénticos." },
          { id: "b", text: "Porque es una tendencia histórica que debe combinarse con el contexto específico del año en curso (clima real, inventarios, demanda económica)", isCorrect: true, feedback: "Correcto. La estacionalidad describe un patrón recurrente, pero factores específicos de cada año pueden reforzarlo o contrarrestarlo." },
          { id: "c", text: "Porque las materias primas agrícolas no tienen estacionalidad real", isCorrect: false, feedback: "Los productos agrícolas y de energía sí muestran patrones estacionales bien documentados." },
          { id: "d", text: "Porque solo aplica al petróleo, no a otras materias primas", isCorrect: false, feedback: "La estacionalidad aplica a distintas materias primas: energía (gas natural, gasolina) y productos agrícolas (maíz, soja, trigo), entre otros." },
        ], explanation: "La estacionalidad es una tendencia histórica recurrente, útil como contexto, pero no una garantía. El clima real de la temporada, los niveles de inventario actuales y la demanda económica del momento pueden reforzar o contrarrestar el patrón estacional esperado." },
      ],
      minigame: {
        id: "mg_m3o4", type: "level_lab", title: "El Calendario del Gas",
        description: "Mueve la estación del año, del verano al invierno, y observa cómo cambia la demanda estacional de gas natural.",
        instructions: "Explora el control de la estación y mira la etiqueta. Luego resuelve los retos llevándolo a cada extremo.",
        config: {
          region: "meter",
          regionLabel: "Demanda estacional de gas natural",
          thresholdAt: 4,
          roleName: "",
          inputs: [
            { key: "estacion", label: "Estación del año (0 verano · 6 pleno invierno)", min: 0, max: 6, start: 3, accent: "#EAB308" },
          ],
          strength: { base: 0, weights: { estacion: 1 } },
          maxStrength: 6,
          strengthWords: [
            { min: 0, text: "Verano · demanda de calefacción baja", tone: "good" },
            { min: 3, text: "Entrando en temporada", tone: "good" },
            { min: 5, text: "Pleno invierno · demanda alta, presión alcista", tone: "bad" },
          ],
          challenges: [
            { id: "c_m3o4_1", prompt: "Lleva el calendario al pleno invierno: dispara la demanda de calefacción.", compare: "gte", target: 5, successNote: "Invierno: millones de hogares calientan con gas. Más demanda con la misma oferta = presión alcista estacional." },
            { id: "c_m3o4_2", prompt: "Ahora al pleno verano: la demanda de calefacción cae al mínimo.", compare: "lte", target: 1, successNote: "Verano: casi no se usa gas para calefacción. Fuera de temporada, el efecto estacional se apaga." },
          ],
          question: {
            prompt: "¿Por qué la demanda de gas natural sube en invierno en el hemisferio norte?",
            options: [
              { id: "a", text: "Porque millones de hogares y negocios lo usan para calefacción con el frío", correct: true, feedback: "Correcto. Lo viste: al deslizar hacia el invierno, la demanda de calefacción dispara el medidor." },
              { id: "b", text: "Porque las minas de gas cierran en verano", correct: false, feedback: "El gas no se extrae de minas y su producción no se detiene así." },
              { id: "c", text: "Porque todas las materias primas suben en invierno por igual", correct: false, feedback: "El patrón invernal es específico del gas (calefacción), no general." },
              { id: "d", text: "Porque es ilegal venderlo en verano", correct: false, feedback: "No existe tal restricción; es una cuestión de demanda estacional." },
            ],
          },
          scene: {
            alt: "Puerto de Materias: terminal de gas natural con nieve",
            backdrop: { image: "/assets/missions/m3o_4-estacional.webp" },
          },
        },
        passingScore: 66, virtualCapitalReward: 150,
      },
      rewards: { xp: 155, virtualCapital: 260 },
    },
    // ── MISIÓN 3O.5 — El Gran Reto de Puerto de Materias (Boss Level 3) ──
    {
      id: "m3o_5",
      order: 5,
      title: "El Gran Reto de Puerto de Materias",
      subtitle: "Demuestra que puedes leer el mercado más físico del mundo",
      description: "Misión Boss del Nivel 3 Commodities. Integrarás el contexto de oferta/demanda física, la clasificación refugio/cíclico junto al dólar, y la gestión de riesgo en materias primas para construir y validar un plan de trading completo.",
      learningObjectives: [
        "Integrar contexto de oferta física, clasificación refugio/cíclico y correlación con el dólar en un análisis completo",
        "Tomar una decisión de trading fundamentada en materias primas",
        "Demostrar comprensión de los conceptos exclusivos del nivel 3 commodities",
      ],
      keyConcepts: ["síntesis nivel 3 commodities", "oferta física", "refugio vs cíclico", "correlación con el dólar", "gestión de riesgo en materias primas", "decisión fundamentada"],
      commodityConcepts: ["integración oferta + refugio/cíclico + dólar + sizing", "unit-based position sizing", "trade plan wizard"],
      referenceAssets: ["WTI Crudo", "Oro"],
      requiredMissions: ["m3o_4"],
      introDialogues: [
        { id: "m3o5_intro_1", character: "el_viejo_marco", type: "diary", text: "Puerto de Materias tiene su propia prueba final. No pregunta si memorizaste un dato de inventarios. Pregunta si puedes combinar oferta física, clasificación del activo y el contexto del dólar en una sola decisión.", footnote: "— Última entrada antes del Boss de Nivel 3 Commodities" },
        { id: "m3o5_intro_2", character: "aria", type: "aria_message", text: "Este reto integra todo el Nivel 3 Commodities: contexto de oferta física, clasificación refugio/cíclico junto al dólar, y cálculo de posición. Tendrás un escenario completo y deberás: 1) leer el contexto de oferta, 2) evaluar refugio/cíclico y dólar, 3) elegir la materia prima correcta, 4) trazar entrada con SL y TP, 5) calcular la posición." },
        { id: "m3o5_intro_3", character: "el_especulador", type: "enemy_taunt", text: "Esto está bien para un ejercicio de academia. En el mercado real, cuando el precio se mueve, nadie revisa inventarios, dólar y clasificación del activo antes de apretar el botón." },
        { id: "m3o5_intro_4", character: "el_viejo_marco", type: "diary", text: "El Especulador vuelve a tener razón en una cosa: el mercado no espera. Pero un trader que ya interiorizó este proceso no lo piensa paso a paso en el momento — lo reconoce de un vistazo, porque lo practicó aquí primero.", footnote: "— Respuesta al Especulador" },
      ],
      outroDialogues: [
        { id: "m3o5_outro_1", character: "aria", type: "aria_message", text: "Nivel 3 Commodities completado. Has demostrado que puedes operar el mercado más físico del mundo integrando oferta real, clasificación refugio/cíclico, contexto del dólar y gestión de riesgo." },
        { id: "m3o5_outro_2", character: "el_viejo_marco", type: "diary", text: "Puerto de Materias sigue recibiendo barcos, pase lo que pase en las pantallas. La diferencia entre quienes sobreviven aquí y quienes no: los primeros nunca olvidan que detrás del precio hay un mundo físico real.", footnote: "— Entrada Final del Nivel 3, Puerto de Materias" },
        { id: "m3o5_outro_3", character: "narrator", type: "diary", text: "Las grúas de Puerto de Materias siguen cargando y descargando, sin pausa. En algún lugar, una nueva ruta empieza a iluminarse." },
      ],
      quiz: [
        { id: "q_m3o5_01", difficulty: "avanzado", conceptEvaluated: "Integración: oferta + refugio/cíclico + dólar", question: "La OPEC+ anuncia un recorte de producción (presión alcista sobre el petróleo). El dólar se está fortaleciendo (presión bajista sobre materias primas en general). Ya tienes oro (refugio) en cartera. ¿Cuál es la lectura más completa para el petróleo?", options: [
          { id: "a", text: "El dólar fuerte domina siempre — el petróleo caerá sin excepción", isCorrect: false, feedback: "La relación con el dólar es contexto, no una ley absoluta — un shock de oferta directo puede dominarla." },
          { id: "b", text: "El recorte de producción es un evento de oferta directo y significativo, que puede dominar sobre el efecto más general del dólar fuerte — sesgo alcista, con el dólar como factor a vigilar, no como veto", isCorrect: true, feedback: "Correcto. Un shock de oferta directo y confirmado suele pesar más que la correlación general con el dólar." },
          { id: "c", text: "Ambos efectos se anulan exactamente y el petróleo no se moverá", isCorrect: false, feedback: "No existe una relación matemática exacta que garantice una anulación perfecta entre ambos factores." },
          { id: "d", text: "El oro en cartera hace que el petróleo sea irrelevante para el análisis", isCorrect: false, feedback: "Tener oro en cartera no vuelve irrelevante el análisis del petróleo — son activos con lógicas distintas (refugio vs. cíclico)." },
        ], explanation: "Un recorte de producción confirmado es un evento de oferta directo con alto peso. El dólar fuerte es un contexto general que puede matizar, pero no necesariamente anular, la señal de oferta. La lectura más completa mantiene sesgo alcista, vigilando el dólar como factor adicional." },
        { id: "q_m3o5_02", difficulty: "avanzado", conceptEvaluated: "Position sizing en materias primas", question: "Capital $3,200, riesgo 2% ($64). Entrada en petróleo WTI a $83, Stop Loss en $79 (riesgo de $4 por unidad). ¿Cuántas unidades puedes operar?", options: [
          { id: "a", text: "16 unidades", isCorrect: true, feedback: "Correcto. $64 ÷ $4 por unidad = 16 unidades." },
          { id: "b", text: "64 unidades", isCorrect: false, feedback: "Eso arriesgaría $256 — cuatro veces el límite de riesgo permitido." },
          { id: "c", text: "4 unidades", isCorrect: false, feedback: "Ese tamaño es menor al que realmente permite el riesgo calculado ($64 ÷ $4 = 16)." },
          { id: "d", text: "0.25 unidades", isCorrect: false, feedback: "El resultado del cálculo es el número de unidades, no una fracción en este contexto." },
        ], explanation: "Riesgo por unidad = $83 − $79 = $4. Unidades = riesgo máximo ÷ riesgo por unidad = $64 ÷ $4 = 16 unidades." },
        { id: "q_m3o5_03", difficulty: "avanzado", conceptEvaluated: "Elegir la materia prima correcta dado el contexto", question: "Ya tienes oro (refugio) en cartera. El contexto muestra un shock de oferta alcista confirmado en petróleo (cíclico) y, por separado, una señal técnica ambigua en plata (refugio, correlacionado con el oro). ¿Cuál añade menos riesgo no gestionado a tu cartera?", options: [
          { id: "a", text: "Plata, porque es del mismo 'tipo' de activo que el oro y por lo tanto más fácil de analizar", isCorrect: false, feedback: "Ser del mismo tipo (refugio) generalmente implica mayor correlación con el oro ya en cartera, no menor riesgo." },
          { id: "b", text: "Petróleo, porque tiene un catalizador de oferta confirmado y, al ser cíclico en vez de refugio, no concentra el mismo tipo de riesgo que ya tienes con el oro", isCorrect: true, feedback: "Correcto. Un catalizador confirmado y una clasificación distinta (cíclico vs. refugio) reduce la concentración de riesgo respecto a la posición ya abierta." },
          { id: "c", text: "Ambas opciones son equivalentes — el tipo de activo no importa si hay una señal técnica", isCorrect: false, feedback: "El tipo de activo (refugio vs. cíclico) sí importa para evaluar la concentración de riesgo frente a una posición ya abierta." },
          { id: "d", text: "Ninguna — se debe evitar cualquier nueva posición mientras haya oro en cartera", isCorrect: false, feedback: "Es una reacción desproporcionada; el objetivo es gestionar el riesgo de concentración, no evitar cualquier nueva posición." },
        ], explanation: "Sumar plata (refugio, correlacionada con el oro) concentraría el mismo tipo de riesgo. El petróleo, con un catalizador de oferta confirmado y una clasificación distinta (cíclico), diversifica mejor la exposición respecto a la posición de oro ya abierta." },
      ],
      minigame: {
        id: "mg_m3o5", type: "commodity_trade_plan_wizard", title: "El Plan de Trading Integrado",
        description: "Escenario completo: recibe el contexto de oferta, refugio/cíclico y dólar, y construye un plan de trading en 5 pasos.",
        instructions: "Contexto: la OPEC+ recorta producción, el dólar se está debilitando, ya tienes oro (refugio) en cartera. Completa: 1) lectura del contexto de oferta, 2) evaluación refugio/cíclico y dólar, 3) elección de la materia prima a operar, 4) entrada+SL+TP con R:R 1:2 mínimo, 5) tamaño de posición al 2% con $3,200.",
        config: {
          scenario: {
            supplyContext: "opec_recorte_produccion",
            dollarContext: "dolar_debilitando",
            currentHolding: "Ya tienes oro (refugio) en cartera",
            commodityToTrade: "WTI Crudo",
            entryZoneLow: 82,
            entryZoneHigh: 84,
          },
          steps: 5, passingSteps: 4, capital: 3200, minRR: 2, maxRisk: 0.02,
        },
        passingScore: 80, virtualCapitalReward: 380,
      },
      rewards: { xp: 245, virtualCapital: 560, badge: "ciudadano_de_puerto_de_materias" },
    },
  ],
}

// ─── HELPERS ─────────────────────────────────────────────────

/** Retorna una misión del nivel 3 commodities por su id */
export function getLevel3CommoditiesMissionById(missionId: string): Level3CommoditiesMission | undefined {
  return level3Commodities.missions.find((m) => m.id === missionId)
}

/** Retorna todas las preguntas del nivel 3 commodities en array plano */
export function getAllLevel3CommoditiesQuestions(): QuizQuestion[] {
  return level3Commodities.missions.flatMap((m) => m.quiz)
}

/** Retorna los conceptos commodities únicos de todo el nivel */
export function getAllCommodityConcepts(): string[] {
  return Array.from(new Set(level3Commodities.missions.flatMap((m) => m.commodityConcepts)))
}

/** Retorna los activos de referencia únicos del nivel */
export function getAllReferenceAssets(): string[] {
  return Array.from(new Set(level3Commodities.missions.flatMap((m) => m.referenceAssets)))
}

/** Calcula XP total del nivel 3 commodities */
export function getTotalLevel3CommoditiesXP(): number {
  return level3Commodities.missions.reduce((acc, m) => acc + m.rewards.xp, 0)
}

/** Calcula el capital virtual acumulable en el nivel */
export function getTotalLevel3CommoditiesCapitalRewards(): number {
  return level3Commodities.missions.reduce((acc, m) => {
    const missionCapital = m.rewards.virtualCapital
    const minigameCapital = m.minigame?.virtualCapitalReward ?? 0
    return acc + missionCapital + minigameCapital
  }, 0)
}

export default level3Commodities
