"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { speechEngine, formatSpeechText } from "@/lib/audio/speech-engine";
import { playEarcon } from "@/lib/audio/earcon";
import { useVoiceEnabled } from "@/lib/audio/voice-availability";
import { useLanguage } from "@/lib/i18n/language-context";
import { CloseIcon } from "@/components/ui/icons";
import type { Lang } from "@/lib/i18n/translations";
import {
  HEALTH_DETAIL_SHARED_STRINGS,
  SPEECH_LANG_BY_LOCALE,
} from "@/lib/i18n/health-myths";

export interface GlobalHealthAudioPlayerProps {
  title: string;
  textToNarrate: string;
  durationMinutes?: number;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  onActiveSentenceIndexChange?: (index: number) => void;
  lang?: Lang;
}

function useSafeLanguageContext(): { lang: Lang } {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" };
  }
}

export function GlobalHealthAudioPlayer({
  title,
  textToNarrate,
  durationMinutes = 3,
  isOpen,
  onClose,
  className = "",
  onActiveSentenceIndexChange,
  lang,
}: GlobalHealthAudioPlayerProps) {
  const { lang: ctxLang } = useSafeLanguageContext();
  const currentLang: Lang = lang ?? ctxLang ?? "ro";
  const s = HEALTH_DETAIL_SHARED_STRINGS.globalAudioPlayer;
  const speechLang = SPEECH_LANG_BY_LOCALE[currentLang] ?? "ro-RO";

  const voiceEnabled = useVoiceEnabled();
  // No voice in this language: the player never opens, so no speech can start.
  const isActive = isOpen && voiceEnabled;
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  // Keep latest callbacks and speed in refs so boundary updates or speed adjustments
  // never re-trigger the lifecycle effect and restart narration from word 1.
  const onCloseRef = useRef(onClose);
  const onSentenceChangeRef = useRef(onActiveSentenceIndexChange);
  const speedRef = useRef(speed);
  const lastSentenceRef = useRef<number>(-1);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onSentenceChangeRef.current = onActiveSentenceIndexChange;
  }, [onActiveSentenceIndexChange]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const formattedNarration = formatSpeechText(textToNarrate, speechLang);

  const startSpeechFromOffset = useCallback(
    (offsetChar: number, targetRate: number) => {
      const totalChars = Math.max(formattedNarration.length, 1);
      const remainingText = formattedNarration.slice(offsetChar);

      setIsPlaying(true);
      speechEngine.speak(remainingText, {
        lang: speechLang,
        rate: targetRate,
        onBoundary: (relativeCharIndex) => {
          const absoluteIndex = offsetChar + relativeCharIndex;
          const pct = Math.min(100, Math.round((absoluteIndex / totalChars) * 100));
          setProgressPercent(pct);

          if (onSentenceChangeRef.current) {
            const textBefore = formattedNarration.slice(0, absoluteIndex);
            const sentenceCount = (textBefore.match(/[.!?]+/g) || []).length;
            if (sentenceCount !== lastSentenceRef.current) {
              lastSentenceRef.current = sentenceCount;
              onSentenceChangeRef.current(sentenceCount);
            }
          }
        },
        onEnd: () => {
          setIsPlaying(false);
          setProgressPercent(100);
        },
        onError: () => {
          setIsPlaying(false);
        },
      });
    },
    [formattedNarration, speechLang]
  );

  useEffect(() => {
    if (isActive) {
      lastSentenceRef.current = -1;
      const unregister = speechEngine.registerActivePlayer(() => onCloseRef.current());
      const playTimer = setTimeout(() => startSpeechFromOffset(0, speedRef.current), 0);
      return () => {
        unregister();
        clearTimeout(playTimer);
        speechEngine.stop();
      };
    } else {
      speechEngine.stop();
      lastSentenceRef.current = -1;
      const stopTimer = setTimeout(() => {
        setIsPlaying(false);
        setProgressPercent(0);
      }, 0);
      return () => clearTimeout(stopTimer);
    }
  }, [isActive, startSpeechFromOffset]);

  const handleClose = () => {
    playEarcon("stop");
    speechEngine.stop();
    onCloseRef.current();
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      playEarcon("stop");
      speechEngine.pause();
      setIsPlaying(false);
    } else {
      playEarcon("start");
      if (speechEngine.isPaused()) {
        speechEngine.resume();
        setIsPlaying(true);
      } else {
        const charOffset = Math.floor((progressPercent / 100) * formattedNarration.length);
        startSpeechFromOffset(charOffset, speed);
      }
    }
  };

  const handleSetSpeed = (newSpeed: number) => {
    playEarcon("click");
    setSpeed(newSpeed);
    speedRef.current = newSpeed;
    speechEngine.setRate(newSpeed);
    if (isPlaying) {
      const charOffset = Math.floor((progressPercent / 100) * formattedNarration.length);
      speechEngine.stop();
      startSpeechFromOffset(charOffset, newSpeed);
    }
  };

  const seekTo = (pct: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(pct)));
    setProgressPercent(clamped);
    const charOffset = Math.floor((clamped / 100) * formattedNarration.length);
    speechEngine.stop();
    if (isPlaying) {
      startSpeechFromOffset(charOffset, speed);
    }
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seekTo(((e.clientX - rect.left) / rect.width) * 100);
  };

  const handleRewind15 = () => {
    playEarcon("click");
    speechEngine.stop();
    setProgressPercent(0);
    startSpeechFromOffset(0, speed);
  };

  if (!isActive) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-lg border border-sapphire-border bg-card px-4 py-2 text-xs font-semibold text-sapphire shadow-lg transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
        >
          <span className="flex h-2 w-2 rounded-full bg-sapphire" aria-hidden="true" />
          <span>{s.minimizedText[currentLang].replace("{progressPercent}", String(progressPercent))}</span>
        </button>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label={s.playerAria[currentLang]}
      className={`hh-dialog fixed bottom-4 inset-x-4 z-40 mx-auto max-w-xl rounded-lg border border-border bg-card p-3.5 shadow-xl sm:p-4 ${className}`}
    >
      {/* Top row: Title, progress indicator, and minimize/close */}
      <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground leading-snug break-words">
            {title}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-muted-foreground">
              {s.durationSubtitle[currentLang].replace("{durationMinutes}", String(durationMinutes))}
            </p>
            {speechEngine.isFallbackVoice() && (
              <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                {s.fallbackVoice[currentLang]}
              </span>
            )}
            {speechEngine.getTier() === "transcript" && (
              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                {s.transcriptMode[currentLang]}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
            aria-label={s.minimizeAria[currentLang]}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 12h12" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
            aria-label={s.closeAria[currentLang]}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Progress: a plain track; tap or use the arrow keys to move through the guide. */}
      <div className="my-3">
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground tabular-nums">
          <span>{isPlaying ? s.statusPlaying[currentLang] : s.statusPaused[currentLang]}</span>
          <span>{s.progressSummary[currentLang].replace("{progressPercent}", String(progressPercent))}</span>
        </div>

        <div
          role="slider"
          aria-label={s.scrubberAria[currentLang]}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
          aria-valuetext={s.progressSummary[currentLang].replace("{progressPercent}", String(progressPercent))}
          tabIndex={0}
          onClick={handleScrub}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              seekTo(progressPercent + 5);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              seekTo(progressPercent - 5);
            } else if (e.key === "Home") {
              e.preventDefault();
              seekTo(0);
            }
          }}
          className="flex h-11 w-full cursor-pointer items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          title={s.scrubberTitle[currentLang]}
        >
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="absolute inset-0 origin-left rounded-full bg-sapphire transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none"
              style={{ transform: `scaleX(${progressPercent / 100})` }}
            />
          </div>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {/* Rewind */}
        <button
          type="button"
          onClick={handleRewind15}
          className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          aria-label={s.rewindAria[currentLang]}
        >
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
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span>{s.rewindButton[currentLang]}</span>
        </button>

        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg bg-sapphire px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          aria-label={isPlaying ? s.pauseAria[currentLang] : s.playAria[currentLang]}
        >
          {isPlaying ? (
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              <span>{s.pauseButton[currentLang]}</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>{s.playButton[currentLang]}</span>
            </span>
          )}
        </button>

        {/* Voice speed */}
        <div
          role="group"
          aria-label={s.speedGroupAria[currentLang]}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1"
        >
          <button
            type="button"
            onClick={() => handleSetSpeed(0.85)}
            aria-pressed={speed === 0.85}
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
              speed === 0.85
                ? "bg-card text-sapphire shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={s.calmSpeedTitle[currentLang]}
          >
            <span className="tabular-nums">0.85x</span>
            <span className="text-xs font-normal text-muted-foreground hidden sm:inline">{s.calmSpeed[currentLang]}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetSpeed(1.0)}
            aria-pressed={speed === 1.0}
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
              speed === 1.0
                ? "bg-card text-sapphire shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={s.normalSpeedTitle[currentLang]}
          >
            <span className="tabular-nums">1.0x</span>
            <span className="text-xs font-normal text-muted-foreground hidden sm:inline">{s.normalSpeed[currentLang]}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
