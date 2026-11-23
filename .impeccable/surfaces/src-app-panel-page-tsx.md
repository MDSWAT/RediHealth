---
version: 1
slug: "src-app-panel-page-tsx"
primary_target: "src/app/panel/page.tsx"
related_targets: ["src/components/panel/PanelOverview.tsx","src/components/panel/RequestsInbox.tsx","src/components/panel/panel-workspace.css"]
---

# Panel redesign

Mode: Operate. Scope: panel home and shared navigation. The user confirmed a balanced overview of panel tools and a direct implementation in code. Preserve the existing product identity, authentication, role visibility, and request operations.

## Direction contract

THESIS: A care coordination board makes the available work visible through a compact tool directory and a request inbox, replacing the former three-column email layout.

OWN-WORLD: Pale slate workspace, white working surfaces, sapphire current destinations, readable body typography, fine rules, and a single rounded inbox boundary. No decorative statistics or fabricated clinical data.

STORY: Staff orient to the workspace, open patient, calendar, video, or team tools, then review requests by status and act in the adjacent reading pane.

FIRST VIEWPORT: A 240px desktop sidebar, a 30px workspace heading with the create-patient action on the right, a unified directory, and horizontal inbox folders above a 38/62 list/reader split. Phones use compact tool destinations and the existing full-screen request reader and bottom navigation.

FORM: Care coordination board, candidate 6, seed c70b3de5. The user's balanced overview and direct-build choice govern the scope. The signature interaction is selecting a request without leaving the workspace; active folders and rows provide immediate state feedback. Motion is limited to short control feedback and stops under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Evidence and boundaries

The live page redirects to sign-in. Visual checks use /en/demo with fictional data and the same production components. No new raster assets. All added copy supports seven locales. The redesign changes the panel surface; public pages keep the existing design system.
