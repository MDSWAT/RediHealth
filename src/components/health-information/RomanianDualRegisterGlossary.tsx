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
  AlertCircleIcon,
  BookIcon,
  ClipboardCheckIcon,
  DropletIcon,
  FileTextIcon,
  HeartIcon,
  ShieldIcon,
  StethoscopeIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";
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
"ru": {
"countMany": n=>`Показано терминов: ${n}`,
"inThisGuide":"В этом руководстве","bridgeArrowLabel":"Простыми словами","countOne":"Показан 1 термин"},

  ro: {
    inThisGuide: "În acest ghid",
    bridgeArrowLabel: "Ce înseamnă",
    countOne: "1 termen afișat",
    countMany: (n) =>
      n >= 20 ? `${n} de termeni afișați` : `${n} termeni afișați`,
  },
  en: {
    inThisGuide: "In this guide",
    bridgeArrowLabel: "What it means",
    countOne: "1 term shown",
    countMany: (n) => `${n} terms shown`,
  },
  sq: {
    inThisGuide: "Në këtë udhëzues",
    bridgeArrowLabel: "Çfarë do të thotë",
    countOne: "1 term i shfaqur",
    countMany: (n) => `${n} terma të shfaqur`,
  },
  it: {
    inThisGuide: "In questa guida",
    bridgeArrowLabel: "Cosa significa",
    countOne: "1 termine mostrato",
    countMany: (n) => `${n} termini mostrati`,
  },
  hr: {
    inThisGuide: "U ovom vodiču",
    bridgeArrowLabel: "Što znači",
    countOne: "1 prikazani pojam",
    countMany: (n) => `${n} prikazanih pojmova`,
  },
  rom: {
    inThisGuide: "Ande kadava sikavimos",
    bridgeArrowLabel: "So znachil",
    countOne: "1 lav sikavdo",
    countMany: (n) => `${n} lava sikavde`,
  },
};

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const CATEGORY_ICON_MAP: Record<string, IconComponent> = {
  all: BookIcon,
  diabet: DropletIcon,
  cardiologie: HeartIcon,
  analize: ClipboardCheckIcon,
  cnas: FileTextIcon,
  urgente: AlertCircleIcon,
  preventie: ShieldIcon,
};

