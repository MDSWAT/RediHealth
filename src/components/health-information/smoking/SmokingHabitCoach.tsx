"use client";

import { useEffect, useId, useState } from "react";
import type { Lang } from "@/lib/i18n/translations";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { SMOKING_COACH_COPY } from "./smoking-copy";

export interface SmokingHabitCoachProps {
  lang: Lang;
  className?: string;
}

const TOTAL_SECONDS = 180;
const RING_RADIUS = 52;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function formatTime(totalSec: number) {
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

/** Getting through a craving: four steps, a 3-minute timer and what to do in common moments. */
export function SmokingHabitCoach({ lang, className = "" }: SmokingHabitCoachProps) {
  const copy = SMOKING_COACH_COPY[lang] ?? SMOKING_COACH_COPY.ro;
  const titleId = useId();

  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedTriggerId, setSelectedTriggerId] = useState(copy.triggers[0]?.id ?? "");

  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isTimerRunning]);

  const startTimer = () => {
    if (secondsLeft === 0) setSecondsLeft(TOTAL_SECONDS);
    setIsTimerRunning(true);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setSecondsLeft(TOTAL_SECONDS);
  };

  // One cue per 45-second quarter of the timer.
  const elapsed = TOTAL_SECONDS - secondsLeft;
  const cueIndex = Math.min(3, Math.floor(elapsed / 45));
  const currentCue = secondsLeft === 0 ? copy.timerFinished : copy.timerCues[cueIndex];
  const hasStarted = isTimerRunning || secondsLeft !== TOTAL_SECONDS;

  const activeTrigger = copy.triggers.find((t) => t.id === selectedTriggerId) ?? copy.triggers[0];

  return (
    <section className={className} aria-labelledby={titleId} data-testid="smoking-habit-coach">
      <h3 id={titleId} className="text-title font-semibold text-foreground text-balance">
        {copy.coachHeading}
      </h3>
      <p className="mt-1.5 max-w-(--measure-reading) text-body text-muted-foreground text-pretty">
        {copy.coachSubtitle}
      </p>

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        {/* Four steps */}
        <div>
          <h4 className="text-body font-semibold text-foreground">{copy.protocolTitle}</h4>
          <ol className="mt-3 divide-y divide-border border-y border-border">
            {copy.steps.map((step, index) => (
              <li key={step.name} className="flex gap-3 py-3">
                <span className="w-5 shrink-0 text-body font-semibold tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <p className="text-body">
                  <span className="font-semibold text-foreground">{step.name}. </span>
                  <span className="text-muted-foreground">{step.desc}</span>
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* 3-minute timer */}
        <div className="flex flex-col items-center text-center md:w-56">
          <h4 className="text-body font-semibold text-foreground">{copy.timerHeading}</h4>
          <div className="relative mt-3 flex h-36 w-36 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r={RING_RADIUS} fill="none" stroke="var(--color-border)" strokeWidth="4" />
              <circle
                cx="60"
                cy="60"
                r={RING_RADIUS}
                fill="none"
                stroke="var(--color-sapphire)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={RING_LENGTH}
                className="transition-[stroke-dashoffset] duration-[var(--dur-slow)] ease-[var(--ease-out-calm)] motion-reduce:transition-none"
                style={{ strokeDashoffset: (RING_LENGTH * elapsed) / TOTAL_SECONDS }}
              />
            </svg>
            <span className="absolute text-section font-semibold tabular-nums text-foreground" aria-hidden="true">
              {formatTime(secondsLeft)}
            </span>
          </div>
          <p role="status" className="mt-3 min-h-[3lh] text-body text-muted-foreground text-pretty">
            {hasStarted ? currentCue : copy.timerCues[0]}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {isTimerRunning ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsTimerRunning(false)}
              >
                {copy.timerPause}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={startTimer}
              >
                {copy.timerStart}
              </Button>
            )}
            {hasStarted && (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={resetTimer}
                className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                {copy.timerReset}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Common moments */}
      <div className="mt-8 border-t border-border pt-6">
        <h4 className="text-body font-semibold text-foreground">{copy.triggerSectionHeading}</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          {copy.triggers.map((trigger) => {
            const isSelected = trigger.id === activeTrigger?.id;
            return (
              <button
                key={trigger.id}
                type="button"
                onClick={() => setSelectedTriggerId(trigger.id)}
                aria-pressed={isSelected}
                className={cn(
                  "min-h-[44px] whitespace-nowrap rounded-lg border px-3.5 py-2 text-body font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "border-foreground bg-surface-subtle text-foreground"
                    : "border-border bg-card text-foreground hover:border-foreground/30 hover:bg-surface-subtle/50",
                )}
              >
                {trigger.name}
              </button>
            );
          })}
        </div>
        {activeTrigger && (
          <p aria-live="polite" className="mt-4 max-w-(--measure-reading) text-body">
            <span className="font-semibold text-foreground">{copy.triggerStrategyHeading}: </span>
            <span className="text-muted-foreground">{activeTrigger.strategy}</span>
          </p>
        )}
      </div>
    </section>
  );
}
