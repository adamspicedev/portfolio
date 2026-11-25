const directory = '/images/stories/graphite/'
const covers = new Map<string, [name: string, alt: string]>([
  [
    'actions-lockfiles',
    ['lockfiles', 'Puzzle pieces move along a conveyor towards a lock.'],
  ],
  [
    'ai-coding-agents-git-coordination-20261110',
    [
      'git',
      'A hand-drawn Git graph splits into and reconnects several branches.',
    ],
  ],
  ['dragon32', ['dragon', 'A notebook sketch of a Dragon 32 computer.']],
  [
    'local-ai-network-map-20261030',
    [
      'local-ai',
      'A laptop, a cloud and a tray of tools joined by network lines.',
    ],
  ],
  [
    'nodejs-security-production',
    [
      'node',
      'A package passes through a verification gate between a laptop and a server.',
    ],
  ],
  ['passkeys', ['passkey', 'An ink drawing of a padlock with a keyhole.']],
  [
    'postgresql-19-read-your-writes-replica',
    ['postgres', 'Two database stacks with arrows in both directions.'],
  ],
  [
    'power',
    [
      'power',
      'A data centre connects to wind turbines and a large power plug.',
    ],
  ],
  [
    'quantum',
    [
      'quantum',
      'A padlock inside a geometric wireframe with an orbit around it.',
    ],
  ],
  [
    'reading-homework-without-inventing-answers',
    [
      'homework',
      'A magnifying glass with a question mark beside a maths worksheet.',
    ],
  ],
  [
    'reviewbench',
    [
      'reviewbench',
      'A robot checks a computer screen and stacks review cards.',
    ],
  ],
  ['robots', ['robots', 'A robot arm sorts blocks on a conveyor belt.']],
  [
    'rowberry-workspace-20261023-v1',
    ['rowberry', 'A database workspace with a sidebar and a table of rows.'],
  ],
  [
    'satellites',
    ['satellites', 'A satellite sends a signal towards a phone on Earth.'],
  ],
  [
    'trust-stores',
    [
      'trust',
      'A browser, terminal and container connect to three separate certificate cards.',
    ],
  ],
])

// Select a display illustration for known artwork, not for a story slug.
// A new CMS image is therefore respected and social previews remain unchanged.
export function sketchCover(cover?: string) {
  if (!cover?.startsWith(directory) || !cover.endsWith('.webp')) return
  const drawing = covers.get(cover.slice(directory.length, -5))
  if (!drawing) return
  const [name, alt] = drawing
  return { src: `/sketch/sketch-${name}.svg`, alt }
}
