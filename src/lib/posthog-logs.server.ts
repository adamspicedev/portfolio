import { logs } from '@opentelemetry/api-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { NodeSDK } from '@opentelemetry/sdk-node'

let configured = false
let processor: BatchLogRecordProcessor | undefined

function posthogServerLogger() {
  const apiKey = process.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN
  const apiHost = process.env.VITE_PUBLIC_POSTHOG_HOST

  if (!apiKey || !apiHost) {
    return undefined
  }

  if (!configured) {
    processor = new BatchLogRecordProcessor({
      exporter: new OTLPLogExporter({
        url: new URL('/i/v1/logs', apiHost).toString(),
        headers: { Authorization: `Bearer ${apiKey}` },
        timeoutMillis: 1500,
      }),
    })
    const sdk = new NodeSDK({
      resource: resourceFromAttributes({
        'service.name': 'spicey-portfolio-server',
        'deployment.environment': process.env.NODE_ENV ?? 'production',
      }),
      logRecordProcessors: [processor],
    })
    sdk.start()
    configured = true
  }

  return logs.getLogger('spicey-portfolio-posthog')
}

export async function logPostHogServer({
  body,
  attributes,
  severity = 'INFO',
}: {
  body: string
  attributes: Record<string, string | number | boolean>
  severity?: 'INFO' | 'ERROR'
}) {
  try {
    const logger = posthogServerLogger()
    if (!logger) return false
    logger.emit({
      severityNumber: severity === 'ERROR' ? 17 : 9,
      severityText: severity,
      body,
      attributes,
    })
    await processor?.forceFlush()
    return true
  } catch {
    // Telemetry failure must not turn an already-delivered email into a failure.
    return false
  }
}
