import { NextRequest, NextResponse } from "next/server";
import type { MarketCandle } from "@/types/simulator";

const SYMBOLS = new Set(["BTCUSDT", "ETHUSDT", "SOLUSDT"]);
const INTERVALS = new Set(["15m", "1h", "4h", "1d"]);

type BinanceKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string,
];

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol") ?? "BTCUSDT";
  const interval = request.nextUrl.searchParams.get("interval") ?? "1h";

  if (!SYMBOLS.has(symbol) || !INTERVALS.has(interval)) {
    return NextResponse.json({ error: "Mercado o temporalidad no permitidos." }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=120`,
      {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(8_000),
      }
    );

    if (!response.ok) throw new Error(`Market provider returned ${response.status}`);

    const rows = (await response.json()) as BinanceKline[];
    const candles: MarketCandle[] = rows.map((row) => ({
      time: Math.floor(row[0] / 1000),
      open: Number(row[1]),
      high: Number(row[2]),
      low: Number(row[3]),
      close: Number(row[4]),
      volume: Number(row[5]),
    }));

    return NextResponse.json({
      symbol,
      interval,
      source: "Binance Spot",
      delayed: true,
      candles,
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar las velas del proveedor de mercado." },
      { status: 503 }
    );
  }
}