function stripHardcodedCount(label: string): string {
  return label.replace(/\s*\(\d+\)\s*$/, "").trim();
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

function matchesPriorityTopic(
  entry: DualRegisterGlossaryEntry,
  topicSlug?: string,
): boolean {
  if (!topicSlug) return false;
  if (entry.relatedTopicSlug === topicSlug) return true;
  const multi = (
    entry as DualRegisterGlossaryEntry & { relatedTopicSlugs?: string[] }
  ).relatedTopicSlugs;
  return Boolean(multi?.includes(topicSlug));
}

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
  const util = DICTIONARY_UTILITY_COPY[lang] ?? DICTIONARY_UTILITY_COPY.ro;
  const tabFallback = DICTIONARY_TAB_LABELS[lang] ?? DICTIONARY_TAB_LABELS.ro;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | MedicalGlossaryCategory
  >(initialCategory);
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
    () => new Map(ROMANIAN_MEDICAL_GLOSSARY.map((entry, idx) => [entry.id, idx + 1])),
    [],
  );

  const categoryKeys = useMemo(() => {
    const rawKeys = Object.keys(copy.categories) as Array<
      "all" | MedicalGlossaryCategory
    >;
    if (rawKeys[0] === "all") return rawKeys;
    return [
      "all" as const,
      ...rawKeys.filter((k): k is MedicalGlossaryCategory => k !== "all"),
    ];
  }, [copy.categories]);

  // Entries matching the search query across all categories so pill counts update live
  const searchMatchedEntries = useMemo(() => {
    const q = normalizeForSearch(searchQuery);
    if (!q) return ROMANIAN_MEDICAL_GLOSSARY;

    return ROMANIAN_MEDICAL_GLOSSARY.filter((entry) => {
      const loc = getLocalizedGlossaryEntry(entry, lang);
      const haystack = normalizeForSearch(
        `${loc.plainTerm} ${loc.formalTerm} ${loc.layExplanation} ${loc.clinicalSignificance} ${entry.plainTermRo} ${entry.formalTermRo}`,
      );
      return haystack.includes(q);
    });
  }, [searchQuery, lang]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: searchMatchedEntries.length,
    };
    for (const entry of searchMatchedEntries) {
      counts[entry.category] = (counts[entry.category] ?? 0) + 1;
    }
    return counts;
  }, [searchMatchedEntries]);

  const filteredEntries = useMemo(() => {
    const matching =
      selectedCategory === "all"
        ? searchMatchedEntries
        : searchMatchedEntries.filter(
            (entry) => entry.category === selectedCategory,
          );

    if (!priorityTopicSlug) return matching;

    return [...matching].sort((a, b) => {
      const aMatch = matchesPriorityTopic(a, priorityTopicSlug) ? 0 : 1;
      const bMatch = matchesPriorityTopic(b, priorityTopicSlug) ? 0 : 1;
      return aMatch - bMatch;
    });
  }, [searchMatchedEntries, selectedCategory, priorityTopicSlug]);

  const activeSpeakingId = isOpen ? speakingId : null;

  const handleClose = () => {
    speechEngine.stop();
    setSpeakingId(null);
    onClose();
  };

  const handlePronounce = (entry: DualRegisterGlossaryEntry) => {
    if (!voiceEnabled) return;

    if (activeSpeakingId === entry.id) {
      speechEngine.stop();
      setSpeakingId(null);
      return;
    }

    speechEngine.stop();
    const loc = getLocalizedGlossaryEntry(entry, lang);
    const speechLang =
      (SPEECH_LANG_BY_LOCALE as Partial<Record<Lang, string>>)[lang] ??
      (lang === "hr" ? "hr-HR" : "ro-RO");

    setSpeakingId(entry.id);
    speechEngine.speak(loc.speechText, {
      lang: speechLang,
      onEnd: () =>
        setSpeakingId((prev) => (prev === entry.id ? null : prev)),
      onError: () =>
        setSpeakingId((prev) => (prev === entry.id ? null : prev)),
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
    filteredEntries.length === 1
      ? extras.countOne
      : extras.countMany(filteredEntries.length);

  return (
    <DictionaryDrawerFrame
      labelledBy="dual-register-glossary-title"
      title={copy.title}
      subtitle={copy.subtitle}
      closeLabel={copy.closeLabel}
      onClose={handleClose}
      lang={lang}
      className={className}
      headerControls={
        <div className="space-y-3">
          {tabs && (
            <DictionaryTabs
              active="dictionary"
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
            placeholder={copy.searchPlaceholder}
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
          label={copy.categoryTablistAria}
          options={categoryKeys.map((cat) => {
            const Icon = CATEGORY_ICON_MAP[cat] ?? ShieldIcon;
            return {
              value: cat,
              label: stripHardcodedCount(copy.categories[cat] ?? cat),
              count: categoryCounts[cat] ?? 0,
              tone: cat === "urgente" ? "emergency" : "default",
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
              className="press-row inline-flex min-h-11 items-center whitespace-nowrap rounded-lg bg-sapphire-soft px-3.5 py-2 text-xs font-semibold text-sapphire transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-sapphire hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {util.resetFilters}
            </button>
          )}
        </div>

        {/* 3-band editorial dual-register specimen cards */}
        {filteredEntries.length === 0 ? (
          <div className="swap-in rounded-2xl border border-dashed border-border bg-surface-subtle/50 px-5 py-10 text-center">
            <p className="text-base text-muted-foreground">{copy.emptyState}</p>
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="press-solid mt-4 inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg bg-sapphire px-4 py-2 text-sm font-semibold text-white transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {util.resetFilters}
              </button>
            )}
          </div>
        ) : (
          // Keyed by category: choosing a filter deals the matching cards in again, in order.
          <ul key={selectedCategory} className="space-y-3.5">
            {filteredEntries.map((entry, index) => {
              const loc = getLocalizedGlossaryEntry(entry, lang);
              const isEmergencyTerm = entry.category === "urgente";
              const isTopicMatch = matchesPriorityTopic(
                entry,
                priorityTopicSlug,
              );
              const isThisSpeaking = activeSpeakingId === entry.id;
              const CatIcon = CATEGORY_ICON_MAP[entry.category] ?? ShieldIcon;
              const cleanCatLabel = stripHardcodedCount(
                copy.categories[entry.category] ?? entry.category,
              );
              const specimenNum = specimenNumberById.get(entry.id) ?? index + 1;
              const WatchpointIcon = isEmergencyTerm
                ? AlertCircleIcon
                : StethoscopeIcon;

              return (
                <li
                  key={entry.id}
                  style={{ "--i": index } as CSSProperties}
                  className={cn(
                    "list-in overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-card-rest)] transition-shadow duration-[var(--dur-base)] hover:shadow-[var(--shadow-card-hover)]",
                    isEmergencyTerm ? "border-primary/35" : "border-border",
                  )}
                >
                  {/* Band 1: Official prescription / lab ticket stub */}
                  <div
                    className={cn(
                      "border-b border-dashed px-4 py-3 sm:px-5 sm:py-3.5",
                      isEmergencyTerm
                        ? "border-primary/25 bg-primary-soft/35"
                        : "border-border bg-surface-subtle/85",
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[11.5px] font-semibold",
                            isEmergencyTerm
                              ? "bg-primary text-white"
                              : "bg-card text-sapphire ring-1 ring-inset ring-border",
                          )}
                        >
                          <CatIcon className="h-3.5 w-3.5 shrink-0" />
                          <span>{cleanCatLabel}</span>
                        </span>
                        {isTopicMatch && (
                          <span className="text-xs font-semibold text-sapphire dark:text-sapphire-border">
                            {extras.inThisGuide}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs font-medium tabular-nums text-muted-foreground">
                        #{String(specimenNum).padStart(2, "0")}
                      </span>
                    </div>

                    <span className="mt-2 block text-xs font-medium text-muted-foreground">
                      {copy.formalLabel}
                    </span>
                    <p
                      style={{ fontSize: "var(--dict-formal-size)" }}
                      className={cn(
                        "mt-0.5 font-semibold leading-snug break-words",
                        isEmergencyTerm ? "text-primary" : "text-foreground",
                      )}
                    >
                      <HighlightGlossaryText
                        text={loc.formalTerm}
                        query={searchQuery}
                      />
                    </p>
                  </div>

                  {/* Band 2 & Band 3: Plain-language bridge, speak control, explanation, and clinical watchpoint */}
                  <div className="px-4 pt-3 pb-4 sm:px-5 sm:pt-3.5 sm:pb-5">
                    {/* Band 2: Visual translation bridge + plain-language heading + tactile speak pill */}
                    <div
                      className={cn(
                        "flex items-center gap-2 text-xs font-semibold",
                        isEmergencyTerm ? "text-primary" : "text-sapphire",
                      )}
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
                      <span className="h-px flex-1 bg-border/80" />
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-start justify-between gap-3">
                      <h3
                        style={{ fontSize: "var(--dict-plain-size)" }}
                        className="min-w-0 flex-1 font-semibold leading-snug text-foreground text-balance"
                      >
                        <span className="sr-only">{copy.plainLabel}: </span>
                        <HighlightGlossaryText
                          text={loc.plainTerm}
                          query={searchQuery}
                        />
                      </h3>
                      {voiceEnabled && (
                        <DictionarySpeakButton
                          speaking={isThisSpeaking}
                          onClick={() => handlePronounce(entry)}
                          tone={isEmergencyTerm ? "emergency" : "default"}
                          listenText={copy.pronounceLabel}
                          stopText={util.stopAudio}
                          label={
                            isThisSpeaking
                              ? `${util.stopAudio}: ${loc.plainTerm}`
                              : `${copy.pronounceLabel}: ${loc.plainTerm}`
                          }
                        />
                      )}
                    </div>

                    {/* Band 3: Clear lay explanation + structured clinical watchpoint callout */}
                    <p
                      style={{ fontSize: "var(--dict-body-size)" }}
                      className="mt-2.5 leading-relaxed text-foreground/90"
                    >
                      <HighlightGlossaryText
                        text={loc.layExplanation}
                        query={searchQuery}
                      />
                    </p>

                    <div
                      className={cn(
                        "mt-3.5 flex items-start gap-2.5 rounded-r-xl border-l-[3px] px-3.5 py-2.5",
                        isEmergencyTerm
                          ? "border-primary bg-primary-soft/45"
                          : "border-sapphire bg-sapphire-soft/55",
                      )}
                    >
                      <WatchpointIcon
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          isEmergencyTerm ? "text-primary" : "text-sapphire",
                        )}
                      />
                      <p
                        style={{ fontSize: "var(--dict-note-size)" }}
                        className="min-w-0 flex-1 leading-relaxed text-foreground/90"
                      >
                        <strong
                          className={cn(
                            "font-semibold",
                            isEmergencyTerm ? "text-primary" : "text-foreground",
                          )}
                        >
                          {copy.clinicalSignificanceLabel}{" "}
                        </strong>
                        <HighlightGlossaryText
                          text={loc.clinicalSignificance}
                          query={searchQuery}
                        />
                      </p>
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

export { RomanianDualRegisterGlossary as PlainLanguageMedicalDictionary };
