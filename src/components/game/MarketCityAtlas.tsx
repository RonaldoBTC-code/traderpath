"use client";

import { Check, LockKeyhole, MapPin } from "lucide-react";
import { MARKET_CITIES, getMarketCity } from "@/lib/game/marketCities";

const EMPTY_VISITED = new Set<string>();

interface AtlasProps {
  activeId: string;
  visited?: Set<string>;
  onSelect?: (id: string) => void;
  compact?: boolean;
}

export default function MarketCityAtlas({ activeId, visited = EMPTY_VISITED, onSelect, compact = false }: AtlasProps) {
  const active = getMarketCity(activeId);

  return (
    <div className="space-y-3">
      <MarketCityScene marketId={active.id} compact={compact} />
      {!compact && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {MARKET_CITIES.map((city) => {
            const selected = city.id === active.id;
            const wasVisited = visited.has(city.id);
            return (
              <button
                key={city.id}
                type="button"
                onClick={() => onSelect?.(city.id)}
                aria-pressed={selected}
                className={`group relative overflow-hidden rounded-xl border p-3 text-left transition ${
                  selected
                    ? "border-white/25 bg-white/[0.08] shadow-[0_12px_30px_rgba(0,0,0,.25)]"
                    : "border-white/[0.06] bg-tp-base/70 hover:-translate-y-0.5 hover:border-white/15"
                }`}
              >
                <div className="absolute inset-x-0 top-0 h-0.5" style={{ backgroundColor: city.accent }} />
                <div className="flex items-center justify-between">
                  <span className="font-data text-sm font-bold" style={{ color: city.accentSoft }}>{city.symbol}</span>
                  {wasVisited ? <Check size={13} className="text-tp-demand" /> : <LockKeyhole size={11} className="text-tp-text-muted/45" />}
                </div>
                <p className="mt-2 truncate text-[10px] font-semibold text-tp-text">{city.city}</p>
                <p className="mt-0.5 truncate text-[8px] text-tp-text-muted">{city.reference}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MarketCityScene({ marketId, compact = false }: { marketId: string; compact?: boolean }) {
  const city = getMarketCity(marketId);

  return (
    <div
      data-market-city={city.id}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-tp-base shadow-[0_22px_70px_rgba(0,0,0,.34)] ${compact ? "min-h-[260px]" : "min-h-[330px]"}`}
      style={{ background: `linear-gradient(150deg, ${city.sky[0]}, ${city.sky[1]} 68%)` }}
    >
      <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "repeating-radial-gradient(circle at 65% 75%, transparent 0 22px, white 23px 24px)" }} />
      <CityIllustration marketId={city.id} accent={city.accent} accentSoft={city.accentSoft} />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050914]/90 via-[#050914]/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#050914] to-transparent" />

      <div className="relative z-10 flex min-h-[inherit] max-w-md flex-col justify-between p-5 sm:p-7">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 backdrop-blur">
          <MapPin size={12} style={{ color: city.accent }} />
          <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/70">{city.reference}</span>
        </div>
        <div className="mt-20">
          <div className="font-data text-2xl font-bold" style={{ color: city.accentSoft }}>{city.symbol}</div>
          <h3 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">{city.city}</h3>
          <p className="mt-1 text-[10px] uppercase tracking-[0.16em]" style={{ color: city.accentSoft }}>{city.landmark}</p>
          <p className="mt-3 max-w-sm text-xs leading-relaxed text-white/65">{city.lesson}</p>
        </div>
      </div>

      <div className="absolute bottom-5 right-5 z-10 hidden rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-[9px] text-white/55 backdrop-blur sm:block">
        Portal de aprendizaje · prototipo 2.5D
      </div>
    </div>
  );
}

function CityIllustration({ marketId, accent, accentSoft }: { marketId: string; accent: string; accentSoft: string }) {
  if (marketId === "crypto") return <CryptoCity accent={accent} accentSoft={accentSoft} />;
  if (marketId === "commodities") return <CommodityPort accent={accent} />;
  if (marketId === "indices") return <IndexObservatory accent={accent} />;
  if (marketId === "etfs") return <PortfolioBay accent={accent} />;
  return <FinancialSkyline marketId={marketId} accent={accent} accentSoft={accentSoft} />;
}

function CryptoCity({ accent, accentSoft }: { accent: string; accentSoft: string }) {
  return (
    <svg viewBox="0 0 900 360" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="cryptoGlow"><stop stopColor={accent} stopOpacity=".5" /><stop offset="1" stopColor={accent} stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="680" cy="90" r="170" fill="url(#cryptoGlow)" />
      <path d="M330 285 470 65 555 285Z" fill="#151923" stroke="#403427" strokeWidth="3" />
      <path d="m448 103 22-38 19 43-19-10Z" fill={accent} opacity=".55" />
      <path d="M0 290Q170 245 350 285T900 270V360H0Z" fill="#071F2F" />
      <g transform="translate(655 235) rotate(-8) scale(1 .42)">
        <circle r="142" fill="#151B22" stroke={accent} strokeWidth="6" />
        {[36, 66, 96, 126].map((radius) => <circle key={radius} r={radius} fill="none" stroke={accentSoft} strokeOpacity=".48" strokeWidth="4" />)}
        {[0, 30, 60, 90, 120, 150].map((angle) => <line key={angle} x1="-132" x2="132" y1="0" y2="0" stroke={accent} strokeOpacity=".35" strokeWidth="3" transform={`rotate(${angle})`} />)}
        <circle r="27" fill={accent} />
        <text x="0" y="11" textAnchor="middle" fontSize="34" fontWeight="800" fill="#1A0D02">₿</text>
      </g>
      <g fill={accentSoft} opacity=".7">
        <rect x="610" y="190" width="14" height="52" /><rect x="638" y="174" width="18" height="69" />
        <rect x="672" y="181" width="13" height="60" /><rect x="704" y="163" width="19" height="77" />
      </g>
    </svg>
  );
}

function FinancialSkyline({ marketId, accent, accentSoft }: { marketId: string; accent: string; accentSoft: string }) {
  const labels = marketId === "forex" ? ["EUR/USD", "USD/JPY", "GBP/USD"] : marketId === "stocks" ? ["AAPL", "NVDA", "MSFT"] : ["ES", "NQ", "CL"];
  return (
    <svg viewBox="0 0 900 360" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <circle cx="745" cy="74" r="92" fill={accent} opacity=".13" />
      <path d="M300 330h600V150l-45 18v-56h-52v90h-42V68h-52v115h-50V132h-74v63h-48V92h-57v111h-61v-54h-64v74h-57Z" fill="#111827" stroke={accent} strokeOpacity=".35" strokeWidth="2" />
      <g fill={accentSoft} opacity=".55">
        {Array.from({ length: 11 }, (_, index) => <rect key={index} x={365 + index * 43} y={185 - (index % 3) * 18} width="6" height="8" rx="1" />)}
      </g>
      <path d="M250 303h650" stroke={accent} strokeWidth="3" opacity=".45" />
      <path d="M330 282 430 249 505 266 590 208 678 230 810 159" fill="none" stroke={accentSoft} strokeWidth="5" />
      {labels.map((label, index) => <text key={label} x={520 + index * 112} y={40 + index * 34} fill={accentSoft} opacity=".7" fontSize="13" fontFamily="monospace">{label}</text>)}
    </svg>
  );
}

function CommodityPort({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 900 360" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <circle cx="760" cy="70" r="65" fill={accent} opacity=".2" />
      <path d="M250 320h650V205H775v-75h-18v75h-62v-43h-86v43h-44v-93h-17v93H420v-55h-84v55h-86Z" fill="#171A20" stroke={accent} strokeOpacity=".42" strokeWidth="2" />
      <g fill="none" stroke={accent} strokeWidth="5" opacity=".55">
        <circle cx="650" cy="205" r="45" /><circle cx="650" cy="205" r="27" /><path d="M650 160v90M605 205h90" />
      </g>
      <path d="M220 319Q540 284 900 315V360H220Z" fill="#102B3A" />
      <text x="735" y="178" fill={accent} fontSize="35" fontWeight="800">Au</text>
    </svg>
  );
}

function IndexObservatory({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 900 360" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <circle cx="700" cy="185" r="145" fill={accent} opacity=".08" />
      <path d="M520 305a180 180 0 0 1 360 0Z" fill="#14182C" stroke={accent} strokeWidth="4" />
      {[560, 620, 680, 740, 800].map((x) => <path key={x} d={`M${x} 302Q700 90 ${840 - (x - 560)} 302`} fill="none" stroke={accent} strokeOpacity=".28" strokeWidth="2" />)}
      <path d="M520 260h360M550 215h300M590 170h220" stroke={accent} strokeOpacity=".28" strokeWidth="2" />
      <circle cx="700" cy="185" r="38" fill={accent} opacity=".7" />
      <text x="700" y="196" textAnchor="middle" fill="#11142A" fontSize="29" fontWeight="800">500</text>
    </svg>
  );
}

function PortfolioBay({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 900 360" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <path d="M250 305Q420 240 590 300T900 270V360H250Z" fill="#082738" />
      {[520, 650, 780].map((x, index) => (
        <g key={x}>
          <ellipse cx={x} cy={235 - index * 18} rx="85" ry="38" fill="#17182A" stroke={accent} strokeWidth="3" />
          <rect x={x - 36} y={160 - index * 18} width="72" height="75" rx="30" fill="#242342" stroke={accent} strokeOpacity=".45" />
        </g>
      ))}
      <path d="M430 265Q610 120 865 215" fill="none" stroke={accent} strokeWidth="6" opacity=".65" />
      <text x="715" y="93" fill={accent} fontSize="40" fontWeight="800">ETF</text>
    </svg>
  );
}
