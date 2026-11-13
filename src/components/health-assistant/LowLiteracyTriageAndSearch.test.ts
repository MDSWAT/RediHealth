import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { activateQuickPrompt } from "@/components/health-assistant/TriageInputBar";
import { classifyLocalIntent } from "@/components/health-assistant/intent-keywords";
import { classifyIntentToPathway } from "@/lib/triage-state";
import { searchSmartCatalog } from "@/lib/search/smart-search-engine";

const readSrc = (relPath: string) => readFileSync(resolve(process.cwd(), relPath), "utf8");

describe("Scenario 1: one-tap starter chips", () => {
  it("sets the query and submits immediately with the trimmed prompt", () => {
    const setQuery = vi.fn();
    const onSubmit = vi.fn();
    activateQuickPrompt("  Am febră de 2 zile  ", setQuery, onSubmit);
    expect(setQuery).toHaveBeenCalledWith("Am febră de 2 zile");
    expect(onSubmit).toHaveBeenCalledWith("Am febră de 2 zile");
  });

  it("ignores empty prompts", () => {
    const setQuery = vi.fn();
    const onSubmit = vi.fn();
    activateQuickPrompt("   ", setQuery, onSubmit);
    expect(setQuery).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("uses 44px touch targets and no pills", () => {
    const src = readSrc("src/components/health-assistant/TriageInputBar.tsx");
    expect(src).toContain("activateQuickPrompt(prompt");
    expect(src).not.toContain("sm:min-h-10");
    expect(src).not.toContain("sm:text-xs");
    expect(src).not.toContain("rounded-full");
    expect(src).toContain("whitespace-nowrap");
  });
});

describe("Scenario 2: colloquial, phonetic, dental, pediatric and no-ID queries", () => {
  const cases: Array<[string, string]> = [
    ["ma doare capu", "symptoms"],
    ["durere de măsea", "symptoms"],
    ["mă doare dintele", "symptoms"],
    ["copilu arde", "symptoms"],
    ["bebe arde", "symptoms"],
    ["tusesc cu sange", "symptoms"],
    ["reteta compensata", "prescription"],
    ["pastile tensiune", "prescription"],
    ["sirop pentru copil", "prescription"],
    ["n-am acte", "navigation"],
    ["n am buletin", "navigation"],
    ["fara card", "navigation"],
    ["doctor gratis", "navigation"],
    ["fără buletin", "navigation"],
  ];
  it.each(cases)("classifies %s as %s", (query, expected) => {
    expect(classifyIntentToPathway(query)).toBe(expected);
  });

  const local: Array<[string, string, string]> = [
    ["my tooth hurts", "en", "symptoms"],
    ["no id doctor", "en", "navigation"],
    ["uninsured", "en", "navigation"],
    ["meds for pressure", "en", "prescription"],
    ["pa dokument", "sq", "navigation"],
    ["senza tessera", "it", "navigation"],
    ["bez dokumenata", "hr", "navigation"],
    ["нет документов", "ru", "navigation"],
    ["болит зуб", "ru", "symptoms"],
    ["nane buletin", "rom", "navigation"],
  ];
  it.each(local)("locally classifies %s (%s) as %s", (query, lang, expected) => {
    expect(classifyLocalIntent(query, lang)).toBe(expected);
  });

  it("surfaces useful tools for colloquial searches", () => {
    const useful = /find-help|health-assistant|health-check|prescription-review|get-help|mediatori|insurance|asigur|guide|ghid/;
    for (const q of ["n am acte", "n-am buletin", "doctor gratis", "ma doare capu", "durere de masea", "reteta compensata", "copilu arde"]) {
      const res = searchSmartCatalog(q, { lang: "ro" });
      expect(res.results.length, q).toBeGreaterThan(0);
      expect(res.results.slice(0, 5).some((r) => useful.test(r.href)), q).toBe(true);
    }
  });

  it("keeps modal chips at 44px without pills", () => {
    const src = readSrc("src/components/search/SmartSearchModal.tsx");
    expect(src).not.toContain("rounded-full");
  });
});

describe("Scenario 3: prescription listen button and schedule clarity", () => {
  const src = readSrc("src/components/health-assistant/PrescriptionStructuredResult.tsx");
  it("has a 44px listen button with readable text", () => {
    expect(src).toContain("inline-flex min-h-11 shrink-0 items-center gap-1.5 self-start rounded-lg border px-3.5 py-2 text-sm font-semibold whitespace-nowrap");
  });
  it("uses larger slot icons and labels", () => {
    expect(src).toContain('className={`h-5 w-5 shrink-0 ${');
    expect(src).toContain("className={`text-sm ${");
  });
});
