# 🎮 TraderPath

[![CI](https://github.com/RonaldoBTC-code/traderpath/actions/workflows/ci.yml/badge.svg)](https://github.com/RonaldoBTC-code/traderpath/actions/workflows/ci.yml)

**Videojuego educativo de trading financiero**

TraderPath es un videojuego web donde aprendes a operar en mercados financieros desde cero usando mecánicas de RPG (niveles, progresión, misiones, recompensas) combinadas con simulación de trading con capital virtual.

El MVP actual incluye 16 misiones con contexto gráfico de velas, 16 mini-juegos, progreso sincronizado con Supabase y un simulador de replay con velas históricas reales, checklist de riesgo y diario obligatorio. La ruta cripto comienza en **Ciudad Origen: Bitcoin** antes de abrir el mercado 24/7. Consulta la [Visión de Producto](docs/PRODUCT_VISION.md), el [Currículo de Bitcoin](docs/BITCOIN_CURRICULUM.md) y la [Dirección Visual](docs/VISUAL_DIRECTION.md).

## 🎯 Principio pedagógico

> El jugador no puede ejecutar una acción que no comprende. Las misiones desbloquean las mecánicas.

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 14 (App Router)
- **Estilos:** Tailwind CSS
- **UI:** shadcn/ui
- **Base de datos:** Supabase (PostgreSQL + Auth + RLS)
- **Gráficos:** TradingView Lightweight Charts
- **Estado:** Zustand (persist middleware con localStorage)
- **Animaciones:** Framer Motion
- **Iconos:** Lucide React
- **Hosting:** Vercel

## 🏗️ Estructura del Proyecto

```
traderpath/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login y Registro
│   │   ├── (game)/          # Dashboard, Misiones, Simulador
│   │   └── auth/callback/   # Supabase auth callback
│   ├── components/
│   │   ├── game/            # QuizEngine, XPBar, etc.
│   │   └── narrative/       # CharacterDialogue
│   ├── lib/
│   │   ├── content/         # Contenido educativo (level1.ts, level2.ts)
│   │   ├── game/            # Constantes y lógica
│   │   └── supabase/        # Clientes Supabase
│   ├── store/
│   │   └── gameStore.ts     # Zustand store con persistencia
│   └── types/
│       └── game.ts          # TypeScript interfaces
├── supabase/
│   └── migrations/
│       └── 001_initial.sql  # Schema completo
└── tailwind.config.ts
```

## 🎮 Contenido del MVP

### Nivel 1 — "El Despertar del Especulador" ($1,000 virtuales)
- M1.1: Bienvenido al Mercado (oferta, demanda, precio)
- M1.2: Las Velas del Tiempo (velas japonesas OHLC)
- M1.3: El Lenguaje del Precio (tendencias, HH/HL/LH/LL, FOMO/pánico)
- M1.4: Tu Capital, Tu Responsabilidad (Stop Loss, R:R, regla del 2%)
- M1.5: El Desafío de Marco (boss — integración de conceptos)

### Nivel 2 — "El Territorio del Precio" ($2,500 virtuales)
- M2.1: Las Zonas del Poder (oferta/demanda, zonas frescas/quemadas)
- M2.2: El Mapa del Precio (soportes, resistencias, role reversal)
- M2.3: Las Cartas del Especulador (6 patrones de velas)
- M2.4: Hablar el Idioma del Mercado (tipos de órdenes)
- M2.5: El Gran Tour de los Mercados (selección de especialización)

### 7 Mercados de Especialización
Crypto · Forex · Acciones · Commodities · Índices · Futuros · ETFs

## 🧑‍🎭 Personajes

- **El Viejo Marco** — Mentor fallecido. Guía narrativo.
- **ARIA** — IA asistente. Educativa y directa.
- **El Especulador** — Antagonista. Codicia e impulsividad.
- **La Señorita FOMO** — Antagonista. Miedo a perderse algo.
- **Don Pánico** — Antagonista. Ventas impulsivas por miedo.

## 🚀 Setup Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar con tus credenciales de Supabase

# Ejecutar en desarrollo
npm run dev

# Pipeline completo antes de enviar cambios
npm run check
```

## 📋 Variables de Entorno

```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🎨 Sistema de Diseño

- Fondo: `#0D1B2A` (azul noche)
- Paneles: `#1A2B3C`
- Acento verde: `#00C896`
- Dorado (logros): `#FFD700`
- Rojo (alertas): `#FF4757`
- Tipografía: Inter + JetBrains Mono (precios)

## 📖 Filosofía

> "Los mercados no te deben nada. Aprende primero, gana después." — El Viejo Marco

---

Construido con disciplina. El juego enseña sin prometer resultados.
