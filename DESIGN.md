---
name: RediHealth
description: Clinical authority with community warmth, with a scoped care coordination workspace.
colors:
  background: "#ffffff"
  foreground: "#0b132b"
  ink-950: "#0a1226"
  ink-900: "#101a33"
  ink-800: "#1b2744"
  paper: "#ffffff"
  mist: "#a9b3c6"
  sapphire: "#1d3557"
  sapphire-soft: "#eff6ff"
  primary: "#c62f3c"
  amber-care: "#b45309"
  border-control: "#8a94a6"
  live-sage: "#059669"
  panel-canvas: "#f4f6f8"
  panel-surface: "#fff"
  panel-subtle: "#f8fafb"
  panel-line: "#dde4eb"
  panel-ink: "#172b43"
  panel-muted: "#58697c"
  panel-selection: "#edf3f9"
  panel-action-hover: "#28476f"
  panel-selected-border: "#9eb4cc"
  panel-status-neutral: "#798696"
  panel-status-progress: "#356cb0"
  patient-priority-high: "#9a4d0b"
  patient-destructive: "#b91c1c"
  patient-priority-high-dark: "#f5c58e"
  patient-priority-critical-dark: "#ffb4b4"
  patient-viewer-backdrop: "#0b132bd1"
  cabinet-sapphire-dark: "#bad7fa"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Heading Fallback, Arial, Helvetica, sans-serif"
    fontSize: "clamp(1.75rem, 1.15rem + 1.9vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Atkinson Hyperlegible Next, Body Fallback, Arial, Helvetica, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  panel-headline:
    fontFamily: "Bricolage Grotesque, Heading Fallback, Arial, Helvetica, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  panel-title:
    fontFamily: "Atkinson Hyperlegible Next, Body Fallback, Arial, Helvetica, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  panel-description:
    fontFamily: "Atkinson Hyperlegible Next, Body Fallback, Arial, Helvetica, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.55
  patient-caption:
    fontFamily: "Atkinson Hyperlegible Next, Body Fallback, Arial, Helvetica, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
  patient-media-label:
    fontFamily: "Atkinson Hyperlegible Next, Body Fallback, Arial, Helvetica, sans-serif"
    fontSize: "0.75rem"
  patient-initials-mobile:
    fontSize: "1.375rem"
    fontWeight: 600
  cabinet-compact-title:
    fontSize: "1.25rem"
    fontWeight: 600
  cabinet-body:
    fontSize: "0.9375rem"
    lineHeight: 1.65
  cabinet-action-label:
    fontSize: "0.875rem"
  cabinet-entry-title:
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  control: "0.75rem"
  panel-control: "8px"
  panel-inbox: "16px"
  patient-media-label: "6px"
  patient-inline-preview: "10px"
  patient-thumbnail: "12px"
spacing:
  panel-gap: "8px"
  panel-mobile-gutter: "16px"
  panel-row: "16px"
  panel-gutter: "24px"
  panel-reader: "28px"
components:
  panel-button-action:
    backgroundColor: "{colors.sapphire}"
    textColor: "{colors.panel-surface}"
    rounded: "{rounded.panel-control}"
    padding: "8px 12px"
  panel-button-action-hover:
    backgroundColor: "{colors.panel-action-hover}"
  panel-button-outline:
    backgroundColor: "{colors.panel-surface}"
    textColor: "{colors.panel-ink}"
    rounded: "{rounded.panel-control}"
    padding: "8px 12px"
  panel-search:
    backgroundColor: "{colors.panel-surface}"
    textColor: "{colors.panel-ink}"
    rounded: "{rounded.panel-control}"
    width: "240px"
  panel-navigation-active:
    backgroundColor: "{colors.sapphire}"
    textColor: "{colors.panel-surface}"
  panel-status:
    textColor: "{colors.panel-muted}"
  panel-request-selected:
    backgroundColor: "{colors.panel-selection}"
    textColor: "{colors.panel-ink}"
    padding: "16px"
  patient-portrait:
    backgroundColor: "{colors.panel-selection}"
    textColor: "{colors.sapphire}"
    rounded: "{rounded.panel-inbox}"
    width: "104px"
    height: "120px"
  patient-thumbnail:
    backgroundColor: "{colors.panel-subtle}"
    rounded: "{rounded.patient-thumbnail}"
  patient-viewer:
    backgroundColor: "{colors.panel-surface}"
    textColor: "{colors.panel-ink}"
    rounded: "{rounded.panel-inbox}"
  cabinet-navigation-active:
    backgroundColor: "{colors.panel-selection}"
    textColor: "{colors.sapphire}"
    rounded: "{rounded.panel-control}"
    padding: "12px"
  cabinet-care-team:
    backgroundColor: "{colors.panel-subtle}"
    rounded: "{rounded.patient-thumbnail}"
    padding: "20px"
