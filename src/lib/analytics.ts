type AnalyticsClient = {
  capture: (event: string, properties?: Record<string, string>) => unknown
  captureException: (
    error: Error,
    properties?: Record<string, string>,
  ) => unknown
}

// Telemetry must never change whether a save or submission succeeds.
export function track(
  client: AnalyticsClient,
  event: string,
  properties?: Record<string, string>,
) {
  try {
    client.capture(event, properties)
  } catch {
    /* Best effort. */
  }
}

export function reportFailure(client: AnalyticsClient, operation: string) {
  try {
    // Server errors can contain submitted content. Report only a known operation.
    client.captureException(new Error(`Portfolio ${operation} failed`), {
      operation,
    })
  } catch {
    /* Best effort. */
  }
}
