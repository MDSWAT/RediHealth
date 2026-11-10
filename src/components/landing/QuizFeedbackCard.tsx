"use client";

import { useEffect, useRef, useState } from "react";
import type { HealthMyth } from "@/lib/i18n/health-myths";
import { ArrowRightIcon, VolumeIcon, VolumeMuteIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { MythDoctorHandoverButton } from "./MythDoctorHandoverButton";
import { speechEngine } from "@/lib/audio/speech-engine";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";

const SPEECH_CONFIG: Record<Lang, { lang: string; prefix: string }> = {
  ro: { lang: "ro-RO", prefix: "Explicație: " },
  en: { lang: "en-US", prefix: "Explanation: " },
  sq: { lang: "sq-AL", prefix: "Shpjegimi: " },
  it: { lang: "it-IT", prefix: "Spiegazione: " },
  hr: { lang: "hr-HR", prefix: "Objašnjenje: " },
  rom: { lang: "ro-RO", prefix: "Shpjegimos: " },
};

export interface QuizFeedbackCardProps {
  myth: HealthMyth;
  userAnswer: boolean;
  onNext: () => void;
  isLastMyth: boolean;
  /** Move focus to the verdict when it appears right after answering (the answer buttons unmount). */
  focusOnMount?: boolean;
}

/**
 * The answer, explained: rectangular sapphire/amber clinical verdict tile with
 * self-drawing SVG mark, plain-language explanation, left-ruled source footnote,
 * and handover to an online doctor or the next myth.
 */
export function QuizFeedbackCard({
  myth,
  userAnswer,
  onNext,
  isLastMyth,
  focusOnMount = false,
}: QuizFeedbackCardProps) {
  const { lang, t } = useLanguage();
  const q = t.quiz;
  const voiceEnabled = isVoiceEnabled(lang);
  const [isReadingAudio, setIsReadingAudio] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const verdictRef = useRef<HTMLParagraphElement>(null);
  const isMatch = userAnswer === myth.isTrue;

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setDrawn(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (focusOnMount) verdictRef.current?.focus({ preventScroll: true });
  }, [focusOnMount]);

  useEffect(() => {
    return () => {
      if (isReadingAudio) speechEngine.stop();
    };
  }, [isReadingAudio]);

  const handleToggleAudio = () => {
    if (isReadingAudio) {
      speechEngine.stop();
      setIsReadingAudio(false);
      return;
    }
    const { lang: voiceLang, prefix } = SPEECH_CONFIG[lang] ?? SPEECH_CONFIG.ro;
    setIsReadingAudio(true);
    speechEngine.speak(`${prefix}${myth.explanation}`, {
      lang: voiceLang,
      rate: 0.95,
      onEnd: () => setIsReadingAudio(false),
      onError: () => setIsReadingAudio(false),
    });
  };

  return (
    <div className="mt-6 border-t border-border pt-5 transition-[opacity,transform] duration-(--dur-base) ease-(--ease-out-calm) starting:translate-y-2 starting:opacity-0 motion-reduce:transition-none">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span
            aria-hidden="true"
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
              isMatch
                ? "border-sapphire-border bg-sapphire-soft text-sapphire"
                : "border-amber-care-border bg-amber-care-soft text-amber-care-hover",
            )}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="10" cy="10" r="8.25" strokeWidth="1.4" className="opacity-25" />
              {isMatch ? (
                <path
                  d="M6 10.4 8.7 13 14 7.4"
                  pathLength={1}
                  className={cn("quiz-draw", drawn && "is-drawn")}
                />
              ) : (
                <path
                  d="M7 7l6 6M13 7l-6 6"
                  pathLength={1}
                  className={cn("quiz-draw", drawn && "is-drawn")}
                />
              )}
            </svg>
          </span>
          <div>
            <p
              ref={verdictRef}
              tabIndex={-1}
              className="text-base font-semibold leading-snug text-foreground outline-none"
            >
              {isMatch ? q.correctAnswerTag : myth.statusTag}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {q.yourSelectedAnswer} {userAnswer ? q.trueButton : q.falseButton}
            </p>
          </div>
        </div>

        {voiceEnabled && (
          <button
            type="button"
            onClick={handleToggleAudio}
            aria-pressed={isReadingAudio}
            aria-label={isReadingAudio ? q.stopAudioAria : q.listenAudioAria}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire motion-reduce:transition-none",
              isReadingAudio
                ? "border-sapphire bg-sapphire text-white"
                : "border-border bg-card text-sapphire hover:border-sapphire/40 hover:bg-sapphire-soft",
            )}
          >
            {isReadingAudio ? <VolumeMuteIcon className="h-4 w-4" /> : <VolumeIcon className="h-4 w-4" />}
            <span className="hidden sm:inline">{isReadingAudio ? q.stopAudioLabel : q.listenAudioLabel}</span>
          </button>
        )}
      </div>

      <p className="mt-4 text-pretty text-base leading-relaxed text-foreground">{myth.explanation}</p>

      {/* Left-ruled clinical source footnote */}
      <p className="mt-3.5 border-l-2 border-sapphire/35 pl-3 text-sm leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground/85">{q.sourcePrefix}</span> {myth.source}
      </p>

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <MythDoctorHandoverButton mythId={myth.id} mythStatement={myth.statement} />
        <button
          type="button"
          onClick={onNext}
          className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-sapphire px-5 text-sm font-semibold text-white shadow-(--hairline-refraction) transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          <span>{isLastMyth ? q.restartFirstMyth : q.nextMyth}</span>
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-(--dur-fast) ease-(--ease-out-calm) group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </button>
      </div>
    </div>
  );
}
