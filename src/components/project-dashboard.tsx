import { useState } from 'react'
import type { CmsProject } from '../lib/project-schema'
import { archiveCmsProject } from '../lib/projects.functions'
import { ProjectEditor } from './project-editor'

export function ProjectDashboard({
  projects,
  onChange,
  onBack,
}: {
  projects: CmsProject[]
  onChange: (project: CmsProject) => void
  onBack: () => void
}) {
  const [editing, setEditing] = useState<CmsProject | 'new' | null>(null)
  const [archived, setArchived] = useState(false)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  async function archive(project: CmsProject) {
    if (
      pending ||
      (!project.archived &&
        !window.confirm(
          `Archive "${project.title}"? It will be removed from the public site. You can restore it later.`,
        ))
    )
      return
    setPending(true)
    setMessage('')
    try {
      const result = await archiveCmsProject({
        data: {
          id: project.id,
          revision: project.revision,
          archived: !project.archived,
        },
      })
      if (result.ok) {
        onChange(result.project)
        setMessage(
          result.project.archived
            ? 'Project archived.'
            : 'Project restored. Its draft setting is unchanged.',
        )
      } else setMessage(result.message)
    } catch {
      setMessage(
        'Unable to update the project. Check your connection and sign-in, then try again.',
      )
    } finally {
      setPending(false)
    }
  }
  if (editing)
    return (
      <ProjectEditor
        key={editing === 'new' ? 'new' : `${editing.id}:${editing.revision}`}
        project={editing === 'new' ? undefined : editing}
        onClose={() => setEditing(null)}
        onSaved={(project) => {
          onChange(project)
          setEditing(project)
        }}
      />
    )
  const visible = projects.filter((project) => project.archived === archived)
  return (
    <>
      <div className="cms-toolbar">
        <button className="text-link" disabled={pending} onClick={onBack}>
          ← Stories
        </button>
        <span className="font-mono text-sm">Projects</span>
      </div>
      <div className="cms-dashboard-heading">
        <h1 className="section-title">Things you've made.</h1>
        <button
          className="button button-primary"
          disabled={pending}
          onClick={() => setEditing('new')}
        >
          New project
        </button>
      </div>
      <div className="cms-toolbar">
        <p className="text-sm text-muted">
          Manage the projects shown on your homepage.
        </p>
        <button
          className="text-link"
          disabled={pending}
          onClick={() => setArchived(!archived)}
        >
          {archived ? 'Active projects' : 'View archive'}
        </button>
      </div>
      {message && <output className="cms-notice">{message}</output>}
      <div className="cms-story-list">
        {visible.map((project) => (
          <article key={project.id} className="cms-story-row">
            <div className="cms-story-thumb">
              <img src={project.image} alt="" />
            </div>
            <div className="cms-story-info">
              <p className="cms-status">
                {project.archived
                  ? 'Archived'
                  : project.draft
                    ? 'Draft'
                    : 'Published'}
              </p>
              <h2>{project.title}</h2>
              <p className="text-sm text-muted">
                {project.category} · Order {project.position}
              </p>
            </div>
            <div className="cms-story-actions">
              {!project.archived && (
                <button
                  className="button button-outline"
                  disabled={pending}
                  onClick={() => setEditing(project)}
                >
                  Edit<span className="sr-only"> {project.title}</span>
                </button>
              )}
              <button
                className="text-link"
                disabled={pending}
                onClick={() => archive(project)}
              >
                {project.archived ? 'Restore' : 'Archive'}
                <span className="sr-only"> {project.title}</span>
              </button>
            </div>
          </article>
        ))}
        {!visible.length && (
          <p className="cms-notice">
            {archived
              ? 'No archived projects.'
              : 'Create a project to show your work.'}
          </p>
        )}
      </div>
    </>
  )
}
