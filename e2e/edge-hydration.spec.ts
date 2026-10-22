import { expect, test } from '@playwright/test'

// Model Cloudflare's documented email transform and no-transform exemption.
// Production WebKit reproduces #418 with the rewritten email; restoring only
// that markup removes the error, with the same HTML/data/JavaScript otherwise.
test('homepage keeps its email markup intact through an edge proxy and hydration', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  let protectedResponse = false
  await page.route('**/*', async (route) => {
    if (!route.request().isNavigationRequest()) return route.continue()
    const response = await route.fetch()
    let html = await response.text()
    protectedResponse = /(?:^|,)\s*no-transform\s*(?:,|$)/i.test(
      response.headers()['cache-control'] ?? '',
    )
    if (!protectedResponse) {
      html = html
        .replace(
          'href="mailto:adam@spicey.dev"',
          'href="/cdn-cgi/l/email-protection#test"',
        )
        .replace(
          'adam@spicey.dev</a>',
          '<span class="__cf_email__">[email&#160;protected]</span></a>',
        )
      // The contact email is followed by an icon, not the closing anchor.
      html = html.replace(
        'adam@spicey.dev <svg',
        '<span class="__cf_email__">[email&#160;protected]</span> <svg',
      )
    }
    await route.fulfill({ response, body: html })
  })
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(page.locator('.contact-email')).toHaveText('adam@spicey.dev')
  await expect(page.locator('.contact-email')).toHaveAttribute(
    'href',
    'mailto:adam@spicey.dev',
  )
  expect(protectedResponse).toBe(true)
  expect(errors.filter((error) => /418|hydration/i.test(error))).toEqual([])
})
