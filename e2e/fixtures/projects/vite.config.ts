import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
export default defineConfig({
  publicDir: '../../../public',
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: [
      {
        find: '../lib/projects.functions',
        replacement: resolve('e2e/fixtures/projects/actions.ts'),
      },
    ],
  },
  server: { host: '127.0.0.1', fs: { allow: [process.cwd()] } },
})
