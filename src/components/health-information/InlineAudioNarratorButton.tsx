"use client";

import { useState, useEffect, useRef } from "react";
import { speechEngine, formatSpeechText } from "@/lib/audio/speech-engine";
import { isVoiceEnabled, useVoiceEnabled } from "@/lib/audio/voice-availability";

export interface InlineAudioNarratorButtonProps {
  textToSpeak: string;
  label?: string;
  className?: string;
  /** BCP-47 speech language, e.g. "ro-RO". Also picks the default label language. */
  lang?: string;
  /** "ghost" drops the border and fill, for buttons that sit inside running text. */
  variant?: "outline" | "ghost";
}

const DEFAULT_LABEL: Record<string, string> = {
  ru: "Слушайте этот раздел",

  ro: "Ascultă această secțiune",
  en: "Listen to this section",
  sq: "Dëgjo këtë pjesë",
  it: "Ascolta questa sezione",
  hr: "Poslušaj ovaj dio",
  rom: "Ashun kadava kotor",
};

export function InlineAudioNarratorButton({
  textToSpeak,
  label,
  className = "",
  lang = "ro-RO",
  variant = "outline",
}: InlineAudioNarratorButtonProps) {
  const voiceEnabled = useVoiceEnabled() && isVoiceEnabled(lang);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const langPrefix = lang.split("-")[0].toLowerCase();
  const resolvedLabel =
    label ?? DEFAULT_LABEL[langPrefix] ?? DEFAULT_LABEL[lang.slice(0, 2)] ?? DEFAULT_LABEL.ro;

  useEffect(() => {
    return () => {
      if (isPlayingRef.current) {
        speechEngine.stop();
        isPlayingRef.current = false;
      }
    };
  }, []);

  const handleToggle = () => {
    if (isPlaying) {
      isPlayingRef.current = false;
      speechEngine.stop();
      setIsPlaying(false);
      return;
    }
    isPlayingRef.current = true;
    setIsPlaying(true);
    speechEngine.speak(formatSpeechText(textToSpeak, lang), {
      lang,
      onEnd: () => {
        isPlayingRef.current = false;
        setIsPlaying(false);
      },
      onError: () => {
        isPlayingRef.current = false;
        setIsPlaying(false);
      },
    });
  };

  if (!voiceEnabled) return null;

  const base =
    "inline-flex min-h-[44px] min-w-[44px] items-center justify-center whitespace-nowrap rounded-md transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring print:hidden";
  const look =
    variant === "ghost"
      ? isPlaying
        ? "text-sapphire"
        : "text-muted-foreground hover:bg-muted hover:text-sapphire"
      : isPlaying
        ? "border border-sapphire bg-sapphire-soft text-sapphire"
        : "border border-border bg-card text-muted-foreground hover:border-sapphire/40 hover:bg-sapphire-soft hover:text-sapphire";

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={resolvedLabel}
      aria-pressed={isPlaying}
      title={resolvedLabel}
      className={`${base} ${look} ${className}`}
    >
      {isPlaying ? (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  );
}
