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
