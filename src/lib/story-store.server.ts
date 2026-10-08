import { localDatabaseUrl, StoryStore } from './sqlite-stories.server'
import { seedStories } from './seed-stories.server'
export { StoryConflict, DuplicateSlug } from './sqlite-stories.server'

let store: Promise<StoryStore> | undefined
export function storyStore(): Promise<StoryStore> {
  if (!store) {
    const tursoUrl = process.env.TURSO_DATABASE_URL
    if (process.env.VERCEL && !tursoUrl)
      throw new Error(
        'TURSO_DATABASE_URL must be configured for the CMS on Vercel.',
      )
    if (tursoUrl && !process.env.TURSO_AUTH_TOKEN)
      throw new Error('TURSO_AUTH_TOKEN must be configured with Turso.')

    store = tursoUrl
      ? StoryStore.connect(tursoUrl, process.env.TURSO_AUTH_TOKEN, seedStories)
      : StoryStore.connect(
          localDatabaseUrl(
            process.env.DATABASE_PATH || './data/portfolio.sqlite',
          ),
          undefined,
          seedStories,
        )
  }
  return store
}
