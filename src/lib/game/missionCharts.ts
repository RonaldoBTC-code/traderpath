import type { MarketCandle } from "@/types/simulator";

export type ChartPattern = "bullish" | "bearish" | "sideways" | "volatile" | "reversal" | "breakout";

export interface MissionChartConfig {
  symbol: string;
  timeframe: string;
  title: string;
  teachingPoint: string;
  pattern: ChartPattern;
}

export const MISSION_CHARTS: Record<string, MissionChartConfig> = {
  m1_1: { symbol: "MANZANAS/USD", timeframe: "1D", title: "Oferta, demanda y precio", teachingPoint: "Menor oferta y mayor demanda empujan el precio hacia arriba.", pattern: "bullish" },
  m1_2: { symbol: "BTC/USDT", timeframe: "1H", title: "Anatomía OHLC", teachingPoint: "Cada vela resume apertura, máximo, mínimo y cierre.", pattern: "volatile" },
  m1_3: { symbol: "BTC/USDT", timeframe: "4H", title: "Estructura de tendencia", teachingPoint: "Observa la secuencia de máximos y mínimos, no una vela aislada.", pattern: "bullish" },
  m1_4: { symbol: "ETH/USDT", timeframe: "4H", title: "Invalidación y riesgo", teachingPoint: "El Stop Loss se coloca donde la estructura invalida la idea.", pattern: "reversal" },
  m1_5: { symbol: "BTC/USDT", timeframe: "1D", title: "Lectura integrada", teachingPoint: "Tendencia, zona, señal y riesgo deben contar la misma historia.", pattern: "sideways" },
  m2_1: { symbol: "ETH/USDT", timeframe: "4H", title: "Oferta y demanda institucional", teachingPoint: "Las salidas impulsivas señalan zonas con desequilibrio.", pattern: "reversal" },
  m2_2: { symbol: "BTC/USDT", timeframe: "4H", title: "Soporte y resistencia", teachingPoint: "Un nivel roto puede cambiar de función después del retesteo.", pattern: "breakout" },
  m2_3: { symbol: "SOL/USDT", timeframe: "1H", title: "Patrones con contexto", teachingPoint: "Una vela sólo importa cuando aparece en una zona relevante.", pattern: "reversal" },
  m2_4: { symbol: "ETH/USDT", timeframe: "1H", title: "Tipos de orden", teachingPoint: "La estructura define si conviene ejecutar ahora o esperar un precio.", pattern: "sideways" },
  m2_5: { symbol: "MERCADOS", timeframe: "1D", title: "Personalidades del mercado", teachingPoint: "Volatilidad, horario y liquidez cambian la forma del precio.", pattern: "volatile" },
  m3c_0: { symbol: "BTC", timeframe: "BLOQUES", title: "Bitcoin antes que el mercado", teachingPoint: "El protocolo puede comprenderse sin mirar el precio: nodos verifican, mineros proponen y las claves autorizan.", pattern: "bullish" },
  m3c_1: { symbol: "BTC/USDT", timeframe: "1H", title: "Mercado 24/7", teachingPoint: "Crypto no cierra: la gestión debe funcionar incluso mientras duermes.", pattern: "volatile" },
  m3c_2: { symbol: "BTC.D", timeframe: "1D", title: "Dominancia de Bitcoin", teachingPoint: "El flujo puede concentrarse en BTC o rotar hacia altcoins.", pattern: "bullish" },
  m3c_3: { symbol: "BTC/USDT", timeframe: "1W", title: "Ciclo de mercado", teachingPoint: "Acumulación, impulso, distribución y capitulación dejan estructuras distintas.", pattern: "breakout" },
  m3c_4: { symbol: "BTC/USDT", timeframe: "4H", title: "Análisis multicapa", teachingPoint: "El timeframe mayor define contexto; el menor afina la entrada.", pattern: "reversal" },
  m3c_5: { symbol: "BTC/USDT", timeframe: "4H", title: "Síntesis cripto", teachingPoint: "Ciclo, dominancia, estructura y riesgo deben evaluarse juntos.", pattern: "volatile" },
};

export function generateEducationalCandles(pattern: ChartPattern, seed = 1, count = 36): MarketCandle[] {
  const candles: MarketCandle[] = [];
  let close = 100 + seed * 3;
  const startTime = 1_700_000_000 + seed * 100_000;

  for (let index = 0; index < count; index += 1) {
    const wave = Math.sin((index + seed) * 0.85) * 1.8;
    let drift = 0;
    if (pattern === "bullish") drift = 1.15;
    if (pattern === "bearish") drift = -1.15;
    if (pattern === "sideways") drift = -Math.sign(close - (100 + seed * 3)) * 0.75;
    if (pattern === "volatile") drift = Math.sin((index + seed) * 0.42) * 2.1;
    if (pattern === "reversal") drift = index < count * 0.48 ? -1.05 : 1.45;
    if (pattern === "breakout") drift = index < count * 0.62 ? Math.sin(index) * 0.25 : 1.65;

    const open = close;
    close = Math.max(10, open + drift + wave * 0.42);
    const wick = 1.2 + ((index * 7 + seed) % 5) * 0.28;
    candles.push({
      time: startTime + index * 3_600,
      open: round(open),
      high: round(Math.max(open, close) + wick),
      low: round(Math.min(open, close) - wick),
      close: round(close),
      volume: 100 + ((index * 31 + seed * 17) % 90),
    });
  }

  return candles;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
