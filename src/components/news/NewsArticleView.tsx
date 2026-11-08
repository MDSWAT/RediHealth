"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, PinIcon, StethoscopeIcon } from "@/components/ui/icons";
import { formatNewsDate } from "@/components/news/news-format";
import { ITALY_WIDE, NEWS_ARTICLES, articleCountry, getLocalizedArticle, isNationalCounty } from "@/lib/data/news";
import { useLanguage } from "@/lib/i18n/language-context";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { speechEngine, formatSpeechText } from "@/lib/audio/speech-engine";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

// Specialties stored in Romanian on older items; newer items carry their own translation.
const DOCTOR_SPECIALTIES: Partial<Record<Lang, Record<string, string>>> = {
  en: {
    "Medic primar epidemiolog, DSP Iași": "Senior epidemiologist, Iași Public Health Directorate",
    "Senior epidemiologist, DSP Iași": "Senior epidemiologist, Iași Public Health Directorate",
    "Medic medicină de familie, Coordonator caravană": "Family doctor, mobile clinic coordinator",
    "Medic infecționist, Institutul Matei Balș": "Infectious disease specialist, Matei Balș Institute",
    "Medic specialist pediatrie": "Paediatric specialist",
    "Medic igienist DSP Cluj": "Public health hygienist, Cluj Public Health Directorate",
    "Public health hygienist, DSP Cluj": "Public health hygienist, Cluj Public Health Directorate",
    "Medic stomatolog pediatru, Voluntari pentru Sănătate": "Paediatric dentist, Volunteers for Health",
    "Medic primar obstetrică-ginecologie și sănătate publică": "Senior obstetrician-gynaecologist and public health specialist",
    "Medic primar pneumolog, Institutul Marius Nasta": "Senior pulmonologist, Marius Nasta Institute",
  },
  sq: {
    "Medic primar epidemiolog, DSP Iași": "Epidemiologe kryesore, Drejtoria e Shëndetit Publik Iași",
    "Epidemiologe kryesore, DSP Iași": "Epidemiologe kryesore, Drejtoria e Shëndetit Publik Iași",
    "Medic medicină de familie, Coordonator caravană": "Mjek familjeje, koordinator i karvanit mjekësor",
    "Medic infecționist, Institutul Matei Balș": "Mjek infeksionist, Instituti Matei Balș",
    "Medic specialist pediatrie": "Mjek specialist pediatër",
    "Medic igienist DSP Cluj": "Mjeke higjieniste, Drejtoria e Shëndetit Publik Cluj",
    "Mjeke higjieniste, DSP Cluj": "Mjeke higjieniste, Drejtoria e Shëndetit Publik Cluj",
    "Medic stomatolog pediatru, Voluntari pentru Sănătate": "Stomatolog pediatrik, Vullnetarë për Shëndetin",
    "Medic primar obstetrică-ginecologie și sănătate publică": "Mjeke kryesore obstetër-gjinekologe dhe e shëndetit publik",
    "Medic primar pneumolog, Institutul Marius Nasta": "Pneumolog kryesor, Instituti Marius Nasta",
  },
  it: {
    "Medic primar epidemiolog, DSP Iași": "Medico epidemiologo primario, Direzione di Sanità Pubblica di Iași",
    "Medico epidemiologo primario, DSP Iași": "Medico epidemiologo primario, Direzione di Sanità Pubblica di Iași",
    "Medic medicină de familie, Coordonator caravană": "Medico di medicina generale, coordinatore dell'ambulatorio mobile",
    "Medic infecționist, Institutul Matei Balș": "Infettivologo, Istituto Matei Balș",
    "Medic specialist pediatrie": "Medico specialista in pediatria",
    "Medic igienist DSP Cluj": "Medico igienista, Direzione di Sanità Pubblica di Cluj",
    "Medico igienista, DSP Cluj": "Medico igienista, Direzione di Sanità Pubblica di Cluj",
    "Medic stomatolog pediatru, Voluntari pentru Sănătate": "Odontoiatra pediatrico, Volontari per la Salute",
    "Medic primar obstetrică-ginecologie și sănătate publică": "Medico primario in ostetricia-ginecologia e sanità pubblica",
    "Medic primar pneumolog, Institutul Marius Nasta": "Pneumologo primario, Istituto Marius Nasta",
  },
};

// Tags stored in Romanian; items with their own translation already carry localized tags.
const TAG_LABELS: Partial<Record<Lang, Record<string, string>>> = {
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
};

const COPY: Record<Lang, { readTime: string; read: string; related: string; prevention: string; topics: string }> = {
  ro: { readTime: "min lectură", read: "Citește", related: "Mai multe pe aceeași temă", prevention: "Ce poți face", topics: "Teme" },
  en: { readTime: "min read", read: "Read", related: "More on this topic", prevention: "What you can do", topics: "Topics" },
  sq: { readTime: "min lexim", read: "Lexo", related: "Më shumë për këtë temë", prevention: "Çfarë mund të bësh", topics: "Temat" },
  it: { readTime: "min di lettura", read: "Leggi", related: "Altro su questo tema", prevention: "Cosa puoi fare", topics: "Temi" },
};

const SPEECH_LANG: Record<Lang, string> = { ro: "ro-RO", en: "en-GB", sq: "sq-AL", it: "it-IT" };

// Boxicons bx-play / bx-pause, same family as the shared icon set.
function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M7 6v12l10-6z" />
    </svg>
  );
}
function PauseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M8 7h3v10H8zm5 0h3v10h-3z" />
    </svg>
  );
}

