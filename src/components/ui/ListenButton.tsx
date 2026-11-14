"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { VolumeIcon } from "@/components/ui/icons";
import { playEarcon } from "@/lib/audio/earcon";
import { formatSpeechText, speechEngine } from "@/lib/audio/speech-engine";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { cn } from "@/lib/cn";
import { SPEECH_LANG_BY_LOCALE } from "@/lib/i18n/health-myths";
import { useLanguage } from "@/lib/i18n/language-context";
import { LISTEN_COPY } from "@/lib/i18n/listen-copy";
import { DEFAULT_LANG } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

function useOptionalLanguage(): Lang | undefined {
  try {
    return useLanguage().lang;
  } catch {
    return undefined;
  }
}

function resolveSpeechLang(lang: Lang | string): string {
  const normalized = lang.toLowerCase().split(/[-_]/)[0] as Lang;
  return SPEECH_LANG_BY_LOCALE[normalized] ?? "ro-RO";
}

function normalizeUiLang(lang: string | undefined): Lang {
  if (!lang) return DEFAULT_LANG;
  const prefix = lang.toLowerCase().split(/[-_]/)[0];
  if (
    prefix === "ro" ||
    prefix === "en" ||
    prefix === "sq" ||
    prefix === "it" ||
    prefix === "hr" ||
    prefix === "rom" ||
    prefix === "ru"
  ) {
    return prefix;
  }
  return DEFAULT_LANG;
}

export interface ListenButtonProps {
  /** Text read aloud when pressed (used when `onToggle` is not supplied). */
  text?: string;
  /** Lazy getter for dynamic read-aloud text (used when `onToggle` is not supplied). */
  getText?: () => string;
  /** Controlled playing state (for `useReadAloud`, `useSpeech`, or external players). */
  isPlaying?: boolean;
  /** Controlled click handler (pairs with `isPlaying`). */
  onToggle?: () => void;
  /** Explicit UI locale when rendered outside `LanguageProvider`. */
  uiLang?: Lang;
  /** Content locale if different from UI locale (e.g. articles). */
  contentLang?: Lang | string;
  /** Optional label override; defaults to shared canonical `LISTEN_COPY[lang].listen`. */
  label?: string;
  /** Optional stop-label override; defaults to shared canonical `LISTEN_COPY[lang].stop`. */
  stopLabel?: string;
  /** Accessible context label when the visible text stays "Listen" / "Stop". */
  ariaLabel?: string;
  /** Optional tooltip text. */
  title?: string;
  disabled?: boolean;
  /** Play subtle start/stop earcon when using built-in `speechEngine` playback. */
  playStartEarcon?: boolean;
  /** Close any registered global audio bar when stopping playback. */
  closePlayerOnStop?: boolean;
  className?: string;
}

/**
 * Unified Read Aloud trigger across RediHealth (`variant="outline"`, `size="md"`).
 * Renders speaker + "Listen", swapping to stop mark + "Stop" while active, never filled.
 */
export function ListenButton({
  text,
  getText,
  isPlaying: isPlayingProp,
  onToggle,
  uiLang,
  contentLang,
  label,
  stopLabel,
  ariaLabel,
  title,
  disabled,
  playStartEarcon = false,
  closePlayerOnStop = false,
  className,
}: ListenButtonProps) {
  const contextLang = useOptionalLanguage();
  const lang = normalizeUiLang(uiLang ?? contextLang);
  const effectiveContentLang = contentLang ?? lang;
  const voiceAvailable = isVoiceEnabled(lang) && isVoiceEnabled(effectiveContentLang);

  const [isPlayingLocal, setIsPlayingLocal] = useState(false);
  const playingLocalRef = useRef(false);

  const controlled = isPlayingProp !== undefined;
  const playing = controlled ? isPlayingProp : isPlayingLocal;

  useEffect(() => {
    if (voiceAvailable) {
      void speechEngine.probeNeuralServer();
    }
  }, [voiceAvailable]);

  useEffect(() => {
    return () => {
      if (playingLocalRef.current) {
        speechEngine.stop();
        playingLocalRef.current = false;
      }
    };
  }, []);

  if (!voiceAvailable) return null;

  const copy = LISTEN_COPY[lang] ?? LISTEN_COPY[DEFAULT_LANG];
  const resolvedListen = label ?? copy.listen;
  const resolvedStop = stopLabel ?? copy.stop;

  const handleClick = () => {
    if (onToggle) {
      if (playStartEarcon) {
        playEarcon(playing ? "stop" : "start");
      }
      if (playing && closePlayerOnStop) {
        speechEngine.stop();
        speechEngine.requestClose();
      }
      onToggle();
      return;
    }

    if (playing) {
      if (playStartEarcon) playEarcon("stop");
      speechEngine.stop();
      if (closePlayerOnStop) speechEngine.requestClose();
      playingLocalRef.current = false;
      setIsPlayingLocal(false);
      return;
    }

    const rawText = (getText ? getText() : text) ?? "";
    if (!rawText.trim()) return;

    if (playStartEarcon) playEarcon("start");
    const speechLang = resolveSpeechLang(effectiveContentLang);
    playingLocalRef.current = true;
    setIsPlayingLocal(true);
    speechEngine.speak(formatSpeechText(rawText, speechLang), {
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
    <Button
      type="button"
      variant="outline"
      size="md"
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={playing}
      aria-label={ariaLabel}
      title={title}
      className={cn(
        "print:hidden aria-[pressed=true]:border-sapphire aria-[pressed=true]:bg-sapphire-soft aria-[pressed=true]:text-sapphire aria-[pressed=true]:hover:border-sapphire aria-[pressed=true]:hover:bg-sapphire-soft dark:aria-[pressed=true]:border-sapphire-border dark:aria-[pressed=true]:bg-sapphire/20 dark:aria-[pressed=true]:text-sapphire-border dark:aria-[pressed=true]:hover:border-sapphire-border dark:aria-[pressed=true]:hover:bg-sapphire/25",
        className,
      )}
    >
      {playing ? (
        <span
          aria-hidden="true"
          className="inline-block h-3 w-3 shrink-0 rounded-xs bg-current"
        />
      ) : (
        <VolumeIcon
          className="h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border"
          aria-hidden="true"
        />
      )}
      <span className="whitespace-nowrap">{playing ? resolvedStop : resolvedListen}</span>
    </Button>
  );
}
