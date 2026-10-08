import { pageSeo } from '../lib/seo'
import { createFileRoute } from '@tanstack/react-router'
import { ClerkProvider, SignIn, UserButton } from '@clerk/tanstack-react-start'
import { useState } from 'react'
import { Plus, Archive, RotateCcw, FilePenLine } from 'lucide-react'
import { getAdminDashboard, archiveCmsStory } from '../lib/cms.functions'
import { CmsEditor } from '../components/cms-editor'
import type { CmsStory } from '../lib/cms-schema'
import { publicationDate } from '../lib/story-schema'

export const Route = createFileRoute('/admin')({
  loader: () => getAdminDashboard(),
  head: () =>
    pageSeo({
      title: 'Story studio · Adam Spice',
      description: 'Sign in to manage stories on Adam Spice’s website.',
      path: '/admin',
      index: false,
    }),
  component: AdminPage,
})
function AdminPage() {
  const data = Route.useLoaderData()
  if (data.status === 'setup')
    return (
      <main id="main-content" className="page-width cms-page">
        <p className="eyebrow">Story studio</p>
        <h1 className="section-title">Your publishing desk.</h1>
        <div className="cms-notice mt-8">
          <h2 className="text-xl font-semibold">
            Connect Clerk to get started
          </h2>
          <p className="mt-3">
            Administration is disabled because the Clerk configuration is
            missing or malformed. Add the Clerk keys and your administrator user
            ID to the server environment, then restart the app.
          </p>
          <p className="mt-3">
            Use matching pk_test_ and sk_test_ keys for development, or matching
            production keys. Copy the exact values from Clerk. The setup steps
            are in the project README. The public stories are still available.
          </p>
        </div>
      </main>
    )
  return (
    <ClerkProvider publishableKey={data.publishableKey}>
      <main id="main-content" className="page-width cms-page">
        <div className="cms-toolbar">
          <p className="eyebrow">Story studio</p>
          {data.status !== 'signed-out' && <UserButton />}
        </div>
        {data.status === 'signed-out' ? (
          <div className="cms-auth">
            <h1 className="section-title">Back to the keyboard.</h1>
            <p className="my-6 text-muted">Sign in to manage stories.</p>
            <SignIn routing="hash" forceRedirectUrl="/admin" />
          </div>
        ) : data.status === 'forbidden' ? (
          <div className="cms-notice">
            <h1 className="cms-heading">This desk is invite only.</h1>
            <p>
              You are signed in, but your account is not an administrator. Ask
              the site owner to add your Clerk user ID to the administrator
              allowlist.
            </p>
            <p className="mt-4 font-mono text-sm">
              Your user ID: {data.userId}
            </p>
          </div>
        ) : (
          <CmsDashboard initialStories={data.stories} />
        )}
      </main>
    </ClerkProvider>
  )
}
function CmsDashboard({ initialStories }: { initialStories: CmsStory[] }) {
  const [stories, setStories] = useState(initialStories)
  const [editing, setEditing] = useState<CmsStory | 'new' | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState<string | null>(null)
  function replace(story: CmsStory) {
    setStories((current) =>
      [story, ...current.filter((item) => item.id !== story.id)].sort(
        (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
      ),
    )
  }
  async function archive(story: CmsStory) {
    if (
      !story.archived &&
      !window.confirm(
        `Archive "${story.title}"? It will be removed from the public site. You can restore it later.`,
      )
    )
      return
    setPending(story.id)
    setMessage('')
    try {
      const result = await archiveCmsStory({
        data: {
          id: story.id,
          revision: story.revision,
          archived: !story.archived,
        },
      })
      if (result.ok) {
        replace(result.story)
        setMessage(
          result.story.archived
            ? 'Story archived.'
            : 'Story restored. Its draft and publication date settings are unchanged.',
        )
      } else setMessage(result.message)
    } catch {
      setMessage(
        'Unable to update the story. Check your connection and sign-in, then try again.',
      )
    } finally {
      setPending(null)
    }
  }
  if (editing)
    return (
      <CmsEditor
        key={editing === 'new' ? 'new' : `${editing.id}:${editing.revision}`}
        story={editing === 'new' ? undefined : editing}
        onClose={() => setEditing(null)}
        onSaved={(story) => {
          replace(story)
          setEditing(story)
        }}
      />
    )
  const visible = stories.filter((story) => story.archived === showArchived)
  return (
    <>
      <div className="cms-dashboard-heading">
        <div>
          <h1 className="section-title">Words, ready to go.</h1>
          <p className="mt-4 text-muted">
            Write something interesting. Save it for later. Share it when it is
            ready.
          </p>
        </div>
        <button
          type="button"
          className="button button-primary"
          onClick={() => setEditing('new')}
        >
          <Plus size={18} /> New story
        </button>
      </div>
      <div className="cms-toolbar mt-10">
        <p className="font-mono text-sm">
          {visible.length} {showArchived ? 'archived' : 'active'} stories
        </p>
        <button
          type="button"
          className="button button-outline"
          aria-pressed={showArchived}
          onClick={() => setShowArchived(!showArchived)}
        >
          {showArchived ? 'Active stories' : 'View archive'}
        </button>
      </div>
      {message && <output className="cms-notice my-4">{message}</output>}
      <div className="cms-story-list">
        {visible.map((story) => (
          <article key={story.id} className="cms-story-row">
            <div className="cms-story-thumb">
              {story.cover ? (
                <img src={story.cover} alt="" />
              ) : (
                <FilePenLine size={26} />
              )}
            </div>
            <div className="cms-story-info">
              <p className="cms-status">
                {story.archived
                  ? 'Archived'
                  : story.draft
                    ? 'Draft'
                    : story.date > publicationDate()
                      ? 'Scheduled'
                      : 'Published'}
              </p>
              <h2>{story.title}</h2>
              <p className="text-sm text-muted">
                {story.date} · /blog/{story.slug}
              </p>
            </div>
            <div className="cms-story-actions">
              {!story.archived && (
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setEditing(story)}
                >
                  Edit<span className="sr-only"> {story.title}</span>
                </button>
              )}
              <button
                type="button"
                className="text-link"
                disabled={pending !== null}
                onClick={() => archive(story)}
              >
                {story.archived ? (
                  <RotateCcw size={16} />
                ) : (
                  <Archive size={16} />
                )}
                {pending === story.id
                  ? 'Updating…'
                  : story.archived
                    ? 'Restore'
                    : 'Archive'}
                <span className="sr-only"> {story.title}</span>
              </button>
            </div>
          </article>
        ))}
        {!visible.length && (
          <p className="cms-notice">
            {showArchived
              ? 'No archived stories.'
              : 'A blank page is a good place to start. Create your first story.'}
          </p>
        )}
      </div>
    </>
  )
}
