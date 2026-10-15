import { expect, test } from 'bun:test'
import sharp from 'sharp'
import {
  handleImageUpload,
  prepareImage,
  MAX_IMAGE_BYTES,
} from './image-upload.server'

const png = () =>
  sharp({
    create: { width: 12, height: 8, channels: 3, background: '#8877bb' },
  })
    .png()
    .toBuffer()
const request = async (file?: File, headers: Record<string, string> = {}) => {
  const data = new FormData()
  if (file) data.set('file', file)
  return new Request('https://spicey.dev/api/story-images', {
    method: 'POST',
    headers: { origin: 'https://spicey.dev', ...headers },
    body: data,
  })
}
const deps = (overrides = {}) => ({
  authorize: async () => 'admin',
  configured: () => true,
  store: async (_bytes: Uint8Array, path: string) =>
    `https://images.public.blob.vercel-storage.com/${path}`,
  ...overrides,
})

test('decodes and re-encodes real JPEG, PNG and WebP images, discarding metadata and original filenames', async () => {
  for (const format of ['jpeg', 'png', 'webp'] as const) {
    const bytes = await sharp(await png())
      .withMetadata()
      .toFormat(format)
      .toBuffer()
    const result = await prepareImage(
      new File([bytes], '../../secret.svg', { type: `image/${format}` }),
    )
    expect(result.path).toMatch(/^story-covers\/[a-f0-9-]+\.webp$/)
    const meta = await sharp(result.bytes).metadata()
    expect(meta.format).toBe('webp')
    expect(meta.width).toBe(12)
    expect(meta.exif).toBeUndefined()
  }
})
test('rejects oversized, empty, SVG, corrupt and mismatched image content', async () => {
  for (const file of [
    new File([], 'empty.png', { type: 'image/png' }),
    new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], 'big.png', {
      type: 'image/png',
    }),
    new File(['<svg/>'], 'x.svg', { type: 'image/svg+xml' }),
    new File(['not a png'], 'x.png', { type: 'image/png' }),
    new File([await png()], 'x.jpg', { type: 'image/jpeg' }),
  ]) {
    await expect(prepareImage(file)).rejects.toThrow()
  }
})
test('rejects excessive decoded pixel counts', async () => {
  const bytes = await sharp({
    create: { width: 6000, height: 5000, channels: 3, background: 'white' },
  })
    .png()
    .toBuffer()
  await expect(
    prepareImage(new File([bytes], 'huge.png', { type: 'image/png' })),
  ).rejects.toThrow()
})
test('denies unauthorized and cross-origin requests before consuming or storing images', async () => {
  const req = await request(
    new File([await png()], 'x.png', { type: 'image/png' }),
  )
  const response = await handleImageUpload(
    req,
    deps({
      authorize: async () => {
        throw new Error('denied')
      },
    }),
  )
  expect(response.status).toBe(403)
  expect(req.bodyUsed).toBe(false)
  const cross = await request(undefined, { origin: 'https://attacker.example' })
  expect((await handleImageUpload(cross, deps())).status).toBe(403)
  expect(cross.bodyUsed).toBe(false)
})
test('returns durable URLs only after validated upload and reports storage failure safely', async () => {
  const file = new File([await png()], 'x.png', { type: 'image/png' })
  const response = await handleImageUpload(await request(file), deps())
  expect(response.status).toBe(201)
  expect((await response.json()).url).toMatch(
    /^https:\/\/images\.public\.blob\.vercel-storage\.com\/story-covers\/.*\.webp$/,
  )
  expect(response.headers.get('cache-control')).toBe('private, no-store')
  const failure = await handleImageUpload(
    await request(file),
    deps({
      store: async () => {
        throw new Error('secret token')
      },
    }),
  )
  expect(failure.status).toBe(503)
  expect(await failure.text()).not.toContain('secret token')
  expect(
    (
      await handleImageUpload(
        await request(file),
        deps({ configured: () => false }),
      )
    ).status,
  ).toBe(503)
})
test('rejects missing files and oversized request bodies including chunked bodies', async () => {
  expect((await handleImageUpload(await request(), deps())).status).toBe(400)
  const large = new Request('https://spicey.dev/api/story-images', {
    method: 'POST',
    headers: {
      origin: 'https://spicey.dev',
      'content-type': 'multipart/form-data; boundary=test',
    },
    body: new Uint8Array(MAX_IMAGE_BYTES + 65537),
  })
  expect((await handleImageUpload(large, deps())).status).toBe(413)
})
