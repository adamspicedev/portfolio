import { z } from 'zod'
import { safeContentUrl, slugSchema, type Story } from './story-schema'

type Node = {
  type: string
  text?: string
  attrs?: Record<string, unknown>
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  content?: Node[]
}
const nodeSchema: z.ZodType<Node> = z.lazy(() =>
  z.object({
    type: z.string(),
    text: z.string().optional(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    marks: z
      .array(
        z.object({
          type: z.string(),
          attrs: z.record(z.string(), z.unknown()).optional(),
        }),
      )
      .optional(),
    content: z.array(nodeSchema).optional(),
  }),
)
const articleSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  description: z.string(),
  createdAt: z.string().refine((value) => !Number.isNaN(Date.parse(value))),
  imageUrl: z.string().optional(),
  content: nodeSchema,
  tags: z.array(z.object({ tag: z.object({ name: z.string() }) })).default([]),
})

const escape = (value: string) => value.replace(/[\\`*_{}[\]<>#!|]/g, '\\$&')
function markdown(node: Node): string {
  const children = (node.content ?? []).map(markdown).join('')
  switch (node.type) {
    case 'doc':
      return children
    case 'text': {
      let text = escape(node.text ?? '')
      for (const mark of node.marks ?? []) {
        if (mark.type === 'bold') text = `**${text}**`
        if (mark.type === 'italic') text = `*${text}*`
        if (mark.type === 'strike') text = `~~${text}~~`
        if (mark.type === 'code')
          text = `\`\`${(node.text ?? '').replace(/`/g, '\\`')}\`\``
        if (mark.type === 'link' && typeof mark.attrs?.href === 'string') {
          const href = safeContentUrl(mark.attrs.href)
          if (href) text = `[${text}](<${href.replace(/[<>\r\n]/g, '')}>)`
        }
      }
      return text
    }
    case 'paragraph':
      return `${children}\n\n`
    case 'heading': {
      const level =
        typeof node.attrs?.level === 'number'
          ? Math.min(6, Math.max(2, node.attrs.level))
          : 2
      return `${'#'.repeat(level)} ${children}\n\n`
    }
    case 'hardBreak':
      return '  \n'
    case 'horizontalRule':
      return '\n---\n\n'
    case 'blockquote':
      return (
        children
          .trim()
          .split('\n')
          .map((line) => `> ${line}`)
          .join('\n') + '\n\n'
      )
    case 'bulletList':
      return (
        (node.content ?? [])
          .map((item) => `- ${markdown(item).trim().replace(/\n/g, '\n  ')}`)
          .join('\n') + '\n\n'
      )
    case 'orderedList':
      return (
        (node.content ?? [])
          .map(
            (item, i) =>
              `${i + 1}. ${markdown(item).trim().replace(/\n/g, '\n   ')}`,
          )
          .join('\n') + '\n\n'
      )
    case 'listItem':
      return children
    case 'codeBlock': {
      const text = (node.content ?? []).map((item) => item.text ?? '').join('')
      const fence = '`'.repeat(
        Math.max(
          3,
          ...[...text.matchAll(/`+/g)].map((match) => match[0].length + 1),
        ),
      )
      const language =
        typeof node.attrs?.language === 'string'
          ? node.attrs.language.replace(/[^a-z0-9-]/gi, '')
          : ''
      return `${fence}${language}\n${text}\n${fence}\n\n`
    }
    case 'image': {
      const src =
        typeof node.attrs?.src === 'string'
          ? safeContentUrl(node.attrs.src)
          : undefined
      return src
        ? `![${escape(String(node.attrs?.alt ?? ''))}](<${src.replace(/[<>\r\n]/g, '')}>)\n\n`
        : ''
    }
    default:
      return children
  }
}

async function fetchLegacy(path = ''): Promise<unknown> {
  const base = process.env.WRITE_IT_UP_URL
  if (!base) return undefined
  const response = await fetch(`${base.replace(/\/$/, '')}${path}`, {
    signal: AbortSignal.timeout(4000),
  })
  if (!response.ok) throw new Error('Legacy story service unavailable')
  return response.json()
}
function toStory(article: z.infer<typeof articleSchema>): Story {
  const body = markdown(article.content).trim()
  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    date: new Date(article.createdAt).toISOString().slice(0, 10),
    tags: [...new Set(article.tags.map(({ tag }) => tag.name))],
    draft: false,
    cover: article.imageUrl ? safeContentUrl(article.imageUrl) : undefined,
    body,
    readingMinutes: Math.max(1, Math.ceil(body.split(/\s+/).length / 220)),
  }
}
let cache: { until: number; stories: Story[] } | undefined
export async function getLegacyStories() {
  if (!process.env.WRITE_IT_UP_URL) return []
  if (cache && cache.until > Date.now()) return cache.stories
  try {
    const response = z
      .object({ body: z.object({ articles: z.array(articleSchema) }) })
      .parse(await fetchLegacy())
    const stories = response.body.articles.map(toStory)
    cache = { until: Date.now() + 60_000, stories }
    return stories
  } catch {
    console.warn(
      'Legacy stories could not be loaded; local stories remain available.',
    )
    cache = { until: Date.now() + 60_000, stories: cache?.stories ?? [] }
    return cache.stories
  }
}
export async function getLegacyStory(slug: string) {
  if (!process.env.WRITE_IT_UP_URL) return undefined
  try {
    const response = z
      .object({ body: z.array(articleSchema) })
      .parse(await fetchLegacy(`/${encodeURIComponent(slug)}`))
    const article = response.body.find((item) => item.slug === slug)
    return article ? toStory(article) : undefined
  } catch {
    console.warn('Legacy story could not be loaded.')
    return undefined
  }
}
