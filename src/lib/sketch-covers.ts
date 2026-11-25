const covers = new Map([
  ['it-started-with-a-dragon-32', '/sketch/sketch-dragon.svg'],
  ['postgresql-19-read-your-writes-replica', '/sketch/sketch-postgres.svg'],
  ['ai-didnt-kill-git-it-changed-the-traffic', '/sketch/sketch-git.svg'],
  ['passkeys-and-the-end-of-password-gymnastics', '/sketch/sketch-passkey.svg'],
])

export function sketchCover(slug: string): string | undefined {
  return covers.get(slug)
}
