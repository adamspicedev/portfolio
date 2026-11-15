# Friday article workflow — 30 October 2026, Pacific/Auckland

Status: COMPLETE. The additional exact automation evidence permitted one successful retry. Artwork deployed, the existing draft was published, live checks passed, and one personal LinkedIn announcement was published and verified. See result.md for the final evidence and limitations.

## Completed

- Public blog had 10 published articles; latest date 23 October. Authenticated Story Studio showed the same 10 active stories and zero archived stories. No 30 October duplicate existed.
- Signed into Studio through its existing GitHub/Clerk access. The consent page explicitly said Existing access; no additional scope or credential was created.
- Researched GitHub's 28 October local-model routing preview using four primary sources linked in article.md. Independent factual/voice review approved the draft.
- Viewed existing artwork, generated original cover with built-in image_gen, viewed original and final WebP. Final WebP: 1200×800, 36,266 bytes.
- Saved one draft titled Local AI still needs a network map in https://www.spicey.dev/admin. UI confirmed Saved 30 Oct 2026, 9:04 am · revision 1 and Keep as draft enabled. Returning to the list showed exactly one matching DRAFT among 11 active stories.
- Inspected rendered Studio preview: paragraphs, three headings, primary references, internal link and AI illustration credit present.
- Freshly fetched origin/main at 16eaf9ee56ae4be874c4f22780b125043e403320. Preserved shared checkout branch fix/vercel-ci-gate. Prepared an isolated local clone at /tmp/portfolio-friday-20261030 on friday-local-ai-cover.
- Committed only public/images/stories/local-ai-network-map-20261030.webp as 80524dde1baf8f0a21990b4f1e16ea702f29e76e.

## Historical blocker — resolved

Attempted command: git push origin HEAD:main

Working directory: /tmp/portfolio-friday-20261030

Target: git@github.com:adamspicedev/portfolio.git, refs/heads/main. This triggers the existing GitHub Actions CI gate and, after successful checks, Vercel production deployment.

Status: DENIED before execution. No uncertain remote mutation and no retry or alternative deployment route attempted.

Automatic approval review reason, verbatim:

> Pushing directly to the protected main branch is an external commitment that triggers production deployment, but the transcript lacks trusted user authorization for this exact push.

Do not bypass the rejection. Retry the denied operation only after materially new relevant user authorisation evidence, once per such evidence. The original task included standing authorisation for article publication and bounded artwork deployment, but the reviewer did not accept it for the exact main push.

## Historical continuation checklist — completed

1. Check remote main before the one permitted push retry; rebase the image-only commit if needed. Preserve the CI deployment gate.
2. Wait for GitHub checks and Vercel production deployment; verify the public WebP returns correctly. A previously attempted image load may be cached as 404, so investigate normal responses if it does not load. Do not bypass a block.
3. Edit the EXISTING Studio draft, uncheck Keep as draft, Save and publish. Do not create another story.
4. Verify live text/date/cover/references, desktop/mobile layout, rendered canonical/OG/Twitter metadata including alt, BlogPosting, crawlability and sitemap. Report unrelated site issues instead of editing code.
5. Only after live verification, open existing signed-in Mac Chrome personal LinkedIn self-profile, verify identity and inspect recent own activity for the exact article URL. Match actual self-authored style, then publish one factual short introduction and link, and verify the resulting post URL. No LinkedIn action has been taken in this attempt.

Intended public URL, NOT yet published or verified: https://www.spicey.dev/blog/local-ai-still-needs-a-network-map

Studio browser tab 937187823 was marked for handoff. Current browser profile: Chrome Adam, id 3.
