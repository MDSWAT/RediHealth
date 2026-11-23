# Panel redesign validation

- `npm run build`: passed; 607 static pages generated. Existing warnings concern broad health-article file tracing and deprecated Nextlytics capture options, outside this change.
- `npx tsc --noEmit`: passed.
- ESLint over all five changed/new TypeScript components and translations: passed.
- Existing targeted tests: 5 files, 19 tests passed (AdminShell, PanelRuntime, request inbox queries, demo data, demo translations).
- `git diff --check`: passed.
- Impeccable mechanical detector over changed panel TSX and CSS: no findings.

## Browser evidence

The live panel requires authentication. Browser checks used the existing local `/en/demo` runtime and the same production panel components with explicitly fictional data.

Verified request selection, desktop adjacent reader, mobile full-screen reader and Back, priority filtering, search with no results, clear-filter recovery, and the patient creation dialog. Checked desktop at 1440px, mobile at 390px, and the in-app browser's original approximately 1240px viewport. Checked Romanian mediator and English doctor rendering. No real patient records were created, edited, or deleted.

The dark reader was exercised with a temporary `.dark` wrapper in the demo layout, then the wrapper was reverted; the demo layout has no resulting diff. Status, Priority, and Internal notes resolve to `rgb(237, 243, 250)` on `rgb(23, 36, 54)`. A dark mode switch was not added.

Captures: desktop.png, mobile.png, desktop-reader.png, mobile-reader.png, dark-reader.png. Desktop/mobile PNGs are review evidence, not shipped product imagery. All seven locales have new translation entries; visual coverage does not extend to every locale, every administrative role, or every comfort preference. Authentication and backend permissions were preserved.
