import { StrictMode, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Link, Navigate, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { languages, levels, qecr } from './catalog'
import type { Session } from '@supabase/supabase-js'
import type { Language } from './catalog'
import { Account, useAccount } from './account'
import { useActivity } from './activity'
import { useDecks } from './decks'
import type { DeckStore } from './decks'
import { History } from './history'
import { PracticeSession, ReviewCard } from './practice'
import type { FinishedAnswer, StudySet } from './practice'
import { isDue, scheduleReview } from './review'
import { DeckPage, Scriptorium } from './scriptorium'
import { latestReviews, modeNames, nextInterval, reviewKey } from './study'
import type { Activity, Mode, ReviewMode } from './study'
import { academyCards, frenchTracks, writingCards } from './tracks'
import '@fontsource/bodoni-moda/latin-600.css'
import '@fontsource/eb-garamond/latin-400.css'
import '@fontsource/eb-garamond/latin-400-italic.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import './style.css'

const asset = (name: string) => `${import.meta.env.BASE_URL}art/${name}.svg`
const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
type Reviews = ReturnType<typeof latestReviews>
type PracticeHandlers = {
  reviews: Reviews
  onAnswer: (set: StudySet, answer: FinishedAnswer) => void
  onFinish: (set: StudySet, count: number, correct: number) => void
}

function PageTitle({ label, title, children }: { label?: string; title: string; children?: ReactNode }) {
  return <div className="page-title">
    {label && <p className="eyebrow">{label}</p>}
    <h1>{title}</h1>
    {children && <p className="lead">{children}</p>}
  </div>
}

function Shell() {
  const { session, ready } = useAccount()
  return ready
    ? <LearningApp key={session?.user.id ?? 'guest'} session={session} />
    : <main className="wrap"><p role="status">Carregando a Minerva…</p></main>
}

function LearningApp({ session }: { session: Session | null }) {
  const { pathname } = useLocation()
  const [preferred, setPreferred] = useState<Language['id']>('en')
  const activity = useActivity(session?.user.id)
  const store = useDecks(session?.user.id ?? 'guest')
  const reviews = latestReviews(activity.events)

  const practice: PracticeHandlers = {
    reviews,
    onAnswer(set, answer) {
      const previous = reviews[reviewKey(set.mode, answer.card.id)]
      const record: Omit<Activity, 'id' | 'at'> = {
        title: set.title, language: set.language, mode: set.mode,
        kind: 'answer', cardId: answer.card.id, correct: answer.correct,
      }
      if (answer.grade !== undefined) {
        record.grade = answer.grade
        record.interval = nextInterval(answer.grade, previous?.interval)
        record.dueAt = scheduleReview(record.interval, Date.now())
      }
      activity.add(record)
    },
    onFinish(set, count, correctCount) {
      activity.add({ title: set.title, language: set.language, mode: set.mode, kind: 'session', count, correctCount })
    },
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    document.getElementById('conteudo')?.focus()
  }, [pathname])

  return <>
    {pathname !== '/conta' && new URLSearchParams(location.search).has('redefinir') && <Navigate to="/conta" replace />}
    <button type="button" className="skip" onClick={() => document.getElementById('conteudo')?.focus()}>
      Pular para o conteúdo
    </button>
    <div className="preview">{session
      ? 'Histórico da conta · Decks salvos neste navegador'
      : 'Estudo sem conta · Histórico e decks salvos neste navegador'}</div>
    <header className="top">
      <Link className="brand" to="/" aria-label="Minerva — início">
        <img width="56" height="56" src={asset('emblema')} alt="" />
        <span>MINERVA<small>ACADEMIA LINGUARIUM</small></span>
      </Link>
      <nav aria-label="Navegação principal">
        <NavLink to="/academia">Academia</NavLink>
        <NavLink to="/laboratorio">Laboratório</NavLink>
        <NavLink to="/estudio">Meu estúdio</NavLink>
        <NavLink to="/memoria">Memoria</NavLink>
        <NavLink to="/scriptorium">Meus decks</NavLink>
        <NavLink to="/conta">Conta</NavLink>
      </nav>
    </header>
    <main id="conteudo" className="wrap" tabIndex={-1}>
      {activity.issue && <div className="status-note" role="status">
        <p>{activity.issue}</p>
        {activity.pendingCount > 0 && <button type="button" className="button secondary" onClick={() => void activity.sync()}>Tentar sincronizar</button>}
      </div>}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/academia" element={<Academy />} />
        <Route path="/academia/:id" element={<LanguagePage />} />
        <Route path="/academia/:id/a1" element={<Lesson />} />
        <Route path="/academia/:id/a1/flashcards" element={<Practice mode="flashcards" {...practice} />} />
        <Route path="/academia/:id/a1/leitura" element={<Practice mode="leitura" {...practice} />} />
        <Route path="/laboratorio" element={<Laboratory />} />
        <Route path="/laboratorio/:id/escrita" element={<Practice mode="escrita" {...practice} />} />
        <Route path="/laboratorio/fr/trilhas/:track" element={<TrackPractice {...practice} />} />
        <Route path="/estudio" element={<Studio language={preferred} changeLanguage={setPreferred} />} />
        <Route path="/memoria" element={<Memory {...practice} decks={store.decks ?? []} />} />
        <Route path="/scriptorium" element={<Scriptorium store={store} />} />
        <Route path="/scriptorium/:id" element={<DeckPage store={store} />} />
        <Route path="/scriptorium/:id/:mode" element={<DeckPractice store={store} {...practice} />} />
        <Route path="/historico" element={<History events={activity.events} synced={Boolean(session)} decks={store.decks ?? []} />} />
        <Route path="/conta" element={<Account session={session} pendingHistory={activity.pendingCount > 0} />} />
        <Route path="/bibliotheca" element={<Library />} />
        <Route path="/metodologia" element={<Method />} />
        <Route path="/privacidade" element={<Privacy />} />
        <Route path="*" element={<Missing />} />
      </Routes>
    </main>
    <footer className="footer">
      <span>Minerva — Academia Linguarium</span>
      <Link to="/bibliotheca">Bibliotheca</Link>
      <Link to="/metodologia">Metodologia</Link>
      <Link to="/privacidade">Privacidade</Link>
    </footer>
  </>
}

