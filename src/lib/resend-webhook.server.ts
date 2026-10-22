import { Resend } from 'resend'
import { logPostHogServer } from './posthog-logs.server'

export async function handleResendWebhook(
  request: Request,
  log = logPostHogServer,
) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) return new Response('Webhook unavailable', { status: 503 })
  let event
  try {
    event = new Resend('webhook-verification-only').webhooks.verify({
      payload: await request.text(),
      headers: {
        id: request.headers.get('svix-id') ?? '',
        timestamp: request.headers.get('svix-timestamp') ?? '',
        signature: request.headers.get('svix-signature') ?? '',
      },
      webhookSecret: secret,
    })
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }
  if (
    ![
      'email.delivered',
      'email.bounced',
      'email.failed',
      'email.complained',
    ].includes(event.type) ||
    !('email_id' in event.data) ||
    !('tags' in event.data) ||
    event.data.tags?.channel !== 'contact_form'
  ) {
    return new Response(null, { status: 204 })
  }
  const recorded = await log({
    body: `contact ${event.type.replace('.', ' ')}`,
    severity: event.type === 'email.delivered' ? 'INFO' : 'ERROR',
    attributes: {
      channel: 'contact_form',
      email_id: event.data.email_id,
      webhook_id: request.headers.get('svix-id')!,
    },
  })
  // A retry can repeat a log: use webhook_id when counting delivery outcomes.
  return new Response(null, { status: recorded ? 204 : 503 })
}
