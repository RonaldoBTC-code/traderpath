# TraderPath — Documentación Técnica del Estado Actual

> Última actualización: Junio 2026

---

## 1. RESUMEN DEL PROYECTO

TraderPath es un videojuego educativo web de trading financiero construido con Next.js 14. El jugador aprende a operar mercados financieros a través de misiones narrativas, mini-juegos interactivos, quizzes y un sistema de progresión RPG con capital virtual.

**Estado actual**: MVP funcional con 3 niveles de contenido, sistema de progresión local (Zustand + localStorage), y 15 misiones jugables con mini-juegos interactivos.

---

## 2. STACK TECNOLÓGICO

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js (App Router) | 14.1.0 |
| Lenguaje | TypeScript | 5.3+ |
| Estilos | Tailwind CSS | 3.4+ |
| Estado | Zustand (persist middleware) | 4.4+ |
| DB (futuro) | Supabase | Schema listo |
| Gráficos (futuro) | Lightweight Charts | Instalado |
| Animaciones (futuro) | Framer Motion | Instalado |
| Fuentes | Space Grotesk + DM Sans + JetBrains Mono | Google Fonts |

---

## 3. ARQUITECTURA DE ARCHIVOS

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          ← Login (Supabase Auth)
│   │   └── register/page.tsx       ← Registro con creación de perfil
│   ├── (game)/
│   │   ├── layout.tsx              ← Layout del juego (header + HUD)
│   │   ├── dashboard/page.tsx      ← Dashboard principal
│   │   └── mission/[id]/page.tsx   ← Motor de misiones universal
│   ├── auth/callback/route.ts      ← Callback OAuth Supabase
│   ├── layout.tsx                  ← Root layout
│   ├── page.tsx                    ← Landing page
│   └── globals.css                 ← Design tokens VDD v1.0
├── components/
│   ├── game/
│   │   ├── QuizEngine.tsx          ← Motor de preguntas (feedback + explicación)
│   │   ├── MatchTermMinigame.tsx   ← Conectar términos ↔ definiciones
│   │   ├── CandlestickBuilder.tsx  ← Armar velas con Open/Close
│   │   ├── ChartTapGame.tsx        ← Clasificar tendencia en gráfico SVG
│   │   ├── RiskCalculator.tsx      ← Calcular tamaño de posición
│   │   ├── CandleClassifier.tsx    ← Boss N1: análisis integrado 4 pasos
│   │   ├── ZonePainter.tsx         ← Clasificar zonas oferta/demanda
│   │   ├── PatternIdentifier.tsx   ← Identificar señal de patrones de velas
│   │   ├── OrderSimulator.tsx      ← Elegir tipo de orden por escenario
│   │   └── MarketPreview.tsx       ← Gran Tour: explorar 7 mercados + elegir
│   └── narrative/
│       └── CharacterDialogue.tsx   ← Burbujas de diálogo por personaje
├── hooks/
│   └── useHasMounted.ts            ← Prevenir hydration errors
├── lib/
│   ├── content/
│   │   ├── level1.ts              ← 5 misiones + tipos base
│   │   ├── level2.ts              ← 5 misiones + 7 mercados
│   │   └── level3-crypto.ts       ← 5 misiones ruta Crypto
│   ├── game/
│   │   └── constants.ts           ← Ranks, XP rewards, achievements
│   ├── supabase/
│   │   ├── client.ts              ← Browser Supabase client
│   │   ├── server.ts              ← Server Component client
│   │   └── middleware.ts          ← Session refresh
│   └── utils/
│       └── format.ts              ← formatCurrency / formatNumber (deterministic)
├── store/
│   └── gameStore.ts               ← Zustand store con persist
├── types/
│   └── game.ts                    ← Interfaces globales
└── middleware.ts                   ← Auth middleware (rutas protegidas)

supabase/
└── migrations/
    └── 001_initial.sql            ← Schema completo con RLS + funciones
