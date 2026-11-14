"use client";
import { healthContentLanguageNotice } from "@/lib/i18n/health-content-language";


import Link from "next/link";
import { useId, useState, type CSSProperties } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { healthArticleCopy } from "@/lib/i18n/health-article-translations";
import { findHealthArticles, healthArticlePath } from "@/lib/data/health-article-index";
import { informedHealthAreas } from "@/lib/data/informedhealth-directory";
import { ArrowRightIcon, SearchIcon, TagIcon, VolumeIcon } from "@/components/ui/icons";
import { FilterDropdown, FilterMenuOption } from "@/components/ui/FilterDropdown";
import { openSmartSearch } from "@/components/search/smart-search-events";
import { getSmartSearchCopy } from "@/lib/i18n/smart-search-copy";
import coverage from "@/content/health-articles/coverage.json";

const PAGE_SIZE = 12;
export function HealthArticleDirectory({ areaId }: { areaId?: string }) {
  const { lang } = useLanguage();
  const copy = healthArticleCopy[lang];
  const searchCopy = getSmartSearchCopy(lang);
  const fieldId = useId();
  const [area, setArea] = useState("all");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const results = findHealthArticles(lang, "", areaId ?? area);
  const isSingleColumn = Boolean(areaId);

  return (
    <section
      id={areaId ? "topic-articles" : "health-articles"}
      aria-labelledby={`${fieldId}-heading`}
      className="scroll-mt-24"
    >
      <h2
        id={`${fieldId}-heading`}
        className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
      >
        {areaId ? copy.inCategory : copy.title}
      </h2>
      {!areaId && (
        <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-muted-foreground">
          {copy.intro}
        </p>
      )}
      {!areaId && coverage.missing.length > 0 && (
        <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-muted-foreground">
          {copy.coverage(coverage.availableByLanguage[lang], coverage.indexedTopics)}
        </p>
      )}
      {healthContentLanguageNotice(
        lang,
        results.every((item) => item.availableLanguages.includes(lang)) ? lang : "en",
      ) && (
        <p role="note" className="mt-3 text-base leading-relaxed text-foreground">
          {healthContentLanguageNotice(lang)}
        </p>
      )}
      <div className={isSingleColumn ? "mt-6" : "mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(16rem,0.55fr)]"}>
        <div>
          <span
            id={`${fieldId}-search-label`}
            className="mb-2 block text-base font-semibold text-foreground"
          >
            {copy.search}
          </span>
          <button
            id={`${fieldId}-search`}
            type="button"
            onClick={() => openSmartSearch()}
            aria-labelledby={`${fieldId}-search-label`}
            className="press-row group flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-border-control bg-card px-4 py-2.5 text-left text-base text-muted-foreground transition-[border-color,background-color] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:border-sapphire/60 hover:bg-sapphire-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <SearchIcon
                className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-sapphire motion-reduce:transition-none"
                aria-hidden="true"
              />
              <span className="truncate">{searchCopy.triggerPlaceholder}</span>
            </span>
            <span className="hidden shrink-0 whitespace-nowrap rounded-lg border border-border bg-surface-subtle px-2.5 py-1 text-sm font-semibold text-foreground transition-colors group-hover:border-sapphire/40 group-hover:text-sapphire motion-reduce:transition-none sm:inline-flex">
              {searchCopy.triggerLabel}
            </span>
          </button>
        </div>
        {!areaId && (
          <div>
            <span className="mb-2 block text-base font-semibold text-foreground">
              {copy.category}
            </span>
            <FilterDropdown
              id={`${fieldId}-area`}
              hideLabel
              align="right"
              label={copy.category}
              value={area === "all" ? copy.all : (informedHealthAreas.find((item) => item.id === area)?.titles[lang] ?? copy.all)}
              icon={<TagIcon className="h-4.5 w-4.5" aria-hidden="true" />}
            >
              <FilterMenuOption
                selected={area === "all"}
                onSelect={() => {
                  setArea("all");
                  setLimit(PAGE_SIZE);
                }}
              >
                {copy.all}
              </FilterMenuOption>
              {informedHealthAreas.map((item) => (
                <FilterMenuOption
                  key={item.id}
                  selected={area === item.id}
                  onSelect={() => {
                    setArea(item.id);
                    setLimit(PAGE_SIZE);
                  }}
                >
                  {item.titles[lang]}
                </FilterMenuOption>
              ))}
            </FilterDropdown>
          </div>
        )}
      </div>
      <p role="status" aria-live="polite" className="mt-4 text-base text-muted-foreground">
        {copy.count(results.length)}
      </p>
      {results.length ? (
        // Keyed by area: a new filter deals its rows in, in order; "more" only deals the new rows.
        <ul
          key={area}
          className={
            isSingleColumn
              ? "mt-3 divide-y divide-border border-y border-border"
              : "mt-2 grid gap-x-8 md:grid-cols-2 xl:grid-cols-3"
          }
        >
          {results.slice(0, limit).map((item, index) => (
            <li
              key={item.id}
              style={{ "--i": index % PAGE_SIZE } as CSSProperties}
              className={isSingleColumn ? "list-in" : "list-in border-b border-border"}
            >
              <Link
                href={withLangPrefix(healthArticlePath(item.id), lang)}
                className="press-row group flex min-h-16 items-center justify-between gap-4 py-3.5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <span className="min-w-0">
                  <span className="block text-[1.0625rem] font-semibold leading-snug transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire motion-reduce:transition-none sm:text-lg">
                    <span>{item.titles[lang]}</span>
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <VolumeIcon className="h-3.5 w-3.5 shrink-0 text-sapphire/80" aria-hidden="true" />
                    <span>{copy.read}</span>
                  </span>
                </span>
                <ArrowRightIcon
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-6">
          <p className="text-base text-muted-foreground">{copy.empty}</p>
          <button
            type="button"
            onClick={() => {
              setArea("all");
              setLimit(PAGE_SIZE);
            }}
            className="mt-2 inline-flex min-h-12 items-center whitespace-nowrap text-sm font-semibold text-sapphire underline underline-offset-4 hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-[0.9375rem]"
          >
            {copy.clear}
          </button>
        </div>
      )}
      {results.length > PAGE_SIZE && (
        <div className="mt-5 flex flex-wrap gap-3">
          {limit < results.length && (
            <button
              type="button"
              onClick={() => setLimit((value) => value + 24)}
              className="press-row inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-xl border border-border-control bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-[0.9375rem]"
            >
              {copy.showMore}
            </button>
          )}
          {limit > PAGE_SIZE && (
            <button
              type="button"
              onClick={() => setLimit(PAGE_SIZE)}
              className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold text-sapphire underline underline-offset-4 hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-[0.9375rem]"
            >
              {copy.showLess}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
