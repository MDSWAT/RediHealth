"use client";

import { VolumeIcon } from "@/components/ui/icons";
import { useVoiceEnabled } from "@/lib/audio/voice-availability";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import { HEALTH_DETAIL_SHARED_STRINGS } from "@/lib/i18n/health-myths";

export interface TopicMetaBadgeProps {
  readMinutes?: number;
  audioMinutes?: number;
  className?: string;
  bordered?: boolean;
  compact?: boolean;
  lang?: Lang;
}

function useSafeLanguageContext(): { lang: Lang } {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" };
  }
}

function pickLocale(entry: Record<"ro", string> & Partial<Record<Lang, string>>, lang: Lang): string {
  return entry[lang] ?? entry.ro;
}

export function TopicMetaBadge({
  readMinutes = 3,
  audioMinutes = 2,
  className = "",
  bordered = true,
  compact = false,
  lang,
}: TopicMetaBadgeProps) {
  const { lang: ctxLang } = useSafeLanguageContext();
  const currentLang: Lang = lang ?? ctxLang ?? "ro";
  const s = HEALTH_DETAIL_SHARED_STRINGS.topicMetaBadge;
  const voiceEnabled = useVoiceEnabled();

  if (compact) {
    // Cards: one quiet line of text, no icons or colour.
    return (
      <p className={`text-sm text-muted-foreground tabular-nums ${className}`}>
        {pickLocale(s.readMinutesShort, currentLang).replace("{minutes}", String(readMinutes))}
        {voiceEnabled && (
          <>
            <span aria-hidden="true"> · </span>
            {pickLocale(s.audioMinutes, currentLang).replace("{minutes}", String(audioMinutes))}
          </>
        )}
      </p>
    );
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground ${
        bordered ? "border-b border-border/40 pb-2.5" : ""
      } ${className}`}
    >
      <span className="inline-flex items-center gap-1.5 tabular-nums">
        <svg
          className="h-3.5 w-3.5 text-sapphire shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>{pickLocale(s.readMinutesLong, currentLang).replace("{minutes}", String(readMinutes))}</span>
      </span>

      {voiceEnabled && (
        <>
          <span className="text-border" aria-hidden="true">
            ·
          </span>

          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <VolumeIcon className="h-3.5 w-3.5 shrink-0 text-sapphire" aria-hidden="true" />
            <span>{pickLocale(s.audioMinutesLong, currentLang).replace("{minutes}", String(audioMinutes))}</span>
          </span>
        </>
      )}
    </div>
  );
}
