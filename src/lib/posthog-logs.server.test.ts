import { afterEach, describe, expect, it } from 'bun:test'
import { logPostHogServer } from './posthog-logs.server'

const keys = [
  'NODE_ENV',
  'VITE_PUBLIC_POSTHOG_PROJECT_TOKEN',
  'VITE_PUBLIC_POSTHOG_HOST',
]
const originalEnvironment = new Map(keys.map((key) => [key, process.env[key]]))
afterEach(() => {
  for (const [key, value] of originalEnvironment) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

describe('best effort server telemetry', () => {
  it('does not throw when development configuration is absent', () => {
    process.env.NODE_ENV = 'development'
    delete process.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN
    delete process.env.VITE_PUBLIC_POSTHOG_HOST
    expect(() =>
      logPostHogServer({ body: 'test', attributes: {} }),
    ).not.toThrow()
  })
  it('does not throw when the configured host is malformed', () => {
    process.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN = 'test-token'
    process.env.VITE_PUBLIC_POSTHOG_HOST = 'invalid host'
    expect(() =>
      logPostHogServer({ body: 'test', severity: 'error', attributes: {} }),
    ).not.toThrow()
  })
})
