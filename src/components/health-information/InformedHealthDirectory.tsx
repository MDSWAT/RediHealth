"use client";
import { healthContentLanguageNotice } from "@/lib/i18n/health-content-language";


import { useId, useState, type CSSProperties } from "react";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon, SearchIcon, TagIcon, VolumeIcon } from "@/components/ui/icons";
import { FilterDropdown, FilterMenuOption } from "@/components/ui/FilterDropdown";
import { useLanguage } from "@/lib/i18n/language-context";
import { informedHealthCopy } from "@/lib/i18n/informedhealth-translations";
import { healthSummaryCopy } from "@/lib/i18n/health-summary-translations";
import { withLangPrefix } from "@/lib/i18n/routing";
import Link from "next/link";
import { healthArticleCopy } from "@/lib/i18n/health-article-translations";
import { AREA_GROUPS, healthSummaryPath, findInformedHealthAreas, type AreaGroup } from "@/lib/data/informedhealth-directory";
import { openSmartSearch } from "@/components/search/smart-search-events";
import { getSmartSearchCopy } from "@/lib/i18n/smart-search-copy";

const PAGE_SIZE = 12;

export function InformedHealthDirectoryJumpLink() {
  const { lang } = useLanguage();
  return <a href="#health-articles" className="mt-4 inline-flex min-h-11 items-center gap-2 whitespace-nowrap text-sm font-semibold text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{healthArticleCopy[lang].title}<ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" /></a>;
}

export function InformedHealthDirectory() {
  const { lang } = useLanguage();
  const copy = informedHealthCopy[lang];
  const searchCopy = getSmartSearchCopy(lang);
  const fieldId = useId();
  const [group, setGroup] = useState<AreaGroup | "all">("all");
  const [showAll, setShowAll] = useState(false);
  const results = findInformedHealthAreas(lang, "", group);
  const visible = showAll ? results : results.slice(0, PAGE_SIZE);

  return (
    <section id="informedhealth-library" aria-labelledby={`${fieldId}-title`} className="scroll-mt-24 border-t border-border py-10 sm:py-14">
      <Container>
        <h2 id={`${fieldId}-title`} className="max-w-3xl text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl">{copy.title}</h2>
        {healthContentLanguageNotice(lang) && <p role="note" className="mt-3 text-sm">{healthContentLanguageNotice(lang)}</p>}
        <p className="mt-3 max-w-[70ch] text-base leading-relaxed text-muted-foreground">{copy.intro}</p>
        <p className="mt-3 max-w-[75ch] text-sm leading-relaxed text-muted-foreground">{copy.languageNote}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(16rem,0.55fr)]">
          <div>
            <span id={`${fieldId}-search-label`} className="mb-2 block text-sm font-semibold text-foreground">{copy.search}</span>
            <button
              id={`${fieldId}-search`}
              type="button"
              onClick={() => openSmartSearch()}
              aria-labelledby={`${fieldId}-search-label`}
              className="press-row group flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-border-control bg-card px-4 py-2.5 text-left text-base text-muted-foreground transition-[border-color,background-color] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:border-sapphire/60 hover:bg-sapphire-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-sapphire motion-reduce:transition-none" aria-hidden="true" />
                <span className="truncate">{searchCopy.triggerPlaceholder}</span>
              </span>
              <span className="hidden shrink-0 whitespace-nowrap rounded-lg border border-border bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-foreground transition-colors group-hover:border-sapphire/40 group-hover:text-sapphire motion-reduce:transition-none sm:inline-flex">
                {searchCopy.triggerLabel}
              </span>
            </button>
          </div>
          <div>
            <span className="mb-2 block text-sm font-semibold text-foreground">{copy.group}</span>
            <FilterDropdown
              id={`${fieldId}-group`}
              hideLabel
              align="right"
              label={copy.group}
              value={group === "all" ? copy.all : copy.groups[group]}
              icon={<TagIcon className="h-4.5 w-4.5" aria-hidden="true" />}
            >
              <FilterMenuOption
                selected={group === "all"}
                onSelect={() => {
                  setGroup("all");
                  setShowAll(false);
                }}
              >
                {copy.all}
              </FilterMenuOption>
              {AREA_GROUPS.map((value) => (
                <FilterMenuOption
                  key={value}
                  selected={group === value}
                  onSelect={() => {
                    setGroup(value);
                    setShowAll(false);
                  }}
                >
                  {copy.groups[value]}
                </FilterMenuOption>
              ))}
            </FilterDropdown>
          </div>
        </div>

        <p role="status" aria-live="polite" className="mt-4 text-sm text-muted-foreground">{copy.results(results.length)}</p>
        {results.length ? (
          // Keyed by group: a new filter deals its rows in, in order.
          <ul key={group} className="mt-2 grid gap-x-8 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((area, index) => (
              <li key={area.id} className="list-in border-b border-border" style={{ "--i": index } as CSSProperties}>
                <Link href={withLangPrefix(healthSummaryPath(area.id), lang)} className="press-row group flex min-h-16 items-center justify-between gap-4 py-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                  <span className="min-w-0">
                    <span className="block text-base font-semibold leading-snug transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire"><span className="link-draw box-decoration-clone">{area.titles[lang]}</span></span>
                    <span className="mt-1 inline-flex items-center gap-1.5 text-xs leading-normal text-muted-foreground">
                      <VolumeIcon className="h-3.5 w-3.5 shrink-0 text-sapphire/80" aria-hidden="true" />
                      <span>{healthSummaryCopy[lang].read}</span>
                    </span>
                  </span>
                  <ArrowRightIcon className="arrow-travel h-4 w-4 shrink-0 text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire motion-reduce:transition-none" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-8">
            <p className="text-base text-muted-foreground">{copy.empty}</p>
            <button type="button" onClick={() => { setGroup("all"); setShowAll(false); }} className="mt-2 min-h-11 whitespace-nowrap text-sm font-semibold text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{copy.clear}</button>
          </div>
        )}

        {results.length > PAGE_SIZE && <button type="button" aria-expanded={showAll} onClick={() => setShowAll(value => !value)} className="press-row mt-5 min-h-11 whitespace-nowrap rounded-xl border border-border-control bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{showAll ? copy.showLess : copy.showAll}</button>}
        <div className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p>{copy.source}</p>
        </div>
      </Container>
    </section>
  );
}
