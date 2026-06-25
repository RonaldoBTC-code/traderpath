# TraderPath — Sistema de Aprendizaje Guiado

## Flujo educativo de cada misión

```
INTRO (narrativa) → TUTORIAL (concepto + ejemplo + pasos) → MINI-JUEGO → QUIZ → OUTRO → RECOMPENSA
```

Cada misión pasa por 6 fases. La fase TUTORIAL es nueva y se muestra antes del mini-juego para que el jugador entienda QUÉ va a hacer y POR QUÉ.

---

## Estructura del Tutorial (`TutorialContent`)

Cada misión que tiene mini-juego incluye un tutorial con estos campos:

| Campo | Descripción |
|-------|-------------|
| `title` | Nombre corto del concepto |
| `learningObjective` | Qué va a aprender (una frase) |
| `conceptExplanation` | Explicación del concepto en 2-3 oraciones |
| `practicalExample` | Ejemplo concreto con números reales |
| `stepByStepInstructions` | Array de pasos que el jugador debe seguir |
| `commonMistakes` | Errores frecuentes que cometen los principiantes |
| `hint` | Pista breve disponible durante el mini-juego |

---

## Cómo se muestra el tutorial

El componente `MissionTutorial` muestra el contenido en 4 pantallas progresivas:

1. **Objetivo** — qué va a aprender
2. **Concepto** — explicación del tema
3. **Ejemplo** — caso práctico con datos
4. **Instrucciones** — pasos + errores comunes + botón "Comenzar"

El jugador puede navegar adelante/atrás entre las pantallas.

---

## Aleatorización de Quizzes

El `QuizEngine` ahora aleatoriza:
- El ORDEN de las preguntas
- El ORDEN de las opciones dentro de cada pregunta

Esto se hace en `useEffect` (solo en cliente, después del montaje) para evitar hydration errors.

La respuesta correcta se mantiene porque cada opción tiene `isCorrect: boolean` — no depende del orden.

Utilidades: `src/lib/utils/shuffle.ts`
- `shuffleArray<T>()` — Fisher-Yates shuffle genérico
- `shuffleQuizOptions()` — shuffle de opciones preservando isCorrect
- `getRandomizedQuestions()` — shuffle de preguntas + opciones

---

## Sistema de Pistas (Hints)

Cada mini-juego y quiz tiene un botón "¿Necesitas una pista?" que:
- NO revela la respuesta directamente
- Orienta el pensamiento del jugador
- Recuerda el concepto clave

Ejemplo: "Recuerda: si la vela es alcista, Close debe ser mayor que Open."

---

## Feedback Educativo

El feedback nunca dice solo "correcto" o "incorrecto". Siempre incluye:

### Feedback correcto:
```
✅ ¡Correcto!
[Explicación de POR QUÉ es correcto]
[Qué concepto se aplicó]
```

### Feedback incorrecto:
```
❌ No exactamente.
[Qué hizo mal específicamente]
[Cómo debería pensarlo]
[Cuál era la respuesta correcta y por qué]
```

---

## Cómo agregar una nueva misión educativa

1. Definir la misión en `src/lib/content/levelX.ts` con:
   - `introDialogues` — contexto narrativo
   - `outroDialogues` — cierre reflexivo
   - `quiz` — preguntas con feedback por opción + explanation
   - `minigame` — tipo + config

2. Agregar tutorial en `getMissionTutorial()` (mission page) con:
   - `learningObjective`
   - `conceptExplanation`
   - `practicalExample`
   - `stepByStepInstructions`
   - `commonMistakes`
   - `hint`

3. Si el mini-juego es un tipo nuevo, crear componente en `src/components/game/` y conectarlo en el render chain de la mission page.

---

## Redacción de instrucciones

### Reglas:
- Usar verbos imperativos: "Observa", "Identifica", "Calcula"
- Máximo 7 pasos
- Cada paso = una acción concreta
- No incluir teoría en los pasos (eso va en conceptExplanation)

### Reglas de feedback:
- Nunca decir "Incorrecto" sin explicar POR QUÉ
- Usar datos concretos del escenario: "Open (100) es mayor que High (95) — eso es imposible"
- Reforzar el concepto positivamente cuando acierta
- No ser condescendiente ni excesivamente formal
