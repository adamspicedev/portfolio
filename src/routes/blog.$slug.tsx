import { pageSeo, storySeo } from '../lib/seo'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getStory } from '../lib/stories.functions'
import {
  formatStoryDate,
  safeContentUrl,
  slugSchema,
} from '../lib/story-schema'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    if (!slugSchema.safeParse(params.slug).success) throw notFound()
    const story = await getStory({ data: params.slug })
    if (!story) throw notFound()
    return story
  },
  head: ({ loaderData }) =>
    loaderData
      ? storySeo(loaderData)
      : pageSeo({
          title: 'Story unavailable · Adam Spice',
          description:
            'This story is unavailable. Explore Adam Spice’s published stories.',
          path: '/blog',
          index: false,
        }),
  component: Story,
})
function Story() {
  const story = Route.useLoaderData()
  return (
    <main id="main-content" className="article-page">
      <div className="article-width">
        <Link
          to="/blog"
          className="text-link inline-flex items-center gap-2 font-mono text-xs"
        >
          <ArrowLeft size={15} /> All stories
        </Link>
        <header className="article-header">
          <div className="flex flex-wrap gap-3 font-mono text-xs text-muted">
            <time dateTime={story.date}>{formatStoryDate(story.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{story.readingMinutes} min read</span>
          </div>
          <h1>{story.title}</h1>
          <p className="mt-6 text-xl leading-relaxed text-muted">
            {story.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {story.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </header>
        {story.cover && (
          <img
            src={story.cover}
            alt={story.coverAlt ?? ''}
            className="article-cover"
          />
        )}
        <article className="article-prose">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            urlTransform={(url) => safeContentUrl(url) ?? ''}
            components={{
              a: ({ children, href }) => (
                <a
                  href={href}
                  {...(href?.startsWith('http')
                    ? { target: '_blank', rel: 'noreferrer' }
                    : {})}
                >
                  {children}
                </a>
              ),
              img: ({ src, alt }) => (
                <img src={src} alt={alt ?? ''} loading="lazy" />
              ),
              table: ({ children }) => (
                <div className="table-scroll">
                  <table>{children}</table>
                </div>
              ),
            }}
          >
            {story.body}
          </ReactMarkdown>
        </article>
        <div className="article-signoff">
          <img src="/images/avatar.png" alt="" width={50} height={50} />
          <div>
            <p className="font-semibold">Adam Spice</p>
            <p className="text-sm text-muted">Developer. Curious human.</p>
          </div>
          <Link
            to="/"
            hash="contact"
            className="ml-auto text-link"
            aria-label="Say hello to Adam"
          >
            <ArrowUpRight size={24} />
          </Link>
        </div>
        <Link to="/blog" className="button button-outline mt-10">
          <ArrowLeft size={17} /> More stories
        </Link>
      </div>
    </main>
  )
}
