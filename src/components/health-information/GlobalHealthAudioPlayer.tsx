"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { speechEngine, formatSpeechText } from "@/lib/audio/speech-engine";
import { playEarcon } from "@/lib/audio/earcon";
import { isVoiceEnabled, useVoiceEnabled } from "@/lib/audio/voice-availability";
import { useLanguage } from "@/lib/i18n/language-context";
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
}

const STEP_COPY: Record<
  Lang,
  {
    prevSentenceAria: string;
    nextSentenceAria: string;
    prevLabel: string;
    nextLabel: string;
    expandAria: string;
  }
> = {
  ro: {
    prevSentenceAria: "Propoziția anterioară",
    nextSentenceAria: "Propoziția următoare",
    prevLabel: "-1 prop.",
    nextLabel: "+1 prop.",
    expandAria: "Extinde cititorul audio",
  },
  en: {
    prevSentenceAria: "Previous sentence",
    nextSentenceAria: "Next sentence",
    prevLabel: "-1 sent.",
    nextLabel: "+1 sent.",
    expandAria: "Expand audio player",
  },
  sq: {
    prevSentenceAria: "Fjalia e mëparshme",
    nextSentenceAria: "Fjalia tjetër",
    prevLabel: "-1 fjali",
    nextLabel: "+1 fjali",
    expandAria: "Zgjero lexuesin audio",
  },
  it: {
    prevSentenceAria: "Frase precedente",
    nextSentenceAria: "Frase successiva",
    prevLabel: "-1 frase",
    nextLabel: "+1 frase",
    expandAria: "Espandi lettore audio",
  },
  hr: {
    prevSentenceAria: "Prethodna rečenica",
    nextSentenceAria: "Sljedeća rečenica",
    prevLabel: "-1 reč.",
    nextLabel: "+1 reč.",
    expandAria: "Proširi audio reproduktor",
  },
  rom: {
    prevSentenceAria: "Angluni vorba",
    nextSentenceAria: "Avutni vorba",
    prevLabel: "-1 vorba",
    nextLabel: "+1 vorba",
    expandAria: "Putar o audio",
  },
};

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

interface ParsedSentenceSpan {
  startChar: number;
  endChar: number;
  text: string;
}

function splitSpeechSentences(text: string): ParsedSentenceSpan[] {
  const spans: ParsedSentenceSpan[] = [];
  const regex = /[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const raw = match[0];
    if (raw.trim().length > 0) {
      spans.push({
        startChar: match.index,
        endChar: match.index + raw.length,
        text: raw,
      });
    }
  }
  if (spans.length === 0 && text.length > 0) {
    spans.push({ startChar: 0, endChar: text.length, text });
  }
  return spans;
}