---
# Design System: RediHealth

## Overview

**Creative North Star: "Clinical authority with community warmth"**

RediHealth pairs clinical authority with community warmth. The public experience stays editorial and accessible. Staff screens use the same identity within a pale slate workspace, white working surfaces, sapphire destinations, and fine dividing rules.

The staff panel is a scoped expression of the incumbent system, not a global rebrand. Its composition is recorded in `.impeccable/surfaces/src-app-panel-page-tsx.md`; future public pages continue to follow the public rules below.

**Key Characteristics:**

- Readable typography and predictable hierarchy.
- Sapphire staff actions, with emergency red retaining its established role.
- Flat working surfaces and clear selection feedback.
- Seven-language parity and accessible comfort controls.

### Established public philosophy

RediHealth pairs **clinical authority with community warmth**. Every screen is built for ordinary people, older adults, and health mediators navigating stressful health questions across seven languages (`ro`, `en`, `sq`, `it`, `hr`, `rom`, `ru`).

- **Precision over decoration:** Editorial restraint, generous touch targets (`>= 44px`), and predictable hierarchy always win over novelty.
- **Calm motion:** Animations serve orientation (where you tapped, which step changed, how the cursor glides across options) rather than spectacle. Every motion stops cleanly under OS `prefers-reduced-motion` or the persistent `Calm motion` toggle in `ComfortMenu`.
- **Single source of clinical truth:** Colors carry strict functional roles so users learn the visual grammar once and keep it across every flow.

## Colors

Defined in `src/app/globals.css` (`@theme`):

| Token | Value | Strict Role |
| --- | --- | --- |
| `--color-background` | `#ffffff` | Primary page canvas (crisp neutral white) |
| `--color-foreground` | `#0b132b` | Primary high-contrast body & heading ink |
| `--color-ink-950` / `900` / `800` | `#0a1226` / `#101a33` / `#1b2744` | Footer, dark mode canvas & deep contrast buttons |
| `--color-paper` | `#ffffff` | Elevated assistant card and light text on dark ground (`#f8fafc` for subtle off-white sections) |
| `--color-mist` | `#a9b3c6` | Secondary copy on obsidian ink ground |
| `--color-sapphire` | `#1d3557` | Clinical authority, focus cues, active progress & read-aloud state |
| `--color-sapphire-soft` | `#eff6ff` | Active option follower plate & icon plates |
| `--color-primary` | `#c62f3c` | **Emergency 112 & alert actions only** (`5:1` AA contrast with white) |
| `--color-amber-care` | `#b45309` | Community health mediator accents, gentle hesitation cues & safety notices |
| `--color-border-control` | `#8a94a6` | Form inputs, toggles & interactive controls (`>= 3:1` non-text contrast) |
| `--color-live-sage` | `#059669` | Restricted exclusively to live open-now status indicators |

### Staff workspace scope

The frontmatter panel color tokens come from `src/components/panel/panel-workspace.css`. Slate canvas and subtle surfaces separate the working area from white content. Ink supplies primary copy; muted ink supports descriptions. Selection is a pale sapphire tint with a distinct selected-row border. Pending uses amber; in-progress uses blue; resolved remains neutral rather than borrowing the live-open sage token. Status always includes text.

**The Scoped Sapphire Rule.** Within the care panel, the legacy primary CSS alias resolves to sapphire. The global primary token stays emergency red; public Button variant rules remain authoritative.

Dark panel overrides exist in CSS for canvas, surface, subtle surface, lines, ink, muted ink, and selection. High contrast maps panel surfaces and copy back to global accessibility tokens. The selected dark reader is captured in `.impeccable/review/dark-reader.png`; high contrast and the full range of dark and comfort states remain uncaptured.

### Patient priority and media

Patient high-priority text uses the patient-priority-high token; critical priority and destructive photo removal use patient-destructive. Their dark priority counterparts are explicitly scoped to the patient record. These semantic states retain text labels. The viewer backdrop token belongs only to modal image inspection. This extension does not change public emergency-red or staff sapphire roles.

## Typography

