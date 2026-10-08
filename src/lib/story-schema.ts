import { z } from 'zod'
import type { StoryMetadata } from './story-parser.server'

export type Story = StoryMetadata & {
  slug: string
  body: string
  seoTitle?: string
  seoDescription?: string
  updatedAt?: string
  readingMinutes: number
}
export type StorySummary = Omit<Story, 'body' | 'draft'>

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(120)
export function safeContentUrl(url: string) {
  if (url.startsWith('/') && !url.startsWith('//') && !url.includes('\\'))
    return url
  if (/^https?:\/\//i.test(url)) return url
  return undefined
}

export function publicationDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function publishedStories(stories: Story[], today = publicationDate()) {
  return stories
    .filter((story) => !story.draft && story.date <= today)
    .sort(
      (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
    )
}

export function summarizeStory({
  body: _body,
  draft: _draft,
  ...summary
}: Story): StorySummary {
  return summary
}

export function formatStoryDate(date: string) {
  return new Intl.DateTimeFormat('en-NZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}
