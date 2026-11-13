import { healthContentLanguageNotice } from "@/lib/i18n/health-content-language";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRightIcon } from "@/components/ui/icons";
import { HealthArticleDirectory } from "@/components/health-information/HealthArticleDirectory";
import {
  HEALTH_ARTICLE_PROSE_CLASS,
  HEALTH_ARTICLE_SECTION_H2_CLASS,
  HealthArticleBackLink,
  HealthArticleHeader,
  HealthArticleRelatedList,
  HealthArticleShell,
  HealthArticleToc,
} from "@/components/health-information/HealthArticleShell";
import { SubjectHeaderToolbar } from "@/components/health-information/SubjectHeaderToolbar";
import { TopicMetaBadge } from "@/components/health-information/TopicMetaBadge";
import { TopicNextSteps } from "@/components/health-information/TopicNextSteps";
import { getHealthSummary, getRelatedHealthSummaries } from "@/lib/data/health-summaries";
import { healthSummaryPath, informedHealthAreas } from "@/lib/data/informedhealth-directory";
import { healthArticleCopy } from "@/lib/i18n/health-article-translations";
import { healthSummaryCopy } from "@/lib/i18n/health-summary-translations";
import { getRequestLang, withLangPrefix } from "@/lib/i18n/server-routing";
import { languages } from "@/lib/i18n/translations";
import { getSiteUrl } from "@/lib/site-url";

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
  const tocCopy = healthArticleCopy[lang];
  const related = getRelatedHealthSummaries(lang, topic);
  const narrationText = `${summary.title}. ${summary.intro} ${summary.details} ${summary.questions.join(". ")}`;
  const wordCount = narrationText.trim().split(/\s+/).length;
  const readMinutes = Math.max(2, Math.round(wordCount / 180));
  const audioMinutes = Math.max(2, Math.round(wordCount / 145));

  return (
    <main id="main-content" className="flex-1">
      <HealthArticleShell>
        <HealthArticleBackLink
          href={withLangPrefix("/health-information#informedhealth-library", lang)}
          label={copy.back}
        />
        <article lang={summary.contentLanguage}>
          <HealthArticleHeader
            title={summary.title}
            lead={summary.intro}
            languageNotice={healthContentLanguageNotice(lang)}
            noticeLang={lang}
            meta={
              <TopicMetaBadge
                bordered={false}
                lang={lang}
                readMinutes={readMinutes}
                audioMinutes={audioMinutes}
              />
            }
            actions={
              <SubjectHeaderToolbar
                uiLang={lang}
                contentLang={summary.contentLanguage}
                textToSpeak={narrationText}
                simpleTakeaway={summary.intro}
              />
            }
          />

          <HealthArticleToc
            title={tocCopy.contents}
            ariaLabel={tocCopy.contents}
            items={[
              { href: "#summary-overview", label: copy.overview },
              { href: "#summary-questions", label: copy.questions },
              { href: "#topic-articles", label: tocCopy.inCategory },
              ...(related.length > 0 ? [{ href: "#summary-related", label: copy.related }] : []),
            ]}
          />

          <section aria-labelledby="summary-overview" className="mt-10">
            <h2 id="summary-overview" className={HEALTH_ARTICLE_SECTION_H2_CLASS}>
              {copy.overview}
            </h2>
            <p className={`mt-4 ${HEALTH_ARTICLE_PROSE_CLASS}`}>{summary.details}</p>
          </section>

          <section aria-labelledby="summary-questions" className="mt-10">
            <h2 id="summary-questions" className={HEALTH_ARTICLE_SECTION_H2_CLASS}>
              {copy.questions}
            </h2>
            <ul className="mt-4 max-w-[65ch] list-disc space-y-3.5 pl-6 text-[1.125rem] leading-[1.7] text-foreground">
              {summary.questions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </section>

          <div className="mt-12">
            <HealthArticleDirectory areaId={topic} />
          </div>

          <HealthArticleRelatedList
            heading={copy.related}
            headingId="summary-related"
            items={related.map((item) => ({
              key: item.id,
              href: withLangPrefix(healthSummaryPath(item.id), lang),
              title: item.title,
            }))}
          />

          <TopicNextSteps lang={lang} topicTitle={summary.title} className="mt-12" />

          <footer className="mt-12 border-t border-border pt-8" aria-labelledby="summary-source">
            <h2 id="summary-source" className="text-lg font-semibold text-foreground">
              {copy.sourceHeading}
            </h2>
            <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-muted-foreground">
              {copy.authorship}
            </p>
            <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-muted-foreground">
              {copy.sourceText}
            </p>
            <a
              href={summary.sourceUrl}
              hrefLang="en"
              className="mt-3 inline-flex min-h-11 items-center gap-2 text-base font-semibold text-sapphire underline underline-offset-4 hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copy.sourceLink}
              <ArrowRightIcon className="h-4 w-4 shrink-0 -rotate-45" aria-hidden="true" />
            </a>
          </footer>
        </article>
      </HealthArticleShell>
    </main>
  );
}
