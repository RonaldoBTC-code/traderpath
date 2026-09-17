import { createClient } from "@/lib/supabase/client";
import type { ClosedOperation } from "@/types/simulator";

export async function saveTradingRecord(
  operation: ClosedOperation,
  reasoning: string,
  emotion: string,
  lesson: string
): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;

  const [operationResult, diaryResult] = await Promise.all([
    supabase.from("simulator_operations").insert({
      user_id: data.user.id,
      asset: operation.asset,
      direction: operation.direction,
      entry_price: operation.entryPrice,
      stop_loss: operation.stopLoss,
      take_profit: operation.takeProfit,
      capital_used: operation.entryPrice * operation.units,
      outcome: operation.outcome,
      pnl: operation.pnl,
      aria_feedback: operation.outcome === "WIN"
        ? "El plan alcanzó su objetivo. Evalúa si respetaste el proceso, no solo el resultado."
        : "La invalidación protegió el capital. Una pérdida planificada no es un fallo de disciplina.",
    }),
    supabase.from("trading_diary").insert({
      user_id: data.user.id,
      asset: operation.asset,
      direction: operation.direction,
      entry_price: operation.entryPrice,
      stop_loss: operation.stopLoss,
      take_profit: operation.takeProfit,
      order_type: operation.orderType,
      reasoning: `${reasoning}\n\nEmoción: ${emotion}\nLección: ${lesson}`,
      outcome: operation.outcome,
      pnl: operation.pnl,
      risk_reward: operation.riskReward,
    }),
  ]);

  if (operationResult.error) throw operationResult.error;
  if (diaryResult.error) throw diaryResult.error;
  return true;
}
