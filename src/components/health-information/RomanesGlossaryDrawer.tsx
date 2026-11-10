"use client";

import { useState, useMemo } from "react";
import {
  DictionaryDrawerFrame,
  DictionaryFilters,
  DictionarySearch,
  DictionarySpeakButton,
  HighlightGlossaryText,
} from "./DictionaryParts";
import { DictionaryTabs, type DictionaryTabsProps } from "./DictionaryTabs";
import {
  ROMANES_GLOSSARY_TERMS,
  type RomanesGlossaryTerm,
} from "@/lib/i18n/romanes-glossary";
import { speechEngine } from "@/lib/audio/speech-engine";
import { isVoiceEnabled, useVoiceEnabled } from "@/lib/audio/voice-availability";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import { HEALTH_DETAIL_SHARED_STRINGS } from "@/lib/i18n/health-myths";

export interface RomanesGlossaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Shows the Dictionary | Romanes tab row; called with the tab the reader picks. */
  tabs?: Omit<DictionaryTabsProps, "active">;
  className?: string;
  lang?: Lang;
}

type LocalizedRomanesTerm = RomanesGlossaryTerm & {
  explanationByLang?: Partial<Record<Lang, string>>;
  termByLang?: Partial<Record<Lang, string>>;
  categoryLabelByLang?: Partial<Record<Lang, string>>;
};

const ROMANES_COUNT_BY_LANG: Record<
  Lang,
  { one: string; many: (n: number) => string; bridgeLabel: string }
> = {
  ro: {
    one: "1 cuvânt afișat",
    many: (n) => (n >= 20 ? `${n} de cuvinte afișate` : `${n} cuvinte afișate`),
    bridgeLabel: "Sensul medical",
  },
  en: {
    one: "1 word shown",
    many: (n) => `${n} words shown`,
    bridgeLabel: "Medical meaning",
  },
  sq: {
    one: "1 fjalë e shfaqur",
    many: (n) => `${n} fjalë të shfaqura`,
    bridgeLabel: "Kuptimi mjekësor",
  },
  it: {
    one: "1 parola mostrata",
    many: (n) => `${n} parole mostrate`,
    bridgeLabel: "Significato medico",
  },
  hr: {
    one: "1 prikazana riječ",
    many: (n) => `${n} prikazanih riječi`,
    bridgeLabel: "Medicinsko značenje",
  },
  rom: {
    one: "1 lav sikavdo",
    many: (n) => `${n} lava sikavde`,
    bridgeLabel: "Sastipnasko hatyarimos",
  },
};

function pickLocale(
  entry: Record<"ro", string> & Partial<Record<Lang, string>>,
  lang: Lang,
): string {
  return entry[lang] ?? entry.ro;
}

function getExplanation(term: RomanesGlossaryTerm, lang: Lang): string {
  if (lang === "ro") return term.explanation;
  return (
    (term as LocalizedRomanesTerm).explanationByLang?.[lang] ?? term.explanation
  );
}

function getTranslatedTerm(term: RomanesGlossaryTerm, lang: Lang): string {
  if (lang === "ro") return term.romanianTerm;
  return (
    (term as LocalizedRomanesTerm).termByLang?.[lang] ?? term.romanianTerm
  );
}

function getCategoryLabel(term: RomanesGlossaryTerm, lang: Lang): string {
  if (lang === "ro") return term.categoryLabel;
  return (
    (term as LocalizedRomanesTerm).categoryLabelByLang?.[lang] ??
    term.categoryLabel
  );
}

function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function useSafeLanguageContext(): { lang: Lang } {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" };
  }
}

