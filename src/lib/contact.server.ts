import { Resend } from 'resend'
import { type ContactInput, type ContactResult } from './contact-schema'
import { logPostHogServer } from './posthog-logs.server'

import { authorizeContact } from './contact-protection.server'
async function logContact(
  failure?: 'provider_rejected' | 'provider_unreachable',
  emailId?: string,
) {
  try {
    await logPostHogServer({
      body: failure
        ? 'contact email delivery failed'
        : 'contact email accepted',
      severity: failure ? 'error' : 'info',
      attributes: {
        channel: 'contact_form',
        ...(failure ? { failure } : { email_id: emailId ?? '' }),
      },
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
      reason: 'offline',
      message:
        'The contact form is currently offline. Email adam@spicey.dev directly.',
    }
  const authorization = await authorizeContact(input, ip)
  if (!authorization.ok) return authorization
  try {
    const { data, error } = await new Resend(apiKey).emails.send({
      from:
        process.env.RESEND_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>',
      to: 'adam@spicey.dev',
      replyTo: input.email,
      subject: 'Message from portfolio',
      tags: [{ name: 'channel', value: 'contact_form' }],
      text: `From: ${input.email}\n\n${input.message}`,
    })
    if (error) {
      await logContact('provider_rejected')
      return {
        ok: false,
        reason: 'provider_rejected',
        message:
          'Your message could not be sent. Try again, or email adam@spicey.dev directly.',
      }
    }
    await logContact(undefined, data?.id)
    return { ok: true }
  } catch {
    await logContact('provider_unreachable')
    return {
      ok: false,
      reason: 'provider_unavailable',
      message:
        'Your message could not be sent. Try again, or email adam@spicey.dev directly.',
    }
  }
}
