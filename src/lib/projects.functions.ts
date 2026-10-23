import { createServerFn } from '@tanstack/react-start'
import { projectSchema } from './project-schema'
import { archiveSchema } from './cms-schema'
import { requireAdmin } from './admin.server'
import { storyStore } from './story-store.server'
import { ProjectConflict } from './sqlite-projects.server'
import { logPostHogServer } from './posthog-logs.server'

async function runProjectOperation<T>(action: () => Promise<T>) {
  try {
    return { ok: true, project: await action() } as const
  } catch (error) {
    if (error instanceof ProjectConflict)
      return { ok: false, message: error.message } as const
    try {
      await logPostHogServer({
        body: 'Project CMS operation failed',
        severity: 'error',
        attributes: { content: 'project' },
      })
    } catch {
      /* Preserve the safe failure response. */
    }
    return {
      ok: false,
      message:
        'Unable to update the project. Your edits are still here. Try again.',
    } as const
  }
}
export const getProjects = createServerFn({ method: 'GET' }).handler(async () =>
  (await storyStore()).projects.published(),
)
export const saveCmsProject = createServerFn({ method: 'POST' })
  .validator((input: unknown) => projectSchema.parse(input))
  .handler(async ({ data }) => {
    const actor = await requireAdmin()
    return runProjectOperation(async () =>
      (await storyStore()).projects.save(data, actor),
    )
  })
export const archiveCmsProject = createServerFn({ method: 'POST' })
  .validator((input: unknown) => archiveSchema.parse(input))
  .handler(async ({ data }) => {
    const actor = await requireAdmin()
    return runProjectOperation(async () =>
      (await storyStore()).projects.archive(
        data.id,
        data.revision,
        data.archived,
        actor,
      ),
    )
  })
