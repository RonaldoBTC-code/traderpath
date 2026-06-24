# TraderPath — Documento Completo del Proyecto
## Videojuego Educativo de Trading Financiero

**Versión:** 0.1.0 (Pre-alpha)  
**Fecha:** Junio 2026  
**Stack:** Next.js 14 + TypeScript + Tailwind CSS + Supabase + Zustand  

---

## 1. CONCEPTO DEL JUEGO

### 1.1 Descripción General
TraderPath es un videojuego educativo web que enseña trading financiero a través de mecánicas RPG (niveles, progresión, misiones, recompensas) combinadas con un simulador de trading con capital virtual. El jugador avanza por niveles temáticos, desbloqueando conocimientos secuencialmente — no puede ejecutar una acción que no entienda.

### 1.2 Principio Pedagógico Central
"El jugador NO puede ejecutar una acción que no comprende." Las misiones desbloquean mecánicas progresivamente: primero aprendes qué es un mercado, luego velas, luego tendencias, luego riesgo, y SOLO entonces puedes operar en el simulador.

### 1.3 Público Objetivo
- Personas de 18-35 años interesadas en aprender trading
- Sin conocimiento previo de mercados financieros
- Hispanohablantes (todo el contenido está en español)
- Usuarios móviles y desktop

---

## 2. ESTRUCTURA DE NIVELES

### 2.1 Nivel 1: "El Despertar del Especulador"
**Temática:** Fundamentos universales del trading  
**Capital inicial:** $1,000 virtuales  
**XP requerido para avanzar:** 500  
**Misiones:** 5

| # | Misión | Concepto | XP | Capital | Badge |
|---|--------|----------|-----|---------|-------|
| 1 | Bienvenido al Mercado | Mercados, oferta/demanda | 80 | $100 | primer_paso |
| 2 | Las Velas del Tiempo | Velas japonesas OHLC | 100 | $150 | — |
| 3 | El Lenguaje del Precio | Tendencias, HH/HL/LH/LL, emociones | 110 | $150 | — |
| 4 | Tu Capital, Tu Responsabilidad | Stop loss, R:R, gestión de riesgo | 120 | $200 | — |
| 5 | El Primer Desafío | Evaluación final nivel 1 | 150 | $250 | superviviente |

### 2.2 Nivel 2: "El Territorio del Precio"
**Temática:** Puente hacia la especialización  
**Capital estimado al entrar:** $2,500  
**XP requerido:** 750  
**Misiones:** 5

| # | Misión | Concepto | XP | Capital |
|---|--------|----------|-----|---------|
| 1 | Las Zonas del Poder | Oferta/demanda institucional | 120 | $200 |
| 2 | El Mapa del Precio | Soporte/resistencia, role reversal | 130 | $200 |
| 3 | Las Cartas del Especulador | 6 patrones de velas clave | 140 | $200 |
| 4 | Hablar el Idioma del Mercado | Tipos de órdenes | 150 | $200 |
| 5 | El Gran Tour de los Mercados | Elegir especialización | 200 | $500 |

### 2.3 Especialización de Mercado (Post Nivel 2)
Después del Nivel 2, el jugador elige 1 de 7 mercados. Los niveles 3-7 se personalizan según esa elección:

| Mercado | Volatilidad | Liquidez | Capital Mín. | Curva |
|---------|-------------|----------|--------------|-------|
| Criptomonedas (₿) | Alta | Alta | $100 | Moderada |
| Forex (💱) | Media | Muy alta | $100 | Moderada |
| Acciones (📈) | Media | Alta | $500 | Moderada |
| Materias Primas (🥇) | Media | Alta | $500 | Pronunciada |
| Índices (📊) | Baja | Muy alta | $500 | Suave |
| Futuros (⏱️) | Alta | Alta | $1,000 | Pronunciada |
| ETFs (🗂️) | Baja | Alta | $200 | Suave |

---

## 3. PERSONAJES

