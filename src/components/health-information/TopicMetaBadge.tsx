"use client";

import { useVoicePresence } from "@/lib/audio/voice-presence";
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
  // The listening time is shown unless it is certain that no voice exists for this language.
  const voiceEnabled = useVoicePresence(currentLang) !== "none";

  if (compact) {
    // Cards: one quiet line of text, no icons, middle dots, or colour.
    return (
      <p className={`text-body text-muted-foreground tabular-nums ${className}`}>
        {pickLocale(s.readMinutesShort, currentLang).replace("{minutes}", String(readMinutes))}
        {voiceEnabled && (
          <>
            <span>, </span>
            {pickLocale(s.audioMinutes, currentLang).replace("{minutes}", String(audioMinutes))}
          </>
        )}
      </p>
    );
  }

  return (
    <p
      className={`text-meta text-muted-foreground tabular-nums ${
        bordered ? "border-b border-border/40 pb-2.5" : ""
      } ${className}`}
    >
      {pickLocale(s.readMinutesLong, currentLang).replace("{minutes}", String(readMinutes))}
      {voiceEnabled && (
        <>
          <span>, </span>
          {pickLocale(s.audioMinutesLong, currentLang).replace("{minutes}", String(audioMinutes))}
        </>
      )}
    </p>
  );
}
