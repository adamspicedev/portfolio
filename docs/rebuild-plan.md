# Portfolio rebuild

Approved direction: a playful retro computer portfolio inspired by Adam's Dragon 32 story. Retain real biography, projects, experience, social links, résumé and contact. Use lavender (#eee9ff), cobalt (#2835e7), orange (#ff784f), deep navy (#191938), pale pink (#ffd7e8) and white (#ffffff). Pair Space Grotesk display/body with Space Mono labels. The signature is an interactive Three.js desktop computer; the surrounding layout stays legible and spacious.

## Implementation

1. Scaffold using the official latest TanStack CLI in a temporary directory, then migrate its Start/Vite configuration into this repository. Install current Tailwind and Three.js dependencies. Remove obsolete Next.js source/configuration after carrying forward content and assets.
2. Implement shared shell, home sections and 3D hero. Lazy-load the scene on the client; clean up GPU resources, stop offscreen rendering, honor reduced motion and provide a static fallback.
3. Add Markdown stories, validated metadata, draft filtering, date ordering, blog index and article routes. Preserve legacy root-slug URLs via redirects. Provide a publishing helper and documentation without inventing or replacing existing remote articles.
4. Port Resend to a Start server function with validation, a honeypot and basic request throttling. Retain direct email as a fallback when mail configuration is absent.
5. Verify typecheck, production build, content and validation tests, then inspect the running site on desktop and mobile. Check navigation, article not-found handling, keyboard controls, reduced motion, WebGL fallback and contact configuration feedback.

## Limits

Existing blog content is fetched from WRITE_IT_UP_URL and absent from this checkout. Inspect whether it can be retrieved locally without exposing secrets; preserve a server-side compatibility path if needed. Do not publish or deploy. Do not send test email without explicit authorization.
