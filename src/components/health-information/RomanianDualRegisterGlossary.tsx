"use client";

import { useMemo, useState } from "react";
import { DictionaryTabs, type DictionaryTabsProps } from "./DictionaryTabs";
import {
  DictionaryDrawerFrame,
  DictionaryFilters,
  DictionarySearch,
  DictionarySpeakButton,
  HighlightGlossaryText,
} from "./DictionaryParts";
import { speechEngine } from "@/lib/audio/speech-engine";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import { SPEECH_LANG_BY_LOCALE } from "@/lib/i18n/health-myths";
import {
  DUAL_REGISTER_GLOSSARY_UI_COPY,
  ROMANIAN_MEDICAL_GLOSSARY,
  getLocalizedGlossaryEntry,
  type DualRegisterGlossaryEntry,
  type MedicalGlossaryCategory,
} from "@/lib/i18n/romanian-medical-glossary";

export interface RomanianDualRegisterGlossaryProps {
  isOpen: boolean;
  onClose: () => void;
  /** Shows the Dictionary | Romanes tab row; called with the tab the reader picks. */
  tabs?: Omit<DictionaryTabsProps, "active">;
  priorityTopicSlug?: string;
  initialCategory?: "all" | MedicalGlossaryCategory;
  className?: string;
  lang?: Lang;
}

const BRIDGE_EXTRAS_BY_LANG: Record<
  Lang,
  {
    inThisGuide: string;
    bridgeArrowLabel: string;
    countOne: string;
    countMany: (n: number) => string;
  }
> = {
  ro: {
    inThisGuide: "În acest ghid",
    bridgeArrowLabel: "În limbaj simplu",
    countOne: "1 termen găsit",
    countMany: (n) => (n >= 20 ? `${n} de termeni afișați` : `${n} termeni afișați`),
  },
  en: {
    inThisGuide: "In this guide",
    bridgeArrowLabel: "In plain words",
    countOne: "1 term shown",
    countMany: (n) => `${n} terms shown`,
  },
  sq: {
    inThisGuide: "Në këtë udhëzues",
    bridgeArrowLabel: "Me fjalë të thjeshta",
    countOne: "1 term i shfaqur",
    countMany: (n) => `${n} terma të shfaqur`,
  },
  it: {
    inThisGuide: "In questa guida",
    bridgeArrowLabel: "In parole semplici",
    countOne: "1 termine mostrato",
    countMany: (n) => `${n} termini mostrati`,
  },
  hr: {
    inThisGuide: "U ovom vodiču",
    bridgeArrowLabel: "Jednostavnim riječima",
    countOne: "1 prikazani pojam",
    countMany: (n) => `${n} prikazanih pojmova`,
  },
  rom: {
    inThisGuide: "Ande kadava sikavimos",
    bridgeArrowLabel: "Pe lokhi chib",
    countOne: "1 lav sikavdo",
    countMany: (n) => `${n} lava sikavde`,
  },
};

function useSafeLang(): Lang {
  try {
    return useLanguage().lang;
  } catch {
    return "ro";
  }
}

function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const CATEGORY_ORDER: Array<"all" | MedicalGlossaryCategory> = [
  "all",
  "diabet",
  "cardiologie",
  "analize",
  "cnas",
  "urgente",
];