function LanguageCards() {
  return <div className="catalog">
    {languages.map(language => <article className="panel language" key={language.id}>
      <img src={asset(language.id)} alt="" width="360" height="135" />
      <div className="card-body">
        <h3 lang={language.id}>{language.name}</h3>
        <p>{language.portuguese} · {language.city}</p>
        <Link className="button secondary" to={`/academia/${language.id}`} aria-label={`Explorar ${language.portuguese}`}>Explorar →</Link>
      </div>
    </article>)}
  </div>
}

function Home() {
  return <>
    <section className="hero">
      <div>
        <p className="eyebrow">Academia Linguarium</p>
        <h1>Uma língua.<br />Um novo mundo.</h1>
        <p className="lead">Descubra outras culturas e cultive o conhecimento no seu próprio ritmo.</p>
        <div className="actions">
          <Link className="button" to="/estudio">Começar a estudar →</Link>
          <Link className="button secondary" to="/metodologia">Conhecer o método</Link>
        </div>
      </div>
      <img className="hero-art" src={`${import.meta.env.BASE_URL}art/minerva-estatua.webp`} width="640" height="800"
        alt="Estátua de corpo inteiro da Minerva, com elmo, lança e escudo." />
    </section>
    <section className="section">
      <h2>Escolha seu idioma</h2>
      <p>Experimente uma amostra A1 de cada idioma.</p>
      <LanguageCards />
    </section>
  </>
}

function Academy() {
  return <>
    <PageTitle label="Academia" title="Cinco línguas, novos horizontes.">
      O percurso é organizado do A1 ao C2 pelo QECR. Comece com uma amostra A1 por idioma e explore as trilhas de francês no Laboratório.
    </PageTitle>
    <LanguageCards />
  </>
}

