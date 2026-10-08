import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createCsrfMiddleware, createStart } from '@tanstack/react-start'
import { validClerkConfiguration } from './lib/clerk-config'

const csrf = createCsrfMiddleware({
  filter: (context) => context.handlerType === 'serverFn',
})
export const startInstance = createStart(() => ({
  requestMiddleware: [
    csrf,
    ...(validClerkConfiguration(
      process.env.VITE_CLERK_PUBLISHABLE_KEY,
      process.env.CLERK_SECRET_KEY,
    )
      ? [
          clerkMiddleware({
            publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
          }),
        ]
      : []),
  ],
}))
