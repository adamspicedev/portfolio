import { expect, test } from 'bun:test'
import { createHeadlineReader } from './headlines.server'

test('headlines reject unsafe URLs and deleted items, cache results and retain stale data on failure', async () => {
  let calls = 0
  let time = 1
  let failing = false
  const request = async (input: string | URL | Request) => {
    calls++
    if (failing) throw new Error('Offline')
    const url = String(input)
    if (url.endsWith('topstories.json')) return Response.json([1, 2, 3])
    if (url.endsWith('/1.json'))
      return Response.json({
        id: 1,
        title: 'Useful headline',
        url: 'https://example.com/story',
        type: 'story',
      })
    if (url.endsWith('/2.json'))
      return Response.json({
        id: 2,
        title: 'Bad URL',
        url: 'javascript:alert(1)',
        type: 'story',
      })
    return Response.json({
      id: 3,
      title: 'Removed',
      url: 'https://example.com/removed',
      type: 'story',
      deleted: true,
    })
  }
  const read = createHeadlineReader(request, () => time)
  const [first, shared] = await Promise.all([read(), read()])
  expect(first).toEqual([
    { id: 1, title: 'Useful headline', url: 'https://example.com/story' },
  ])
  expect(shared).toEqual(first)
  expect(calls).toBe(4)
  expect(await read()).toEqual(first)
  expect(calls).toBe(4)
  time += 15 * 60_000
  failing = true
  expect(await read()).toEqual(first)
  expect(calls).toBe(5)
})
