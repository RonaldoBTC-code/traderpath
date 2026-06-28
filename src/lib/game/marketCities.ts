import type { MarketSpecialization } from "@/lib/content/level2";

export interface MarketCityIdentity {
  id: MarketSpecialization;
  city: string;
  reference: string;
  symbol: string;
  landmark: string;
  accent: string;
  accentSoft: string;
  sky: [string, string];
  lesson: string;
}

export const MARKET_CITIES: MarketCityIdentity[] = [
  {
    id: "crypto",
    city: "Ciudad Bitcoin",
    reference: "Conchagua · El Salvador",
    symbol: "₿",
    landmark: "Plaza del Bloque",
    accent: "#F7931A",
    accentSoft: "#FFD08A",
    sky: ["#271408", "#0A1724"],
    lesson: "Red abierta, bloques, custodia y un mercado 24/7.",
  },
  {
    id: "forex",
    city: "Distrito FX",
    reference: "Nueva York · Wall Street",
    symbol: "$€¥£",
    landmark: "Torre de Liquidez",
    accent: "#38BDF8",
    accentSoft: "#A5F3FC",
    sky: ["#071B38", "#101827"],
    lesson: "Sesiones globales, pares de divisas y política monetaria.",
  },
  {
    id: "stocks",
    city: "Capital Corporativa",
    reference: "Nueva York · Exchange District",
    symbol: "AAPL",
    landmark: "Bolsa de Empresas",
    accent: "#22C55E",
    accentSoft: "#BBF7D0",
    sky: ["#08251C", "#101827"],
    lesson: "Propiedad empresarial, resultados y valoración.",
  },
  {
    id: "commodities",
    city: "Puerto de Materias",
    reference: "Chicago · Golfo industrial",
    symbol: "Au",
    landmark: "Terminal del Mundo Real",
    accent: "#EAB308",
    accentSoft: "#FEF08A",
    sky: ["#2A2106", "#172033"],
    lesson: "Oro, energía, agricultura y oferta física.",
  },
  {
    id: "indices",
    city: "Observatorio Global",
    reference: "Frankfurt · Distrito macro",
    symbol: "500",
    landmark: "Cúpula de Economías",
    accent: "#818CF8",
    accentSoft: "#C7D2FE",
    sky: ["#171743", "#111827"],
    lesson: "Canastas de empresas y el pulso de economías completas.",
  },
  {
    id: "futures",
    city: "Ciudad de Contratos",
    reference: "Chicago · Futures Loop",
    symbol: "ES",
    landmark: "Reloj de Vencimientos",
    accent: "#F97316",
    accentSoft: "#FED7AA",
    sky: ["#321308", "#172033"],
    lesson: "Margen, vencimientos y cobertura de precios futuros.",
  },
  {
    id: "etfs",
    city: "Archipiélago Portafolio",
    reference: "Singapur · Investment Bay",
    symbol: "ETF",
    landmark: "Puente de Diversificación",
    accent: "#D946EF",
    accentSoft: "#F5D0FE",
    sky: ["#28103A", "#0E2030"],
    lesson: "Fondos cotizados, diversificación y costos.",
  },
];

export function getMarketCity(id: string) {
  return MARKET_CITIES.find((city) => city.id === id) ?? MARKET_CITIES[0];
}
