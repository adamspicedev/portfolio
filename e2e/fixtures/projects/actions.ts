import type { CmsProject, ProjectInput } from '../../../src/lib/project-schema'
type Result = { ok: true; project: CmsProject } | { ok: false; message: string }
export async function saveCmsProject({
  data,
}: {
  data: ProjectInput
}): Promise<Result> {
  return (
    await fetch('/fixture/save', { method: 'POST', body: JSON.stringify(data) })
  ).json()
}
export async function archiveCmsProject({
  data,
}: {
  data: { id: string; revision: number; archived: boolean }
}): Promise<Result> {
  return (
    await fetch('/fixture/archive', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  ).json()
}
