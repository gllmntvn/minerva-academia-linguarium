import { defineConfig } from 'vite'

const contentSecurityPolicy = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "font-src 'self'",
  "img-src 'self'",
  "connect-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
].join('; ')

export default defineConfig({
  base: './',
  plugins: [{
    name: 'static-demo-content-security-policy',
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
})
