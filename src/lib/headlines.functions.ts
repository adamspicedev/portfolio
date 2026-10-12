import { createServerFn } from '@tanstack/react-start'
import { readHeadlines } from './headlines.server'
export const getHeadlines = createServerFn({ method: 'GET' }).handler(() =>
  readHeadlines(),
)
