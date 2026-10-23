import { useState, type FormEvent } from 'react'
import { useBlocker } from '@tanstack/react-router'
import { projectSchema, type CmsProject } from '../lib/project-schema'
import { saveCmsProject } from '../lib/projects.functions'
import { CoverUpload } from './cover-upload'

export function ProjectEditor({
  project,
  onSaved,
  onClose,
}: {
  project?: CmsProject
  onSaved: (project: CmsProject) => void
  onClose: () => void
}) {
  const initial = {
    title: project?.title ?? '',
    description: project?.description ?? '',
    category: project?.category ?? '',
    link: project?.link ?? '',
    image: project?.image ?? '',
    imageAlt: project?.imageAlt ?? '',
    tags: project?.tags.join(', ') ?? '',
    color: project?.color ?? 'cobalt',
    position: project?.position ?? 0,
    draft: project?.draft ?? true,
  }
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const dirty = JSON.stringify(form) !== JSON.stringify(initial)
  useBlocker({
    shouldBlockFn: () =>
      saving ||
      ((dirty || uploading) &&
        !window.confirm('Discard your unsaved changes?')),
    enableBeforeUnload: dirty || uploading || saving,
  })
  function close() {
    if (
      !saving &&
      ((!dirty && !uploading) ||
        window.confirm('Discard your unsaved changes?'))
    )
      onClose()
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving || uploading) return
    const parsed = projectSchema.safeParse({
      ...form,
      id: project?.id,
      revision: project?.revision,
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
    setMessage('')
    try {
      const result = await saveCmsProject({ data: parsed.data })
      if (result.ok) onSaved(result.project)
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
    <section aria-label="Project editor">
      <div className="cms-toolbar">
        <button
          type="button"
          className="text-link"
          disabled={saving}
          onClick={close}
        >
          ← All projects
        </button>
      </div>
      <h2 className="cms-heading">
        {project ? 'Edit project' : 'New project'}
      </h2>
      {project && (
        <output className="text-sm text-muted">
          Saved · revision {project.revision}
        </output>
      )}
      <form onSubmit={submit} className="cms-editor">
        <fieldset disabled={saving} className="cms-fields">
          <label>
            Title
            <input
              required
              maxLength={160}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label>
            Description
            <textarea
              required
              rows={4}
              maxLength={1000}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <label>
            Category
            <input
              required
              maxLength={80}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </label>
          <label>
            Project URL
            <input
              required
              type="url"
              maxLength={2048}
              placeholder="https://…"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />
          </label>
          <label>
            Tags
            <input
              aria-label="Tags"
              aria-describedby="project-tags-help"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
            <small id="project-tags-help">
              Separate up to eight tags with commas.
            </small>
          </label>
          <label>
            Image URL
            <input
              required
              disabled={uploading}
              maxLength={2048}
              placeholder="/images/project.png or https://…"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
          </label>
          <CoverUpload
            cover={form.image}
            alt={form.imageAlt}
            disabled={saving}
            contentLabel="project"
            onBusy={setUploading}
            onUploaded={(image) =>
              setForm((current) => ({ ...current, image }))
            }
          />
          <label>
            Image description (alt text)
            <input
              maxLength={500}
              value={form.imageAlt}
              onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
            />
            <small>
              Describe the screenshot. Leave blank only for a decorative image.
            </small>
          </label>
          <label>
            Card colour
            <select
              value={form.color}
              onChange={(e) =>
                setForm({ ...form, color: e.target.value as 'cobalt' | 'pink' })
              }
            >
              <option value="cobalt">Cobalt</option>
              <option value="pink">Pink</option>
            </select>
          </label>
          <label>
            Display order
            <input
              required
              type="number"
              min={0}
              max={10000}
              step={1}
              value={form.position}
              onChange={(e) =>
                setForm({ ...form, position: e.target.valueAsNumber })
              }
            />
            <small>
              Lower numbers appear first. Projects with the same number are
              sorted by title.
            </small>
          </label>
          <div className="cms-save-bar">
            <label className="cms-checkbox">
              <input
                type="checkbox"
                checked={form.draft}
                onChange={(e) => setForm({ ...form, draft: e.target.checked })}
              />
              Keep as draft
            </label>
            <p className="text-sm text-muted">
              {form.draft
                ? 'Hidden from the public site.'
                : 'Saving makes this project public immediately.'}
            </p>
            <button
              type="submit"
              className="button button-primary"
              disabled={saving || uploading}
            >
              {saving
                ? 'Saving…'
                : form.draft
                  ? 'Save draft'
                  : 'Save and publish'}
            </button>
          </div>
        </fieldset>
        {message && (
          <p role="alert" className="cms-notice">
            {message}
          </p>
        )}
      </form>
    </section>
  )
}
