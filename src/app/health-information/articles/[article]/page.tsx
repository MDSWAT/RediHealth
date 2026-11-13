import { healthContentLanguageNotice } from "@/lib/i18n/health-content-language";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRightIcon } from "@/components/ui/icons";
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
  const narrationText = [
    article.title,
    article.intro,
    ...article.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
  ].join(". ");
  const wordCount = narrationText.trim().split(/\s+/).length;
  const readMinutes = Math.max(3, Math.round(wordCount / 180));
  const audioMinutes = Math.max(3, Math.round(wordCount / 145));

  return (
    <main id="main-content" className="flex-1">
      {/* Long read: a hairline under the header fills as the page is read. */}
      <div className="read-progress" aria-hidden="true" />
      <HealthArticleShell>
        <HealthArticleBackLink
          href={withLangPrefix("/health-information#health-articles", lang)}
          label={copy.back}
        />
        <article lang={article.contentLanguage}>
          <HealthArticleHeader
            title={article.title}
            lead={article.intro}
            reviewNote={copy.review}
            languageNotice={healthContentLanguageNotice(lang, article.contentLanguage)}
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
                contentLang={article.contentLanguage}
                textToSpeak={narrationText}
                simpleTakeaway={article.intro}
              />
            }
          />

          <HealthArticleToc
            title={copy.contents}
            ariaLabel={copy.contents}
            items={[
              ...article.sections.map((section, i) => ({
                href: `#article-section-${i}`,
                label: section.heading,
              })),
              { href: "#article-examples", label: copy.examples },
              { href: "#article-questions", label: copy.questions },
            ]}
          />

          {article.sections.map((section, i) => (
            <section key={i} aria-labelledby={`article-section-${i}`} className="mt-10">
              <h2 id={`article-section-${i}`} className={HEALTH_ARTICLE_SECTION_H2_CLASS}>
                {section.heading}
              </h2>
              {section.paragraphs.map((p, j) => (
                <p key={j} className={`mt-4 ${HEALTH_ARTICLE_PROSE_CLASS}`}>
                  {p}
                </p>
              ))}
            </section>
          ))}

          <section aria-labelledby="article-examples" className="mt-10">
            <h2 id="article-examples" className={HEALTH_ARTICLE_SECTION_H2_CLASS}>
              {copy.examples}
            </h2>
            <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-muted-foreground">
              {copy.exampleNote}
            </p>
            {article.examples.map((example, i) => (
              <div key={i} className="mt-6 rounded-xl border border-border bg-card p-6">
                <h3 className="text-xl font-semibold text-foreground">{example.title}</h3>
                <p className={`mt-3 ${HEALTH_ARTICLE_PROSE_CLASS}`}>{example.text}</p>
              </div>
            ))}
          </section>

          <section aria-labelledby="article-questions" className="mt-10">
            <h2 id="article-questions" className={HEALTH_ARTICLE_SECTION_H2_CLASS}>
              {copy.questions}
            </h2>
            <ul className="mt-4 max-w-[65ch] list-disc space-y-3.5 pl-6 text-[1.125rem] leading-[1.7] text-foreground">
              {article.questions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </section>

          <HealthArticleRelatedList
            heading={copy.related}
            ariaLabel={copy.related}
            items={[
              ...related.map((item) => ({
                key: `article-${item.id}`,
                href: withLangPrefix(healthArticlePath(item.id), lang),
                title: item.titles[lang],
              })),
              ...areas.map((area) => ({
                key: `area-${area.id}`,
                href: withLangPrefix(`${healthSummaryPath(area.id)}#topic-articles`, lang),
                title: area.titles[lang],
                emphasized: true,
              })),
            ]}
          />

          <TopicNextSteps lang={lang} topicTitle={article.title} className="mt-12" />

          <footer aria-labelledby="article-sources" className="mt-12 border-t border-border pt-8">
            <h2 id="article-sources" className="text-lg font-semibold text-foreground">
              {copy.sources}
            </h2>
            <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-muted-foreground">
              {copy.authorship}
            </p>
            <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-muted-foreground">
              {copy.sourceLanguage}
            </p>
            <ul className="mt-3 space-y-1">
              {article.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    hrefLang="en"
                    className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-sapphire underline underline-offset-4 hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {source.label}
                    <ArrowRightIcon className="h-4 w-4 shrink-0 -rotate-45" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </footer>
        </article>
      </HealthArticleShell>
    </main>
  );
}
