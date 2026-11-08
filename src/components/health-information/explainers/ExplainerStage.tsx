"use client";

import { useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, useInView, useReducedMotion } from "motion/react";
import { InlineAudioNarratorButton } from "../InlineAudioNarratorButton";
import { formatStepOf, type ExplainerUiCopy } from "./explainer-copy";
import type { ExplainerScene, ExplainerStep } from "./types";
import type { Lang } from "@/lib/i18n/translations";
import { STAGE_CANVAS_CLASS, STAGE_CARD_CLASS, STAGE_CONTROL_CLASS, STAGE_CREDIT_CLASS } from "./stage-styles";

const DEFAULT_STEP_MS = 4000;

export interface ExplainerStageProps {
  title: string;
  steps: ExplainerStep[];
  Scene: ExplainerScene;
  ui: ExplainerUiCopy;
  speechLang: string;
  /** Attribution line, for example "Anatomy reference: Servier Medical Art, CC BY 4.0". */
  credit?: string;
  lang?: Lang;
  className?: string;
}

/**
 * Shared shell for every topic explainer.
 *
 * - Light stage on design tokens (no dark canvas, no hardcoded colours).
 * - Captions and step labels are DOM text, so they localize and are read aloud.
 * - Single-step ambient scenes play while in view; multi-step scenes and every
 *   scene under prefers-reduced-motion wait for the Play button.
 * - Animation stops whenever the stage scrolls out of view.
 */
export function ExplainerStage({
  title,
  steps,
  Scene,
  ui,
  speechLang,
  credit,
  lang,
  className = "",
}: ExplainerStageProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(stageRef, { amount: 0.3 });
  const reducedMotion = useReducedMotion() ?? false;
  const [stepIndex, setStepIndex] = useState(0);
  // null = follow the default for this scene; true/false = the user chose.
  const [playChoice, setPlayChoice] = useState<boolean | null>(null);

  const total = steps.length;
  const multiStep = total > 1;
  const defaultPlay = !reducedMotion && !multiStep;
  const wantsPlay = playChoice ?? defaultPlay;
  const playing = wantsPlay && inView;
  const step = steps[Math.min(stepIndex, total - 1)];

  // Multi-step scenes advance on their own while playing and stop on the last step.
  useEffect(() => {
    if (!playing || !multiStep) return;
    const id = window.setTimeout(() => {
      if (stepIndex >= total - 1) setPlayChoice(false);
      else setStepIndex(stepIndex + 1);
    }, step.durationMs ?? DEFAULT_STEP_MS);
    return () => window.clearTimeout(id);
  }, [playing, multiStep, stepIndex, total, step.durationMs]);

  const togglePlay = () => {
    if (!wantsPlay && multiStep && stepIndex >= total - 1) setStepIndex(0);
    setPlayChoice(!wantsPlay);
  };

  const goTo = (next: number) => {
    setPlayChoice(false);
    setStepIndex(Math.max(0, Math.min(next, total - 1)));
  };

  const narration = `${title}. ${steps.map((s) => s.caption).join(" ")}`;
  const controlClass = STAGE_CONTROL_CLASS;

  return (
    <section
      className={`${STAGE_CARD_CLASS} ${className}`}
      aria-label={title}
      data-testid="explainer-stage"
    >
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-base font-semibold text-foreground">{title}</h4>
        <InlineAudioNarratorButton textToSpeak={narration} label={ui.listen} lang={speechLang} />
      </div>

      <div
        ref={stageRef}
        role="img"
        aria-label={step.ariaLabel}
        className={STAGE_CANVAS_CLASS}
      >
        <LazyMotion features={domAnimation} strict>
          <Scene step={stepIndex} playing={playing} lang={lang} />
        </LazyMotion>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={togglePlay}
          className={controlClass}
          aria-pressed={wantsPlay}
          aria-label={wantsPlay ? ui.pause : ui.play}
        >
          {wantsPlay ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z" />
            </svg>
          )}
        </button>

        {multiStep && (
          <>
            <button
              type="button"
              onClick={() => goTo(stepIndex - 1)}
              disabled={stepIndex === 0}
              className={controlClass}
              aria-label={ui.previousStep}
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={() => goTo(stepIndex + 1)}
              disabled={stepIndex >= total - 1}
              className={controlClass}
              aria-label={ui.nextStep}
            >
              <span aria-hidden="true">→</span>
            </button>
            <span className="ml-1 text-xs font-semibold text-muted-foreground">
              {formatStepOf(ui.stepOf, stepIndex + 1, total)}
            </span>
          </>
        )}
      </div>

      <p
        className="mt-4 text-sm leading-relaxed text-muted-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        {step.caption}
      </p>

      {credit && <p className={STAGE_CREDIT_CLASS}>{credit}</p>}
    </section>
  );
}
