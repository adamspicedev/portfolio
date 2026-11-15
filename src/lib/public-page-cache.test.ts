import { expect, test } from 'bun:test'
import { isPublicPageRequest, applyPublicPageCache } from './public-page-cache'

const request = (path: string, init?: RequestInit) =>
  new Request(`https://www.spicey.dev${path}`, init)
const html = (init: ResponseInit = {}) =>
  new Response('<html>Public</html>', {
    ...init,
    headers: { 'content-type': 'text/html; charset=utf-8', ...init.headers },
  })

test('only known public page reads bypass session middleware', () => {
  for (const path of ['/', '/blog', '/blog/a-published-story']) {
    expect(isPublicPageRequest(request(path), 'router')).toBe(true)
    expect(
      isPublicPageRequest(request(path, { method: 'HEAD' }), 'router'),
    ).toBe(true)
    // Public HTML has no session-specific state, even for a signed-in browser.
    expect(
      isPublicPageRequest(
        request(path, { headers: { cookie: '__session=private' } }),
        'router',
      ),
    ).toBe(true)
    expect(isPublicPageRequest(request(path), 'serverFn')).toBe(false)
  }
  for (const path of [
    '/admin',
    '/admin/projects',
    '/api/headlines',
    '/_serverFn/abc',
    '/blog/a/b',
    '/blog?preview=true',
    '/?__clerk_ticket=test',
    '/blog/UPPERCASE',
  ])
    expect(isPublicPageRequest(request(path), 'router')).toBe(false)
  expect(isPublicPageRequest(request('/', { method: 'POST' }), 'router')).toBe(
    false,
  )
  expect(
    isPublicPageRequest(
      request('/', { headers: { authorization: 'Bearer private' } }),
      'router',
    ),
  ).toBe(false)
})

test('public HTML has bounded Vercel caching while browsers revalidate and transforms stay prohibited', () => {
  const response = html()
  applyPublicPageCache(request('/'), response, 'router')
  expect(response.headers.get('Vercel-CDN-Cache-Control')).toBe(
    'public, s-maxage=30',
  )
  expect(response.headers.get('Cache-Control')).toBe(
    'public, max-age=0, must-revalidate, no-transform',
  )
  expect(response.headers.get('CDN-Cache-Control')).toBeNull()
})

test('errors, cookies, personalised variants and server functions cannot enter the shared HTML cache', () => {
  for (const [path, response, handler] of [
    ['/', html({ status: 500 }), 'router'],
    ['/', html({ status: 404 }), 'router'],
    ['/', html({ headers: { 'set-cookie': '__session=secret' } }), 'router'],
    ['/', html({ headers: { vary: 'Cookie' } }), 'router'],
    ['/', html({ headers: { vary: '*' } }), 'router'],
    ['/admin', html(), 'router'],
    ['/blog?preview=true', html(), 'router'],
    ['/', html(), 'serverFn'],
  ] as const) {
    applyPublicPageCache(request(path), response, handler)
    expect(response.headers.get('Vercel-CDN-Cache-Control')).toBe('no-store')
    expect(response.headers.get('Cache-Control')).toBe(
      'private, no-store, no-transform',
    )
  }
  const api = Response.json(
    { headlines: [] },
    { headers: { 'Cache-Control': 'public, max-age=60' } },
  )
  applyPublicPageCache(request('/api/headlines'), api, 'router')
  expect(api.headers.get('Cache-Control')).toBe('public, max-age=60')
})
