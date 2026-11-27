import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { grades } from './review'
import { FileMedia, Pronunciation } from './media'
import { matchesAnswer, modeNames, sortForPractice } from './study'
import type { Activity, Card, Grade, LanguageId, Mode, ReviewMode } from './study'

type Reviews = Record<string, Activity>
export type FinishedAnswer = { card: Card; correct: boolean; grade?: Grade }

export type StudySet = {
  title: string
  language: LanguageId
  languageName: string
  cards: readonly Card[]
  mode: Mode
  back: string
}

type SessionProps = StudySet & {
  reviews: Reviews
  onAnswer: (set: StudySet, answer: FinishedAnswer) => void
  onFinish: (set: StudySet, count: number, correct: number) => void
}

function Content({ card, side, language }: { card: Card; side: 'front' | 'back'; language: LanguageId }) {
  if (side === 'front') return <>
    {card.phrase && <h2 lang={language}>{card.phrase}</h2>}
    {card.frontImage && <FileMedia kind="image" file={card.frontImage} label={card.phrase ? `Imagem de apoio: ${card.phrase}` : 'Imagem da frente'} />}
    {card.frontAudio
      ? <FileMedia kind="audio" file={card.frontAudio} label="Áudio da frente" />
      : <Pronunciation id={card.id} text={card.phrase} language={language} />}
  </>
  return <>
    {card.meaning && <p className="lead">{card.meaning}</p>}
    {card.backImage && <FileMedia kind="image" file={card.backImage} label="Imagem do verso" />}
    {card.backAudio && <FileMedia kind="audio" file={card.backAudio} label="Áudio do verso" />}
  </>
}

function GradeButtons({ choose }: { choose: (grade: Grade) => void }) {
  return <div className="actions grades">
    {grades.map((grade, index) => <button type="button" key={grade.days} className="button secondary"
      aria-keyshortcuts={String(index + 1)} onClick={() => choose(grade.days)}>
      {grade.label}
    </button>)}
  </div>
}

export function ReviewCard({ card, language, mode, done }: {
  card: Card
  language: LanguageId
  mode: ReviewMode
  done: (answer: FinishedAnswer) => void
}) {
  const [answer, setAnswer] = useState('')
  const [revealed, setRevealed] = useState(false)
  const result = useRef<HTMLDivElement>(null)
  const correct = mode === 'escrita' && matchesAnswer(answer, card)

  useEffect(() => {
    if (revealed) result.current?.focus()
  }, [revealed])

  function choose(grade: Grade) {
    done({ card, grade, correct: mode === 'escrita' ? correct : grade >= 3 })
  }

  function keyboard(event: KeyboardEvent<HTMLElement>) {
    const target = event.target as HTMLElement
    if (event.altKey || event.ctrlKey || event.metaKey || target.closest('input,textarea,select,audio,button')) return
    const grade = grades[Number(event.key) - 1]
    if (revealed && grade) {
      event.preventDefault()
      choose(grade.days)
    } else if (mode === 'flashcards' && !revealed && event.code === 'Space') {
      event.preventDefault()
      setRevealed(true)
    }
  }

  function check(event: FormEvent) {
    event.preventDefault()
    if (answer.trim()) setRevealed(true)
  }

  return <article className="panel card-body activity" onKeyDown={keyboard} tabIndex={0}>
    {mode === 'escrita' ? <>
      <p className="eyebrow">Escreva no idioma estudado</p>
      {card.meaning && <h2>{card.meaning}</h2>}
      {card.backImage && <FileMedia kind="image" file={card.backImage} label="Imagem da carta" />}
      {card.backAudio && <FileMedia kind="audio" file={card.backAudio} label="Áudio do enunciado" />}
      <form className="form-stack" onSubmit={check}>
        <label>Sua resposta<input type="text" value={answer} maxLength={600} onChange={event => setAnswer(event.target.value)}
          autoComplete="off" autoCapitalize="off" spellCheck={false} readOnly={revealed} required /></label>
        {!revealed && <button className="button" disabled={!answer.trim()}>Conferir resposta</button>}
      </form>
    </> : <Content card={card} side="front" language={language} />}
    {revealed ? <div ref={result} tabIndex={-1} className="answer-panel">
      {mode === 'escrita' ? <>
        <p role="status"><strong>{correct ? 'Resposta correta.' : 'Compare sua resposta com esta versão.'}</strong></p>
        <Content card={card} side="front" language={language} />
        <p className="muted">A conferência compara com a resposta da carta e desconsidera acentos, pontuação e maiúsculas.</p>
      </> : <Content card={card} side="back" language={language} />}
      <p>Como foi lembrar? <span className="muted">Use 1 a 4 para avaliar.</span></p>
      <GradeButtons choose={choose} />
    </div> : mode === 'flashcards' && <button type="button" className="button" aria-keyshortcuts="Space" onClick={() => setRevealed(true)}>Ver resposta</button>}
  </article>
}

