import { z } from 'zod'

export const contactSchema = z.object({
  email: z.email('Enter a valid email address.').max(254),
  message: z
    .string()
    .trim()
    .min(10, 'Write at least 10 characters.')
    .max(5000, 'Keep your message under 5,000 characters.'),
  website: z.string().max(500).default(''),
  turnstileToken: z.string().max(2048).default(''),
})
export type ContactInput = z.infer<typeof contactSchema>
export type ContactResult =
  | { ok: true }
  | {
      ok: false
      reason?:
        | 'offline'
        | 'rate_limited'
        | 'provider_rejected'
        | 'provider_unavailable'
      message: string
    }
