"use client";

import { useEffect, useRef, useState, type SVGProps } from "react";
import type { HealthMyth } from "@/lib/i18n/health-myths";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { MythDoctorHandoverButton } from "./MythDoctorHandoverButton";
import { useLanguage } from "@/lib/i18n/language-context";

export interface QuizFeedbackCardProps {
  myth: HealthMyth;
  userAnswer: boolean;
  onNext: () => void;
  isLastMyth: boolean;
  /** Move focus to the verdict when it appears right after answering (the answer buttons give way to static chips). */
  focusOnMount?: boolean;
}

type MarkProps = SVGProps<SVGSVGElement>;

/** A ringed verdict glyph whose stroke draws itself once, on the frame after it mounts. */
function DrawnMark({ path, ...props }: MarkProps & { path: string }) {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setDrawn(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="10" cy="10" r="8.25" strokeWidth="1.5" className="opacity-30" />
      <path d={path} pathLength={1} className={cn("quiz-draw", drawn && "is-drawn")} />
    </svg>
  );
}

/**
 * Crisp editorial reveal under the two answer chips: a self-drawing inline mark beside the
 * verdict, a concise 1–2 sentence explanation, a clean typographic source line, and a single
 * non-wrapping action row pairing the online doctor link with the next button.
 */
export function QuizFeedbackCard({
  myth,
  userAnswer,
  onNext,
  isLastMyth,
  focusOnMount = false,
}: QuizFeedbackCardProps) {
  const { t } = useLanguage();
  const q = t.quiz;
  const verdictRef = useRef<HTMLParagraphElement>(null);
  const isMatch = userAnswer === myth.isTrue;

  useEffect(() => {
    if (focusOnMount) verdictRef.current?.focus({ preventScroll: true });
  }, [focusOnMount]);

  return (
    <div className="fhs-enter mt-5 border-t border-border/90 pt-5 transition-[opacity,transform] duration-(--dur-base) ease-(--ease-out-calm) starting:translate-y-1.5 starting:opacity-0 motion-reduce:transition-none dark:border-white/15">
      <div className="flex items-center gap-2.5">
        <DrawnMark
          path={isMatch ? "M6 10.4 8.7 13 14 7.4" : "M7 7l6 6M13 7l-6 6"}
          className={cn(
            "h-5 w-5 shrink-0",
            isMatch ? "text-sapphire dark:text-sapphire-border" : "text-foreground dark:text-paper",
          )}
        />
        <p ref={verdictRef} tabIndex={-1} className="text-[17px] font-semibold leading-snug text-foreground outline-none dark:text-paper">
          {isMatch ? q.correctAnswerTag : myth.statusTag}
        </p>
      </div>

      <p className="mt-2.5 max-w-[60ch] text-pretty text-body leading-relaxed text-foreground/90 dark:text-paper/90">
        {myth.explanation}
      </p>

      <p className="mt-2 text-meta text-muted-foreground dark:text-mist">
        <span>{q.sourcePrefix}</span> {myth.source}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-1">
        <MythDoctorHandoverButton
          mythId={myth.id}
          mythStatement={myth.statement}
          className="dark:text-sapphire-border dark:decoration-sapphire-border/40 dark:hover:bg-white/10 dark:hover:text-paper dark:hover:decoration-sapphire-border dark:focus-visible:ring-paper"
        />
        <Button
          type="button"
          variant="action"
          onClick={onNext}
          className="group shrink-0 whitespace-nowrap dark:bg-paper dark:text-ink-950 dark:hover:bg-paper/90 dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink-800"
        >
          <span>{isLastMyth ? q.restartFirstMyth : q.nextMyth}</span>
          <ArrowRightIcon className="h-4 w-4 shrink-0 transition-transform duration-(--dur-fast) ease-(--ease-out-calm) group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </Button>
      </div>
    </div>
  );
}
