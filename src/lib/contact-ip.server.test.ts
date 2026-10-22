import { expect, test } from 'bun:test'
import { trustedContactIp } from './contact-ip.server'
test('ignores spoofable forwarded headers without Vercel or a trusted Cloudflare peer', () => {
  const h = new Headers({
    'cf-connecting-ip': '198.51.100.4',
    'x-forwarded-for': '198.51.100.8',
  })
  expect(trustedContactIp(h, false)).toBeUndefined()
  expect(trustedContactIp(h, true)).toBeUndefined()
  h.set('x-vercel-forwarded-for', '203.0.113.9')
  expect(trustedContactIp(h, true)).toBe('203.0.113.9')
})
test('uses Cloudflare client IP only behind its verified Vercel-observed peer', () => {
  const h = new Headers({
    'x-vercel-forwarded-for': '104.16.1.2',
    'cf-connecting-ip': '2001:db8:0:0::1',
  })
  expect(trustedContactIp(h, true)).toBe('2001:db8::1')
  h.set('cf-connecting-ip', 'evil, 198.51.100.1')
  expect(trustedContactIp(h, true)).toBeUndefined()
  h.set('x-vercel-forwarded-for', '203.0.113.2, 104.16.1.2')
  expect(trustedContactIp(h, true)).toBeUndefined()
})
test('rejects scoped or malformed IPs without throwing and canonicalises IPv6 peers', () => {
  const malformed = new Headers({ 'x-vercel-forwarded-for': 'fe80::1%eth0' })
  expect(() => trustedContactIp(malformed, true)).not.toThrow()
  expect(trustedContactIp(malformed, true)).toBeUndefined()
  const h = new Headers({
    'x-vercel-forwarded-for': '2606:4700:0:0::1',
    'cf-connecting-ip': '198.51.100.4',
  })
  expect(trustedContactIp(h, true)).toBe('198.51.100.4')
})
