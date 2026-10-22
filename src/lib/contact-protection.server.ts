import { reserveContactSubmission } from './contact-limits.server'
import type { ContactInput, ContactResult } from './contact-schema'

const unavailable = (): ContactResult => ({
  ok: false,
  message:
    'The contact form is temporarily unavailable. Please try again later or email adam@spicey.dev directly.',
})
const retry = (): ContactResult => ({
  ok: false,
  message:
    'Please complete the spam check again, then send your message. It may have expired or already been used.',
})

export async function authorizeContact(
  input: ContactInput,
  ip: string | undefined,
): Promise<ContactResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret || !ip) return unavailable()
  if (!input.turnstileToken || input.turnstileToken.length > 2048)
    return retry()
  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: new URLSearchParams({ secret, response: input.turnstileToken }),
        signal: AbortSignal.timeout(5000),
      },
    )
    if (!response.ok) return unavailable()
    const result: unknown = await response.json()
    if (!result || typeof result !== 'object') return unavailable()
    const verification = result as {
      success?: unknown
      hostname?: unknown
      action?: unknown
      challenge_ts?: unknown
    }
    if (verification.success !== true) return retry()
    if (
      typeof verification.hostname !== 'string' ||
      !['spicey.dev', 'www.spicey.dev'].includes(verification.hostname) ||
      verification.action !== 'contact'
    )
      return retry()
    const challengedAt =
      typeof verification.challenge_ts === 'string'
        ? Date.parse(verification.challenge_ts)
        : NaN
    const age = Date.now() - challengedAt
    if (!Number.isFinite(age) || age < -30_000 || age > 300_000) return retry()
    const reservation = await reserveContactSubmission({
      email: input.email,
      ip,
      hashSecret: secret,
    })
    if (reservation.allowed) return { ok: true }
    if (reservation.unavailable) return unavailable()
    return {
      ok: false,
      message: `Sending is paused to prevent spam. Try again in ${Math.max(1, Math.ceil(reservation.retryAfterSeconds / 60))} minutes, or email adam@spicey.dev directly.`,
    }
  } catch {
    // No provider details, tokens, addresses, IPs or form data enter telemetry.
    return unavailable()
  }
}
