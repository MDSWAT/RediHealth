import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { POST as postSmartSearch } from "@/app/api/smart-search/route";
import {
  SMART_SEARCH_SYNONYMS,
  SMART_SEARCH_TOOLS,
  getSmartSearchCopy,
  type Lang,
} from "@/lib/i18n/smart-search-copy";
import {
  detectEmergencyQuery,
  getContextualSuggestions,
  predictQueryCompletion,
  searchSmartCatalog,
} from "@/lib/search/smart-search-engine";

const ALL_LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];

const ALLOWED_UPPERCASE_ACRONYMS = new Set([
  "AI",
  "CNAS",
  "CAS",
  "ECG",
  "EKG",
  "MRI",
  "CT",
  "HIV",
  "HPV",
  "BMI",
  "HDL",
  "LDL",
  "TSH",
  "PCR",
  "WHO",
  "EU",
  "SMS",
  "GP",
  "ER",
  "ICU",
  "OTC",
  "DNA",
  "RNA",
  "PH",
  "IV",
  "BP",
  "HR",
  "OR",
  "US",
  "UK",
  "RO",
  "DE",
  "UA",
  "IQWiG",
]);

function assertCopyInvariants(
  value: string,
  label: string,
  lang?: Lang,
  allowLowercaseStart = false,
) {
  expect(value.trim().length, `${label} should be non-empty`).toBeGreaterThan(0);
  expect(value, `${label} must not contain '&'`).not.toContain("&");
  expect(value, `${label} must not contain middle dot '·'`).not.toContain("·");

  if (lang === "sq") {
    expect(
      value.toLocaleLowerCase("sq"),
      `${label} (sq) must not contain 'ndërmjetës'`,
    ).not.toContain("ndërmjetës");
  }

  const trimmed = value.trim();
  if (!allowLowercaseStart) {
    const firstLetterMatch = trimmed.match(/\p{L}/u);
    if (firstLetterMatch) {
      const ch = firstLetterMatch[0];
      expect(ch, `${label} ("${value}") should start with uppercase letter`).toBe(
        ch.toLocaleUpperCase(),
      );
    }
  }

  const allCapsTokens = trimmed.match(/\b\p{Lu}{2,}\b/gu) ?? [];
  for (const token of allCapsTokens) {
    expect(
      ALLOWED_UPPERCASE_ACRONYMS.has(token),
      `${label} ("${value}") has unexpected ALL CAPS token "${token}"`,
    ).toBe(true);
  }
}

