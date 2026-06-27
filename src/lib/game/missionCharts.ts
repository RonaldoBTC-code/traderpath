import type { MarketCandle } from "@/types/simulator";

export type ChartPattern = "bullish" | "bearish" | "sideways" | "volatile" | "reversal" | "breakout" | "cycle";

export type ChartAnalysisPreset =
  | "supply-demand"
  | "ohlc"
  | "trend"
  | "risk"
  | "range"
  | "institutional-zones"
  | "breakout-retest"
  | "candle-context"
  | "orders"
  | "volatility"
  | "always-open"
  | "dominance"
  | "market-cycle"
  | "multi-timeframe"
  | "integrated";

export interface MissionChartConfig {
  symbol: string;
  timeframe: string;
  title: string;
  teachingPoint: string;
  pattern: ChartPattern;
  analysis: ChartAnalysisPreset;
  hidden?: boolean;
}

export const MISSION_CHARTS: Record<string, MissionChartConfig> = {
  m1_1: {
    symbol: "MANZANAS/USD",
    timeframe: "1D",
    title: "Oferta, demanda y formación del precio",
    teachingPoint: "El precio reacciona en zonas donde compradores o vendedores muestran interés repetido.",
    pattern: "bullish",
    analysis: "supply-demand",
  },
  m1_2: {
    symbol: "BTC/USDT",
    timeframe: "1H",
    title: "Anatomía OHLC sobre una vela real",
    teachingPoint: "Apertura y cierre forman el cuerpo; máximo y mínimo incluyen las mechas.",
    pattern: "volatile",
    analysis: "ohlc",
  },
  m1_3: {
    symbol: "BTC/USDT",
    timeframe: "4H",
    title: "Tendencia, retrocesos y resistencia",
    teachingPoint: "Una tendencia alcista necesita máximos y mínimos ascendentes; la resistencia exige rechazos visibles.",
    pattern: "bullish",
    analysis: "trend",
  },
  m1_4: {
    symbol: "ETH/USDT",
    timeframe: "4H",
    title: "Entrada, invalidación y riesgo",
    teachingPoint: "El Stop Loss se coloca detrás del nivel que invalida la estructura, no a una distancia arbitraria.",
    pattern: "reversal",
    analysis: "risk",
  },
  m1_5: {
    symbol: "BTC/USDT",
    timeframe: "1D",
    title: "Rango: soporte, resistencia y equilibrio",
    teachingPoint: "Dentro de un rango se opera entre extremos; en el centro la ventaja suele ser menor.",
    pattern: "sideways",
    analysis: "range",
  },
  m2_1: {
    symbol: "ETH/USDT",
    timeframe: "4H",
    title: "Zonas de oferta y demanda",
    teachingPoint: "Una salida impulsiva desde una base ayuda a localizar el origen del desequilibrio.",
    pattern: "reversal",
    analysis: "institutional-zones",
  },
  m2_2: {
    symbol: "BTC/USDT",
    timeframe: "4H",
    title: "Ruptura y retesteo de resistencia",
    teachingPoint: "La resistencia rota se valida como soporte cuando el precio vuelve, reacciona y continúa.",
    pattern: "breakout",
    analysis: "breakout-retest",
  },
  m2_3: {
    symbol: "SOL/USDT",
    timeframe: "1H",
    title: "Vela de rechazo dentro de contexto",
    teachingPoint: "Una mecha larga solo es relevante cuando rechaza una zona previamente defendida.",
    pattern: "reversal",
    analysis: "candle-context",
  },
  m2_4: {
    symbol: "ETH/USDT",
    timeframe: "1H",
    title: "Órdenes según la estructura",
    teachingPoint: "La orden limitada espera una zona; la orden de mercado acepta el precio disponible.",
    pattern: "sideways",
    analysis: "orders",
  },
  m2_5: {
    symbol: "MERCADOS",
    timeframe: "1D",
    title: "Volatilidad y personalidad del mercado",
    teachingPoint: "La amplitud de las velas y los recorridos cambia el riesgo, el stop y el tamaño de posición.",
    pattern: "volatile",
    analysis: "volatility",
  },
  m3c_0: {
    symbol: "BITCOIN",
    timeframe: "PROTOCOLO",
    title: "Bitcoin no se explica con una gráfica de precio",
    teachingPoint: "Esta misión estudia nodos, minería, claves y escasez; el precio aparece después.",
    pattern: "bullish",
    analysis: "supply-demand",
    hidden: true,
  },
  m3c_1: {
    symbol: "BTC/USDT",
    timeframe: "1H",
    title: "Mercado continuo 24/7",
    teachingPoint: "Crypto no cierra: impulsos y liquidaciones pueden aparecer fuera del horario habitual.",
    pattern: "volatile",
    analysis: "always-open",
  },
  m3c_2: {
    symbol: "BTC.D",
    timeframe: "1D",
    title: "Dominancia y rotación de capital",
    teachingPoint: "Un máximo ascendente en BTC.D indica concentración; perder estructura puede anticipar rotación.",
    pattern: "bullish",
    analysis: "dominance",
  },
  m3c_3: {
    symbol: "BTC/USDT",
    timeframe: "1W",
    title: "Ciclo completo de mercado",
    teachingPoint: "Acumulación, expansión, distribución y capitulación son fases, no fechas exactas.",
    pattern: "cycle",
    analysis: "market-cycle",
  },
  m3c_4: {
    symbol: "BTC/USDT",
    timeframe: "4H",
    title: "Contexto mayor y entrada menor",
    teachingPoint: "El marco mayor define dirección y zonas; el menor confirma la ejecución.",
    pattern: "reversal",
    analysis: "multi-timeframe",
  },
  m3c_5: {
    symbol: "BTC/USDT",
    timeframe: "4H",
    title: "Análisis integrado con invalidación",
    teachingPoint: "Estructura, zona, confirmación y riesgo deben apuntar a la misma hipótesis.",
    pattern: "breakout",
    analysis: "integrated",
  },
};

