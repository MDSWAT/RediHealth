"use client";

import { useId } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ChevronDownIcon } from "@/components/ui/icons";
import { formatHealthArticleTitle, healthArticlePath } from "@/lib/data/health-article-index";
import { HEALTH_TOPIC_CATEGORIES, articlesInCategory } from "@/lib/data/health-topic-categories";
import { healthArticleCopy } from "@/lib/i18n/health-article-translations";
import { healthContentLanguageNotice } from "@/lib/i18n/health-content-language";
import { informedHealthCopy } from "@/lib/i18n/informedhealth-translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

const SECTION_COPY: Record<Lang, { title: string; intro: string }> = {
  ro: { title: "Teme de sănătate", intro: "Toate articolele, grupate pe teme. Deschide o temă ca să vezi articolele din ea." },
  en: { title: "Health topics", intro: "Every article, grouped by topic. Open a topic to see its articles." },
  sq: { title: "Tema shëndetësore", intro: "Të gjithë artikujt, të grupuar sipas temës. Hap një temë për të parë artikujt e saj." },
  it: { title: "Temi di salute", intro: "Tutti gli articoli, raggruppati per tema. Apri un tema per vedere i suoi articoli." },
  hr: { title: "Zdravstvene teme", intro: "Svi članci, grupirani po temama. Otvori temu da vidiš njezine članke." },
  rom: { title: "Sastipnaske teme", intro: "Sa e artikolura, ande teme. Putar jekh tema te dikhes lake artikolura." },
  ru: { title: "Темы о здоровье", intro: "Все статьи, сгруппированные по темам. Откройте тему, чтобы увидеть её статьи." },
};

export interface HealthTopicCategoriesProps {
  embedded?: boolean;
}

/** Every detailed health article, grouped into broad categories that open and close. */
export function HealthTopicCategories({ embedded = false }: HealthTopicCategoriesProps = {}) {
  const { lang } = useLanguage();
  const headingId = useId();
  const copy = SECTION_COPY[lang] ?? SECTION_COPY.ro;
  const articleCopy = healthArticleCopy[lang] ?? healthArticleCopy.en;
  const languageNotice = healthContentLanguageNotice(lang);

  const innerContent = (
    <>
      <h2 id={headingId} className="max-w-3xl text-section font-semibold text-foreground text-balance">
        {copy.title}
      </h2>
      <p className="mt-3 max-w-(--measure-reading) text-body text-muted-foreground">{copy.intro}</p>
      {languageNotice && <p role="note" className="mt-3 max-w-(--measure-reading) text-body">{languageNotice}</p>}

      <div className="mt-6 border-t border-border">
        {HEALTH_TOPIC_CATEGORIES.map((category) => {
          const articles = articlesInCategory(category, lang);
          return (
            <details key={category.id} className="group border-b border-border">
              <summary className="press-row flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">
                  <span className="block text-title font-semibold leading-snug">{category.titles[lang] ?? category.titles.en}</span>
                  <span className="mt-0.5 block text-meta text-muted-foreground tabular-nums">{articleCopy.count(articles.length)}</span>
                </span>
                <ChevronDownIcon
                  className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-open:rotate-180 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </summary>
              <ul className="grid gap-x-8 pb-5 md:grid-cols-2 xl:grid-cols-3">
                {articles.map((article) => (
                  <li key={article.id} className="border-t border-border first:border-t-0 md:[&:nth-child(2)]:border-t-0 xl:[&:nth-child(3)]:border-t-0">
                    <Link
                      href={withLangPrefix(healthArticlePath(article.id), lang)}
                      className="press-row flex min-h-12 items-center py-2.5 text-body text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none dark:hover:text-sapphire-border"
                    >
                      {formatHealthArticleTitle(article, lang)}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>

      <p className="mt-6 text-body text-muted-foreground">{informedHealthCopy[lang]?.source ?? informedHealthCopy.en.source}</p>
    </>
  );

  if (embedded) {
    return (
      <section id="health-topics" aria-labelledby={headingId} className="scroll-mt-24">
        {innerContent}
      </section>
    );
  }

  return (
    <section id="health-topics" aria-labelledby={headingId} className="scroll-mt-24 border-t border-border py-10 sm:py-14">
      <Container>{innerContent}</Container>
    </section>
  );
}
