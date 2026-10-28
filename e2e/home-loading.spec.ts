import { expect, test } from '@playwright/test'

test('homepage renders and stays usable while headlines are stalled, then recovers', async ({
  page,
}) => {
  let release!: () => void
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  let requested = false
  await page.route('**/api/headlines', async (route) => {
    requested = true
    await pending
    await route.fulfill({
      json: [
        { id: 1, title: 'A fresh headline', url: 'https://example.com/story' },
      ],
    })
  })
  try {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' })
    expect(response?.ok()).toBe(true)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect.poll(() => requested).toBe(true)
    await expect(page.getByText('Loading the latest headlines…')).toBeVisible()
    await page.getByRole('link', { name: 'Explore my work' }).click()
    await expect(page).toHaveURL(/#projects$/)
  } finally {
    release()
  }
  await expect(
    page.getByRole('link', { name: 'A fresh headline' }).first(),
  ).toHaveAttribute('href', 'https://example.com/story')
})

test('headline failure leaves the portfolio and Hacker News link available', async ({
  page,
}) => {
  await page.route('**/api/headlines', (route) =>
    route.fulfill({ status: 503 }),
  )
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(
    page.getByText('Headlines are taking a breather.', { exact: false }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'HN HEADLINES' }),
  ).toHaveAttribute('href', 'https://news.ycombinator.com/')
})
