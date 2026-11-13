"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type FocusEvent,
  type PointerEvent,
  type SVGProps,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
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
import { DURATION, EASE_OUT, useCalmReducedMotion } from "@/lib/motion/tokens";

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
type SubtitleTone = "neutral" | "sapphire" | "amber";
type SubtitleState = {
  key: string;
  text: string;
  tone: SubtitleTone;
};

export function TriagePanel({ copy, alarmSigns, lang }: TriagePanelProps) {
  const [view, setView] = useState<View>("question");
  const [dir, setDir] = useState<Direction>("forward");
  // Bumped on every navigation so per-visit state (the quiz) starts fresh.
  const [visit, setVisit] = useState(0);
  const [hoveredNeed, setHoveredNeed] = useState<HeroNeedId | null>(null);
  const [hoveredMediators, setHoveredMediators] = useState(false);
  const [lastVisitedNeed, setLastVisitedNeed] = useState<HeroNeedId | null>(null);
  const [idleNudge, setIdleNudge] = useState(false);

  const calmMotion = useCalmReducedMotion();
  const { available: canSpeak, speaking, isFallback, speak, stop } = useSpeech(lang);
  // No read-aloud at all in languages without a trusted voice (Albanian).
  const voiceEnabled = isVoiceEnabled(lang);
  const hasInteracted = useRef(false);

  const panelRef = useRef<HTMLElement>(null);
  const floatRef = useRef({ tx: 0, ty: 0, cx: 0, cy: 0, rafId: 0 });

  const stepFloat = useCallback(function tick() {
    const el = panelRef.current;
    const state = floatRef.current;
    if (!el) {
      state.rafId = 0;
      return;
    }

    state.cx += (state.tx - state.cx) * 0.14;
    state.cy += (state.ty - state.cy) * 0.14;

    const settledX = Math.abs(state.tx - state.cx) < 0.04;
    const settledY = Math.abs(state.ty - state.cy) < 0.04;

    if (settledX && settledY) {
      state.cx = state.tx;
      state.cy = state.ty;
      el.style.transform =
        state.tx === 0 && state.ty === 0
          ? ""
          : `translate3d(${state.cx.toFixed(2)}px, ${state.cy.toFixed(2)}px, 0)`;
      state.rafId = 0;
      return;
    }

    el.style.transform = `translate3d(${state.cx.toFixed(2)}px, ${state.cy.toFixed(2)}px, 0)`;
    state.rafId = window.requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const el = panelRef.current;
    const state = floatRef.current;
    if (calmMotion) {
      if (state.rafId) {
        window.cancelAnimationFrame(state.rafId);
        state.rafId = 0;
      }
      state.tx = 0;
      state.ty = 0;
      state.cx = 0;
      state.cy = 0;
      if (el) {
        el.style.transform = "";
        el.style.setProperty("--panel-spot-alpha", "0");
      }
    }
    return () => {
      if (state.rafId) {
        window.cancelAnimationFrame(state.rafId);
        state.rafId = 0;
      }
    };
  }, [calmMotion]);

  const handlePanelPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (calmMotion || event.pointerType !== "mouse") return;
      const el = panelRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const nx = Math.max(-0.5, Math.min(0.5, (event.clientX - rect.left) / rect.width - 0.5));
      const ny = Math.max(-0.5, Math.min(0.5, (event.clientY - rect.top) / rect.height - 0.5));

      floatRef.current.tx = nx * 11;
      floatRef.current.ty = ny * 9;

      el.style.setProperty("--panel-spot-x", `${((nx + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty("--panel-spot-y", `${((ny + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty("--panel-spot-alpha", "1");

      if (!floatRef.current.rafId) {
        floatRef.current.rafId = window.requestAnimationFrame(stepFloat);
      }
    },
    [calmMotion, stepFloat],
  );

  const handlePanelPointerLeave = useCallback(() => {
    const el = panelRef.current;
    floatRef.current.tx = 0;
    floatRef.current.ty = 0;
    if (el) {
      el.style.setProperty("--panel-spot-alpha", "0");
    }
    if (!calmMotion && !floatRef.current.rafId) {
      floatRef.current.rafId = window.requestAnimationFrame(stepFloat);
    }
  }, [calmMotion, stepFloat]);

  // After a user picks or goes back, move focus to the new heading so screen
  // readers announce it. Skipped on first render so we never steal focus.
  useEffect(() => {
    if (hasInteracted.current) document.getElementById(headingId(view))?.focus({ preventScroll: true });
  }, [view]);

  // Gentle hesitation cue: after 7s on Step 1 without picking anything, softly point to guidance.
  useEffect(() => {
    if (view !== "question" || lastVisitedNeed !== null || hoveredNeed !== null || hoveredMediators || speaking || idleNudge) {
      return;
    }
    const timer = window.setTimeout(() => setIdleNudge(true), 7000);
    return () => window.clearTimeout(timer);
  }, [view, lastVisitedNeed, hoveredNeed, hoveredMediators, speaking, idleNudge]);

  const go = (next: View) => {
    hasInteracted.current = true;
    stop();
    setIdleNudge(false);
    setHoveredNeed(null);
    setHoveredMediators(false);
    if (next !== "question") {
      setLastVisitedNeed(next);
    }
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
    setIdleNudge(false);
    if (speaking) {
      playEarcon("stop");
      stop();
    } else {
      playEarcon("start");
      speak(scriptFor(view));
    }
  };

  const handleHoverNeed = useCallback((id: HeroNeedId | null) => {
    if (id !== null) setIdleNudge(false);
    setHoveredNeed(id);
  }, []);

  const handleHoverMediators = useCallback((active: boolean) => {
    if (active) setIdleNudge(false);
    setHoveredMediators(active);
  }, []);

  const step = view === "question" ? 1 : 2;
  const progressScale = step === 2 ? 1 : hoveredNeed !== null || speaking ? 0.62 : 0.34;

  const behaviouralSubtitle: SubtitleState = speaking
    ? { key: "speaking", text: copy.subtitles.speaking, tone: "sapphire" }
    : hoveredNeed
      ? { key: `need-${hoveredNeed}`, text: copy.needs[hoveredNeed].hint, tone: "sapphire" }
      : hoveredMediators
        ? { key: "mediators", text: copy.subtitles.mediators, tone: "amber" }
        : lastVisitedNeed
          ? { key: `returned-${lastVisitedNeed}`, text: copy.subtitles.returned, tone: "sapphire" }
          : idleNudge
            ? { key: "idle", text: copy.subtitles.idle, tone: "amber" }
            : { key: "default", text: copy.subtitles.default, tone: "neutral" };

  return (
    <section
      ref={panelRef}
      aria-labelledby={headingId(view)}
      onPointerMove={handlePanelPointerMove}
      onPointerLeave={handlePanelPointerLeave}
      className="hero-panel relative overflow-hidden rounded-2xl bg-paper text-ink-950 ring-1 ring-white/15 shadow-[0_28px_70px_-32px_rgba(2,6,23,0.78),0_4px_16px_-4px_rgba(2,6,23,0.25)] lg:ml-auto lg:max-w-[468px]"
    >
      {/* Subtle pointer-reactive sheen over the warm-paper surface on desktop pointers */}
      <div
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(380px circle at var(--panel-spot-x, 50%) var(--panel-spot-y, 0%), rgba(29, 53, 87, 0.06), transparent 70%)",
        }}
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-(--panel-spot-alpha,0) transition-opacity duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:hidden"
      />

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
        {/* 2px GPU-composited progress hairline with hover anticipation */}
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
                  subtitle={behaviouralSubtitle}
                  hoveredNeed={hoveredNeed}
                  lastVisitedNeed={lastVisitedNeed}
                  idleNudge={idleNudge}
                  calmMotion={calmMotion}
                  onHoverNeed={handleHoverNeed}
                  onHoverMediators={handleHoverMediators}
                  onChoose={go}
                />
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
 * Step 1. Clean option list with a spring-gliding sapphire follower on mouse/keyboard
 * and a calm hairline footer with the mediator portal entry.
 */
function QuestionView({
  copy,
  lang,
  speaking,
  subtitle,
  hoveredNeed,
  lastVisitedNeed,
  idleNudge,
  calmMotion,
  onHoverNeed,
  onHoverMediators,
  onChoose,
}: {
  copy: HeroCopy["panel"];
  lang: Lang;
  speaking: boolean;
  subtitle: SubtitleState;
  hoveredNeed: HeroNeedId | null;
  lastVisitedNeed: HeroNeedId | null;
  idleNudge: boolean;
  calmMotion: boolean;
  onHoverNeed: (id: HeroNeedId | null) => void;
  onHoverMediators: (active: boolean) => void;
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
          className="pointer-events-none absolute -inset-x-3 top-0 z-0 rounded-xl border border-sapphire/18 bg-sapphire-soft/90 shadow-[0_8px_20px_-10px_rgba(29,53,87,0.22),inset_0_1px_0_rgba(255,255,255,0.85)]"
        />

        {HERO_NEED_ORDER.map((id, index) => {
          const Icon = NEED_ICONS[id];
          const isHovered = hoveredNeed === id;
          const isPrevious = !hoveredNeed && lastVisitedNeed === id;
          const isNudgeTarget = !hoveredNeed && idleNudge && id === "navigate";
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
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-[background-color,color,transform,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none",
                    isHovered
                      ? "translate-x-0.5 bg-sapphire text-white shadow-2xs"
                      : isNudgeTarget
                        ? "bg-amber-care-soft text-amber-care ring-1 ring-amber-care/30"
                        : isPrevious
                          ? "bg-sapphire-soft text-sapphire ring-1 ring-sapphire/25"
                          : "bg-ink-950/[0.045] text-ink-950/70",
                  )}
                >
                  <Icon className="h-[19px] w-[19px]" />
                </span>
                <span
                  className={cn(
                    "flex-1 text-[16px] font-medium leading-snug text-ink-950 transition-[color,transform] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none",
                    isHovered && "translate-x-0.5",
                  )}
                >
                  {copy.needs[id].label}
                </span>
                <ChevronRightIcon
                  className={cn(
                    "arrow-travel h-5 w-5 shrink-0 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none",
                    isHovered ? "text-sapphire" : "text-ink-950/35",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto">
        {speaking && (
          <div className="swap-in mt-3 flex min-h-5 items-center text-[13px] font-medium text-sapphire lg:hidden">
            <span>{copy.subtitles.speaking}</span>
          </div>
        )}

        <div className="mt-3 hidden min-h-5 items-center gap-2 text-[13px] text-stone-500 lg:flex">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={subtitle.key}
              // A plain line of text that hands over to the next one: the old line lifts away
              // quickly, the new one settles in on the shared tokens. No icon decorates it.
              initial={calmMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT } }}
              exit={calmMotion ? undefined : { opacity: 0, y: -4, transition: { duration: DURATION.fast * 0.75, ease: EASE_OUT } }}
              transition={calmMotion ? { duration: 0 } : undefined}
              className={cn(
                "flex min-w-0 items-center",
                subtitle.tone === "amber"
                  ? "font-medium text-amber-care-hover"
                  : subtitle.tone === "sapphire"
                    ? "font-medium text-ink-950"
                    : "text-stone-500",
              )}
            >
              <span>{subtitle.text}</span>
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="mt-3 border-t border-ink-950/[0.08] pt-2.5">
          <Link
            href={localHref("/mediatori", lang)}
            onPointerEnter={() => onHoverMediators(true)}
            onPointerLeave={() => onHoverMediators(false)}
            onFocus={() => onHoverMediators(true)}
            onBlur={() => onHoverMediators(false)}
            className={cn(
              "group -mx-2 flex min-h-11 w-[calc(100%+1rem)] max-w-[calc(100%+1rem)] items-center justify-between gap-2 whitespace-nowrap rounded-xl px-2 text-[14px] font-medium text-stone-600 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-ink-950/[0.04] hover:text-ink-950 motion-reduce:transition-none",
              focusRing,
            )}
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              <UsersIcon className="h-4 w-4 shrink-0 text-amber-care/85 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-amber-care motion-reduce:transition-none" />
              <span className="min-w-0 truncate">{copy.mediators}</span>
            </span>
            <ChevronRightIcon className="arrow-travel h-4 w-4 shrink-0 text-ink-950/35 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-ink-950 motion-reduce:transition-none" />
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

      {need.quiz && <Quiz quiz={need.quiz} />}

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
            href={localHref("/get-help?mode=doctor", lang)}
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
