import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dir, '..')
const temporary = await mkdtemp(join(tmpdir(), 'portfolio-vercel-check-'))
const environment = {
  PATH: process.env.PATH,
  DATABASE_PATH: join(temporary, 'portfolio.sqlite'),
  ...Object.fromEntries(
    [
      'VITE_PUBLIC_POSTHOG_PROJECT_TOKEN',
      'VITE_PUBLIC_POSTHOG_HOST',
      'POSTHOG_API_KEY',
      'POSTHOG_PROJECT_ID',
      'POSTHOG_HOST',
      'VITE_CLERK_PUBLISHABLE_KEY',
      'CLERK_SECRET_KEY',
      'CMS_ADMIN_USER_IDS',
      'TURSO_DATABASE_URL',
      'TURSO_AUTH_TOKEN',
      'RESEND_API_KEY',
      'RESEND_WEBHOOK_SECRET',
      'RESEND_FROM_EMAIL',
      'WRITE_IT_UP_URL',
      'BLOB_STORE_ID',
      'BLOB_READ_WRITE_TOKEN',
      'VITE_TURNSTILE_SITE_KEY',
      'TURNSTILE_SECRET_KEY',
    ].map((name) => [name, '']),
  ),
}

async function run(
  args: string[],
  cwd: string,
  env: Record<string, string | undefined> = environment,
) {
  const child = Bun.spawn([process.execPath, ...args], {
    cwd,
    env,
    stdout: 'inherit',
    stderr: 'inherit',
  })
  const code = await child.exited
  if (code !== 0)
    throw new Error(`Vercel artifact check failed (exit ${code}).`)
}

try {
  await run(['--no-env-file', 'run', 'vite', 'build'], root, {
    ...environment,
    VERCEL: '1',
    VERCEL_ENV: 'preview',
  })

  // Running outside the repository prevents missing native packages from
  // resolving through its node_modules and hiding a broken deployment.
  await cp(join(root, '.vercel/output/functions/__server.func'), temporary, {
    recursive: true,
    verbatimSymlinks: true,
  })
  await writeFile(
    join(temporary, 'probe.mjs'),
    `import assert from 'node:assert/strict'
import handler from './index.mjs'

for (const [path, content] of [
  ['/', 'I build things'],
  ['/admin', 'Connect Clerk to get started'],
]) {
  const response = await handler.fetch(new Request('http://localhost' + path))
  assert.equal(response.status, 200, path + ' must render successfully')
  assert.ok((await response.text()).includes(content), path + ' must render its content')
}
console.log('Standalone Vercel artifact renders the homepage and admin setup.')
`,
  )
  await run(['--no-install', '--no-env-file', 'probe.mjs'], temporary)
} finally {
  await rm(temporary, { recursive: true, force: true })
}
