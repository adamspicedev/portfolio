import { Resend } from 'resend'
import {
  createContactLimiter,
  type ContactInput,
  type ContactResult,
} from './contact-schema'

const allowContact = createContactLimiter()
export async function deliverContact(
  input: ContactInput,
): Promise<ContactResult> {
  if (input.website) return { ok: true }
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey)
    return {
      ok: false,
      message:
        'The contact form is currently offline. Email adam@spicey.dev directly.',
    }
  if (!allowContact(input.email.toLowerCase())) {
    return {
      ok: false,
      message:
        'Too many messages. Try again in 10 minutes, or email adam@spicey.dev directly.',
    }
  }
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
      console.error('Contact email provider rejected the message.', {
        code: error.name,
      })
      return {
        ok: false,
        message:
          'Your message could not be sent. Try again, or email adam@spicey.dev directly.',
      }
    }
    return { ok: true }
  } catch {
    console.error('Contact email provider could not be reached.')
    return {
      ok: false,
      message:
        'Your message could not be sent. Try again, or email adam@spicey.dev directly.',
    }
  }
}
