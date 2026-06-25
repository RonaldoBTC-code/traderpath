/**
 * Shuffle utilities — safe for client-side use only.
 * NEVER call during SSR/initial render. Use inside useEffect or after hasMounted.
 */

/** Fisher-Yates shuffle — returns new array */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Shuffle quiz options while preserving isCorrect associations */
export function shuffleQuizOptions<T extends { id: string }>(options: T[]): T[] {
  return shuffleArray(options);
}

/** Get questions in random order with shuffled options */
export function getRandomizedQuestions<Q extends { options: { id: string }[] }>(questions: Q[]): Q[] {
  return shuffleArray(questions).map((q) => ({
    ...q,
    options: shuffleArray(q.options),
  }));
}
