"use client";

import { DictionaryTabs, type DictionaryTabsProps } from "./DictionaryTabs";

import { useEffect, useMemo, useState } from "react";
import { DictionaryDrawerFrame, DictionaryFilters, DictionarySearch, DictionarySpeakButton } from "./DictionaryParts";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | MedicalGlossaryCategory
  >(initialCategory);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredEntries = useMemo(() => {
    const q = normalizeForSearch(searchQuery);
    const matching = ROMANIAN_MEDICAL_GLOSSARY.filter((entry) => {
      const matchesCategory =
        selectedCategory === "all" || entry.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;

      const loc = getLocalizedGlossaryEntry(entry, lang);
      const haystack = normalizeForSearch(
        `${loc.plainTerm} ${loc.formalTerm} ${loc.layExplanation} ${loc.clinicalSignificance} ${entry.plainTermRo} ${entry.formalTermRo}`
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
    const speechLang = SPEECH_LANG_BY_LOCALE[lang] ?? "ro-RO";
    setSpeakingId(entry.id);
    speechEngine.speak(loc.speechText, {
      lang: speechLang,
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  if (!isOpen) return null;

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
        <DictionarySearch value={searchQuery} onChange={setSearchQuery} placeholder={copy.searchPlaceholder} />
        <DictionaryFilters
          label={copy.categoryTablistAria}
          options={CATEGORY_ORDER.map((cat) => ({ value: cat, label: copy.categories[cat] }))}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Entries, stacked like a dictionary: everyday words first, the medical term under them. */}
      <div className="mt-2 flex-1 overflow-y-auto border-t border-border px-4 sm:px-6" aria-live="polite">
        {filteredEntries.length === 0 ? (
          <p className="py-12 text-center text-base text-muted-foreground">{copy.emptyState}</p>
        ) : (
          <ul className="divide-y divide-border">
            {filteredEntries.map((entry) => {
              const loc = getLocalizedGlossaryEntry(entry, lang);
              const isEmergencyTerm = entry.category === "urgente";
              return (
                <li key={entry.id} className="py-5">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-lg font-semibold leading-snug text-foreground text-balance">
                      <span className="sr-only">{copy.plainLabel}: </span>
                      {loc.plainTerm}
                    </h4>
                    {voiceEnabled && (
                      <DictionarySpeakButton
                        speaking={speakingId === entry.id}
                        onClick={() => handlePronounce(entry)}
                        label={`${copy.pronounceLabel}: ${loc.plainTerm}`}
                      />
                    )}
                  </div>

                  <p className="mt-1.5 text-sm text-muted-foreground">{copy.formalLabel}</p>
                  <p className={isEmergencyTerm ? "text-base font-medium text-primary" : "text-base font-medium text-foreground"}>
                    {loc.formalTerm}
                  </p>

                  <p className="mt-3 text-base leading-relaxed text-foreground/90">{loc.layExplanation}</p>

                  <p className="mt-3 border-l-2 border-border pl-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-foreground">{copy.clinicalSignificanceLabel} </span>
                    {loc.clinicalSignificance}
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

