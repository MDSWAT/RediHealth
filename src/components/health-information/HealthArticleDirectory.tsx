"use client";
import { healthContentLanguageNotice } from "@/lib/i18n/health-content-language";


import Link from "next/link";
import { useId, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { healthArticleCopy } from "@/lib/i18n/health-article-translations";
import { findHealthArticles, healthArticlePath } from "@/lib/data/health-article-index";
import { informedHealthAreas } from "@/lib/data/informedhealth-directory";
import { ArrowRightIcon } from "@/components/ui/icons";
import coverage from "@/content/health-articles/coverage.json";

const PAGE_SIZE = 12;
export function HealthArticleDirectory({ areaId }: { areaId?: string }) {
  const { lang } = useLanguage();
  const copy = healthArticleCopy[lang];
  const fieldId = useId();
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("all");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const results = findHealthArticles(lang, query, areaId ?? area);
  return <section id={areaId ? "topic-articles" : "health-articles"} aria-labelledby={`${fieldId}-heading`} className="scroll-mt-24">
    <h2 id={`${fieldId}-heading`} className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{areaId ? copy.inCategory : copy.title}</h2>
    {!areaId && <p className="mt-3 max-w-[70ch] text-base leading-relaxed text-muted-foreground">{copy.intro}</p>}
    {!areaId && coverage.missing.length > 0 && <p className="mt-3 max-w-[75ch] text-sm leading-relaxed text-muted-foreground">{copy.coverage(coverage.availableByLanguage[lang], coverage.indexedTopics)}</p>}
    {healthContentLanguageNotice(lang, results.every(item => item.availableLanguages.includes(lang)) ? lang : "en") && <p role="note" className="mt-3 text-sm">{healthContentLanguageNotice(lang)}</p>}
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <div><label htmlFor={`${fieldId}-search`} className="mb-2 block text-sm font-semibold text-foreground">{copy.search}</label><input id={`${fieldId}-search`} type="search" value={query} onChange={event => { setQuery(event.target.value); setLimit(PAGE_SIZE); }} className="min-h-12 w-full rounded-lg border border-border bg-card px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
      {!areaId && <div><label htmlFor={`${fieldId}-area`} className="mb-2 block text-sm font-semibold text-foreground">{copy.category}</label><select id={`${fieldId}-area`} value={area} onChange={event => { setArea(event.target.value); setLimit(PAGE_SIZE); }} className="min-h-12 w-full rounded-lg border border-border bg-card px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="all">{copy.all}</option>{informedHealthAreas.map(item => <option value={item.id} key={item.id}>{item.titles[lang]}</option>)}</select></div>}
    </div>
    <p role="status" aria-live="polite" className="mt-4 text-sm text-muted-foreground">{copy.count(results.length)}</p>
    {results.length ? <ul className="mt-2 grid gap-x-8 md:grid-cols-2">{results.slice(0, limit).map(item => <li key={item.id} className="border-b border-border"><Link href={withLangPrefix(healthArticlePath(item.id), lang)} className="group flex min-h-16 items-center justify-between gap-4 py-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"><span className="min-w-0"><span className="block text-base font-semibold leading-snug group-hover:underline">{item.titles[lang]}</span><span className="mt-1 block text-xs text-muted-foreground">{copy.read}</span></span><ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" /></Link></li>)}</ul> : <div className="py-6"><p className="text-muted-foreground">{copy.empty}</p><button type="button" onClick={() => { setQuery(""); setArea("all"); setLimit(PAGE_SIZE); }} className="mt-2 min-h-11 text-sm font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{copy.clear}</button></div>}
    {results.length > PAGE_SIZE && <div className="mt-5 flex flex-wrap gap-3">{limit < results.length && <button type="button" onClick={() => setLimit(value => value + 24)} className="min-h-11 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{copy.showMore}</button>}{limit > PAGE_SIZE && <button type="button" onClick={() => setLimit(PAGE_SIZE)} className="min-h-11 px-4 py-2 text-sm font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{copy.showLess}</button>}</div>}
  </section>;
}
