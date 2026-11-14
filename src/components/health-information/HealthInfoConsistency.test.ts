import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LanguageContext } from "@/lib/i18n/language-context";
import { translations } from "@/lib/i18n/translations";
import { getHealthMyths } from "@/lib/i18n/health-myths";
import { DictionaryFilters, DictionarySearch, DictionarySpeakButton } from "./DictionaryParts";
import { DictionaryTabs } from "./DictionaryTabs";
import { RomanesGlossaryDrawer } from "./RomanesGlossaryDrawer";
import { RomanianDualRegisterGlossary } from "./RomanianDualRegisterGlossary";
import { TopicMythCard } from "./TopicMythCard";
import { HealthInformationTopicGrid } from "./HealthInformationTopicGrid";

const readSrc = (relPath: string) =>
  readFileSync(resolve(process.cwd(), relPath), "utf8");

describe("health information, glossary, myth card, and topic grid design consistency", () => {
  it("removes all rounded-full classes from glossary and dictionary components", () => {
    for (const file of [
      "src/components/health-information/DictionaryParts.tsx",
      "src/components/health-information/DictionaryTabs.tsx",
      "src/components/health-information/RomanesGlossaryDrawer.tsx",
      "src/components/health-information/RomanianDualRegisterGlossary.tsx",
    ]) {
      const source = readSrc(file);
      expect(source, `${file} must not contain rounded-full`).not.toContain("rounded-full");
      expect(source, `${file} must use focus-visible:ring-ring`).toContain("focus-visible:ring-ring");
      expect(source, `${file} must not use focus-visible:ring-sapphire`).not.toContain("focus-visible:ring-sapphire");
      expect(source, `${file} must meet >=44px touch targets`).toContain("min-h-11");
    }

    const parts = readSrc("src/components/health-information/DictionaryParts.tsx");
    expect(parts).toContain("min-h-12");
    expect(parts).toContain("h-11 w-11");
    expect(parts).toContain("right-0.5");
    expect(parts).toContain("border-border-control");
    expect(parts).toContain("press-row");
    expect(parts).toContain("rounded-xl");
    expect(parts).toContain("rounded-xs");
    // Filter counts are plain tabular text, never a tinted capsule.
    expect(parts).not.toContain("rounded-md px-1.5 py-0.5");
    expect(parts).not.toContain("bg-white/20");
    expect(parts).toContain("tabular-nums");
    expect(parts).not.toContain("min-h-[40px]");
    expect(parts).not.toContain("h-9 w-9");

    const tabs = readSrc("src/components/health-information/DictionaryTabs.tsx");
    // Tab counts are plain tabular text, never a tinted capsule.
    expect(tabs).not.toContain("rounded-md px-1.5 py-0.5");
    expect(tabs).not.toContain("bg-white/20");
    expect(tabs).toContain("tabular-nums");
    expect(tabs).not.toContain("min-h-[42px]");

    for (const drawerFile of [
      "src/components/health-information/RomanesGlossaryDrawer.tsx",
      "src/components/health-information/RomanianDualRegisterGlossary.tsx",
    ]) {
      const drawer = readSrc(drawerFile);
      expect(drawer).toContain("rounded-lg");
      // Category labels are plain text, never a tinted capsule.
      expect(drawer).not.toContain("rounded-md px-2.5 py-0.5");
      expect(drawer).not.toContain("min-h-[32px]");
      expect(drawer).not.toContain("min-h-[42px]");
    }
  });

  it("renders >=44px dictionary controls, rounded-xl filters/speak buttons, and plain-text counts and categories", () => {
    const searchHtml = renderToStaticMarkup(
      createElement(DictionarySearch, {
        value: "tensiune",
        onChange: () => {},
        placeholder: "Caută",
        clearLabel: "Șterge căutarea",
      }),
    );
    expect(searchHtml).toContain("min-h-12");
    expect(searchHtml).toContain("border-border-control");
    expect(searchHtml).toContain("h-11 w-11");
    expect(searchHtml).toContain("focus-visible:ring-ring");
    expect(searchHtml).not.toContain("rounded-full");

    const filtersHtml = renderToStaticMarkup(
      createElement(DictionaryFilters, {
        label: "Categorii",
        selected: "all",
        onSelect: () => {},
        options: [
          { value: "all", label: "Toate", count: 12 },
          { value: "cardiologie", label: "Inimă", count: 5 },
          { value: "urgente", label: "Urgențe", count: 3, tone: "emergency" },
        ],
      }),
    );
    expect(filtersHtml).toContain("min-h-11");
    expect(filtersHtml).toContain("rounded-xl");
    expect(filtersHtml).not.toContain("rounded-md");
    expect(filtersHtml).not.toContain("bg-white/20");
    expect(filtersHtml).toContain("tabular-nums");
    for (const count of [">12<", ">5<", ">3<"]) expect(filtersHtml).toContain(count);
    expect(filtersHtml).toContain("border-border-control");
    expect(filtersHtml).toContain("press-row");
    expect(filtersHtml).toContain("focus-visible:ring-ring");
    expect(filtersHtml).not.toContain("rounded-full");

    const romanesHtml = renderToStaticMarkup(
      createElement(
        LanguageContext.Provider,
        { value: { lang: "ro", t: translations.ro, setLang: () => {} } },
        createElement(RomanesGlossaryDrawer, { isOpen: true, onClose: () => {}, lang: "ro" }),
      ),
    );
    expect(romanesHtml).toContain("min-h-11");
    expect(romanesHtml).not.toContain("rounded-md px-2.5 py-0.5");
    expect(romanesHtml).toContain("focus-visible:ring-ring");
    expect(romanesHtml).not.toContain("rounded-full");

    const dualHtml = renderToStaticMarkup(
      createElement(
        LanguageContext.Provider,
        { value: { lang: "ro", t: translations.ro, setLang: () => {} } },
        createElement(RomanianDualRegisterGlossary, {
          isOpen: true,
          onClose: () => {},
          priorityTopicSlug: "heart-health",
          lang: "ro",
        }),
      ),
    );
    expect(dualHtml).toContain("min-h-11");
    expect(dualHtml).not.toContain("rounded-md");
    expect(dualHtml).toContain("focus-visible:ring-ring");
    expect(dualHtml).not.toContain("rounded-full");

    const speakHtml = renderToStaticMarkup(
      createElement(DictionarySpeakButton, {
        speaking: true,
        onClick: () => {},
        label: "Oprește",
      }),
    );
    expect(speakHtml).toContain("min-h-11");
    expect(speakHtml).toContain("rounded-xl");
    expect(speakHtml).toContain("rounded-xs");
    expect(speakHtml).toContain("focus-visible:ring-ring");
    expect(speakHtml).not.toContain("rounded-full");

    const tabsHtml = renderToStaticMarkup(
      createElement(DictionaryTabs, {
        active: "dictionary",
        dictionaryLabel: "Dicționar",
        romanesLabel: "În romani",
        dictionaryCount: 24,
        romanesCount: 16,
        onSelect: () => {},
      }),
    );
    expect(tabsHtml).toContain("min-h-11");
    expect(tabsHtml).not.toContain("rounded-md");
    expect(tabsHtml).toContain("tabular-nums");
    expect(tabsHtml).toContain(">24<");
    expect(tabsHtml).toContain(">16<");
    expect(tabsHtml).toContain("focus-visible:ring-ring");
    expect(tabsHtml).not.toContain("rounded-full");
  });

  it("uses neutral pre-answer buttons and semantic verdict tokens in TopicMythCard", () => {
    const mythSource = readSrc("src/components/health-information/TopicMythCard.tsx");
    expect(mythSource).not.toContain("rounded-full");
    expect(mythSource).not.toContain("border-live-sage/35");
    expect(mythSource).not.toContain("bg-live-sage-soft/30");
    expect(mythSource).not.toContain("border-primary/30");
    expect(mythSource).not.toContain("bg-primary-soft/30");
    expect(mythSource).not.toContain("focus-visible:ring-live-sage");
    expect(mythSource).not.toContain("focus-visible:ring-primary");
    expect(mythSource).not.toContain("text-emerald-800");
    expect(mythSource).not.toContain("text-emerald-300");
    expect(mythSource).not.toContain("text-red-300");

    expect(mythSource).toContain("border-border-control");
    expect(mythSource).toContain("press-row");
    expect(mythSource).toContain("focus-visible:ring-ring");
    expect(mythSource).toContain("motion-reduce:transition-none");
    expect(mythSource).toContain("text-sapphire dark:text-sapphire-border");
    expect(mythSource).toContain("text-foreground dark:text-paper");

    const myth = getHealthMyths("ro")[0];
    const html = renderToStaticMarkup(
      createElement(
        LanguageContext.Provider,
        { value: { lang: "ro", t: translations.ro, setLang: () => {} } },
        createElement(TopicMythCard, { myth, lang: "ro" }),
      ),
    );
    expect(html).toContain("min-h-12");
    expect(html).toContain("border-border-control");
    expect(html).toContain("press-row");
    expect(html).toContain("focus-visible:ring-ring");
    expect(html).toContain("text-sapphire");
    expect(html).toContain("text-muted-foreground");
    expect(html).not.toContain("bg-live-sage-soft");
    expect(html).not.toContain("bg-primary-soft");
    expect(html).not.toContain("rounded-full");
  });

  it("enforces calm motion, >=44px controls, border-border-control, and zero scale transforms in HealthInformationTopicGrid", () => {
    const gridSource = readSrc("src/components/health-information/HealthInformationTopicGrid.tsx");
    expect(gridSource).toContain("min-h-11");
    expect(gridSource).toContain("border-border-control");
    expect(gridSource).toContain("focus-visible:ring-ring");
    expect(gridSource).toContain("press-row");
    expect(gridSource).toContain("motion-reduce:transition-none");
    expect(gridSource).toContain("openSmartSearch()");
    expect(gridSource).not.toContain('type="search"');
    expect(gridSource).not.toContain("focus-visible:ring-sapphire");
    expect(gridSource).not.toMatch(/\b(?:active|group-hover):scale-/);
    expect(gridSource).not.toContain("scale-[");

    const html = renderToStaticMarkup(
      createElement(
        LanguageContext.Provider,
        { value: { lang: "ro", t: translations.ro, setLang: () => {} } },
        createElement(HealthInformationTopicGrid, {}),
      ),
    );
    expect(html).toContain("min-h-11");
    expect(html).toContain("border-border-control");
    expect(html).toContain("focus-visible:ring-ring");
    expect(html).toContain("press-row");
    expect(html).not.toContain("scale-[");
    expect(html).not.toContain("rounded-full");
  });
});
