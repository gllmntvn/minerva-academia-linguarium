import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { languages } from './catalog'
import type { Deck, DeckStore } from './decks'
import { getMedia, mediaLimits } from './media'
import type { Card, LanguageId, ReviewMode } from './study'

type Props = { store: DeckStore }

function SelectLanguage({ initial }: { initial?: LanguageId }) {
  return <label>Idioma<select name="language" defaultValue={initial ?? 'fr'}>
    {languages.map(language => <option key={language.id} value={language.id}>{language.portuguese}</option>)}
  </select></label>
}

function readLanguage(form: FormData) {
  return languages.find(language => language.id === form.get('language'))?.id
}

function DeckForm({ current, onSave }: {
  current?: Deck
  onSave: (title: string, language: LanguageId) => Promise<void>
}) {
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const form = event.currentTarget
    const fields = new FormData(form)
    const title = String(fields.get('title') ?? '').trim()
    const language = readLanguage(fields)
    if (!title || !language) {
      setStatus('Informe o nome e o idioma do deck.')
      return
    }
    setSaving(true)
    setStatus('')
    try {
      await onSave(title, language)
      if (!current) form.reset()
      setStatus(current ? 'Deck atualizado.' : 'Deck criado.')
    } catch {
      setStatus('Não foi possível salvar o deck neste navegador.')
    } finally {
      setSaving(false)
    }
  }

  return <form className="panel card-body form-stack" onSubmit={submit}>
    <h2>{current ? 'Editar deck' : 'Criar deck'}</h2>
    <label>Nome do deck<input name="title" defaultValue={current?.title} maxLength={80} required /></label>
    <SelectLanguage initial={current?.language} />
    <button className="button" disabled={saving}>{current ? 'Salvar alterações' : 'Criar deck'}</button>
    {status && <p role="status">{status}</p>}
  </form>
}

export function Scriptorium({ store }: Props) {
  return <>
    <div className="page-title">
      <p className="eyebrow">Scriptorium</p>
      <h1>Meus decks</h1>
      <p>Crie cartas de texto, imagem e áudio. Seus decks ficam neste navegador.</p>
    </div>
    {store.issue ? <p role="alert">{store.issue}</p> : !store.decks ? <p>Carregando decks…</p> : (
      <div className="studio-grid">
        <DeckForm onSave={store.create} />
        <section className="panel card-body">
          <h2>Sua coleção</h2>
          {store.decks.length ? <ul className="deck-list">
            {store.decks.map(deck => <li key={deck.id}>
              <Link to={deck.id}>{deck.title}</Link>
              <span>{languages.find(item => item.id === deck.language)?.portuguese} · {deck.cards.length} cartas</span>
            </li>)}
          </ul> : <p>Os decks que você criar vão aparecer aqui.</p>}
        </section>
      </div>
    )}
  </>
}

function MediaField({ label, name, kind, current }: { label: string; name: string; kind: keyof typeof mediaLimits; current?: Blob }) {
  return <div>
    <label>{label}<input name={name} type="file" accept={mediaLimits[kind].accept} /></label>
    {current && <label className="check"><input type="checkbox" name={`remove-${name}`} />Remover {label.toLocaleLowerCase()} atual</label>}
  </div>
}

function CardForm({ card, save, cancel }: { card?: Card; save: (card: Card) => Promise<void>; cancel: () => void }) {
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const fields = new FormData(event.currentTarget)
    setStatus('')
    setSaving(true)
    try {
      const next = {
        id: card?.id ?? `custom-${crypto.randomUUID()}`,
        phrase: String(fields.get('phrase') ?? '').trim(),
        meaning: String(fields.get('meaning') ?? '').trim(),
        frontImage: getMedia(fields, 'frontImage', 'image', card?.frontImage),
        frontAudio: getMedia(fields, 'frontAudio', 'audio', card?.frontAudio),
        backImage: getMedia(fields, 'backImage', 'image', card?.backImage),
        backAudio: getMedia(fields, 'backAudio', 'audio', card?.backAudio),
      }
      if ((!next.phrase && !next.frontImage && !next.frontAudio) || (!next.meaning && !next.backImage && !next.backAudio)) {
        setStatus('Adicione texto, imagem ou áudio em cada lado.')
        return
      }
      await save(next)
      cancel()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível salvar a carta.')
    } finally {
      setSaving(false)
    }
  }

  return <form className="panel card-body form-stack" onSubmit={submit}>
    <h2>{card ? 'Editar carta' : 'Nova carta'}</h2>
    <p>Para praticar escrita, preencha o texto dos dois lados. Imagens de até 5 MB e áudio de até 15 MB por arquivo.</p>
    <div className="studio-grid">
      <fieldset>
        <legend>Frente</legend>
        <label>Texto no idioma estudado<textarea name="phrase" defaultValue={card?.phrase} maxLength={450} rows={3} /></label>
        <MediaField label="Imagem da frente" name="frontImage" kind="image" current={card?.frontImage} />
        <MediaField label="Áudio da frente" name="frontAudio" kind="audio" current={card?.frontAudio} />
      </fieldset>
      <fieldset>
        <legend>Verso</legend>
        <label>Tradução ou significado<textarea name="meaning" defaultValue={card?.meaning} maxLength={450} rows={3} /></label>
        <MediaField label="Imagem do verso" name="backImage" kind="image" current={card?.backImage} />
        <MediaField label="Áudio do verso" name="backAudio" kind="audio" current={card?.backAudio} />
      </fieldset>
    </div>
    <div className="actions">
      <button className="button" disabled={saving}>Salvar carta</button>
      <button className="button secondary" type="button" disabled={saving} onClick={cancel}>Cancelar</button>
    </div>
    {status && <p role="alert">{status}</p>}
  </form>
}

