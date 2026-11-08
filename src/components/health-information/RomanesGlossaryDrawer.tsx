"use client";

import { DictionaryDrawerFrame, DictionaryFilters, DictionarySearch, DictionarySpeakButton } from "./DictionaryParts";
import { DictionaryTabs, type DictionaryTabsProps } from "./DictionaryTabs";

import { useState, useMemo } from "react";
import {
  ROMANES_GLOSSARY_TERMS,
  type RomanesGlossaryTerm,
} from "@/lib/i18n/romanes-glossary";
import { speechEngine } from "@/lib/audio/speech-engine";
import { useVoiceEnabled } from "@/lib/audio/voice-availability";
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

function getExplanation(term: RomanesGlossaryTerm, lang: Lang): string {
  if (lang === "ro") return term.explanation;
  return term.explanationByLang?.[lang] ?? term.explanation;
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
  const voiceEnabled = useVoiceEnabled();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const categories = [
    { slug: "all", label: s.categoryAll[currentLang] },
    { slug: "cardiologie", label: s.categoryHeart[currentLang] },
    { slug: "simptome", label: s.categorySymptoms[currentLang] },
    { slug: "anatomie", label: s.categoryBody[currentLang] },
    { slug: "tratamente", label: s.categoryTreatments[currentLang] },
  ];

  const filteredTerms = useMemo(() => {
    return ROMANES_GLOSSARY_TERMS.filter((term) => {
      const matchesCategory =
        selectedCategory === "all" || term.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        term.romanianTerm.toLowerCase().includes(q) ||
        term.romanesTerm.toLowerCase().includes(q) ||
        getExplanation(term, currentLang).toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
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

  return (
    <DictionaryDrawerFrame
      labelledBy="romanes-glossary-title"
      title={s.title[currentLang]}
      subtitle={s.subtitle[currentLang]}
      closeLabel={s.closeAria[currentLang]}
      onClose={onClose}
      className={className}
    >
      <div className="px-4 sm:px-6">
        {tabs && <DictionaryTabs active="romanes" {...tabs} />}
        <DictionarySearch value={searchQuery} onChange={setSearchQuery} placeholder={s.searchPlaceholder[currentLang]} />
        <DictionaryFilters
          label={s.title[currentLang]}
          options={categories.map((c) => ({ value: c.slug, label: c.label }))}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      <div className="mt-2 flex-1 overflow-y-auto border-t border-border px-4 sm:px-6">
        {filteredTerms.length === 0 ? (
          <p className="py-12 text-center text-base text-muted-foreground">{s.emptyState[currentLang]}</p>
        ) : (
          <ul className="divide-y divide-border">
            {filteredTerms.map((term) => (
              <li key={term.id} className="py-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold leading-snug text-foreground">{term.romanesTerm}</h3>
                  {voiceEnabled && (
                    <DictionarySpeakButton
                      speaking={speakingId === term.id}
                      onClick={() => handlePronounce(term)}
                      label={s.pronounceAriaTemplate[currentLang].replace("{term}", term.romanesTerm)}
                    />
                  )}
                </div>
                <p className="mt-0.5 text-base font-medium text-foreground/80">{term.romanianTerm}</p>
                <p className="mt-3 text-base leading-relaxed text-foreground/90">{getExplanation(term, currentLang)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {s.pronunciationLabel[currentLang]} [{term.phoneticPronunciation}]
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DictionaryDrawerFrame>
  );
}
