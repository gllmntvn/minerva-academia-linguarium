import { useCallback, useEffect, useRef, useState } from 'react'
import { languages } from './catalog'
import { modeNames } from './study'
import type { Activity } from './study'
import { supabase } from './supabase'

const key = 'minerva.study.v1'
const pageSize = 1000

function isActivity(value: unknown): value is Activity {
  if (!value || typeof value !== 'object') return false
  const event = value as Partial<Activity>
  return typeof event.id === 'string' && typeof event.at === 'number' && Number.isFinite(new Date(event.at).getTime())
    && typeof event.title === 'string' && languages.some(language => language.id === event.language)
    && (event.kind === 'session' || event.kind === 'answer') && Object.hasOwn(modeNames, event.mode ?? '')
    && (event.dueAt === undefined || (typeof event.dueAt === 'number' && Number.isFinite(new Date(event.dueAt).getTime())))
    && (event.cardId === undefined || typeof event.cardId === 'string')
}

function readLocal(): Activity[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(key) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isActivity) : []
  } catch {
    return []
  }
}

function merge(left: Activity[], right: Activity[]) {
  const byId = new Map([...left, ...right].map(event => [event.id, event]))
  return [...byId.values()].sort((a, b) => a.at - b.at)
}

export function useActivity(userId?: string) {
  const [events, setEvents] = useState<Activity[]>(() => userId ? [] : readLocal())
  const [issue, setIssue] = useState('')
  const [pendingCount, setPendingCount] = useState(0)
  const pending = useRef(new Map<string, Activity>())
  const sending = useRef(false)
  const localEvents = useRef(events)

  const sync = useCallback(async () => {
    if (!userId || !supabase || sending.current) return
    sending.current = true
    try {
      while (pending.current.size) {
        const batch = [...pending.current.values()].slice(0, 100)
        const { error } = await supabase.from('study_events').upsert(batch.map(event => ({
          user_id: userId,
          id: event.id,
          occurred_at: new Date(event.at).toISOString(),
          payload: event,
        })), { onConflict: 'user_id,id', ignoreDuplicates: true })
        if (error) throw error
        batch.forEach(event => pending.current.delete(event.id))
        setPendingCount(pending.current.size)
      }
      setIssue('')
    } catch {
      setIssue('Histórico pendente de sincronização. Mantenha esta aba aberta e tente novamente.')
    } finally {
      sending.current = false
    }
  }, [userId])

  useEffect(() => {
    if (!userId) {
      const update = (event: StorageEvent) => {
        if (event.key === key || event.key === null) {
          localEvents.current = readLocal()
          setEvents(localEvents.current)
        }
      }
      window.addEventListener('storage', update)
      return () => window.removeEventListener('storage', update)
    }
    if (!supabase) return
    const client = supabase
    const controller = new AbortController()
    async function load() {
      try {
        const saved: Activity[] = []
        for (let offset = 0; ; offset += pageSize) {
          const { data, error } = await client.from('study_events').select('payload').eq('user_id', userId)
            .order('occurred_at').order('id').range(offset, offset + pageSize - 1).abortSignal(controller.signal)
          if (error) throw error
          saved.push(...data.map(row => row.payload).filter(isActivity))
          if (data.length < pageSize) break
        }
        if (!controller.signal.aborted) setEvents(current => merge(saved, current))
      } catch {
        if (!controller.signal.aborted) setIssue('Não foi possível carregar o histórico da conta. Recarregue para tentar novamente.')
      }
    }
    void load()
    window.addEventListener('online', sync)
    return () => {
      controller.abort()
      window.removeEventListener('online', sync)
    }
  }, [userId, sync])

  function add(data: Omit<Activity, 'id' | 'at'>) {
    const event: Activity = { ...data, id: crypto.randomUUID(), at: Date.now() }
    if (userId) {
      pending.current.set(event.id, event)
      setEvents(current => [...current, event])
      setPendingCount(pending.current.size)
      void sync()
    } else {
      const next = merge(merge(readLocal(), localEvents.current), [event])
      localEvents.current = next
      setEvents(next)
      try {
        window.localStorage.setItem(key, JSON.stringify(next))
        setIssue('')
      } catch {
        setIssue('O navegador não conseguiu salvar o histórico. A atividade pode se perder ao recarregar.')
      }
    }
  }

  return { events, add, issue, sync, pendingCount }
}
