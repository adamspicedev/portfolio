# Adam Spice's portfolio

A playful portfolio built with TanStack Start, React, Tailwind CSS 4 and Three.js. The retro computer is inspired by Adam's Dragon 32 story.

## Run locally

Use **Bun 1.4.2 or newer**. The project and CI pin Bun 1.4.2 in `.bun-version`.

```sh
bun install --frozen-lockfile
bun run dev
```

`bunfig.toml` runs development and build tools with Bun as well. Unit tests use `bun:test`; Playwright runs the separate browser suite.

Open [localhost:3000](http://localhost:3000).

```sh
bun run typecheck
bun test
bun run build
bun run start
```

`bun run start` serves the production Bun build from `.output/server/index.mjs`. Set `PORT` to change the port. The app includes server functions and requires a server deployment; see [deployment options](#deploy-on-bun-or-vercel).

## React runtime

[TanStack Redact](https://tanstack.com/redact/latest/docs/start) handles server
rendering and browser hydration through the Vite plugin. Keep `react` and
`react-dom` installed and continue using their normal imports. The plugin runs
after the Start and React plugins, and `ssr.noExternal` bundles server dependencies
so their React imports also resolve to Redact.

The default full preset preserves the features used by Start and Clerk, including
hydration, context, Suspense, lazy components, portals and class error boundaries.
Rendering is synchronous. The contact, project and upload browser fixtures use the
same runtime; run the production build and browser suite when changing it.

## CI and tests

GitHub Actions runs on pull requests, pushes to `main`, and manual dispatches. It uses Bun from `.bun-version` and `bun install --frozen-lockfile` with the committed `bun.lock`. The jobs check formatting, lint, TypeScript, unit tests, the production build and Chromium/mobile WebKit browser tests. Failed browser tests upload their HTML report, screenshots and traces. No deployment or mail credentials are needed.

Linting uses [Oxlint](https://oxc.rs/docs/guide/usage/linter/quickstart), with TypeScript, React hooks and accessibility rules. Formatting uses [Oxfmt](https://oxc.rs/docs/guide/usage/formatter/quickstart.html). Generated routes, build outputs, reports and existing public assets are excluded from formatting.

```sh
bun run lint
bun run lint:fix
bun run format
bun run format:check
bun run typecheck
bun test

# Run browser tests against the production build.
bun run playwright install chromium webkit
bun run build
bun run test:e2e
```

Bun’s native test runner covers SQLite persistence, backups, revision conflicts, administrator authorization, story metadata, publishing rules, the actual story CLI, legacy article conversion, contact validation, throttling and mail delivery failures. The CLI tests run in temporary directories and never edit portfolio content. Resend is mocked in delivery tests so no real email is sent.

Playwright starts an isolated production server on port 4173 with mail and the legacy service disabled. It checks server-rendered content, résumé delivery, search, filters, article navigation and metadata, redirects, 404s, contact failure feedback, keyboard controls, mobile layout, reduced motion and WebGL context loss. Screenshots also verify that the 3D rotation changes the rendered image. The HTML report is in `playwright-report/`; inspect traces with `bun run playwright show-trace <trace.zip>`.

## Manage stories

Open `/admin`, or use **Story studio** in the footer. Sign in with Clerk using an authorized administrator account. Create a story, set its slug, description, tags and cover URL, then write Markdown and preview it. Keep **Keep as draft** checked for private work. Uncheck it and save to publish immediately, or set a future publication date to schedule it in Pacific/Auckland. Publishing and edits do not require rebuilding the app.

Archiving removes a story from the public site and reserves its slug. Restore it from the archive to recover its original draft/date settings. Stale saves are rejected so a second tab cannot silently overwrite newer changes. Unsaved edits stay in the editor on failure.

The six existing Markdown stories seed a new, empty database on its first use. After initialization, the database is authoritative. Editing or adding files in `content/stories/` does not change an existing database. The `bun run story "Title"` helper remains useful for preparing seed content for a new installation.

Covers support existing local image paths, hosted HTTPS URLs, and image uploads when blob storage is configured (see [image uploads](docs/story-image-uploads.md)). Raw HTML in Markdown is not executed.

Choose **Manage projects** in `/admin` to create or edit homepage projects. You can change the title, description, category, destination URL, tags, image and alt text, card colour, and display order (lower numbers appear first). Save as a draft to keep a project hidden, or uncheck **Keep as draft** and save to publish. Archive and restore work like stories, and stale saves are rejected.

The existing Movie-Mate and StoreIt cards are imported once into the same SQLite database on first connection after this update, including for existing installations. Subsequent edits are stored in the database and appear on the homepage without a rebuild. Database backups include projects; changing `projectsData` in the source only affects new imports.

## Configure Clerk

Create or use a Clerk application and add these values to `.env` locally and to the server environment in production:

- `VITE_CLERK_PUBLISHABLE_KEY`: the public key for that Clerk application.
- `CLERK_SECRET_KEY`: its server-only secret key.
- `CMS_ADMIN_USER_IDS`: a comma-separated list of exact Clerk user IDs.
- `DATABASE_PATH`: optional local SQLite file path, defaulting to `./data/portfolio.sqlite`; ignored when `TURSO_DATABASE_URL` is set.
- `TURSO_DATABASE_URL`: your Turso database URL (for example, `libsql://<database>-<organization>.turso.io`).
- `TURSO_AUTH_TOKEN`: the auth token generated for that database. Keep it server-only; never use a `VITE_` prefix.

Sign in at `/admin`. If your account is not yet authorized, the page displays your own Clerk user ID; add it to `CMS_ADMIN_USER_IDS` and restart the server. An empty allowlist authorizes nobody. Signing up or signing in alone never grants publishing access. Every CMS server function checks authorization, and TanStack's CSRF middleware protects server-function requests.

Without Clerk keys, the public site still works and `/admin` shows setup instructions. Use production Clerk keys and configure your real production domain in Clerk before going live. Do not place the secret key in a `VITE_` variable. See [Clerk's TanStack Start setup](https://clerk.com/docs/tanstack-react-start/getting-started/quickstart).

## Existing blog service

Set `WRITE_IT_UP_URL` to include articles from the legacy blog service. The site merges those stories with CMS database stories and converts the supported rich-text blocks to Markdown. A database story takes precedence over a remote article with the same slug, including when it is a draft or archived.

Old `/story-slug` links redirect to `/blog/story-slug`. If the service is unavailable, local stories remain available. Remote stories use a one-minute in-process cache. The adapter supports paragraphs, headings, links, emphasis, lists, quotes, code blocks, dividers and images. Custom editor blocks need an explicit mapping in `src/lib/legacy-stories.server.ts`.

## Contact form

Copy `.env.example` to `.env` for local development. Production contact delivery requires these **server-only** variables:

- `RESEND_API_KEY`: your Resend API key.
- `RESEND_FROM_EMAIL`: a sender on a verified sending domain. The onboarding sender can only be used within Resend's account restrictions.
- `TURNSTILE_SECRET_KEY`: the secret for the contact form's Cloudflare Turnstile widget.
- `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`: shared storage for contact rate limits.

Set the widget's public site key as `VITE_TURNSTILE_SITE_KEY` at build time. The recipient remains `adam@spicey.dev`. Sending requires verified Turnstile tokens, a trusted Vercel client IP and shared email/IP/global rate limits. Local or unconfigured builds provide a direct-email fallback. See [contact protection](docs/contact-anti-spam.md) for setup, limits and verification. Keep all secret values server-only and out of source control.

## Change the portfolio

- Projects, experience and skills: `src/lib/portfolio.ts`.
- Biography and homepage copy: `src/routes/index.tsx`.
- Theme, layout and responsive styles: `src/styles.css`.
- 3D model: `src/components/computer-model.ts`.
- Rendering lifecycle: `src/components/computer-scene.ts`.
- Images and résumé: `public/`.

The scene loads only on the client as it approaches the viewport. It caps pixel density, suspends offscreen and in background tabs, and disposes GPU resources when leaving the page. Visitors can pause or spin the computer. Reduced motion disables ambient animation and makes rotation immediate. A static SVG illustration remains when WebGL is unavailable.

## Deploy on Bun or Vercel

By default, the CMS uses a local SQLite database. On a Bun server, that file needs a persistent filesystem. Vercel deployments use Turso by setting `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` instead.

`Dockerfile` builds the app and runs it as the unprivileged `bun` user. `compose.yml` mounts a named volume at `/app/data` and binds port 3000 to the server's loopback address. Place an HTTPS reverse proxy in front of it and run one app instance against the volume. Configure Clerk and mail variables in `.env` on that server, then:

```sh
docker compose up -d --build
```

The volume persists across container updates. Do not run `docker compose down -v` unless you intend to delete the database. Keep database files and backups outside `public/` and source control. A normal Bun deployment can also use `bun install --frozen-lockfile`, `bun run build`, and `bun run start`, with `DATABASE_PATH` pointing to a persistent directory writable by the application user. To use Turso on a Bun deployment, set the same two Turso variables instead.

For Vercel, add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in **Project Settings → Environment Variables**, for each environment where the CMS should work. Use the database URL and token from Turso's database connection details; do not commit the token. Nitro switches to its Vercel output preset during the Vercel build and `vercel.json` selects Vercel's Bun runtime. Leave Vercel's Output Directory setting unset so it detects Nitro's generated output; `.output` is only for standalone Bun deployments. The app connects to Turso at runtime, applies its schema migrations, and seeds the included stories only if that remote database is empty. Existing imported stories are preserved.

`bun run db:backup` backs up a local SQLite file only. Use Turso's backup/export tooling for the remote database.

### Backup and restore

For a normal Bun installation:

```sh
bun run db:backup
# Or supply a new destination that does not already exist.
bun run db:backup /secure/backups/portfolio.sqlite
```

The command uses `VACUUM INTO` to capture a consistent snapshot including live WAL changes. To back up the production container, choose a unique name:

```sh
docker compose exec portfolio bun -e 'import { Database } from "bun:sqlite"; const db = new Database(process.env.DATABASE_PATH); db.query("VACUUM INTO ?").run("/app/data/backup-2026-10-08.sqlite"); db.close();'
docker compose cp portfolio:/app/data/backup-2026-10-08.sqlite ./backup-2026-10-08.sqlite
```

Copy backups off the server. For restoration, stop the app, preserve the current database and its `-wal`/`-shm` files, replace the configured database with the snapshot, remove the old sidecar files from the active path, ensure ownership is correct and restart. Verify restored stories before switching traffic. Do not copy only a live main database file while leaving its WAL behind.

The five technology stories dated 8 October 2026 contain source links checked during preparation. Their original generated illustrations are compressed WebP assets in `public/images/stories/`. They are editorial illustrations, not photographs of real products.

### SEO

The story editor includes optional SEO title and description fields with a search result preview. Blank fields use the story title and description. The cover image is used for social sharing. Search engines can choose different titles and snippets.

Public pages render canonical URLs and Open Graph/Twitter metadata on the server. Articles also include BlogPosting structured data. `/sitemap.xml` reads the published stories at request time, so publishing, scheduling, or archiving needs no rebuild. Drafts and archived stories are excluded. `/admin` remains noindex. Canonical URLs use `https://spicey.dev` in `src/lib/seo.ts`; update that constant if the production domain changes.

After deployment, submit `https://spicey.dev/sitemap.xml` in Google Search Console and validate an article with Google's Rich Results Test. Local checks verify markup, not indexing or search rankings.

### Cover descriptions and social previews

Set **Cover description (alt text)** in Story studio after viewing the artwork. It is used on the article, story cards, editor preview and Open Graph/Twitter image descriptions. Existing stories remain compatible with an empty description; Markdown seed stories may also set `coverAlt`. Home, Stories and articles without a cover use `public/images/social-preview.jpg`, a 1200×630 card based on Adam's existing portrait. Public metadata is rendered on the server. Admin and unavailable pages use generic previews and remain noindex.

The cover-description migration adds `cover_alt TEXT NOT NULL DEFAULT ''` to the stories table on first database connection. It preserves all existing columns and content. Previous application versions can still read and update their existing columns; leave the additional column in place during rollback. Existing deployed stories must be updated through Story studio because Markdown only seeds an empty database.

### PostHog verification and source maps

Set `VITE_PUBLIC_POSTHOG_PROJECT_TOKEN` and `VITE_PUBLIC_POSTHOG_HOST` in Vercel's production/preview build environments. These values are public and embedded at build time; changing them requires rebuilding. Docker Compose forwards them as build arguments and runtime settings.

Source maps are generated and uploaded only for the Vercel Production client build. Configure server-only `POSTHOG_API_KEY` there; project, host and release settings live in `build/posthog-sourcemaps.ts`. Missing credentials, upload failures or leftover public maps abort that build. Local, Preview and GitHub Actions builds skip uploads. See [source-map configuration](docs/posthog-source-maps.md).

Verify the release in PostHog Error Tracking's symbol sets. Contact success emits `contact_message_sent` from the browser and `contact email accepted` from the server, with `channel=contact_form`; no message body or visitor email is logged. Acceptance means Resend accepted the request, not that delivery completed. Server delivery flushes its log batch before returning and logging errors do not change email delivery success. Confirm the browser event in Product Analytics and the acceptance record in PostHog Logs after a real successful submission. Unit tests alone do not establish hosted ingestion.

The administrator identity marker persists with PostHog, so revisiting `/admin` does not identify the same user again. Switching accounts resets before identifying the next Clerk ID, and sign-out clears it. Validate this with real Clerk sessions before claiming the hosted identity flow verified.

### Portfolio outcomes and delivery tracking

Dashboard: https://us.posthog.com/project/663367/dashboard/2247392

The dashboard excludes internal/test users and restricts events to `spicey.dev` and `www.spicey.dev`, excluding `/admin`. Reporting uses Pacific/Auckland. Admin identity sets `$internal_or_test_user=true`, matching the existing internal cohort. Browser events from other hostnames are discarded, including local and preview traffic. Existing anonymous admin activity cannot always be reclassified retroactively.

Events:

- `contact_started`: first field edit per form completion cycle (or validation/submission without prior edits).
- `contact_attempted`: a submission attempt, including one stopped by native browser validation (once per attempt).
- `contact_failed`: native/application validation, offline, rate limit, provider rejection/unavailability, or request failure, with a bounded `reason`.
- `contact_message_sent`: server accepted a non-honeypot submission; not delivery confirmation.
- `contact_email_clicked`: direct mailto link clicked, not proof of a sent email.
- `story_opened`: card click with `story_slug` and `placement` (`home`/`blog`). Direct visits remain pageviews.
- `project_opened`: click with destination hostname as `project_id`, category and `placement` (`image`/`title`).
- `cms_save_failed` / `cms_archive_failed`: rejected or failed requests, without draft contents. Unexpected request failures also emit sanitized exceptions.

The contact funnel is ordered within one hour and permits intervening events. Newly instrumented events and properties have no historical backfill. Resume events measure link clicks, not completed downloads.

Web Vitals capture is enabled explicitly. Replay samples 10% of production sessions, masks inputs/contact text, and blocks `/admin` via the project URL blocklist. Keep these remote settings in place when changing SDK configuration. Verify SPA navigation, contact outcomes, and real `$web_vitals` records after deploying; configuration and a successful build alone are not ingestion evidence.

#### Resend delivery webhook

1. Deploy this code, then configure `https://www.spicey.dev/api/webhooks/resend` in Resend (use the final hostname to avoid redirecting POST requests).
2. Subscribe to `email.delivered`, `email.bounced`, `email.failed`, and `email.complained`.
3. Store the webhook signing secret as server-only `RESEND_WEBHOOK_SECRET` in the deployment environment and redeploy/restart. Compose forwards this variable. Do not use a `VITE_` prefix.
4. Send a real contact message after deployment and confirm matching `email_id` values in acceptance and delivery logs. The endpoint verifies the original signed body using the Resend SDK and only forwards events tagged `channel=contact_form` by this application.

Delivery logs include only channel, email ID and webhook ID. Count distinct `webhook_id` values when aggregating because retries can repeat a log. Missing configuration or failed logging returns 503 so Resend can retry; invalid signatures return 400. Earlier emails without the channel tag are ignored. Delivery means the recipient mail server accepted the email; it does not establish that the recipient read it.

### Initial-load performance

Vercel functions run in Sydney (`syd1`) alongside the production Turso database.
Keep the function and database regions aligned if either hosting location changes.

The homepage server-renders projects and stories without waiting for Hacker News.
The ticker fetches `/api/headlines` after hydration, with a loading message and a
link to Hacker News when unavailable. Successful headline responses permit one
minute of browser caching and five minutes of CDN caching, with ten minutes of
stale-while-revalidate; empty results are not cached by HTTP intermediaries.
The upstream reader also retains its existing fifteen-minute in-process cache.
Cloudflare does not cache JSON by default; Vercel can apply this endpoint's CDN
policy without a Cloudflare rule. Full HTML responses retain their existing
revalidation policy because Clerk attaches authentication state.
