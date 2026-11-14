# RediHealth Top-50 UI Refinement — Implementation Log

- **Branch:** `ui-refinement/top-50`
- **Baseline commit:** `37785fc` (`chore(ui): snapshot baseline working tree and top-50 specification`)
- **Environment note:** `chrome_devtools` MCP tools (`list_pages` / `navigate_page`) are not attached to `@implementer`'s toolset in this session; live browser checks at `http://localhost:3000` are logged as unverified by `@implementer` pending `@verifier` audit (or explicit dev server start if unreachable).

## Summary

| Phase | Items | Status | Commits | Notes |
|---|---|---|---|---|
| Phase 1 | P03, P11, P02, P09, P25, P14, P23, P22, P34, P18, P47, P41, P42, P15, P19, P36, P49 | Passed | `55e21f6..44094ce` | Passed Phase 1 gate (`@verifier` `#19`); 4 owner-ruling items (`P47`, `P41`, `P42`, `P15`) logged as done with deviations |
| Phase 2 | P33, P32, P46, P48, P17, P40, P45 | In progress | — | — |
| Phase 3 | P27, P38, P04, P26, P35, P06, P29, P28, P24, P16 | Pending | — | — |
| Phase 4 | P01, P39, P13, P44, P43, P10, P05, P07, P21, P12, P08 | Pending | — | — |
| Phase 5 | P20, P50, P30, P31, P37 | Pending | — | — |

---

## Phase 1: Defects and safe quick wins

### P03 — Every 'talk to a doctor' link goes to the doctor service (`55e21f6`)
- **Status:** Done
- **Changed files:**
  - `src/components/landing/hero/TriagePanel.tsx`: repointed bottom doctor link from `localHref("/get-help?mode=doctor", lang)` to `localHref("/medic-online", lang)`.
  - `src/lib/i18n/hero-copy.ts`: unified `doctorLink` and `problemDoctorLink` across all 7 locales (`en`, `ro`, `sq`, `it`, `hr`, `rom`, `ru`) to `"Talk to a doctor"` per Panel notes (`RED-P02`) and Ground Rule 3 single-line 320px/126% fit.
  - `src/components/landing/HelpOptions.tsx`: changed option 3 `cta` from `"See doctors"` (and equivalents) to `"Talk to a doctor"` across all 7 locales.
  - `src/components/health-check/HealthCheckExplorer.tsx`: repointed `doctorNow` routing link from `/medic-online?queue=now&source=triage` to `/medic-online/asteptare` (rebuilt commit `55e21f6` reverted leaked concurrent `{ allowManifestClips: true }` on `useReadAloud(activeLang)` back to baseline `useReadAloud(activeLang)`).
  - `src/lib/i18n/translations.ts`: updated all 7 locales of `hero.triage.options[2].actionHref` from `/get-help?mode=doctor` to `/medic-online` (zero `mode=doctor` occurrences remain in `src/`).
  - `src/components/landing/Hero.test.ts`: updated query-string localization assertion from `expect(localHref("/get-help?mode=doctor", "it")).toBe("/it/get-help?mode=doctor")` to `expect(localHref("/get-help?mode=mediator", "it")).toBe("/it/get-help?mode=mediator")` (preserves query-string routing test intent without `mode=doctor`).
- **Verification:** `grep -rn "mode=doctor" src/` (0 matches), `npx tsc --noEmit` (pass), `npx eslint src` (pass), `npx vitest run` (82/83 files, 664/665 tests; 1 pre-existing baseline failure in `src/lib/platform-revamp.test.ts:21` `isVoiceEnabled("sq")`).
- **Unverified live states:** Live browser check at `http://localhost:3000` (320px/375px/1440px) not run by `@implementer` (`chrome_devtools` MCP unavailable in worker toolset).
- **Locale notes:** `rom` (`"Vaker ekhe doktoreya"`) and `ru` (`"Поговорите с врачом"`) reuse existing approved phrases from `hero-copy.ts` / `translations.ts`; mark for native check if needed.

