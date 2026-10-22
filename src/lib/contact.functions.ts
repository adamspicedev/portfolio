import { createServerFn } from '@tanstack/react-start'
import { contactSchema } from './contact-schema'
import { getRequest } from '@tanstack/react-start/server'
import { trustedContactIp } from './contact-ip.server'
import { deliverContact } from './contact.server'

export const sendContact = createServerFn({ method: 'POST' })
  .validator((input: unknown) => contactSchema.parse(input))
  .handler(({ data }) =>
    deliverContact(
      data,
      trustedContactIp(getRequest().headers, process.env.VERCEL === '1'),
    ),
  )
