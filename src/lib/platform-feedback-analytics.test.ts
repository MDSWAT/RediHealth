import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { feedbackAnalyticsCopy } from "@/lib/i18n/feedback-analytics-translations";
import type { Lang } from "@/lib/i18n/translations";
import {
  computeFeedbackBreakdowns,
  computeFeedbackTrends,
  extractFeedbackKeywords,
  normalizeFeedbackToken,
} from "@/lib/platform-feedback-analytics";
import type { PlatformFeedbackItem } from "@/lib/platform-feedback-shared";

const ALL_LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];

function makeFeedbackItem(
  overrides: Partial<PlatformFeedbackItem> & { id: string },
): PlatformFeedbackItem {
  const usefulness = overrides.rating_usefulness ?? 4;
  const ease = overrides.rating_ease_of_use ?? 4;
  const visual = overrides.rating_visual_design ?? 4;
  const clarity = overrides.rating_content_clarity ?? 4;
  const future = overrides.rating_future_use ?? 4;
  const avg = Number(((usefulness + ease + visual + clarity + future) / 5).toFixed(2));

  return {
    country_code: "RO",
    lang: "ro",
    page_path: "/",
    rating_usefulness: usefulness,
    rating_ease_of_use: ease,
    rating_visual_design: visual,
    rating_content_clarity: clarity,
    rating_future_use: future,
    average_rating: overrides.average_rating ?? avg,
    open_feedback: null,
    gender: null,
    age_group: null,
    locality: null,
    occupation: null,
    marital_status: null,
    anonymized_redactions: 0,
    created_at: "2026-04-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("normalizeFeedbackToken", () => {
  it("folds Latin diacritics while keeping Cyrillic letters like й intact and folding ё to е", () => {
    expect(normalizeFeedbackToken("Sănătate")).toBe("sanatate");
    expect(normalizeFeedbackToken("Shëndet")).toBe("shendet");
    expect(normalizeFeedbackToken("Liječnik")).toBe("lijecnik");
    expect(normalizeFeedbackToken("Đakovo")).toBe("dakovo");
    expect(normalizeFeedbackToken("Приём")).toBe("прием");
    expect(normalizeFeedbackToken("Врачей")).toBe("врачей");
  });
});

