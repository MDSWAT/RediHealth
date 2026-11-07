"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ComponentType, type SVGProps } from "react";
import Link from "next/link";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  ActivityIcon,
  ArrowLeftIcon,
  BookIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  PhoneIcon,
  PinIcon,
  PrescriptionIcon,
  VolumeIcon,
  VolumeMuteIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { HERO_NEED_ORDER, localHref, type HeroCopy, type HeroNeedId } from "@/lib/i18n/hero-copy";
import type { Lang } from "@/lib/i18n/translations";
import { HeartbeatMark } from "./HeartbeatMark";

const NEED_ICONS: Record<HeroNeedId, ComponentType<SVGProps<SVGSVGElement>>> = {
  learn: BookIcon,
  risk: ClipboardCheckIcon,
  problem: ActivityIcon,
  prescription: PrescriptionIcon,
  navigate: PinIcon,
};

const SPEECH_LANG: Record<Lang, string> = { en: "en-GB", ro: "ro-RO", sq: "sq-AL", it: "it-IT" };

const TOTAL_STEPS = 2;

const stepTransition = { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

const hasSpeechSynthesis = () => typeof window !== "undefined" && "speechSynthesis" in window;
// Speech support never changes during a session, so there is nothing to subscribe to.
const subscribeNever = () => () => {};

type TriagePanelProps = {
  copy: HeroCopy["panel"];
  alarmSigns: string[];
  lang: Lang;
};

/**
 * The concept's decision tree as one instrument: "What worries you?", five
 * needs, and at most three taps to an exit. Every branch ends with a way to
 * reach a doctor; the problem branch puts the alarm signs and 112 first.
 */
export function TriagePanel({ copy, alarmSigns, lang }: TriagePanelProps) {
  const [needId, setNeedId] = useState<HeroNeedId | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const canSpeak = useSyncExternalStore(subscribeNever, hasSpeechSynthesis, () => false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasInteracted = useRef(false);

  const need = needId ? copy.needs[needId] : null;
  const step = need ? 2 : 1;

  const stopSpeaking = () => {
    if (hasSpeechSynthesis()) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  // Keep the external speech engine in sync: a language change or unmount
  // cancels reading. The utterance's onend/onerror callbacks reset `speaking`.
  useEffect(() => {
    return () => {
      if (hasSpeechSynthesis()) window.speechSynthesis.cancel();
    };
  }, [lang]);

  // After a user picks or goes back, move focus to the new heading so screen
  // readers announce the step. Skipped on first render to avoid stealing focus.
  useEffect(() => {
    if (hasInteracted.current) headingRef.current?.focus({ preventScroll: true });
  }, [needId]);

  const choose = (id: HeroNeedId | null) => {
    hasInteracted.current = true;
    stopSpeaking();
    setNeedId(id);
  };

  const toggleSpeech = () => {
    if (speaking) return stopSpeaking();

    const text = need
      ? [need.title, need.body, ...(needId === "problem" ? alarmSigns : (need.points ?? []).map((p) => p.text))].join(". ")
      : [copy.question, ...HERO_NEED_ORDER.map((id) => copy.needs[id].label)].join(". ");

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LANG[lang];
    utterance.rate = 0.92;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-labelledby="triage-heading"
        className="relative rounded-[20px] bg-paper text-ink-950 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_30px_80px_-20px_rgba(2,6,23,0.65)] ring-1 ring-white/10"
      >
        <header className="flex items-center justify-between gap-3 px-6 pt-5 sm:px-7">
          <div className="flex items-center gap-2.5">
            <HeartbeatMark className="h-5 w-[60px]" />
            <span className="text-[14px] font-medium text-stone-600">{copy.label}</span>
          </div>
          {canSpeak && (
            <button
              type="button"
              onClick={toggleSpeech}
              aria-pressed={speaking}
              aria-label={speaking ? copy.stopListening : copy.listen}
              title={speaking ? copy.stopListening : copy.listen}
              className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-200/70 hover:text-ink-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {speaking ? <VolumeMuteIcon className="h-5 w-5" /> : <VolumeIcon className="h-5 w-5" />}
            </button>
          )}
        </header>

        <div className="mt-4 flex gap-1.5 px-6 sm:px-7" aria-hidden="true">
          {Array.from({ length: TOTAL_STEPS }, (_, index) => (
            <span key={index} className="h-[3px] flex-1 overflow-hidden rounded-full bg-stone-200">
              <span
                className={cn(
                  "block h-full origin-left rounded-full bg-primary transition-transform duration-300 ease-out motion-reduce:transition-none",
                  index < step ? "scale-x-100" : "scale-x-0",
                )}
              />
            </span>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          {copy.step(step, TOTAL_STEPS)}
        </p>

        <div className="relative min-h-[392px] px-6 pb-6 pt-6 sm:px-7 sm:pb-7">
          <AnimatePresence mode="wait" initial={false}>
            {!need || !needId ? (
              <motion.div
                key="question"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={stepTransition}
              >
                <h2
                  id="triage-heading"
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-[22px] font-semibold leading-tight tracking-tight outline-none sm:text-[24px]"
                >
                  {copy.question}
                </h2>

                <ul className="mt-5 border-t border-stone-200">
                  {HERO_NEED_ORDER.map((id) => {
                    const Icon = NEED_ICONS[id];
                    return (
                      <li key={id} className="border-b border-stone-200">
                        <button
                          type="button"
                          onClick={() => choose(id)}
                          className="group -mx-3 flex min-h-[60px] w-[calc(100%+1.5rem)] items-center gap-4 rounded-xl px-3 py-3 text-left transition-colors hover:bg-stone-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                        >
                          <Icon
                            className={cn(
                              "h-[22px] w-[22px] shrink-0 transition-colors",
                              id === "problem" ? "text-primary" : "text-sapphire group-hover:text-ink-950",
                            )}
                          />
                          <span className="flex-1 text-[16px] font-medium leading-snug">{copy.needs[id].label}</span>
                          <ChevronRightIcon className="h-5 w-5 shrink-0 text-stone-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ink-950 motion-reduce:transition-none" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            ) : (
              <motion.div
                key={needId}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={stepTransition}
                className="flex min-h-[344px] flex-col"
              >
                <button
                  type="button"
                  onClick={() => choose(null)}
                  className="-ml-2 inline-flex min-h-10 items-center gap-1.5 self-start rounded-lg px-2 text-[14px] font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-ink-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  {copy.back}
                </button>

                <h2
                  id="triage-heading"
                  ref={headingRef}
                  tabIndex={-1}
                  className="mt-3 text-[22px] font-semibold leading-tight tracking-tight outline-none sm:text-[24px]"
                >
                  {need.title}
                </h2>
                <p className="mt-2 text-[16px] leading-relaxed text-stone-600">{need.body}</p>

                {needId === "problem" ? (
                  <ul className="mt-4 space-y-2">
                    {alarmSigns.map((sign) => (
                      <li key={sign} className="border-l-2 border-primary pl-3 text-[15px] font-medium leading-snug">
                        {sign}
                      </li>
                    ))}
                  </ul>
                ) : need.points?.some((point) => point.label) ? (
                  <dl className="mt-4 space-y-2.5">
                    {need.points.map((point) => (
                      <div key={point.text} className="flex gap-3 text-[15px] leading-snug">
                        <dt className="w-[4.5rem] shrink-0 font-semibold text-sapphire">{point.label}</dt>
                        <dd className="text-ink-950">{point.text}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  need.points && (
                    <ul className="mt-4 space-y-2.5">
                      {need.points.map((point) => (
                        <li key={point.text} className="flex gap-3 text-[15px] leading-snug text-ink-950">
                          <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-sapphire/70" />
                          {point.text}
                        </li>
                      ))}
                    </ul>
                  )
                )}

                <div className="mt-auto pt-6">
                  {needId === "problem" ? (
                    <div className="flex flex-col gap-2.5">
                      <a
                        href="tel:112"
                        className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary text-[16px] font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        <PhoneIcon className="h-5 w-5" />
                        {need.action.label}
                      </a>
                      <Link
                        href={localHref("/get-help?mode=doctor", lang)}
                        className="flex min-h-12 items-center justify-center rounded-xl border border-stone-300 bg-white px-4 text-center text-[15px] font-semibold text-ink-950 transition-colors hover:border-stone-400 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        {copy.problemDoctorLink}
                      </Link>
                    </div>
                  ) : (
                    <>
                      <Link
                        href={localHref(need.action.href, lang)}
                        className="flex min-h-12 items-center justify-center rounded-xl bg-ink-950 px-4 text-[16px] font-semibold text-paper transition-colors hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        {need.action.label}
                      </Link>
                      <p className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-stone-200 pt-4 text-[15px]">
                        <span className="font-medium text-ink-950">{copy.doctorPrompt}</span>
                        <Link
                          href={localHref("/get-help?mode=doctor", lang)}
                          className="rounded font-semibold text-sapphire underline decoration-sapphire/30 underline-offset-4 transition-colors hover:decoration-sapphire focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          {copy.doctorLink}
                        </Link>
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </MotionConfig>
  );
}
