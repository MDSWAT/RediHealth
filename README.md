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
| `AUTH_URL` | Base URL of the app (e.g. `http://localhost:3000`) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection details |
| `DATABASE_URL` | Full MySQL connection string (used by the app) |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Optional Google OAuth sign-in |
| `HOSTINGER_MAIL_API_TOKEN`, `HOSTINGER_MAIL_FROM`, `HOSTINGER_MAIL_DISPLAY_NAME` | Used to send one-time login codes and patient portal links |
| `OPENROUTER_API_KEY` | OpenRouter key for the Health Assistant's symptom intake and prescription-image transcription |
| `OPENROUTER_MODEL` | Optional model override; defaults to `openai/gpt-4o-mini` for lower-cost image requests |

## 3. Set up the database

Run the base schema, then apply migrations **in order**:

```bash
mysql -h <host> -u <user> -p <database> < database/schema.sql
mysql -h <host> -u <user> -p <database> < database/migrations/001_create_medical_help_requests.sql
mysql -h <host> -u <user> -p <database> < database/migrations/002_add_status_and_notes.sql
mysql -h <host> -u <user> -p <database> < database/migrations/003_create_patients.sql
mysql -h <host> -u <user> -p <database> < database/migrations/004_add_treatment_plan_followups_photos.sql
mysql -h <host> -u <user> -p <database> < database/migrations/005_add_patient_priority.sql
mysql -h <host> -u <user> -p <database> < database/migrations/006_create_workers_and_assignments.sql
mysql -h <host> -u <user> -p <database> < database/migrations/007_add_patient_access_token.sql
mysql -h <host> -u <user> -p <database> < database/migrations/008_create_mediator_cases.sql
```

To grant a user administrator access to the panel, see [`database/set-administrator.sql`](database/set-administrator.sql).

## 4. Run the development server

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

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
