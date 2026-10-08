import { createFileRoute } from '@tanstack/react-router'
import { listStories } from '../lib/stories.server'
import { sitemapXml } from '../lib/seo'
export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () =>
        new Response(sitemapXml(await listStories()), {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'no-cache',
          },
        }),
    },
  },
})
