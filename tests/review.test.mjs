import assert from 'node:assert/strict'
import test from 'node:test'
import { grades, isDue, scheduleReview } from '../src/review.ts'

test('uma carta volta à fila no instante agendado', () => {
  const now = Date.parse('2026-11-27T15:00:00Z')
  const days = grades.find(({ label }) => label === 'Fácil').days
  const dueAt = scheduleReview(days, now)

  assert.equal(new Date(dueAt).toISOString(), '2026-11-30T15:00:00.000Z')
  assert.equal(isDue(dueAt, dueAt - 1), false)
  assert.equal(isDue(dueAt, dueAt), true)
  assert.equal(isDue(dueAt, dueAt + 1), true)
})

test('uma carta esquecida pode ser revisada imediatamente', () => {
  const now = 1000
  const days = grades.find(({ label }) => label === 'Não lembrei').days

  assert.equal(isDue(scheduleReview(days, now), now), true)
})
