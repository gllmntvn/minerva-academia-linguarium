import assert from 'node:assert/strict'
import test from 'node:test'
import { latestReviews, matchesAnswer, nextInterval, reviewKey, sortForPractice } from '../src/study.ts'

test('a escrita aceita diferenças de acentuação, apóstrofo e caixa, e recusa outra frase', () => {
  const card = { id: 'fr-hello', phrase: 'Bonjour, je m’appelle Camille.', meaning: 'Olá, meu nome é Camille.' }
  assert.equal(matchesAnswer(" BONJOUR je m'appelle  Camille!", card), true)
  assert.equal(matchesAnswer('Je m’appelle Camille.', card), false)
  assert.equal(matchesAnswer('   ', card), false)
  assert.equal(matchesAnswer('Café', { ...card, phrase: 'Je prends un café', alternatives: ['Café'] }), true)
})

test('a repetição aumenta o intervalo de acordo com a avaliação', () => {
  assert.equal(nextInterval(3), 3)
  assert.equal(nextInterval(3, 3), 8)
  assert.equal(nextInterval(7, 8), 28)
  assert.equal(nextInterval(0, 28), 0)
  assert.equal(nextInterval(7, 3650), 3650)
})

test('escrita e flashcards mantêm revisões independentes', () => {
  const events = [
    { at: 1, mode: 'escrita', cardId: 'fr-hello', dueAt: 1 },
    { at: 2, mode: 'flashcards', cardId: 'fr-hello', dueAt: 5 },
    { at: 3, mode: 'escrita', cardId: 'fr-hello', dueAt: 8 },
  ]
  const reviews = latestReviews(events)
  assert.equal(reviews[reviewKey('escrita', 'fr-hello')].dueAt, 8)
  assert.equal(reviews[reviewKey('flashcards', 'fr-hello')].dueAt, 5)
  const cards = [{ id: 'fr-other' }, { id: 'fr-hello' }]
  assert.deepEqual(sortForPractice(cards, 'flashcards', reviews, 5).map(card => card.id), ['fr-hello', 'fr-other'])
  assert.deepEqual(sortForPractice(cards, 'escrita', reviews, 5).map(card => card.id), ['fr-other', 'fr-hello'])
})
