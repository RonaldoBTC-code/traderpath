import type { MarketCandle } from "@/types/simulator";

/**
 * Offline candle set for the simulator, used when the market provider is
 * unreachable (Binance answers 403/451 from some regions, or times out).
 *
 * Deterministic on purpose: the same symbol and interval always replay the same
 * series, so a lesson behaves identically for every player and every retry. It
 * is a fixed past window (starting 2024-01-01 UTC) and the API labels it as a
 * demo — it must never be presented as live or recent prices.
 */

const BASE_PRICE: Record<string, number> = {
  BTCUSDT: 42_000,
  ETHUSDT: 2_300,
  SOLUSDT: 100,
};

const INTERVAL_SECONDS: Record<string, number> = {
  "15m": 15 * 60,
  "1h": 60 * 60,
  "4h": 4 * 60 * 60,
  "1d": 24 * 60 * 60,
};

const START_TIME = Date.UTC(2024, 0, 1) / 1000;

/** mulberry32 — tiny seeded PRNG, enough for a repeatable price walk. */
function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function buildDemoCandles(symbol: string, interval: string, count = 120): MarketCandle[] {
  const random = seededRandom(hashSeed(`${symbol}:${interval}`));
  const step = INTERVAL_SECONDS[interval] ?? INTERVAL_SECONDS["1h"];
  const volatility = 0.008 * Math.sqrt(step / INTERVAL_SECONDS["1h"]);
  let price = BASE_PRICE[symbol] ?? 100;

  const candles: MarketCandle[] = [];
  for (let i = 0; i < count; i += 1) {
    // Slow sine drift gives the replay visible trends and pullbacks to trade,
    // instead of pure noise that teaches nothing.
    const drift = Math.sin(i / 14) * volatility * 0.35;
    const change = (random() - 0.5) * 2 * volatility + drift;
    const open = price;
    const close = open * (1 + change);
    const high = Math.max(open, close) * (1 + random() * volatility * 0.6);
    const low = Math.min(open, close) * (1 - random() * volatility * 0.6);
    const round = (value: number) => Number(value.toFixed(value >= 1000 ? 2 : 4));
    candles.push({
      time: START_TIME + i * step,
      open: round(open),
      high: round(high),
      low: round(low),
      close: round(close),
      volume: Math.round(500 + random() * 1500),
    });
    price = close;
  }
  return candles;
}
