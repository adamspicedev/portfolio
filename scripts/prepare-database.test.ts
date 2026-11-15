import { expect, test } from 'bun:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { StoryStore } from '../src/lib/sqlite-stories.server'
import { prepareCmsDatabase } from './prepare-database'

test('build preparation seeds an empty database and preserves CMS edits on repeated builds', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'portfolio-prepare-'))
  const url = `file:${join(directory, 'db.sqlite')}`
  try {
    await prepareCmsDatabase(url)
    let store = StoryStore.open(url)
    const first = (await store.all())[0]!
    expect(first).toBeDefined()
    await store.save({ ...first, title: 'Keep this CMS edit' }, 'test')
    store.close()
    await prepareCmsDatabase(url)
    store = StoryStore.open(url)
    try {
      expect((await store.get(first.id)).title).toBe('Keep this CMS edit')
    } finally {
      store.close()
    }
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
