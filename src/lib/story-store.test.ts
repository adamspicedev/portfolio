import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
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
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'portfolio-cms-'))
  path = join(directory, 'stories.sqlite')
  store = new StoryStore(path, [seed])
})
afterEach(() => {
  store.close()
  rmSync(directory, { recursive: true, force: true })
})

describe('SQLite publishing', () => {
  it('seeds only once and preserves edits across a server restart', () => {
    const first = store.all()[0]!
    store.save({ ...first, title: 'An edited title' }, 'user_admin')
    store.close()
    store = new StoryStore(path, [
      seed,
      { ...seed, slug: 'new-file-after-seed' },
    ])
    expect(store.all()).toHaveLength(1)
    expect(store.all()[0]?.title).toBe('An edited title')
  })
  it('keeps drafts, scheduled stories and archived slugs private without losing their records', () => {
    const first = store.all()[0]!
    const draft = store.save(
      { ...input, slug: 'draft-story', draft: true },
      'user_admin',
    )
    store.save(
      { ...input, slug: 'future-story', date: '2026-10-09' },
      'user_admin',
    )
    expect(store.published('2026-10-08').map((story) => story.slug)).toEqual([
      first.slug,
    ])
    store.archive(first.id, first.revision, true, 'user_admin')
    expect(store.published('2026-10-08')).toEqual([])
    expect(store.bySlug(first.slug)?.archived).toBe(true)
    expect(store.bySlug(draft.slug)?.draft).toBe(true)
  })
  it('publishes a draft without a rebuild and restores archived stories', () => {
    const draft = store.save(
      { ...input, slug: 'draft-story', draft: true },
      'user_admin',
    )
    const published = store.save({ ...draft, draft: false }, 'user_admin')
    expect(
      store.published('2026-10-08').some((story) => story.slug === draft.slug),
    ).toBe(true)
    const archived = store.archive(
      published.id,
      published.revision,
      true,
      'user_admin',
    )
    expect(
      store.published('2026-10-08').some((story) => story.slug === draft.slug),
    ).toBe(false)
    store.archive(archived.id, archived.revision, false, 'user_admin')
    expect(
      store.published('2026-10-08').some((story) => story.slug === draft.slug),
    ).toBe(true)
  })
  it('rejects stale edits and archive requests instead of overwriting newer data', () => {
    const first = store.all()[0]!
    store.save({ ...first, title: 'Newer edit' }, 'user_admin')
    expect(() =>
      store.save({ ...first, title: 'Stale edit' }, 'user_admin'),
    ).toThrow(StoryConflict)
    expect(() =>
      store.archive(first.id, first.revision, true, 'user_admin'),
    ).toThrow(StoryConflict)
    expect(store.get(first.id).title).toBe('Newer edit')
  })
  it('reserves duplicate slugs even for archives and treats SQL-like body text as data', () => {
    const first = store.all()[0]!
    store.archive(first.id, first.revision, true, 'user_admin')
    expect(() => store.save(input, 'user_admin')).toThrow(DuplicateSlug)
    const body = "'); DROP TABLE stories; --"
    const story = store.save({ ...input, slug: 'sql-text', body }, 'user_admin')
    expect(store.get(story.id).body).toBe(body)
    expect(store.all()).toHaveLength(2)
  })
  it('backs up live WAL changes to a consistent standalone database', () => {
    store.save({ ...input, slug: 'backup-story' }, 'user_admin')
    const destination = join(directory, 'backup.sqlite')
    store.backup(destination)
    const backup = new StoryStore(destination)
    try {
      expect(backup.all()).toEqual(store.all())
    } finally {
      backup.close()
    }
    expect(() => store.backup(destination)).toThrow()
  })
})