```

---

## 4. SISTEMA DE PROGRESIÓN

### Estado del jugador (Zustand persist → localStorage)

```typescript
{
  xp: number              // Experiencia acumulada
  virtualCapital: number  // Capital virtual ($)
  rank: string            // Rango calculado por XP
  currentLevelId: string  // "level_1" | "level_2" | "level_3_crypto"
  currentMissionId: string// ID de la próxima misión
  completedMissions: []   // Array de {levelId, missionId, score, completedAt}
  marketSpecialization: string | null  // Elegido en M2.5
  marketChangeUsed: boolean           // Cambio único permitido
}
```

### Rangos por XP
| Rango | XP Mínimo |
|-------|-----------|
| Novato | 0 |
| Aprendiz | 1,000 |
| Analista | 2,500 |
| Estratega | 5,000 |
| Operador | 8,500 |
| Trader | 13,000 |
| Profesional | 18,500 |
| Leyenda | 25,000 |

### Flujo de progresión
```
Nivel 1 (5 misiones) → Nivel 2 (5 misiones) → Gran Tour (elige mercado) → Nivel 3 Crypto (5 misiones)
```

---

## 5. CONTENIDO EDUCATIVO

### Nivel 1 — "El Despertar del Especulador" (Capital: $1,000)
| # | Misión | Concepto | Mini-juego |
|---|--------|----------|-----------|
| 1 | Bienvenido al Mercado | Oferta/demanda, precio | MatchTerm |
| 2 | Las Velas del Tiempo | OHLC, velas japonesas | CandlestickBuilder |
| 3 | El Lenguaje del Precio | Tendencias, HH/HL, FOMO | ChartTap |
| 4 | Tu Capital, Tu Responsabilidad | Stop Loss, R:R, regla 2% | RiskCalculator |
| 5 | El Desafío de Marco (Boss) | Integración completa | CandleClassifier |

### Nivel 2 — "El Territorio del Precio" (Capital: $2,500)
| # | Misión | Concepto | Mini-juego |
|---|--------|----------|-----------|
| 1 | Las Zonas del Poder | Oferta/demanda, zonas frescas | ZonePainter |
| 2 | El Mapa del Precio | Soporte/resistencia, role reversal | ChartTap |
| 3 | Las Cartas del Especulador | 6 patrones de velas + contexto | PatternIdentifier |
| 4 | Hablar el Idioma del Mercado | Tipos de órdenes, slippage | OrderSimulator |
| 5 | El Gran Tour (Boss) | Explorar 7 mercados + elegir | MarketPreview |

### Nivel 3 Crypto — "El Mundo de los Bloques" (Capital: $3,500)
| # | Misión | Concepto | Mini-juego |
|---|--------|----------|-----------|
| 1 | La Ciudad que Nunca Duerme | 24/7, CEX vs DEX, pares | PairCalculator* |
| 2 | El Rey Bitcoin | BTC Dominance, altcoins, market cap | DominanceGauge* |
| 3 | Los Ciclos de la Luna | Halving, 4 fases, Fear & Greed | CycleMapper* |
| 4 | El Lenguaje de los Bloques | ATR, HTF/LTF, funding rate | TimeframeSwitcher* |
| 5 | El Gran Reto Cripto (Boss) | Integración crypto completa | FearGreedSlider* |

*Mini-juegos del N3 usan placeholder (pendientes de implementación visual).

---

## 6. FLUJO DE UNA MISIÓN

```
1. INTRO (diálogos de personajes)
   → Narrador, Marco, ARIA, antagonistas

2. MINI-JUEGO (interactivo)
   → Componente específico por tipo
   → Calcula score

3. QUIZ (preguntas con opciones)
   → Feedback por opción + explicación
   → Score acumulado

4. OUTRO (diálogos de cierre)
   → Tips de ARIA, reflexiones de Marco

5. PANTALLA DE RECOMPENSA
   → +XP, +Capital, Badge (si aplica)
   → Botón "Volver al Dashboard"
```

---

## 7. SISTEMA DE DISEÑO (VDD v1.0)

### Paleta
| Token | Hex | Uso |
|-------|-----|-----|
| `tp-base` | #0A0E1A | Fondo principal |
| `tp-surface` | #131827 | Cards, paneles |
| `tp-border` | #1E2D45 | Bordes |
| `tp-text` | #E8EAF0 | Texto principal |
| `tp-text-muted` | #8894A8 | Texto secundario |
| `tp-gold` | #F0C040 | XP, logros, marca |
| `tp-demand` | #22C55E | Verde positivo |
| `tp-supply` | #EF4444 | Rojo negativo |
| `tp-info` | #60A5FA | ARIA, información |

### Tipografía
- **Display**: Space Grotesk 700 (títulos, CTAs)
- **Body**: DM Sans 400/600 (interfaz)
- **Data**: JetBrains Mono 500 (precios, XP, capital)

---

## 8. PERSONAJES

| Personaje | Rol | Color | Aparece en |
|-----------|-----|-------|-----------|
| El Viejo Marco | Mentor | Gold | Intros, boss, decisiones |
| ARIA | Guía IA | Blue/Info | Siempre (educación) |
| El Especulador | Antagonista | Red | Riesgo sin SL |
| La Señorita FOMO | Antagonista | Pink | Tendencias alcistas |
| Don Pánico | Antagonista | Blue frío | Caídas de precio |
| Narrador | Narrativa | Muted | Transiciones |

---

## 9. BASE DE DATOS (Supabase — preparado)

### Tablas
- `profiles` — usuario, username, avatar
- `player_progress` — XP, capital, nivel, racha
- `completed_missions` — misión, score, fecha
- `achievements` — logros desbloqueados
- `trading_diary` — diario de operaciones
- `simulator_operations` — historial del simulador

### Funciones SQL
- `increment_xp_and_capital()` — actualización atómica
- `get_full_player_state()` — dashboard en una llamada
- `update_streak()` — trigger de racha

### RLS
Cada tabla tiene Row Level Security: usuarios solo ven sus propios datos.

---

## 10. PENDIENTES (No implementado aún)

### Funcionalidad
- [ ] Simulador de trading con TradingView charts
- [ ] Diario de trading virtual
- [ ] Sistema de logros con popups
- [ ] Conexión real a Supabase (actualmente solo localStorage)
- [ ] Mini-juegos del Nivel 3 Crypto (5 componentes)
- [ ] Escenas educativas visuales (Apple Market, Bounce Room, etc.)

### Visual (VDD Fases 1-5)
- [ ] WorldMap con nodos de misión
- [ ] Sprites SVG de personajes
- [ ] Backgrounds por ciudad de mercado
- [ ] Animaciones de transición entre zonas
- [ ] Efectos de partículas

### Infraestructura
- [ ] Deploy a Vercel
- [ ] Auth real con Supabase
- [ ] Responsive completo (mobile)

---

## 11. CÓMO EJECUTAR

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npx next dev --port 3000

# Build de producción
npx next build

# Verificar tipos
npx tsc --noEmit
```

### Variables de entorno (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 12. REPOSITORIO

**GitHub**: https://github.com/RonaldoBTC-code/traderpath

---

*Documento generado como referencia interna del estado del proyecto.*
