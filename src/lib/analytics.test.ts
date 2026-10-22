import { expect, test } from 'bun:test'
import { track, reportFailure } from './analytics'

test('broken telemetry cannot interrupt the caller', () => {
  const client = {
    capture: () => {
      throw new Error('SDK unavailable')
    },
    captureException: () => {
      throw new Error('SDK unavailable')
    },
  }
  expect(() => track(client, 'contact_message_sent')).not.toThrow()
  expect(() => reportFailure(client, 'cms_save')).not.toThrow()
})