describe("smart search 7-locale copy and catalog invariants", () => {
  it("provides complete, valid copy across all 7 locales with zero prohibited symbols", () => {
    for (const lang of ALL_LANGS) {
      const copy = getSmartSearchCopy(lang);

      const scalarFields: [string, string][] = [
        ["triggerLabel", copy.triggerLabel],
        ["triggerPlaceholder", copy.triggerPlaceholder],
        ["shortcutHint", copy.shortcutHint],
        ["modalLabel", copy.modalLabel],
        ["inputPlaceholder", copy.inputPlaceholder],
        ["clearLabel", copy.clearLabel],
        ["closeLabel", copy.closeLabel],
        ["searchSubmitLabel", copy.searchSubmitLabel],
        ["popularQueriesLabel", copy.popularQueriesLabel],
        ["recentSearchesLabel", copy.recentSearchesLabel],
        ["clearRecentLabel", copy.clearRecentLabel],
        ["didYouMeanPrefix", copy.didYouMeanPrefix],
        ["ghostAcceptHint", copy.ghostAcceptHint],
        ["aiAnswerTitle", copy.aiAnswerTitle],
        ["aiAnswerLoading", copy.aiAnswerLoading],
        ["aiAnswerUnavailable", copy.aiAnswerUnavailable],
        ["aiAnswerDisclaimer", copy.aiAnswerDisclaimer],
        ["aiSourcesLabel", copy.aiSourcesLabel],
        ["readAloudLabel", copy.readAloudLabel],
        ["stopReadingLabel", copy.stopReadingLabel],
        ["openPageLabel", copy.openPageLabel],
        ["askAssistantLabel", copy.askAssistantLabel],
        ["emergencyTitle", copy.emergencyTitle],
        ["emergencyBody", copy.emergencyBody],
        ["emergencyCallLabel", copy.emergencyCallLabel],
        ["emptyTitle", copy.emptyTitle],
        ["emptyBody", copy.emptyBody],
        ["emptyFallbackAction", copy.emptyFallbackAction],
        ["noResultsHint", copy.noResultsHint],
        ["resultsSingular", copy.resultsSingular],
        ["resultsPlural", copy.resultsPlural],
        ["inspectorTitle", copy.inspectorTitle],
        ["inspectorEmptyHint", copy.inspectorEmptyHint],
        ["inspectorOpenLabel", copy.inspectorOpenLabel],
        ["inspectorSuggestedFollowupsLabel", copy.inspectorSuggestedFollowupsLabel],
        ["keyboardHelp", copy.keyboardHelp],
        ["journeysHeading", copy.journeysHeading],
        ["relatedQuestionsHeading", copy.relatedQuestionsHeading],
        ["expandDetailsLabel", copy.expandDetailsLabel],
        ["collapseDetailsLabel", copy.collapseDetailsLabel],
        ["expandOverviewStepsLabel", copy.expandOverviewStepsLabel],
      ];

      for (const [key, value] of scalarFields) {
        const isLowercaseSuffix = key === "resultsSingular" || key === "resultsPlural";
        assertCopyInvariants(value, `${lang}.${key}`, lang, isLowercaseSuffix);
      }

      expect(
        copy.inputPlaceholder.length,
        `${lang}.inputPlaceholder max 28`,
      ).toBeLessThanOrEqual(28);

      for (const [ctxKey, ctxVal] of Object.entries(copy.contextHeaderForPath)) {
        assertCopyInvariants(ctxVal, `${lang}.contextHeaderForPath.${ctxKey}`, lang);
      }

      for (const [catKey, catVal] of Object.entries(copy.categories)) {
        assertCopyInvariants(catVal, `${lang}.categories.${catKey}`, lang);
      }

      for (const [kindKey, kindVal] of Object.entries(copy.kindLabels)) {
        assertCopyInvariants(kindVal, `${lang}.kindLabels.${kindKey}`, lang);
      }

      expect(copy.popularQueries.length, `${lang}.popularQueries`).toBeGreaterThanOrEqual(5);
      for (const [idx, pq] of copy.popularQueries.entries()) {
        assertCopyInvariants(pq, `${lang}.popularQueries[${idx}]`, lang);
      }

      expect(copy.starterChips.length, `${lang}.starterChips`).toBeGreaterThanOrEqual(4);
      for (const [idx, chip] of copy.starterChips.entries()) {
        assertCopyInvariants(chip.label, `${lang}.starterChips[${idx}].label`, lang);
        assertCopyInvariants(chip.query, `${lang}.starterChips[${idx}].query`, lang);
      }

      expect(copy.guidedJourneys.map((j) => j.id), `${lang}.guidedJourneys IDs`).toEqual([
        "symptoms",
        "care",
        "meds",
        "rights",
      ]);
      for (const journey of copy.guidedJourneys) {
        expect(
          journey.title.length,
          `${lang}.guidedJourneys.${journey.id}.title max 32`,
        ).toBeLessThanOrEqual(32);
        assertCopyInvariants(journey.title, `${lang}.guidedJourneys.${journey.id}.title`, lang);
        assertCopyInvariants(journey.summary, `${lang}.guidedJourneys.${journey.id}.summary`, lang);

        expect(journey.queries.length).toBeGreaterThanOrEqual(2);
        for (const [qIdx, qItem] of journey.queries.entries()) {
          expect(
            qItem.label.length,
            `${lang}.guidedJourneys.${journey.id}.queries[${qIdx}].label max 28`,
          ).toBeLessThanOrEqual(28);
          assertCopyInvariants(
            qItem.label,
            `${lang}.guidedJourneys.${journey.id}.queries[${qIdx}].label`,
            lang,
          );
          assertCopyInvariants(
            qItem.query,
            `${lang}.guidedJourneys.${journey.id}.queries[${qIdx}].query`,
            lang,
          );
        }

        expect(journey.actions.length).toBeGreaterThanOrEqual(1);
        for (const [aIdx, action] of journey.actions.entries()) {
          expect(
            action.label.length,
            `${lang}.guidedJourneys.${journey.id}.actions[${aIdx}].label max 26`,
          ).toBeLessThanOrEqual(26);
          expect(action.href.startsWith("/")).toBe(true);
          assertCopyInvariants(
            action.label,
            `${lang}.guidedJourneys.${journey.id}.actions[${aIdx}].label`,
            lang,
          );
        }
      }

      expect(copy.emergencyTriggerTerms.length, `${lang}.emergencyTriggerTerms`).toBeGreaterThan(0);
      for (const term of copy.emergencyTriggerTerms) {
        expect(term.trim().length).toBeGreaterThan(0);
        expect(term).not.toContain("&");
        expect(term).not.toContain("·");
      }
    }
  });

  it("exposes at least 8 localized SMART_SEARCH_TOOLS and at least 16 SMART_SEARCH_SYNONYMS", () => {
    expect(SMART_SEARCH_TOOLS.length).toBeGreaterThanOrEqual(8);
    expect(SMART_SEARCH_SYNONYMS.length).toBeGreaterThanOrEqual(16);

    for (const tool of SMART_SEARCH_TOOLS) {
      expect(tool.href.startsWith("/")).toBe(true);
      expect(tool.keywords.length).toBeGreaterThan(0);
      for (const lang of ALL_LANGS) {
        assertCopyInvariants(tool.title[lang], `tool.${tool.id}.title.${lang}`, lang);
        assertCopyInvariants(tool.summary[lang], `tool.${tool.id}.summary.${lang}`, lang);
        assertCopyInvariants(
          tool.plainSummary[lang],
          `tool.${tool.id}.plainSummary.${lang}`,
          lang,
        );
        assertCopyInvariants(tool.groupLabel[lang], `tool.${tool.id}.groupLabel.${lang}`, lang);
        assertCopyInvariants(tool.actionLabel[lang], `tool.${tool.id}.actionLabel.${lang}`, lang);
      }
    }

    for (const group of SMART_SEARCH_SYNONYMS) {
      expect(group.canonical.trim().length).toBeGreaterThan(0);
      expect(group.terms.length).toBeGreaterThan(0);
      expect(group.boostTitleKeywords.length).toBeGreaterThan(0);
    }
  });
});

