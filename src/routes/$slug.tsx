import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { getStory } from '../lib/stories.functions'
import { slugSchema } from '../lib/story-schema'

// Keep links from the previous /story-slug URLs working.
export const Route = createFileRoute('/$slug')({
  beforeLoad: async ({ params }) => {
    if (!slugSchema.safeParse(params.slug).success) throw notFound()
    const story = await getStory({ data: params.slug })
    if (!story) throw notFound()
    throw redirect({
      to: '/blog/$slug',
      params: { slug: story.slug },
      statusCode: 301,
    })
  },
})
