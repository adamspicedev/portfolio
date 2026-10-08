import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Footer, Header, NotFound } from '../components/site-shell'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Adam Spice · Developer, curious human' },
      {
        name: 'description',
        content:
          'Adam Spice is a full-stack developer who enjoys building apps with React and TypeScript. Explore his projects, stories, and the things he is making.',
      },
      { name: 'theme-color', content: '#eee9ff' },
      { property: 'og:site_name', content: 'Adam Spice' },
      { property: 'og:type', content: 'website' },
      {
        property: 'og:title',
        content: 'Adam Spice · Developer, curious human',
      },
      {
        property: 'og:description',
        content:
          'Full-stack apps, stories from the keyboard, and a little spice.',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
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
