import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
export default defineConfig({
  publicDir: '../../../public',
  plugins: [react()],
  define: {
    'import.meta.env.VITE_TURNSTILE_SITE_KEY':
      JSON.stringify('fixture-public-key'),
  },
  resolve: {
    alias: [
      {
        find: '../lib/contact.functions',
        replacement: resolve('e2e/fixtures/contact/send.ts'),
      },
    ],
  },
  server: { host: '127.0.0.1', fs: { allow: [process.cwd()] } },
})
