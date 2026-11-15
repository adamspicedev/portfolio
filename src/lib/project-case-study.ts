import type { CmsProject } from './project-schema'

// Initial copy uses only the features and stack already described in the portfolio.
const initialCaseStudies: Record<string, CmsProject['caseStudy']> = {
  'rowberry.spicey.dev': {
    problem:
      'Working with PostgreSQL often means moving between connections, SQL queries, table data and nested JSON. I wanted a focused desktop workspace that brings these tasks together and keeps workspace data local, without requiring an account or a hosted service.',
    contribution:
      'I’m the sole developer of Rowberry, an open-source PostgreSQL desktop app. I handle the design, development and technical decisions across the Electron application, React and TypeScript interface, schema navigation, tabbed SQL workspace and JSON inspection and editing. I also create and maintain the branding, website and documentation.',
    decisions:
      'I focused on PostgreSQL first rather than spreading the initial release across multiple database engines. Electron provides the desktop shell, React and TypeScript power the interface, and Monaco Editor provides the SQL editing surface. Database access runs in a separate worker process behind a validated bridge, with a sandboxed renderer and verified TLS by default. Table browsing is paged, and eligible table and JSON edits use stable row identities and optimistic conflict checks. Connection metadata, saved queries and recoverable drafts stay on the device; remembered passwords use the operating system’s credential store when available.',
    results:
      'The current app includes saved connections, schema navigation, paged table browsing, multiple SQL tabs, completion, query cancellation and explicit transaction controls. JSON workflows include inspection, search, editing and previews before saving. Rowberry is still in early development: platform qualification, signing and installation checks remain outstanding. It can currently be tried from source; the website and repository document the supported workflows and remaining release work.',
  },
}

export function projectCaseStudy(project: CmsProject) {
  const initial = initialCaseStudies[new URL(project.link).hostname]
  return {
    ...project,
    caseStudy: {
      problem: project.caseStudy.problem || initial?.problem || '',
      contribution:
        project.caseStudy.contribution || initial?.contribution || '',
      decisions: project.caseStudy.decisions || initial?.decisions || '',
      results: project.caseStudy.results || initial?.results || '',
    },
  }
}
