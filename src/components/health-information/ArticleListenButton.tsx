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

const LISTEN_SWAP_CLASS =
  "transition-[opacity,translate] duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none";
const LISTEN_SWAP_IN = "opacity-100 translate-y-0";
const LISTEN_SWAP_OUT = "pointer-events-none opacity-0 translate-y-1";

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
      rate: 1.0,
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
      {/*
        Both states are stacked in one cell: the button keeps the width of the longer label, so
        toggling never shifts the row, and the icon and label cross-fade instead of snapping.
      */}
      <span className="grid shrink-0 [&>*]:col-start-1 [&>*]:row-start-1" aria-hidden="true">
        <VolumeIcon
          className={cn(LISTEN_SWAP_CLASS, "h-4 w-4", isPlaying ? LISTEN_SWAP_OUT : LISTEN_SWAP_IN)}
        />
        <svg
          className={cn(LISTEN_SWAP_CLASS, "h-4 w-4 text-white", isPlaying ? LISTEN_SWAP_IN : LISTEN_SWAP_OUT)}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      </span>
      <span className="grid [&>*]:col-start-1 [&>*]:row-start-1">
        <span
          aria-hidden={isPlaying}
          className={cn(LISTEN_SWAP_CLASS, isPlaying ? LISTEN_SWAP_OUT : LISTEN_SWAP_IN)}
        >
          {resolvedListenLabel}
        </span>
        <span
          aria-hidden={!isPlaying}
          className={cn(LISTEN_SWAP_CLASS, isPlaying ? LISTEN_SWAP_IN : LISTEN_SWAP_OUT)}
        >
          {resolvedStopLabel}
        </span>
      </span>
    </button>
  );
}
