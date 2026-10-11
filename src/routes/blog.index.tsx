import { pageSeo } from '../lib/seo'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { getStories } from '../lib/stories.functions'
import { StoryCard } from '../components/story-card'

export const Route = createFileRoute('/blog/')({
  loader: () => getStories(),
  head: ({ loaderData }) =>
    !loaderData
      ? pageSeo({
          title: 'Page unavailable · Adam Spice',
          description:
            'This page is temporarily unavailable. Please try again.',
          path: '/',
          index: false,
        })
      : pageSeo({
          title: 'Stories · Adam Spice',
          description:
            'Notes on development, things I have learned, and the stories behind the projects.',
          path: '/blog',
        }),
  component: Stories,
})
function Stories() {
  const stories = Route.useLoaderData()
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const tags = [...new Set(stories.flatMap((story) => story.tags))]
  const filtered = stories.filter(
    (story) =>
      (selectedTag === null || story.tags.includes(selectedTag)) &&
      `${story.title} ${story.description} ${story.tags.join(' ')}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  )
  return (
    <main id="main-content" className="page-width blog-index">
      <p className="eyebrow">Notes from the keyboard</p>
      <h1 className="section-title blog-title">
        A curious mind.
        <br />A few <span className="font-serif italic">stories.</span>
      </h1>
      <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
        Things I've learned, things I'm trying, and the occasional detour.
        Welcome to my corner of the web.
      </p>
      <div className="blog-filters">
        <fieldset
          className="flex flex-wrap gap-2"
          aria-label="Filter stories by topic"
        >
          {[null, ...tags].map((tag) => (
            <button
              type="button"
              className={`filter-button ${selectedTag === tag ? 'is-selected' : ''}`}
              key={tag === null ? 'all-stories' : `tag-${tag}`}
              aria-pressed={selectedTag === tag}
              onClick={() => setSelectedTag(tag)}
            >
              {tag ?? 'All stories'}
            </button>
          ))}
        </fieldset>
        <div className="story-search">
          <Search size={17} />
          <label className="sr-only" htmlFor="story-search">
            Search stories
          </label>
          <input
            id="story-search"
            type="search"
            placeholder="Find a story…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>
      <p className="mb-5 font-mono text-xs text-muted" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'story' : 'stories'}
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((story) => (
          <StoryCard key={story.slug} story={story} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="empty-stories">
          <p className="text-xl">No stories match that search.</p>
          <button
            type="button"
            className="button button-outline mt-5"
            onClick={() => {
              setQuery('')
              setSelectedTag(null)
            }}
          >
            Clear filters <X size={16} />
          </button>
        </div>
      )}
    </main>
  )
}
