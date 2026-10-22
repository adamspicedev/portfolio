import {
  reportHandledError,
  runTelemetry,
  type HandledOperation,
} from './client-telemetry'
type AnalyticsClient = {
  capture: (event: string, properties?: Record<string, string>) => unknown
  captureException: (
    error: Error,
    properties?: Record<string, unknown>,
  ) => unknown
}

// Telemetry must never change whether a save or submission succeeds.
export function track(
  client: AnalyticsClient,
  event: string,
  properties?: Record<string, string>,
) {
  runTelemetry(() => {
    client.capture(event, properties)
  })
}

export function reportFailure(
  client: AnalyticsClient,
  operation: HandledOperation,
) {
  reportHandledError(client, undefined, operation)
}
