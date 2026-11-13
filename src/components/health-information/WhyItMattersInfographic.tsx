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
  number: "01" | "02" | "03";
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

/** Three key facts as a quiet, single-column numbered hairline list. */
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
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2
            id="why-it-matters-heading"
            className={HEALTH_ARTICLE_SECTION_H2_CLASS}
          >
            {pickLocale(s.heading, currentLang)}
          </h2>
          <p className="mt-1.5 text-base text-muted-foreground">
            {pickLocale(s.subtitleTemplate, currentLang).replace(
              "{topic}",
              topicTitle.toLowerCase(),
            )}
          </p>
        </div>

        <InlineAudioNarratorButton
          textToSpeak={`${pickLocale(s.heading, currentLang)}. ${facts.join(" ")}`}
          label={pickLocale(s.listenAllLabel, currentLang)}
          lang={speechLang}
        />
      </div>

      <ul className="mt-5 divide-y divide-border rounded-xl border border-border bg-card px-6 py-2 sm:px-8">
        {facts.map((fact, idx) => (
          <li key={idx} className="flex items-start gap-4 py-4 sm:py-5">
            <span className="mt-0.5 shrink-0 text-lg font-semibold tabular-nums text-sapphire">
              {idx + 1}.
            </span>
            <p className="text-[1.0625rem] leading-[1.7] text-foreground sm:text-[1.125rem]">
              {fact}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
