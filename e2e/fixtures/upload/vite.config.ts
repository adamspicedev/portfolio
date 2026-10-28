import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { redact } from '@tanstack/redact/vite'
export default defineConfig({
  publicDir: '../../../public',
  plugins: [react(), redact()],
  server: { host: '127.0.0.1', fs: { allow: [process.cwd()] } },
})
