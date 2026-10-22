import { createFileRoute } from '@tanstack/react-router'
import { handleResendWebhook } from '../lib/resend-webhook.server'

export const Route = createFileRoute('/api/webhooks/resend')({
  server: { handlers: { POST: ({ request }) => handleResendWebhook(request) } },
})
