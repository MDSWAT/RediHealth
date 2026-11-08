"use client";

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

/** Three key facts as a quiet, typographic row: a rule, a short heading, one sentence. */
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
  const speechLang = SPEECH_LANG_BY_LOCALE[currentLang] ?? "ro-RO";

  const resolvedPillars: InfographicPillar[] = pillars || [
    { number: "01", title: s.pillar1Title[currentLang], description: keyFacts[0] || s.pillar1Desc[currentLang] },
    { number: "02", title: s.pillar2Title[currentLang], description: keyFacts[1] || s.pillar2Desc[currentLang] },
    { number: "03", title: s.pillar3Title[currentLang], description: keyFacts[2] || s.pillar3Desc[currentLang] },
  ];

  return (
    <section aria-labelledby="why-it-matters-heading" className={className}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            id="why-it-matters-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {s.heading[currentLang]}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {s.subtitleTemplate[currentLang].replace("{topic}", topicTitle.toLowerCase())}
          </p>
        </div>

        <InlineAudioNarratorButton
          textToSpeak={`${s.heading[currentLang]}. ${resolvedPillars
            .map((p) => `${p.title}. ${p.description}`)
            .join(" ")}`}
          label={s.listenAllLabel[currentLang]}
          lang={speechLang}
        />
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3">
        {resolvedPillars.map((pillar) => (
          <li
            key={pillar.number}
            className="border-t border-border pt-4 md:row-span-2 md:grid md:grid-rows-subgrid md:gap-y-2"
          >
            <h3 className="text-base font-semibold leading-snug text-foreground">
              {pillar.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground md:mt-0">
              {pillar.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
