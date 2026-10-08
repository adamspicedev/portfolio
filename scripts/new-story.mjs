import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const title = process.argv.slice(2).join(' ').trim()
if (!title) {
  console.error('Usage: bun run story "Your story title"')
  process.exitCode = 1
} else {
  const slug = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  if (!slug || slug.length > 120 || title.length > 160) {
    console.error(
      'Use a title up to 160 characters that produces a slug up to 120 characters.',
    )
    process.exitCode = 1
  } else {
    const directory = new URL('../content/stories/', import.meta.url)
    await mkdir(directory, { recursive: true })
    const file = new URL(`${slug}.md`, directory)
    const date = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Pacific/Auckland',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())
    const source = `---\ntitle: ${JSON.stringify(title)}\ndate: "${date}"\ndescription: "Add a short description of your story."\ntags: []\ndraft: true\n---\n\nWrite your story here.\n`
    try {
      await writeFile(file, source, { flag: 'wx' })
      console.log(
        `Created ${fileURLToPath(file)}\nSet draft: false when you're ready to publish.`,
      )
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'EEXIST'
      ) {
        console.error(
          `A story named ${slug}.md already exists. Choose a different title.`,
        )
        process.exitCode = 1
      } else throw error
    }
  }
}
