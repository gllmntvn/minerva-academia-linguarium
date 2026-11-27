import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), 'VITE_')
  let connectSources = "'none'"
  if (environment.VITE_SUPABASE_PUBLISHABLE_KEY?.startsWith('sb_publishable_')) {
    try {
      const url = new URL(environment.VITE_SUPABASE_URL)
      if (url.protocol === 'https:' && url.origin === environment.VITE_SUPABASE_URL.replace(/\/$/, '')) {
        connectSources = url.origin
      }
    } catch {
      // Keep connections disabled if the project URL is missing or invalid.
    }
  }
  const contentSecurityPolicy = [
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
    "font-src 'self'",
    "img-src 'self' blob:",
    "media-src 'self' blob:",
    `connect-src ${connectSources}`,
    "base-uri 'none'",
    "form-action 'none'",
    "object-src 'none'",
  ].join('; ')

  return {
    base: './',
    plugins: [{
      name: 'minerva-content-security-policy',
      apply: 'build',
      transformIndexHtml: {
        order: 'pre',
        handler: () => [{
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: contentSecurityPolicy },
          injectTo: 'head-prepend',
        }],
      },
    }],
  }
})
