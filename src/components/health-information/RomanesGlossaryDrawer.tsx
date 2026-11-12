"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type CSSProperties,
  type SVGProps,
} from "react";
import {
  ActivityIcon,
  AlertCircleIcon,
  GlobeIcon,
  HandHelpingIcon,
  HeartIcon,
  PrescriptionIcon,
  ShieldIcon,
  StethoscopeIcon,
  UserIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { speechEngine } from "@/lib/audio/speech-engine";
import { isVoiceEnabled, useVoiceEnabled } from "@/lib/audio/voice-availability";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import { HEALTH_DETAIL_SHARED_STRINGS } from "@/lib/i18n/health-myths";
import {
  ROMANES_GLOSSARY_TERMS,
  type RomanesGlossaryTerm,
} from "@/lib/i18n/romanes-glossary";
import {
  DICTIONARY_UTILITY_COPY,
  DictionaryDrawerFrame,
  DictionaryFilters,
  DictionarySearch,
  DictionarySpeakButton,
  HighlightGlossaryText,
} from "./DictionaryParts";
import {
  DICTIONARY_TAB_LABELS,
  DictionaryTabs,
  type DictionaryTabsProps,
} from "./DictionaryTabs";

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

const CATEGORY_GENERAL_FALLBACK: Record<Lang, string> = {
"ru": "Общее здоровье",

  ro: "Sănătate generală",
  en: "General health",
  sq: "Shëndeti i përgjithshëm",
  it: "Salute generale",
  hr: "Opće zdravlje",
  rom: "Generalno sastipen",
};

const CATEGORY_EMERGENCY_FALLBACK: Record<Lang, string> = {
"ru": "Неотложные состояния",

  ro: "Urgențe",
  en: "Emergencies",
  sq: "Urgjencat",
  it: "Emergenze",
  hr: "Hitna stanja",
  rom: "Sigardiarja",
};

const ROMANES_COUNT_BY_LANG: Record<
  Lang,
  { one: string; many: (n: number) => string; bridgeLabel: string }
> = {
"ru": {
"many": n=>`Показано слов: ${n}`,
"one":"Показано 1 слово","bridgeLabel":"Медицинское значение"},

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

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const ROMANES_CATEGORY_ICON_MAP: Record<string, IconComponent> = {
  all: GlobeIcon,
  cardiologie: HeartIcon,
  simptome: ActivityIcon,
  anatomie: UserIcon,
  tratamente: PrescriptionIcon,
  general: HandHelpingIcon,
  urgenta: AlertCircleIcon,
  urgente: AlertCircleIcon,
};

function isEmergencyRomanesCategory(category: string): boolean {
  return category === "urgenta" || category === "urgente";
}

interface ParsedPhoneticWord {
  prefix: string;
  syllables: string[];
  suffix: string;
}

function splitPhoneticWords(phonetic: string): ParsedPhoneticWord[] {
  return phonetic
    .replace(/^\[|\]$/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((rawWord) => {
      const prefixMatch = rawWord.match(/^[([/]+/);
      const suffixMatch = rawWord.match(/[)\],.;:]+$/);
      const prefix = prefixMatch ? prefixMatch[0] : "";
      const suffix = suffixMatch ? suffixMatch[0] : "";
      const core = rawWord.slice(
        prefix.length,
        rawWord.length - suffix.length,
      );
      return {
        prefix,
        syllables: core.split(/[-–]+/).filter(Boolean),
        suffix,
      };
    })
    .filter((w) => w.syllables.length > 0);
}

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
  const sRecord = s as unknown as Record<string, Record<Lang, string> | undefined>;
  const listenButtonLabels =
    HEALTH_DETAIL_SHARED_STRINGS.synchronizedReader.listenPronunciationButton;
  const countUi =
    ROMANES_COUNT_BY_LANG[currentLang] ?? ROMANES_COUNT_BY_LANG.ro;
  const util =
    DICTIONARY_UTILITY_COPY[currentLang] ?? DICTIONARY_UTILITY_COPY.ro;
  const tabFallback =
    DICTIONARY_TAB_LABELS[currentLang] ?? DICTIONARY_TAB_LABELS.ro;

  const ctxVoice = useVoiceEnabled();
  const voiceEnabled =
    lang !== undefined
      ? isVoiceEnabled(lang)
      : ctxVoice && isVoiceEnabled(currentLang);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      speechEngine.stop();
    }
    return () => {
      speechEngine.stop();
    };
  }, [isOpen]);

  const specimenNumberById = useMemo(
    () => new Map(ROMANES_GLOSSARY_TERMS.map((term, idx) => [term.id, idx + 1])),
    [],
  );

  const categories = useMemo(() => {
    const base = [
      { slug: "all", label: pickLocale(s.categoryAll, currentLang) },
      { slug: "cardiologie", label: pickLocale(s.categoryHeart, currentLang) },
      { slug: "simptome", label: pickLocale(s.categorySymptoms, currentLang) },
      { slug: "anatomie", label: pickLocale(s.categoryBody, currentLang) },
      { slug: "tratamente", label: pickLocale(s.categoryTreatments, currentLang) },
      {
        slug: "general",
        label: pickLocale(
          sRecord.categoryGeneral ?? CATEGORY_GENERAL_FALLBACK,
          currentLang,
        ),
      },
    ];

    const known = new Set(base.map((c) => c.slug));
    for (const term of ROMANES_GLOSSARY_TERMS) {
      const cat = term.category as string;
      if (!known.has(cat)) {
        known.add(cat);
        const dynamicLabel = isEmergencyRomanesCategory(cat)
          ? pickLocale(
              sRecord.categoryEmergency ??
                sRecord.categoryUrgent ??
                CATEGORY_EMERGENCY_FALLBACK,
              currentLang,
            )
          : getCategoryLabel(term, currentLang);
        base.push({ slug: cat, label: dynamicLabel });
      }
    }
    return base;
  }, [s, sRecord, currentLang]);

  const searchMatchedTerms = useMemo(() => {
    const q = normalizeForSearch(searchQuery);
    if (!q) return ROMANES_GLOSSARY_TERMS;

    return ROMANES_GLOSSARY_TERMS.filter((term) => {
      const compactPhonetic = term.phoneticPronunciation.replace(/[-–]/g, "");
      const haystack = normalizeForSearch(
        `${term.romanianTerm} ${getTranslatedTerm(term, currentLang)} ${getCategoryLabel(term, currentLang)} ${term.romanesTerm} ${getExplanation(term, currentLang)} ${term.phoneticPronunciation} ${compactPhonetic}`,
      );
      return haystack.includes(q);
    });
  }, [searchQuery, currentLang]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: searchMatchedTerms.length,
    };
    for (const term of searchMatchedTerms) {
      counts[term.category] = (counts[term.category] ?? 0) + 1;
    }
    return counts;
  }, [searchMatchedTerms]);

  const filteredTerms = useMemo(() => {
    if (selectedCategory === "all") return searchMatchedTerms;
    return searchMatchedTerms.filter(
      (term) => term.category === selectedCategory,
    );
  }, [searchMatchedTerms, selectedCategory]);

  const activeSpeakingId = isOpen ? speakingId : null;

  const handleClose = () => {
    speechEngine.stop();
    setSpeakingId(null);
    onClose();
  };

  const handlePronounce = (term: RomanesGlossaryTerm) => {
    if (!voiceEnabled) return;

    if (activeSpeakingId === term.id) {
      speechEngine.stop();
      setSpeakingId(null);
      return;
    }

    speechEngine.stop();
    setSpeakingId(term.id);
    speechEngine.speak(term.audioPronunciationText, {
      lang: "ro-RO",
      onEnd: () => setSpeakingId((prev) => (prev === term.id ? null : prev)),
      onError: () => setSpeakingId((prev) => (prev === term.id ? null : prev)),
    });
  };

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
  };

  if (!isOpen) return null;

  const isFiltered =
    selectedCategory !== "all" || searchQuery.trim().length > 0;
  const countText =
    filteredTerms.length === 1
      ? countUi.one
      : countUi.many(filteredTerms.length);
  const listenText = pickLocale(listenButtonLabels, currentLang);
  const pronunciationHeading = pickLocale(s.pronunciationLabel, currentLang);

  return (
    <DictionaryDrawerFrame
      labelledBy="romanes-glossary-title"
      title={pickLocale(s.title, currentLang)}
      subtitle={pickLocale(s.subtitle, currentLang)}
      closeLabel={pickLocale(s.closeAria, currentLang)}
      onClose={handleClose}
      lang={currentLang}
      className={className}
      headerControls={
        <div className="space-y-3">
          {tabs && (
            <DictionaryTabs
              active="romanes"
              tablistAriaLabel={tabs.tablistAriaLabel ?? tabFallback.tablistAria}
              {...tabs}
              onSelect={(nextTab) => {
                speechEngine.stop();
                setSpeakingId(null);
                tabs.onSelect(nextTab);
              }}
            />
          )}
          <DictionarySearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={pickLocale(s.searchPlaceholder, currentLang)}
            clearLabel={util.clearSearch}
          />
        </div>
      }
    >
      <div
        className="rh-dict-tab-body min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-3.5 pb-6 sm:px-6 sm:pt-4"
        aria-live="polite"
      >
        <DictionaryFilters
          label={pickLocale(s.title, currentLang)}
          options={categories.map((c) => {
            const Icon = ROMANES_CATEGORY_ICON_MAP[c.slug] ?? ShieldIcon;
            return {
              value: c.slug,
              label: c.label,
              count: categoryCounts[c.slug] ?? 0,
              tone: isEmergencyRomanesCategory(c.slug) ? "emergency" : "default",
              icon: <Icon className="h-3.5 w-3.5" />,
            };
          })}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Unclipped status and reset strip */}
        <div className="mt-3 mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-2.5">
          <p
            role="status"
            className="text-xs font-semibold tabular-nums text-muted-foreground"
          >
            {countText}
          </p>
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex min-h-[32px] items-center rounded-full bg-sapphire-soft px-3 py-1 text-xs font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
            >
              {util.resetFilters}
            </button>
          )}
        </div>

        {/* Community lexicon specimen cards */}
        {filteredTerms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface-subtle/50 px-5 py-10 text-center">
            <p className="text-base text-muted-foreground">
              {pickLocale(s.emptyState, currentLang)}
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 inline-flex min-h-[42px] items-center justify-center rounded-full bg-sapphire px-4 py-2 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2"
              >
                {util.resetFilters}
              </button>
            )}
          </div>
        ) : (
          <ul className="space-y-3.5">
            {filteredTerms.map((term, index) => {
              const translated = getTranslatedTerm(term, currentLang);
              const categoryLabel = getCategoryLabel(term, currentLang);
              const explanation = getExplanation(term, currentLang);
              const catSlug = term.category as string;
              const isEmergency = isEmergencyRomanesCategory(catSlug);
              const isThisSpeaking = activeSpeakingId === term.id;
              const CatIcon = ROMANES_CATEGORY_ICON_MAP[catSlug] ?? ShieldIcon;
              const specimenNum = specimenNumberById.get(term.id) ?? index + 1;
              const syllableWords = splitPhoneticWords(
                term.phoneticPronunciation,
              );
              const speakAria = isThisSpeaking
                ? `${util.stopAudio}: ${term.romanesTerm}`
                : pickLocale(s.pronounceAriaTemplate, currentLang).replace(
                    "{term}",
                    term.romanesTerm,
                  );

              return (
                <li
                  key={term.id}
                  style={{ "--stagger": Math.min(index, 4) } as CSSProperties}
                  className={cn(
                    "rh-dict-card overflow-hidden rounded-2xl border bg-card p-4 shadow-[var(--shadow-card-rest)] transition-shadow duration-[var(--dur-base)] hover:shadow-[var(--shadow-card-hover)] sm:p-5",
                    isEmergency ? "border-primary/35" : "border-border",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold",
                            isEmergency
                              ? "bg-primary text-white"
                              : "bg-amber-care-soft/75 text-obsidian-navy ring-1 ring-inset ring-amber-care-border",
                          )}
                        >
                          <CatIcon className="h-3.5 w-3.5 shrink-0" />
                          <span>{categoryLabel}</span>
                        </span>
                        <span className="font-mono text-xs font-medium tabular-nums text-muted-foreground">
                          #{String(specimenNum).padStart(2, "0")}
                        </span>
                      </div>

                      <h3
                        style={{ fontSize: "var(--dict-plain-size)" }}
                        className="mt-2 font-semibold leading-snug text-foreground text-balance"
                      >
                        <HighlightGlossaryText
                          text={term.romanesTerm}
                          query={searchQuery}
                        />
                      </h3>
                    </div>

                    {voiceEnabled && (
                      <DictionarySpeakButton
                        speaking={isThisSpeaking}
                        onClick={() => handlePronounce(term)}
                        tone={isEmergency ? "emergency" : "default"}
                        listenText={listenText}
                        stopText={util.stopAudio}
                        label={speakAria}
                      />
                    )}
                  </div>

                  {/* Medical meaning bridge ticket */}
                  <div
                    className={cn(
                      "mt-3 rounded-xl border px-3.5 py-2.5",
                      isEmergency
                        ? "border-primary/25 bg-primary-soft/35"
                        : "border-border/90 bg-surface-subtle/90",
                    )}
                  >
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <StethoscopeIcon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isEmergency ? "text-primary" : "text-sapphire",
                        )}
                      />
                      <span>{countUi.bridgeLabel}</span>
                    </span>
                    <span
                      style={{ fontSize: "var(--dict-formal-size)" }}
                      className="mt-0.5 block font-semibold leading-snug text-foreground"
                    >
                      <HighlightGlossaryText
                        text={translated}
                        query={searchQuery}
                      />
                    </span>
                  </div>

                  {/* Plain-language explanation */}
                  <p
                    style={{ fontSize: "var(--dict-body-size)" }}
                    className="mt-3 leading-relaxed text-foreground/90"
                  >
                    <HighlightGlossaryText
                      text={explanation}
                      query={searchQuery}
                    />
                  </p>

                  {/* Syllable rhythm pronunciation pills */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-border/70 pt-3">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {pronunciationHeading}
                      <span className="sr-only">
                        {" "}
                        {term.phoneticPronunciation}
                      </span>
                    </span>
                    <div
                      aria-hidden="true"
                      className="flex flex-wrap items-center gap-x-2 gap-y-1.5"
                    >
                      {syllableWords.map((wordObj, wordIdx) => (
                        <span
                          key={`${term.id}-w-${wordIdx}`}
                          className="inline-flex flex-wrap items-center gap-0.5"
                        >
                          {wordObj.prefix && (
                            <span className="text-xs font-medium text-muted-foreground">
                              {wordObj.prefix}
                            </span>
                          )}
                          {wordObj.syllables.map((syllable, sylIdx) => (
                            <span
                              key={`${term.id}-w-${wordIdx}-s-${sylIdx}`}
                              className="inline-flex items-center gap-0.5"
                            >
                              {sylIdx > 0 && (
                                <span className="text-[11px] font-bold text-sapphire/60">
                                  ·
                                </span>
                              )}
                              <span className="rounded-md border border-sapphire-border bg-sapphire-soft/85 px-2 py-0.5 font-mono text-xs font-semibold text-sapphire">
                                {syllable}
                              </span>
                            </span>
                          ))}
                          {wordObj.suffix && (
                            <span className="text-xs font-medium text-muted-foreground">
                              {wordObj.suffix}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DictionaryDrawerFrame>
  );
}
