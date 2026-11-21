import type { Story } from './story-schema'

const graphiteDirectory = '/images/stories/graphite/'
const publicSiteOrigins = new Set([
  'https://spicey.dev',
  'https://www.spicey.dev',
  'http://spicey.dev',
  'http://www.spicey.dev',
])
const legacyBlobOrigin =
  'https://qe4loyyoo2pbcuba.public.blob.vercel-storage.com'

// Keyed by source image, not article slug: an editor can replace a cover without
// the public palette override overriding their new art.
const localCovers = new Map([
  [
    'actions-lockfiles',
    'Puzzle pieces ride a conveyor through a padlock arch beside a dependency diagram.',
  ],
  [
    'ai-coding-agents-git-coordination-20261110',
    'Three small robots feeding code branches into a shared review checkpoint.',
  ],
  [
    'dragon32',
    'A Dragon 32 computer with a dark keyboard and a striped badge.',
  ],
  [
    'local-ai-network-map-20261030',
    'A laptop, cloud and tool tray connected by network cables.',
  ],
  [
    'nodejs-security-production',
    'Software packages move from a laptop through a testing arch to a server.',
  ],
  [
    'passkeys',
    'A key passing through a smartphone surrounded by fingerprint symbols.',
  ],
  [
    'postgresql-19-read-your-writes-replica',
    'Two database stacks linked by a replication track with a clock beside the replica.',
  ],
  ['power', 'A data centre connects to wind turbines and a large power plug.'],
  [
    'quantum',
    'A padlock floating inside a geometric frame with orbiting spheres.',
  ],
  [
    'reviewbench',
    'A robot selects review cards beside a retro computer and comment bubbles.',
  ],
  ['robots', 'A robot arm sorts blocks from a conveyor belt into bins.'],
  [
    'rowberry-workspace-20261023-v1',
    'A database stack, table rows and a branching JSON tree beside a hand placing a tile.',
  ],
  [
    'satellites',
    'A satellite with solar panels floats above a phone on a planet.',
  ],
  [
    'trust-stores',
    'A browser, terminal and container with separate certificate stacks and a robotic arm removing a warning card.',
  ],
])
const blobCovers = new Map([
  [
    '/story-covers/43d7ead6-8c84-46b2-bf16-4c8674bac435.webp',
    'actions-lockfiles',
  ],
  [
    '/story-covers/d8bc4d27-3506-4668-8331-3e5122e1a42b.webp',
    'reading-homework-without-inventing-answers',
  ],
])

function knownCover(cover: string) {
  if (cover.includes('\\') || cover !== cover.trim()) return
  const relative = cover.startsWith('/') && !cover.startsWith('//')
  const rawPath = relative
    ? cover.split(/[?#]/, 1)[0]
    : /^https?:\/\/[^/?#]+(\/[^?#]*)/i.exec(cover)?.[1]
  if (!rawPath) return

  const url = URL.parse(cover, 'https://spicey.dev')
  if (!url || url.username || url.password || url.pathname !== rawPath) return

  if (publicSiteOrigins.has(url.origin)) {
    const basename = /^\/images\/stories\/([a-z0-9-]+)\.webp$/.exec(
      rawPath,
    )?.[1]
    return basename && localCovers.has(basename) ? basename : undefined
  }
  if (url.origin === legacyBlobOrigin) return blobCovers.get(rawPath)
}

export function withGraphiteCover(story: Story): Story {
  const basename = story.cover ? knownCover(story.cover) : undefined
  if (!basename) return story
  return {
    ...story,
    cover: `${graphiteDirectory}${basename}.webp`,
    coverAlt:
      basename === 'reading-homework-without-inventing-answers'
        ? 'A maths worksheet beneath a magnifying glass.'
        : localCovers.get(basename),
  }
}
