import { createFileRoute } from '@tanstack/react-router'
import { readHeadlines } from '../lib/headlines.server'

export const Route = createFileRoute('/api/headlines')({
  server: {
    handlers: {
      GET: async () => {
        const headlines = await readHeadlines()
        return Response.json(headlines, {
          headers: {
            'Cache-Control': headlines.length
              ? 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
              : 'no-store',
          },
        })
      },
    },
  },
})
