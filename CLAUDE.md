@AGENTS.md

## UI rules (from the product owner, no exceptions)

These apply to every page, component and language. Check new and edited UI against them before finishing.

1. **No pills, badges or status chips.** Do not wrap a label, category, status or count in a rounded, bordered or tinted capsule (`rounded-full`/`rounded-md` + border/background + small text). Do not add "eyebrow" tags above headings. Say it in plain text instead, or leave it out if the heading already says it.
2. **No status dots or status icons.** No coloured dots (`h-1.5 w-1.5 rounded-full`, live/online beacons, etc.) and no check, alert or sparkle icons used to decorate a status line or label. An icon is allowed only when it is the control itself (a close ×, a play button) or marks a real action, never as decoration on text.
3. **Button labels stay on one line.** A button's label never wraps to two lines, at any width, in any of the six languages (ro, en, sq, it, hr, rom). Use `whitespace-nowrap` and let buttons size to their label (rows of whole buttons that wrap, not fixed equal columns that squeeze text). If it still does not fit, shorten the copy in every language.

Interactive chips that are real controls (filters, category tabs, answer choices) are buttons, not status pills, and are fine.
