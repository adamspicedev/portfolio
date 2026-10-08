import { readdir, readFile } from 'node:fs/promises'
import { parseStory } from '../src/lib/story-parser.server'

const directory = new URL('../content/stories/', import.meta.url)
const files = (await readdir(directory)).filter((file) => file.endsWith('.md'))
let invalid = false
for (const file of files) {
  try {
    const raw = await readFile(new URL(file, directory), 'utf8')
    parseStory(file, raw)
  } catch (error) {
    invalid = true
    console.error(`Invalid story: content/stories/${file}`)
    console.error(error instanceof Error ? error.message : 'Invalid metadata')
  }
}
if (invalid) process.exitCode = 1
else
  console.log(
    `Validated ${files.length} Markdown ${files.length === 1 ? 'story' : 'stories'}.`,
  )
