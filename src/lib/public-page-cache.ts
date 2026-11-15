import { slugSchema } from './story-schema'

type HandlerType = 'router' | 'serverFn'

function isPublicPath(path: string) {
  return (
    path === '/' ||
    path === '/blog' ||
    (path.startsWith('/blog/') && slugSchema.safeParse(path.slice(6)).success)
  )
}

/** These routes render only published data and must never receive Clerk state. */
export function isPublicPageRequest(
  request: Request,
  handlerType: HandlerType,
) {
  const url = new URL(request.url)
  return (
    handlerType === 'router' &&
    (request.method === 'GET' || request.method === 'HEAD') &&
    !request.headers.has('authorization') &&
    !url.search &&
    isPublicPath(url.pathname)
  )
}

export function applyPublicPageCache(
  request: Request,
  response: Response,
  handlerType: HandlerType,
) {
  const path = new URL(request.url).pathname
  if (
    !isPublicPath(path) &&
    !path.startsWith('/admin') &&
    handlerType !== 'serverFn'
  )
    return
  const vary = (response.headers.get('vary') ?? '')
    .toLowerCase()
    .split(',')
    .map((value) => value.trim())
  const cacheable =
    isPublicPageRequest(request, handlerType) &&
    response.status === 200 &&
    response.headers
      .get('content-type')
      ?.toLowerCase()
      .startsWith('text/html') &&
    !response.headers.has('set-cookie') &&
    !vary.includes('*') &&
    !vary.includes('cookie')
  response.headers.set(
    'Cache-Control',
    cacheable
      ? 'public, max-age=0, must-revalidate, no-transform'
      : 'private, no-store, no-transform',
  )
  // Vercel consumes this header. Cloudflare keeps its default HTML bypass policy.
  response.headers.set(
    'Vercel-CDN-Cache-Control',
    cacheable ? 'public, s-maxage=30' : 'no-store',
  )
}
