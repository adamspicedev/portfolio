import { afterEach, beforeEach, expect, spyOn, mock, test } from 'bun:test'
import * as limits from './contact-limits.server'
import { authorizeContact } from './contact-protection.server'
const oldSecret = process.env.TURNSTILE_SECRET_KEY
beforeEach(() => {
  process.env.TURNSTILE_SECRET_KEY = 'local-test-secret'
  spyOn(limits, 'reserveContactSubmission').mockResolvedValue({
    allowed: true,
    retryAfterSeconds: 0,
  })
})
afterEach(() => {
  mock.restore()
  if (oldSecret === undefined) delete process.env.TURNSTILE_SECRET_KEY
  else process.env.TURNSTILE_SECRET_KEY = oldSecret
})
const input = {
  email: 'visitor@example.com',
  message: 'Private form content',
  website: '',
  turnstileToken: 'local-token',
}
const success = () => ({
  success: true,
  hostname: 'www.spicey.dev',
  action: 'contact',
  challenge_ts: new Date().toISOString(),
})
test('requires verification and trusted IP before shared reservation', async () => {
  const fetch = spyOn(globalThis, 'fetch').mockResolvedValue(
    Response.json(success()),
  )
  expect(await authorizeContact(input, '203.0.113.1')).toEqual({ ok: true })
  expect(limits.reserveContactSubmission).toHaveBeenCalledTimes(1)
  const options = fetch.mock.calls[0][1] as RequestInit
  expect(String(options.body)).not.toContain(input.email)
  expect(String(options.body)).not.toContain(input.message)
  expect(String(options.body)).not.toContain('203.0.113.1')
})
test('rejects wrong hostname/action, expired and replayed tokens without reserving sends', async () => {
  const fetch = spyOn(globalThis, 'fetch')
  for (const body of [
    { ...success(), hostname: 'evil.example' },
    { ...success(), action: 'login' },
    {
      ...success(),
      challenge_ts: new Date(Date.now() - 301_000).toISOString(),
    },
    { success: false, 'error-codes': ['timeout-or-duplicate'] },
    {},
  ]) {
    fetch.mockResolvedValue(Response.json(body))
    expect((await authorizeContact(input, '203.0.113.1')).ok).toBe(false)
  }
  expect(limits.reserveContactSubmission).not.toHaveBeenCalled()
})
test('fails closed for missing config, missing token/IP, network error and malformed response', async () => {
  const fetch = spyOn(globalThis, 'fetch').mockRejectedValue(
    new Error('private network details'),
  )
  for (const token of ['', 'x'.repeat(2049)])
    expect(
      (
        await authorizeContact(
          { ...input, turnstileToken: token },
          '203.0.113.1',
        )
      ).ok,
    ).toBe(false)
  expect((await authorizeContact(input, undefined)).ok).toBe(false)
  delete process.env.TURNSTILE_SECRET_KEY
  expect((await authorizeContact(input, '203.0.113.1')).ok).toBe(false)
  process.env.TURNSTILE_SECRET_KEY = 'local-test-secret'
  expect((await authorizeContact(input, '203.0.113.1')).ok).toBe(false)
  fetch.mockResolvedValue(new Response('not-json'))
  expect((await authorizeContact(input, '203.0.113.1')).ok).toBe(false)
  expect(limits.reserveContactSubmission).not.toHaveBeenCalled()
})
test('shared limit or database failure never authorizes sending', async () => {
  spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(success()))
  const reserve = spyOn(limits, 'reserveContactSubmission').mockResolvedValue({
    allowed: false,
    retryAfterSeconds: 600,
  })
  expect(await authorizeContact(input, '203.0.113.1')).toMatchObject({
    ok: false,
    message: expect.stringContaining('10 minutes'),
  })
  reserve.mockRejectedValue(new Error('private database details'))
  expect(await authorizeContact(input, '203.0.113.1')).toMatchObject({
    ok: false,
    message: expect.stringContaining('temporarily unavailable'),
  })
})
