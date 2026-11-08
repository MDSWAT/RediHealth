"use client";

import { useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, useInView, useReducedMotion } from "motion/react";
import type { Lang } from "@/lib/i18n/translations";
import { VolumeIcon, VolumeMuteIcon } from "@/components/ui/icons";
import { InlineAudioNarratorButton } from "../InlineAudioNarratorButton";
import { BreathingPacerScene, type BreathPhaseKind } from "../explainers/scenes/BreathingPacerScene";
import { SPEECH_LANG } from "../explainers/explainer-copy";
import {
  STAGE_CANVAS_CLASS,
  STAGE_CARD_CLASS,
  STAGE_CREDIT_CLASS,
  STAGE_PRIMARY_CONTROL_CLASS,
} from "../explainers/stage-styles";
import {
  BREATHING_COPY,
  BREATHING_PATTERNS,
  MAX_SESSION_SECONDS,
  getPhaseAt,
  type BreathingPatternId,
} from "./breathing-copy";

export interface BreathingPacerProps {
  lang: Lang;
  className?: string;
}

/** Plain, quiet tones: a higher note to breathe in, a lower one to breathe out. */
const TONE_HZ: Record<BreathPhaseKind, number> = {
  in: 392,
  holdFull: 349,
  out: 294,
  holdEmpty: 262,
};

/** How often the session clock is read. Phases start within this many ms of their real time. */
const TICK_MS = 100;

/**
 * Guided breathing pacer for the emotional-wellbeing topic.
 *
 * Nothing starts on its own. The phase word is DOM text in an aria-live region
 * (the seconds counter is hidden from screen readers so it does not chatter).
 * Under prefers-reduced-motion the circle stays still and only its colour and
 * the words change. The session pauses when scrolled out of view and stops
 * itself after five minutes. The 112 safety line is always visible.
 */
