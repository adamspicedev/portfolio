import { publishedStories, summarizeStory } from './story-schema'
import { getLegacyStories, getLegacyStory } from './legacy-stories.server'
import { storyStore } from './story-store.server'

export async function listStories() {
  const store = storyStore()
  const localSlugs = new Set(store.all().map((story) => story.slug))
  const remote = await getLegacyStories()
  return publishedStories([
    ...store.published(),
    ...remote.filter((story) => !localSlugs.has(story.slug)),
  ]).map(summarizeStory)
}
export async function findStory(slug: string) {
  const store = storyStore()
  const story = store.bySlug(slug)
  if (story) return store.published().find((item) => item.slug === slug)
  const remote = await getLegacyStory(slug)
  return remote ? publishedStories([remote])[0] : undefined
}