- **Display / Section / Title / Body**: Fluid tokens (`--text-display` `clamp(2rem, 1.2rem + 2.3vw, 3.25rem)`, `--text-section`, `--text-title`, `--text-body`, `--text-meta`) defined in `src/app/globals.css`.
- **Weight hierarchy:** `text-display`, `text-page`, and `text-section` carry weight `700` from tokens. Spend weight `600` (`text-title` / `font-semibold`) only on `text-title` / `<h3>` headings, button labels, field labels, and at most one key fact per row or card; keep values, notes, list items, and descriptions at weight `400` (`font-normal`) or `500` (`text-meta`).
- **No arbitrary micro-labels:** Do not downgrade sibling card headings or add tiny pill badges inside hero cards.
- **Persistent Accessibility Menu (`src/components/layout/ComfortMenu.tsx` + `src/lib/comfort-preferences.ts`):**
  - Universal accessibility trigger (`AccessibilityIcon`) on the header capsule (`data-comfort-glyph`) and collapsible drawer row; preserves the 3 `Aa` scale preview cards inside the panel.
  - `textScale`: `"normal"` (`100%`), `"large"` (`114%`), `"xl"` (`126%`) applied via `html[data-text-scale]` root font scaling.
  - `readingLevel`: `"simple"` vs `"complete"` synchronized across reading surfaces (`ComfortMenu` and `ReadingLevelSwitcher`).
  - `autoRead`: boolean persisted in `localStorage` for voice-enabled locales.
  - `highContrast`: boolean persisted in `localStorage` (`redihealth-high-contrast`), synced to `html[data-high-contrast="true"]`; styles crisp black-on-white (light) / white-on-obsidian (dark) tokens and 3px `:focus-visible` outlines via presence selector `html[data-high-contrast]`.
  - `underlineLinks`: boolean persisted in `localStorage` (`redihealth-underline-links`), synced to `html[data-underline-links="true"]`; forces clear underlines on links via `html[data-underline-links]`.
  - `wideSpacing`: boolean persisted in `localStorage` (`redihealth-wide-spacing`), synced to `html[data-wide-spacing="true"]`; applies relaxed WCAG 2.2 SC 1.4.12 line/word/letter spacing via `html[data-wide-spacing]` while preserving single-line `whitespace-nowrap` UI controls.
  - `calmMotion`: boolean persisted in `localStorage`, hooked into `useCalmReducedMotion()` / `prefersCalmOrReducedMotion()` (never styled with `html[data-calm-motion="true"]` in `globals.css`).

### Staff hierarchy

The root layout loads Atkinson Hyperlegible Next for body copy and Bricolage Grotesque for headings, with Arial/Helvetica fallbacks. Panel home retains a screen-reader-only main heading and omits visible overview and inbox titles. Request identity uses (0.875rem); descriptions use the panel-description token. Metadata uses (0.75rem); numeric counts use tabular figures. Root comfort scaling remains available; do not freeze these rem sizes into pixels.

Patient media captions use patient-caption; dates, counters, and upload labels use patient-media-label. Mobile portrait initials use patient-initials-mobile (22px at the default root size). These intentional sizes supplement existing panel typography; the directory retains its preexisting (15px) introduction and (11px) keyboard hint.

### Patient cabinet typography

The cabinet inherits the established heading/body families and panel palette. Its compact-title token serves mobile overview headings and (64 × 76px) portrait initials; cabinet-body serves introductory, navigation, and care copy. Action labels use cabinet-action-label; the plain entrance benefits heading uses cabinet-entry-title. Desktop overview headings use (1.375rem), weight (600). The cabinet-sapphire-dark accent is the existing pale blue used for active navigation, icons, and focus in source-defined dark mode, scoped to cabinet and entrance. These extracted roles do not alter public typography or staff action rules.

## Layout

### Public containers and reading measures

The established Container and article rules are preserved in Components below.

### Staff workspace composition

The expanded desktop sidebar is (224px) from the desktop breakpoint and (240px) at xl; its collapsed mode is (72px). Panel home uses one white working canvas with (24px) padding. Search, filters, refresh, export, and patient creation sit directly above the folders and request list. Existing sidebar and mobile navigation provide other destinations; panel home has no duplicate tool directory or enclosing inbox card.

Horizontal folders scroll when necessary, and active folders use a sapphire underline. The default request list fills the available width and scrolls with the page. Selecting a request at desktop width introduces a (38%) list with a (280px) minimum and an adjacent reader taking the remainder. The reader is sticky at (24px), capped at `calc(100dvh - 48px)`, and scrolls internally. Back restores the full-width list. Request rows use (16px) padding.

Below (1024px), the list occupies the full width and selecting a request opens a fixed full-screen reader. Bottom navigation remains available through the existing shell. Below (640px), workspace padding becomes (16px 16px 32px). Search occupies a full row; filters and actions wrap. Reader copy has a (70ch) maximum width.

### Patient record and directory extension

