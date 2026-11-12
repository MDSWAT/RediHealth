import { healthContentLanguageNotice } from "@/lib/i18n/health-content-language";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MedicalSafetyDisclaimer } from "@/components/health-information/MedicalSafetyDisclaimer";
import { healthArticleIndex, healthArticlePath } from "@/lib/data/health-article-index";
import { getHealthArticle } from "@/lib/data/health-articles";
import { healthSummaryPath, informedHealthAreas } from "@/lib/data/informedhealth-directory";
import { healthArticleCopy } from "@/lib/i18n/health-article-translations";
import { getRequestLang, withLangPrefix } from "@/lib/i18n/server-routing";
import { languages } from "@/lib/i18n/translations";
import { getSiteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ article: string }> };
export function generateStaticParams() { return healthArticleIndex.map(item => ({ article: item.id })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { article: id } = await params;
  const lang = await getRequestLang();
  const article = await getHealthArticle(lang, id);
  if (!article) return {};
  const origin = getSiteUrl();
  return { title: `${article.title} - RediHealth`, description: article.intro,
    alternates: { canonical: `${origin}${withLangPrefix(healthArticlePath(id), lang)}`,
      languages: Object.fromEntries(languages.map(l => [l.code, `${origin}${withLangPrefix(healthArticlePath(id), l.code)}`])) } };
}

export default async function HealthArticlePage({ params }: Props) {
  const { article: id } = await params;
  const lang = await getRequestLang();
  const article = await getHealthArticle(lang, id);
  if (!article) notFound();
  const copy = healthArticleCopy[lang];
  const areas = informedHealthAreas.filter(area => article.areaIds.includes(area.id));
  const related = healthArticleIndex.filter(item => item.id !== id && item.areaIds.some(area => article.areaIds.includes(area))).slice(0, 3);
  return <main id="main-content" className="flex-1">
    <Container className="py-8 sm:py-12"><div className="mx-auto max-w-3xl">
      <Link href={withLangPrefix("/health-information#health-articles", lang)} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowRightIcon className="h-4 w-4 rotate-180" aria-hidden="true" />{copy.back}</Link>
      <article lang={article.contentLanguage} className="mt-5">
        {healthContentLanguageNotice(lang, article.contentLanguage) && <p role="note" lang={lang} className="mb-4 text-sm">{healthContentLanguageNotice(lang, article.contentLanguage)}</p>}
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground text-balance sm:text-4xl">{article.title}</h1>
        <p className="mt-5 max-w-[70ch] text-lg leading-relaxed text-foreground">{article.intro}</p>
        <p className="mt-4 max-w-[75ch] text-sm leading-relaxed text-muted-foreground">{copy.review}</p>
        <nav aria-label={copy.contents} className="mt-8 border-y border-border py-4"><p className="font-semibold text-foreground">{copy.contents}</p><ul className="mt-2 space-y-1">{article.sections.map((section, i) => <li key={i}><a href={`#article-section-${i}`} className="inline-flex min-h-11 items-center text-sm text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{section.heading}</a></li>)}<li><a href="#article-examples" className="inline-flex min-h-11 items-center text-sm text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{copy.examples}</a></li><li><a href="#article-questions" className="inline-flex min-h-11 items-center text-sm text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{copy.questions}</a></li></ul></nav>
        {article.sections.map((section, i) => <section key={i} aria-labelledby={`article-section-${i}`} className="mt-10"><h2 id={`article-section-${i}`} className="scroll-mt-24 text-2xl font-semibold leading-snug text-foreground">{section.heading}</h2>{section.paragraphs.map((p, j) => <p key={j} className="mt-4 max-w-[70ch] text-base leading-relaxed text-foreground">{p}</p>)}</section>)}
        <section aria-labelledby="article-examples" className="mt-10"><h2 id="article-examples" className="scroll-mt-24 text-2xl font-semibold text-foreground">{copy.examples}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy.exampleNote}</p>{article.examples.map((example, i) => <div key={i} className="mt-6"><h3 className="text-lg font-semibold text-foreground">{example.title}</h3><p className="mt-3 max-w-[70ch] text-base leading-relaxed text-foreground">{example.text}</p></div>)}</section>
        <section aria-labelledby="article-questions" className="mt-10"><h2 id="article-questions" className="scroll-mt-24 text-2xl font-semibold text-foreground">{copy.questions}</h2><ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">{article.questions.map(question => <li key={question}>{question}</li>)}</ul></section>
        <MedicalSafetyDisclaimer lang={lang} variant="plain" className="mt-8" />
        {(areas.length > 0 || related.length > 0) && <nav aria-label={copy.related} className="mt-10"><h2 className="text-xl font-semibold text-foreground">{copy.related}</h2><ul className="mt-3 divide-y divide-border border-y border-border">{related.map(item => <li key={item.id}><Link className="flex min-h-12 items-center justify-between gap-4 py-3 text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={withLangPrefix(healthArticlePath(item.id), lang)}>{item.titles[lang]}<ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" /></Link></li>)}{areas.map(area => <li key={area.id}><Link className="flex min-h-12 items-center justify-between gap-4 py-3 font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={withLangPrefix(`${healthSummaryPath(area.id)}#topic-articles`, lang)}>{area.titles[lang]}<ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" /></Link></li>)}</ul></nav>}
        <footer aria-labelledby="article-sources" className="mt-10 border-t border-border pt-6"><h2 id="article-sources" className="text-lg font-semibold text-foreground">{copy.sources}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy.authorship}</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy.sourceLanguage}</p><ul className="mt-3">{article.sources.map(source => <li key={source.url}><a href={source.url} hrefLang="en" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{source.label}<ArrowRightIcon className="h-4 w-4 shrink-0 -rotate-45" aria-hidden="true" /></a></li>)}</ul></footer>
      </article>
    </div></Container>
  </main>;
}
