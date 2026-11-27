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

test('handwritten hero text keeps at least 6:1 contrast on paper', async ({
  page,
}) => {
  await page.goto('/')
  const readings = await page.evaluate(() => {
    function luminance(color: string) {
      const rgb = color
        .match(/\d+(?:\.\d+)?/g)
        ?.slice(0, 3)
        .map(Number)
      if (!rgb || rgb.length !== 3)
        throw new Error(`Unexpected colour: ${color}`)
      const [r, g, b] = rgb.map((value) => {
        const channel = value / 255
        return channel <= 0.04045
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    const paper = luminance(getComputedStyle(document.body).backgroundColor)
    return [
      '.hero-index',
      '.hero-intro span',
      '.hero-description',
      '.hero-footnote',
      '.hero-visual-frame',
      '.hero-visual .scene-label',
      '.hero-visual .scene-hint',
    ].map((selector) => {
      const text = document.querySelector(selector)
      if (!text) throw new Error(`Missing hero text: ${selector}`)
      const ink = luminance(getComputedStyle(text).color)
      return {
        selector,
        ratio: (Math.max(paper, ink) + 0.05) / (Math.min(paper, ink) + 0.05),
      }
    })
  })
  for (const { selector, ratio } of readings) {
    expect(ratio, selector).toBeGreaterThanOrEqual(6)
  }
})
