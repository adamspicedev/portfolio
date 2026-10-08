import type { Story } from './story-schema'

export const siteUrl = 'https://spicey.dev'
export const homeTitle = 'Adam Spice · Developer, curious human'
export const homeDescription =
  'Adam Spice is a full-stack developer who enjoys building apps with React and TypeScript. Explore his projects, stories, and the things he is making.'

export function pageSeo({
  title,
  description,
  path,
  image = '/images/avatar.png',
  article = false,
}: {
  title: string
  description: string
  path: string
  image?: string
  article?: boolean
}) {
  const url = new URL(path, siteUrl).href
  const imageUrl = new URL(image, siteUrl).href
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: article ? 'article' : 'website' },
      { property: 'og:url', content: url },
      { property: 'og:image', content: imageUrl },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}

// Escape HTML delimiters even when a title contains a closing script tag.
export function jsonLd(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}
export function storySeo(story: Story) {
  const description = story.seoDescription || story.description
  const url = `${siteUrl}/blog/${story.slug}`
  return {
    ...pageSeo({
      title: `${story.seoTitle || story.title} · Adam Spice`,
      description,
      path: `/blog/${story.slug}`,
      image: story.cover || '/images/avatar.png',
      article: true,
    }),
    scripts: [
      {
        type: 'application/ld+json',
        children: jsonLd({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: story.title,
          description,
          mainEntityOfPage: url,
          url,
          datePublished: story.date,
          ...(story.updatedAt ? { dateModified: story.updatedAt } : {}),
          image: [new URL(story.cover || '/images/avatar.png', siteUrl).href],
          author: { '@type': 'Person', name: 'Adam Spice', url: siteUrl },
        }),
      },
    ],
  }
}
export function xmlEscape(value: string) {
  return value.replace(
    /[<>&"']/g,
    (character) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[character] ?? character,
  )
}
export function sitemapXml(stories: { slug: string; updatedAt?: string }[]) {
  const entries = [
    { path: '/' },
    { path: '/blog' },
    ...stories.map((story) => ({
      path: `/blog/${story.slug}`,
      updatedAt: story.updatedAt,
    })),
  ]
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map((entry) => `<url><loc>${xmlEscape(siteUrl + entry.path)}</loc>${'updatedAt' in entry && entry.updatedAt ? `<lastmod>${xmlEscape(entry.updatedAt)}</lastmod>` : ''}</url>`).join('')}</urlset>`
}
