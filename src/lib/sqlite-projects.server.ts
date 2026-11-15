import type { Client, Transaction } from '@libsql/client'
import { z } from 'zod'
import {
  projectSchema,
  type CmsProject,
  type ProjectInput,
} from './project-schema'
import { projectsData } from './portfolio'

export class ProjectConflict extends Error {}
const rowSchema = z.object({
  id: z.string(),
  content: z.string(),
  revision: z.coerce.number(),
  archived: z.coerce.number(),
  updated_at: z.string(),
})
function decode(raw: unknown): CmsProject {
  const row = rowSchema.parse(raw)
  return {
    ...projectSchema.parse({
      ...JSON.parse(row.content),
      id: row.id,
      revision: row.revision,
    }),
    id: row.id,
    revision: row.revision,
    archived: Boolean(row.archived),
    updatedAt: row.updated_at,
  }
}

export class ProjectStore {
  constructor(private readonly db: Client) {}

  async initialize(tx: Transaction) {
    await tx.execute(`CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY, content TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1,
      archived INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, updated_by TEXT NOT NULL
    )`)
    const seeded = await tx.execute(
      "SELECT value FROM cms_meta WHERE key = 'projects_seeded'",
    )
    if (!seeded.rows.length) {
      const existing = await tx.execute('SELECT id FROM projects LIMIT 1')
      if (!existing.rows.length) {
        for (const [position, project] of projectsData.entries()) {
          await this.insert(
            tx,
            projectSchema.parse({
              ...project,
              position,
              draft: false,
              imageAlt: project.imageAlt,
            }),
            'seed',
          )
        }
      }
      await tx.execute(
        "INSERT INTO cms_meta (key, value) VALUES ('projects_seeded', '1')",
      )
    }
    // Upgrade existing portfolios once; keep the old entries available in the CMS archive.
    const showcase = await tx.execute(
      "SELECT value FROM cms_meta WHERE key = 'rowberry_showcase_v1'",
    )
    if (!showcase.rows.length) {
      const existing = await tx.execute('SELECT * FROM projects')
      const projects = existing.rows.map(decode)
      for (const project of projects) {
        const hostname = new URL(project.link).hostname
        if (
          ['movie-app.spicey.dev', 'storeit.spicey.dev'].includes(hostname) &&
          !project.archived
        ) {
          await tx.execute({
            sql: 'UPDATE projects SET archived=1,revision=revision+1,updated_at=?,updated_by=? WHERE id=?',
            args: [new Date().toISOString(), 'rowberry-showcase', project.id],
          })
        }
      }
      if (
        !projects.some(
          (project) => new URL(project.link).hostname === 'rowberry.spicey.dev',
        )
      ) {
        await this.insert(
          tx,
          projectSchema.parse({
            ...projectsData[0],
            position: 0,
            draft: false,
          }),
          'rowberry-showcase',
        )
      }
      await tx.execute(
        "INSERT INTO cms_meta (key,value) VALUES ('rowberry_showcase_v1','1')",
      )
    }
  }

  private async insert(tx: Transaction, input: ProjectInput, actor: string) {
    const id = crypto.randomUUID()
    await tx.execute({
      sql: 'INSERT INTO projects (id,content,updated_at,updated_by) VALUES (?,?,?,?)',
      args: [
        id,
        JSON.stringify(projectSchema.parse(input)),
        new Date().toISOString(),
        actor,
      ],
    })
    return this.get(tx, id)
  }

  private async get(tx: Transaction, id: string) {
    const result = await tx.execute({
      sql: 'SELECT * FROM projects WHERE id=?',
      args: [id],
    })
    return decode(result.rows[0])
  }

  async all() {
    const result = await this.db.execute('SELECT * FROM projects')
    return result.rows
      .map(decode)
      .sort(
        (a, b) =>
          a.position - b.position ||
          a.title.localeCompare(b.title) ||
          a.id.localeCompare(b.id),
      )
  }

  async published() {
    return (await this.all()).filter(
      (project) => !project.draft && !project.archived,
    )
  }

  async save(raw: ProjectInput, actor: string) {
    const input = projectSchema.parse(raw)
    const tx = await this.db.transaction('write')
    try {
      let project: CmsProject
      if (!input.id) project = await this.insert(tx, input, actor)
      else {
        const result = await tx.execute({
          sql: 'UPDATE projects SET content=?,revision=revision+1,updated_at=?,updated_by=? WHERE id=? AND revision=? AND archived=0',
          args: [
            JSON.stringify(input),
            new Date().toISOString(),
            actor,
            input.id,
            input.revision!,
          ],
        })
        if (!result.rowsAffected)
          throw new ProjectConflict(
            'This project changed in another tab or was archived. Reload it before saving.',
          )
        project = await this.get(tx, input.id)
      }
      await tx.commit()
      return project
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
        sql: 'UPDATE projects SET archived=?,revision=revision+1,updated_at=?,updated_by=? WHERE id=? AND revision=?',
        args: [Number(archived), new Date().toISOString(), actor, id, revision],
      })
      if (!result.rowsAffected)
        throw new ProjectConflict(
          'This project changed in another tab. Reload it before continuing.',
        )
      const project = await this.get(tx, id)
      await tx.commit()
      return project
    } catch (error) {
      await tx.rollback()
      throw error
    }
  }
}
