export interface MarketCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TradeDirection = "LONG" | "SHORT";
export type TradeOutcome = "WIN" | "LOSS";

export interface SimulatorOrder {
  asset: string;
  direction: TradeDirection;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  units: number;
  orderType: "MARKET";
}

export interface ClosedOperation extends SimulatorOrder {
  exitPrice: number;
  outcome: TradeOutcome;
  pnl: number;
  riskReward: number;
}
