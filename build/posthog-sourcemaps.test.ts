import { expect, test } from 'bun:test'
import { posthogSourceMaps } from './posthog-sourcemaps'

test('uploads are disabled outside Vercel production even with a key', () => {
  for (const env of [
    {},
    { VERCEL: '1', VERCEL_ENV: 'preview', POSTHOG_API_KEY: 'test-only' },
  ]) {
    expect(posthogSourceMaps(env)).toEqual([])
  }
})
test('production fails safely until the user configures the server-only key', () => {
  expect(() =>
    posthogSourceMaps({ VERCEL: '1', VERCEL_ENV: 'production' }),
  ).toThrow('POSTHOG_API_KEY')
})
test('only client builds enable the plugin and no global sourcemap hook is retained', () => {
  const [upload, guard] = posthogSourceMaps({
    VERCEL: '1',
    VERCEL_ENV: 'production',
    POSTHOG_API_KEY: 'test-only',
    VERCEL_GIT_COMMIT_SHA: 'test-commit',
  })
  expect(upload.config).toBeUndefined()
  const applies = upload.applyToEnvironment as (environment: {
    name: string
  }) => boolean
  expect(applies({ name: 'client' })).toBe(true)
  expect(applies({ name: 'ssr' })).toBe(false)
  expect(guard.applyToEnvironment).toBe(upload.applyToEnvironment)
})
