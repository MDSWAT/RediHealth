"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type FocusEvent,
  type PointerEvent,
  type SVGProps,
} from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { ListenButton } from "@/components/ui/ListenButton";
import {
  ActivityIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  HandHelpingIcon,
  PhoneIcon,
  PinIcon,
  PrescriptionIcon,
  StethoscopeIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { HERO_NEED_ORDER, localHref, type HeroCopy, type HeroNeedId } from "@/lib/i18n/hero-copy";
import type { Lang } from "@/lib/i18n/translations";
import { toSentences, useSpeech } from "./use-speech";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { playEarcon } from "@/lib/audio/earcon";
import { useCalmReducedMotion } from "@/lib/motion/tokens";

const NEED_ICONS: Record<HeroNeedId, ComponentType<SVGProps<SVGSVGElement>>> = {
  problem: ActivityIcon,
  risk: ClipboardCheckIcon,
  doctor: StethoscopeIcon,
  nearby: PinIcon,
  prescription: PrescriptionIcon,
  navigate: HandHelpingIcon,
};

type View = "question" | HeroNeedId;
type Direction = "forward" | "back";
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
  // Bumped on every navigation so per-visit state starts fresh.
  const [visit, setVisit] = useState(0);
  const [hoveredNeed, setHoveredNeed] = useState<HeroNeedId | null>(null);
  const [lastVisitedNeed, setLastVisitedNeed] = useState<HeroNeedId | null>(null);

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

  const go = (next: View) => {
    hasInteracted.current = true;
    stop();
    setHoveredNeed(null);
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
    return toSentences([need.title, need.body ?? "", ...details]);
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
  const views: View[] = ["question", ...HERO_NEED_ORDER.filter((id) => !copy.needs[id].direct)];

  return (
    <section
      aria-labelledby={headingId(view)}
      className="hero-panel relative w-full min-w-0 overflow-hidden rounded-2xl bg-paper text-ink-950 ring-1 ring-white/15 shadow-[0_28px_70px_-32px_rgba(2,6,23,0.78),0_4px_16px_-4px_rgba(2,6,23,0.25)] lg:ml-auto lg:max-w-[468px]"
    >

      <header className="relative flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-ink-950/[0.08] px-4 py-2 sm:min-h-15 sm:flex-nowrap sm:gap-3 sm:px-7">
        <div className="flex min-w-0 items-center gap-2.5">
          {/* Decorative 22px SVG mark: a plain img keeps the panel free of the image optimizer. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Icons/Logo.svg" alt="" width={22} height={22} className="h-[22px] w-[22px] shrink-0" />
          <span className="text-body font-semibold text-ink-950/80">{copy.label}</span>
        </div>
        <div className="flex shrink-0 items-center">
          {/* Slot avoids layout jump when client speech capability resolves; absent in no-voice languages. */}
          {voiceEnabled && (
            <ListenButton
              uiLang={lang}
              isPlaying={speaking}
              onToggle={handleToggleSound}
              disabled={!canSpeak && typeof window !== "undefined" && !("speechSynthesis" in window)}
              title={
                speaking
                  ? copy.stopListening
                  : isFallback
                    ? `${copy.listen} (${copy.fallbackVoice})`
                    : copy.listen
              }
              className="border-ink-950/20 bg-paper text-ink-950 hover:border-ink-950/35 hover:bg-ink-950/[0.04] active:bg-ink-950/[0.08] dark:border-ink-950/20 dark:bg-paper dark:text-ink-950 dark:hover:bg-ink-950/[0.04] aria-[pressed=true]:bg-sapphire-soft aria-[pressed=true]:text-sapphire dark:aria-[pressed=true]:border-sapphire dark:aria-[pressed=true]:bg-sapphire-soft dark:aria-[pressed=true]:text-sapphire"
            />
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

      <div className="grid grid-cols-1 min-w-0">
        {views.map((current) => {
          const active = current === view;
          const viewDir: Direction =
            current === "question" ? (view !== "question" ? "back" : dir) : "forward";
          return (
            <div
              key={current}
              inert={!active}
              data-active={active}
              data-dir={viewDir}
              className="triage-view flex min-w-0 flex-col px-2.5 pb-4 pt-4 [grid-area:1/1] sm:px-7 sm:pb-6 sm:pt-5"
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

  const handleRowActivate = (id: HeroNeedId, rowEl: HTMLElement) => {
    const li = rowEl.parentElement;
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
        className="text-balance text-title font-bold leading-tight text-ink-950 outline-none"
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
          const need = copy.needs[id];
          const isHovered = hoveredNeed === id;
          const isPrevious = !hoveredNeed && lastVisitedNeed === id;
          const nextId = HERO_NEED_ORDER[index + 1];
          // Dissolve the row divider above/below the hovered plate so lines never cut across it.
          const hideDivider = isHovered || (hoveredNeed !== null && nextId === hoveredNeed);
          const rowClassName =
            "press-row group relative -mx-2 flex min-h-[56px] w-[calc(100%+1rem)] items-center gap-3.5 rounded-xl px-2 py-2 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none sm:-mx-3 sm:min-h-[58px] sm:w-[calc(100%+1.5rem)] sm:px-3";
          const handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
            if (event.pointerType === "mouse") {
              handleRowActivate(id, event.currentTarget);
            }
          };
          const handleFocus = (event: FocusEvent<HTMLElement>) => {
            handleRowActivate(id, event.currentTarget);
          };
          const rowInner = (
            <>
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
              <span className="min-w-0 flex-1 text-body font-medium leading-snug text-ink-950 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none">
                {need.label}
              </span>
              <ChevronRightIcon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none",
                  isHovered ? "text-sapphire" : "text-ink-950/35",
                )}
              />
            </>
          );
          return (
            <li
              key={id}
              className={cn(
                "relative z-10 border-b transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none last:border-b-0",
                hideDivider ? "border-transparent" : "border-ink-950/[0.08]",
              )}
            >
              {need.direct ? (
                <Link
                  id={`triage-option-${id}`}
                  href={localHref(need.action.href, lang)}
                  onPointerEnter={handlePointerEnter}
                  onFocus={handleFocus}
                  className={rowClassName}
                >
                  {rowInner}
                </Link>
              ) : (
                <button
                  type="button"
                  id={`triage-option-${id}`}
                  onPointerEnter={handlePointerEnter}
                  onFocus={handleFocus}
                  onClick={() => onChoose(id)}
                  className={rowClassName}
                >
                  {rowInner}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-auto">
        <p
          className={cn(
            "mt-3 flex min-h-5 items-center text-body",
            speaking ? "font-medium text-sapphire" : "text-ink-950/70",
          )}
        >
          {speaking ? copy.subtitles.speaking : copy.subtitles.default}
        </p>

        <div className="mt-3 border-t border-ink-950/[0.08] pt-2.5">
          <Link
            href={localHref("/mediatori", lang)}
            className={cn(
              "group -mx-1.5 flex min-h-11 w-[calc(100%+0.75rem)] max-w-[calc(100%+0.75rem)] items-center justify-between gap-1.5 whitespace-nowrap rounded-xl px-1 text-body font-medium text-ink-950/75 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-ink-950/[0.04] hover:text-ink-950 motion-reduce:transition-none sm:-mx-2 sm:w-[calc(100%+1rem)] sm:max-w-[calc(100%+1rem)] sm:gap-2 sm:px-2",
              focusRing,
            )}
          >
            <span className="min-w-0">{copy.mediators}</span>
            <ChevronRightIcon className="hidden h-4 w-4 shrink-0 text-ink-950/35 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-ink-950 motion-reduce:transition-none sm:inline-block" />
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
  const isDoctor = id === "doctor";
  const bullets = isProblem ? alarmSigns : need.points?.map((point) => point.text);

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className={cn(
          "group -ml-2 -my-1 inline-flex min-h-11 max-w-full items-center gap-1.5 self-start whitespace-nowrap rounded-xl px-2 text-body font-medium text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-ink-950/[0.05] hover:text-ink-950 motion-reduce:transition-none",
          focusRing,
        )}
      >
        <ArrowLeftIcon className="h-4 w-4 shrink-0 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:-translate-x-0.5 motion-reduce:transition-none" />
        <span className="min-w-0 truncate">{copy.back}</span>
      </button>

      <h2
        id={headingId(id)}
        tabIndex={-1}
        className="mt-2 text-balance text-title font-bold leading-tight text-ink-950 outline-none"
      >
        {need.title}
      </h2>

      {need.body && <p className="mt-2 text-body text-muted-foreground">{need.body}</p>}

      {bullets && (
        <ul className={cn("mt-3", isProblem ? "space-y-1.5" : "space-y-2.5")}>
          {bullets.map((text) => (
            <li key={text} className={cn("flex gap-3 leading-snug", isProblem ? "text-body font-medium" : "text-body")}>
              <span
                aria-hidden="true"
                className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-xs bg-sapphire/70"
              />
              {text}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-5">
        {isProblem ? (
          <a
            href="tel:112"
            className={cn(
              "flex min-h-13 max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-4 text-body font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-primary-hover motion-reduce:transition-none",
              focusRing,
            )}
          >
            <PhoneIcon className="h-5 w-5 shrink-0" />
            <span className="min-w-0 truncate">{need.action.label}</span>
          </a>
        ) : (
          <Button
            href={localHref(need.action.href, lang)}
            variant="action"
            size="lg"
            fullWidth
            className="min-h-13 max-sm:gap-1.5 max-sm:px-2.5"
          >
            <span className="min-w-0 truncate">{need.action.label}</span>
            <ChevronRightIcon className="arrow-travel hidden h-4 w-4 shrink-0 sm:inline-block" />
          </Button>
        )}

        {!isDoctor && (
          <p className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-ink-950/[0.08] pt-4 text-body">
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
        )}
      </div>
    </>
  );
}
