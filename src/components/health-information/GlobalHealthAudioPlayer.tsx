"use client";

import { useState, useEffect, useCallback, useRef, useMemo, useSyncExternalStore } from "react";
import { speechEngine, formatSpeechText, splitSpeechSentences } from "@/lib/audio/speech-engine";
import { playEarcon } from "@/lib/audio/earcon";
import { isVoiceEnabled, useVoiceEnabled } from "@/lib/audio/voice-availability";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/icons";
import type { Lang } from "@/lib/i18n/translations";
import {
  HEALTH_DETAIL_SHARED_STRINGS,
  SPEECH_LANG_BY_LOCALE,
} from "@/lib/i18n/health-myths";

export interface AudioChapterMarker {
  label: string;
  prefix: string;
}

export interface GlobalHealthAudioPlayerProps {
  title: string;
  textToNarrate: string;
  durationMinutes?: number;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  onActiveSentenceIndexChange?: (index: number) => void;
  lang?: Lang;
  chapterMarkers?: AudioChapterMarker[];
  onUserPlayOrSeek?: () => void;
}

const STEP_COPY: Record<
  Lang,
  {
    prevSentenceAria: string;
    nextSentenceAria: string;
    expandAria: string;
  }
> = {
  ru: {
    prevSentenceAria: "Предыдущее предложение",
    nextSentenceAria: "Следующее предложение",
    expandAria: "Развернуть аудиоплеер",
  },
  ro: {
    prevSentenceAria: "Propoziția anterioară",
    nextSentenceAria: "Propoziția următoare",
    expandAria: "Extinde cititorul audio",
  },
  en: {
    prevSentenceAria: "Previous sentence",
    nextSentenceAria: "Next sentence",
    expandAria: "Expand audio player",
  },
  sq: {
    prevSentenceAria: "Fjalia e mëparshme",
    nextSentenceAria: "Fjalia tjetër",
    expandAria: "Zgjero lexuesin audio",
  },
  it: {
    prevSentenceAria: "Frase precedente",
    nextSentenceAria: "Frase successiva",
    expandAria: "Espandi lettore audio",
  },
  hr: {
    prevSentenceAria: "Prethodna rečenica",
    nextSentenceAria: "Sljedeća rečenica",
    expandAria: "Proširi audio reproduktor",
  },
  rom: {
    prevSentenceAria: "Angluni vorba",
    nextSentenceAria: "Avutni vorba",
    expandAria: "Putar o audio",
  },
};

const COMPACT_MEDIA_QUERY = "(max-width: 639.98px)";

function subscribeCompactViewport(onStoreChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mql = window.matchMedia(COMPACT_MEDIA_QUERY);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

function getCompactViewportSnapshot(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(COMPACT_MEDIA_QUERY).matches;
}

function useSafeLanguageContext(): { lang: Lang } {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" };
  }
}

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

const PLAY_SWAP_CLASS =
  "flex items-center justify-center gap-2 transition-[opacity,translate] duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none";
const PLAY_SWAP_IN = "opacity-100 translate-y-0";
const PLAY_SWAP_OUT = "pointer-events-none opacity-0 translate-y-1";

