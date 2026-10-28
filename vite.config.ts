import { defineConfig } from 'vite'
import { posthogSourceMaps } from './build/posthog-sourcemaps.ts'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { redact } from '@tanstack/redact/vite'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  ssr: {
    // Bundle React consumers so server rendering uses the same Redact runtime.
    noExternal: true,
    // Keep server SDK loaders intact for Vite dev and Nitro's native-file tracing.
    external: [
      '@libsql/client',
      '@opentelemetry/api-logs',
      '@opentelemetry/exporter-logs-otlp-http',
      '@opentelemetry/resources',
      '@opentelemetry/sdk-logs',
      '@opentelemetry/sdk-node',
      '@vercel/blob',
      'resend',
      'sharp',
      'yaml',
    ],
  },
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
