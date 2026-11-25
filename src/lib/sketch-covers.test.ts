import { expect, test } from 'bun:test'
import { sketchCover } from './sketch-covers'

test('selects sketches for the known public cover images', () => {
  expect(sketchCover('/images/stories/graphite/power.webp')?.src).toBe(
    '/sketch/sketch-power.svg',
  )
  expect(sketchCover('/images/stories/graphite/passkeys.webp')?.src).toBe(
    '/sketch/sketch-passkey.svg',
  )
})

test('leaves replacement covers and missing artwork alone', () => {
  expect(sketchCover(undefined)).toBeUndefined()
  expect(sketchCover('/images/stories/my-new-cover.webp')).toBeUndefined()
  expect(
    sketchCover('https://example.com/images/stories/graphite/power.webp'),
  ).toBeUndefined()
})
