# Portfolio performance implementation plan

Goal: reduce first-load database work, article reads and image transfers; cache only public HTML.
Architecture: prepare the production database during builds, open it without DDL at runtime, reuse the fetched article for publication checks, and cache successful public HTML on Vercel for 30 seconds. Public routes bypass Clerk; admin, server functions, query variants and non-GET/HEAD requests retain authentication and cannot share the HTML cache.
Constraints: preserve drafts, archives, scheduled dates, existing migrations and local development. No production content edits. Publish updates can take at most 30 seconds to reach HTML cache readers. Keep Cloudflare body transformations prohibited.

## Tasks

- [x] Database: add and test a no-initialisation open path for prepared databases; production builds prepare/seed before activation; preserve automatic setup locally. Verify existing migration tests and an empty/unprepared runtime database fails without creating tables.
- [x] Article: use the fetched CMS record in the existing publication conversion; test single-record reads, archived/draft/future records and local precedence over legacy.
- [x] Cache: test the public route allowlist and response eligibility, authentication boundaries, Set-Cookie/error/query exclusions and 30-second CDN TTL. Integrate with Start middleware and verify real build responses, cookies and server functions.
- [x] Images: generate small and large avatar WebP variants, use responsive sizing for portrait and small variants for badges; keep the original URL for external consumers.
- [x] Verify: formatting, lint, types, unit tests, production build and browser checks; independent final review of auth/cache/migration boundaries; deploy only the verified source and inspect public responses plus runtime logs.

Review focus: no private auth state in cached pages; scheduled publication boundary; hide drafts and archived slugs; old databases still migrate; build failure cannot activate an unprepared runtime.

Baseline: 85 passing tests; legacy HTTP fixture cannot bind in the restricted shell (two hook failures and one server error). Existing checkout is clean on fix/vercel-ci-gate. Work stays in the existing non-main checkout.

## Verification and release

- 95 unit tests passed. Formatting, lint, type checking and standalone Vercel build checks passed. The artifact check also renders public pages with configured Clerk and a private cookie marker, confirming no session serialization.
- 36 Chromium browser tests passed. The seven mobile WebKit tests could not complete because the local WebKit launcher hung; the test run was stopped and its own processes cleaned up.
- Independent review found no blocking issues. Its request for configured-auth verification was addressed in the standalone artifact check and on the live signed-in admin page.
- Deployed commit e7ac5f85da4cca13fdb9d2aacea8009c840a7e58 as production deployment dpl_8YxYj7dWbTMGzJwD78Gm1AEJT5Jn. Build logs confirmed CMS migrations and seeds verified before activation.
- Live cache HIT responses: homepage 74 ms TTFB / 100 ms FCP, blog listing 79 ms TTFB, article 48 ms TTFB. These are warm desktop samples, not population statistics. Admin remains private/no-store with a cache MISS. No warning/error/fatal runtime logs found in the post-release scan.
- Preserved two existing production story-cover assets absent from the local branch. Excluded output/ research artifacts from formatting and deployment inputs. The original avatar PNG remains available.
- Source changes are saved on perf/site-loading-20261116; no merge to main was performed.
