# Portfolio performance implementation plan

Goal: reduce first-load database work, article reads and image transfers; cache only public HTML.
Architecture: prepare the production database during builds, open it without DDL at runtime, reuse the fetched article for publication checks, and cache successful public HTML on Vercel for 30 seconds. Public routes bypass Clerk; admin, server functions, query variants and non-GET/HEAD requests retain authentication and cannot share the HTML cache.
Constraints: preserve drafts, archives, scheduled dates, existing migrations and local development. No production content edits. Publish updates can take at most 30 seconds to reach HTML cache readers. Keep Cloudflare body transformations prohibited.

## Tasks

- [ ] Database: add and test a no-initialisation open path for prepared databases; production builds prepare/seed before activation; preserve automatic setup locally. Verify existing migration tests and an empty/unprepared runtime database fails without creating tables.
- [ ] Article: use the fetched CMS record in the existing publication conversion; test single-record reads, archived/draft/future records and local precedence over legacy.
- [ ] Cache: test the public route allowlist and response eligibility, authentication boundaries, Set-Cookie/error/query exclusions and 30-second CDN TTL. Integrate with Start middleware and verify real build responses, cookies and server functions.
- [ ] Images: generate small and large avatar WebP variants, use responsive sizing for portrait and small variants for badges; keep the original URL for external consumers.
- [ ] Verify: formatting, lint, types, unit tests, production build and browser checks; independent final review of auth/cache/migration boundaries; deploy only the verified source and inspect public responses plus runtime logs.

Review focus: no private auth state in cached pages; scheduled publication boundary; hide drafts and archived slugs; old databases still migrate; build failure cannot activate an unprepared runtime.

Baseline: 85 passing tests; legacy HTTP fixture cannot bind in the restricted shell (two hook failures and one server error). Existing checkout is clean on fix/vercel-ci-gate. Work stays in the existing non-main checkout.
