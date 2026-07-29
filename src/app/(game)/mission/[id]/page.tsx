"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMissionById } from "@/lib/content/level1";
import { getLevel2MissionById } from "@/lib/content/level2";
import { getLevel3CryptoMissionById } from "@/lib/content/level3-crypto";
import { getLevel3ForexMissionById } from "@/lib/content/level3-forex";
import { getLevel3StocksMissionById } from "@/lib/content/level3-stocks";
import { getLevel3CommoditiesMissionById } from "@/lib/content/level3-commodities";
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
      title: "El Medidor de Riesgo Cripto",
      learningObjective: "Descubrir, moviendo tú los controles, qué mantiene tu pérdida máxima bajo control en un mercado que nunca cierra.",
      conceptExplanation: "Tienes un capital fijo y dos mandos: el tamaño de la posición y la distancia del Stop Loss. Un medidor te muestra en vivo cuánto de tu capital pones en juego. Nadie te da la fórmula: la vas a ver subir y bajar en el medidor.",
      practicalExample: "Prueba: sube las unidades y mira el medidor cruzar la línea del 2%. Baja el stop y mira otra vez. En el segundo reto el stop queda bloqueado — ahí verás qué te queda para controlar el riesgo.",
      stepByStepInstructions: [
        "Mueve el tamaño de la posición y observa el medidor.",
        "Mueve la distancia del Stop Loss y observa el medidor.",
        "Reto 1: baja tu pérdida al 2% del capital o menos.",
        "Reto 2: con el stop bloqueado, vuelve a bajar al 2% — solo con las unidades.",
        "Responde qué mantiene tu pérdida máxima bajo control.",
      ],
      commonMistakes: ["Creer que un stop más lejano es más seguro — en el medidor SUBE el riesgo.", "Operar sin ajustar el tamaño de posición a la volatilidad crypto."],
      hint: "El riesgo nace de dos cosas a la vez: cuántas unidades llevas y qué tan lejos está el stop. Con el stop fijo, ¿qué te queda?",
    },
    m3c_2: {
      title: "El Reparto del Mercado",
      learningObjective: "Descubrir, moviendo tú la dominancia, hacia dónde rota el capital entre Bitcoin y las altcoins.",
      conceptExplanation: "Tienes un control: la dominancia de BTC. La barra del mercado se reparte sola entre Bitcoin y las altcoins, y una etiqueta aparece según lo que hagas. No te doy la regla: la vas a ver en la barra.",
      practicalExample: "Prueba: baja la dominancia y mira cómo la barra deja espacio a las altcoins. Súbela y mira cómo BTC se come el mercado. ¿Hacia dónde va el capital en cada caso?",
      stepByStepInstructions: [
        "Mueve la dominancia y observa la barra y su etiqueta.",
        "Reto 1: haz que las altcoins ganen terreno (dominancia abajo).",
        "Reto 2: haz que Bitcoin concentre el capital (dominancia arriba).",
        "Responde qué sugiere una dominancia que baja de forma sostenida.",
      ],
      commonMistakes: ["Confundir dominancia con precio — mide reparto del market cap, no cuánto vale BTC.", "Comprar una altcoin solo porque su precio unitario es bajo."],
      hint: "La barra es cuánto del mercado es BTC. Lo que queda, es de las altcoins. ¿Qué pasa con ese hueco al bajar la dominancia?",
    },
    m3c_3: {
      title: "El Termómetro del Mercado",
      learningObjective: "Descubrir, llevándolo tú a los extremos, por qué el miedo extremo y la codicia extrema suelen marcar suelos y techos.",
      conceptExplanation: "Tienes un termómetro de sentimiento (Fear & Greed) de 0 a 100. Las zonas — miedo extremo, miedo, codicia, codicia extrema — emergen solas según dónde lo pongas. Nadie te dice dónde están los giros: los vas a encontrar tú.",
      practicalExample: "Prueba: baja el termómetro al fondo (pánico) y lee la zona. Súbelo al tope (euforia) y lee otra vez. Piensa: en cada extremo, ¿quién queda para seguir vendiendo o comprando?",
      stepByStepInstructions: [
        "Mueve el termómetro y observa las zonas que emergen.",
        "Reto 1: lleva el mercado al miedo extremo (suelo histórico).",
        "Reto 2: lleva el mercado a la codicia extrema (techo histórico).",
        "Responde por qué la codicia extrema es precaución y no compra.",
      ],
      commonMistakes: ["Comprar en euforia porque 'todos están comprando'.", "Vender en pánico porque 'todos están vendiendo'.", "Pensar que 'esta vez es diferente'."],
      hint: "En los extremos el sentimiento funciona al revés de lo que grita. Si casi todos ya compraron, ¿quién queda para subir el precio?",
    },
    m3c_4: {
      title: "El Stop contra el Ruido",
      learningObjective: "Descubrir, moviendo tú la volatilidad y el stop, por qué un stop más pequeño que el ruido diario se ejecuta solo.",
      conceptExplanation: "Tienes dos mandos: la volatilidad diaria (ATR) y tu Stop Loss. Un medidor muestra el margen de tu stop sobre el ruido. Cuando el margen desaparece, la etiqueta te avisa: 'te barren'. No te doy la regla: la vas a ver.",
      practicalExample: "Prueba: sube el stop y mira crecer el margen ('aguanta'). Ahora sube la volatilidad con el stop fijo y mira el margen desaparecer ('dentro del ruido'). Ese es el momento clave.",
      stepByStepInstructions: [
        "Mueve el stop y la volatilidad y observa el margen en el medidor.",
        "Reto 1: con la volatilidad fija, dale a tu stop margen para aguantar.",
        "Reto 2: con el stop fijo, sube la volatilidad hasta que quede dentro del ruido.",
        "Responde qué pasa si sube el ATR y no cambias tu stop.",
      ],
      commonMistakes: ["Usar un stop 'pequeño' sin mirar el ATR — se ejecuta por ruido normal.", "Confundir un ATR mayor con una señal de dirección: solo mide cuánto se mueve."],
      hint: "No hay stop grande o pequeño en abstracto: solo con margen sobre el ATR o sin él. ¿Qué pasa con ese margen al subir la volatilidad?",
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
      title: "El Reloj de las Sesiones",
      learningObjective: "Descubrir, abriendo y cerrando sesiones, por qué el solapamiento de Londres y Nueva York concentra la liquidez.",
      conceptExplanation: "Tienes dos controles: la sesión de Londres y la de Nueva York (0 cerrada, 1 abierta). Un medidor muestra la liquidez del mercado y una etiqueta emerge según cuántas sesiones abras. Nadie te da la regla: la vas a ver en el medidor.",
      practicalExample: "Prueba: abre solo Londres y mira el medidor. Abre también Nueva York y mira el salto. Ciérralas ambas y observa el mercado dormido. ¿Cuándo hay más gente operando a la vez?",
      stepByStepInstructions: [
        "Mueve cada sesión (0/1) y observa la liquidez y su etiqueta.",
        "Reto 1: abre el overlap (Londres y Nueva York a la vez).",
        "Reto 2: muestra el mercado más dormido (ambas cerradas).",
        "Responde por qué el overlap concentra la mayor liquidez.",
      ],
      commonMistakes: ["Asumir que forex opera igual que crypto, sin sesiones.", "Ignorar el ensanchamiento de spread en horarios de baja liquidez."],
      hint: "La liquidez no es la dirección — es cuánta gente opera a la vez. ¿Qué pasa con dos grandes sesiones abiertas?",
    },
    m3f_2: {
      title: "El Medidor de Lotes",
      learningObjective: "Descubrir, moviendo lotes y pérdida por lote, qué fija tu riesgo real — y por qué el apalancamiento no lo cambia.",
      conceptExplanation: "Tienes dos mandos: cuántos mini-lotes llevas y cuánto pierde cada uno si salta el Stop Loss. Un medidor muestra el % de tu capital en riesgo. Nadie te da la fórmula: la vas a ver subir y bajar.",
      practicalExample: "Prueba: sube los lotes y mira el medidor cruzar el 2%. En el segundo reto la pérdida por lote queda fija — ahí verás que solo el número de lotes controla tu riesgo.",
      stepByStepInstructions: [
        "Mueve los mini-lotes y observa el medidor.",
        "Mueve la pérdida por lote y observa el medidor.",
        "Reto 1: baja tu pérdida al 2% del capital o menos.",
        "Reto 2: con la pérdida por lote bloqueada, vuelve al 2% solo con los lotes.",
        "Responde qué le pasa a tu riesgo si sube el apalancamiento.",
      ],
      commonMistakes: ["Confundir el apalancamiento disponible con el tamaño de posición recomendado.", "Creer que más apalancamiento significa más riesgo por sí solo."],
      hint: "El apalancamiento cambia el margen para abrir, no cuánto pierdes si salta el stop. ¿Qué controla ese medidor?",
    },
    m3f_3: {
      title: "El Tablero de Correlaciones",
      learningObjective: "Descubrir, moviendo el coeficiente, cuándo dos pares son la misma apuesta duplicada y cuándo se compensan.",
      conceptExplanation: "Tienes un control: el coeficiente de correlación, de -1 a +1. El medidor crece desde el centro — a la derecha si es positiva, a la izquierda si es negativa — y la etiqueta de la relación emerge sola. No te doy la regla: la vas a ver.",
      practicalExample: "Prueba: llévalo cerca de +1 y lee 'misma apuesta duplicada'. Llévalo cerca de -1 y lee 'se compensan'. Déjalo en el centro y mira 'casi independientes'.",
      stepByStepInstructions: [
        "Mueve el coeficiente y observa el medidor centrado y su etiqueta.",
        "Reto 1: llévalo a correlación positiva fuerte (misma apuesta duplicada).",
        "Reto 2: llévalo a correlación negativa fuerte (se compensan).",
        "Responde qué pasa al abrir tres pares con correlación positiva fuerte.",
      ],
      commonMistakes: ["Pensar que operar varios pares siempre diversifica el riesgo.", "Tratar la correlación como una ley fija en vez de una tendencia estadística."],
      hint: "Cerca de +1, dos pares son una sola apuesta; cerca de -1, se anulan. El centro es 'sin relación'.",
    },
    m3f_4: {
      title: "El Planificador de Noticias",
      learningObjective: "Descubrir, moviendo impacto y cercanía, cuándo el momento se vuelve peligroso para operar.",
      conceptExplanation: "Tienes dos controles: el impacto del evento y su cercanía en el tiempo. Un medidor muestra el peligro del momento. Verás que ni el impacto solo ni la cercanía sola lo disparan — se disparan juntos.",
      practicalExample: "Prueba: sube el impacto con la noticia lejana y mira el medidor. Ahora acerca la noticia con impacto alto y mira el salto a 'peligro'. Baja ambos y vuelve a 'opera normal'.",
      stepByStepInstructions: [
        "Mueve impacto y cercanía y observa el peligro del momento.",
        "Reto 1: dibuja el momento más peligroso (alto impacto e inminente).",
        "Reto 2: dibuja un momento tranquilo (bajo impacto y lejano).",
        "Responde cuándo un evento vuelve peligroso el momento de operar.",
      ],
      commonMistakes: ["Abrir posiciones nuevas justo antes de un evento de alto impacto.", "Dejar un Stop Loss muy ajustado sin revisar el calendario económico."],
      hint: "El calendario no predice la dirección — predice cuándo el mercado puede volverse errático. ¿Qué dos cosas juntas suben el peligro?",
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
      title: "El Mapa de Capitalización",
      learningObjective: "Descubrir, moviendo la capitalización, cómo cambian la liquidez y la volatilidad esperada de una empresa.",
      conceptExplanation: "Tienes un control: la capitalización de mercado de una empresa. Una etiqueta emerge sola — small, mid o large cap — con lo que implica en liquidez y volatilidad. No te doy la regla: la vas a ver en el medidor.",
      practicalExample: "Prueba: baja la capitalización al fondo y lee 'small cap · volátil'. Súbela al tope y lee 'large cap · líquida y estable'. El tamaño no es solo una etiqueta.",
      stepByStepInstructions: [
        "Mueve la capitalización y observa la categoría y su etiqueta.",
        "Reto 1: muestra una small cap (por debajo de $2,000M).",
        "Reto 2: muestra una large cap (por encima de $10,000M).",
        "Responde qué distingue a una large cap de una small cap.",
      ],
      commonMistakes: ["Confundir el precio por acción con la capitalización total.", "Asumir que una acción con precio bajo es necesariamente small cap."],
      hint: "Capitalización = precio × acciones en circulación. ¿Qué le pasa a la liquidez y la volatilidad al crecer la empresa?",
    },
    m3s_2: {
      title: "El Reporte de Resultados",
      learningObjective: "Descubrir, moviendo la sorpresa y la guía, qué mueve realmente el precio tras un reporte.",
      conceptExplanation: "Tienes dos controles: la sorpresa en las ganancias (beat/miss) y la guía a futuro. Un medidor centrado muestra la reacción esperada del precio. Verás que un buen resultado no basta si la guía decepciona.",
      practicalExample: "Prueba: sube el EPS a un beat con guía al alza y mira la reacción alcista. Ahora deja el beat pero baja la guía y mira cómo la reacción se apaga hacia lo mixto o negativo.",
      stepByStepInstructions: [
        "Mueve la sorpresa en EPS y la guía y observa el medidor centrado.",
        "Reto 1: dibuja la reacción más alcista (beat + guía al alza).",
        "Reto 2: con el EPS fijo en beat, baja solo la guía y mira qué pasa.",
        "Responde qué reacción da un beat con guía a la baja.",
      ],
      commonMistakes: ["Abrir una posición nueva justo antes de un reporte pendiente.", "Suponer que un buen EPS garantiza una reacción alcista sin revisar la guía."],
      hint: "El precio reacciona a la SORPRESA respecto a lo esperado, y el mercado mira hacia adelante: la guía pesa mucho.",
    },
    m3s_3: {
      title: "¿Ajuste o Señal Real?",
      learningObjective: "Descubrir que un split o un ajuste ex-dividendo no cambian tu valor real — solo lo hace una noticia sobre los fundamentales.",
      conceptExplanation: "Tienes dos controles: el ajuste técnico (split / ex-dividendo) y el cambio en los fundamentales. Un medidor muestra tu valor real. Vas a comprobar que uno de los dos controles no lo mueve en absoluto.",
      practicalExample: "Prueba: mueve el ajuste técnico al máximo y observa que el medidor no se mueve. Ahora mueve los fundamentales y míralo reaccionar. Esa es la diferencia entre aritmética y valor.",
      stepByStepInstructions: [
        "Mueve el ajuste técnico al máximo y observa que el valor real no cambia.",
        "Mueve los fundamentales y observa cómo sí reacciona.",
        "Reto 1: sube tu valor real de verdad. Reto 2: hazlo caer.",
        "Responde qué le pasa a tu valor cuando la acción hace un split 2:1.",
      ],
      commonMistakes: ["Pensar que un split hace la acción 'más barata' en términos reales.", "Confundir un ajuste técnico ex-dividendo con una señal bajista real."],
      hint: "Pregúntate: ¿este evento cambia el valor total de la empresa, o solo la forma en que se representa?",
    },
    m3s_4: {
      title: "El Indicador de Beta",
      learningObjective: "Descubrir, moviendo el beta, cuánto amplifica un sector los movimientos del mercado.",
      conceptExplanation: "Tienes un control: el beta de un sector. Un medidor muestra su amplificación respecto al mercado, con una línea en el beta 1.0. Las etiquetas — defensivo, neutral, cíclico — emergen solas. No te doy la regla: la vas a ver.",
      practicalExample: "Prueba: baja el beta muy por debajo de 1.0 y lee 'defensivo · aguanta las caídas'. Súbelo muy por encima y lee 'cíclico · amplifica'. Un beta alto amplifica en ambos sentidos.",
      stepByStepInstructions: [
        "Mueve el beta y observa la amplificación y su etiqueta.",
        "Reto 1: muestra un sector defensivo (beta muy bajo).",
        "Reto 2: muestra un sector cíclico (beta muy alto).",
        "Responde qué sugiere un beta de 1.5 si el mercado sube 10%.",
      ],
      commonMistakes: ["Perseguir siempre el sector de mayor beta sin importar el contexto económico.", "Olvidar que un beta alto también amplifica las caídas."],
      hint: "Beta alto amplifica al mercado en ambos sentidos; beta bajo lo amortigua. La línea marca el beta 1.0 (igual al mercado).",
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
    // ─── NIVEL 3 COMMODITIES TUTORIALS ───
    m3o_1: {
      title: "El Balance Físico",
      learningObjective: "Descubrir, moviendo oferta y demanda física, hacia dónde presiona el precio de una materia prima.",
      conceptExplanation: "Tienes dos controles: el cambio en la oferta física (un recorte o un aumento de producción) y el cambio en la demanda. Un medidor centrado muestra la presión sobre el precio. No te doy la regla: la vas a ver.",
      practicalExample: "Prueba: recorta la oferta (como un recorte de la OPEC+) y mira el medidor inclinarse al alza. Ahora inunda el mercado de oferta y míralo caer.",
      stepByStepInstructions: [
        "Mueve la oferta y la demanda y observa la presión en el medidor centrado.",
        "Reto 1: provoca presión alcista (recorta la oferta o sube la demanda).",
        "Reto 2: provoca presión bajista (inunda de oferta o hunde la demanda).",
        "Responde qué presión ejerce un recorte de producción de la OPEC+.",
      ],
      commonMistakes: ["Reaccionar a un evento de final incierto (como un huracán en curso) como si tuviera dirección clara.", "Olvidar que la sorpresa respecto a lo esperado mueve el precio, no el dato en bruto."],
      hint: "Menos oferta o más demanda empuja al alza; más oferta o menos demanda, a la baja. ¿Dónde queda el recorte de la OPEC+?",
    },
    m3o_2: {
      title: "Refugio vs Cíclico",
      learningObjective: "Descubrir, moviendo el ánimo del mercado, quién lidera entre el oro (refugio) y el cobre (cíclico).",
      conceptExplanation: "Tienes un control: el ánimo del mercado, de la confianza (risk-on) al miedo (risk-off). El medidor se inclina hacia el oro o hacia el cobre. La misma noticia los mueve en direcciones opuestas — lo vas a ver.",
      practicalExample: "Prueba: lleva el mercado al miedo (risk-off) y mira al oro tomar la delantera. Llévalo a la confianza (risk-on) y mira al cobre liderar.",
      stepByStepInstructions: [
        "Mueve el ánimo del mercado y observa quién lidera en el medidor.",
        "Reto 1: haz que el oro lidere (lleva el mercado al miedo).",
        "Reto 2: haz que el cobre lidere (lleva el mercado a la confianza).",
        "Responde qué pasa con oro y cobre en una crisis (risk-off).",
      ],
      commonMistakes: ["Asumir que todas las materias primas suben o bajan juntas.", "Olvidar que el cobre ('Dr. Copper') depende del crecimiento económico."],
      hint: "El oro no necesita que la economía vaya bien para subir; el cobre sí. ¿Qué lado gana con el miedo?",
    },
    m3o_3: {
      title: "El Dólar y el Shock Propio",
      learningObjective: "Descubrir la relación inversa del dólar con las materias primas — y cómo un shock de oferta propio puede dominarla.",
      conceptExplanation: "Tienes dos controles: la fuerza del dólar y un shock de oferta propio del activo. El medidor centrado muestra el precio de la materia prima. Verás que el dólar la empuja en sentido inverso, pero que un shock propio fuerte puede dar vuelta el resultado.",
      practicalExample: "Prueba: sin shock propio, debilita el dólar y mira la materia prima subir. Ahora deja el dólar fuerte y fijo, aplica un recorte de oferta y mira cómo domina.",
      stepByStepInstructions: [
        "Mueve el dólar y el shock propio y observa el medidor centrado.",
        "Reto 1: con el shock fijo en cero, debilita el dólar y mira la materia prima subir.",
        "Reto 2: con el dólar fuerte y fijo, aplica un recorte de oferta y comprueba qué domina.",
        "Responde qué domina si el dólar sube pero la OPEC+ recorta.",
      ],
      commonMistakes: ["Tratar la correlación con el dólar como una ley absoluta.", "Ignorar los fundamentos propios del activo (oferta, inventarios, eventos)."],
      hint: "El dólar es la corriente de fondo; un shock de oferta directo es la ola que muchas veces decide.",
    },
    m3o_4: {
      title: "El Calendario del Gas",
      learningObjective: "Descubrir, moviendo la estación del año, por qué la demanda de gas natural sube en invierno.",
      conceptExplanation: "Tienes un control: la estación del año, del verano al invierno. Un medidor muestra la demanda estacional de gas natural. La etiqueta emerge sola. No te doy la regla: la vas a ver en el calendario.",
      practicalExample: "Prueba: desliza hacia el pleno invierno y mira la demanda de calefacción dispararse. Vuelve al verano y mírala caer al mínimo.",
      stepByStepInstructions: [
        "Mueve la estación y observa la demanda estacional en el medidor.",
        "Reto 1: lleva el calendario al pleno invierno (demanda alta).",
        "Reto 2: llévalo al pleno verano (demanda mínima).",
        "Responde por qué sube la demanda de gas natural en invierno.",
      ],
      commonMistakes: ["Ignorar la estacionalidad por creer que 'el mercado no le hace caso al calendario'.", "Tratar la estacionalidad como una garantía en vez de una tendencia histórica."],
      hint: "El gas se usa para calefacción. ¿Qué estación dispara esa demanda? La cosecha hace lo inverso con la oferta agrícola.",
    },
    m3o_5: {
      title: "Plan de Trading Integrado — Commodities",
      learningObjective: "Combinar contexto de oferta física, clasificación refugio/cíclico y correlación con el dólar en un plan de trading completo.",
      conceptExplanation: "Un plan de materias primas completo integra: 1) Contexto de oferta física (¿hay un shock de oferta con dirección clara?), 2) Clasificación refugio/cíclico y el dólar (¿el activo es refugio o cíclico? ¿el dólar ayuda o frena?), 3) Elección de la materia prima correcta, 4) Entrada + SL + TP con ratio mínimo, 5) Tamaño de posición al riesgo máximo permitido.",
      practicalExample: "La OPEC+ recorta producción + dólar debilitándose + ya tienes oro (refugio) → el petróleo (cíclico, con catalizador de oferta confirmado) diversifica mejor; traza entrada + SL + TP y calcula el tamaño al 2% de $3,200.",
      stepByStepInstructions: [
        "Lee el contexto de oferta física (¿shock con dirección clara?).",
        "Evalúa la clasificación refugio/cíclico del activo y el efecto del dólar.",
        "Elige la materia prima que no duplica el riesgo ya asumido.",
        "Traza entrada + SL + TP con el ratio mínimo indicado.",
        "Calcula el tamaño de posición al riesgo máximo permitido.",
      ],
      commonMistakes: ["Sumar un activo del mismo tipo (otro refugio) al que ya tienes en cartera.", "Tratar el dólar como un veto en vez de un factor de contexto."],
      hint: "Sigue la secuencia: oferta → refugio/cíclico + dólar → activo → entrada/SL/TP → tamaño. Si falta un paso, no operes.",
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
  if (levelId === "level_3_commodities") return "Nivel 3 — Commodities";
  return "Nivel";
}

export default function MissionPage() {
  const params = useParams();
  const router = useRouter();
  const hasMounted = useHasMounted();
  const missionId = params.id as string;

  const { isMissionCompleted, isMissionUnlocked, completeMission } = useGameStore();

  // Find mission in all levels
  const mission = getMissionById(missionId) || getLevel2MissionById(missionId) || getLevel3CryptoMissionById(missionId) || getLevel3ForexMissionById(missionId) || getLevel3StocksMissionById(missionId) || getLevel3CommoditiesMissionById(missionId);
  const levelId = missionId.startsWith("m1_") ? "level_1"
    : missionId.startsWith("m2_") ? "level_2"
    : missionId.startsWith("m3f_") ? "level_3_forex"
    : missionId.startsWith("m3s_") ? "level_3_stocks"
    : missionId.startsWith("m3o_") ? "level_3_commodities"
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
