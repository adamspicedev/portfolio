import { test, expect, type Page } from '@playwright/test'

async function fillProject(page: Page) {
  await page.goto('http://127.0.0.1:4177')
  await page.getByRole('button', { name: 'New project' }).click()
  await page.getByLabel('Title', { exact: true }).fill('My new app')
  await page.getByLabel('Description', { exact: true }).fill('A useful app.')
  await page.getByLabel('Category', { exact: true }).fill('Developer tools')
  await page
    .getByLabel('Project URL', { exact: true })
    .fill('https://example.com')
  await page
    .getByLabel('Image URL', { exact: true })
    .fill('/images/storeit.png')
  await page.getByLabel('Tags', { exact: true }).fill('React, TypeScript')
}
test('edits, publishes, archives and restores projects through the editor', async ({
  page,
}) => {
  let saved: Record<string, unknown>
  await page.route('**/fixture/save', async (route) => {
    saved = {
      ...route.request().postDataJSON(),
      id: '91e55acd-22e8-426b-ad63-7a221b7c409e',
      revision: Number(saved?.revision ?? 0) + 1,
      archived: false,
      updatedAt: new Date().toISOString(),
    }
    await route.fulfill({ json: { ok: true, project: saved } })
  })
  await page.route('**/fixture/archive', async (route) => {
    saved = {
      ...saved,
      ...route.request().postDataJSON(),
      revision: Number(saved.revision) + 1,
    }
    await route.fulfill({ json: { ok: true, project: saved } })
  })
  await fillProject(page)
  await page.getByRole('button', { name: 'Save draft' }).click()
  await expect(page.getByText('Saved · revision 1')).toBeVisible()
  await page.getByLabel('Keep as draft').uncheck()
  await page.getByRole('button', { name: 'Save and publish' }).click()
  await expect(page.getByText('Saved · revision 2')).toBeVisible()
  await page.getByRole('button', { name: 'All projects' }).click()
  await expect(page.getByText('Published', { exact: true })).toBeVisible()
  page.on('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Archive My new app' }).click()
  await expect(page.getByRole('heading', { name: 'My new app' })).toHaveCount(0)
  await page.getByRole('button', { name: 'View archive' }).click()
  await page.getByRole('button', { name: 'Restore My new app' }).click()
  await page.getByRole('button', { name: 'Active projects' }).click()
  await page.getByRole('button', { name: 'Edit My new app' }).click()
  await expect(page.getByLabel('Tags', { exact: true })).toHaveValue(
    'React, TypeScript',
  )
  await expect(page.getByLabel('Keep as draft')).not.toBeChecked()
})
test('preserves edits on failed saves and guards against discarding them', async ({
  page,
}) => {
  await page.route('**/fixture/save', (route) =>
    route.fulfill({
      json: {
        ok: false,
        message:
          'This project changed in another tab. Reload it before saving.',
      },
    }),
  )
  await fillProject(page)
  await page.getByRole('button', { name: 'Save draft' }).click()
  await expect(page.getByRole('alert')).toContainText('changed in another tab')
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue(
    'My new app',
  )
  page.once('dialog', (dialog) => dialog.dismiss())
  await page.getByRole('button', { name: 'All projects' }).click()
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue(
    'My new app',
  )
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'All projects' }).click()
  await expect(page.getByRole('button', { name: 'New project' })).toBeVisible()
})
test('disables editing and closing while a save is in flight', async ({
  page,
}) => {
  let finish!: () => void
  const waiting = new Promise<void>((resolve) => {
    finish = resolve
  })
  await page.route('**/fixture/save', async (route) => {
    await waiting
    await route.fulfill({ json: { ok: false, message: 'Try again.' } })
  })
  await fillProject(page)
  await page.getByRole('button', { name: 'Save draft' }).click()
  await expect(
    page.getByRole('button', { name: 'All projects' }),
  ).toBeDisabled()
  await expect(page.getByLabel('Title', { exact: true })).toBeDisabled()
  finish()
  await expect(page.getByLabel('Title', { exact: true })).toBeEnabled()
})

test('published database edits reach the homepage without a rebuild and drafts stay private', async ({
  request,
}) => {
  const { StoryStore, localDatabaseUrl } =
    await import('../src/lib/sqlite-stories.server')
  const store = await StoryStore.connect(
    localDatabaseUrl('.output/test-stories.sqlite'),
  )
  let project = await store.projects.save(
    {
      title: 'Homepage publishing regression',
      description: 'A persisted project edit.',
      category: 'Testing',
      link: 'https://example.com',
      image: '/images/storeit.png',
      imageAlt: 'Project screenshot',
      tags: ['TypeScript'],
      color: 'cobalt',
      position: 9999,
      draft: true,
    },
    'test',
  )
  try {
    expect(await (await request.get('/')).text()).not.toContain(project.title)
    project = await store.projects.save({ ...project, draft: false }, 'test')
    const html = await (await request.get('/')).text()
    expect(html).toContain(project.title)
    expect(html).toContain('Project screenshot')
    project = await store.projects.archive(
      project.id,
      project.revision,
      true,
      'test',
    )
    expect(await (await request.get('/')).text()).not.toContain(project.title)
  } finally {
    if (!project.archived)
      await store.projects.archive(project.id, project.revision, true, 'test')
    await store.close()
  }
})

test('project save and archive endpoints reject callers without administrator access', async ({
  request,
}) => {
  const { readdir } = await import('node:fs/promises')
  const { toJSON } = await import('seroval')
  const directory = '.output/server/_ssr'
  const filename = (await readdir(directory)).find(
    (file) => file.startsWith('projects.functions-') && file.endsWith('.mjs'),
  )
  expect(filename).toBeTruthy()
  const module = await import(`${process.cwd()}/${directory}/${filename}`)
  const inputs = {
    saveCmsProject_createServerFn_handler: {
      title: 'Unauthorized project',
      description: 'Must never appear',
      category: 'Testing',
      link: 'https://example.com',
      image: '/images/storeit.png',
      tags: [],
      color: 'cobalt',
      position: 0,
      draft: false,
    },
    archiveCmsProject_createServerFn_handler: {
      id: '91e55acd-22e8-426b-ad63-7a221b7c409e',
      revision: 1,
      archived: true,
    },
  }
  for (const [name, data] of Object.entries(inputs)) {
    expect(typeof module[name]?.url).toBe('string')
    const response = await request.post(module[name].url, {
      headers: {
        Origin: 'http://127.0.0.1:4173',
        'Sec-Fetch-Site': 'same-origin',
      },
      data: toJSON({ data, context: { userId: 'user_admin' } }),
    })
    expect(await response.text()).toContain('Administrator access required')
  }
  expect(await (await request.get('/')).text()).not.toContain(
    'Unauthorized project',
  )
})
