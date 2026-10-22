import { createFileRoute } from '@tanstack/react-router'
import { put } from '@vercel/blob'
import { requireAdmin } from '../lib/admin.server'
import { handleImageUpload } from '../lib/image-upload.server'

export const Route = createFileRoute('/api/story-images')({
  server: {
    handlers: {
      POST: ({ request }) =>
        handleImageUpload(request, {
          authorize: requireAdmin,
          configured: () =>
            Boolean(
              process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN,
            ),
          store: async (bytes, path) => {
            const blob = await put(path, Buffer.from(bytes), {
              access: 'public',
              contentType: 'image/webp',
              addRandomSuffix: false,
              allowOverwrite: false,
              cacheControlMaxAge: 31536000,
            })
            return blob.url
          },
        }),
    },
  },
})
