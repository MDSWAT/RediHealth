# RediHealth Design System

## 1. Visual Direction & Philosophy

RediHealth pairs **clinical authority with community warmth**. Every screen is built for ordinary people, older adults, and health mediators navigating stressful health questions across seven languages (`ro`, `en`, `sq`, `it`, `hr`, `rom`, `ru`).

- **Precision over decoration:** Editorial restraint, generous touch targets (`>= 44px`), and predictable hierarchy always win over novelty.
- **Calm motion:** Animations serve orientation (where you tapped, which step changed, how the cursor glides across options) rather than spectacle. Every motion stops cleanly under OS `prefers-reduced-motion` or the persistent `Calm motion` toggle in `ComfortMenu`.
- **Single source of clinical truth:** Colors carry strict functional roles so users learn the visual grammar once and keep it across every flow.

---

## 2. Color & Surface Tokens

Defined in `src/app/globals.css` (`@theme`):

| Token | Value | Strict Role |
| --- | --- | --- |
| `--color-background` | `#fcfbf9` | Primary page canvas (warm off-white paper) |
| `--color-foreground` | `#0b132b` | Primary high-contrast body & heading ink |
| `--color-ink-950` / `900` / `800` | `#0a1226` / `#101a33` / `#1b2744` | Footer, dark mode canvas & deep contrast buttons |
| `--color-paper` | `#fbfaf6` | Elevated assistant card & light text on dark ground |
| `--color-mist` | `#a9b3c6` | Secondary copy on obsidian ink ground |
| `--color-sapphire` | `#1d3557` | Clinical authority, focus cues, active progress & read-aloud state |
| `--color-sapphire-soft` | `#eff6ff` | Active option follower plate & icon plates |
| `--color-primary` | `#c62f3c` | **Emergency 112 & alert actions only** (`5:1` AA contrast with white) |
| `--color-amber-care` | `#b45309` | Community health mediator accents, gentle hesitation cues & safety notices |
| `--color-border-control` | `#8a94a6` | Form inputs, toggles & interactive controls (`>= 3:1` non-text contrast) |
| `--color-live-sage` | `#059669` | Restricted exclusively to live open-now status indicators |

---

## 3. Typography, Scale & Global Comfort Scaling

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

---

## 4. Copywriting & Multilingual Invariants

Enforced across all 7 locales (`ro`, `en`, `sq`, `it`, `hr`, `rom`, `ru`) and automated tests (`Hero.test.ts`, `triage-improvements.test.ts`):

1. **Strict sentence casing everywhere:** Only the first word of a sentence and approved acronyms/proper nouns (`CNAS`, `GDPR`, `SMS`, `QR`, `PDF`, `OMS`, `WHO`, `REDI`, `Roma`, `112`) are capitalized. Never use Title Case or ALL CAPS.
2. **Zero ampersands (`&`):** Always write the full word (`and`, `și`, `dhe`, `e`, `i`, `thaj`, `и`) in prose and interface copy.
3. **Complete locale parity:** Every interface key added to `hero-copy.ts` or shared components must exist in all supported languages without falling back silently.

---

## 5. Motion Physics & Behavioural UI Grammar

- **Shared CSS easing & timing (`globals.css` & `src/lib/motion/tokens.ts`):**
  - `--ease-out-calm`: `cubic-bezier(0.25, 1, 0.5, 1)`
  - `--dur-fast`: `160ms`, `--dur-base`: `240ms`, `--dur-slow`: `420ms`
- **Tactile Spatial Micro-Physics (`src/components/landing/hero/TriagePanel.tsx`):**
  - `rAF`-smoothed pointer tracking (`±5.5px` horizontal, `±4.5px` vertical translation, zero distortion/blur tilt) + subtle radial cursor sheen on fine desktop pointers.
  - Spring-gliding row follower (`type: "spring", stiffness: 440, damping: 34, mass: 0.55`) using GPU `transform` + `opacity` only.
  - Fixed-height header/footer dock slots (`min-h-[2.375rem]`) and concise single-line micro-copy prevent layout shift when contextual copy updates dynamically.
- **Behavioural Subtitle Pattern (`QuestionView` Footer Dock):**
  - Anchored at the base of the panel below the 6 choices inside an inset contextual readout capsule with a morphing icon badge, updating by priority: active voice playback (`speaking`) -> hovered/focused care need (`needs[id].hint`, in `sapphire`) -> mediator link hover (`amber`) -> returning from Step 2 (`returned`) -> gentle 7s hesitation cue (`idle`, in `amber`) -> calm trust default (`default`).
- **Safe Mobile Fallbacks:** Sticky stacked sections (`StackedSections`) operate strictly at `min-width: 1024px` and disable automatically under `calmMotion` or enlarged text scales (`large` / `xl`).

---

## 6. Component Architecture Rules

- **Landing hero (`src/components/landing/Hero.tsx`):** A full-width white paper editorial ground under the solid header, with filtered cross-fading consultation photography on the right (`hero/HeroPhotos.tsx`), the sapphire topic wheel turning subtly behind it (`WheelBackdrop`), strictly one primary `action` CTA to `/health-check` (plus read-aloud), and the dark `RegionalHealthRibbon` ticker at the foot of the first screen. Below the first fold, desktop restores stacked section sheets (`StackedSections`), the interactive `HealthTopicsWheel` + `HealthTopicsSpotlight`, and `MediatorServices` accordion/columns. The headline promises health information, never medical advice.
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

---

## 7. Header Capsule & In-Page Capsule Menus

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
