"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, SearchIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import {
  type TopicItem,
  getHealthTopicsList,
  getHealthInformationDictionary,
  HEALTH_TOPICS_LIST,
  getHealthTopicGridDictionary,
} from "@/lib/i18n/health-information-topics";
import { TopicMetaBadge } from "./TopicMetaBadge";
import { ReadingLevelSwitcher } from "./ReadingLevelSwitcher";

export type { TopicItem };
export { getHealthTopicsList, HEALTH_TOPICS_LIST };

export interface HealthInformationTopicGridProps {
  initialCategory?: string;
  className?: string;
  /** Library tools: reading level, dictionary and the link to the 3D symptom check. */
  readingLevel?: "simple" | "complete";
  onReadingLevelChange?: (level: "simple" | "complete") => void;
  onOpenDictionary?: () => void;
}

/** Cards shown before "Show all topics", so the library fits one screen. */
const FIRST_VIEW_LIMIT = 9;

const LIBRARY_COPY: Record<
  Lang,
  {
    howToRead: string;
    dictionary: string;
    checkSymptom: string;
    showAll: string;
    title: string;
    leadBadge: string;
    keyFactLabel: string;
    readGuide: string;
  }
> = {
  ro: {
    howToRead: "Cum citești",
    dictionary: "Dicționar medical",
    checkSymptom: "Verifică un simptom",
    showAll: "Arată toate ghidurile",
    title: "Ghiduri de sănătate",
    leadBadge: "Ghid esențial",
    keyFactLabel: "Idee clinică cheie",
    readGuide: "Citește ghidul",
  },
  en: {
    howToRead: "How to read",
    dictionary: "Medical dictionary",
    checkSymptom: "Check a symptom",
    showAll: "Show all guides",
    title: "Health guides",
    leadBadge: "Featured guide",
    keyFactLabel: "Key clinical fact",
    readGuide: "Read guide",
  },
  sq: {
    howToRead: "Si të lexosh",
    dictionary: "Fjalori mjekësor",
    checkSymptom: "Kontrollo një simptomë",
    showAll: "Shfaq të gjithë udhëzuesit",
    title: "Udhëzues shëndetësorë",
    leadBadge: "Udhëzues kryesor",
    keyFactLabel: "Fakt klinik kryesor",
    readGuide: "Lexo udhëzuesin",
  },
  it: {
    howToRead: "Come leggere",
    dictionary: "Dizionario medico",
    checkSymptom: "Controlla un sintomo",
    showAll: "Mostra tutte le guide",
    title: "Guide alla salute",
    leadBadge: "Guida principale",
    keyFactLabel: "Punto clinico chiave",
    readGuide: "Leggi la guida",
  },
  hr: {
    howToRead: "Kako čitati",
    dictionary: "Medicinski rječnik",
    checkSymptom: "Provjeri simptom",
    showAll: "Prikaži sve vodiče",
    title: "Zdravstveni vodiči",
    leadBadge: "Istaknuti vodič",
    keyFactLabel: "Ključna klinička činjenica",
    readGuide: "Pročitaj vodič",
  },
  rom: {
    howToRead: "Sar te drabares",
    dictionary: "Doktorengo lavustik",
    checkSymptom: "Dikh jekh simptomo",
    showAll: "Sikav sa le sikavimata",
    title: "Sikavimata vaš o sastipen",
    leadBadge: "Angluno sikavimos",
    keyFactLabel: "Baro sastipnasko fakto",
    readGuide: "Drabar o sikavimos",
  },
};