export function RomanesGlossaryDrawer({
  isOpen,
  onClose,
  tabs,
  className = "",
  lang,
}: RomanesGlossaryDrawerProps) {
  const { lang: ctxLang } = useSafeLanguageContext();
  const currentLang: Lang = lang ?? ctxLang ?? "ro";
  const s = HEALTH_DETAIL_SHARED_STRINGS.romanesGlossaryDrawer;
  const countUi =
    ROMANES_COUNT_BY_LANG[currentLang] ?? ROMANES_COUNT_BY_LANG.ro;
  const ctxVoice = useVoiceEnabled();
  const voiceEnabled =
    lang !== undefined ? isVoiceEnabled(lang) : ctxVoice && isVoiceEnabled(currentLang);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const categories = [
    { slug: "all", label: pickLocale(s.categoryAll, currentLang) },
    { slug: "cardiologie", label: pickLocale(s.categoryHeart, currentLang) },
    { slug: "simptome", label: pickLocale(s.categorySymptoms, currentLang) },
    { slug: "anatomie", label: pickLocale(s.categoryBody, currentLang) },
    { slug: "tratamente", label: pickLocale(s.categoryTreatments, currentLang) },
  ];

  const filteredTerms = useMemo(() => {
    const q = normalizeForSearch(searchQuery);
    return ROMANES_GLOSSARY_TERMS.filter((term) => {
      const matchesCategory =
        selectedCategory === "all" || term.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      const haystack = normalizeForSearch(
        `${term.romanianTerm} ${getTranslatedTerm(term, currentLang)} ${getCategoryLabel(term, currentLang)} ${term.romanesTerm} ${getExplanation(term, currentLang)}`,
      );
      return haystack.includes(q);
    });
  }, [searchQuery, selectedCategory, currentLang]);

  const handlePronounce = (term: RomanesGlossaryTerm) => {
    if (!voiceEnabled) return;
    setSpeakingId(term.id);
    speechEngine.speak(term.audioPronunciationText, {
      lang: "ro-RO",
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  if (!isOpen) return null;

  const countText =
    filteredTerms.length === 1
      ? countUi.one
      : countUi.many(filteredTerms.length);

  return (
    <DictionaryDrawerFrame
      labelledBy="romanes-glossary-title"
      title={pickLocale(s.title, currentLang)}
      subtitle={pickLocale(s.subtitle, currentLang)}
      closeLabel={pickLocale(s.closeAria, currentLang)}
      onClose={onClose}
      className={className}
    >
      <div className="px-4 sm:px-6">
        {tabs && <DictionaryTabs active="romanes" {...tabs} />}
        <DictionarySearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={pickLocale(s.searchPlaceholder, currentLang)}
        />
        <DictionaryFilters
          label={pickLocale(s.title, currentLang)}
          options={categories.map((c) => ({ value: c.slug, label: c.label }))}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <p
          role="status"
          className="mt-2 pb-2 text-xs font-medium tabular-nums text-muted-foreground"
        >
          {countText}
        </p>
      </div>

      <div
        className="flex-1 overflow-y-auto border-t border-border px-4 py-4 sm:px-6"
        aria-live="polite"
      >
        {filteredTerms.length === 0 ? (
          <p className="py-12 text-center text-base text-muted-foreground">
            {pickLocale(s.emptyState, currentLang)}
          </p>
        ) : (
          <ul className="space-y-3.5">
            {filteredTerms.map((term) => {
              const translated = getTranslatedTerm(term, currentLang);
              const categoryLabel = getCategoryLabel(term, currentLang);
              const explanation = getExplanation(term, currentLang);

              return (
                <li
                  key={term.id}
                  className="rounded-xl border border-border bg-background/60 p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {categoryLabel}
                      </span>
                      <h3 className="mt-2 text-lg font-semibold leading-snug text-foreground">
                        <HighlightGlossaryText
                          text={term.romanesTerm}
                          query={searchQuery}
                        />
                      </h3>
                    </div>
                    {voiceEnabled && (
                      <DictionarySpeakButton
                        speaking={speakingId === term.id}
                        onClick={() => handlePronounce(term)}
                        label={pickLocale(
                          s.pronounceAriaTemplate,
                          currentLang,
                        ).replace("{term}", term.romanesTerm)}
                      />
                    )}
                  </div>

                  <div className="mt-2.5 rounded-lg border border-border/80 bg-surface-subtle/90 px-3 py-2">
                    <span className="block text-xs font-medium text-muted-foreground">
                      {countUi.bridgeLabel}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      <HighlightGlossaryText
                        text={translated}
                        query={searchQuery}
                      />
                    </span>
                  </div>

                  <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">
                    <HighlightGlossaryText
                      text={explanation}
                      query={searchQuery}
                    />
                  </p>

                  <p className="mt-2.5 inline-flex items-center rounded-md bg-sapphire-soft px-2.5 py-1 text-xs font-semibold text-sapphire">
                    {pickLocale(s.pronunciationLabel, currentLang)} [
                    {term.phoneticPronunciation}]
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DictionaryDrawerFrame>
  );
}
