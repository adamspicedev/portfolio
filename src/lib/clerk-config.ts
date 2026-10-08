export function validClerkConfiguration(
  publishableKey: string | undefined,
  secretKey: string | undefined,
) {
  return Boolean(
    publishableKey &&
    publishableKey.trim() === publishableKey &&
    /^pk_(?:test|live)_[\x21-\x7e]+$/.test(publishableKey) &&
    secretKey &&
    secretKey.trim() === secretKey &&
    /^sk_(?:test|live)_[\x21-\x7e]+$/.test(secretKey) &&
    publishableKey.split('_')[1] === secretKey.split('_')[1],
  )
}
