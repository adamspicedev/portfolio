import { publishedStories, summarizeStory } from './story-schema'
import { getLegacyStories, getLegacyStory } from './legacy-stories.server'
import { storyStore } from './story-store.server'

export async function listStories() {
  const store = await storyStore()
  const [all, remote] = await Promise.all([store.all(), getLegacyStories()])
  const localStories = await store.published(undefined, all)
  const localSlugs = new Set(all.map((story) => story.slug))
  return publishedStories([
    ...localStories,
    ...remote.filter((story) => !localSlugs.has(story.slug)),
  ]).map(summarizeStory)
}
export async function findStory(slug: string) {
  const store = await storyStore()
  const story = await store.bySlug(slug)
  if (story) return (await store.published()).find((item) => item.slug === slug)
  const remote = await getLegacyStory(slug)
  return remote ? publishedStories([remote])[0] : undefined
}
