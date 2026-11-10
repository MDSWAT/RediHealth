import { describe, expect, it } from "vitest";
import { createDemoData } from "@/lib/demo-panel";
import { demoPanelTranslations } from "@/lib/i18n/demo-panel-translations";

/** Sentences in the sample data (names, emails, ids and dates are not translated). */
function sampleSentences(value: unknown, out = new Set<string>()): Set<string> {
  if (typeof value === "string") {
    if (/\s/.test(value) && /[a-z]{3}/.test(value) && !/@|^Dr\. |^[A-Z][a-z]+ Demo$/.test(value)) out.add(value);
  } else if (Array.isArray(value)) value.forEach((item) => sampleSentences(item, out));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => sampleSentences(item, out));
  return out;
}

describe("demo sample data translations", () => {
  it("translates every sample sentence for ro, sq and it", () => {
    const sentences = [...sampleSentences(createDemoData(new Date(2026, 10, 9)))];
    expect(sentences.length).toBeGreaterThan(0);
    for (const lang of ["ro", "sq", "it"] as const) {
      const missing = sentences.filter((text) => !demoPanelTranslations[lang].seed[text]);
      expect(missing, lang).toEqual([]);
    }
  });

  it("keeps the same seed keys in every translated locale", () => {
    const keys = Object.keys(demoPanelTranslations.ro.seed).sort();
    expect(Object.keys(demoPanelTranslations.sq.seed).sort()).toEqual(keys);
    expect(Object.keys(demoPanelTranslations.it.seed).sort()).toEqual(keys);
  });
});