function LanguagePage() {
  const { id } = useParams()
  const language = languages.find(item => item.id === id)
  if (!language) return <Missing />
  return <>
    <PageTitle label="Academia" title={language.portuguese}>{language.city} · Percurso do A1 ao C2</PageTitle>
    <div className="level-grid">
      {levels.map(level => <article className="panel card-body" key={level}>
        <h2>{level}</h2>
        {level === 'A1'
          ? <><p>{language.lessonTitle} · Amostra de lição</p><Link className="button" to="a1">Abrir amostra A1 →</Link></>
          : <p className="muted">Conteúdo previsto</p>}
      </article>)}
    </div>
    {language.id === 'fr' && <section className="section"><h2>Trilhas de francês</h2><FrenchTracks /></section>}
    <Link className="return" to="/academia">← Todos os idiomas</Link>
  </>
}

function Lesson() {
  const { id } = useParams()
  const language = languages.find(item => item.id === id)
  if (!language) return <Missing />
  return <>
    <PageTitle label={`Academia · ${language.portuguese} · A1`} title={language.lessonTitle}>
      Nesta amostra, você vai reconhecer um cumprimento, uma apresentação e uma resposta breve.
    </PageTitle>
    <ol className="examples">
      {language.examples.map(example => <li className="panel card-body" key={example.id}>
        <h2 lang={language.id}>{example.phrase}</h2>
        <p>{example.meaning}</p>
        <p>{example.usage}</p>
      </li>)}
    </ol>
    <div className="actions">
      <Link className="button" to="flashcards">Praticar com flashcards →</Link>
      <Link className="button secondary" to="leitura">Praticar leitura</Link>
      <Link className="button secondary" to={`/laboratorio/${language.id}/escrita`}>Deck de escrita</Link>
      <Link to={`/academia/${id}`}>Voltar ao idioma</Link>
    </div>
  </>
}

function Practice({ mode, ...handlers }: { mode: Mode } & PracticeHandlers) {
  const { id } = useParams()
  const language = languages.find(item => item.id === id)
  if (!language) return <Missing />
  const base = `/academia/${language.id}/a1`
  return <PracticeSession key={`${id}-${mode}`} title={mode === 'escrita' ? 'Deck de escrita' : language.lessonTitle}
    mode={mode} language={language.id} languageName={language.portuguese}
    cards={mode === 'escrita' ? writingCards(language.id) : academyCards(language.id)} back={base} {...handlers} />
}

function TrackPractice(handlers: PracticeHandlers) {
  const { track } = useParams()
  const match = frenchTracks.find(item => item.id === track)
  if (!match) return <Missing />
  return <PracticeSession key={match.id} title={match.title} mode="flashcards" language="fr" languageName="Francês"
    cards={match.cards} back="/laboratorio" {...handlers} />
}

function DeckPractice({ store, ...handlers }: { store: DeckStore } & PracticeHandlers) {
  const { id, mode } = useParams()
  const deck = store.decks?.find(item => item.id === id)
  const language = languages.find(item => item.id === deck?.language)
  if (!store.decks && !store.issue) return <p>Carregando deck…</p>
  if (!deck || !language || (mode !== 'flashcards' && mode !== 'escrita')) return <Missing />
  return <PracticeSession key={`${id}-${mode}`} title={deck.title} mode={mode} language={deck.language} languageName={language.portuguese}
    cards={deck.cards} back={`/scriptorium/${id}`} {...handlers} />
}

function FrenchTracks() {
  return <div className="level-grid">
    {frenchTracks.map(track => <article className="panel card-body" key={track.id}>
      <h3>{track.title.split(' · ')[1]}</h3>
      <p>{track.description} {track.cards.length} cartas.</p>
      <Link className="button secondary" to={`/laboratorio/fr/trilhas/${track.id}`}>Estudar trilha</Link>
    </article>)}
  </div>
}

