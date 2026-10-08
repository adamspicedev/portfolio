import { expect, test } from 'bun:test'
import { Database } from 'bun:sqlite'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { storySeo, pageSeo, jsonLd, sitemapXml } from './seo'
import { localDatabaseUrl, StoryStore } from './sqlite-stories.server'

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
test('version one SQLite files migrate without losing stories and persist SEO overrides', async () => {
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
    const store = await StoryStore.connect(localDatabaseUrl(path))
    const old = await store.get(id)
    expect(old.body).toBe(story.body)
    expect(old.seoTitle).toBe('')
    const saved = await store.save(
      {
        ...old,
        seoTitle: 'Saved search title',
        seoDescription: 'Saved description',
      },
      'test',
    )
    await store.save({ ...story, slug: 'private-draft', draft: true }, 'test')
    await store.save(
      { ...story, slug: 'scheduled', date: '2099-01-01' },
      'test',
    )
    const archived = await store.save({ ...story, slug: 'archived' }, 'test')
    await store.archive(archived.id, archived.revision, true, 'test')
    const xml = sitemapXml(await store.published('2026-10-08'))
    expect(xml).toContain('/blog/test-story')
    expect(xml).not.toContain('private-draft')
    expect(xml).not.toContain('scheduled')
    expect(xml).not.toContain('/blog/archived')
    await store.close()
    const reopened = await StoryStore.connect(localDatabaseUrl(path))
    expect((await reopened.get(saved.id)).seoTitle).toBe('Saved search title')
    await reopened.close()
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
})

test('sharing includes descriptive cover alt and branded fallback for stories without covers', () => {
  const head = storySeo({
    ...story,
    coverAlt: 'A robot selecting useful review comments',
  })
  expect(
    head.meta.find((meta) => meta.property === 'og:image:alt')?.content,
  ).toBe('A robot selecting useful review comments')
  expect(
    head.meta.find((meta) => meta.name === 'twitter:image:alt')?.content,
  ).toBe('A robot selecting useful review comments')
  const fallback = storySeo({ ...story, cover: undefined })
  expect(
    fallback.meta.find((meta) => meta.property === 'og:image')?.content,
  ).toBe('https://spicey.dev/images/social-preview.jpg')
})

test('cover descriptions migrate additively, persist and remain readable by previous schemas', async () => {
  const folder = mkdtempSync(join(tmpdir(), 'portfolio-alt-'))
  const path = join(folder, 'stories.sqlite')
  try {
    const store = await StoryStore.connect(localDatabaseUrl(path), undefined, [
      story,
    ])
    const existing = (await store.all())[0]!
    expect(existing.coverAlt).toBe('')
    const saved = await store.save(
      { ...existing, coverAlt: 'Power cables connecting a data centre' },
      'test',
    )
    expect((await store.published('2026-10-09'))[0]?.coverAlt).toBe(
      saved.coverAlt,
    )
    await store.close()
    const oldClient = new Database(path)
    expect(
      oldClient
        .query('SELECT title,body,cover FROM stories WHERE id=?')
        .get(saved.id),
    ).toEqual({ title: story.title, body: story.body, cover: story.cover })
    oldClient
      .query('UPDATE stories SET seo_title=? WHERE id=?')
      .run('Older application edit', saved.id)
    oldClient.close()
    const reopened = await StoryStore.connect(localDatabaseUrl(path))
    expect((await reopened.get(saved.id)).coverAlt).toBe(saved.coverAlt)
    await reopened.close()
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
})

test('public page previews have absolute URLs and social descriptions', () => {
  const head = pageSeo({
    title: 'Stories · Adam Spice',
    description: 'Notes from the keyboard',
    path: '/blog',
  })
  expect(head.meta.find((meta) => meta.property === 'og:url')?.content).toBe(
    'https://spicey.dev/blog',
  )
  expect(
    head.meta.find((meta) => meta.property === 'og:image:alt')?.content,
  ).toContain('Adam Spice')
  expect(head.meta.find((meta) => meta.name === 'robots')?.content).toBe(
    'index, follow',
  )
})
