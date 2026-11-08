"use client";

import { useEffect, useRef, useState } from "react";
import type { HealthMyth } from "@/lib/i18n/health-myths";
import { ArrowRightIcon, ShieldIcon, VolumeIcon, VolumeMuteIcon } from "@/components/ui/icons";
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
 * The answer, explained: verdict, the explanation in plain words, its source,
 * and the two ways on (ask a doctor, next myth). Part of the quiz card, not a
 * card of its own; it fades in once (CSS @starting-style), static under
 * reduced motion.
 */
export function QuizFeedbackCard({ myth, userAnswer, onNext, isLastMyth, focusOnMount = false }: QuizFeedbackCardProps) {
  const { lang, t } = useLanguage();
  const q = t.quiz;
  const voiceEnabled = isVoiceEnabled(lang);
  const [isReadingAudio, setIsReadingAudio] = useState(false);
  const verdictRef = useRef<HTMLParagraphElement>(null);
  const isMatch = userAnswer === myth.isTrue;

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
    <div className="mt-6 border-t border-border pt-5 transition-[opacity,transform] duration-[240ms] ease-[cubic-bezier(0.25,1,0.5,1)] starting:translate-y-2 starting:opacity-0 motion-reduce:transition-none">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              isMatch ? "bg-live-sage-soft text-live-sage" : "bg-amber-care-soft text-amber-care-hover",
            )}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {isMatch ? <path d="M5 12.5 9.5 17 19 7" /> : <path d="M7 7l10 10M17 7 7 17" />}
            </svg>
          </span>
          <div>
            <p ref={verdictRef} tabIndex={-1} className="text-base font-semibold leading-snug text-foreground outline-none">
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
              "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire",
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

      <p className="mt-4 text-base leading-relaxed text-foreground">{myth.explanation}</p>

      <p className="mt-3 flex items-start gap-1.5 text-sm leading-relaxed text-muted-foreground">
        <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-sapphire" />
        <span>
          {q.verifiedClarification} · {q.sourcePrefix} {myth.source}
        </span>
      </p>

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <MythDoctorHandoverButton mythId={myth.id} mythStatement={myth.statement} />
        <button
          type="button"
          onClick={onNext}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-sapphire px-5 text-sm font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-none"
        >
          {isLastMyth ? q.restartFirstMyth : q.nextMyth}
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
