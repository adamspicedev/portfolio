type IdentityClient = {
  get_property: (name: string) => unknown
  identify: (id: string) => void
  setPersonProperties: (properties: Record<string, boolean>) => void
  register: (properties: Record<string, string>) => void
  reset: () => void
}
export function syncAdminIdentity(
  client: IdentityClient,
  userId: string | null,
) {
  const previous = client.get_property('portfolio_admin_id')
  if (previous === userId) {
    if (userId) client.setPersonProperties({ $internal_or_test_user: true })
    return
  }
  if (!previous && !userId) return
  if (previous) client.reset()
  if (userId) {
    client.identify(userId)
    client.setPersonProperties({ $internal_or_test_user: true })
    client.register({ portfolio_admin_id: userId })
  }
}