/** One news item: header, doctor check, body, measures, related items. */
export function NewsArticleView({ id }: { id: string }) {
  const { lang, t } = useLanguage();
  const np = t.newsPage;
  const c = COPY[lang] ?? COPY.ro;
  const voiceEnabled = isVoiceEnabled(lang);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const rawArticle = NEWS_ARTICLES.find((a) => a.slug === id || a.id === id);

  // Reading aloud must stop when the reader leaves the page.
  useEffect(() => {
    return () => {
      speechEngine.stop();
    };
  }, []);

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

  function handleToggleAudio() {
    if (typeof window === "undefined" || !voiceEnabled) return;
    if (isPlayingAudio) {
      speechEngine.stop();
      setIsPlayingAudio(false);
      return;
    }
    const targetLang = SPEECH_LANG[article.language ?? lang] ?? "ro-RO";
    const fullText = formatSpeechText(`${article.title}. ${article.summary}. ${article.content.join(" ")}`, targetLang);
    setIsPlayingAudio(true);
    speechEngine.speak(fullText, {
      lang: targetLang,
      rate: 0.95,
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  }

  const placeLabel = (place: string) =>
    place === ITALY_WIDE ? (t.countyMap?.allItaly ?? ITALY_WIDE) : isNationalCounty(place) ? np.allCounties : place;
  const category = categoryLabels[article.category] ?? article.categoryLabel ?? article.category;
  const specialty = DOCTOR_SPECIALTIES[lang]?.[article.verifiedDoctor.specialty] ?? article.verifiedDoctor.specialty;
  const tags = article.tags.map((tag) => TAG_LABELS[lang]?.[tag] ?? tag);

  return (
    <main id="main-content" className="min-h-[85vh] bg-background py-10 sm:py-14">
      <article>
      <Container className="max-w-3xl">
        <nav aria-label={np.backToNews} className="mb-8">
          <Link
            href={withLangPrefix("/stiri", lang)}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {np.backToNews}
          </Link>
        </nav>

        <header className="border-b border-border pb-8">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground tabular-nums">
            <span className="font-medium text-foreground">{category}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <PinIcon className="h-3.5 w-3.5" />
              {placeLabel(article.county)}
            </span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.date}>{formatNewsDate(article.date, lang)}</time>
            <span aria-hidden="true">·</span>
            <span>
              {article.readTimeMinutes} {c.readTime}
            </span>
          </p>

          <h1 lang={article.language} className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
            {article.title}
          </h1>

          <p lang={article.language} className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            {article.summary}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">{np.verifiedByDoctor}:</span> {article.verifiedDoctor.name}
              <span className="block text-xs">
                {specialty} · {formatNewsDate(article.verifiedDoctor.verifiedDate, lang)}
              </span>
            </p>

            {voiceEnabled && (
              <button
                type="button"
                onClick={handleToggleAudio}
                aria-pressed={isPlayingAudio}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {isPlayingAudio ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                <span>{isPlayingAudio ? np.pauseAudio : np.playAudio}</span>
                <span className="text-muted-foreground tabular-nums">{article.audioNarrationDuration}</span>
              </button>
            )}
          </div>
        </header>

        <div lang={article.language} className="mt-8 max-w-[68ch] space-y-5 text-[17px] leading-relaxed text-foreground/90">
          {article.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {article.preventiveSteps && article.preventiveSteps.length > 0 && (
          <section aria-labelledby="article-prevention" className="mt-10 rounded-xl border border-border bg-card p-6">
            <h2 id="article-prevention" className="text-base font-semibold text-foreground">
              {c.prevention}
            </h2>
            <ul lang={article.language} className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-foreground/90">
              {article.preventiveSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-sapphire" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tags.length > 0 && (
          <p className="mt-8 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{c.topics}:</span> {tags.join(", ")}
          </p>
        )}

        <section
          aria-labelledby="article-handover"
          className="mt-10 flex flex-col gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-1">
            <h2 id="article-handover" className="text-base font-semibold text-foreground">
              {np.handoverTitle}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{np.handoverSubtitle}</p>
          </div>
          <Link
            href={withLangPrefix("/medic-online", lang)}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg bg-sapphire px-4 py-2 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <StethoscopeIcon className="h-4 w-4" />
            <span>{np.handoverTelemed}</span>
          </Link>
        </section>

        {relatedArticles.length > 0 && (
          <section aria-labelledby="article-related" className="mt-14 border-t border-border pt-8">
            <h2 id="article-related" className="text-lg font-semibold tracking-tight text-foreground">
              {c.related}
            </h2>
            <ul className="mt-2 divide-y divide-border">
              {relatedArticles.map((rel) => (
                <li key={rel.id}>
                  <Link
                    href={withLangPrefix(`/stiri/${rel.slug}`, lang)}
                    className="group flex items-start justify-between gap-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span>
                      <span className="block text-xs text-muted-foreground">
                        {categoryLabels[rel.category] ?? rel.category} · {placeLabel(rel.county)}
                      </span>
                      <span lang={rel.language} className="mt-1 block text-[15px] font-medium leading-snug text-foreground group-hover:text-primary">
                        {rel.title}
                      </span>
                    </span>
                    <span className="mt-5 inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
                      <span className="sr-only sm:not-sr-only">{c.read}</span>
                      <ArrowRightIcon className="h-4 w-4 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5 motion-reduce:transition-none" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
      </article>
    </main>
  );
}
