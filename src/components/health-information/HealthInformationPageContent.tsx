"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";
import { ArticleListenButton } from "./ArticleListenButton";
import { HealthInformationTopicGrid } from "./HealthInformationTopicGrid";
import { DICTIONARY_TAB_LABELS } from "./DictionaryTabs";
import { RomanesGlossaryContent } from "./RomanesGlossaryDrawer";
import { DualRegisterGlossaryContent } from "./RomanianDualRegisterGlossary";
import { TopicNextSteps } from "./TopicNextSteps";
import { ROMANIAN_MEDICAL_GLOSSARY } from "@/lib/i18n/romanian-medical-glossary";
import { ROMANES_GLOSSARY_TERMS } from "@/lib/i18n/romanes-glossary";
import { HealthTopicCategories } from "./HealthTopicCategories";
import { TrueFalseQuizSection } from "@/components/landing/TrueFalseQuizSection";
import { HEALTH_HUB_EXPLORER_COPY } from "@/lib/i18n/learn-hub-copy";
import { TOOL_LABELS_BY_SLUG, getHealthTopicsList } from "@/lib/i18n/health-information-topics";
import { handleTabKey, tabClass, TAB_LIST_CLASS } from "./diabetes/choice-styles";
import {
  LEARN_HUB_TABS,
  type LearnHubInitialState,
  type LearnHubTab,
} from "@/lib/learn-hub-params";

export { LEARN_HUB_TABS, type LearnHubTab };

export { HEALTH_HUB_EXPLORER_COPY };

/** Kept for links that pass an initial tab alias. */
export type HealthInfoView = "menu" | "topics" | "triage";

export interface HealthInformationPageContentProps extends LearnHubInitialState {
  initialView?: HealthInfoView;
  initialViewMode?: HealthInfoView;
  initialCategory?: string;
}

