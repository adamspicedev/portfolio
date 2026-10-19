import { describe, expect, it } from 'bun:test'
import { contactSchema } from './contact-schema'

describe('contact boundary', () => {
  it('rejects malformed email, empty messages, oversized messages, and non-string input', () => {
    for (const input of [
      { email: 'not-an-email', message: 'A valid message here.' },
      { email: 'me@example.com', message: '   ' },
      { email: 'me@example.com', message: 'a'.repeat(5001) },
      { email: ['me@example.com'], message: 'A valid message here.' },
      {
        email: 'me@example.com\r\nBcc:someone@example.com',
        message: 'A valid message here.',
      },
    ])
      expect(contactSchema.safeParse(input).success).toBe(false)
    expect(
      contactSchema.parse({
        email: 'me@example.com',
        message: '  A valid message here.  ',
      }),
    ).toEqual({
      email: 'me@example.com',
      message: 'A valid message here.',
      website: '',
      turnstileToken: '',
    })
  })
})
