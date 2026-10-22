import { expect, test } from '@playwright/test'
import type { Route } from '@playwright/test'

const script = `(() => {
let options, container, sequence = 0;
window.fixtureResets = 0;
window.turnstile = {
 render(element, config) {
  options = config; container = element;
  if(config.action !== 'contact' || !['flexible', 'compact'].includes(config.size)) throw new Error('Widget configuration');
  element.innerHTML = '<button type="button">Verify human</button><button type="button">Expire verification</button><button type="button">Verification error</button>';
  element.children[0].style.minWidth = config.size === 'compact' ? '150px' : '300px';
  element.children[0].onclick = () => config.callback('fixture-token-' + ++sequence);
  element.children[1].onclick = () => config['expired-callback']();
  element.children[2].onclick = () => config['error-callback']();
  return 'widget';
 },
 reset() { window.fixtureResets++; },
 remove() { if(container) container.innerHTML = ''; }
};
})();`

test.beforeEach(async ({ page }) => {
  await page.route(
    'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
    (route) => route.fulfill({ contentType: 'text/javascript', body: script }),
  )
  await page.goto('http://127.0.0.1:4176')
  await page.getByLabel('Your email').fill('visitor@example.com')
  await page
    .getByLabel("What's on your mind?")
    .fill('A useful project message.')
})

test('verification gates sending, expiry and errors require a fresh solve', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 })
  const send = page.getByRole('button', { name: 'Send message' })
  await expect(send).toBeDisabled()
  await expect(
    page
      .getByRole('region', { name: 'Human verification' })
      .getByRole('button', { name: 'Verify human', exact: true }),
  ).toHaveCSS('min-width', '150px')
  await page.getByRole('button', { name: 'Verify human', exact: true }).click()
  await expect(send).toBeEnabled()
  await page.getByRole('button', { name: 'Expire verification' }).click()
  await expect(send).toBeDisabled()
  await page.getByRole('button', { name: 'Verify human', exact: true }).click()
  await page.getByRole('button', { name: 'Verification error' }).click()
  await expect(send).toBeDisabled()
  await expect(page.getByRole('status')).toContainText(
    'Verification is unavailable',
  )
  await expect(
    page.getByRole('link', { name: 'adam@spicey.dev' }),
  ).toHaveAttribute('href', 'mailto:adam@spicey.dev')
})

test('failed responses and network errors retain fields and reset tokens; retries succeed once', async ({
  page,
}) => {
  const requests: Array<Record<string, unknown>> = []
  let attempt = 0
  await page.route('**/fixture/contact', async (route) => {
    requests.push(route.request().postDataJSON())
    attempt++
    if (attempt === 1)
      await route.fulfill({
        json: { ok: false, message: 'Please complete verification again.' },
      })
    else if (attempt === 2)
      await route.fulfill({ status: 503, body: 'Unavailable' })
    else await route.fulfill({ json: { ok: true } })
  })
  const send = page.getByRole('button', { name: 'Send message' })
  for (let i = 1; i <= 3; i++) {
    await page
      .getByRole('button', { name: 'Verify human', exact: true })
      .click()
    await send.focus()
    await page.keyboard.press('Enter')
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as unknown as { fixtureResets: number }).fixtureResets,
        ),
      )
      .toBe(i)
    await expect(send).toBeDisabled()
    if (i < 3) {
      await expect(page.getByRole('alert')).toBeVisible()
      await expect(page.getByLabel('Your email')).toHaveValue(
        'visitor@example.com',
      )
      await expect(page.getByLabel("What's on your mind?")).toHaveValue(
        'A useful project message.',
      )
    }
  }
  await expect(
    page.getByText('Message sent. Thanks for saying hello!'),
  ).toBeVisible()
  await expect(page.getByLabel('Your email')).toHaveValue('')
  expect(requests.map((request) => request.turnstileToken)).toEqual([
    'fixture-token-1',
    'fixture-token-2',
    'fixture-token-3',
  ])
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})

test('synchronous repeated submissions send only one request', async ({
  page,
}) => {
  let requests = 0
  let finish!: () => void
  const released = new Promise<void>((resolve) => {
    finish = resolve
  })
  await page.route('**/fixture/contact', async (route) => {
    requests++
    await released
    await route.fulfill({ json: { ok: true } })
  })
  await page.getByRole('button', { name: 'Verify human', exact: true }).click()
  await page.getByRole('form').evaluate((form) => {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  })
  await expect(page.getByRole('button', { name: 'Sending' })).toBeDisabled()
  await expect.poll(() => requests).toBe(1)
  finish()
  await expect(
    page.getByText('Message sent. Thanks for saying hello!'),
  ).toBeVisible()
  expect(requests).toBe(1)
})

test('a blocked verification script keeps sending disabled with an email fallback', async ({
  page,
}) => {
  await page.unroute(
    'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
  )
  await page.route(
    'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
    (route) => route.abort(),
  )
  await page.reload()
  await expect(page.getByRole('status')).toContainText(
    'Verification is unavailable',
  )
  await expect(
    page.getByRole('button', { name: 'Send message' }),
  ).toBeDisabled()
  await expect(
    page.getByRole('link', { name: 'adam@spicey.dev' }),
  ).toHaveAttribute('href', 'mailto:adam@spicey.dev')
})

test('stalled script loading times out and can be retried', async ({
  page,
}) => {
  await page.clock.install()
  await page.unroute(
    'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
  )
  let stalledRoute: Route | undefined
  await page.route(
    'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
    (route) => {
      stalledRoute = route
    },
  )
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(
    page.locator('script[src^="https://challenges.cloudflare.com/turnstile"]'),
  ).toBeAttached()
  await page.clock.runFor(12_100)
  await expect(page.getByRole('status')).toContainText(
    'Verification is unavailable',
  )
  await stalledRoute?.abort().catch(() => {})
  await page.unroute(
    'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
  )
  await page.route(
    'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
    (route) => route.fulfill({ contentType: 'text/javascript', body: script }),
  )
  await page.getByRole('button', { name: 'Retry verification' }).click()
  await page.getByRole('button', { name: 'Verify human', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Send message' })).toBeEnabled()
})

test('provider reset and cleanup exceptions leave a recoverable form', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('**/fixture/contact', (route) =>
    route.fulfill({ json: { ok: false, message: 'Please try again.' } }),
  )
  await page.evaluate(() => {
    const api = (
      window as unknown as {
        turnstile: { reset: () => void; remove: () => void }
      }
    ).turnstile
    api.reset = () => {
      throw new Error('Provider reset failed')
    }
    api.remove = () => {
      throw new Error('Provider cleanup failed')
    }
  })
  await page.getByRole('button', { name: 'Verify human', exact: true }).click()
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByRole('status')).toContainText(
    'Verification is unavailable',
  )
  await expect(page.getByLabel('Your email')).toHaveValue('visitor@example.com')
  await page.getByRole('button', { name: 'Retry verification' }).click()
  await page.getByRole('button', { name: 'Verify human', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Send message' })).toBeEnabled()
  expect(errors).toEqual([])
})
