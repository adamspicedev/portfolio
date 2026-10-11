import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowUpRight, LoaderCircle, Send } from 'lucide-react'
import { sendContact } from '../lib/contact.functions'
import { contactSchema } from '../lib/contact-schema'

type FormState =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'success' }
  | { kind: 'error'; message: string }

export function Contact() {
  const [state, setState] = useState<FormState>({ kind: 'idle' })
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state.kind === 'sending') return
    const form = event.currentTarget
    const fields = new FormData(form)
    const result = contactSchema.safeParse({
      email: fields.get('email'),
      message: fields.get('message'),
      website: fields.get('website'),
    })
    if (!result.success) {
      setState({
        kind: 'error',
        message:
          result.error.issues[0]?.message ?? 'Check your email and message.',
      })
      return
    }
    setState({ kind: 'sending' })
    try {
      const response = await sendContact({ data: result.data })
      if (response.ok) {
        form.reset()
        setState({ kind: 'success' })
      } else setState({ kind: 'error', message: response.message })
    } catch {
      setState({
        kind: 'error',
        message:
          'Something went wrong sending your message. Email adam@spicey.dev directly.',
      })
    }
  }
  return (
    <section id="contact" className="contact-section section-space">
      <div className="page-width grid gap-12 lg:grid-cols-2 lg:gap-24">
        <div>
          <p className="eyebrow">Got an idea?</p>
          <h2 className="section-title">
            Let's make
            <br />
            something <span className="font-serif italic">good.</span>
          </h2>
          <p className="mt-6 max-w-sm text-lg leading-relaxed">
            A project, a question, or a chat about something you're building. My
            inbox is open.
          </p>
          <a
            className="contact-email mt-9 inline-flex items-center gap-3"
            href="mailto:adam@spicey.dev"
          >
            adam@spicey.dev <ArrowUpRight size={25} />
          </a>
          <div className="mt-10 flex gap-6 font-mono text-xs">
            <a
              className="text-link"
              href="https://github.com/adamspicedev"
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
            <a
              className="text-link"
              href="https://linkedin.com/in/adam-spice"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>
        <form
          onSubmit={submit}
          className="contact-form"
          aria-label="Send Adam a message"
        >
          <div className="form-heading">
            <span className="window-dot" />
            <span className="font-mono text-xs">
              a little hello goes a long way
            </span>
          </div>
          <div className="space-y-5 p-6 sm:p-8">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Your email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder="you@example.com"
                disabled={state.kind === 'sending'}
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium"
              >
                What's on your mind?
              </label>
              <textarea
                id="message"
                name="message"
                required
                minLength={10}
                maxLength={5000}
                rows={4}
                placeholder="Hey Adam…"
                disabled={state.kind === 'sending'}
              />
            </div>
            <div className="honeypot" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <button
              className="button button-dark w-full justify-center"
              type="submit"
              disabled={state.kind === 'sending'}
            >
              {state.kind === 'sending' ? (
                <>
                  Sending…{' '}
                  <LoaderCircle size={17} className="loading-spinner" />
                </>
              ) : (
                <>
                  Send message <Send size={16} />
                </>
              )}
            </button>
            <div aria-live="polite" aria-atomic="true">
              {state.kind === 'success' && (
                <p className="text-sm">
                  Message sent. Thanks for saying hello!
                </p>
              )}
              {state.kind === 'error' && (
                <p className="text-sm text-red-800" role="alert">
                  {state.message}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
