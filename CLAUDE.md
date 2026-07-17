# CLAUDE.md — TraderPath

Instrucciones operativas para Claude Code en este repositorio.
Verificado contra el código real el 16 jul 2026 (commit `70a63a7`).

---

## 1. Qué es esto

Videojuego web educativo de trading. El jugador aprende mercados financieros a través de misiones narrativas con personajes, mini-juegos interactivos y quizzes con feedback pedagógico, con progresión RPG (XP, rango, capital virtual).

**Principio rector, no negociable:** *el jugador no puede ejecutar una acción que no comprende*. Las mecánicas se desbloquean secuencialmente, nunca se puede saltar una misión.

Idioma: **el contenido del juego es español**. Los términos técnicos/financieros van en inglés (Stop Loss, Order Block, timeframe). El código, nombres de variables y comentarios técnicos, en inglés.

---

## 2. Comandos

```bash
npm run dev                  # dev server
npm run build                # build de producción
npm run lint                 # eslint
npx tsc --noEmit             # typecheck — DEBE dar 0 errores antes de cualquier commit
```

No hay tests. No hay CI. Si añades tooling de test, no lo metas en el mismo PR que una feature.

### Variables de entorno

Requiere `.env.local` (no está en el repo, tampoco hay `.env.example` — créalo si tocas config):

```
NEXT_PUBLIC_SUPABASE_URL=https://pxzhbhkztlvdswksptta.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

Sin estas variables el build compila pero el runtime de auth rompe.

---

## 3. Arquitectura

```
src/
├── app/
│   ├── (auth)/login|register/page.tsx   Auth con Supabase
│   ├── (game)/layout.tsx                Header HUD (client component, SIN guard de auth)
│   ├── (game)/dashboard/page.tsx        Lista misiones del nivel actual
│   ├── (game)/mission/[id]/page.tsx     ⚠️ Motor universal de misiones (507 líneas)
│   ├── (game)/world/page.tsx            Mundo explorable (dashboard redirige aquí)
│   ├── auth/callback/route.ts           OAuth callback
│   └── globals.css                      Design tokens VDD v2.0
├── components/game/                     10 mini-juegos + QuizEngine + MissionTutorial
├── components/narrative/                CharacterDialogue + 6 retratos SVG cartoon
├── components/world/AcademyWorld.tsx    Shell React del mundo (HUD, paneles, salas)
├── game/phaser/                         4 escenas Phaser + characterArt.ts compartido
├── lib/content/level1.ts                Tipos raíz + 5 misiones N1
├── lib/content/level2.ts                5 misiones N2 + los 7 mercados
├── lib/content/level3-crypto.ts         5 misiones N3 Crypto
├── lib/supabase/                        Clientes browser/server/middleware
├── store/gameStore.ts                   Zustand + persist (localStorage)
├── types/game.ts                        Tipos de las tablas de Supabase (NO los del contenido)
└── middleware.ts                        Refresca sesión — no protege rutas
supabase/migrations/001_initial.sql      6 tablas + RLS + 2 funciones + 2 triggers
```

### Cadena de tipos del contenido — leer antes de tocar `lib/content/`

Los tipos **no** viven en `types/game.ts`. Viven en `level1.ts` y cada nivel los extiende:

```
level1.ts    → CharacterId, DialogueEntry, QuizQuestion, MissionRewards,
               Mission, Minigame, MinigameType (5 tipos)
level2.ts    → importa de level1, define Level2MinigameType (9 tipos),
               Level2Minigame, Level2Mission extends Omit<Mission,"minigame">
level3-crypto.ts → importa de level2, define Level3CryptoMinigameType
               (= Level2MinigameType + 6 crypto), Level3Mission
