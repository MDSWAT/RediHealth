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
| `--color-ink-950` / `900` / `800` | `#0a1226` / `#101a33` / `#1b2744` | Hero obsidian canvas & deep contrast buttons |
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
- **No arbitrary micro-labels:** Do not downgrade sibling card headings or add tiny pill badges inside hero cards.
- **Persistent Comfort Menu (`src/components/layout/ComfortMenu.tsx` + `src/lib/comfort-preferences.ts`):**
  - `textScale`: `"normal"` (`100%`), `"large"` (`114%`), `"xl"` (`126%`) applied via `html[data-text-scale]` root font scaling.
  - `calmMotion`: boolean persisted in `localStorage`, setting `html[data-calm-motion="true"]` and hooked into `useCalmReducedMotion()`.
  - `readingLevel`: `"simple"` vs `"full"` synchronized across reading surfaces.

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

- **Family & Caregiver Sharing (`src/components/ui/FamilyShareButton.tsx`):** Consistent 1-tap WhatsApp, SMS, Copy text, and Web Share menu across prescriptions, triage summaries, telemedicine confirmations, clinic finder cards, and the patient portal.
- **Print-First Clinical Sheets (`data-print-mode="fridge-sheet"`):** Printing structured prescriptions hides dense screen chrome and outputs a high-contrast large-print daily medication schedule.
- **Minimum Touch Ergonomics:** Interactive rows and buttons maintain `min-h-11` (`44px+`) hit targets with clear `focus-visible` sapphire outlines (`outline-ring`).

---

## 7. Header Capsule & In-Page Capsule Menus

One pattern for every menu bar, defined in `src/components/layout/chrome-capsule.ts`.

- **Header capsule:** search, text size, language, account and the `Start here` action are segments of one fully rounded bar (`capsuleSurface`, `capsuleItem`, `capsuleDivider`, `capsuleAction`). No segment carries a box of its own. Below `xl` the bar also holds the menu button; on phones it holds search, text size and the menu button.
- **Outline only:** the bar has no fill. Its only mark is a half-pixel hairline: white while the header floats over the dark landing hero, neutral grey (`ink-950/40`) once the header is solid. Nothing in the bar is red; `--color-primary` stays reserved for 112.
- **One gliding highlight:** a single plate (`CapsuleGlide.tsx`, `.capsule-plate`) moves to the segment under the mouse or keyboard focus. Segments have no hover fill of their own. Touch keeps the existing press feedback.
- **Panels open from their segment:** text size, language, account and `Start here` panels share `CAPSULE_PANEL` and the `.capsule-panel` motion (scale and fade from the top-right corner under the trigger). The search overlay grows from the search segment on `md+`.
- **Account segment:** one segment opens a panel with the account link and the install or update action, each with a text label.
- **In-page capsule menus:** menus that switch between sibling pages or sections (`AssistantNavigation`, the guides section menu in `HealthInformationPageContent`) use `CAPSULE_TABS` and `capsuleTab`, with the same hairline and gliding plate. The current destination sits on a soft plate.
- **Two-way switches:** `ReadingLevelSwitcher` and `DictionaryTabs` use the capsule shape and hairline (`CAPSULE_SHAPE`, `CAPSULE_OUTLINE`) with their sliding sapphire thumb. Each marks its root with `data-capsule-switch`; tests allow pill shapes on reading pages only inside these switches.
- **Where the capsule is not used:** status labels, counts and categories never get a capsule (see the UI rules in `CLAUDE.md`). Wrapping filter chips keep their rounded-rectangle shape.
- **Motion:** plate and panel motion stop under `prefers-reduced-motion` and the in-app Calm motion toggle.
- **Dev note:** `public/offline-worker.js` does not serve cached `/_next/static/` files on localhost, so UI changes show without clearing the service worker.
