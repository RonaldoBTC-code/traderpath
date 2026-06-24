/**
 * Deterministic number formatting — same output on server and client.
 * Uses "en-US" locale consistently to avoid hydration mismatches.
 */

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(value);
}

export function formatCurrency(value: number): string {
  return "$" + new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(value);
}
