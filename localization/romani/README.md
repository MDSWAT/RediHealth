# Romani translation handoff

Target: **standard written Romani used in Romania**, language code `rom`.

**Status: the application now offers a Romani locale, merged from upstream. This handoff catalog predates that merge and is not its runtime translation source.** Refresh the catalog before using it for further translation or review. Neither the catalog nor the presence of a locale certifies language or clinical accuracy.

The available translation model could not reliably draft this written standard. Google's Romani output is closest to Southern Vlax, which must not be silently relabeled as the requested standard. The existing small glossary also mixes Romanian explanations and Romani terms and is not an authoritative translation source for the entire website.

## Files and coverage

`catalog.json` contains the English messages extracted from the current locale dictionaries and identifiable English code branches: public navigation, health guides, symptoms, health myths, news, forms, staff screens, portal/offline copy, emails and reports. Each message records its source file, line and context. IDs stay stable when source formatting changes; changing the wording generates a new ID. The extractor does not execute the application or read `.env` files, patient data or the database.

The catalog captures existing English localization sources. Hardcoded text outside those sources, user-entered patient information, facility names, externally authored articles, legal applicability, images containing text and audio recordings still require separate review. Do not claim whole-site coverage solely because the catalog validator passes.

## Translation and review

1. Fill `translation` in the catalog without editing `id`, `source`, `file`, `context` or `placeholders`.
2. Keep numbers, medication quantities, phone numbers and placeholders exactly intact. Whole template sentences are exported together; `{__slot_0}` stands for a dynamic value and can move within the translated sentence.
3. Set `status` to `translated` during drafting. A reviewer fluent in the selected written standard and appropriate medical terminology should check meaning, negation, urgency, numbers and readability. Record their name in `reviewer` and set reviewed messages to `reviewed`.
4. Validate and import the reviewed handoff bundle:

```powershell
npm run romani:check -- path/to/translated-catalog.json
npm run romani:import -- path/to/translated-catalog.json
```

The import writes `localization/romani/reviewed.json` only when every current message passes validation. It does **not** change or publish the application. Reviewer names record attribution; the tool cannot authenticate reviewers or determine linguistic or clinical correctness.

To refresh the source catalog after website changes:

```powershell
npm run romani:export
```

Matching messages retain their translations and review fields. New or changed source messages start empty. Retain the translator's working file separately when refreshing after removals.

## Remaining implementation

After suitable translations are available, integrate them into the locale dictionaries and conditional branches; add `rom` routes, language selection, metadata and country labels; update any two-character-only language detection; and test all public, staff, portal, demo and offline flows. Date/number formatting should have an explicit supported fallback. Read-aloud must use genuine matching Romani recordings or voices; selecting Romanian audio would misrepresent the language. The intake model's Romani output also requires separate language evaluation.

Review the existing glossary with the same language resource. Preserve the distinction between Romani and Romanian and avoid presenting a particular dialect as universal.

References: [Council of Europe Romani language resources](https://www.coe.int/en/web/education/romani), [Google's notes on Romani translation varieties](https://blog.google/intl/en-in/google-translate-new-languages-2024/).