export function DeckPage({ store }: Props) {
  const { id } = useParams()
  const deck = store.decks?.find(item => item.id === id)
  if (!deck) return <>
    <h1>{store.decks || store.issue ? 'Deck indisponível' : 'Carregando deck…'}</h1>
    <Link to="/scriptorium">← Meus decks</Link>
  </>
  return <DeckEditor key={deck.id} deck={deck} store={store} />
}

function DeckEditor({ deck, store }: Props & { deck: Deck }) {
  const [editor, setEditor] = useState<'new' | Card | null>(null)
  const [selected, setSelected] = useState<'deck' | Card | null>(null)
  const [editDeck, setEditDeck] = useState(false)
  const [message, setMessage] = useState('')
  const [deleting, setDeleting] = useState(false)

  const language = languages.find(item => item.id === deck.language)
  const modes: { mode: ReviewMode; label: string; enabled: boolean }[] = [
    { mode: 'flashcards', label: 'Estudar flashcards', enabled: deck.cards.length > 0 },
    { mode: 'escrita', label: 'Treinar escrita', enabled: deck.cards.some(card => Boolean(card.phrase && card.meaning)) },
  ]

  async function remove() {
    if (!selected || deleting) return
    setDeleting(true)
    try {
      if (selected === 'deck') await store.remove(deck.id)
      else {
        await store.removeCard(deck.id, selected.id)
        if (editor && editor !== 'new' && editor.id === selected.id) setEditor(null)
      }
      setSelected(null)
      setMessage('Carta excluída.')
    } catch {
      setMessage('Não foi possível excluir.')
    } finally {
      setDeleting(false)
    }
  }

  return <>
    <div className="page-title">
      <p className="eyebrow">Scriptorium · {language?.portuguese}</p>
      <h1>{deck.title}</h1>
      <p>{deck.cards.length} {deck.cards.length === 1 ? 'carta' : 'cartas'} neste navegador.</p>
      <div className="actions">
        {modes.filter(item => item.enabled).map(item => (
          <Link className="button" key={item.mode} to={item.mode}>{item.label}</Link>
        ))}
        <button type="button" className="button secondary" onClick={() => setEditor('new')}>Adicionar carta</button>
        <button type="button" className="button secondary" onClick={() => setEditDeck(!editDeck)}>{editDeck ? 'Fechar edição' : 'Editar deck'}</button>
        <button type="button" className="quiet-button" onClick={() => setSelected('deck')}>Excluir deck</button>
      </div>
    </div>
    {editDeck && <DeckForm current={deck} onSave={(title, language) => store.edit(deck.id, title, language)} />}
    {editor && <CardForm key={editor === 'new' ? 'new' : editor.id} card={editor === 'new' ? undefined : editor}
      save={card => store.saveCard(deck.id, card)} cancel={() => setEditor(null)} />}
    {selected && <div className="panel card-body section">
      <h2>{selected === 'deck' ? 'Excluir este deck?' : 'Excluir esta carta?'}</h2>
      <p>Os arquivos anexados também serão excluídos deste navegador.</p>
      <div className="actions">
        <button type="button" className="button" disabled={deleting} onClick={() => void remove()}>Confirmar exclusão</button>
        <button type="button" className="button secondary" disabled={deleting} onClick={() => setSelected(null)}>Cancelar exclusão</button>
      </div>
    </div>}
    <p role="status">{message}</p>
    <section className="section">
      <h2>Cartas</h2>
      {deck.cards.length ? <ul className="deck-list panel card-body">{deck.cards.map(card => (
        <li key={card.id}>
          <strong lang={deck.language}>{card.phrase || 'Carta com mídia'}</strong><span>{card.meaning}</span>
          <div className="actions">
            <button type="button" className="quiet-button" onClick={() => setEditor(card)}>Editar carta</button>
            <button type="button" className="quiet-button" onClick={() => setSelected(card)}>Excluir carta</button>
          </div>
        </li>
      ))}</ul> : <p>Adicione a primeira carta para começar.</p>}
    </section>
    <Link className="return" to="/scriptorium">← Meus decks</Link>
  </>
}
