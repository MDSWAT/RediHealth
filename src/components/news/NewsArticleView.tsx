"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { ArticleListenButton } from "@/components/health-information/ArticleListenButton";
import {
  HEALTH_ARTICLE_PROSE_CLASS,
  HealthArticleBackLink,
  HealthArticleHeader,
  HealthArticleRelatedList,
  HealthArticleShell,
} from "@/components/health-information/HealthArticleShell";
import { TopicNextSteps } from "@/components/health-information/TopicNextSteps";
import { CheckIcon, ClockIcon, PinIcon } from "@/components/ui/icons";
import { EXTRA_MAP_COPY } from "@/components/ui/RomaniaCountyMap";
import { formatNewsDate, placeName, resolveNewsBasePath } from "@/components/news/news-format";
import {
  ALBANIA_WIDE,
  CROATIA_WIDE,
  ITALY_WIDE,
  MOLDOVA_WIDE,
  NEWS_ARTICLES,
  articleCountry,
  getLocalizedArticle,
  isNationalCounty,
  type NewsCountry,
} from "@/lib/data/news";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

// Tags stored in Romanian; items with their own translation already carry localized tags.
const TAG_LABELS: Partial<Record<Lang, Record<string, string>>> = {
  ru: {
    "Vaccinare ROR": "Вакцинация MMR", Pediatrie: "Педиатрия", "Sănătate publică": "Общественное здравоохранение", Prevenție: "Профилактика",
    Caravană: "Мобильная клиника", "Analize gratuite": "Бесплатные тесты", Comunitate: "Сообщество", "Acces medical": "Доступ к уходу",
    Gripă: "Грипп", "Vaccinare compensată": "Субсидируемая вакцинация", "Boli cronice": "Хроническое заболевание", Seniori: "Пожилые люди",
    "Ghid părinți": "Для родителей", "Tratament corect": "Правильное лечение", "Fără antibiotice": "Никаких антибиотиков", Igienă: "Гигиена",
    "Apă potabilă": "Питьевая вода", "Hepatită A": "Гепатит А", Stomatologie: "Стоматология", "Prevenție gratuită": "Бесплатная профилактика",
    "Vaccinare HPV": "Вакцинация против ВПЧ", Adolescenți: "Подростки", "Prevenție cancer": "Профилактика рака", Pneumologie: "Здоровье легких",
    "Poluare urbană": "Загрязнение воздуха", Astm: "Астма", "Sfaturi practice": "Практические советы",
  },

  en: {
    "Vaccinare ROR": "MMR vaccination", Pediatrie: "Paediatrics", "Sănătate publică": "Public health", Prevenție: "Prevention",
    Caravană: "Mobile clinic", "Analize gratuite": "Free tests", Comunitate: "Community", "Acces medical": "Access to care",
    Gripă: "Flu", "Vaccinare compensată": "Subsidised vaccination", "Boli cronice": "Chronic illness", Seniori: "Older adults",
    "Ghid părinți": "For parents", "Tratament corect": "Right treatment", "Fără antibiotice": "No antibiotics", Igienă: "Hygiene",
    "Apă potabilă": "Drinking water", "Hepatită A": "Hepatitis A", Stomatologie: "Dentistry", "Prevenție gratuită": "Free prevention",
    "Vaccinare HPV": "HPV vaccination", Adolescenți: "Teenagers", "Prevenție cancer": "Cancer prevention", Pneumologie: "Lung health",
    "Poluare urbană": "Air pollution", Astm: "Asthma", "Sfaturi practice": "Practical advice",
  },
  sq: {
    "Vaccinare ROR": "Vaksinimi MMR", Pediatrie: "Pediatri", "Sănătate publică": "Shëndeti publik", Prevenție: "Parandalim",
    Caravană: "Karvan mjekësor", "Analize gratuite": "Analiza falas", Comunitate: "Komunitet", "Acces medical": "Qasje në kujdes",
    Gripă: "Grip", "Vaccinare compensată": "Vaksinim i subvencionuar", "Boli cronice": "Sëmundje kronike", Seniori: "Të moshuar",
    "Ghid părinți": "Për prindërit", "Tratament corect": "Trajtim i duhur", "Fără antibiotice": "Pa antibiotikë", Igienă: "Higjienë",
    "Apă potabilă": "Ujë i pijshëm", "Hepatită A": "Hepatiti A", Stomatologie: "Stomatologji", "Prevenție gratuită": "Parandalim falas",
    "Vaccinare HPV": "Vaksinimi HPV", Adolescenți: "Adoleshentë", "Prevenție cancer": "Parandalimi i kancerit", Pneumologie: "Pneumologji",
    "Poluare urbană": "Ndotja e ajrit", Astm: "Astmë", "Sfaturi practice": "Këshilla praktike",
  },
  it: {
    "Vaccinare ROR": "Vaccino MPR", Pediatrie: "Pediatria", "Sănătate publică": "Sanità pubblica", Prevenție: "Prevenzione",
    Caravană: "Ambulatorio mobile", "Analize gratuite": "Esami gratuiti", Comunitate: "Comunità", "Acces medical": "Accesso alle cure",
    Gripă: "Influenza", "Vaccinare compensată": "Vaccino rimborsato", "Boli cronice": "Malattie croniche", Seniori: "Anziani",
    "Ghid părinți": "Per i genitori", "Tratament corect": "Cure appropriate", "Fără antibiotice": "Senza antibiotici", Igienă: "Igiene",
    "Apă potabilă": "Acqua potabile", "Hepatită A": "Epatite A", Stomatologie: "Odontoiatria", "Prevenție gratuită": "Prevenzione gratuita",
    "Vaccinare HPV": "Vaccino HPV", Adolescenți: "Adolescenti", "Prevenție cancer": "Prevenzione dei tumori", Pneumologie: "Pneumologia",
    "Poluare urbană": "Inquinamento urbano", Astm: "Asma", "Sfaturi practice": "Consigli pratici",
  },
  hr: {
    "Vaccinare ROR": "Cijepljenje MRP", Pediatrie: "Pedijatrija", "Sănătate publică": "Javno zdravstvo", Prevenție: "Prevencija",
    Caravană: "Mobilna ambulanta", "Analize gratuite": "Besplatne pretrage", Comunitate: "Zajednica", "Acces medical": "Pristup zdravstvu",
    Gripă: "Gripa", "Vaccinare compensată": "Besplatno cijepljenje", "Boli cronice": "Kronične bolesti", Seniori: "Starije osobe",
    "Ghid părinți": "Za roditelje", "Tratament corect": "Pravilno liječenje", "Fără antibiotice": "Bez antibiotika", Igienă: "Higijena",
    "Apă potabilă": "Pitka voda", "Hepatită A": "Hepatitis A", Stomatologie: "Stomatologija", "Prevenție gratuită": "Besplatna prevencija",
    "Vaccinare HPV": "Cijepljenje HPV", Adolescenți: "Mladi", "Prevenție cancer": "Prevencija raka", Pneumologie: "Pulmologija",
    "Poluare urbană": "Gradsko onečišćenje", Astm: "Astma", "Sfaturi practice": "Praktični savjeti",
  },
  rom: {
    "Vaccinare ROR": "Vakcinaciya ROR", Pediatrie: "Chhavengo sastipen", "Sănătate publică": "Publiko sastipen", Prevenție: "Arakhimos",
    Caravană: "Mobilni klinika", "Analize gratuite": "Bi lovengo analize", Comunitate: "Komuniteta", "Acces medical": "Sastipnasko akceso",
    Gripă: "Gripa", "Vaccinare compensată": "Pokindi vakcina", "Boli cronice": "Lungone nasvalimata", Seniori: "Phure",
    "Ghid părinți": "Svatura dadenge", "Tratament corect": "Chachi drab", "Fără antibiotice": "Bi antibiotikongo", Igienă: "Higiyena",
    "Apă potabilă": "Shuzho pani", "Hepatită A": "Hepatita A", Stomatologie: "Dantengo sastipen", "Prevenție gratuită": "Bi lovengo arakhimos",
    "Vaccinare HPV": "Vakcinaciya HPV", Adolescenți: "Terne", "Prevenție cancer": "Arakhimos", Pneumologie: "Phurdin",
    "Poluare urbană": "Foroski bavlal", Astm: "Astma", "Sfaturi practice": "Praktikane svatura",
  },
};

