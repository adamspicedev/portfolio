import { DuplicateSlug, StoryConflict } from './sqlite-stories.server'
import { logPostHogServer } from './posthog-logs.server'

// Authorization and validation run before this boundary. Only unexpected store
// failures are reported; ordinary editing conflicts remain actionable results.
export async function runCmsOperation<T>(
  operation: 'save' | 'archive',
  action: () => Promise<T>,
) {
  try {
    return { ok: true, story: await action() } as const
  } catch (error) {
    if (
      error instanceof StoryConflict ||
      (operation === 'save' && error instanceof DuplicateSlug)
    )
      return { ok: false, message: error.message } as const
    try {
      logPostHogServer({
        body: 'CMS operation failed',
        severity: 'error',
        attributes: { operation },
      })
    } catch {
      // Reporting must preserve the safe failure response even if the SDK fails.
    }
    return {
      ok: false,
      message:
        operation === 'save'
          ? 'Unable to save the story. Your edits are still here. Try again.'
          : 'Unable to update the story. Try again.',
    } as const
  }
}
