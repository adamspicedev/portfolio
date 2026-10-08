import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Terminal } from 'lucide-react'
import { formatStoryDate, type StorySummary } from '../lib/story-schema'

export function StoryCard({ story }: { story: StorySummary }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: story.slug }}
      className="story-card group"
    >
      <div className="story-art">
        {story.cover ? (
          <img
            src={story.cover}
            alt={story.coverAlt ?? ''}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="story-terminal">
            <span className="font-mono text-[10px]">
              ~/stories/{story.slug}
            </span>
            <Terminal size={44} strokeWidth={1.4} />
            <span className="font-mono text-xs">curiosity.exe</span>
          </div>
        )}
        <span className="story-arrow">
          <ArrowUpRight size={21} />
        </span>
      </div>
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-wide">
          <time dateTime={story.date}>{formatStoryDate(story.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{story.readingMinutes} min read</span>
        </div>
        <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-tight group-hover:text-cobalt">
          {story.title}
        </h3>
        <p className="mt-3 leading-relaxed text-muted">{story.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {story.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
