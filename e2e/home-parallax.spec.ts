import { expect, test } from '@playwright/test'

const readDepth = () => {
  const offset = (selector: string) => {
    const layer = document.querySelector(selector)
    if (!layer) throw new Error(`Missing parallax layer: ${selector}`)
    const transform = getComputedStyle(layer).transform
    return transform === 'none' ? 0 : new DOMMatrix(transform).m42
  }
  return {
    grid: offset('.hero-visual-grid'),
    computer: offset('.hero-visual-object'),
  }
}

test('hero grid and computer move at different rates and honour reduced motion', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Desktop moves the computer as well as its background')
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  expect(await page.evaluate(readDepth)).toEqual({ grid: 0, computer: 0 })

  await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'instant' }))
  await expect
    .poll(() => page.evaluate(readDepth))
    .toEqual({
      grid: 36,
      computer: -9,
    })

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect
    .poll(() => page.evaluate(readDepth))
    .toEqual({
      grid: 0,
      computer: 0,
    })
})

test('narrow viewports move only the decorative layers', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'instant' }))
  await expect
    .poll(() => page.evaluate(readDepth))
    .toEqual({ grid: 12, computer: 0 })

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect
    .poll(() => page.evaluate(readDepth))
    .toEqual({ grid: 0, computer: 0 })
})
