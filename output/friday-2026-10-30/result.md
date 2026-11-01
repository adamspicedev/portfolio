# Friday publication completed

Article: https://www.spicey.dev/blog/local-ai-still-needs-a-network-map

LinkedIn: https://www.linkedin.com/feed/update/urn:li:activity:7521666281003995136/

## Publication evidence

- Single-image commit 80524dde1baf8f0a21990b4f1e16ea702f29e76e pushed to main after one allowed retry with materially fuller automation authorisation. Initial denial had not executed. No alternate deployment route was used.
- CI run https://github.com/adamspicedev/portfolio/actions/runs/40946178320 passed formatting, lint, TypeScript, unit tests, production build/browser tests, standalone Vercel function verification and production deployment.
- Deployed WebP matches reviewed local image SHA-256 9e22916d9c347eb5df3771739c6208113c9b0579889d02ec98e0af32edea98a4; 1200×800; 36,266 bytes.
- Existing Studio draft published as revision 2, saved 30 October 2026 at 9:10 am Pacific/Auckland. No duplicate story created. Blog listing now has 11 stories and exactly one matching article.
- Normal Chrome document response 200, full article text, 30 Oct 2026 date, 3-minute reading label, one H1 and three H2s. Source links and internal link render correctly.
- Cover initially encountered Chrome's disk-cached pre-deployment 404. Revalidation returned 200 image/webp, 1200×800. Subsequent normal reload displayed the cover. No cache or security setting was left changed.
- Desktop 1440×1000 and mobile 390×844 viewport checks: matching cover and alt, all headings, no horizontal overflow. Temporary viewport override reset.
- Rendered canonical, OG/Twitter titles/descriptions/images/alt, summary_large_image and BlogPosting match saved metadata. BlogPosting author is Adam Spice, datePublished 2026-10-30. Metadata has index, follow; normal browser document response had no X-Robots-Tag.
- Public robots.txt allows / and disallows /admin. Dynamic sitemap contains the exact article canonical and current lastmod.
- Canonical article and social-image destinations were followed in Chrome and resolved to the intended live page and image.
- LinkedIn self-profile verified with Adam Spice identity, self-edit controls and posts marked You. Recent own activity inspected; no new article duplicate found.
- Composer showed Adam Spice, Post to Anyone and the correct image/title/link preview. One click on Post. UI confirmed Post successful. Opened the returned activity URL and verified author, exact introduction and target link. No retry, tags, messages, organisation posts or crossposts.

## Material limitations and site-wide follow-up

- Existing site configuration uses https://spicey.dev in canonicals, sitemap and social metadata, while that host redirects to https://www.spicey.dev. The destinations resolve, but the canonical host should eventually be aligned with the redirect destination. No unrelated code was changed.
- A direct Python urllib request to the article returned 403. It was not retried with altered identity or bypasses. Normal browser responses and LinkedIn's fetched preview worked. Search-engine-specific access/indexing was not established.
- The server permits four-hour caching of the pre-deployment image 404 seen in Chrome. Future runs should deploy a cover before entering its URL into Studio, avoiding that early cached response. This run's cache was revalidated and normal rendering verified.

## Local deliverables

- article.md and metadata.json: reviewed copy, sources, SEO, accurate alt and image-generation prompt summary.
- local-ai-network-map-20261030.webp: final asset. Built-in image_gen original remains at ../../generated_images/exec-6881002e-f0ad-4192-a5e2-386c03074427.png relative to the portfolio root convention; actual original path is /Users/spicey/Projects/portfolio/generated_images/exec-6881002e-f0ad-4192-a5e2-386c03074427.png.
- browser-desktop.json and browser-mobile.json: rendered verification evidence.
- article-desktop.jpg and article-mobile.jpg: website screenshots.
- linkedin-announcement.txt, linkedin-result.json and linkedin-published-card.jpg: final social proof.

No remaining publication blocker. Shared checkout remains on its original feature branch; only the isolated clone's image commit was pushed. No credentials, permissions, subscriptions or unrelated production code changed.
