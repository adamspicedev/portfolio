import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

async function pauseGameClock(page: Page) {
  const start = new Date('2025-01-01T12:00:00Z')
  await page.clock.install({ time: start })
  await page.clock.pauseAt(new Date(start.getTime() + 60_000))
}

test('the retro computer opens the BASIC game and restores focus on escape', async ({
  page,
}, testInfo) => {
  await pauseGameClock(page)
  await page.goto('/')
  const launch = page.getByRole('button', { name: 'Play Night Shift' })
  await expect(launch).toBeVisible()
  if (testInfo.project.name === 'webkit-mobile') {
    await launch.tap()
  } else {
    await launch.focus()
    await page.keyboard.press('Enter')
  }
  const dialog = page.getByRole('dialog', { name: 'Night Shift' })
  await expect(dialog).toBeVisible()
  await expect(
    dialog.getByRole('button', { name: 'Skip typing' }),
  ).toBeVisible()
  await page.clock.runFor(128)
  await expect(dialog.locator('pre')).toContainText('10 REM NIGHT SHIFT')
  await dialog.getByRole('button', { name: 'Skip typing' }).click()
  await expect(
    dialog.getByRole('img', { name: 'Night Shift roadway' }),
  ).toBeVisible()
  await dialog.getByRole('button', { name: 'Pause game' }).click()
  await expect(
    dialog.getByRole('button', { name: 'Resume game' }),
  ).toBeVisible()
  await dialog.getByRole('button', { name: 'Replay' }).click()
  await expect(dialog.getByText('Score: 0', { exact: true })).toBeVisible()
  if (testInfo.project.name === 'webkit-mobile') {
    await dialog.getByRole('button', { name: 'Close Night Shift' }).tap()
  } else {
    await page.keyboard.press('Escape')
    await expect(launch).toBeFocused()
  }
  await expect(dialog).toHaveCount(0)
})

test('the static computer still launches, without typing under reduced motion', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, context: string, options?: unknown) {
        if (context.startsWith('webgl')) return null
        return Reflect.apply(getContext, this, [context, options])
      },
    })
  })
  await pauseGameClock(page)
  await page.goto('/')
  await expect(page.locator('.computer-illustration')).toBeVisible()
  await page.getByRole('button', { name: 'Play Night Shift' }).click()
  const dialog = page.getByRole('dialog', { name: 'Night Shift' })
  await expect(
    dialog.getByRole('img', { name: 'Night Shift roadway' }),
  ).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Skip typing' })).toHaveCount(
    0,
  )
  const player = dialog.locator('.arcade-player')
  await expect(player).toHaveAttribute('data-lane', '1')
  if (testInfo.project.name === 'webkit-mobile') {
    await dialog.getByRole('button', { name: 'Move left' }).tap()
  } else {
    await expect(
      dialog.getByRole('button', { name: 'Close Night Shift' }),
    ).toBeFocused()
    await page.keyboard.press('ArrowLeft')
  }
  await page.clock.runFor(250)
  await expect(player).toHaveAttribute('data-lane', '0')
})

test('the type-in advances to RUN and starts the game automatically', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await pauseGameClock(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Play Night Shift' }).click()
  const dialog = page.getByRole('dialog', { name: 'Night Shift' })
  await expect(
    dialog.getByRole('button', { name: 'Skip typing' }),
  ).toBeVisible()
  await page.clock.runFor(128)
  await expect(dialog.locator('pre')).toContainText('10 REM NIGHT SHIFT')
  await page.clock.runFor(1672)
  await expect(dialog.locator('pre')).toContainText('RUN')
  await expect(
    dialog.getByRole('button', { name: 'Skip typing' }),
  ).toBeVisible()
  await page.clock.runFor(400)
  await expect(
    dialog.getByRole('img', { name: 'Night Shift roadway' }),
  ).toBeVisible()
  await dialog.getByText('View BASIC source').click()
  await expect(dialog.locator('pre')).toContainText('RUN')
})
