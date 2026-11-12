"use client";

import { useState } from "react";
import type { HealthMyth } from "@/lib/i18n/health-myths";
import { MythDoctorHandoverButton } from "@/components/landing/MythDoctorHandoverButton";
import { InlineAudioNarratorButton } from "./InlineAudioNarratorButton";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import {
  HEALTH_DETAIL_SHARED_STRINGS,
  SPEECH_LANG_BY_LOCALE,
} from "@/lib/i18n/health-myths";

export interface TopicMythCardProps {
  myth: HealthMyth;
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

const QUOTES: Record<Lang, [string, string]> = {
  ru: ["“", "”"],

  ro: ["„", "”"],
  en: ["“", "”"],
  sq: ["«", "»"],
  it: ["«", "»"],
  hr: ["„", "”"],
  rom: ["„", "”"],
};

function pickLocale(entry: Record<"ro", string> & Partial<Record<Lang, string>>, lang: Lang): string {
  return entry[lang] ?? entry.ro;
}

function pickSpeechLang(lang: Lang): string {
  return (SPEECH_LANG_BY_LOCALE as Partial<Record<Lang, string>>)[lang] ?? (lang === "hr" ? "hr-HR" : "ro-RO");
}

export function TopicMythCard({ myth, className = "", lang }: TopicMythCardProps) {
  const { lang: ctxLang } = useSafeLanguageContext();
  const currentLang: Lang = lang ?? ctxLang ?? "ro";
  const s = HEALTH_DETAIL_SHARED_STRINGS.topicMyth;
  const speechLang = pickSpeechLang(currentLang);
  const quotes = QUOTES[currentLang] ?? QUOTES.ro;

  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);

  const hasAnswered = selectedAnswer !== null;
  const isMatch = selectedAnswer === myth.isTrue;

  return (
    <section
      aria-labelledby="topic-myth-title"
      className={`rounded-xl border border-border bg-card p-6 sm:p-8 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id="topic-myth-title" className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {pickLocale(s.badge, currentLang)}
        </h2>

        <InlineAudioNarratorButton
          textToSpeak={pickLocale(s.audioPrompt, currentLang).replace("{statement}", myth.statement)}
          label={pickLocale(s.audioPrompt, currentLang).replace("{statement}", myth.statement)}
          lang={speechLang}
          variant="ghost"
          className="-mr-2 -mt-1"
        />
      </div>

      <p className="mt-3 max-w-prose text-lg font-medium leading-snug text-foreground text-balance sm:text-xl">
        {quotes[0]}
        {myth.statement}
        {quotes[1]}
      </p>

      {!hasAnswered ? (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setSelectedAnswer(true)}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-live-sage/35 bg-live-sage-soft/30 px-5 py-2.5 text-base font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-live-sage hover:bg-live-sage-soft/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-live-sage"
          >
            <svg
              className="h-5 w-5 text-live-sage"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12.5 9.5 17 19 7" />
            </svg>
            <span>{pickLocale(s.trueBtn, currentLang)}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedAnswer(false)}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary-soft/30 px-5 py-2.5 text-base font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-primary hover:bg-primary-soft/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <svg
              className="h-5 w-5 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 7l10 10M17 7 7 17" />
            </svg>
            <span>{pickLocale(s.falseBtn, currentLang)}</span>
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-4 border-t border-border pt-5" aria-live="polite">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-md px-3 py-1 text-xs font-semibold ${
                isMatch
                  ? "border border-live-sage-border bg-live-sage-soft text-foreground"
                  : "border border-primary-border bg-primary-soft text-primary-hover"
              }`}
            >
              {isMatch ? pickLocale(s.correctBadge, currentLang) : myth.statusTag}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-foreground">
            {myth.explanation}
          </p>

          {/* Source only: no reviewer name is shown until a real medical reviewer is confirmed. */}
          <p className="text-xs text-muted-foreground">
            {pickLocale(s.sourcePrefix, currentLang)} {myth.source}
          </p>

          <div>
            <MythDoctorHandoverButton
              mythId={myth.id}
              mythStatement={myth.statement}
            />
          </div>
        </div>
      )}
    </section>
  );
}
