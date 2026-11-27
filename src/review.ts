export const grades = [
  { label: 'Não lembrei', days: 0 },
  { label: 'Difícil', days: 1 },
  { label: 'Fácil', days: 3 },
  { label: 'Muito fácil', days: 7 },
] as const

export function scheduleReview(days: number, now: number) {
  return now + days * 86_400_000
}

export function isDue(dueAt: number, now: number) {
  return dueAt <= now
}
