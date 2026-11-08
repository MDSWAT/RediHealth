"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, SearchIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import {
  type TopicItem,
  getHealthTopicsList,
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

const LIBRARY_COPY: Record<string, { howToRead: string; dictionary: string; checkSymptom: string; showAll: string; title: string }> = {
  ro: { howToRead: "Cum citești", dictionary: "Dicționar", checkSymptom: "Verifică un simptom", showAll: "Arată toate ghidurile", title: "Ghiduri de sănătate" },
  en: { howToRead: "How to read", dictionary: "Dictionary", checkSymptom: "Check a symptom", showAll: "Show all guides", title: "Health guides" },
  sq: { howToRead: "Si të lexosh", dictionary: "Fjalori", checkSymptom: "Kontrollo një simptomë", showAll: "Shfaq të gjithë udhëzuesit", title: "Udhëzues shëndetësorë" },
  it: { howToRead: "Come leggere", dictionary: "Dizionario", checkSymptom: "Controlla un sintomo", showAll: "Mostra tutte le guide", title: "Guide alla salute" },
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
    return (
      topic.title.toLowerCase().includes(normalizedQuery) ||
      topic.description.toLowerCase().includes(normalizedQuery) ||
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
  // Same wording as the rest of the site for the symptom check.
  const checkSymptomLabel = t?.healthInfoPage?.tabs?.triage ?? lib.checkSymptom;
  const [showAll, setShowAll] = useState(false);
  const visibleTopics = showAll ? filteredTopics : filteredTopics.slice(0, FIRST_VIEW_LIMIT);

  return (
    <section
      aria-labelledby="health-library-title"
      className={className}
    >
      {/* The page H1 already names the library; this heading is for screen readers. */}
      <h2 id="health-library-title" className="sr-only">
        {lib.title}
      </h2>

      {/* Row 1: search, and the one way out to the symptom check */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={gridCopy.searchPlaceholder}
            aria-label={gridCopy.searchAriaLabel}
            className="min-h-12 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-base text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
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
        className="mt-3 flex overflow-x-auto border-b border-border scrollbar-none"
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
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="text-muted-foreground">{lib.howToRead}:</span>
        <ReadingLevelSwitcher
          level={readingLevel}
          onChange={(lvl) => onReadingLevelChange?.(lvl)}
        />
        {onOpenDictionary && (
          <>
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={onOpenDictionary}
              className="min-h-11 font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground"
            >
              {lib.dictionary}
            </button>
          </>
        )}
        <p role="status" className="ml-auto text-muted-foreground">
          {resultCountText}
          {searchQuery ? gridCopy.countSearchSuffix : ""}
        </p>
      </div>

      {filteredTopics.length === 0 ? (
        <div className="mt-4 px-6 py-10 text-center">
          <p className="text-base font-semibold text-foreground">{gridCopy.emptyTitle}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{gridCopy.emptyDescription}</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("toate");
            }}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-muted"
          >
            {gridCopy.emptyResetButton}
          </button>
        </div>
      ) : (
        <>
          {/* Guides: one 3:2 photo, the title and one short description per card.
              Rows stretch to the tallest card so the meta line sits on one baseline. */}
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visibleTopics.map((topic) => (
              <li key={topic.slug} className="flex">
                <Link
                  href={withLangPrefix(`/health-information/${topic.slug}`, lang)}
                  className="group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 motion-reduce:transition-none"
                >
                  <div className="relative aspect-[3/2] w-full overflow-hidden border-b border-border/60 bg-surface-subtle">
                    <Image
                      src={topic.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <h3 className="text-base font-semibold leading-snug tracking-[-0.01em] text-foreground text-balance sm:text-lg">
                      {topic.title}
                    </h3>
                    <p className="mt-1.5 text-base leading-relaxed text-muted-foreground text-pretty sm:text-sm">
                      {topic.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                      <TopicMetaBadge
                        readMinutes={topic.readMinutes}
                        audioMinutes={topic.audioMinutes}
                        compact={true}
                        bordered={false}
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
            ))}
          </ul>
          {!showAll && filteredTopics.length > FIRST_VIEW_LIMIT && (
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-card px-5 text-base font-semibold text-foreground hover:bg-muted"
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
