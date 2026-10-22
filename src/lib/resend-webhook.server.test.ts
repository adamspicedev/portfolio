import { afterEach, expect, test } from 'bun:test'
import { createHmac } from 'node:crypto'
import { handleResendWebhook } from './resend-webhook.server'

const previous = process.env.RESEND_WEBHOOK_SECRET
afterEach(() => {
  if (previous === undefined) delete process.env.RESEND_WEBHOOK_SECRET
  else process.env.RESEND_WEBHOOK_SECRET = previous
})
const key = Buffer.from('test-webhook-signing-secret')
function request(channel = 'contact_form', tampered = false) {
  process.env.RESEND_WEBHOOK_SECRET = `whsec_${key.toString('base64')}`
  const body = JSON.stringify({
    type: 'email.delivered',
    data: {
      email_id: 'email-123',
      tags: { channel },
      to: ['private@example.com'],
    },
  })
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const signature = createHmac('sha256', key)
    .update(`event-123.${timestamp}.${body}`)
    .digest('base64')
  return new Request('https://www.spicey.dev/api/webhooks/resend', {
    method: 'POST',
    body: tampered ? body + ' ' : body,
    headers: {
      'svix-id': 'event-123',
      'svix-timestamp': timestamp,
      'svix-signature': `v1,${signature}`,
    },
  })
}
test('verified delivery forwards only safe identifiers, never recipient data', async () => {
  const logs: unknown[] = []
  const response = await handleResendWebhook(request(), async (entry) => {
    logs.push(entry)
    return true
  })
  expect(response.status).toBe(204)
  expect(logs).toEqual([
    {
      body: 'contact email delivered',
      severity: 'INFO',
      attributes: {
        channel: 'contact_form',
        email_id: 'email-123',
        webhook_id: 'event-123',
      },
    },
  ])
})
test('invalid signatures and unrelated emails never generate delivery telemetry', async () => {
  let calls = 0
  const log = async () => {
    calls++
    return true
  }
  expect(
    (await handleResendWebhook(request('contact_form', true), log)).status,
  ).toBe(400)
  expect((await handleResendWebhook(request('another_app'), log)).status).toBe(
    204,
  )
  expect(calls).toBe(0)
})
test('unavailable telemetry requests a webhook retry', async () => {
  expect((await handleResendWebhook(request(), async () => false)).status).toBe(
    503,
  )
})
