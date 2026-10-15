import { randomUUID } from 'node:crypto'
import sharp from 'sharp'

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024
const MAX_REQUEST_BYTES = MAX_IMAGE_BYTES + 65_536
const formats = new Map([
  ['image/jpeg', 'jpeg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
])
class UploadError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message)
  }
}

export async function prepareImage(file: File) {
  if (!file.size || file.size > MAX_IMAGE_BYTES)
    throw new UploadError('Choose a non-empty image up to 3 MB.', 413)
  const format = formats.get(file.type)
  if (!format) throw new UploadError('Choose a JPEG, PNG or WebP image.')
  try {
    const image = sharp(await file.arrayBuffer(), {
      limitInputPixels: 25_000_000,
      failOn: 'warning',
    })
    const metadata = await image.metadata()
    if (metadata.format !== format || (metadata.pages ?? 1) !== 1)
      throw new Error('Invalid format')
    // Decode fully and re-encode: reject broken files, remove EXIF/location data,
    // avoid serving original active content, and normalize phone orientation.
    const bytes = await image
      .rotate()
      .resize({
        width: 2400,
        height: 2400,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 88 })
      .toBuffer()
    return { bytes, path: `story-covers/${randomUUID()}.webp` }
  } catch {
    throw new UploadError(
      'That image could not be read. Choose a valid, still JPEG, PNG or WebP image under 25 megapixels.',
    )
  }
}

type Dependencies = {
  authorize: () => Promise<string>
  configured: () => boolean
  store: (bytes: Uint8Array, path: string) => Promise<string>
}
const json = (status: number, data: object) =>
  Response.json(data, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  })

async function readForm(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('multipart/form-data;'))
    throw new UploadError('Choose an image to upload.')
  if (Number(request.headers.get('content-length')) > MAX_REQUEST_BYTES)
    throw new UploadError('Choose an image up to 3 MB.', 413)
  if (!request.body) throw new UploadError('Choose an image to upload.')
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > MAX_REQUEST_BYTES) {
        await reader.cancel()
        throw new UploadError('Choose an image up to 3 MB.', 413)
      }
      chunks.push(value)
    }
    const bytes = Buffer.concat(chunks)
    return await new Response(bytes, {
      headers: { 'Content-Type': request.headers.get('content-type')! },
    }).formData()
  } catch (error) {
    if (error instanceof UploadError) throw error
    throw new UploadError('The upload was incomplete. Choose the image again.')
  } finally {
    reader.releaseLock()
  }
}

export async function handleImageUpload(request: Request, deps: Dependencies) {
  // Do not accept ambient-cookie writes from another site, or trust browser MIME.
  if (request.headers.get('origin') !== new URL(request.url).origin)
    return json(403, { message: 'Upload from Story Studio on this website.' })
  try {
    await deps.authorize()
  } catch {
    return json(403, {
      message: 'Sign in with an administrator account to upload images.',
    })
  }
  if (!deps.configured())
    return json(503, {
      message:
        'Image uploads are not connected yet. You can still use an image URL.',
    })
  try {
    const form = await readForm(request)
    const file = form.get('file')
    if (!(file instanceof File))
      throw new UploadError('Choose an image to upload.')
    const image = await prepareImage(file)
    try {
      const url = await deps.store(image.bytes, image.path)
      return json(201, { url })
    } catch {
      // Provider errors may include configuration details; never log or return them.
      return json(503, {
        message:
          'Unable to store the image. Your existing cover is unchanged. Try again.',
      })
    }
  } catch (error) {
    if (error instanceof UploadError)
      return json(error.status, { message: error.message })
    return json(400, {
      message: 'Unable to read the upload. Choose the image again.',
    })
  }
}
