import type { Resend } from 'resend'
import * as protection from './contact-protection.server'
import * as telemetry from './posthog-logs.server'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from 'bun:test'

const send = mock<Resend['emails']['send']>(async () => ({
  data: { id: 'test-id' },
  error: null,
  headers: null,
}))
const { Resend: RealResend } = await import('resend')
const constructor = mock<(key: string) => void>(() => {})
mock.module('resend', () => ({
  Resend: class extends RealResend {
    constructor(key: string) {
      super(key)
      this.emails.send = send
      constructor(key)
    }
  },
}))
// Import after the module mock so the SDK can never send a real email.
const { deliverContact } = await import('./contact.server')
const environmentKeys = [
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'VITE_PUBLIC_POSTHOG_PROJECT_TOKEN',
  'VITE_PUBLIC_POSTHOG_HOST',
]
const originalEnvironment = new Map(
  environmentKeys.map((key) => [key, process.env[key]]),
)

beforeEach(() => {
  delete process.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN
  delete process.env.VITE_PUBLIC_POSTHOG_HOST
  spyOn(protection, 'authorizeContact').mockResolvedValue({ ok: true })
  process.env.RESEND_API_KEY = 'test-api-key'
  process.env.RESEND_FROM_EMAIL = 'Portfolio <hello@example.com>'
  send
    .mockReset()
    .mockResolvedValue({ data: { id: 'test-id' }, error: null, headers: null })
  constructor.mockClear()
  spyOn(telemetry, 'logPostHogServer').mockResolvedValue(true)
  spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  for (const [key, value] of originalEnvironment) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  mock.restore()
})
const message = (email: string) => ({
  email,
  message: 'A useful message from a visitor.',
  website: '',
  turnstileToken: 'local-test-token',
})

describe('contact email delivery', () => {
  it('does not contact Resend without configuration and gives an email fallback', async () => {
    process.env.RESEND_API_KEY = ''
    expect(await deliverContact(message('offline@example.com'))).toEqual({
      ok: false,
      reason: 'offline',
      message: expect.stringContaining('currently offline'),
    })
    expect(send).not.toHaveBeenCalled()
    expect(telemetry.logPostHogServer).not.toHaveBeenCalled()
    expect(constructor).not.toHaveBeenCalled()
  })
  it('silently discards honeypot submissions without sending mail', async () => {
    expect(
      await deliverContact({
        ...message('bot@example.com'),
        website: 'https://spam.example',
      }),
    ).toEqual({ ok: true })
    expect(send).not.toHaveBeenCalled()
  })
  it('sends to Adam with the visitor as reply-to and preserves the message as plain text', async () => {
    const input = {
      ...message('visitor@example.com'),
      message: 'Hello <script>alert(1)</script>',
    }
    expect(await deliverContact(input)).toEqual({ ok: true })
    expect(constructor).toHaveBeenCalledWith('test-api-key')
    expect(send).toHaveBeenCalledWith({
      from: 'Portfolio <hello@example.com>',
      to: 'adam@spicey.dev',
      replyTo: input.email,
      subject: 'Message from portfolio',
      tags: [{ name: 'channel', value: 'contact_form' }],
      text: `From: ${input.email}\n\n${input.message}`,
    })
    expect(telemetry.logPostHogServer).toHaveBeenCalledWith({
      body: 'contact email accepted',
      severity: 'info',
      attributes: { channel: 'contact_form', email_id: 'test-id' },
    })
  })
  it.each(['rejection', 'exception'])(
    'reports a provider %s as failure rather than a successful send',
    async (kind) => {
      if (kind === 'rejection')
        send.mockResolvedValue({
          data: null,
          error: {
            name: 'validation_error',
            message: 'Private provider details',
            statusCode: 400,
          },
          headers: null,
        })
      else send.mockRejectedValue(new Error('Private provider details'))
      expect(await deliverContact(message(`${kind}@example.com`))).toEqual({
        ok: false,
        reason:
          kind === 'rejection' ? 'provider_rejected' : 'provider_unavailable',
        message:
          'Your message could not be sent. Try again, or email adam@spicey.dev directly.',
      })
    },
  )
  it('preserves delivered success when telemetry fails', async () => {
    spyOn(telemetry, 'logPostHogServer').mockImplementation(() => {
      throw new Error('Telemetry setup failed')
    })
    expect(await deliverContact(message('telemetry@example.com'))).toEqual({
      ok: true,
    })
    expect(send).toHaveBeenCalledTimes(1)
  })
  it('preserves acceptance when asynchronous telemetry rejects', async () => {
    spyOn(telemetry, 'logPostHogServer').mockRejectedValue(new Error('SDK'))
    expect(
      await deliverContact(message('async-telemetry@example.com')),
    ).toEqual({ ok: true })
    expect(send).toHaveBeenCalledTimes(1)
  })
  it.each(['rejection', 'exception'])(
    'logs a sanitized provider %s',
    async (kind) => {
      const privateDetails =
        'secret token visitor@example.com private form message'
      if (kind === 'rejection')
        send.mockResolvedValue({
          data: null,
          error: {
            name: privateDetails as 'validation_error',
            message: privateDetails,
            statusCode: 500,
          },
          headers: null,
        })
      else send.mockRejectedValue(new Error(privateDetails))
      await deliverContact(message(`sanitized-${kind}@example.com`))
      expect(telemetry.logPostHogServer).toHaveBeenCalledWith({
        body: 'contact email delivery failed',
        severity: 'error',
        attributes: {
          channel: 'contact_form',
          failure:
            kind === 'rejection' ? 'provider_rejected' : 'provider_unreachable',
        },
      })
      expect(
        JSON.stringify((console.error as ReturnType<typeof spyOn>).mock.calls),
      ).not.toContain(privateDetails)
    },
  )
  it('does not send when verification or shared throttling rejects a request', async () => {
    spyOn(protection, 'authorizeContact').mockResolvedValue({
      ok: false,
      message: 'Sending is paused to prevent spam.',
    })
    expect(await deliverContact(message('limited@example.com'))).toEqual({
      ok: false,
      message: 'Sending is paused to prevent spam.',
    })
    expect(send).not.toHaveBeenCalled()
  })
})
