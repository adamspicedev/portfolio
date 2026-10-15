import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
const file = async () => ({
  name: 'cover.webp',
  mimeType: 'image/webp',
  buffer: await readFile('public/images/stories/robots.webp'),
})
test('cover uploader keeps the old URL on failure, supports repeat selection, previews and persists chosen URLs', async ({
  page,
}) => {
  await page.goto('http://127.0.0.1:4174')
  const picker = page.getByLabel('Upload cover', { exact: true })
  await expect(picker).toHaveAttribute(
    'accept',
    'image/jpeg,image/png,image/webp',
  )
  await page.route('**/api/story-images', (route) =>
    route.fulfill({
      status: 503,
      json: { message: 'Unable to store the image. Try again.' },
    }),
  )
  await picker.setInputFiles(await file())
  await expect(page.getByRole('alert')).toContainText('Unable to store')
  await expect(page.getByLabel('Cover image URL')).toHaveValue(
    '/images/stories/robots.webp',
  )
  await page.unroute('**/api/story-images')
  await page.route('https://example.com/cover.webp', async (route) =>
    route.fulfill({ contentType: 'image/webp', body: (await file()).buffer }),
  )
  let finish!: () => void
  const released = new Promise<void>((r) => {
    finish = r
  })
  await page.route('**/api/story-images', async (route) => {
    await released
    await route.fulfill({
      status: 201,
      json: { url: 'https://example.com/cover.webp' },
    })
  })
  await picker.setInputFiles(await file())
  await expect(page.getByRole('button', { name: 'Save draft' })).toBeDisabled()
  await expect(page.getByRole('status')).toContainText(/Uploading|Storing/)
  finish()
  await expect(page.getByLabel('Cover image URL')).toHaveValue(
    'https://example.com/cover.webp',
  )
  await expect(page.getByRole('img', { name: 'A robot' })).toHaveAttribute(
    'src',
    'https://example.com/cover.webp',
  )
  await expect(page.getByRole('status')).toContainText('uploaded')
  await page.screenshot({
    path: 'test-results/cover-upload-desktop.png',
    fullPage: true,
  })
  await page.getByRole('button', { name: 'Save draft' }).click()
  await page.reload()
  await expect(page.getByLabel('Cover image URL')).toHaveValue(
    'https://example.com/cover.webp',
  )
  await expect(page.getByLabel('Cover description (alt text)')).toHaveValue(
    'A robot',
  )
})
test('mobile uploader rejects unsupported/oversized files without sending requests', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('http://127.0.0.1:4174')
  let requests = 0
  page.on('request', (r) => {
    if (r.url().includes('/api/story-images')) requests++
  })
  const picker = page.getByLabel('Upload cover', { exact: true })
  await picker.setInputFiles({
    name: 'x.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg/>'),
  })
  await expect(page.getByRole('alert')).toContainText('JPEG, PNG or WebP')
  await picker.setInputFiles({
    name: 'x.png',
    mimeType: 'image/png',
    buffer: Buffer.alloc(3 * 1024 * 1024 + 1),
  })
  await expect(page.getByRole('alert')).toContainText('3 MB')
  expect(requests).toBe(0)
  await page.screenshot({
    path: 'test-results/cover-upload-mobile.png',
    fullPage: true,
  })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})
