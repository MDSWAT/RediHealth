"use client";

import { useEffect, useRef, useState } from "react";
import { VolumeIcon } from "@/components/ui/icons";
import { playEarcon } from "@/lib/audio/earcon";
import { formatSpeechText, speechEngine } from "@/lib/audio/speech-engine";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { cn } from "@/lib/cn";
import {
  HEALTH_DETAIL_SHARED_STRINGS,
  SPEECH_LANG_BY_LOCALE,
} from "@/lib/i18n/health-myths";
import type { Lang } from "@/lib/i18n/translations";

export interface ArticleListenButtonProps {
  textToSpeak: string;
  uiLang: Lang;
  contentLang?: Lang | string;
  listenLabel?: string;
  stopLabel?: string;
  onStartOverride?: () => void;
  onStopOverride?: () => void;
  isPlayingExternal?: boolean;
  className?: string;
}

function pickSpeechLang(lang: Lang | string): string {
  const normalized = lang.toLowerCase().split(/[-_]/)[0] as Lang;
  return SPEECH_LANG_BY_LOCALE[normalized] ?? "ro-RO";
}

function pickHeroLabel(
  entry: Record<"ro", string> & Partial<Record<Lang, string>>,
  lang: Lang,
): string {
  return entry[lang] ?? entry.ro;
}

/**
 * Unified 1-tap Read Aloud control for all health reading pages.
 * Safe outside LanguageContext.Provider and omits itself when browser speech is disabled for the locale.
 */
export function ArticleListenButton({
  textToSpeak,
  uiLang,
  contentLang,
  listenLabel,
  stopLabel,
  onStartOverride,
  onStopOverride,
  isPlayingExternal,
  className,
}: ArticleListenButtonProps) {
  const effectiveContentLang = contentLang ?? uiLang;
  const voiceAvailable =
    isVoiceEnabled(uiLang) && isVoiceEnabled(effectiveContentLang);

  const [isPlayingLocal, setIsPlayingLocal] = useState(false);
  const playingLocalRef = useRef(false);

  const usesExternal = isPlayingExternal !== undefined;
  const isPlaying = usesExternal ? isPlayingExternal : isPlayingLocal;

  useEffect(() => {
    return () => {
      if (playingLocalRef.current) {
        speechEngine.stop();
        playingLocalRef.current = false;
      }
    };
  }, []);

  if (!voiceAvailable) return null;

  const heroCopy = HEALTH_DETAIL_SHARED_STRINGS.topicHero;
  const resolvedListenLabel =
    listenLabel ?? pickHeroLabel(heroCopy.listenGuide, uiLang);
  const resolvedStopLabel =
    stopLabel ?? pickHeroLabel(heroCopy.stopAudio, uiLang);

  const handleToggle = () => {
    if (isPlaying) {
      playEarcon("stop");
      speechEngine.stop();
      speechEngine.requestClose();
      if (usesExternal) {
        onStopOverride?.();
      } else {
        playingLocalRef.current = false;
        setIsPlayingLocal(false);
      }
      return;
    }

    playEarcon("start");

    if (onStartOverride) {
      onStartOverride();
      return;
    }

    const speechLang = pickSpeechLang(effectiveContentLang);
    playingLocalRef.current = true;
    setIsPlayingLocal(true);
    speechEngine.speak(formatSpeechText(textToSpeak, speechLang), {
      lang: speechLang,
      rate: 0.95,
      onEnd: () => {
        playingLocalRef.current = false;
        setIsPlayingLocal(false);
      },
      onError: () => {
        playingLocalRef.current = false;
        setIsPlayingLocal(false);
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={isPlaying}
      className={cn(
        "press-solid inline-flex min-h-12 items-center justify-center gap-2.5 whitespace-nowrap rounded-lg px-5 py-2.5 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 print:hidden",
        isPlaying
          ? "bg-ink-900 hover:bg-ink-950 dark:bg-sapphire-light dark:hover:bg-sapphire"
          : "bg-sapphire hover:bg-sapphire-light",
        className,
      )}
    >
      {isPlaying ? (
        <svg
          className="h-4 w-4 shrink-0 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <VolumeIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <span>{isPlaying ? resolvedStopLabel : resolvedListenLabel}</span>
    </button>
  );
}
