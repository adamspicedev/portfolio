import { StoryStore } from './sqlite-stories.server'
import { seedStories } from './seed-stories.server'
export { StoryConflict, DuplicateSlug } from './sqlite-stories.server'

let store: StoryStore | undefined
export function storyStore() {
  if (process.env.VERCEL)
    throw new Error(
      'The SQLite CMS requires a Bun server with persistent storage. Vercel functions cannot store this database.',
    )
  store ??= new StoryStore(
    process.env.DATABASE_PATH || './data/portfolio.sqlite',
    seedStories,
  )
  return store
}