The patient record and directory have a (1440px) maximum width and inherit the staff workspace. The white identity header uses (28px) padding and grouped actions. Summary content uses `minmax(0, 1.6fr) minmax(260px, 1fr)` with a (24px) gap: care summary and recent activity on the left, follow-up and care team on the right. Below (768px), content stacks; below (1200px), header actions wrap below identity. The record keeps dedicated Summary, Care plan, Photos and documents, and History tabs, scrolling horizontally when needed.

Gallery columns use `repeat(auto-fill, minmax(min(100%, 210px), 1fr))` with (20px) gaps; below (640px), two columns use (16px 12px) gaps. The viewer fills the phone viewport; desktop uses `min(1200px, calc(100vw - 48px))` by `calc(100dvh - 48px)`. Its image stage scrolls while controls stay in header/footer slots.

### Patient-facing cabinet and phone entrance

The cabinet composition is scoped by `.impeccable/surfaces/src-app-patient-portal-token-page-tsx.md`. Identity and a native contact-details disclosure precede a two-column body: (220px) persistent desktop navigation plus flexible care content. The overview first presents equal appointment and treatment columns with a fine separator, followed by patient actions and care team in a (1.4fr / 1fr) grid. White shell, (16px) corners, fine rules, and restrained depth inherit the accepted care workspace.

Below (1024px), navigation becomes a horizontal row; below (640px), all six destinations remain visible in a three-column grid. Overview and secondary content stack below (768px). Header padding reduces from (28px 32px 20px) to (20px); content from (28px 32px) to (24px 20px) on phones. Contact details can expand without displacing the persistent navigation model.

The public phone entrance pairs the existing SMS sign-in form with plain benefits in a (1fr / 0.9fr) surface capped at (1080px), then stacks form and benefits below (768px). The benefits use subtle paper, sapphire icons, and fine rules rather than a dark photo overlay. Existing phone-code authentication, installation/read-aloud controls, staff sign-in, and public chrome retain their behavior.

## Elevation & Depth

Staff working surfaces are flat: fine borders, background tones, and selected-row outlines provide separation. The panel create-patient action has no shadow; selected folders and rows do not use inset shadows. Existing public overlays and the capsule menus retain their own depth treatments, preserved under Components.

### Motion and established behavior

- **Shared CSS easing & timing (`globals.css` & `src/lib/motion/tokens.ts`):**
  - `--ease-out-calm`: `cubic-bezier(0.25, 1, 0.5, 1)`
  - `--dur-fast`: `160ms`, `--dur-base`: `240ms`, `--dur-slow`: `420ms`
- **No scroll-triggered opacity fades or hero glows:** Sections render immediately visible at `opacity: 1` (`src/components/ui/Reveal.tsx` performs zero `IntersectionObserver` hiding or fade-in delays), and hero sections carry zero radial-gradient aura or blurry background glows.
- **Tactile Spatial Micro-Physics (`src/components/landing/hero/TriagePanel.tsx`):**
  - `rAF`-smoothed pointer tracking (`±5.5px` horizontal, `±4.5px` vertical translation, zero distortion/blur tilt) on fine desktop pointers.
  - Spring-gliding row follower (`type: "spring", stiffness: 440, damping: 34, mass: 0.55`) using GPU `transform` + `opacity` only.
  - Fixed-height header/footer dock slots (`min-h-[2.375rem]`) and concise single-line micro-copy prevent layout shift when contextual copy updates dynamically.
- **Behavioural Subtitle Pattern (`QuestionView` Footer Dock):**
  - Anchored at the base of the panel below the 6 choices inside an inset contextual readout capsule with a morphing icon badge, updating by priority: active voice playback (`speaking`) -> hovered/focused care need (`needs[id].hint`, in `sapphire`) -> mediator link hover (`amber`) -> returning from Step 2 (`returned`) -> gentle 7s hesitation cue (`idle`, in `amber`) -> calm trust default (`default`).
- **Safe Mobile Fallbacks:** Sticky stacked sections (`StackedSections`) operate strictly at `min-width: 1024px` and disable automatically under `calmMotion` or enlarged text scales (`large` / `xl`).

Panel folder feedback uses (160ms) and the shared calm easing. The existing panel stylesheet disables transitions and animations for reduced motion or the persisted calm-motion class.

The patient image viewer is an intentional modal exception to flat working surfaces: its shadow is `0 24px 80px #0004`, with the patient-viewer-backdrop behind it. Gallery hover changes image opacity to (0.8) over (160ms ease-out); existing care-panel reduced-motion/calm rules suppress the transition.

## Shapes

