import { afterAll, beforeAll, expect, mock, spyOn, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { StoryStore } from './sqlite-stories.server'
// Vite expands import.meta.glob; Bun's test runner does not.
mock.module('./seed-stories.server', () => ({ seedStories: [] }))
const { findStory } = await import('./stories.server')
const { storyStore } = await import('./story-store.server')

const directory = mkdtempSync(join(tmpdir(), 'portfolio-story-read-'))
const keys = [
  'DATABASE_PATH',
  'TURSO_DATABASE_URL',
  'TURSO_AUTH_TOKEN',
  'VERCEL',
  'VERCEL_ENV',
  'WRITE_IT_UP_URL',
]
const original = new Map(keys.map((key) => [key, process.env[key]]))
let store: StoryStore
beforeAll(async () => {
  for (const key of keys) delete process.env[key]
  process.env.DATABASE_PATH = join(directory, 'db.sqlite')
  store = await storyStore()
})
afterAll(() => {
  store.close()
  for (const [key, value] of original) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  rmSync(directory, { recursive: true, force: true })
})

test('article reads use the selected record without loading the full story collection', async () => {
  const saved = await store.save(
    {
      title: 'Direct article',
      slug: 'direct-article',
      description: 'A published article.',
      date: '2020-01-01',
      tags: [],
      body: 'Visible body.',
      cover: '',
      draft: false,
    },
    'test',
  )
  const all = spyOn(store, 'all')
  try {
    expect(await findStory(saved.slug)).toMatchObject({
      slug: saved.slug,
      body: saved.body,
      readingMinutes: 1,
    })
    expect(all).not.toHaveBeenCalled()
    expect(await findStory('missing-article')).toBeUndefined()
  } finally {
    all.mockRestore()
  }
})

test('direct reads keep drafts, scheduled stories and archived local slugs private', async () => {
  for (const [slug, draft, date, archived] of [
    ['hidden-draft', true, '2020-01-01', false],
    ['future-article', false, '2099-01-01', false],
    ['archived-article', false, '2020-01-01', true],
  ] as const) {
    const saved = await store.save(
      {
        title: slug,
        slug,
        description: 'Private article.',
        date,
        tags: [],
        body: 'Private body.',
        cover: '',
        draft,
      },
      'test',
    )
    if (archived) await store.archive(saved.id, saved.revision, true, 'test')
    expect(await findStory(slug)).toBeUndefined()
  }
})
