import { createServerFn } from '@tanstack/react-start'
import { editorSchema, archiveSchema } from './cms-schema'
import { adminIdentity, requireAdmin } from './admin.server'
import { storyStore } from './story-store.server'
import { runCmsOperation } from './cms-operation.server'

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
    return runCmsOperation('save', async () => {
      const store = await storyStore()
      return store.save(data, actor)
    })
  })
export const archiveCmsStory = createServerFn({ method: 'POST' })
  .validator((input: unknown) => archiveSchema.parse(input))
  .handler(async ({ data }) => {
    const actor = await requireAdmin()
    return runCmsOperation('archive', async () => {
      const store = await storyStore()
      return store.archive(data.id, data.revision, data.archived, actor)
    })
  })