Public actions retain the global control radius. Staff search and inbox actions use the smaller panel-control radius. Panel home has no rounded inbox boundary; request rows remain square and text status labels remain unboxed. Initial avatars are circular (36px) identity cues, not new status chips. The larger panel-inbox radius remains in use by patient portraits and viewers. Existing capsule-specific shapes remain scoped to their documented menus and switches.

Patient identity uses contained rectangular portraits: record (104 × 120px), mobile (76 × 92px), directory (52 × 58px). Large portraits inherit the (16px) surface radius; directory portraits and gallery thumbnails use patient-thumbnail, inline previews patient-inline-preview, and the gallery open label patient-media-label. Image fit is `contain`, preserving the full frame; these patient portraits do not replace circular request initials elsewhere.

## Components

- **Landing hero (`src/components/landing/Hero.tsx`):** A full-width crisp neutral white (`#ffffff`) editorial ground under the solid header, with filtered cross-fading consultation photography on the right (`hero/HeroPhotos.tsx`), the sapphire topic wheel turning subtly behind it (`WheelBackdrop`), strictly one primary `action` CTA to `/health-check` (plus read-aloud), and the dark `RegionalHealthRibbon` ticker at the foot of the first screen. Below the first fold, desktop restores stacked section sheets (`StackedSections`), the interactive `HealthTopicsWheel` + `HealthTopicsSpotlight`, and `MediatorServices` accordion/columns. The headline promises health information, never medical advice.
- **Action Buttons (`src/components/ui/Button.tsx`):** Every action `<button>`, submit button, and CTA link uses `<Button>` with `rounded-(--radius-control)`, `text-body`, fluid `min-h-11` (`md`) or `min-h-12` (`lg`) growth (no fixed `h-*`), and strict variant roles: `primary` (red — 112/emergency only), `action` (sapphire — the one main next step of a screen), `outline` (default — all other action buttons), and `ghost` (quiet row or dialog actions). Never hand-roll solid `bg-sapphire` / `bg-primary` / `bg-foreground` action buttons or use the retired `secondary` variant.
- **Public Page Headers (`src/components/ui/PageHeader.tsx`):** Every public page header (excluding the landing home hero `#hero-title` and full-screen portal states) uses `<PageHeader>` with `align="start"` flush-left alignment—including `src/app/error.tsx` and `src/app/not-found.tsx`—in an uncrushable vertical editorial stack: optional `above` slot, direct-child `text-page` `<h1>` with `[overflow-wrap:break-word]`, direct-child `text-lead` lead at `--measure-lead` (`34rem`) with `mt-3` (12px) gap, `mt-5` (20px) wrapping action row (`btn-row flex flex-wrap items-center gap-3 [&:not(:has(*))]:hidden`), `pt-6 sm:pt-10` top padding, and no decorative header band. Never place `actions` beside title and lead in a `lg:flex` / `lg:shrink-0` row that can compress the headline column.
- **Health reading column, article header and action toolbar (`HealthArticleShell.tsx`, `SubjectHeaderToolbar.tsx`, `GuideOfflinePrintActions.tsx`):**
  - **Single centred reading column:** Detailed health articles (`/health-information/articles/[article]`), topic summaries (`/health-information/topics/[topic]`), interactive topic guides (`/health-information/[slug]`), and news articles (`/news/[id]`, `/stiri/[id]`) share `HEALTH_ARTICLE_CONTAINER_CLASS` (`mx-auto w-full max-w-[44rem] [--measure-reading:44rem]`, `data-health-article-column`). Headings, lead copy, action bar, body prose (`text-reading`, 18px), cards, lists, and related reading share crisp left and right edges with no side TOC rail; `MobileGuideJumpBar` provides floating bottom-centre section navigation on every viewport width.
  - **Editorial reading header (`HealthArticleHeader`):** Closes with one bottom hairline (`border-b border-border pb-6 pt-1 sm:pb-7 print:pb-4`). Renders optional language notice, plain-text metadata (`TopicMetaBadge`, no pills, dots, or decorative icons), `text-page` `<h1>` with `[overflow-wrap:break-word]`, and full-measure `text-lead` (`max-w-(--measure-reading)`). When a core topic guide supplies documentary `media`, the header splits only from `md` upward (`md:grid-cols-[minmax(0,1fr)_min(13rem,32%)] md:items-start md:gap-7`) so phones and `xl` text scale never crush the headline.
  - **Utility action toolbar (`SubjectHeaderToolbar` and `GuideOfflinePrintActions`):** Sits below the lead inside a top-bordered slot (`mt-5 border-t border-border/75 pt-4 print:hidden [&:not(:has(*))]:hidden`) so empty action rows collapse completely. Uses flush-left wrapping rows (`btn-row flex w-full flex-wrap items-start gap-2.5`) of whole, self-sized single-line controls (`min-h-11`, `text-body font-semibold`, `rounded-(--radius-control)`, `border-border-control`, `whitespace-nowrap`)—never fixed equal `grid-cols-2` columns and never `!` important overrides that break `aria-[pressed=true]` active narration states. Below `640px` at `large`/`xl` comfort text scales, `.btn-row > *` stacks controls cleanly full-width. Offline-save status notices use `w-0 min-w-full basis-full` so appearing feedback never shifts sibling buttons.
  - **Body cadence, print, and high contrast:** Body shells follow headers with `pt-6 sm:pt-8` and `mt-10 first:mt-0` on the opening section so no dead vertical gap opens below the header rule. In `globals.css`, `@media print` hides only the site-wide footer (`footer:not(article footer):not(.print-block)`), allows multi-section `<article>` documents to paginate cleanly (`article:not(:has(section))`), and keeps headings attached to following paragraphs (`break-after: avoid`). Under `html[data-high-contrast]:not(.dark)`, `article footer` restores black-on-white tokens so Sources and authorship remain fully legible.