function useSafeLanguage() {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

function resolveTabFromUrl(): { tab: LearnHubTab | null; dictSub: "dictionary" | "romanes" | null } {
  if (typeof window === "undefined") return { tab: null, dictSub: null };
  const params = new URLSearchParams(window.location.search);
  const qTab = params.get("tab");
  const hash = window.location.hash.replace(/^#/, "");

  // "romanes-glossary", "medical-glossary" and "quiz-section-heading" are the addresses the site
  // search and older links use; without them a dictionary word opened the guides tab.
  if (hash === "romanes" || hash === "romanes-glossary" || qTab === "romanes") {
    return { tab: "dictionary", dictSub: "romanes" };
  }
  if (
    qTab === "dictionary" ||
    hash === "dictionary" ||
    hash === "medical-dictionary" ||
    hash === "medical-glossary"
  ) {
    return { tab: "dictionary", dictSub: params.get("sub") === "romanes" ? "romanes" : null };
  }
  if (
    qTab === "quiz" ||
    hash === "mituri-sanatate" ||
    hash === "quiz" ||
    hash === "quiz-section-heading"
  ) {
    return { tab: "quiz", dictSub: null };
  }
  if (qTab === "topics" || hash === "health-topics") {
    return { tab: "topics", dictSub: null };
  }
  if (qTab === "guides" || hash === "health-guides") {
    return { tab: "guides", dictSub: null };
  }
  return { tab: null, dictSub: null };
}

/**
 * Learn and test yourself hub: 4 clear tabs covering all 8 interactive guides,
 * the topic library, the true-or-false myth check, and the inline dual-register + Romani dictionary.
 */
export function HealthInformationPageContent(props: HealthInformationPageContentProps = {}) {
  const {
    initialView,
    initialCategory = "toate",
    initialTab,
    initialDictionarySub,
    initialDictionaryQuery,
    initialTopicCategory,
  } = props;
  const { lang } = useSafeLanguage();

  const [activeTab, setActiveTab] = useState<LearnHubTab>(
    initialTab ?? (initialView === "topics" ? "topics" : "guides"),
  );
  const [dictSubTab, setDictSubTab] = useState<"dictionary" | "romanes">(
    initialDictionarySub ?? "dictionary",
  );
  const explorer = HEALTH_HUB_EXPLORER_COPY[lang] ?? HEALTH_HUB_EXPLORER_COPY.ro;

  useEffect(() => {
    const syncFromUrl = () => {
      const resolved = resolveTabFromUrl();
      if (resolved.tab) {
        setActiveTab(resolved.tab);
      }
      if (resolved.dictSub) {
        setDictSubTab(resolved.dictSub);
      }
    };
    syncFromUrl();
    window.addEventListener("hashchange", syncFromUrl);
    return () => window.removeEventListener("hashchange", syncFromUrl);
  }, []);

  const handleSelectTab = useCallback((nextTab: LearnHubTab) => {
    setActiveTab(nextTab);
    if (typeof window !== "undefined") {
      try {
        const nextUrl = new URL(window.location.href);
        // The looked-up word, the open topic group and the dictionary side belong to the tab left behind.
        nextUrl.searchParams.delete("q");
        nextUrl.searchParams.delete("cat");
        nextUrl.searchParams.delete("sub");
        if (nextTab === "guides") {
          nextUrl.searchParams.delete("tab");
          nextUrl.hash = "";
        } else {
          nextUrl.searchParams.set("tab", nextTab);
          if (nextTab === "topics") nextUrl.hash = "#health-topics";
          else if (nextTab === "quiz") nextUrl.hash = "#mituri-sanatate";
          else nextUrl.hash = "";
        }
        window.history.replaceState(null, "", nextUrl.toString());
      } catch {
        // Ignore history state errors
      }
    }
  }, []);

  const sharedTabCopy = DICTIONARY_TAB_LABELS[lang] ?? DICTIONARY_TAB_LABELS.ro;
  const inlineDictionaryTabs = {
    dictionaryLabel: sharedTabCopy.dictionary,
    romanesLabel: sharedTabCopy.romanes,
    tablistAriaLabel: sharedTabCopy.tablistAria,
    dictionaryCount: ROMANIAN_MEDICAL_GLOSSARY.length,
    romanesCount: ROMANES_GLOSSARY_TERMS.length,
    onSelect: (tab: "dictionary" | "romanes") => setDictSubTab(tab),
  };

  const tabLabels: Record<LearnHubTab, string> = {
    guides: explorer.guides,
    topics: explorer.topics,
    quiz: explorer.myths,
    dictionary: explorer.dictionary,
  };

  // Read aloud, the page says what is on it: the four tabs, then each guide with its tool.
  // A person who cannot read the page hears where things are, not only the heading.
  const pageNarration = useMemo(() => {
    const guides = getHealthTopicsList(lang).map((topic) => {
      const tool = TOOL_LABELS_BY_SLUG[topic.slug]?.[lang];
      return tool ? `${topic.title}: ${tool}` : topic.title;
    });
    return [
      explorer.title,
      explorer.subtitle,
      [explorer.guides, explorer.topics, explorer.myths, explorer.dictionary].join(". "),
      ...guides,
    ]
      .map((part) => part.trim().replace(/[.:]+$/, ""))
      .filter(Boolean)
      .join(". ")
      .concat(".");
  }, [explorer, lang]);

  return (
    <main id="main-content" className="flex-1 bg-background">
      <section className="pb-12 sm:pb-16">
        <Container>
          <PageHeader
            title={explorer.title}
            lead={explorer.subtitle}
            actions={
              <ArticleListenButton
                uiLang={lang}
                textToSpeak={pageNarration}
              />
            }
          />

          <div
            role="tablist"
            aria-label={explorer.exploreAria}
            className={`${TAB_LIST_CLASS} mt-6`}
          >
            {LEARN_HUB_TABS.map((tabId) => {
              const isSelected = activeTab === tabId;
              return (
                <button
                  key={tabId}
                  id={`learn-tab-${tabId}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`learn-panel-${tabId}`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => handleSelectTab(tabId)}
                  onKeyDown={(event) =>
                    handleTabKey(event, LEARN_HUB_TABS, activeTab, handleSelectTab)
                  }
                  className={tabClass(isSelected)}
                >
                  {tabLabels[tabId]}
                </button>
              );
            })}
          </div>

          <div
            id={`learn-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`learn-tab-${activeTab}`}
            className="mt-7 sm:mt-8"
          >
            {activeTab === "guides" && (
              <HealthInformationTopicGrid
                initialCategory={initialCategory}
                onOpenDictionary={() => {
                  setDictSubTab("dictionary");
                  handleSelectTab("dictionary");
                }}
              />
            )}

            {activeTab === "topics" && (
              <HealthTopicCategories embedded initialOpenCategory={initialTopicCategory} />
            )}

            {activeTab === "quiz" && (
              <TrueFalseQuizSection embedded initialCategory={initialCategory} />
            )}

            {activeTab === "dictionary" && (
              <div className="space-y-6">
                {dictSubTab === "dictionary" ? (
                  <DualRegisterGlossaryContent
                    inline
                    isActive={activeTab === "dictionary" && dictSubTab === "dictionary"}
                    tabs={inlineDictionaryTabs}
                    lang={lang}
                    initialQuery={initialDictionaryQuery}
                  />
                ) : (
                  <RomanesGlossaryContent
                    inline
                    isActive={activeTab === "dictionary" && dictSubTab === "romanes"}
                    tabs={inlineDictionaryTabs}
                    lang={lang}
                    initialQuery={initialDictionaryQuery}
                  />
                )}
              </div>
            )}
          </div>
        </Container>
      </section>

      <section className="border-t border-border">
        <Container className="py-10 sm:py-14">
          <TopicNextSteps lang={lang} />
        </Container>
      </section>
    </main>
  );
}
