import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'

let userId: string | null = null
const readAuth = mock(() => ({ userId }))
mock.module('@clerk/tanstack-react-start/server', () => ({ auth: readAuth }))
const { adminIdentity, requireAdmin } = await import('./admin.server')
const keys = [
  'CLERK_SECRET_KEY',
  'VITE_CLERK_PUBLISHABLE_KEY',
  'CMS_ADMIN_USER_IDS',
]
const original = new Map(keys.map((key) => [key, process.env[key]]))
beforeEach(() => {
  process.env.CLERK_SECRET_KEY = 'sk_test_unit_only'
  process.env.VITE_CLERK_PUBLISHABLE_KEY = 'pk_test_unit_only'
  process.env.CMS_ADMIN_USER_IDS = 'user_admin'
  userId = null
  readAuth.mockClear()
})
afterEach(() => {
  for (const [key, value] of original) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})
describe('server administrator boundary', () => {
  it('fails closed without Clerk configuration before checking any session', async () => {
    delete process.env.CLERK_SECRET_KEY
    userId = 'user_admin'
    expect(await adminIdentity()).toEqual({ status: 'setup' })
    await expect(requireAdmin()).rejects.toThrow(
      'Administrator access required',
    )
    expect(readAuth).not.toHaveBeenCalled()
  })
  it('rejects signed-out and signed-in non-admin users', async () => {
    expect(await adminIdentity()).toEqual({ status: 'signed-out' })
    await expect(requireAdmin()).rejects.toThrow(
      'Administrator access required',
    )
    userId = 'user_other'
    expect(await adminIdentity()).toEqual({
      status: 'forbidden',
      userId: 'user_other',
    })
    await expect(requireAdmin()).rejects.toThrow(
      'Administrator access required',
    )
  })
  it('requires an explicit allowlist even for an authenticated account', async () => {
    userId = 'user_admin'
    expect(await requireAdmin()).toBe('user_admin')
    process.env.CMS_ADMIN_USER_IDS = ''
    await expect(requireAdmin()).rejects.toThrow(
      'Administrator access required',
    )
  })
})
