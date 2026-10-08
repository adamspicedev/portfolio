import { createServer } from 'node:http'
import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { getLegacyStory } from './legacy-stories.server'

const originalUrl = process.env.WRITE_IT_UP_URL
const article = {
  slug: 'old-story',
  title: 'An existing story',
  description: 'From the original blog.',
  createdAt: '2024-05-06T12:00:00Z',
  imageUrl: '/images/blog_images/testing.jpg',
  tags: [],
  content: {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'A heading' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Some text.', marks: [{ type: 'bold' }] },
        ],
      },
      {
        type: 'codeBlock',
        attrs: { language: 'ts' },
        content: [{ type: 'text', text: 'const answer = 42' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Unsafe link',
            marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
          },
        ],
      },
    ],
  },
}
const server = createServer((request, response) => {
  response.setHeader('Content-Type', 'application/json')
  response.end(
    JSON.stringify({ body: request.url === '/old-story' ? [article] : [] }),
  )
})
beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string')
    throw new Error('Could not bind fixture server')
  process.env.WRITE_IT_UP_URL = `http://127.0.0.1:${address.port}`
})
afterAll(async () => {
  if (originalUrl === undefined) delete process.env.WRITE_IT_UP_URL
  else process.env.WRITE_IT_UP_URL = originalUrl
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  )
})
describe('legacy blog compatibility', () => {
  it('reads the original article response and preserves supported rich text without unsafe links', async () => {
    const story = await getLegacyStory('old-story')
    expect(story).toMatchObject({
      slug: 'old-story',
      date: '2024-05-06',
      cover: '/images/blog_images/testing.jpg',
    })
    expect(story?.body).toContain('## A heading')
    expect(story?.body).toContain('**Some text.**')
    expect(story?.body).toContain('```ts\nconst answer = 42\n```')
    expect(story?.body).not.toContain('javascript:')
  })
  it('returns no story for the old service empty response', async () => {
    expect(await getLegacyStory('missing')).toBeUndefined()
  })
})
