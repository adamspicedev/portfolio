import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from '@tanstack/react-start'
import { validClerkConfiguration } from './lib/clerk-config'
import {
  applyPublicPageCache,
  isPublicPageRequest,
} from './lib/public-page-cache'

const csrf = createCsrfMiddleware({
  filter: (context) => context.handlerType === 'serverFn',
})
export const startInstance = createStart(() => {
  const authentication = validClerkConfiguration(
    process.env.VITE_CLERK_PUBLISHABLE_KEY,
    process.env.CLERK_SECRET_KEY,
  )
    ? clerkMiddleware({
        publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
      })
    : undefined
  const session = createMiddleware().server((options) => {
    if (
      !authentication ||
      isPublicPageRequest(options.request, options.handlerType)
    )
      return options.next()
    return authentication.options.server!(options)
  })
  const publicCache = createMiddleware().server(
    async ({ request, handlerType, next }) => {
      const result = await next()
      applyPublicPageCache(request, result.response, handlerType)
      return result
    },
  )
  return { requestMiddleware: [csrf, publicCache, session] }
})
