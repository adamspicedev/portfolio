import type {
  ContactInput,
  ContactResult,
} from '../../../src/lib/contact-schema'
export async function sendContact({
  data,
}: {
  data: ContactInput
}): Promise<ContactResult> {
  const response = await fetch('/fixture/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Fixture network error')
  return response.json()
}
