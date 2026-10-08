export function canAdminister(
  userId: string | null,
  allowedIds: string | undefined,
) {
  return Boolean(
    userId &&
    allowedIds
      ?.split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .includes(userId),
  )
}
