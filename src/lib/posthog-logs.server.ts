import { logs } from '@opentelemetry/api-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { NodeSDK } from '@opentelemetry/sdk-node'

let configured = false

function posthogServerLogger() {
  const apiKey = process.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN
  const apiHost = process.env.VITE_PUBLIC_POSTHOG_HOST

  if (!apiKey || !apiHost) {
    if (process.env.NODE_ENV === 'development') {
      const missingVariable = apiKey
        ? 'VITE_PUBLIC_POSTHOG_HOST'
        : 'VITE_PUBLIC_POSTHOG_PROJECT_TOKEN'
      throw new Error(
        `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
      )
    }

    return undefined
  }

  if (!configured) {
    const sdk = new NodeSDK({
      resource: resourceFromAttributes({
        'service.name': 'spicey-portfolio-server',
        'deployment.environment': process.env.NODE_ENV ?? 'production',
      }),
      logRecordProcessors: [
        new BatchLogRecordProcessor({
          exporter: new OTLPLogExporter({
            url: new URL('/i/v1/logs', apiHost).toString(),
            headers: { Authorization: `Bearer ${apiKey}` },
          }),
        }),
      ],
    })
    sdk.start()
    configured = true
  }

  return logs.getLogger('spicey-portfolio-posthog')
}

export function logPostHogServer({
  body,
  attributes,
  severity = 'info',
}: {
  body: string
  severity?: 'info' | 'error'
  attributes: Record<string, string | number | boolean>
}) {
  try {
    posthogServerLogger()?.emit({
      severityText: severity,
      body,
      attributes,
    })
  } catch {
    // Observability is best effort, including SDK setup and malformed config.
  }
}