describe("extractFeedbackKeywords", () => {
  it("strips redaction tokens, URLs, numbers-only tokens, short words, and stopwords across all 7 languages", () => {
    const items: PlatformFeedbackItem[] = [
      makeFeedbackItem({
        id: "ro-1",
        lang: "ro",
        open_feedback:
          "Foarte bun pentru sănătate și programări la clinică [date-anonimizate] [link-eliminat] https://example.org/test 12345 de la",
      }),
      makeFeedbackItem({
        id: "en-1",
        lang: "en",
        open_feedback: "This would really help with vaccine reminders and symptoms 2026!",
      }),
      makeFeedbackItem({
        id: "sq-1",
        lang: "sq",
        open_feedback: "Shumë e mirë për mjekët dhe farmacitë në qytet.",
      }),
      makeFeedbackItem({
        id: "it-1",
        lang: "it",
        open_feedback: "Vorrei trovare farmacie e l'applicazione più veloce per prenotazioni.",
      }),
      makeFeedbackItem({
        id: "hr-1",
        lang: "hr",
        open_feedback: "Vrlo korisno za preglede i liječnike bez čekanja.",
      }),
      makeFeedbackItem({
        id: "rom-1",
        lang: "rom",
        open_feedback: "But mishto vash sastipnaske gidura thaj doktora.",
      }),
      makeFeedbackItem({
        id: "ru-1",
        lang: "ru",
        open_feedback: "Очень полезно для записи к врачам и поиска аптек рядом.",
      }),
    ];

    const keywords = extractFeedbackKeywords(items, { maxTerms: 50 });
    const norms = new Set(keywords.map((kw) => kw.normalized));

    // Stripped artifacts & stopwords across all 7 languages
    for (const forbidden of [
      "date-anonimizate",
      "link-eliminat",
      "https",
      "example",
      "12345",
      "2026",
      "foarte",
      "pentru",
      "would",
      "really",
      "shume",
      "vorrei",
      "vrlo",
      "thaj",
      "vash",
      "очень",
      "для",
      "рядом",
    ]) {
      expect(norms.has(forbidden)).toBe(false);
    }

    // Meaningful multilingual content words preserved
    expect(norms.has("sanatate")).toBe(true);
    expect(norms.has("vaccine")).toBe(true);
    expect(norms.has("farmacite")).toBe(true);
    expect(norms.has("applicazione")).toBe(true);
    expect(norms.has("lijecnike")).toBe(true);
    expect(norms.has("doktora")).toBe(true);
    expect(norms.has("врачам")).toBe(true);
    expect(norms.has("аптек")).toBe(true);

    // Readable display form preserves diacritics
    const sanatate = keywords.find((kw) => kw.normalized === "sanatate");
    expect(sanatate?.term).toBe("sănătate");
  });

  it("extracts recurring 2-word phrases (>= 2 items), computes 1..5 weights, tracks matchedIds, and sorts deterministically", () => {
    const items: PlatformFeedbackItem[] = [
      makeFeedbackItem({
        id: "a1",
        open_feedback: "Programare online pentru analize medicale.",
      }),
      makeFeedbackItem({
        id: "a2",
        open_feedback: "As dori programare online la medicul specialist.",
      }),
      makeFeedbackItem({
        id: "a3",
        open_feedback: "Programare online rapida si analize clare.",
      }),
      makeFeedbackItem({
        id: "a4",
        open_feedback: "Programare la cabinet pentru vaccin.",
      }),
      makeFeedbackItem({
        id: "a5",
        open_feedback: "Programare simpla, fara asteptare.",
      }),
    ];

    const keywords = extractFeedbackKeywords(items, { maxTerms: 12 });
    expect(keywords.length).toBeLessThanOrEqual(12);

    // Top keyword should be "programare" with 5 matching items and max weight 5
    expect(keywords[0].normalized).toBe("programare");
    expect(keywords[0].count).toBe(5);
    expect(keywords[0].weight).toBe(5);
    expect(keywords[0].matchedIds).toEqual(["a1", "a2", "a3", "a4", "a5"]);

    // Recurring bigram "programare online" appears in 3 comments
    const bigram = keywords.find((kw) => kw.normalized === "programare online");
    expect(bigram).toBeDefined();
    expect(bigram?.count).toBe(3);
    expect(bigram?.matchedIds).toEqual(["a1", "a2", "a3"]);

    // Single-occurrence bigram should NOT appear
    expect(keywords.find((kw) => kw.normalized === "medicul specialist")).toBeUndefined();

    // Lowest count entry should receive weight 1 when counts vary
    const lowest = keywords[keywords.length - 1];
    expect(lowest.weight).toBe(1);

    // Verify sort invariant: count desc then normalized asc
    for (let i = 1; i < keywords.length; i += 1) {
      const prev = keywords[i - 1];
      const curr = keywords[i];
      const validOrder =
        prev.count > curr.count ||
        (prev.count === curr.count && prev.normalized.localeCompare(curr.normalized) <= 0);
      expect(validOrder).toBe(true);
    }
  });

  it("returns an empty array when there are no open comments", () => {
    const items = [
      makeFeedbackItem({ id: "empty-1", open_feedback: null }),
      makeFeedbackItem({ id: "empty-2", open_feedback: "   " }),
      makeFeedbackItem({ id: "empty-3", open_feedback: "[date-anonimizate] [link-eliminat]" }),
    ];
    expect(extractFeedbackKeywords(items)).toEqual([]);
  });
});

