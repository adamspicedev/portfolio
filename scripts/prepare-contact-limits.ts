import { createClient, type Client } from '@libsql/client'
import { CONTACT_LIMIT_SCHEMA } from '../src/lib/contact-limits.server'

/** Only additive contact objects and a zero-row write permission check. */
export async function prepareContactLimitSchema(db: Client) {
  await db.batch(CONTACT_LIMIT_SCHEMA, 'write')
  const objects = await db.execute(
    "SELECT name, type FROM sqlite_master WHERE name IN ('contact_rate_limits', 'contact_rate_limits_expiry')",
  )
  if (
    !objects.rows.some(
      (row) => row.name === 'contact_rate_limits' && row.type === 'table',
    ) ||
    !objects.rows.some(
      (row) =>
        row.name === 'contact_rate_limits_expiry' && row.type === 'index',
    )
  )
    throw new Error('Contact protection schema verification failed.')
  const transaction = await db.transaction('write')
  try {
    await transaction.execute(
      'UPDATE contact_rate_limits SET count = count WHERE 0',
    )
  } finally {
    await transaction.rollback()
    transaction.close()
  }
}

if (
  import.meta.main &&
  process.env.VERCEL === '1' &&
  process.env.VERCEL_ENV === 'production'
) {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  if (!url?.startsWith('libsql://') || !authToken)
    throw new Error('Production contact database configuration is required.')
  const db = createClient({ url, authToken })
  try {
    await prepareContactLimitSchema(db)
    console.log(
      'Contact protection table/index and write permissions verified.',
    )
  } catch {
    // Never forward provider error text, URLs or credentials into build logs.
    console.error('Contact protection schema setup failed. Deployment stopped.')
    process.exitCode = 1
  } finally {
    db.close()
  }
}
