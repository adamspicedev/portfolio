import { describe, expect, it } from 'bun:test'
import { canAdminister } from './admin-access'
import { editorSchema } from './cms-schema'
import { validClerkConfiguration } from './clerk-config'

describe('CMS authorization and validation', () => {
  it('denies signed-out users, unlisted accounts and empty configuration', () => {
    expect(canAdminister(null, 'user_admin')).toBe(false)
    expect(canAdminister('user_other', 'user_admin')).toBe(false)
    expect(canAdminister('user_admin', undefined)).toBe(false)
    expect(canAdminister('user_admin', ',  ,')).toBe(false)
    expect(canAdminister('user_admin', 'user_admin_extra')).toBe(false)
    expect(canAdminister('user_admin', ' user_other, user_admin ')).toBe(true)
  })
  it('rejects impossible dates, invalid cover schemes, oversized content and missing revisions', () => {
    const input = {
      title: 'Story',
      slug: 'story',
      description: 'Summary',
      date: '2026-10-08',
      tags: [],
      body: 'Words',
      cover: '',
      draft: true,
    }
    expect(editorSchema.safeParse(input).success).toBe(true)
    for (const invalid of [
      { ...input, date: '2026-02-30' },
      { ...input, cover: 'javascript:alert(1)' },
      { ...input, cover: '//example.com/image.png' },
      { ...input, cover: 'http://example.com/image.png' },
      { ...input, body: 'a'.repeat(100_001) },
      { ...input, id: crypto.randomUUID() },
      { ...input, revision: 1 },
    ])
      expect(editorSchema.safeParse(invalid).success).toBe(false)
  })
})

it('keeps auth disabled for malformed, placeholder and mismatched Clerk keys', () => {
  expect(validClerkConfiguration('pk_test_example', 'sk_test_example')).toBe(
    true,
  )
  expect(validClerkConfiguration('pk_test_example', 'YOUR_SECRET_KEY')).toBe(
    false,
  )
  expect(validClerkConfiguration('pk_test_example', 'sk_test_…')).toBe(false)
  expect(validClerkConfiguration('pk_test_example', 'sk_test_example\n')).toBe(
    false,
  )
  expect(validClerkConfiguration('pk_test_example', 'sk_live_example')).toBe(
    false,
  )
  expect(validClerkConfiguration(undefined, 'sk_test_example')).toBe(false)
})
