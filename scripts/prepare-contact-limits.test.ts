import { expect, test } from 'bun:test'
import { createClient } from '@libsql/client'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { prepareContactLimitSchema } from './prepare-contact-limits'
test('production schema preparation is additive, repeatable, and leaves other tables untouched', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'contact-schema-'))
  const db = createClient({ url: `file:${join(directory, 'db.sqlite')}` })
  try {
    await db.execute('CREATE TABLE stories (title TEXT)')
    await db.execute("INSERT INTO stories VALUES ('Keep this story')")
    await prepareContactLimitSchema(db)
    await prepareContactLimitSchema(db)
    const objects = await db.execute(
      "SELECT name,type FROM sqlite_master WHERE name IN ('contact_rate_limits','contact_rate_limits_expiry') ORDER BY name",
    )
    expect(objects.rows.map((r) => [r.name, r.type])).toEqual([
      ['contact_rate_limits', 'table'],
      ['contact_rate_limits_expiry', 'index'],
    ])
    expect((await db.execute('SELECT title FROM stories')).rows[0].title).toBe(
      'Keep this story',
    )
    expect(
      (await db.execute('SELECT count(*) AS n FROM contact_rate_limits'))
        .rows[0].n,
    ).toBe(0)
  } finally {
    db.close()
    await rm(directory, { recursive: true, force: true })
  }
})