export function GlobalHealthAudioPlayer({
  title,
  textToNarrate,
  durationMinutes = 3,
  isOpen,
  onClose,
  className = "",
  onActiveSentenceIndexChange,
  lang,
  chapterMarkers,
  onUserPlayOrSeek,
}: GlobalHealthAudioPlayerProps) {
  const { lang: ctxLang } = useSafeLanguageContext();
  const currentLang: Lang = lang ?? ctxLang ?? "ro";
  const s = HEALTH_DETAIL_SHARED_STRINGS.globalAudioPlayer;
  const stepUi = STEP_COPY[currentLang] ?? STEP_COPY.ro;
  const speechLang = pickSpeechLang(currentLang);

  const ctxVoice = useVoiceEnabled();
  const voiceEnabled =
    lang !== undefined ? isVoiceEnabled(lang) : ctxVoice && isVoiceEnabled(currentLang);
  // No voice in this language (e.g. sq): the player never opens, so no speech can start.
  const isActive = isOpen && voiceEnabled;
  const isPhoneViewport = useSyncExternalStore(
    subscribeCompactViewport,
    getCompactViewportSnapshot,
    () => false,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [viewOverride, setViewOverride] = useState<"compact" | "expanded" | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const isCompact = viewOverride !== null ? viewOverride === "compact" : isPhoneViewport;

  const onCloseRef = useRef(onClose);
  const onSentenceChangeRef = useRef(onActiveSentenceIndexChange);
  const onUserPlayOrSeekRef = useRef(onUserPlayOrSeek);
  const speedRef = useRef(speed);
  const lastSentenceRef = useRef<number>(0);
  const currentOffsetRef = useRef<number>(0);
  const playbackGenRef = useRef(0);
  const scrubberRef = useRef<HTMLDivElement | null>(null);
  const playerRootRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const scrubRafRef = useRef<number | null>(null);
  const wasActiveRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onSentenceChangeRef.current = onActiveSentenceIndexChange;
  }, [onActiveSentenceIndexChange]);

  useEffect(() => {
    onUserPlayOrSeekRef.current = onUserPlayOrSeek;
  }, [onUserPlayOrSeek]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    return () => {
      if (scrubRafRef.current !== null) {
        cancelAnimationFrame(scrubRafRef.current);
      }
    };
  }, []);

  const formattedNarration = useMemo(
    () => formatSpeechText(textToNarrate, speechLang),
    [textToNarrate, speechLang],
  );

  const sentences = useMemo(
    () => splitSpeechSentences(formattedNarration),
    [formattedNarration],
  );

  const sectionTicks = useMemo(() => {
    const totalChars = Math.max(formattedNarration.length, 1);
    if (chapterMarkers && chapterMarkers.length > 0) {
      const found: { ratio: number; label: string }[] = [];
      for (const marker of chapterMarkers) {
        const formattedPrefix = formatSpeechText(marker.prefix, speechLang);
        const idx = formattedNarration
          .toLowerCase()
          .indexOf(formattedPrefix.toLowerCase());
        if (idx > 0 && idx < totalChars - 8) {
          found.push({ ratio: idx / totalChars, label: marker.label });
        }
      }
      if (found.length > 0) return found;
    }
    // Fallback chapter ticks snapped to sentence boundaries
    if (sentences.length >= 4) {
      return [0.25, 0.5, 0.75].map((target) => {
        const sIdx = Math.min(
          sentences.length - 1,
          Math.max(1, Math.round(target * sentences.length)),
        );
        return {
          ratio: sentences[sIdx].startChar / totalChars,
          label: "",
        };
      });
    }
    return [];
  }, [chapterMarkers, formattedNarration, sentences, speechLang]);

  const getSentenceIndexAtOffset = useCallback(
    (charOffset: number): number => {
      if (sentences.length === 0) return 0;
      for (let i = sentences.length - 1; i >= 0; i--) {
        if (charOffset >= sentences[i].startChar) {
          return i;
        }
      }
      return 0;
    },
    [sentences],
  );

  const startSpeechFromOffset = useCallback(
    (offsetChar: number, targetRate: number) => {
      const totalChars = Math.max(formattedNarration.length, 1);
      const clampedOffset = Math.max(0, Math.min(totalChars - 1, offsetChar));
      currentOffsetRef.current = clampedOffset;
      const remainingText = formattedNarration.slice(clampedOffset);
      const gen = ++playbackGenRef.current;

      setIsPlaying(true);
      speechEngine.speak(remainingText, {
        lang: speechLang,
        rate: targetRate,
        onBoundary: (relativeCharIndex) => {
          const absoluteIndex = clampedOffset + relativeCharIndex;
          currentOffsetRef.current = absoluteIndex;
          if (!isDraggingRef.current) {
            const pct = Math.min(
              100,
              Math.round((absoluteIndex / totalChars) * 100),
            );
            setProgressPercent(pct);
          }

          if (onSentenceChangeRef.current) {
            const sentenceIdx = getSentenceIndexAtOffset(absoluteIndex);
            if (sentenceIdx !== lastSentenceRef.current) {
              lastSentenceRef.current = sentenceIdx;
              onSentenceChangeRef.current(sentenceIdx);
            }
          }
        },
        onEnd: () => {
          if (gen !== playbackGenRef.current) return;
          setIsPlaying(false);
          if (speechEngine.getLastEndReason() === "completed") {
            setProgressPercent(100);
            currentOffsetRef.current = totalChars;
          }
        },
        onError: () => {
          if (gen !== playbackGenRef.current) return;
          setIsPlaying(false);
        },
      });
    },
    [formattedNarration, getSentenceIndexAtOffset, speechLang],
  );

  useEffect(() => {
    if (isActive) {
      wasActiveRef.current = true;
      lastSentenceRef.current = -1;
      currentOffsetRef.current = 0;
      const unregister = speechEngine.registerActivePlayer(() =>
        onCloseRef.current(),
      );
      const playTimer = setTimeout(
        () => startSpeechFromOffset(0, speedRef.current),
        0,
      );
      return () => {
        unregister();
        clearTimeout(playTimer);
        playbackGenRef.current += 1;
        speechEngine.stop();
      };
    }

    if (!wasActiveRef.current) {
      return;
    }

    wasActiveRef.current = false;
    playbackGenRef.current += 1;
    speechEngine.stop();
    lastSentenceRef.current = -1;
    currentOffsetRef.current = 0;
    const stopTimer = setTimeout(() => {
      setIsPlaying(false);
      setProgressPercent(0);
      setViewOverride(null);
    }, 0);
    return () => clearTimeout(stopTimer);
  }, [isActive, startSpeechFromOffset]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (!isActive) {
      root.style.removeProperty("--player-h");
      root.removeAttribute("data-audio-player-open");
      return;
    }

    root.setAttribute("data-audio-player-open", "true");
    const syncHeight = () => {
      const el = playerRootRef.current;
      if (!el) return;
      const height = Math.ceil(el.getBoundingClientRect().height);
      if (height > 0) {
        root.style.setProperty("--player-h", `${height}px`);
      }
    };

    syncHeight();
    let observer: ResizeObserver | null = null;
    if (playerRootRef.current && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(syncHeight);
      observer.observe(playerRootRef.current);
    }

    return () => {
      observer?.disconnect();
      root.style.removeProperty("--player-h");
      root.removeAttribute("data-audio-player-open");
    };
  }, [isActive, isCompact]);

  const handleClose = () => {
    playEarcon("stop");
    playbackGenRef.current += 1;
    speechEngine.stop();
    setViewOverride(null);
    onCloseRef.current();
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      playEarcon("stop");
      speechEngine.pause();
      setIsPlaying(false);
    } else {
      onUserPlayOrSeekRef.current?.();
      playEarcon("start");
      if (speechEngine.isPaused()) {
        speechEngine.resume();
        setIsPlaying(true);
      } else {
        const startAt =
          progressPercent >= 100 ? 0 : currentOffsetRef.current;
        if (progressPercent >= 100) {
          setProgressPercent(0);
        }
        startSpeechFromOffset(startAt, speed);
      }
    }
  };

  const handleSetSpeed = (newSpeed: number) => {
    playEarcon("click");
    setSpeed(newSpeed);
    speedRef.current = newSpeed;
    speechEngine.setRate(newSpeed);
    if (isPlaying) {
      const charOffset = currentOffsetRef.current;
      playbackGenRef.current += 1;
      speechEngine.stop();
      startSpeechFromOffset(charOffset, newSpeed);
    }
  };

  const seekTo = (pct: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(pct)));
    const totalChars = Math.max(formattedNarration.length, 1);
    const rawOffset = Math.floor((clamped / 100) * totalChars);
    const sentenceIdx = getSentenceIndexAtOffset(rawOffset);
    const alignedOffset =
      clamped === 0 ? 0 : sentences[sentenceIdx]?.startChar ?? rawOffset;

    setProgressPercent(clamped);
    currentOffsetRef.current = alignedOffset;
    lastSentenceRef.current = sentenceIdx;
    onUserPlayOrSeekRef.current?.();
    onSentenceChangeRef.current?.(sentenceIdx);

    playbackGenRef.current += 1;
    speechEngine.stop();
    if (isPlaying) {
      startSpeechFromOffset(alignedOffset, speedRef.current);
    }
  };

  const handleStepSentence = (delta: -1 | 1) => {
    if (sentences.length === 0) return;
    playEarcon("click");
    const totalChars = Math.max(formattedNarration.length, 1);
    const currentIdx = getSentenceIndexAtOffset(currentOffsetRef.current);
    const nextIdx = Math.max(
      0,
      Math.min(sentences.length - 1, currentIdx + delta),
    );
    const targetOffset = sentences[nextIdx]?.startChar ?? 0;
    const pct = Math.min(100, Math.round((targetOffset / totalChars) * 100));

    setProgressPercent(pct);
    currentOffsetRef.current = targetOffset;
    lastSentenceRef.current = nextIdx;
    onUserPlayOrSeekRef.current?.();
    onSentenceChangeRef.current?.(nextIdx);

    playbackGenRef.current += 1;
    speechEngine.stop();
    if (isPlaying) {
      startSpeechFromOffset(targetOffset, speedRef.current);
    }
  };

  const computePercentFromClientX = (clientX: number): number => {
    const track = scrubberRef.current;
    if (!track) return progressPercent;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return progressPercent;
    return Math.max(
      0,
      Math.min(100, ((clientX - rect.left) / rect.width) * 100),
    );
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const pct = computePercentFromClientX(e.clientX);
    if (scrubRafRef.current !== null) {
      cancelAnimationFrame(scrubRafRef.current);
    }
    scrubRafRef.current = requestAnimationFrame(() => {
      setProgressPercent(Math.round(pct));
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const pct = computePercentFromClientX(e.clientX);
    if (scrubRafRef.current !== null) {
      cancelAnimationFrame(scrubRafRef.current);
    }
    scrubRafRef.current = requestAnimationFrame(() => {
      setProgressPercent(Math.round(pct));
    });
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (scrubRafRef.current !== null) {
      cancelAnimationFrame(scrubRafRef.current);
      scrubRafRef.current = null;
    }
    const pct = computePercentFromClientX(e.clientX);
    seekTo(pct);
  };

  if (!isActive) return null;

  const nextSpeed = speed === 0.85 ? 1.0 : 0.85;
  const nextSpeedLabel =
    speed === 0.85 ? pickLocale(s.normal, currentLang) : pickLocale(s.slower, currentLang);
  const nextSpeedTitle =
    speed === 0.85
      ? pickLocale(s.normalSpeedTitle, currentLang)
      : pickLocale(s.calmSpeedTitle, currentLang);

  if (isCompact) {
    return (
      <div
        ref={playerRootRef}
        role="region"
        aria-label={pickLocale(s.playerAria, currentLang)}
        data-bottom-bar=""
        data-audio-compact="true"
        className={`hh-dialog fixed inset-x-0 bottom-0 z-40 flex min-h-16 items-center border-t border-border bg-card px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] min-[360px]:px-2.5 sm:px-4 ${className}`}
      >
        <div className="mx-auto flex w-full max-w-4xl items-center gap-1 min-[360px]:gap-1.5 sm:gap-3">
          {/* Play/Pause with word */}
          <button
            type="button"
            onClick={handleTogglePlay}
            title={
              isPlaying
                ? pickLocale(s.pauseAria, currentLang)
                : pickLocale(s.playAria, currentLang)
            }
            className="press-solid inline-flex min-h-11 shrink-0 items-center justify-center gap-1 min-[360px]:gap-1.5 rounded-(--radius-control) bg-sapphire px-2 text-body font-semibold whitespace-nowrap text-white shadow-(--hairline-refraction) transition-[background-color,box-shadow,opacity] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background min-[360px]:px-2.5 sm:px-3.5"
          >
            {isPlaying ? (
              <svg
                className="h-3.5 w-3.5 shrink-0 min-[360px]:h-4 min-[360px]:w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg
                className="h-3.5 w-3.5 shrink-0 min-[360px]:h-4 min-[360px]:w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
            <span>
              {isPlaying
                ? pickLocale(s.pauseButton, currentLang)
                : pickLocale(s.playButton, currentLang)}
            </span>
          </button>

          {/* Guide title (opens expanded controls) */}
          <button
            type="button"
            onClick={() => setViewOverride("expanded")}
            aria-label={`${title} — ${pickLocale(s.moreControls, currentLang)}`}
            title={stepUi.expandAria}
            className="press-row flex min-h-11 min-w-0 flex-1 items-center gap-1 rounded-(--radius-control) px-1 text-left transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background min-[360px]:gap-1.5 min-[360px]:px-2"
          >
            <span className="min-w-0 flex-1 truncate text-body font-semibold text-foreground">
              {title}
            </span>
            <span className="hidden shrink-0 whitespace-nowrap text-meta font-semibold text-sapphire dark:text-sapphire-border sm:inline">
              {pickLocale(s.moreControls, currentLang)}
            </span>
            <svg
              className="h-4 w-4 shrink-0 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>

          {/* Slower / Normal toggle */}
          <button
            type="button"
            onClick={() => handleSetSpeed(nextSpeed)}
            title={nextSpeedTitle}
            className="press-row inline-flex min-h-11 shrink-0 items-center justify-center rounded-(--radius-control) border border-border-control bg-background px-2 text-body font-semibold whitespace-nowrap text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background min-[360px]:px-2.5 sm:px-3"
          >
            {nextSpeedLabel}
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={handleClose}
            aria-label={pickLocale(s.closeAria, currentLang)}
            className="press-row flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-(--radius-control) text-muted-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={playerRootRef}
      role="region"
      aria-label={pickLocale(s.playerAria, currentLang)}
      data-bottom-bar=""
      data-audio-compact="false"
      className={`hh-dialog fixed inset-x-0 bottom-0 z-40 rounded-t-lg border-t border-border bg-card p-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] shadow-xl sm:inset-x-4 sm:bottom-4 sm:mx-auto sm:max-w-xl sm:rounded-lg sm:border sm:p-4 ${className}`}
    >
      {/* Top row: Title, reading duration, and minimize/close */}
      <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-semibold leading-snug text-foreground">
            {title}
          </p>
          <p className="mt-0.5 text-meta text-muted-foreground">
            {pickLocale(s.durationSubtitle, currentLang).replace(
              "{durationMinutes}",
              String(durationMinutes),
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setViewOverride("compact")}
            className="press-row flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-(--radius-control) text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={pickLocale(s.minimizeAria, currentLang)}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 12h12" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="press-row flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-(--radius-control) text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={pickLocale(s.closeAria, currentLang)}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chapter-segmented rAF pointer-drag scrubber */}
      <div className="my-3">
        <div className="mb-1.5 flex items-center justify-between text-meta font-medium text-muted-foreground tabular-nums">
          <span key={isPlaying ? "playing" : "paused"} className="swap-in">
            {isPlaying
              ? pickLocale(s.statusPlaying, currentLang)
              : pickLocale(s.statusPaused, currentLang)}
          </span>
          <span>
            {pickLocale(s.progressSummary, currentLang).replace(
              "{progressPercent}",
              String(progressPercent),
            )}
          </span>
        </div>

        <div
          ref={scrubberRef}
          role="slider"
          aria-label={pickLocale(s.scrubberAria, currentLang)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
          aria-valuetext={pickLocale(s.progressSummary, currentLang).replace(
            "{progressPercent}",
            String(progressPercent),
          )}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              handleStepSentence(1);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              handleStepSentence(-1);
            } else if (e.key === "Home") {
              e.preventDefault();
              seekTo(0);
            } else if (e.key === "End") {
              e.preventDefault();
              seekTo(100);
            }
          }}
          className="group/scrub relative flex h-11 w-full cursor-pointer touch-none select-none items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title={pickLocale(s.scrubberTitle, currentLang)}
        >
          <div className="relative h-2 w-full overflow-hidden rounded-sm bg-muted">
            <div
              className="absolute inset-0 origin-left bg-sapphire transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none"
              style={{ transform: `scaleX(${progressPercent / 100})` }}
            />
            {sectionTicks.map((tick, idx) => (
              <span
                key={idx}
                aria-hidden="true"
                title={tick.label || undefined}
                className="pointer-events-none absolute top-0 bottom-0 w-[2px] bg-card/90"
                style={{ left: `${Math.round(tick.ratio * 100)}%` }}
              />
            ))}
          </div>
          {/*
            The handle rides the play head, so the bar reads as something to drag. It travels on
            the same curve as the fill and takes the sapphire edge on hover, focus and drag.
          */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 right-0">
            <span
              className="absolute inset-y-0 left-0 w-full transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none"
              style={{ transform: `translateX(${progressPercent}%)` }}
            >
              <span className="absolute top-1/2 left-0 h-5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-xs border border-card bg-sapphire shadow-xs transition-[box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover/scrub:ring-4 group-hover/scrub:ring-sapphire/20 group-focus-visible/scrub:ring-4 group-focus-visible/scrub:ring-sapphire/20 group-active/scrub:ring-4 group-active/scrub:ring-sapphire/25 motion-reduce:transition-none dark:bg-sapphire-border" />
            </span>
          </span>
        </div>
      </div>

      {/* Controls row: Back / Next sentence step, play/pause, speed */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleStepSentence(-1)}
            className="press-row inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-(--radius-control) border border-border-control bg-card px-3 py-2 text-body font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${pickLocale(s.backSentence, currentLang)} — ${stepUi.prevSentenceAria}`}
            title={stepUi.prevSentenceAria}
          >
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="19 20 9 12 19 4 19 20" />
              <line x1="5" y1="19" x2="5" y2="5" />
            </svg>
            <span>{pickLocale(s.backSentence, currentLang)}</span>
          </button>

          <button
            type="button"
            onClick={() => handleStepSentence(1)}
            className="press-row inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-(--radius-control) border border-border-control bg-card px-3 py-2 text-body font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${pickLocale(s.nextSentence, currentLang)} — ${stepUi.nextSentenceAria}`}
            title={stepUi.nextSentenceAria}
          >
            <span>{pickLocale(s.nextSentence, currentLang)}</span>
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </div>

        {/* Play/Pause Button */}
        <Button
          type="button"
          variant="action"
          size="lg"
          onClick={handleTogglePlay}
          className="min-w-[48px] shadow-xs"
          title={
            isPlaying
              ? pickLocale(s.pauseAria, currentLang)
              : pickLocale(s.playAria, currentLang)
          }
        >
          {/*
            Play and pause share one cell: the button holds the width of the longer label and
            the two states cross-fade, so the controls row never shifts under the thumb.
          */}
          <span className="grid [&>*]:col-start-1 [&>*]:row-start-1">
            <span
              aria-hidden={isPlaying}
              className={`${PLAY_SWAP_CLASS} ${isPlaying ? PLAY_SWAP_OUT : PLAY_SWAP_IN}`}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>{pickLocale(s.playButton, currentLang)}</span>
            </span>
            <span
              aria-hidden={!isPlaying}
              className={`${PLAY_SWAP_CLASS} ${isPlaying ? PLAY_SWAP_IN : PLAY_SWAP_OUT}`}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              <span>{pickLocale(s.pauseButton, currentLang)}</span>
            </span>
          </span>
        </Button>

        {/* Slower / Normal toggle (words only, no x numbers) */}
        <button
          type="button"
          onClick={() => handleSetSpeed(nextSpeed)}
          title={nextSpeedTitle}
          className="press-row inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-(--radius-control) border border-border-control bg-background px-3.5 py-2 text-body font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {nextSpeedLabel}
        </button>
      </div>
    </div>
  );
}
