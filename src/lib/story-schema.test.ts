import { parseStory } from './story-parser.server'
import { describe, expect, it } from 'bun:test'
import {
  formatStoryDate,
  publicationDate,
  publishedStories,
  safeContentUrl,
  summarizeStory,
} from './story-schema'

function source(fields = '', body = 'A real story.') {
  return `---\ntitle: "A story"\ndate: 2026-10-08\ndescription: "A description"\n${fields}---\n\n${body}`
}
describe('story publishing', () => {
  it('parses unquoted calendar dates, filenames, and reading time', () => {
    const story = parseStory(
      '/content/stories/my-story.md',
      source('tags: [React, Personal]\n', Array(450).fill('word').join(' ')),
    )
    expect(story).toMatchObject({
      slug: 'my-story',
      date: '2026-10-08',
      draft: false,
      readingMinutes: 3,
      tags: ['React', 'Personal'],
    })
    expect(summarizeStory(story)).not.toHaveProperty('body')
    expect(summarizeStory(story)).not.toHaveProperty('draft')
  })
  it('rejects malformed metadata, invalid dates, unsafe covers, and invalid slugs', () => {
    expect(() =>
      parseStory('bad.md', source().replace('2026-10-08', '2026-02-30')),
    ).toThrow('Use a real calendar date')
    expect(() =>
      parseStory('bad.md', source().replace('title: "A story"', 'title: ""')),
    ).toThrow('title')
    expect(() =>
      parseStory('bad.md', source('cover: "javascript:alert(1)"\n')),
    ).toThrow('Use a local path or an HTTP(S) image URL')
    expect(() => parseStory('Bad Story.md', source())).toThrow('Invalid string')
  })
  it('hides drafts and scheduled stories, and orders published dates newest first', () => {
    const stories = [
      parseStory('published.md', source()),
      parseStory('draft.md', source('draft: true\n')),
      parseStory('later.md', source().replace('2026-10-08', '2026-10-09')),
      parseStory('earlier.md', source().replace('2026-10-08', '2026-10-01')),
    ]
    expect(
      publishedStories(stories, '2026-10-08').map((story) => story.slug),
    ).toEqual(['published', 'earlier'])
  })
  it('uses the Auckland publication day and keeps display dates timezone independent', () => {
    expect(publicationDate(new Date('2026-10-07T23:00:00Z'))).toBe('2026-10-08')
    expect(formatStoryDate('2026-10-08')).toBe('8 Oct 2026')
  })
  it('allows local and HTTP(S) media while blocking executable and protocol-relative URLs', () => {
    for (const url of [
      'javascript:alert(1)',
      'data:text/html,evil',
      '//evil.test/file',
      '/\\evil.test',
    ])
      expect(safeContentUrl(url)).toBeUndefined()
    expect(safeContentUrl('/images/avatar.png')).toBe('/images/avatar.png')
    expect(safeContentUrl('https://example.com/image.png')).toBe(
      'https://example.com/image.png',
    )
  })
})
