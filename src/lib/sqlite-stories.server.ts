import { Database } from 'bun:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { z } from 'zod'
import { editorSchema, type CmsStory, type EditorInput } from './cms-schema'
import { publishedStories, type Story } from './story-schema'

const rowSchema = z.object({
  id: z.string(),
  revision: z.number(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  date: z.string(),
  tags: z.string(),
  body: z.string(),
  cover: z.string(),
  draft: z.number(),
  archived: z.number(),
  updated_at: z.string(),
  seo_title: z.string(),
  seo_description: z.string(),
})
function decode(raw: unknown): CmsStory {
  const row = rowSchema.parse(raw)
  const story = editorSchema.parse({
    ...row,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    tags: JSON.parse(row.tags),
    draft: Boolean(row.draft),
  })
  return {
    ...story,
    id: row.id,
    revision: row.revision,
    archived: Boolean(row.archived),
    updatedAt: row.updated_at,
  }
}
export class StoryConflict extends Error {}
export class DuplicateSlug extends Error {}

export class StoryStore {
  private readonly db: Database
  constructor(path: string, seeds: Story[] = []) {
    if (path !== ':memory:')
      mkdirSync(dirname(resolve(path)), { recursive: true })
    this.db = new Database(path, { create: true, strict: true })
    this.db.exec(
      'PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON;',
    )
    const version = this.db.query('PRAGMA user_version').get()
    if (version && Number(Object.values(version)[0]) > 2) {
      this.db.close()
      throw new Error('The stories database needs a newer application version.')
    }
    this.db.transaction(() => {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS cms_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS stories (
          id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL,
          description TEXT NOT NULL, date TEXT NOT NULL, tags TEXT NOT NULL,
          body TEXT NOT NULL, cover TEXT NOT NULL DEFAULT '', draft INTEGER NOT NULL,
          archived INTEGER NOT NULL DEFAULT 0, revision INTEGER NOT NULL DEFAULT 1,
          updated_at TEXT NOT NULL, updated_by TEXT NOT NULL
        );

      `)
      const columns = this.db.query('PRAGMA table_info(stories)').all()
      const names = columns.map(
        (column) => z.object({ name: z.string() }).parse(column).name,
      )
      if (!names.includes('seo_title'))
        this.db.exec(
          "ALTER TABLE stories ADD COLUMN seo_title TEXT NOT NULL DEFAULT ''",
        )
      if (!names.includes('seo_description'))
        this.db.exec(
          "ALTER TABLE stories ADD COLUMN seo_description TEXT NOT NULL DEFAULT ''",
        )
      this.db.exec('PRAGMA user_version = 2')
      if (
        !this.db.query("SELECT value FROM cms_meta WHERE key = 'seeded'").get()
      ) {
        for (const seed of seeds)
          this.insert({ ...seed, cover: seed.cover ?? '' }, 'seed')
        this.db
          .query('INSERT INTO cms_meta (key, value) VALUES (?, ?)')
          .run('seeded', '1')
      }
    })()
  }
  private insert(input: EditorInput, actor: string) {
    const story = editorSchema.parse(input)
    const id = crypto.randomUUID()
    this.db
      .query(`INSERT INTO stories
      (id,slug,title,description,date,tags,body,cover,draft,updated_at,updated_by,seo_title,seo_description)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(
        id,
        story.slug,
        story.title,
        story.description,
        story.date,
        JSON.stringify(story.tags),
        story.body,
        story.cover,
        Number(story.draft),
        new Date().toISOString(),
        actor,
        story.seoTitle,
        story.seoDescription,
      )
    return this.get(id)
  }
  all() {
    return this.db
      .query('SELECT * FROM stories ORDER BY date DESC, slug')
      .all()
      .map(decode)
  }
  get(id: string) {
    const row = this.db.query('SELECT * FROM stories WHERE id = ?').get(id)
    if (!row) throw new StoryConflict('This story no longer exists.')
    return decode(row)
  }
  bySlug(slug: string) {
    const row = this.db.query('SELECT * FROM stories WHERE slug = ?').get(slug)
    return row ? decode(row) : undefined
  }
  published(today?: string): Story[] {
    return publishedStories(
      this.all()
        .filter((story) => !story.archived)
        .map((story) => ({
          slug: story.slug,
          title: story.title,
          description: story.description,
          seoTitle: story.seoTitle,
          seoDescription: story.seoDescription,
          updatedAt: story.updatedAt,
          date: story.date,
          tags: story.tags,
          body: story.body,
          draft: story.draft,
          cover: story.cover || undefined,
          readingMinutes: Math.max(
            1,
            Math.ceil(story.body.split(/\s+/).length / 220),
          ),
        })),
      today,
    )
  }
  save(raw: EditorInput, actor: string) {
    const input = editorSchema.parse(raw)
    return this.db.transaction(() => {
      const duplicate = this.bySlug(input.slug)
      if (duplicate && duplicate.id !== input.id)
        throw new DuplicateSlug(
          'A story already uses this slug, including archived stories.',
        )
      if (!input.id) return this.insert(input, actor)
      const result = this.db
        .query(`UPDATE stories SET slug=?, title=?, description=?, date=?, tags=?,
        body=?, cover=?, draft=?, seo_title=?, seo_description=?, revision=revision+1, updated_at=?, updated_by=?
        WHERE id=? AND revision=? AND archived=0`)
        .run(
          input.slug,
          input.title,
          input.description,
          input.date,
          JSON.stringify(input.tags),
          input.body,
          input.cover,
          Number(input.draft),
          input.seoTitle,
          input.seoDescription,
          new Date().toISOString(),
          actor,
          input.id,
          input.revision ?? 0,
        )
      if (!result.changes)
        throw new StoryConflict(
          'This story changed in another tab or was archived. Reload it before saving.',
        )
      return this.get(input.id)
    })()
  }
  archive(id: string, revision: number, archived: boolean, actor: string) {
    const result = this.db
      .query(`UPDATE stories SET archived=?, revision=revision+1, updated_at=?, updated_by=?
      WHERE id=? AND revision=?`)
      .run(Number(archived), new Date().toISOString(), actor, id, revision)
    if (!result.changes)
      throw new StoryConflict(
        'This story changed in another tab. Reload it before continuing.',
      )
    return this.get(id)
  }
  backup(destination: string) {
    // VACUUM INTO creates a consistent standalone snapshot, including WAL changes.
    this.db.query('VACUUM INTO ?').run(destination)
  }
  close() {
    this.db.close()
  }
}
