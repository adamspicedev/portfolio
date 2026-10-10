import { readdir } from 'node:fs/promises'
import { toJSON } from 'seroval'
import { expect, test } from '@playwright/test'

test('homepage renders on the server and links to the real résumé', async ({
  page,
  request,
}) => {
  const response = await request.get('/')
  expect(response.ok()).toBe(true)
  expect(await response.text()).toContain('I build things')
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'I build thingsfor the web.',
  )
  const homeStories = page.locator('.stories-section a.story-card')
  await expect(homeStories).toHaveCount(6)
  const publicationDates = await homeStories
    .locator('time')
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('datetime')),
    )
  expect(publicationDates).toEqual(
    [...publicationDates].sort((a, b) => (b ?? '').localeCompare(a ?? '')),
  )
  await expect(page.getByRole('link', { name: 'Grab my CV' })).toHaveAttribute(
    'href',
    '/files/AdamSpiceResume.pdf',
  )
  const cv = await request.get('/files/AdamSpiceResume.pdf')
  expect(cv.ok()).toBe(true)
  expect(cv.headers()['content-type']).toContain('application/pdf')
})

test('stories can be searched, filtered and opened with article metadata', async ({
  page,
}) => {
  await page.goto('/blog')
  await page.getByRole('searchbox').fill('no matching story here')
  await expect(page.getByText('No stories match that search.')).toBeVisible()
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await page.getByRole('button', { name: 'Personal', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Personal', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('link', { name: /It started with a Dragon 32/ }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'It started with a Dragon 32',
  )
  await expect(page).toHaveTitle('It started with a Dragon 32 · Adam Spice')
  await expect(page.locator('.article-prose h2')).toHaveCount(2)
})

test('old article URLs redirect and missing stories return a proper 404', async ({
  request,
  page,
}) => {
  const redirect = await request.get('/it-started-with-a-dragon-32', {
    maxRedirects: 0,
  })
  expect(redirect.status()).toBe(301)
  expect(redirect.headers().location).toBe('/blog/it-started-with-a-dragon-32')
  const response = await page.goto('/blog/missing-story')
  expect(response?.status()).toBe(404)
  await expect(
    page.getByRole('heading', { name: /Nothing plugged/ }),
  ).toBeVisible()
})

test('contact form retains a failed message and offers direct email when offline', async ({
  page,
}) => {
  await page.goto('/#contact')
  await page
    .getByLabel('Your email', { exact: true })
    .fill('visitor@example.com')
  const text = 'A message that should stay in the form if sending fails.'
  await page.getByLabel("What's on your mind?", { exact: true }).fill(text)
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('currently offline')
  await expect(
    page.getByLabel("What's on your mind?", { exact: true }),
  ).toHaveValue(text)
  await expect(
    page.getByRole('link', { name: 'adam@spicey.dev' }),
  ).toHaveAttribute('href', 'mailto:adam@spicey.dev')
})

test('3D controls work with the keyboard and remain responsive when resized', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.locator('.computer-canvas canvas')).toHaveCount(1)
  await page
    .getByRole('button', { name: 'Pause animation', exact: true })
    .focus()
  await page.keyboard.press('Space')
  await expect(
    page.getByRole('button', { name: 'Play animation', exact: true }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Rotate computer', exact: true })
    .focus()
  await page.keyboard.press('Enter')
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true)
  }
  expect(errors).toEqual([])
})

test('mobile navigation closes after selection and reduced motion keeps the scene still', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(
    page.getByRole('button', { name: 'Rotate computer', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Pause animation', exact: true }),
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Open navigation' }).click()
  await page.getByRole('link', { name: 'Stories', exact: true }).click()
  await expect(page).toHaveURL(/\/blog\/?$/)
  await expect(
    page.getByRole('button', { name: 'Open navigation' }),
  ).toHaveAttribute('aria-expanded', 'false')
})

test('a lost WebGL context restores the illustration and removes the canvas', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('button', { name: 'Spin computer', exact: true }),
  ).toBeVisible()
  await page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const extension = canvas
      ?.getContext('webgl2')
      ?.getExtension('WEBGL_lose_context')
    if (!extension)
      throw new Error('The test browser must support context loss simulation')
    extension.loseContext()
  })
  await expect(
    page.getByText('Illustration mode', { exact: true }),
  ).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.locator('.computer-illustration')).toBeVisible()
})

