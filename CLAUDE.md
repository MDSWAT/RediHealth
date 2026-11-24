@AGENTS.md

## UI rules (from the product owner, no exceptions)

These apply to every page, component and language. Check new and edited UI against them before finishing.

1. **No pills, badges or status chips.** Do not wrap a label, category, status or count in a rounded, bordered or tinted capsule (`rounded-full`/`rounded-md` + border/background + small text). Do not add "eyebrow" tags above headings. Say it in plain text instead, or leave it out if the heading already says it.
2. **No status dots or status icons.** No coloured dots (`h-1.5 w-1.5 rounded-full`, live/online beacons, etc.) and no check, alert or sparkle icons used to decorate a status line or label. An icon is allowed only when it is the control itself (a close ×, a play button) or marks a real action, never as decoration on text.
3. **Button labels stay on one line.** A button's label never wraps to two lines, at any width, in any of the six languages (ro, en, sq, it, hr, rom). Use `whitespace-nowrap` and let buttons size to their label (rows of whole buttons that wrap, not fixed equal columns that squeeze text). If it still does not fit, shorten the copy in every language.

Interactive chips that are real controls (filters, category tabs, answer choices) are buttons, not status pills, and are fine.

## Zero AI Design Slop (20 Mandatory Prohibitions)

Apply these 20 mandatory prohibitions across every page, component, stylesheet, and language (`ro`, `en`, `sq`, `it`, `hr`, `rom`, `ru`):

1. **Arrows on every button**: No decorative trailing `ArrowRightIcon` or arrow glyphs on routine CTAs, submit buttons, or card buttons; keep directional arrows only for real stepper, carousel, or back controls.
2. **Little dots between words**: Zero middle dots (`·`) in UI copy, metadata, footers, legal lines, or lists; use commas, dashes, or separate elements without `·`.
3. **Overusing eyebrows**: No eyebrow or kicker tags above headings.
4. **Cream backgrounds**: No warm cream or beige (`#fcfbf9`, `#fbfaf6`, `#f5eee3`) surfaces; use crisp neutral `#ffffff` or `#f8fafc`.
5. **One italic word in the headline**: Zero italic accent words inside `h1` or `h2` headings.
6. **Sparkle icons**: Zero sparkle or magic-star icons or `✨`.
7. **Everything in a card**: Avoid wrapping every list or blurb in a card box; prefer open-canvas hairline and list structure.
8. **The word "quiet"**: Avoid AI-cliché `"quiet"` or `"quietly"` in UI copy.
9. **Numbered sections**: No decorative `01`, `02`, `03` section numbers.
10. **Pulsing green or status dots**: No `animate-pulse` or `animate-ping` status dots.
11. **Blurry glows behind the hero**: No radial-gradient aura or blurry glow behind hero sections.
12. **Instrument Serif**: Never use Instrument Serif.
13. **Colored left borders**: No `border-l-2`, `border-l-4`, or `border-left` colored accent bars on cards or callouts.
14. **Three icon cards in a row**: No 3-column icon-card feature grids.
15. **Pills above the headline**: No `rounded-full` badge or pill tags above headings.
16. **The word "real"**: Avoid AI-slop filler `"real"` in marketing and UI copy.
17. **Made up stats**: Zero fabricated metrics, percentages, or unverified numeric claims.
18. **Two word sentences**: Avoid staccato two-word AI punchy sentences in headlines and leads.
19. **Sections fading on scroll**: No scroll-triggered opacity fade-ins or hidden-until-scrolled sections; render sections immediately visible at `opacity: 1`.
20. **Dithering**: No ordered-dither, halftone, or grain-noise visual overlays.
