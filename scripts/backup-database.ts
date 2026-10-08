import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { StoryStore } from '../src/lib/sqlite-stories.server'

const source = resolve(process.env.DATABASE_PATH || './data/portfolio.sqlite')
if (!existsSync(source))
  throw new Error(`No database at ${source}. Start the app first.`)
const destination = resolve(
  process.argv[2] ||
    `./backups/portfolio-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`,
)
mkdirSync(dirname(destination), { recursive: true })
const store = new StoryStore(source)
try {
  store.backup(destination)
  console.log(`Saved a consistent SQLite backup to ${destination}`)
} finally {
  store.close()
}