describe("smart search engine", () => {
  it("resolves typos like 'diabte' to diabetes content and/or populates didYouMean", () => {
    const res = searchSmartCatalog("diabte", { lang: "en" });

    expect(res.results.length).toBeGreaterThan(0);
    const hasDiabetesMatch = res.results.some(
      (item) =>
        item.href.includes("diabet") ||
        item.title.toLowerCase().includes("diabet") ||
        item.summary.toLowerCase().includes("diabet"),
    );
    expect(hasDiabetesMatch).toBe(true);
    if (res.didYouMean !== null) {
      expect(res.didYouMean.toLowerCase()).toContain("diabet");
    }
  });

  it("resolves multilingual synonyms for open pharmacy and CNAS insurance card", () => {
    const enPharmacy = searchSmartCatalog("open pharmacy", { lang: "en" });
    expect(enPharmacy.results.length).toBeGreaterThan(0);
    expect(enPharmacy.results.some((item) => item.href.includes("/find-help"))).toBe(true);
    expect(enPharmacy.intentSummary?.toLowerCase()).toContain("nearby care maps");

    const roPharmacy = searchSmartCatalog("farmacie deschisă", { lang: "ro" });
    expect(roPharmacy.results.length).toBeGreaterThan(0);
    expect(roPharmacy.results.some((item) => item.href.includes("/find-help"))).toBe(true);
    expect(roPharmacy.intentSummary?.toLowerCase()).toContain("harta serviciilor");

    const roCnas = searchSmartCatalog("card CNAS", { lang: "ro" });
    expect(roCnas.results.length).toBeGreaterThan(0);
    expect(
      roCnas.results.some(
        (item) =>
          item.href.includes("health-care-in-germany") ||
          item.href.includes("/mediatori") ||
          item.href.includes("/get-help"),
      ),
    ).toBe(true);
  });

  it("never echoes entry title in highlights and ranks guides/tools cleanly on everyday queries", () => {
    const directTitleEn = searchSmartCatalog("Health assistant", { lang: "en" });
    expect(directTitleEn.results.length).toBeGreaterThan(0);
    for (const item of directTitleEn.results) {
      expect(item.highlights).not.toBe(item.title);
    }

    const directTitleRo = searchSmartCatalog("Asistent de sănătate", { lang: "ro" });
    expect(directTitleRo.results.length).toBeGreaterThan(0);
    for (const item of directTitleRo.results) {
      expect(item.highlights).not.toBe(item.title);
    }

    const feverSearch = searchSmartCatalog("fever", { lang: "en", pathname: "/" });
    expect(feverSearch.results.length).toBeGreaterThan(0);
    expect(feverSearch.results[0].kind).not.toBe("glossary");
    for (const item of feverSearch.results) {
      expect(item.highlights).not.toBe(item.title);
    }
  });

  it("detects emergency queries in English and Romanian", () => {
    expect(detectEmergencyQuery("chest pain", "en")).toBe(true);
    expect(detectEmergencyQuery("durere in piept", "ro")).toBe(true);
    expect(detectEmergencyQuery("vitamin d", "en")).toBe(false);

    const enEmergency = searchSmartCatalog("chest pain", { lang: "en" });
    expect(enEmergency.isEmergency).toBe(true);

    const roEmergency = searchSmartCatalog("durere in piept", { lang: "ro" });
    expect(roEmergency.isEmergency).toBe(true);
  });

  it("returns simpler summaries when readingLevel is 'simple'", () => {
    const standard = searchSmartCatalog("assistant", {
      lang: "en",
      readingLevel: "standard",
    });
    const simple = searchSmartCatalog("assistant", {
      lang: "en",
      readingLevel: "simple",
    });

    const stdAssistant = standard.results.find((r) => r.id === "tool:health-assistant");
    const simpleAssistant = simple.results.find((r) => r.id === "tool:health-assistant");

    expect(stdAssistant).toBeDefined();
    expect(simpleAssistant).toBeDefined();
    expect(simpleAssistant!.summary).not.toBe(stdAssistant!.summary);
  });

  it("varies contextual suggestions meaningfully by route", () => {
    const glossaryCtx = getContextualSuggestions("/medical-glossary", "en");
    const careCtx = getContextualSuggestions("/find-care", "en");
    const homeCtx = getContextualSuggestions("/", "en");

    expect(glossaryCtx.contextLabel).not.toBe(careCtx.contextLabel);
    expect(careCtx.contextLabel).not.toBe(homeCtx.contextLabel);
    expect(glossaryCtx.topResults.length).toBeGreaterThan(0);
    expect(careCtx.topResults.length).toBeGreaterThan(0);
    expect(homeCtx.topResults.length).toBeGreaterThan(0);

    const glossaryIds = glossaryCtx.topResults.map((r) => r.id);
    const careIds = careCtx.topResults.map((r) => r.id);
    const homeIds = homeCtx.topResults.map((r) => r.id);

    expect(glossaryIds[0]).not.toBe(careIds[0]);
    expect(careIds[0]).not.toBe(homeIds[0]);
  });

  it("predicts inline ghost completions only for multi-character queries", () => {
    expect(predictQueryCompletion("", [], "en")).toBeNull();
    expect(predictQueryCompletion("d", [], "en")).toBeNull();

    const diabetesSearch = searchSmartCatalog("diab", { lang: "en" });
    const completion = predictQueryCompletion("diab", diabetesSearch.results, "en");
    expect(completion).not.toBeNull();
    expect(completion!.toLowerCase().startsWith("diab")).toBe(true);
  });

  it("builds guidedOverview and deduplicated relatedQuestions without boilerplate filler steps", () => {
    const emptyRes = searchSmartCatalog("", { lang: "ro" });
    expect(emptyRes.guidedOverview).toBeNull();
    expect(emptyRes.relatedQuestions).toEqual([]);

    const boilerplatePhrases = [
      "Pregătește întrebările principale",
      "Keep your main question",
      "Deschide asistentul",
      "Open assistant",
    ];

    for (const [lang, query] of [
      ["en", "fever"],
      ["ro", "febră"],
      ["ro", "asistent"],
      ["ro", "card CNAS"],
    ] as const) {
      const response = searchSmartCatalog(query, { lang });
      expect(response.guidedOverview, `${lang}:"${query}" guidedOverview`).not.toBeNull();
      expect(response.guidedOverview!.lead.length).toBeGreaterThan(0);
      expect(response.guidedOverview!.steps.length).toBeGreaterThanOrEqual(1);
      expect(response.guidedOverview!.primaryAction.href.startsWith("/")).toBe(true);

      expect(response.relatedQuestions.length).toBeGreaterThanOrEqual(1);
      expect(response.relatedQuestions.length).toBeLessThanOrEqual(4);
      const uniqueQuestions = new Set(
        response.relatedQuestions.map((rq) => rq.question.toLowerCase()),
      );
      expect(uniqueQuestions.size).toBe(response.relatedQuestions.length);

      for (const result of response.results) {
        for (const step of result.nextSteps) {
          for (const banned of boilerplatePhrases) {
            expect(step).not.toContain(banned);
          }
        }
      }
    }
  });
});

