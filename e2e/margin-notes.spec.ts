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

test('the admin route uses notebook paper and a pen-framed setup notice', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 820 })
  await page.goto('/admin')
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS(
    'font-family',
    /Margin Notes/,
  )
  await expect(page.locator('body')).toHaveCSS(
    'background-image',
    /repeating-linear-gradient/,
  )
  await expect(page.locator('.cms-notice')).toHaveCSS(
    'border-image-source',
    /ink-frame/,
  )
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, nofollow',
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  )
})

test('project editor has pen-framed inputs and preserves keyboard focus at phone width', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 820 })
  await page.goto('http://127.0.0.1:4177')
  await page.getByRole('button', { name: 'New project' }).click()
  const title = page.getByLabel('Title', { exact: true })
  const save = page.getByRole('button', { name: 'Save draft' })
  for (const control of [title, save]) {
    await expect(control).toHaveCSS('border-image-source', /ink-frame/)
  }
  await expect(save).toHaveCSS('font-family', /Margin Notes/)
  await title.focus()
  await expect(title).toHaveCSS('outline-style', 'solid')
  await title.fill('A new project')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  )
})

test('story editor keeps Markdown legible and previews it in the notebook typeface', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('http://127.0.0.1:4177/story-editor')
  const body = page.getByRole('textbox', { name: 'Story body' })
  await expect(body).toHaveCSS('font-family', /Space Mono/)
  await expect(body).toHaveCSS('border-image-source', /ink-frame-alt/)
  await body.fill('## Notes in the margin')
  await page.getByRole('button', { name: 'Preview', exact: true }).click()
  const preview = page.getByRole('heading', { name: 'Notes in the margin' })
  await expect(preview).toBeVisible()
  await expect(preview).toHaveCSS('font-family', /Margin Notes/)
  await page.getByRole('button', { name: 'Keep writing' }).click()
  await expect(body).toHaveValue('## Notes in the margin')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  )
})
