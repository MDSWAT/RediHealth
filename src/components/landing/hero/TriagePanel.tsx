"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type FocusEvent,
  type SVGProps,
} from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ActivityIcon,
  ArrowLeftIcon,
  BookIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  HandHelpingIcon,
  PhoneIcon,
  PinIcon,
  PrescriptionIcon,
  RefreshIcon,
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
import { useCalmReducedMotion } from "@/lib/motion/tokens";

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
};

/**
 * The concept's decision tree as one instrument: "What worries you?", six
 * needs, at most three taps to an exit, and a way to a doctor on every branch.
 *
 * Every view is rendered into the same grid cell, so the panel is always as
 * tall as its tallest view: switching steps never resizes it or the hero.
 * Inactive views are `inert`, so keyboards and screen readers skip them.
 */
export function TriagePanel({ copy, alarmSigns, lang }: TriagePanelProps) {
  const [view, setView] = useState<View>("question");
  const [dir, setDir] = useState<Direction>("forward");
  // Bumped on every navigation so per-visit state (the quiz) starts fresh.
  const [visit, setVisit] = useState(0);
  const [hoveredNeed, setHoveredNeed] = useState<HeroNeedId | null>(null);
  const [lastVisitedNeed, setLastVisitedNeed] = useState<HeroNeedId | null>(null);
  const [learnQuizIndex, setLearnQuizIndex] = useState(0);
  const hasPickedLearnRef = useRef(false);

  const calmMotion = useCalmReducedMotion();
  const { available: canSpeak, speaking, isFallback, speak, stop } = useSpeech(lang);
  // No read-aloud at all in languages without a trusted voice (Albanian).
  const voiceEnabled = isVoiceEnabled(lang);
  const hasInteracted = useRef(false);

  // After a user picks or goes back, move focus to the new heading so screen
  // readers announce it. Skipped on first render so we never steal focus.
  useEffect(() => {
    if (hasInteracted.current) document.getElementById(headingId(view))?.focus({ preventScroll: true });
  }, [view]);

  const learnQuizzes = copy.needs.learn.quizzes;
  const learnQuizCount = learnQuizzes && learnQuizzes.length > 0 ? learnQuizzes.length : 1;

  const go = (next: View) => {
    hasInteracted.current = true;
    stop();
    setHoveredNeed(null);
    if (next === "learn" && learnQuizCount > 1) {
      const shouldExcludeCurrent = hasPickedLearnRef.current;
      hasPickedLearnRef.current = true;
      setLearnQuizIndex((prev) =>
        pickRandomQuizIndex(learnQuizCount, shouldExcludeCurrent ? prev : undefined),
      );
    }
    if (next !== "question") {
      setLastVisitedNeed(next);
    }
    setDir(next === "question" ? "back" : "forward");
    setView(next);
    setVisit((count) => count + 1);
  };

  const handleNextLearnQuiz = () => {
    if (learnQuizCount <= 1) return;
    stop();
    hasPickedLearnRef.current = true;
    setLearnQuizIndex((prev) => pickRandomQuizIndex(learnQuizCount, prev));
  };

  const scriptFor = (current: View): string[] => {
    if (current === "question") return toSentences([copy.question, ...HERO_NEED_ORDER.map((id) => copy.needs[id].label)]);
    const need = copy.needs[current];
    const details = current === "problem" ? alarmSigns : (need.points ?? []).map((point) => point.text);
    const activeQuiz =
      current === "learn" && need.quizzes?.length
        ? need.quizzes[learnQuizIndex % need.quizzes.length]
        : need.quiz;
    const quiz = activeQuiz ? [activeQuiz.prompt, activeQuiz.statement] : [];
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
  const progressScale = step === 2 ? 1 : 0.5;

  return (
    <section
      aria-labelledby={headingId(view)}
      className="hero-panel relative overflow-hidden rounded-2xl bg-paper text-ink-950 ring-1 ring-white/15 shadow-[0_28px_70px_-32px_rgba(2,6,23,0.78),0_4px_16px_-4px_rgba(2,6,23,0.25)] lg:ml-auto lg:max-w-[468px]"
    >

      <header className="relative flex h-14 items-center justify-between gap-3 border-b border-ink-950/[0.08] px-5 sm:h-15 sm:px-7">
        <div className="flex min-w-0 items-center gap-2.5">
          {/* Decorative 22px SVG mark: a plain img keeps the panel free of the image optimizer. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Icons/Logo.svg" alt="" width={22} height={22} className="h-[22px] w-[22px] shrink-0" />
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink-950/80">{copy.label}</span>
        </div>
        <div className="-mr-1.5 flex shrink-0 items-center">
          {/* Slot avoids layout jump when client speech capability resolves; absent in no-voice languages. */}
          {voiceEnabled && (
            <span className="flex h-11 min-w-11 items-center justify-center">
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
                  "flex h-11 min-w-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl transition-[background-color,color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none",
                  speaking
                    ? "bg-sapphire-soft px-3 text-sapphire ring-1 ring-sapphire/25"
                    : "text-ink-950/65 hover:bg-ink-950/[0.05] hover:text-ink-950",
                  focusRing,
                )}
              >
                {speaking ? (
                  <VolumeMuteIcon className="h-[19px] w-[19px] shrink-0" />
                ) : (
                  <VolumeIcon className="h-[19px] w-[19px] shrink-0" />
                )}
                {speaking && (
                  <span className="whitespace-nowrap text-xs font-semibold">
                    {copy.stopListening}
                  </span>
                )}
              </button>
            </span>
          )}
        </div>
        {/* 2px GPU-composited progress hairline */}
        <span
          aria-hidden="true"
          style={{ transform: `scaleX(${progressScale})` }}
          className="pointer-events-none absolute inset-x-0 -bottom-px h-[2px] origin-left bg-sapphire transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none"
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
              className="triage-view flex flex-col px-5 pb-4 pt-4 [grid-area:1/1] sm:px-7 sm:pb-6 sm:pt-5"
            >
              {current === "question" ? (
                <QuestionView
                  copy={copy}
                  lang={lang}
                  speaking={speaking}
                  hoveredNeed={hoveredNeed}
                  lastVisitedNeed={lastVisitedNeed}
                  calmMotion={calmMotion}
                  onHoverNeed={setHoveredNeed}
                  onChoose={go}
                />
              ) : (
                <AnswerView
                  key={active ? visit : "idle"}
                  copy={copy}
                  id={current}
                  alarmSigns={alarmSigns}
                  lang={lang}
                  quizIndex={current === "learn" ? learnQuizIndex : 0}
                  onNextQuiz={current === "learn" && learnQuizCount > 1 ? handleNextLearnQuiz : undefined}
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
 * Step 1. Clean option list with a spring-gliding sapphire follower on mouse/keyboard
 * and a calm hairline footer with the mediator portal entry.
 */
function QuestionView({
  copy,
  lang,
  speaking,
  hoveredNeed,
  lastVisitedNeed,
  calmMotion,
  onHoverNeed,
  onChoose,
}: {
  copy: HeroCopy["panel"];
  lang: Lang;
  speaking: boolean;
  hoveredNeed: HeroNeedId | null;
  lastVisitedNeed: HeroNeedId | null;
  calmMotion: boolean;
  onHoverNeed: (id: HeroNeedId | null) => void;
  onChoose: (id: HeroNeedId) => void;
}) {
  const [plate, setPlate] = useState<{ y: number; h: number; visible: boolean }>({
    y: 0,
    h: 56,
    visible: false,
  });

  const handleRowActivate = (id: HeroNeedId, buttonEl: HTMLButtonElement) => {
    const li = buttonEl.parentElement;
    if (li) {
      setPlate({ y: li.offsetTop, h: li.offsetHeight, visible: true });
    }
    onHoverNeed(id);
  };

  const handleListPointerLeave = () => {
    onHoverNeed(null);
    setPlate((prev) => ({ ...prev, visible: false }));
  };

  const handleListBlur = (event: FocusEvent<HTMLUListElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      onHoverNeed(null);
      setPlate((prev) => ({ ...prev, visible: false }));
    }
  };

  return (
    <>
      <h2
        id={headingId("question")}
        tabIndex={-1}
        className="text-balance text-lg font-bold leading-tight tracking-[-0.02em] text-ink-950 outline-none sm:text-xl"
      >
        {copy.question}
      </h2>

      <ul
        className="relative mt-2.5"
        onPointerLeave={handleListPointerLeave}
        onBlur={handleListBlur}
      >
        {/* Spring-gliding row follower (mouse hover & keyboard focus only) */}
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{ y: plate.y, opacity: plate.visible ? 1 : 0 }}
          transition={
            calmMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 440, damping: 34, mass: 0.55 }
          }
          style={{ height: plate.h }}
          className="pointer-events-none absolute -inset-x-3 top-0 z-0 rounded-xl bg-sapphire-soft"
        />

        {HERO_NEED_ORDER.map((id, index) => {
          const Icon = NEED_ICONS[id];
          const isHovered = hoveredNeed === id;
          const isPrevious = !hoveredNeed && lastVisitedNeed === id;
          const nextId = HERO_NEED_ORDER[index + 1];
          // Dissolve the row divider above/below the hovered plate so lines never cut across it.
          const hideDivider = isHovered || (hoveredNeed !== null && nextId === hoveredNeed);
          return (
            <li
              key={id}
              className={cn(
                "relative z-10 border-b transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none last:border-b-0",
                hideDivider ? "border-transparent" : "border-ink-950/[0.08]",
              )}
            >
              <button
                type="button"
                id={`triage-option-${id}`}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") {
                    handleRowActivate(id, event.currentTarget);
                  }
                }}
                onFocus={(event) => handleRowActivate(id, event.currentTarget)}
                onClick={() => onChoose(id)}
                className="press-row group relative -mx-3 flex min-h-[56px] w-[calc(100%+1.5rem)] items-center gap-3.5 rounded-xl px-3 py-2 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none sm:min-h-[58px]"
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none",
                    isHovered
                      ? "bg-sapphire text-white"
                      : isPrevious
                        ? "bg-sapphire-soft text-sapphire ring-1 ring-sapphire/25"
                        : "bg-ink-950/[0.045] text-ink-950/70",
                  )}
                >
                  <Icon className="h-[19px] w-[19px]" />
                </span>
                <span className="flex-1 text-[16px] font-medium leading-snug text-ink-950 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none">
                  {copy.needs[id].label}
                </span>
                <ChevronRightIcon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none",
                    isHovered ? "text-sapphire" : "text-ink-950/35",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto">
        <p
          className={cn(
            "mt-3 flex min-h-5 items-center text-[13px]",
            speaking ? "font-medium text-sapphire" : "text-ink-950/70",
          )}
        >
          {speaking ? copy.subtitles.speaking : copy.subtitles.default}
        </p>

        <div className="mt-3 border-t border-ink-950/[0.08] pt-2.5">
          <Link
            href={localHref("/mediatori", lang)}
            className={cn(
              "group -mx-2 flex min-h-11 w-[calc(100%+1rem)] max-w-[calc(100%+1rem)] items-center justify-between gap-2 whitespace-nowrap rounded-xl px-2 text-[14px] font-medium text-ink-950/75 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-ink-950/[0.04] hover:text-ink-950 motion-reduce:transition-none",
              focusRing,
            )}
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              <UsersIcon className="h-4 w-4 shrink-0 text-amber-care/85 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-amber-care motion-reduce:transition-none" />
              <span className="min-w-0 truncate">{copy.mediators}</span>
            </span>
            <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-950/35 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-ink-950 motion-reduce:transition-none" />
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
  quizIndex: number;
  onNextQuiz?: () => void;
  onBack: () => void;
};

