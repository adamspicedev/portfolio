import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import {
  createRootRoute,
  createRouter,
  createRoute,
  RouterProvider,
} from '@tanstack/react-router'
import { ProjectDashboard } from '../../../src/components/project-dashboard'
import type { CmsProject } from '../../../src/lib/project-schema'
import '../../../src/styles.css'
function Fixture() {
  const [projects, setProjects] = useState<CmsProject[]>([])
  return (
    <main className="page-width cms-page">
      <ProjectDashboard
        projects={projects}
        onBack={() => {}}
        onChange={(project) =>
          setProjects((current) => [
            project,
            ...current.filter((item) => item.id !== project.id),
          ])
        }
      />
    </main>
  )
}
const rootRoute = createRootRoute()
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Fixture,
})
const router = createRouter({ routeTree: rootRoute.addChildren([indexRoute]) })
createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />,
)
