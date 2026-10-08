import type { Resend } from 'resend'
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
const constructor = mock<(key: string) => void>(() => {})
mock.module('resend', () => ({
  Resend: class {
    emails = { send }
    constructor(key: string) {
      constructor(key)
    }
  },
}))
// Import after the module mock so the SDK can never send a real email.
const { deliverContact } = await import('./contact.server')
const environmentKeys = ['RESEND_API_KEY', 'RESEND_FROM_EMAIL']
const originalEnvironment = new Map(
  environmentKeys.map((key) => [key, process.env[key]]),
)

beforeEach(() => {
  process.env.RESEND_API_KEY = 'test-api-key'
  process.env.RESEND_FROM_EMAIL = 'Portfolio <hello@example.com>'
  send
    .mockReset()
    .mockResolvedValue({ data: { id: 'test-id' }, error: null, headers: null })
  constructor.mockClear()
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
})

describe('contact email delivery', () => {
  it('does not contact Resend without configuration and gives an email fallback', async () => {
    process.env.RESEND_API_KEY = ''
    expect(await deliverContact(message('offline@example.com'))).toEqual({
      ok: false,
      message: expect.stringContaining('currently offline'),
    })
    expect(send).not.toHaveBeenCalled()
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
      text: `From: ${input.email}\n\n${input.message}`,
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
        message:
          'Your message could not be sent. Try again, or email adam@spicey.dev directly.',
      })
    },
  )
  it('throttles repeated submissions case-insensitively before calling the provider', async () => {
    for (let i = 0; i < 3; i++)
      expect(await deliverContact(message('limited@example.com'))).toEqual({
        ok: true,
      })
    expect(await deliverContact(message('LIMITED@example.com'))).toEqual({
      ok: false,
      message: expect.stringContaining('Too many messages'),
    })
    expect(send).toHaveBeenCalledTimes(3)
  })
})
