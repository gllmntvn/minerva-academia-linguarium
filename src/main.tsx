import { StrictMode, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Link, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { languages, levels, qecr } from './catalog'
import type { Example, Language } from './catalog'
import { grades, isDue, scheduleReview } from './review'
import '@fontsource/bodoni-moda/latin-600.css'
import '@fontsource/eb-garamond/latin-400.css'
import '@fontsource/eb-garamond/latin-400-italic.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import './style.css'

const asset = (name: string) => `${import.meta.env.BASE_URL}art/${name}.svg`
const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
type Study = Record<string, number>
type Rating = (id: string, days: number) => void

function PageTitle({ label, title, children }: { label?: string; title: string; children?: ReactNode }) {
  return <div className="page-title">
    {label && <p className="eyebrow">{label}</p>}
    <h1>{title}</h1>
    {children && <p className="lead">{children}</p>}
  </div>
}

function Shell() {
  const { pathname } = useLocation()
  const [preferred, setPreferred] = useState<Language['id']>('en')
  const [study, setStudy] = useState<Study>({})
  const [answers, setAnswers] = useState(0)
  const rate: Rating = (id, days) => {
    const dueAt = scheduleReview(days, Date.now())
    setStudy(current => ({ ...current, [id]: dueAt }))
    setAnswers(current => current + 1)
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    document.getElementById('conteudo')?.focus()
  }, [pathname])

  return <>
    <button type="button" className="skip" onClick={() => document.getElementById('conteudo')?.focus()}>
      Pular para o conteúdo
    </button>
    <div className="preview">Demonstração 0.1 · Sem conta · Sua atividade é apagada ao recarregar</div>
    <header className="top">
      <Link className="brand" to="/" aria-label="Minerva — início">
        <img width="56" height="56" src={asset('emblema')} alt="" />
        <span>MINERVA<small>ACADEMIA LINGUARIUM</small></span>
      </Link>
      <nav aria-label="Navegação principal">
        <NavLink to="/academia">Academia</NavLink>
        <NavLink to="/estudio">Meu estúdio</NavLink>
        <NavLink to="/memoria">Memoria</NavLink>
        <NavLink to="/bibliotheca">Bibliotheca</NavLink>
      </nav>
    </header>
    <main id="conteudo" className="wrap" tabIndex={-1}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/academia" element={<Academy />} />
        <Route path="/academia/:id" element={<LanguagePage />} />
        <Route path="/academia/:id/a1" element={<Lesson />} />
        <Route path="/academia/:id/a1/flashcards" element={<Practice mode="flashcards" rate={rate} />} />
        <Route path="/academia/:id/a1/leitura" element={<Practice mode="leitura" rate={rate} />} />
        <Route path="/estudio" element={<Studio language={preferred} changeLanguage={setPreferred} study={study} answers={answers} />} />
        <Route path="/memoria" element={<Memory study={study} rate={rate} />} />
        <Route path="/bibliotheca" element={<Library />} />
        <Route path="/metodologia" element={<Method />} />
        <Route path="/privacidade" element={<Privacy />} />
        <Route path="*" element={<Missing />} />
      </Routes>
    </main>
    <footer className="footer">
      <span>Minerva · <i lang="en">The art of language</i></span>
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
        <p className="eyebrow">Academia Linguarium · <span lang="en">The art of language</span></p>
        <h1>Uma língua.<br />Um novo mundo.</h1>
        <p className="lead">Descubra outras culturas e cultive o conhecimento no seu próprio ritmo.</p>
        <div className="actions">
          <Link className="button" to="/estudio">Experimentar a demonstração →</Link>
          <Link className="button secondary" to="/metodologia">Conhecer o método</Link>
        </div>
      </div>
      <img className="hero-art" src={asset('minerva')} width="460" height="430" alt="" />
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
      O percurso é organizado do A1 ao C2 pelo QECR. Nesta demonstração, você pode abrir uma amostra A1 em cada idioma.
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
      <Link to={`/academia/${id}`}>Voltar ao idioma</Link>
    </div>
  </>
}

function Practice({ mode, rate }: { mode: 'flashcards' | 'leitura'; rate: Rating }) {
  const { id } = useParams()
  const language = languages.find(item => item.id === id)
  if (!language) return <Missing />
  return <Exercise key={`${id}-${mode}`} language={language} mode={mode} rate={rate} />
}

function Exercise({ language, mode, rate }: { language: Language; mode: 'flashcards' | 'leitura'; rate: Rating }) {
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const step = useRef<HTMLParagraphElement>(null)
  const completion = useRef<HTMLHeadingElement>(null)
  const example = language.examples[index]
  const back = `/academia/${language.id}/a1`
  const title = mode === 'flashcards' ? 'Flashcards' : 'Leitura'

  useEffect(() => {
    if (index > 0) (step.current ?? completion.current)?.focus()
  }, [index])

  function advance() {
    setIndex(i => i + 1)
    setChosen(null)
  }

  return <>
    <PageTitle label={`Laboratório · ${language.portuguese} · A1`} title={title} />
    {!example ? <div className="panel card-body activity" role="status">
      <h2 ref={completion} tabIndex={-1}>Prática concluída</h2>
      <p>Você passou pelos três exemplos da lição.</p>
      <Link className="button" to={mode === 'flashcards' ? '/memoria' : back}>
        {mode === 'flashcards' ? 'Ver revisões' : 'Voltar à lição'}
      </Link>
    </div> : <>
      <p className="muted" ref={step} tabIndex={-1}>Exemplo {index + 1} de {language.examples.length}</p>
      {mode === 'flashcards'
        ? <Flashcard key={example.id} example={example} language={language} onRate={days => { rate(example.id, days); advance() }} />
        : <div className="panel card-body activity">
          <h2 lang={language.id}>{example.phrase}</h2>
          <p>Qual é o sentido da expressão?</p>
          <div className="actions">
            {[...language.examples].reverse().map(option => <button type="button" className="button secondary" key={option.id} aria-pressed={chosen === option.id} onClick={() => setChosen(option.id)}>
              {option.meaning}
            </button>)}
          </div>
          {chosen && <p role="status">{chosen === example.id ? 'Correto.' : `A tradução é “${example.meaning}”`}</p>}
          {chosen && <button type="button" className="button" onClick={advance}>Continuar →</button>}
        </div>}
      <Link className="return" to={back}>← Voltar à lição</Link>
    </>}
  </>
}

