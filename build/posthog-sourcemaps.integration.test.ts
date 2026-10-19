import { expect, test } from 'bun:test'
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { build } from 'vite'
import { posthogSourceMaps } from './posthog-sourcemaps'

// Exercise the official plugin/Vite hooks against a local CLI double only.
// Never authenticate, use a real key, or contact PostHog in this test.
test('client maps match final chunks, are uploaded before deletion, and are absent from output', async () => {
  const root = await mkdtemp(join(tmpdir(), 'portfolio-maps-'))
  try {
    const record = join(root, 'record.json')
    const cli = join(root, 'fake-cli.mjs')
    await writeFile(
      cli,
      `#!/usr/bin/env node
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const files=readFileSync(0,'utf8').trim().split('\\n');
const records=files.map(file=>{const code=readFileSync(file,'utf8');const map=JSON.parse(readFileSync(file+'.map','utf8'));if(!map.mappings||!map.sourcesContent?.length)process.exit(2);return {file,hash:createHash('sha256').update(code).digest('hex'),sources:map.sources,hasChunkId:code.includes('chunkId=')}});
writeFileSync(${JSON.stringify(record)},JSON.stringify(records));
`,
      { mode: 0o700 },
    )
    await mkdir(join(root, 'src'))
    await writeFile(
      join(root, 'src/main.ts'),
      'export function greet(name: string) { return `Hello ${name}` }\nconsole.log(greet("fixture"))',
    )
    const output = join(root, 'dist')
    await build({
      configFile: false,
      root,
      logLevel: 'silent',
      plugins: posthogSourceMaps(
        {
          VERCEL: '1',
          VERCEL_ENV: 'production',
          POSTHOG_API_KEY: 'test-only-placeholder',
          VERCEL_GIT_COMMIT_SHA: 'test-commit',
        },
        { cliBinaryPath: cli },
      ),
      build: {
        outDir: output,
        rolldownOptions: { input: join(root, 'src/main.ts') },
      },
    })
    const records = JSON.parse(await readFile(record, 'utf8')) as {
      file: string
      hash: string
      sources: string[]
      hasChunkId: boolean
    }[]
    expect(records.length).toBeGreaterThan(0)
    for (const item of records) {
      expect(item.hasChunkId).toBe(true)
      expect(
        item.sources.some((source) => source.endsWith('src/main.ts')),
      ).toBe(true)
      expect(
        createHash('sha256')
          .update(await readFile(item.file))
          .digest('hex'),
      ).toBe(item.hash)
      expect(await readFile(item.file, 'utf8')).not.toContain(
        'test-only-placeholder',
      )
    }
    expect(
      (await readdir(output, { recursive: true })).filter((file) =>
        file.endsWith('.map'),
      ),
    ).toEqual([])
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('an upload failure stops the build instead of publishing unprocessed maps', async () => {
  const root = await mkdtemp(join(tmpdir(), 'portfolio-maps-failure-'))
  try {
    const cli = join(root, 'fail-cli.mjs')
    await writeFile(
      cli,
      '#!/usr/bin/env node\nprocess.stdin.resume();process.stdin.on("end",()=>process.exit(1))',
      { mode: 0o700 },
    )
    const input = join(root, 'entry.ts')
    await writeFile(input, 'console.log("fixture")')
    await expect(
      build({
        configFile: false,
        root,
        logLevel: 'silent',
        plugins: posthogSourceMaps(
          {
            VERCEL: '1',
            VERCEL_ENV: 'production',
            POSTHOG_API_KEY: 'test-only-placeholder',
          },
          { cliBinaryPath: cli },
        ),
        build: { outDir: join(root, 'dist'), rolldownOptions: { input } },
      }),
    ).rejects.toThrow()
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