```

`types/game.ts` describe las **tablas de Supabase**, es un archivo distinto y no se cruza con el contenido. No los mezcles.

**Consecuencia:** para añadir un tipo de mini-juego nuevo hay que ampliar la unión del nivel correspondiente, no la de `level1.ts`. Este patrón escala mal — si vas a crear los 6 niveles 3 restantes, considera primero extraer los tipos a `lib/content/types.ts` con una única unión `MinigameType`, en un PR aparte que no cambie comportamiento.

---

## 4. Flujo de una misión

```
intro (diálogos) → tutorial (MissionTutorial) → minigame → quiz → outro → complete
```

Implementado como una máquina de estados con `useState<Phase>` en `app/(game)/mission/[id]/page.tsx`.

Detalles que importan:
- Las misiones boss (`m1_5`, `m2_5`, `m3c_5`) exigen ≥75% en el quiz. Si fallan, `handleQuizComplete` hace `return` — el jugador **se queda congelado en la pantalla del quiz sin mensaje ni salida**. Hay que arreglarlo cuando toques esa zona.
- `?dev=true` en la URL saltea el chequeo de desbloqueo.
- El contenido de los tutoriales está **hardcodeado en un objeto de 200+ líneas dentro del page component** (`getMissionTutorial`). Debería vivir en los archivos de contenido junto a su misión. Muévelo cuando toques esa función.

### Cómo añadir un mini-juego

1. Añade el literal a la unión del nivel (`Level3CryptoMinigameType`, etc.).
2. Define `minigame: { id, type, title, description, instructions, config, passingScore, virtualCapitalReward }` en el archivo de contenido.
3. Crea el componente en `components/game/`. Contrato: recibe props tipadas desde `config`, llama `onComplete(score?: number)` al terminar.
4. Registra una rama en la cadena ternaria de `phase === "minigame"` en `mission/[id]/page.tsx`.
5. Añade el tutorial en `getMissionTutorial`.

**Si no registras la rama, cae al fallback**: un botón "Completar mini-juego →" que da la misión por superada sin hacer nada. Así están hoy los 5 mini-juegos del Nivel 3.

---

## 5. Design system (VDD v2.0 — "Día de Mercado", cartoon claro)

Dirección visual estilo Club Penguin: mundo diurno, colorido y amable. Los nombres
de token se conservaron de v1.0; solo cambiaron los valores (jul 2026).

| Token | Hex | Uso |
|---|---|---|
| `tp-base` | #EAF4FE | Fondo (celeste claro) |
| `tp-surface` | #FFFFFF | Cards, paneles, burbujas |
| `tp-surface-alt` | #F1F8FF | Hover |
| `tp-border` | #C9DCEF | Bordes (usar `border-2`, look chunky) |
| `tp-text` | #1E2A44 | Texto (navy) — también tinta sobre botones dorados |
| `tp-text-muted` | #5D6E8C | Secundario |
| `tp-gold` | #E5960A | XP, logros, marca, CTAs (ámbar) |
| `tp-demand` | #16A34A | Alcista, ganancias |
| `tp-supply` | #DC2626 | Bajista, pérdidas |
| `tp-info` | #2563EB | ARIA |
| `tp-warning` | #D97706 | Precaución |

Fuentes: `font-display` (Baloo 2 — redonda cartoon, títulos y CTAs), `font-body`
(DM Sans), `font-data` (JetBrains Mono — todo dato numérico, precios, XP).

Solo estos tokens. Nada de `bg-gray-*`, ni hex sueltos. Los valores viven
duplicados en `globals.css` y `tailwind.config.ts` — si cambias uno, cambia el
otro (no migrar a `var()` sin resolver los modificadores `/10` de Tailwind).

Idioma de botones: texto navy (`text-tp-text`) sobre fondos de acento (dorado,
crypto); blanco solo sobre `tp-info`/`tp-supply`. El arte de personajes del
mundo Phaser vive en `src/game/phaser/characterArt.ts` — una sola
implementación para Explorador, ARIA y NPCs en todas las escenas.

---

## 6. Personajes

| ID | Nombre | Rol |
|---|---|---|
| `el_viejo_marco` | El Viejo Marco | Mentor (habla vía diario) |
| `aria` | ARIA | Guía IA |
| `el_especulador` | El Especulador | Antagonista — codicia |
| `la_señorita_fomo` | La Señorita FOMO | Antagonista — FOMO |
| `don_panico` | Don Pánico | Antagonista — pánico |
| `narrator` | Narrador | Narrativa |

Los antagonistas no son villanos de caricatura: encarnan errores psicológicos reales y **a veces tienen razón**. Mantén ese matiz al escribir diálogos.

---

## 7. Estado y progresión

`store/gameStore.ts`, Zustand + `persist` con key `traderpath-progress`. Fuente de verdad: **localStorage únicamente**. Supabase hoy sirve solo para auth.

```
completeMission(levelId, missionId, score)  suma XP/capital, avanza puntero
isMissionCompleted / isMissionUnlocked / getMissionStatus → "locked"|"available"|"completed"
setMarketSpecialization(market)             se elige en m2_5
useMarketChange(newMarket)                  cambio único, borra progreso de nivel 3
resetProgress()                             dev tool
```

Ruta: `level_1` (m1_1…m1_5) → `level_2` (m2_1…m2_5) → `level_3_crypto` (m3c_1…m3c_5).

Rangos por XP: Novato 0 · Aprendiz 1 000 · Analista 2 500 · Estratega 5 000 · Operador 8 500 · Trader 13 000 · Profesional 18 500 · Leyenda 25 000.

---

## 8. Reglas de desarrollo

1. **Verifica antes de afirmar.** `npx tsc --noEmit` y `npm run build` en verde antes de decir que algo funciona. Sin excepciones.
2. **No inventes hydration errors.** Todo lo que lea de localStorage o aleatorice pasa por `useHasMounted` o `useEffect`. El dashboard y el layout ya tienen el patrón — cópialo.
3. **Progresión secuencial.** Nunca permitas saltar una misión. Nunca des recompensa doble (`completeMission` ya deduplica; no lo rompas).
4. **Feedback educativo siempre.** Nunca "incorrecto" a secas. Cada opción de quiz lleva su `feedback` explicando *por qué*. Es la regla pedagógica central.
5. **Tema claro cartoon (VDD v2.0).** Fondo celeste, superficies blancas, texto navy. Los charts van sobre blanco con los acentos v2. Excepción permitida: escenas ilustradas autocontenidas (postales de ciudad) pueden tener su propia iluminación.
6. **Mobile-first**, desde 375px.
7. **Trabaja sobre lo existente.** No reescribas componentes que funcionan para "mejorarlos".
8. **Reglas pedagógicas del dominio, inviolables:** el Stop Loss se define *antes* de que el simulador se desbloquee; toda señal de patrón exige confirmación antes de operar; el checklist de 7 pasos se completa antes de cualquier operación.

---

## 9. Estado real y prioridades

### Funciona (verificado)
15 misiones (5+5+5) · 10 mini-juegos · QuizEngine con aleatorización Fisher-Yates · MissionTutorial · progresión XP/capital/rango · persistencia localStorage · registro y login Supabase · schema SQL completo con RLS · design system · 6 personajes · `tsc` limpio · build de producción limpio.

### Bugs conocidos, por severidad

**🔴 CRÍTICO — softlock al elegir cualquier mercado que no sea crypto.**
`MarketPreview` deja elegir los 7 mercados, pero solo existe `level_3_crypto`. Si el jugador elige forex (o cualquier otro):
`getNextLevelId()` lo manda igual a `level_3_crypto` (fallback "Default to crypto for MVP"), pero `isLevelUnlocked()` exige `specialization === "crypto"` y devuelve `false`. Resultado: puntero en un nivel cuyas misiones están todas 🔒 para siempre. **6 de 7 rutas terminan en un juego imposible de continuar.**
Arreglo mínimo: marcar los 6 mercados restantes como "próximamente" y no seleccionables. Arreglo real: crear los niveles 3 faltantes.

**🟠 ALTO — el registro inserta filas que el trigger ya creó.**
`handle_new_user()` (migración, línea 353) ya crea `profiles` + `player_progress` al insertarse el usuario en `auth.users`. `register/page.tsx` (líneas 33 y 36) los inserta *otra vez* → violación de PK en `profiles.id` y de `UNIQUE(user_id)` en `player_progress`. El usuario ve un error aunque el alta haya funcionado. Además el insert manual usa `mission_id: "M1"` y el trigger `'m1_1'`. Borra los inserts manuales del register.

**🟠 ALTO — las rutas del juego no están protegidas.**
`middleware.ts` solo refresca la sesión; `(game)/layout.tsx` es un client component sin guard. `/dashboard` y `/mission/*` son accesibles sin sesión. La auth hoy es decorativa.

**🟡 MEDIO — el quiz boss congela al fallar.** Ver §4.
**🟡 MEDIO — `mission_id TEXT NOT NULL DEFAULT 'M1'`** en el schema, formato inconsistente con `m1_1`.

### Cola de trabajo sugerida

1. Softlock de mercados (§bug crítico) — es lo único que hace el juego injugable.
2. Limpiar el registro y proteger rutas.
3. Los 5 mini-juegos del Nivel 3 Crypto, hoy placeholders: `pair_calculator`, `dominance_gauge`, `cycle_mapper`, `timeframe_switcher`, `fear_greed_slider`. La `config` de cada uno ya está escrita en `level3-crypto.ts` — solo falta el componente y su rama en el motor.
4. Sincronización con Supabase: escribir en `completed_missions` y `player_progress`, hidratar desde `get_full_player_state()` al login, localStorage como caché y DB como fuente de verdad.
5. Simulador de trading con Lightweight Charts (ya es dependencia, aún sin usar): velas, panel de órdenes con SL/TP, checklist de 7 pasos, diario obligatorio post-operación.
6. Niveles 3 restantes (forex, stocks, commodities, indices, futures, etfs) y Nivel 4.
7. Media/baja: WorldMap visual, escenas educativas, sprites SVG, animaciones Framer Motion, sistema de logros, responsive completo, ciudades con identidad visual, deploy.

---

## 10. Deploy

Hay `netlify.toml` (`@netlify/plugin-nextjs`). La documentación previa menciona Vercel. **Están en conflicto — decide uno antes de configurar deploy.**

---

## 11. Notas sobre la documentación existente

`CODEX_CONTEXT.md` fue escrito para otro agente y sigue siendo útil, pero afirma "100% funcional" y no menciona ninguno de los bugs de §9. Este archivo (`CLAUDE.md`) tiene precedencia. `README.md` menciona shadcn/ui, que **no** es una dependencia real del proyecto.
