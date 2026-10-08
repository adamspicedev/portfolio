import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { Database } from 'bun:sqlite'

const source = resolve(process.env.DATABASE_PATH || './data/portfolio.sqlite')
if (process.env.TURSO_DATABASE_URL)
  throw new Error(
    'This command backs up local SQLite files only. Use Turso database backups for a remote database.',
  )
if (!existsSync(source))
  throw new Error(`No database at ${source}. Start the app first.`)
const destination = resolve(
  process.argv[2] ||
    `./backups/portfolio-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`,
)
mkdirSync(dirname(destination), { recursive: true })
const db = new Database(source)
try {
  db.query('VACUUM INTO ?').run(destination)
  console.log(`Saved a consistent SQLite backup to ${destination}`)
} finally {
  db.close()
}
