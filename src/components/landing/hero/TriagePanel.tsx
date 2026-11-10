"use client";

import { useEffect, useRef, useState, type ComponentType, type SVGProps } from "react";
import Link from "next/link";
import {
  ActivityIcon,
  ArrowLeftIcon,
  BookIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  CloseIcon,
  HandHelpingIcon,
  PhoneIcon,
  PinIcon,
  PrescriptionIcon,
  UsersIcon,
  VolumeIcon,
  VolumeMuteIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { HERO_NEED_ORDER, localHref, type HeroCopy, type HeroNeedId, type HeroQuiz } from "@/lib/i18n/hero-copy";
import type { Lang } from "@/lib/i18n/translations";
import { toSentences, useSpeech } from "./use-speech";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { playEarcon } from "@/lib/audio/earcon";

const NEED_ICONS: Record<HeroNeedId, ComponentType<SVGProps<SVGSVGElement>>> = {
  learn: BookIcon,
  risk: ClipboardCheckIcon,
  nearby: PinIcon,
  problem: ActivityIcon,
  prescription: PrescriptionIcon,
  navigate: HandHelpingIcon,
};

type View = "question" | HeroNeedId;
type Direction = "forward" | "back";
const VIEWS: View[] = ["question", ...HERO_NEED_ORDER];
const headingId = (view: View) => `triage-heading-${view}`;

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

type TriagePanelProps = {
  copy: HeroCopy["panel"];
  alarmSigns: string[];
  lang: Lang;
  /** In the phone bottom sheet: a close button joins the voice control in the panel header. */
  onClose?: () => void;
  closeLabel?: string;
};

/**
 * The concept's decision tree as one instrument: "What worries you?", six
 * needs, at most three taps to an exit, and a way to a doctor on every branch.
 *
 * Every view is rendered into the same grid cell, so the panel is always as
 * tall as its tallest view: switching steps never resizes it or the hero.
 * Inactive views are `inert`, so keyboards and screen readers skip them.
 */
export function TriagePanel({ copy, alarmSigns, lang, onClose, closeLabel }: TriagePanelProps) {
  const [view, setView] = useState<View>("question");
  const [dir, setDir] = useState<Direction>("forward");
  // Bumped on every navigation so per-visit state (the quiz) starts fresh.
  const [visit, setVisit] = useState(0);
  const { available: canSpeak, speaking, isFallback, speak, stop } = useSpeech(lang);
  // No read-aloud at all in languages without a trusted voice (Albanian).
  const voiceEnabled = isVoiceEnabled(lang);
  const hasInteracted = useRef(false);

  // After a user picks or goes back, move focus to the new heading so screen
  // readers announce it. Skipped on first render so we never steal focus.
  useEffect(() => {
    if (hasInteracted.current) document.getElementById(headingId(view))?.focus({ preventScroll: true });
  }, [view]);

  const go = (next: View) => {
    hasInteracted.current = true;
    stop();
    setDir(next === "question" ? "back" : "forward");
    setView(next);
    setVisit((count) => count + 1);
  };

  const scriptFor = (current: View): string[] => {
    if (current === "question") return toSentences([copy.question, ...HERO_NEED_ORDER.map((id) => copy.needs[id].label)]);
    const need = copy.needs[current];
    const details = current === "problem" ? alarmSigns : (need.points ?? []).map((point) => point.text);
    const quiz = need.quiz ? [need.quiz.prompt, need.quiz.statement] : [];
    return toSentences([need.title, need.body ?? "", ...details, ...quiz]);
  };

  const handleToggleSound = () => {
    if (speaking) {
      playEarcon("stop");
      stop();
    } else {
      playEarcon("start");
      speak(scriptFor(view));
    }
  };

  const step = view === "question" ? 1 : 2;

  return (
    <section
      aria-labelledby={headingId(view)}
      className="hero-panel relative rounded-xl bg-paper text-ink-950 shadow-[0_24px_60px_-40px_rgba(2,6,23,0.7)] lg:ml-auto lg:max-w-[460px]"
    >
      <header className="relative flex h-16 items-center justify-between gap-3 border-b border-stone-200/80 px-6 sm:px-7">
        <div className="flex items-center gap-2.5">
          {/* Decorative 22px SVG mark: a plain img keeps the panel free of the image optimizer. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Icons/Logo.svg" alt="" width={22} height={22} className="h-[22px] w-[22px]" />
          <span className="text-[14px] font-medium text-stone-700">{copy.label}</span>
        </div>
        <div className="-mr-2 flex items-center gap-1">
          {/* Fixed slot so the header never shifts when the voice list loads. Absent in no-voice languages. */}
          {voiceEnabled && (
            <span className="flex h-11 w-11 items-center justify-center">
              <button
                type="button"
                onClick={handleToggleSound}
                disabled={!canSpeak && typeof window !== "undefined" && !("speechSynthesis" in window)}
                aria-pressed={speaking}
                aria-label={speaking ? copy.stopListening : copy.listen}
                title={
                  speaking
                    ? copy.stopListening
                    : isFallback
                      ? `${copy.listen} (${copy.fallbackVoice})`
                      : copy.listen
                }
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-lg transition-[background-color,color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none",
                  speaking
                    ? "bg-sapphire-soft text-sapphire ring-1 ring-sapphire/25"
                    : "text-stone-500 hover:bg-stone-200/70 hover:text-ink-950",
                  focusRing,
                )}
              >
                {speaking ? <VolumeMuteIcon className="h-5 w-5" /> : <VolumeIcon className="h-5 w-5" />}
              </button>
            </span>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              data-autofocus
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-lg text-stone-600 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-stone-200/70 hover:text-ink-950",
                focusRing,
              )}
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        {/* 2px GPU-composited progress hairline indicating step 1 vs step 2 */}
        <span
          aria-hidden="true"
          style={{ transform: `scaleX(${step / 2})` }}
          className="pointer-events-none absolute inset-x-0 -bottom-px h-[2px] origin-left bg-sapphire/80 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none"
        />
      </header>

      <p className="sr-only" aria-live="polite">
        {copy.step(step, 2)}
      </p>

      <div className="grid">
        {VIEWS.map((current) => {
          const active = current === view;
          const viewDir: Direction =
            current === "question" ? (view !== "question" ? "back" : dir) : "forward";
          return (
            <div
              key={current}
              inert={!active}
              data-active={active}
              data-dir={viewDir}
              className="triage-view flex flex-col px-6 pb-6 pt-5 [grid-area:1/1] sm:px-7 sm:pb-7"
            >
              {current === "question" ? (
                <QuestionView copy={copy} lang={lang} onChoose={go} />
              ) : (
                <AnswerView
                  key={active ? visit : "idle"}
                  copy={copy}
                  id={current}
                  alarmSigns={alarmSigns}
                  lang={lang}
                  onBack={() => go("question")}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Step 1. Each row tints quietly under the pointer; keyboard focus gets the ring.
 */
function QuestionView({
  copy,
  lang,
  onChoose,
}: {
  copy: HeroCopy["panel"];
  lang: Lang;
  onChoose: (id: HeroNeedId) => void;
}) {
  return (
    <>
      <h2
        id={headingId("question")}
        tabIndex={-1}
        className="text-[20px] font-semibold leading-tight tracking-tight outline-none sm:text-[22px]"
      >
        {copy.question}
      </h2>
      <ul className="mt-3">
        {HERO_NEED_ORDER.map((id) => {
          const Icon = NEED_ICONS[id];
          return (
            <li key={id} className="border-b border-stone-200/80 last:border-b-0">
              <button
                type="button"
                id={`triage-option-${id}`}
                onClick={() => onChoose(id)}
                className="group relative -mx-3 flex min-h-[56px] w-[calc(100%+1.5rem)] items-center gap-3.5 rounded-lg px-3 py-2 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-stone-200/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
              >
                {/* Every row is the same neutral tile: red stays for the 112 action itself. */}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-950/[0.04] text-ink-950/65 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:bg-ink-950/[0.07] group-hover:text-ink-950 motion-reduce:transition-none">
                  <Icon className="h-[19px] w-[19px]" />
                </span>
                <span className="flex-1 text-[15.5px] font-medium leading-snug">{copy.needs[id].label}</span>
                <ChevronRightIcon className="h-5 w-5 shrink-0 text-stone-400 transition-[color,transform] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5 group-hover:text-ink-950 motion-reduce:transition-none" />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-4">
        <div className="flex items-center border-t border-stone-200/80 pt-3.5 text-[13.5px]">
          <Link
            href={localHref("/mediatori", lang)}
            className={cn(
              "group -my-1 inline-flex min-h-11 items-center gap-2 rounded font-medium text-stone-600 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-ink-950 motion-reduce:transition-none",
              focusRing,
            )}
          >
            <UsersIcon className="h-4 w-4 text-stone-500 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-ink-950 motion-reduce:transition-none" />
            <span>{copy.mediators}</span>
            <ChevronRightIcon className="h-4 w-4 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </Link>
        </div>
      </div>
    </>
  );
}

type AnswerViewProps = {
  copy: HeroCopy["panel"];
  id: HeroNeedId;
  alarmSigns: string[];
  lang: Lang;
  onBack: () => void;
};

function AnswerView({ copy, id, alarmSigns, lang, onBack }: AnswerViewProps) {
  const need = copy.needs[id];
  const isProblem = id === "problem";
  const bullets = isProblem ? alarmSigns : need.points?.map((point) => point.text);

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className={cn(
          "group -ml-2 -my-1 inline-flex min-h-11 items-center gap-1.5 self-start rounded-lg px-2 text-[14px] font-medium text-stone-600 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-stone-100 hover:text-ink-950 motion-reduce:transition-none",
          focusRing,
        )}
      >
        <ArrowLeftIcon className="h-4 w-4 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:-translate-x-0.5 motion-reduce:transition-none" />
        {copy.back}
      </button>

      <h2
        id={headingId(id)}
        tabIndex={-1}
        className="mt-2 text-[22px] font-semibold leading-tight tracking-tight outline-none sm:text-[24px]"
      >
        {need.title}
      </h2>

      {need.body && <p className="mt-2 text-[16px] leading-relaxed text-stone-600">{need.body}</p>}

      {bullets && (
        <ul className={cn("mt-3", isProblem ? "space-y-1.5" : "space-y-2.5")}>
          {bullets.map((text) => (
            <li key={text} className={cn("flex gap-3 leading-snug", isProblem ? "text-[15px] font-medium" : "text-[16px]")}>
              <span
                aria-hidden="true"
                className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-sapphire/70"
              />
              {text}
            </li>
          ))}
        </ul>
      )}

      {need.quiz && <Quiz quiz={need.quiz} />}

      <div className="mt-auto pt-5">
        {isProblem ? (
          <a
            href="tel:112"
            className={cn(
              "flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-[16px] font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-primary-hover motion-reduce:transition-none",
              focusRing,
            )}
          >
            <PhoneIcon className="h-5 w-5" />
            {need.action.label}
          </a>
        ) : (
          <Link
            href={localHref(need.action.href, lang)}
            className={cn(
              "group flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ink-950 px-4 text-center text-[16px] font-semibold text-paper transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-ink-800 motion-reduce:transition-none",
              focusRing,
            )}
          >
            {need.action.label}
            <ChevronRightIcon className="h-4 w-4 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </Link>
        )}

        <p className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-stone-200 pt-4 text-[15px]">
          <span className="font-medium">{isProblem ? copy.problemDoctorPrompt : copy.doctorPrompt}</span>
          <Link
            href={localHref("/get-help?mode=doctor", lang)}
            className={cn(
              "-my-2 inline-flex min-h-11 items-center rounded font-semibold text-sapphire underline decoration-sapphire/30 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:decoration-sapphire motion-reduce:transition-none",
              focusRing,
            )}
          >
            {isProblem ? copy.problemDoctorLink : copy.doctorLink}
          </Link>
        </p>
      </div>
    </>
  );
}

/**
 * "True or false?" with one tap. The result's space is reserved up front so
 * answering never changes the panel height; the mark draws itself in.
 */
function Quiz({ quiz }: { quiz: HeroQuiz }) {
  const [choice, setChoice] = useState<boolean | null>(null);
  const answered = choice !== null;
  const right = choice === quiz.answer;
  const verdict = answered ? (right ? quiz.correct : quiz.incorrect) : longest(quiz.correct, quiz.incorrect);

  return (
    <div className="mt-4">
      <p className="text-[14px] font-medium text-stone-500">{quiz.prompt}</p>
      <p className="mt-1 text-[18px] font-semibold leading-snug">{quiz.statement}</p>

      <div role="group" aria-label={quiz.prompt} className="mt-3 grid grid-cols-2 gap-2">
        {[true, false].map((value) => {
          const isAnswer = value === quiz.answer;
          const picked = choice === value;
          return (
            <button
              key={String(value)}
              type="button"
              aria-pressed={picked}
              onClick={() => setChoice(value)}
              className={cn(
                "min-h-11 rounded-lg border text-[15px] font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none",
                !answered && "border-stone-300 bg-white hover:border-stone-400 hover:bg-stone-50",
                answered && isAnswer && "border-sapphire bg-sapphire text-white",
                // A wrong pick is amber, like the myth quiz below: red stays reserved for 112.
                answered && !isAnswer && picked && "border-amber-care/40 bg-amber-care-soft text-amber-care-hover line-through decoration-2",
                answered && !isAnswer && !picked && "border-stone-200 bg-white text-stone-400",
                focusRing,
              )}
            >
              {value ? quiz.trueLabel : quiz.falseLabel}
            </button>
          );
        })}
      </div>

      {/* Visual result; its space is reserved before answering. */}
      <p aria-hidden="true" className={cn("quiz-result mt-3 flex gap-2.5 text-[15px] leading-snug", answered && "is-shown")}>
        <ResultMark right={!answered || right} drawn={answered} />
        <span>
          <span className="font-semibold">{verdict}</span> <span className="text-stone-600">{quiz.explanation}</span>
        </span>
      </p>
      <p className="sr-only" aria-live="polite">
        {answered ? `${verdict} ${quiz.explanation}` : ""}
      </p>
    </div>
  );
}

function ResultMark({ right, drawn }: { right: boolean; drawn: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={cn("mt-px h-5 w-5 shrink-0", right ? "text-sapphire" : "text-amber-care-hover")}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="8.5" strokeWidth="1.5" className="opacity-30" />
      {right ? (
        <path d="M6 10.4 8.7 13 14 7.4" pathLength={1} className={cn("quiz-draw", drawn && "is-drawn")} />
      ) : (
        <path d="M7 7l6 6M13 7l-6 6" pathLength={1} className={cn("quiz-draw", drawn && "is-drawn")} />
      )}
    </svg>
  );
}

const longest = (a: string, b: string) => (a.length >= b.length ? a : b);