### 3.1 El Viejo Marco (Mentor)
- **Rol:** Guía narrativo, entrega sabiduría a través de su diario
- **Tono:** Sabio, experimentado, directo. Habla desde la experiencia del fracaso y la disciplina
- **Visual actual:** SVG — sombrero fedora dorado, barba, ojos con brillo dorado
- **Color asociado:** Dorado (#FFD700)
- **Aparece:** Intros/outros de misiones, entradas del diario
- **Cita representativa:** "Los mejores traders que conocí no eran los más inteligentes. Eran los más disciplinados con el riesgo."

### 3.2 ARIA (Asistente IA)
- **Rol:** Asistente educativa, explica conceptos, da feedback post-trade
- **Tono:** Precisa, clara, neutra pero cálida. Sin emociones pero empática
- **Visual actual:** SVG — cabeza geométrica con circuitos, ojos LED azules rectangulares, antena sensora
- **Color asociado:** Azul (#4A90E2)
- **Aparece:** Explicaciones conceptuales, feedback de quiz, tips
- **Cita representativa:** "Un SOPORTE es un nivel donde el mercado ha rebotado al alza históricamente."

### 3.3 El Especulador (Antagonista principal)
- **Rol:** Representa la codicia e impulsividad. Aparece cuando el jugador intenta acciones no disciplinadas
- **Tono:** Arrogante, confiado, burlón. Admite sus errores como si fueran virtudes
- **Visual actual:** SVG — pelo peinado hacia atrás, ojos rojos afilados, sonrisa torcida, signos $ flotando, corbata
- **Color asociado:** Rojo (#FF4757)
- **Aparece:** Cuando se intenta operar sin SL, cuando se ignora el riesgo
- **Cita representativa:** "Stop Loss, ¿para qué? Si el análisis es correcto, el mercado volverá."

### 3.4 La Señorita FOMO (Villana)
- **Rol:** Representa el miedo a quedarse fuera. Impulsa a comprar tarde
- **Tono:** Ansiosa, urgente, hiperactiva. Siempre tiene prisa
- **Visual actual:** SVG — pelo salvaje naranja, ojos enormes dilatados, boca abierta, sudor, teléfono en mano
- **Color asociado:** Naranja (#FB923C)
- **Aparece:** Cuando el precio sube rápido, presionando al jugador a entrar sin análisis
- **Cita representativa:** "¡El precio está subiendo! ¡Todos están comprando! ¿No sientes el miedo a quedarte fuera?"

### 3.5 Don Pánico (Villano)
- **Rol:** Representa el pánico vendedor. Impulsa a vender en el peor momento
- **Tono:** Aterrorizado, catastrofista, histérico
- **Visual actual:** SVG — pelo erizado púrpura, ojos gigantes con pupilas diminutas, boca gritando, líneas de temblor, flecha de caída
- **Color asociado:** Púrpura (#A855F7)
- **Aparece:** Cuando el precio baja, presionando al jugador a vender por miedo
- **Cita representativa:** "¡El precio bajó un 3%! ¡Todo se está derrumbando! ¡Vende ahora!"

### 3.6 Narrador
- **Rol:** Voz omnisciente que introduce escenas narrativas
- **Tono:** Literario, atmosférico, descriptivo
- **Visual actual:** SVG — libro abierto con páginas, partículas de brillo plateado
- **Color asociado:** Gris plateado (#A0B0C0)
- **Aparece:** Transiciones narrativas, apertura de diario

---

## 4. SISTEMA DE PROGRESIÓN

### 4.1 XP y Rangos
| Rango | XP Requerido |
|-------|-------------|
| Novato | 0 |
| Iniciado | 500 |
| Aprendiz | 1,500 |
| Analista | 3,500 |
| Trader | 7,000 |
| Experto | 12,000 |
| Maestro | 18,000 |
| Leyenda | 25,000 |

### 4.2 Capital Virtual
- Empieza en $1,000
- Aumenta con misiones completadas y trades exitosos
- Disminuye con trades perdidos y penalizaciones
- Penalización de $300 por operar sin Stop Loss

### 4.3 Racha (Streak)
- Se incrementa cada día que el jugador interactúa
- Se reinicia si pasa un día sin actividad
- Influye en logros y bonificaciones

### 4.4 Logros (7 en MVP)
1. Completar primera misión
2. Completar Nivel 1
3. Primer trade en simulador
4. Racha de 3 días
5. Completar Gran Tour
6. Completar Nivel 3
7. Racha de 5 trades con ganancia

---

## 5. MECÁNICAS DE JUEGO

### 5.1 Flujo de una Misión
```
Intro Dialogues → Mini-juego → Quiz → Outro Dialogues → Misión Completada
```

Cada fase es secuencial. El jugador no puede saltar fases.

### 5.2 Tipos de Mini-juegos Implementados

**match_term** (Conecta los Conceptos)
- Dos columnas: términos y definiciones mezcladas
- Click en término → click en definición para conectar
- Timer con countdown
- Feedback visual: verde correcto, rojo incorrecto con flash
- Barra de progreso

**Tipos planificados (no implementados aún):**
- `candlestick_builder` — Construir una vela dados 4 precios
- `candle_classifier` — Clasificar tipo de vela
- `price_direction_quiz` — Predecir dirección
- `chart_tap` — Tocar nivel correcto en gráfico
- `zone_painter` — Dibujar zonas de oferta/demanda
- `pattern_identifier` — Identificar patrones de velas
- `order_simulator` — Configurar órdenes correctamente
- `market_preview` — Tour por mercados con quiz

### 5.3 Sistema de Quiz
- Preguntas con 4 opciones (A, B, C, D)
- 3 dificultades: básico, intermedio, avanzado
- Feedback inmediato por respuesta (correcto/incorrecto + explicación)
- Barra de progreso visual
- Badge de dificultad con color
- Porcentaje final + resultado aprobado/reprobado
- Boss missions requieren 75% para aprobar

### 5.4 Simulador de Trading (Planificado)
- TradingView Lightweight Charts
- Panel de órdenes con: dirección, entry, SL, TP, capital
- Pre-Operation Checklist de 7 pasos (obligatorio)
- El Especulador aparece si intentas operar sin SL
- Diario de trading obligatorio post-operación

---

## 6. DISEÑO VISUAL ACTUAL

### 6.1 Paleta de Colores (Dark Theme — estilo TradingView)
```
Backgrounds:
  Primary:    #0D1B2A (azul oscuro profundo)
  Secondary:  #1A2B3C (panel/card)
  Tertiary:   #0A1628 (más oscuro, contraste)

Accents:
  Green:      #00C896 (positivo, CTA, alcista)
  Gold:       #FFD700 (rango, logros, Marco)
  Red:        #FF4757 (error, bajista, El Especulador)
  Blue:       #4A90E2 (info, ARIA, links)

Text:
  Primary:    #FFFFFF
  Secondary:  #A0B0C0

Border:       #2A3F55

Zonas de gráfico:
  Demanda:    rgba(0, 200, 150, 0.15)
  Oferta:     rgba(255, 71, 87, 0.15)
```

### 6.2 Tipografía
- **Body text:** Inter (400, 500, 600, 700)
- **Precios/números:** JetBrains Mono (400, 500, 700)

### 6.3 Componentes UI Principales
- Cards con `bg-tp-bg-secondary border border-tp-border rounded-xl`
- Botones primarios: `bg-tp-accent-green text-black font-bold rounded-xl`
- Botones secundarios: `border-2 border-tp-accent-green text-tp-accent-green rounded-xl`
- Inputs: `bg-tp-bg-primary border border-tp-border rounded-lg focus:border-tp-accent-green`
- Progress bars: gradiente `from-tp-accent-green to-tp-accent-blue`
- Badges de dificultad: green/gold/red con fondo opacity 20%

### 6.4 Animaciones
- FadeIn suave en transiciones de página (0.3s ease-out)
- Diálogos de personajes: slide up + fade (0.3s)
- Hover en botones: brightness-110 + scale-105
- Error en mini-juego: pulse animation en rojo

### 6.5 Avatares de Personajes (SVG inline actual)
Estilo: siluetas geométricas sobre fondo circular oscuro (#1A2B3C) con borde del color del personaje. Detalles minimalistas con líneas del color accent. Cada personaje tiene elementos identificativos únicos:
- Marco: sombrero, barba
- ARIA: circuitos, LEDs, antena
- Especulador: pelo slick, smirk, signos $
- FOMO: ojos enormes, pelo wild, teléfono
- Pánico: pelo erizado, ojos terroríficos, boca gritando
- Narrador: libro abierto, partículas

---

## 7. ARQUITECTURA TÉCNICA

### 7.1 Stack
```
Frontend:     Next.js 14 (App Router) + React 18 + TypeScript
Styling:      Tailwind CSS 3.4 (dark theme custom)
State:        Zustand (client-side game state)
Charts:       TradingView Lightweight Charts (planificado)
Animations:   Framer Motion (disponible, no usado extensivamente aún)
Auth:         Supabase Auth (implementado, desactivado temporalmente)
Database:     Supabase PostgreSQL + RLS + Triggers
Icons:        Lucide React
```

### 7.2 Estructura de Carpetas
```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles + theme vars
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login (desactivado)
│   │   └── register/page.tsx       # Registro (desactivado)
│   ├── (game)/
│   │   ├── layout.tsx              # Game shell (header + nav)
│   │   ├── dashboard/page.tsx      # Player dashboard
│   │   └── mission/[id]/page.tsx   # Mission engine
│   └── auth/callback/route.ts      # OAuth callback
├── components/
│   ├── game/
│   │   ├── QuizEngine.tsx          # Quiz con feedback
│   │   └── MatchTermMinigame.tsx   # Mini-juego conectar
│   └── narrative/
│       ├── CharacterDialogue.tsx   # Diálogo con avatar
│       └── characters/
│           ├── index.tsx           # Avatar selector
│           ├── ElViejoMarco.tsx    # SVG Marco
│           ├── Aria.tsx            # SVG ARIA
│           ├── ElEspeculador.tsx   # SVG Especulador
│           ├── LaSeñoritaFomo.tsx  # SVG FOMO
│           ├── DonPanico.tsx       # SVG Pánico
│           └── Narrator.tsx        # SVG Narrador
├── lib/
│   ├── content/
│   │   ├── level1.ts              # Contenido completo nivel 1
│   │   └── level2.ts              # Contenido completo nivel 2
│   ├── game/
│   │   └── constants.ts           # Constantes del juego
│   └── supabase/
│       ├── client.ts              # Browser client
│       ├── server.ts              # Server client
│       └── middleware.ts           # Session refresh
├── store/
│   └── gameStore.ts               # Zustand store
├── types/
│   └── game.ts                    # TypeScript types
└── middleware.ts                   # Next.js middleware
```

### 7.3 Base de Datos (PostgreSQL via Supabase)
```sql
Tables:
  - profiles (id, username, avatar_url, created_at)
  - player_progress (user_id, level_id, mission_id, xp, rank, virtual_capital, streak_days, ...)
  - completed_missions (user_id, mission_id, level_id, score, completed_at)
  - achievements (user_id, achievement_id, unlocked_at)
  - trading_diary (user_id, asset, direction, entry, SL, TP, reasoning, outcome, pnl, ...)
  - simulator_operations (user_id, asset, direction, entry, SL, TP, outcome, pnl, ...)

Functions:
  - handle_new_user() — Auto-creates profile + progress on signup
  - update_streak() — Trigger that manages daily streak
  - increment_xp_and_capital() — Atomic XP + capital + rank update
  - get_full_player_state() — Returns all player data in one call

Security:
  - RLS enabled on all tables
  - Per-operation policies (SELECT, INSERT, UPDATE)
  - SECURITY DEFINER on functions
```

---

## 8. CONTENIDO EDUCATIVO DETALLADO

### 8.1 Nivel 1 — Conceptos Cubiertos
1. **Mercado financiero** — qué es, quiénes participan, oferta/demanda
2. **Velas japonesas** — OHLC, cuerpo, mechas, alcista/bajista, temporalidades
3. **Tendencias** — HH/HL (alcista), LH/LL (bajista), rango lateral, FOMO, pánico
4. **Gestión de riesgo** — Stop loss, take profit, R:R ratio, regla 1-2%, drawdown
5. **Evaluación final** — Quiz integrado de todos los conceptos

### 8.2 Nivel 2 — Conceptos Cubiertos
1. **Zonas de oferta/demanda** — Institucional, frescas vs quemadas, retesteo
2. **Soporte/resistencia** — Role reversal, niveles psicológicos, rupturas/fakeouts
3. **Patrones de velas** — Doji, hammer, shooting star, engulfing, morning/evening star
4. **Tipos de órdenes** — Market, limit, stop loss, take profit, trailing stop, slippage
5. **Gran Tour** — 7 mercados, características, elección de especialización

### 8.3 Estructura de cada Quiz
- 3-4 preguntas por misión
- Escalamiento de dificultad: básico → intermedio → avanzado
- Cada pregunta tiene: concepto evaluado, 4 opciones con feedback individual, explicación general
- Conceptos validados por contexto real de trading

---

## 9. ESTADO ACTUAL DE IMPLEMENTACIÓN

### ✅ Completado
- [x] Proyecto Next.js 14 configurado con TypeScript
- [x] Tailwind CSS con tema dark personalizado completo
- [x] Supabase conectado (URL, keys, cliente browser + server)
- [x] Base de datos: migración SQL con 6 tablas + RLS + triggers + functions
- [x] Landing page con CTA
- [x] Dashboard con stats, barra XP, lista de misiones con estados
- [x] Mission engine: flujo completo intro → minigame → quiz → outro → complete
- [x] CharacterDialogue con avatares SVG 2D para 6 personajes
- [x] QuizEngine con feedback, progreso, dificultad, explicaciones
- [x] MatchTermMinigame interactivo (timer, validación, feedback visual)
- [x] Contenido completo Nivel 1 (5 misiones, ~15 quizzes, diálogos, mini-juegos)
- [x] Contenido completo Nivel 2 (5 misiones, ~20 quizzes, diálogos, mini-juegos)
- [x] 7 mercados de especialización definidos con datos completos
- [x] Sistema de auth preparado (login, register, callback, middleware)
- [x] Zustand store para estado del juego
- [x] Netlify config (netlify.toml) para deploy
- [x] Build exitoso sin errores

### 🔲 Pendiente
- [ ] Autenticación funcional (email confirmation en Supabase)
- [ ] Persistencia real de progreso (guardar misiones completadas)
- [ ] Mini-juegos faltantes: candlestick_builder, chart_tap, zone_painter, pattern_identifier, order_simulator, market_preview
- [ ] Simulador de trading con TradingView Lightweight Charts
- [ ] Panel de órdenes con Pre-Operation Checklist
- [ ] Diario de trading post-operación
- [ ] Sistema de logros con popups
- [ ] Gran Tour interactivo (mapa de mercados)
- [ ] Niveles 3-7 (contenido específico por mercado)
- [ ] Pattern Cards coleccionables
- [ ] Animaciones con Framer Motion (transiciones, personajes)
- [ ] Responsive mobile (< 768px)
- [ ] PWA / installable
- [ ] Diseño visual profesional de personajes (reemplazar SVGs por ilustraciones)

---

## 10. NOTAS PARA DISEÑO VISUAL

### 10.1 Atmósfera Deseada
- **Estética TradingView dark** — profesional, seria, pero accesible
- **Tono visual:** Cyberpunk financiero suave. No cartoon, no ultra-realista. 
- **Referentes:** Bloomberg Terminal meets Duolingo meets RPG dark fantasy
- **Sensación:** El jugador debe sentirse como si entrara a un mundo secreto de los mercados

### 10.2 Necesidades de Diseño
1. **Personajes 2D de alta calidad** — Consistentes entre sí, estilo semi-realista o anime dark. Necesitan:
   - Avatar/retrato (para diálogos) — ~200x200px
   - Cuerpo completo (para escenas) — ~400x800px
   - Variantes de expresión (neutral, hablando, enojado, feliz)
   
2. **UI Kit completo** — Botones, inputs, cards, modals, tooltips, badges, notifications

3. **Iconografía** — Set de iconos custom para: niveles, rangos, logros, mercados, tipos de orden

4. **Fondos/escenas** — Para cada nivel temático y el Gran Tour

5. **Mini-juegos** — UI específica para cada tipo de ejercicio interactivo

### 10.3 Restricciones Técnicas
- Todo se renderiza en web (HTML/CSS/SVG/Canvas)
- Los personajes actuales son SVG inline — pueden reemplazarse por PNG/WebP
- La paleta de colores está definida en Tailwind y CSS vars
- Mobile-first responsive (320px a 1920px)
- Accesibilidad: contraste WCAG AA mínimo
