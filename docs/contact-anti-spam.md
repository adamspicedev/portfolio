# Contact form anti-spam

## Adam's setup

Follow Cloudflare dashboard → Turnstile → Add widget:
https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/

- Name: `spicey.dev contact`.
- Mode: **Managed**.
- Hostnames: `spicey.dev` and `www.spicey.dev`; no arbitrary/preview hostnames.
- Pre-clearance: **off**. No Cloudflare WAF, account or security settings need changing.
- Enter the public site key as `VITE_TURNSTILE_SITE_KEY`, **Config**, **Production**.
- Enter the private secret as `TURNSTILE_SECRET_KEY`, **Secret**, **Production**.

Use the existing Vercel project's Environment Variables screen:
https://vercel.com/adamspiceydevs-projects/portfolio/settings/environment-variables
Adam creates/copies/enters/submits both values directly in the official interfaces.
Never send the secret in chat, commit it or pull production environment values.
Local/preview builds without configuration display an offline form and direct
email fallback. Automated tests use mocked widget callbacks and verification;
there is no production verification bypass or shared test key.

## Request checks

The existing POST server-function and same-origin CSRF middleware remain.
Server-side validation bounds all fields, including the 2,048-character token.
The honeypot returns a silent success before verification, storage or email.
Normal requests require a trusted client address and configured secret, then call
Cloudflare Siteverify with a five-second timeout. Success must have an exact
allowed hostname, `contact` action and a challenge timestamp within five minutes
(with 30 seconds of future-clock tolerance). Siteverify rejects expired/replayed
single-use tokens. A network, parse, configuration or verification failure never
falls through to Resend. Verification requests omit form values and remote IP.

Only after successful verification does one shared database transaction reserve:

| Bucket                      | Budget | Window     |
| --------------------------- | ------ | ---------- |
| Email, trimmed/lowercased   | 3      | 10 minutes |
| Trusted canonical client IP | 5      | 10 minutes |
| Global                      | 20     | UTC hour   |
| Global                      | 50     | UTC day    |

These are fixed UTC windows, not rolling windows: requests near a boundary can
use the budgets on both sides. Provider delivery failures still consume the
reservation; no automatic email retries occur. A rate limit returns a wait time
and direct-email option; storage unavailability returns a temporary-unavailable
message. All four counters commit or roll back together, including under
cross-instance contention. No process-memory or local-database fallback is used
by the production wrapper. Tokens are consumed before storage, so any later
failure requires fresh verification.

## Additive database scope and retention

Reuse the existing `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. On first use, an
additive `CREATE TABLE IF NOT EXISTS contact_rate_limits` creates only
`bucket_key TEXT PRIMARY KEY`, `count INTEGER`, `expires_at INTEGER`, plus its
expiry index. No existing story table, schema, seed, content or record changes.
No new subscription, service credential or destructive migration is required.
An approved Vercel Production build now prepares this isolated table/index and
checks write permissions with a zero-row UPDATE inside a rolled-back transaction.
It queries only these schema objects, never story rows. Failure aborts deployment.
Other builds skip this step. Runtime initialisation remains idempotent as well.
If credentials cannot create/write it, sending fails closed.

Keys are domain-separated HMAC-SHA256 hashes of the bucket identity and window,
using `TURNSTILE_SECRET_KEY` as the server-side HMAC key. No raw email, address,
IP, token or message is stored. Keys change each window. Counters expire
logically at window end; expired rows are physically removed by the next
successful reservation. Without later traffic there is no timed purge. Rotating
the secret resets the hash namespace and effective counters. These are
pseudonymous operational records, not analytics.

## Trusted IP boundary

Only on Vercel (`VERCEL=1`), read `x-vercel-forwarded-for`, validate one canonical
IP and reject lists/scoped/malformed values. Ignore ordinary `x-forwarded-for`
and `x-real-ip`. If the platform-observed peer belongs to the pinned official
Cloudflare IPv4/IPv6 proxy ranges, accept a valid `CF-Connecting-IP`; otherwise
ignore that client-supplied field and use the Vercel peer. The published ranges
must be reviewed if routing changes. This authenticates a proxy IP range, not a
specific Cloudflare account; Cloudflare Workers and shared networks can group
visitors. Direct Vercel requests still require valid hostname-bound tokens and
shared quotas. Local/non-Vercel requests have no trusted-IP fallback.

Sources:
https://vercel.com/docs/headers/request-headers
https://www.cloudflare.com/ips-v4
https://www.cloudflare.com/ips-v6

## UI, privacy and verification

The form keeps typed values on failures, locks duplicate submissions synchronously,
invalidates tokens on expiry/error, and resets after every dispatched request,
including success, rejection and transport failure. Local validation errors do
not consume a token and leave it intact. Missing or blocked verification disables
sending; script timeouts expose a retry and direct-email fallback. Managed widget
size switches between compact and flexible to fit mobile content widths.
Keyboard focus, labels, live status and alert messages are retained.

Contact submission analytics were removed. The form uses PostHog's documented
`ph-no-capture` class to exclude its subtree from recordings/autocapture; no
form values, IPs or tokens are added to analytics or logs. Existing static
provider outcome logs contain only fixed categories.
https://posthog.com/docs/session-replay/privacy

Tests use actual local SQLite transactions through independent clients for races,
rollback, global/email/IP budgets, expiry and HMAC privacy. Provider/Cloudflare
network calls and the browser widget are mocked. Browser checks cover keyboard,
mobile WebKit, expiry, failures, retry, duplicate events, unmount cleanup and
reset errors. These do not prove the production widget configuration, actual
Cloudflare responses or remote Turso schema permissions; verify after approval
without sending real mail. Public email remains available and can receive spam
directly; form protection cannot prevent that. Endpoint field validation does not
add a new pre-parse request-byte limit or edge DDoS rules.

Server validation reference:
https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
