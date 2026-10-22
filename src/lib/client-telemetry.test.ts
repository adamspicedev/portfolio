import { expect, test } from 'bun:test'
import { reportHandledError, runTelemetry } from './client-telemetry'

test('reports only a static synthetic error and curated context, never original data', () => {
  const original = new Error(
    'private email secret story https://example.com/?token=secret',
  )
  const captured: unknown[][] = []
  reportHandledError(
    { captureException: (...args: unknown[]) => captured.push(args) },
    original,
    'route',
  )
  expect(captured).toHaveLength(1)
  const [error, properties] = captured[0] as [Error, unknown]
  expect(error).not.toBe(original)
  expect(error.message).toBe('Unexpected handled error: route')
  expect(error.stack).toBe('Error: Unexpected handled error: route')
  expect(properties).toMatchObject({ handled: true, operation: 'route' })
  expect(properties).toMatchObject({
    $current_url: '',
    $referrer: '',
    $initial_current_url: '',
    $initial_referrer: '',
  })
  expect(JSON.stringify(captured)).not.toContain('secret')
})

test('deduplicates the same error object across repeat boundary reports', () => {
  let count = 0
  const client = {
    captureException: () => {
      count++
    },
  }
  const error = new Error('private')
  reportHandledError(client, error, 'route')
  reportHandledError(client, error, 'route')
  reportHandledError(client, new Error('private'), 'route')
  expect(count).toBe(2)
})

test('telemetry failures never escape into the UI or delivery result', async () => {
  const client = {
    captureException: () => {
      throw new Error('SDK failure')
    },
  }
  expect(() =>
    reportHandledError(client, new Error('private'), 'contact_send'),
  ).not.toThrow()
  let delivered = false
  await Promise.resolve().then(() => {
    runTelemetry(() => {
      throw new Error('SDK failure')
    })
    delivered = true
  })
  expect(delivered).toBe(true)
  expect(() => reportHandledError(undefined, 'private', 'route')).not.toThrow()
})

test('installed SDK does not substitute a caller stack containing a private URL', async () => {
  const { ErrorPropertiesBuilder, ErrorCoercer, createDefaultStackParser } =
    await import('@posthog/core/error-tracking')
  const builder = new ErrorPropertiesBuilder(
    [new ErrorCoercer()],
    createDefaultStackParser(),
  )
  let properties: unknown
  reportHandledError(
    {
      captureException: (error) => {
        const syntheticException = new Error('PostHog syntheticException')
        syntheticException.stack =
          'Error: PostHog syntheticException\n    at handler (https://example.com/?token=private:1:1)'
        properties = builder.buildFromUnknown(error, {
          mechanism: { handled: true },
          syntheticException,
        })
      },
    },
    new Error('private input'),
    'route',
  )
  expect(JSON.stringify(properties)).not.toContain('token=private')
  expect(JSON.stringify(properties)).toContain(
    'Unexpected handled error: route',
  )
})
