import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LanguageContext } from "@/lib/i18n/language-context";
import { translations } from "@/lib/i18n/translations";
import { HEALTH_DETAIL_SHARED_STRINGS, getHealthMyths } from "@/lib/i18n/health-myths";
import { GlobalHealthAudioPlayer } from "./GlobalHealthAudioPlayer";
import { DictionaryFilters, DictionarySearch, DictionarySpeakButton } from "./DictionaryParts";
import { DictionaryTabs } from "./DictionaryTabs";
import { RomanesGlossaryDrawer } from "./RomanesGlossaryDrawer";
import { RomanianDualRegisterGlossary } from "./RomanianDualRegisterGlossary";
import { TopicMythCard } from "./TopicMythCard";
import { HealthInformationTopicGrid } from "./HealthInformationTopicGrid";
import { TopicMetaBadge } from "./TopicMetaBadge";
import { HEALTH_HUB_EXPLORER_COPY } from "./HealthInformationPageContent";
import { HealthArticleDirectory } from "./HealthArticleDirectory";
import { MobileGuideJumpBar } from "./MobileGuideJumpBar";
import { SynchronizedSentenceReader } from "./SynchronizedSentenceReader";
import { TopicDetailPageContent } from "./TopicDetailPageContent";
import {
  HEALTH_TOPICS_BASE,
  getHealthTopicBySlug,
} from "@/lib/i18n/health-information-topics";
import { formatHealthArticleTitle, healthArticleIndex } from "@/lib/data/health-article-index";
import { EXCLUDED_ARTICLE_IDS } from "@/lib/data/informedhealth-directory";

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
    // The dictionary tabs are a two-way capsule switch: track, thumb and two options, nothing else.
    expect(tabsHtml).toContain("data-capsule-switch");
    expect(tabsHtml.split("rounded-full").length - 1).toBe(4);
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
        createElement(HealthInformationTopicGrid, { onOpenDictionary: () => {} }),
      ),
    );
    expect(html).toContain("min-h-11");
    expect(html).toContain("border-border-control");
    expect(html).toContain("focus-visible:ring-ring");
    expect(html).toContain("press-row");
    expect(html).not.toContain("scale-[");
    {
      // Pill shapes are allowed only inside two-way capsule switches (track, thumb, two options).
      const pillCount = html.split("rounded-full").length - 1;
      const switchCount = html.split("data-capsule-switch").length - 1;
      expect(pillCount).toBe(switchCount * 4);
    }
  });

  it("P12: keeps audio player bar compact below 640px with words, --player-h padding, and nearest sentence scroll", () => {
    const allLangs = ["ro", "en", "sq", "it", "hr", "rom", "ru"] as const;
    const gapStrings = HEALTH_DETAIL_SHARED_STRINGS.globalAudioPlayer;

    for (const loc of allLangs) {
      for (const key of ["slower", "normal", "backSentence", "nextSentence", "moreControls"] as const) {
        const val = gapStrings[key][loc];
        expect(val.trim().length, `${key}.${loc} must be non-empty`).toBeGreaterThan(0);
        expect(val, `${key}.${loc} must not contain ampersand`).not.toContain("&");
        expect(val.length, `${key}.${loc} must stay compact`).toBeLessThanOrEqual(12);
      }
      expect(gapStrings.slower[loc]).not.toMatch(/\d|\bx\b/i);
      expect(gapStrings.normal[loc]).not.toMatch(/\d|\bx\b/i);
    }

    const playerSrc = readSrc("src/components/health-information/GlobalHealthAudioPlayer.tsx");
    expect(playerSrc).toContain("(max-width: 639.98px)");
    expect(playerSrc).toContain("fixed inset-x-0 bottom-0");
    expect(playerSrc).toContain("min-h-16");
    expect(playerSrc).toContain("env(safe-area-inset-bottom)");
    expect(playerSrc).toContain("--player-h");
    expect(playerSrc).toContain("data-audio-player-open");
    expect(playerSrc).toContain("data-bottom-bar");
    expect(playerSrc).not.toContain("0.85x");
    expect(playerSrc).not.toContain("1.0x");
    expect(playerSrc).not.toContain("text-[11px]");
    expect(playerSrc).not.toContain("rounded-full");

    const readerSrc = readSrc("src/components/health-information/SynchronizedSentenceReader.tsx");
    expect(readerSrc).toContain('block: "nearest"');
    expect(readerSrc).not.toContain('block: "center"');

    const cssSrc = readSrc("src/app/globals.css");
    expect(cssSrc).toContain('html[data-audio-player-open="true"] main');
    expect(cssSrc).toContain("var(--player-h, 0px)");

    for (const loc of ["ro", "en", "it", "hr", "ru"] as const) {
      const html = renderToStaticMarkup(
        createElement(
          LanguageContext.Provider,
          { value: { lang: loc, t: translations[loc], setLang: () => {} } },
          createElement(GlobalHealthAudioPlayer, {
            title: "Heart health",
            textToNarrate: "First sentence. Second sentence.",
            durationMinutes: 3,
            isOpen: true,
            onClose: () => {},
            lang: loc,
          }),
        ),
      );
      expect(html).toContain(gapStrings.backSentence[loc]);
      expect(html).toContain(gapStrings.nextSentence[loc]);
      expect(html).toContain(gapStrings.slower[loc]);
      expect(html).toContain('data-bottom-bar=""');
      expect(html).not.toContain("0.85x");
      expect(html).not.toContain("1.0x");
      expect(html).not.toContain("rounded-full");
    }
  });

  it("P20: renders Learn and test yourself 4-tab hub, all 8 guides with tool links, single-control search, and lighter cards", () => {
    const pageSrc = readSrc("src/components/health-information/HealthInformationPageContent.tsx");
    expect(pageSrc).toContain('role="tablist"');
    expect(pageSrc).toContain('role="tabpanel"');
    expect(pageSrc).toContain("TAB_LIST_CLASS");
    expect(pageSrc).toContain("DualRegisterGlossaryContent");
    expect(pageSrc).toContain("TrueFalseQuizSection");
    expect(pageSrc).not.toContain("shadow-2xs");
    expect(pageSrc).not.toContain("/health-check");

    for (const loc of ["ro", "en", "sq", "it", "hr", "rom", "ru"] as const) {
      expect(HEALTH_HUB_EXPLORER_COPY[loc].onThisPage.trim().length).toBeGreaterThan(0);
      expect(HEALTH_HUB_EXPLORER_COPY[loc].title.trim().length).toBeGreaterThan(0);
      expect(HEALTH_HUB_EXPLORER_COPY[loc].subtitle.trim().length).toBeGreaterThan(0);
      expect(HEALTH_HUB_EXPLORER_COPY[loc].dictionary.trim().length).toBeGreaterThan(0);
    }

    const gridSrc = readSrc("src/components/health-information/HealthInformationTopicGrid.tsx");
    expect(gridSrc).toContain("getHealthTopicsList");
    expect(gridSrc).not.toContain("getFeaturedHealthTopics");
    expect(gridSrc).not.toContain("searchCopy.triggerLabel");
    expect(gridSrc).not.toContain("CardCategory");
    expect(gridSrc).not.toContain("h-9 w-9");
    expect(gridSrc).not.toContain("keyFactLabel");
    expect(gridSrc).not.toContain("/health-check");

    const badgeSrc = readSrc("src/components/health-information/TopicMetaBadge.tsx");
    expect(badgeSrc).not.toContain("<svg");
    expect(badgeSrc).not.toContain("VolumeIcon");

    const gridHtml = renderToStaticMarkup(
      createElement(
        LanguageContext.Provider,
        { value: { lang: "en", t: translations.en, setLang: () => {} } },
        createElement(HealthInformationTopicGrid, { onOpenDictionary: () => {} }),
      ),
    );
    expect(gridHtml).not.toContain("Key clinical fact");
    expect(gridHtml).toContain("Understand your blood pressure");
    expect(gridHtml).toContain("#section-explainer");
    expect(gridHtml).toContain("3 min read");
    expect(gridHtml).toContain("Medical dictionary");

    const badgeHtml = renderToStaticMarkup(
      createElement(
        LanguageContext.Provider,
        { value: { lang: "en", t: translations.en, setLang: () => {} } },
        createElement(TopicMetaBadge, { readMinutes: 3, audioMinutes: 2, bordered: false, lang: "en" }),
      ),
    );
    expect(badgeHtml).toContain("3 min read");
    expect(badgeHtml).toContain("2 min audio");
    expect(badgeHtml).not.toContain("<svg");
  });

  it("P50 (Steps 1, 4, 5): omits indexed coverage banner and publishes no Germany-specific articles", () => {
    const dirSrc = readSrc("src/components/health-information/HealthArticleDirectory.tsx");
    expect(dirSrc).not.toContain("coverage.json");
    expect(dirSrc).not.toContain("copy.coverage");

    const gridSrc = readSrc("src/components/health-information/HealthInformationTopicGrid.tsx");
    expect(gridSrc).not.toContain("keyFactLabel");

    // Articles about the German health system were removed in every language, and no title is prefixed with a country.
    const germanAreas = ["health-care-in-germany", "individual-health-care-services-igel", "early-benefit-assessment-of-medications"];
    for (const item of healthArticleIndex) {
      expect(EXCLUDED_ARTICLE_IDS.has(item.id), item.id).toBe(false);
      expect(item.areaIds.some((areaId) => germanAreas.includes(areaId)), item.id).toBe(false);
      expect(item.areaIds.length, item.id).toBeGreaterThan(0);
    }
    const doctorEntry = healthArticleIndex.find((item) => item.id === "at-the-doctors")!;
    for (const loc of ["ro", "en", "sq", "it", "hr", "rom", "ru"] as const) {
      expect(formatHealthArticleTitle(doctorEntry, loc)).toBe(doctorEntry.titles[loc]);
    }

    const dirHtml = renderToStaticMarkup(
      createElement(
        LanguageContext.Provider,
        { value: { lang: "en", t: translations.en, setLang: () => {} } },
        createElement(HealthArticleDirectory, { areaId: "making-an-informed-decision" }),
      ),
    );
    expect(dirHtml).toContain("At the doctor&#x27;s:");
    expect(dirHtml).not.toContain("In Germany");
    expect(dirHtml).not.toContain("indexed topics");
  });

  it("eliminates simple-vs-complete reading-level splits and adds print/offline actions across guides", () => {
    for (const filePath of [
      "src/components/health-information/HealthInformationPageContent.tsx",
      "src/components/health-information/HealthInformationTopicGrid.tsx",
      "src/components/health-information/TopicDetailPageContent.tsx",
      "src/components/health-information/TopicHeroSection.tsx",
    ]) {
      const src = readSrc(filePath);
      expect(src, `${filePath} must not use useReadingLevel()`).not.toContain("useReadingLevel()");
      expect(src, `${filePath} must not split simple vs complete`).not.toContain('useState<"simple" | "complete">');
    }

    expect(readSrc("src/components/health-information/TopicHeroSection.tsx")).toContain(
      "GuideOfflinePrintActions",
    );
    expect(readSrc("src/components/health-information/SubjectHeaderToolbar.tsx")).toContain(
      "GuideOfflinePrintActions",
    );
  });

  it("renders the floating guide section control on every width across all 7 locales with a reachable, single-line trigger", () => {
    const jumpBarSrc = readSrc(
      "src/components/health-information/MobileGuideJumpBar.tsx",
    );
    expect(jumpBarSrc).toContain("prefersCalmOrReducedMotion");
    expect(jumpBarSrc).not.toContain("lg:hidden");
    expect(jumpBarSrc).toContain("min-h-11");
    expect(jumpBarSrc).toContain("whitespace-nowrap");
    expect(jumpBarSrc).toContain("focus-visible:ring-ring");
    expect(jumpBarSrc).toContain("aria-expanded");
    expect(jumpBarSrc).toContain("Escape");
    expect(jumpBarSrc).not.toContain("rounded-full");
    expect(jumpBarSrc).not.toContain("transition-all");
    expect(jumpBarSrc).not.toContain("data-bottom-bar");
    // Rises above the audio player instead of hiding under it.
    expect(readSrc("src/app/globals.css")).toMatch(
      /\.guide-contents-float\s*\{[^}]*var\(--player-h/,
    );

    const sampleBarHtml = renderToStaticMarkup(
      createElement(
        LanguageContext.Provider,
        { value: { lang: "en", t: translations.en, setLang: () => {} } },
        createElement(MobileGuideJumpBar, {
          ariaLabel: "Article sections",
          sections: [
            { id: "section-overview", label: "Overview" },
            { id: "section-steps", label: "What to do" },
            { id: "section-warning-signs", label: "Warning signs" },
          ],
        }),
      ),
    );
    expect(sampleBarHtml).toContain("data-mobile-guide-jump-bar");
    expect(sampleBarHtml).not.toContain("lg:hidden");
    expect(sampleBarHtml).toContain("fixed");
    expect(sampleBarHtml).toContain("guide-contents-float");
    expect(sampleBarHtml).toContain('aria-expanded="false"');
    expect(sampleBarHtml).toContain("1 / 3");
    expect(sampleBarHtml).toContain("min-h-11");
    expect(sampleBarHtml).toContain("whitespace-nowrap");
    expect(sampleBarHtml).toContain('href="#section-overview"');
    expect(sampleBarHtml).toContain('aria-current="location"');
    expect(sampleBarHtml).not.toContain("rounded-full");
    expect(sampleBarHtml).not.toContain("\u00b7");
    expect(sampleBarHtml).not.toContain("&amp;");

    const baseTopic = HEALTH_TOPICS_BASE[0]!;
    for (const loc of ["ro", "en", "sq", "it", "hr", "rom", "ru"] as const) {
      const topic = getHealthTopicBySlug(loc, baseTopic.slug)!;
      const detailHtml = renderToStaticMarkup(
        createElement(
          LanguageContext.Provider,
          { value: { lang: loc, t: translations[loc], setLang: () => {} } },
          createElement(TopicDetailPageContent, {
            topic,
            relatedTopics: [],
          }),
        ),
      );
      expect(detailHtml).toContain("data-mobile-guide-jump-bar");
      expect(detailHtml).not.toContain("group/toc");
      expect(detailHtml).not.toContain("\u00b7");
      const pillCount = detailHtml.match(/rounded-full/g)?.length ?? 0;
      const switchCount = detailHtml.match(/data-capsule-switch=""/g)?.length ?? 0;
      expect(pillCount).toBe(switchCount * 4);
      const jumpStart = detailHtml.indexOf("data-mobile-guide-jump-bar");
      const jumpSectionHtml = detailHtml.slice(
        jumpStart,
        detailHtml.indexOf("</nav>", jumpStart) + 6,
      );
      expect(jumpSectionHtml).not.toContain("&amp;");
    }
  });

  it("keeps active sentence scrolling unobscured and pauses auto-scroll on manual scroll until audio play/seek", () => {
    const readerSrc = readSrc(
      "src/components/health-information/SynchronizedSentenceReader.tsx",
    );
    const playerSrc = readSrc(
      "src/components/health-information/GlobalHealthAudioPlayer.tsx",
    );
    const detailSrc = readSrc(
      "src/components/health-information/TopicDetailPageContent.tsx",
    );

    expect(readerSrc).toContain('block: "nearest"');
    expect(readerSrc).not.toContain('block: "center"');
    expect(readerSrc).toContain("scroll-mt-20");
    expect(readerSrc).toContain("scroll-mb-20");
    expect(readerSrc).toContain("autoScrollResumeKey");
    expect(readerSrc).toContain("userPausedAutoScrollRef");
    expect(readerSrc).toContain('addEventListener("wheel"');
    expect(readerSrc).toContain('addEventListener("touchmove"');
    expect(readerSrc).toContain('addEventListener("scroll"');
    expect(readerSrc).toContain("speechEngine.subscribeState");

    expect(playerSrc).toContain("onUserPlayOrSeek");
    expect(playerSrc).toContain("onUserPlayOrSeekRef.current?.()");

    expect(detailSrc).toContain("autoScrollResumeKey={");
    expect(detailSrc).toContain("onUserPlayOrSeek={");

    const readerHtml = renderToStaticMarkup(
      createElement(
        LanguageContext.Provider,
        { value: { lang: "en", t: translations.en, setLang: () => {} } },
        createElement(SynchronizedSentenceReader, {
          paragraphs: ["Drink water slowly. Rest if dizzy."],
          activeSentenceIndex: 0,
          autoScrollResumeKey: 1,
          lang: "en",
        }),
      ),
    );
    expect(readerHtml).toContain('data-sentence-id="0"');
    expect(readerHtml).toContain("scroll-mt-20");
    expect(readerHtml).toContain("scroll-mb-20");
  });

  it("enforces responsive wrapping, accessible contrast, and CLAUDE.md UI rules across topic guide and summary components", () => {
    const heroSrc = readSrc("src/components/health-information/TopicHeroSection.tsx");
    expect(heroSrc).toContain("md:aspect-[4/3]");
    expect(heroSrc).not.toContain("sm:aspect-[4/3]");
    expect(heroSrc).toContain('sizes="(max-width: 767px) 100vw, 208px"');
    expect(heroSrc).toContain("btn-row flex w-full flex-wrap items-start gap-2.5");
    expect(heroSrc).not.toContain("border-sapphire/35!");
    expect(heroSrc).not.toContain("bg-sapphire-soft/45!");

    const detailSrc = readSrc("src/components/health-information/TopicDetailPageContent.tsx");
    expect(detailSrc).toContain("btn-row flex flex-wrap items-center gap-2");
    expect(detailSrc).not.toContain("grid w-full grid-cols-2");
    expect(detailSrc).not.toContain("<BookIcon");
    expect(detailSrc).toContain("border-border-control bg-card");

    const summaryPageSrc = readSrc("src/app/health-information/topics/[topic]/page.tsx");
    expect(summaryPageSrc).toContain("saveTitle={summary.title}");
    expect(summaryPageSrc).toContain('<section aria-labelledby="summary-overview">');
    expect(summaryPageSrc).not.toContain('<section aria-labelledby="summary-overview" className="mt-10">');
    expect(summaryPageSrc).toContain('<footer className="mt-12 border-t border-border pt-8" aria-labelledby="summary-source">');
    expect(summaryPageSrc).toContain("dark:text-sapphire-border");

    const mythSrc = readSrc("src/components/health-information/TopicMythCard.tsx");
    expect(mythSrc).not.toContain("text-paper dark:text-ink-950");
    expect(mythSrc).toContain('hasAnswered && chosen && !isMatch && "text-rose-ink"');
    expect(mythSrc).not.toContain("truncate");
    expect(mythSrc).toContain("flex-wrap items-start justify-between");

    const anatomySrc = readSrc("src/components/health-information/TopicAnatomyExplorer.tsx");
    expect(anatomySrc).toContain("btn-row mt-3 flex flex-wrap items-center gap-2.5");
    expect(anatomySrc).toContain("whitespace-nowrap");
    expect(anatomySrc).not.toContain("sm:grid-cols-3");
    expect(anatomySrc).not.toContain("md:grid-cols-3");
    expect(anatomySrc).toContain("sm:flex-wrap");
    expect(anatomySrc).not.toContain("EyebrowIcon");

    const bpSimSrc = readSrc("src/components/health-information/heart-health/BloodPressureSimulator.tsx");
    expect(bpSimSrc).toContain("btn-row mt-2 flex flex-wrap items-center gap-2");
    expect(bpSimSrc).not.toContain("flex w-max");
    expect(bpSimSrc).not.toContain("sm:overflow-visible");
    expect(bpSimSrc).not.toContain("sm:basis-0");
    expect(bpSimSrc).not.toContain("rounded-md border px-3 py-1");
    expect(bpSimSrc).not.toContain("<CheckCircleIcon");
    expect(bpSimSrc).not.toContain("<AlertCircleIcon");
    expect(bpSimSrc).toContain("border-border-control");
    expect(bpSimSrc).toContain("whitespace-nowrap");

    for (const file of [
      "src/components/health-information/WhyItMattersInfographic.tsx",
      "src/components/health-information/ActionableStepsChecklist.tsx",
      "src/components/health-information/WarningSignsEmergencyCard.tsx",
    ]) {
      const src = readSrc(file);
      expect(src, `${file} section heading row must wrap safely`).toContain("flex-wrap items-start justify-between");
      expect(src, `${file} must preserve dark-mode sapphire contrast`).toContain("dark:text-sapphire-border");
    }

    const nextStepsSrc = readSrc("src/components/health-information/TopicNextSteps.tsx");
    expect(nextStepsSrc).toContain("min-w-0 flex-1");
    expect(nextStepsSrc).toContain("md:flex-wrap");
    expect(nextStepsSrc).not.toContain("truncate");

    const disclaimerSrc = readSrc("src/components/health-information/MedicalSafetyDisclaimer.tsx");
    expect(disclaimerSrc).not.toContain("<ShieldIcon");
    expect(disclaimerSrc).toContain("min-w-0");
  });
});
