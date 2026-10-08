# Adam Spice's portfolio

A playful portfolio built with TanStack Start, React, Tailwind CSS 4 and Three.js. The retro computer is inspired by Adam's Dragon 32 story.

The app was scaffolded with the official installer:

```sh
npx @tanstack/cli@latest create spicey-portfolio \
  --package-manager npm --deployment nitro --no-git --no-intent --no-examples -y
```

The generated Start/Vite setup was migrated into this existing repository, then converted to Bun. The Next.js implementation and its dependencies have been replaced; existing images, social links and résumé are retained.

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

`bun run start` serves the production Bun build from `.output/server/index.mjs`. Set `PORT` to change the port. Deploy the generated `.output` directory with a persistent SQLite data directory to a host that supports a Bun server; this app includes server functions and isn't a static-only site. The old Next.js hosting configuration must be updated before deployment.

## CI and tests

GitHub Actions runs on pull requests, pushes to `main`, and manual dispatches. It uses Bun from `.bun-version` and `bun install --frozen-lockfile` with the committed `bun.lock`. The jobs check formatting, lint, TypeScript, unit tests, the production build and Chromium browser tests. Failed browser tests upload their HTML report, screenshots and traces. No deployment or mail credentials are needed.

Linting uses [Oxlint](https://oxc.rs/docs/guide/usage/linter/quickstart), with TypeScript, React hooks and accessibility rules. Formatting uses [Oxfmt](https://oxc.rs/docs/guide/usage/formatter/quickstart.html). Generated routes, build outputs, reports and existing public assets are excluded from formatting.

```sh
bun run lint
bun run lint:fix
bun run format
bun run format:check
bun run typecheck
bun test

# Run browser tests against the production build.
bun run playwright install chromium
bun run build
bun run test:e2e
```

Bun’s native test runner covers SQLite persistence, backups, revision conflicts, administrator authorization, story metadata, publishing rules, the actual story CLI, legacy article conversion, contact validation, throttling and mail delivery failures. The CLI tests run in temporary directories and never edit portfolio content. Resend is mocked in delivery tests so no real email is sent.

Playwright starts an isolated production server on port 4173 with mail and the legacy service disabled. It checks server-rendered content, résumé delivery, search, filters, article navigation and metadata, redirects, 404s, contact failure feedback, keyboard controls, mobile layout, reduced motion and WebGL context loss. Screenshots also verify that the 3D rotation changes the rendered image. The HTML report is in `playwright-report/`; inspect traces with `bun run playwright show-trace <trace.zip>`.

## Manage stories

Open `/admin`, or use **Story studio** in the footer. Sign in with Clerk using an authorized administrator account. Create a story, set its slug, description, tags and cover URL, then write Markdown and preview it. Keep **Keep as draft** checked for private work. Uncheck it and save to publish immediately, or set a future publication date to schedule it in Pacific/Auckland. Publishing and edits do not require rebuilding the app.

Archiving removes a story from the public site and reserves its slug. Restore it from the archive to recover its original draft/date settings. Stale saves are rejected so a second tab cannot silently overwrite newer changes. Unsaved edits stay in the editor on failure.

The six existing Markdown stories seed a new, empty database on its first use. After initialization, the database is authoritative. Editing or adding files in `content/stories/` does not change an existing database. The `bun run story "Title"` helper remains useful for preparing seed content for a new installation.

Covers support existing local image paths and hosted HTTPS URLs. This version does not upload files. Raw HTML in Markdown is not executed.

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

The old blog fetched rich-text articles from `WRITE_IT_UP_URL`. If you still use that service, set the same server environment variable. The site merges those stories with CMS database stories and converts the supported rich-text blocks to Markdown. A database story takes precedence over a remote article with the same slug, including when it is a draft or archived.

Old `/story-slug` links redirect to `/blog/story-slug`. If the service is unavailable, local stories remain available. Remote stories use a one-minute in-process cache. Remote availability and the original articles need checking against your actual service; it isn't configured in this checkout. The adapter supports paragraphs, headings, links, emphasis, lists, quotes, code blocks, dividers and images. Custom editor blocks need an explicit mapping in `src/lib/legacy-stories.server.ts`.

## Contact form

Copy `.env.example` to `.env` for local development and configure these **server-only** variables:

- `RESEND_API_KEY`: your Resend API key.
- `RESEND_FROM_EMAIL`: a sender on a verified sending domain. The onboarding sender can only be used within Resend's account restrictions.
- `WRITE_IT_UP_URL`: optional old blog service.

The recipient remains `adam@spicey.dev`. Without an API key, the form directs visitors to email Adam directly. Sending uses a Start server function with server-side validation, a honeypot and a limit of three attempts per sender per ten minutes. The limiter is in memory and resets on restart; configure rate limiting at your host for protection across instances. Keep these variables out of `VITE_` variables and source control.

## Change the portfolio

- Projects, experience and skills: `src/lib/portfolio.ts`.
- Biography and homepage copy: `src/routes/index.tsx`.
- Theme, layout and responsive styles: `src/styles.css`.
- 3D model: `src/components/computer-model.ts`.
- Rendering lifecycle: `src/components/computer-scene.ts`.
- Images and résumé: `public/`.

The scene loads only on the client as it approaches the viewport. It caps pixel density, suspends offscreen and in background tabs, and disposes GPU resources when leaving the page. Visitors can pause or spin the computer. Reduced motion disables ambient animation and makes rotation immediate. A static SVG illustration remains when WebGL is unavailable.

## Deploy on Bun or Vercel

By default, the CMS uses a local SQLite database. On a Bun server, that file needs a persistent filesystem. Vercel deployments use Turso by setting `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` instead. Keep the current live site until the replacement deployment and its CMS have been verified.

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
