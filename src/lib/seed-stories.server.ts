import { parseStory } from './story-parser.server'

const files = import.meta.glob('../../content/stories/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})
export const seedStories = Object.entries(files).map(([path, raw]) => {
  if (typeof raw !== 'string') throw new Error(`Story is not text: ${path}`)
  try {
    return parseStory(path, raw)
  } catch (error) {
    throw new Error(`Invalid story metadata in ${path}`, { cause: error })
  }
})
