"use client";

import { useMemo, useState } from "react";
import Model, { type IExerciseData, type IMuscleStats, type Muscle } from "react-body-highlighter";
import { Button } from "@/components/ui/Button";
import { AlertCircleIcon, ArrowLeftIcon, ArrowRightIcon, RefreshIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n/language-context";
import { healthCheckTranslations, type HealthCheckTranslations, type PartId, type Severity, type Duration, type Urgency, type ResultKey } from "@/lib/i18n/health-check-translations";

const bodyPartIds: PartId[] = ["head", "chest", "stomach", "back", "arm", "leg"];

type BodyView = "anterior" | "posterior";
const partMuscles: Record<PartId, Partial<Record<BodyView, Muscle[]>>> = {
  head: { anterior: ["head", "neck"], posterior: ["head", "neck"] },
  chest: { anterior: ["chest"] },
  stomach: { anterior: ["abs", "obliques"] },
  back: { posterior: ["trapezius", "upper-back", "lower-back"] },
  arm: {
    anterior: ["biceps", "front-deltoids", "forearm"],
    posterior: ["triceps", "back-deltoids", "forearm"],
  },
  leg: {
    anterior: ["quadriceps", "adductor"],
    posterior: ["hamstring", "calves", "gluteal", "abductors"],
  },
};

const muscleToPart: Partial<Record<Muscle, PartId>> = Object.entries(partMuscles).reduce(
  (acc, [part, views]) => {
    Object.values(views).forEach((muscles) => {
      muscles?.forEach((muscle) => {
        acc[muscle] = part as PartId;
      });
    });
    return acc;
  },
  {} as Partial<Record<Muscle, PartId>>,
);

const severityOptions: Severity[] = ["mild", "moderate", "severe"];
const durationOptions: Duration[] = ["today", "days", "weeks"];

const extraSymptomsByPart: Record<PartId, string[]> = {
  head: ["head_fever", "head_nausea", "head_light", "head_vision"],
  chest: ["chest_breath", "chest_radiate", "chest_heartbeat"],
  stomach: ["stomach_fever", "stomach_vomit", "stomach_blood"],
  back: ["back_numbness", "back_difficulty", "back_fever"],
  arm: ["arm_swelling", "arm_numbness", "arm_cantmove"],
  leg: ["leg_swelling", "leg_numbness", "leg_cantbear"],
};

const redFlagsByPart: Record<PartId, string[]> = {
  head: ["head_vision"],
  chest: ["chest_breath", "chest_radiate", "chest_heartbeat"],
  stomach: ["stomach_blood"],
  back: ["back_numbness"],
  arm: ["arm_cantmove"],
  leg: ["leg_cantbear"],
};

type ExtraQuestion = { key: string; options: string[] };

// part-specific follow-up questions (ids only — text comes from healthCheckTranslations)
const partQuestions: Record<PartId, ExtraQuestion[]> = {
  head: [
    { key: "location", options: ["head_loc_one_side", "head_loc_both_sides", "head_loc_behind_eyes", "head_loc_back_head"] },
    { key: "character", options: ["head_char_throbbing", "head_char_dull", "head_char_sharp", "head_char_pressure"] },
    { key: "trigger", options: ["head_trig_stress", "head_trig_screen", "head_trig_water", "head_trig_none"] },
  ],
  chest: [
    { key: "character", options: ["chest_char_sharp", "chest_char_tight", "chest_char_burning"] },
    { key: "trigger", options: ["chest_trig_activity", "chest_trig_rest", "chest_trig_eating"] },
  ],
  stomach: [
    { key: "location", options: ["stomach_loc_upper", "stomach_loc_lower", "stomach_loc_allover"] },
    { key: "character", options: ["stomach_char_cramping", "stomach_char_burning", "stomach_char_sharp"] },
  ],
  back: [
    { key: "location", options: ["back_loc_upper", "back_loc_lower"] },
    { key: "trigger", options: ["back_trig_lifting", "back_trig_gradual"] },
  ],
  arm: [
    { key: "trigger", options: ["limb_trig_injury", "limb_trig_gradual"] },
    { key: "character", options: ["limb_char_aching", "limb_char_sharp", "limb_char_numbness"] },
  ],
  leg: [
    { key: "trigger", options: ["limb_trig_injury", "limb_trig_gradual"] },
    { key: "character", options: ["limb_char_aching", "limb_char_sharp", "limb_char_numbness"] },
  ],
};

type PatternContext = {
  severity: Severity | null;
  duration: Duration | null;
  symptoms: string[];
  extras: Record<string, string>;
};

type CriticalPattern = {
  when: (ctx: PatternContext) => boolean;
  resultKey: ResultKey;
};

// combinations of answers that should always escalate to urgent, regardless of the general urgency scoring
const criticalPatternsByPart: Partial<Record<PartId, CriticalPattern[]>> = {
  head: [
    {
      when: (c) => c.severity === "severe" && c.duration === "today" && c.extras.character === "head_char_sharp",
      resultKey: "head_sudden_severe",
    },
    {
      when: (c) => c.symptoms.includes("head_fever") && c.symptoms.includes("head_light") && c.severity !== "mild",
      resultKey: "head_fever_light",
    },
  ],
  chest: [
    {
      when: (c) => c.severity === "severe" && c.extras.trigger === "chest_trig_rest",
      resultKey: "chest_rest_severe",
    },
  ],
  stomach: [
    {
      when: (c) =>
        c.extras.location === "stomach_loc_lower" &&
        c.extras.character === "stomach_char_sharp" &&
        (c.symptoms.includes("stomach_fever") || c.symptoms.includes("stomach_vomit") || c.severity === "severe"),
      resultKey: "stomach_appendicitis",
    },
    {
      when: (c) => c.extras.location === "stomach_loc_allover" && c.severity === "severe" && c.symptoms.includes("stomach_fever"),
      resultKey: "stomach_severe_widespread",
    },
  ],
  back: [
    {
      when: (c) => c.symptoms.includes("back_fever") && c.severity !== "mild",
      resultKey: "back_fever",
    },
    {
      when: (c) => c.symptoms.includes("back_difficulty") && c.severity === "severe",
      resultKey: "back_severe_difficulty",
    },
  ],
  arm: [
    {
      when: (c) => c.symptoms.includes("arm_swelling") && c.severity !== "mild" && c.duration === "today",
      resultKey: "arm_sudden_swelling",
    },
  ],
  leg: [
    {
      when: (c) => c.symptoms.includes("leg_swelling") && c.severity !== "mild" && c.duration === "today",
      resultKey: "leg_sudden_swelling",
    },
  ],
};

function findCriticalPattern(part: PartId, ctx: PatternContext): CriticalPattern | null {
  return criticalPatternsByPart[part]?.find((pattern) => pattern.when(ctx)) ?? null;
}

function getResultKey(
  part: PartId,
  urgency: Urgency,
  extras: Record<string, string>,
  symptoms: string[],
  duration: Duration | null,
  criticalPattern: CriticalPattern | null,
): ResultKey | null {
  const has = (symptom: string) => symptoms.includes(symptom);

  if (criticalPattern) return criticalPattern.resultKey;

  if (part === "head") {
    if (extras.location === "head_loc_one_side" && extras.character === "head_char_throbbing" && (has("head_nausea") || has("head_light"))) {
      return "head_migraine";
    }
    if (extras.location === "head_loc_both_sides" && extras.character === "head_char_pressure") return "head_tension";
    if (extras.trigger === "head_trig_water") return "head_dehydration";
    if (has("head_fever")) return "head_fever";
  }

  if (part === "chest") {
    if (urgency === "high") return "chest_warning";
    if (extras.character === "chest_char_tight" && extras.trigger === "chest_trig_activity") return "chest_exertion";
    if (extras.character === "chest_char_burning" && extras.trigger === "chest_trig_eating") return "chest_reflux";
  }

  if (part === "stomach") {
    const lowerSharp = extras.location === "stomach_loc_lower" && extras.character === "stomach_char_sharp";
    if (lowerSharp) return "stomach_lower_sharp";
    if (extras.location === "stomach_loc_upper" && extras.character === "stomach_char_burning") return "stomach_upper_reflux";
    if (extras.location === "stomach_loc_upper" && extras.character === "stomach_char_sharp") return "stomach_upper_sharp";
    if (extras.character === "stomach_char_cramping" && (has("stomach_fever") || has("stomach_vomit"))) return "stomach_cramping_fever";
    if (extras.character === "stomach_char_cramping") return "stomach_cramping_mild";
  }

  if (part === "back") {
    if (extras.location === "back_loc_lower" && extras.trigger === "back_trig_lifting") return "back_strain_lift";
    if (extras.trigger === "back_trig_gradual" && duration === "weeks") return "back_chronic";
  }

  if (part === "arm" || part === "leg") {
    if (urgency === "high") return part === "arm" ? "arm_fracture" : "leg_fracture";
    if (extras.trigger === "limb_trig_injury" && extras.character === "limb_char_sharp") {
      return part === "arm" ? "arm_sprain" : "leg_sprain";
    }
    if (extras.character === "limb_char_numbness") return part === "arm" ? "arm_numbness" : "leg_numbness";
  }

  return null;
}

type Step = "select" | "questions" | "result";

export function HealthCheckExplorer() {
  const { lang } = useLanguage();
  const t = healthCheckTranslations[lang];

  const [step, setStep] = useState<Step>("select");
  const [part, setPart] = useState<PartId | null>(null);
  const [subStep, setSubStep] = useState(0);
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [duration, setDuration] = useState<Duration | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [extras, setExtras] = useState<Record<string, string>>({});

  const subStepKeys = useMemo(
    () => (part ? ["severity", "duration", ...partQuestions[part].map((q) => q.key), "symptoms"] : []),
    [part],
  );
  const currentKey = subStepKeys[subStep];

  const criticalPattern = useMemo(
    () => (part ? findCriticalPattern(part, { severity, duration, symptoms, extras }) : null),
    [part, severity, duration, symptoms, extras],
  );

  const urgency: Urgency = useMemo(() => {
    if (!part) return "low";
    const hasRedFlag = symptoms.some((symptom) => redFlagsByPart[part].includes(symptom));
    if (hasRedFlag || severity === "severe" || criticalPattern) return "high";
    if (severity === "moderate" || duration === "weeks" || symptoms.length > 0) return "medium";
    return "low";
  }, [part, severity, duration, symptoms, criticalPattern]);

  const resultKey = useMemo(
    () => (part ? getResultKey(part, urgency, extras, symptoms, duration, criticalPattern) : null),
    [part, urgency, extras, symptoms, duration, criticalPattern],
  );

  const specificResult = useMemo(() => {
    if (!part) return null;
    const fallback = t.urgency[urgency];
    const text = resultKey ? t.resultText[resultKey] : fallback;
    return { title: text.title, intro: text.intro, tips: t.selfCareTips[part] };
  }, [part, urgency, resultKey, t]);

  const canProceed = useMemo(() => {
    if (!part || !currentKey) return false;
    if (currentKey === "severity") return Boolean(severity);
    if (currentKey === "duration") return Boolean(duration);
    if (currentKey === "symptoms") return true;
    return Boolean(extras[currentKey]);
  }, [part, currentKey, severity, duration, extras]);

  function selectPart(id: PartId) {
    setPart(id);
    setSubStep(0);
    setStep("questions");
  }

  function toggleSymptom(symptom: string) {
    setSymptoms((current) =>
      current.includes(symptom) ? current.filter((s) => s !== symptom) : [...current, symptom],
    );
  }

  function goNext() {
    if (subStep < subStepKeys.length - 1) {
      setSubStep((s) => s + 1);
    } else {
      setStep("result");
    }
  }

  function goBack() {
    if (subStep === 0) {
      setStep("select");
    } else {
      setSubStep((s) => s - 1);
    }
  }

  function reset() {
    setStep("select");
    setPart(null);
    setSubStep(0);
    setSeverity(null);
    setDuration(null);
    setSymptoms([]);
    setExtras({});
  }


  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <p className="text-sm font-semibold text-primary">{t.ui.tapWhereItHurts}</p>
        <BodyDiagram selected={part} onSelect={selectPart} t={t} />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {part ? `${t.ui.selectedPrefix}${t.bodyParts[part]}` : t.ui.chooseBodyArea}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        {step === "select" ? (
          <div className="flex h-full min-h-[16rem] flex-col items-center justify-center text-center text-muted-foreground">
            <p>{t.ui.tapToBegin}</p>
          </div>
        ) : null}

        {step === "questions" && part && currentKey ? (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t.ui.questionOf(subStep + 1, subStepKeys.length)}
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${((subStep + 1) / subStepKeys.length) * 100}%` }}
                />
              </div>
            </div>

            <div key={subStep} className="hc-step min-h-[14rem]">
              {currentKey === "severity" ? (
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{t.ui.severityQuestion}</h2>
                  <div className="mt-3 grid gap-2">
                    {severityOptions.map((option) => (
                      <label
                        key={option}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm text-foreground transition-colors hover:bg-muted",
                          severity === option && "border-primary bg-primary-soft",
                        )}
                      >
                        <input
                          type="radio"
                          name="severity"
                          className="h-4 w-4 accent-[var(--color-primary)]"
                          checked={severity === option}
                          onChange={() => setSeverity(option)}
                        />
                        {t.severity[option]}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {currentKey === "duration" ? (
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{t.ui.durationQuestion}</h2>
                  <div className="mt-3 grid gap-2">
                    {durationOptions.map((option) => (
                      <label
                        key={option}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm text-foreground transition-colors hover:bg-muted",
                          duration === option && "border-primary bg-primary-soft",
                        )}
                      >
                        <input
                          type="radio"
                          name="duration"
                          className="h-4 w-4 accent-[var(--color-primary)]"
                          checked={duration === option}
                          onChange={() => setDuration(option)}
                        />
                        {t.duration[option]}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {currentKey === "symptoms" ? (
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{t.ui.symptomsQuestion}</h2>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {extraSymptomsByPart[part].map((symptom) => (
                      <label
                        key={symptom}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm text-foreground transition-colors hover:bg-muted",
                          symptoms.includes(symptom) && "border-primary bg-primary-soft",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[var(--color-primary)]"
                          checked={symptoms.includes(symptom)}
                          onChange={() => toggleSymptom(symptom)}
                        />
                        {t.labels[symptom]}
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {(() => {
                const question = partQuestions[part].find((q) => q.key === currentKey);
                if (!question) return null;
                return (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{t.questionText[part][question.key]}</h2>
                    <div className="mt-3 grid gap-2">
                      {question.options.map((option) => (
                        <label
                          key={option}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm text-foreground transition-colors hover:bg-muted",
                            extras[question.key] === option && "border-primary bg-primary-soft",
                          )}
                        >
                          <input
                            type="radio"
                            name={question.key}
                            className="h-4 w-4 accent-[var(--color-primary)]"
                            checked={extras[question.key] === option}
                            onChange={() => setExtras((current) => ({ ...current, [question.key]: option }))}
                          />
                          {t.labels[option]}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" size="lg" variant="outline" onClick={goBack}>
                <ArrowLeftIcon className="h-5 w-5" />
                {t.ui.backButton}
              </Button>
              <Button type="button" size="lg" disabled={!canProceed} onClick={goNext}>
                {subStep < subStepKeys.length - 1 ? t.ui.next : t.ui.seeResult}
                <ArrowRightIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : null}

        {step === "result" && part && specificResult ? (
          <div className="space-y-6">
            <div
              className={cn(
                "rounded-xl border p-5",
                urgency === "high" && "border-primary/40 bg-primary-soft",
                urgency === "medium" && "border-border bg-muted",
                urgency === "low" && "border-border bg-muted/60",
              )}
            >
              <div className="flex items-start gap-3">
                {urgency !== "low" ? (
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary text-white">
                    <AlertCircleIcon className="h-5 w-5" />
                  </span>
                ) : null}
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {specificResult.title}
                  </h2>
                  <p className="mt-1 text-base leading-relaxed text-muted-foreground">
                    {specificResult.intro}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-foreground">{t.ui.thingsThatMayHelp}</h3>
              <ul className="mt-3 space-y-2">
                {specificResult.tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              {t.ui.disclaimer}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="/get-help" size="lg">
                {t.ui.requestMediatorHelp}
              </Button>
              <Button type="button" size="lg" variant="outline" onClick={reset}>
                <RefreshIcon className="h-5 w-5" />
                {t.ui.startOver}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function BodyDiagram({
  selected,
  onSelect,
  t,
}: {
  selected: PartId | null;
  onSelect: (id: PartId) => void;
  t: HealthCheckTranslations;
}) {
  const [view, setView] = useState<BodyView>("anterior");

  const highlightedMuscles = selected ? partMuscles[selected][view] : undefined;
  const data: IExerciseData[] = highlightedMuscles?.length
    ? [{ name: "Selected", muscles: highlightedMuscles }]
    : [];

  function handleModelClick({ muscle }: IMuscleStats) {
    const part = muscleToPart[muscle];
    if (part) onSelect(part);
  }

  return (
    <div>
      <div className="mx-auto mt-4 flex w-fit rounded-full border border-border bg-muted p-1">
        {(["anterior", "posterior"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setView(option)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              view === option ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option === "anterior" ? t.ui.front : t.ui.back}
          </button>
        ))}
      </div>

      <Model
        data={data}
        type={view}
        bodyColor="var(--color-muted)"
        highlightedColors={["var(--color-primary)"]}
        onClick={handleModelClick}
        style={{ width: "100%", maxWidth: "14rem", margin: "0.5rem auto 0" }}
      />

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {bodyPartIds.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              if (!partMuscles[id][view]) {
                setView(view === "anterior" ? "posterior" : "anterior");
              }
              onSelect(id);
            }}
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted",
              selected === id && "border-primary bg-primary-soft text-primary",
            )}
          >
            {t.bodyParts[id]}
          </button>
        ))}
      </div>
    </div>
  );
}
