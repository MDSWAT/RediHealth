"use client";

import { HEALTH_ARTICLE_SECTION_H2_CLASS } from "./HealthArticleShell";
import { InlineAudioNarratorButton } from "./InlineAudioNarratorButton";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import {
  HEALTH_DETAIL_SHARED_STRINGS,
  SPEECH_LANG_BY_LOCALE,
} from "@/lib/i18n/health-myths";

export interface InfographicPillar {
  title: string;
  description: string;
}

export interface WhyItMattersInfographicProps {
  topicTitle: string;
  keyFacts?: string[];
  pillars?: InfographicPillar[];
  className?: string;
  lang?: Lang;
}

function useSafeLanguageContext(): { lang: Lang } {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" };
  }
}

function pickLocale(
  entry: Record<"ro", string> & Partial<Record<Lang, string>>,
  lang: Lang,
): string {
  return entry[lang] ?? entry.ro;
}

function pickSpeechLang(lang: Lang): string {
  return (
    (SPEECH_LANG_BY_LOCALE as Partial<Record<Lang, string>>)[lang] ??
    (lang === "hr" ? "hr-HR" : "ro-RO")
  );
}

/** Three key facts as a single-column hairline list. */
export function WhyItMattersInfographic({
  topicTitle,
  keyFacts = [],
  pillars,
  className = "",
  lang,
}: WhyItMattersInfographicProps) {
  const { lang: ctxLang } = useSafeLanguageContext();
  const currentLang: Lang = lang ?? ctxLang ?? "ro";
  const s = HEALTH_DETAIL_SHARED_STRINGS.whyItMatters;
  const speechLang = pickSpeechLang(currentLang);

  const facts: string[] = pillars
    ? pillars.map((p) => `${p.title}: ${p.description}`)
    : keyFacts.length > 0
      ? keyFacts
      : [
          pickLocale(s.pillar1Desc, currentLang),
          pickLocale(s.pillar2Desc, currentLang),
          pickLocale(s.pillar3Desc, currentLang),
        ];

  return (
    <section aria-labelledby="why-it-matters-heading" className={className}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1">
          <h2
            id="why-it-matters-heading"
            className={HEALTH_ARTICLE_SECTION_H2_CLASS}
          >
            {pickLocale(s.heading, currentLang)}
          </h2>
          <p className="mt-1.5 text-body text-muted-foreground">
            {pickLocale(s.subtitleTemplate, currentLang).replace(
              "{topic}",
              topicTitle.toLowerCase(),
            )}
          </p>
        </div>

        <div className="shrink-0 self-start">
          <InlineAudioNarratorButton
            textToSpeak={`${pickLocale(s.heading, currentLang)}. ${facts.join(" ")}`}
            label={pickLocale(s.listenAllLabel, currentLang)}
            lang={speechLang}
          />
        </div>
      </div>

      <ul className="mt-5 divide-y divide-border rounded-xl border border-border bg-card px-6 py-2 sm:px-8">
        {facts.map((fact, idx) => (
          <li key={idx} className="break-inside-avoid py-4 sm:py-5">
            <p className="min-w-0 text-reading text-foreground">
              {fact}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