function Laboratory() {
  const [id, setId] = useState<Language['id']>('fr')
  return <>
    <PageTitle label="Laboratório" title="Prática de idiomas">
      Escolha o idioma e como quer praticar.
    </PageTitle>
    <div className="panel card-body activity">
      <label htmlFor="practice-language">Idioma</label>
      <select id="practice-language" value={id} onChange={event => {
        const selected = languages.find(language => language.id === event.target.value)
        if (selected) setId(selected.id)
      }}>
        {languages.map(item => <option value={item.id} key={item.id}>{item.portuguese}</option>)}
      </select>
      <div className="actions">
        <Link className="button" to={`/laboratorio/${id}/escrita`}>Deck de escrita</Link>
        <Link className="button secondary" to={`/academia/${id}/a1/flashcards`}>Flashcards com áudio</Link>
        <Link className="button secondary" to={`/academia/${id}/a1/leitura`}>Leitura</Link>
      </div>
    </div>
    <section className="section"><h2>Trilhas de francês</h2><FrenchTracks /></section>
  </>
}

function Studio({ language, changeLanguage }: { language: Language['id']; changeLanguage: (id: Language['id']) => void }) {
  return <>
    <PageTitle label="Meu estúdio" title="Seu espaço de aprendizagem.">
      Escolha o idioma da sua próxima atividade.
    </PageTitle>
    <div className="studio-grid">
      <section className="panel card-body">
        <h2>Minha próxima lição</h2>
        <label htmlFor="study-language">Idioma</label>
        <select id="study-language" value={language} onChange={event => {
          const selected = languages.find(item => item.id === event.target.value)
          if (selected) changeLanguage(selected.id)
        }}>
          {languages.map(item => <option value={item.id} key={item.id}>{item.portuguese}</option>)}
        </select>
        <Link className="button" to={`/academia/${language}/a1`}>Abrir lição A1 →</Link>
      </section>
      <section className="panel card-body">
        <h2>Minha atividade</h2>
        <div className="form-stack">
          <Link to="/historico">Histórico de estudo e estatísticas</Link>
          <Link to="/memoria">Agenda de revisões</Link>
          <Link to="/scriptorium">Meus decks</Link>
        </div>
      </section>
    </div>
  </>
}

function Memory({ reviews, decks, onAnswer }: Pick<PracticeHandlers, 'reviews' | 'onAnswer'> & { decks: NonNullable<DeckStore['decks']> }) {
  const [now, setNow] = useState(Date.now)
  const [filter, setFilter] = useState('all')
  const [feedback, setFeedback] = useState('')
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const sets = [
    ...languages.map(language => ({ language, cards: writingCards(language.id), title: language.lessonTitle, back: '/academia' })),
    ...decks.flatMap(deck => {
      const language = languages.find(item => item.id === deck.language)
      return language ? [{ language, cards: deck.cards, title: deck.title, back: `/scriptorium/${deck.id}` }] : []
    }),
  ]
  const entries = sets.flatMap(({ language, cards, title, back }) => cards.flatMap(card =>
    (['flashcards', 'escrita'] as const).flatMap(mode => {
      const review = reviews[reviewKey(mode, card.id)]
      if (review?.dueAt === undefined || (filter !== 'all' && filter !== language.id)) return []
      const set: StudySet = { title, language: language.id, languageName: language.portuguese, cards, mode, back }
      return [{ id: review.id, card, mode, set, dueAt: review.dueAt }]
    }),
  )).sort((a, b) => a.dueAt - b.dueAt)
  const due = entries.filter(entry => isDue(entry.dueAt, now))
  const upcoming = entries.filter(entry => !isDue(entry.dueAt, now))

  function rate(set: StudySet, mode: ReviewMode, answer: FinishedAnswer) {
    const previous = reviews[reviewKey(mode, answer.card.id)]?.interval
    const days = answer.grade !== undefined ? nextInterval(answer.grade, previous) : 0
    onAnswer(set, answer)
    setNow(Date.now())
    setFeedback(days ? `Próxima revisão em ${days} ${days === 1 ? 'dia' : 'dias'}.` : 'A carta continua disponível para revisar.')
  }

  return <>
    <PageTitle label="Memoria" title="Revisões espaçadas.">
      A fila reúne cartas de flashcards e escrita conforme o horário agendado.
    </PageTitle>
    <label htmlFor="review-language">Filtrar por idioma</label>
    <select id="review-language" value={filter} onChange={event => setFilter(event.target.value)}>
      <option value="all">Todos os idiomas</option>
      {languages.map(item => <option value={item.id} key={item.id}>{item.portuguese}</option>)}
    </select>
    <p role="status">{feedback}</p>
    <section className="section">
      <h2>Disponíveis agora ({due.length})</h2>
      {due.length === 0 && <p>Nenhuma carta disponível. <Link to="/laboratorio">Abrir Laboratório</Link></p>}
      <div className="stack">
        {due.map(({ id, card, mode, set }) => <div key={id}>
          <p>{set.languageName} · {modeNames[mode]}</p>
          <ReviewCard card={card} language={set.language} mode={mode} done={answer => rate(set, mode, answer)} />
        </div>)}
      </div>
    </section>
    <section className="section">
      <h2>Próximas revisões</h2>
      {upcoming.length
        ? <ul className="examples">{upcoming.map(({ id, card, mode, set, dueAt }) => <li className="panel card-body" key={id}>
          <strong lang={set.language}>{card.phrase || 'Carta com mídia'}</strong>
          <p>{set.languageName} · {modeNames[mode]} · <time dateTime={new Date(dueAt).toISOString()}>{dateTime.format(dueAt)}</time></p>
        </li>)}</ul>
        : <p>Nenhuma revisão agendada.</p>}
    </section>
  </>
}

