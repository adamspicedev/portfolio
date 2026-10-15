import { ArrowUpRight, GitMerge } from 'lucide-react'

// Curated from public upstream PRs by adamspicedev; checked 16 October 2026 (NZ).
const contributions = [
  {
    number: 3209,
    title: 'Landscape & portrait overlays',
    description:
      'Added landscape and portrait streaming overlay outputs, with independent URLs and previews.',
    merged: '2026-10-03',
    date: '3 October 2026',
  },
  {
    number: 3207,
    title: 'Simpler overlay setup',
    description:
      'Added overlay token creation and importing existing browser-source URLs, with masked, in-memory credentials.',
    merged: '2026-10-04',
    date: '4 October 2026',
  },
  {
    number: 3213,
    title: 'Camera reconnection',
    description:
      'Added periodic camera reconnection to help recover stalled stream overlays. A recovery mitigation, with existing URLs preserved.',
    merged: '2026-10-01',
    date: '1 October 2026',
  },
]

export function OpenSourceContributions() {
  return (
    <section
      id="open-source"
      aria-label="Open-source contributions"
      className="page-width section-space"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Open-source contributions</p>
          <h2 className="section-title">
            Useful changes.
            <br />
            Shared upstream.
          </h2>
        </div>
        <p className="section-note">
          Contributing to Bambuddy, a self-hosted command center for Bambu Lab
          printers.{' '}
          <a
            className="contribution-license"
            href="https://github.com/maziggy/bambuddy/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
          >
            AGPL-3.0 licensed
          </a>
          .
        </p>
      </div>
      <p className="contributions-snapshot">
        Selected contributions · Status checked{' '}
        <time dateTime="2026-10-16">16 October 2026</time> (New Zealand)
      </p>
      <div className="contribution-grid">
        {contributions.map((contribution) => (
          <article className="contribution-card" key={contribution.number}>
            <div className="contribution-meta">
              <span>Bambuddy</span>
              <span className="contribution-status">
                <GitMerge size={14} aria-hidden="true" />
                Merged
              </span>
            </div>
            <h3>{contribution.title}</h3>
            <p>{contribution.description}</p>
            <div className="contribution-details">
              <p>
                Merged{' '}
                <time dateTime={contribution.merged}>{contribution.date}</time>
              </p>
              <a
                href={`https://github.com/maziggy/bambuddy/pull/${contribution.number}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`View Bambuddy PR #${contribution.number}`}
              >
                View PR #{contribution.number}
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
              {contribution.number === 3209 && (
                <a
                  className="contribution-docs"
                  href="https://github.com/maziggy/bambuddy-wiki/pull/106"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Supporting documentation PR #106"
                >
                  Supporting documentation
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
