// The fixture never saves a story or talks to the production CMS.
export async function saveCmsStory() {
  return { ok: false, message: 'Saving is unavailable in this fixture.' }
}
