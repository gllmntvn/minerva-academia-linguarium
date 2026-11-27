import type { Language } from './catalog'

export type LanguageId = Language['id']
export type Mode = 'flashcards' | 'leitura' | 'escrita'
export type ReviewMode = Exclude<Mode, 'leitura'>
export type Grade = 0 | 1 | 3 | 7

export type Card = {
  id: string
  phrase: string
  meaning: string
  frontAudio?: Blob
  backAudio?: Blob
  frontImage?: Blob
  backImage?: Blob
  alternatives?: readonly string[]
}

export type Activity = {
  id: string
  at: number
  language: LanguageId
  mode: Mode
  title: string
  kind: 'answer' | 'session'
  count?: number
  correctCount?: number
  correct?: boolean
  cardId?: string
  grade?: Grade
  dueAt?: number
  interval?: number
}

export const modeNames: Record<Mode, string> = {
  flashcards: 'Flashcards',
  leitura: 'Leitura',
  escrita: 'Escrita',
}

export function reviewKey(mode: Mode, cardId: string) {
  return `${mode}/${cardId}`
}

export function latestReviews(events: readonly Activity[]) {
  const result: Record<string, Activity> = {}
  for (const event of events) {
    if (!event.cardId || typeof event.dueAt !== 'number') continue
    const key = reviewKey(event.mode, event.cardId)
    if (!result[key] || result[key].at <= event.at) result[key] = event
  }
  return result
}

export function nextInterval(grade: Grade, previous = 0) {
  if (grade === 0 || grade === 1) return grade
  const factor = grade === 3 ? 2.5 : 3.5
  return Math.min(3650, Math.max(grade, Math.round(previous * factor)))
}

export function normalizeAnswer(answer: string) {
  return answer.toLocaleLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/œ/g, 'oe').replace(/æ/g, 'ae').replace(/ß/g, 'ss')
    .replace(/[’‘]/g, "'").replace(/[.,!?;:¿¡«»]/g, '')
    .replace(/\s+/g, ' ').trim()
}

export function matchesAnswer(answer: string, card: Card) {
  const normalized = normalizeAnswer(answer)
  return normalized !== '' && [card.phrase, ...(card.alternatives ?? [])].some(phrase => normalizeAnswer(phrase) === normalized)
}

export function sortForPractice(cards: readonly Card[], mode: Mode, reviews: ReturnType<typeof latestReviews>, now: number) {
  function priority(card: Card) {
    const review = reviews[reviewKey(mode, card.id)]
    if (!review) return 1
    return (review.dueAt ?? Infinity) <= now ? 0 : 2
  }
  return [...cards].sort((a, b) => priority(a) - priority(b))
}