describe("computeFeedbackTrends", () => {
  it("uses daily buckets when date span <= 21 days and orders chronologically", () => {
    const items: PlatformFeedbackItem[] = [
      makeFeedbackItem({
        id: "t3",
        created_at: "2026-04-10T15:00:00.000Z",
        rating_usefulness: 5,
        rating_ease_of_use: 5,
        rating_visual_design: 5,
        rating_content_clarity: 5,
        rating_future_use: 5,
      }),
      makeFeedbackItem({
        id: "t1",
        created_at: "2026-04-02T09:00:00.000Z",
        rating_usefulness: 3,
        rating_ease_of_use: 3,
        rating_visual_design: 3,
        rating_content_clarity: 3,
        rating_future_use: 3,
      }),
      makeFeedbackItem({
        id: "t2",
        created_at: "2026-04-02T18:30:00.000Z",
        rating_usefulness: 5,
        rating_ease_of_use: 5,
        rating_visual_design: 5,
        rating_content_clarity: 5,
        rating_future_use: 5,
      }),
    ];

    const trends = computeFeedbackTrends(items, "en-US");
    expect(trends.granularity).toBe("day");
    expect(trends.buckets).toHaveLength(2);
    expect(trends.buckets[0].key).toBe("2026-04-02");
    expect(trends.buckets[0].count).toBe(2);
    expect(trends.buckets[0].avgRating).toBe(4);
    expect(trends.buckets[1].key).toBe("2026-04-10");
    expect(trends.buckets[1].count).toBe(1);
    expect(trends.buckets[1].avgRating).toBe(5);
  });

  it("switches to weekly buckets when span > 21 days and unique days > 14", () => {
    const items: PlatformFeedbackItem[] = [];
    // 18 unique days spanning 35 days (2 days apart)
    for (let i = 0; i < 18; i += 1) {
      const date = new Date(Date.UTC(2026, 2, 1 + i * 2, 12, 0, 0));
      items.push(
        makeFeedbackItem({
          id: `w-${i}`,
          created_at: date.toISOString(),
          rating_usefulness: 4,
          rating_ease_of_use: 4,
          rating_visual_design: 4,
          rating_content_clarity: 4,
          rating_future_use: 4,
        }),
      );
    }

    const trends = computeFeedbackTrends(items, "rom");
    expect(trends.granularity).toBe("week");
    expect(trends.buckets.length).toBeGreaterThanOrEqual(5);
    expect(trends.buckets.reduce((sum, b) => sum + b.count, 0)).toBe(18);
    for (let i = 1; i < trends.buckets.length; i += 1) {
      expect(trends.buckets[i - 1].key < trends.buckets[i].key).toBe(true);
    }
  });

  it("handles empty and invalid timestamps safely", () => {
    expect(computeFeedbackTrends([], "ro-RO")).toEqual({ granularity: "day", buckets: [] });
    expect(
      computeFeedbackTrends([makeFeedbackItem({ id: "bad", created_at: "not-a-date" })], "en-US"),
    ).toEqual({ granularity: "day", buckets: [] });
  });
});

describe("computeFeedbackBreakdowns", () => {
  it("classifies satisfaction tiers across boundary scores and computes page and language breakdowns", () => {
    const items: PlatformFeedbackItem[] = [
      // Exact 4.0 -> positive
      makeFeedbackItem({
        id: "b1",
        lang: "ro",
        page_path: "/ro/symptoms",
        rating_usefulness: 4,
        rating_ease_of_use: 4,
        rating_visual_design: 4,
        rating_content_clarity: 4,
        rating_future_use: 4,
      }),
      // 4.8 -> positive
      makeFeedbackItem({
        id: "b2",
        lang: "ro",
        page_path: "/ro/symptoms",
        rating_usefulness: 5,
        rating_ease_of_use: 5,
        rating_visual_design: 5,
        rating_content_clarity: 5,
        rating_future_use: 4,
      }),
      // 3.8 -> neutral
      makeFeedbackItem({
        id: "b3",
        lang: "en",
        page_path: null,
        rating_usefulness: 4,
        rating_ease_of_use: 4,
        rating_visual_design: 4,
        rating_content_clarity: 4,
        rating_future_use: 3,
      }),
      // Exact 3.0 -> neutral
      makeFeedbackItem({
        id: "b4",
        lang: "ru",
        page_path: "",
        rating_usefulness: 3,
        rating_ease_of_use: 3,
        rating_visual_design: 3,
        rating_content_clarity: 3,
        rating_future_use: 3,
      }),
      // 2.8 -> needsAttention
      makeFeedbackItem({
        id: "b5",
        lang: "ru",
        page_path: "/ru/guides",
        rating_usefulness: 3,
        rating_ease_of_use: 3,
        rating_visual_design: 3,
        rating_content_clarity: 3,
        rating_future_use: 2,
      }),
    ];

    const result = computeFeedbackBreakdowns(items);
    expect(result.total).toBe(5);
    expect(result.tiers.positive).toEqual({ count: 2, sharePct: 40 });
    expect(result.tiers.neutral).toEqual({ count: 2, sharePct: 40 });
    expect(result.tiers.needsAttention).toEqual({ count: 1, sharePct: 20 });

    // Page fallback "/" groups null and ""
    expect(result.byPage[0]).toEqual({ pagePath: "/", count: 2, avgRating: 3.4 });
    expect(result.byPage[1]).toEqual({ pagePath: "/ro/symptoms", count: 2, avgRating: 4.4 });
    expect(result.byPage[2]).toEqual({ pagePath: "/ru/guides", count: 1, avgRating: 2.8 });

    // Language breakdown sorted by count desc then lang asc
    expect(result.byLanguage).toEqual([
      { lang: "ro", count: 2, avgRating: 4.4 },
      { lang: "ru", count: 2, avgRating: 2.9 },
      { lang: "en", count: 1, avgRating: 3.8 },
    ]);
  });

  it("caps top pages at 8 entries", () => {
    const items = Array.from({ length: 12 }, (_, idx) =>
      makeFeedbackItem({
        id: `p-${idx}`,
        page_path: `/page-${idx}`,
      }),
    );
    const result = computeFeedbackBreakdowns(items);
    expect(result.byPage).toHaveLength(8);
  });
});

