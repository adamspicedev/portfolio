import { defineConfig } from 'vite'
import { posthogSourceMaps } from './build/posthog-sourcemaps'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { redact } from '@tanstack/redact/vite'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  // Bundle SSR dependencies so their React imports also resolve to Redact.
  ssr: { noExternal: true },
  plugins: [
    nitro({
      preset: process.env.VERCEL === '1' ? 'vercel' : 'bun',
      routeRules: {
        // Cloudflare email obfuscation rewrites React's SSR markup before hydration.
        // Preserve the homepage's existing public revalidation policy, but prohibit
        // intermediary body transforms. Do not change private/admin caching.
        '/': {
          headers: {
            'cache-control': 'public, max-age=0, must-revalidate, no-transform',
          },
        },
        '/admin': { headers: { 'cache-control': 'private, no-store' } },
      },
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    redact(),
    ...posthogSourceMaps(process.env),
  ],
})
