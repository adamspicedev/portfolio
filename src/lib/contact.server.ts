import { Resend } from 'resend'
import {
  createContactLimiter,
  type ContactInput,
  type ContactResult,
} from './contact-schema'
import { logPostHogServer } from './posthog-logs.server'

const allowContact = createContactLimiter()
export async function deliverContact(
  input: ContactInput,
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
  if (!allowContact(input.email.toLowerCase())) {
    return {
      ok: false,
      reason: 'rate_limited',
      message:
        'Too many messages. Try again in 10 minutes, or email adam@spicey.dev directly.',
    }
  }
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
      await logPostHogServer({
        body: 'contact email rejected',
        severity: 'ERROR',
        attributes: { channel: 'contact_form', reason: 'provider_rejected' },
      })
      console.error('Contact email provider rejected the message.', {
        code: error.name,
      })
      return {
        ok: false,
        reason: 'provider_rejected',
        message:
          'Your message could not be sent. Try again, or email adam@spicey.dev directly.',
      }
    }
    await logPostHogServer({
      body: 'contact email accepted',
      attributes: { channel: 'contact_form', email_id: data?.id ?? '' },
    })
    return { ok: true }
  } catch {
    await logPostHogServer({
      body: 'contact email request failed',
      severity: 'ERROR',
      attributes: { channel: 'contact_form', reason: 'provider_unavailable' },
    })
    console.error('Contact email provider could not be reached.')
    return {
      ok: false,
      reason: 'provider_unavailable',
      message:
        'Your message could not be sent. Try again, or email adam@spicey.dev directly.',
    }
  }
}
