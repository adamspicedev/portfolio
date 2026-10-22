import { expect, test } from 'bun:test'
import { syncAdminIdentity } from './posthog-identity'
test('returning administrators keep their identity; switching and sign-out reset it', () => {
  let id: string | undefined
  const events: string[] = []
  const client = {
    setPersonProperties: (properties: Record<string, boolean>) => {
      expect(properties).toEqual({ $internal_or_test_user: true })
    },
    get_property: () => id,
    register: (properties: Record<string, string>) => {
      id = properties.portfolio_admin_id
    },
    identify: (value: string) => {
      events.push(`identify:${value}`)
    },
    reset: () => {
      events.push('reset')
      id = undefined
    },
  }
  syncAdminIdentity(client, 'user_a')
  syncAdminIdentity(client, 'user_a')
  syncAdminIdentity(client, 'user_b')
  syncAdminIdentity(client, null)
  syncAdminIdentity(client, null)
  expect(events).toEqual([
    'identify:user_a',
    'reset',
    'identify:user_b',
    'reset',
  ])
})
