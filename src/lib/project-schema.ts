import { z } from 'zod'

export const projectSchema = z
  .object({
    id: z.string().uuid().optional(),
    revision: z.number().int().positive().optional(),
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(1000),
    category: z.string().trim().min(1).max(80),
    link: z
      .string()
      .trim()
      .max(2048)
      .url()
      .refine(
        (url) => /^https?:\/\//i.test(url),
        'Use an HTTP or HTTPS project URL',
      ),
    image: z
      .string()
      .trim()
      .min(1)
      .max(2048)
      .refine(
        (url) =>
          (/^\/(?!\/)/.test(url) && !url.includes('\\')) ||
          /^https:\/\//i.test(url),
        'Use a local image path or HTTPS URL',
      ),
    imageAlt: z.string().trim().max(500).default(''),
    tags: z
      .array(z.string().trim().min(1).max(40))
      .max(8)
      .transform((tags) => [...new Set(tags)]),
    color: z.enum(['cobalt', 'pink']),
    position: z.number().int().min(0).max(10000),
    draft: z.boolean(),
  })
  .refine(
    (project) => Boolean(project.id) === Boolean(project.revision),
    'Existing projects need an ID and revision',
  )

export type ProjectInput = z.input<typeof projectSchema>
export type CmsProject = z.output<typeof projectSchema> & {
  id: string
  revision: number
  archived: boolean
  updatedAt: string
}
