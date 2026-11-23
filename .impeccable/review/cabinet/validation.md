# Patient cabinet validation

- Production build passed: 607 static pages. Existing Nextlytics deprecation and health-article tracing warnings remain unrelated.
- TypeScript and targeted lint passed.
- Five relevant Vitest files, 18 tests passed. New cabinet tests cover actual visit/treatment/team information, truthful empty states, a single page heading, and no token rendering. Test renders use the real captcha context with scripts disabled in the test fixture; production captcha remains unchanged.
- Diff whitespace check passed.
- Mechanical design detector ran once: `detector.json` contains 13 advisory-only type/color documentation findings. Intentional cabinet tokens are recorded in the documentation handoff.

## Browser evidence

Authenticated cabinet components were exercised in `/en/demo/cabinet` using existing fictional demo records and previous DEMO ONLY photo fixtures. This route supplies a local demo callback; all view updates stay in component state. Real portal pages omit this callback and still use token-protected API calls and captcha. No real patient record or SMS authentication was used.

Verified overview, all section destinations, appointment list, simulated symptom save feedback, uncropped photo gallery, full-size image inspection, Escape/focus restoration, and phone entrance. Desktop width 1440px, mobile390px. Final mobile navigation exposes all six destinations without horizontal scrolling. Entry checks inspected the phone form without submitting a phone number or requesting SMS.

Required captures: desktop.png, mobile.png, photos-desktop.png, photos-mobile.png, viewer-mobile.png, entry-desktop.png, entry-mobile.png. Cabinet screenshots have existing demo chrome; entry screenshots have existing public chrome and cookie notice. No new product raster assets.

Uncaptured states: live patient authentication, all countries/roles/locales, dark mode, comfort combinations, and browser print dialog. Token/captcha/API handlers, SMS flow, family sharing, and printing are preserved in source; treatment rendering and public entrance tests pass. Print media keeps full-frame photo thumbnails visible.
