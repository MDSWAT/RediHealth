# Patient workspace validation

- Production build: passed; 607 static pages generated. Existing health-article tracing and Nextlytics deprecation warnings remain outside this change.
- TypeScript and targeted ESLint: passed.
- Targeted Vitest run: 6 files, 21 tests passed. Includes three aspect-preserving portrait resize cases covering portrait, landscape, and no upscaling.
- Diff whitespace check: passed.
- Impeccable detector: ran once. Reported design-system documentation advisories for introduced small type, radii, status colors, and viewer scrim/shadow; existing patient-dashboard 15px/11px type also appeared. Intended scoped media tokens are recorded by the documentation handoff.

## Browser checks

Used the existing `/en/demo` doctor workspace with fictional records. Uploaded two local, explicitly fictional document fixtures to browser-local demo data. No real patient data was accessed, uploaded, or changed. Fixture source: `.impeccable/fixtures/create-patient-fixtures.cjs`.

Checked patient summary, patient directory, dedicated Photos and documents tab, portrait and landscape attachment fit, gallery navigation, zoom/fit toggle, Escape, and restoration of keyboard focus to the originating thumbnail. Mobile checked at 390px and desktop at 1440px. Original profile at approximately 1240px was inspected before edits. Confirmed Ctrl+Home retains normal page-scrolling behavior instead of changing tabs.

Eight capture files in this directory: `desktop.png`, `mobile.png`, `photos-desktop.png`, `photos-mobile.png`, `viewer-desktop.png`, `viewer-mobile.png`, `directory-desktop.png`, `directory-mobile.png`. Native fixed bottom navigation can appear inside full-page mobile captures at the screenshot viewport boundary. The black `demo-document.png` thumbnail is the existing 1px black demo fixture.

Visual coverage is English/light demo mode. Other locale layouts, production authentication, every role, dark/comfort combinations, and browser print dialogs were not rechecked. Existing print semantics and treatment output were source reviewed and targeted tests passed. Seven locales have new media strings. Existing stored images are not rewritten; full-frame resizing applies to new portrait uploads.
