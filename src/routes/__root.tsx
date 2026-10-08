import { pageSeo } from '../lib/seo'
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Footer, Header, NotFound } from '../components/site-shell'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      ...pageSeo({
        title: 'Page unavailable · Adam Spice',
        description:
          'This page is unavailable. Explore Adam Spice’s portfolio and stories.',
        path: '/',
        index: false,
      }).meta,
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#eee9ff' },
      { property: 'og:site_name', content: 'Adam Spice' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico', sizes: '16x16 32x32 48x48 96x96' },
      {
        rel: 'icon',
        href: '/favicon-32x32.png',
        type: 'image/png',
        sizes: '32x32',
      },
      {
        rel: 'icon',
        href: '/favicon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
      },
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'apple-touch-icon', href: '/apple-icon-180x180.png' },
    ],
  }),
  notFoundComponent: NotFound,
  errorComponent: ({ reset }) => (
    <main id="main-content" className="page-width error-page">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="section-title">A crossed wire.</h1>
      <p className="my-6">We couldn't load this page. Give it another try.</p>
      <button type="button" className="button button-primary" onClick={reset}>
        Try again
      </button>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body id="top">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
        <Scripts />
      </body>
    </html>
  )
}
