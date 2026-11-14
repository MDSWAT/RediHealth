# RediHealth UI refinement: the top 50 proposals

Sleeker, more minimal, and easier for people with low literacy and for older adults.

## What this document is

The output of a three-round design review of RediHealth's public pages, run on 14 November 2026 after the UI craft pass. It is the specification for the next round of UI work. Nothing in it has been implemented.

- **Round 1, audit.** Six reviewers, each with one lens, read the code and looked at the running site at 375px and at desktop width. They recorded 173 findings.
- **Round 2, proposals.** Each reviewer read the other five audits and wrote 16 proposals: 96 in total.
- **Round 3, voting.** Overlapping proposals were grouped into 23 clusters, giving a ballot of 61 items. Every reviewer scored every item from 1 to 10 on three scales and chose the best-written variant in each cluster. A reviewer's scores on their own single proposals were discarded. The 50 highest-scoring items are below; the 11 that did not make it are listed at the end.

The six lenses: reduction and minimalism; plain-language comprehension for low-literacy readers; ageing and accessibility; type and layout system; mobile and low-end devices; interaction flow.

**Score** = 0.45 × clarity + 0.30 × sleek + 0.25 × safe, each the mean of the counted votes.
- *Clarity*: how much it helps a low-literacy reader or an older adult understand the screen and finish the task.
- *Sleek*: how much cleaner, calmer and more minimal the product becomes.
- *Safe*: how safely it can be implemented as written.

No item received a veto.

**Limits.** The reviewers were AI agents, not people from the communities RediHealth serves; treat the ranking as informed expert judgement, not as user research. File paths in the winning proposals were checked against the repository (203 paths; the only two that do not exist are files the proposals ask to be created). Line numbers were correct when written and will drift as the code changes: locate by the quoted class strings and copy, not by line number. Animation was judged from code, because the review browser froze motion.

## Ground rules every change must keep

These come from `CLAUDE.md` and `DESIGN.md` and are not open to reinterpretation.

1. No pills, badges, status chips or eyebrow tags. A label, category, status or count is plain text or left out. Real controls (filters, tabs, answer choices) are buttons and are fine.
2. No status dots and no decorative status icons. An icon is allowed only as the control itself or to mark a real action.
3. Button labels stay on one line at every width in all seven languages (ro, en, sq, it, hr, rom, ru): `whitespace-nowrap`, buttons size to their label, rows of whole buttons wrap. If a label does not fit, shorten the copy in every language.
4. Calm motion only: no hover lift, no hover or press scale, no bounce, no parallax, no custom cursor, no looping attention-seeker. Everything is static under `prefers-reduced-motion` and under the in-app Calm Motion setting (`html[data-calm-motion]`).
5. Red (`primary`) is for 112 and emergencies only. Sapphire is the main action. Amber marks health mediators.
6. WCAG AA at least: 4.5:1 text contrast in light and dark, 44px touch targets with 8px between them, visible focus, nothing conveyed by colour alone.
7. Body text is at least 16px.
8. No change to behaviour, data, APIs, authentication or routes beyond what an item states. No new dependencies.
9. Copy may be shortened or simplified but its meaning must hold, and every copy change is made in all seven languages in the same place the component keeps its strings.
10. Many `*.test.ts` files assert on component source strings. Keep them passing; change an assertion only when the item itself changes what the assertion pins, and say so.
11. Next.js here is version 16 and differs from earlier versions: read the relevant guide in `node_modules/next/dist/docs/` before touching routing, layout, metadata, fonts or dynamic imports.

## Decisions the owner must make before some items ship

| Item | Decision needed |
|---|---|
| P15 (LIT-P15) | Clinical owner to confirm the single plain alarm-signs list is complete. |
| P41 (LIT-P05) | Clinical owner to confirm the plain label for the general body model. |
| P42 (LIT-P06) | Native check of the Russian and Romani severity wording before merge. |
| P43 (LIT-P11) | The consent wording is legal text: owner or lawyer approves it in all seven languages. Implement the reordering; leave the consent text unchanged until approved. |
| P47 (LIT-P14) | Owner to confirm two facts quoted in the new copy (how the code is used, which specialties are available). |
| P50 (LIT-P16) | Clinical sign-off on plain labels that sit on clinical thresholds, in all seven languages. |
| P17 (LIT-P01) | The one name chosen for each destination, in all seven languages. The proposal gives a recommended list; the owner confirms it. |
| P01 | The symptom check stops opening on the 3D body on phones. The 3D view stays one tap away. Five of six reviewers proposed this independently; it changes the first impression of a showcase feature. |
| P06 | The 'How can we help?' section is removed from the home page; the hero panel becomes the only router. |

## Implementation order

Work through the phases in order, and through the items in the order listed inside each phase. The order respects every dependency the reviewers named.

### Phase 1: defects and safe quick wins

