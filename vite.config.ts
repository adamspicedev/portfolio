import posthog from '@posthog/rollup-plugin'
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    nitro({
      preset: process.env.VERCEL === '1' ? 'vercel' : 'bun',
      routeRules: {
        '/admin': { headers: { 'cache-control': 'private, no-store' } },
      },
    }),
    ...(process.env.POSTHOG_API_KEY &&
    process.env.POSTHOG_PROJECT_ID &&
    process.env.POSTHOG_HOST
      ? [
          posthog({
            personalApiKey: process.env.POSTHOG_API_KEY,
            projectId: process.env.POSTHOG_PROJECT_ID,
            host: process.env.POSTHOG_HOST,
            sourcemaps: {
              enabled: true,
              releaseName: 'spicey-portfolio',
              releaseVersion:
                process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA,
              deleteAfterUpload: true,
            },
          }),
        ]
      : []),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})
