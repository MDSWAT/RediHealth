"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ChevronDownIcon } from "@/components/ui/icons";
import {
  formatHealthArticleTitle,
  healthArticleIndex,
  healthArticlePath,
} from "@/lib/data/health-article-index";
import { HEALTH_TOPIC_CATEGORIES, articlesInCategory } from "@/lib/data/health-topic-categories";
import { healthArticleCopy } from "@/lib/i18n/health-article-translations";
import { healthContentLanguageNotice } from "@/lib/i18n/health-content-language";
import { informedHealthCopy } from "@/lib/i18n/informedhealth-translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { DICTIONARY_UTILITY_COPY, DictionarySearch } from "./DictionaryParts";
import { rankByWordMatch } from "./word-match";

const SECTION_COPY: Record<Lang, { title: string; intro: string }> = {
  ro: { title: "Teme de sănătate", intro: "Toate articolele, grupate pe teme. Deschide o temă ca să vezi articolele din ea." },
  en: { title: "Health topics", intro: "Every article, grouped by topic. Open a topic to see its articles." },
  sq: { title: "Tema shëndetësore", intro: "Të gjithë artikujt, të grupuar sipas temës. Hap një temë për të parë artikujt e saj." },
  it: { title: "Temi di salute", intro: "Tutti gli articoli, raggruppati per tema. Apri un tema per vedere i suoi articoli." },
  hr: { title: "Zdravstvene teme", intro: "Svi članci, grupirani po temama. Otvori temu da vidiš njezine članke." },
  rom: { title: "Sastipnaske teme", intro: "Sa e artikolura, ande teme. Putar jekh tema te dikhes lake artikolura." },
  ru: { title: "Темы о здоровье", intro: "Все статьи, сгруппированные по темам. Откройте тему, чтобы увидеть её статьи." },
};

const SEARCH_PAGE_SIZE = 40;

const ARTICLE_ROW_CLASS =
  "press-row flex min-h-12 items-center py-2.5 text-body text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none dark:hover:text-sapphire-border";

export interface HealthTopicCategoriesProps {
  embedded?: boolean;
  /** Topic group shown open from the start: the one the reader just came back from. */
  initialOpenCategory?: string;
}

/**
 * Every detailed health article. A search field finds an article by a word of its title (accents
 * and small typing mistakes do not matter); below it the articles are grouped into broad
 * categories that open and close.
 */
export function HealthTopicCategories({
  embedded = false,
  initialOpenCategory,
}: HealthTopicCategoriesProps = {}) {
  const { lang } = useLanguage();
  const headingId = useId();
  const copy = SECTION_COPY[lang] ?? SECTION_COPY.ro;
  const articleCopy = healthArticleCopy[lang] ?? healthArticleCopy.en;
  const util = DICTIONARY_UTILITY_COPY[lang] ?? DICTIONARY_UTILITY_COPY.ro;
  const languageNotice = healthContentLanguageNotice(lang);

  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(SEARCH_PAGE_SIZE);
  const searching = query.trim().length >= 2;

  const results = useMemo(() => {
    if (!searching) return [];
    return rankByWordMatch(healthArticleIndex, query, (article) => ({
      names: [article.titles[lang] ?? article.titles.en, article.id.replaceAll("-", " ")],
    }));
  }, [searching, query, lang]);

  const innerContent = (
    <>
      <h2 id={headingId} className="max-w-3xl text-section font-semibold text-foreground text-balance">
        {copy.title}
      </h2>
      <p className="mt-3 max-w-(--measure-reading) text-body text-muted-foreground">{copy.intro}</p>
      {languageNotice && <p role="note" className="mt-3 max-w-(--measure-reading) text-body">{languageNotice}</p>}

      <DictionarySearch
        className="mt-5 max-w-xl"
        value={query}
        onChange={(value) => {
          setQuery(value);
          setLimit(SEARCH_PAGE_SIZE);
        }}
        placeholder={articleCopy.search}
        clearLabel={util.clearSearch}
      />

      {searching ? (
        <div aria-live="polite">
          <p role="status" className="mt-4 text-body text-muted-foreground tabular-nums">
            {results.length > 0 ? articleCopy.count(results.length) : articleCopy.empty}
          </p>
          {results.length > 0 && (
            <ul className="mt-2 grid gap-x-8 border-t border-border md:grid-cols-2 xl:grid-cols-3">
              {results.slice(0, limit).map((article) => (
                <li key={article.id} className="border-b border-border">
                  <Link href={withLangPrefix(healthArticlePath(article.id), lang)} className={ARTICLE_ROW_CLASS}>
                    {formatHealthArticleTitle(article, lang)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {results.length > limit && (
            <Button
              type="button"
              variant="outline"
              size="md"
              className="mt-5"
              onClick={() => setLimit((value) => value + SEARCH_PAGE_SIZE)}
            >
              {articleCopy.showMore}
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-6 border-t border-border">
          {HEALTH_TOPIC_CATEGORIES.map((category) => {
            const articles = articlesInCategory(category, lang);
            return (
              <details
                key={category.id}
                open={category.id === initialOpenCategory || undefined}
                className="group border-b border-border"
              >
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
                      <Link href={withLangPrefix(healthArticlePath(article.id), lang)} className={ARTICLE_ROW_CLASS}>
                        {formatHealthArticleTitle(article, lang)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      )}

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
