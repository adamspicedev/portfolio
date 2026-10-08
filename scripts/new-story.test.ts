import { spawnSync } from 'node:child_process'
import {
  access,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { parseStory } from '../src/lib/story-parser.server'

let directory: string
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'portfolio-story-test-'))
  await mkdir(join(directory, 'scripts'))
  await copyFile(
    new URL('./new-story.mjs', import.meta.url),
    join(directory, 'scripts/new-story.mjs'),
  )
})
afterEach(async () => {
  await rm(directory, { recursive: true, force: true })
})
const create = (...args: string[]) =>
  spawnSync(
    process.execPath,
    [join(directory, 'scripts/new-story.mjs'), ...args],
    { encoding: 'utf8' },
  )

describe('story publishing CLI', () => {
  it('creates a valid draft and safely handles accented titles and quotes', async () => {
    expect(create('Café "React"').status).toBe(0)
    const raw = await readFile(
      join(directory, 'content/stories/cafe-react.md'),
      'utf8',
    )
    expect(parseStory('cafe-react.md', raw)).toMatchObject({
      title: 'Café "React"',
      draft: true,
      tags: [],
    })
  })
  it('never overwrites an existing story', async () => {
    expect(create('My story').status).toBe(0)
    const path = join(directory, 'content/stories/my-story.md')
    await writeFile(path, 'An existing story with unpublished edits.')
    const duplicate = create('My story')
    expect(duplicate.status).toBe(1)
    expect(duplicate.stderr).toContain('already exists')
    expect(await readFile(path, 'utf8')).toBe(
      'An existing story with unpublished edits.',
    )
  })
  it.each([[], ['!!!'], ['a'.repeat(121)], ['a'.repeat(161)]])(
    'rejects invalid titles without creating content: %j',
    async (...args) => {
      const result = create(...args)
      expect(result.status).toBe(1)
      expect(result.stderr.length).toBeGreaterThan(0)
      await expect(access(join(directory, 'content'))).rejects.toThrow('ENOENT')
    },
  )
})
