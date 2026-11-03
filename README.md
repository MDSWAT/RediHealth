# RediHealth

A Next.js healthcare coordination platform (patient intake, worker assignments, mediator cases, and a patient self-service portal).

## Interactive panel demo

`/demo` replaces the old showcase with the same panel components used by staff, with mediator
and doctor roles. Requests, patients, care plans, documents, photos, follow-ups, calendar and
meeting notes use fictional data stored under `redihealth-panel-demo-v1` in browser localStorage.
The **Reset demo** button restores the sample records. Demo navigation stays under `/demo`;
no sign-in or database is needed.

A scoped `PanelRuntimeProvider` routes demo actions to `DemoPanelStore`, never to live API routes.
The real panel retains its normal fetch/navigation behavior when no provider is present. Email
and report actions are simulated; video/transcription and GPS use local examples rather than
external services or device permissions. Phone/email links are intercepted inside the demo.
Do not enter real patient information. Browser storage errors are shown and unsaved changes
are not reported as successful; large uploaded files may exceed the browser's storage quota.

## Encrypted offline workspace (doctors and mediators)

After online sign-in, choose **Encrypted offline workspace** in the panel and explicitly
enable it on a private, trusted device at `/offline`, acknowledging the browser-access warning.
No offline password is required; prepared data opens automatically on subsequent visits.
Existing password-protected vaults require their old passphrase once and explicit consent
to migrate, preserving records and unsynced work. Only the latest 100 assigned patient records
(including archived records and attachments) and 100 requests in the active country are
prepared. Patients that were never downloaded are not available offline.

The IndexedDB vault, including attachments and pending edits, uses AES-256-GCM with fresh
96-bit IVs and a random, non-extractable AES-256 key stored alongside ciphertext in IndexedDB
using structured cloning. Ciphertext and key are saved/deleted together atomically.
Legacy PBKDF2-derived keys remain usable during migration. Medical data and keys are never put into the
service worker's Cache Storage. Only the data-free offline shell and same-origin immutable
app assets are cached. HTTPS, service workers, Web Crypto, IndexedDB and Web Locks are required.
Unlocking is not offline sign-in: the device must first be authorized online. Access expires
after 30 days and pauses after 10 idle minutes or page close. Reopening needs no password;
pause is not an authentication barrier. Renewing requires the same
online account and country. Revocation cannot be learned while disconnected; do not enable
this on shared/unmanaged devices. Anyone using the browser profile can decrypt the data:
non-extractability prevents raw key export, not use of the key. Encryption does not protect
against browser-profile access, device malware, XSS or a compromised OS. Use device disk encryption,
screen locking and regular synchronization too.

Text edits, care plans, photos/documents, new patients, non-video follow-ups, completion and
request status/notes save to the encrypted queue. While unlocked, reconnecting retries sync;
online changes in this workspace also sync after a short debounce. Email/video/invitations,
permanent deletion, assignment changes and admin functions remain online-only. New offline
patients do not automatically send portal emails; send them separately in the online panel.
The toolbar distinguishes device saves from server synchronization.

Apply **migration 014 to every country database**, and configure its `DATA_ENCRYPTION_KEY_<CC>`
before enabling the feature. Sync rechecks live staff membership and assignment, locks the
row, compares its full-record SHA-256 revision and commits via the existing mutation validators
in the same transaction as a staff-scoped idempotency receipt. Keep receipts permanently:
deleting them can duplicate an old retried creation. Conflicts stay pending until the user
compares the two versions and chooses online data or explicitly retries changed fields.
There is no automatic last-writer-wins policy.

Normal sign-out is blocked when queued changes exist. The explicit discard action removes
all device data and unsynced work; sign-out without pending work also removes the vault.
Closing/pausing the workspace preserves ciphertext, its device key and pending work. Browser clearing,
private browsing, storage eviction or loss of the device key can destroy unsynced work. Storage
failures are reported and changes are not acknowledged before encrypted persistence completes.
Only one open workspace tab per device is allowed. Sync runs in the foreground, not while paused
or after the browser is closed. After deployments, reconnect and sync to refresh shell assets.

## Panel loading and performance

