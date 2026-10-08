import { createServerFn } from '@tanstack/react-start'
import { slugSchema } from './story-schema'
import { findStory, listStories } from './stories.server'

export const getStories = createServerFn({ method: 'GET' }).handler(() =>
  listStories(),
)
export const getStory = createServerFn({ method: 'GET' })
  .validator((input: unknown) => slugSchema.parse(input))
  .handler(({ data }) => findStory(data))
