import { healthContentLanguageNotice } from "@/lib/i18n/health-content-language";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MedicalSafetyDisclaimer } from "@/components/health-information/MedicalSafetyDisclaimer";
import { getHealthSummary, getRelatedHealthSummaries } from "@/lib/data/health-summaries";
import { healthSummaryPath, informedHealthAreas } from "@/lib/data/informedhealth-directory";
import { healthSummaryCopy } from "@/lib/i18n/health-summary-translations";
import { getRequestLang, withLangPrefix } from "@/lib/i18n/server-routing";
import { languages } from "@/lib/i18n/translations";
import { getSiteUrl } from "@/lib/site-url";
import { HealthArticleDirectory } from "@/components/health-information/HealthArticleDirectory";

type Props = { params: Promise<{ topic: string }> };

export function generateStaticParams() {
  return informedHealthAreas.map(area => ({ topic: area.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  const lang = await getRequestLang();
  const summary = getHealthSummary(lang, topic);
  if (!summary) return {};
  const path = healthSummaryPath(topic);
  const origin = getSiteUrl();
  return {
    title: `${summary.title} - RediHealth`, description: summary.intro,
    alternates: {
      canonical: `${origin}${withLangPrefix(path, lang)}`,
      languages: Object.fromEntries(languages.map(language => [language.code, `${origin}${withLangPrefix(path, language.code)}`])),
    },
  };
}

export default async function HealthSummaryPage({ params }: Props) {
  const { topic } = await params;
  const lang = await getRequestLang();
  const summary = getHealthSummary(lang, topic);
  if (!summary) notFound();
  const copy = healthSummaryCopy[lang];
  const related = getRelatedHealthSummaries(lang, topic);
  return (
    <main id="main-content" className="flex-1">
      <Container className="py-8 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <Link href={withLangPrefix("/health-information#informedhealth-library", lang)} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowRightIcon className="h-4 w-4 rotate-180" aria-hidden="true" />{copy.back}</Link>
          <article lang={summary.contentLanguage} className="mt-5">
            {healthContentLanguageNotice(lang) && <p role="note" lang={lang} className="mb-4 text-sm">{healthContentLanguageNotice(lang)}</p>}
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground text-balance sm:text-4xl">{summary.title}</h1>
            <p className="mt-5 max-w-[70ch] text-lg leading-relaxed text-foreground">{summary.intro}</p>

            <section aria-labelledby="summary-overview" className="mt-9">
              <h2 id="summary-overview" className="text-xl font-semibold text-foreground">{copy.overview}</h2>
              <p className="mt-3 max-w-[70ch] text-base leading-relaxed text-muted-foreground">{summary.details}</p>
            </section>
            <section aria-labelledby="summary-questions" className="mt-9">
              <h2 id="summary-questions" className="text-xl font-semibold text-foreground">{copy.questions}</h2>
              <ul className="mt-3 list-disc space-y-3 pl-5 text-base leading-relaxed text-foreground">{summary.questions.map(question => <li key={question}>{question}</li>)}</ul>
            </section>

            <MedicalSafetyDisclaimer lang={lang} variant="plain" className="mt-8" />
            <div className="mt-10"><HealthArticleDirectory areaId={topic} /></div>

            {related.length > 0 && <nav aria-labelledby="summary-related" className="mt-10">
              <h2 id="summary-related" className="text-xl font-semibold text-foreground">{copy.related}</h2>
              <ul className="mt-3 divide-y divide-border border-y border-border">{related.map(item => <li key={item.id}><Link href={withLangPrefix(healthSummaryPath(item.id), lang)} className="flex min-h-12 items-center justify-between gap-4 py-3 text-base font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{item.title}<ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" /></Link></li>)}</ul>
            </nav>}

            <footer className="mt-10 border-t border-border pt-6" aria-labelledby="summary-source">
              <h2 id="summary-source" className="text-lg font-semibold text-foreground">{copy.sourceHeading}</h2>
              <p className="mt-3 max-w-[75ch] text-sm leading-relaxed text-muted-foreground">{copy.authorship}</p>
              <p className="mt-3 max-w-[75ch] text-sm leading-relaxed text-muted-foreground">{copy.sourceText}</p>
              <a href={summary.sourceUrl} hrefLang="en" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{copy.sourceLink}<ArrowRightIcon className="h-4 w-4 shrink-0 -rotate-45" aria-hidden="true" /></a>
            </footer>
          </article>
        </div>
      </Container>
    </main>
  );
}