export function HealthInformationTopicGrid({
  initialCategory = "toate",
  className = "",
  readingLevel = "simple",
  onReadingLevelChange,
  onOpenDictionary,
}: HealthInformationTopicGridProps) {
  const { lang, t } = useLanguage();
  const gridCopy =
    t?.healthInfoPage?.topicGrid ?? getHealthTopicGridDictionary(lang);
  const topics = useMemo(() => getHealthTopicsList(lang), [lang]);
  const fullTopicsBySlug = useMemo(() => {
    const dict = getHealthInformationDictionary(lang);
    const map: Record<string, string> = {};
    for (const item of dict.topics) {
      if (item.keyFacts?.[0]) {
        map[item.slug] = item.keyFacts[0];
      }
    }
    return map;
  }, [lang]);

  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filterChips = useMemo(
    () => [
      { slug: "toate", label: gridCopy.categories.toate },
      { slug: "inima", label: gridCopy.categories.inima },
      { slug: "diabet", label: gridCopy.categories.diabet },
      { slug: "nutritie", label: gridCopy.categories.nutritie },
      { slug: "miscare", label: gridCopy.categories.miscare },
      { slug: "minte", label: gridCopy.categories.minte },
      { slug: "fumat", label: gridCopy.categories.fumat },
      { slug: "screening", label: gridCopy.categories.screening },
      { slug: "femei", label: gridCopy.categories.femei },
    ],
    [gridCopy],
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTopics = topics.filter((topic) => {
    const matchesCategory =
      selectedCategory === "toate" ||
      topic.categorySlug === selectedCategory ||
      topic.slug === selectedCategory;
    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;
    const categoryLabel =
      filterChips.find((c) => c.slug === topic.categorySlug)?.label ?? "";
    const firstFact = fullTopicsBySlug[topic.slug] ?? topic.keyFact ?? "";
    return (
      topic.title.toLowerCase().includes(normalizedQuery) ||
      topic.description.toLowerCase().includes(normalizedQuery) ||
      firstFact.toLowerCase().includes(normalizedQuery) ||
      topic.categorySlug.toLowerCase().includes(normalizedQuery) ||
      categoryLabel.toLowerCase().includes(normalizedQuery)
    );
  });

  const resultCountText =
    filteredTopics.length === 1
      ? gridCopy.countSingular
      : gridCopy.countPluralTemplate.replace(
          "{count}",
          String(filteredTopics.length),
        );

  const lib = LIBRARY_COPY[lang] ?? LIBRARY_COPY.ro;
  const checkSymptomLabel = t?.healthInfoPage?.tabs?.triage ?? lib.checkSymptom;
  const [showAll, setShowAll] = useState(false);
  const visibleTopics = showAll
    ? filteredTopics
    : filteredTopics.slice(0, FIRST_VIEW_LIMIT);

  const promoteLeadCard =
    selectedCategory === "toate" && normalizedQuery.length === 0;

  return (
    <section aria-labelledby="health-library-title" className={className}>
      {/* The page H1 already names the library; this heading is for screen readers. */}
      <h2 id="health-library-title" className="sr-only">
        {lib.title}
      </h2>

      {/* Row 1: search, and the one way out to the symptom check */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={gridCopy.searchPlaceholder}
            aria-label={gridCopy.searchAriaLabel}
            className="min-h-12 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          />
        </div>
        <Link
          href={withLangPrefix("/health-check", lang)}
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-foreground px-5 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2"
        >
          {checkSymptomLabel}
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Row 2: categories only, as underlined text; scrolls sideways on phones */}
      <div
        role="group"
        aria-label={gridCopy.filterListAriaLabel}
        className="mt-3 flex overflow-x-auto border-b border-border no-scrollbar"
      >
        {filterChips.map((chip) => {
          const isActive = selectedCategory === chip.slug;
          return (
            <button
              key={chip.slug}
              type="button"
              aria-pressed={isActive}
              onClick={() => {
                setSelectedCategory(chip.slug);
                setShowAll(false);
              }}
              className={`-mb-px inline-flex min-h-11 shrink-0 items-center border-b-2 px-3 text-sm font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sapphire ${
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Row 3: reading settings on their own labelled line */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="font-medium text-muted-foreground">{lib.howToRead}:</span>
        <ReadingLevelSwitcher
          level={readingLevel}
          onChange={(lvl) => onReadingLevelChange?.(lvl)}
        />
        {onOpenDictionary && (
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={onOpenDictionary}
            className="inline-flex min-h-[44px] items-center rounded-lg border border-border bg-card px-3.5 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          >
            {lib.dictionary}
          </button>
        )}
        <p role="status" className="ml-auto text-muted-foreground tabular-nums">
          {resultCountText}
          {searchQuery ? gridCopy.countSearchSuffix : ""}
        </p>
      </div>

      {filteredTopics.length === 0 ? (
        <div className="mt-5 rounded-xl border border-border bg-card px-6 py-10 text-center">
          <p className="text-base font-semibold text-foreground">
            {gridCopy.emptyTitle}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {gridCopy.emptyDescription}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("toate");
            }}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          >
            {gridCopy.emptyResetButton}
          </button>
        </div>
      ) : (
        <>
          <ul className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTopics.map((topic, index) => {
              const isLead = promoteLeadCard && index === 0;
              const firstKeyFact =
                fullTopicsBySlug[topic.slug] ?? topic.keyFact ?? "";
              const effectiveReadMinutes =
                readingLevel === "complete"
                  ? topic.readMinutes + 2
                  : topic.readMinutes;
              const effectiveAudioMinutes =
                readingLevel === "complete"
                  ? topic.audioMinutes + 1
                  : topic.audioMinutes;
              const isComplete = readingLevel === "complete";

              if (isLead) {
                return (
                  <li
                    key={topic.slug}
                    className="flex sm:col-span-2 lg:col-span-2"
                  >
                    <Link
                      href={withLangPrefix(
                        `/health-information/${topic.slug}`,
                        lang,
                      )}
                      className="group grid w-full grid-cols-1 overflow-hidden rounded-xl border border-border bg-card transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-foreground/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 motion-reduce:transition-none md:grid-cols-[55%_45%]"
                    >
                      <div className="relative aspect-[3/2] w-full overflow-hidden border-b border-border/60 bg-surface-subtle md:h-full md:min-h-[260px] md:border-b-0 md:border-r">
                        <Image
                          src={topic.image}
                          alt=""
                          fill
                          priority
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 55vw, 40vw"
                          className="object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-calm)] motion-safe:group-hover:scale-[1.025] motion-reduce:transition-none"
                        />
                      </div>

                      <div className="flex flex-1 flex-col p-6 sm:p-7">
                        <span className="inline-flex w-fit items-center rounded-md bg-sapphire-soft px-2.5 py-1 text-xs font-semibold text-sapphire">
                          {lib.leadBadge}
                        </span>

                        <h3 className="mt-3 text-xl font-semibold leading-snug tracking-[-0.015em] text-foreground text-balance sm:text-[22px]">
                          {topic.title}
                        </h3>

                        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground text-pretty">
                          {topic.description}
                        </p>

                        {firstKeyFact && (
                          <div
                            aria-hidden={!isComplete}
                            className={`grid transition-[grid-template-rows,opacity,margin] duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none ${
                              isComplete
                                ? "mt-3.5 grid-rows-[1fr] opacity-100"
                                : "mt-0 grid-rows-[0fr] opacity-0"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="rounded-r-md border-l-2 border-sapphire bg-surface-subtle/75 px-3 py-2 text-[13.5px] leading-relaxed text-foreground/90">
                                <span className="block text-xs font-semibold text-sapphire">
                                  {lib.keyFactLabel}
                                </span>
                                <span className="mt-0.5 block">
                                  {firstKeyFact}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                          <TopicMetaBadge
                            readMinutes={effectiveReadMinutes}
                            audioMinutes={effectiveAudioMinutes}
                            compact={true}
                            bordered={false}
                            lang={lang}
                          />
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire-light motion-reduce:transition-none">
                            <span>{lib.readGuide}</span>
                            <ArrowRightIcon
                              aria-hidden="true"
                              className="h-4 w-4 shrink-0"
                            />
                          </span>
                        </div>
                        <span className="sr-only">
                          {gridCopy.cardActionLabel}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              }

              return (
                <li key={topic.slug} className="flex">
                  <Link
                    href={withLangPrefix(
                      `/health-information/${topic.slug}`,
                      lang,
                    )}
                    className="group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-foreground/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 motion-reduce:transition-none"
                  >
                    <div className="relative aspect-[3/2] w-full overflow-hidden border-b border-border/60 bg-surface-subtle">
                      <Image
                        src={topic.image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-calm)] motion-safe:group-hover:scale-[1.025] motion-reduce:transition-none"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <h3 className="text-lg font-semibold leading-snug tracking-[-0.01em] text-foreground text-balance sm:text-xl">
                        {topic.title}
                      </h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground text-pretty">
                        {topic.description}
                      </p>

                      {firstKeyFact && (
                        <div
                          aria-hidden={!isComplete}
                          className={`grid transition-[grid-template-rows,opacity,margin] duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none ${
                            isComplete
                              ? "mt-3 grid-rows-[1fr] opacity-100"
                              : "mt-0 grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <p className="rounded-r-md border-l-2 border-sapphire bg-surface-subtle/75 px-3 py-2 text-[13.5px] leading-relaxed text-foreground/90">
                              {firstKeyFact}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                        <TopicMetaBadge
                          readMinutes={effectiveReadMinutes}
                          audioMinutes={effectiveAudioMinutes}
                          compact={true}
                          bordered={false}
                          lang={lang}
                        />
                        <ArrowRightIcon
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-foreground motion-reduce:transition-none"
                        />
                      </div>
                      <span className="sr-only">{gridCopy.cardActionLabel}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          {!showAll && filteredTopics.length > FIRST_VIEW_LIMIT && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-card px-5 text-base font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
              >
                {lib.showAll}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
