import { createServerFn } from '@tanstack/react-start'
import { contactSchema } from './contact-schema'
import { deliverContact } from './contact.server'

export const sendContact = createServerFn({ method: 'POST' })
  .validator((input: unknown) => contactSchema.parse(input))
  .handler(({ data }) => deliverContact(data))
