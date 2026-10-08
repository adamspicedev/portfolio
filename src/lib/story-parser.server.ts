import { z } from 'zod'
import { parse as parseYaml } from 'yaml'
import { safeContentUrl, slugSchema, type Story } from './story-schema'

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (date) =>
      !Number.isNaN(Date.parse(date)) &&
      new Date(date).toISOString().slice(0, 10) === date,
    'Use a real calendar date in YYYY-MM-DD format',
  )

const metadataSchema = z.object({
  title: z.string().trim().min(1).max(160),
  date: dateSchema,
  description: z.string().trim().min(1).max(320),
  tags: z
    .array(z.string().trim().min(1).max(40))
    .max(8)
    .default([])
    .transform((tags) => [...new Set(tags)]),
  coverAlt: z.string().trim().max(500).optional(),
  draft: z.boolean().default(false),
  cover: z
    .string()
    .refine(
      (url) => Boolean(safeContentUrl(url)),
      'Use a local path or an HTTP(S) image URL',
    )
    .optional(),
})

export type StoryMetadata = z.infer<typeof metadataSchema>

export function parseStory(filename: string, raw: string): Story {
  const slug = slugSchema.parse(
    filename.replace(/^.*\//, '').replace(/\.md$/, ''),
  )
  const normalized = raw.replace(/^\uFEFF/, '')
  const frontmatter = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!frontmatter)
    throw new Error(
      'Start each story with a YAML metadata block between --- lines.',
    )
  const metadata = metadataSchema.parse(parseYaml(frontmatter[1] ?? ''))
  const content = normalized.slice(frontmatter[0].length).trim()
  return {
    ...metadata,
    slug,
    body: content,
    readingMinutes: Math.max(1, Math.ceil(content.split(/\s+/).length / 220)),
  }
}
