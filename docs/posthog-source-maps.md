# PostHog production source maps

The official `@posthog/rollup-plugin` runs only for Vercel Production client
builds. Project `663367`, US host and release name `spicey-portfolio` are fixed in
`build/posthog-sourcemaps.ts`; the release version is Vercel's Git commit SHA.
Development, local and Preview builds neither generate these maps nor upload.
SSR/server bundles are excluded from this integration.

Hidden maps are generated beside the exact final client chunks. The plugin
uploads before deleting maps and does not rewrite the JavaScript after upload.
A final guard aborts if maps remain in client output. An upload error also aborts
the build; the previous successful production deployment remains available.
Failed local builds may leave intermediate maps on disk; they must not be served
or promoted. No upload is done from a separate GitHub Actions build.

## Credential handoff (Adam only)

1. Open https://us.posthog.com/settings/user-api-keys and create a personal key
   for the source-map build. Official plugin documentation requires **Error
   Tracking: Write**. Choose Portfolio (`663367`) as the allowed project if the
   key form offers project restrictions. Do not grant unrelated scopes.
2. Open the existing Portfolio project's Environment Variables screen:
   https://vercel.com/adamspiceydevs-projects/portfolio/settings/environment-variables
   Save the key as **POSTHOG_API_KEY**, type **Secret** (formerly Sensitive),
   environment **Production only**. Adam creates/copies/enters/submits the value
   directly in these official interfaces, never in chat or local files.
3. Confirm completion without sharing the value. The agent can check names,
   Secret type and environment metadata only. Do not run `vercel env pull` or
   retrieve/decrypt the key. The Vercel metadata check has confirmed presence,
   Secret type and Production-only scope; PostHog permission scope is user-confirmed.

No extra environment variables are required. Do not use a `VITE_`-prefixed upload
key or reuse the public ingestion token. The plugin passes its credential to the
CLI via the child-process environment, not command-line arguments. Error-only
CLI logging is configured; never enable debug logging or print the environment.
The official CLI install script is explicitly trusted for reproducible Bun builds.

## Tests and deployment

Unit tests cover environment gating, missing-key failure and client-only scope.
The Vite integration test uses a local executable double: it verifies real map
mappings and source content, chunk IDs, byte hashes, deletion, and upload-failure
build rejection. A separate full application probe checks both Bun and Vercel presets, including
SSR exclusion and the final copied public asset bytes. These are offline tests,
**not authenticated PostHog uploads**.

After explicit publication approval, push this branch's approved commit to main.
Vercel's Production build then uses Adam's configured Secret for the first real
upload. Check build success, source-map symbol-set metadata for the generated
chunk IDs, and absence of public `.map` files. Confirm served JavaScript matches
the uploaded build. Do not print key values or trigger a deliberate public error
without separate need/approval. Historical minified releases are not repaired by
new maps for a different build.

Current session has a browser-panel opener but no tool to inspect/control Adam's
signed-in Mac browser. Authenticated settings forms and permission prompts are
therefore Adam's own steps; no browser state or credential was extracted.

Sources:

- https://posthog.com/docs/error-tracking/upload-source-maps/vite
- https://posthog.com/docs/api/personal-api-keys
- https://vercel.com/docs/environment-variables/sensitive-environment-variables