function Library() {
  return <>
    <PageTitle label="Bibliotheca" title="Referências para continuar.">
      Consulte as instituições que orientam a seleção de objetivos e atividades.
    </PageTitle>
    <p><a href={qecr.url}>{qecr.label}</a></p>
    <div className="studio-grid">{languages.map(language => <section className="panel card-body" key={language.id}>
      <h2>{language.portuguese}</h2>
      <ul>{language.references.map(reference => <li key={reference.url}><a href={reference.url}>{reference.label}</a></li>)}</ul>
    </section>)}</div>
  </>
}

function Method() {
  return <>
    <PageTitle label="Minerva" title="Compreender, praticar, recordar.">
      A Minerva combina aprendizagem estruturada, prática contextualizada e repetição espaçada.
    </PageTitle>
    <div className="panel card-body prose">
      <h2>O que você pode experimentar</h2>
      <p>A Minerva já oferece uma lição A1 por idioma, trilhas de francês, leitura, flashcards com voz sintética, decks de escrita e prática por repetição espaçada. As frases de estudo foram escritas para a Minerva.</p>
      <h2>O que está previsto</h2>
      <p>Cursos completos do A1 ao C2, trilhas temáticas nos demais idiomas, exercícios de gramática e escuta, onboarding, Bibliotheca ampliada, metas, perfil, configurações e curadoria.</p>
      <h2>Como estudar</h2>
      <p>Escolha uma trilha e defina quantas cartas quer ver. Nos flashcards, use Espaço com a carta em foco para revelar e 1 a 4 para avaliar. No deck de escrita, pressione Enter para conferir a resposta. No fim da sessão, você pode repetir as cartas que errou.</p>
      <Link to="/bibliotheca">Consultar as referências pedagógicas →</Link>
    </div>
  </>
}

function Privacy() {
  return <>
    <PageTitle label="Minerva" title="Privacidade" />
    <div className="panel card-body prose">
      <p>Sem conta, seu histórico e seus decks ficam no navegador e dispositivo atuais. Limpar os dados do site remove os registros e arquivos locais. Os arquivos anexados às cartas não são enviados à internet.</p>
      <p>Quando conectado a uma conta, seu histórico é sincronizado com o Supabase. Os decks com mídia continuam locais. O aplicativo não usa rastreamento de navegação.</p>
      <p>Os links da Bibliotheca levam aos sites das instituições. Ao abrir um link, aplicam-se as práticas de privacidade do site de destino.</p>
    </div>
  </>
}

function Missing() {
  return <>
    <PageTitle title="Página indisponível" />
    <Link className="button" to="/">Voltar ao início</Link>
  </>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><HashRouter><Shell /></HashRouter></StrictMode>,
)
