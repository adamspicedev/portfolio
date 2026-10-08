import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { Database } from 'bun:sqlite'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  localDatabaseUrl,
  StoryStore,
  StoryConflict,
  DuplicateSlug,
} from './sqlite-stories.server'
import type { EditorInput } from './cms-schema'
import type { Story } from './story-schema'

const input: EditorInput = {
  title: 'A real database story',
  slug: 'a-real-database-story',
  description: 'Tests with SQLite, not mocks.',
  date: '2026-10-08',
  tags: ['Engineering'],
  cover: '',
  body: 'A story body with enough words.',
  draft: false,
}
const seed: Story = { ...input, cover: undefined, readingMinutes: 1 }
let directory: string
let path: string
let store: StoryStore

beforeEach(async () => {
  directory = mkdtempSync(join(tmpdir(), 'portfolio-cms-'))
  path = join(directory, 'stories.sqlite')
  store = await StoryStore.connect(localDatabaseUrl(path), undefined, [seed])
})

afterEach(async () => {
  await store.close()
  rmSync(directory, { recursive: true, force: true })
})

describe('SQLite publishing', () => {
  it('seeds only once and preserves edits across a server restart', async () => {
    const first = (await store.all())[0]!
    await store.save({ ...first, title: 'An edited title' }, 'user_admin')
    await store.close()
    store = await StoryStore.connect(localDatabaseUrl(path), undefined, [
      seed,
      { ...seed, slug: 'new-file-after-seed' },
    ])
    expect(await store.all()).toHaveLength(1)
    expect((await store.all())[0]?.title).toBe('An edited title')
  })

  it('preserves imported stories when the imported database has no seed marker', async () => {
    const importedPath = join(directory, 'imported.sqlite')
    const imported = new Database(importedPath)
    const importedId = crypto.randomUUID()
    imported.exec(`
      CREATE TABLE stories (
        id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL,
        description TEXT NOT NULL, date TEXT NOT NULL, tags TEXT NOT NULL,
        body TEXT NOT NULL, cover TEXT NOT NULL DEFAULT '', draft INTEGER NOT NULL,
        archived INTEGER NOT NULL DEFAULT 0, revision INTEGER NOT NULL DEFAULT 1,
        updated_at TEXT NOT NULL, updated_by TEXT NOT NULL
      );
    `)
    imported
      .query(
        `INSERT INTO stories
        (id,slug,title,description,date,tags,body,cover,draft,updated_at,updated_by)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .run(
        importedId,
        'imported-story',
        'Imported story',
        'From Turso import',
        '2026-10-08',
        '[]',
        'Imported body',
        '',
        0,
        new Date().toISOString(),
        'import',
      )
    imported.close()

    const importedStore = await StoryStore.connect(
      localDatabaseUrl(importedPath),
      undefined,
      [seed],
    )
    try {
      expect(await importedStore.all()).toHaveLength(1)
      expect((await importedStore.get(importedId)).title).toBe('Imported story')
    } finally {
      await importedStore.close()
    }
  })

  it('keeps drafts, scheduled stories and archived slugs private without losing their records', async () => {
    const first = (await store.all())[0]!
    const draft = await store.save(
      { ...input, slug: 'draft-story', draft: true },
      'user_admin',
    )
    await store.save(
      { ...input, slug: 'future-story', date: '2026-10-09' },
      'user_admin',
    )
    expect(
      (await store.published('2026-10-08')).map((story) => story.slug),
    ).toEqual([first.slug])
    await store.archive(first.id, first.revision, true, 'user_admin')
    expect(await store.published('2026-10-08')).toEqual([])
    expect((await store.bySlug(first.slug))?.archived).toBe(true)
    expect((await store.bySlug(draft.slug))?.draft).toBe(true)
  })

  it('publishes a draft without a rebuild and restores archived stories', async () => {
    const draft = await store.save(
      { ...input, slug: 'draft-story', draft: true },
      'user_admin',
    )
    const published = await store.save({ ...draft, draft: false }, 'user_admin')
    expect(
      (await store.published('2026-10-08')).some(
        (story) => story.slug === draft.slug,
      ),
    ).toBe(true)
    const archived = await store.archive(
      published.id,
      published.revision,
      true,
      'user_admin',
    )
    expect(
      (await store.published('2026-10-08')).some(
        (story) => story.slug === draft.slug,
      ),
    ).toBe(false)
    await store.archive(archived.id, archived.revision, false, 'user_admin')
    expect(
      (await store.published('2026-10-08')).some(
        (story) => story.slug === draft.slug,
      ),
    ).toBe(true)
  })

  it('rejects stale edits and archive requests instead of overwriting newer data', async () => {
    const first = (await store.all())[0]!
    await store.save({ ...first, title: 'Newer edit' }, 'user_admin')
    await expect(
      store.save({ ...first, title: 'Stale edit' }, 'user_admin'),
    ).rejects.toThrow(StoryConflict)
    await expect(
      store.archive(first.id, first.revision, true, 'user_admin'),
    ).rejects.toThrow(StoryConflict)
    expect((await store.get(first.id)).title).toBe('Newer edit')
  })

  it('reserves duplicate slugs even for archives and treats SQL-like body text as data', async () => {
    const first = (await store.all())[0]!
    await store.archive(first.id, first.revision, true, 'user_admin')
    await expect(store.save(input, 'user_admin')).rejects.toThrow(DuplicateSlug)
    const body = "'); DROP TABLE stories; --"
    const story = await store.save(
      { ...input, slug: 'sql-text', body },
      'user_admin',
    )
    expect((await store.get(story.id)).body).toBe(body)
    expect(await store.all()).toHaveLength(2)
  })
})
