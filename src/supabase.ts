import { createClient } from '@supabase/supabase-js'

function getProjectUrl(value: string | undefined) {
  if (!value) return null
  try {
    const url = new URL(value)
    const development = import.meta.env.DEV && ['localhost', '127.0.0.1'].includes(url.hostname)
    if (url.origin === value.replace(/\/$/, '') && (url.protocol === 'https:' || development)) return url.origin
  } catch {
    return null
  }
  return null
}

const project = getProjectUrl(import.meta.env.VITE_SUPABASE_URL)
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const supabase = project && key?.startsWith('sb_publishable_')
  ? createClient(project, key, { auth: { flowType: 'pkce' } })
  : null