const SCENARIO_PATHS: Record<ChartPattern, number[]> = {
  // Higher highs and higher lows, followed by two visible rejections at the same ceiling.
  bullish: [100, 105, 102, 110, 106, 115, 110, 120, 115, 124, 119, 128, 123, 131, 126, 130.5, 126.5, 130],
  // Lower highs and lower lows with realistic counter-trend rallies.
  bearish: [130, 125, 128, 120, 124, 115, 120, 110, 116, 106, 112, 102, 108, 98, 104, 95, 100, 94],
  // Repeated tests of both boundaries instead of a flat random line.
  sideways: [108, 118, 111, 121, 112, 119, 109, 120, 113, 121, 110, 118, 109, 120, 112, 119, 110, 117],
  // Uneven expansion and contraction with pauses between impulses.
  volatile: [105, 116, 109, 124, 112, 118, 101, 111, 96, 108, 101, 121, 113, 129, 117, 125, 110, 120],
  // Downtrend into demand, rejection, higher low, structure break and retest.
  reversal: [128, 123, 126, 118, 121, 113, 117, 108, 111, 102, 106, 99, 108, 104, 116, 111, 121, 118],
  // Range, clean break, pullback to the old ceiling and continuation.
  breakout: [104, 112, 107, 114, 106, 113, 108, 114, 107, 113, 109, 115, 122, 128, 121, 125, 132, 136],
  // Accumulation, markup, distribution and markdown.
  cycle: [102, 100, 104, 101, 105, 103, 111, 119, 128, 138, 146, 151, 149, 153, 148, 139, 126, 111],
};

export function generateEducationalCandles(pattern: ChartPattern, seed = 1, count = 48): MarketCandle[] {
  const anchors = SCENARIO_PATHS[pattern];
  const baseline = 85 + (seed % 9) * 7;
  const scale = 1 + (seed % 5) * 0.08;
  const startTime = 1_700_000_000 + seed * 100_000;
  const candles: MarketCandle[] = [];
  let previousClose = baseline + (anchors[0] - 100) * scale;

  for (let index = 0; index < count; index += 1) {
    const anchorPosition = (index / Math.max(1, count - 1)) * (anchors.length - 1);
    const leftIndex = Math.floor(anchorPosition);
    const rightIndex = Math.min(anchors.length - 1, leftIndex + 1);
    const progress = anchorPosition - leftIndex;
    const target = anchors[leftIndex] + (anchors[rightIndex] - anchors[leftIndex]) * smoothStep(progress);
    const noise = seededNoise(seed, index) * 0.72;
    const close = baseline + (target - 100) * scale + noise;
    const open = previousClose;
    const body = Math.abs(close - open);
    const turningPoint = progress < 0.12 || progress > 0.88;
    const wickBase = 0.65 + Math.abs(seededNoise(seed + 31, index)) * 0.75;
    const wickBoost = turningPoint ? 0.75 : 0;
    const upperWick = wickBase + wickBoost + Math.max(0, seededNoise(seed + 67, index)) * 0.5;
    const lowerWick = wickBase + wickBoost + Math.max(0, -seededNoise(seed + 89, index)) * 0.5;

    candles.push({
      time: startTime + index * 3_600,
      open: round(open),
      high: round(Math.max(open, close) + upperWick),
      low: round(Math.min(open, close) - lowerWick),
      close: round(close),
      volume: Math.round(90 + body * 32 + Math.abs(seededNoise(seed + 17, index)) * 70),
    });
    previousClose = close;
  }

  return candles;
}

function smoothStep(value: number) {
  return value * value * (3 - 2 * value);
}

function seededNoise(seed: number, index: number) {
  const value = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
