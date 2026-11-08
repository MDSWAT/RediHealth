"use client";

import { CheckCircleIcon } from "@/components/ui/icons";
import { UniversalDoctorExit } from "@/components/health-assistant/UniversalDoctorExit";
import { type RiskLevel, useAssistantCopy } from "@/components/health-assistant/assistant-copy";

interface PathwayRiskProps {
  step: 2 | 3;
  answers: {
    q1?: boolean;
    q2?: boolean;
    q3?: boolean;
  };
  onAnswer: (question: "q1" | "q2" | "q3", value: boolean) => void;
  plainLanguage: boolean;
  onQuickResolve?: () => void;
}

const QUESTION_IDS = ["q1", "q2", "q3"] as const;

const LEVEL_TONE: Record<RiskLevel, { bar: string; text: string }> = {
  low: { bar: "bg-sapphire", text: "text-sapphire dark:text-sapphire-border" },
  moderate: { bar: "bg-amber-care", text: "text-amber-care" },
  high: { bar: "bg-primary", text: "text-primary" },
};

export function PathwayRisk({ step, answers, onAnswer, plainLanguage, onQuickResolve }: PathwayRiskProps) {
  const { risk } = useAssistantCopy();

  const yesCount = QUESTION_IDS.filter((id) => answers[id]).length;
  const level: RiskLevel = yesCount >= 2 ? "high" : yesCount === 1 ? "moderate" : "low";
  const anyAnswered = QUESTION_IDS.some((id) => answers[id] !== undefined);

  if (step === 2) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-foreground">{risk.heading}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{risk.lead}</p>

        {/* Shown only before any answer, so "low risk" never contradicts a Yes already given. */}
        {!anyAnswered ? (
          <div className="mt-5 flex flex-col gap-3 rounded-lg bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{risk.quickTitle}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">{risk.quickBody}</p>
            </div>
            <button
              type="button"
              onClick={onQuickResolve}
              className="min-h-[44px] shrink-0 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted"
            >
              {risk.quickButton}
            </button>
          </div>
        ) : null}

        <ol className="mt-5 divide-y divide-border border-y border-border">
          {QUESTION_IDS.map((id, idx) => {
            const q = risk.questions[id];
            const current = answers[id];
            const labelId = `risk-${id}-label`;
            return (
              <li key={id} className="py-4">
                <p id={labelId} className="text-base leading-relaxed text-foreground">
                  <span className="mr-1.5 font-semibold tabular-nums text-muted-foreground">{idx + 1}.</span>
                  <span className="font-semibold">{q.title}.</span> {plainLanguage ? q.plainText : q.text}
                </p>
                <div role="group" aria-labelledby={labelId} className="mt-3 grid grid-cols-2 gap-3 sm:max-w-xs">
                  {([true, false] as const).map((value) => {
                    const selected = current === value;
                    return (
                      <button
                        key={String(value)}
                        type="button"
                        data-risk-yes={value ? "" : undefined}
                        aria-pressed={selected}
                        onClick={() => onAnswer(id, value)}
                        className={`min-h-[44px] rounded-lg border text-sm font-semibold transition-colors duration-[var(--dur-fast)] ${
                          selected
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-card text-foreground hover:bg-muted"
                        }`}
                      >
                        {value ? risk.yes : risk.no}
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ol>

        {anyAnswered ? (
          <button
            type="button"
            data-risk-submit
            onClick={onQuickResolve}
            className="mt-5 min-h-[48px] w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-primary/90"
          >
            {risk.submit}
          </button>
        ) : null}
      </div>
    );
  }

  const tone = LEVEL_TONE[level];
  const filled = level === "low" ? 1 : level === "moderate" ? 2 : 3;

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">{risk.resultHeading}</h2>

      <div className="mt-4">
        <p className="flex items-baseline justify-between gap-3 text-sm text-muted-foreground">
          <span>{risk.levelLabel}</span>
          <span className={`text-base font-semibold ${tone.text}`}>{risk.levels[level]}</span>
        </p>
        <div className="mt-2 flex h-1.5 gap-1.5" aria-hidden="true">
          {[1, 2, 3].map((segment) => (
            <div key={segment} className={`flex-1 rounded-full ${segment <= filled ? tone.bar : "bg-muted"}`} />
          ))}
        </div>
      </div>

      <p className="mt-5 max-w-prose text-base leading-relaxed text-foreground">{risk.messages[level]}</p>

      <h3 className="mt-6 text-sm font-semibold text-foreground">{risk.nextHeading}</h3>
      <ul className="mt-2 space-y-2">
        {risk.nextSteps.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <UniversalDoctorExit pathway="risk" summary={risk.summary(risk.levels[level], yesCount)} />
    </div>
  );
}
