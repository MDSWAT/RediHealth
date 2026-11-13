"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LazyMotion, domAnimation, useInView, useReducedMotion } from "motion/react";
import type { Lang } from "@/lib/i18n/translations";
import { VolumeIcon, VolumeMuteIcon } from "@/components/ui/icons";
import { InlineAudioNarratorButton } from "../InlineAudioNarratorButton";
import { BreathingPacerScene, type BreathPhaseKind } from "../explainers/scenes/BreathingPacerScene";
import { SPEECH_LANG } from "../explainers/explainer-copy";
import {
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
import { TAB_LIST_CLASS, tabClass, handleTabKey } from "../diabetes/choice-styles";

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

const noopSubscribe = () => () => {};

const PATTERN_IDS = Object.keys(BREATHING_PATTERNS) as BreathingPatternId[];

/** How often the session clock is read. Phases start within this many ms of their real time. */
const TICK_MS = 100;

/**
 * Guided breathing pacer for the emotional-wellbeing topic.
 *
 * Nothing starts on its own. The stage holds only the circle, its faint ring
 * and the phase word; screen readers hear the phase from an aria-live line.
 * Under prefers-reduced-motion the circle stays still and only its colour,
 * the word and a seconds count change. The session pauses when scrolled out of view and stops
 * itself after five minutes. The safety line (stop if dizzy, 112 in a crisis) is
 * always visible; the page's warning card carries the 112 button.
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


  // The server cannot know the motion setting, so the reduced-motion intro swaps in after hydration.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const intro = hydrated && reducedMotion ? copy.introReduced : copy.intro;
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
        <h3 className="text-lg font-semibold text-foreground">{copy.title}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTonesEnabled((on) => !on)}
            aria-pressed={tonesEnabled}
            className={`inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-xs font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
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
            textToSpeak={`${copy.title}. ${intro} ${copy.safety}`}
            label={copy.listen}
            lang={SPEECH_LANG[lang] ?? SPEECH_LANG.ro}
          />
        </div>
      </div>

      <div role="tablist" aria-label={copy.patternGroupLabel} className={`mt-4 ${TAB_LIST_CLASS}`}>
        {PATTERN_IDS.map((id) => {
          const selected = id === patternId;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`breathing-tab-${id}`}
              aria-selected={selected}
              aria-controls="breathing-stage"
              tabIndex={selected ? 0 : -1}
              onClick={() => choosePattern(id)}
              onKeyDown={(event) => handleTabKey(event, PATTERN_IDS, patternId, choosePattern)}
              className={tabClass(selected)}
            >
              {copy.patterns[id]}
            </button>
          );
        })}
      </div>

      <div
        ref={stageRef}
        id="breathing-stage"
        role="tabpanel"
        aria-labelledby={`breathing-tab-${patternId}`}
        className="relative mx-auto mt-6 aspect-square w-full max-w-[15rem]"
      >
        <div role="img" aria-label={copy.ariaLabel} className="h-full w-full">
          <LazyMotion features={domAnimation} strict>
            <BreathingPacerScene
              phase={running ? { kind: current.phase.kind, seconds: current.secondsLeft } : undefined}
              reducedMotion={reducedMotion}
            />
          </LazyMotion>
        </div>
        {running && (
          <span
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
            aria-hidden="true"
          >
            <span className="text-lg font-semibold leading-tight text-sapphire">{copy.phases[current.phase.kind]}</span>
            {/* The still circle shows no timing under reduced motion, so the seconds stand in for it. */}
            {reducedMotion && (
              <span className="mt-1 text-sm font-medium tabular-nums text-sapphire/80">{secondsLeft}</span>
            )}
          </span>
        )}
      </div>

      <p
        className="mt-3 min-h-[1.75rem] text-center text-base font-medium text-foreground"
        aria-live="polite"
        aria-atomic="true"
        data-testid="breathing-status"
      >
        <span className={running ? "sr-only" : undefined}>{statusText}</span>
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={running ? stop : start}
          className={`${STAGE_PRIMARY_CONTROL_CLASS} whitespace-nowrap focus-visible:ring-ring`}
        >
          {running ? copy.stop : copy.start}
        </button>
        <span className="text-xs font-semibold text-muted-foreground">
          {copy.cycles.replace("{count}", String(completedBreaths))}
        </span>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{intro}</p>

      <p className="mt-5 border-t border-border pt-5 text-sm leading-relaxed text-foreground">{copy.safety}</p>

      <p className={STAGE_CREDIT_CLASS}>{copy.credit}</p>
    </section>
  );
}