function ReadingCard({ card, language, choices, done }: {
  card: Card
  language: LanguageId
  choices: Card[]
  done: (answer: FinishedAnswer) => void
}) {
  const [choice, setChoice] = useState<string | null>(null)
  const correct = choice === card.meaning

  return <div className="panel card-body activity">
    <h2 lang={language}>{card.phrase}</h2>
    <p>Qual é o sentido da expressão?</p>
    <div className="actions">
      {choices.map(option => <button type="button" className="button secondary" key={option.id}
        aria-pressed={choice === option.meaning} disabled={choice !== null}
        onClick={() => setChoice(option.meaning)}>{option.meaning}</button>)}
    </div>
    {choice && <>
      <p role="status">{correct ? 'Correto.' : `A tradução é “${card.meaning}”.`}</p>
      <button type="button" className="button" onClick={() => done({ card, correct })}>Continuar →</button>
    </>}
  </div>
}

export function PracticeSession(props: SessionProps) {
  const { reviews, onAnswer, onFinish, ...set } = props
  const { cards, mode, language, languageName, title, back } = set
  const [queue, setQueue] = useState<Card[] | null>(null)
  const [answers, setAnswers] = useState<FinishedAnswer[]>([])
  const [count, setCount] = useState('todos')
  const status = useRef<HTMLParagraphElement>(null)
  const complete = useRef<HTMLHeadingElement>(null)
  const index = answers.length
  const card = queue?.[index]
  const available = useMemo(() => mode === 'escrita' ? cards.filter(item => item.phrase && item.meaning) : cards, [mode, cards])
  const missed = answers.filter(answer => !answer.correct).map(answer => answer.card)
  const choices = card ? [...new Map([card, ...cards].map(item => [item.meaning, item])).values()]
    .slice(0, 4).sort((a, b) => a.meaning.localeCompare(b.meaning, 'pt-BR')) : []

  useEffect(() => {
    if (queue) (status.current ?? complete.current)?.focus()
  }, [queue, index])

  function start(items: readonly Card[], limit?: number) {
    const sorted = sortForPractice(items, mode, reviews, Date.now())
    setAnswers([])
    setQueue(limit ? sorted.slice(0, limit) : sorted)
  }

  function register(answer: FinishedAnswer) {
    if (!queue || card?.id !== answer.card.id) return
    const next = [...answers, answer]
    onAnswer(set, answer)
    setAnswers(next)
    if (next.length === queue.length) onFinish(set, next.length, next.filter(item => item.correct).length)
  }

  return <>
    <div className="page-title">
      <p className="eyebrow">{modeNames[mode]} · {languageName}</p>
      <h1>{title}</h1>
    </div>
    {!available.length ? <p>Este deck precisa de texto nos dois lados de ao menos uma carta para praticar escrita.</p>
      : !queue ? <form className="panel card-body form-stack activity" onSubmit={event => {
        event.preventDefault()
        start(available, count === 'todos' ? undefined : Number(count))
      }}>
        <label>Cartas por sessão<select value={count} onChange={event => setCount(event.target.value)}>
          {[1, 3, 5, 10, 20].filter(option => option < available.length).map(option => <option key={option} value={option}>{option}</option>)}
          <option value="todos">Todas ({available.length})</option>
        </select></label>
        <button className="button">Começar prática</button>
      </form>
      : card ? <>
        <p ref={status} tabIndex={-1}>Carta {index + 1} de {queue.length}</p>
        {mode === 'leitura'
          ? <ReadingCard key={card.id} card={card} language={language} choices={choices} done={register} />
          : <ReviewCard key={card.id} card={card} language={language} mode={mode} done={register} />}
      </> : <section className="panel card-body activity">
        <h2 ref={complete} tabIndex={-1}>Prática concluída</h2>
        <p>{answers.length - missed.length} de {answers.length} cartas com acerto ou boa lembrança.</p>
        {missed.length > 0 && <button type="button" className="button" onClick={() => start(missed)}>Repetir as cartas que errei</button>}
        <div className="actions account-actions">
          <button type="button" className="button secondary" onClick={() => setQueue(null)}>Nova sessão</button>
          <Link to="/historico">Ver histórico</Link>
          {mode !== 'leitura' && <Link to="/memoria">Ver revisões</Link>}
        </div>
      </section>}
    <Link className="return" to={back}>← Voltar</Link>
  </>
}
