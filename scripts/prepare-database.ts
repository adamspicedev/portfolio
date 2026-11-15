import { StoryStore } from '../src/lib/sqlite-stories.server'
import { readdir, readFile } from 'node:fs/promises'
import { parseStory } from '../src/lib/story-parser.server'

export async function prepareCmsDatabase(url: string, token?: string) {
  const directory = new URL('../content/stories/', import.meta.url)
  const files = (await readdir(directory)).filter((file) =>
    file.endsWith('.md'),
  )
  const seeds = await Promise.all(
    files.map(async (file) =>
      parseStory(file, await readFile(new URL(file, directory), 'utf8')),
    ),
  )
  const store = await StoryStore.connect(url, token, seeds)
  try {
    await Promise.all([store.all(), store.projects.all()])
  } finally {
    store.close()
  }
}

if (
  import.meta.main &&
  process.env.VERCEL === '1' &&
  process.env.VERCEL_ENV === 'production'
) {
  const url = process.env.TURSO_DATABASE_URL
  const token = process.env.TURSO_AUTH_TOKEN
  if (!url?.startsWith('libsql://') || !token)
    throw new Error('Production CMS database configuration is required.')
  try {
    await prepareCmsDatabase(url, token)
    console.log('CMS database migrations and seeds verified.')
  } catch {
    console.error('CMS database preparation failed. Deployment stopped.')
    process.exitCode = 1
  }
}
