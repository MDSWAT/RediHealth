# Prompt for Gemini: implement the RediHealth UI refinement

Paste everything below the line into Gemini (Gemini CLI, or another Gemini coding agent with
access to this repository), started from the repository root. It expects
`design/ui-refinement/top-50-proposals.md` to be present.

---

You are implementing a specified set of UI refinements in RediHealth, a Next.js 16 / React 19 /
Tailwind CSS v4 web application. The full specification is in
`design/ui-refinement/top-50-proposals.md`. This message tells you how to work through it.

## Who this is for, and why it matters

RediHealth helps people in vulnerable communities, Roma communities in particular, understand
their health, decide what to do next and reach a doctor. It runs in seven languages: ro, en, sq,
it, hr, rom, ru. The people using it are, in order of priority:

1. Someone with low literacy, or reading in a second language, often worried, on a cheap Android
   phone with a small screen and a slow connection.
2. An older adult with weaker eyesight and less steady hands, who is unfamiliar with web
   conventions such as icon-only buttons and hamburger menus, and who gets lost when a screen
   changes under them.
3. A health mediator or relative helping one of them, often reading the screen aloud.

The goal of this work is a product that is sleeker and more minimal AND easier for these people:
fewer things on each screen, each one clearer, one obvious next step. Whenever a tidier look and
a reader's understanding pull in different directions, understanding wins. Never hide a label
behind an icon, shrink text or a touch target, lower contrast, or remove help in order to look
cleaner. A change that looks good to a designer but makes a worried person on a small phone
hesitate is a failed change.

## Read these before changing anything

1. `CLAUDE.md` and `AGENTS.md` at the repository root. They are the product owner's rules.
   `AGENTS.md` warns that this version of Next.js differs from older ones: before you touch
   routing, layouts, metadata, fonts or dynamic imports, read the relevant guide under
   `node_modules/next/dist/docs/`. Do not rely on what you remember about Next.js.
2. `DESIGN.md`: colour roles, type, motion and comfort settings.
3. `design/ui-refinement/top-50-proposals.md`, in this order: "Ground rules every change must
   keep", "Decisions the owner must make before some items ship", "Implementation order", and
   the cross-reference table. Then read each item in full when you reach it, not all 50 up front.
4. `src/app/globals.css`: the design tokens at the top and the "Craft layer" block at the end
   (shared motion and surface classes). Use these; do not invent parallel ones.
5. `src/components/ui/`: the shared primitives (Button, Container, Section, SectionHeading,
   Reveal, IconTile, and others). Prefer them over hand-built equivalents.

## How to work

Work through the five phases in the order given under "Implementation order", and through the
items in the order listed inside each phase. That order respects dependencies between items; do
not reorder it. Do one item at a time, finish it, verify it, then move on.

For each item:

1. Read the whole entry: the panel result, any "Chair ruling", any "Owner decision needed", the
   specification (Surface, Files, Resolves, Now, Change, Keep, Verify, Effort, Risk) and the
   panel notes.
   - A chair ruling overrides the specification where they differ.
   - Panel notes say what to take from other reviewers' versions of the same idea. Those versions
     are in Appendix A. Use them only for what the notes name; where they disagree with the
     chosen specification or a ruling, the specification and the ruling win.
   - Specifications refer to each other by their authors' original IDs (for example `FLO-P01`).
     The cross-reference table maps each ID to its item number.
2. Open every file the entry names and find the code it describes. Line numbers will have
   drifted: locate code by the quoted class strings and copy, not by line number. Read the "Now"
   paragraph against the real code. If the code no longer matches what "Now" describes (someone
   has already changed it, or the description was wrong), do not force the change: record the
   mismatch in your log, make the change only if its intent still clearly applies, and otherwise
   skip the item.
3. Find the tests that read the files you are about to change:
   `grep -rl "<ComponentFileName>" src --include='*.test.ts'`. Many tests in this repository
   assert on source strings. Read the assertions first so you know what is pinned.
4. Make the change exactly as the numbered steps under "Change" describe. Stay inside the item:
   do not tidy neighbouring code, rename things, or fix unrelated problems you notice. Write
   unrelated problems in your log instead.
5. Honour "Keep": it lists the functions, behaviours and tests at risk. If you cannot make the
   change without breaking something under "Keep", stop work on that item and log why.
6. Verify, using the item's own "Verify" steps and the checks in the next section.
7. Commit the item on its own, on a branch (never on `main`), with the message
   `refine(ui): P<NN> <the item's title>` and a body listing the files changed and anything you
   left out. One item per commit, so that any single change can be reverted cleanly.
8. Add an entry to `design/ui-refinement/implementation-log.md` (create it on the first item):
   item number, status (done / done with deviations / skipped / blocked), what you changed, any
   deviation from the specification and why, any test assertion you changed (quote it before and
   after), and anything you could not verify.

## Rules that are never broken

These are restated from the specification because they are where an implementer most often goes
wrong. A change that breaks one of them is wrong even if an item's steps seem to ask for it; in
that case stop and log it.

