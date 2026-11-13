"use client";

import { useState } from "react";
import type { HealthMyth } from "@/lib/i18n/health-myths";
import { cn } from "@/lib/cn";
import { MythDoctorHandoverButton } from "@/components/landing/MythDoctorHandoverButton";
import { HEALTH_ARTICLE_SECTION_H2_CLASS } from "./HealthArticleShell";
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

export function TopicMythCard({
  myth,
  className = "",
  lang,
}: TopicMythCardProps) {
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
        <h2 id="topic-myth-title" className={HEALTH_ARTICLE_SECTION_H2_CLASS}>
          {pickLocale(s.badge, currentLang)}
        </h2>

        <InlineAudioNarratorButton
          textToSpeak={pickLocale(s.audioPrompt, currentLang).replace(
            "{statement}",
            myth.statement,
          )}
          label={pickLocale(s.audioPrompt, currentLang).replace(
            "{statement}",
            myth.statement,
          )}
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

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {([true, false] as const).map((value) => {
          const chosen = selectedAnswer === value;
          const isRightOption = value === myth.isTrue;
          const label = value
            ? pickLocale(s.trueBtn, currentLang)
            : pickLocale(s.falseBtn, currentLang);

          return (
            <button
              key={String(value)}
              type="button"
              disabled={hasAnswered}
              aria-pressed={chosen}
              onClick={() => setSelectedAnswer(value)}
              className={cn(
                "inline-flex min-h-12 max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:text-[0.9375rem]",
                !hasAnswered &&
                  "border-border-control bg-card text-foreground press-row hover:border-sapphire/50 hover:bg-sapphire-soft/50",
                hasAnswered &&
                  chosen &&
                  isMatch &&
                  "border-sapphire bg-sapphire text-white",
                hasAnswered &&
                  chosen &&
                  !isMatch &&
                  "border-ink-950 bg-ink-950 text-paper dark:border-paper dark:bg-paper dark:text-ink-950",
                hasAnswered &&
                  !chosen &&
                  isRightOption &&
                  "border-sapphire/45 bg-sapphire-soft/75 text-sapphire dark:border-sapphire-border/45 dark:bg-white/10 dark:text-sapphire-border",
                hasAnswered &&
                  !chosen &&
                  !isRightOption &&
                  "border-border bg-card text-muted-foreground",
              )}
            >
              {value ? (
                <svg
                  className={cn(
                    "h-5 w-5 shrink-0",
                    !hasAnswered && "text-sapphire",
                    hasAnswered && chosen && isMatch && "text-white",
                    hasAnswered &&
                      chosen &&
                      !isMatch &&
                      "text-paper dark:text-ink-950",
                    hasAnswered &&
                      !chosen &&
                      isRightOption &&
                      "text-sapphire dark:text-sapphire-border",
                    hasAnswered &&
                      !chosen &&
                      !isRightOption &&
                      "text-muted-foreground",
                  )}
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
              ) : (
                <svg
                  className={cn(
                    "h-5 w-5 shrink-0",
                    !hasAnswered && "text-muted-foreground",
                    hasAnswered && chosen && isMatch && "text-white",
                    hasAnswered &&
                      chosen &&
                      !isMatch &&
                      "text-paper dark:text-ink-950",
                    hasAnswered &&
                      !chosen &&
                      isRightOption &&
                      "text-sapphire dark:text-sapphire-border",
                    hasAnswered &&
                      !chosen &&
                      !isRightOption &&
                      "text-muted-foreground",
                  )}
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
              )}
              <span className="min-w-0 truncate">{label}</span>
            </button>
          );
        })}
      </div>

      {hasAnswered && (
        <div
          className="mt-6 space-y-4 border-t border-border pt-5"
          aria-live="polite"
        >
          <p
            className={cn(
              "text-base font-semibold",
              isMatch
                ? "text-sapphire dark:text-sapphire-border"
                : "text-foreground dark:text-paper",
            )}
          >
            {isMatch ? pickLocale(s.correctBadge, currentLang) : myth.statusTag}
          </p>

          <p className="text-[1.0625rem] leading-[1.7] text-foreground sm:text-[1.125rem]">
            {myth.explanation}
          </p>

          {/* Source only: no reviewer name is shown until a real medical reviewer is confirmed. */}
          <p className="text-sm text-muted-foreground">
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
