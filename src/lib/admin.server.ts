import { auth } from '@clerk/tanstack-react-start/server'
import { canAdminister } from './admin-access'
import { validClerkConfiguration } from './clerk-config'

export function authConfigured() {
  return validClerkConfiguration(
    process.env.VITE_CLERK_PUBLISHABLE_KEY,
    process.env.CLERK_SECRET_KEY,
  )
}
export async function adminIdentity() {
  if (!authConfigured()) return { status: 'setup' } as const
  const { userId } = await auth()
  if (!userId) return { status: 'signed-out' } as const
  if (!canAdminister(userId, process.env.CMS_ADMIN_USER_IDS))
    return { status: 'forbidden', userId } as const
  return { status: 'admin', userId } as const
}
export async function requireAdmin() {
  const identity = await adminIdentity()
  if (identity.status !== 'admin')
    throw new Error('Administrator access required.')
  return identity.userId
}
