import { createServerFn } from '@tanstack/react-start'
import { editorSchema, archiveSchema } from './cms-schema'
import { adminIdentity, requireAdmin } from './admin.server'
import { DuplicateSlug, StoryConflict, storyStore } from './story-store.server'

export const getAdminDashboard = createServerFn({ method: 'GET' }).handler(
  async () => {
    const identity = await adminIdentity()
    const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY || ''
    if (identity.status !== 'admin')
      return { ...identity, publishableKey, stories: [] }
    const store = await storyStore()
    return { ...identity, publishableKey, stories: await store.all() }
  },
)
export const saveCmsStory = createServerFn({ method: 'POST' })
  .validator((input: unknown) => editorSchema.parse(input))
  .handler(async ({ data }) => {
    const actor = await requireAdmin()
    try {
      const store = await storyStore()
      return { ok: true, story: await store.save(data, actor) } as const
    } catch (error) {
      if (error instanceof StoryConflict || error instanceof DuplicateSlug)
        return { ok: false, message: error.message } as const
      console.error('CMS save failed', error)
      return {
        ok: false,
        message:
          'Unable to save the story. Your edits are still here. Try again.',
      } as const
    }
  })
export const archiveCmsStory = createServerFn({ method: 'POST' })
  .validator((input: unknown) => archiveSchema.parse(input))
  .handler(async ({ data }) => {
    const actor = await requireAdmin()
    try {
      const store = await storyStore()
      return {
        ok: true,
        story: await store.archive(
          data.id,
          data.revision,
          data.archived,
          actor,
        ),
      } as const
    } catch (error) {
      if (error instanceof StoryConflict)
        return { ok: false, message: error.message } as const
      console.error('CMS archive failed', error)
      return {
        ok: false,
        message: 'Unable to update the story. Try again.',
      } as const
    }
  })