- **Containers & Reading Measures (`src/components/ui/Container.tsx`, `src/app/globals.css`):** `Container` provides `default` (`max-w-[80rem]`) and `narrow` (`max-w-[48rem]`) widths with unified gutters (`px-5 sm:px-6 lg:px-8`). Long running text uses `max-w-(--measure-reading)` (`--measure-reading: 36rem`) and leads / short fixed-measure headings use `max-w-(--measure-lead)` (`--measure-lead: 34rem`), left-aligned on the container edge with `PageHeader`.
- **Family & Caregiver Sharing (`src/components/ui/FamilyShareButton.tsx`):** Consistent 1-tap WhatsApp, SMS, Copy text, and Web Share menu across prescriptions, triage summaries, telemedicine confirmations, clinic finder cards, and the patient portal.
- **Print-First Clinical Sheets (`data-print-mode="fridge-sheet"`):** Printing structured prescriptions hides dense screen chrome and outputs a high-contrast large-print daily medication schedule.
- **Minimum Touch Ergonomics:** Interactive rows and buttons maintain `min-h-11` (`44px+`) hit targets with clear `focus-visible` sapphire outlines (`outline-ring`).

### Header capsule and in-page capsule menus

One pattern for every menu bar, defined in `src/components/layout/chrome-capsule.ts`.

- **Header capsule:** search, accessibility (high-contrast filled `AccessibilityIcon` medallion in `ComfortMenu`), language, account and the `Start here` action are segments of one fully rounded bar (`capsuleSurface`, `capsuleItem`, `capsuleDivider`, `capsuleAction`). No segment carries a box of its own. Below `xl` the bar also holds the menu button; on phones it holds search, accessibility and the menu button, and while the mobile menu is open only the red `capsuleCloseItem` (`#c62f3c`) button. `#mobile-menu` sits on a clean white (`bg-white`) canvas with subtly bordered elevated white cards (`data-menu-card`) and reads top to bottom: compact language bar, two-column live-doctor (sapphire) and AI assistant (white) card pair, unified single-column six-destination card, split Home and Account row, unified Install and Accessibility card, one line with the feedback and report links, then the softly outlined 112 action (`variant="outline"`) inside a floating bottom card (`sticky bottom-0`) so it stays in view while the menu scrolls.
- **Feedback edge tab:** a slim vertical tab docked mid-right (`writing-mode: vertical-rl`), shown from `sm` up only (phones use the menu and footer links). Closing it or pushing it right is remembered on the device for 30 days; the footer and mobile-menu feedback links stay.
- **Outline only:** the bar has no fill. Its only mark is a half-pixel hairline: neutral grey (`ink-950/40`) on the solid header, which is the same on every page including the landing page, and white only while the phone menu is open on its ink ground. Nothing in the bar is red; `--color-primary` stays reserved for 112.
- **One gliding highlight:** a single plate (`CapsuleGlide.tsx`, `.capsule-plate`) moves to the segment under the mouse or keyboard focus. Segments have no hover fill of their own. Touch keeps the existing press feedback.
- **Panels open from their segment:** accessibility, language, account and `Start here` panels share `CAPSULE_PANEL` and the `.capsule-panel` motion (scale and fade from the top-right corner under the trigger). The desktop accessibility dialog uses cohesive rounded surfaces (`sm:rounded-3xl`, `rounded-2xl` text-size and switch cards, `CAPSULE_SHAPE` close button, segmented reading-mode switcher, toggle tracks/thumbs, and bordered Reset pill) inside a `max-h-[min(78dvh,38rem)] overflow-y-auto` scroll container so options never clip on short viewports. The search overlay grows from the search segment on `md+`.
- **Account segment:** one segment opens a panel with the account link and the install or update action, each with a text label.
- **In-page capsule menus:** menus that switch between sibling pages or sections (`AssistantNavigation`, the guides section menu in `HealthInformationPageContent`) use `CAPSULE_TABS` and `capsuleTab`, with the same hairline and gliding plate. The current destination sits on a soft plate.
- **Two-way switches:** `ReadingLevelSwitcher` and `DictionaryTabs` use the capsule shape and hairline (`CAPSULE_SHAPE`, `CAPSULE_OUTLINE`) with their sliding sapphire thumb. Each marks its root with `data-capsule-switch`; tests allow pill shapes on reading pages only inside these switches.
- **Where the capsule is not used:** status labels, counts and categories never get a capsule (see the UI rules in `CLAUDE.md`). Wrapping filter chips keep their rounded-rectangle shape.
- **Motion:** plate and panel motion stop under `prefers-reduced-motion` and the in-app Calm motion toggle.
- **Dev note:** `public/offline-worker.js` does not serve cached `/_next/static/` files on localhost, so UI changes show without clearing the service worker.

