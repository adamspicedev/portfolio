# PostHog error investigation

Baseline: `663068f0e835e760ad33ff3575a30ede3f35a286` (remote main).
Portfolio PostHog project: 663367.
Issue: https://us.posthog.com/project/663367/error-tracking/01a13dce-977d-73b1-8ecd-0c1eee0dfa6c

## Hydration evidence

A fresh mobile WebKit context reproduced React #418 on the public homepage.
The returned HTML contains a Cloudflare-rewritten contact anchor:
`href="/cdn-cgi/l/email-protection#…"` and a `.__cf_email__` span displaying
`[email protected]`, plus `email-decode.min.js`. React expects the original
`mailto:` anchor and visible address. This changes the DOM before hydration.

Controlled A/B: intercept the public homepage response, keep its data and scripts
unchanged, and restore only the contact anchor's original href and email text.
The unmodified response raises #418; the restored response does not. This proves
one concrete cause of the observed error, without claiming every historic event
has the same cause. No real contact email or CMS mutation was used.

Date hypothesis: current homepage date text matched before and after hydration
in WebKit. October dates also matched Chromium and Bun. September abbreviations
do vary between engines (`Sep` / `Sept`), but current homepage dates are October;
that difference did not explain this reproduction. The formatter is unchanged.

The fix adds `no-transform` only to the homepage's existing public revalidation
policy. Cloudflare documents this as an email-obfuscation exemption:
https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/
No dashboard settings, suppression rules or hydration-warning suppression change.
After approval/deployment, check the actual response header and absence of
`.__cf_email__` in the homepage, then repeat mobile WebKit hydration.

## Delivery and reporting

A regression first reproduced successful mocked Resend delivery followed by a
throwing logger returning a false delivery failure. Logger setup/emission is now
best effort, with an additional defensive boundary at contact delivery.

Handled route errors and selected client transport failures use static synthetic
errors and allowlisted operation names. A static frameless stack prevents the installed SDK from substituting a caller
stack; this is checked using its actual error-properties builder. Original errors supply only object
identity for deduplication; messages, stacks and request/form/story data are not
forwarded. Page/referrer URL properties are cleared on these curated reports.
Normal SDK-enriched metadata and existing global autocapture remain in effect.
Success analytics cannot change a completed contact/CMS action into failure.

CMS unexpected store failures and contact provider failures emit fixed server log
messages/categories. Validation, rate limits, authorization and editing conflicts
are not reported as unexpected failures. Server logs are not new server-side
`$exception` events. Existing batched exporter delivery is best effort; this change
does not promise durable delivery after a serverless process is suspended.

## Source maps

The current Vite configuration generates no production client source maps and
has no PostHog upload plugin/step. Inspected production minified stacks therefore
cannot be reliably mapped back to original source. Repository Actions secret
names did not show an existing source-map upload credential. No credential value
was read or created and no upload access was configured.

PostHog's documented Vite/CLI routes require authenticated source-map uploads and
chunk metadata matching the deployed assets. A later approved setup should upload
maps for the exact deployed build and remove maps from public output; do not
upload a separate CI build whose bytes differ from Vercel's deployed build.
https://posthog.com/docs/error-tracking/upload-source-maps/vite
https://posthog.com/docs/error-tracking/upload-source-maps/cli

## Regression checks

The edge test models the documented transform/no-transform behaviour and runs in
Chromium and mobile WebKit. It failed before the header fix and passed after it.
The real Cloudflare edge will still need verification after deployment approval.
Contact/CMS tests use mocked delivery/storage/telemetry and never send messages or
modify the real CMS. No dependency or lockfile changes are needed.
