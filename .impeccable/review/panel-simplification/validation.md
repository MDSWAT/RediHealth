# Panel simplification validation

- TypeScript: `npm run typecheck` passed.
- ESLint: all three changed TSX components passed.
- Existing tests: RequestsInbox, PanelRuntime, demo-panel, and request-inbox; 4 files, 13 tests passed.
- `git diff --check` passed.
- Impeccable detector: no primary findings. The existing text-selection color `#d6e5f4` remains an advisory outside the documented palette.

Browser verification used the local `/en/demo` runtime with fictional records and the same production panel components. The live panel redirects to sign-in. No production data was changed and no deployment was performed.

Checked the default 1265px desktop viewport and a 390 × 844 mobile viewport. Verified full-width list, adjacent desktop reader and Back, full-screen mobile reader and Back, urgent filtering and clearing, search with no results and recovery, and opening/closing the patient creation dialog. The mobile reader covers the full 844px viewport. Desktop document width equals the viewport width, without horizontal page overflow. A Romanian rendering was also inspected before the final English captures.

Evidence: `desktop.jpg`, `desktop-reader.jpg`, `mobile.jpg`, `mobile-reader.jpg`. The yellow synthetic-data banner belongs to the demo only. Browser viewport overrides were reset after verification.

Capture metadata: desktop JPEGs are 1265 × 712; the mobile screenshot backend emits 375 × 812 JPEGs for the verified 390 × 844 CSS viewport. Mobile viewport dimensions and the full-height reader were checked directly against rendered DOM geometry.

The change removes the visible overview and inbox titles, introductory copy, duplicate tool directory, enclosing inbox card, and unused reader placeholder. Essential patient names, dates, form labels, folder counts, controls, and existing navigation remain. A screen-reader-only main heading preserves page orientation.

Independent finish review matched the layout to the brief and requested one documentation correction. The documenter updated only the affected PRODUCT.md and DESIGN.md statements. The reviewer scored that fix resolved with `disposition: ship`; the verdict covers the scored documentation fix. The pre-existing stale design sidecar remains unchanged.

Documentation check: compared `PanelOverview.tsx`, `RequestsInbox.tsx`, `WorkerDashboard.tsx`, and `panel-workspace.css` with `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, the panel surface brief, and the root font/panel style definitions. Merged only the affected purpose, composition, row-spacing, and removed-component descriptions into the incumbent documentation. The surface brief records the scoped open canvas, full-width default list, selection-driven desktop split, sticky reader, and fixed mobile reader. Sapphire actions, the established palette and font families, fine rules, existing patient rounding, and accessibility rules remain incumbent decisions.

Removed obsolete `panel-inbox` and `panel-tool` component entries and the directory-only spacing token from DESIGN.md; retained the shared `panel-inbox` radius used by patient portraits and viewers. Updated row padding to the implemented 16px. `git diff --check` passed after the merge. No code or browser changes were made in this documentation pass.

Not refreshed or canonized: the pre-existing sidecar remains outside this narrow merge and still contains legacy heading, inbox-boundary, tool-directory, and selected-row examples. The existing text-selection color advisory (`#d6e5f4`) is not promoted to a design token. These are recorded limitations, not repairs or new system rules.
