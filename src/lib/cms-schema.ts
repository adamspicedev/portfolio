import { z } from 'zod'
import { slugSchema } from './story-schema'

export const editorSchema = z
  .object({
    id: z.string().uuid().optional(),
    revision: z.number().int().positive().optional(),
    slug: slugSchema,
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(320),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine(
        (date) =>
          !Number.isNaN(Date.parse(date)) &&
          new Date(date).toISOString().slice(0, 10) === date,
        'Use a real calendar date',
      ),
    tags: z
      .array(z.string().trim().min(1).max(40))
      .max(8)
      .transform((tags) => [...new Set(tags)]),
    body: z.string().trim().min(1).max(100_000),
    cover: z
      .string()
      .max(2048)
      .refine(
        (url) =>
          !url ||
          (/^\/(?!\/)/.test(url) && !url.includes('\\')) ||
          /^https:\/\//i.test(url),
        'Use a local image path or HTTPS URL',
      ),
    seoTitle: z.string().trim().max(160).default(''),
    seoDescription: z.string().trim().max(320).default(''),
    draft: z.boolean(),
  })
  .refine(
    (story) => Boolean(story.id) === Boolean(story.revision),
    'Existing stories need an ID and revision',
  )

export type EditorInput = z.input<typeof editorSchema>
export type CmsStory = z.output<typeof editorSchema> & {
  id: string
  revision: number
  archived: boolean
  updatedAt: string
}
export const archiveSchema = z.object({
  id: z.string().uuid(),
  revision: z.number().int().positive(),
  archived: z.boolean(),
})
