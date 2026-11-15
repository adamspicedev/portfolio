import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { z } from 'zod'
import { usePostHog } from 'posthog-js/react'
import { getProject } from '../lib/projects.functions'
import { pageSeo } from '../lib/seo'
import { track } from '../lib/analytics'

export const Route = createFileRoute('/projects/$projectId')({
  loader: async ({ params }) => {
    if (!z.string().uuid().safeParse(params.projectId).success) throw notFound()
    const project = await getProject({ data: params.projectId })
    if (!project) throw notFound()
    return project
  },
  head: ({ loaderData: project }) =>
    project
      ? pageSeo({
          title: `${project.title} · Project case study · Adam Spice`,
          description: project.description,
          path: `/projects/${project.id}`,
          image: project.image,
          imageAlt: project.imageAlt,
        })
      : pageSeo({
          title: 'Project unavailable · Adam Spice',
          description: 'Explore Adam Spice’s projects.',
          path: '/',
          index: false,
        }),
  component: ProjectCaseStudy,
})

function ProjectCaseStudy() {
  const project = Route.useLoaderData()
  const posthog = usePostHog()
  return (
    <main id="main-content" className="article-page">
      <div className="article-width">
        <Link to="/" hash="projects" className="text-link font-mono text-xs">
          ← All projects
        </Link>
        <header className="article-header">
          <p className="eyebrow">{project.category} · Case study</p>
          <h1>{project.title}</h1>
          <p className="mt-6 text-xl leading-relaxed text-muted">
            {project.description}
          </p>
          <ul
            className="mt-6 flex flex-wrap gap-2"
            aria-label="Technologies used"
          >
            {project.tags.map((tag) => (
              <li className="tag" key={tag}>
                {tag}
              </li>
            ))}
          </ul>
          <a
            className="button button-primary mt-8"
            href={project.link}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              track(posthog, 'project_opened', {
                project_id: new URL(project.link).hostname,
                placement: 'case_study',
              })
            }
          >
            Visit project website ↗
          </a>
        </header>
        <article className="article-prose">
          {(
            [
              ['problem', 'The problem'],
              ['contribution', 'My contribution'],
              ['decisions', 'Key decisions'],
              ['results', 'Results'],
            ] as const
          ).map(
            ([key, title]) =>
              project.caseStudy[key] && (
                <section key={key}>
                  <h2>{title}</h2>
                  <p className="whitespace-pre-line">
                    {project.caseStudy[key]}
                  </p>
                </section>
              ),
          )}
          <section>
            <h2>A look at the app</h2>
            <figure>
              <img
                src={project.image}
                alt={
                  project.imageAlt || `${project.title} application screenshot`
                }
                width={1000}
                height={650}
                loading="lazy"
              />
              <figcaption className="mt-3 text-sm text-muted">
                {project.title} — application screenshot.
              </figcaption>
            </figure>
          </section>
        </article>
        <Link to="/" hash="contact" className="button button-outline mt-10">
          Let’s talk about your project ↗
        </Link>
      </div>
    </main>
  )
}
