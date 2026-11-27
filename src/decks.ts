import { useEffect, useState } from 'react'
import type { Card, LanguageId } from './study'

export type Deck = {
  id: string
  title: string
  language: LanguageId
  scope: string
  cards: Card[]
}

const bucket = 'decks'
let database: Promise<IDBDatabase> | undefined

function open() {
  if (!database) database = new Promise((resolve, reject) => {
    const request = indexedDB.open('minerva-library', 1)
    request.onupgradeneeded = () => {
      const decks = request.result.createObjectStore(bucket, { keyPath: 'id' })
      decks.createIndex('scope', 'scope')
    }
    request.onsuccess = () => {
      request.result.onversionchange = () => {
        request.result.close()
        database = undefined
      }
      resolve(request.result)
    }
    request.onerror = () => {
      database = undefined
      reject(request.error)
    }
  })
  return database
}

async function readDecks(scope: string) {
  const db = await open()
  return new Promise<Deck[]>((resolve, reject) => {
    const request = db.transaction(bucket).objectStore(bucket).index('scope').getAll(scope)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function changeDeck(scope: string, id: string, change: (previous: Deck | undefined) => Deck | undefined, create: boolean) {
  const db = await open()
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(bucket, 'readwrite')
    const store = transaction.objectStore(bucket)
    const request = store.get(id)
    request.onsuccess = () => {
      const previous = request.result as Deck | undefined
      if (create ? previous : previous?.scope !== scope) {
        transaction.abort()
        return
      }
      const next = change(previous)
      if (next) store.put(next)
      else store.delete(id)
    }
    transaction.oncomplete = () => resolve()
    transaction.onabort = () => reject(transaction.error ?? new Error('Não foi possível alterar o deck.'))
  })
}

export function useDecks(scope: string) {
  const [decks, setDecks] = useState<Deck[] | null>(null)
  const [issue, setIssue] = useState('')

  useEffect(() => {
    let active = true
    readDecks(scope).then(
      result => { if (active) setDecks(result) },
      () => { if (active) setIssue('O navegador não abriu seu espaço de decks.') },
    )
    return () => { active = false }
  }, [scope])

  async function save(id: string, update: (deck: Deck | undefined) => Deck | undefined, create = false) {
    await changeDeck(scope, id, update, create)
    setDecks(await readDecks(scope))
    setIssue('')
  }

  return {
    decks, issue,
    create: (title: string, language: LanguageId) => {
      const id = crypto.randomUUID()
      return save(id, () => ({ id, title, language, scope, cards: [] }), true)
    },
    edit: (id: string, title: string, language: LanguageId) => save(id, deck => deck && { ...deck, title, language }),
    remove: (id: string) => save(id, () => undefined),
    saveCard: (id: string, card: Card) => save(id, deck => {
      if (!deck) return
      const cards = deck.cards.some(item => item.id === card.id)
        ? deck.cards.map(item => item.id === card.id ? card : item)
        : [...deck.cards, card]
      return { ...deck, cards }
    }),
    removeCard: (id: string, cardId: string) => save(id, deck => deck && {
      ...deck, cards: deck.cards.filter(card => card.id !== cardId),
    }),
  }
}

export type DeckStore = ReturnType<typeof useDecks>
