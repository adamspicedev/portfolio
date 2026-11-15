import { afterEach, beforeEach, expect, it } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { StoryStore, localDatabaseUrl } from './sqlite-stories.server'
import { ProjectConflict } from './sqlite-projects.server'
import { projectSchema, type ProjectInput } from './project-schema'

let directory: string
let url: string
let store: StoryStore
const input: ProjectInput = {
  title: 'Test project',
  description: 'A useful tool.',
  category: 'Developer tools',
  link: 'https://example.com',
  image: '/images/example.png',
  imageAlt: 'An editor',
  tags: ['TypeScript'],
  color: 'pink',
  position: 3,
  draft: true,
}
beforeEach(async () => {
  directory = mkdtempSync(join(tmpdir(), 'portfolio-projects-'))
  url = localDatabaseUrl(join(directory, 'portfolio.sqlite'))
  store = await StoryStore.connect(url)
})
afterEach(async () => {
  await store.close()
  rmSync(directory, { recursive: true, force: true })
})

it('imports existing projects once and preserves edits and archives across restart', async () => {
  const seeds = await store.projects.published()
  expect(seeds.map((project) => project.title)).toEqual(['Rowberry'])
  const second = await store.projects.save({ ...input, draft: false }, 'admin')
  const changed = await store.projects.save(
    { ...seeds[0], title: 'Updated title' },
    'admin',
  )
  await store.projects.archive(second.id, second.revision, true, 'admin')
  await store.close()
  store = await StoryStore.connect(url)
  expect(await store.projects.all()).toHaveLength(2)
  expect(
    (await store.projects.published()).map((project) => project.title),
  ).toEqual(['Updated title'])
  expect(
    (await store.projects.all()).find((project) => project.id === changed.id)
      ?.revision,
  ).toBe(2)
})
it('persists drafts, publishes in display order, archives and restores without changing draft status', async () => {
  const draft = await store.projects.save(input, 'admin')
  expect(
    (await store.projects.published()).some(
      (project) => project.id === draft.id,
    ),
  ).toBe(false)
  const published = await store.projects.save(
    { ...draft, draft: false, position: 0, title: 'A first project' },
    'admin',
  )
  expect((await store.projects.published())[0].id).toBe(published.id)
  const archived = await store.projects.archive(
    published.id,
    published.revision,
    true,
    'admin',
  )
  expect(
    (await store.projects.published()).some(
      (project) => project.id === published.id,
    ),
  ).toBe(false)
  const restored = await store.projects.archive(
    archived.id,
    archived.revision,
    false,
    'admin',
  )
  expect(restored.draft).toBe(false)
  const hidden = await store.projects.save(
    { ...restored, draft: true },
    'admin',
  )
  const hiddenArchive = await store.projects.archive(
    hidden.id,
    hidden.revision,
    true,
    'admin',
  )
  await store.projects.archive(
    hiddenArchive.id,
    hiddenArchive.revision,
    false,
    'admin',
  )
  await store.close()
  store = await StoryStore.connect(url)
  expect(
    (await store.projects.all()).find((project) => project.id === hidden.id),
  ).toMatchObject({
    imageAlt: input.imageAlt,
    tags: input.tags,
    draft: true,
    archived: false,
  })
  expect(
    (await store.projects.published()).some(
      (project) => project.id === hidden.id,
    ),
  ).toBe(false)
})
it('rejects stale saves and archive actions, including saves to archived projects', async () => {
  const original = await store.projects.save(input, 'admin')
  const updated = await store.projects.save(
    { ...original, title: 'New title' },
    'admin',
  )
  await expect(
    store.projects.save({ ...original, title: 'Stale title' }, 'admin'),
  ).rejects.toBeInstanceOf(ProjectConflict)
  await expect(
    store.projects.archive(original.id, original.revision, true, 'admin'),
  ).rejects.toBeInstanceOf(ProjectConflict)
  const archived = await store.projects.archive(
    updated.id,
    updated.revision,
    true,
    'admin',
  )
  await expect(store.projects.save(archived, 'admin')).rejects.toBeInstanceOf(
    ProjectConflict,
  )
  expect(
    (await store.projects.all()).find((project) => project.id === original.id)
      ?.title,
  ).toBe('New title')
})
it('rejects unsafe project links, images, invalid colours and incomplete revision identities', () => {
  for (const link of [
    'javascript:alert(1)',
    'data:text/html,test',
    '/relative',
    'https://',
  ])
    expect(projectSchema.safeParse({ ...input, link }).success).toBe(false)
  for (const image of [
    '//evil.example/a.png',
    '/\\evil.example/a.png',
    'javascript:alert(1)',
  ])
    expect(projectSchema.safeParse({ ...input, image }).success).toBe(false)
  expect(
    projectSchema.safeParse({ ...input, color: 'arbitrary-class' }).success,
  ).toBe(false)
  expect(
    projectSchema.safeParse({ ...input, id: crypto.randomUUID() }).success,
  ).toBe(false)
})

