import { pageSeo } from '../lib/seo'
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { PostHogErrorBoundary, PostHogProvider } from 'posthog-js/react'
import { useEffect, type ReactNode } from 'react'
import { usePostHog } from 'posthog-js/react'
import { reportHandledError } from '../lib/client-telemetry'
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
  errorComponent: RouteError,
  shellComponent: RootDocument,
})

function RouteError({ error, reset }: { error: unknown; reset: () => void }) {
  const posthog = usePostHog()
  useEffect(() => {
    reportHandledError(posthog, error, 'route')
  }, [posthog, error])
  return (
    <main id="main-content" className="page-width error-page">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="section-title">A crossed wire.</h1>
      <p className="my-6">We couldn't load this page. Give it another try.</p>
      <button type="button" className="button button-primary" onClick={reset}>
        Try again
      </button>
    </main>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  const apiKey = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN
  const apiHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST

  if (!apiKey) {
    if (import.meta.env.DEV) {
      throw new Error(
        'VITE_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_PUBLIC_POSTHOG_PROJECT_TOKEN is configured',
      )
    }

    return <DocumentContent>{children}</DocumentContent>
  }

  if (!apiHost) {
    if (import.meta.env.DEV) {
      throw new Error(
        'VITE_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_PUBLIC_POSTHOG_HOST is configured',
      )
    }

    return <DocumentContent>{children}</DocumentContent>
  }

  return (
    <PostHogProvider
      apiKey={apiKey}
      options={{
        api_host: apiHost,
        capture_exceptions: true,
        defaults: '2025-05-24',
        debug: import.meta.env.DEV,
        logs: {
          serviceName: 'spicey-portfolio-web',
          environment: import.meta.env.MODE,
        },
      }}
    >
      <PostHogErrorBoundary>
        <DocumentContent>{children}</DocumentContent>
      </PostHogErrorBoundary>
    </PostHogProvider>
  )
}

function DocumentContent({ children }: { children: ReactNode }) {
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
