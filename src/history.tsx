import { Link } from 'react-router-dom'
import { languages } from './catalog'
import type { Deck } from './decks'
import { frenchTracks } from './tracks'
import { latestReviews, modeNames } from './study'
import type { Activity } from './study'
import { grades, isDue } from './review'

const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

function dayNumber(at: number) {
  const day = new Date(at)
  return Math.floor(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()) / 86_400_000)
}

function streaks(events: Activity[]) {
  const days = [...new Set(events.map(event => dayNumber(event.at)))].sort((a, b) => a - b)
  let run = 0
  let best = 0
  let previous = -Infinity
  for (const day of days) {
    run = day === previous + 1 ? run + 1 : 1
    best = Math.max(best, run)
    previous = day
  }
  return { current: previous >= dayNumber(Date.now()) - 1 ? run : 0, best }
}

export function History({ events, synced, decks }: { events: Activity[]; synced: boolean; decks: readonly Deck[] }) {
  const sessions = events.filter(event => event.kind === 'session')
  const answers = events.filter(event => event.kind === 'answer')
  const deckCards = new Set(decks.flatMap(deck => deck.cards.map(card => card.id)))
  const reviews = Object.values(latestReviews(events)).filter(review =>
    !review.cardId?.startsWith('custom-') || deckCards.has(review.cardId),
  )
  const { current, best } = streaks(answers)
  const learned = new Set(answers.map(event => event.cardId))
  const graded = answers.filter(event => event.grade !== undefined)
  const recent = [...events].sort((a, b) => b.at - a.at || Number(b.kind === 'session') - Number(a.kind === 'session')).slice(0, 30)

  return <>
    <div className="page-title">
      <p className="eyebrow">Meu estúdio</p>
      <h1>Histórico de estudo</h1>
      <p>{synced ? 'Atividade da sua conta.' : 'Atividade salva neste navegador e dispositivo.'}</p>
    </div>
    <div className="progress-grid">
      {[
        ['Sessões concluídas', sessions.length],
        ['Respostas registradas', answers.length],
        ['Dias seguidos', current],
        ['Melhor sequência', best],
        ['Revisões disponíveis', reviews.filter(review => isDue(review.dueAt ?? Infinity, Date.now())).length],
        ['Cartas com intervalo de 21 dias ou mais', reviews.filter(review => (review.interval ?? 0) >= 21).length],
      ].map(([label, number]) => <div className="panel card-body metric" key={label}>
        <strong>{number}</strong><span>{label}</span>
      </div>)}
    </div>
    {answers.length > 0 && <section className="section studio-grid">
      <div className="panel card-body">
        <h2>Autoavaliações</h2>
        <dl className="statistics-list">
          {grades.map(grade => <div key={grade.days}>
            <dt>{grade.label}</dt>
            <dd>{graded.filter(event => event.grade === grade.days).length}</dd>
          </div>)}
        </dl>
      </div>
      <div className="panel card-body">
        <h2>Trilhas de francês</h2>
        <dl className="statistics-list">
          {frenchTracks.map(track => <div key={track.id}>
            <dt>{track.title}</dt>
            <dd>{track.cards.filter(card => learned.has(card.id)).length}/{track.cards.length} cartas</dd>
          </div>)}
        </dl>
      </div>
    </section>}
    <section className="section">
      <h2>Atividade recente</h2>
      {recent.length ? <ol className="deck-list panel card-body">
        {recent.map(event => <li key={event.id}>
          <strong>{event.title}</strong>
          <span>{languages.find(lang => lang.id === event.language)?.portuguese} · {modeNames[event.mode]} · {
            event.kind === 'session' ? `Sessão concluída · ${event.correctCount ?? 0}/${event.count ?? 0}` : 'Resposta registrada'
          }</span>
          <time dateTime={new Date(event.at).toISOString()}>{dateTime.format(event.at)}</time>
        </li>)}
      </ol> : <p>O histórico aparece após sua primeira atividade. <Link to="/laboratorio">Abrir Laboratório</Link></p>}
    </section>
  </>
}