describe("feedback analytics translations hygiene across all 7 languages", () => {
  it("provides non-empty, sentence-cased copy with zero ampersands across all 7 languages", () => {
    const ALLOWED_ACRONYMS = new Set(["RO", "EN", "SQ", "IT", "HR", "ROM", "RU", "CSV", "AI", "IA"]);

    for (const lang of ALL_LANGS) {
      const copy = feedbackAnalyticsCopy[lang];
      expect(copy).toBeDefined();

      const staticStrings: string[] = [
        copy.satisfactionHeading,
        copy.satisfactionSubtitle,
        copy.tierPositive,
        copy.tierNeutral,
        copy.tierNeedsAttention,
        copy.tierEmpty,
        copy.keywordCloudHeading,
        copy.keywordCloudSubtitle,
        copy.keywordCloudEmpty,
        copy.keywordClear,
        copy.trendsHeading,
        copy.trendsDailyLabel,
        copy.trendsWeeklyLabel,
        copy.trendsResponsesLabel,
        copy.trendsAvgRatingLabel,
        copy.trendsEmpty,
        copy.breakdownsHeading,
        copy.byPageHeading,
        copy.byLanguageHeading,
        copy.noBreakdownData,
      ];

      const dynamicStrings: string[] = [
        copy.keywordActiveFilter("clinica", 4),
        copy.keywordMentionsAria("clinica", 4, false),
        copy.keywordMentionsAria("clinica", 4, true),
        copy.trendsBucketSummary("Apr 1", 3, "4.50"),
        copy.responsesCountShort(1),
        copy.responsesCountShort(5),
        copy.filteredCountSummary(4, 12),
      ];

      for (const text of [...staticStrings, ...dynamicStrings]) {
        expect(text.trim().length).toBeGreaterThan(0);
        expect(text).not.toContain("&");

        // No ALL CAPS words (except allowed acronyms)
        const words = text.split(/\s+/);
        for (const rawWord of words) {
          const clean = rawWord.replace(/[^A-Za-zÀ-žА-яЁё]/g, "");
          if (clean.length >= 2 && clean === clean.toUpperCase() && clean !== clean.toLowerCase()) {
            expect(ALLOWED_ACRONYMS.has(clean)).toBe(true);
          }
        }
      }

      // Check headings do not use English Title Case on multi-word headings
      for (const heading of [
        copy.satisfactionHeading,
        copy.keywordCloudHeading,
        copy.trendsHeading,
        copy.breakdownsHeading,
        copy.byPageHeading,
        copy.byLanguageHeading,
      ]) {
        const tokens = heading.split(/\s+/).slice(1);
        const unexpectedCapitalized = tokens.filter((word) => {
          const clean = word.replace(/[^A-Za-zÀ-žА-яЁё]/g, "");
          if (clean.length < 2 || ALLOWED_ACRONYMS.has(clean)) return false;
          return clean[0] === clean[0].toUpperCase() && clean[0] !== clean[0].toLowerCase();
        });
        expect(unexpectedCapitalized).toEqual([]);
      }
    }
  });
});

describe("FeedbackDashboard source invariants", () => {
  it("supports all 7 languages including ru in SUPPORTED_FILTER_LANGS, uses clinical-ruby for low scores inside .care-panel, and avoids rogue gold tokens", () => {
    const dashboardPath = path.resolve(
      process.cwd(),
      "src/components/panel/FeedbackDashboard.tsx",
    );
    const source = readFileSync(dashboardPath, "utf8");

    expect(source).toContain('["ro", "en", "sq", "it", "hr", "rom", "ru"]');
    expect(source).toContain("aria-pressed={isSelected}");
    expect(source).toContain("aria-pressed={isActive}");
    expect(source).toContain("bg-clinical-ruby");
    expect(source).toContain("text-clinical-ruby");
    expect(source).not.toContain("text-brand-gold");
  });
});
