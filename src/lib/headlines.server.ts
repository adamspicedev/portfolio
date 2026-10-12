import { z } from 'zod'

const base = 'https://hacker-news.firebaseio.com/v0'
const itemSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(500),
  type: z.literal('story'),
  url: z.string().url(),
  dead: z.boolean().optional(),
  deleted: z.boolean().optional(),
})
export type Headline = { id: number; title: string; url: string }

export function createHeadlineReader(
  request: (input: string, init?: RequestInit) => Promise<Response> = fetch,
  now = Date.now,
) {
  let cached: Headline[] = []
  let expires = 0
  let pending: Promise<Headline[]> | undefined
  async function json(url: string): Promise<unknown> {
    const response = await request(url, { signal: AbortSignal.timeout(3000) })
    if (!response.ok) throw new Error('Headline provider unavailable')
    return response.json()
  }
  async function refresh() {
    try {
      const ids = z
        .array(z.number().int().positive())
        .parse(await json(`${base}/topstories.json`))
        .slice(0, 16)
      const results = await Promise.allSettled(
        ids.map(async (id) => {
          const parsed = itemSchema.safeParse(
            await json(`${base}/item/${id}.json`),
          )
          if (!parsed.success || parsed.data.dead || parsed.data.deleted)
            return undefined
          const item = parsed.data
          const url = new URL(item.url)
          if (
            !['https:', 'http:'].includes(url.protocol) ||
            url.username ||
            url.password
          )
            return undefined
          return { id: item.id, title: item.title, url: url.href }
        }),
      )
      const headlines = results
        .flatMap((result) =>
          result.status === 'fulfilled' && result.value ? [result.value] : [],
        )
        .slice(0, 8)
      if (headlines.length) cached = headlines
      expires = now() + (headlines.length ? 15 * 60_000 : 60_000)
    } catch {
      expires = now() + 60_000
    }
    return cached
  }
  return () => {
    if (now() < expires) return Promise.resolve(cached)
    if (!pending)
      pending = refresh().finally(() => {
        pending = undefined
      })
    return pending
  }
}
export const readHeadlines = createHeadlineReader()
