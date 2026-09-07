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

Copy the example file and fill in your own values — never commit `.env.local`:

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
```

For existing databases that already contain patient duplicates by email/phone, run [database/cleanup-patient-duplicates.sql](database/cleanup-patient-duplicates.sql) before adding unique constraints.

To grant a user administrator access to the panel, see [`database/set-administrator.sql`](database/set-administrator.sql).

## 4. Run the development server

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

Note for phone transcription: live browser speech recognition often needs HTTPS on real mobile devices. Use `npm run tunnel` and open the HTTPS URL when testing transcription on phone.

## Other scripts

```bash
npm run build       # production build
npm run start        # run a production build
npm run lint         # ESLint
npm test             # run tests once (Vitest)
npm run test:watch   # run tests in watch mode
npm run tunnel        # expose localhost via a Cloudflare tunnel
```

## Project structure

- `src/app` — Next.js App Router pages and API routes
- `src/components` — UI split by feature area (`landing`, `panel`, `portal`, `get-help`, `find-help`, `auth`, `ui`)
- `src/lib` — database access, validation, auth helpers, and shared types
- `database` — SQL schema and migrations