describe("POST /api/smart-search", () => {
  it("returns immediate emergency mode without calling LLM for red-flag queries", async () => {
    const req = new Request("http://localhost:3000/api/smart-search", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "127.0.10.1",
      },
      body: JSON.stringify({
        query: "chest pain",
        lang: "en",
        pathname: "/",
      }),
    });

    const res = await postSmartSearch(req);
    expect(res.status).toBe(200);

    const data = (await res.json()) as {
      mode: string;
      isEmergency: boolean;
      answer: string | null;
      citations: { href: string; title: string }[];
    };

    expect(data.mode).toBe("emergency");
    expect(data.isEmergency).toBe(true);
    expect(data.answer).toBeNull();
    expect(Array.isArray(data.citations)).toBe(true);
    expect(data.citations.length).toBeGreaterThan(0);
  });

  it("gracefully returns 200 with grounded citations in ai or local mode even without an LLM key", async () => {
    const req = new Request("http://localhost:3000/api/smart-search", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "127.0.10.2",
      },
      body: JSON.stringify({
        query: "open pharmacy",
        lang: "en",
        pathname: "/find-help",
        readingLevel: "simple",
      }),
    });

    const res = await postSmartSearch(req);
    expect(res.status).toBe(200);

    const data = (await res.json()) as {
      mode: string;
      isEmergency: boolean;
      answer: string | null;
      citations: { id: string; title: string; summary: string; href: string }[];
      suggestedFollowups: string[];
    };

    expect(["ai", "local"]).toContain(data.mode);
    expect(data.isEmergency).toBe(false);
    expect(Array.isArray(data.citations)).toBe(true);
    expect(data.citations.length).toBeGreaterThan(0);
    for (const citation of data.citations) {
      expect(citation.title.length).toBeGreaterThan(0);
      expect(citation.summary.length).toBeGreaterThan(0);
      expect(citation.href.startsWith("/")).toBe(true);
    }
  });
});