it('keeps legacy projects readable and preserves case studies through CMS edits and restarts', async () => {
  const { projectCaseStudy } = await import('./project-case-study')
  const movie = (await store.projects.published())[0]
  expect(projectCaseStudy(movie).caseStudy.problem).toContain('PostgreSQL')
  const caseStudy = {
    problem: 'A specific problem',
    contribution: 'My own contribution',
    decisions: 'A deliberate trade-off',
    results: 'An observed outcome',
  }
  const saved = await store.projects.save({ ...movie, caseStudy }, 'admin')
  await store.close()
  store = await StoryStore.connect(url)
  const reloaded = (await store.projects.published()).find(
    (p) => p.id === saved.id,
  )!
  expect(projectCaseStudy(reloaded).caseStudy).toEqual(caseStudy)
  expect(
    projectSchema.safeParse({
      ...input,
      caseStudy: { ...caseStudy, results: 'x'.repeat(5001) },
    }).success,
  ).toBe(false)
})

it('replaces the old showcase once without deleting CMS content or overwriting Rowberry edits', async () => {
  const { createClient } = await import('@libsql/client')
  const db = createClient({ url })
  const rowberry = (await store.projects.published())[0]
  const edited = await store.projects.save(
    { ...rowberry, description: 'Keep my Rowberry description.' },
    'admin',
  )
  const movie = await store.projects.save(
    {
      ...input,
      title: 'Movie-Mate',
      link: 'https://movie-app.spicey.dev',
      draft: false,
    },
    'admin',
  )
  const storeit = await store.projects.save(
    {
      ...input,
      title: 'StoreIt',
      link: 'https://storeit.spicey.dev',
      draft: false,
    },
    'admin',
  )
  const custom = await store.projects.save(
    { ...input, title: 'Another project', draft: false },
    'admin',
  )
  await db.execute("DELETE FROM cms_meta WHERE key='rowberry_showcase_v1'")
  await store.close()
  store = await StoryStore.connect(url)
  const all = await store.projects.all()
  expect(all).toHaveLength(4)
  expect(all.find((p) => p.id === movie.id)?.archived).toBe(true)
  expect(all.find((p) => p.id === storeit.id)?.archived).toBe(true)
  expect(all.find((p) => p.id === edited.id)?.description).toBe(
    'Keep my Rowberry description.',
  )
  expect((await store.projects.published()).map((p) => p.id)).toContain(
    custom.id,
  )
  // Once applied, subsequent CMS decisions remain authoritative.
  const archived = all.find((p) => p.id === movie.id)!
  await store.projects.archive(archived.id, archived.revision, false, 'admin')
  await store.close()
  store = await StoryStore.connect(url)
  expect((await store.projects.published()).map((p) => p.id)).toContain(
    movie.id,
  )
  db.close()
})
