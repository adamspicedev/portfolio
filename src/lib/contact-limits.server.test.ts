import { afterEach, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createClient } from '@libsql/client'
import {
  ContactLimitStore,
  reserveContactSubmission,
} from './contact-limits.server'
const dirs: string[] = []
const stores: ContactLimitStore[] = []
afterEach(() => {
  for (const s of stores.splice(0)) s.close()
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true })
})
async function setup() {
  const dir = mkdtempSync(join(tmpdir(), 'contact-limit-'))
  dirs.push(dir)
  const url = `file:${join(dir, 'limits.db')}`
  const a = await ContactLimitStore.connect(url)
  const b = await ContactLimitStore.connect(url)
  stores.push(a, b)
  return { a, b, url }
}
const input = {
  email: 'visitor@example.com',
  ip: '203.0.113.1',
  hashSecret: 'private-test-secret',
}
const now = 1_800_000_000_000
test('two independent connections atomically admit only three per email', async () => {
  const { a, b } = await setup()
  const results = await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      (i % 2 ? a : b).reserveContactSubmission(
        { ...input, ip: `203.0.113.${i + 1}` },
        now,
      ),
    ),
  )
  expect(results.filter((r) => r.allowed)).toHaveLength(3)
  expect(
    results.filter((r) => !r.allowed).every((r) => r.retryAfterSeconds > 0),
  ).toBe(true)
})
test('IP rejection rolls back every bucket and normalizes email', async () => {
  const { a, url } = await setup()
  for (let i = 0; i < 5; i++)
    expect(
      (
        await a.reserveContactSubmission(
          { ...input, email: `a${i}@example.com` },
          now,
        )
      ).allowed,
    ).toBe(true)
  expect(
    (
      await a.reserveContactSubmission(
        { ...input, email: 'UNUSED@example.com' },
        now,
      )
    ).allowed,
  ).toBe(false)
  for (let i = 0; i < 3; i++)
    expect(
      (
        await a.reserveContactSubmission(
          { ...input, email: 'unused@example.com', ip: `203.0.114.${i}` },
          now,
        )
      ).allowed,
    ).toBe(true)
  expect(
    (
      await a.reserveContactSubmission(
        { ...input, email: ' UNUSED@example.com ', ip: '203.0.115.1' },
        now,
      )
    ).allowed,
  ).toBe(false)
  const db = createClient({ url })
  const rows = await db.execute('SELECT * FROM contact_rate_limits')
  db.close()
  const serialized = JSON.stringify(rows.rows)
  expect(serialized).not.toContain('example.com')
  expect(serialized).not.toContain('203.0.')
  expect(serialized).not.toContain(input.hashSecret)
  expect(
    rows.rows.every((r) => String(r.bucket_key).match(/^[a-f0-9]{64}$/)),
  ).toBe(true)
})
test('hour/day global budgets hold across identities, expire and clean up', async () => {
  const { a, url } = await setup()
  const submit = (i: number, time: number) =>
    a.reserveContactSubmission(
      { ...input, email: `${i}@example.com`, ip: `198.51.100.${i % 250}` },
      time,
    )
  for (let i = 0; i < 20; i++) expect((await submit(i, now)).allowed).toBe(true)
  expect((await submit(21, now)).allowed).toBe(false)
  for (let i = 20; i < 40; i++)
    expect((await submit(i, now + 3600000)).allowed).toBe(true)
  for (let i = 40; i < 50; i++)
    expect((await submit(i, now + 7200000)).allowed).toBe(true)
  expect((await submit(51, now + 7200000)).allowed).toBe(false)
  expect((await submit(52, now + 86400000)).allowed).toBe(true)
  const db = createClient({ url })
  const rows = await db.execute('SELECT expires_at FROM contact_rate_limits')
  db.close()
  expect(rows.rows.every((r) => Number(r.expires_at) > now + 86400000)).toBe(
    true,
  )
})
test('expired email quota resets and failures fail closed', async () => {
  const { a } = await setup()
  for (let i = 0; i < 3; i++) await a.reserveContactSubmission(input, now)
  expect((await a.reserveContactSubmission(input, now)).allowed).toBe(false)
  expect((await a.reserveContactSubmission(input, now + 600000)).allowed).toBe(
    true,
  )
  expect(
    (await a.reserveContactSubmission({ ...input, hashSecret: '' }, now))
      .allowed,
  ).toBe(false)
  a.close()
  expect((await a.reserveContactSubmission(input, now)).allowed).toBe(false)
})
test('production wrapper fails closed without Turso configuration', async () => {
  const previous = process.env.TURSO_DATABASE_URL
  delete process.env.TURSO_DATABASE_URL
  try {
    expect((await reserveContactSubmission(input)).allowed).toBe(false)
  } finally {
    if (previous !== undefined) process.env.TURSO_DATABASE_URL = previous
  }
})
test('a SQL failure rolls back all previously written buckets', async () => {
  const { a, url } = await setup()
  const db = createClient({ url })
  await db.execute(`CREATE TRIGGER fail_contact_insert BEFORE INSERT ON contact_rate_limits
 WHEN (SELECT COUNT(*) FROM contact_rate_limits) >= 2
 BEGIN SELECT RAISE(ABORT, 'test failure'); END`)
  expect((await a.reserveContactSubmission(input, now)).allowed).toBe(false)
  const result = await db.execute(
    'SELECT COUNT(*) AS count FROM contact_rate_limits',
  )
  expect(Number(result.rows[0]?.count)).toBe(0)
  db.close()
})
test('independent connections cannot race past IP or global budgets', async () => {
  const { a, b } = await setup()
  const ipResults = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      (i % 2 ? a : b).reserveContactSubmission(
        { ...input, email: `race-ip-${i}@example.com` },
        now,
      ),
    ),
  )
  expect(ipResults.filter((result) => result.allowed)).toHaveLength(5)
  const globalResults = await Promise.all(
    Array.from({ length: 30 }, (_, i) =>
      (i % 2 ? a : b).reserveContactSubmission(
        { ...input, email: `race-global-${i}@example.com`, ip: `192.0.2.${i}` },
        now,
      ),
    ),
  )
  expect(globalResults.filter((result) => result.allowed)).toHaveLength(15)
})
