---
version: 1
slug: "src-app-panel-page-tsx"
primary_target: "src/app/panel/page.tsx"
related_targets: ["src/components/panel/PanelOverview.tsx","src/components/panel/RequestsInbox.tsx","src/components/panel/panel-workspace.css"]
---

# Panel workspace

Mode: Operate. Scope: panel home. The latest user request reduces containers, removes page titles, and lets necessary information fill the page. Preserve the existing product identity, authentication, role visibility, navigation, and request operations.

## Direction contract

THESIS: Requests fill a single open working canvas, with task controls directly above the information.

OWN-WORLD: White working canvas, sapphire current destinations, readable body typography, and fine rules between requests. No enclosing inbox card, duplicate tool directory, decorative statistics, or fabricated clinical data.

STORY: Staff search or filter requests, then select one to review and act. Existing sidebar and mobile navigation retain access to other tools.

FIRST VIEWPORT: The existing desktop sidebar beside a compact search/filter/action toolbar, horizontal folders, and full-width requests. Selection opens a 38/62 list/reader split; Back restores the full-width list. Phones retain the full-screen reader and bottom navigation. The page heading is available to assistive technology without a visible title or introductory copy.

FORM: Refinement of the care coordination board, candidate 6, seed c70b3de5. The user's request for fewer containers and only necessary information governs this simplification. Selecting a request keeps it in the workspace; active folders and rows provide immediate state feedback. Motion stays limited to existing control feedback.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Evidence and boundaries

The live page redirects to sign-in. Visual checks use /en/demo with fictional data and the same production components. No new raster assets. All added copy supports seven locales. The redesign changes the panel surface; public pages keep the existing design system.