function AnswerView({ copy, id, alarmSigns, lang, quizIndex, onNextQuiz, onBack }: AnswerViewProps) {
  const need = copy.needs[id];
  const isProblem = id === "problem";
  const bullets = isProblem ? alarmSigns : need.points?.map((point) => point.text);
  const activeQuiz =
    need.quizzes && need.quizzes.length > 0
      ? need.quizzes[quizIndex % need.quizzes.length]
      : need.quiz;

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className={cn(
          "group -ml-2 -my-1 inline-flex min-h-11 max-w-full items-center gap-1.5 self-start whitespace-nowrap rounded-xl px-2 text-[14px] font-medium text-stone-600 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-ink-950/[0.05] hover:text-ink-950 motion-reduce:transition-none",
          focusRing,
        )}
      >
        <ArrowLeftIcon className="h-4 w-4 shrink-0 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:-translate-x-0.5 motion-reduce:transition-none" />
        <span className="min-w-0 truncate">{copy.back}</span>
      </button>

      <h2
        id={headingId(id)}
        tabIndex={-1}
        className="mt-2 text-balance text-lg font-bold leading-tight tracking-[-0.02em] text-ink-950 outline-none sm:text-xl"
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
                className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-xs bg-sapphire/70"
              />
              {text}
            </li>
          ))}
        </ul>
      )}

      {activeQuiz && (
        <Quiz
          key={activeQuiz.statement}
          quiz={activeQuiz}
          nextQuizLabel={need.nextQuizLabel}
          onNextQuiz={onNextQuiz}
        />
      )}

      <div className="mt-auto pt-5">
        {isProblem ? (
          <a
            href="tel:112"
            className={cn(
              "flex min-h-13 max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-primary-hover motion-reduce:transition-none sm:text-[0.9375rem]",
              focusRing,
            )}
          >
            <PhoneIcon className="h-5 w-5 shrink-0" />
            <span className="min-w-0 truncate">{need.action.label}</span>
          </a>
        ) : (
          <Link
            href={localHref(need.action.href, lang)}
            className={cn(
              "group flex min-h-13 max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-ink-950 px-4 text-center text-sm font-semibold text-paper transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-ink-800 motion-reduce:transition-none sm:text-[0.9375rem]",
              focusRing,
            )}
          >
            <span className="min-w-0 truncate">{need.action.label}</span>
            <ChevronRightIcon className="arrow-travel h-4 w-4 shrink-0" />
          </Link>
        )}

        <p className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-ink-950/[0.08] pt-4 text-[15px]">
          <span className="font-medium">{isProblem ? copy.problemDoctorPrompt : copy.doctorPrompt}</span>
          <Link
            href={localHref("/medic-online", lang)}
            className={cn(
              "-my-2 inline-flex min-h-11 items-center whitespace-nowrap rounded font-semibold text-sapphire underline decoration-sapphire/30 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:decoration-sapphire motion-reduce:transition-none",
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
function Quiz({
  quiz,
  nextQuizLabel,
  onNextQuiz,
}: {
  quiz: HeroQuiz;
  nextQuizLabel?: string;
  onNextQuiz?: () => void;
}) {
  const [choice, setChoice] = useState<boolean | null>(null);
  const answered = choice !== null;
  const right = choice === quiz.answer;
  const verdict = answered ? (right ? quiz.correct : quiz.incorrect) : longest(quiz.correct, quiz.incorrect);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 text-[14px] font-medium text-stone-500">{quiz.prompt}</p>
        {onNextQuiz && nextQuizLabel && (
          <button
            type="button"
            onClick={onNextQuiz}
            className={cn(
              "group -my-2 -mr-2 inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 text-[13px] font-medium text-stone-600 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-ink-950/[0.05] hover:text-ink-950 motion-reduce:transition-none",
              focusRing,
            )}
          >
            <RefreshIcon className="h-3.5 w-3.5 shrink-0 text-stone-500 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire motion-reduce:transition-none" />
            <span>{nextQuizLabel}</span>
          </button>
        )}
      </div>
      <p className="mt-1.5 text-[18px] font-semibold leading-snug">{quiz.statement}</p>

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
                "min-h-11 min-w-0 whitespace-nowrap rounded-lg border px-2.5 text-sm font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none sm:px-3 sm:text-[0.9375rem]",
                !answered && "border-stone-300 bg-white hover:border-stone-400 hover:bg-stone-50",
                answered && isAnswer && "border-sapphire bg-sapphire text-white",
                // A wrong pick is amber, like the myth quiz below: red stays reserved for 112.
                answered && !isAnswer && picked && "border-amber-care/40 bg-amber-care-soft text-amber-care-hover line-through decoration-2",
                answered && !isAnswer && !picked && "border-stone-200 bg-white text-stone-400",
                focusRing,
              )}
            >
              <span className="block truncate">{value ? quiz.trueLabel : quiz.falseLabel}</span>
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

function pickRandomQuizIndex(count: number, excludeIndex?: number): number {
  if (count <= 1) return 0;
  if (excludeIndex === undefined || excludeIndex < 0 || excludeIndex >= count) {
    return Math.floor(Math.random() * count);
  }
  const offset = 1 + Math.floor(Math.random() * (count - 1));
  return (excludeIndex + offset) % count;
}
