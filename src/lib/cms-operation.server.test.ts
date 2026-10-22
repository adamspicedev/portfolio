import { afterEach, expect, mock, spyOn, test } from 'bun:test'
import * as telemetry from './posthog-logs.server'
import { DuplicateSlug, StoryConflict } from './sqlite-stories.server'
import { runCmsOperation } from './cms-operation.server'
afterEach(() => mock.restore())

test('unexpected CMS failures emit static context and preserve the safe response', async () => {
  const log = spyOn(telemetry, 'logPostHogServer').mockResolvedValue(true)
  const result = await runCmsOperation('save', async () => {
    throw new Error('private draft credentials')
  })
  expect(result).toEqual({
    ok: false,
    message: 'Unable to save the story. Your edits are still here. Try again.',
  })
  expect(log).toHaveBeenCalledWith({
    body: 'CMS operation failed',
    severity: 'error',
    attributes: { operation: 'save' },
  })
  expect(JSON.stringify(log.mock.calls)).not.toContain('private')
})
test('expected conflicts remain actionable and do not report errors', async () => {
  const log = spyOn(telemetry, 'logPostHogServer').mockResolvedValue(true)
  for (const error of [new StoryConflict(), new DuplicateSlug()]) {
    expect(
      await runCmsOperation('save', async () => {
        throw error
      }),
    ).toEqual({ ok: false, message: error.message })
  }
  expect(log).not.toHaveBeenCalled()
})
test('logging failure cannot change the safe CMS failure response', async () => {
  spyOn(telemetry, 'logPostHogServer').mockImplementation(() => {
    throw new Error('SDK')
  })
  expect(
    await runCmsOperation('archive', async () => {
      throw new Error('private')
    }),
  ).toEqual({ ok: false, message: 'Unable to update the story. Try again.' })
})