| Order | Item | Title | Score | Effort | Risk |
|---|---|---|---|---|---|
| 1 | [P03](#p03) | Every 'talk to a doctor' link goes to the doctor service | 8.02 | S | Low |
| 2 | [P11](#p11) | Honest, consistent step counts | 7.36 | S | Low |
| 3 | [P02](#p02) | Label every exit on the symptom-check result | 8.04 | S | Low |
| 4 | [P09](#p09) | Feedback and report entry points kept off tasks | 7.61 | S | Low |
| 5 | [P25](#p25) | 112 strip as a 44px row | 6.97 | S | Low |
| 6 | [P14](#p14) | Stop motion that loops or follows the pointer | 7.32 | S | Low |
| 7 | [P23](#p23) | Calm the hero panel so only the row under your finger reacts | 7.03 | S | Low |
| 8 | [P22](#p22) | News opens on the list; map on request | 7.03 | S | Low |
| 9 | [P34](#p34) | Leave the page scrollable around the phone map | 6.67 | S | Low |
| 10 | [P18](#p18) | Put the photo tips first and offer a person when reading fails | 7.14 | S | Low |
| 11 | [P47](#p47) | Make the doctor booking words exact on the step that commits | 6.05 | S | Low |
| 12 | [P41](#p41) | Replace "Anatomy: general / female" with a plain women's-body switch | 6.23 | S | Low |
| 13 | [P42](#p42) | Use one word for severity and fix the contradictory and mistranslated scales | 6.22 | S | Low |
| 14 | [P15](#p15) | Use one plain alarm-signs list everywhere 112 is offered | 7.28 | S | Low |
| 15 | [P19](#p19) | Remove the topic page's repeated callout and give the dictionary one quiet line | 7.14 | S | Low |
| 16 | [P36](#p36) | Remove decorative work from the phone home's first paint | 6.52 | S | Low |
| 17 | [P49](#p49) | Inputs at 16px with visible labels, and a way to resend codes | 6.01 | S | Low |

### Phase 2: foundations the later phases build on

| Order | Item | Title | Score | Effort | Risk |
|---|---|---|---|---|---|
| 1 | [P33](#p33) | Every font size on rem tokens that scale with the comfort setting | 6.75 | L | Medium |
| 2 | [P32](#p32) | Large text: whole-button reflow instead of ellipsis | 6.77 | M | Medium |
| 3 | [P46](#p46) | Fix Button.tsx, then move every hand-made action button onto it | 6.08 | L | Medium |
| 4 | [P48](#p48) | Build one PageHeader and use it on every public page | 6.03 | L | Medium |
| 5 | [P17](#p17) | One name per destination, used everywhere | 7.21 | M | Low |
| 6 | [P40](#p40) | Put every colour back on the palette; red means 112 | 6.31 | M | Low |
| 7 | [P45](#p45) | Set one reading measure in rem and give Container real widths | 6.10 | M | Low |

### Phase 3: chrome and home

| Order | Item | Title | Score | Effort | Risk |
|---|---|---|---|---|---|
| 1 | [P27](#p27) | Words on the phone header's icon buttons | 6.90 | S | Medium |
| 2 | [P38](#p38) | Set the header, menu, Comfort menu and search on body tokens | 6.45 | M | Medium |
| 3 | [P04](#p04) | Rebuild the comfort menu as three plain, 16px choices | 7.79 | S | Low |
| 4 | [P26](#p26) | One assistant entry in the desktop header ('Start here' split button removed) | 6.93 | S | Low |
| 5 | [P35](#p35) | Put "Talk to a doctor online" in the hero's six choices | 6.66 | M | Medium |
| 6 | [P06](#p06) | Hero panel as the only home router (HelpOptions removed) | 7.62 | M | Medium |
| 7 | [P29](#p29) | Let hero rows act directly when the middle view adds nothing | 6.86 | M | Medium |
| 8 | [P28](#p28) | Fewer scroll reveals; home as a plain scrolling page | 6.88 | M | Low |
| 9 | [P24](#p24) | Tool sub-tabs on phones (three competing answers: fit all four / move to page end / move into menu) | 7.00 | S | Low |
| 10 | [P16](#p16) | One text-size and reading-level control (page-level A+ retired) | 7.22 | M | Medium |

### Phase 4: the tools

| Order | Item | Title | Score | Effort | Risk |
|---|---|---|---|---|---|
| 1 | [P01](#p01) | Symptom check opens on the list on phones; 3D only on request | 8.58 | M | Medium |
| 2 | [P39](#p39) | 3D body controls: labelled, 44px, spaced | 6.39 | M | Medium |
| 3 | [P13](#p13) | Assistant first screen: one flat list, one symptom entry | 7.32 | M | Low |
| 4 | [P44](#p44) | Make the request form say what was asked for | 6.10 | M | Medium |
| 5 | [P43](#p43) | Ask about the problem first on the request-help form | 6.12 | M | Medium |
| 6 | [P10](#p10) | Facts and safety words at body size and full contrast | 7.60 | M | Low |
| 7 | [P05](#p05) | Write each medicine's food rule and course length as a sentence | 7.79 | M | Low |
| 8 | [P07](#p07) | Clinic card actions labelled with words | 7.62 | S | Low |
| 9 | [P21](#p21) | Find help on phones: filters reduced, results first | 7.04 | L | Medium |
| 10 | [P12](#p12) | Phone audio player as one labelled bar | 7.34 | M | Medium |
| 11 | [P08](#p08) | One labelled Listen control, in one place | 7.61 | M | Low |

### Phase 5: guides and finish

| Order | Item | Title | Score | Effort | Risk |
|---|---|---|---|---|---|
| 1 | [P20](#p20) | Rework the guides index: one filter row, plain jump links, lighter cards | 7.08 | M | Low |
| 2 | [P50](#p50) | Replace clinical labels in health guides with plain ones | 6.00 | M | Medium |
| 3 | [P30](#p30) | Allow one filled sapphire button per screen; everything else outlined or a link | 6.78 | L | Medium |
| 4 | [P31](#p31) | Replace coloured side stripes with plain sentences and headings | 6.78 | M | Low |
| 5 | [P37](#p37) | Spend bold only on headings, labels and the one key fact | 6.46 | M | Low |

## Ranking

| Rank | Item | Title | Score | Clarity | Sleek | Safe | Source |
|---|---|---|---|---|---|---|---|
| 1 | [P01](#p01) | Symptom check opens on the list on phones; 3D only on request | 8.58 | 9.8 | 8.8 | 6.0 | AGE-P09, LIT-P04, FLO-P05, MOB-P01, RED-P07 |
| 2 | [P02](#p02) | Label every exit on the symptom-check result | 8.04 | 9.0 | 5.8 | 9.0 | FLO-P11 |
| 3 | [P03](#p03) | Every 'talk to a doctor' link goes to the doctor service | 8.02 | 9.2 | 5.3 | 9.2 | LIT-P02, FLO-P01, RED-P02 |
| 4 | [P04](#p04) | Rebuild the comfort menu as three plain, 16px choices | 7.79 | 8.0 | 6.8 | 8.6 | AGE-P03 |
| 5 | [P05](#p05) | Write each medicine's food rule and course length as a sentence | 7.79 | 9.2 | 6.0 | 7.4 | LIT-P12 |
| 6 | [P06](#p06) | Hero panel as the only home router (HelpOptions removed) | 7.62 | 7.3 | 9.0 | 6.5 | FLO-P03, RED-P01 |
| 7 | [P07](#p07) | Clinic card actions labelled with words | 7.62 | 8.5 | 5.8 | 8.2 | AGE-P12, MOB-P12 |
| 8 | [P08](#p08) | One labelled Listen control, in one place | 7.61 | 8.2 | 7.8 | 6.3 | AGE-P08, LIT-P09, FLO-P16, RED-P06, SYS-P08 |
| 9 | [P09](#p09) | Feedback and report entry points kept off tasks | 7.61 | 7.2 | 7.7 | 8.3 | AGE-P14, FLO-P10, MOB-P07, RED-P11 |
| 10 | [P10](#p10) | Facts and safety words at body size and full contrast | 7.60 | 9.0 | 5.2 | 8.0 | AGE-P04, SYS-P03 |
| 11 | [P11](#p11) | Honest, consistent step counts | 7.36 | 8.0 | 6.0 | 7.8 | AGE-P11, LIT-P03, FLO-P06, RED-P08 |
| 12 | [P12](#p12) | Phone audio player as one labelled bar | 7.34 | 7.7 | 7.8 | 6.2 | AGE-P13, MOB-P08 |
| 13 | [P13](#p13) | Assistant first screen: one flat list, one symptom entry | 7.32 | 7.0 | 7.7 | 7.5 | LIT-P07, FLO-P07 |
| 14 | [P14](#p14) | Stop motion that loops or follows the pointer | 7.32 | 5.8 | 8.2 | 9.0 | FLO-P13 |
| 15 | [P15](#p15) | Use one plain alarm-signs list everywhere 112 is offered | 7.28 | 8.4 | 6.0 | 6.8 | LIT-P15 |
| 16 | [P16](#p16) | One text-size and reading-level control (page-level A+ retired) | 7.22 | 7.3 | 7.7 | 6.5 | AGE-P07, RED-P05 |
| 17 | [P17](#p17) | One name per destination, used everywhere | 7.21 | 8.7 | 6.2 | 5.8 | LIT-P01, RED-P04 |
| 18 | [P18](#p18) | Put the photo tips first and offer a person when reading fails | 7.14 | 7.2 | 6.0 | 8.4 | LIT-P13 |
| 19 | [P19](#p19) | Remove the topic page's repeated callout and give the dictionary one quiet line | 7.14 | 6.2 | 8.0 | 7.8 | RED-P12 |
| 20 | [P20](#p20) | Rework the guides index: one filter row, plain jump links, lighter cards | 7.08 | 6.4 | 8.0 | 7.2 | RED-P14 |
| 21 | [P21](#p21) | Find help on phones: filters reduced, results first | 7.04 | 7.8 | 7.8 | 4.7 | MOB-P11, RED-P15 |
| 22 | [P22](#p22) | News opens on the list; map on request | 7.03 | 6.2 | 6.8 | 8.8 | MOB-P16, RED-P09 |
| 23 | [P23](#p23) | Calm the hero panel so only the row under your finger reacts | 7.03 | 5.6 | 8.2 | 8.2 | FLO-P15 |
| 24 | [P24](#p24) | Tool sub-tabs on phones (three competing answers: fit all four / move to page end / move into menu) | 7.00 | 6.8 | 6.8 | 7.5 | AGE-P15, MOB-P10, RED-P10 |
| 25 | [P25](#p25) | 112 strip as a 44px row | 6.97 | 7.8 | 4.8 | 8.0 | AGE-P05, MOB-P09 |
| 26 | [P26](#p26) | One assistant entry in the desktop header ('Start here' split button removed) | 6.93 | 5.7 | 7.7 | 8.3 | FLO-P09, RED-P03 |
| 27 | [P27](#p27) | Words on the phone header's icon buttons | 6.90 | 8.3 | 5.5 | 6.0 | AGE-P06, LIT-P10 |
| 28 | [P28](#p28) | Fewer scroll reveals; home as a plain scrolling page | 6.88 | 5.7 | 8.2 | 7.5 | FLO-P14, MOB-P15 |
| 29 | [P29](#p29) | Let hero rows act directly when the middle view adds nothing | 6.86 | 7.0 | 7.2 | 6.2 | FLO-P04 |
| 30 | [P30](#p30) | Allow one filled sapphire button per screen; everything else outlined or a link | 6.78 | 7.0 | 8.6 | 4.2 | RED-P13 |
| 31 | [P31](#p31) | Replace coloured side stripes with plain sentences and headings | 6.78 | 5.8 | 7.4 | 7.8 | SYS-P12 |
| 32 | [P32](#p32) | Large text: whole-button reflow instead of ellipsis | 6.77 | 8.3 | 5.3 | 5.7 | AGE-P02, SYS-P07 |
| 33 | [P33](#p33) | Every font size on rem tokens that scale with the comfort setting | 6.75 | 8.3 | 6.7 | 4.0 | AGE-P01, SYS-P01 |
| 34 | [P34](#p34) | Leave the page scrollable around the phone map | 6.67 | 6.8 | 5.2 | 8.2 | MOB-P13 |
| 35 | [P35](#p35) | Put "Talk to a doctor online" in the hero's six choices | 6.66 | 8.4 | 4.6 | 6.0 | FLO-P02 |
| 36 | [P36](#p36) | Remove decorative work from the phone home's first paint | 6.52 | 5.0 | 7.4 | 8.2 | MOB-P14 |
| 37 | [P37](#p37) | Spend bold only on headings, labels and the one key fact | 6.46 | 5.6 | 6.8 | 7.6 | SYS-P14 |
| 38 | [P38](#p38) | Set the header, menu, Comfort menu and search on body tokens | 6.45 | 7.4 | 5.4 | 6.0 | SYS-P02 |
| 39 | [P39](#p39) | 3D body controls: labelled, 44px, spaced | 6.39 | 6.5 | 6.8 | 5.7 | AGE-P10, MOB-P03 |
| 40 | [P40](#p40) | Put every colour back on the palette; red means 112 | 6.31 | 5.8 | 6.0 | 7.6 | SYS-P11 |
| 41 | [P41](#p41) | Replace "Anatomy: general / female" with a plain women's-body switch | 6.23 | 7.0 | 4.6 | 6.8 | LIT-P05 |
| 42 | [P42](#p42) | Use one word for severity and fix the contradictory and mistranslated scales | 6.22 | 7.4 | 3.8 | 7.0 | LIT-P06 |
| 43 | [P43](#p43) | Ask about the problem first on the request-help form | 6.12 | 7.6 | 5.0 | 4.8 | LIT-P11 |
| 44 | [P44](#p44) | Make the request form say what was asked for | 6.10 | 7.0 | 5.0 | 5.8 | FLO-P08 |
| 45 | [P45](#p45) | Set one reading measure in rem and give Container real widths | 6.10 | 5.4 | 5.4 | 8.2 | SYS-P13 |
| 46 | [P46](#p46) | Fix Button.tsx, then move every hand-made action button onto it | 6.08 | 6.2 | 7.8 | 3.8 | SYS-P06 |
| 47 | [P47](#p47) | Make the doctor booking words exact on the step that commits | 6.05 | 6.6 | 3.6 | 8.0 | LIT-P14 |
| 48 | [P48](#p48) | Build one PageHeader and use it on every public page | 6.03 | 5.4 | 8.0 | 4.8 | SYS-P04 |
| 49 | [P49](#p49) | Inputs at 16px with visible labels, and a way to resend codes | 6.01 | 6.8 | 4.0 | 7.0 | AGE-P16 |
| 50 | [P50](#p50) | Replace clinical labels in health guides with plain ones | 6.00 | 7.2 | 5.2 | 4.8 | LIT-P16 |

## Cross-reference: original proposal IDs

The specifications below refer to each other by the IDs their authors used. This table maps every original ID to its place in this document.

| Original ID | Item | Role |
|---|---|---|
| AGE-P01 | P33 | other version, Appendix A |
| AGE-P02 | P32 | other version, Appendix A |
| AGE-P03 | P04 | chosen specification |
| AGE-P04 | P10 | chosen specification |
| AGE-P05 | P25 | other version, Appendix A |
| AGE-P06 | P27 | chosen specification |
| AGE-P07 | P16 | chosen specification |
| AGE-P08 | P08 | other version, Appendix A |
| AGE-P09 | P01 | other version, Appendix A |
| AGE-P10 | P39 | other version, Appendix A |
| AGE-P11 | P11 | other version, Appendix A |
| AGE-P12 | P07 | other version, Appendix A |
| AGE-P13 | P12 | other version, Appendix A |
| AGE-P14 | P09 | other version, Appendix A |
| AGE-P15 | P24 | other version, Appendix A |
| AGE-P16 | P49 | chosen specification |
| FLO-P01 | P03 | chosen specification |
| FLO-P02 | P35 | chosen specification |
| FLO-P03 | P06 | chosen specification |
| FLO-P04 | P29 | chosen specification |
| FLO-P05 | P01 | other version, Appendix A |
| FLO-P06 | P11 | chosen specification |
| FLO-P07 | P13 | chosen specification |
| FLO-P08 | P44 | chosen specification |
| FLO-P09 | P26 | other version, Appendix A |
| FLO-P10 | P09 | chosen specification |
| FLO-P11 | P02 | chosen specification |
| FLO-P12 | not in the top 50 (Appendix B) | chosen specification |
| FLO-P13 | P14 | chosen specification |
| FLO-P14 | P28 | chosen specification |
| FLO-P15 | P23 | chosen specification |
| FLO-P16 | P08 | other version, Appendix A |
| LIT-P01 | P17 | chosen specification |
| LIT-P02 | P03 | other version, Appendix A |
| LIT-P03 | P11 | other version, Appendix A |
| LIT-P04 | P01 | other version, Appendix A |
| LIT-P05 | P41 | chosen specification |
| LIT-P06 | P42 | chosen specification |
| LIT-P07 | P13 | other version, Appendix A |
| LIT-P08 | not in the top 50 (Appendix B) | chosen specification |
| LIT-P09 | P08 | other version, Appendix A |
| LIT-P10 | P27 | other version, Appendix A |
| LIT-P11 | P43 | chosen specification |
| LIT-P12 | P05 | chosen specification |
| LIT-P13 | P18 | chosen specification |
| LIT-P14 | P47 | chosen specification |
| LIT-P15 | P15 | chosen specification |
| LIT-P16 | P50 | chosen specification |
| MOB-P01 | P01 | chosen specification |
| MOB-P02 | not in the top 50 (Appendix B) | chosen specification |
| MOB-P03 | P39 | chosen specification |
| MOB-P04 | not in the top 50 (Appendix B) | chosen specification |
| MOB-P05 | not in the top 50 (Appendix B) | chosen specification |
| MOB-P06 | not in the top 50 (Appendix B) | chosen specification |
| MOB-P07 | P09 | other version, Appendix A |
| MOB-P08 | P12 | chosen specification |
| MOB-P09 | P25 | chosen specification |
| MOB-P10 | P24 | chosen specification |
| MOB-P11 | P21 | chosen specification |
| MOB-P12 | P07 | chosen specification |
| MOB-P13 | P34 | chosen specification |
| MOB-P14 | P36 | chosen specification |
| MOB-P15 | P28 | other version, Appendix A |
| MOB-P16 | P22 | chosen specification |
| RED-P01 | P06 | other version, Appendix A |
| RED-P02 | P03 | other version, Appendix A |
| RED-P03 | P26 | chosen specification |
| RED-P04 | P17 | other version, Appendix A |
| RED-P05 | P16 | other version, Appendix A |
| RED-P06 | P08 | other version, Appendix A |
| RED-P07 | P01 | other version, Appendix A |
| RED-P08 | P11 | other version, Appendix A |
| RED-P09 | P22 | other version, Appendix A |
| RED-P10 | P24 | other version, Appendix A |
| RED-P11 | P09 | other version, Appendix A |
| RED-P12 | P19 | chosen specification |
| RED-P13 | P30 | chosen specification |
| RED-P14 | P20 | chosen specification |
| RED-P15 | P21 | other version, Appendix A |
| RED-P16 | not in the top 50 (Appendix B) |  |
| SYS-P01 | P33 | chosen specification |
| SYS-P02 | P38 | chosen specification |
| SYS-P03 | P10 | other version, Appendix A |
| SYS-P04 | P48 | chosen specification |
| SYS-P05 | not in the top 50 (Appendix B) | chosen specification |
| SYS-P06 | P46 | chosen specification |
| SYS-P07 | P32 | chosen specification |
| SYS-P08 | P08 | chosen specification |
| SYS-P09 | not in the top 50 (Appendix B) | chosen specification |
| SYS-P10 | not in the top 50 (Appendix B) | chosen specification |
| SYS-P11 | P40 | chosen specification |
| SYS-P12 | P31 | chosen specification |
| SYS-P13 | P45 | chosen specification |
| SYS-P14 | P37 | chosen specification |
| SYS-P15 | not in the top 50 (Appendix B) | chosen specification |
| SYS-P16 | not in the top 50 (Appendix B) | chosen specification |

## The 50 proposals in full

Each entry gives the panel's result, any chair ruling that resolves a conflict between proposals, and then the specification from the reviewer whose version the panel chose. Where several reviewers proposed the same change, their notes say what to take from the other versions, and those versions are reproduced in Appendix A. Finding IDs under 'Resolves' refer to the round 1 audits (RED, LIT, AGE, SYS, MOB, FLO).

<a id="p01"></a>

### P01. Open the symptom check on the list on phones; load 3D only on request

**Rank 1 of 61. Score 8.58** (clarity 9.8, sleek 8.8, safe 6.0; 6 votes counted).  
**Proposed independently by 5 reviewers:** AGE-P09, LIT-P04, FLO-P05, MOB-P01, RED-P07. **Specification chosen:** MOB-P01 (Mobile and low-end devices); lead votes: MOB-P01 6.  
**Chair ruling:** Lands before P39: the 3D controls are redesigned for a view that is now opened on request.  

- Surface: Symptom check (/health-check), phones under 1024px
- Files: src/components/health-check/HealthCheckExplorer.tsx:952-955, src/components/health-check/HealthCheckExplorer.tsx:2076-2118, src/components/health-check/AnatomicalBodyMap.tsx:33-48, src/components/health-check/AnatomicalBodyMap.tsx:563-570, src/components/health-check/AnatomicalBodyMap.tsx:880-900
- Resolves: MOB-01, MOB-02, RED-19, AGE-08, LIT-12, FLO-10, FLO-11, FLO-28
- Now: `effectiveMobileAreaMode` defaults to `"3d"` unless text scale is xl. A 375px phone therefore opens on a 309px sticky WebGL stage, and the question sits in the last 50px of the screen. In List mode the stage only gets `max-lg:hidden`, so `AnatomicalBodyMap` still mounts and still fetches `muscular.glb` (3.2MB) and `human-atlas-layers.bin` (3.1MB). At step 2 the list choice is lost and the body comes back.
- Change:
  1. In `HealthCheckExplorer.tsx:954` change the phone default to `mobileAreaModeOverride ?? "list"`. Desktop (lg+) is unchanged.
  2. Make the phone mode hold for the whole visit. Drop the `stepId === "area" &&` condition from `mobileListOnly`, so a phone reader who is in List mode never sees the stage on later steps. Keep the result step hidden as today.
  3. Add a prop `deferred?: boolean` to `AnatomicalBodyMap`. When it is true, the component renders nothing and does not mount `AnatomicalViewport3D`, so no three.js chunk or model is requested. Pass `deferred={mobileListOnly && !isDesktop}`. Read `isDesktop` with the existing `useSyncExternalStore(subscribeDesktopLayout, readDesktopLayout, …)` helper in AnatomicalBodyMap.tsx.
  4. Keep the existing List / 3D body segmented control above the list on phones, with the 3D option worded as "Show on a 3D body" (new copy key `showOn3d`, translated into all seven languages). Choosing it sets the override to `"3d"`, which mounts the viewport and starts the download, showing the existing load progress.
  5. Order the phone first screen as: h1, the one-line lead, the step question, the list of areas. The segmented control sits under the question, not above it.
- Why it is cleaner: the first phone screen holds one question and one list, with no floating toolbars, D-pad or layer icons.
- Why it is easier for low-literacy and older readers: the question "Where do you feel pain?" is the first thing under the title, in words, with tappable rows. The screen no longer changes under them after they chose List.
- Keep: the 3D body and every function in it, desktop behaviour, the text-scale-xl list default, the `hc-` stage expansion on phones once 3D is chosen, the anatomy-consistency and health-check tests, and the read-aloud of the step.
- Verify: at 360x740 and 375x812 in en, ru and ro, open /health-check. The question and at least four area rows are visible without scrolling. In the Network panel no `muscular.glb`, `human-atlas-layers.bin` or three.js chunk is requested until "Show on a 3D body" is tapped. Go through steps 1 to 3 in List mode: the stage never appears. At 1280px, 3D still loads as today. Run `npm test` (health-check suites).
- Effort: M
- Risk: Medium, because the stage and sheet layout logic in HealthCheckExplorer is large and `stageVisibleInLayout` must follow the new rule.

**Panel notes**

- *system*: Removes the biggest phone barrier. Take AGE-P09/LIT-P04 plain toggle wording ("Body picture") and RED-P07's Front/Back-only phone toolbar.
- *flow*: Removes the biggest stall on phones. MOB-P01 orders the first screen and defers 3D cleanly; add FLO-P05's switch kept on every step and AGE-P09's no-sheet list.
- *ageing*: MOB-P01's deferred prop truly stops the model download; take LIT-P04's plain toggle word. Removes the biggest phone barrier and a dozen floating controls.
- *mobile*: MOB-P01 is the only one that sees List mode still mounts AnatomicalBodyMap. Add AGE-P09's 'no sheet in list mode' and FLO-P05's switch kept on every step.
- *reduction*: Removes the biggest phone barrier. MOB-P01 alone stops the hidden mount; take FLO-P05's switch kept visible every step and LIT-P04's 'Body picture' wording.
- *comprehension*: Lead MOB-P01: it alone defers the mount (List today only hides the stage). Use the plain 'Body picture' wording from LIT-P04/AGE-P09, not 'Show on a 3D body'.

---

<a id="p02"></a>

### P02. Label every exit on the symptom-check result

**Rank 2 of 61. Score 8.04** (clarity 9.0, sleek 5.8, safe 9.0; 5 votes counted).  
**Proposed by:** FLO-P11 (Interaction flow).  

- Surface: Symptom check result
- Files: src/components/health-check/HealthCheckExplorer.tsx:1914-1946 (`routingIconButton`, `renderRoutingStack`), health-check-copy.ts:22-23 (`doctorBook`, `doctorNow`)
- Resolves: FLO-12, AGE-12, LIT-15
- Now: The result offers one labelled button (`c.doctorBook`) and, on the same row, two 44px icon-only squares: a stethoscope for "Doctor now" and a pin for the nearby place. Their names exist only as `sr-only` text and `title` tooltips.
- Change:
  1. Replace the row with a column of whole-width labelled links, in priority order: "Talk to the on-call doctor now" (`c.doctorNow`, primary, to the waiting room per FLO-P01 step 4), "Book a call with a doctor" (`c.doctorBook`, secondary outline), and the place link with its label (`placeLabel`, tertiary text link).
  2. Use `whitespace-nowrap`, let each button size to its label, and stack them on phones (`flex flex-col gap-2`; `sm:flex-row sm:flex-wrap` on wider screens).
  3. Keep the icons only inside labelled buttons, at their current size, or drop them.
  4. Remove `routingIconButton` if nothing else uses it.
- Why it is cleaner: One clear primary and two quieter options instead of a button squeezed beside two symbols.
- Why it is easier for low-literacy and older readers: The fastest route to a doctor is written in words, so it no longer depends on knowing that a stethoscope means "now".
- Keep: The 112 action on emergency results (`emergencyButton`, :2979); the place category logic (`findHelpHref`); the print summary and the share button.
- Verify: Finish a non-emergency check at 375 and 1440 in en, sq and rom. Three labelled actions, none truncated or wrapping. Each opens the right page. `printSummary.test.ts` passes.
- Effort: S
- Risk: Low; presentation of existing links only.

**Panel notes**

- *system*: Icon-only exits on the result are a real dead end for these readers; small, precise fix.
- *ageing*: The fastest care route on the most important screen becomes words instead of a stethoscope glyph; presentation only.
- *mobile*: Icon-only exits on the result screen stop people at the last step. Labelled, stacked links fix it cheaply.
- *reduction*: Fastest route to a doctor on the most important screen becomes words, not a stethoscope square. Small and safe.
- *comprehension*: The fastest route to a doctor on the result screen is an unlabelled stethoscope today. Words fix it with a tiny change.

---

<a id="p03"></a>

### P03. Send every "talk to a doctor" link to the doctor service

**Rank 3 of 61. Score 8.02** (clarity 9.2, sleek 5.3, safe 9.2; 6 votes counted).  
**Proposed independently by 3 reviewers:** LIT-P02, FLO-P01, RED-P02. **Specification chosen:** FLO-P01 (Interaction flow); lead votes: FLO-P01 4, RED-P02 1, LIT-P02 1.  
**Chair ruling:** For the request-help page's mediator heading and lead, use FLO-P08's version (P44) as the single source; do not also add LIT-P02's optional lead line.  

- Surface: Home hero panel, home help section, symptom-check result
- Files: src/components/landing/hero/TriagePanel.tsx:657-668, src/lib/i18n/hero-copy.ts:131-134 (and the same keys in ro, sq, it, hr, rom, ru blocks), src/components/landing/HelpOptions.tsx:106-110 (and every locale's option 3), src/components/health-check/HealthCheckExplorer.tsx:1919-1935
- Resolves: FLO-01, FLO-06, LIT-02, LIT-25
- Now: Each hero answer view ends with "Want to talk to a doctor? Book a call", and the alarm view ends with "No alarm signs? Talk to a doctor online". Both link to `/get-help?mode=doctor`, which shows a contact form called "Ask for help". The home card "Talk to a doctor online" has the button "See doctors", but no list of doctors exists.
- Change:
  1. In TriagePanel.tsx:660, change the link from `localHref("/get-help?mode=doctor", lang)` to `localHref("/medic-online", lang)`.
  2. In hero-copy.ts, for all seven locales, set `doctorLink` to "Talk to a doctor online" (en) and set `problemDoctorLink` to the same string, so the two keys carry one name. Keep `doctorPrompt` "Want to talk to a doctor?" and `problemDoctorPrompt` (see LIT-04, out of my lens).
  3. In HelpOptions.tsx, change option 3's `cta` from "See doctors" to "Talk to a doctor" in all seven locales (only if FLO-P03 is not adopted).
  4. In HealthCheckExplorer.tsx:1928, keep `?queue=now`, but make it work through FLO-P12 step 3. Until then, point that link at `/medic-online/asteptare` directly, since that is the on-call waiting room.
  5. Grep the repo for `get-help?mode=doctor` and send any other hits to `/medic-online`.
- Why it is cleaner: One doctor destination for one doctor label. The site stops having two meanings for "talk to a doctor".
- Why it is easier for low-literacy and older readers: The tap that says "doctor" ends at a doctor, so the reader arrives where they expected and does not need to recognise a contact form as a dead end.
- Keep: /get-help keeps working for its own purpose (a person calls you back). The 112 button and the alarm list stay first in the problem view. Button labels stay on one line (`whitespace-nowrap` already present). The `Hero.test.ts` copy-parity checks keep passing.
- Verify: At 375 and 1440, open each of the six hero choices, tap the doctor link at the bottom, and confirm it lands on /medic-online in en, ro and rom. Grep shows no `mode=doctor` left. The label does not wrap at 320px in sq and hr (the longest).
- Effort: S
- Risk: Low; only link targets and string values change.

**Panel notes**

- *system*: Fixes a broken promise with one href. Take RED-P02's single shared label so it matches the C03 naming decision.
- *flow*: A doctor label must end at a doctor; tiny, verifiable. Add FLO-P01's waiting-room repoint for the result's 'doctor now' link and LIT-P02's mediator lead line.
- *ageing*: FLO-P01 also fixes the symptom-result and HelpOptions links; one doctor label, one place. Link targets only, so very safe.
- *mobile*: LIT-P02 also fixes the mediator lead on /get-help. Take FLO-P01 step 4 (result link to the waiting room) and RED-P02's one shared string.
- *reduction*: A doctor label must end at a doctor. FLO-P01 also fixes the result-screen link; take LIT-P02's mediator lead line on /get-help.
- *comprehension*: Lead FLO-P01: it also fixes HelpOptions 'See doctors' and the result link. A doctor promise that opens a contact form is the top stall for these readers.

---

<a id="p04"></a>

### P04. Rebuild the comfort menu as three plain, 16px choices

**Rank 4 of 61. Score 7.79** (clarity 8.0, sleek 6.8, safe 8.6; 5 votes counted).  
**Proposed by:** AGE-P03 (Ageing and accessibility).  
**Chair ruling:** Owns the comfort menu's layout; P38 covers the rest of the chrome.  

- Surface: comfort menu (header popover and drawer section)
- Files: src/components/layout/ComfortMenu.tsx:246-355, 425-445
- Resolves: AGE-05, SYS-25, AGE-25
- Now: section labels are `text-xs text-muted-foreground`, size options show "A / A+ / A++" glyphs over `text-[11px] truncate` labels in a three-column grid, reading mode is `text-[13px]`, and the Calm Motion switch has a `text-xs` label and `text-[11px]` help.
- Change:
  1. Section headings ("Text size", "Reading mode") become `text-body font-semibold text-foreground`.
  2. Size options become a vertical list of three full-width radio-style buttons (`role="radio"` within `role="radiogroup"`, `min-h-12`, `text-body`), each showing its label rendered at its own scale (Normal at 1rem, Large at 1.14rem, Extra large at 1.26rem) instead of "A / A+ / A++". Remove the glyph spans.
  3. Reading mode: two stacked full-width options at `text-body`; no `truncate`.
  4. Calm Motion switch: label `text-body`, help `text-meta text-muted-foreground` (no 11px).
  5. Reset: `text-body` link-styled button.
  6. Drop the drawer header "Aa" tile (`:433-437`) and the bordered/tinted section shell (`:429`), so the menu is plain rows.
- Why it is cleaner: no glyph code, no 3-column squeeze, one type size, one shell fewer.
- Why it is easier for low-literacy and older readers: they see the size they are choosing before they choose it, in words they can read at normal size.
- Keep: all three settings and their persistence; `aria-pressed`/switch semantics (radio is equivalent); the Calm Motion switch behaviour.
- Verify: open the menu at 375 in all three scales and in ro, ru, rom; no text under 14px; nothing truncated; keyboard arrows move between radios; ComfortAndAssistant.test.ts passes (update selectors if needed).
- Effort: S
- Risk: Low. One component, no data change.

**Panel notes**

- *system*: Fixes the 11px menu for the readers who need it most; one component, low risk. SYS-P02 should defer to it for the Comfort menu.
- *flow*: One component; replaces A/A+/A++ glyphs and 11px labels with plain choices older readers can read.

---

<a id="p05"></a>

### P05. Write each medicine's food rule and course length as a sentence

**Rank 5 of 61. Score 7.79** (clarity 9.2, sleek 6.0, safe 7.4; 5 votes counted).  
**Proposed by:** LIT-P12 (Comprehension).  
**Chair ruling:** Set the new sentences at body size and full ink, as P10 requires.  

- Surface: Prescription result
- Files: src/components/health-assistant/PrescriptionStructuredResult.tsx:625-632 (strength), 708-737 (food timing, duration, unclear notice); src/components/health-assistant/assistant-copy.ts:897-906 (`foodTiming`, `durationLabel`, `unclearBadge`) in all locales
- Resolves: LIT-22, SYS-06, SYS-24, AGE-11 (same small-label pattern)
- Now: the Morning/Midday/Evening/Bedtime grid is large and tinted. "Before food", "Duration: 7 days" and "Unclear writing — check the dose with your pharmacist" sit beneath it at `text-xs ... text-muted-foreground`, divided by hairlines. The strength ("500 mg") sits next to the name in the same grey and can be read as the dose.
- Change:
  1. Replace the `hasBadges` row with one `<p className="mt-3 text-base leading-relaxed text-foreground">` that joins the parts into sentences: "Take it before food. Take it for 7 days." Use new keys: `foodTimingSentence.before_meal` "Take it before food.", `with_meal` "Take it with food.", `after_meal` "Take it after food.", and `durationSentence(d)` "Take it for {d}." (all seven languages; translators may reorder).
  2. Show the unclear notice as its own line in the same 16px text, starting with the medicine's name: "We could not read the dose for {name}. Ask your pharmacist." Use amber text colour only (no box, no icon), which follows the no-status-icon rule.
  3. Prefix the strength with a label: "Strength: 500 mg" (`strengthLabel`, all seven languages), at `text-sm` beside the name.
  4. Speech (`speech` and the per-card script at :206-230) reads the same sentences.
- Why it is cleaner: the strip of three small fragments split by hairlines becomes one line of plain prose.
- Why it is easier for low-literacy and older readers: the instructions people most often get wrong (food, course length, unreadable dose) are read at full size as complete sentences, and the strength can no longer be mistaken for how many pills to take.
- Keep: `renderWithUnclearHighlights` on every value, the schedule grid, warnings, print layout, per-card listen, the pharmacist banner, ClinicalUiElevationPass tests.
- Verify: with a mocked result containing before_meal, a duration and one unclear medicine, check at 375px and in print preview that the sentences are 16px foreground text and that the listen button reads them. Check ro and ru word order.
- Effort: M
- Risk: Low; presentation of existing fields only. I could not run a live prescription, so test with a fixture.

**Panel notes**

- *system*: Turns the most-misread medicine facts into sentences; prevents wrong dosing, which matters more than looks.
- *flow*: A food rule and course length as a sentence at 16px removes a real dosing error risk for low-literacy readers.
- *ageing*: Food rule and course length as full 16px sentences prevents real medication errors; the strongest single safety proposal.
- *mobile*: Food rule and course length as full sentences stop wrong dosing. A real safety gain.
- *reduction*: Food timing and course length as full sentences prevents taking medicine wrongly; the strength label stops a dose misreading.

---

<a id="p06"></a>

### P06. Make the hero panel the only router on the home page

**Rank 6 of 61. Score 7.62** (clarity 7.3, sleek 9.0, safe 6.5; 6 votes counted).  
**Proposed independently by 2 reviewers:** FLO-P03, RED-P01. **Specification chosen:** FLO-P03 (Interaction flow); lead votes: FLO-P03 4, RED-P01 2.  
**Chair ruling:** The doctor row in the hero comes from FLO-P02 (P35), which must land first: HelpOptions is the home page's only direct door to the doctor service today. Then remove HelpOptions following FLO-P03. Where RED-P01 step 2 describes a link-only doctor row, ignore it (panel vote 4 to 2).  

- Surface: Home
- Files: src/app/page.tsx:17-19, src/components/landing/HelpOptions.tsx, src/components/landing/HelpOptionsMediatorBand.tsx, src/components/landing/hero/CarePath.tsx, src/components/landing/hero/TriagePanel.tsx:555-573, src/lib/i18n/hero-copy.ts:120,125
- Resolves: RED-01, RED-02, MOB-25, FLO-06, FLO-15, LIT-06
- Now: Right under the hero's "How can we help you today?" comes "How can we help?" with a filled sapphire card, "Find out what to do", which goes to /health-assistant (a different place from the hero's "Check my symptoms"). Below it are three rows and a band, "Are you a health mediator?". The hero's only mediator link reads "For health mediators", and its hover line is "Field tools for health mediators".
- Change:
  1. Remove the `<StackLayer><HelpOptions /></StackLayer>` block from page.tsx. HelpOptions and HelpOptionsMediatorBand are then unused, so delete them. Move the three-step `CarePath` line ("Say what worries you / Get clear next steps / Talk to a doctor") under the hero lead on `sm` and up, as plain text, or drop it.
  2. In the hero panel footer, change the mediator link's copy key `mediators` to "Ask a health mediator for help" (en) in all seven languages. Keep the target `/mediatori`, whose first action is "Ask for a mediator". Remove the `UsersIcon` (decoration on a text link) and the hover subtitle `subtitles.mediators`.
  3. Leave the mediator worker entry ("Mediator sign-in") where it already is: on /mediatori and in the header menu.
- Why it is cleaner: One question and one answer set per page. A whole section, a card in a card and a fourth mediator entry go.
- Why it is easier for low-literacy and older readers: Nobody meets the same question twice with different answers, and the resident who needs a mediator now sees a link that is addressed to them.
- Keep: Every destination stays reachable: guides, assistant, doctor, finder and mediators are all in the header menu, and the panel covers them. Keep the topic wheel, myth quiz and trust sections. Update the `Hero.test.ts` cases at :201, :241, :305-327 and :363, which read HelpOptions files.
- Verify: Home at 375 and 1440: the hero is followed directly by the topics section. The panel footer reads "Ask a health mediator for help" on one line in all seven languages at 320px. If not, shorten it to "Ask a mediator" everywhere. `npm test` passes after the test updates.
- Effort: M
- Risk: Medium; landing tests reference the removed files and must be edited, not skipped.

**Panel notes**

- *system*: Removes a whole duplicate router. Keep RED-P01's direct doctor link row; take FLO-P03's mediator link wording without its icon.
- *flow*: RED-P01 keeps the doctor door when HelpOptions goes; take FLO-P03's mediator link wording 'Ask a health mediator for help' and its icon removal.
- *ageing*: FLO-P03 removes the repeated router and fixes the mediator label without touching the rows, so FLO-P02 can own the doctor row. Big calming of home.
- *mobile*: FLO-P03 also rewrites the mediator line. HelpOptions holds home's only door to the doctor, so FLO-P02 must land with it.
- *reduction*: FLO-P03 handles tests and relabels the mediator link for residents; the doctor door must land via FLO-P02 at the same time.
- *comprehension*: Lead FLO-P03: it relabels the mediator link for residents. Removing HelpOptions drops home's only doctor door, so FLO-P02 must land with it (RED-P01's concern).

---

<a id="p07"></a>

### P07. Give the clinic Call button its own row; label every action

**Rank 7 of 61. Score 7.62** (clarity 8.5, sleek 5.8, safe 8.2; 6 votes counted).  
**Proposed independently by 2 reviewers:** AGE-P12, MOB-P12. **Specification chosen:** MOB-P12 (Mobile and low-end devices); lead votes: MOB-P12 4, AGE-P12 2.  
**Chair ruling:** The call action is one full-width button reading 'Call' followed by the number (MOB-P12). This overrides the layout in SYS-P07 (P32) that puts the number below the button.  

- Surface: Find help result cards and map preview card
- Files: src/components/find-help/FindHelpExplorer.tsx:1181-1216, src/components/find-help/FindHelpExplorer.tsx:1375-1395
- Resolves: MOB-06, AGE-12, LIT-29
- Now: the call link is `PhoneIcon` plus `<span className="truncate …">{displayPhone}</span>` in one row with three `iconActionClass` buttons (directions, website, share). At 360px in hr it reads "+385 1 4…" (76px of 118px). Directions becomes icon-only (`sr-only`) whenever a phone exists.
- Change:
  1. Make the call link a full-width row: `flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap text-base font-semibold`, labelled "Call {number}" (new key `callNumber`, all seven languages). Remove `truncate` from the number span.
  2. Under it, a wrapping row (`flex flex-wrap gap-2`) of outlined whole buttons with icon and visible word: "Directions", "Website", "Send to family" (reuse the existing labels). Each is `min-h-11 whitespace-nowrap px-3 text-base`, so the row wraps whole buttons as CLAUDE.md rule 3 asks.
  3. When there is no phone, "Directions" takes the full-width primary row instead.
  4. Apply the same layout to the map preview card at `:1375-1395`.
- Why it is cleaner: one obvious action per card, with the secondary actions in a single quiet row, and no mix of icon buttons and text buttons.
- Why it is easier for low-literacy and older readers: the full number can be read aloud or checked, "Call" says what happens, and directions and sharing are no longer bare pictograms.
- Keep: `tel:` links, directions URLs, website links, the share function, `aria-label`s and the card order.
- Verify: at 360px in hr, en and ru, no number in a call button is truncated (rerun the overflow snippet from audit-mobile MOB-06: no `+…` spans with scrollWidth > clientWidth). Secondary buttons wrap to a second line rather than squeeze. Repeat on the map preview card.
- Effort: S
- Risk: Low, because only layout and labels change.

**Panel notes**

- *system*: "Call {number}" full row is unmistakable. Take AGE-P12's selectable number text and Website/Share as plain text links.
- *flow*: MOB-P12's full-width 'Call {number}' row is unmistakable; take AGE-P12's number as selectable text and the pin icon removal.
- *ageing*: MOB-P12 puts Call in a full row with the whole number and covers the map preview card; AGE-P12's plain-text number is optional extra.
- *mobile*: The number as plain text in the card body can never truncate and can be read aloud. From MOB-P12, keep a full-width Call row on phones at large scale.
- *reduction*: Unlabelled call and directions stop people reaching care. AGE-P12 keeps the number outside the button (one-line safe); take MOB-P12's map-preview coverage.
- *comprehension*: Lead MOB-P12: 'Call {number}' is full width and never truncated. Take AGE-P12's number as selectable text under the address for reading aloud.

---

<a id="p08"></a>

### P08. Make one Listen control and give it one place

**Rank 8 of 61. Score 7.61** (clarity 8.2, sleek 7.8, safe 6.3; 6 votes counted).  
**Proposed independently by 5 reviewers:** AGE-P08, LIT-P09, FLO-P16, RED-P06, SYS-P08. **Specification chosen:** SYS-P08 (Type and layout system); lead votes: SYS-P08 5, AGE-P08 1.  
**Chair ruling:** Lands after P46 and P48.  

- Surface: health guides, topic pages, news articles, get help, medic-online, find help, health check, prescription review, quiz, hero panel
- Files: src/components/health-information/ArticleListenButton.tsx:48, src/components/health-information/InlineAudioNarratorButton.tsx:28, src/components/health-assistant/PrescriptionAudioPlayer.tsx:16, inline speech buttons in HealthCheckExplorer.tsx:2240-2273, FindHelpExplorer.tsx:727-760, PrescriptionReview.tsx:794-820, GetHelpPageContent.tsx, MedicOnlineHero.tsx, TriagePanel.tsx:286-317; call sites HealthInformationPageContent.tsx:148, TopicHeroSection.tsx:102, SubjectHeaderToolbar.tsx:45, NewsArticleView.tsx:251, TrueFalseQuizSection.tsx:380
- Resolves: SYS-10, FLO-18, AGE-25, RED-25, LIT-01, LIT-30
- Now: measured at 375, "Listen" is a filled ink button 48px/16px/8px radius on Health guides, a sapphire-tinted outline 44px/14px/12px on Online doctor, a white outline 44px/14px/8px on Get help; the hero panel uses a bare speaker icon; four components and several inline versions; Romani listen/stop words differ by screen (LIT-30).
- Change:
  1. Create one `ListenButton({ text | getText, label? })` in src/components/ui/, built on `Button variant="outline" size="md"`, speaker icon plus the word; playing state swaps to stop icon plus the word "Stop". Labels from two shared copy keys only: `listen` ("Listen") and `stop` ("Stop"), defined once in translations for all seven languages (fixing LIT-30's drift).
  2. Make ArticleListenButton, InlineAudioNarratorButton, PrescriptionAudioPlayer and the inline buttons thin wrappers or direct uses of ListenButton; never the filled variant.
  3. Its place: the first item in PageHeader `actions` (SYS-P04), left edge, on every page that offers read-aloud. The hero panel's icon-only speaker gets the word "Listen" beside it.
  4. Whether section-level listen buttons stay (RED-17) is the owner's call; if they stay they are the same ListenButton.
- Why it is cleaner: one look and one position instead of five looks; the guides page no longer has a filled button competing with its real next step.
- Why it is easier for low-literacy and older readers: the feature they rely on most is the same word, shape and place on every screen, recognisable without reading the icon.
- Keep: speech engine (src/lib/audio/speech-engine.ts) and use-speech.ts behaviour; GlobalHealthAudioPlayer's playback functions (its layout is MOB-10/AGE-16's proposal); aria-pressed/live-region announcements.
- Verify: at 375 on every surface in Files, Listen computes to the same height, label size (16px), radius and colours, sits first in the action row, and says the same word per language; `rg "Listen" -g '*.tsx'` shows no remaining hand-styled listen buttons.
- Effort: M
- Risk: Low; the playback logic stays, only the trigger is unified.

**Panel notes**

- *system*: Lead sets text-body, outline, one place, never filled. Take LIT-P09's shared listen-copy file and RED-P06's section-narrator decision.
- *flow*: SYS-P08 builds on Button and fixes one place; take AGE-P08's 'never the filled button' and LIT-P09's single Romani pair. Leave A+ removal to C11.
- *ageing*: SYS-P08 builds on Button with shared keys; take LIT-P09's always-visible triage label and RED-P06's single position under the lead.
- *mobile*: Build SYS-P08 on Button. Take AGE-P08's placement under the H1 and the word in the triage header, and LIT-P09's single Romani pair. Leave A+ removal to C11.
- *reduction*: The most-needed feature, made recognisable. SYS-P08 builds on Button; take RED-P06's removal of section narrators and LIT-P09's single listen-copy file.
- *comprehension*: Lead SYS-P08: one component on Button, two shared keys. Take AGE-P08's 'under the H1' placement and LIT-P09's single Romani pair. Keep the danger-signs narrator, contrary to RED-P06.

---

<a id="p09"></a>

### P09. Keep the feedback survey away from tasks and small screens

**Rank 9 of 61. Score 7.61** (clarity 7.2, sleek 7.7, safe 8.3; 6 votes counted).  
**Proposed independently by 4 reviewers:** AGE-P14, FLO-P10, MOB-P07, RED-P11. **Specification chosen:** FLO-P10 (Interaction flow); lead votes: FLO-P10 5, MOB-P07 1.  
**Chair ruling:** See P12: the feedback exclusion should also respect the audio player's open state once that is rebuilt.  

- Surface: Site chrome, feedback invitation
- Files: src/components/layout/FeedbackWidget.tsx:33, :233-235, :438-440, :650
- Resolves: FLO-05, AGE-22, MOB-09, RED-09, RED-10
- Now: After `INITIAL_EXPLORE_MS = 150_000` the card "Have a minute to share how RediHealth feels to use?" slides up as a fixed sheet (`fixed inset-x-3 bottom-[...] z-30`). It is held back only on /health-check and /prescription-review below 1024px, so it rose over the assistant's "Do you have any very serious sign right now?" and over the find-help map.
- Change:
  1. Replace `isClinicalTaskSurface` with a single allow-list of where the invitation may appear on its own: the home page, the guides index, a finished guide (after the reader reaches the end), and /about. Everywhere else, including /health-assistant, /health-check, /prescription-review, /find-help, /get-help, /medic-online/**, /mediatori and /sign-in, it must not open by itself.
  2. Below 1024px, never show the floating card. Show the invitation only as the existing "Feedback" link in the mobile menu and footer.
  3. Keep the snooze steps and drafts as they are.
- Why it is cleaner: One fewer layer competing at the screen edge with the 112 strip and the List/Map bar.
- Why it is easier for low-literacy and older readers: Nothing slides over a medical question or a map while they are reading or deciding, which is when an unexpected sheet causes the most confusion.
- Keep: The survey itself, its steps, drafts and analytics; manual opening from the "Feedback" links; the exclusion of consultation and portal routes.
- Verify: With `INITIAL_EXPLORE_MS` temporarily lowered in a local check, wait on /en/health-assistant, /en/find-help and /en/get-help at 375 and 1440: no card. On /en at 1440 the card still appears. "Feedback" in the mobile menu still opens the survey.
- Effort: S
- Risk: Low; it changes only when an existing prompt opens.

**Panel notes**

- *system*: Allow-list is the cleanest rule. Take RED-P11's removal of the side tab and floating report square, and AGE-P14's 16px text.
- *flow*: MOB-P07 keeps the invite but moves it inline on phones; take RED-P11's flattened card and AGE-P14's check against other fixed bottom bars.
- *ageing*: FLO-P10's allow-list is simplest and never floats on phones; take RED-P11's removal of the rotated side tab and 16px card text.
- *mobile*: An allow-list beats growing the exclusions. Phones get no floating card. Take AGE-P14's typography for desktop and RED-P11's flattened card and side-tab removal.
- *reduction*: FLO-P10's allow-list is the safest default; take RED-P11's removal of side tab and report square, and AGE-P14's flattened card. MOB-P07's inline row adds an element.
- *comprehension*: Lead FLO-P10: an allow-list is safer than growing exclusions. Take RED-P11's flattened card and 16px labels, and MOB-P07's inline end-of-page prompt.

---

<a id="p10"></a>

### P10. Put safety words at body size and at AA contrast

**Rank 10 of 61. Score 7.60** (clarity 9.0, sleek 5.2, safe 8.0; 6 votes counted).  
**Proposed independently by 2 reviewers:** AGE-P04, SYS-P03. **Specification chosen:** AGE-P04 (Ageing and accessibility); lead votes: AGE-P04 6.  
**Chair ruling:** On the prescription result, the food-rule and course-length rows are replaced by LIT-P12's sentences (P05); apply this item's size and contrast fix to those sentences and to every other surface it lists.  

- Surface: symptom check, triage summary, find help, prescription result, search modal
- Files: src/components/health-check/HealthCheckExplorer.tsx:2626,2923, src/components/health-check/TriageSummaryCard.tsx:732-765,1010, src/components/find-help/FindHelpExplorer.tsx:887,1160-1171,1354-1362, src/components/health-assistant/PrescriptionStructuredResult.tsx:625-632,708-737, src/components/search/SmartSearchModal.tsx:660,667,687,747,862,960
- Resolves: AGE-10, AGE-11, AGE-13, AGE-21, LIT-22, SYS-06
- Now: "Urgent" is `text-xs text-primary` under a 16px title; doctor-summary row labels are `text-[13px] text-muted-foreground`; "Open now" is `text-xs` with a green `ClockIcon`; "Before food", "Duration" and "Unclear writing" are `text-xs text-muted-foreground`; search section labels are `text-xs text-ink-900/55` (about 3.9:1) and counts `/45` (about 3.0:1); the search emergency explanation is `text-[13.5px]`.
- Change:
  1. Rule for these files: any text that changes what the reader does (urgency, open/closed, dose timing, duration, unclear-dose warning, emergency explanation, step instructions) is `text-body` minimum, `font-semibold` only for the single key word.
  2. "Urgent" moves onto the title line as a plain-text prefix in `text-body font-semibold text-primary` ("Urgent: Chest pain"), not a second small line.
  3. Find help: "Open now"/"Closed now" `text-body`, delete the `ClockIcon` (CLAUDE.md rule 2); category label and "80 places" `text-meta text-muted-foreground`.
  4. TriageSummaryCard `dt` labels `text-meta font-semibold text-foreground`, values `text-body`.
  5. PrescriptionStructuredResult: food timing, duration and unclear-dose warning `text-body text-foreground`; the warning gets `font-semibold`.
  6. SmartSearchModal: replace `text-ink-900/55` and `/45` with `text-muted-foreground` (#475569, about 7:1); emergency explanation and numbered steps `text-body`.
- Why it is cleaner: one rule ("instructions are body text") replaces dozens of local size decisions, and a decorative icon goes.
- Why it is easier for low-literacy and older readers: the words that decide safety are no longer the smallest and greyest on the card.
- Keep: no copy change; red stays for urgency and 112 only; print layout of the triage summary (check printSummary.test.ts).
- Verify: at 375, inspect each listed string: computed size ≥16px (meta labels ≥14px), contrast ≥4.5:1 with a checker; printSummary and HealthCheck tests pass.
- Effort: M
- Risk: Low. Visual only, but cards get taller.

**Panel notes**

- *system*: Lead covers more surfaces and fixes search contrast. Take SYS-P03's strength moved under the name; LIT-P12 owns prescription wording.
- *flow*: Urgency, dose timing and opening hours are what people act on; tiny grey text there is a real barrier. AGE-P04 also covers search.
- *ageing*: AGE-P04 also covers the triage summary and search contrast; take SYS-P03's strength move. LIT-P12 supersedes the prescription rows. Safety words stop being the smallest.
- *mobile*: AGE-P04 also puts 'Urgent:' on the title line and fixes search contrast. Take SYS-P03's move of strength under the medicine name.
- *reduction*: Safety words smallest on the card is dangerous. AGE-P04 also fixes search contrast; prescription rows should follow LIT-P12's sentence form.
- *comprehension*: Lead AGE-P04: it covers urgency, opening hours, prescription and search contrast. Take SYS-P03's move of strength under the name so it cannot be read as the dose.

---

<a id="p11"></a>

### P11. Make every step count true from the first screen to the last

**Rank 11 of 61. Score 7.36** (clarity 8.0, sleek 6.0, safe 7.8; 6 votes counted).  
**Proposed independently by 4 reviewers:** AGE-P11, LIT-P03, FLO-P06, RED-P08. **Specification chosen:** FLO-P06 (Interaction flow); lead votes: FLO-P06 4, AGE-P11 1, LIT-P03 1.  

- Surface: Symptom check, assistant, hero copy
- Files: src/lib/i18n/health-check-translations.ts:1220 (and its other locales), src/lib/i18n/hero-copy.ts:156 (all locales), src/components/health-check/HealthCheckExplorer.tsx:1616, :2210, :2283-2290, src/components/health-assistant/TriageStateMachine.tsx (step header)
- Resolves: FLO-04, LIT-10, AGE-09, RED-20
- Now: The copy promises "answer 3 questions", but phones count "1/7" and desktop counts 4. The assistant shows "Step 1 of 3", then "2 / 4" after a choice, and the page text holds the step twice.
- Change:
  1. Replace "answer 3 questions" with "answer a few short questions" in both strings, in all seven languages.
  2. In the symptom check, show the step as words only, "Step 2 of 7", and drop the separate `{displayStep}/{totalSteps}` swap-in figure at :2210, so the position is said once (RED-20). Keep the segmented bar.
  3. In the assistant, show no total on the first screen (just the question). Once a pathway is chosen, show "Step N of M" with M fixed for that pathway, and never change M within a pathway.
  4. Remove the duplicate visible "Step N of M" in the assistant footer, and keep the `aria-live` copy for screen readers.
- Why it is cleaner: One number per screen, said once.
- Why it is easier for low-literacy and older readers: The count they see first is the count they get, so the flow does not feel longer at each step and they can judge whether they have time to finish.
- Keep: The progress bar's `aria-valuemax`; the sr-only step announcement; the desktop merged-step layout.
- Verify: Walk the symptom check at 375 and 1440, and confirm the shown total never changes and matches the steps actually seen. Walk the assistant symptom path: no total on step 1, then a fixed one. Grep all locales for "3 questions" and equivalents ("3 întrebări", etc.).
- Effort: S
- Risk: Low; only copy and display of an existing count change.

**Panel notes**

- *system*: Lead is copy-only and covers the assistant. Take RED-P08's hidden subtitle on later steps; LIT-P03's stage remap is riskier logic.
- *flow*: AGE-P11 is the smallest honest fix; add FLO-P06's fixed assistant total. LIT-P03's stage remapping touches navigation logic for little extra gain.
- *ageing*: FLO-P06 fixes copy and the assistant's moving total with low risk; LIT-P03's four stages are nicer but touch navigation logic.
- *mobile*: FLO-P06 is simple and honest. LIT-P03's four-stage remap changes navigation logic for little extra gain. RED-P08's KeyBadge removal can ride along.
- *reduction*: FLO-P06 is safest and covers the assistant; take RED-P08's KeyBadge and kbd removal. LIT-P03's four-stage remap touches navigation logic, too risky.
- *comprehension*: Lead LIT-P03: fixed stages are the only way to stop the total changing. Take RED-P08's removal of KeyBadge/kbd and FLO-P06's 'no total before a pathway' for the assistant.

---

<a id="p12"></a>

### P12. Make the audio player a one-row bar on phones with words

**Rank 12 of 61. Score 7.34** (clarity 7.7, sleek 7.8, safe 6.2; 6 votes counted).  
**Proposed independently by 2 reviewers:** AGE-P13, MOB-P08. **Specification chosen:** MOB-P08 (Mobile and low-end devices); lead votes: MOB-P08 4, AGE-P13 2.  
**Chair ruling:** Lands before the feedback exclusions in P09 are finalised, which read the audio player's open state. If P09 is implemented first (it is in phase 1), revisit its player check here.  

- Surface: Health guide audio player
- Files: src/components/health-information/GlobalHealthAudioPlayer.tsx:467-560, src/components/health-information/GlobalHealthAudioPlayer.tsx:588, src/components/health-information/GlobalHealthAudioPlayer.tsx:672-700, src/components/health-information/GlobalHealthAudioPlayer.tsx:756-790, src/components/health-information/SynchronizedSentenceReader.tsx:266-269
- Resolves: MOB-10, AGE-16, AGE-17, SYS-25, MOB-12
- Now: the expanded player is `fixed bottom-4 inset-x-4 … p-3.5 shadow-xl`, about 290px tall on a 375x812 phone. With the 102px header it leaves about 420px of guide. The text is `text-xs` and `text-[11px]`. Speed shows "0.85x | 1.0x" with the words hidden below sm. Previous and next are icon-only. `main` has no bottom padding, and every sentence is `scrollIntoView({ block: "center" })`.
- Change:
  1. Below 640px, open the player in its compact form by default: one bar, `fixed inset-x-0 bottom-0`, `min-h-16`, `border-t bg-card` (no `shadow-xl`, no rounding), padded by `env(safe-area-inset-bottom)`. Left to right it holds: the Pause/Play button with its word (`min-h-11 text-base`), the guide title (`text-base truncate` is acceptable here, since it is not a button label), a "Slower"/"Normal" toggle as one button showing the word for the other state (new keys `slower` and `normal`, all seven languages), and Close (×, `h-11 w-11`).
  2. Move "Previous sentence", "Next sentence" and the progress row into the existing expanded state, opened by tapping the title. Give the previous and next buttons visible words "Back" and "Next" (`text-base`), with new keys `backSentence` and `nextSentence` translated into all seven languages.
  3. Raise every text in the player to at least `text-sm` (14px) for metadata and `text-base` for controls. Delete the `text-[11px]` spans at `:539-549`.
  4. While the player is open, set `padding-bottom` on `<main>` to the bar height (a CSS variable `--player-h` set by the player) so the last lines are not hidden.
  5. In `SynchronizedSentenceReader.tsx:266-269` use `block: "nearest"` instead of `"center"`, so the page moves only when the sentence leaves the visible area.
- Why it is cleaner: a 290px card becomes a 64px bar with four controls, and the "x" speed numbers and 11px labels are gone.
- Why it is easier for low-literacy and older readers: about 85% of the screen stays for the guide, the speed control says "Slower" in words, and the page stops jumping on every sentence.
- Keep: play, pause, stop, sentence skipping, both speeds, the minimised state, progress, the synchronized highlighting and the single global player across sections.
- Verify: at 360x740 on /en/health-information/heart-health, tap "Listen to guide". The bar is at most 72px tall, the text is at least 14px, and "Slower" is visible. The last paragraph of the guide can scroll fully above the bar. Highlighting a sentence that is already visible does not move the page. Check ro and hr at 360px: the bar's buttons stay on one line.
- Effort: M
- Risk: Medium, because the player has several states (minimised, expanded, playing, done) that all need the new layout.

**Panel notes**

- *system*: Lead adds main bottom padding and nearest-scroll. Take MOB-P08's full-bleed bar without shadow or rounding.
- *flow*: MOB-P08's full-width bottom bar with main padding is the clean basis; take AGE-P13's 'More' entry and spoken-speed words.
- *ageing*: MOB-P08 is the more precise spec (safe area, Back/Next words, main padding, nearest scroll); AGE-P13 adds nothing beyond it.
- *mobile*: AGE-P13 is simpler: the bar is the minimised state. Take MOB-P08's exact bar classes (bottom-0, safe-area padding, --player-h).
- *reduction*: MOB-P08 is more precise on states and padding; take AGE-P13's 'More' button naming. Player covering a third of the screen is a real barrier.
- *comprehension*: Lead MOB-P08: full-width bottom bar with safe-area padding. Take AGE-P13's 'Play/Pause' as words and its 'More' entry to the full controls.

---

<a id="p13"></a>

### P13. Give the assistant's first screen the hero's flat list and one symptom entry

**Rank 13 of 61. Score 7.32** (clarity 7.0, sleek 7.7, safe 7.5; 6 votes counted).  
**Proposed independently by 2 reviewers:** LIT-P07, FLO-P07. **Specification chosen:** FLO-P07 (Interaction flow); lead votes: FLO-P07 6.  

- Surface: /health-assistant
- Files: src/components/health-assistant/TriageDecisionTree.tsx:73-157, src/components/health-assistant/TriageStateMachine.tsx:373, src/components/health-assistant/assistant-copy.ts (tree.heading, bodyMapPrompt, bodyMapLink)
- Resolves: FLO-03, RED-22, LIT-16, FLO-21
- Now: The page asks "How can we help you today?", the hero's question word for word. It then shows a featured `surface-spotlight` box with "Start symptom check" (the assistant's own pathway), a second link "Open 3D body map" to /health-check, four `list-in card-interactive` cards in a two-column grid, a free-text bar and three chips, all inside a bordered card.
- Change:
  1. Change the heading to "Tell us what is happening" in all seven languages, so it does not repeat the hero.
  2. Render the five pathway options as one flat list of rows in the hero row recipe: 56px rows, a hairline `border-b border-ink-950/[0.08]` between rows, label plus one-line subtitle, chevron. No `surface-spotlight`, no `card-interactive`, no `list-in`, and no inner card border.
  3. Remove the "Want to point to the exact area on the 3D body? Open 3D body map" strip (`bodyMapPrompt` / `bodyMapLink`). The symptom pathway and /health-check stay reachable from the tool tabs.
  4. Keep the free-text bar under the list, with its label, and keep the chips.
- Why it is cleaner: One list in one surface. A box, a featured card style, a second link to the same place and a two-column grid all go.
- Why it is easier for low-literacy and older readers: The reader sees the same kind of list as on the home page, in a single column, with no two "symptom" doors they cannot tell apart.
- Keep: All five pathways and their handlers (`onSelectPathway`); `data-triage-option` attributes; the mediator tag text (plain text, amber only as text); the 112 card; tests in `CareToolsConsistency.test.ts` and `LowLiteracyTriageAndSearch.test.ts`.
- Verify: /en/health-assistant at 375 and 1440: one column of five rows, no nested border, and no "3D body map" link. Each row starts its pathway. Tests pass after expected-markup updates.
- Effort: M
- Risk: Low; layout and one link only, with pathway logic untouched.

**Panel notes**

- *system*: Lead flattens the list and drops the duplicate entry. Take LIT-P07's reworded mild-path body-map CTA.
- *flow*: FLO-P07 also flattens the list and changes the repeated heading; take LIT-P07's rewording of the mild path's body-map link.
- *ageing*: FLO-P07 flattens the list and removes the second symptom door; keep LIT-P07's reworded mild-path body-picture link.
- *mobile*: FLO-P07 also flattens the rows. Take LIT-P07's rewording of the mild-path body-map call to action.
- *reduction*: FLO-P07 includes LIT-P07 and also stops the heading repeating the hero; nothing else needed.
- *comprehension*: Lead FLO-P07: it removes the second symptom door and also flattens the list and stops repeating the hero question. LIT-P07 is a subset.

---

<a id="p14"></a>

### P14. Stop motion that loops or follows the pointer

**Rank 14 of 61. Score 7.32** (clarity 5.8, sleek 8.2, safe 9.0; 5 votes counted).  
**Proposed by:** FLO-P13 (Interaction flow).  
**Chair ruling:** Applies at every width. MOB-P14 (P36) keeps some looping decoration on desktop; where the two differ, this item wins.  

- Surface: Home hero, topic wheel, footer, every card with a spotlight
- Files: src/components/landing/WheelBackdrop.module.css:85-101, :105-130, src/components/landing/HealthTopicsWheel.module.css:2, :23, :27, :38, :83, :104-111, src/components/ui/PointerSpotlight.tsx, src/components/layout/SiteChrome.tsx:68, src/app/globals.css:224-248, :1204-1247 (`.surface-spotlight`), src/components/landing/HealthTopicsSpotlight.tsx:167, src/components/health-assistant/TriageDecisionTree.tsx:81, src/components/telemed/MedicOnlineHero.tsx:226
- Resolves: FLO-24, MOB-15, MOB-03, SYS-15, FLO-27
- Now: The hero backdrop runs three counter-rotating layers (`hero-wheel-spin ... linear infinite`, 90 to 160s), and the footer runs another copy, which makes 14 running animations at 360px (MOB-15). The topic wheel's links ride a ring turning every 90s, and `.lit` flashes each one in `--color-primary`, the 112 red, as it passes a fixed angle. A global PointerSpotlight paints a radial light and a top-edge hairline under the cursor on `.surface-spotlight` cards.
- Change:
  1. Delete the `animation` declarations on `.outer`, `.inner`, `.hub` and `.face` in both wheel stylesheets, so the wheels are static drawings at their current angle.
  2. Delete `.lit` and `@keyframes wheel-highlight`. Mark the hovered or focused topic with the existing sapphire focus treatment, never red.
  3. Remove `<PointerSpotlight />` from SiteChrome, the `.surface-spotlight` rules in globals.css and the class from the three call sites.
  4. Limit `arrow-travel` to the single primary button of a screen, and use a plain colour change on rows and secondary links. Limit `link-draw` to inline text links inside paragraphs.
- Why it is cleaner: Nothing moves unless the reader moves it, and red is back to meaning only 112.
- Why it is easier for low-literacy and older readers: Topic links stop drifting away from an unsteady finger, and a flashing red topic no longer looks like an alarm.
- Keep: The wheel drawings, their links and labels; `data-wheel-held` logic can go once nothing animates; Calm Motion and reduced-motion rules; `HealthTopicsWheel.test.ts` (update any expectation on `.lit`).
- Verify: On /en at 360 and 1440, `document.getAnimations().length` is 0 after load, apart from user-triggered transitions. No red appears outside the 112 strip and buttons. Hovering cards shows no radial light. Grep for `surface-spotlight` and `wheel-highlight` returns nothing.
- Effort: S
- Risk: Low; it only deletes decoration, and every link and label stays.

**Panel notes**

- *system*: Pure deletion of looping decoration; nothing functional at risk.
- *ageing*: Deletes looping decoration and red flashes only; nothing functional at risk.
- *mobile*: Also ends red flashing on non-emergency topics. Pairs with MOB-P14.
- *reduction*: Deletes looping wheels, red topic flashes and pointer light; nothing moves unless the reader moves it. Pure removal.
- *comprehension*: A pure deletion of decoration that also restores red to mean 112 only.

---

<a id="p15"></a>

### P15. Use one plain alarm-signs list everywhere 112 is offered

**Rank 15 of 61. Score 7.28** (clarity 8.4, sleek 6.0, safe 6.8; 5 votes counted).  
**Proposed by:** LIT-P15 (Comprehension).  
**Owner decision needed:** Clinical owner to confirm the single plain alarm-signs list is complete.  

- Surface: Hero "I feel unwell right now" view, assistant 112 aside, assistant emergency gate, symptom check emergency notice
- Files: src/lib/i18n/hero-copy.ts:101-107 (`emergency.alarmSigns`), 133-134, 170-176 (`problem`) in all locales; src/components/health-assistant/assistant-copy.ts:697-718 (`gate.signs`, `gate.plainSigns`); src/components/health-assistant/HealthAssistant.tsx (`emergencyNotice`, `emergencyDisclaimer`, aside markup)
- Resolves: LIT-04, LIT-18, FLO-03 (repeated alarm list)
- Now: the hero lists "Chest pain or pressure... Face drooping, weakness or slurred speech", then asks "No alarm signs?". The assistant aside packs the signs into one 25-word sentence ending in "call 112" and adds "The app does not call for you." The gate has a good plain list (`plainSigns`). Russian labels the row "Мне сейчас нездоровится".
- Change:
  1. Make `gate.plainSigns` the single source of the alarm list in every locale. Use it for hero `emergency.alarmSigns` and for the assistant aside.
  2. Render the assistant aside as a heading "Call 112 if you have:" plus the plain list, then the Call 112 button. Delete `emergencyNotice`. Change `emergencyDisclaimer` to "You must call 112 yourself." (all seven languages).
  3. Hero `problemDoctorPrompt` becomes "None of these?" (all seven languages; ru "Ничего из этого?").
  4. Russian hero `problem.label` becomes "Мне сейчас плохо".
- Why it is cleaner: three differently worded alarm lists become one, and a sentence-length notice becomes a short list.
- Why it is easier for low-literacy and older readers: the reader learns one list and sees it the same way each time. "None of these?" points back to what they just read, instead of asking them to judge "alarm signs".
- Keep: the 112 `tel:` links and dialer gate, red reserved for 112, the gate's yes/no logic, the aside's sticky placement on desktop, Hero.test.ts and LowLiteracyTriageAndSearch tests.
- Verify: at 375px in en, ro and ru, compare the list on the hero problem view, the /health-assistant aside and the gate: same lines, same order. The aside has no long sentence.
- Effort: S
- Risk: Low; copy consolidation. Clinical owner signs off that the plain list stays complete (it covers the same five signs).

**Panel notes**

- *mobile*: One plain alarm list wherever 112 appears removes a real barrier. Needs clinical sign-off.
- *reduction*: One alarm list, learned once; removes a 25-word sentence. Needs clinical sign-off.

---

<a id="p16"></a>

### P16. One text-size control and one reading-level control, everywhere

**Rank 16 of 61. Score 7.22** (clarity 7.3, sleek 7.7, safe 6.5; 6 votes counted).  
**Proposed independently by 2 reviewers:** AGE-P07, RED-P05. **Specification chosen:** AGE-P07 (Ageing and accessibility); lead votes: AGE-P07 6.  
**Chair ruling:** Build the single shared control from AGE-P07. For the two reading-level labels use AGE-P07's wording only if both stay on one line at 320px in all seven languages at the 126% text scale; otherwise use the shorter pair 'Simple' / 'Detailed'. The one-line button rule decides.  

- Surface: find help, symptom check, prescription review, health guides, assistant
- Files: src/components/health-check/readingTools.ts:12-20, src/components/health-check/HealthCheckExplorer.tsx:2222-2273, src/components/find-help/FindHelpExplorer.tsx:727-760, src/components/health-assistant/PrescriptionReview.tsx:794-820, src/components/health-information/ReadingLevelSwitcher.tsx, src/components/health-assistant/TriagePlainLanguageToggle.tsx, src/components/layout/ComfortMenu.tsx:273-301
- Resolves: AGE-25, RED-25, FLO-17, MOB-26
- Now: page-level "A+ Larger text" buttons duplicate the header comfort control, and `useLargeText` toggles any non-normal scale back to "normal", so a reader who chose "Extra large" and taps the pressed-looking "A+" drops to normal. "Easy / Detailed" toggles on guides and the assistant duplicate the comfort menu's "Reading mode" under other names.
- Change:
  1. Delete the page-level A+ buttons in HealthCheckExplorer, FindHelpExplorer and PrescriptionReview, and retire `useLargeText` (text size lives only in the comfort menu, now labelled "Text size" per AGE-P06).
  2. Keep the in-page reading-level switch only where the page's text actually changes (guides, assistant). Render it through one component (ReadingLevelSwitcher) bound to the same `readingLevel` preference as the comfort menu, with the same two labels everywhere: "Simple words" and "All details" (translate into all seven languages; replace the current "Easy/Detailed" keys).
  3. Remove the `TriagePlainLanguageToggle` duplicate in favour of that component.
- Why it is cleaner: each tool header loses a bordered square, and two systems become one.
- Why it is easier for low-literacy and older readers: one place, one name and one result for "make it bigger" and for "make it simpler". The XL reset trap goes away.
- Keep: the reading-level preference and both text variants; LowLiteracy tests (update expectations about A+); text-scale persistence.
- Verify: at 375 on each page, no A+ control; changing reading level on a guide changes it in the comfort menu and on the assistant; set XL in the comfort menu, visit each tool, and the scale stays XL.
- Effort: M
- Risk: Medium. Several tests assert the A+ control exists.

**Panel notes**

- *system*: Lead keeps reading switch where text changes and fixes the A+ reset bug; RED-P05 hides Easy/Detailed too far away. Use LIT-P08's words.
- *flow*: AGE-P07 keeps a reading switch where text changes, bound to one preference; RED-P05 hides it behind 'Aa', a convention these readers miss.
- *ageing*: Keep a visible switch where the content changes, bound to the global setting; use LIT-P08's labels. RED-P05's 'change it in Aa' hides it from older readers.
- *mobile*: AGE-P07 keeps a visible reading switch where text changes. RED-P05 hides it in a menu older readers do not open. Use LIT-P08's short labels.
- *reduction*: AGE-P07 is right to keep one in-page reading switch where text changes (discoverable) and names the XL reset trap; RED-P05's full removal hides it.
- *comprehension*: Lead AGE-P07: keep the in-page reading switch where text changes. RED-P05 would hide 'simple words' behind 'Aa', and this audience will not find it there.

---

<a id="p17"></a>

### P17. Give each destination one name, used everywhere it appears

**Rank 17 of 61. Score 7.21** (clarity 8.7, sleek 6.2, safe 5.8; 6 votes counted).  
**Proposed independently by 2 reviewers:** LIT-P01, RED-P04. **Specification chosen:** LIT-P01 (Comprehension); lead votes: LIT-P01 5, RED-P04 1.  
**Chair ruling:** Lands before P24, P26, P48 and P18, which all use the agreed names.  

- Surface: Header, mobile menu, footer, hero panel, home help options, page H1s, assistant tabs, not-found page
- Files: src/lib/i18n/translations.ts:1141-1175 (nav, header), 1259-1303 (footer), 1310-1333 (helpOptions), 1379 (getHelpPage.heroTitle), 1460 (findHelpPage.heroTitle), and the same keys in ru/ro/sq/it/hr/rom blocks; src/lib/i18n/find-help-links.ts; src/lib/i18n/hero-copy.ts (panel.label, needs.*.label); src/components/health-assistant/AssistantNavigation.tsx (dict); src/components/health-assistant/HealthAssistant.tsx (dict.title); src/app/not-found.tsx:18
- Resolves: LIT-06, LIT-07, RED-07, FLO-06, FLO-14
- Now: the map is called "Pharmacies and clinics", "Find medical help", "Find a clinic or hospital", "Find help" and "Find a pharmacy or doctor nearby". The person-help form is called "Get help", "Ask for help" and "Request help". The assistant is "Ask for guidance" in the menu, "Assistant" in the hero and "Health assistant" on the page. In Romanian it is "Asistent medical", which is the job title for a nurse.
- Change:
  1. Add a short glossary comment at the top of src/lib/i18n/translations.ts that fixes one English name per destination: /find-help = "Pharmacies and clinics"; /get-help = "Ask a person for help"; /medic-online = "Talk to a doctor"; /health-check = "Check my symptoms"; /health-assistant = "Health assistant"; /prescription-review = "Explain my prescription"; /health-information = "Health guides".
  2. Set the menu label (header.nav*), page H1 (`*Page.heroTitle`), footer link (footer.col*Link*), help-options title and cta, AssistantNavigation tab label and not-found.tsx label for each destination to that exact string. Example: `header.navCere` becomes "Health assistant"; `getHelpPage.heroTitle` and `header.getHelp` become "Ask a person for help" (or "Ask a person" where the header button needs it short); `findHelpPage.heroTitle`, `footer.col2Link3`, `nav.findHelp` and `not-found` `findHelpLabel` become "Pharmacies and clinics". Sub-lines (`navCereSub` and so on) may keep their own wording.
  3. Romanian: replace "Asistent medical" (HealthAssistant ro title, AssistantNavigation ro `assistant`) with "Asistent virtual de sănătate" in the H1, and "Asistent virtual" where width is tight. Hero `panel.label` ro stays "Asistent". Romani: use one name, "Sastipnasko azhutitori", in hero `panel.label` and on the page. Russian: fix AssistantNavigation `navLabel` to "Разделы помощника по здоровью".
  4. Translate the fixed set into all seven languages once, then reuse those strings rather than writing new synonyms per component. Have a native speaker check the Romani names.
- Why it is cleaner: about fifteen labels collapse into seven names, and the menu, page title and footer stop competing with near-synonyms.
- Why it is easier for low-literacy and older readers: the word tapped in the menu is the word printed as the page's heading, so the reader knows they have arrived. "Find help" and "Get help" no longer lead to two different places.
- Keep: every link target, the menu sub-lines, the header "Start here" behaviour, button labels on one line (check that "Ask a person for help" fits the header at 375px, or use the short form "Ask a person"), Hero.test.ts and HealthInfoConsistency tests that assert copy keys exist in every locale.
- Verify: at 375px and 1280px in en, ro, rom and ru, open the menu, tap each item and compare the menu word with the H1; check the footer and the hero answer buttons against the same list. grep for "Find medical help", "Ask for guidance" and "Asistent medical" returns no user-facing hits. Run the i18n consistency tests.
- Effort: M
- Risk: Low; copy only, but many keys across seven blocks, so a missed locale shows up as a type error, not a silent fallback.

**Panel notes**

- *system*: Lead lists the exact keys. Take RED-P04's news and mediator names and its rule that every H1 starts with the nav name.
- *flow*: LIT-P01's glossary-first method is the right basis and fixes ro 'Asistent medical'; take RED-P04's rule that the H1 starts with the menu name.
- *ageing*: LIT-P01 handles the Romanian nurse problem and locales precisely; take RED-P04's equality test so names cannot drift again.
- *mobile*: LIT-P01 lists real keys. Add RED-P04's rule that each H1 starts with the nav name, plus news and mediators. Check header widths at 360px in ro and ru.
- *reduction*: Readers know they arrived. LIT-P01 has exact keys and the Romanian nurse fix; take RED-P04's rule that H1 starts with the nav word.
- *comprehension*: Lead RED-P04: it covers every route and adds an equality test, and 'Help me choose' is verb-led. Take LIT-P01's Romanian nurse fix and the Russian navLabel fix.

---

<a id="p18"></a>

### P18. Put the photo tips first and offer a person when reading fails

**Rank 18 of 61. Score 7.14** (clarity 7.2, sleek 6.0, safe 8.4; 5 votes counted).  
**Proposed by:** LIT-P13 (Comprehension).  

- Surface: Explain my prescription (upload step and errors)
- Files: src/components/health-assistant/PrescriptionReview.tsx:299-341 (en copy), 343-372 (ro), 955-1010 (render order), error keys `fileErr`, `reviewErr`, `rateLimitErr`, `dragOrBrowse` in all locales
- Resolves: LIT-21, LIT-23, RED-23, LIT-29 (pattern)
- Now: "Add your prescription / or drag your photo here (JPEG, PNG or WebP) / [Take a photo] [Choose a photo]" renders before "Tips for a clear photo: Lay it flat, Use daylight, Show the whole page". Errors read "Choose a JPEG, PNG or WebP image smaller than 8 MB" and "We could not read this prescription. Please try again in a few minutes." The page is titled "Prescription review" (ro "Verificarea rețetei").
- Change:
  1. Render the three tips as one line directly under `dropTitle` and above the two buttons: "Lay it flat, in daylight, with the whole page showing." (new key `tipLine`, all seven languages). Remove the separate `guidanceHeading` block.
  2. Hide `dragOrBrowse` below `lg` (phones cannot drag). On desktop, shorten it to "or drag a photo here" (format names removed).
  3. `fileErr` becomes "This file is not a photo we can open. Take a new photo instead." `rateLimitErr` becomes "Please wait one minute, then try again." `reviewErr` becomes "We could not read this prescription. Show it to your pharmacist, or ask a person for help.", with "ask a person for help" linking to /get-help?mode=mediator. All seven languages.
  4. Change `title` to "Explain my prescription" (ro "Explică-mi rețeta", ru "Объяснить рецепт") so it matches the hero and LIT-P01.
- Why it is cleaner: one block of tips and its heading disappear, and the error lines lose file-format jargon.
- Why it is easier for low-literacy and older readers: the reader reads how to take the photo before taking it, and a failure leaves them with a person to turn to instead of "try again later".
- Keep: accepted file types and the 8 MB limit (behaviour unchanged), camera and gallery buttons, quality warning, step labels, the two-step flow.
- Verify: at 375px, the tip line sits above "Take a photo" and no "drag" text shows. Force each error (wrong file type, mocked 429, mocked failure) and read the message and link in en, ro and ru.
- Effort: S
- Risk: Low; copy and the order of existing elements.

---

<a id="p19"></a>

### P19. Remove the topic page's repeated callout and give the dictionary one quiet line

**Rank 19 of 61. Score 7.14** (clarity 6.2, sleek 8.0, safe 7.8; 5 votes counted).  
**Proposed by:** RED-P12 (Reduction).  

- Surface: Health guide topic pages
- Files: src/components/health-information/TopicDetailPageContent.tsx:391-425, :490-531, :140, src/components/health-information/WarningSignsEmergencyCard.tsx:227-245
- Resolves: RED-15, RED-18, LIT-27, RED-16
- Now: In Detailed mode an "Extended clinical context" callout (`rounded-r-lg border-l-2 border-sapphire bg-surface-subtle/70`) repeats the first checklist item and the first warning sign word for word. Near the end, a bordered `divide-y rounded-xl border bg-card` box holds "Medical dictionary" with a filled `bg-sapphire` "Open the dictionary" and "Medical words in Romani" with an outlined "See the words", right before the real next step. The 112 card ends "Call 112" plus "When to call 112".
- Change:
  1. Delete the clinical-context block (`:391-425`) and the `clinicalContextBadge`, `clinicalPriorityLabel` and `clinicalAlertLabel` copy in all languages.
  2. Replace the dictionary box (`:490-531`) with one paragraph of two text links in `text-sapphire underline`: "Hard words? Open the dictionary · Words in Romani" (English; translate into all seven; the Romani link only where it shows today). Place it directly under the hero's Listen control rather than at the end.
  3. Leave `TopicNextSteps` as the page's closing block, and "Talk to a doctor" as its one filled button (see RED-P13).
- Why it is cleaner: It removes one duplicated section and one bordered box with two buttons. The page's end has one action.
- Why it is easier for low-literacy and older readers: They stop reading the same advice twice in different jargon, and the dictionary is offered where hard words begin, not after them.
- Keep: Both glossary drawers and their tabs, all topic content, the warning-signs card and 112 action, print styles (`data-print-guide-section`), and the HealthArticles and HealthInfo consistency tests.
- Verify: On /en/health-information/heart-health in Detailed mode there is no "Extended clinical context". The dictionary links open the drawers. Count the filled buttons on the page: 112 (red) and "Talk to a doctor" (sapphire) only.
- Effort: S
- Risk: Low. The removed content is duplicated elsewhere on the page.

---

<a id="p20"></a>

### P20. Rework the guides index: one filter row, plain jump links, lighter cards

**Rank 20 of 61. Score 7.08** (clarity 6.4, sleek 8.0, safe 7.2; 5 votes counted).  
**Proposed by:** RED-P14 (Reduction).  

- Surface: Health guides index (/health-information)
- Files: src/components/health-information/HealthInformationPageContent.tsx:131-178, src/components/health-information/HealthInformationTopicGrid.tsx:227-247, :280-302, :386-445, src/components/health-information/TopicMetaBadge.tsx:60-86
- Resolves: RED-12, RED-13, RED-14, LIT-28, MOB-20
- Now: Before the first guide come a jump-nav row of bordered chips (`rounded-xl border border-border-control bg-card … shadow-2xs`), a search field holding a fake "Search" chip, a "Check a symptom" button, nine filter chips in the same chip style, then count, "Medical dictionary" (a second time) and Easy/Detailed. Cards repeat the subject ("Physical activity / Physical activity") in a sapphire line with an icon, end in an `h-9 w-9 bg-sapphire-soft` arrow tile, carry sapphire clock and speaker icons in the meta, and add "Key clinical fact" in Detailed mode.
- Change:
  1. Restyle the jump nav as plain text links in one wrapping line ("On this page: Guides · Articles · Topics A–Z · Myths"), with no border, background or shadow, `min-h-11` hit areas. Remove its dictionary button; the count row keeps the single dictionary entry.
  2. Remove the inner "Search" chip (`:236-238`) so the field is the control.
  3. Move "Check a symptom" out of the toolbar to a text link in the page lead ("Feeling unwell? Check a symptom"), translated into all seven languages.
  4. Cards: delete `CardCategory`, the arrow tile in `CardFooter`, and the icons in `TopicMetaBadge` (keep the text "3 min read, 2 min audio"). Remove the key-fact block from grid cards (the fact stays on the guide page).
- Why it is cleaner: One chip row instead of two identical-looking ones, and cards drop from six parts to four (photo, title, description, meta).
- Why it is easier for low-literacy and older readers: The difference between filtering and jumping is visible (chips against links), titles are not said twice, and the first guide is reached sooner.
- Keep: Search, category filtering, the count `role="status"`, the dictionary drawer, the lead card, reading-level behaviour (via RED-P05), and `HealthInfoConsistency.test.ts`.
- Verify: At 375, the first card appears within about one and a half screens. At 375 and 1440 only the filter row looks like chips. Card text shows no category line, arrow tile or meta icons.
- Effort: M
- Risk: Low. The changes are presentation only.

---

<a id="p21"></a>

### P21. Find help on phones: results first, filters folded into one row

**Rank 21 of 61. Score 7.04** (clarity 7.8, sleek 7.8, safe 4.7; 6 votes counted).  
**Proposed independently by 2 reviewers:** MOB-P11, RED-P15. **Specification chosen:** MOB-P11 (Mobile and low-end devices); lead votes: MOB-P11 4, RED-P15 2.  

- Surface: Find help (/find-help), phones
- Files: src/components/find-help/FindHelpExplorer.tsx:727-800, src/components/find-help/FindHelpExplorer.tsx:765-767, src/components/find-help/LocationFilterPopover.tsx:160-170, src/components/ui/FilterDropdown.tsx:85-100
- Resolves: MOB-07, RED-24, FLO-28, FLO-29, AGE-14
- Now: on a 375x812 phone the first screen holds Listen, A+, search, a location select truncated to "Bucure…" (hr: "Zagre…"), a category select, "Emergency department", "Open now", a region note and "All of Romania", all in a `rounded-2xl … shadow-(--shadow-card-rest)` card. The first clinic shows only its top border.
- Change:
  1. Below lg, replace the filter card with one row that is a button: "Near Bucharest · All places" plus "Change" (`min-h-12 w-full text-base`, no truncation, wraps to two lines of text if needed since it is a row, not a pill). New keys `nearPlace` ("Near {place}") and `change`, all seven languages.
  2. Tapping it opens the existing controls (search with a visible label, location, category, Emergency department, Open now, All of Romania) in a bottom sheet that uses the existing `sheet-in` and `use-sheet-dialog` pattern, with a full-width "Show {n} places" button at the bottom.
  3. When a filter other than the default is active, the row says so in words, for example "Near Zagreb · Pharmacies · Open now".
  4. When location was not given by the person, show distances as "about 200 m from Bucharest centre" (new key `fromCentre`, all seven languages) instead of "200 m away". This keeps the number honest (FLO-29).
  5. Keep the full card from lg up.
- Why it is cleaner: about seven controls become one row, and the result list starts on the first screen.
- Why it is easier for low-literacy and older readers: the nearest pharmacy is visible without scrolling, the chosen place is spelled out in full, and distance no longer implies "from where you stand".
- Keep: every filter, search, geolocation, region suggestion, counts and the List/Map bar. Note the uncommitted edits in FindHelpExplorer, LocationFilterPopover and FilterDropdown: build on them, do not overwrite them.
- Verify: at 360x740 in en and hr, the first result's name and Call button are visible without scrolling. Open the sheet, change category and city, apply: the row reflects both in words. Run `FindHelpFilterAndLocation.test.ts`. Check desktop at 1280px for no change.
- Effort: L
- Risk: Medium, because the filter state is shared between the sheet and the desktop card and the file has edits in progress.

**Panel notes**

- *system*: Lead is smaller and safer on a file with uncommitted work; MOB-P11's summary row and sheet could follow once that work lands.
- *flow*: Results first and honest 'from Bucharest centre' distances fix a real misunderstanding; L effort on a file with uncommitted work. Take RED-P15's visible search label.
- *ageing*: RED-P15 keeps filters visible and flatter at lower risk; take MOB-P11's honest 'from Bucharest centre' distance copy. A sheet hides 'Open now' from older readers.
- *mobile*: Only MOB-P11 gets a result onto the first phone screen. Take RED-P15's visible search label and plain rights paragraph. Build on the uncommitted edits.
- *reduction*: MOB-P11 gets results onto the first screen; take RED-P15's single location statement and toggle-icon removal for the desktop card. In-progress edits raise risk.
- *comprehension*: Lead MOB-P11: results first, and the chosen place spelled out in words. Take RED-P15's visible search label. L effort on a file with uncommitted edits.

---

<a id="p22"></a>

### P22. Open the news page on the list on phones, the map one tap away

**Rank 22 of 61. Score 7.03** (clarity 6.2, sleek 6.8, safe 8.8; 6 votes counted).  
**Proposed independently by 2 reviewers:** MOB-P16, RED-P09. **Specification chosen:** MOB-P16 (Mobile and low-end devices); lead votes: MOB-P16 5, RED-P09 1.  

- Surface: News (/stiri), phones
- Files: src/components/news/NewsHub.tsx:125, src/components/news/NewsHub.tsx:220-300
- Resolves: MOB-21, RED-29
- Now: `const [showMap, setShowMap] = useState(true)` opens /stiri on a "County map" card with Romania/Moldova tabs, "All counties" and an SVG of every county. On a 375x812 phone no article is visible. Above the map sit an icon-only search and an icon-only speaker.
- Change:
  1. Initialise `showMap` from the layout: `false` below 1024px and `true` from lg. Use the same `useSyncExternalStore` media-query pattern as AnatomicalBodyMap so there is no hydration flash (server snapshot `false`).
  2. Keep the existing toggle and its words ("Show map" / "Hide map") as an outlined `min-h-11 whitespace-nowrap` button beside "Bucharest | Change county".
  3. With MOB-P06, load `RomaniaCountyMap` dynamically only when `showMap` turns true.
- Why it is cleaner: the first phone screen of the news page shows news.
- Why it is easier for low-literacy and older readers: local alerts are readable at once, and tapping small counties on a 360px map becomes optional.
- Keep: the map, county and place selection, the change-county modal, search, read-aloud and desktop default.
- Verify: at 375x812 open /en/stiri: the first article title is visible without scrolling and "Show map" is present. Tap it: the map appears and county selection works. At 1280px the map shows on load as today.
- Effort: S
- Risk: Low, because only the default state changes per width.

**Panel notes**

- *system*: Lead keeps the desktop map. Take RED-P09's removal or labelling of the icon-only page search.
- *flow*: MOB-P16 sets the default by width without hydration flash; take RED-P09's removal of the icon-only news search.
- *ageing*: MOB-P16 keeps the desktop map default; from RED-P09, give the page's icon-only search a word or remove it. A default-state change only, so very safe.
- *mobile*: RED-P09 covers every width and adds the dynamic import. Keep its fallback: if header search does not search news, label the button 'Search'.
- *reduction*: MOB-P16 keeps the desktop map and avoids hydration flash; take RED-P09's removal of the duplicate page search.
- *comprehension*: Lead MOB-P16: the phone gets the list, the desktop keeps the map. Take RED-P09's removal or labelling of the icon-only news search.

---

<a id="p23"></a>

### P23. Calm the hero panel so only the row under your finger reacts

**Rank 23 of 61. Score 7.03** (clarity 5.6, sleek 8.2, safe 8.2; 5 votes counted).  
**Proposed by:** FLO-P15 (Interaction flow).  

- Surface: Home hero and triage panel
- Files: src/components/landing/hero/TriagePanel.tsx:91-182, :190-197, :243, :245-255, :263-273, :321-326, :449-517, :524-553, src/components/landing/Hero.tsx:67, src/app/globals.css:474-487
- Resolves: FLO-20, FLO-21, FLO-22, FLO-23, FLO-30, RED-03, MOB-17, LIT-01
- Now: The panel follows the mouse by up to `±5.5px`/`±4.5px` (`translate3d` in a rAF loop) under a radial sheen. On hover a spring plate glides, the icon tile turns sapphire and shifts `translate-x-0.5`, the label shifts, the chevron runs `arrow-travel`, the progress hairline jumps from 0.34 to 0.62, and the desktop subtitle swaps with a lift. After 7s idle, the "Not sure where to go" icon turns amber with no words on phones. The headline column paints at opacity 0 (`hero-enter ... both`).
- Change:
  1. Delete `floatRef`, `stepFloat`, `handlePanelPointerMove`, `handlePanelPointerLeave` and the sheen `div` (:266-273).
  2. Keep the follower plate. Remove its outer and inset shadows (`shadow-[...]`) and the border, so it is `bg-sapphire-soft` only. Remove the `translate-x-0.5` on icon and label, and remove `arrow-travel` from the row chevron (colour change only).
  3. Set `progressScale` from `step` alone: 0.5 on Step 1, 1 on Step 2.
  4. Remove the idle nudge (`idleNudge` state, the 7s timer, the amber icon tint and `subtitles.idle`) and the `returned` and `mediators` subtitle variants. Keep one static footer line, `subtitles.default`, shown at every width, plus the `speaking` line while reading.
  5. Remove `hero-enter` from Hero.tsx:67 so the headline is present at first paint, like the panel.
- Why it is cleaner: The decision screen goes from seven kinds of emphasis to one: a soft plate behind the row being pointed at.
- Why it is easier for low-literacy and older readers: The panel stays still while they aim. Nothing changes colour without words, the progress bar no longer moves without progress, and the headline is readable the instant the page appears.
- Keep: Row hit areas (`min-h-[56px]`); keyboard focus moving the plate; focus management to the new heading; read-aloud with its "Reading the options aloud" line; the view swap (`.triage-view`); Calm Motion behaviour.
- Verify: Desktop 1440: moving the mouse over the panel does not move it, and hovering a row changes only the plate and chevron colour. Phone 375: wait 10s on Step 1 and nothing changes. Reload with a throttled CPU: the h1 is visible on first paint. `Hero.test.ts` line 321 (no `onPointerMove` in options) still passes, and remove any test that expects `idle`.
- Effort: S
- Risk: Low; it removes effects and state while the routing logic stays.

**Panel notes**

- *reduction*: Seven kinds of emphasis on the decision panel become one; deletes code and state only.

---

<a id="p24"></a>

### P24. On phones, move the tool tabs from the top to the page end

**Rank 24 of 61. Score 7.00** (clarity 6.8, sleek 6.8, safe 7.5; 6 votes counted).  
**Proposed independently by 3 reviewers:** AGE-P15, MOB-P10, RED-P10. **Specification chosen:** MOB-P10 (Mobile and low-end devices); lead votes: MOB-P10 6.  
**Chair ruling:** All six voters chose MOB-P10 (tool links move to the page end on phones). RED-P10 (moving the tools into the menu) is rejected: it hides them behind a control these readers do not know. AGE-P15's short labels may be used for the page-end links, with the names agreed in P17.  

- Surface: Assistant, symptom check, prescription review, find help
- Files: src/components/health-assistant/AssistantNavigation.tsx:70-110, the four pages that render it (src/app/health-assistant, src/app/health-check, src/app/prescription-review, src/app/find-help)
- Resolves: MOB-05, LIT-09, AGE-18, RED-08, FLO-28
- Now: a sideways-scrolling tab row (`overflow-x-auto … scrollbar-none`, 675px of content in 335px) sits under the 102px header. On phones it cuts off the third tab, and at 360px in ru and hr the current page's own tab reads "Проверка с|" or "Provjera simpton|".
- Change:
  1. Below md, hide the tab row at the top (`max-md:hidden` on the `nav` at `:75`).
  2. Below md, render the same four links at the end of each page's task, before the footer. Give them a plain h2 "Other ways we can help" (new key `otherTools`, all seven languages) and a vertical list of full-width rows (`min-h-12 text-base`, icon plus label, no row for the current page).
  3. From md up, keep the tab row as today.
- Why it is cleaner: on phones about 50px of half-hidden chrome leaves the top of four task pages, and nothing on them is cut off.
- Why it is easier for low-literacy and older readers: no sideways swipe is needed to find the other tools, the current page name is never cut mid-word, and the task starts right under the header.
- Keep: all four destinations, `aria-current`, the md+ tab row and the menu entries for these pages.
- Verify: at 360px in ru and hr on all four pages, no tab row appears at the top, and the "Other ways we can help" list appears after the task with three rows. At 768px and 1280px the tabs are unchanged.
- Effort: S
- Risk: Low, because only the links' position on phones changes.

**Panel notes**

- *system*: Page end puts the task first and keeps words visible. A 2x2 grid adds 100px of controls before every task; menu-only hides siblings behind an unfamiliar icon.
- *flow*: Page end gives a labelled next step without pushing the task down. A 2x2 grid spends 100px above every task; the menu hides tools behind a convention.
- *ageing*: Task first, tools in words at the page end. RED-P10 buries tools in a menu these readers rarely open; my AGE-P15 grid adds ~100px of chrome above the task.
- *mobile*: Page end: AGE-P15's 2x2 grid adds about 100px of chrome above four tasks on small phones. RED-P10 hides the tools behind a hamburger these readers do not know.
- *reduction*: MOB-P10: tools stay visible in words where the task ends. AGE-P15 pushes the task down two rows; RED-P10 hides tools behind a menu older readers may never open.
- *comprehension*: MOB-P10: task first, full names kept. RED-P10 hides tools behind a hamburger these readers do not know; AGE-P15 pushes the question below the fold and shortens names.

---

<a id="p25"></a>

### P25. Make the 112 strip a 44px row; trim the phone header bar to keep height

**Rank 25 of 61. Score 6.97** (clarity 7.8, sleek 4.8, safe 8.0; 6 votes counted).  
**Proposed independently by 2 reviewers:** AGE-P05, MOB-P09. **Specification chosen:** MOB-P09 (Mobile and low-end devices); lead votes: MOB-P09 6.  
**Chair ruling:** Use the `text-body` token for the strip's text, not the arbitrary `text-[0.9375rem]` in MOB-P09, so it passes the guard added in P33.  

- Surface: Header and 112 strip, all pages
- Files: src/components/layout/UniversalEmergencyBanner.tsx:101-140, src/components/layout/Header.tsx:71-77, src/components/layout/Header.tsx:278, src/app/globals.css:920-933
- Resolves: MOB-11, AGE-03, MOB-12
- Now: the strip is `min-h-[2rem] … text-[13px]`, "Call 112" is `inline-flex h-7 … px-1.5` (58x28), and the close button is `h-7 w-7` with a `h-3.5 w-3.5` ×. The bar under it is `h-16`. Together they measure 102px, while the first-paint fallback `--site-header-h: 6rem` (96px) causes a 6px shift when the header measures itself.
- Change:
  1. Strip: replace `min-h-[2rem] py-1 text-[13px]` with `h-11 text-[0.9375rem]` (15px, which also scales with text size). The call link becomes `inline-flex min-h-11 items-center px-2 text-base font-semibold underline`, with the phone icon at `h-4 w-4`. The close button becomes `h-11 w-11` with the × at `h-4 w-4`.
  2. Bar below md: `h-16` becomes `h-14` (56px). The logo stays at its current 40px height. Search, Aa and menu stay at 44px.
  3. Total height is then 44 + 56 + 1 = 101px. Set the first-paint fallback in globals.css to that exact value (`--site-header-h: 6.3125rem` below md, keeping the measured override), and give both rows fixed heights so the value is exact in every language.
- Why it is cleaner: the header becomes two exact rows of fixed height, and the jump on load is gone.
- Why it is easier for low-literacy and older readers: the emergency call becomes a full-size target with readable text, at no cost to the screen.
- Keep: the strip's red emergency styling, dismissal and its stored state, `tel:112`, `calm-collapse`, `--site-header-h` publishing, the xl header height, and `ChromeConsistency` tests.
- Verify: at 360px and 375px measure "Call 112" and close at 44px tall or more, and the header at 101px. Check the CLS entry on /en load (should be 0 for the header). In ru ("Чрезвычайная ситуация? Позвоните 112") at 360px the strip stays on one line. If it does not, use `chrome.emergencyQuestion`'s shorter form.
- Effort: S
- Risk: Low, because these are class and token changes in two files.

**Panel notes**

- *system*: Lead keeps header height exact; replace its text-[0.9375rem] with text-body per AGE-P05 so it obeys the token guard.
- *flow*: MOB-P09 does the height arithmetic so the header does not grow; take AGE-P05's 16px gap before the dismiss and the larger menu 112 button.
- *ageing*: MOB-P09 keeps header height exact and fixes CLS; use text-body (AGE-P05) not 15px for the strip. The life-safety target finally becomes hittable.
- *mobile*: MOB-P09 fixes the height budget and the CLS fallback. Add AGE-P05 step 4: the menu's 112 button in body text at min-h-12.
- *reduction*: MOB-P09 keeps the exact height budget; take AGE-P05's 112 button sizing in the phone menu.
- *comprehension*: Lead MOB-P09: exact row heights also remove the load shift. Take AGE-P05's 16px 112 button inside the phone menu.

---

<a id="p26"></a>

### P26. Remove the "Start here" split button from the desktop header

**Rank 26 of 61. Score 6.93** (clarity 5.7, sleek 7.7, safe 8.3; 6 votes counted).  
**Proposed independently by 2 reviewers:** FLO-P09, RED-P03. **Specification chosen:** RED-P03 (Reduction); lead votes: RED-P03 5, FLO-P09 1.  

- Surface: Header (md and up)
- Files: src/components/layout/Header.tsx:376-505, :287-315
- Resolves: RED-06, RED-02, FLO-14, FLO-15
- Now: The header carries five nav links, a "Search" button, Aa, language, an icon-only account link, and a filled split button: "Start here" (`bg-ink-950` or `bg-paper`, `shadow-xs hover:shadow-md`) links to `/health-assistant#triage`, and a chevron (`aria-label={tHeader.forMediators}`) opens a two-item menu. On home it duplicates the panel directly below it, and "Ask for guidance" in the nav goes to the same place.
- Change:
  1. Delete the split-button block at `Header.tsx:376-505`, along with its state (`startMenuOpen`, `startMenuWrapperRef`, `startToggleRef`, the `"start"` value of `openHeaderMenu`).
  2. Add "Health mediators" (`tHeader.forMediators`) as the last item of the desktop nav at `:287-315`, using the existing link styling (no amber, no icon).
  3. Check the nav at 1280px with the longest language (ro or sq). If it no longer fits, let the nav breakpoint move from `xl` to `2xl` so the menu button carries it, rather than shrinking the type.
- Why it is cleaner: The header loses its only filled control, so the page's own main action is the one filled thing on screen.
- Why it is easier for low-literacy and older readers: There is no longer a big "Start here" that leads away from where they already started, and the mediator door is a word, not a hidden chevron.
- Keep: Every link stays reachable: the assistant via the nav, mediators via the nav and the phone menu. Keyboard and focus order in the header, and `ChromeConsistency.test.ts` (update its expectations).
- Verify: At 1280 and 1440 in all seven languages, the header shows no filled button and nav labels sit on one line. Tab through the header. Run `ChromeConsistency.test.ts` and `MobileMenu.test.ts`.
- Effort: S
- Risk: Low. It removes a duplicate path, and the content is unchanged.

**Panel notes**

- *system*: Lead places mediators in the nav as plain text; nothing else needed from FLO-P09.
- *flow*: RED-P03 is precise and places mediators in the nav as plain text; FLO-P09 adds nothing further.
- *ageing*: RED-P03 turns the hidden chevron into a visible 'Health mediators' word in the nav; FLO-P09 leaves its placement vague.
- *mobile*: RED-P03 puts mediators in the nav, the same visible weight as other places. FLO-P09's account-area link is less findable.
- *reduction*: Small, safe, removes the loudest duplicate on home. FLO-P09 avoids widening the nav; RED-P03's nav item risks wrapping at 1280.
- *comprehension*: Lead RED-P03: mediators become a visible word in the nav rather than a hidden account-area link. Check that the nav fits at 1280px in ro/sq.

---

<a id="p27"></a>

### P27. Put words on the phone header: "Text size" and "Menu"

**Rank 27 of 61. Score 6.90** (clarity 8.3, sleek 5.5, safe 6.0; 6 votes counted).  
**Proposed independently by 2 reviewers:** AGE-P06, LIT-P10. **Specification chosen:** AGE-P06 (Ageing and accessibility); lead votes: AGE-P06 5, LIT-P10 1.  
**Chair ruling:** Lands after P25, which settles the header's height budget.  

- Surface: header at phone and tablet widths (below `xl`)
- Files: src/components/layout/Header.tsx:509-558, 591-609, src/components/layout/ComfortMenu.tsx:449-474, src/lib/i18n/panel-translations.ts (openMenu/closeMenu), src/components/layout/chrome-copy.ts
- Resolves: AGE-04, LIT-08, MOB-26, RED-11
- Now: at 375 the bar holds three glyph-only buttons: magnifier (`aria-label` only), "Aa" (`sr-only` label), hamburger (`aria-label` only). Search also appears as the first row inside the menu (`Header.tsx:592-609`).
- Change:
  1. Remove the separate search icon from the phone bar (`Header.tsx:510-526`); the full-width search row stays as the first item in the menu, so search keeps one obvious home on phones. Desktop search is unchanged.
  2. The comfort trigger shows its glyph plus a visible word: new copy key `comfortShort` = "Text size" (translate into all seven languages; ro "Text mare", it "Testo", hr "Tekst", sq "Teksti", rom "Lil", ru "Шрифт", final wording by translators, each ≤10 characters). Classes: `inline-flex min-h-11 items-center gap-1.5 px-2.5 whitespace-nowrap text-meta font-semibold`.
  3. The menu trigger shows the icon plus "Menu" / "Close" (new keys `menuWord`, `closeWord`; ro "Meniu"/"Închide", ru "Меню"/"Закрыть", and so on), same classes.
  4. If the bar overflows at 320 in any language with "Large" scale, the comfort button drops its glyph and keeps the word.
- Why it is cleaner: three unexplained glyphs become two labelled buttons, and search no longer appears twice within one tap.
- Why it is easier for low-literacy and older readers: "Menu" and "Text size" are words they recognise. The setting built for them is now visible on every page instead of behind "Aa".
- Keep: accessible names (now from visible text), focus trap and Escape in the menu, desktop header layout, one-line labels in all languages.
- Verify: 320 and 375, all seven languages, normal and large scales: both buttons on one line, ≥44px, no overlap with the logo; search reachable from the menu's first row; MobileMenu.test.ts and FullScreenAndGlobalSearch.test.ts pass (update for the removed bar icon).
- Effort: S
- Risk: Medium. Header width in ru/ro at 320 is tight; translators must keep the words short.

**Panel notes**

- *system*: Lead drops the duplicate search icon to make room for words. LIT-P10's "Text" alone is vaguer than "Text size".
- *flow*: AGE-P06 frees width by moving search into the menu, which makes the words fit; LIT-P10's 'Text' alone is less clear than 'Text size'.
- *ageing*: Visible Menu and Text words reach older readers. LIT-P10 keeps the known search glyph; if 320px is too tight, move search into the menu as AGE-P06 says.
- *mobile*: Only AGE-P06 makes the words fit at 360px, by moving search into the menu. LIT-P10 keeps the icon and overflows in ru and ro.
- *reduction*: AGE-P06 also removes the duplicate search icon, freeing width; LIT-P10's 'Text' is vaguer than 'Text size'. Width at 320 must be checked.
- *comprehension*: Lead AGE-P06: 'Text size' says more than 'Text', it adds Close, and search living in the menu frees width. Check hr/ru at 320px.

---

<a id="p28"></a>

### P28. Turn the home page back into a plain scrolling page

**Rank 28 of 61. Score 6.88** (clarity 5.7, sleek 8.2, safe 7.5; 6 votes counted).  
**Proposed independently by 2 reviewers:** FLO-P14, MOB-P15. **Specification chosen:** FLO-P14 (Interaction flow); lead votes: FLO-P14 6.  
**Chair ruling:** Lands after P06, which removes most of the home page's reveals with HelpOptions.  

- Surface: Home (desktop sheets) and Reveal entrances site-wide
- Files: src/app/page.tsx:12-29, src/components/landing/StackedSections.tsx, src/components/landing/StackedSections.module.css, src/components/ui/Reveal.tsx, src/components/landing/HelpOptions.tsx:237-307, TrustSection.tsx:247-306, HealthTopics.tsx:78-110, TrueFalseQuizSection.tsx:333-344, src/components/health-information/TopicDetailPageContent.tsx:435-490, src/app/not-found.tsx:95-107, src/app/privacy/page.tsx, src/app/terms/page.tsx, src/app/mediatori/page.tsx
- Resolves: FLO-25, FLO-26, MOB-18, MOB-14 (partly), RED-08
- Now: From 1024px every home section is a sticky sheet at least `100svh` tall, with `--stack-hold: 25svh` of extra scroll. Each sheet then dims and shrinks as the next one covers it. Twelve files wrap content in `<Reveal>`, several with `stagger="editorial"` and a `rule-draw` hairline, so content below the fold is hidden after hydration until an IntersectionObserver fires.
- Change:
  1. Replace `<StackedSections>`/`<StackLayer>` in page.tsx with plain sibling sections (keep `className="bg-ink-950"` on the hero wrapper). Delete StackedSections.tsx and its module CSS.
  2. Remove `<Reveal>` from all Operate and Read surfaces: TopicDetailPageContent, privacy, terms, mediatori, not-found, FindHelpPageContent, NewsArticleView. On the home page, keep at most one Reveal per section on the section block, with no `stagger` and no `rule-draw`.
  3. Remove `rule-draw` from TrustSection.tsx:306, MediatorPublicHero.tsx:155 and not-found.tsx:95, and drop the `animationDelay: "420ms"`.
  4. In the symptom check, keep the step slide (`hc-step`, :2332) and remove `list-in` from the option rows (:399, :722). One motion per step.
- Why it is cleaner: No dead scroll, no dimmed sheets, no content arriving in waves; the scroll bar again means what it says.
- Why it is easier for low-literacy and older readers: The page moves only when they scroll, by the amount they scroll, and nothing they want to read is hidden or covered while they look for it.
- Keep: Reveal.tsx itself (still used on home); reduced-motion and Calm Motion gating; dark ink hero; section order. Update `Hero.test.ts` expectations that name StackedSections.
- Verify: /en at 1440: scrolling moves content one-to-one, with no section holding or dimming. Fast-scroll a guide at 375: no blank areas. Grep: no `StackLayer`, no `rule-draw` in tsx, and no `<Reveal` in health-information, privacy, terms or not-found. Lighthouse CLS unchanged or better.
- Effort: M
- Risk: Low; it removes wrappers and classes only, and content and order stay.

**Panel notes**

- *system*: Lead removes stacked sheets and staggers broadly; add MOB-P15's phone guard in Reveal.
- *flow*: FLO-P14 also removes the stacked sheets and dead scroll; take MOB-P15's phone guard in Reveal.tsx.
- *ageing*: FLO-P14 also removes the sticky sheets that hold scroll on desktop; add MOB-P15's phone guard in Reveal.
- *mobile*: FLO-P14 removes the stack and the Operate reveals. Add MOB-P15 step 1: no reveal arms below 768px for what stays on home.
- *reduction*: FLO-P14 removes the dead-scroll sheets everywhere; MOB-P15's phone guard is the fallback if desktop reveals must stay.
- *comprehension*: Lead FLO-P14: it removes the sticky sheets and the reveals on read surfaces. Add MOB-P15's phone guard in Reveal.tsx.

---

<a id="p29"></a>

### P29. Let hero rows act directly when the middle view adds nothing

**Rank 29 of 61. Score 6.86** (clarity 7.0, sleek 7.2, safe 6.2; 5 votes counted).  
**Proposed by:** FLO-P04 (Interaction flow).  

- Surface: Home hero triage panel answer views
- Files: src/components/landing/hero/TriagePanel.tsx:199-211 (`go`), :587-672 (AnswerView), src/lib/i18n/hero-copy.ts:152-158, :159-169, :177-183
- Resolves: FLO-08, FLO-09, LIT-03
- Now: "Check my symptoms" opens a view that repeats "Tap where it hurts, answer 3 questions" above one button, "Start the check". "Understand my prescription" does the same with "Explain my prescription". "Find a pharmacy or doctor nearby" ends in "Open the map", but on phones it lands on the list.
- Change:
  1. Add an optional `direct: true` to `risk` and `prescription` in every locale. In `QuestionView`, render rows whose need is `direct` as a `Link` to `localHref(need.action.href, lang)` instead of a `button` that calls `onChoose`, with the same classes (`press-row group ... min-h-[56px]`) and the same chevron.
  2. Keep the middle view for `problem` (alarm signs), `navigate` (what to bring), `nearby` (the free-pharmacist advice) and the new `doctor` view from FLO-P02. Those carry content.
  3. Rename `nearby`'s action from "Open the map" to "See places near you" in all seven languages, since the finder opens on its list on phones.
  4. Leave the AnswerView code for `risk` and `prescription` reachable for read-aloud only if `scriptFor` still needs it. Otherwise drop those two views from `VIEWS`, which also lowers the panel's fixed height.
- Why it is cleaner: Two screens and two buttons go, and the panel's tallest view (which sets its height) may get shorter.
- Why it is easier for low-literacy and older readers: One tap from "Check my symptoms" to the symptom check. No screen that only repeats what they just tapped, and every button promises only what the next page does.
- Keep: The three-tap maximum to an exit; the way to a doctor on every remaining branch; 56px rows; the ChevronRight on every row; the step announcement (`copy.step`) for views that remain.
- Verify: At 375, tapping "Check my symptoms" opens /health-check, and "Understand my prescription" opens /prescription-review, with no intermediate view. Back from those pages returns to home with the panel on Step 1. The other four rows still open their views. Hero tests updated for the new link rows.
- Effort: M
- Risk: Medium; it mixes links and buttons in one list, so focus and hover handlers must be checked on both.

---

<a id="p30"></a>

### P30. Allow one filled sapphire button per screen; everything else outlined or a link

**Rank 30 of 61. Score 6.78** (clarity 7.0, sleek 8.6, safe 4.2; 5 votes counted).  
**Proposed by:** RED-P13 (Reduction).  
**Chair ruling:** Apply the one-filled-button rule through the Button variants defined in SYS-P06 (P46), keeping SYS-P06's variant names (`action` for sapphire, `primary` for red, which stays reserved for 112). Do not rename variants as RED-P13 suggests.  

- Surface: Site-wide main actions
- Files: src/components/ui/Button.tsx, src/components/landing/hero/TriagePanel.tsx:645-655, src/components/health-information/TopicNextSteps.tsx:48, src/components/health-information/TopicDetailPageContent.tsx:507, src/components/health-information/ArticleListenButton.tsx, src/components/telemed/MedicOnlineHero.tsx:238-296, src/components/find-help/FindHelpPrompt.tsx:33-46, src/components/mediator/MediatorPublicHero.tsx:135-147
- Resolves: RED-16, RED-26, RED-27, RED-30, SYS-08, SYS-09, FLO-12
- Now: The main action is `bg-ink-950` in the triage answer, `bg-foreground` on "Talk to a doctor", and `bg-sapphire` on "Open the dictionary" and "Ask for a mediator". Health guides' Listen is a filled ink button. Doctor online has an icon-only "Test sound" square beside "Enter the waiting room", and a pharmacy offer inside the same card. Mediator sign-in sits beside the public action as a full outlined button.
- Change:
  1. In `Button.tsx`, define three variants: `primary` (sapphire filled, `min-h-12`, `whitespace-nowrap`), `emergency` (`bg-primary`, 112 only), and `secondary` (outlined `border-border-control bg-card`). Text links are not buttons.
  2. Move the files listed onto `Button`. The triage answer CTA and "Talk to a doctor" become `primary`. "Open the dictionary" becomes a link (RED-P12). Listen becomes `secondary` (RED-P06).
  3. Doctor online: replace the icon square with a text link "Test your sound" under the main button (translate into all seven languages). Move "Don't need a doctor? Nearest pharmacy" out of the action card to a single line under it.
  4. Mediators: change "Mediator sign-in" to a text link under the primary button.
  5. Symptom result (`HealthCheckExplorer.tsx:1914-1946`): give the doctor and nearby icon buttons visible words as `secondary`.
- Why it is cleaner: Each screen has one filled thing. Ink, near-black and sapphire stop competing as "main".
- Why it is easier for low-literacy and older readers: "The blue button is the next step" becomes a rule they can learn once. Unlabelled squares beside it become words.
- Keep: All actions and destinations, red only for 112, 44px+ targets, one-line labels in all seven languages (`ZeroTwoLineButtonsAllLocales.test.ts`).
- Verify: Screenshot home answer view, topic page, medic-online, mediatori, symptom result and get-help at 375 and 1440. Each shows at most one sapphire filled button plus red 112 where relevant. Run the button-locale test.
- Effort: L
- Risk: Medium. It touches many files, and the dark-surface variants need care.

**Panel notes**

- *system*: Right rule, but renaming Button variant primary to sapphire while the primary token is red invites 112 mix-ups; keep current names.
- *flow*: One filled action per screen visibly calms every page; touches many files, so build it on SYS-P06's Button.
- *ageing*: One filled button per screen is the right rule, but it duplicates SYS-P06 with clashing variant names and is a large sweep.
- *mobile*: Conflicts with SYS-P06's variant names, and touches many files.
- *comprehension*: Same goal as SYS-P06 with conflicting variant names. Merge into SYS-P06.

---

<a id="p31"></a>

### P31. Replace coloured side stripes with plain sentences and headings

**Rank 31 of 61. Score 6.78** (clarity 5.8, sleek 7.4, safe 7.8; 5 votes counted).  
**Proposed by:** SYS-P12 (Type and layout system).  

- Surface: guides, online doctor, waiting room, find help, portal, forms, warning-signs card
- Files: src/components/telemed/MedicOnlineHero.tsx:230; src/components/telemed/OnCallQueueLauncher.tsx:283, :288; src/components/portal/PatientPortalView.tsx:961; src/components/health-assistant/HealthAssistant.tsx:143; src/components/mediator/RequestMediatorModal.tsx:435; src/components/report-issue/ReportIssuePageContent.tsx:253, :258; src/components/find-help/FindHelpExplorer.tsx:950, :1108, :1110; src/components/health-information/HealthArticleShell.tsx:95; SubjectHeaderToolbar.tsx:57; TopicDetailPageContent.tsx:401; RomanianDualRegisterGlossary.tsx:522; HealthInformationTopicGrid.tsx:484; WarningSignsEmergencyCard.tsx:175; SmsPhoneAuthModal.tsx:478; PrescriptionStructuredResult.tsx:552; AnatomicalBodyMap.tsx:872
- Resolves: SYS-17, AGE-13 (status by colour)
- Now: 19 `border-l-2/3/4` stripes in six colours mark status ("Available now" in `border-live-sage`, "you are next" `border-sapphire` vs "your place" `border-border`), alerts (`border-primary`), summaries (`rounded-r-lg border-l-2 border-sapphire bg-surface-subtle/70`); the selected clinic row is marked with `shadow-[inset_3px_0_0_0_var(--color-sapphire)]`.
- Change:
  1. Status and alert lines: remove the stripe; the line is `text-body font-semibold text-foreground` and its words carry the state (copy already does: "Available now, every day, 08:00-20:00", "You are next"). Errors use `role="alert"` and the word that names the problem.
  2. Summary/lead boxes in guides (HealthArticleShell.tsx:95, SubjectHeaderToolbar.tsx:57, TopicDetailPageContent.tsx:401): drop stripe and tint; render as the page's `text-lead` paragraph.
  3. WarningSignsEmergencyCard and PrescriptionStructuredResult pharmacist banner: full border in `border-primary/40` or `border-amber-care-border` (1px, whole card), with a `text-title` heading that says what it is; no 4px left edge.
  4. Selected clinic row: `bg-sapphire-soft` plus `aria-current="true"` and the row's name in `font-semibold`; remove the inset stripe.
- Why it is cleaner: removes 19 decorative stripes in six colours; status is said, not painted.
- Why it is easier for low-literacy and older readers: state is in words they can read or hear, not in a thin coloured line that colour-weak older eyes miss.
- Keep: CLAUDE.md rules 1 and 2 (no pill replaces the stripe); live-region roles; the emergency card's 112 button.
- Verify: `rg "border-l-(2|3|4|\[)|inset_3px" src/components -g '!**/panel/**'` returns nothing; at 375 /en/medic-online status line, /en/medic-online/asteptare queue states and a selected clinic row read correctly in greyscale (DevTools emulate achromatopsia).
- Effort: M
- Risk: Low; visual-only, and the copy already names each state.

---

<a id="p32"></a>

### P32. Replace the ellipsis rule with whole-button reflow at large text

**Rank 32 of 61. Score 6.77** (clarity 8.3, sleek 5.3, safe 5.7; 6 votes counted).  
**Proposed independently by 2 reviewers:** AGE-P02, SYS-P07. **Specification chosen:** SYS-P07 (Type and layout system); lead votes: SYS-P07 4, AGE-P02 2.  
**Chair ruling:** Land directly after P33 (rem tokens) and re-check every button row at 114% and 126% once both are in. For the clinic call button follow P07.  

- Surface: all pages on phones at Comfort "Large" and "Extra large"
- Files: src/app/globals.css:1019-1038; src/components/find-help/LocationFilterPopover.tsx:163-165; src/components/find-help/FindHelpExplorer.tsx:1189; src/components/auth/SignInForm.tsx:186; src/components/portal/SmsPhoneAuthModal.tsx:535; src/components/telemed/AppointmentBookingCalendar.tsx:557; button rows in PageHeader actions and card footers
- Resolves: AGE-02, MOB-06, SYS-09
- Now: under 640px at large/xl scale, globals.css adds `overflow: hidden; text-overflow: ellipsis` to every `:is(button, a).whitespace-nowrap` and its spans, so the location reads "B…", a clinic phone number is cut inside its Call button, and a sub-tab reads "Symptom c".
- Change:
  1. Delete the `overflow: hidden; text-overflow: ellipsis` block (lines 1024-1038); keep `max-width: 100%`.
  2. Every row of buttons uses `flex flex-wrap gap-3`; at large/xl scale under 640px add `html[data-text-scale="large"|"xl"] .btn-row > * { flex: 1 1 100% }` so buttons stack as whole full-width buttons, one per line, labels still on one line.
  3. Remove `truncate` from the four component sites in Files; put the phone number in the Call button's label as "Call" plus the number on its own line below the button as `text-body tabular-nums` (selectable), so the number is never inside a clipped box.
  4. If a single label is still wider than the screen at 126% in any language, shorten that copy key in all seven languages.
- Why it is cleaner: one predictable behaviour (stack) replaces dozens of silently clipped labels.
- Why it is easier for low-literacy and older readers: the people who turned text up never get half-words or a half phone number; they get the same buttons, one under the other.
- Keep: CLAUDE.md rule 3 (labels never wrap inside a button); 44px targets; Call still dials the same number.
- Verify: at 360 and 375, Comfort "Extra large", in ro, ru, hr and rom: /find-help location filter, a clinic card, /sign-in, /medic-online/programare and the tool sub-tabs show no "…"; every button label is complete and on one line.
- Effort: M
- Risk: Medium; stacked buttons make some screens longer at large scale, which is the right trade but must be checked on the tool pages.

**Panel notes**

- *system*: Lead also fixes booking strip and data truncation. Take SYS-P07's phone number moved out of the clipped button.
- *flow*: SYS-P07 defines the reflow rule generally; take AGE-P02's booking-strip fixes (weekday via Intl, gap-2 hours).
- *ageing*: SYS-P07's btn-row stacking is cleaner; add AGE-P02's booking day/hour fixes. Stops the truncation of words and phone numbers for exactly the people who enlarged text.
- *mobile*: SYS-P07's rule is cleaner. Take AGE-P02 step 2 (data spans wrap instead of truncating) and its booking-strip weekday fix.
- *reduction*: SYS-P07 fixes the root rule; take AGE-P02's booking-grid gaps and weekday fix.
- *comprehension*: Lead AGE-P02: it also fixes the booking day strip. Use SYS-P07's .btn-row mechanism, but not its 'number below the Call button', which conflicts with C14.

---

<a id="p33"></a>

### P33. Map every font size onto seven rem tokens and guard it

**Rank 33 of 61. Score 6.75** (clarity 8.3, sleek 6.7, safe 4.0; 6 votes counted).  
**Proposed independently by 2 reviewers:** AGE-P01, SYS-P01. **Specification chosen:** SYS-P01 (Type and layout system); lead votes: SYS-P01 6.  
**Chair ruling:** Foundation. P38, P10, P04 and P32 assume its tokens and its guard test exist.  

- Surface: site-wide (public scope)
- Files: src/app/globals.css:72-98, every file listed in audit-system.md SYS-01 (worst: src/components/health-check/HealthCheckExplorer.tsx, src/components/search/SmartSearchModal.tsx, src/components/health-assistant/PrescriptionReview.tsx, src/components/health-assistant/PrescriptionStructuredResult.tsx, src/components/landing/hero/TriagePanel.tsx, src/components/find-help/FindHelpExplorer.tsx), new test src/components/ui/TypeScale.test.ts
- Resolves: SYS-01, SYS-06, SYS-07, SYS-19, SYS-20, AGE-01, MOB-10
- Now: 40 size classes and 25 arbitrary `text-[...]` values (`text-[13.5px]`, `text-[15px]`, `text-[0.9375rem]`, `text-[11px]`, `text-[1.0625rem]`...) produce about 28 rendered sizes; the seven tokens carry 4.3% of declarations. The px values do not grow when the reader picks "Large" or "Extra large" in the Comfort menu (AGE-01).
- Change:
  1. In globals.css `@theme`, add one role: `--text-reading: 1.125rem; --text-reading--line-height: 1.65; --text-reading--font-weight: 400;` for long prose (guides, news, articles). Keep display, page, section, title (1.125rem/600), lead, body (1rem/1.6), meta (0.875rem/500).
  2. Apply this mapping in every public file: `text-[10px]`, `text-[11px]`, `text-[11.5px]`, `text-[0.6875rem]`, `text-xs` → `text-meta` when the text is a count, caption, timestamp or field hint, otherwise `text-body`. `text-sm`, `text-[12.5px]`, `text-[13px]`, `text-[13.5px]`, `text-[0.8125rem]`, `text-[14px]`, `text-[14.5px]` → `text-meta` for counts/captions/hints, `text-body` for any sentence the reader acts on, any list item, any button or menu label. `text-[15px]`, `text-[15.5px]`, `text-[0.9375rem]`, `text-[16px]`, `text-base` → `text-body`. `text-[17px]`, `text-[1.0625rem]`, `text-[1.125rem]`, `text-[18px]`, prose `text-lg` → `text-reading`; heading `text-lg` → `text-title`. Heading `text-xl`/`text-2xl` → `text-title` or `text-section` per SYS-P05; `text-3xl` and up on h1 → `text-page`.
  3. Remove the per-element `leading-*` and `tracking-[...]` that sit next to a token (the token carries both), except `leading-tight`/`leading-snug` on multi-line button or row labels.
  4. Add src/components/ui/TypeScale.test.ts that reads every public `.tsx` (same file walk as SingleLineAndFilterConsistency.test.ts) and fails on `text-\[[0-9.]+(px|rem)\]` and on `text-(xs|sm|lg|xl|[2-9]xl)` outside an allowlist: the fridge print sheet in PrescriptionStructuredResult.tsx, global-error.tsx, and the 3D/SVG label files.
- Why it is cleaner: about 28 sizes become 6, and the same role looks the same on every screen.
- Why it is easier for low-literacy and older readers: guidance, steps and labels reach 16px, and because every size is rem, the Comfort "Large"/"Extra large" setting finally enlarges all text, including the small text.
- Keep: one-line button labels in all seven languages (ZeroTwoLineButtonsAllLocales.test.ts); the print sheet's own sizes; `tabular-nums` where present; dark-mode text colours.
- Verify: `rg "text-\[[0-9.]+(px|rem)\]" src/components src/app -g '!**/panel/**'` returns only allowlisted files; TypeScale.test.ts passes; at 375 and 1440, Comfort "Extra large", the triage choices, 112 strip, Comfort menu options and drawer rows all grow (they stay fixed today); no button label wraps in ro, en, sq, it, hr, rom, ru.
- Effort: L
- Risk: Medium; bigger labels may push some buttons past one line, which then needs shorter copy in all seven languages.

**Panel notes**

- *system*: Removes the root cause of AGE-01. AGE-P01 maps 17-18px prose to text-title (600 weight), which bolds body text; the reading role fixes that.
- *flow*: Needed foundation, but an L sweep where 16px labels will wrap and force copy changes in seven languages. SYS-P01's guard test is the stronger basis.
- *ageing*: SYS-P01 has the full mapping and a guard test; keep AGE-P01's rule that nothing stays below meta. Makes the comfort scale actually work.
- *mobile*: SYS-P01 adds the guard test. Huge sweep: labels grow, one-line buttons need C16 first, and copy cuts in seven languages.
- *reduction*: Real fix for the comfort setting, but a sweep of hundreds of classes risks two-line buttons in long languages. SYS-P01 is fuller; take AGE-P01's no-sub-meta rule.
- *comprehension*: Lead SYS-P01: a fuller mapping, a reading token and a guard test. AGE-P01 is the same intent. The risk is labels growing past one line in long languages.

---

<a id="p34"></a>

### P34. Leave the page scrollable around the phone map

**Rank 34 of 61. Score 6.67** (clarity 6.8, sleek 5.2, safe 8.2; 5 votes counted).  
**Proposed by:** MOB-P13 (Mobile and low-end devices).  

- Surface: Find help map view, phones
- Files: src/components/find-help/FindHelpExplorer.tsx:1250-1262, src/components/find-help/InstitutesMapInner.tsx:485-497
- Resolves: MOB-08
- Now: after "Map" the map box is `h-[max(20rem,calc(100dvh-var(--chrome-h,0px)-7.5rem))]`, almost the whole screen. Leaflet's one-finger drag pans the map, so a swipe up does not scroll the page.
- Change:
  1. Below lg, set the map box to `h-[min(62svh,30rem)]`, leaving visible page above and below it to scroll with.
  2. When the Map view opens on a phone, scroll so that the map's top sits just under the header and the "Near …" row from MOB-P11 sits above it.
  3. Below the map, add a full-width outlined button "Back to the list" (`min-h-12 text-base`, reuse `copy.viewList`), which does the same as the bottom bar's List.
  4. Keep Leaflet's `dragging` and `touchZoom` as they are (no new dependency).
- Why it is cleaner: the map becomes a framed block in the page instead of a surface that takes it over.
- Why it is easier for low-literacy and older readers: a swipe on the page above or below the map scrolls as expected, and there is a worded way back to the list next to the map.
- Keep: the map, markers, clusters, the preview card, "Search this area", the List/Map bar and the desktop sticky map.
- Verify: at 375x812 tap Map: the map is no more than about 500px tall, with page visible above or below it. Swiping outside the map scrolls the page. "Back to the list" returns to the list at the same result.
- Effort: S
- Risk: Low, because these are a class change and one extra button.

**Panel notes**

- *flow*: A small change that stops the map trapping one-finger scrolling, a real problem on phones.

---

<a id="p35"></a>

### P35. Put "Talk to a doctor online" in the hero's six choices

**Rank 35 of 61. Score 6.66** (clarity 8.4, sleek 4.6, safe 6.0; 5 votes counted).  
**Proposed by:** FLO-P02 (Interaction flow).  
**Chair ruling:** Lands before P06 (hero as the only router). Its doctor row is the one to keep; see the ruling on P06.  

- Surface: Home hero triage panel
- Files: src/lib/i18n/hero-copy.ts:87 (`HERO_NEED_ORDER`), :135-195 (the `needs` objects for all locales), src/components/landing/hero/TriagePanel.tsx:37-44 (`NEED_ICONS`)
- Resolves: FLO-07, RED-04, LIT-03
- Now: The six choices are "Read simple health guides / Check my symptoms / Find a pharmacy or doctor nearby / I feel unwell right now / Understand my prescription / Not sure where to go". The product's own journey ends "Talk to a doctor", but none of the six goes there. The guides row opens a true/false quiz and a "Start a lesson" button that leads to a directory.
- Change:
  1. Replace the `learn` row with a new need, `doctor`, labelled "Talk to a doctor online". Keep its hint short, e.g. "Free phone call with a doctor."
  2. Give `doctor` an answer view in the same AnswerView shape. Title: "Talk to a doctor from home". Use `points` for three bullets taken from the existing /medic-online copy: "Free, no card or account needed." / "The doctor calls you on the phone." / "Every day, 08:00 to 20:00." Action: `{ label: "Talk to a doctor now", href: "/medic-online" }`. On this view, hide the bottom "Want to talk to a doctor?" line, because it would repeat the action.
  3. Order the rows by urgency: `problem` ("I feel unwell right now") first, then `risk`, `doctor`, `nearby`, `prescription`, `navigate`.
  4. Use the existing `StethoscopeIcon` (already used in the header nav for "Online doctor") for `doctor` in `NEED_ICONS`.
  5. Remove the `learn` quiz from the panel. Guides stay reachable from the header "Learn" link, the topic wheel and the footer. The home myth quiz section still carries true/false (RED-04 counts three quizzes, and this leaves one).
  6. Write all new strings in all seven languages and keep `HeroCopy` types in step.
- Why it is cleaner: The hero keeps six rows but drops a quiz inside a router. Every row now leads to a task, not to reading material.
- Why it is easier for low-literacy and older readers: The outcome most of them want, a doctor, is one tap away under its own name. "I feel unwell right now" sits first, where a worried reader looks first.
- Keep: Six rows at `min-h-[56px]`; inert inactive views; focus moved to the new heading; read-aloud script built from labels (`scriptFor`); the 112 view unchanged; no red outside the 112 button.
- Verify: Home at 375, 768 and 1440 in all seven languages. Six rows, none wrapping past two lines at 375. The doctor row opens its view, and its button lands on /medic-online. Run `Hero.test.ts` and `triage-improvements.test.ts`, and update their expected order to the new one.
- Effort: M
- Risk: Medium; panel copy is tested for locale parity, and the panel height is set by its tallest view.

**Panel notes**

- *mobile*: Adds back home's door to the doctor once HelpOptions goes (C12).
- *reduction*: The most-wanted outcome becomes a row. Make it a direct link (FLO-P04 logic) instead of a new answer view that repeats /medic-online.
- *comprehension*: The outcome most readers want gets its own row, and the urgent row goes first. Keep the answer view: free, phone, hours reassure a hesitant reader.

---

<a id="p36"></a>

### P36. Remove decorative work from the phone home's first paint

**Rank 36 of 61. Score 6.52** (clarity 5.0, sleek 7.4, safe 8.2; 5 votes counted).  
**Proposed by:** MOB-P14 (Mobile and low-end devices).  
**Chair ruling:** Only its phone-specific first-paint steps apply; the looping motion it leaves on desktop is removed by P14.  

- Surface: Home hero and footer
- Files: src/components/landing/Hero.tsx:29-39, src/components/landing/Hero.tsx:57, src/components/landing/Hero.tsx:67, src/components/landing/WheelBackdrop.module.css:21-42, src/components/landing/WheelBackdrop.module.css:105-160, src/app/globals.css:474-487, src/components/layout/Footer.tsx
- Resolves: MOB-15, MOB-16, MOB-17, FLO-24, FLO-30
- Now: on phones the hero runs a 114vw-wide `WheelBackdrop` at `opacity: 0.15` under a two-gradient `mask-composite`. With the footer copy that makes 14 infinite `hero-wheel-spin` animations. The LCP element is a decorative `opacity-45` photo fetched with `loading="eager" fetchPriority="high"`. The headline column paints at opacity 0 (`hero-enter … both`).
- Change:
  1. Do not render `WheelBackdrop` below lg in either placement: wrap it in a `hidden lg:block` element, and in `WheelBackdrop.module.css` set `.backdrop { display: none }` under `@media (max-width: 1023px)`, so no animation is created.
  2. Hero photo: use `getImageProps` (see the Next 16 docs in node_modules) with a `<picture>`, so the photo `<source>` applies only at `(min-width: 1024px)`. Below lg render no image; the existing ink gradient (`:41-44`) stays on `bg-ink-950`. Keep `fetchPriority="high"` only for the desktop source.
  3. Change `hero-enter` so it no longer starts from opacity 0: `from { transform: translateY(8px) }` only, with no opacity step, or remove `hero-enter` from `Hero.tsx:67` below lg.
- Why it is cleaner: the phone hero becomes the ink ground, the headline and the panel, with nothing moving behind them.
- Why it is easier for low-literacy and older readers: the first words are fully legible at once in sunlight, and the phone spends its effort on the buttons the person will tap.
- Keep: the desktop wheel and photo, the triage panel, the ink gradient, reduced-motion and Calm Motion rules, and `Hero.test.ts`.
- Verify: at 375px on /en run `document.getAnimations().filter(a => a.playState === "running").length`: no `hero-wheel-spin` entries. In the Network panel there is no `hero-consultation.jpg` request below 1024px, and there is one at 1280px. A Lighthouse mobile run shows the LCP element is the h1 or the panel, not an image.
- Effort: S
- Risk: Low, because the decoration is removed on phones only and desktop keeps it.

**Panel notes**

- *flow*: Largely superseded by FLO-P13 and FLO-P15; the phone hero-photo change is the part worth keeping.

---

<a id="p37"></a>

### P37. Spend bold only on headings, labels and the one key fact

**Rank 37 of 61. Score 6.46** (clarity 5.6, sleek 6.8, safe 7.6; 5 votes counted).  
**Proposed by:** SYS-P14 (Type and layout system).  

- Surface: prescription result, symptom check, find help, guide topic modules
- Files: src/components/health-assistant/PrescriptionStructuredResult.tsx:244, :555, :565, :692, :732, :762, :783, :797; src/components/health-check/HealthCheckExplorer.tsx (42 bold); src/components/find-help/FindHelpExplorer.tsx (22); src/components/health-information/womens-health/WomensHealthInteractiveStepper.tsx (21); src/components/health-information/preventive-screening/PreventiveScreeningSelector.tsx (21); src/components/health-information/diabetes/GlucoseDynamicsModule.tsx (19, 4 `<strong>`); InsulinMechanicsModule.tsx (5 `<strong>`)
- Resolves: SYS-24, LIT-22
- Now: `font-semibold` 729 times against `font-normal` 16; on the prescription result headings, medicine names, labels, notes and inline highlights (`bg-amber-care-soft px-1 font-semibold`) are all 600.
- Change:
  1. Rule in DESIGN.md §3: 700 for page/section headings (from the tokens), 600 for title/h3, button labels, field labels and at most one key fact per row or card; 400 for everything else, including values, notes, list items and descriptions.
  2. Apply it to the files listed; on the prescription result the one bold fact per medicine is the dose instruction line (with SYS-P03's food/duration rows at 400 body), the medicine name is the h3 (`text-title`, 600).
  3. Remove the inline amber highlight with bold (:244); keep the highlight colour only if it marks an uncertain value, and say so in words.
  4. Replace decorative `<strong>` inside guide modules with plain text unless it marks a warning.
- Why it is cleaner: weight stops being a background texture and goes back to marking hierarchy.
- Why it is easier for low-literacy and older readers: when only the key fact is bold, a reader who scans rather than reads lands on the instruction they need.
- Keep: the fridge print sheet's bold table (print legibility); headings' weights from tokens.
- Verify: on the prescription result and a symptom result at 375, count bold runs per card: one per row at most beyond headings and labels; `rg -c "font-semibold" ` on the listed files drops by more than half.
- Effort: M
- Risk: Low; weight-only change.

---

<a id="p38"></a>

### P38. Set the header, menu, Comfort menu and search on body tokens

**Rank 38 of 61. Score 6.45** (clarity 7.4, sleek 5.4, safe 6.0; 5 votes counted).  
**Proposed by:** SYS-P02 (Type and layout system).  
**Chair ruling:** The comfort menu itself is rebuilt by AGE-P03 (P04): a vertical list that previews each size. Skip this item's steps for the comfort menu's size options.  

- Surface: chrome (header, phone drawer, Comfort menu, language selector, 112 strip, search modal)
- Files: src/components/layout/Header.tsx:329, :606, :655, :695, :730, :737, :770, :781, :795, :814, :838, src/components/layout/ComfortMenu.tsx:248, :266, :274, :290, :317, :320, :349, :379, :387, :439, src/components/layout/LanguageSelector.tsx, src/components/layout/UniversalEmergencyBanner.tsx:109, src/components/search/SmartSearchModal.tsx:660, :667, :687, :747, :817, :832, :862, :960, :1102, :1196
- Resolves: SYS-25, SYS-27, AGE-03, AGE-05, AGE-21, AGE-24, MOB-27
- Now: the chrome has its own half-pixel scale: `text-[13.5px]` header controls and search tabs, `text-[15.5px]` drawer rows, `text-[11px] ... truncate` Comfort options ("Normal / Large / Extra large"), `text-[13px]` "Emergency? Call 112", `text-xs font-medium text-ink-900/55` search section labels (about 3.9:1, AGE-21).
- Change:
  1. Header controls, drawer rows, Comfort options, language names, search tabs and search result text → `text-body`; drawer one-line descriptions that are now `sr-only` (Header.tsx:655, :737) become visible `text-meta text-muted-foreground`.
  2. Comfort menu option labels: drop `truncate`; lay the three text-size options as a wrapping row of whole buttons (`flex flex-wrap gap-2`, each `whitespace-nowrap`), so "Extra large" never becomes "Extra l…".
  3. Comfort helper line (:320) and Reset (:349) → `text-meta text-muted-foreground` (muted-foreground #475569 passes AA); remove `text-ink-900/55` and `/45` everywhere in SmartSearchModal in favour of `text-muted-foreground`.
  4. 112 strip text and link → `text-body`; the drawer's "Call 112" button (:781) → `text-body` via Button `variant="primary"` (see SYS-P06).
  5. Search emergency explanation (:862) → `text-body text-foreground` (colour fix in SYS-P11).
- Why it is cleaner: the most-seen parts of the site stop using a private scale; one size for every menu row and option.
- Why it is easier for low-literacy and older readers: the place a low-vision reader goes to enlarge text is itself readable, and the 112 line is no longer the smallest thing in the header.
- Keep: header height budget (MOB-12; check the strip still fits one line at 360 in ru and hr); Comfort preferences behaviour and storage; MobileMenu.test.ts and ChromeConsistency.test.ts intent.
- Verify: at 360 and 375, every Comfort option, drawer row and search tab computes to at least 16px at Normal and grows at Large/Extra large; no truncation ellipsis in the Comfort menu in any language; axe/contrast check shows no text below 4.5:1 in the search modal.
- Effort: M
- Risk: Medium; the phone header and drawer get taller rows, so the 112 strip needs a check in the longest languages.

---

<a id="p39"></a>

### P39. Make the 3D controls 44px with words, and put the D-pad behind Options

**Rank 39 of 61. Score 6.39** (clarity 6.5, sleek 6.8, safe 5.7; 6 votes counted).  
**Proposed independently by 2 reviewers:** AGE-P10, MOB-P03. **Specification chosen:** MOB-P03 (Mobile and low-end devices); lead votes: MOB-P03 6.  
**Chair ruling:** Lands after P01.  

- Surface: Symptom check 3D stage (shown only once 3D is chosen, after MOB-P01)
- Files: src/components/health-check/AnatomicalBodyMap.tsx:450-452, src/components/health-check/AnatomicalBodyMap.tsx:1142, src/components/health-check/AnatomicalBodyMap.tsx:1167-1260
- Resolves: MOB-04, AGE-06, AGE-07, RED-19, LIT-12
- Now: the D-pad buttons are `h-7 w-7` (28px). Front/Back, zoom and the five layer tools are `h-9 w-9` (36px). The layer tools are icon-only, with their names in a hover-only tooltip (`pointer-events-none absolute … hidden`). About a dozen controls float over a 309px stage.
- Change:
  1. Below lg, do not render the D-pad on the stage. Move it into the existing "Search and options" panel, under a plain heading "Turn the body" (new key `turnBody`, all seven languages), with each button `h-11 w-11`.
  2. Make the stage toolbar a single row of three text buttons, each `min-h-11 whitespace-nowrap px-3 text-base`: "Front", "Back" and "Inside" (new key `inside`, all seven languages). "Inside" opens the existing layer choice. Zoom in and Zoom out stay as two `h-11 w-11` icon buttons, since a + and − are the control itself.
  3. Inside the layer choice, render each layer as a row with its icon and its visible word ("Skin", "Muscles", "Bones", "Organs", "Whole body"), `min-h-11 text-base`. Delete the hover-only tooltip spans at `:450` and `:1254-1256`.
- Why it is cleaner: about a dozen floating glyphs become one row of three words and two zoom buttons.
- Why it is easier for low-literacy and older readers: every control says what it does and can be hit with an unsteady thumb, and no meaning is hidden behind hover, which phones do not have.
- Keep: every camera action (move up/down, turn, reset, zoom, front/back), every layer, keyboard access, the `aria-label`s, and the desktop toolbar layout at lg+.
- Verify: at 375px choose 3D and measure that every stage control is at least 44x44 (the snippet in audit-mobile MOB-04 can be reused). Open Options and check all five D-pad actions work. In ro and hr the toolbar row stays on one line at 360px. Check desktop at 1280px for no change.
- Effort: M
- Risk: Medium, because the stage overlay positions (`absolute inset-x-2 bottom-4`) must be checked with the sheet over them.

**Panel notes**

- *system*: Hiding the D-pad behind Options removes clutter; take AGE-P10's visible layer names and 8px gaps.
- *flow*: MOB-P03 hides the D-pad behind Options, which is calmer than five labelled turn buttons; take AGE-P10's gap-2 and wrapping rows.
- *ageing*: MOB-P03 moves the D-pad into Options and keeps every function; take AGE-P10's 8px gaps and visible layer words.
- *mobile*: Matters less once 3D is opt-in. Take AGE-P10's native select for layers in place of MOB-P03's custom rows; keep the D-pad inside Options.
- *reduction*: MOB-P03 moves the D-pad behind Options, fewer floating controls; AGE-P10's five-word row adds clutter. Less urgent once C01 lands.
- *comprehension*: Lead MOB-P03: three words plus zoom, D-pad in Options. AGE-P10's single layer select is an acceptable alternative inside 'Inside'.

---

<a id="p40"></a>

### P40. Put every colour back on the palette; red means 112

**Rank 40 of 61. Score 6.31** (clarity 5.8, sleek 6.0, safe 7.6; 5 votes counted).  
**Proposed by:** SYS-P11 (Type and layout system).  

- Surface: search, prescription review, doctor recommendation, mediator request, video room, map, body diagram
- Files: src/components/search/SmartSearchModal.tsx:855-868; src/components/health-assistant/PrescriptionReview.tsx (rose classes); src/components/telemed/DoctorRecommendationPublisher.tsx:289 and red/amber classes; src/components/health-assistant/MediatorRequestModal.tsx (text-red-700); src/components/health-assistant/PrescriptionStructuredResult.tsx (bg-neutral-100); src/components/telemed/PublicVideoConsultationRoom.tsx (slate-950, slate-400); src/components/ui/RomaniaCountyMap.tsx (fill-slate-*); src/components/find-help/InstitutesMapInner.tsx (#1d3557, #c62f3c); src/components/health-check/pain-area-diagram.ts; src/components/health-check/printSummary.ts
- Resolves: SYS-14, SYS-15, SYS-16
- Now: search errors are a private rose palette with a filled `bg-rose-700` retry button; DoctorRecommendationPublisher uses `bg-red-500/10`, `bg-amber-500/10 text-amber-800`; map markers and the pain diagram hard-code hex copies of tokens and Tailwind slate.
- Change:
  1. Search and prescription error states: plain card (SYS-P09), message `text-body text-foreground`, retry as `Button variant="outline"`; red (`primary`) appears only when the message is about an emergency (the existing serious-symptom explanation keeps a `Button variant="primary"` "Call 112").
  2. Replace `red-*`/`rose-*` with `primary`/`primary-soft`, raw `amber-*` with `amber-care`/`amber-care-soft`, `slate-*`/`neutral-*` with `ink-*`, `muted`, `muted-foreground`.
  3. SVG and canvas code that cannot use classes reads colours with `getComputedStyle(document.documentElement).getPropertyValue("--color-sapphire")` once, or uses `currentColor`/`var(--color-...)` in SVG attributes; printSummary.ts keeps literal hex (print window has no stylesheet) but imports them from one constants file that mirrors globals.css.
- Why it is cleaner: one palette; 57 off-palette classes and most of 40 hex values go.
- Why it is easier for low-literacy and older readers: red keeps its single meaning, so a failed search no longer looks like an emergency to a frightened reader.
- Keep: emergency red where it is truly 112; contrast AA in light and dark; print output unchanged in look.
- Verify: `rg "(rose|red|slate|stone|neutral|gray|zinc|emerald)-[0-9]" src/components src/app -g '!**/panel/**'` returns nothing; trigger a search error at 375: no red fill; type a red-flag symptom: red 112 button still shows.
- Effort: M
- Risk: Low; colour swaps on error and edge states.

---

<a id="p41"></a>

### P41. Replace "Anatomy: general / female" with a plain women's-body switch

**Rank 41 of 61. Score 6.23** (clarity 7.0, sleek 4.6, safe 6.8; 5 votes counted).  
**Proposed by:** LIT-P05 (Comprehension).  
**Owner decision needed:** Clinical owner to confirm the plain label for the general body model.  

- Surface: Symptom check step 1 setup row
- Files: src/components/health-check/HealthCheckExplorer.tsx:2353-2361, 2414-2447; src/components/health-check/health-check-copy.ts:282-285 (`bodyModelLabel`, `bodyTypeLabel`, `bodyGeneral`, `bodyFemale`) in all locales
- Resolves: LIT-11
- Now: a grey line "For me, anatomy: general" with "Change". Behind it are two radio groups, "Who is this for? For me | For a child" and "Anatomy: General | Female". The same setting is also called "Body model". Female-only areas (breast, ovaries, pregnancy) are hidden unless "Female" is chosen.
- Change:
  1. Rename `bodyTypeLabel` to "Body" and the options to "Man" / "Woman" ("General" becomes "Man", since the general model is the male-default body). Translate into all seven languages.
  2. Change the summary line to read "For me · Woman" or "For a child · Man" (no "anatomy:" prefix, no lowercasing of a mid-sentence label).
  3. Delete `bodyModelLabel` or point it at the same "Body" string so one name remains.
  4. Under the radio group, add one line of helper text only when "Man" is selected: "Choose Woman to see breasts, periods and pregnancy." (new key, all seven languages).
- Why it is cleaner: one name for one setting, and a two-word summary line instead of a label-colon-value construction.
- Why it is easier for low-literacy and older readers: "Woman" is a word everyone knows; "anatomy: general" is not. The helper tells a woman with period pain why her area is missing.
- Keep: the filter logic on `bodyProfile` (values "general"/"female" stay internal), the radiogroup keyboard handling, permalink encoding, health-check-womens-anatomy tests.
- Verify: at 375px open "Change", read both groups aloud in en, ro and ru; switch to Woman and confirm the pelvis area shows period and ovary symptoms. Run health-check-womens-anatomy.test.ts.
- Effort: S
- Risk: Low; copy only, internal values unchanged. Ask the clinical owner to confirm "Man" is accurate for the general model.

**Panel notes**

- *ageing*: Plain words help, but 'Man' for the general model needs clinical sign-off and may alienate some readers.
- *mobile*: Needs clinical confirmation that the general model is fairly called 'Man'.

---

<a id="p42"></a>

### P42. Use one word for severity and fix the contradictory and mistranslated scales

**Rank 42 of 61. Score 6.22** (clarity 7.4, sleek 3.8, safe 7.0; 5 votes counted).  
**Proposed by:** LIT-P06 (Comprehension).  
**Owner decision needed:** Native check of the Russian and Romani severity wording before merge.  

- Surface: Symptom check severity and duration step, result summary
- Files: src/lib/i18n/health-check-translations.ts:1227-1245 (en `step3Title`, `step3Question`, `severityHeading`, `intensityLabel`, `durationHeading`, `durationLabel`), 1714-1744 (en `severity`, `duration`), 623-653 (ru), ~3895-3906 (rom), and the same keys in ro/sq/it/hr
- Resolves: LIT-13, LIT-14
- Now: one answer is called "Severity", "How strong, and since when?", "How bad is it?" and "Intensity". The duration option "Today or yesterday" has the hint "Under 24 hours". Russian severity reads "Мягкий / Умеренный / Тяжелый", with "Вряд ли вы сможете что-либо сделать" as the severe description. Romani mixes "č" and "ch" spellings.
- Change:
  1. English: `step3Title` "How bad", `severityHeading` "How bad is it?", `intensityLabel` "How bad"; `durationHeading` "How long have you had it?", `durationLabel` "How long". `step3Question` "How bad is it, and for how long?"
  2. Duration hints: `today` hint becomes "Started today or yesterday"; `days` hint "Between 2 and 7 days"; `weeks` hint "Between 1 and 2 weeks"; `chronic` hint unchanged. Remove the "Under 24 hours" claim in every locale.
  3. Russian: severity titles "Слабо / Средне / Сильно"; descriptions "Замечаете, но обычные дела делаете" / "Мешает работать, двигаться или спать" / "Почти ничего не можете делать"; `chronic` hint "Не проходит или возвращается снова". Remove trailing full stops from the ru `urgency.*.title` strings.
  4. Romani: choose one spelling ("ch"/"chh", matching hero-copy.ts) and apply it across health-check-translations rom, with a native reviewer.
  5. Apply the matching single term in ro, sq, it and hr.
- Why it is cleaner: four labels become one, and the hints stop repeating or contradicting their labels.
- Why it is easier for low-literacy and older readers: the word on the question is the word on the summary the doctor sees, and the Russian scale uses the everyday words for pain, on the answer that decides "see a doctor today".
- Keep: severity and duration ids and the care-level logic, the printed doctor summary (which uses these labels), the medical-glossary and russian tests.
- Verify: walk the flow to the result in en, ru and rom at 375px; the step heading, the trail and the summary use the same word. Run russian.test.ts and triage-improvements.test.ts.
- Effort: S
- Risk: Low; copy only. The Russian and Romani wording needs a native check before merge.

**Panel notes**

- *flow*: Real meaning fixes in ru and rom; no visual change, so low on sleek. Needs native review before merge.
- *ageing*: Valuable copy fix, especially Russian, but no visual simplification.

---

<a id="p43"></a>

### P43. Ask about the problem first on the request-help form

**Rank 43 of 61. Score 6.12** (clarity 7.6, sleek 5.0, safe 4.8; 5 votes counted).  
**Proposed by:** LIT-P11 (Comprehension).  
**Owner decision needed:** The consent wording is legal text: owner or lawyer approves it in all seven languages. Implement the reordering; leave the consent text unchanged until approved.  

- Surface: Ask a person for help (/get-help)
- Files: src/components/get-help/RequestHelpForm.tsx (render order of country, county, name, phone, email, description with `QUICK_HELP_TOPICS`; 137 validation); src/components/get-help/GetHelpPageContent.tsx (aside with `sidebar.steps`); src/lib/i18n/translations.ts:1392-1422 (en `form.*`, `sidebar.*`) and all locales
- Resolves: LIT-24, FLO-16 (order part), RED-30 (request-help part)
- Now: the form asks for country, county, name, phone and email before "What's the problem?". The "Tap what fits" topics come sixth. On phones, "What happens next" renders after the Send button. The error says "at least 10 characters" while the check is 3. Consent reads "I have read and agree to the Privacy Policy".
- Change:
  1. Reorder the fields: "What's the problem?" with its "Tap what fits" options first; then phone; then country and county; then name (optional) and email (optional); then consent and Send. Field ids, names and validation stay the same.
  2. Move the three `sidebar.steps` into one sentence under the H1, before the form, at every width: "We read your message, then call you back and help you get to the right place." (new key, all seven languages). Keep the 112 box in the aside.
  3. Change `errorDescription` to "Write a few words about the problem." (all seven languages), matching the real 3-character check.
  4. Change `descriptionHint` from "Only share the personal details we need." to "You do not need to give your ID number or medical records." (all seven languages). Keep `privacyNote` and set the consent line to "I agree that RediHealth uses my phone number to call me back." followed by the existing Privacy Policy link (legal review before merge).
- Why it is cleaner: the aside loses one block, and the form reads top to bottom as one story: what is wrong, how to reach you, done.
- Why it is easier for low-literacy and older readers: a worried reader starts with the easy part (a tap on "Sick child") and learns before sending that a person will phone them. The error asks for something they can do.
- Keep: required/optional status of every field, consent required, validation rules, submission payload, success screen, the dialer gate on the 112 button, LowLiteracyEmergencyAndHelp tests.
- Verify: at 375px, the first field below the H1 and the "we call you back" line is the problem with its taps. Submit with an empty problem and read the new error. Submit a valid form and confirm the payload is unchanged (network tab).
- Effort: M
- Risk: Medium; the consent wording is a legal text, so the owner or a lawyer must approve it in all seven languages.

**Panel notes**

- *ageing*: Better order for worried readers; legal consent wording in seven languages makes it slow to ship.
- *mobile*: The consent text change needs legal sign-off in seven languages.

---

<a id="p44"></a>

### P44. Make the request form say what was asked for

**Rank 44 of 61. Score 6.10** (clarity 7.0, sleek 5.0, safe 5.8; 5 votes counted).  
**Proposed by:** FLO-P08 (Interaction flow).  
**Chair ruling:** Owns the request-help heading and lead. Lands after P03, when no link sends `mode=doctor` any more.  

- Surface: /get-help
- Files: src/app/get-help/page.tsx, src/components/get-help/GetHelpPageContent.tsx, src/lib/i18n/translations.ts:1379 (the "Ask for help" strings), src/lib/i18n/hero-copy.ts:193
- Resolves: FLO-02, FLO-16, LIT-24, LIT-06
- Now: `/get-help?mode=mediator` (from the hero's "Not sure where to go", "Get help from a person") and `/get-help?mode=doctor` render the same page: "Ask for help", "Can't find a doctor or get an appointment? ... Someone from our team will read your request and contact you." The mode is never read. /mediatori uses a different modal form (RequestMediatorModal), and the assistant uses a third (MediatorRequestModal).
- Change:
  1. In page.tsx, read `searchParams.mode` as the find-help page already reads `category` (app/find-help/page.tsx:21-27), and pass `mode` to GetHelpPageContent.
  2. For `mode=mediator`, show h1 "Ask a health mediator for help" and lead "Tell us briefly what you need. A health mediator will call you." Otherwise keep the current copy. Write it in all seven languages.
  3. After FLO-P01 nothing links `mode=doctor`, so treat any remaining one as the default.
  4. On /mediatori, make "Ask for a mediator" link to `/get-help?mode=mediator` instead of opening RequestMediatorModal, so residents meet one form in one place (the form fields and API stay as RequestHelpForm has them). Leave the assistant's MediatorRequestModal for now; note it for a later pass.
- Why it is cleaner: One mediator request form for residents instead of two, and a page whose heading matches the link that led there.
- Why it is easier for low-literacy and older readers: The page says "health mediator" right after they asked for a person, so they know they arrived. A helper filling the form for someone learns one field order.
- Keep: RequestHelpForm's fields, consent, API call and validation; the "In a medical emergency" card; the "What happens next" list; the "Mediator sign-in" link on /mediatori.
- Verify: Open /en/get-help?mode=mediator and /en/get-help: the headings differ as specified. /en/mediatori "Ask for a mediator" opens /get-help?mode=mediator. Submitting still works against the dev API. Run `LowLiteracyEmergencyAndHelp.test.ts`.
- Effort: M
- Risk: Medium; it removes one entry into RequestMediatorModal, whose fields may differ slightly from RequestHelpForm's (check that the county and phone requirements match before switching).

---

<a id="p45"></a>

### P45. Set one reading measure in rem and give Container real widths

**Rank 45 of 61. Score 6.10** (clarity 5.4, sleek 5.4, safe 8.2; 5 votes counted).  
**Proposed by:** SYS-P13 (Type and layout system).  

- Surface: guides, news articles, static pages, all page leads
- Files: src/app/globals.css (@theme), src/components/ui/Container.tsx:13-17, src/app/about/page.tsx:25, contact/page.tsx:27, privacy/page.tsx:32-35, accessibility/page.tsx:31, terms/page.tsx:26-30, src/components/news/NewsArticleView.tsx, src/components/health-information/HealthArticleShell.tsx, src/app/health-information/topics/[topic]/page.tsx:116, :143, :146, src/components/ui/SectionHeading.tsx:52, and the 57 `max-w-[65ch]`/`max-w-prose` uses
- Resolves: SYS-21, SYS-22
- Now: `65ch` in Atkinson Hyperlegible Next is 674px at 16px, so /en/about runs 93 characters per line, a news article 88, the heart-health lead 84; 11 different `ch` measures; Container `default`, `wide` and `workspace` are all `max-w-none`.
- Change:
  1. Add tokens: `--measure-reading: 36rem` (≈ 66 to 70 characters at 16-18px in this face), `--measure-lead: 34rem`; expose as `max-w-(--measure-reading)` / `max-w-(--measure-lead)`.
  2. Replace every `max-w-[65ch]`, `max-w-prose`, `max-w-[62ch]`, `[60ch]`, `[70ch]`, `[75ch]`, `[56ch]`, `[52ch]` on running text with `max-w-(--measure-reading)`; leads with `max-w-(--measure-lead)`. Short fixed measures for headings (`[28ch]`, `[44ch]`) become `max-w-(--measure-lead)`.
  3. Container: `default: "max-w-[80rem]"`, `narrow: "max-w-[48rem]"`; delete `wide` and `workspace` (map to `default`); keep the same gutters (`px-5 sm:px-6 lg:px-8`).
  4. Text pages (about, contact, privacy, accessibility, terms, news article, guide topic) use one left-aligned reading column on the Container's left edge, same x as PageHeader.
- Why it is cleaner: one measure and two page widths replace eleven measures and three names for "no limit".
- Why it is easier for low-literacy and older readers: 65 to 70 characters per line is easier to track back to the next line, which matters most to slow and second-language readers on the long pages.
- Keep: phone layout (the measure is wider than a phone, so nothing changes at 375); find-help map and the 3D stage use full width on purpose; print styles.
- Verify: at 1440, measure characters per line on /en/about, /en/privacy, a /en/stiri/ article and /en/health-information/heart-health (text length divided by line count): 60 to 75 on every long paragraph; page titles and body share the same left x.
- Effort: M
- Risk: Low; width-only change, no reflow on phones.

**Panel notes**

- *reduction*: Width-only change with no effect on phones; shorter lines help slow readers on desktop.
- *comprehension*: A width-only change with no effect on phones. It helps second-language readers track lines on desktop.

---

<a id="p46"></a>

### P46. Fix Button.tsx, then move every hand-made action button onto it

**Rank 46 of 61. Score 6.08** (clarity 6.2, sleek 7.8, safe 3.8; 5 votes counted).  
**Proposed by:** SYS-P06 (Type and layout system).  
**Chair ruling:** Lands before P08 (Listen control) and P30 (one filled button per screen). Keep the existing variant names.  

- Surface: site-wide buttons
- Files: src/components/ui/Button.tsx:11-38; hand-rolled examples PrescriptionStructuredResult.tsx:541, :647, FindHelpExplorer.tsx:1238, HealthCheckExplorer.tsx:1901, TopicDetailPageContent.tsx:507, :525, TopicNextSteps.tsx:48, TriagePanel.tsx:647, MediatorPublicHero.tsx:135, SmartSearchModal.tsx:868, PatientPortalView.tsx (13 raw buttons), plus the 75 solid-sapphire, 26 ink and 17 red hand-rolled buttons counted in SYS-08
- Resolves: SYS-08, SYS-09, RED-16, AGE-02
- Now: Button.tsx sizes are `sm: "... text-xs sm:text-sm rounded-lg"`, `md: "... text-sm rounded-lg"`, `lg: "... text-sm sm:text-[0.9375rem] rounded-xl"`; only 22 `<Button>` exist against 343 raw `<button>`; the main action is sapphire, ink or foreground depending on the file.
- Change:
  1. Button.tsx: `base` gains `text-body` (16px, 600 via `font-semibold`) and `rounded-(--radius-control)`; sizes become `md: "min-h-11 px-4 gap-2"` and `lg: "min-h-12 px-5 gap-2"`; delete `sm` (map existing `sm` uses to `md`). Remove the `h-10`/`h-11`/`h-12` fixed heights so a scaled label can grow the button instead of being clipped.
  2. Variant rule written into the file's comment and DESIGN.md: `action` (sapphire) is the one next step per screen; `primary` (red) only for 112 and emergency; `outline` for every other button; `ghost` for row-level tools. Retire `secondary` (ink) as a main-action colour: map its uses to `action` if it is the screen's next step, else `outline`.
  3. Replace every hand-rolled solid or outlined action button (link or button) with `<Button>`; keep raw `<button>` only for controls that are not actions: list rows, chips/filters, tabs, toggles, steppers, map controls, close ×.
  4. TopicDetailPageContent: "Open the dictionary" becomes `outline`; TopicNextSteps "Talk to a doctor" becomes `action` (RED-16).
- Why it is cleaner: one radius, one label size, two heights and four variants for every action on the site.
- Why it is easier for low-literacy and older readers: "the blue button is the next step, the red button is 112" becomes true everywhere, so the reader can learn the shape once; labels are 16px instead of 12 to 14px.
- Keep: one-line labels (`whitespace-nowrap`, ZeroTwoLineButtonsAllLocales.test.ts); 44px minimum targets; press feedback (`press-solid`, `press-row`); every onClick/href; UiElevationPass and ClinicalUiElevationPass assertions updated from `rounded-lg` to the token.
- Verify: `rg "bg-sapphire[^-/].*text-white|bg-primary .*text-white" -g '!**/ui/Button.tsx' -g '!**/panel/**'` finds no action buttons; each public page at 375 has at most one sapphire filled button in view; labels compute 16px; one-line label test passes in all seven languages.
- Effort: L
- Risk: Medium; 16px labels may need shorter copy in long languages (hr, ru, rom), which must be done in all seven.

**Panel notes**

- *flow*: A large migration onto Button across many files; needed for RED-P13, but its 16px labels will push some to wrap in long languages.
- *mobile*: Right foundation, but L effort: 16px labels force copy cuts in hr, ru and rom.

---

<a id="p47"></a>

### P47. Make the doctor booking words exact on the step that commits

**Rank 47 of 61. Score 6.05** (clarity 6.6, sleek 3.6, safe 8.0; 5 votes counted).  
**Proposed by:** LIT-P14 (Comprehension).  
**Owner decision needed:** Owner to confirm two facts quoted in the new copy (how the code is used, which specialties are available).  

- Surface: Talk to a doctor: booking calendar, contact step, confirmation, page intro
- Files: src/components/telemed/AppointmentBookingCalendar.tsx:99-130 (en), 22-52 (ru), 60-91 (ro), 251-281 (rom); src/components/telemed/FamilyBookingSelector.tsx:70-90; src/components/telemed/BookingSmsConfirmation.tsx:48-58; src/app/medic-online/page.tsx:75-88; src/lib/i18n/translations.ts:1389 (`getHelpPage.form.phonePlaceholder`)
- Resolves: LIT-25, LIT-26, AGE-19, RED-26
- Now: "Free times, {date}", "A call lasts 20 min", "Pick a free time on the left" (slots stack above it on phones; Romani has the Romanian word "stânga"), and a final button "Book". The confirmation shows a "Booking code" with no purpose stated. The page says "Licensed doctors... internal medicine doctors" and "Calls are encrypted". The phone examples are "0721 000 000" here and "0123 456 789" on /get-help.
- Change:
  1. `availableHours` becomes "Times you can choose, {date}" (all seven languages). `slotDuration` becomes "A call lasts 20 minutes" (no abbreviation).
  2. `summaryTimePending` becomes "Choose a time first" (no direction word) in all seven languages; this also removes "stânga" from rom.
  3. `confirmBooking` becomes "Book the call" (check one line at 320px in all languages).
  4. Add one line under `codeLabel`: "Keep this code. You only need it if you call us." (new key, all seven languages; confirm with the owner that this is true).
  5. medic-online page: `heading` "Real doctors who volunteer", `desc` "Family doctors and children's doctors. They explain clearly what to do.", `privacyDesc` "Only you and the doctor hear the call." (all seven languages, with clinical-owner approval that the specialties summary stays accurate).
  6. Use "0721 000 000" as the phone example on /get-help too.
- Why it is cleaner: shorter, direct strings, and one phone example across the site.
- Why it is easier for low-literacy and older readers: "free times" can no longer be read as "costs nothing", no instruction points at a side of the screen that is not there on a phone, and the last button says what it does.
- Keep: slot logic, SMS text, booking flow and step count, all validation, WorkspaceAndPagesConsistency and LowLiteracyTelemed tests.
- Verify: at 375px in en, ro and rom, walk /medic-online/programare to confirmation; no "left" or "stânga" appears, "Book the call" sits on one line, and the code line shows. Compare the phone placeholders on both forms.
- Effort: S
- Risk: Low; copy only, with two facts (code use, specialties) to confirm with the owner.

**Panel notes**

- *flow*: Exact booking words help, but this is copy only with no visual simplification; two facts need owner confirmation.
- *ageing*: Exact booking words help; copy only, nothing visually removed. Two facts need owner confirmation.
- *mobile*: Copy precision only; no visible simplification.

---

<a id="p48"></a>

### P48. Build one PageHeader and use it on every public page

**Rank 48 of 61. Score 6.03** (clarity 5.4, sleek 8.0, safe 4.8; 5 votes counted).  
**Proposed by:** SYS-P04 (Type and layout system).  
**Chair ruling:** Lands before P08: the Listen control's one place is the PageHeader's actions slot.  

- Surface: every public page header
- Files: new src/components/ui/PageHeader.tsx; src/components/ui/SectionHeading.tsx:36-52; src/lib/cn.ts; src/app/about/page.tsx:17, contact/page.tsx:21, privacy/page.tsx:25, accessibility/page.tsx:23, terms/page.tsx:18; src/components/health-information/HealthInformationPageContent.tsx:140-151; src/components/health-check/HealthCheckExplorer.tsx:2033-2036; src/components/health-assistant/HealthAssistant.tsx:116-119; src/components/health-assistant/PrescriptionReview.tsx:780-783; src/components/find-help/FindHelpExplorer.tsx:719-722; src/components/get-help/GetHelpPageContent.tsx:38-41; src/components/telemed/MedicOnlineHero.tsx:194-195; src/components/news/NewsHub.tsx:217-218; src/components/mediator/MediatorPublicHero.tsx:125-128; src/components/auth/SignInPageContent.tsx:73-76; src/app/medic-online/programare/page.tsx:43-44; src/components/health-information/HealthArticleShell.tsx:109; src/app/error.tsx:59-62; src/app/not-found.tsx:72-75
- Resolves: SYS-02, SYS-03, SYS-04, SYS-20, SYS-23, FLO-28
- Now: seven h1 recipes render at 22, 24, 24.9, 30 and 34px on a phone and 30 to 48px on desktop, at weight 600 or 700; the lead is 16, 18 or 20px with 6 to 20px under the title; About/Contact/Privacy/Accessibility/Terms ask for `text-page` but get `text-section` because `cn()` only joins strings.
- Change:
  1. Create `PageHeader({ title, lead, actions, align = "start" })`: `<h1 className="text-balance text-page text-foreground">`, lead `<p className="mt-3 max-w-(--measure-lead) text-pretty text-lead text-muted-foreground">`, actions `<div className="mt-5 flex flex-wrap gap-3">`, top padding `pt-6 sm:pt-10`, no background band.
  2. Replace every h1 block listed in Files with PageHeader. Get help loses its grey header band (GetHelpPageContent.tsx) so its form starts 20px under the lead, not 102px.
  3. Change SectionHeading so `titleClassName` replaces the size class instead of appending (accept a `size?: "section" | "page"` prop and drop the size from the base string); or have the static pages use PageHeader directly. Do not add tailwind-merge (no new dependency).
  4. Error and 404 pages use `align="start"` like every other page (or keep centred only if the owner insists; one choice, documented in DESIGN.md).
- Why it is cleaner: one title size, one weight, one lead, one gap, one action row on every page.
- Why it is easier for low-literacy and older readers: "title, one sentence, the button" sits in the same place on every screen, so the reader learns it once; a mediator reading aloud always finds the title the same way.
- Keep: page copy and copy keys; `text-balance`; the tool pages' AssistantNavigation sub-tabs (their fate is MOB-05/RED-08); `id="hero-title"` on home, which keeps its own hero and is out of this component.
- Verify: on all pages in Files, at 375 and 1440, h1 computes to the same size and weight (text-page: about 24 to 25px at 375, 36px at 1440, 700), lead is 18px with 12px gap, first action 20px below; /en/about h1 is no longer 22px; update the `text-page` assertions in ChromeConsistency, WorkspaceAndPagesConsistency and HealthInfoConsistency tests to check PageHeader usage.
- Effort: L
- Risk: Medium; touches 18 page headers, each with its own small extras (Listen, A+) that must be moved into `actions` rather than lost.

---

<a id="p49"></a>

### P49. Inputs at 16px with visible labels, and a way to resend codes

**Rank 49 of 61. Score 6.01** (clarity 6.8, sleek 4.0, safe 7.0; 5 votes counted).  
**Proposed by:** AGE-P16 (Ageing and accessibility).  

- Surface: find help search, prescription review, report issue, email sign-in, SMS sign-in
- Files: src/components/find-help/FindHelpExplorer.tsx:771-783, src/components/health-assistant/PrescriptionReview.tsx:1143-1145, src/components/layout/ReportIssueWidget.tsx:318, src/components/auth/SignInForm.tsx:190-240, src/components/portal/SmsPhoneAuthModal.tsx:602-610
- Resolves: AGE-14, AGE-15, AGE-20
- Now: find-help search has an `sr-only` label and relies on placeholder "Name, city or address", dropping to `sm:text-sm`; the prescription note is `text-sm` unless A+ is on; the report form drops to `sm:text-sm`. Email sign-in offers no "send the code again", only "Use a different email". The SMS Verify button is `disabled` until four digits with no text saying why.
- Change:
  1. All inputs and textareas `text-base` at every width (remove `sm:text-sm` and the `largeText ? ... : "text-sm"` branch).
  2. Find help: make the label visible above the field, `text-meta font-semibold`, copy "Search by name, city or address"; placeholder becomes empty or an example ("e.g. Bucharest").
  3. Email sign-in code step: add a text button "Send the code again" beside "Use a different email", calling the existing request-code function with the same email; show the existing "code sent" status line after (keys exist in the SMS copy; add to sign-in copy in all seven languages).
  4. SMS: keep Verify enabled; on submit with fewer than four digits show the existing inline error "Enter the 4 numbers from the SMS" (new key, all languages) via `role="alert"`.
- Why it is cleaner: one input size site-wide, no disabled-and-silent button.
- Why it is easier for low-literacy and older readers: no iOS zoom jump, the field says what it wants after they start typing, and a slow email no longer means starting over.
- Keep: auth endpoints, rate limits ("Too many attempts" copy), code length validation, autocomplete attributes.
- Verify: on iPhone Safari (or 375 emulation), focusing each field does not zoom; find-help label visible while typing; email code step shows "Send the code again" and it re-sends (dev server log); SMS Verify with 2 digits shows the error, not a grey button.
- Effort: S
- Risk: Low. Resend reuses the existing request path; rate limiting already handles abuse.

**Panel notes**

- *flow*: 16px inputs and visible labels are right; the resend button borders on a new feature, though it reuses the existing request path.
- *mobile*: 16px inputs stop iOS zoom. 'Send the code again' reuses the existing request path, so it is not a new feature.
- *reduction*: 16px inputs and visible label are good; 'send code again' is new behaviour on auth, check it against the no-behaviour-change ground rule.
- *comprehension*: The email resend reuses the existing request path. Confirm the owner does not count it as a new feature.

---

<a id="p50"></a>

### P50. Replace clinical labels in health guides with plain ones

**Rank 50 of 61. Score 6.00** (clarity 7.2, sleek 5.2, safe 4.8; 5 votes counted).  
**Proposed by:** LIT-P16 (Comprehension).  
**Owner decision needed:** Clinical sign-off on plain labels that sit on clinical thresholds, in all seven languages.  

- Surface: Health guides index and topic pages (heart health blood-pressure tool)
- Files: src/components/health-information/HealthInformationTopicGrid.tsx:50-77 (`keyFactLabel` in all locales); src/lib/simulators/blood-pressure-types.ts:37-180 (category `label`s), 541 (slider instruction), 601 (symptom checkbox); src/components/health-information/HealthInformationPageContent.tsx (article count line); src/lib/i18n/health-article-translations.ts:17
- Resolves: LIT-27, LIT-28, RED-12 (labels part), RED-13
- Now: every guide card carries "Key clinical fact" (ro "Idee clinică cheie", ru "Главный медицинский факт"). The blood-pressure tool names groups "Optimal / High-normal / Grade 1 / Grade 2 / Emergency" and "Low blood pressure (hypotension)", and puts the 112 symptoms inside a checkbox. The index shows "125 of 488 indexed topics are available as detailed articles. The rest are being prepared."
- Change:
  1. Remove `keyFactLabel` from the cards (the fact sentence stays and reads on its own), in all seven locales together.
  2. Blood-pressure group labels: "Low", "Good", "Normal", "A bit high", "High", "Very high", "Dangerous: call 112". Keep the clinical name in brackets only in Detailed mode. All seven languages.
  3. Above the sliders, add one static line that does not depend on the tool: "If the top number is 180 or more, or you have chest pain, call 112." (new key, all seven languages, clinically checked). Keep the checkbox.
  4. Remove the "125 of 488 indexed topics" line from the public index.
  5. Give articles about German services a title prefix "In Germany:" (from existing metadata), so readers in Romania can skip them.
- Why it is cleaner: one label row per card is gone, along with an internal statistic, and the tool's legend loses its grade codes.
- Why it is easier for low-literacy and older readers: "A bit high" says whether to worry, where "Grade 1" does not. The 112 threshold is a sentence the reader sees without operating two fine sliders.
- Keep: the slider tool and its thresholds (ESC 2024 values unchanged), the source citation, the article directory and its search, HealthArticlesConsistency and HealthInfoConsistency tests.
- Verify: at 375px open /en/health-information: no "Key clinical fact", no "of 488". Open /en/health-information/heart-health in Simple mode: plain group names, and the 112 line visible above the sliders. Repeat in ro and ru. A clinician reviews the new labels against the thresholds.
- Effort: M
- Risk: Medium; the labels sit on clinical thresholds and need clinical sign-off in all seven languages.

**Panel notes**

- *ageing*: Plain BP labels help, but they sit on clinical thresholds in seven languages.

---

## Appendix A: the other versions of clustered proposals

Reproduced because panel notes refer to their steps. Where one of these disagrees with the chosen specification or a chair ruling above, the specification and the ruling win.

### AGE-P09: Open the symptom check in List mode on phones and keep it

- Surface: symptom check at widths below `lg`
- Files: src/components/health-check/HealthCheckExplorer.tsx:952-956, 2049, 2121-2160
- Resolves: AGE-08, FLO-10, FLO-11, MOB-01, MOB-02, RED-19, LIT-12
- Now: `effectiveMobileAreaMode = mobileAreaModeOverride ?? (textScale === "xl" ? "list" : "3d")`. Phones open on the 3D body with a draggable sheet, and the first question sits at the bottom edge. `mobileListOnly` is tied to `stepId === "area"`, so a List choice reverts to the 3D stage at step 2.
- Change:
  1. Default `effectiveMobileAreaMode` to `"list"` below `lg` regardless of text scale; 3D stays one tap away via the existing List/3D toggle, relabelled "List" / "See on a body" (all seven languages).
  2. Persist the choice for the whole flow (drop the `stepId === "area"` condition for the List decision; the stage stays hidden on later steps once List is chosen).
  3. Do not mount the 3D viewport (and do not fetch its models) until the reader picks "See on a body".
  4. In List mode, the question card is a normal block under the H1 (no sheet, no handle).
- Why it is cleaner: the first phone screen becomes heading, one toggle and the question, without about twelve floating controls.
- Why it is easier for low-literacy and older readers: the question is the first thing they see, the screen does not change under them after they choose, and a cheap phone does not download 6MB first.
- Keep: 3D mode and all its functions; desktop layout; anatomy tests; the women's anatomy path.
- Verify: 375 and 768, fresh session: first screen shows "Where do you feel pain or discomfort?" above the fold with no canvas in the DOM; choose List, answer step 1, step 2 still has no stage; choose "See on a body" and the 3D view loads; network panel shows no model fetch until then.
- Effort: M
- Risk: Medium. Changes a default and when the 3D bundle loads; tests may assume 3D first.

### LIT-P04: Open the symptom check on the plain list of body areas

- Surface: Symptom check, phones and tablets
- Files: src/components/health-check/HealthCheckExplorer.tsx:952-955 (`mobileListOnly`, default `?? (textScale === "xl" ? "list" : "3d")`), 2049; health-check-translations.ts:1257-1283 (`viewer3D`)
- Resolves: LIT-12, FLO-10, FLO-11, AGE-08, MOB-01, RED-19
- Now: at 375px the first screen is a WebGL body with a direction pad, zoom, Front/Back and five unlabelled layer icons. The question "Where do you feel pain or discomfort?" sits at the bottom under a sheet handle. Choosing "List" at step 1 reverts to 3D at step 2.
- Change:
  1. Below the `lg` breakpoint, default the view to "list". Keep "3d" as the desktop default.
  2. Rename the toggle option "3D body" to "Body picture" (all seven languages; key in health-check-copy or `viewer3D.subModelInfo`). "List" stays.
  3. Persist the user's List/Body picture choice for the whole flow: carry it into later steps instead of resetting at `stepId === "area"`.
  4. Do not mount the 3D viewer until the user picks "Body picture", so the list renders first.
- Why it is cleaner: the first phone screen is one question and seven named rows instead of about twelve floating controls.
- Why it is easier for low-literacy and older readers: "Head and neck: headaches, jaw or ear pain" is read and tapped in one move; "3D" is a technical word, and "Body picture" says what it is.
- Keep: the 3D body, its layers and controls (one tap away), the desktop default, deep links and QR restore that carry a view.
- Verify: at 375px on /en/health-check, the question and the area list are visible without scrolling and no canvas has mounted (DevTools: no WebGL context). Pick "Body picture", advance, and the choice holds at step 2. Check 1280px is unchanged.
- Effort: S
- Risk: Low; it changes a default and a lazy mount, not the flow.

### FLO-P05: Open the symptom check as a list on phones, and keep that choice

- Surface: Symptom check (/health-check)
- Files: src/components/health-check/HealthCheckExplorer.tsx:952-955, :2040-2060 (List/3D switch)
- Resolves: FLO-10, FLO-11, RED-19, LIT-12, AGE-08, MOB-01, MOB-02, MOB-03
- Now: `effectiveMobileAreaMode = mobileAreaModeOverride ?? (textScale === "xl" ? "list" : "3d")`, so a 375px phone opens on the WebGL body, about twelve controls and a half-height sheet. If the reader taps "List", `mobileListOnly` applies only while `stepId === "area"`, so step 2 brings the 3D body back and the List/3D switch is gone.
- Change:
  1. Default `effectiveMobileAreaMode` to `"list"` below `lg`. Keep "3D body" as the second segment of the existing switch.
  2. Make the choice hold for the whole flow. Use `mobileListOnly = effectiveMobileAreaMode === "list" && stepId !== "result"`, so later steps also render in the list layout without the 3D stage.
  3. Do not mount or download the 3D viewport (AnatomicalViewport3D) until the reader chooses "3D body". It should load on choice, not on page open (MOB-02).
  4. Keep the List/3D switch visible on every step before the result, in the same place, so the reader can change their mind.
- Why it is cleaner: The first phone screen becomes heading, one question and seven labelled rows, instead of a canvas under four floating toolbars.
- Why it is easier for low-literacy and older readers: The question is above the fold in words, nothing switches mode under them, and a cheap phone does not fetch megabytes before the first answer.
- Keep: The 3D body and every control in it; desktop behaviour (3D beside the steps); the `textScale === "xl"` rule is now covered by the default; the permalink and history state (`hcStepId`); the women's anatomy option.
- Verify: At 375x812, open /en/health-check: the first screen shows "Where do you feel pain or discomfort?" and the area list, and the network panel shows no .glb or three.js chunk. Pick List, then an area: step 2 stays in the list. Pick "3D body": the model loads and stays for later steps. Desktop at 1440 is unchanged. Run `health-check-womens-anatomy.test.ts`, `phone-platform.test.ts` and `triage-improvements.test.ts`.
- Effort: M
- Risk: Medium; the explorer is a 3,000-line component with layout branches keyed on the mode.

### RED-P07: Open the symptom check on the list on phones, and keep the choice

- Surface: Symptom check (/health-check) below lg
- Files: src/components/health-check/HealthCheckExplorer.tsx:952-955, :2049, src/components/health-check/AnatomicalViewport3D.tsx, src/components/health-check/AnatomicalBodyMap.tsx
- Resolves: RED-19, FLO-10, FLO-11, MOB-01, MOB-02, MOB-03, MOB-04, AGE-06, AGE-07, AGE-08, LIT-12
- Now: `effectiveMobileAreaMode = mobileAreaModeOverride ?? (textScale === "xl" ? "list" : "3d")` opens a WebGL body (about 6.3MB) with a d-pad, zoom, Front/Back, five icon-only layer buttons and a "Search and options" capsule. The question sits below the fold. A reader who picks List at step 1 sees the 3D body again at step 2 (`mobileListOnly = stepId === "area" && …`).
- Change:
  1. Change the default to `mobileAreaModeOverride ?? "list"` below lg. Keep 3D as the default at lg and up.
  2. Persist the List/3D choice for the whole flow: remove the `stepId === "area"` condition so the chosen mode holds on every step that shows the body.
  3. Load the 3D viewport (`AnatomicalViewport3D`, three.js) only when 3D is chosen, using a dynamic import with no prefetch, so list users never download it.
  4. When 3D is shown on phones, show only Front/Back as labelled buttons. Move rotate, zoom and layers into the existing "Search and options" panel, with a text label on each.
- Why it is cleaner: The first screen on a phone becomes one question plus a list, with no floating toolbars over a canvas.
- Why it is easier for low-literacy and older readers: Words they can read replace a 3D cockpit of unlabelled icons. The screen no longer changes mode behind their back, and a cheap phone does not stall on a large download.
- Keep: The body map, all layers and controls (one tap away), xl-text behaviour, the women's anatomy option, keyboard access, and `anatomy-consistency.test.ts` and `health-check-womens-anatomy.test.ts`.
- Verify: At 375x812 a fresh visit shows the list with the question above the fold. The network tab shows no three.js or model files until "3D body" is tapped. Choose List, then continue to step 2: still List. At 1440 the 3D body still loads by default.
- Effort: M
- Risk: Medium. It changes the default experience of a showcase feature.

### LIT-P02: Point every "talk to a doctor" link at /medic-online

- Surface: Hero triage panel answer views, get-help page
- Files: src/components/landing/hero/TriagePanel.tsx:657-667; src/lib/i18n/hero-copy.ts:131-134 (en) and the `doctorPrompt`/`doctorLink`/`problemDoctorPrompt`/`problemDoctorLink` keys in all locales; src/app/get-help/page.tsx; src/components/get-help/GetHelpPageContent.tsx
- Resolves: LIT-02, FLO-01, FLO-02, FLO-06, FLO-09
- Now: every answer ends with "Want to talk to a doctor? Book a call" (or "No alarm signs? Talk to a doctor online") linking to `/get-help?mode=doctor`. That page is the generic "Ask for help" contact form and ignores `mode`. The home section and the menu send the same promise to /medic-online.
- Change:
  1. In TriagePanel.tsx:660 change the href from `/get-help?mode=doctor` to `/medic-online` (via `localHref`).
  2. Change `doctorLink` in en from "Book a call" to "Talk to a doctor" and translate it in all seven languages. Keep `problemDoctorLink` "Talk to a doctor online".
  3. Leave the `navigate` branch's "Get help from a person" → `/get-help?mode=mediator` as is. On /get-help, read `mode` from `searchParams` only to choose the lead paragraph: for `mode=mediator`, show "A health mediator will read your message and call you." For no mode, keep the current `heroParagraph`. Add this one key to all seven locales. No other behaviour changes.
  4. grep the codebase for `get-help?mode=doctor` and point any remaining "doctor" promises at /medic-online.
- Why it is cleaner: one doctor door, one destination; the contact form stops serving two meanings.
- Why it is easier for low-literacy and older readers: tapping "Talk to a doctor" shows a doctor service (on-call now, or pick a time) instead of county, phone and email fields that look like the wrong place.
- Keep: the get-help form and its submission, the 112 link on the problem view, mediator routing, the panel's equal-height grid.
- Verify: on /en, /ro and /rom at 375px, open each of the six hero answers, tap the doctor link and confirm /medic-online loads. Open /en/get-help?mode=mediator and confirm the mediator lead line. Run Hero.test.ts.
- Effort: S
- Risk: Low; a link target and one optional lead line, no data change.

### RED-P02: Point every "talk to a doctor" link at /medic-online

- Surface: Home triage answer views, header menu, topic pages
- Files: src/components/landing/hero/TriagePanel.tsx:657-668, src/lib/i18n/hero-copy.ts:131-134, src/components/health-information/TopicNextSteps.tsx:46-52
- Resolves: FLO-01, FLO-06, LIT-02
- Now: Every non-emergency answer ends with "Want to talk to a doctor? Book a call", linking to `/get-help?mode=doctor`, which is a generic contact form. The emergency view's "Talk to a doctor online" goes to the same form. The menu and topic pages send the same words to /medic-online.
- Change:
  1. In `TriagePanel.tsx:660`, change `href={localHref("/get-help?mode=doctor", lang)}` to `localHref("/medic-online", lang)`.
  2. In `hero-copy.ts`, make `doctorLink` and `problemDoctorLink` both read "Talk to a doctor" (English). Translate into all seven languages, using the same string the menu uses for /medic-online (see RED-P04).
  3. Grep for other `mode=doctor` links in public UI and repoint them the same way.
- Why it is cleaner: One label, one destination. The duplicate route that looked like a doctor service disappears.
- Why it is easier for low-literacy and older readers: Tapping the same words always opens the same screen, so trust in labels holds.
- Keep: The /get-help page and its `mode` parameter for the mediator path. The 112 action stays first in the problem view.
- Verify: From each hero answer view, the doctor link opens /en/medic-online. `rg "mode=doctor" src/components src/app` returns nothing in public UI.
- Effort: S
- Risk: Low. It changes link targets only.

### RED-P01: Make the hero panel the only home router; remove HelpOptions

- Surface: Home
- Files: src/app/page.tsx:15-17, src/components/landing/HelpOptions.tsx:232-311, src/components/landing/HelpOptionsMediatorBand.tsx:23-52, src/lib/i18n/hero-copy.ts:87, src/components/landing/hero/TriagePanel.tsx:470-520
- Resolves: RED-01, RED-02, MOB-25, FLO-06, FLO-07, FLO-09, FLO-15
- Now: The hero panel asks "How can we help you today?" with six rows plus a mediator link. One screen later, HelpOptions asks "How can we help?" and lists the same places again. It uses a filled `bg-sapphire` lead card with CarePath, three bordered rows with `bg-sapphire-soft` CTA chips ("Read guides", "See doctors", "Open map"), and an amber mediator band. The panel itself has no "Talk to a doctor" row (`HERO_NEED_ORDER = ["learn","risk","nearby","problem","prescription","navigate"]`).
- Change:
  1. In `src/app/page.tsx`, delete the `<StackLayer><HelpOptions /></StackLayer>` block. Leave `HelpOptions.tsx` and `HelpOptionsMediatorBand.tsx` unused, or delete them along with their imports and any test that renders them.
  2. HelpOptions was the home page's only direct door to /medic-online, so keep that function inside the panel. In `HERO_NEED_ORDER`, replace `"learn"` with a new need id `"doctor"`. Its label is "Talk to a doctor" and it links straight to `/medic-online`, with no answer view (render it as a link row, like the mediator link, not a view).
  3. Guides stay reachable through the "Take care of your health" section and its "See all health guides" link right below, and through the menu.
  4. Add the `doctor` label to `hero-copy.ts` in all seven languages. Remove the now-unused `learn` copy only if no other surface reads it.
- Why it is cleaner: The home page asks its one question once, in one visual language, and loses a full screen of stacked cards and one of four mediator doors.
- Why it is easier for low-literacy and older readers: The reader no longer meets "How can we help?" twice with different answers. The outcome they most want, a doctor, becomes one of the six rows they read first.
- Keep: Every destination stays reachable from home (guides via the topics section, mediators via the panel footer link). The `Hero.test.ts` locale-parity rules apply, and so does one-line button labels in all languages.
- Verify: At 375 and 1440, home shows hero, ribbon, topics, quiz, trust, in that order. The panel has six rows including "Talk to a doctor" → /medic-online. Check ro, sq, it, hr, rom, ru row labels fit on one line at 360px. Run `Hero.test.ts` and `HealthTopicsWheel.test.ts`.
- Effort: M
- Risk: Medium. The router's row set changes, and the triage tests may assert the old order.

### AGE-P12: Label clinic card actions with words, number shown as text

- Surface: find help results
- Files: src/components/find-help/FindHelpExplorer.tsx:1150-1230, 1295-1370
- Resolves: AGE-12, AGE-13, AGE-02, MOB-06
- Now: the call link shows a phone icon and the number in a `truncate` span with no "Call" word; Directions turns icon-only (`sr-only` text) when a phone exists; Website is a globe icon; Share is `FamilyShareButton iconOnly`. The pin icon also marks distance two lines above.
- Change:
  1. Show the phone number as plain selectable text in the card body (`text-body tabular-nums`), under the address.
  2. Action row (`flex flex-wrap gap-2`): "Call" (filled primary, phone icon + word) and "Directions" (outline, word visible), each `min-h-11 whitespace-nowrap`; they stay side by side at normal scale and stack at large scales (AGE-P02).
  3. Second row: "Website" and "Share" as plain text links (`text-body underline min-h-11`), no icons.
  4. Remove the pin icon from Directions so it no longer collides with the distance line.
- Why it is cleaner: three unexplained glyph squares become two buttons and two text links, and the icon reuse goes.
- Why it is easier for low-literacy and older readers: they read "Call" and "Directions" without guessing, and the number is there to read out to a relative or dial on a landline.
- Keep: all four actions, `tel:` and directions URLs, stopPropagation on the card, share behaviour.
- Verify: 375 at normal and XL scale: number fully visible; all four actions have visible words; targets ≥44px; FindHelpFilterAndLocation.test.ts passes.
- Effort: S
- Risk: Low. Cards get one line taller.

### AGE-P08: Use one labelled "Listen" button, in one place, on every page

- Surface: home triage panel, guides, doctor online, get help, find help, symptom check, prescription review
- Files: src/components/landing/hero/TriagePanel.tsx:286-317, src/components/health-information/ArticleListenButton.tsx, src/components/health-information/InlineAudioNarratorButton.tsx, src/components/telemed/MedicOnlineHero.tsx, src/components/find-help/FindHelpExplorer.tsx:727-760, src/components/get-help/GetHelpPageContent.tsx
- Resolves: SYS-10, FLO-18, LIT-01, AGE-25, LIT-30
- Now: read-aloud has at least five looks: a bare 19px speaker in the triage header (`aria-label` only), a filled ink "Listen to guide" on guides, a tinted outline on doctor online, a white outline on get help, and an icon-only speaker beside "Enter the waiting room".
- Change:
  1. Make ArticleListenButton the single component: outline style (`border border-border-control bg-card text-foreground`), `min-h-11`, speaker icon + word, `text-body font-semibold whitespace-nowrap`. Label "Listen", while playing "Stop" (one key pair, all seven languages; fixes the Romani variants in LIT-30).
  2. Position: directly under the page H1 and lead, left-aligned, the first control on the page. One per page; remove the extra icon-only speaker beside "Enter the waiting room" and per-section listen buttons beyond the first unless the section is read separately (RED-17 decides which).
  3. Triage panel header: replace the icon-only speaker with this component at compact width (word visible).
  4. It is never the filled primary button; the page's main action keeps that.
- Why it is cleaner: one look and one place replace five styles and several duplicates.
- Why it is easier for low-literacy and older readers: the feature they rely on most is learned once and found in the same spot on every screen, by its word, not by a symbol.
- Keep: voice manifest behaviour, languages without read-aloud (sq, rom per readingTools.ts) show no button; speech engines unchanged.
- Verify: at 375 on each listed page, one "Listen" button under the H1, same computed style; tap starts and the label becomes "Stop"; in sq it is absent; HealthInfoConsistency and LowLiteracy tests pass.
- Effort: M
- Risk: Low. Presentation only; engines untouched.

### LIT-P09: Put the word "Listen" on every read-aloud button, in one wording per language

- Surface: Hero triage panel, symptom check, prescription review, request help, booking, waiting room, guides
- Files: src/components/landing/hero/TriagePanel.tsx:284-317; src/components/health-check/HealthCheckExplorer.tsx:2239-2257; src/components/get-help/RequestHelpForm.tsx:95-104 (`LISTEN_COPY`); src/components/telemed/AppointmentBookingCalendar.tsx:23-26, 254-255; OnCallQueueLauncher.tsx (listen/stop); src/lib/i18n/hero-copy.ts (`panel.listen`, `panel.stopListening`, all locales); src/components/health-assistant/PrescriptionReview.tsx (`listenPage`)
- Resolves: LIT-01, LIT-30, FLO-18, SYS-10, AGE-25, RED-25
- Now: the hero panel's read-aloud is a 19px speaker with no word until it is playing. The symptom check shows only the icon below `sm`. Romani says "Gin glasosa" on the hero, "Ashun/Achav" on the request form and "Shun/Ushtav" on booking. English mixes "Read aloud", "Listen" and "Listen to guide".
- Change:
  1. Create one shared copy record (for example `src/lib/i18n/listen-copy.ts`) with `listen` and `stop` for all seven languages. English "Listen" / "Stop". Romani: pick one pair with a native reviewer, for example "Ashun" / "Achav". Use it in every component listed above in place of local copies. Guides may keep "Listen to guide" as a longer variant built from the same verb.
  2. In TriagePanel, always render the label span (remove the `speaking &&` condition at :312). The button shows speaker icon + "Listen", or mute icon + "Stop". Keep `h-11`, `whitespace-nowrap`.
  3. In HealthCheckExplorer, change the label span from `sr-only sm:not-sr-only` to always visible. If space at 375px is short, drop the visible "A+" button from this row (the global text-size control covers it; see LIT-P10).
  4. Do not change the earcons, the speech engine or voice availability (Albanian stays without voice).
- Why it is cleaner: one look and one word for one function across the site, instead of four local variants.
- Why it is easier for low-literacy and older readers: the reader who most needs audio can find it by its word on every screen; a small grey speaker at the edge of a header bar is a symbol they must guess.
- Keep: `aria-pressed`, the fallback-voice tooltip, `isVoiceEnabled`, button labels on one line in all languages at 320px (check ro "Ascultă", ru "Слушать", rom).
- Verify: at 320px and 375px in en, ro, ru and rom, the hero panel header, the symptom check toolbar, /get-help and /medic-online/programare each show the word "Listen" (or its translation) next to the icon, on one line. grep shows no remaining local listen/stop dictionaries.
- Effort: M
- Risk: Low; copy and visibility, with a width check in long languages.

### FLO-P16: Make "Listen" one control in one place, and retire page-level A+

- Surface: All tool and reading pages
- Files: src/components/health-check/HealthCheckExplorer.tsx:2240-2273, src/components/find-help/FindHelpExplorer.tsx:727-760, src/components/health-assistant/PrescriptionReview.tsx:794-820, src/components/get-help/GetHelpPageContent.tsx, src/components/telemed/MedicOnlineHero.tsx, src/components/telemed/OnCallQueueLauncher.tsx:260-270, src/components/health-information/ArticleListenButton (call sites), src/components/landing/hero/TriagePanel.tsx:284-319, src/components/layout/ComfortMenu.tsx
- Resolves: FLO-17, FLO-18, RED-25, SYS-10, AGE-25, MOB-26, LIT-01, LIT-30
- Now: Read-aloud appears as an icon-only speaker (hero panel), a filled ink "Listen to guide" (guides), a tinted "Listen to guide" (doctor online), an outlined "Listen" (request form, waiting room), and an icon beside "A+" (symptom check). Three tool pages add a page-level "A+ Larger text" beside the header's "Aa" comfort menu.
- Change:
  1. Make one `ListenButton` from the outlined variant already used on /get-help: `min-h-11 whitespace-nowrap rounded-(--radius-control) border border-border-control bg-card px-3.5 font-semibold`, a VolumeIcon plus the label "Listen" (playing state "Stop"), `aria-pressed`. Use the existing Romani strings consistently (LIT-30).
  2. Place it in one position on every page: directly under the h1 and lead, left-aligned. In the hero panel, keep it in the panel header but show the word "Listen" next to the icon at every width (LIT-01).
  3. Replace every other read-aloud trigger with it. The guides' long-form player (GlobalHealthAudioPlayer) still opens from this button.
  4. Remove the page-level "A+" toggles in HealthCheckExplorer, FindHelpExplorer and PrescriptionReview. Text size lives only in the header's comfort menu.
- Why it is cleaner: One look, one place, one word, and three duplicate size toggles gone from the first screen of three tools.
- Why it is easier for low-literacy and older readers: The feature they depend on most is learned once and found in the same spot on every page. Text size is set once and holds everywhere, instead of being a per-page puzzle.
- Keep: Every page that reads aloud still does, with the same scripts; the no-voice rule for Albanian (`isVoiceEnabled`); the comfort menu's text-scale values (normal, large, xl) and the `data-text-scale` attribute; the audio player's controls.
- Verify: Visit /en/health-check, /en/find-help, /en/prescription-review, /en/get-help, /en/medic-online and a guide at 375 and 1440: the same "Listen" control sits under the h1, and there is no "A+" on the page. Switch to sq: no Listen anywhere. Change text size in "Aa", and the tool pages follow it. Run `CareToolsConsistency.test.ts` and `ComfortAndAssistant.test.ts`.
- Effort: L
- Risk: Medium; five components own their own speech hooks, so the shared button must accept each page's script without changing what is read.

### RED-P06: Use one Listen control per page, the same component everywhere

- Surface: Guides index, topic pages, find help, get help, prescription review, doctor online, symptom check, quiz
- Files: src/components/health-information/ArticleListenButton.tsx, InlineAudioNarratorButton.tsx (used in WhyItMattersInfographic.tsx, ActionableStepsChecklist.tsx, TopicMythCard.tsx, WarningSignsEmergencyCard.tsx), src/components/find-help/FindHelpExplorer.tsx:727-741, src/components/telemed/MedicOnlineHero.tsx:205-221, src/components/get-help/RequestHelpForm.tsx:310-318, src/components/landing/hero/TriagePanel.tsx:282-319, src/components/landing/TrueFalseQuizSection.tsx:380-386
- Resolves: RED-17, SYS-10, FLO-18, LIT-01, LIT-30, AGE-25
- Now: A topic page has five speaker buttons (the hero "Listen to guide" plus four section narrators). Across the site, "Listen" has four looks: a filled ink button, a tinted outline, a white outline, and a bare icon in the triage panel. The labels also change ("Listen", "Listen to guide", icon only).
- Change:
  1. Make `ArticleListenButton` the only page-level Listen. Give it one look: an outlined button (`border-border-control bg-card`), `min-h-11`, speaker icon plus the word "Listen" / "Stop", `whitespace-nowrap`, never filled. Place it directly under the page lead paragraph on every page that offers read-aloud.
  2. Replace the inline speech buttons on find help, get help, doctor online and the triage panel header with it. In the triage panel, show the word "Listen" beside the icon at all widths.
  3. On topic pages, remove the `InlineAudioNarratorButton` from WhyItMatters, ActionableSteps and TopicMyth. The page Listen reads the whole guide. Keep the WarningSigns narrator only if the owner wants a direct "listen to danger signs" control, and then give it the same look.
  4. Use one translation key for "Listen" and one for "Stop" in all seven languages, including the Romani pair (LIT-30).
- Why it is cleaner: Up to five speaker icons per page become one, with one look site-wide.
- Why it is easier for low-literacy and older readers: Read-aloud, the feature they depend on most, is always the same word in the same place, so it is found once and recognised forever.
- Keep: Speech engines, recorded clips, the no-voice languages (sq, rom) hiding the control, and stop-on-navigation behaviour.
- Verify: On /en topic, find-help, get-help, medic-online, prescription-review and home at 375, there is exactly one Listen button per page, all identical in screenshots. In sq it is hidden where no voice exists. Run `LowLiteracyTelemed.test.ts` and any audio tests.
- Effort: M
- Risk: Medium. Section-level listening goes away, but the whole-page reader covers it.

### AGE-P14: Keep the feedback invite off task pages and readable

- Surface: feedback invite card (all pages)
- Files: src/components/layout/FeedbackWidget.tsx:33, 232-235, 438, 650-700
- Resolves: AGE-22, FLO-05, MOB-09, RED-09, RED-10
- Now: after 150 seconds of activity a `fixed inset-x-3 bottom-...` card rises with five score buttons, `text-xs` body and `text-[11px]` hint and scale ends. It is suppressed only on /health-check and /prescription-review (and only below 1024px), so it covers the assistant's alarm question, the find-help map and guides with the audio player.
- Change:
  1. Extend `isClinicalTaskSurface` to /health-assistant, /get-help, /find-help, /medic-online (all subpaths), /sign-in, and any guide page while the audio player is open; apply at all widths, not only below 1024px.
  2. Never show the card while another fixed bottom element is visible (List/Map bar, audio player), checked at evaluate time.
  3. Text: title `text-body font-semibold`, body `text-body`, hint and scale ends `text-meta`; remove the inner bordered box (RED-10) so the score row sits directly in the card.
- Why it is cleaner: fewer pop-overs on top of tasks, and one box instead of a box in a box.
- Why it is easier for low-literacy and older readers: nothing slides over the screen while they are reading an alarm list, a map or a guide, so they do not mistake a survey for a required step.
- Keep: the survey itself, its timing on other pages, snooze, the footer and menu feedback entries.
- Verify: with the timer shortened in a dev build: invite never appears on the listed paths at 375 or desktop; appears on home/news; its text ≥14px.
- Effort: S
- Risk: Low. Path list and styling only.

### MOB-P07: Never float the feedback invitation over a task on phones

- Surface: Feedback widget, all public pages
- Files: src/components/layout/FeedbackWidget.tsx:33, src/components/layout/FeedbackWidget.tsx:232-235, src/components/layout/FeedbackWidget.tsx:434-451, src/components/layout/FeedbackWidget.tsx:650-700, src/components/layout/Footer.tsx
- Resolves: MOB-09, RED-09, RED-10, AGE-22, FLO-05
- Now: after 150s of active time, a `fixed inset-x-3 bottom-[…] z-30` card (about 290px, a 1 to 5 score row, "Maybe later", "Leave feedback") rises on any page except /health-check and /prescription-review. I saw it over the find-help map and its List/Map bar. FLO-05 saw it over the assistant's emergency question.
- Change:
  1. Below 1024px, never render the floating invite card (`:650`). Show the same invitation inline instead: one row at the end of `<main>`, just above the Footer, as plain text "Was this page useful?" with one outlined button "Tell us" (new keys `inlinePrompt` and `inlineButton`, all seven languages) that opens the existing feedback modal. Count it as shown only when it enters the viewport.
  2. On every width, add to the excluded paths every task surface: `/health-assistant`, `/find-help`, `/get-help`, `/medic-online` and its subpaths, and any page while the guide audio player is open (read the player's open state from its existing store or event).
  3. Keep the desktop side tab (`:605`, already `max-lg:hidden`).
- Why it is cleaner: no layer ever appears above the content on a phone, and the invitation becomes one quiet line in a place where the page has ended anyway.
- Why it is easier for low-literacy and older readers: the map, the alarm question or the clinic list never vanishes under a survey. An older reader is not left thinking the page broke.
- Keep: the feedback modal, its questions, its timing and snooze logic on desktop, analytics events, the menu's "Feedback" link, and FeedbackWidget tests (update the ones that assert the mobile card).
- Verify: at 375px set the active-time counter past 150s (via localStorage or a shortened constant locally) and visit /find-help, /health-assistant and a guide. No floating card appears, and the inline row sits above the footer. At 1280px on /about, the card still appears after 150s.
- Effort: M
- Risk: Low, because the invitation keeps its function and only its placement on phones changes.

### RED-P11: Move feedback and report into the footer and menu; keep surveys off tasks

- Surface: Every public page
- Files: src/components/layout/FeedbackWidget.tsx:233, :605-635, :650-720, src/components/layout/ReportIssueWidget.tsx:329-340, src/components/layout/Header.tsx:788-850, src/components/layout/Footer.tsx
- Resolves: RED-09, RED-10, FLO-05, MOB-09, AGE-22, SYS-25
- Now: Desktop has a vertical "Feedback" side tab (`fixed right-0 top-[35%]`, rotated text) and an icon-only report square (`fixed bottom-3 right-3`). Phones get an invite card after 2.5 minutes (`fixed inset-x-3 bottom-…`, sapphire top bar, inner `rounded-xl border bg-surface-subtle/80` box, `text-[11px]` labels). `isClinicalTaskSurface` excludes only /health-check and /prescription-review, so the survey has risen over the assistant's emergency question.
- Change:
  1. Remove the side tab (`:605-635`) and the floating report square (`ReportIssueWidget.tsx:329`). Keep both dialogs, opened from the existing footer and phone-menu links ("Feedback", "Report a problem").
  2. Extend the exclusion to `/health-assistant`, `/get-help`, `/find-help`, `/medic-online` (including `/asteptare` and `/programare`) and topic pages. The invite only appears on home, the guides index, news and static pages.
  3. Flatten the invite card: remove the `h-1 bg-sapphire` bar and the inner bordered box, and set the hint and scale labels in `text-body` (16px).
- Why it is cleaner: Two permanently floating objects disappear, and the remaining invite is one plain surface.
- Why it is easier for low-literacy and older readers: Nothing slides over the task they are doing, there is no rotated text to read, and the survey labels are readable.
- Keep: Feedback and report dialogs, their steps, drafts and submission, the 2.5-minute timing on allowed pages, and snooze. reCAPTCHA notice.
- Verify: At 1440 no fixed element sits on the right or bottom edge. At 375, after 2.5 minutes on /en/health-assistant no card appears, but on /en it does. The footer and menu links open both dialogs.
- Effort: M
- Risk: Low. The functions stay and only the entry points change.

### SYS-P03: Give the facts people act on body size and full ink

- Surface: prescription result, symptom cards, clinic results
- Files: src/components/health-assistant/PrescriptionStructuredResult.tsx:625-632, :692, :708-737, src/components/health-check/HealthCheckExplorer.tsx:2626, :2923, src/components/find-help/FindHelpExplorer.tsx:887, :1160-1171, :1354-1362
- Resolves: LIT-22, AGE-10, AGE-13, SYS-06, SYS-24
- Now: "Before food", "Duration: 7 days" and the unclear-dose warning are `text-xs ... text-muted-foreground` under a large coloured dose grid (LIT-22); "Urgent" on a symptom is `mt-0.5 block text-xs font-semibold text-primary`; "Open now" / "Closed now" are `text-xs` beside a decorative `ClockIcon ... text-live-sage`.
- Change:
  1. PrescriptionStructuredResult: render food timing, duration and the unclear-dose line as `text-body text-foreground` rows in the same list as the dose grid; the unclear-dose line starts with the plain word from the existing copy key and is `font-semibold`; the strength beside the name (:625-632) moves under the name as `text-body text-muted-foreground` so it cannot be read as the dose.
  2. HealthCheckExplorer: "Urgent" (:2626, :2923) → `text-body font-semibold text-primary`, on its own line above the symptom name, no badge styling.
  3. FindHelpExplorer: "Open now"/"Closed now" → `text-body`, "Open now" `font-semibold text-foreground`, "Closed now" `text-muted-foreground`; delete the ClockIcon (CLAUDE.md rule 2); category, "80 places" and "Suggested for your region" → `text-meta` only if they are counts, the category word → `text-body`.
- Why it is cleaner: fewer sizes and greys on the three busiest result cards; one decorative icon fewer per clinic.
- Why it is easier for low-literacy and older readers: the words that decide whether you take a pill correctly, go to a doctor now, or walk to a pharmacy become as large as the text around them instead of the smallest.
- Keep: the fridge print sheet layout; red only on genuine urgency; no copy meaning changes; FindHelpFilterAndLocation.test.ts.
- Verify: at 375, with a sample prescription (or the existing test fixture), food timing, duration and unclear dose compute to 16px in `--color-foreground`; a red-flag symptom card shows "Urgent" at 16px; a clinic row shows "Open now" at 16px with no icon; all seven languages.
- Effort: M
- Risk: Low; visual-only change on three components, data untouched.

### AGE-P11: Say "Question 1 of 7" everywhere and stop promising "3"

- Surface: symptom check, home triage copy, assistant
- Files: src/components/health-check/HealthCheckExplorer.tsx:2209-2211, health-check-translations.ts:1220, src/lib/i18n/hero-copy.ts:156
- Resolves: AGE-09, LIT-10, FLO-04, RED-20
- Now: the intro says "answer 3 questions"; phones show only `{displayStep}/{totalSteps}` ("1/7"), with the full sentence `sr-only sm:not-sr-only`.
- Change:
  1. Show the full `stepIndicatorText` ("Question 1 of 7") at all widths, `text-meta font-medium`; delete the bare fraction span.
  2. Change the intro copy to "Show where it hurts and answer a few short questions." in all seven languages (no number), and the hero line likewise.
  3. Ensure `totalSteps` is fixed at flow start and never changes mid-flow (FLO-04 lists the places).
- Why it is cleaner: one progress statement instead of a fraction plus a hidden sentence plus a contradicting promise.
- Why it is easier for low-literacy and older readers: a sentence reads aloud correctly and a fraction does not, and the promise matches what happens, so trust is not lost on screen one.
- Keep: progress bar; step logic.
- Verify: 375 and desktop: the step line reads "Question 1 of 7" (ro "Întrebarea 1 din 7" and so on); intro has no number in any language; total constant through the flow.
- Effort: S
- Risk: Low. Copy and one span.

### LIT-P03: Make step progress count the same stages, in words, at every width

- Surface: Symptom check, health assistant, home hero copy
- Files: src/components/health-check/HealthCheckExplorer.tsx:1012-1023, 1616, 2209-2211, 2277-2296; src/lib/i18n/health-check-translations.ts:1220 (`ui.subtitle`), 1225 (`stepIndicator`), the same keys in all locales; src/lib/i18n/hero-copy.ts:154-156 (risk hint and body, all locales); src/components/health-assistant/TriageStateMachine.tsx:377-401; assistant-copy.ts:561 (`stepOf`)
- Resolves: LIT-10, AGE-09, FLO-04, RED-20
- Now: the intro says "answer 3 questions". The phone counter shows a bare "1/7", with "Step 1 of 7" only for screen readers (`sr-only sm:not-sr-only`). The total changes when the optional "spot" and "extras" steps appear. The assistant goes from "Step 1 of 3" to "2 / 4".
- Change:
  1. Symptom check: count stages, not screens. Use four fixed stages, the same on phone and desktop: "Where it hurts" (area and spot), "What you feel" (symptom and extras), "How bad and how long" (severity and duration), "What to do". Map each `StepId` to its stage index. `totalSteps` becomes the constant 4, so the segmented bar has four segments.
  2. Show the counter as words at every width. Remove the `sm:hidden` "1/7" span and the `sr-only sm:not-sr-only` wrapper, and render `stepIndicator` ("Step {current} of {total}") visibly at `text-sm`.
  3. Replace "answer 3 questions" with "answer a few short questions" in `ui.subtitle` and in hero-copy `risk.hint` ("Show where it hurts and answer a few questions") and `risk.body`, in all seven languages.
  4. Assistant: give `stepOf` a total that is fixed once a pathway is chosen (the pathway's real length), and show the same "Step X of Y" words on phones in place of the `sm:hidden` "{displayStep} / {totalSteps}" span.
- Why it is cleaner: one counter in one format, three stages fewer, and no number that changes.
- Why it is easier for low-literacy and older readers: "Step 2 of 4" never contradicts the intro and never grows mid-way, so the reader always knows how much is left. A word counter is easier to read than a slash fraction.
- Keep: the optional spot and extras screens and their auto-advance, the back button, the answer trail, `aria-valuetext` on the progressbar, triage-improvements and phone-platform tests (update any that assert 7 steps).
- Verify: at 375px, run the flow with an area that has spots and a symptom with extras, then with one that has neither; the counter must read 1, 2, 3, 4 of 4 in both runs. Check at 1280px. Check en, ro and ru copy no longer says 3.
- Effort: M
- Risk: Medium; the step-to-stage mapping touches navigation logic, and tests that count steps need updating.

### RED-P08: Give the symptom check one step counter and honest length copy

- Surface: Symptom check step header and answer rows
- Files: src/components/health-check/HealthCheckExplorer.tsx:151-168 (KeyBadge), :2195-2211, :2276-2290, src/lib/i18n/health-check-translations.ts:1220, src/lib/i18n/hero-copy.ts:156
- Resolves: RED-20, RED-21, FLO-04, LIT-10, LIT-13, AGE-09
- Now: The step position is said three times: a phone-only "1/7", "Step 1 of 7", and a seven-segment bar. The subtitle promises "answer 3 questions". Desktop rows carry `KeyBadge` letter chips (`h-6 w-6 rounded-md border … text-xs`), and Back carries a `kbd` "⌫" chip. The helper "Tap the area on the body or pick it from the list" repeats the subtitle.
- Change:
  1. Delete the `sm:hidden` "{displayStep}/{totalSteps}" span (`:2210`) and make "Step 1 of 7" visible at all widths. Keep the segmented bar.
  2. Change the subtitle and hero copy from "answer 3 questions" to "a few short questions" (English), translated into all seven languages, so the copy can never disagree with the counter.
  3. On step screens after the first, hide the page subtitle. The step helper carries the instruction.
  4. Remove `KeyBadge` rendering from answer rows and the `kbd` on Back. Keep the keyboard shortcuts and their `aria-keyshortcuts`.
- Why it is cleaner: One counter instead of three, and no chips on every row.
- Why it is easier for low-literacy and older readers: The promised length matches what they see, and there are no letters or glyphs next to answers to puzzle over.
- Keep: Keyboard shortcuts working, the progress bar's `role="progressbar"` values, the step totals logic, and `triage-improvements.test.ts` (update copy expectations).
- Verify: At 375 and 1440, each step shows exactly one textual counter plus the bar. No chip appears on rows. Pressing A/B/C and Backspace still works on desktop. Copy matches in all seven languages.
- Effort: S
- Risk: Low. It touches presentation and copy only.

### AGE-P13: Shrink the phone audio player to one labelled bar

- Surface: health guides with audio
- Files: src/components/health-information/GlobalHealthAudioPlayer.tsx:467-520, 521-795, src/components/health-information/SynchronizedSentenceReader.tsx:266-269
- Resolves: AGE-16, AGE-17, MOB-10
- Now: the expanded player is `fixed bottom-4 inset-x-4` and measures 289px at 375x812 (36% of the screen); main has no bottom padding, so the article end hides under it. Labels are `text-xs`/`text-[11px]`, prev/next sentence are icon-only, minimise "−" sits next to close "×", speed reads "0.85x | 1.0x" with the words `hidden sm:inline`. Every sentence calls `scrollIntoView({ block: "center" })`.
- Change:
  1. Below 640px, the default player state is one bar (`min-h-16`): "Pause"/"Play" (word + icon, primary), "Slower"/"Normal speed" as one toggle button with the word, and "Close" (word). The full panel (scrubber, sentence steps, chapter) opens from a "More" button. Remove the separate "−" minimise button on phones; the bar is the minimised state.
  2. Speed buttons show the words at all widths ("Slower", "Normal"); drop "0.85x"/"1.0x" from visible text (keep in `title`).
  3. Text in the player `text-body` / `text-meta`, none below 14px.
  4. While the player is open, add bottom padding to `main` equal to the player height (CSS variable set from the player's measured height).
  5. Change sentence follow to `block: "nearest"` so the page moves only when the spoken sentence leaves the visible area.
- Why it is cleaner: a 289px panel becomes a 64px bar, and the coded speeds and duplicate close become words.
- Why it is easier for low-literacy and older readers: they can see the text being read, the page stops jumping on every sentence, and every control says what it does.
- Keep: scrubber, sentence stepping, speed values, chapter ticks, keyboard slider support, minimise on desktop.
- Verify: 375x812: bar ≤72px; the last paragraph of a guide can be scrolled clear of the player; during playback the page scrolls only when the sentence would go out of view; all controls have visible words ≥14px.
- Effort: M
- Risk: Medium. The player has two states to rework, and the follow-scroll change needs a listen-through test.

### LIT-P07: Give the assistant's first screen one symptom entry, not two

- Surface: Health assistant step 1
- Files: src/components/health-assistant/TriageDecisionTree.tsx:71-103; src/components/health-assistant/assistant-copy.ts:569-570 (`tree.bodyMapPrompt`, `tree.bodyMapLink`) in all locales
- Resolves: LIT-16, FLO-03, RED-22
- Now: the primary card "I don't feel well right now / Start check" sits directly above a second row, "Want to point to the exact area on the 3D body? Open 3D body map", which leaves for a different flow at /health-check. The assistant's own mild path offers "Check on 3D body" again later.
- Change:
  1. Remove the `bodyMapPrompt`/`bodyMapLink` footer row (TriageDecisionTree.tsx:93-103) from step 1. The card becomes a single button.
  2. Keep the body-map route in two places only: the "Symptom check" tab in AssistantNavigation, and the mild path's existing `symptoms.bodyMapHint`/`bodyMapCta`. Reword that CTA to "Show where it hurts on a body picture" (all seven languages; matches LIT-P04's "Body picture").
  3. Delete or keep unused the `tree.bodyMapPrompt`/`bodyMapLink` keys in every locale together, so the type stays complete.
- Why it is cleaner: the primary card loses its sub-row and border, and the first screen has five choices instead of five plus a competing link.
- Why it is easier for low-literacy and older readers: the reader no longer has to choose between "Start check" and "Open 3D body map" without knowing that these are two different tools.
- Keep: the /health-check route and tab, the mild path's body-map hint, the emergency gate, CareToolsConsistency and LowLiteracyTriageAndSearch tests (update any that assert `bodyMapLink`).
- Verify: on /en/health-assistant at 375px and 1280px, step 1 shows one primary card with one button. Choose a mild category and confirm the body-picture link appears there and opens /health-check.
- Effort: S
- Risk: Low; removes a duplicate entry point, and the destination stays reachable.

### RED-P05: Remove page-level "A+" and local Easy/Detailed switches; keep the Comfort menu

- Surface: Symptom check, find help, prescription review, health assistant, guides index and topic pages
- Files: src/components/health-check/HealthCheckExplorer.tsx:2257-2273, src/components/find-help/FindHelpExplorer.tsx:744-760, src/components/health-assistant/PrescriptionReview.tsx:794-820, src/components/health-assistant/TriagePlainLanguageToggle.tsx (used in TriageStateMachine.tsx), src/components/health-information/ReadingLevelSwitcher.tsx (used in HealthInformationTopicGrid.tsx:299-302, TopicHeroSection.tsx, SubjectHeaderToolbar.tsx), src/components/layout/ComfortMenu.tsx:167-168
- Resolves: RED-25, RED-12, FLO-17, AGE-25, MOB-26, LIT-17
- Now: Three pages show a bordered "A+" square next to the H1. Its hook `useLargeText` (`readingTools.ts:12`) already writes the same `useTextScale` value that the header "Aa" menu writes, so it is a pure duplicate. Easy/Detailed appears on the assistant, the guides index and every topic page, while `ComfortMenu` already holds `readingLevel`.
- Change:
  1. Delete the A+ buttons at the three locations listed. Delete `useLargeText` if it has no other caller.
  2. Remove `TriagePlainLanguageToggle` and `ReadingLevelSwitcher` from the page headers and the guides toolbar. Both surfaces keep reading the shared `useReadingLevel()` value from `comfort-preferences`.
  3. In the Comfort menu, make sure the reading-level option is visible without scrolling and uses the words "Easy" and "Detailed" (the same words the pages used), translated into all seven languages.
  4. Where a page's level matters most (topic pages), keep one plain text line under the H1: "Easier or more detail? Change it in Aa" (translate into all seven), as a button that opens the Comfort menu. This is the only new copy.
- Why it is cleaner: Three to four extra controls per first screen go away, and there is one place for text size and reading level.
- Why it is easier for low-literacy and older readers: Two text-size buttons that disagree in look ("Aa" against "A+") stop raising the question of whether they do the same thing. Choosing "Easy" once applies everywhere.
- Keep: The text-scale and reading-level functions and their persistence, `ComfortAndAssistant.test.ts`, `CareToolsConsistency.test.ts` (update expectations), and the xl-text → list default in symptom check.
- Verify: Set Easy in the Comfort menu, then visit the assistant, guides index and topic page; all show the simple text. Set large text in Aa; symptom check, find help and prescription grow. No "A+" remains anywhere (`rg '"A\+"|>A\+<' src/components`).
- Effort: M
- Risk: Medium. It removes a visible control that some returning users may look for, and the Comfort menu must make up for it.

### RED-P04: Give each destination one name, used everywhere

- Surface: Header nav, phone menu, footer, page H1s, assistant sub-tabs, hero rows, not-found
- Files: src/lib/i18n/translations.ts:1152-1159, :1265, :1281, :1327-1330, :1379, :1460, src/lib/i18n/hero-copy.ts (needs labels), src/lib/i18n/find-help-links.ts, src/lib/i18n/page-metadata.ts, src/app/not-found.tsx:18
- Resolves: RED-07, LIT-06, LIT-07, FLO-06
- Now: The map is "Pharmacies and clinics", "Find medical help", "Find a clinic or hospital", "Find help" and "Find a pharmacy or doctor nearby". The form is "Get help", "Ask for help" and "Request help". The assistant is "Ask for guidance", "Assistant" and "Health assistant", and ro "Asistent medical" means a nurse. Guides are "Learn" in the nav and "Health guides" on the page.
- Change:
  1. Fix one English name per route: /health-information "Health guides"; /health-assistant "Help me choose"; /health-check "Symptom check"; /find-help "Pharmacies and clinics"; /get-help "Ask a person for help"; /medic-online "Talk to a doctor"; /stiri "Health news"; /mediatori "Health mediators".
  2. Use that exact string for the nav label, the phone menu row, the footer link, the assistant sub-tab and the page H1. The H1 may add words after it but must start with it. The hero row may stay a sentence ("Find a pharmacy or doctor nearby"), but its destination's H1 must then contain the key noun.
  3. Translate into all seven languages. In ro, do not use "Asistent medical" for /health-assistant.
- Why it is cleaner: About eight names collapse to one per place, so every surface carries fewer words.
- Why it is easier for low-literacy and older readers: The word tapped is the word read on arrival, so the reader knows they arrived in the right place.
- Keep: Routes, metadata titles and SEO descriptions stay in meaning. Button labels stay on one line (check the nav at xl). Sentence casing and no ampersands apply.
- Verify: For each route in each language, compare the nav, menu, footer, tab and H1 strings (a small test can assert equality from the copy files). Check the desktop nav at 1280 in sq and ro.
- Effort: M
- Risk: Medium. It touches many copy keys in seven languages.

### RED-P15: Take find-help filters off their card and state location once

- Surface: Find help (/find-help)
- Files: src/components/find-help/FindHelpExplorer.tsx:765-990, src/components/find-help/FindHelpPageContent.tsx:40-84
- Resolves: RED-24, MOB-07, SYS-13, SYS-17, AGE-14
- Now: Search, a location select ("Bucure…"), a category select, an "Emergency department" toggle with a red icon and an "Open now" toggle with a clock sit inside `rounded-2xl border border-stone-200/90 bg-card … shadow-(--shadow-card-rest)`. Under a hairline, "Suggested for this language: București, Romania" with a pin repeats the select, followed by an "All of Romania" button and a tinted rights callout with its own Listen. The page ends with two bordered cards (an amber one for mediators, a plain one for "Not sure where to go?").
- Change:
  1. Remove the card surface classes from the filter `section` (no border, shadow, background or padding), and keep the grid.
  2. Delete the "Suggested for…/Near…" line and its pin icon. Add "All of Romania" as the first option of the location select, with the suggestion source in its accessible description.
  3. Remove the leading icons from the two toggles.
  4. Render the rights callout as a plain paragraph with a text link, and drop its own Listen (RED-P06).
  5. Turn the two closing cards into two plain sections divided by a hairline, keeping their buttons as `secondary`.
  6. Give search a visible label "Search by name, city or address" above the field (AGE-14), translated into all seven languages.
- Why it is cleaner: It removes one card, one duplicate location statement, two decorative icons and two closing card frames.
- Why it is easier for low-literacy and older readers: Results move up toward the first screen, and the location is said once, in the control that changes it.
- Keep: Every filter, the whole-country option, emergency rights text, the mediator and get-help routes, the List/Map toggle, and `FindHelpFilterAndLocation.test.ts`. Note: the working tree has uncommitted edits in `FindHelpExplorer.tsx` and `LocationFilterPopover.tsx`, so coordinate with them.
- Verify: At 375x812, the first result row (or loading skeleton) is visible without scrolling, or within 100px of it. The location appears once. Filters still combine. The test file passes.
- Effort: M
- Risk: Medium. It touches a file with in-progress uncommitted work.

### RED-P09: Keep the news map closed until the reader asks for it

- Surface: News (/stiri)
- Files: src/components/news/NewsHub.tsx:125, :220-270
- Resolves: RED-29, MOB-21, MOB-14
- Now: `const [showMap, setShowMap] = useState(true)` opens a bordered "County map" card with Romania and Moldova tabs plus "All counties" above the news, so on a phone the first alert is below the fold. The page also has its own icon-only search beside the header's search.
- Change:
  1. Change the default to `useState(false)`. The existing "Show map" button and the "Bucharest | Change county" control stay as the ways in.
  2. Load the county map component only when `showMap` becomes true, with a dynamic import.
  3. Remove the page-level icon-only search button (`:228`). The header search covers the same content. If news search is not covered by the header search, keep the button but give it the word "Search".
- Why it is cleaner: The page opens on its content, and one of two searches goes.
- Why it is easier for low-literacy and older readers: The alerts they came for are on the first screen. Picking an area stays one labelled tap away.
- Keep: County choice, the Moldova tab, and the per-county alerts. `croatia-moldova-news.test.ts`.
- Verify: At 375, /en/stiri shows the first news item above the fold. Tapping "Show map" reveals the map, which fetches only then. Changing county still filters.
- Effort: S
- Risk: Low. It changes a default state only.

### AGE-P15: Show all four care tools on phones without sideways scrolling

- Surface: assistant, symptom check, prescription review, find help (shared tab row)
- Files: src/components/health-assistant/AssistantNavigation.tsx:73-90, src/components/health-assistant/AssistantNavigation.module.css
- Resolves: AGE-18, LIT-09, MOB-05, MOB-20, RED-08
- Now: `overflow-x-auto ... scrollbar-none` hides "Prescription review" and "Pharmacies and clinics" off the right edge at 375, and only an icon of the third tab shows.
- Change:
  1. Below 640px, render the row as a 2x2 grid (`grid grid-cols-2 gap-2`), each tab `min-h-11 text-body` with its word, current tab marked by `aria-current="page"`, a 2px sapphire underline and `font-semibold` (not colour alone).
  2. Use the shortest nav names agreed in LIT-06/RED-07 so each fits one line in all seven languages at 375 (e.g. "Assistant", "Symptoms", "Prescription", "Pharmacies"); translate.
  3. Remove the tab icons on phones.
- Why it is cleaner: no hidden overflow, no clipped icon, no scroll mask; four words in a tidy block.
- Why it is easier for low-literacy and older readers: all four places are visible at once; nothing depends on knowing to swipe sideways.
- Keep: the row's links and active state; desktop single-line row.
- Verify: 320 and 375, all languages, normal and XL scale: four tabs visible, each label on one line, no horizontal scroll inside the nav; current tab identifiable in grayscale.
- Effort: S
- Risk: Low. One component. The short labels depend on the naming decision in LIT-06.

### RED-P10: On phones, move the tool sub-tabs and search into the menu

- Surface: Phone header and tool pages (/health-assistant, /health-check, /prescription-review, /find-help)
- Files: src/components/health-assistant/AssistantNavigation.tsx:75-100, src/components/layout/Header.tsx:509-528, :591-660, src/components/layout/ComfortMenu.tsx:449-474
- Resolves: RED-08, RED-11, LIT-08, LIT-09, MOB-05, MOB-12, MOB-20, AGE-04, AGE-18, AGE-26, FLO-28
- Now: Above each tool on a phone sit the 112 strip, a 64px bar (search icon, "Aa", three-line icon), and a sideways-scrolling tab row that cuts off its third tab to an icon. The menu already has a search field at its top (`:591-611`), so search appears twice. Prescription review is reachable only through those tabs or the hero.
- Change:
  1. Hide `AssistantNavigation` below sm (`hidden sm:flex` on the nav at `:75`).
  2. In the phone menu, under the "Help me choose" row, list the four tools as indented rows using the existing drawer row style: Symptom check, Prescription review, Pharmacies and clinics (names from RED-P04). This keeps every tool one tap away.
  3. Remove the separate search icon from the phone bar (`:510-526`). Search stays as the first row of the menu.
  4. Use the freed space to show the word "Menu" beside the menu icon (`whitespace-nowrap`, translated into all seven languages), so the bar reads: logo, Aa, "Menu".
- Why it is cleaner: The bar loses a third icon and tool pages lose a full row of scrolling chrome.
- Why it is easier for low-literacy and older readers: The menu is named in words rather than an unfamiliar three-line icon, and nothing scrolls sideways out of sight.
- Keep: The 112 strip (unchanged), all destinations, keyboard search, menu focus trapping, `MobileMenu.test.ts` and `FullScreenAndGlobalSearch.test.ts` (update).
- Verify: At 375x812 on /en/health-check the H1 sits directly under the header. The menu shows the tools and search. "Menu" fits on one line in all seven languages at 360px. Tabs still show at 640 and up.
- Effort: M
- Risk: Medium. It changes the menu structure that returning users know.

### AGE-P05: Make the 112 strip a 44px row with spaced controls

- Surface: chrome, every page
- Files: src/components/layout/UniversalEmergencyBanner.tsx:109-136, src/components/layout/Header.tsx:781
- Resolves: AGE-03, MOB-11, AGE-24
- Now: the strip is `min-h-[2rem] ... text-[13px]`; "Call 112" is `h-7 px-1.5` (measured 58x28); the dismiss × is `h-7 w-7` with a 14px glyph on the same line. In the phone menu the 112 button is `text-xs` with a `h-3.5` icon.
- Change:
  1. Strip container `min-h-11 text-body` (rem, so it scales; see AGE-P01).
  2. "Call 112" becomes `inline-flex min-h-11 px-3 font-semibold underline` (≥44x44).
  3. Dismiss: `h-11 w-11`, glyph `h-4 w-4`, with `ml-4` minimum gap from the call link (8px+ guaranteed by `gap-4` on the row).
  4. In the phone menu (`Header.tsx:781`), the 112 button uses `text-body` and `h-4 w-4` icon, `min-h-12`.
  5. To keep the header from growing, reduce the logo bar's vertical padding so strip + bar ≤ 108px (today 102px); check `--site-header-h` still matches.
- Why it is cleaner: the strip uses the same 44px control height and body size as everything else rather than its own micro scale.
- Why it is easier for low-literacy and older readers: the life-safety action is the easiest thing to hit, and hiding the strip by accident becomes unlikely.
- Keep: red only here and in emergencies; the dismiss function and its persistence; EmergencyDialerGate flow.
- Verify: at 320 and 375, measured "Call 112" ≥44x44, dismiss ≥44x44, gap between them ≥8px; header height ≤108px; ChromeConsistency.test.ts passes.
- Effort: S
- Risk: Low. One component and one row.

### FLO-P09: Keep one entry to the assistant in the desktop header

- Surface: Header (desktop) and its "Start here" menu
- Files: src/components/layout/Header.tsx:376-500, src/lib/i18n/translations.ts:1156, :1162, :1166 (and other locales)
- Resolves: FLO-14, RED-06, RED-02
- Now: The nav has "Ask for guidance" (to /health-assistant), and at the right a split button "Start here" (also to /health-assistant#triage) plus an icon-only chevron with `aria-label="For health mediators"`. The chevron opens a menu that repeats the assistant link and adds /mediatori. On the home page "Start here" takes the reader away from the panel that already started them.
- Change:
  1. Remove the split button and its menu (`startMenuWrapperRef` block, :376-500).
  2. Keep "Ask for guidance" in the nav. Rename it per the panel's naming decision (LIT-06 proposes one name per destination), for example "Health assistant" to match the page h1, in all seven languages.
  3. Move "For health mediators" (the worker entry, /mediatori) into the account area of the header as a plain text link, or into the footer, as the mobile menu already does.
- Why it is cleaner: The bar loses a two-part control, an icon-only toggle and a menu that duplicated a nav link.
- Why it is easier for low-literacy and older readers: Each door in the header goes to a different place, and no chevron hides a choice behind an icon.
- Keep: Header height and transparency behaviour; the mobile menu (it has no "Start here"); `ChromeConsistency.test.ts` expectations, updated where they named the split button.
- Verify: Desktop 1280 and 1440 in all seven languages: one link to the assistant, no chevron, and the bar does not wrap. Tab through the header: no hidden menu. Phones unchanged.
- Effort: S
- Risk: Low; one chrome control removed, and its destinations stay linked elsewhere.

### LIT-P10: Label the phone header's icon buttons with words

- Surface: Site header on phones and tablets
- Files: src/components/layout/Header.tsx (search, comfort "Aa" and menu buttons); src/lib/i18n/translations.ts:1166-1168 (`header.openMenu`, `closeMenu`) and a new `header.textSize` key in all locales; comfort menu title "Easier reading"
- Resolves: LIT-08, AGE-04, MOB-26, RED-11
- Now: at 375px the header right side is three glyphs: a magnifier, "Aa" and three lines. "Aa" opens "Easier reading" (text size, reading mode, still motion), the settings built for the readers who will not recognise "Aa".
- Change:
  1. Turn the menu button into icon + visible word "Menu" (`header.menuLabel`, all seven languages: ro "Meniu", ru "Меню", rom "Menu", sq "Menu", it "Menu", hr "Izbornik"), `whitespace-nowrap`, min 44px tall.
  2. Turn the "Aa" button into a text button reading "Text" at 16px (`header.textSize`: ro "Text", ru "Текст", hr "Tekst", sq "Teksti", it "Testo", rom "Teksto"). Its accessible name stays "Easier reading".
  3. Keep search as an icon (a widely understood glyph) with its aria-label. If width at 320px is short, search moves into the menu as its first row rather than shrinking the words.
- Why it is cleaner: two jargon symbols become two plain words of the same weight; nothing new is added.
- Why it is easier for low-literacy and older readers: "Menu" and "Text" say what is behind them. The text-size control is discoverable by the readers it was built for.
- Keep: 44px targets, the 112 strip, the logo link, the drawer and comfort menu behaviour, button labels on one line at 320px in all seven languages (hr "Izbornik" is the longest; check it).
- Verify: at 320px and 375px in en, hr, ru and rom, the header shows logo, search, "Text" and "Menu" on one row with no wrap or truncation. Tapping "Text" opens Easier reading; tapping "Menu" opens the drawer.
- Effort: S
- Risk: Medium; header width at 320px in long languages is tight and must be checked before merge.

### MOB-P15: Turn off scroll reveals on phones and on task pages

- Surface: Reveal component (home, guides, task pages)
- Files: src/components/ui/Reveal.tsx:68-95, src/components/landing/HealthTopics.tsx:93, src/components/landing/HelpOptions.tsx:237-307, src/components/landing/TrustSection.tsx:247-306, src/components/health-information/TopicDetailPageContent.tsx:435-490
- Resolves: MOB-18, FLO-26
- Now: after hydration every block below the fold is set to `armed` (hidden) until an IntersectionObserver callback and a React update reveal it, with staggers on the home topic tiles. On a busy low-end main thread a fast flick lands on empty sand for a moment.
- Change:
  1. In `Reveal.tsx`, inside the effect at `:73`, return early (staying `visible`) when `window.matchMedia("(max-width: 767px)").matches`. Nothing is ever armed on phones.
  2. On guide pages (`TopicDetailPageContent.tsx:435-490`) remove the six `Reveal` wrappers at every width, since a guide is read, not presented.
  3. Remove the `delay={revealDelay(index)}` stagger on the home topic tiles (`HealthTopics.tsx:93`).
- Why it is cleaner: content is simply there, and the craft layer keeps its reveals for desktop sections where they cost nothing.
- Why it is easier for low-literacy and older readers: a scroll never shows a blank screen that looks like the end of the page, and text does not move as they try to read it.
- Keep: the no-JS-safe behaviour, reveals at md+ on home, reduced-motion handling and the Reveal variants used elsewhere.
- Verify: at 375px with 4x CPU throttle, flick-scroll /en from top to footer while recording the Performance panel: no frame shows an empty section where tiles should be. Elements under the `[data-reveal]` selector count 0 at 375px. At 1280px home sections still rise in.
- Effort: S
- Risk: Low, because it adds one guard and removes some wrappers.

### AGE-P02: At large text, let buttons take the full row; never truncate meaning

- Surface: site-wide on phones at 114% and 126%; find help; doctor booking
- Files: src/app/globals.css:1019-1038, src/components/find-help/FindHelpExplorer.tsx:1185-1189, src/components/find-help/LocationFilterPopover.tsx:163-165, src/components/telemed/AppointmentBookingCalendar.tsx:504-521,538, src/components/auth/SignInForm.tsx:186, src/components/portal/SmsPhoneAuthModal.tsx:535,608
- Resolves: AGE-02, AGE-19, MOB-06
- Now: under 640px at large scales, globals.css adds `overflow:hidden; text-overflow:ellipsis` to every `button/a.whitespace-nowrap` and its span. Find-help shows "B…" for the city and ellipsises clinic phone numbers. Booking day cells `truncate text-xs` / `text-[11px]` cut weekday and month, and hour buttons sit `gap-px` apart.
- Change:
  1. Replace the ellipsis block in globals.css:1025-1038 with: under 640px at `data-text-scale` large/xl, `:is(button,a).whitespace-nowrap { width: 100%; justify-content: center; }` inside flex rows that have `flex-wrap`. Rows of buttons then stack one per line, and each label stays on one line at full width.
  2. Delete `truncate` from button label spans whose content is data (a phone number, a place name, a date): FindHelpExplorer.tsx:1189, LocationFilterPopover.tsx:165. Long place names in the location filter wrap below the label in its popover trigger as plain text (`whitespace-normal` on the value span only; the trigger is a filter, not an action label).
  3. Where a button label is static copy and still overflows at 126% width 320, shorten the copy in all seven languages (record which keys in the PR).
  4. Booking day strip: render weekday with `Intl.DateTimeFormat(lang, { weekday: "short" })` and drop the month line from each cell (show the month once above the strip as `text-body`), remove `truncate`, cells `text-meta`/`text-title` tokens. Hour grid: `gap-2` instead of `gap-px`, no shared borders (`rounded-lg border` per button).
- Why it is cleaner: one predictable rule (buttons go full width when big) replaces per-component truncation, and the booking grid loses its hairline mesh.
- Why it is easier for low-literacy and older readers: the person who enlarged text can read every button and every phone number; an older finger no longer hits the neighbouring hour.
- Keep: CLAUDE.md rule 3 (labels on one line); `whitespace-nowrap` on labels; booking behaviour.
- Verify: 320 and 375 widths, scale normal/large/xl, en and ro and ru: no element with `scrollWidth > clientWidth` among buttons/links; the phone number is whole; no horizontal page scroll; the booking hour buttons have 8px gaps.
- Effort: M
- Risk: Medium. The full-width rule touches every button row on phones at large scales and needs a visual pass.

### AGE-P01: Make every text size scale with the comfort setting

- Surface: site-wide (chrome, home triage, comfort menu, search, tools)
- Files: src/app/globals.css:72-98, src/lib/comfort-preferences.ts:90-96, src/components/search/SmartSearchModal.tsx, src/components/landing/hero/TriagePanel.tsx:505,526,531, src/components/layout/ComfortMenu.tsx:266,290,320,379,387,439,470, src/components/layout/Header.tsx:606,648,695,730, src/components/layout/UniversalEmergencyBanner.tsx:109
- Resolves: AGE-01, AGE-05, SYS-01, SYS-07, SYS-25, SYS-27
- Now: the comfort control sets `html.style.fontSize` to 114% or 126%, but the public surfaces use 108 arbitrary `text-[NNpx]` classes in px that ignore it. At "Extra large", "Emergency?" stays 13px, the six triage choices stay 16px (`text-[16px]`) and the comfort labels stay 11px.
- Change:
  1. Map every `text-[NNpx]` and `text-[0.NNNNrem]` class in the in-scope folders to a token: 16px and 15.5px and 15px and `text-[0.9375rem]` → `text-body` (1rem); 17px and 18px → `text-title`; 13px, 13.5px, 14px, 14.5px, 12.5px → `text-meta` (0.875rem) only where AGE-P03/P04 allow meta, otherwise `text-body`; 11px and 10px → `text-meta` (none may stay below it); 22px to 34px → the nearest of `text-section` / `text-page`.
  2. Glyph sizes for "Aa" (`ComfortMenu.tsx:470`, `:379`) use `text-[0.9375rem]`-equivalent rem (`text-body`), not px.
  3. Add a lint test (extend `src/components/layout/ChromeConsistency.test.ts` or a new test in the same folder) that fails on `text-\[[0-9.]+px\]` in the in-scope folders.
- Why it is cleaner: about 28 rendered sizes collapse to the six declared tokens, and every role always has the same size.
- Why it is easier for low-literacy and older readers: "Large" and "Extra large" then enlarge every word, including the tap targets and the 112 line, so the setting does what it says.
- Keep: the comfort-preferences API and storage; the hero `clamp()` titles in globals.css (already rem); the one-line button rule (see AGE-P02 for overflow).
- Verify: at 375 with "Extra large", computed font-size of "Emergency?", "Check my symptoms", the comfort option labels and the search modal section labels is 126% of their normal value; the grep test passes; run `npm test`.
- Effort: M
- Risk: Medium. Many files change, and a few tight rows (header, drawer) need checking at 126%.

### AGE-P10: Give the 3D body labelled 44px controls with 8px gaps

- Surface: symptom check, 3D mode
- Files: src/components/health-check/AnatomicalBodyMap.tsx:450-460, 1187-1260
- Resolves: AGE-06, AGE-07, MOB-04, RED-19
- Now: the direction pad is five `h-7 w-7` buttons touching in a cross; zoom is `h-9 w-9`; Front/Back are `h-9 ... text-xs`; the five layer tools are `h-9 w-9` icons whose names exist only in hover tooltips (`hidden ... text-xs` spans at :450 and :1254).
- Change:
  1. All camera and layer controls `min-h-11 min-w-11`, row `gap-2`, wrapping rows (`flex flex-wrap`).
  2. Replace the cross-shaped pad with one row of labelled buttons: "Turn left", "Turn right", "Up", "Down", "Reset" (word plus arrow; existing aria strings become visible text; all seven languages; shorten to fit one line).
  3. Layers: replace the five icon buttons with one native `<select>` labelled "Show" (`min-h-12 text-body`) listing Skin, Muscles, Bones, Organs, Whole body.
  4. Front/Back: `min-h-11 text-body`.
  5. Delete the hover-tooltip spans.
- Why it is cleaner: five pictograms and a D-pad become one select and one row of words; the floating clusters shrink.
- Why it is easier for low-literacy and older readers: every control says what it does before it is tapped, and none sit close enough to mis-hit.
- Keep: every camera and layer function; keyboard access; `announceMobileHint` can stay for screen readers.
- Verify: 375 in 3D mode: every control measured ≥44x44 with ≥8px gaps; no hover-only labels in the DOM; each function still works; anatomy tests pass.
- Effort: M
- Risk: Medium. The stage overlay layout has to be reworked to fit the labelled row.

## Appendix B: the 11 items that did not make the top 50

Not rejected as wrong: outranked. Several are performance work with little visible effect, which this ballot's scales did not reward; the mobile reviewer's audit makes a strong case for them on other grounds (page weight on cheap phones), and they deserve their own decision.

| Rank | Item | Title | Score | Clarity | Sleek | Safe |
|---|---|---|---|---|---|---|
| 51 | RED-P16, SYS-P09 | One card recipe, no nested boxes | 5.90 | 4.8 | 8.7 | 4.5 |
| 52 | SYS-P10 | One dialog and sheet shell | 5.88 | 4.2 | 6.8 | 7.8 |
| 53 | LIT-P08 | Name the reading-mode switch, and make "Easy" mean simple words | 5.82 | 6.2 | 3.6 | 7.8 |
| 54 | FLO-P12 | Let the waiting room's button follow the doctor's state | 5.82 | 7.2 | 4.6 | 4.8 |
| 55 | SYS-P05 | Tie heading size to heading level | 5.61 | 4.0 | 6.2 | 7.8 |
| 56 | SYS-P15 | Load one preloaded body font, drop Geist Mono | 4.68 | 3.0 | 3.6 | 9.0 |
| 57 | MOB-P02 | Draw the 3D body cheaply on low-end phones; treat 3G and 2GB as lite | 4.47 | 3.2 | 3.6 | 7.8 |
| 58 | SYS-P16 | Put spacing on the 4px grid with a named page rhythm | 4.40 | 2.6 | 5.6 | 6.2 |
| 59 | MOB-P06 | Keep county maps and all-language news off the home page | 3.67 | 2.8 | 2.2 | 7.0 |
| 60 | MOB-P04 | Load the feedback, search and report dialogs only when needed | 3.46 | 3.0 | 2.2 | 5.8 |
| 61 | MOB-P05 | Send the browser only the active language's chrome strings | 2.57 | 2.4 | 1.8 | 3.8 |

Two of these are named as helpful groundwork by the reviewers: MOB-P06 (load the news map on demand) before P22, and C15 (one card recipe) before P31. Neither is required.