const COPY: Record<Lang, {
  readTime: string;
  read: string;
  related: string;
  prevention: string;
  topics: string;
  caravanHeading: string;
  where: string;
  when: string;
  freeServices: string;
}> = {
ru: {
"caravanHeading": "Где и когда принимает выездная клиника",
"where": "Где",
"when": "Часы приема",
"freeServices": "Бесплатные услуги:",
 readTime: "минута чтения", read: "Читать", related: "Подробнее по этой теме", prevention: "Что вы можете сделать", topics: "Темы" },

  ro: {
    readTime: "min lectură",
    read: "Citește",
    related: "Mai multe pe aceeași temă",
    prevention: "Ce poți face",
    topics: "Teme",
    caravanHeading: "Unde și când ajunge echipa mobilă",
    where: "Unde",
    when: "Program",
    freeServices: "Servicii gratuite:",
  },
  en: {
    readTime: "min read",
    read: "Read",
    related: "More on this topic",
    prevention: "What you can do",
    topics: "Topics",
    caravanHeading: "Where and when the mobile clinic stops",
    where: "Where",
    when: "Hours",
    freeServices: "Free services:",
  },
  sq: {
    readTime: "min lexim",
    read: "Lexo",
    related: "Më shumë për këtë temë",
    prevention: "Çfarë mund të bësh",
    topics: "Temat",
    caravanHeading: "Ku dhe kur ndalon ekipi lëvizës",
    where: "Ku",
    when: "Orari",
    freeServices: "Shërbime falas:",
  },
  it: {
    readTime: "min di lettura",
    read: "Leggi",
    related: "Altro su questo tema",
    prevention: "Cosa puoi fare",
    topics: "Temi",
    caravanHeading: "Dove e quando si ferma l'ambulatorio mobile",
    where: "Dove",
    when: "Orario",
    freeServices: "Servizi gratuiti:",
  },
  hr: {
    readTime: "min čitanja",
    read: "Pročitaj",
    related: "Više o ovoj temi",
    prevention: "Što možeš učiniti",
    topics: "Teme",
    caravanHeading: "Gdje i kada dolazi mobilna ambulanta",
    where: "Gdje",
    when: "Radno vrijeme",
    freeServices: "Besplatne usluge:",
  },
  rom: {
    readTime: "min ginavimos",
    read: "Ginav",
    related: "May but pe kadi tema",
    prevention: "So shaj keres",
    topics: "Teme",
    caravanHeading: "Kaj thaj kana avel i mobilni klinika",
    where: "Kaj",
    when: "Chasurya",
    freeServices: "Bi lovengo serviciye:",
  },
};

