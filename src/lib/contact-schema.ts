import { z } from 'zod'

export const contactSchema = z.object({
  email: z.email('Enter a valid email address.').max(254),
  message: z
    .string()
    .trim()
    .min(10, 'Write at least 10 characters.')
    .max(5000, 'Keep your message under 5,000 characters.'),
  website: z.string().max(500).default(''),
})
export type ContactInput = z.infer<typeof contactSchema>
export type ContactResult = { ok: true } | { ok: false; message: string }

// A small per-process throttle. A hosting-level rate limit is needed across instances.
export function createContactLimiter(now: () => number = Date.now) {
  const attempts = new Map<string, { count: number; expires: number }>()
  return (key: string) => {
    const time = now()
    for (const [id, entry] of attempts)
      if (entry.expires <= time) attempts.delete(id)
    const entry = attempts.get(key)
    if (entry && entry.count >= 3) return false
    if (entry) entry.count += 1
    else {
      if (attempts.size >= 2000) return false
      attempts.set(key, { count: 1, expires: time + 10 * 60_000 })
    }
    return true
  }
}
