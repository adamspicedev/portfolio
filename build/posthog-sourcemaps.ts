import { readdir } from 'node:fs/promises'
import type { Plugin } from 'vite'
import posthog from '@posthog/rollup-plugin'

type BuildEnvironment = Record<string, string | undefined>

/** Build-only secret: never import this module from application/browser code. */
export function posthogSourceMaps(
  env: BuildEnvironment,
  testing: { cliBinaryPath?: string } = {},
): Plugin[] {
  if (env.VERCEL !== '1' || env.VERCEL_ENV !== 'production') return []
  if (!env.POSTHOG_API_KEY)
    throw new Error(
      'Configure server-only POSTHOG_API_KEY in Vercel Production before building source maps.',
    )

  const clientOnly = (environment: { name: string }) =>
    environment.name === 'client'
  const upload = posthog({
    personalApiKey: env.POSTHOG_API_KEY,
    projectId: '663367',
    host: 'https://us.posthog.com',
    logLevel: 'error',
    ...testing,
    sourcemaps: {
      enabled: true,
      deleteAfterUpload: true,
      releaseName: 'spicey-portfolio',
      releaseVersion: env.VERCEL_GIT_COMMIT_SHA,
      releaseMode: 'symbol-set',
    },
  }) as unknown as Plugin

  // The official config hook is global in Vite. Its outputOptions hook already
  // enables hidden maps, scoped here to client output only (not SSR/server code).
  return [
    { ...upload, config: undefined, applyToEnvironment: clientOnly },
    {
      name: 'verify-private-posthog-maps',
      applyToEnvironment: clientOnly,
      writeBundle: {
        order: 'post',
        sequential: true,
        async handler(options) {
          if (!options.dir)
            throw new Error('Source-map output directory is missing.')
          const files = await readdir(options.dir, { recursive: true })
          if (files.some((file) => file.endsWith('.map')))
            throw new Error(
              'Source maps remain in client output. Deployment aborted to prevent public exposure.',
            )
        },
      },
    },
  ]
}
