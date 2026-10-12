# RediHealth

A Next.js healthcare coordination platform (patient intake, worker assignments, mediator cases, and a patient self-service portal).

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
| `AUTH_TRUST_HOST` | Set to `true` for local/dev |
| `REDIHEALTH_TRUST_PROXY_HEADERS` | Set to `true` only behind a trusted reverse proxy/CDN that overwrites `X-Forwarded-For`/`X-Real-IP` |
| `AUTH_URL` | Base URL of the app (e.g. `http://localhost:3000`) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection details |
| `DATABASE_URL` | Full MySQL connection string (used by the app) |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Optional Google OAuth sign-in |
| `HOSTINGER_MAIL_API_TOKEN`, `HOSTINGER_MAIL_FROM`, `HOSTINGER_MAIL_DISPLAY_NAME` | Used to send one-time login codes and patient portal links |
| `LLMSRELAY_API_KEY` or `ANTHROPIC_API_KEY` | API key for the Health Assistant's symptom intake and prescription-image transcription |
| `LLMSRELAY_MODEL` / `ANTHROPIC_MODEL` | Optional model override; defaults to `claude-haiku-4.5` |
| `ANTHROPIC_BASE_URL` | Optional Anthropic-compatible endpoint override; defaults to `https://api.llmsrelay.com` |
| `LLMSRELAY_TRANSCRIPTION_MODEL` | Optional server transcription model for follow-up meeting audio (default `whisper-1`) |
| `LLMSRELAY_BASE_URL` | Optional base URL used by server transcription fallback (default `https://api.llmsrelay.com`) |

## 3. Set up the database

For a fresh MySQL install, run only the base schema:

```bash
mysql -h <host> -u <user> -p <database> < database/schema.sql
```

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
```

For existing databases that already contain patient duplicates by email/phone, run [database/cleanup-patient-duplicates.sql](database/cleanup-patient-duplicates.sql) before adding unique constraints.

To grant a user administrator access to the panel, see [`database/set-administrator.sql`](database/set-administrator.sql).

## 4. Run the development server

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

For LAN testing, run `npm run dev -- --hostname 0.0.0.0` and open
`http://192.168.0.61:3000`. This address is allowed by `allowedDevOrigins` in
`next.config.ts`; update it if your LAN IP changes and restart the dev server.
Use development mode for email-code sign-in over local HTTP; production sign-in
requires HTTPS for secure cookies.

If email-code sign-in fails, check the server's `Email-code sign-in rejected`
diagnostic for a missing verification cookie, a code mismatch, token validation,
or a failed login access check. Request and submit codes on the same host and
protocol and use the latest code. These diagnostics do not log emails, codes,
or cookie values.

Note for phone transcription: live browser speech recognition often needs HTTPS on real mobile devices. Use `npm run tunnel` and open the HTTPS URL when testing transcription on phone.

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

The public `/find-help` page reads medical institutes for Romania, Albania and
Italy from the `medical_institutes` table (migration `007`). It asks the browser
for the visitor's location and shows the nearest institutes. Without location
permission it falls back to the visitor's country, taken from the CDN country
header (`cf-ipcountry`, `x-vercel-ip-country`, …). If there is no such header,
it uses the site language. On a first visit the same country header also picks
the site language (RO → ro, AL → sq, IT → it).

Super Admins manage the list at **Panel → Medical institutes**
(`/panel/institutes`). From there they can add, edit, hide or delete entries,
pick coordinates on a map, and re-import a country from OpenStreetMap. Entries
edited by hand are never overwritten by later imports. You can also run the
bulk import from the CLI (it uses the free public Overpass API and needs no API
key):

```bash
npm run import:institutes -- RO AL IT
```

Map data © OpenStreetMap contributors (ODbL).

## Other scripts

```bash
npm run build       # production build
npm run start        # run a production build
npm run lint         # ESLint
npm test             # run tests once (Vitest)
npm run test:watch   # run tests in watch mode
npm run tunnel        # expose localhost via a Cloudflare tunnel
```

Production builds type-check the application and tests. The ignored `build/`
directory contains local output and QA artifacts and is excluded from the
TypeScript project.

## Project structure

- `src/app` - Next.js App Router pages and API routes
- `src/components` - UI split by feature area (`landing`, `panel`, `portal`, `get-help`, `find-help`, `auth`, `ui`)
- `src/lib` - database access, validation, auth helpers, and shared types
- `database` - SQL schema and migrations