### Staff overview and request inbox

- **Actions:** The create-patient control sits in the inbox toolbar and uses the shared Button action variant. Existing inbox controls retain their CRM primitives with an (8px) radius, (44px) minimum height, sapphire primary save action, outlined utilities, and source-defined disabled states. These are scoped existing panel components, not an alternative public button API.
- **Search:** A leading search icon and accessible search label sit within a control-colored border. Focus-within draws a (2px) sapphire outline with (2px) offset; global high contrast retains its stronger accessibility treatment.
- **Navigation:** The active desktop destination is filled sapphire with white text and a (46px) minimum height. Inbox folders are unfilled with a (2px) active underline and (48px) minimum height. Selection is conveyed through `aria-current` or `aria-pressed` as appropriate.
- **Destinations:** Existing sidebar and mobile navigation retain access to other panel tools. Preserve their role and runtime visibility checks, runtime link abstraction, and locale prefixes.
- **Rows and reader:** Selecting a request opens its details beside the list on desktop, and in the existing full-screen reader on smaller screens. Selected rows use the selection surface and border. Empty states explain the next action; the list shows loading, empty/filter recovery, and error feedback. Search, date/priority filters, refresh, loaded-row CSV export, pagination, editing, and unsaved-change prompts remain functional.
- **Runtime:** Preserve authentication, role permissions, country context, database-availability disabled states, and the `PanelRuntime` abstraction for online, offline, and fictional browser-local demo operation. Do not infer permission from visual placement.
- **Locales:** All new workspace text comes from the typed seven-locale translation map (`ro`, `en`, `sq`, `it`, `hr`, `rom`, `ru`). Counts use locale formatting, dates use the existing panel date helpers, and translated titles wrap. Keep source status values independent of their translated labels.

### Patient photos, documents, and viewer

- **Portraits:** `PatientAvatar` shows the entire image within its rectangle, falls back to initials when absent, and provides a labeled preview trigger when available. New portrait uploads use `toAvatarDataUrl` with aspect-preserving dimensions, a maximum side of (256px), no upscaling, a white canvas, and JPEG quality (0.85). Existing stored images are not rewritten or restored beyond their available resolution.
- **Gallery:** The dedicated Photos and documents tab keeps intake documents, treatment photos, and patient attachments accessible. Thumbnails have a (4:3) frame with contained images and (12px) inset; titles, dates, notes, and permitted delete controls remain outside the image. Failed images show a translated unavailable state. Inline document previews and print-report photos also use contain; print hides viewer/open/delete chrome.
- **Inspection:** A native `dialog.showModal()` viewer provides contained fit-to-screen inspection, a (160%) scrollable zoom mode, previous/next controls and arrow-key navigation for multi-image galleries, download, and an announced image counter. Close receives initial focus; Escape closes the dialog. Closing restores body scrolling and focus to the originating trigger. Moving between images resets zoom and scroll. Viewer controls retain (44px) minimum hit areas and a (3px) sapphire focus outline with (3px) offset.
- **Continuity:** Keep existing authentication, role and country permissions, care/treatment actions, unsaved-change guards, printing, and online/offline/demo operations. All new media controls and unavailable messages support `ro`, `en`, `sq`, `it`, `hr`, `rom`, and `ru`; dates use the existing locale helpers.

### Patient cabinet operations and media

