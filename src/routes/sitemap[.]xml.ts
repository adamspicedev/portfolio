import { createFileRoute } from '@tanstack/react-router'
import { listStories } from '../lib/stories.server'
import { storyStore } from '../lib/story-store.server'
import { sitemapXml } from '../lib/seo'
export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () =>
        new Response(
          sitemapXml(
            await listStories(),
            await (await storyStore()).projects.published(),
          ),
          {
            headers: {
              'Content-Type': 'application/xml; charset=utf-8',
              'Cache-Control': 'no-cache',
            },
          },
        ),
    },
  },
})
