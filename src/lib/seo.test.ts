import { expect, test } from 'bun:test'
import { Database } from 'bun:sqlite'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { storySeo, jsonLd, sitemapXml } from './seo'
import { StoryStore } from './sqlite-stories.server'

const story = {
  slug: 'test-story',
  title: 'Story title',
  description: 'Story description',
  date: '2026-10-08',
  tags: [],
  body: 'Some words',
  draft: false,
  readingMinutes: 1,
  cover: '/images/stories/power.webp',
}
test('SEO falls back to visible content and resolves canonical and sharing images', () => {
  const head = storySeo(story)
  expect(head.links[0]?.href).toBe('https://spicey.dev/blog/test-story')
  expect(head.meta.find((meta) => meta.title)?.title).toBe(
    'Story title · Adam Spice',
  )
  expect(head.meta.find((meta) => meta.property === 'og:image')?.content).toBe(
    'https://spicey.dev/images/stories/power.webp',
  )
  const custom = storySeo({
    ...story,
    seoTitle: 'Search title',
    seoDescription: 'Search description',
  })
  expect(custom.meta.find((meta) => meta.title)?.title).toBe(
    'Search title · Adam Spice',
  )
  expect(custom.meta.find((meta) => meta.name === 'description')?.content).toBe(
    'Search description',
  )
  expect(JSON.parse(custom.scripts[0]?.children ?? '{}').headline).toBe(
    story.title,
  )
  expect(jsonLd({ title: '</script><script>alert(1)</script>' })).not.toContain(
    '<',
  )
})
test('version one SQLite files migrate without losing stories and persist SEO overrides', () => {
  const folder = mkdtempSync(join(tmpdir(), 'portfolio-seo-'))
  const path = join(folder, 'stories.sqlite')
  try {
    const db = new Database(path)
    db.exec(`CREATE TABLE cms_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      INSERT INTO cms_meta VALUES ('seeded','1');
      CREATE TABLE stories (id TEXT PRIMARY KEY, slug TEXT UNIQUE, title TEXT, description TEXT, date TEXT, tags TEXT, body TEXT, cover TEXT, draft INTEGER, archived INTEGER DEFAULT 0, revision INTEGER DEFAULT 1, updated_at TEXT, updated_by TEXT);
      PRAGMA user_version=1;`)
    const id = crypto.randomUUID()
    db.query('INSERT INTO stories VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').run(
      id,
      story.slug,
      story.title,
      story.description,
      story.date,
      '[]',
      story.body,
      story.cover,
      0,
      0,
      1,
      new Date().toISOString(),
      'test',
    )
    db.close()
    const store = new StoryStore(path)
    const old = store.get(id)
    expect(old.body).toBe(story.body)
    expect(old.seoTitle).toBe('')
    const saved = store.save(
      {
        ...old,
        seoTitle: 'Saved search title',
        seoDescription: 'Saved description',
      },
      'test',
    )
    store.save({ ...story, slug: 'private-draft', draft: true }, 'test')
    store.save({ ...story, slug: 'scheduled', date: '2099-01-01' }, 'test')
    const archived = store.save({ ...story, slug: 'archived' }, 'test')
    store.archive(archived.id, archived.revision, true, 'test')
    const xml = sitemapXml(store.published('2026-10-08'))
    expect(xml).toContain('/blog/test-story')
    expect(xml).not.toContain('private-draft')
    expect(xml).not.toContain('scheduled')
    expect(xml).not.toContain('/blog/archived')
    store.close()
    const reopened = new StoryStore(path)
    expect(reopened.get(saved.id).seoTitle).toBe('Saved search title')
    reopened.close()
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
})