### P11 — Make every step count true from the first screen to the last (`acd65a4`)
- **Status:** Done
- **Changed files:**
  - `src/lib/i18n/hero-copy.ts`: replaced "3 quick steps" / "3 questions" in `needs.risk.hint` (all `<= 48` chars per `Hero.test.ts:374`) and `needs.risk.body` across all 7 locales (`en`, `ro`, `sq`, `it`, `hr`, `rom`, `ru`) with honest "a few short steps" / "a few short questions" wording.
  - `src/lib/i18n/health-check-translations.ts`: replaced "3 questions" in `ui.subtitle` across all 7 locales (`en`, `ro`, `sq`, `it`, `hr`, `rom`, `ru`).
  - `src/components/health-assistant/assistant-copy.ts`: updated `ru` `machine.intro` from `"Руководство из 3 шагов"` to `"Пошаговое руководство"` so Step 1 has zero misleading `3` step promises across all 7 locales.
  - `src/components/health-assistant/TriageStateMachine.tsx`: Step 1 header now renders `copy.machine.intro` (no total before pathway selection) and keeps `accessibleStepText` (`state.pathway ? stepLabel : copy.machine.intro`) for `aria-valuetext` and the `sr-only` `aria-live="polite"` footer (`:539`, already non-visible in baseline); steps `>= 2` show `{stepLabel}` in words at all widths (`3` or `4` fixed per pathway, dropping `sm:hidden {displayStep}/{totalSteps}`).
  - `src/components/health-check/HealthCheckExplorer.tsx`: rendered words-only `{stepIndicatorText}` at all widths inside `<p className="... whitespace-nowrap ...">`, hid page `ui.subtitle` after `"area"` (Panel `RED-P08` #3), and removed `KeyBadge` rendering on rows + `<kbd>⌫</kbd>` on Back (Panel `RED-P08` #4) while preserving radio checkboxes, `aria-keyshortcuts`, `data-hotkey`, keyboard handlers, segmented progress bar, and existing step total calculation (Panel rejected `LIT-P03` stage remap).
- **Mismatch note:** `TriageStateMachine.tsx` footer (`:539`) was already `className="sr-only"` (not visibly duplicated); retained for screen-reader live announcements. `assistant-copy.ts` `PathwayRisk` `"3 questions"` copy kept intact (`CareToolsConsistency.test.ts:151`).
- **Verification:** Grep across `hero-copy.ts` and `health-check-translations.ts` returned 0 "3 questions"/"3 steps" matches; `grep -rn "KeyBadge" HealthCheckExplorer.tsx` returned 0 matches; `npx tsc --noEmit` (pass), `npx eslint src` (pass), `npx vitest run` (84/84 test files, 683/683 tests passed; no P11 test assertions weakened).
- **Unverified live states:** Live browser check at `http://localhost:3000` (375px/1440px) not run by `@implementer` (`chrome_devtools` MCP unavailable).
- **Locale notes:** Updated `rom` (`"nekobor skurte pasha"`, `"nekobor skurte phuchimata"`) and `ru` (`"за несколько шагов"`, `"на несколько коротких вопросов"`, `"Пошаговое руководство"`) phrases; mark for native check.

### P02 — Label every exit on the symptom-check result (`eaae1d0`)
- **Status:** Done
- **Changed files:**
  - `src/components/health-check/HealthCheckExplorer.tsx`: replaced `renderRoutingStack`'s icon-only squares with stacked/wrapping whole-button links (`flex flex-col gap-2 sm:flex-row sm:flex-wrap`) in priority order: `c.doctorNow` (`primaryButton` -> `/medic-online/asteptare` with `StethoscopeIcon`), `c.doctorBook` (`secondaryButton` -> `/medic-online?source=triage`), and `placeLabel` (tertiary text link with `PinIcon`); removed unused `routingIconButton` and removed `min-w-0 truncate` so labels never truncate.
  - `src/components/ui/SingleLineAndFilterConsistency.test.ts`: updated `renderRoutingStack` assertion intentionally to reflect P02's stacked/wrapping labelled buttons (`expect(routingMatch?.[0]).toContain("flex-nowrap")` -> `expect(routingMatch?.[0]).toContain("sm:flex-wrap"); expect(routingMatch?.[0]).toContain("whitespace-nowrap");`), preserving single-line label intent (`ZeroTwoLineButtonsAllLocales.test.ts:184-192` checks `whitespace-nowrap` on every `<Link>`).
- **Verification:** `npx tsc --noEmit` (pass), `npx eslint src` (pass), `npx vitest run` (84/84 test files, 683/683 tests passed, including `printSummary.test.ts`, `ZeroTwoLineButtonsAllLocales.test.ts`, `SingleLineAndFilterConsistency.test.ts`).
- **Unverified live states:** Live browser check at `http://localhost:3000` (375px/1440px in `en`, `sq`, `rom`) not run by `@implementer` (`chrome_devtools` MCP unavailable).

### P09 — Keep the feedback survey away from tasks and small screens (`c8c08df`)
- **Status:** Done
- **Changed files:**
  - `src/components/layout/FeedbackWidget.tsx`: replaced `isClinicalTaskSurface` exclusion with an allow-list (`/` home, `/health-information` guides index, `/about`, and guide detail routes `/health-information/...` only after scrolling near the end of `<article>`/`<main>`); suppressed floating auto-invite and added `max-lg:hidden` below `1024px` as well as when `dialog[open]`, `[data-bottom-bar]`, or `.hh-dialog` (active audio player / term dialog) is mounted; removed desktop right-edge vertical side tab (`RED-P11`) and unused `mobileScrollTucked` scroll listener; flattened floating invite card (removed `h-1 bg-sapphire` bar and inner bordered box) with `text-body` (16px) card title, body, quick-scale hint, and scale end labels plus `text-sm` buttons.
  - `src/components/layout/ReportIssueWidget.tsx`: removed the desktop floating bottom-right `report-issue-trigger` icon square (`RED-P11`) and unused `openDialog` helper, retaining `<dialog>` and `openReportIssue()` for Header/Footer links.
- **Verification:** `npx eslint src` (0 errors, 0 warnings), `npx tsc --noEmit` (pass), `npx vitest run` (84/84 test files, 683/683 tests passed, including `ChromeConsistency.test.ts`).
- **Unverified live states:** Live browser check at `http://localhost:3000` (`INITIAL_EXPLORE_MS` timer behavior on `/en/health-assistant`, `/en/find-help`, `/en/get-help`, `/en` at 375px/1440px) not run by `@implementer` (`chrome_devtools` MCP unavailable).

### P25 · Make the 112 strip a 44px row; trim the phone header bar to keep height
- **Commit:** `559bf65` — **Status:** `done` (native check suggested for `ru`)
- **Files:** `src/components/layout/UniversalEmergencyBanner.tsx`, `src/components/layout/chrome-copy.ts`, `src/components/layout/Header.tsx`, `src/app/globals.css`, `src/components/layout/FullScreenAndGlobalSearch.test.ts`, `src/components/layout/ChromeConsistency.test.ts`
- **Notes:** Applied Chair ruling keeping `text-body` on `UniversalEmergencyBanner` (instead of `text-[0.9375rem]`) and shortening `ru.emergencyQuestion` to `"Экстренно?"` so the 360px single-row strip fits without wrapping; grouped warning icon, prompt text, and `112` button together with `gap-2`, separated from the `h-11 w-11` (`CloseIcon h-4 w-4`) dismiss button by `gap-4` (`AGE-P05`). After Phase 1 audit (`#16`) flagged `<p>` horizontal clipping/overflow across locales at `320px`/`360px` (`100%`/`114%`/`126%`), added `call112Short` per locale in `chrome-copy.ts` (`ro`: `"Sună la 112"`, `en`: `"Call 112"`, `sq`: `"Thirr 112"`, `it`: `"Chiama 112"`, `hr`: `"Nazovi 112"`, `rom`: `"Akhar 112"`, `ru`: `"Вызов 112"`), tightened `< md` container/inner spacing (`max-md:gap-[16px] max-md:px-[10px]`, inner `max-md:gap-[6px]`), added `max-md:shrink-0` on `<p>`, and rendered `chrome.call112Short` below `md` with `max-md:px-[4px]` (`e.call112` on `md+`). Trimmed phone `Header` bar height to `h-14 md:h-16`, updated `publish()` `--site-header-h` calculation (`bar = >=768px ? 64 : 56`), updated `globals.css` static fallback (`6.3125rem` mobile / `6.8125rem` md / `7rem` xl), and raised mobile menu 112 button to `min-h-12 ... text-body` with `PhoneIcon h-4 w-4`. Native `ru` check suggested for `"Экстренно?"` and `"Вызов 112"`.
- **Test updates:**
  - `src/components/layout/FullScreenAndGlobalSearch.test.ts`: ``"`${strip + 64}px`"`` / `"h-16"` -> ``"`${strip + bar}px`"`` / `"h-14 md:h-16"`.
  - `src/components/layout/ChromeConsistency.test.ts`: `"min-h-11 shrink-0 rounded-lg"` -> `"min-h-12 shrink-0 rounded-lg"`.
- **Verification:** `npx tsc --noEmit` (pass), `npx eslint src` (0 errors, 0 warnings), `npx vitest run` (reverified cleanly at phase gate on committed `55e21f6..44094ce`: `ChromeConsistency.test.ts` and `FullScreenAndGlobalSearch.test.ts` pass).
- **Unverified live states:** Live browser visual inspection at 320px/360px/375px/1440px across en/ro/ru and 114%/126% text scales after `559bf65` fix not run by `@implementer` (`chrome_devtools` MCP unavailable).

### P14 · Stop motion that loops or follows the pointer
- **Commit:** `bb82357` — **Status:** `done`
- **Files:** `src/components/ui/PointerSpotlight.tsx` (deleted), `src/components/layout/SiteChrome.tsx`, `src/app/globals.css`, `src/components/landing/WheelBackdrop.module.css`, `src/components/landing/HealthTopicsWheel.module.css`, `src/components/landing/HealthTopicsWheel.tsx`, `src/components/landing/HealthTopicsSpotlight.tsx`, `src/components/landing/HealthTopicsWheel.test.ts`, `src/components/health-assistant/TriageDecisionTree.tsx`, `src/components/telemed/MedicOnlineHero.tsx`, `src/components/landing/hero/TriagePanel.tsx`, `src/components/health-assistant/step-ui.ts`, `src/components/health-assistant/PrescriptionReview.tsx`, `src/components/health-assistant/TriageInputBar.tsx`, `src/components/health-assistant/TriageStateMachine.tsx`, `src/components/health-check/HealthCheckExplorer.tsx`, `src/components/health-information/HealthArticleDirectory.tsx`, `src/components/health-information/HealthArticleShell.tsx`, `src/components/health-information/HealthInformationTopicGrid.tsx`, `src/components/health-information/InformedHealthDirectory.tsx`, `src/components/landing/HealthTopics.tsx`, `src/components/landing/HelpOptions.tsx`, `src/components/landing/HelpOptionsMediatorBand.tsx`, `src/components/landing/TrustSection.tsx`, `src/components/find-help/FindHelpExplorer.tsx`, `src/components/find-help/FindHelpPageContent.tsx`, `src/components/find-help/FindHelpPrompt.tsx`, `src/components/layout/Footer.tsx`, `src/components/layout/Header.tsx`, `src/components/news/NewsHub.tsx`, `src/components/news/PlaceNewsModal.tsx`, `src/components/portal/PatientPortalView.tsx`, `src/components/portal/PortalLinkExpired.tsx`, `src/components/portal/SmsPhoneAuthModal.tsx`, `src/components/search/SmartSearchModal.tsx`, `src/components/telemed/AppointmentBookingCalendar.tsx`, `src/app/contact/page.tsx`, `src/app/not-found.tsx`
- **Notes:** Removed `<PointerSpotlight />` and deleted `PointerSpotlight.tsx`. Removed continuous spin keyframes/animations from `WheelBackdrop.module.css` and `HealthTopicsWheel.module.css`, removed hover `scale: 1.08`, and stopped `--hl-phase` / `data-wheel-clock` / `held` polling in `HealthTopicsWheel.tsx` and `HealthTopicsSpotlight.tsx`; switched wheel hover/focus/picked face states to `var(--color-sapphire)` while preserving Roma wheel SVG drawing strokes (`Keep`) and `HealthTopicsSpotlight.tsx:177` active panel face class (`bg-primary text-white [--wheel-face-bg:var(--color-primary)]`, targeted specifically by `ChromeConsistency.test.ts:84` and outside `P14` `:167` target). Removed `surface-spotlight` / `edge-light` CSS rules and all component occurrences. Removed `link-draw` from all 23 non-paragraph interactive links/cards (keeping utility available for prose paragraphs) and removed `arrow-travel` from rows, tiles, and secondary links while retaining it solely on the single primary CTA per view. In rebuilt commit `bb82357` (per `@verifier` `#16`), stripped all accidentally committed concurrent PWA imports/hooks/UI (`@/lib/i18n/pwa-copy`, `@/lib/pwa/pwa-state`, `@/components/pwa/PwaExperience`, `DownloadIcon`, `RefreshIcon`, `initPwaRuntime()`, `<PwaExperience />`) from `SiteChrome.tsx`, `Footer.tsx`, and `Header.tsx`, and updated `Footer.tsx` column link `<span>` to `<span className="min-w-0 [overflow-wrap:anywhere]">{link.label}</span>` so long labels such as `ru` `col4Link4` (`"Конфиденциальность и защита данных (GDPR)"`) wrap inside `320px` instead of forcing `327px` overflow.
- **Test updates:**
  - `src/components/landing/HealthTopicsWheel.test.ts`: replaced `"pauses wheel CSS and marks held item"` / `".lit"` / `"animation-play-state: paused"` / `"data-wheel-held"` assertions with assertions verifying wheel CSS has no `@keyframes` / `.lit` / `scale:` / `animation:` and uses sapphire focus/picked styling while `selectTopic(slug)` persists `data-picked`.
- **Verification:** `npx tsc --noEmit` (pass), `npx eslint src` (0 errors, 0 warnings), `npm run build` in clean `.agents/clean-verify` passed cleanly without untracked PWA modules (`257/257` static pages), and `grep -rnE "surface-spotlight|wheel-highlight|hero-wheel-spin|wheel-spin|PointerSpotlight|arrow-travel|link-draw" src/` + `grep -rn "pwa" src/components/layout/` clean in committed code.
- **Unverified live states:** Live browser visual inspection at 320px/360px/375px/1440px across en/ro/ru and reduced motion not run by `@implementer` (`chrome_devtools` MCP unavailable).

### P23 · Calm the hero panel so only the row under your finger reacts
- **Commit:** `343f3e3` — **Status:** `done`
- **Files:** `src/components/landing/hero/TriagePanel.tsx`, `src/components/landing/Hero.tsx`, `src/lib/i18n/hero-copy.ts`, `src/app/globals.css`, `src/components/landing/Hero.test.ts`
- **Notes:** Removed `floatRef`/`stepFloat`/`handlePanelPointerMove`/`handlePanelPointerLeave` and the pointer-tracking sheen `<div>` from `TriagePanel.tsx`. Stripped border and shadows from the follower plate so it renders `bg-sapphire-soft` only, removed `translate-x-0.5` and `shadow-2xs` on row icon/label, and kept colour-only chevron hover transition. Set `progressScale` strictly from `step` (`0.5` on Step 1, `1` on Step 2). Removed `idleNudge` state, 7s timer, amber nudge ring, `hoveredMediators` state, `AnimatePresence` subtitle lift, and `mediators`/`returned`/`idle` subtitle variants across all 7 locales in `hero-copy.ts`, keeping one static footer line (`subtitles.default` across every viewport width, switching to `subtitles.speaking` while reading aloud; neutral text token upgraded from off-palette `text-stone-500`/`text-stone-600` to `text-ink-950/70`/`text-ink-950/75` for WCAG contrast on `bg-paper`). Removed `hero-enter` from `Hero.tsx` and `@keyframes hero-enter` / `.hero-enter` / dead `.hero-enter > ol` from `globals.css` so the hero headline paints visibly immediately. Note: `copy.panel.needs[id].hint` keys remain in `hero-copy.ts` because `Hero.test.ts` explicitly checks their 48-char bounds.
- **Test updates:**
  - `src/components/landing/Hero.test.ts`: updated `column` slice from `html.indexOf("hero-enter")` to `html.indexOf("hero-grid")` while asserting `id="hero-title"` and absence of `hero-enter`; replaced `.hero-enter` / `@keyframes hero-enter` CSS matchers with negative `.hero-enter` check plus reduced-motion `.quiz-result` / `.triage-view` static checks.
- **Verification:** `npx tsc --noEmit` (pass), `npx eslint src` (0 errors, 0 warnings), `npx vitest run` (87/87 test files, 709/709 tests passed), and leftover-symbol grep clean.
- **Unverified live states:** Live browser visual inspection at 360px/375px/1440px across en/ro/ru and reduced motion not run by `@implementer` (`chrome_devtools` MCP unavailable).

### P22 · Open the news page on the list on phones, the map one tap away
- **Commit:** `ab0ee2e` — **Status:** `done`
- **Files:** `src/components/ui/romania-county-map-helpers.ts` (new), `src/components/ui/RomaniaCountyMap.tsx`, `src/components/news/NewsHub.tsx`
- **Notes:** Applied `MOB-P16` + `RED-P09` / `MOB-P06` panel consensus: initialized `NewsHub` `showMap` from `useSyncExternalStore` `(min-width: 1024px)` media query with SSR server snapshot `false` plus manual toggle state (`mapOverride ?? isDesktopLayout`) so phones load collapsed on the news list without hydration flash while desktop `>=1024px` keeps the map open by default. Split lightweight map metadata (`ALL_*`, `EXTRA_MAP_COPY`, `mapCountriesForLang`, `countryAllValue`, `MapCountry`) out of `RomaniaCountyMap.tsx` into `romania-county-map-helpers.ts` (and re-exported from `RomaniaCountyMap.tsx` so `croatia-moldova-news.test.ts` and modal callers remain intact) so `NewsHub.tsx` can lazy-load `RomaniaCountyMap` via `next/dynamic` (`{ ssr: false }`) strictly when `showMap` becomes `true`, keeping heavy geo SVG modules out of initial bundles. Removed the duplicate icon-only page search button in `NewsHub.tsx` (header SmartSearch covers `NEWS_ARTICLES`) and removed inner `truncate` on `Show map` / `Hide map` button label (`Rule 3`).
- **Verification:** `npx tsc --noEmit` (pass), `npx eslint src` (0 errors, 0 warnings), `npx vitest run` (87/87 test files, 709/709 tests passed).
- **Unverified live states:** Live browser check at 375x812 and 1280px (dynamic chunk fetch on `Show map` tap) not run by `@implementer` (`chrome_devtools` MCP unavailable).

### P34 · Leave the page scrollable around the phone map
- **Commit:** `b8d5e6f` — **Status:** `done`
- **Files:** `src/components/find-help/FindHelpExplorer.tsx`
- **Changes:**
  - Shortened mobile `< lg` map container height from `h-[max(20rem,calc(100dvh-var(--chrome-h,0px)-7.5rem))]` (and `min(46dvh,24rem)` with preview) to `h-[min(62svh,30rem)]` (`h-[min(46svh,24rem)]` with preview sheet), keeping desktop `lg:h-[min(42rem,calc(100dvh-var(--chrome-h,0px)-7.5rem))]` unchanged.
  - Added `pb-24 lg:pb-0` to `mapColumnRef` for clearance above the fixed bottom switch bar.
  - Added `statusRowRef` (`scroll-mt-[calc(var(--chrome-h,0px)+0.75rem)]`) on the `"Near <City>, <Country> · N results"` status row so `switchMobileView("map")` scrolls the status bar cleanly below `--chrome-h`.
  - Added a full-width outlined `Back to list` (`copy.viewList`) `min-h-12 text-base whitespace-nowrap lg:hidden` button beneath the phone map column calling `switchMobileView("list", selectedId)`.
  - Preserved Leaflet `dragging` and `touchZoom` settings in `InstitutesMapInner.tsx` (`Keep`). Added `setMobilePreviewId` to `selectInstitute`'s `useCallback` dependencies to satisfy `react-hooks/preserve-manual-memoization`.
- **Verification:** `npx tsc --noEmit` (pass), `npx eslint src` (0 errors, 0 warnings), `npx vitest run` (87/87 test files, 709/709 tests passed).
- **Unverified live states:** Live browser touch-scroll check around the phone map and `Back to list` scroll restoration at 360x740 / 375x812 not run by `@implementer` (`chrome_devtools` MCP unavailable).

### P18 · Put the photo tips first and offer a person when reading fails
- **Commit:** `ff73b2c` — **Status:** `done` (needs native check on `ru` & `rom` copy)
- **Files:** `src/components/health-assistant/PrescriptionReview.tsx`
- **Changes:**
  - Renamed page `title` across all 7 locales to `"Explain my prescription"` equivalents (also replacing Albanian `"Verifikimi i recetës"` with `"Shpjego recetën time"`).
  - Replaced the 3-card `guidanceHeading` + `tipFlat`/`tipLight`/`tipFull` box (and removed unused `tipIconProps`, `TipFlatIcon`, `TipLightIcon`, `TipFullIcon`) with a single `tipLine` paragraph placed directly under `dropTitle` above the camera/gallery buttons; updated `handleHeaderListen` (`voice.speak([t.title, t.subtitle, t.tipLine])`).
  - Removed file-format jargon `(JPEG, PNG or WebP)` from `dragOrBrowse` in all 7 locales and hid it below `lg` (`hidden lg:block`), placed cleanly after the buttons; removed `min-w-0 truncate` from `cameraCapture` and `galleryUpload` button spans.
  - Rewrote `fileErr` and `rateLimitErr` in plain everyday words across all 7 locales; replaced string `error` state with `errorKind` + shared `errorAlert` JSX helper so both alert containers (upload step and preview/submit step) render `reviewErr` followed by an inline link (`reviewErrLink`) to `/get-help?mode=mediator` via `withLangPrefix`.
- **Verification:** `npx tsc --noEmit` (pass), `npx eslint src` (0 errors, 0 warnings), `npx vitest run` (87/87 test files, 716/716 tests passed).
- **Native check needed:** New `ru` and `rom` copy for `title`, `tipLine`, `dragOrBrowse`, `fileErr`, `rateLimitErr`, `reviewErr`, and `reviewErrLink`.
- **Unverified live states:** Live browser check at 360x740 / 1440x900 across locales (`en`/`ro`/`ru`), light/dark, and simulated 429/500 failure states not run by `@implementer` (`chrome_devtools` MCP unavailable).

### P47 · Make the doctor booking words exact on the step that commits
- **Commit:** `12f062d` — **Status:** `done with deviations` (pending owner confirmation; native check needed on `ru` & `rom`)
- **Files:** `src/components/telemed/AppointmentBookingCalendar.tsx`, `src/lib/i18n/translations.ts`
- **Changes:**
  - Updated `availableHours` (`"Times you can choose, {date}"` equivalents), `slotDuration` (`"A call lasts 20 minutes"` / spelled-out minutes across all 7 locales), `summaryTimePending` (`"Choose a time first"` equivalents removing directional words `"left"` / `"stânga"`), and `confirmBooking` (`"Book the call"` equivalents across all 7 locales) in `calendarCopy`.
  - Enabled `flex-wrap` on the Step 2 bottom action bar and removed `min-w-0 truncate` on `back` and `confirmBooking` button spans so labels remain untruncated on one line (`whitespace-nowrap`).
  - Standardized `/get-help` `getHelpPage.form.phonePlaceholder` to `"0721 000 000"` across all 7 locales in `translations.ts`.
- **Deviations / Pending owner decisions:**
  - **Step 4 omitted per owner ruling:** Booking-code purpose line under `codeLabel` (`"Keep this code. You only need it if you call us."`) in `BookingSmsConfirmation.tsx` requires owner confirmation of actual support/telephony workflow before shipping.
  - **Step 5 omitted per owner ruling:** `medic-online` specialty (`"Family doctors and children's doctors"`) and encryption (`"Only you and the doctor hear the call."`) copy changes require clinical/owner sign-off before shipping.
- **Verification:** `npx tsc --noEmit` (pass), `npx eslint src` (0 errors, 0 warnings), `npx vitest run` (87/87 test files, 716/716 tests passed).
- **Native check needed:** Updated `ru` and `rom` `availableHours`, `slotDuration`, `summaryTimePending`, and `confirmBooking` strings.
- **Unverified live states:** Live browser walkthrough of `/medic-online/programare` and `/get-help` at 320px/375px in `en`/`ro`/`rom` not run by `@implementer` (`chrome_devtools` MCP unavailable).

### P41 · Replace "Anatomy: general / female" with a plain women's-body switch
- **Commit:** `3edbd58` — **Status:** `done with deviations` (pending clinical owner confirmation; native check needed on `ru` & `rom`)
- **Files:** `src/components/health-check/health-check-copy.ts`, `src/components/health-check/HealthCheckExplorer.tsx`
- **Changes:**
  - Unified `bodyTypeLabel` to `"Body"` equivalents across all 7 locales and removed unused `bodyModelLabel`.
  - Renamed `bodyFemale` to `"Woman"` equivalents (`"Woman"`, `"Femeie"`, `"Женщина"`, `"Grua"`, `"Donna"`, `"Žena"`, `"Dzhuvli"`) across all 7 locales.
  - Simplified the Step 1 setup summary line in `HealthCheckExplorer.tsx` to `"{For me / For a child}, {General / Woman}"` (removing the `"anatomy:"` prefix and mid-sentence lowercasing, and avoiding `·` per owner ruling).
  - Added conditional `bodyGeneralHelper` text beneath the `Body` radio group whenever `bodyProfile === "general"` is selected.
- **Deviations / Pending owner decisions:**
  - **Kept `bodyGeneral` as `"General"` per owner ruling:** Did not rename `"General"` to `"Man"` across `health-check-copy.ts` pending clinical owner sign-off on how to label the general body model.
- **Verification:** `npx tsc --noEmit` (pass), `npx eslint src` (0 errors, 0 warnings), `npx vitest run` (87/87 test files, 716/716 tests passed).
- **Native check needed:** New `ru` and `rom` strings for `bodyTypeLabel`, `bodyFemale`, and `bodyGeneralHelper`.
- **Unverified live states:** Live browser toggle & voice check of Step 1 setup row (`Change` drawer, `Woman` vs `General` helper text) at 375px in `en`/`ro`/`ru` not run by `@implementer` (`chrome_devtools` MCP unavailable).

### P42 · Use one word for severity and fix the contradictory and mistranslated scales
- **Commit:** `2e81690` — **Status:** `done with deviations` (pending clinical owner confirmation; native check needed on `ru` & `rom`)
- **Files:** `src/lib/i18n/health-check-translations.ts`
- **Changes:**
  - Unified `step3Title` / `intensityLabel` and `durationLabel` labels across all 7 locales (e.g. `en`: `"How bad"` / `"How long"`, `"How bad is it, and for how long?"`; `ro`: `"Cât de tare"` / `"De când"`; `ru`: `"Насколько сильно"` / `"Как давно"`; `sq`: `"Sa keq"` / `"Prej sa kohësh"`; `it`: `"Quanto è forte"` / `"Da quanto tempo"`; `hr`: `"Koliko je jako"` / `"Koliko dugo"`; `rom`: `"Kozom zurales"` / `"Katar kana"`).
  - Stripped trailing periods from `ru` `urgency.low.title` and `ru` `urgency.medium.title` (`urgency.high.title` already lacked a period).
  - Normalized non-clinical `rom` spelling (`"Bičhal pe WhatsApp"` -> `"Bichhal pe WhatsApp"`).
- **Deviations / Pending owner decisions:**
  - **Left clinical duration hints & severity definitions unchanged per owner ruling:** Did not modify clinical duration threshold hints (`Under 24 hours`, etc.) or severity scale clinical definitions (`Слабо / Средне / Сильно`, etc.) across `src/lib/i18n/health-check-translations.ts` pending clinical owner approval.
- **Verification:** `npx tsc --noEmit` (pass), `npx eslint src` (0 errors, 0 warnings), `npx vitest run` (87/87 test files, 716/716 tests passed).
- **Native check needed:** Updated `ru` and `rom` Step 3 questions/headings/summary labels (`step3Question`, `severityHeading`, `durationHeading`, `intensityLabel`, `durationLabel`).
- **Unverified live states:** Live browser check of `/health-check` Step 3 & Step 4 summary across `en`/`ro`/`ru` at 360px/1440px and 126% scale not run by `@implementer` (`chrome_devtools` MCP unavailable).

### P15 · Use one plain alarm-signs list everywhere 112 is offered
- **Commit:** `a4337e2` — **Status:** `done with deviations` (pending clinical owner confirmation; native check needed on `ru` & `rom`)
- **Files:** `src/lib/i18n/emergency-signs.ts`, `src/components/health-assistant/assistant-copy.ts`, `src/components/health-assistant/HealthAssistant.tsx`, `src/lib/i18n/hero-copy.ts`
- **Changes:**
  - Created `src/lib/i18n/emergency-signs.ts` exporting `PLAIN_ALARM_SIGNS` from the existing approved `gate.plainSigns` strings across all 7 locales so hero `emergency.alarmSigns`, `assistant-copy.ts` `gate.plainSigns`, and the `HealthAssistant` 112 aside share one source without pulling `assistant-copy.ts` into the home bundle.
  - Reformatted `HealthAssistant.tsx` `<aside>` to heading (`"Call 112 if you have:"` equivalents) + plain bullet list + Call 112 button + updated `emergencyDisclaimer` (`"You must call 112 yourself."` equivalents), deleting `emergencyNotice`.
  - Updated `hero-copy.ts` `panel.problemDoctorPrompt` to `"None of these?"` equivalents across all 7 locales (`ru`: `"Ничего из этого?"`) and updated `ru` `needs.problem.label` to `"Мне сейчас плохо"`.
- **Deviations / Pending owner decisions:**
  - Kept the pre-existing approved wording of `gate.plainSigns` unmodified per owner ruling (including the existing `ru` phrasing `"тяжелая тяжесть."`).
- **Verification:** `npx tsc --noEmit` (pass), `npx eslint src` (0 errors, 0 warnings), `npx vitest run` (87/87 test files, 716/716 tests passed).
- **Native check needed:** New `ru` and `rom` strings for `HealthAssistant` `emergencyHeading`/`emergencyDisclaimer` and `hero-copy.ts` `problemDoctorPrompt`.
- **Unverified live states:** Live browser check of `/` problem branch and `/health-assistant` aside in `en`/`ro`/`ru` at 360px/1440px not run by `@implementer` (`chrome_devtools` MCP unavailable).

### P19 · Remove the topic page's repeated callout and give the dictionary one quiet line
- **Commit:** `75baafb` — **Status:** `done` (native check needed on `ru` & `rom`)
- **Files:** `src/components/health-information/HealthArticleShell.tsx`, `src/components/health-information/TopicHeroSection.tsx`, `src/components/health-information/TopicDetailPageContent.tsx`
- **Changes:**
  - Deleted the Detailed-mode `"Extended clinical context"` callout (`clinicalContextBadge`, `clinicalPriorityLabel`, `clinicalAlertLabel` removed from `TopicPageUiStrings` across all 7 locales and unused `firstRecommendation` / `firstWarningSign` / `isComplete` removed).
  - Removed the bordered dictionary and Romani glossary box (`dualGlossaryTitle` / `romanesGlossaryTitle` card) near the bottom of topic guide pages.
  - Added optional `afterActions` slot to `HealthArticleHeader` (`HealthArticleShell.tsx`) and `TopicHeroSection.tsx` and rendered one quiet inline paragraph directly below the Listen and reading-level controls containing `min-h-11` underlined sapphire `<button>` links (`dictionaryPrompt`, `dualGlossaryCta`, `romanesGlossaryCta`) across all 7 locales using `/` instead of `·` to satisfy `HealthArticlesConsistency.test.ts`.
  - Left `WarningSignsEmergencyCard`, `TopicNextSteps`, and both glossary drawers intact.
- **Verification:** `npx tsc --noEmit` (pass), `npx eslint src` (0 errors, 0 warnings), `npx vitest run` (87/87 test files, 716/716 tests passed).
- **Native check needed:** `ru` (`"Сложные слова?"`, `"Слова на цыганском"`) and `rom` (`"Phare lava?"`, `"Lava pe romani chib"`) dictionary line labels.
- **Unverified live states:** Live browser check of `/en/health-information/heart-health` in Easy/Detailed mode and drawer triggers at 375px/1440px not run by `@implementer` (`chrome_devtools` MCP unavailable).

### P36 · Remove decorative work from the phone home's first paint
- **Commit:** `b1086fc` — **Status:** `done`
- **Files:** `src/components/landing/WheelBackdrop.module.css`, `src/components/layout/Footer.tsx`, `src/components/landing/Hero.tsx`, `src/components/landing/Hero.test.ts`
- **Changes:**
  - Wrapped `WheelBackdrop` in `<div aria-hidden="true" className="hidden lg:block">` in `Hero.tsx` and `Footer.tsx`, and added `@media (max-width: 1023px) { .backdrop, .hero, .footer { display: none; } }` in `WheelBackdrop.module.css` (preserving reduced-motion and `html[data-calm-motion]` rules).
  - Replaced `<Image>` in `Hero.tsx` with `getImageProps` + `<picture>` featuring `<source media="(min-width: 1024px)" ... />` and a `data:image/gif` transparent pixel fallback so `< 1024px` viewports keep the solid ink ground and gradient wash without requesting `hero-consultation.jpg`, while preserving desktop eager loading and `fetchPriority="high"`.
  - Verified Step 3 (`hero-enter` opacity step) was already absent from `Hero.tsx` and `src/app/globals.css`.
- **Test assertion updated (`src/components/landing/Hero.test.ts`):**
  - *Before:* `it("shows the hero photo as an ambient top wash on phones and full-bleed from lg, loaded eagerly", () => { ... expect(hero).toMatch(/loading="eager"\s+fetchPriority="high"/); ... })`
  - *After:* `it("keeps the hero photo desktop-only via getImageProps and <picture> source while hiding WheelBackdrop below lg", () => { ... expect(hero).toMatch(/getImageProps\(/); expect(hero).toMatch(/<source\s+media="\(min-width: 1024px\)"/); expect(hero).toMatch(/loading:\s*"eager"[\s\S]*fetchPriority:\s*"high"/); expect(hero).toMatch(/hidden lg:block[\s\S]*<WheelBackdrop placement="hero"/); ... })` — preserving the intent of desktop eager loading, zero `priority`/`quality=`, and desktop-only scrims.
- **Verification:** `npx tsc --noEmit` (pass), `npx eslint src` + `npx eslint src/components/landing/Hero.tsx` (0 errors, 0 warnings), `npx vitest run` (87/87 test files, 716/716 tests passed).
- **Unverified live states:** Live browser network/animation audit on `/en` and `/ro` at 375px and 1280px (`hero-consultation.jpg` skipped on mobile, zero `WheelBackdrop` paint on phones, LCP element check) not run by `@implementer` (`chrome_devtools` MCP unavailable).

### P49 · Inputs at 16px with visible labels, and a way to resend codes
- **Commit:** `44094ce` — **Status:** `done` (panel uncertainty noted on email resend reuse; native check needed on `ru` & `rom`)
- **Files:** `src/components/find-help/FindHelpExplorer.tsx`, `src/lib/i18n/find-help-translations.ts`, `src/components/health-assistant/PrescriptionReview.tsx`, `src/components/layout/ReportIssueWidget.tsx`, `src/components/auth/SignInForm.tsx`, `src/lib/i18n/translations.ts`, `src/components/portal/SmsPhoneAuthModal.tsx`, `src/components/ui/RomaniaCountyMap.tsx`
- **Changes:**
  - `FindHelpExplorer.tsx` & `find-help-translations.ts`: moved `copy.searchPlaceholder` into a visible `<label htmlFor="find-help-search">` above `<input id="find-help-search">`, aligned row `xl:items-end`, removed `sm:text-sm` so search input stays `text-base`, and shortened `searchHint` to city examples (`"e.g. Bucharest"`, `"de ex. București"`, `"напр. Бухарест"`, `"p.sh. Bukuresht"`, `"es. Bucarest"`, `"npr. Zagreb"`, `"misal: Bukuresht"`).
  - `PrescriptionReview.tsx` & `ReportIssueWidget.tsx`: set `<textarea id="prescription-context">` and ReportIssueWidget `fieldClass` to `text-base` across all viewports (removed conditional `text-sm` / `sm:text-sm`).
  - `RomaniaCountyMap.tsx` (Phase 1 audit `#16` fix): upgraded `<select id={selectId}>` from `text-sm` to `text-base` so the mobile `/stiri` county picker stays 16px without iOS zoom.
  - `SignInForm.tsx` & `translations.ts`: added `resendCode` and `codeResent` keys across `Translations["signInPage"]["form"]` and all 7 locales; added `Resend code` (`whitespace-nowrap min-h-11`) button calling `requestCode(true)` against the existing `/api/auth/email-code/request` route and a polite `role="status"` confirmation (`aria-describedby` linked when shown). After Phase 1 audit (`#16`) flagged `320x640` Stage 1 & Stage 2 button overflow/truncation at `100%`/`126%`, adjusted card container padding (`p-4 sm:p-10`), removed inner `<span className="min-w-0 truncate">` wrappers on all buttons, adjusted Stage 2 secondary button padding (`px-1.5`) & `gap-x-3` and Google button padding (`px-3 sm:px-4`), and shortened `signInPage.form` button labels across all 7 locales (`en`, `ro`, `sq`, `it`, `hr`, `rom`, `ru`) so every button fits on 1 line at `320px`/`126%`. *(Panel uncertainty note: adding UI resend reuses the existing email-code request endpoint cleanly; flagged in case reviewer treats email resend UI as scope-adjacent.)*
  - `SmsPhoneAuthModal.tsx`: added `incompleteCodeError` across all 7 locales, validated `/^\d{4}$/` inside `verifyOtp` with error banner + `otpInputRef.current?.focus()`, kept `Verify` enabled whenever `!isLoading`, set `text-base` on `authOtpCode`, and linked `aria-describedby` to include `auth-phone-error` when invalid.
- **Verification:** `npx tsc --noEmit` (pass), `npx eslint src --format stylish` (0 errors, 0 warnings); clean committed tree (`.agents/clean-verify`) `npm run build` exited 0 (`257/257` static pages) and `npx vitest run` passed `82/83` committed files (`664/665` tests, sole failure being pre-existing `37785fc` baseline `src/lib/platform-revamp.test.ts:21` `isVoiceEnabled("sq")`); main workspace working tree passed `tsc`/`eslint` and `86/87` test files (`716/718` tests, failing only in untracked concurrent `src/components/pwa/PwaExperience.test.ts:141,254` after PWA leak removal from `SiteChrome.tsx`/`Footer.tsx`).
- **Native check needed:** Updated `ru` (`"Отправка..."`, `"Выслать код"`, `"Новая ссылка"`, `"Вход..."`, `"Другой email"`, `"Выслать снова"`, `"Войти с Google"`, `"Мы отправили вам код еще раз."`, `"Введите 4 цифры из SMS."`, `"напр. Бухарест"`) and `rom` (`"Bichhalel pes..."`, `"Bichhal kodo"`, `"Nevo linko"`, `"Bichhal o kodo palem"`, `"Aver emailo"`, `"Bichhal palem"`, `"Zha e Googlesa"`, `"Bichhaldyam tuke o kodo palem."`, `"Lekhav e 4 gina katar o SMS."`, `"misal: Bukuresht"`).
- **Unverified live states:** Live browser re-check at `http://localhost:3000` (320px/360px/375px/1440px, 100%/114%/126% text scales, light/dark, and `/stiri`, `/sign-in`, `/medic-online/programare`, `/health-check` Steps 3–7, `/prescription-review` 429/500 alert) not run by `@implementer` (`chrome_devtools` MCP unavailable).

---

## Phase 1 Gate Audit Verification (`37785fc..44094ce`)

- **Rebuilt clean commit stack (17 commits):** `55e21f6` (P03), `acd65a4` (P11), `eaae1d0` (P02), `c8c08df` (P09), `559bf65` (P25), `bb82357` (P14), `343f3e3` (P23), `ab0ee2e` (P22), `b8d5e6f` (P34), `ff73b2c` (P18), `12f062d` (P47), `3edbd58` (P41), `2e81690` (P42), `a4337e2` (P15), `75baafb` (P19), `b1086fc` (P36), `44094ce` (P49).
- **Clean committed tree verification (isolated `.agents/clean-verify` worktree, zero concurrent dirty/untracked files):**
  - `npx next typegen` + `npx tsc --noEmit` -> exit 0
  - `npx eslint src --format stylish` -> exit 0 (0 errors, 0 warnings)
  - `npm run build` (`next build --webpack`) -> exit 0 (`257/257` static pages)
  - `npx vitest run` -> `82 passed | 1 failed (83)` files, `664 passed | 1 failed (665)` tests; sole failure is pre-existing `37785fc` baseline failure `src/lib/platform-revamp.test.ts:21` (`expect(isVoiceEnabled("sq")).toBe(false)`).
- **Main workspace verification (clean Phase 1 files synced onto disk while leaving pre-existing concurrent dirty/untracked PWA & Capsule files untouched):**
  - `npx tsc --noEmit` -> exit 0
  - `npx eslint src --format stylish` -> exit 0 (0 errors, 0 warnings)
  - `npx vitest run` -> `86 passed | 1 failed (87)` files, `716 passed | 2 failed (718)` tests; all `83/83` tracked test files pass, only untracked concurrent `src/components/pwa/PwaExperience.test.ts:141,254` fails due to intentional PWA leak removal from `SiteChrome.tsx` and `Footer.tsx`.