Cabinet navigation persists across Overview, symptom reporting, check-ups, treatment, photos, and notes; active destinations use a pale selection surface, sapphire text, and `aria-current`. Identity uses the shared contained rectangular portrait. Existing emergency guidance remains above routine care. The overview derives appointments, treatment, and care-team content from the patient record, including real empty states; do not invent care data.

Shared full-frame galleries and native image inspection now serve cabinet photos, treatment plans, and completed follow-up attachments. Preserve the existing fit/zoom/navigation/download/focus-restoration behavior. During print, thumbnail buttons explicitly remain `display: flex !important` so global button hiding cannot remove the images; viewer, open-image labels, and delete controls stay hidden. This is a source rule, not a claim of captured print-dialog verification.

The optional `onPatch` transport callback is supplied only by `/demo/cabinet` for browser-local view-state simulation. The real token route omits it; production continues through the token/country/captcha-protected portal API. Keep symptom, appointment, upload, completion-note, sharing, and print handlers intact. The new cabinet copy supports all seven locales (`ro`, `en`, `sq`, `it`, `hr`, `rom`, `ru`); translated destinations wrap rather than disappearing on phones.

### Evidence boundary

The supplied desktop/mobile overview and reader screenshots under `.impeccable/review/` show the shared production components through `/en/demo` with fictional records. The selected dark reader is also visually checked in `dark-reader.png`, following label and contact-link contrast corrections. Authenticated live data, high contrast, and all other dark/comfort combinations are not established by these captures. Source rules describe support; they do not constitute captured visual verification.

Patient review captures are in `.impeccable/review/patient/`: desktop/mobile summary, photos, viewer, and directory. The sampled summary, gallery, and mobile viewer preserve the contained document frame. Fixture PNGs generated by `fixtures/create-patient-fixtures.cjs` are local review artifacts marked DEMO ONLY, not shipping imagery or clinical evidence. Patient dark and comfort states were not visually rechecked; source dark tokens do not establish visual verification.

Cabinet evidence under `.impeccable/review/cabinet/` covers English/light desktop and phone demo overview/media/viewer plus the real public phone entrance. Representative desktop overview and phone entrance captures were inspected for this documentation. Dark mode, comfort variants, successful real authentication, and print dialogs were not captured. No new product image assets were introduced; prior DEMO ONLY fixtures remain fictional local review media.

## Do's and Don'ts

### Established copywriting and multilingual invariants

Enforced across all 7 locales (`ro`, `en`, `sq`, `it`, `hr`, `rom`, `ru`) and automated tests (`Hero.test.ts`, `triage-improvements.test.ts`):

1. **Strict sentence casing everywhere:** Only the first word of a sentence and approved acronyms/proper nouns (`CNAS`, `GDPR`, `SMS`, `QR`, `PDF`, `OMS`, `WHO`, `REDI`, `Roma`, `112`) are capitalized. Never use Title Case or ALL CAPS.
2. **Zero ampersands (`&`):** Always write the full word (`and`, `și`, `dhe`, `e`, `i`, `thaj`, `и`) in prose and interface copy.
3. **Complete locale parity:** Every interface key added to `hero-copy.ts` or shared components must exist in all supported languages without falling back silently.

### Do:

- Do preserve public design rules when extending the staff workspace.
- Do keep panel colors scoped to the care panel and retain the existing logo.
- Do derive counts and clinical content from the runtime; label fictional demo data.
- Do preserve all seven locales, keyboard focus, touch targets, and reduced motion.


- Do preserve the full image frame in identity, gallery, inline preview, and print.
- Do keep inspection keyboard-accessible and return focus to its trigger.

- Do preserve all six cabinet destinations on phones and keep patient data ahead of everyday actions.

### Don't:

- Don't export the staff workspace composition or token overrides to public pages.
- Don't use emergency red for routine staff actions.
- Don't invent statistics or present browser-local demo records as live data.
- Don't replace role and runtime visibility checks with decorative tool links.

- Don't destructively crop patient documents or claim a downscaled portrait is an untouched original.
- Don't supply the demo transport callback to the real token route or treat local simulation as authentication evidence.
- Don't introduce any of the 20 prohibited AI design slop patterns codified in `CLAUDE.md` and `~/.gemini/GEMINI.md` (no decorative button arrows, middle dots, eyebrow tags, warm cream or beige surfaces, italic accent words in headings, sparkle icons, over-carding, `"quiet"` or `"real"` filler, `01`/`02`/`03` section numbers, pulsing status dots, blurry hero glows, Instrument Serif, colored left accent borders, 3-icon-cards-in-a-row grids, pills above headings, fabricated stats, staccato two-word sentences, scroll-triggered opacity fades, or dithering and halftone overlays).