function Flashcard({ example, language, onRate }: { example: Example; language: Language; onRate: (days: number) => void }) {
  const [revealed, setRevealed] = useState(false)
  const answer = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    if (revealed) answer.current?.focus()
  }, [revealed])
  return <article className="panel card-body activity">
    <h2 lang={language.id}>{example.phrase}</h2>
    {revealed ? <>
      <p className="lead" ref={answer} tabIndex={-1}>{example.meaning}</p>
      <p>Como foi lembrar?</p>
      <div className="actions">
        {grades.map(grade => <button key={grade.days} type="button" className="button secondary" onClick={() => onRate(grade.days)}>
          {grade.label} · {grade.days ? `${grade.days} d` : 'agora'}
        </button>)}
      </div>
    </> : <button type="button" className="button" onClick={() => setRevealed(true)}>Ver resposta</button>}
  </article>
}

function Studio({ language, changeLanguage, study, answers }: {
  language: Language['id']; changeLanguage: (id: Language['id']) => void; study: Study; answers: number
}) {
  const due = Object.values(study).filter(value => isDue(value, Date.now())).length
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
        <h2>Memoria</h2>
        <p>{due} {due === 1 ? 'carta disponível' : 'cartas disponíveis'} nesta visita.</p>
        <p>{answers} {answers === 1 ? 'avaliação de flashcard' : 'avaliações de flashcards'} nesta visita.</p>
        <Link className="button secondary" to="/memoria">Ver agenda de revisões</Link>
      </section>
    </div>
  </>
}

function Memory({ study, rate }: { study: Study; rate: Rating }) {
  const [now, setNow] = useState(Date.now)
  const [feedback, setFeedback] = useState('')
  const available = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const entries = languages.flatMap(language => language.examples.filter(example => Object.hasOwn(study, example.id))
    .map(example => ({ example, language, dueAt: study[example.id] })))
    .sort((a, b) => a.dueAt - b.dueAt)
  const due = entries.filter(entry => isDue(entry.dueAt, now))
  const upcoming = entries.filter(entry => !isDue(entry.dueAt, now))

  return <>
    <PageTitle label="Memoria" title="Revisões espaçadas.">
      Avalie um flashcard para agendar a próxima revisão. A agenda funciona durante esta visita.
    </PageTitle>
    <p role="status">{feedback}</p>
    <section className="section">
      <h2 ref={available} tabIndex={-1}>Disponíveis agora ({due.length})</h2>
      {due.length === 0 && <p>Nenhuma carta disponível. <Link to="/academia">Pratique com flashcards na Academia.</Link></p>}
      <div className="stack">
        {due.map(({ example, language, dueAt }) => <Flashcard key={`${example.id}-${dueAt}`} example={example} language={language} onRate={days => {
          rate(example.id, days)
          setNow(Date.now())
          const period = days === 1 ? '1 dia' : `${days} dias`
          setFeedback(days ? `Revisão reagendada para daqui a ${period}.` : 'A carta continua disponível para revisar.')
          available.current?.focus()
        }} />)}
      </div>
    </section>
    <section className="section">
      <h2>Próximas revisões</h2>
      {upcoming.length
        ? <ul className="examples">{upcoming.map(({ example, language, dueAt }) => <li className="panel card-body" key={example.id}>
          <strong lang={language.id}>{example.phrase}</strong>
          <p><time dateTime={new Date(dueAt).toISOString()}>{dateTime.format(dueAt)}</time></p>
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
      <p>A versão 0.1 inclui uma lição A1 por idioma, leitura, flashcards e uma fila de revisão que funciona durante a visita. Os exemplos foram escritos para a Minerva.</p>
      <h2>O que está previsto</h2>
      <p>Cursos completos do A1 ao C2, trilhas temáticas, demais práticas, login e cadastro por e-mail e senha, onboarding personalizado, sincronização, Scriptorium com mídias, Bibliotheca ampliada, metas, histórico, perfil, configurações e curadoria.</p>
      <Link to="/bibliotheca">Consultar as referências pedagógicas →</Link>
    </div>
  </>
}

function Privacy() {
  return <>
    <PageTitle label="Minerva" title="Privacidade" />
    <div className="panel card-body prose">
      <p>A demonstração funciona sem cadastro, campos pessoais, upload ou rastreamento do aplicativo. Escolhas, respostas e agendamentos ficam na memória da página e são descartados ao recarregar.</p>
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
