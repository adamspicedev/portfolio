import { Resend } from 'resend'
import { type ContactInput, type ContactResult } from './contact-schema'
import { logPostHogServer } from './posthog-logs.server'

import { authorizeContact } from './contact-protection.server'
function logContact(failure?: 'provider_rejected' | 'provider_unreachable') {
  try {
    logPostHogServer({
      body: failure
        ? 'contact email delivery failed'
        : 'contact email delivered',
      severity: failure ? 'error' : 'info',
      attributes: { channel: 'contact_form', ...(failure ? { failure } : {}) },
    })
  } catch {
    // Telemetry must never change the result of an email delivery.
  }
}
export async function deliverContact(
  input: ContactInput,
  ip?: string,
): Promise<ContactResult> {
  if (input.website) return { ok: true }
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey)
    return {
      ok: false,
      message:
        'The contact form is currently offline. Email adam@spicey.dev directly.',
    }
  const authorization = await authorizeContact(input, ip)
  if (!authorization.ok) return authorization
  try {
    const { error } = await new Resend(apiKey).emails.send({
      from:
        process.env.RESEND_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>',
      to: 'adam@spicey.dev',
      replyTo: input.email,
      subject: 'Message from portfolio',
      text: `From: ${input.email}\n\n${input.message}`,
    })
    if (error) {
      logContact('provider_rejected')
      return {
        ok: false,
        message:
          'Your message could not be sent. Try again, or email adam@spicey.dev directly.',
      }
    }
    logContact()
    return { ok: true }
  } catch {
    logContact('provider_unreachable')
    return {
      ok: false,
      message:
        'Your message could not be sent. Try again, or email adam@spicey.dev directly.',
    }
  }
}