function VocalCadenceBars({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-3.5 items-end gap-[2px]"
    >
      {[0, 1, 2, 3].map((barIdx) => (
        <span
          key={barIdx}
          className={`w-[2.5px] origin-bottom rounded-xs bg-sapphire transition-transform duration-[var(--dur-fast)] ${
            active
              ? "rh-cadence-bar motion-reduce:animate-none"
              : "scale-y-[0.35]"
          }`}
          style={
            active
              ? {
                  height: "14px",
                  animationDelay: `${barIdx * 130}ms`,
                }
              : { height: "14px" }
          }
        />
      ))}
    </span>
  );
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
  chapterMarkers,
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const onCloseRef = useRef(onClose);
  const onSentenceChangeRef = useRef(onActiveSentenceIndexChange);
  const speedRef = useRef(speed);
  const lastSentenceRef = useRef<number>(0);
  const currentOffsetRef = useRef<number>(0);
  const scrubberRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const scrubRafRef = useRef<number | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onSentenceChangeRef.current = onActiveSentenceIndexChange;
  }, [onActiveSentenceIndexChange]);

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

  const currentChapterLabel = useMemo(() => {
    if (sectionTicks.length === 0) return "";
    const currentRatio = progressPercent / 100;
    let activeLabel = "";
    for (const tick of sectionTicks) {
      if (currentRatio + 0.01 >= tick.ratio && tick.label) {
        activeLabel = tick.label;
      }
    }
    return activeLabel;
  }, [progressPercent, sectionTicks]);

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
          setIsPlaying(false);
          setProgressPercent(100);
          currentOffsetRef.current = totalChars;
        },
        onError: () => {
          setIsPlaying(false);
        },
      });
    },
    [formattedNarration, getSentenceIndexAtOffset, speechLang],
  );

  useEffect(() => {
    if (isActive) {
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
        speechEngine.stop();
      };
    } else {
      speechEngine.stop();
      lastSentenceRef.current = -1;
      currentOffsetRef.current = 0;
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
    onSentenceChangeRef.current?.(sentenceIdx);

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
    onSentenceChangeRef.current?.(nextIdx);

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

  const cadenceStyle = (
    <style>{`
      @keyframes rh-vocal-cadence {
        0%, 100% { transform: scaleY(0.32); }
        45% { transform: scaleY(1); }
        75% { transform: scaleY(0.55); }
      }
      .rh-cadence-bar {
        animation: rh-vocal-cadence 820ms var(--ease-in-out-calm) infinite;
      }
      @media (prefers-reduced-motion: reduce) {
        .rh-cadence-bar {
          animation: none !important;
          transform: scaleY(0.65) !important;
        }
      }
    `}</style>
  );

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-1 rounded-lg border border-sapphire-border bg-card p-1.5 shadow-lg">
        {cadenceStyle}
        <button
          type="button"
          onClick={handleTogglePlay}
          aria-label={
            isPlaying
              ? pickLocale(s.pauseAria, currentLang)
              : pickLocale(s.playAria, currentLang)
          }
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sapphire text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
        >
          {isPlaying ? (
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          aria-label={stepUi.expandAria}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
        >
          <VocalCadenceBars active={isPlaying} />
          <span className="tabular-nums">
            {pickLocale(s.minimizedText, currentLang).replace(
              "{progressPercent}",
              String(progressPercent),
            )}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label={pickLocale(s.playerAria, currentLang)}
      className={`hh-dialog fixed bottom-4 inset-x-4 z-40 mx-auto max-w-xl rounded-lg border border-border bg-card p-3.5 shadow-xl sm:p-4 ${className}`}
    >
      {cadenceStyle}

      {/* Top row: Title, vocal cadence, and minimize/close */}
      <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <VocalCadenceBars active={isPlaying} />
            <p className="truncate text-xs font-semibold leading-snug text-foreground">
              {title}
            </p>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <p className="text-xs text-muted-foreground">
              {pickLocale(s.durationSubtitle, currentLang).replace(
                "{durationMinutes}",
                String(durationMinutes),
              )}
            </p>
            {currentChapterLabel && (
              <span className="rounded-md bg-sapphire-soft px-1.5 py-0.5 text-[11px] font-medium text-sapphire">
                {currentChapterLabel}
              </span>
            )}
            {speechEngine.isFallbackVoice() && (
              <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-600">
                {pickLocale(s.fallbackVoice, currentLang)}
              </span>
            )}
            {speechEngine.getTier() === "transcript" && (
              <span className="rounded-md border border-amber-care/35 bg-amber-care/10 px-1.5 py-0.5 text-[11px] font-medium text-foreground">
                {pickLocale(s.transcriptMode, currentLang)}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
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
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
            aria-label={pickLocale(s.closeAria, currentLang)}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chapter-segmented rAF pointer-drag scrubber */}
      <div className="my-3">
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground tabular-nums">
          <span>
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
          className="flex h-11 w-full cursor-pointer touch-none select-none items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
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
        </div>
      </div>

      {/* Controls row: -1 / +1 sentence step, play/pause, speed */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="inline-flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleStepSentence(-1)}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-lg border border-border bg-card px-2.5 py-2 text-xs font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
            aria-label={stepUi.prevSentenceAria}
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
            <span className="hidden tabular-nums sm:inline">{stepUi.prevLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => handleStepSentence(1)}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-lg border border-border bg-card px-2.5 py-2 text-xs font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
            aria-label={stepUi.nextSentenceAria}
          >
            <span className="hidden tabular-nums sm:inline">{stepUi.nextLabel}</span>
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
        <button
          type="button"
          onClick={handleTogglePlay}
          className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg bg-sapphire px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          aria-label={
            isPlaying
              ? pickLocale(s.pauseAria, currentLang)
              : pickLocale(s.playAria, currentLang)
          }
        >
          {isPlaying ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              <span>{pickLocale(s.pauseButton, currentLang)}</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>{pickLocale(s.playButton, currentLang)}</span>
            </span>
          )}
        </button>

        {/* Voice speed */}
        <div
          role="group"
          aria-label={pickLocale(s.speedGroupAria, currentLang)}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1"
        >
          <button
            type="button"
            onClick={() => handleSetSpeed(0.85)}
            aria-pressed={speed === 0.85}
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
              speed === 0.85
                ? "bg-card font-bold text-sapphire shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={pickLocale(s.calmSpeedTitle, currentLang)}
          >
            <span className="tabular-nums">0.85x</span>
            <span className="hidden text-xs font-normal text-muted-foreground sm:inline">
              {pickLocale(s.calmSpeed, currentLang)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSetSpeed(1.0)}
            aria-pressed={speed === 1.0}
            className={`inline-flex min-h-[44px] items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
              speed === 1.0
                ? "bg-card font-bold text-sapphire shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={pickLocale(s.normalSpeedTitle, currentLang)}
          >
            <span className="tabular-nums">1.0x</span>
            <span className="hidden text-xs font-normal text-muted-foreground sm:inline">
              {pickLocale(s.normalSpeed, currentLang)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