The Jitsi consultation workspace prioritizes video, with a collapsible notes/transcript
sidebar on desktop and a stacked layout on mobile. Tabs and hiding the sidebar preserve
drafts and keep the video mounted. Both fields save together to the existing meeting record;
invitation and transcription actions retain their existing endpoints. Transcription uses
the device microphone, not audio captured from the embedded call; obtain consent first.
The demo uses the same workspace with simulated video/transcription and local-only saves.

The Workers dashboard uses a lightweight patient assignment projection on initial load and
refresh (`GET /api/patients?view=assignment`, administrators only). Documents, photos, medical
history, treatment plans and follow-ups are not loaded for assignment controls; clinical
screens retain full records. Database connection resets/timeouts still require checking
the production database network, SSL and provider limits.

Panel and demo routes include a prefetched Next.js loading boundary: navigation can show
localized, responsive list/calendar/profile skeletons before server data finishes loading.
Their shared layouts retain the real navigation shell, sidebar state and mobile menu while
only page content changes to a skeleton. Page-level shells publish badge/action updates to
the persistent shell instead of mounting a second menu. Authorization remains enforced by
each server page and API; the live layout also checks staff access on entry.
Skeletons contain no account or patient data, announce loading to assistive technology,
and respect reduced-motion preferences. Self-hosted reverse proxies must allow response
streaming (for Nginx, disable proxy buffering) to avoid holding the fallback until completion.

## Prerequisites

- Node.js 20+
- A MySQL database (schema is in [`database/schema.sql`](database/schema.sql) and [`database/migrations`](database/migrations))

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

