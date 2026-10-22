type ErrorClient = {
  captureException: (
    error: Error,
    properties: Record<string, unknown>,
  ) => unknown
}
export type HandledOperation =
  | 'route'
  | 'contact_send'
  | 'cover_upload'
  | 'contact_submit'
  | 'cms_save'
  | 'cms_archive'
const reported = new WeakSet<object>()

/** Curated handled paths only: never read or forward the original error. */
export function reportHandledError(
  client: ErrorClient | undefined,
  original: unknown,
  operation: HandledOperation,
) {
  if (!client) return
  runTelemetry(() => {
    if (
      original !== null &&
      (typeof original === 'object' || typeof original === 'function')
    ) {
      if (reported.has(original)) return
      reported.add(original)
    }
    const sanitized = new Error(`Unexpected handled error: ${operation}`)
    // A non-empty, frameless stack also prevents the SDK from substituting
    // its own caller stack, whose script URLs may include private queries.
    sanitized.stack = `${sanitized.name}: ${sanitized.message}`
    client.captureException(sanitized, {
      handled: true,
      operation,
      // Replace automatic page/referrer URLs for these curated reports.
      $current_url: '',
      $referrer: '',
      $initial_current_url: '',
      $initial_referrer: '',
    })
  })
}

/** Analytics must never change a successful user action into a failure. */
export function runTelemetry(action: () => void) {
  try {
    action()
  } catch {
    // Best effort telemetry; preserve the application's own result and UI.
  }
}