export function BreathingPacer({ lang, className = "" }: BreathingPacerProps) {
  const copy = BREATHING_COPY[lang] ?? BREATHING_COPY.ro;
  const stageRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(stageRef, { amount: 0.3 });
  const reducedMotion = useReducedMotion() ?? false;

  const [patternId, setPatternId] = useState<BreathingPatternId>("relaxed");
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finished, setFinished] = useState(false);
  const [tonesEnabled, setTonesEnabled] = useState(false);

  const elapsedRef = useRef(0);
  const prevPhaseKindRef = useRef<BreathPhaseKind | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const pattern = BREATHING_PATTERNS[patternId];
  const ticking = running && inView;
  const current = getPhaseAt(pattern, elapsedMs / 1000);

  // Drift-free session clock: elapsed time is measured from a monotonic start
  // point, so a slow tick never shifts the rhythm. It pauses while off-screen.
  useEffect(() => {
    if (!ticking) return;
    const startedAt = performance.now() - elapsedRef.current;
    const id = window.setInterval(() => {
      const next = performance.now() - startedAt;
      if (next >= MAX_SESSION_SECONDS * 1000) {
        elapsedRef.current = MAX_SESSION_SECONDS * 1000;
        setElapsedMs(MAX_SESSION_SECONDS * 1000);
        setRunning(false);
        setFinished(true);
        return;
      }
      elapsedRef.current = next;
      setElapsedMs(next);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [ticking]);

  // One soft tone at the start of each phase, only when the reader turned tones on.
  useEffect(() => {
    if (!running) {
      prevPhaseKindRef.current = null;
      return;
    }
    const kind = current.phase.kind;
    if (prevPhaseKindRef.current === kind) return;
    prevPhaseKindRef.current = kind;
    if (!tonesEnabled) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioRef.current ?? new AudioCtx();
      audioRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(TONE_HZ[kind], ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.85);
    } catch {
      // Web Audio unavailable or blocked: the words and the circle still guide.
    }
  }, [running, current.phase.kind, tonesEnabled]);

  useEffect(
    () => () => {
      audioRef.current?.close().catch(() => {});
      audioRef.current = null;
    },
    []
  );

  const resetClock = () => {
    elapsedRef.current = 0;
    setElapsedMs(0);
  };

  const start = () => {
    resetClock();
    setFinished(false);
    setRunning(true);
  };

  const stop = () => {
    setRunning(false);
    setFinished(elapsedRef.current > 0);
  };

  const choosePattern = (id: BreathingPatternId) => {
    setPatternId(id);
    setRunning(false);
    resetClock();
    setFinished(false);
  };

  const statusText = running ? copy.phases[current.phase.kind] : finished ? copy.finished : copy.ready;
  const completedBreaths = running || finished ? current.cycles : 0;
  const secondsLeft = Math.max(1, Math.ceil(current.secondsLeft - 0.05));

  return (
    <section
      className={`${STAGE_CARD_CLASS} ${className}`}
      aria-label={copy.title}
      data-testid="breathing-pacer"
    >
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-base font-semibold text-foreground">{copy.title}</h4>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTonesEnabled((on) => !on)}
            aria-pressed={tonesEnabled}
            className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
              tonesEnabled
                ? "border-sapphire-border bg-sapphire-soft text-sapphire"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
            title={tonesEnabled ? copy.chimesActive : copy.chimesMuted}
          >
            {tonesEnabled ? (
              <VolumeIcon className="h-4 w-4" aria-hidden="true" />
            ) : (
              <VolumeMuteIcon className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">{copy.chimesToggle}</span>
            <span className="sr-only sm:hidden">{copy.chimesToggle}</span>
          </button>
          <InlineAudioNarratorButton
            textToSpeak={`${copy.title}. ${copy.intro} ${copy.safety}`}
            label={copy.listen}
            lang={SPEECH_LANG[lang] ?? SPEECH_LANG.ro}
          />
        </div>
      </div>

      <div role="group" aria-label={copy.patternGroupLabel} className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(BREATHING_PATTERNS) as BreathingPatternId[]).map((id) => {
          const selected = id === patternId;
          return (
            <button
              key={id}
              type="button"
              onClick={() => choosePattern(id)}
              aria-pressed={selected}
              className={`inline-flex min-h-[44px] items-center rounded-lg border px-3.5 py-2 text-sm font-semibold leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                selected
                  ? "border-foreground bg-surface-subtle text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {copy.patterns[id]}
            </button>
          );
        })}
      </div>

      <div ref={stageRef} className={STAGE_CANVAS_CLASS}>
        <div role="img" aria-label={copy.ariaLabel} className="h-full w-full">
          <LazyMotion features={domAnimation} strict>
            <BreathingPacerScene
              step={current.index}
              playing={ticking}
              phase={running ? { kind: current.phase.kind, seconds: current.secondsLeft } : undefined}
              reducedMotion={reducedMotion}
            />
          </LazyMotion>
        </div>
        {running && (
          <span
            className="pointer-events-none absolute bottom-3 right-4 text-2xl font-semibold tabular-nums text-sapphire"
            aria-hidden="true"
          >
            {secondsLeft}
          </span>
        )}
      </div>

      <p
        className="text-center text-lg font-semibold text-foreground"
        aria-live="polite"
        aria-atomic="true"
        data-testid="breathing-status"
      >
        {statusText}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={running ? stop : start}
          className={STAGE_PRIMARY_CONTROL_CLASS}
        >
          {running ? copy.stop : copy.start}
        </button>
        <span className="text-xs font-semibold text-muted-foreground">
          {copy.cycles.replace("{count}", String(completedBreaths))}
        </span>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{copy.intro}</p>

      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-foreground">{copy.safety}</p>
        <a
          href="tel:112"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg border border-primary/30 px-4 text-sm font-semibold text-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary print:hidden"
        >
          {copy.call112}
        </a>
      </div>

      <p className={STAGE_CREDIT_CLASS}>{copy.credit}</p>
    </section>
  );
}