Copy the example file and fill in your own values - never commit `.env.local`:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
| --- | --- |
| `AUTH_SECRET` | Session/JWT secret. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |
| `AUTH_TRUST_HOST` | Set to `true` when serving the app on your own hostname |
| `AUTH_URL` | Public base URL of the app (e.g. `https://redihealth.org`). Also used for `sitemap.xml` and links in emails |
| `REDIHEALTH_TRUST_PROXY_HEADERS` | Set to `true` behind a trusted reverse proxy/CDN that overwrites `X-Forwarded-For`/`X-Real-IP`. Without it every visitor shares one rate-limit bucket. Not needed on Vercel |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | The **control database**: no personal data. Rate limits, settings and the institute directory |
| `DATABASE_URL` | Alternative to the discrete settings: a full `mysql://` connection string |
| `DATABASE_URL_<CC>` or `DB_<CC>_HOST/PORT/USER/PASSWORD/NAME` | The database of one country (`RO`, `AL`, `IT`, `MD`). See [Countries](#countries-and-data-isolation) |
| `DEFAULT_COUNTRY` | Country whose data lives in the control database of a single-database installation (default `RO`) |
| `DATA_ENCRYPTION_KEY_<CC>` | 32-byte base64 key per country for encrypting medical history and photos |
| `DB_CONNECTION_LIMIT` | Pool size per server process (default `10`) |
| `DATABASE_SSL`, `DATABASE_SSL_CA` | Enable TLS to the database; the server certificate is verified. Set `DATABASE_SSL_REJECT_UNAUTHORIZED=false` only for self-signed development servers |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Optional Google OAuth sign-in |
| `HOSTINGER_MAIL_API_TOKEN`, `HOSTINGER_MAIL_FROM`, `HOSTINGER_MAIL_DISPLAY_NAME` | Used to send one-time login codes and patient portal links |
| `OPERATIONAL_ALERT_EMAIL` | Fallback recipient for issue reports and operational alerts. Super admins can set the recipient in **Panel → Settings**, which takes precedence |
| `LLMSRELAY_API_KEY` or `ANTHROPIC_API_KEY` | API key for the Health Assistant's symptom intake and prescription-image transcription |
| `LLMSRELAY_MODEL` / `ANTHROPIC_MODEL` | Optional model override; defaults to `claude-haiku-4.5` |
| `ANTHROPIC_BASE_URL` | Optional Anthropic-compatible endpoint override; defaults to `https://api.llmsrelay.com` |
| `LLMSRELAY_TRANSCRIPTION_MODEL` | Optional server transcription model for follow-up meeting audio (default `whisper-1`) |
| `LLMSRELAY_BASE_URL` | Optional base URL for the relay's OpenAI-style endpoints and transcription (default `https://api.llmsrelay.com`) |
| `JITSI_DOMAIN` | Video meeting provider (default `meet.jit.si`) |
| `HEALTH_CHECK_TOKEN` | Bearer token that unlocks the detailed output of `GET /api/health`; without it the endpoint only returns the overall status |
| `DEV_ALLOWED_ORIGINS` | Development only: comma-separated LAN hosts allowed to load the dev server |

## 3. Set up the databases

For a fresh MySQL install, run only the base schema. With one database per country (recommended, see
[Countries](#countries-and-data-isolation)) apply `schema.sql` to each country database and
`control-schema.sql` to the control database:

```bash
mysql -h <host> -u <user> -p <country database> < database/schema.sql
mysql -h <host> -u <user> -p <control database> < database/control-schema.sql
```

A single-database installation applies `schema.sql` once, which contains both sets of tables.

Before running consolidated migrations on an existing database, run the precheck:

```bash
mysql -h <host> -u <user> -p <database> < database/migration-precheck.sql
```

Use the precheck result as a guide:
- If most core tables are missing, use consolidated migrations.
- If schema is partially present and duplicate checks return rows, run `database/cleanup-patient-duplicates.sql` before patient uniqueness constraints.
- If schema already matches current columns/indexes, skip migrations.

If you are using consolidated staged migrations, apply them **in order**:

```bash
mysql -h <host> -u <user> -p <database> < database/migrations/001_requests_and_staff.sql
mysql -h <host> -u <user> -p <database> < database/migrations/002_patients_identity_and_portal.sql
mysql -h <host> -u <user> -p <database> < database/migrations/003_mediator_cases.sql
mysql -h <host> -u <user> -p <database> < database/migrations/004_meetings_and_followups.sql
mysql -h <host> -u <user> -p <database> < database/migrations/005_hash_portal_tokens.sql
mysql -h <host> -u <user> -p <database> < database/migrations/006_activity_logs.sql
mysql -h <host> -u <user> -p <database> < database/migrations/007_medical_institutes.sql
mysql -h <host> -u <user> -p <database> < database/migrations/008_patient_profile_photo.sql
mysql -h <host> -u <user> -p <database> < database/migrations/009_rate_limits_and_settings.sql
mysql -h <host> -u <user> -p <database> < database/migrations/010_portal_link_expiry.sql
mysql -h <host> -u <user> -p <database> < database/migrations/011_case_mapping_and_request_consent.sql
mysql -h <host> -u <user> -p <database> < database/migrations/012_worker_and_patient_counties.sql
mysql -h <host> -u <user> -p <database> < database/migrations/013_patient_intake.sql
```

Migration `009` adds the shared rate-limit counters and the settings table (apply it to the control
database); `007` (institutes) also belongs to the control database, and the others to each country database.
`010` gives existing patient portal links a fresh 90-day validity window (new links are valid for
90 days, and patients can request a new one from the sign-in page).
`011` adds county and recorded consent to public help requests, plus locality/UAT, approximate case
map locations, planned home visits, and closure tracking to mediator cases. Apply it to every
country database.

`013` adds patient intake details to each country database. The patient form supports an optional
document checkbox, medical/identity uploads (PDF, JPEG, PNG, WebP; up to 5 files, 5 MB each,
10 MB total), and current GPS coordinates alongside the typed address. GPS is requested only
after a click and requires browser permission and HTTPS (or localhost); no geocoding service is used.
Documents and GPS are stored in the encrypted `patients.intake` field and require the country's
`DATA_ENCRYPTION_KEY_<CC>`. They are available only in the authorized staff panel, not the
patient portal, portal emails or printed reports. Apply the migration before deploying this version.
Allow at least 32 MB for MySQL's `max_allowed_packet` and the reverse proxy's request-body limit
to accommodate base64 encoding and encrypted storage at the documented upload limit.
Next.js buffers up to 16 MB through its proxy for the base64-encoded upload request.

For existing databases that already contain patient duplicates by email/phone, run [database/cleanup-patient-duplicates.sql](database/cleanup-patient-duplicates.sql) before adding unique constraints.

To grant a user administrator access to the panel, see [`database/set-administrator.sql`](database/set-administrator.sql).
For a super admin (who also manages medical institutes and settings), use [`database/set-super-administrator.sql`](database/set-super-administrator.sql).

## 4. Run the development server

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

For LAN testing, run `npm run dev -- --hostname 0.0.0.0`, add the machine's LAN
address to `DEV_ALLOWED_ORIGINS` in `.env.local` and restart the dev server.
Use development mode for email-code sign-in over local HTTP; production sign-in
requires HTTPS for secure cookies.

If email-code sign-in fails, check the server's `Email-code sign-in rejected`
diagnostic for a missing verification cookie, a code mismatch, token validation,
or a failed login access check. Request and submit codes on the same host and
protocol and use the latest code. These diagnostics do not log emails, codes,
or cookie values.

Note for phone transcription: live browser speech recognition often needs HTTPS on real mobile devices. Use `npm run tunnel` and open the HTTPS URL when testing transcription on phone.

## Countries and data isolation

RediHealth serves several countries (Romania, Albania, Italy, Moldova) from one application.
Personal data never shares a database across countries:

- **Control database** (`DATABASE_URL` / `DB_*`, schema [`database/control-schema.sql`](database/control-schema.sql)):
  rate-limit counters, settings and the public institute directory. It holds nothing personal.
- **One database per country** (`DATABASE_URL_RO`, `DATABASE_URL_AL`, ...): patients, help requests,
  staff, meetings and the audit log of that country, created from [`database/schema.sql`](database/schema.sql)
  and migrations `001`-`006`, `008`, `010`-`013`. Give each its own MySQL user that can only reach that database.
  A country without settings is simply not offered.

How requests are routed:

- **Staff** belong to the country in which they have a worker record. Staff who work in several
  countries have one worker record per country (own role, own patients) and switch country with the
  selector in the panel; data of different countries is never shown together. The selection is only a
  preference, so access is checked again on every request.
- **Public help requests** go to the country the visitor picks on the Get help form.
- **Patient portal links** carry the patient's country (`?c=ro`); links issued before that are looked up in
  every country.
- **Medical institutes** are public data kept in the control database. A super admin manages the
  institutes of the country they are working in.
- **Encryption**: medical history, the profile photo and photos are encrypted with a key that exists for
  one country only (`DATA_ENCRYPTION_KEY_<CC>`), so a leaked database dump or key does not expose another
  country. Existing rows are encrypted with `npm run encrypt:patients -- RO`. Keep the keys out of the
  database backups and store them separately.

Moving an existing single-database installation: set `DEFAULT_COUNTRY` to the country its data belongs to;
it keeps working unchanged. To split it, restore a copy into the country's own database, set
`DATABASE_URL_<CC>`, and then remove the personal tables from the control database.

### Adding a country

1. Add its ISO code to `SUPPORTED_COUNTRIES` in `src/lib/countries.ts` together with its language,
   map centre and display names.
2. Create the database and a dedicated MySQL user, then apply `schema.sql` (or the migrations).
3. Set `DATABASE_URL_<CC>` and `DATA_ENCRYPTION_KEY_<CC>`.
4. Create the first admin in that database with [`database/set-super-administrator.sql`](database/set-super-administrator.sql).
5. Import its institutes: `npm run import:institutes -- <CC>`.

## Patient treatment plans

The patient's Care Plan tab supports multiple named treatment plans, each with
start and end dates, diagnosis, goals, medications, instructions, and its own
attachments. Date ranges may overlap. Add, edit, or remove plans and use
**Save all treatment plans** to persist changes. The portal and printable report
show all plans, and the patient history includes their start dates and photos.

Plans are stored as `entries` in the existing `patients.treatment_plan` JSON
column; no database migration is required. Previous single-plan records remain
visible as an existing undated plan, retaining their clinical details and photos.
Dates can be added without overwriting other plans.

## Find help map (medical institutes)

The public `/find-help` page reads medical institutes for Romania, Albania,
Italy and Moldova from the `medical_institutes` table of the control database (migration `007`). It asks the browser
for the visitor's location and shows the nearest institutes. Without location
permission it falls back to the visitor's country, taken from the CDN country
header (`cf-ipcountry`, `x-vercel-ip-country`, …). If there is no such header,
it uses the site language. On a first visit the same country header also picks
the site language (RO and MD → ro, AL → sq, IT → it).

Super Admins manage the list of the country they are working in at **Panel → Medical institutes**
(`/panel/institutes`). From there they can add, edit, hide or delete entries,
pick coordinates on a map, and re-import a country from OpenStreetMap. Entries
edited by hand are never overwritten by later imports. You can also run the
bulk import from the CLI (it uses the free public Overpass API and needs no API
key):

```bash
npm run import:institutes -- RO AL IT MD
```

Map data © OpenStreetMap contributors (ODbL).

## Production

The app runs on Vercel or on a single Node server (VPS).

### Bot protection

Bot protection is **disabled by default** (`RECAPTCHA_ENABLED=false`). When enabled,
public submissions use **Google reCAPTCHA v3**: help requests, email sign-in
(both requesting and verifying codes), portal recovery emails, issue reports,
the AI assistant/prescription review, and patient portal updates. Authenticated
staff forms are not challenged. Search filters, local health questionnaires,
and demo forms do not submit data and do not need CAPTCHA.

1. Register a **v3** site in the [Google reCAPTCHA console](https://www.google.com/recaptcha/admin/create).
   Register your production hostname(s) and `localhost` if testing locally.
2. Set `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`, and
   `RECAPTCHA_ALLOWED_HOSTNAMES` in the hosting environment. The hostname list
   is comma-separated, without protocols, paths, or ports.
3. Set `RECAPTCHA_ENABLED=true`, then rebuild and deploy: the public site key is
   embedded at build time. Keep `RECAPTCHA_ENABLED=false` to leave forms working
   without CAPTCHA; no Google CAPTCHA script or verification call runs in that mode.

Every submission obtains a fresh token. Server checks require success, score
**at least 0.5**, the expected action, an allowed hostname, and a token no older
than two minutes. Existing rate limits remain in place. Missing configuration
or an unavailable verification service **blocks submissions when enabled** with an explicit
error; it never silently disables protection. No medical or form content is
included in the verification request to Google.

On a VPS:

```bash
npm ci
npm run build
npm run start            # listens on port 3000; set PORT to change it
```

- Put the app behind a TLS-terminating reverse proxy (nginx, Caddy) that sets
  `X-Forwarded-For`, and set `REDIHEALTH_TRUST_PROXY_HEADERS=true`. Set `AUTH_URL`
  to the public HTTPS origin and `AUTH_TRUST_HOST=true`.
- Apply every migration in `database/migrations` before the first start; rate limiting
  and settings need `009`, portal link expiry needs `010`.
- Run the process under a supervisor (systemd, pm2) and back up the MySQL database;
  it holds all patient data, including photos.
- Point an uptime monitor at `GET /api/health`. With `HEALTH_CHECK_TOKEN` configured and
  sent as `Authorization: Bearer <token>`, the response lists each service and a
  failing check emails the alert recipient. Without the token only `{ "status": ... }`
  is returned (HTTP 503 when the database is unreachable).
- Security headers and a nonce-based Content Security Policy are applied by
  `src/proxy.ts`; the Permissions-Policy allows the camera/microphone for the
  configured video-meeting provider only.

## Other scripts

```bash
npm run build       # production build
npm run start        # run a production build
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm test             # run tests once (Vitest)
npm run test:watch   # run tests in watch mode
npm run tunnel        # expose localhost via a Cloudflare tunnel (requires cloudflared)
```

Production builds type-check the application and tests. The ignored `build/`
directory contains local output and QA artifacts and is excluded from the
TypeScript project.

## Project structure

- `src/app` - Next.js App Router pages and API routes
- `src/components` - UI split by feature area (`landing`, `panel`, `portal`, `get-help`, `find-help`, `auth`, `ui`)
- `src/lib` - database access, validation, auth helpers, and shared types
- `database` - SQL schema and migrations
