import { expect, test } from '@playwright/test'

test('project cards lead to case studies with screenshots and live links', async ({
  page,
  request,
}) => {
  await page.goto('/#projects')
  const cards = page.locator('#projects .project-card').filter({
    has: page.getByRole('heading', { name: 'Rowberry', exact: true }),
  })
  const count = await cards.count()
  expect(count).toBeGreaterThan(0)
  for (let i = 0; i < count; i++) {
    await page.goto('/#projects')
    const card = cards.nth(i)
    const title = await card.locator('h3').innerText()
    const liveUrl = await card
      .getByRole('link', { name: 'Visit project website' })
      .getAttribute('href')
    await card
      .getByRole('link', { name: 'Read case study', exact: false })
      .last()
      .click()
    await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
    for (const name of [
      'The problem',
      'My contribution',
      'Key decisions',
      'Results',
    ])
      await expect(
        page.getByRole('heading', { name, exact: true }),
      ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Visit project website' }),
    ).toHaveAttribute('href', liveUrl!)
    const screenshot = page.locator('article img')
    await screenshot.scrollIntoViewIfNeeded()
    await expect
      .poll(() =>
        screenshot.evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
      )
      .toBe(true)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      page.url().replace('http://127.0.0.1:4173', 'https://spicey.dev'),
    )
    expect(await (await request.get('/sitemap.xml')).text()).toContain(
      new URL(page.url()).pathname,
    )
    await page.setViewportSize({ width: 390, height: 844 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
  expect((await request.get('/projects/not-an-id')).status()).toBe(404)
  expect(
    (
      await request.get('/projects/00000000-0000-4000-8000-000000000000')
    ).status(),
  ).toBe(404)
})
