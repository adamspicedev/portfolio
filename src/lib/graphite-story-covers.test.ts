import { expect, test } from 'bun:test'
import { withGraphiteCover } from './graphite-story-covers'
import type { Story } from './story-schema'

function story(cover?: string): Story {
  return {
    slug: 'a-story',
    title: 'A story',
    date: '2020-01-01',
    description: 'A description.',
    cover,
    coverAlt: 'The editor’s original alt text.',
    tags: [],
    draft: false,
    body: 'Article body with its own artwork.',
    readingMinutes: 1,
  }
}

test('the public cover changes only for the same known source image', () => {
  for (const source of [
    '/images/stories/power.webp',
    '/images/stories/power.webp?v=2#credit',
    'https://spicey.dev/images/stories/power.webp?v=2',
    'https://www.spicey.dev/images/stories/power.webp?v=2',
  ]) {
    const original = story(source)
    expect(withGraphiteCover(original)).toEqual({
      ...original,
      cover: '/images/stories/graphite/power.webp',
      coverAlt:
        'A data centre connects to wind turbines and a large power plug.',
    })
    expect(original.cover).toBe(source)
    expect(original.coverAlt).toBe('The editor’s original alt text.')
  }
})

test('only the two verified legacy Blob cover paths are remapped', () => {
  const prefix =
    'https://qe4loyyoo2pbcuba.public.blob.vercel-storage.com/story-covers/'
  expect(
    withGraphiteCover(
      story(prefix + '43d7ead6-8c84-46b2-bf16-4c8674bac435.webp'),
    ).cover,
  ).toBe('/images/stories/graphite/actions-lockfiles.webp')
  expect(
    withGraphiteCover(
      story(prefix + 'd8bc4d27-3506-4668-8331-3e5122e1a42b.webp?rev=2'),
    ),
  ).toMatchObject({
    cover:
      '/images/stories/graphite/reading-homework-without-inventing-answers.webp',
    coverAlt: 'A maths worksheet beneath a magnifying glass.',
  })
  const unknown = story(prefix + '75fbe1cb-eadc-4eac-aebc-e60aa5df377d.webp')
  expect(withGraphiteCover(unknown)).toBe(unknown)
})

test('a new CMS cover, unapproved origin or differently spelled path is not overridden', () => {
  for (const cover of [
    undefined,
    '',
    '/images/stories/new-cover.webp',
    '/images/stories/graphite/power.webp',
    '/images/projects/power.webp',
    '/images/stories/old/../power.webp',
    '/images/stories/Power.webp',
    '/images/stories/%70ower.webp',
    'https://images.example.org/images/stories/power.webp',
    'https://spicey.dev.evil.test/images/stories/power.webp',
    'https://spicey.dev@evil.test/images/stories/power.webp',
    'https://example.org@spicey.dev/images/stories/power.webp',
    'https://spicey.dev:4200/images/stories/power.webp',
    '//spicey.dev/images/stories/power.webp',
  ]) {
    const input = { ...story(cover), slug: 'the-cloud-has-a-power-cable' }
    expect(withGraphiteCover(input)).toBe(input)
  }
})
