import { createClient, type Client, type Transaction } from '@libsql/client'
import { createHmac } from 'node:crypto'

type Submission = { email: string; ip: string; hashSecret: string }
type Reservation = {
  allowed: boolean
  retryAfterSeconds: number
  unavailable?: true
}
const unavailable = (): Reservation => ({
  allowed: false,
  retryAfterSeconds: 600,
  unavailable: true,
})

/** Fixed UTC windows: boundaries can admit twice a window's budget in quick
 * succession. All four reservations commit together; a send failure still counts.
 * Only HMAC keys, counts and expiry timestamps are persisted. Expired identifiers
 * are deleted on the next successful reservation (no independent cleanup job).
 */
export class ContactLimitStore {
  private pending: Promise<unknown> = Promise.resolve()
  private constructor(
    private db: Client,
    private readonly url: string,
  ) {}

  static async connect(url: string, authToken?: string) {
    const db = createClient({
      url,
      concurrency: 1,
      ...(url.startsWith('file:') ? { timeout: 0 } : {}),
      ...(authToken ? { authToken } : {}),
    })
    try {
      await db.batch(
        [
          `CREATE TABLE IF NOT EXISTS contact_rate_limits (
          bucket_key TEXT PRIMARY KEY,
          count INTEGER NOT NULL CHECK (count >= 0),
          expires_at INTEGER NOT NULL
        )`,
          'CREATE INDEX IF NOT EXISTS contact_rate_limits_expiry ON contact_rate_limits(expires_at)',
        ],
        'write',
      )
      return new ContactLimitStore(db, url)
    } catch (error) {
      db.close()
      throw error
    }
  }

  reserveContactSubmission(
    input: Submission,
    nowMs = Date.now(),
  ): Promise<Reservation> {
    const result = this.pending.then(() => this.reserve(input, nowMs))
    this.pending = result.catch(() => undefined)
    return result
  }

  private async reserve(
    input: Submission,
    nowMs: number,
  ): Promise<Reservation> {
    if (
      !input.hashSecret ||
      !input.email.trim() ||
      !input.ip ||
      !Number.isSafeInteger(nowMs) ||
      nowMs < 0
    )
      return unavailable()
    const specifications = [
      ['email', input.email.trim().toLowerCase(), 600_000, 3],
      ['ip', input.ip, 600_000, 5],
      ['global-hour', '', 3_600_000, 20],
      ['global-day', '', 86_400_000, 50],
    ] as const
    const buckets = specifications.map(([kind, identity, duration, limit]) => {
      const window = Math.floor(nowMs / duration)
      return {
        key: createHmac('sha256', input.hashSecret)
          .update(
            JSON.stringify([
              'portfolio-contact-rate-limit-v1',
              kind,
              identity,
              window,
            ]),
          )
          .digest('hex'),
        expires: (window + 1) * duration,
        limit,
      }
    })
    let tx: Transaction | undefined
    try {
      // BEGIN IMMEDIATE / remote write transaction serializes competing clients.
      for (let attempt = 0; ; attempt++) {
        try {
          tx = await this.db.transaction('write')
          break
        } catch (error) {
          if (
            attempt >= 8 ||
            !(error instanceof Error) ||
            !('code' in error) ||
            error.code !== 'SQLITE_BUSY'
          )
            throw error
          // Local libSQL can retain a failed BEGIN statement's lock until
          // connection teardown. Remote Turso transactions need no reconnect.
          if (this.url.startsWith('file:')) {
            this.db.close()
            this.db = createClient({ url: this.url, timeout: 0 })
          }
          await new Promise((resolve) =>
            setTimeout(resolve, 10 * (attempt + 1)),
          )
        }
      }
      await tx.execute({
        sql: 'DELETE FROM contact_rate_limits WHERE expires_at <= ?',
        args: [nowMs],
      })
      let retryAfterSeconds = 0
      for (const bucket of buckets) {
        const result = await tx.execute({
          sql: `INSERT INTO contact_rate_limits (bucket_key,count,expires_at) VALUES (?,1,?)
            ON CONFLICT(bucket_key) DO UPDATE SET count = count + 1
            WHERE count < ?`,
          args: [bucket.key, bucket.expires, bucket.limit],
        })
        if (!result.rowsAffected)
          retryAfterSeconds = Math.max(
            retryAfterSeconds,
            Math.ceil((bucket.expires - nowMs) / 1000),
          )
      }
      if (retryAfterSeconds) {
        await tx.rollback()
        return { allowed: false, retryAfterSeconds }
      }
      await tx.commit()
      return { allowed: true, retryAfterSeconds: 0 }
    } catch {
      try {
        await tx?.rollback()
      } catch {
        /* Never expose database credentials or input. */
      }
      return unavailable()
    } finally {
      tx?.close()
    }
  }

  close() {
    this.db.close()
  }
}

let productionStore: Promise<ContactLimitStore> | undefined
/** Production never falls back to process memory or a local SQLite file. */
export async function reserveContactSubmission(
  input: Submission,
): Promise<Reservation> {
  const url = process.env.TURSO_DATABASE_URL
  const token = process.env.TURSO_AUTH_TOKEN
  if (!url || !token || !/^libsql:\/\//i.test(url) || !input.hashSecret)
    return unavailable()
  try {
    productionStore ??= ContactLimitStore.connect(url, token).catch(
      (error: unknown) => {
        productionStore = undefined
        throw error
      },
    )
    return await (await productionStore).reserveContactSubmission(input)
  } catch {
    return unavailable()
  }
}
