import { createFileRoute } from '@tanstack/react-router'
import { siteUrl } from '../lib/seo'
export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(
          `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
          {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          },
        ),
    },
  },
})