test('new technology stories render their covers and source links', async ({
  page,
  request,
}) => {
  const stories = [
    [
      'passkeys-and-the-end-of-password-gymnastics',
      'Passkeys and the end of password gymnastics',
      'passkeys',
    ],
    [
      'post-quantum-security-starts-with-an-inventory',
      'Post-quantum security starts with an inventory',
      'quantum',
    ],
    ['the-robot-boom-has-a-day-job', 'The robot boom has a day job', 'robots'],
    [
      'your-next-mobile-tower-might-be-in-orbit',
      'Your next mobile tower might be in orbit',
      'satellites',
    ],
    ['the-cloud-has-a-power-cable', 'The cloud has a power cable', 'power'],
  ]
  await page.goto('/blog')
  for (const [, title] of stories) {
    await expect(
      page.getByRole('link', { name: new RegExp(title) }),
    ).toBeVisible()
  }
  for (const [slug, title, image] of stories) {
    await page.goto(`/blog/${slug}`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      title ?? '',
    )
    const cover = page.locator('.article-cover')
    await expect(cover).toHaveAttribute('src', `/images/stories/${image}.webp`)
    await expect
      .poll(() =>
        cover.evaluate(
          (element) =>
            element instanceof HTMLImageElement &&
            element.complete &&
            element.naturalWidth > 0,
        ),
      )
      .toBe(true)
    await expect(
      page.locator('.article-prose a[href^="https://"]').first(),
    ).toBeVisible()
    const asset = await request.get(`/images/stories/${image}.webp`)
    expect(asset.ok()).toBe(true)
    expect(asset.headers()['content-type']).toContain('image/webp')
  }
})

test('admin is disabled without Clerk and never exposes stories or editing controls', async ({
  page,
}) => {
  await page.goto('/admin')
  await expect(
    page.getByRole('heading', { name: 'Connect Clerk to get started' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'New story' })).toHaveCount(0)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, nofollow',
  )
})

test('the admin server function rejects cross-site requests', async ({
  page,
  request,
}) => {
  await page.goto('/')
  const rpc = page.waitForRequest((candidate) =>
    new URL(candidate.url()).pathname.startsWith('/_serverFn/'),
  )
  await page.getByRole('link', { name: 'Story studio', exact: true }).click()
  const endpoint = (await rpc).url()
  await expect(
    page.getByRole('heading', { name: 'Connect Clerk to get started' }),
  ).toBeVisible()
  const rejected = await request.get(endpoint, {
    headers: {
      Origin: 'https://untrusted.example',
      'Sec-Fetch-Site': 'cross-site',
    },
  })
  expect(rejected.status()).toBe(403)
  const allowed = await request.get(endpoint, {
    headers: {
      Origin: 'http://127.0.0.1:4173',
      'Sec-Fetch-Site': 'same-origin',
    },
  })
  expect(allowed.ok()).toBe(true)
  expect(await allowed.text()).toContain('setup')
})

test('calling the publishing endpoint directly cannot bypass administrator access', async ({
  request,
}) => {
  const directory = '.output/server/_ssr'
  const filename = (await readdir(directory)).find(
    (file) => file.startsWith('cms.functions-') && file.endsWith('.mjs'),
  )
  if (!filename)
    throw new Error('Build the production application before browser tests.')
  const module: unknown = await import(
    `${process.cwd()}/${directory}/${filename}`
  )
  if (
    !module ||
    typeof module !== 'object' ||
    !('saveCmsStory_createServerFn_handler' in module)
  )
    throw new Error('Missing compiled publishing function')
  const publish = module.saveCmsStory_createServerFn_handler
  if (
    typeof publish !== 'function' ||
    !('url' in publish) ||
    typeof publish.url !== 'string'
  )
    throw new Error('Missing publishing endpoint URL')
  const response = await request.post(publish.url, {
    headers: {
      Origin: 'http://127.0.0.1:4173',
      'Sec-Fetch-Site': 'same-origin',
    },
    data: toJSON({
      data: {
        title: 'Must never be published',
        slug: 'unauthorized-publishing-test',
        description: 'A direct API call must not bypass authentication.',
        date: '2026-10-08',
        tags: [],
        body: 'Unauthorized content.',
        cover: '',
        draft: false,
      },
      context: { userId: 'user_admin' },
    }),
  })
  expect(await response.text()).toContain('Administrator access required')
  const story = await request.get('/blog/unauthorized-publishing-test')
  expect(story.status()).toBe(404)
})

