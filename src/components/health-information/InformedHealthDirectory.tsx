"use client";
import { healthContentLanguageNotice } from "@/lib/i18n/health-content-language";


import { useId, useState } from "react";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon, SearchIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { informedHealthCopy } from "@/lib/i18n/informedhealth-translations";
import { healthSummaryCopy } from "@/lib/i18n/health-summary-translations";
import { withLangPrefix } from "@/lib/i18n/routing";
import Link from "next/link";
import { healthArticleCopy } from "@/lib/i18n/health-article-translations";
import { AREA_GROUPS, healthSummaryPath, findInformedHealthAreas, type AreaGroup } from "@/lib/data/informedhealth-directory";

const PAGE_SIZE = 12;

export function InformedHealthDirectoryJumpLink() {
  const { lang } = useLanguage();
  return <a href="#health-articles" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{healthArticleCopy[lang].title}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></a>;
}

export function InformedHealthDirectory() {
  const { lang } = useLanguage();
  const copy = informedHealthCopy[lang];
  const fieldId = useId();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<AreaGroup | "all">("all");
  const [showAll, setShowAll] = useState(false);
  const results = findInformedHealthAreas(lang, query, group);
  const visible = showAll ? results : results.slice(0, PAGE_SIZE);

  return (
    <section id="informedhealth-library" aria-labelledby={`${fieldId}-title`} className="scroll-mt-24 border-t border-border py-10 sm:py-14">
      <Container>
        <h2 id={`${fieldId}-title`} className="max-w-3xl text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl">{copy.title}</h2>
        {healthContentLanguageNotice(lang) && <p role="note" className="mt-3 text-sm">{healthContentLanguageNotice(lang)}</p>}
        <p className="mt-3 max-w-[70ch] text-base leading-relaxed text-muted-foreground">{copy.intro}</p>
        <p className="mt-3 max-w-[75ch] text-sm leading-relaxed text-muted-foreground">{copy.languageNote}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <label htmlFor={`${fieldId}-search`} className="mb-2 block text-sm font-semibold text-foreground">{copy.search}</label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input id={`${fieldId}-search`} type="search" value={query} onChange={event => { setQuery(event.target.value); setShowAll(false); }} className="min-h-12 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>
          <div className="sm:max-w-xs">
            <label htmlFor={`${fieldId}-group`} className="mb-2 block text-sm font-semibold text-foreground">{copy.group}</label>
            <select id={`${fieldId}-group`} value={group} onChange={event => { setGroup(event.target.value as AreaGroup | "all"); setShowAll(false); }} className="min-h-12 w-full rounded-lg border border-border bg-card px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="all">{copy.all}</option>
              {AREA_GROUPS.map(value => <option key={value} value={value}>{copy.groups[value]}</option>)}
            </select>
          </div>
        </div>

        <p role="status" aria-live="polite" className="mt-4 text-sm text-muted-foreground">{copy.results(results.length)}</p>
        {results.length ? (
          <ul className="mt-2 grid gap-x-8 md:grid-cols-2">
            {visible.map(area => (
              <li key={area.id} className="border-b border-border">
                <Link href={withLangPrefix(healthSummaryPath(area.id), lang)} className="group flex min-h-16 items-center justify-between gap-4 py-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                  <span className="min-w-0">
                    <span className="block text-base font-semibold leading-snug underline-offset-4 group-hover:underline">{area.titles[lang]}</span>
                    <span className="mt-1 block text-xs leading-normal text-muted-foreground">{healthSummaryCopy[lang].read}</span>
                  </span>
                  <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-8">
            <p className="text-base text-muted-foreground">{copy.empty}</p>
            <button type="button" onClick={() => { setQuery(""); setGroup("all"); setShowAll(false); }} className="mt-2 min-h-11 text-sm font-semibold text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{copy.clear}</button>
          </div>
        )}

        {results.length > PAGE_SIZE && <button type="button" aria-expanded={showAll} onClick={() => setShowAll(value => !value)} className="mt-5 min-h-11 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{showAll ? copy.showLess : copy.showAll}</button>}
        <div className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p>{copy.source}</p>
        </div>
      </Container>
    </section>
  );
}
