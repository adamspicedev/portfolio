import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useBlocker } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { editorSchema, type CmsStory } from '../lib/cms-schema'
import { saveCmsStory } from '../lib/cms.functions'
import { publicationDate, safeContentUrl } from '../lib/story-schema'

export function CmsEditor({
  story,
  onSaved,
  onClose,
}: {
  story?: CmsStory
  onSaved: (story: CmsStory) => void
  onClose: () => void
}) {
  const initial = {
    seoTitle: story?.seoTitle ?? '',
    seoDescription: story?.seoDescription ?? '',
    title: story?.title ?? '',
    slug: story?.slug ?? '',
    description: story?.description ?? '',
    date: story?.date ?? publicationDate(),
    tags: story?.tags.join(', ') ?? '',
    cover: story?.cover ?? '',
    body: story?.body ?? '',
    draft: story?.draft ?? true,
  }
  const [form, setForm] = useState(initial)
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const dirty = JSON.stringify(form) !== JSON.stringify(initial)
  useBlocker({
    shouldBlockFn: () =>
      dirty && !window.confirm('Discard your unsaved changes?'),
    enableBeforeUnload: dirty,
  })
  function close() {
    if (!dirty || window.confirm('Discard your unsaved changes?')) onClose()
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setMessage('')
    const parsed = editorSchema.safeParse({
      ...form,
      id: story?.id,
      revision: story?.revision,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    })
    if (!parsed.success) {
      setMessage(parsed.error.issues.map((issue) => issue.message).join('. '))
      return
    }
    setSaving(true)
    try {
      const result = await saveCmsStory({ data: parsed.data })
      if (result.ok) onSaved(result.story)
      else setMessage(result.message)
    } catch {
      setMessage(
        'Unable to save. Check your connection and sign-in, then try again. Your edits are still here.',
      )
    } finally {
      setSaving(false)
    }
  }
  return (
    <section aria-label="Story editor">
      {story && (
        <p className="font-mono text-xs text-muted">
          Saved{' '}
          {new Intl.DateTimeFormat('en-NZ', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Pacific/Auckland',
          }).format(new Date(story.updatedAt))}{' '}
          · revision {story.revision}
        </p>
      )}
      <div className="cms-toolbar">
        <button type="button" className="text-link" onClick={close}>
          ← All stories
        </button>
        {story &&
          !story.draft &&
          !story.archived &&
          story.date <= publicationDate() && (
            <Link
              to="/blog/$slug"
              params={{ slug: story.slug }}
              className="text-link"
              target="_blank"
            >
              View story ↗
            </Link>
          )}
      </div>
      <h2 className="cms-heading">
        {story ? 'Edit story' : 'Something worth sharing.'}
      </h2>
      <form onSubmit={submit} className="cms-editor">
        <div className="cms-fields">
          <label>
            Title
            <input
              required
              maxLength={160}
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
            />
          </label>
          <label>
            Slug
            <input
              required
              maxLength={120}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              value={form.slug}
              placeholder="a-good-story"
              aria-label="Slug"
              aria-describedby="cms-slug-help"
              onChange={(event) =>
                setForm({ ...form, slug: event.target.value })
              }
            />
            <small id="cms-slug-help">
              The address will be /blog/{form.slug || 'your-slug'}. Changing it
              changes the public URL.
            </small>
          </label>
          <label>
            Description
            <textarea
              required
              maxLength={320}
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
          </label>
          <div className="cms-field-row">
            <label>
              Publication date
              <input
                type="date"
                aria-label="Publication date"
                aria-describedby="cms-date-help"
                required
                value={form.date}
                onChange={(event) =>
                  setForm({ ...form, date: event.target.value })
                }
              />
              <small id="cms-date-help">
                Future dates publish on that day in Auckland.
              </small>
            </label>
            <label>
              Tags
              <input
                value={form.tags}
                placeholder="Development, Security"
                aria-label="Tags"
                aria-describedby="cms-tags-help"
                onChange={(event) =>
                  setForm({ ...form, tags: event.target.value })
                }
              />
              <small id="cms-tags-help">
                Separate up to eight tags with commas.
              </small>
            </label>
          </div>
          <label>
            Cover image URL
            <input
              maxLength={2048}
              value={form.cover}
              placeholder="/images/stories/robots.webp or https://…"
              aria-label="Cover image URL"
              aria-describedby="cms-cover-help"
              onChange={(event) =>
                setForm({ ...form, cover: event.target.value })
              }
            />
            <small id="cms-cover-help">
              Use an existing image path or a hosted HTTPS image.
            </small>
          </label>
        </div>
        <fieldset className="cms-fields">
          <legend className="font-mono text-sm">Search & sharing</legend>
          <p className="text-sm text-muted">
            Leave these blank to use the story title and description. Search
            engines may choose different text.
          </p>
          <label>
            SEO title
            <input
              maxLength={160}
              value={form.seoTitle}
              placeholder={form.title || 'Use story title'}
              onChange={(event) =>
                setForm({ ...form, seoTitle: event.target.value })
              }
            />
          </label>
          <label>
            SEO description
            <textarea
              rows={3}
              maxLength={320}
              value={form.seoDescription}
              placeholder={form.description || 'Use story description'}
              onChange={(event) =>
                setForm({ ...form, seoDescription: event.target.value })
              }
            />
          </label>
          <div
            aria-label="Search result preview"
            className="cms-search-preview"
          >
            <small>spicey.dev › blog › {form.slug || 'your-slug'}</small>
            <p className="text-xl text-cobalt">
              {form.seoTitle.trim() || form.title || 'Your story title'} · Adam
              Spice
            </p>
            <p>
              {form.seoDescription.trim() ||
                form.description ||
                'Your description appears here.'}
            </p>
          </div>
        </fieldset>
        <div className="cms-body">
          <div className="cms-toolbar">
            <span className="font-mono text-sm">The story · Markdown</span>
            <button
              type="button"
              className="button button-outline"
              aria-pressed={preview}
              onClick={() => setPreview(!preview)}
            >
              {preview ? 'Keep writing' : 'Preview'}
            </button>
          </div>
          {preview ? (
            <div className="cms-preview article-prose">
              <h2>{form.title || 'Untitled story'}</h2>
              <p>{form.description}</p>
              {safeContentUrl(form.cover) && (
                <img src={safeContentUrl(form.cover)} alt="Cover preview" />
              )}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                urlTransform={(url) => safeContentUrl(url) ?? ''}
              >
                {form.body || 'Your words will appear here.'}
              </ReactMarkdown>
            </div>
          ) : (
            <label className="cms-markdown-label">
              Story body
              <textarea
                required
                maxLength={100_000}
                rows={22}
                value={form.body}
                placeholder="Start writing…"
                onChange={(event) =>
                  setForm({ ...form, body: event.target.value })
                }
              />
            </label>
          )}
        </div>
        <div className="cms-save-bar">
          <label className="cms-checkbox">
            <input
              type="checkbox"
              checked={form.draft}
              onChange={(event) =>
                setForm({ ...form, draft: event.target.checked })
              }
            />{' '}
            Keep as draft
          </label>
          <p className="text-sm text-muted">
            {form.draft
              ? 'Hidden from the public site.'
              : form.date > publicationDate()
                ? `Scheduled for ${form.date} in Auckland.`
                : 'Saving makes this story public immediately.'}
          </p>
          <button
            type="submit"
            disabled={saving}
            className="button button-primary"
          >
            {saving
              ? 'Saving…'
              : form.draft
                ? 'Save draft'
                : 'Save and publish'}
          </button>
        </div>
        {message && (
          <p role="alert" className="cms-notice">
            {message}
          </p>
        )}
      </form>
    </section>
  )
}