test('crawler HTML includes canonical, sharing metadata and article schema; sitemap lists published stories', async ({
  request,
}) => {
  const response = await request.get('/blog/the-cloud-has-a-power-cable')
  const html = await response.text()
  expect(html).toContain(
    'rel="canonical" href="https://spicey.dev/blog/the-cloud-has-a-power-cable"',
  )
  expect(html).toContain(
    'property="og:image" content="https://spicey.dev/images/stories/power.webp"',
  )
  expect(html).toContain('name="twitter:card" content="summary_large_image"')
  expect(html).toContain('application/ld+json')
  expect(html).toContain('BlogPosting')
  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.status()).toBe(200)
  expect(sitemap.headers()['content-type']).toContain('application/xml')
  expect(await sitemap.text()).toContain(
    'https://spicey.dev/blog/the-cloud-has-a-power-cable',
  )
  expect(await sitemap.text()).not.toContain('/admin')
  const robots = await request.get('/robots.txt')
  expect(await robots.text()).toContain(
    'Sitemap: https://spicey.dev/sitemap.xml',
  )
})

test('public and private routes expose safe server-rendered social previews', async ({
  request,
}) => {
  for (const path of ['/', '/blog']) {
    const response = await request.get(path)
    const html = await response.text()
    expect(response.status()).toBe(200)
    expect(html).toContain(
      'property="og:image" content="https://spicey.dev/images/social-preview.jpg"',
    )
    expect(html).toContain(
      'property="og:image:alt" content="Adam Spice, full-stack developer',
    )
    expect(html).toContain('name="twitter:image:alt"')
    expect(html).toContain('name="robots" content="index, follow"')
  }
  const dragon = await request.get('/blog/it-started-with-a-dragon-32')
  expect(dragon.status()).toBe(200)
  expect(await dragon.text()).toContain(
    'property="og:image" content="https://spicey.dev/images/stories/dragon32.webp"',
  )
  expect(await dragon.text()).toContain(
    'property="og:image:alt" content="A cream Dragon 32 computer',
  )
  for (const path of ['/admin', '/blog/missing-story', '/missing-page']) {
    const html = await (await request.get(path)).text()
    expect(html).toContain('name="robots" content="noindex, nofollow"')
    expect(html).toContain('name="twitter:card" content="summary_large_image"')
    expect(html).not.toContain(
      'property="og:title" content="The cloud has a power cable',
    )
  }
  const article = await (
    await request.get('/blog/the-cloud-has-a-power-cable')
  ).text()
  expect(article).toContain(
    'alt="A blue data centre connects to wind turbines and a large orange power plug."',
  )
  expect(article).toContain(
    'property="og:image:alt" content="A blue data centre connects',
  )
  expect(await (await request.get('/blog')).text()).toContain(
    'alt="A blue data centre connects',
  )
  expect((await request.get('/images/social-preview.jpg')).status()).toBe(200)
})

test('browser and touch icons use the shared site mark', async ({
  request,
}) => {
  const html = await (await request.get('/')).text()
  expect(html).toContain('href="/favicon.svg"')
  expect(html).toContain('href="/favicon-32x32.png"')
  expect(html).toContain('href="/apple-icon-180x180.png"')
  expect(html).toContain('rel="manifest" href="/manifest.json"')
  for (const path of [
    '/favicon.svg',
    '/favicon.ico',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    '/apple-icon-180x180.png',
  ])
    expect((await request.get(path)).status()).toBe(200)
  const manifest = await (await request.get('/manifest.json')).json()
  expect(manifest.name).toBe('Adam Spice')
})

test('homepage entrances respect reduced motion and keep content visible', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.locator('#projects').scrollIntoViewIfNeeded()
  await expect(page.locator('.project-card').first()).toBeVisible()
  expect(
    await page
      .locator('.project-card')
      .first()
      .evaluate((element) => element.getAnimations().length),
  ).toBe(0)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.reload()
  await page.locator('#projects').scrollIntoViewIfNeeded()
  await expect(page.locator('.project-card').first()).toBeVisible()
  await expect
    .poll(() =>
      page
        .locator('.project-card')
        .first()
        .evaluate((element) => ({
          opacity: getComputedStyle(element).opacity,
          animations: element.getAnimations().length,
        })),
    )
    .toEqual({ opacity: '1', animations: 0 })
})