/** One news item: header, body, mobile clinic details or preventive measures, and related items. */
export function NewsArticleView({ id }: { id: string }) {
  const { lang, t } = useLanguage();
  const pathname = usePathname();
  const basePath = resolveNewsBasePath(pathname);
  const np = t.newsPage;
  const c = COPY[lang] ?? COPY.ro;
  const extra = EXTRA_MAP_COPY[lang] ?? EXTRA_MAP_COPY.ro;

  const rawArticle = NEWS_ARTICLES.find((a) => a.slug === id || a.id === id);

  const categoryLabels = useMemo<Record<string, string>>(
    () => ({
      "Alerte locale": np.categories.epidemics,
      "Caravane medicale": np.categories.caravan,
      "Campanii de vaccinare": np.categories.vaccinationCampaigns,
      "Sfaturi de sezon": np.categories.seasonalAdvice,
    }),
    [np],
  );

  if (!rawArticle) return null;
  const article = getLocalizedArticle(rawArticle, lang);

  const relatedArticles = NEWS_ARTICLES.filter(
    (a) =>
      a.id !== rawArticle.id &&
      articleCountry(a) === articleCountry(rawArticle) &&
      (a.category === rawArticle.category || a.county === rawArticle.county),
  )
    .slice(0, 2)
    .map((a) => getLocalizedArticle(a, lang));

  const placeLabel = (place: string, itemCountry: NewsCountry) => {
    if (place === ITALY_WIDE && itemCountry === "it") return t.countyMap?.allItaly ?? ITALY_WIDE;
    if (place === MOLDOVA_WIDE && itemCountry === "md") return extra.allMoldova;
    if (place === CROATIA_WIDE && itemCountry === "hr") return extra.allCroatia;
    if (place === ALBANIA_WIDE && itemCountry === "al") return extra.allAlbania;
    if (isNationalCounty(place)) return np.allCounties;
    return placeName(place, lang);
  };

  const category = categoryLabels[article.category] ?? article.categoryLabel ?? article.category;
  const tags = article.tags.map((tag) => TAG_LABELS[lang]?.[tag] ?? tag);

  return (
    <main id="main-content" className="min-h-[85vh] flex-1">
      <HealthArticleShell>
        <HealthArticleBackLink href={withLangPrefix(basePath, lang)} label={np.backToNews} />
        <article>
          <HealthArticleHeader
            title={article.title}
            titleLang={article.language}
            lead={article.summary}
            leadLang={article.language}
            meta={
              <>
                <span className="font-medium text-foreground">{category}</span>
                <span className="inline-flex items-center gap-1.5 border-l border-border pl-3">
                  <PinIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {placeLabel(article.county, articleCountry(article))}
                </span>
                <time dateTime={article.date} className="border-l border-border pl-3 tabular-nums">
                  {formatNewsDate(article.date, lang)}
                </time>
                <span className="border-l border-border pl-3 tabular-nums">
                  {article.readTimeMinutes} {c.readTime}
                </span>
              </>
            }
            actions={
              <ArticleListenButton
                uiLang={lang}
                contentLang={article.language ?? lang}
                listenLabel={np.playAudio}
                stopLabel={np.pauseAudio}
                textToSpeak={`${article.title}. ${article.summary}. ${article.content.join(" ")}`}
              />
            }
          />

          <div lang={article.language} className={`mt-10 space-y-5 ${HEALTH_ARTICLE_PROSE_CLASS}`}>
            {article.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {article.caravanDetails && (
            <section
              aria-labelledby="article-caravan"
              className="mt-10 rounded-xl border border-border bg-card p-6 sm:p-7"
            >
              <h2
                id="article-caravan"
                className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
              >
                {c.caravanHeading}
              </h2>
              <dl
                lang={article.language}
                className="mt-4 space-y-3 text-[1.0625rem] leading-[1.7] text-foreground sm:text-[1.125rem]"
              >
                <div className="flex items-start gap-2.5">
                  <dt className="sr-only">{c.where}</dt>
                  <PinIcon aria-hidden="true" className="mt-1.5 h-4 w-4 shrink-0 text-sapphire" />
                  <dd>
                    <span className="font-semibold text-foreground">
                      {article.caravanDetails.village}
                    </span>
                    <span className="text-muted-foreground">
                      , {article.caravanDetails.landmark}
                    </span>
                  </dd>
                </div>
                <div className="flex items-start gap-2.5">
                  <dt className="sr-only">{c.when}</dt>
                  <ClockIcon aria-hidden="true" className="mt-1.5 h-4 w-4 shrink-0 text-sapphire" />
                  <dd className="tabular-nums">{article.caravanDetails.hours}</dd>
                </div>
                {article.caravanDetails.freeServices.length > 0 && (
                  <div className="pt-1 text-muted-foreground">
                    <dt className="inline font-semibold text-foreground">{c.freeServices}</dt>{" "}
                    <dd className="inline text-foreground">
                      {article.caravanDetails.freeServices.join(", ")}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {article.preventiveSteps && article.preventiveSteps.length > 0 && (
            <section
              aria-labelledby="article-prevention"
              className="mt-10 rounded-xl border border-border bg-card p-6 sm:p-7"
            >
              <h2
                id="article-prevention"
                className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
              >
                {c.prevention}
              </h2>
              <ul
                lang={article.language}
                className="mt-4 space-y-3 text-[1.0625rem] leading-[1.7] text-foreground sm:text-[1.125rem]"
              >
                {article.preventiveSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckIcon
                      aria-hidden="true"
                      className="mt-1 h-5 w-5 shrink-0 text-sapphire"
                    />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tags.length > 0 && (
            <p className="mt-8 text-base leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">{c.topics}:</span> {tags.join(", ")}
            </p>
          )}

          <HealthArticleRelatedList
            heading={c.related}
            headingId="article-related"
            items={relatedArticles.map((rel) => ({
              key: rel.id,
              href: withLangPrefix(`${basePath}/${rel.slug}`, lang),
              title: rel.title,
              titleLang: rel.language,
              meta: `${categoryLabels[rel.category] ?? rel.category}, ${placeLabel(rel.county, articleCountry(rel))}`,
            }))}
          />

          <TopicNextSteps lang={lang} topicTitle={article.title} className="mt-12" />
        </article>
      </HealthArticleShell>
    </main>
  );
}
