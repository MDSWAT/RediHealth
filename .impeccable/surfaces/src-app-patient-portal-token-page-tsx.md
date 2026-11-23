---
version: 1
slug: "src-app-patient-portal-token-page-tsx"
primary_target: "src/app/patient-portal/[token]/page.tsx"
related_targets: ["src/components/portal/PatientPortalView.tsx","src/components/portal/ContulMeuShowcase.tsx","src/components/portal/patient-cabinet.css","src/components/portal/usePatientPortal.ts"]
---

# Patient-facing cabinet

Mode: Operate. User requested extending the redesign to the patient cabinet. Continue the established RediHealth world and code-first workflow; include the phone sign-in entrance and authenticated cabinet.

## Direction contract

THESIS: Make the patient's actual care visible on arrival, with appointments and treatment above everyday actions. Navigation persists between sections so patients can find their way back.

OWN-WORLD: Inherit slate, white, sapphire, readable type, fine rules, framed portraits, and full-frame media from the accepted panel/patient system. The phone entrance uses a plain benefits panel instead of dark photographic overlays.

STORY: Sign in by phone; recognize the personal record; check appointments and treatment; report symptoms, request a check-up, inspect documents, or read notes.

FIRST VIEWPORT: Identity and contact disclosure above a 220px desktop navigation column and care overview. Appointment and treatment columns precede patient actions and the care team. Phones show every destination in a three-column navigation grid and stack the overview content.

FORM: Extend the established care coordination world (prior seed c70b3de5), with patient-friendly language and existing care operations. Signature interaction: persistent navigation connects actual care, uploads, and full-size document inspection without losing the record context.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Boundaries

Preserve real phone authentication, token and captcha checks, symptom and appointment handlers, uploads, completion notes, sharing and printing, emergency guidance, all seven locales, and staff work. /demo/cabinet supplies a local callback that simulates writes in component state; no real server writes or clinical data are used. Preview media is the prior explicitly fictional browser-local demo data. No new product raster assets.
