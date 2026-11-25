import { expect, test } from '@playwright/test'

test('handwritten form controls and story cards stay usable at phone widths', async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 320, height: 820 })
  await page.goto('/#contact')
  const email = page.getByLabel('Your email', { exact: true })
  const message = page.getByLabel("What's on your mind?", { exact: true })
  const send = page.getByRole('button', { name: 'Send message' })
  await expect(email).toHaveCSS('font-family', /Margin Notes/)
  for (const control of [email, message, send]) {
    await expect(control).toHaveCSS('border-image-source', /ink-frame/)
  }
  await email.focus()
  await expect(email).toHaveCSS('outline-style', 'solid')
  await expect(send).toBeDisabled()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  )

  await page.goto('/blog')
  await expect(page.locator('.story-card').first()).toHaveCSS(
    'border-image-source',
    /ink-frame/,
  )
  await page.getByRole('link', { name: /It started with a Dragon 32/ }).click()
  await expect(page.locator('.article-prose').first()).toHaveCSS(
    'font-family',
    /Margin Notes/,
  )
  expect((await request.get('/sketch/MarginNotes-Regular.woff2')).ok()).toBe(
    true,
  )
})

test('neighbouring toolbox tags use distinct pen outlines on desktop and mobile', async ({
  page,
  request,
}) => {
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 820 })
    await page.goto('/')
    const tags = page
      .getByRole('list', { name: 'Frontend skills' })
      .getByRole('listitem')
    await expect(tags).toHaveCount(7)
    const outlines = await tags.evaluateAll((items) =>
      items.map((item) => getComputedStyle(item).borderImageSource),
    )
    expect(new Set(outlines).size).toBe(outlines.length)
    for (const outline of outlines) {
      const url = outline.match(/^url\("(.*)"\)$/)?.[1]
      expect(url).toBeDefined()
      if (url) expect((await request.get(url)).ok()).toBe(true)
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width)
  }
})