export function RomanianDualRegisterGlossary({
  isOpen,
  onClose,
  tabs,
  priorityTopicSlug,
  initialCategory = "all",
  className = "",
  lang: propLang,
}: RomanianDualRegisterGlossaryProps) {
  const contextLang = useSafeLang();
  const lang: Lang = propLang ?? contextLang ?? "ro";
  const voiceEnabled = isVoiceEnabled(lang);
  const copy =
    DUAL_REGISTER_GLOSSARY_UI_COPY[lang] ?? DUAL_REGISTER_GLOSSARY_UI_COPY.ro;
  const extras = BRIDGE_EXTRAS_BY_LANG[lang] ?? BRIDGE_EXTRAS_BY_LANG.ro;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | MedicalGlossaryCategory
  >(initialCategory);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const filteredEntries = useMemo(() => {
    const q = normalizeForSearch(searchQuery);
    const matching = ROMANIAN_MEDICAL_GLOSSARY.filter((entry) => {
      const matchesCategory =
        selectedCategory === "all" || entry.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;

      const loc = getLocalizedGlossaryEntry(entry, lang);
      const haystack = normalizeForSearch(
        `${loc.plainTerm} ${loc.formalTerm} ${loc.layExplanation} ${loc.clinicalSignificance} ${entry.plainTermRo} ${entry.formalTermRo}`,
      );
      return haystack.includes(q);
    });

    if (!priorityTopicSlug) return matching;

    return [...matching].sort((a, b) => {
      const aMatch = a.relatedTopicSlug === priorityTopicSlug ? 0 : 1;
      const bMatch = b.relatedTopicSlug === priorityTopicSlug ? 0 : 1;
      return aMatch - bMatch;
    });
  }, [searchQuery, selectedCategory, priorityTopicSlug, lang]);

  const handlePronounce = (entry: DualRegisterGlossaryEntry) => {
    if (!voiceEnabled) return;
    const loc = getLocalizedGlossaryEntry(entry, lang);
    const speechLang =
      (SPEECH_LANG_BY_LOCALE as Partial<Record<Lang, string>>)[lang] ??
      (lang === "hr" ? "hr-HR" : "ro-RO");
    setSpeakingId(entry.id);
    speechEngine.speak(loc.speechText, {
      lang: speechLang,
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  if (!isOpen) return null;

  const countText =
    filteredEntries.length === 1
      ? extras.countOne
      : extras.countMany(filteredEntries.length);

  return (
    <DictionaryDrawerFrame
      labelledBy="dual-register-glossary-title"
      title={copy.title}
      subtitle={copy.subtitle}
      closeLabel={copy.closeLabel}
      onClose={onClose}
      className={className}
    >
      <div className="px-4 sm:px-6">
        {tabs && <DictionaryTabs active="dictionary" {...tabs} />}
        <DictionarySearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={copy.searchPlaceholder}
        />
        <DictionaryFilters
          label={copy.categoryTablistAria}
          options={CATEGORY_ORDER.map((cat) => ({
            value: cat,
            label: copy.categories[cat],
          }))}
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

      {/* Formal-prescription-to-plain-language bridge cards */}
      <div
        className="flex-1 overflow-y-auto border-t border-border px-4 py-4 sm:px-6"
        aria-live="polite"
      >
        {filteredEntries.length === 0 ? (
          <p className="py-12 text-center text-base text-muted-foreground">
            {copy.emptyState}
          </p>
        ) : (
          <ul className="space-y-3.5">
            {filteredEntries.map((entry) => {
              const loc = getLocalizedGlossaryEntry(entry, lang);
              const isEmergencyTerm = entry.category === "urgente";
              const isTopicMatch = Boolean(
                priorityTopicSlug && entry.relatedTopicSlug === priorityTopicSlug,
              );

              return (
                <li
                  key={entry.id}
                  className="rounded-xl border border-border bg-background/60 p-4 sm:p-5"
                >
                  {/* Step 1: What is written on the prescription / referral */}
                  <div className="rounded-lg border border-border/80 bg-surface-subtle/90 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {copy.formalLabel}
                      </span>
                      {isTopicMatch && (
                        <span className="inline-flex items-center rounded-md bg-sapphire-soft px-2 py-0.5 text-xs font-semibold text-sapphire">
                          {extras.inThisGuide}
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-1 text-base font-semibold leading-snug ${
                        isEmergencyTerm ? "text-primary" : "text-foreground"
                      }`}
                    >
                      <HighlightGlossaryText
                        text={loc.formalTerm}
                        query={searchQuery}
                      />
                    </p>
                  </div>

                  {/* Bridge connector */}
                  <div
                    className="my-2.5 flex items-center gap-2 px-1 text-xs font-semibold text-sapphire"
                    aria-hidden="true"
                  >
                    <svg
                      className="h-3.5 w-3.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14" />
                      <path d="m18 13-6 6-6-6" />
                    </svg>
                    <span>{extras.bridgeArrowLabel}</span>
                  </div>

                  {/* Step 2: Plain-language meaning & explanation */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold leading-snug text-foreground text-balance">
                      <span className="sr-only">{copy.plainLabel}: </span>
                      <HighlightGlossaryText
                        text={loc.plainTerm}
                        query={searchQuery}
                      />
                    </h3>
                    {voiceEnabled && (
                      <DictionarySpeakButton
                        speaking={speakingId === entry.id}
                        onClick={() => handlePronounce(entry)}
                        label={`${copy.pronounceLabel}: ${loc.plainTerm}`}
                      />
                    )}
                  </div>

                  <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
                    <HighlightGlossaryText
                      text={loc.layExplanation}
                      query={searchQuery}
                    />
                  </p>

                  <p className="mt-3 border-l-2 border-sapphire pl-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {copy.clinicalSignificanceLabel}{" "}
                    </span>
                    <HighlightGlossaryText
                      text={loc.clinicalSignificance}
                      query={searchQuery}
                    />
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

export { RomanianDualRegisterGlossary as PlainLanguageMedicalDictionary };