describe("CLAUDE.md and MobileMenu source invariants", () => {
  const modalSource = readFileSync(
    path.resolve(process.cwd(), "src/components/search/SmartSearchModal.tsx"),
    "utf8",
  );
  const headerSource = readFileSync(
    path.resolve(process.cwd(), "src/components/layout/Header.tsx"),
    "utf8",
  );
  const siteChromeSource = readFileSync(
    path.resolve(process.cwd(), "src/components/layout/SiteChrome.tsx"),
    "utf8",
  );

  it("mounts SmartSearchModal inside SiteChrome for standard surfaces", () => {
    expect(siteChromeSource).toContain('from "@/components/search/SmartSearchModal"');
    expect(siteChromeSource).toContain("<SmartSearchModal />");
  });

  it("wires openSmartSearch in Header while preserving #mobile-menu invariants", () => {
    expect(headerSource).toContain('from "@/components/search/smart-search-events"');
    expect(headerSource).toContain("openSmartSearch()");

    const mobileMenuStart = headerSource.indexOf('id="mobile-menu"');
    const mobileMenuEnd = headerSource.indexOf("</header>");
    const mobileMenuSource = headerSource.slice(mobileMenuStart, mobileMenuEnd);

    expect(mobileMenuSource).toContain("bg-paper");
    expect(mobileMenuSource).toContain("dark:bg-ink-950");
    expect(mobileMenuSource).toContain("max-w-xl");
    expect(mobileMenuSource).not.toContain("/health-assistant#triage");
    expect(mobileMenuSource).not.toContain("tHeader.startHere");
    expect(mobileMenuSource).not.toContain("line-clamp-1");
    expect(mobileMenuSource).not.toContain("<kbd");
    expect(mobileMenuSource).not.toContain("active:scale-");
    expect(mobileMenuSource).not.toContain("text-brand-gold");
    expect(mobileMenuSource).not.toContain("truncate");
    expect(mobileMenuSource).not.toContain("h-9 w-9");
    expect(mobileMenuSource).not.toContain("rounded-2xl");
  });

  it("enforces minimalist single-column Google-like structure and CLAUDE.md UI laws in SmartSearchModal", () => {
    expect(modalSource).not.toContain("rounded-full");
    expect(modalSource).not.toContain("<kbd");
    expect(modalSource).not.toContain("active:scale-");
    expect(modalSource).not.toContain("duration-200");
    expect(modalSource).not.toContain("text-brand-gold");
    expect(modalSource).not.toContain("·");
    expect(modalSource).not.toContain("<aside");
    expect(modalSource).not.toContain("truncate");
    expect(modalSource).not.toContain("line-clamp-2");
    expect(modalSource).toContain("pb-[calc(1.25rem+env(safe-area-inset-bottom))]");
    expect(modalSource).toContain("max-w-2xl");
    expect(modalSource).toContain("aria-expanded");
    expect(modalSource).toContain("guidedJourneys");
    expect(modalSource).toContain("guidedOverview");
    expect(modalSource).toContain("relatedQuestions");
    expect(modalSource).toContain("useCalmReducedMotion");
    expect(modalSource).toContain("useSheetDialog");
    // Focus is drawn as a sapphire rule along the search bar's lower edge.
    expect(modalSource).toContain("has-[input:focus-visible]:shadow-[inset_0_-2px_0_var(--color-sapphire)]");
    expect(modalSource).toContain('style={{ outline: "none" }}');
  });

  it("resets category filter back to all on query change/empty tab and activates category menu for any match", () => {
    const ventAll = searchSmartCatalog("vent>", { lang: "ro", category: "all" });
    expect(ventAll.groupedCounts.all).toBeGreaterThan(0);
    expect(ventAll.groupedCounts.myths).toBe(0);
    expect(ventAll.results.length).toBeGreaterThan(0);

    expect(modalSource).toContain("effectiveCategory");
    expect(modalSource).toContain("populatedCategories.length >= 1");
    expect(modalSource).toContain('setCategory("all")');
    expect(modalSource).toContain('data-modal-scroller="true"');

    const sheetHookSource = readFileSync(
      path.resolve(process.cwd(), "src/components/news/use-sheet-dialog.ts"),
      "utf8",
    );
    const emergencySignsSource = readFileSync(
      path.resolve(process.cwd(), "src/components/emergency/EmergencySignsModal.tsx"),
      "utf8",
    );
    expect(sheetHookSource).toContain("export function scrollExpandedIntoModalView");
    expect(sheetHookSource).toContain("export function useModalAutoScroll");
    expect(emergencySignsSource).toContain('data-modal-scroller="true"');
  });
});
