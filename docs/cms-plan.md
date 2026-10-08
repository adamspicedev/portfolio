# Stories CMS

The portfolio runs on a Bun server with a persistent SQLite volume. Clerk authenticates users; a server-only list of Clerk user IDs authorizes editors. Every CMS read and write checks the authenticated user. The public site works without Clerk credentials, but administration is disabled until configured.

The admin page provides a story dashboard, Markdown editing and preview, cover URL, tags, publication date, draft controls and archiving. Existing Markdown stories seed a new database once. The database becomes authoritative for those stories, including drafts and archives. Legacy remote articles remain readable, and a local record takes precedence over a matching remote slug.

SQLite uses parameterized queries, WAL, schema versioning and optimistic revisions to reject stale saves. Publication dates use the existing Pacific/Auckland rules. Publishing updates the site without a rebuild. Cover images use existing local paths or HTTPS URLs; uploads require a later media-storage feature.

Ship a Bun container with a mounted data directory and a backup command using SQLite's online backup support. Run one application instance against a local persistent volume. Do not deploy this configuration to ephemeral Vercel functions.

Validation includes real temporary SQLite databases for seeding, persistence, publishing, archive precedence, duplicate slugs and conflicting edits; authorization checks; the public browser suite; and an admin configuration screen without secrets. Clerk sign-in and authenticated browser editing require the user's Clerk application configuration.
