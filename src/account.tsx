import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Link } from 'react-router-dom'
import { supabase } from './supabase'

type AccountMode = 'entrar' | 'criar' | 'recuperar' | 'redefinir'

export function useAccount() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(!supabase)

  useEffect(() => {
    if (!supabase) return
    const { data } = supabase.auth.onAuthStateChange((_event, current) => {
      setSession(current)
      setReady(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  return { session, ready }
}

const headings = {
  entrar: 'Entrar',
  criar: 'Criar conta',
  recuperar: 'Recuperar acesso',
  redefinir: 'Escolher nova senha',
}

export function Account({ session, pendingHistory }: { session: Session | null; pendingHistory: boolean }) {
  const reset = new URLSearchParams(location.search).has('redefinir')
  const [mode, setMode] = useState<AccountMode>(reset ? 'redefinir' : 'entrar')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || busy) return
    const fields = new FormData(event.currentTarget)
    const email = String(fields.get('email') ?? '').trim()
    const password = String(fields.get('password') ?? '')
    const base = `${location.origin}${location.pathname}`
    setBusy(true)
    setStatus('')
    try {
      if (mode === 'recuperar') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${base}?redefinir=1` })
        if (error) throw error
        setStatus('Se o endereço estiver cadastrado, você receberá um link para trocar a senha.')
      } else if (mode === 'criar') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: base } })
        if (error) throw error
        setStatus(data.session ? 'Conta criada.' : 'Confira sua caixa de entrada para confirmar o cadastro.')
      } else if (mode === 'redefinir') {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        window.history.replaceState(null, '', `${location.pathname}#/conta`)
        setMode('entrar')
        setStatus('Senha atualizada.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch {
      setStatus(mode === 'entrar'
        ? 'Não foi possível entrar. Confira o e-mail, a senha e a confirmação do cadastro.'
        : 'Não foi possível concluir. Confira os dados ou tente novamente em instantes.')
    } finally {
      setBusy(false)
    }
  }

  const client = supabase
  if (!client) return <div className="page-title">
    <h1>Conta Minerva</h1>
    <p>O login depende da conexão com o Supabase, que ainda não está ativo neste site.</p>
    <p>Você já pode estudar e consultar seu histórico neste navegador.</p>
    <Link className="button" to="/estudio">Abrir Meu estúdio</Link>
  </div>

  if (session && mode !== 'redefinir') return <div className="page-title">
    <h1>Minha conta</h1>
    <p>{session.user.email}</p>
    <div className="actions">
      <Link className="button" to="/historico">Meu histórico</Link>
      <button type="button" className="button secondary" disabled={busy} onClick={async () => {
        if (pendingHistory && !window.confirm('Há atividades pendentes. Sair sem salvá-las na conta?')) return
        setBusy(true)
        try {
          const { error } = await client.auth.signOut({ scope: 'local' })
          if (error) setStatus('Não foi possível sair. Tente novamente.')
        } finally {
          setBusy(false)
        }
      }}>Sair</button>
    </div>
    {pendingHistory && <p>Há atividades aguardando sincronização.</p>}
    <p role="status">{status}</p>
  </div>

  return <>
    <div className="page-title">
      <h1>{headings[mode]}</h1>
      <p>Use sua conta para guardar e acessar o histórico em outros dispositivos.</p>
    </div>
    {mode === 'redefinir' && !session ? <p>Abra novamente o link recebido por e-mail para redefinir sua senha.</p> : (
      <form className="panel card-body form-stack" onSubmit={submit} key={mode}>
        {mode !== 'redefinir' && <label>E-mail<input name="email" type="email" required autoComplete="email" /></label>}
        {mode !== 'recuperar' && <label>Senha<input name="password" type="password" required
          minLength={mode === 'entrar' ? 1 : 8} autoComplete={mode === 'entrar' ? 'current-password' : 'new-password'} /></label>}
        <button className="button" disabled={busy}>{busy ? 'Aguarde…' : headings[mode]}</button>
        <p role="status">{status}</p>
      </form>
    )}
    <div className="actions account-actions">
      {(['entrar', 'criar', 'recuperar'] as const).filter(item => item !== mode).map(item => (
        <button type="button" className="button secondary" key={item} disabled={busy} onClick={() => {
          setMode(item)
          setStatus('')
        }}>{headings[item]}</button>
      ))}
    </div>
  </>
}
