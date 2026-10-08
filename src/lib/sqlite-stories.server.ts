import { createClient, type Client, type Transaction } from '@libsql/client'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { z } from 'zod'
import { editorSchema, type CmsStory, type EditorInput } from './cms-schema'
import { publishedStories, type Story } from './story-schema'

const rowSchema = z.object({
  id: z.string(),
  revision: z.coerce.number(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  date: z.string(),
  tags: z.string(),
  body: z.string(),
  cover: z.string(),
  draft: z.coerce.number(),
  archived: z.coerce.number(),
  updated_at: z.string(),
  cover_alt: z.string(),
  seo_title: z.string(),
  seo_description: z.string(),
})
function decode(raw: unknown): CmsStory {
  const row = rowSchema.parse(raw)
  const story = editorSchema.parse({
    ...row,
    coverAlt: row.cover_alt,
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
  private constructor(private readonly db: Client) {}

  static async connect(url: string, authToken?: string, seeds: Story[] = []) {
    const db = createClient({
      url,
      ...(authToken ? { authToken } : {}),
    })
    const store = new StoryStore(db)
    try {
      await store.initialize(seeds)
      return store
    } catch (error) {
      await db.close()
      throw error
    }
  }

  private async initialize(seeds: Story[]) {
    const tx = await this.db.transaction('write')
    try {
      await tx.execute(`
        CREATE TABLE IF NOT EXISTS cms_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      `)
      await tx.execute(`
        CREATE TABLE IF NOT EXISTS stories (
          id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL,
          description TEXT NOT NULL, date TEXT NOT NULL, tags TEXT NOT NULL,
          body TEXT NOT NULL, cover TEXT NOT NULL DEFAULT '', draft INTEGER NOT NULL,
          archived INTEGER NOT NULL DEFAULT 0, revision INTEGER NOT NULL DEFAULT 1,
          updated_at TEXT NOT NULL, updated_by TEXT NOT NULL
        );
      `)
      const columns = await tx.execute('PRAGMA table_info(stories)')
      const names = columns.rows.map(
        (column) => z.object({ name: z.string() }).parse(column).name,
      )
      if (!names.includes('cover_alt'))
        await tx.execute(
          "ALTER TABLE stories ADD COLUMN cover_alt TEXT NOT NULL DEFAULT ''",
        )
      if (!names.includes('seo_title'))
        await tx.execute(
          "ALTER TABLE stories ADD COLUMN seo_title TEXT NOT NULL DEFAULT ''",
        )
      if (!names.includes('seo_description'))
        await tx.execute(
          "ALTER TABLE stories ADD COLUMN seo_description TEXT NOT NULL DEFAULT ''",
        )

      const seeded = await tx.execute(
        "SELECT value FROM cms_meta WHERE key = 'seeded'",
      )
      if (!seeded.rows.length) {
        const count = await tx.execute('SELECT COUNT(*) AS count FROM stories')
        const existingStories = z
          .object({ count: z.coerce.number() })
          .parse(count.rows[0]).count
        if (existingStories === 0) {
          for (const seed of seeds)
            await this.insert(tx, { ...seed, cover: seed.cover ?? '' }, 'seed')
        }
        await tx.execute({
          sql: 'INSERT INTO cms_meta (key, value) VALUES (?, ?)',
          args: ['seeded', '1'],
        })
      }
      await tx.commit()
    } catch (error) {
      await tx.rollback()
      throw error
    }
  }

  private async insert(tx: Transaction, input: EditorInput, actor: string) {
    const story = editorSchema.parse(input)
    const id = crypto.randomUUID()
    await tx.execute({
      sql: `INSERT INTO stories
        (id,slug,title,description,date,tags,body,cover,draft,updated_at,updated_by,seo_title,seo_description,cover_alt)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
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
        story.coverAlt,
      ],
    })
    const result = await tx.execute({
      sql: 'SELECT * FROM stories WHERE id = ?',
      args: [id],
    })
    return decode(result.rows[0])
  }

  async all() {
    const result = await this.db.execute(
      'SELECT * FROM stories ORDER BY date DESC, slug',
    )
    return result.rows.map(decode)
  }

  async get(id: string) {
    const result = await this.db.execute({
      sql: 'SELECT * FROM stories WHERE id = ?',
      args: [id],
    })
    if (!result.rows[0]) throw new StoryConflict('This story no longer exists.')
    return decode(result.rows[0])
  }

  async bySlug(slug: string) {
    const result = await this.db.execute({
      sql: 'SELECT * FROM stories WHERE slug = ?',
      args: [slug],
    })
    return result.rows[0] ? decode(result.rows[0]) : undefined
  }

  async published(today?: string, stories?: CmsStory[]): Promise<Story[]> {
    return publishedStories(
      (stories ?? (await this.all()))
        .filter((story) => !story.archived)
        .map((story) => ({
          slug: story.slug,
          title: story.title,
          description: story.description,
          coverAlt: story.coverAlt,
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

  async save(raw: EditorInput, actor: string) {
    const input = editorSchema.parse(raw)
    const tx = await this.db.transaction('write')
    try {
      const duplicateResult = await tx.execute({
        sql: 'SELECT * FROM stories WHERE slug = ?',
        args: [input.slug],
      })
      const duplicate = duplicateResult.rows[0]
        ? decode(duplicateResult.rows[0])
        : undefined
      if (duplicate && duplicate.id !== input.id)
        throw new DuplicateSlug(
          'A story already uses this slug, including archived stories.',
        )

      if (!input.id) {
        const story = await this.insert(tx, input, actor)
        await tx.commit()
        return story
      }

      const result = await tx.execute({
        sql: `UPDATE stories SET slug=?, title=?, description=?, date=?, tags=?,
          body=?, cover=?, draft=?, seo_title=?, seo_description=?, cover_alt=?, revision=revision+1, updated_at=?, updated_by=?
          WHERE id=? AND revision=? AND archived=0`,
        args: [
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
          input.coverAlt,
          new Date().toISOString(),
          actor,
          input.id,
          input.revision ?? 0,
        ],
      })
      if (!result.rowsAffected)
        throw new StoryConflict(
          'This story changed in another tab or was archived. Reload it before saving.',
        )
      const saved = await tx.execute({
        sql: 'SELECT * FROM stories WHERE id = ?',
        args: [input.id],
      })
      const story = decode(saved.rows[0])
      await tx.commit()
      return story
    } catch (error) {
      await tx.rollback()
      throw error
    }
  }

  async archive(
    id: string,
    revision: number,
    archived: boolean,
    actor: string,
  ) {
    const tx = await this.db.transaction('write')
    try {
      const result = await tx.execute({
        sql: `UPDATE stories SET archived=?, revision=revision+1, updated_at=?, updated_by=?
          WHERE id=? AND revision=?`,
        args: [Number(archived), new Date().toISOString(), actor, id, revision],
      })
      if (!result.rowsAffected)
        throw new StoryConflict(
          'This story changed in another tab. Reload it before continuing.',
        )
      const updated = await tx.execute({
        sql: 'SELECT * FROM stories WHERE id = ?',
        args: [id],
      })
      const story = decode(updated.rows[0])
      await tx.commit()
      return story
    } catch (error) {
      await tx.rollback()
      throw error
    }
  }

  close() {
    return this.db.close()
  }
}

export function localDatabaseUrl(path: string) {
  if (path === ':memory:') return 'file::memory:'
  const absolutePath = resolve(path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  return pathToFileURL(absolutePath).href
}