1. **No pills, badges, status chips or eyebrow tags.** Never wrap a label, category, status or
   count in a rounded, bordered or tinted capsule. Plain text, or leave it out. Filters, tabs and
   answer choices are real controls and are buttons.
2. **No status dots and no decorative status icons.** No coloured dots, live beacons, or check,
   alert or sparkle icons decorating a line of text. An icon is allowed only when it is the
   control itself or marks a real action.
3. **Button labels stay on one line**, at every width, in all seven languages. Use
   `whitespace-nowrap`, let buttons size to their label, and let rows of whole buttons wrap. If
   a label does not fit at 320px, shorten the copy in every language; never let it wrap or
   truncate.
4. **Calm motion only.** Colour, opacity, shadow, clip and short travel. No hover lift, no hover
   or press scale, no bounce or overshoot, no parallax, no custom cursor, nothing that loops to
   attract attention. Everything is static under `prefers-reduced-motion` and under
   `html[data-calm-motion]`. Several items remove motion; none asks you to add new kinds.
5. **Colour roles.** Red (`primary`) is only for 112 and emergencies. Sapphire is the main
   action. Amber marks health mediators. Use existing tokens; no raw hex values and no
   off-palette Tailwind colours in components.
6. **Accessibility.** Text contrast at least 4.5:1 in light and dark; touch targets at least
   44px with 8px between them; visible keyboard focus; semantic elements (`button` for actions,
   `a` for navigation); nothing conveyed by colour alone; focus traps and Escape handling in
   dialogs left intact; body text at least 16px.
7. **Seven languages, every time.** Any new or changed string is added or changed in all seven
   (ro, en, sq, it, hr, rom, ru), in the same place the component keeps its copy. The
   specification gives new copy in English. Translate it plainly, in everyday words, matching
   the tone and vocabulary already used in that language's strings in the same file. If you are
   not confident of a translation, especially Romani (rom), write your best version, mark it in
   the log as needing a native check, and list every such string at the end.
8. **No changes to behaviour, data, APIs, authentication, booking, SMS, routes or
   dependencies** beyond what an item explicitly states. Do not add packages.
9. **Tests.** Do not delete or weaken a test to get a pass. Change an assertion only when the
   item itself changes the thing the assertion pins, keep the assertion's intent, and record the
   change in the log.

## Items that need the owner first

The section "Decisions the owner must make before some items ship" lists items that depend on a
clinical, legal or naming decision. For those:

- Implement the structural and visual parts of the item.
- Do not change clinical wording, alarm-sign lists, severity scales, consent text or any other
  legal or medical statement on your own judgement. Where the item supplies new wording of that
  kind, put it in place only if the item says it is a pure consolidation of existing approved
  text; otherwise leave the existing text, and record in the log exactly what awaits a decision.
- Mark the item "done with deviations" and name the pending decision.

## Checks before each commit

Run these and fix what they report in the files you changed:

```bash
npx tsc --noEmit
```

```bash
npx vitest run
```

```bash
npx eslint src
```

Then look at the result. A dev server may already be running at `http://localhost:3000`; if not,
`npm run dev`. Routes are language-prefixed (`/en`, `/ro`, `/ru`, ...). For every item, look at
the changed screens:

- at 360x740 and 375x812 (phone), and at 1440 wide (desktop);
- in English, Romanian and Russian at least (Russian and Romanian have the longest labels);
- in light and dark;
- with the comfort menu's text size at 114% and 126%;
- with the operating system's reduced-motion setting on.

Confirm: no button label wraps or truncates; no horizontal scroll; nothing overlaps or is cut
off; the screen's main action is visible without scrolling on the phone where the item says it
should be; focus is visible when you tab through; the browser console shows no new errors. If
you cannot run a browser, say so in the log for that item and list exactly what was not looked
at; do not claim it was verified.

At the end of each phase, also run a production build once:

```bash
npm run build
```

## When you are unsure

- If a step is ambiguous, choose the reading that leaves the reader with fewer things to look at
  and more words they can understand, and note the choice in the log.
- If two items seem to conflict and no chair ruling covers it, do the one earlier in the
  implementation order, skip the conflicting part of the later one, and log it.
- If an item turns out much larger than its stated effort, or would require touching the areas
  in rule 8, stop, log it as blocked with what you found, and move to the next item.
- Do not expand scope. The eleven items in Appendix B were not selected; do not implement them.

## What to hand back

When all five phases are done, or you have stopped, write a summary at the top of
`design/ui-refinement/implementation-log.md`:

1. A table of all 50 items with status (done / done with deviations / skipped / blocked) and the
   commit hash.
2. Every deviation from the specification, with the reason.
3. Every test assertion you changed, before and after.
4. Every string that needs a native-speaker check, by language and key.
5. Every owner decision still pending.
6. What you verified in a browser and what you could not.
7. The final output of the typecheck, test, lint and build commands.

Report plainly. If something failed or was skipped, say so; do not describe partial work as
complete.

Begin with Phase 1, item 1.
