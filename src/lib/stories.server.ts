import { publishedStories, summarizeStory } from './story-schema'
import { getLegacyStories, getLegacyStory } from './legacy-stories.server'
import { storyStore } from './story-store.server'
import { withGraphiteCover } from './graphite-story-covers'

export async function listStories() {
  const store = await storyStore()
  const [all, remote] = await Promise.all([store.all(), getLegacyStories()])
  const localStories = await store.published(undefined, all)
  const localSlugs = new Set(all.map((story) => story.slug))
  return publishedStories([
    ...localStories,
    ...remote.filter((story) => !localSlugs.has(story.slug)),
  ]).map((story) => summarizeStory(withGraphiteCover(story)))
}
export async function findStory(slug: string) {
  const store = await storyStore()
  const story = await store.bySlug(slug)
  if (story) {
    const selected = (await store.published(undefined, [story]))[0]
    return selected ? withGraphiteCover(selected) : undefined
  }
  const remote = await getLegacyStory(slug)
  const selected = remote ? publishedStories([remote])[0] : undefined
  return selected ? withGraphiteCover(selected) : undefined
}
