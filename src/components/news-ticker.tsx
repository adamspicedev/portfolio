import { Asterisk } from 'lucide-react'
import type { Headline } from '../lib/headlines.server'

export function NewsTicker({ headlines }: { headlines: Headline[] }) {
  return (
    <aside
      className="skills-ribbon news-ticker"
      aria-label="Hacker News headlines"
    >
      <a
        className="ticker-source font-mono"
        href="https://news.ycombinator.com/"
        target="_blank"
        rel="noreferrer"
      >
        HN HEADLINES ↗
      </a>
      {headlines.length ? (
        <div
          className="ticker-window"
          aria-label="Headlines: focus to pause scrolling"
        >
          <div className="ticker-track">
            {[false, true].map((duplicate) => (
              <div
                className="ticker-group"
                key={String(duplicate)}
                aria-hidden={duplicate || undefined}
              >
                {headlines.map((headline) => (
                  <span className="ticker-item" key={headline.id}>
                    <Asterisk aria-hidden="true" />
                    <a
                      href={headline.url}
                      target="_blank"
                      rel="noreferrer"
                      tabIndex={duplicate ? -1 : undefined}
                    >
                      {headline.title}
                    </a>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="ticker-fallback font-mono">
          Headlines are taking a breather. Visit Hacker News for the latest.
        </p>
      )}
    </aside>
  )
}
