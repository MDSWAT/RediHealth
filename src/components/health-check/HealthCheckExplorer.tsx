"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { findHelpHref, findHelpLinks } from "@/lib/i18n/find-help-links";
import type { InstituteCategory } from "@/lib/medical-institutes";
import { AssistantNavigation } from "@/components/health-assistant/AssistantNavigation";
import { AnatomicalBodyMap } from "@/components/health-check/AnatomicalBodyMap";
import type { BodyPartId } from "@/lib/i18n/health-check-translations";
import { getTopicForSymptom } from "@/components/health-check/SymptomToTopicMapper";
import { TriageSummaryCard, type SummaryRow } from "@/components/health-check/TriageSummaryCard";
import { useDialogFocus } from "@/components/health-check/useDialogFocus";
import { useLargeText, useReadAloud } from "@/components/health-check/readingTools";
import { COPY, type Copy } from "@/components/health-check/health-check-copy";
import { getLocalizedSubRegion, type SubRegionId } from "@/components/health-check/anatomy-3d-data";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG, withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import {
  getHealthCheckTranslations,
  type DurationId,
  type SeverityId,
  type SymptomChoice,
  type UrgencyLevel,
} from "@/lib/i18n/health-check-translations";

type Step = 1 | 2 | 3 | 4;
type Side = "Left" | "Right" | "Center";
type ForWhom = "self" | "child";

const SEVERITY_KEYS: readonly SeverityId[] = ["mild", "moderate", "severe"] as const;
const DURATION_KEYS: readonly DurationId[] = ["today", "days", "weeks", "chronic"] as const;
const BODY_PARTS: readonly BodyPartId[] = ["head", "chest", "stomach", "back", "arm", "leg"] as const;
/** Pause after a tap before moving on, so the person sees what they chose. */
const AUTO_ADVANCE_MS = 320;

// Acute surgical (appendicitis, peritonitis) and ischemic emergency presentations (DEF-18)
const ACUTE_RED_FLAG_SYMPTOM_IDS = new Set<string>([
  "stomach_lower_sharp", // Acute appendicitis / peritoneal signs in right lower quadrant
  "stomach_severe_widespread", // Acute abdomen / peritonitis
  "chest_warning", // Acute coronary syndrome / myocardial infarction
  "head_sudden_severe", // Thunderclap headache / intracranial emergency
  "back_severe_difficulty", // Cauda equina syndrome / severe neurovascular deficit
  "arm_sudden_swelling", // Sudden arm weakness: stroke until proven otherwise
  "leg_sudden_swelling", // Deep vein thrombosis / pulmonary embolism risk
]);

export function isAcuteSurgicalOrEmergency(symptom: SymptomChoice | null): boolean {
  if (!symptom) return false;
  return Boolean(symptom.isRedFlag || ACUTE_RED_FLAG_SYMPTOM_IDS.has(symptom.id));
}

/** Symptoms that need a doctor whatever the reported intensity (never "home care"). */
const MIN_CARE_BY_SYMPTOM: Record<string, UrgencyLevel> = {
  chest_exertion: "high", // possible angina: same-day assessment
  chest_stitch: "medium",
  head_fever: "medium",
  arm_numbness: "medium",
  back_chronic: "medium",
};
const CARE_RANK: Record<UrgencyLevel, number> = { low: 0, medium: 1, high: 2 };
const higher = (a: UrgencyLevel, b: UrgencyLevel) => (CARE_RANK[b] > CARE_RANK[a] ? b : a);

/**
 * Care level from the answers. Red-flag symptoms are handled separately as emergencies.
 * Every chosen symptom can raise the floor; a child is never sent to "home care" alone.
 */
export function getCareLevel(
  severity: SeverityId,
  duration: DurationId,
  symptomIds: string | string[] = [],
  forWhom: ForWhom = "self",
): UrgencyLevel {
  let level: UrgencyLevel = "low";
  if (severity === "severe") level = "high";
  else if (severity === "moderate" || duration === "weeks" || duration === "chronic") level = "medium";
  for (const id of Array.isArray(symptomIds) ? symptomIds : [symptomIds]) {
    const floor = MIN_CARE_BY_SYMPTOM[id];
    if (floor) level = higher(level, floor);
  }
  if (forWhom === "child") level = higher(level, "medium");
  return level;
}

/** Arrow keys move through a radio group and select, like native radios. */
function handleRadioKeys(e: ReactKeyboardEvent<HTMLElement>) {
  const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
  if (!keys.includes(e.key)) return;
  const radios = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'));
  const i = radios.indexOf(document.activeElement as HTMLElement);
  if (i < 0) return;
  e.preventDefault();
  const next =
    e.key === "Home" ? 0 : e.key === "End" ? radios.length - 1
    : e.key === "ArrowDown" || e.key === "ArrowRight" ? (i + 1) % radios.length
    : (i - 1 + radios.length) % radios.length;
  radios[next].focus();
  radios[next].click();
}

const ROMANIAN_POINT_LABEL = "Punct ales pe corp";

function useSafeLanguage(): Lang {
  let contextLang: Lang = DEFAULT_LANG;
  try {
    const ctx = useLanguage();
    contextLang = ctx?.lang || DEFAULT_LANG;
  } catch {
    contextLang = DEFAULT_LANG;
  }
  return contextLang;
}

/** One answer in a single-choice question: full-width, plain text, a real radio. */
function OptionRow({
  checked,
  onSelect,
  title,
  description,
  note,
  badge,
  compact = false,
  focusable = false,
}: {
  checked: boolean;
  /** `byPointer` is true for a real tap or click (not keyboard), which may move on automatically. */
  onSelect: (byPointer: boolean) => void;
  title: string;
  description?: string;
  note?: ReactNode;
  /** Short tag shown on the title line (e.g. the urgency marker), so it costs no extra row. */
  badge?: ReactNode;
  compact?: boolean;
  /** Roving tab stop: only one radio per group is in the Tab order. */
  focusable?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={checked || focusable ? 0 : -1}
      onClick={(e: ReactMouseEvent<HTMLButtonElement>) => onSelect(e.detail > 0)}
      className={`flex w-full items-start gap-3 rounded-lg border bg-card text-left transition-[border-color,box-shadow,background-color] duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 ${
        compact ? "min-h-11 px-3 py-2.5" : "min-h-12 px-3.5 py-3"
      } ${
        checked
          ? "border-sapphire shadow-[inset_0_0_0_1px_var(--color-sapphire)]"
          : "border-border hover:border-foreground/30 active:bg-muted"
      }`}
    >
      <span
        aria-hidden="true"
        className={`mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] ${
          checked ? "border-sapphire" : "border-foreground/60"
        }`}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-sapphire" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <span className="text-[15px] font-medium leading-snug text-foreground">{title}</span>
          {badge}
        </span>
        {description && (
          <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{description}</span>
        )}
        {note}
      </span>
    </button>
  );
}

/** "Start over" with an inline confirmation instead of a browser pop-up. */
function ResetControl({
  label,
  c,
  onConfirm,
  prominent = false,
}: {
  label: string;
  c: Copy;
  onConfirm: () => void;
  /** Result page: full-size text link instead of the small header link. */
  prominent?: boolean;
}) {
  const [asking, setAsking] = useState(false);
  const yesRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (asking) yesRef.current?.focus();
  }, [asking]);

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className={`min-h-11 font-medium underline underline-offset-4 hover:text-foreground ${
          prominent ? "text-base text-foreground" : "text-sm text-muted-foreground"
        }`}
      >
        {label}
      </button>
    );
  }
  return (
    <span role="group" aria-label={c.confirmReset} className={`inline-flex flex-wrap items-center gap-x-3 gap-y-1 ${prominent ? "text-base" : "text-sm"}`}>
      <span className="font-medium text-foreground">{c.confirmReset}</span>
      <button
        ref={yesRef}
        type="button"
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
        className="min-h-11 font-semibold text-foreground underline underline-offset-4"
      >
        {c.confirmYes}
      </button>
      <button
        type="button"
        onClick={() => setAsking(false)}
        className="min-h-11 font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        {c.confirmNo}
      </button>
    </span>
  );
}

function SpeakerIcon({ off = false }: { off?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 7.5h3l4-3.5v12l-4-3.5h-3z" />
      {off ? <path d="m13.5 8 4 4m0-4-4 4" /> : <path d="M13.5 7.2a4 4 0 0 1 0 5.6M15.6 5.2a7 7 0 0 1 0 9.6" />}
    </svg>
  );
}

export function HealthCheckExplorer() {
  const activeLang = useSafeLanguage();
  const dict = getHealthCheckTranslations(activeLang);
  const c = COPY[activeLang] ?? COPY[DEFAULT_LANG];
  const baseId = useId();

  const [step, setStep] = useState<Step>(1);
  // Direction of the last step change: the new question slides in 8px from that side. Null on first load.
  const [shownStep, setShownStep] = useState<Step>(1);
  const [stepDir, setStepDir] = useState<"forward" | "back" | null>(null);
  if (shownStep !== step) {
    setShownStep(step);
    setStepDir(step > shownStep ? "forward" : "back");
  }
  const [forWhom, setForWhom] = useState<ForWhom>("self");
  const [selectedPart, setSelectedPart] = useState<BodyPartId | null>(null);
  const [detail, setDetail] = useState<{ subRegion: SubRegionId; side: Side } | null>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomChoice | null>(null);
  const [extraSymptoms, setExtraSymptoms] = useState<SymptomChoice[]>([]);
  const [otherChosen, setOtherChosen] = useState(false);
  const [severity, setSeverity] = useState<SeverityId | null>(null);
  const [duration, setDuration] = useState<DurationId | null>(null);
  const [showEmergencyOverlay, setShowEmergencyOverlay] = useState(false);
  const [doctorOpen, setDoctorOpen] = useState(false);
  const [largeText, toggleLargeText] = useLargeText();
  const voice = useReadAloud(activeLang);

  const headerRef = useRef<HTMLElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const emergencyRef = useRef<HTMLDivElement>(null);
  const summaryFoldRef = useRef<HTMLDetailsElement>(null);
  const isFirstRender = useRef(true);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepRef = useRef<Step>(1);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);
  const answersRef = useRef({ part: false, symptom: false, emergency: false, severity: false, duration: false });

  const allSymptoms = [selectedSymptom, ...extraSymptoms].filter(Boolean) as SymptomChoice[];
  const isEmergency = allSymptoms.some((s) => isAcuteSurgicalOrEmergency(s));
  const urgentSymptom = allSymptoms.find((s) => isAcuteSurgicalOrEmergency(s)) ?? null;

  useEffect(() => {
    answersRef.current = {
      part: Boolean(selectedPart),
      symptom: Boolean(selectedSymptom),
      emergency: isEmergency,
      severity: Boolean(severity),
      duration: Boolean(duration),
    };
  });

  /*
   * History model. Every step and every open dialog is one browser-history entry, tagged with
   * its position (hcIdx) in our own stack. The phone's Back button walks the stack: it closes an
   * open dialog first, then goes to the previous question. In-app navigation backwards jumps by
   * the exact number of entries we pushed, so it never leaves the tool.
   */
  const stackRef = useRef<Step[]>([1]);
  const posRef = useRef(0);
  const pendingTargetRef = useRef<Step | null>(null);
  const modalOpenRef = useRef(false);
  useEffect(() => {
    modalOpenRef.current = showEmergencyOverlay || doctorOpen;
  }, [showEmergencyOverlay, doctorOpen]);

  useEffect(() => {
    window.history.replaceState({ ...(window.history.state ?? {}), hcStep: 1, hcIdx: 0 }, "");
    const onPop = (e: PopStateEvent) => {
      const state = (e.state ?? {}) as { hcStep?: Step; hcIdx?: number };
      const idx = typeof state.hcIdx === "number" ? state.hcIdx : 0;
      posRef.current = idx;
      const wanted = pendingTargetRef.current ?? state.hcStep ?? 1;
      pendingTargetRef.current = null;
      // Never land on a step the current answers cannot fill.
      const a = answersRef.current;
      const allowed: Step = !a.part ? 1 : !a.symptom ? 2 : a.emergency || (a.severity && a.duration) ? 4 : 3;
      const next = Math.min(wanted, allowed) as Step;
      stackRef.current = stackRef.current.slice(0, idx + 1);
      stackRef.current[idx] = next;
      if (next !== state.hcStep) {
        window.history.replaceState({ ...(window.history.state ?? {}), hcStep: next, hcIdx: idx, hcModal: false }, "");
      }
      setShowEmergencyOverlay(false);
      setDoctorOpen(false);
      setStep(next);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function pushEntry(stepValue: Step, modal = false) {
    posRef.current += 1;
    stackRef.current = stackRef.current.slice(0, posRef.current);
    stackRef.current[posRef.current] = stepValue;
    window.history.pushState(
      { ...(window.history.state ?? {}), hcStep: stepValue, hcIdx: posRef.current, hcModal: modal },
      "",
    );
  }

  function goToStep(next: Step) {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (next === step) return;
    if (next > step) {
      pushEntry(next);
      setStep(next);
      return;
    }
    // Go back to the newest entry at or below the target, then settle on the target itself.
    const stack = stackRef.current;
    let i = posRef.current - 1;
    while (i > 0 && stack[i] > next) i -= 1;
    i = Math.max(i, 0);
    const distance = posRef.current - i;
    if (distance > 0 && window.history.state?.hcIdx === posRef.current) {
      pendingTargetRef.current = next;
      window.history.go(-distance);
    } else {
      stackRef.current[posRef.current] = next;
      window.history.replaceState({ ...(window.history.state ?? {}), hcStep: next, hcIdx: posRef.current }, "");
      setStep(next);
    }
  }

  function openModal(which: "emergency" | "doctor") {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (!modalOpenRef.current) pushEntry(step, true);
    if (which === "emergency") setShowEmergencyOverlay(true);
    else setDoctorOpen(true);
  }

  function closeModal() {
    if (window.history.state?.hcModal) window.history.back();
    else {
      setShowEmergencyOverlay(false);
      setDoctorOpen(false);
    }
  }

  useDialogFocus(emergencyRef, showEmergencyOverlay, closeModal);

  // An emergency result shows the doctor summary unfolded; otherwise the fold is the person's choice.
  useEffect(() => {
    if (step === 4 && summaryFoldRef.current && answersRef.current.emergency) summaryFoldRef.current.open = true;
  }, [step]);

  /** A tap on a single-choice answer moves on by itself; keyboard users keep control. */
  function advanceSoon(from: Step) {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null;
      if (stepRef.current !== from || modalOpenRef.current) return;
      pushEntry((from + 1) as Step);
      setStep((from + 1) as Step);
    }, AUTO_ADVANCE_MS);
  }
  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    voice.stop();
    // Bring the new question into view and move focus to it without a scroll jump (DEF-24).
    const header = headerRef.current;
    if (header) {
      // Site chrome pinned to the top (emergency bar, header) covers part of the screen.
      let covered = 0;
      document.querySelectorAll<HTMLElement>("body > *, body > * > *, aside, header").forEach((el) => {
        const pos = getComputedStyle(el).position;
        if (pos !== "sticky" && pos !== "fixed") return;
        const r = el.getBoundingClientRect();
        if (r.height > 0 && r.top <= 1 && r.bottom < window.innerHeight / 2) covered = Math.max(covered, r.bottom);
      });
      const top = header.getBoundingClientRect().top;
      if (top < covered || top > window.innerHeight * 0.5) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: window.scrollY + top - covered - 8, behavior: reduce ? "auto" : "smooth" });
      }
    }
    stepHeadingRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs on step change only
  }, [step]);

  function handleSelectPart(partId: BodyPartId) {
    if (partId !== selectedPart) {
      // A new complaint starts clean: no answers carried over from the previous area.
      setSelectedSymptom(null);
      setExtraSymptoms([]);
      setOtherChosen(false);
      setSeverity(null);
      setDuration(null);
    }
    setSelectedPart(partId);
  }

  function handleSelectFromBody(partId: BodyPartId) {
    // On later steps the body is context; a tap there means "change the area".
    if (step > 1) goToStep(1);
    // A tap that names only the area clears an older exact point; a precise tap sets a new one right after.
    setDetail(null);
    handleSelectPart(partId);
  }

  function handleSelectFromList(partId: BodyPartId, byPointer: boolean) {
    setDetail(null);
    handleSelectPart(partId);
    if (byPointer) advanceSoon(1);
  }

  function handleSelectSymptom(symptom: SymptomChoice, byPointer: boolean) {
    setOtherChosen(false);
    setSelectedSymptom(symptom);
    setExtraSymptoms((prev) => prev.filter((s) => s.id !== symptom.id));
    if (isAcuteSurgicalOrEmergency(symptom)) openModal("emergency");
    else if (byPointer) advanceSoon(2);
  }

  function toggleExtra(symptom: SymptomChoice) {
    const adding = !extraSymptoms.some((s) => s.id === symptom.id);
    setExtraSymptoms((prev) => (adding ? [...prev, symptom] : prev.filter((s) => s.id !== symptom.id)));
    if (adding && isAcuteSurgicalOrEmergency(symptom)) openModal("emergency");
  }

  function handleReset() {
    if (step === 1) return;
    // "Start over" never walks the browser history, so it can never leave the page. Later Back
    // presses land on old entries, which the popstate guard clamps to step 1.
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    stackRef.current[posRef.current] = 1;
    window.history.replaceState({ ...(window.history.state ?? {}), hcStep: 1, hcIdx: posRef.current, hcModal: false }, "");
    setStep(1);
    setForWhom("self");
    setSelectedPart(null);
    setDetail(null);
    setSelectedSymptom(null);
    setExtraSymptoms([]);
    setOtherChosen(false);
    setSeverity(null);
    setDuration(null);
    setShowEmergencyOverlay(false);
  }

  const goBack = () => goToStep((step > 1 ? step - 1 : 1) as Step);

  // Emergency signs first, so they are never hidden under the action bar.
  const symptomsList = [...(selectedPart ? dict.symptoms[selectedPart] || [] : [])].sort(
    (a, b) => Number(isAcuteSurgicalOrEmergency(b)) - Number(isAcuteSurgicalOrEmergency(a)),
  );
  const extraCandidates = symptomsList.filter((s) => s.id !== selectedSymptom?.id);
  const topicMapping = selectedPart
    ? getTopicForSymptom(selectedPart, selectedSymptom?.id, activeLang)
    : null;
  const careLevel =
    severity && duration ? getCareLevel(severity, duration, allSymptoms.map((s) => s.id), forWhom) : null;

  const stepTitles = [dict.ui.step1Title, dict.ui.step2Title, dict.ui.step3Title, dict.ui.step4Title];
  const questions = [dict.ui.step1Question, dict.ui.step2Question, dict.ui.step3Question, dict.ui.step4Question];
  const prompts = [dict.ui.step1Prompt, dict.ui.step2Prompt, dict.ui.step3Prompt, dict.ui.step4Prompt];
  const stepIndicatorText = dict.ui.stepIndicator.replace("{current}", String(step)).replace("{total}", "4");

  const detailLabel =
    detail && selectedPart
      ? `${getLocalizedSubRegion(detail.subRegion, activeLang).label}${
          detail.side === "Left" ? `, ${c.left}` : detail.side === "Right" ? `, ${c.right}` : ""
        }`
      : null;
  const areaLabel = selectedPart ? dict.bodyParts[selectedPart].title : null;

  const canContinue =
    (step === 1 && Boolean(selectedPart)) ||
    (step === 2 && Boolean(selectedSymptom)) ||
    (step === 3 && Boolean(severity && duration));
  const blockedHint = step === 1 ? c.pickArea : step === 2 ? c.pickSymptom : c.pickBoth;

  const stageHeight =
    step === 1
      ? "h-[min(46dvh,440px)] min-h-[300px] lg:h-[calc(100dvh-15rem)] lg:min-h-[520px] lg:max-h-[780px]"
      : "h-40 sm:h-56 lg:h-[calc(100dvh-15rem)] lg:min-h-[520px] lg:max-h-[780px]";

  const sectionLabel = "text-sm font-semibold text-foreground";
  const secondaryBtn =
    "inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-card px-5 text-base font-medium text-foreground transition-colors hover:bg-muted";

  /* What "Listen" reads on each step: the question, then what matters on screen. */
  // One entry per recorded clip (see spoken-segments.ts), read in order.
  function spokenParts(): string[] {
    const parts = [questions[step - 1], prompts[step - 1]];
    if (step === 1) parts.push(...BODY_PARTS.map((id) => dict.bodyParts[id].title));
    if (step === 2) parts.push(...symptomsList.map((s) => s.title), c.otherTitle);
    if (step === 3) {
      parts.push(dict.ui.severityHeading, ...SEVERITY_KEYS.map((k) => dict.severity[k].title));
      parts.push(dict.ui.durationHeading, ...DURATION_KEYS.map((k) => dict.duration[k].label));
    }
    if (step === 4) {
      if (isEmergency) parts.push(dict.ui.emergency.title, dict.ui.emergency.description);
      else if (careLevel) parts.push(dict.urgency[careLevel].title, dict.urgency[careLevel].intro);
      if (forWhom === "child") parts.push(c.childNote);
    }
    return parts.filter(Boolean);
  }

  type Dict = ReturnType<typeof getHealthCheckTranslations>;
  function findIn(d: Dict, symptom: SymptomChoice | null) {
    return symptom && selectedPart ? d.symptoms[selectedPart]?.find((x) => x.id === symptom.id) ?? null : null;
  }

  function doctorNotes(d: Dict, child: string): string[] {
    const notes: string[] = [];
    // The symptom row already carries the clinical wording; notes add only what it lacks.
    const urgent = findIn(d, urgentSymptom);
    if (isEmergency && urgent) notes.push(`${d.ui.urgentBadge}: ${urgent.label || urgent.title}.`);
    else if (careLevel) notes.push(d.urgency[careLevel].title);
    if (forWhom === "child") notes.push(child);
    return notes;
  }

  function romanianSummary(): { rows: SummaryRow[]; notes: string[] } {
    const ro = getHealthCheckTranslations("ro");
    const rows: SummaryRow[] = [
      ...(forWhom === "child" ? [{ label: "Pentru", value: COPY.ro.childRow }] : []),
      { label: ro.ui.areaLabel, value: selectedPart ? ro.bodyParts[selectedPart].title : "" },
      ...(detail
        ? [{
            label: ROMANIAN_POINT_LABEL,
            value: `${getLocalizedSubRegion(detail.subRegion, "ro").label}${detail.side === "Left" ? ", stânga" : detail.side === "Right" ? ", dreapta" : ""}`,
          }]
        : []),
      {
        label: ro.ui.symptomLabel,
        value: allSymptoms.map((s) => findIn(ro, s)?.label || findIn(ro, s)?.title || "").join("; "),
      },
      ...(severity ? [{ label: ro.ui.intensityLabel, value: ro.severity[severity].title }] : []),
      ...(duration ? [{ label: ro.ui.durationLabel, value: ro.duration[duration].label }] : []),
    ];
    return { rows, notes: doctorNotes(ro, COPY.ro.childRow) };
  }

  const places = findHelpLinks(activeLang);
  // A plain link to the map of nearby places, opened on the kind of place this result calls for.
  const placeLink = (category: InstituteCategory, label: string) => (
    <Link
      href={withLangPrefix(findHelpHref(category), activeLang)}
      className="mt-2 flex min-h-11 items-center gap-2 py-2 text-base font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground"
    >
      <PinIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {label}
    </Link>
  );

  const doctorLinks = (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <Link href={withLangPrefix("/medic-online?source=triage", activeLang)} className={secondaryBtn}>
        {c.doctorBook}
      </Link>
      <Link href={withLangPrefix("/medic-online?queue=now&source=triage", activeLang)} className={secondaryBtn}>
        {c.doctorNow}
      </Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl">
      <AssistantNavigation />

      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {`${stepIndicatorText}: ${stepTitles[step - 1]}`}
      </div>

      <header ref={headerRef} className="scroll-mt-4 pb-4 sm:pb-6">
        <div className="flex items-baseline justify-between gap-x-4 gap-y-1 sm:flex-wrap sm:gap-x-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl">
            {dict.ui.heading}
          </h1>
          <div className="flex shrink-0 flex-wrap items-baseline justify-end gap-x-5">
            <button
              type="button"
              onClick={toggleLargeText}
              aria-pressed={largeText}
              className={`min-h-11 text-sm font-medium underline-offset-4 hover:text-foreground ${
                largeText ? "text-foreground underline" : "text-muted-foreground"
              }`}
            >
              <span aria-hidden="true" className="font-semibold sm:mr-1">A+</span>
              <span className="sr-only sm:not-sr-only">{c.largeText}</span>
            </button>
          </div>
        </div>
        {step === 1 && (
          <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">{dict.ui.subtitle}</p>
        )}

        <div className="mt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{stepIndicatorText}</span>
              <span aria-hidden="true"> · </span>
              {stepTitles[step - 1]}
            </p>
            {step > 1 && step < 4 && <ResetControl label={dict.ui.resetButton} c={c} onConfirm={handleReset} />}
          </div>
          <ol aria-label={stepIndicatorText} className="mt-2 grid grid-cols-4 gap-1.5">
            {stepTitles.map((title, i) => (
              <li
                key={title}
                aria-current={i + 1 === step ? "step" : undefined}
                className={`h-1 rounded-full transition-colors duration-[var(--dur-base)] ${
                  i + 1 <= step ? "bg-foreground" : "bg-border"
                }`}
              >
                <span className="sr-only">{title}</span>
              </li>
            ))}
          </ol>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-x-10 gap-y-5 lg:grid-cols-12">
        {/* The body stays mounted across steps: one WebGL context, the selection travels with you. */}
        <section
          aria-label={dict.ui.viewer3D.subModelInfo}
          className={`lg:col-span-7 lg:row-span-2 lg:sticky lg:top-[calc(var(--chrome-h,0px)+1rem)] lg:self-start ${
            step === 4 ? "hidden lg:block" : ""
          }`}
        >
          <AnatomicalBodyMap
            selectedPart={selectedPart}
            onSelectPart={handleSelectFromBody}
            selectedSubRegion={detail?.subRegion ?? null}
            selectedSide={detail?.side ?? "Center"}
            onSelectDetailedAnatomy={(_part, subRegion, side) => setDetail({ subRegion, side })}
            lang={activeLang}
            stageClassName={`-mx-5 w-[calc(100%+2.5rem)] sm:mx-0 sm:w-full sm:rounded-lg sm:border sm:border-border ${stageHeight}`}
            toolsClassName={step === 1 ? "" : "hidden lg:block"}
            controlsClassName={step === 1 ? "flex" : "hidden lg:flex"}
            decorative={step > 1}
            selectionLabel={step === 1 ? areaLabel : null}
          />
        </section>

        <section aria-labelledby={`${baseId}-q`} className="min-w-0 lg:col-span-5">
          <div key={step} className={stepDir ? "hc-step" : undefined} data-dir={stepDir ?? undefined}>
          <h2
            id={`${baseId}-q`}
            ref={stepHeadingRef}
            tabIndex={-1}
            className="text-xl font-semibold leading-tight tracking-tight text-foreground text-balance outline-none sm:text-[22px]"
          >
            {questions[step - 1]}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{prompts[step - 1]}</p>

          {((step > 1 && step < 4 && areaLabel) || voice.available) && (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {step > 1 && step < 4 && areaLabel && (
                <span className="inline-flex flex-wrap items-baseline gap-x-2">
                  <span>
                    {c.area}: <span className="font-medium text-foreground">{areaLabel}</span>
                    {forWhom === "child" && <span> · {c.childRow}</span>}
                  </span>
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="min-h-10 font-medium text-foreground underline underline-offset-4 sm:min-h-0"
                  >
                    {c.change}
                  </button>
                </span>
              )}
              {voice.available && (
                <button
                  type="button"
                  onClick={() => (voice.speaking ? voice.stop() : voice.speak(spokenParts()))}
                  aria-pressed={voice.speaking}
                  className="inline-flex min-h-10 items-center gap-1.5 font-medium text-foreground underline underline-offset-4 sm:min-h-8"
                >
                  <SpeakerIcon off={voice.speaking} />
                  {voice.speaking ? c.stopListening : c.listen}
                </button>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="mt-4 space-y-4">
              <fieldset>
                <legend id={`${baseId}-who`} className={`${sectionLabel} mb-2`}>{c.forWhom}</legend>
                <div
                  role="radiogroup"
                  aria-labelledby={`${baseId}-who`}
                  onKeyDown={handleRadioKeys}
                  className="grid grid-cols-2 gap-2"
                >
                  <OptionRow checked={forWhom === "self"} onSelect={() => setForWhom("self")} title={c.forSelf} compact />
                  <OptionRow checked={forWhom === "child"} onSelect={() => setForWhom("child")} title={c.forChild} compact />
                </div>
              </fieldset>

              <div>
                <p className={`${sectionLabel} mb-2 lg:hidden`}>{c.orList}</p>
                <div
                  role="radiogroup"
                  aria-labelledby={`${baseId}-q`}
                  onKeyDown={handleRadioKeys}
                  className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-1"
                >
                  {BODY_PARTS.map((id) => (
                    <OptionRow
                      key={id}
                      checked={selectedPart === id}
                      focusable={!selectedPart && id === BODY_PARTS[0]}
                      onSelect={(byPointer) => handleSelectFromList(id, byPointer)}
                      title={dict.bodyParts[id].title}
                      description={dict.bodyParts[id].subtitle}
                      compact
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mt-4">
              <div role="radiogroup" aria-labelledby={`${baseId}-q`} onKeyDown={handleRadioKeys} className="space-y-1.5">
                {symptomsList.map((symptom, index) => {
                  const urgent = isAcuteSurgicalOrEmergency(symptom);
                  return (
                    <OptionRow
                      key={symptom.id}
                      checked={!otherChosen && selectedSymptom?.id === symptom.id}
                      focusable={!selectedSymptom && !otherChosen && index === 0}
                      onSelect={(byPointer) => handleSelectSymptom(symptom, byPointer)}
                      title={symptom.title}
                      description={symptom.description}
                      badge={
                        urgent ? (
                          <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-primary">
                            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {dict.ui.urgentBadge}
                          </span>
                        ) : null
                      }
                    />
                  );
                })}
                <OptionRow
                  checked={otherChosen}
                  onSelect={() => {
                    if (advanceTimer.current) clearTimeout(advanceTimer.current);
                    setOtherChosen(true);
                    setSelectedSymptom(null);
                    setExtraSymptoms([]);
                  }}
                  title={c.otherTitle}
                  description={c.otherDescription}
                />
              </div>

              {otherChosen && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-base text-foreground">{c.otherBody}</p>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Link href={withLangPrefix("/health-assistant", activeLang)} className={secondaryBtn}>
                      {c.otherAssistant}
                    </Link>
                    <Link href={withLangPrefix("/medic-online?source=triage", activeLang)} className={secondaryBtn}>
                      {c.otherDoctor}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="mt-4 space-y-5">
              <fieldset>
                <legend id={`${baseId}-sev`} className={`${sectionLabel} mb-2`}>{dict.ui.severityHeading}</legend>
                <div role="radiogroup" aria-labelledby={`${baseId}-sev`} onKeyDown={handleRadioKeys} className="space-y-2">
                  {SEVERITY_KEYS.map((key) => (
                    <OptionRow
                      key={key}
                      checked={severity === key}
                      focusable={!severity && key === SEVERITY_KEYS[0]}
                      onSelect={() => setSeverity(key)}
                      title={dict.severity[key].title}
                      description={dict.severity[key].description}
                      compact
                    />
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend id={`${baseId}-dur`} className={`${sectionLabel} mb-2`}>{dict.ui.durationHeading}</legend>
                <div role="radiogroup" aria-labelledby={`${baseId}-dur`} onKeyDown={handleRadioKeys} className="grid grid-cols-2 gap-2">
                  {DURATION_KEYS.map((key) => (
                    <OptionRow
                      key={key}
                      checked={duration === key}
                      focusable={!duration && key === DURATION_KEYS[0]}
                      onSelect={() => setDuration(key)}
                      title={dict.duration[key].label}
                      compact
                    />
                  ))}
                </div>
              </fieldset>
              {extraCandidates.length > 0 && (
                <fieldset>
                  <legend className={sectionLabel}>{c.alsoFeel}</legend>
                  <p className="mb-2 text-sm text-muted-foreground">{c.alsoFeelHint}</p>
                  <div className="space-y-2">
                    {extraCandidates.map((symptom) => {
                      const checked = extraSymptoms.some((s) => s.id === symptom.id);
                      return (
                        <label
                          key={symptom.id}
                          className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border bg-card px-3.5 py-3 transition-colors ${
                            checked ? "border-sapphire shadow-[inset_0_0_0_1px_var(--color-sapphire)]" : "border-border hover:border-foreground/30"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleExtra(symptom)}
                            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-sapphire)]"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-base font-medium leading-snug text-foreground">{symptom.title}</span>
                            {isAcuteSurgicalOrEmergency(symptom) && (
                              <span className="mt-1 block text-sm font-medium text-primary">{dict.ui.urgentBadge}</span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              )}
            </div>
          )}

          {step === 4 && (isEmergency || (severity && duration)) && (
            <div className="mt-5 space-y-8">
              {/* 1. The verdict */}
              {isEmergency ? (
                <div>
                  <div role="alert" className="rounded-lg bg-primary p-5 text-white">
                    <h3 className="text-lg font-semibold leading-snug">{dict.ui.emergency.title}</h3>
                    <p className="mt-1.5 text-base leading-relaxed text-white/90">{dict.ui.emergency.description}</p>
                  </div>
                  <button type="button" onClick={() => openModal("doctor")} className={`${secondaryBtn} mt-3 w-full`}>
                    {dict.ui.showDoctor}
                  </button>
                  {placeLink("hospital", places.hospital)}
                </div>
              ) : (
                careLevel && (
                  <div>
                    <h3 className="text-lg font-semibold leading-snug text-foreground text-balance">
                      {dict.urgency[careLevel].title}
                    </h3>
                    <p className="mt-1.5 text-base leading-relaxed text-foreground/85">{dict.urgency[careLevel].intro}</p>
                    {forWhom === "child" && (
                      <p className="mt-3 text-base font-medium leading-relaxed text-foreground">{c.childNote}</p>
                    )}
                    {/* 2. The one next step for this level */}
                    <div className="mt-4">
                      {careLevel === "low" && selectedSymptom?.selfCareTip ? (
                        <>
                          <h3 className="text-base font-semibold text-foreground">{c.selfCare}</h3>
                          <p className="mt-1.5 text-base leading-relaxed text-foreground/85">{selectedSymptom.selfCareTip}</p>
                          <h3 className="mt-5 text-base font-semibold text-foreground">{places.pharmacyFirst}</h3>
                          <p className="mt-1.5 text-base leading-relaxed text-foreground/85">{places.pharmacyFirstHint}</p>
                          {placeLink("pharmacy", places.nearestPharmacy)}
                        </>
                      ) : (
                        <>
                          {doctorLinks}
                          {careLevel === "low"
                            ? placeLink("pharmacy", places.pharmacyFirst)
                            : careLevel === "high"
                              ? placeLink("hospital", places.hospital)
                              : placeLink("gp", places.familyDoctor)}
                        </>
                      )}
                    </div>
                  </div>
                )
              )}

              {/* 3. Why */}
              {selectedSymptom && !isEmergency && careLevel !== "high" && (
                <div>
                  <h3 className="text-base font-semibold text-foreground">{c.meaning}</h3>
                  <p className="mt-1.5 text-base leading-relaxed text-foreground/85">
                    {selectedSymptom.guidance || selectedSymptom.description}
                  </p>
                  {topicMapping && (
                    <Link
                      href={withLangPrefix(`/health-information/${topicMapping.slug}`, activeLang)}
                      className="mt-3 block py-2.5 text-base font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground"
                    >
                      {c.readAbout}: {topicMapping.title}
                      <ArrowRightIcon className="ml-1 inline h-4 w-4 align-[-0.125em]" />
                    </Link>
                  )}
                </div>
              )}

              {/* 4. Details for the doctor, folded */}
              <details ref={summaryFoldRef} className="group border-t border-border pt-4">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-base font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                  {c.summaryFold}
                  <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-calm)] group-open:rotate-180 motion-reduce:transition-none" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m5 7.5 5 5 5-5" />
                  </svg>
                </summary>
                <TriageSummaryCard
                  bare
                  bodyArea={`${areaLabel ?? ""}${forWhom === "child" ? ` · ${c.childRow}` : ""}`}
                  anatomicalStructure={detailLabel ?? undefined}
                  symptoms={allSymptoms.map((s) => s.title)}
                  painLevel={severity ? dict.severity[severity].title : undefined}
                  duration={duration ? dict.duration[duration].label : undefined}
                  redFlagNoticed={isEmergency}
                  doctorNotes={doctorNotes(dict, c.childRow)}
                  doctorSymptom={allSymptoms.map((s) => s.label || s.title).join("; ") || undefined}
                  romanian={activeLang === "ro" ? undefined : romanianSummary()}
                  doctorOpen={doctorOpen}
                  onDoctorOpenChange={(open) => (open ? openModal("doctor") : closeModal())}
                  lang={activeLang}
                />
              </details>

              {/* Home care can still end in a doctor's call if the person wants one. */}
              {!isEmergency && careLevel === "low" && (
                <div>
                  <h3 className="text-base font-semibold text-foreground">{c.doctorTitle}</h3>
                  <p className="mb-3 mt-1 text-base text-muted-foreground">{c.doctorBody}</p>
                  {doctorLinks}
                </div>
              )}

              <p className="text-sm leading-relaxed text-muted-foreground">{dict.ui.disclaimer}</p>

              <ResetControl label={dict.ui.resetButton} c={c} onConfirm={handleReset} prominent />
            </div>
          )}
          </div>
        </section>

        {/* Action bar: pinned to the bottom of the screen while the tool is in view. */}
        <div data-sticky-actions className="sticky bottom-0 z-20 -mx-5 border-t border-border bg-background px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:mx-0 sm:px-0 lg:col-span-5 lg:col-start-8">
          {step < 4 && (
            <p className="mb-2 text-sm leading-snug text-muted-foreground" aria-live="polite">
              {isEmergency && step > 1 ? (
                <>
                  <span className="font-medium text-primary">{dict.ui.urgentBadge}.</span>{" "}
                  <button
                    type="button"
                    onClick={() => goToStep(4)}
                    className="font-medium text-foreground underline underline-offset-4"
                  >
                    {dict.ui.finishButton}
                  </button>
                </>
              ) : canContinue ? (
                <>
                  {c.chosen}:{" "}
                  <span className="font-medium text-foreground">
                    {step === 1
                      ? areaLabel
                      : step === 2
                        ? selectedSymptom?.title
                        : `${severity ? dict.severity[severity].title : ""} · ${duration ? dict.duration[duration].label : ""}`}
                  </span>
                </>
              ) : (
                blockedHint
              )}
            </p>
          )}
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-4 text-base font-medium text-foreground transition-colors hover:bg-muted"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                {dict.ui.backButton}
              </button>
            )}
            {isEmergency && step > 1 ? (
              <a
                href="tel:112"
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-base font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                <PhoneIcon className="h-5 w-5" />
                {dict.ui.emergency.call112Now}
              </a>
            ) : step < 4 ? (
              <button
                type="button"
                disabled={!canContinue}
                onClick={() => goToStep((step + 1) as Step)}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-lg bg-foreground px-5 text-base font-semibold text-white transition-[background-color,transform] duration-[var(--dur-fast)] hover:bg-ink-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-border disabled:text-muted-foreground disabled:active:scale-100"
              >
                {step === 3 ? dict.ui.finishButton : dict.ui.nextButton}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openModal("doctor")}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg bg-foreground px-5 text-base font-semibold text-white transition-colors hover:bg-ink-800"
              >
                {dict.ui.showDoctor}
              </button>
            )}
          </div>
        </div>
      </div>

      {showEmergencyOverlay && urgentSymptom && (
        <div className="hc-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
          <div
            ref={emergencyRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`${baseId}-em-title`}
            aria-describedby={`${baseId}-em-desc`}
            className="hc-sheet w-full max-w-lg rounded-t-2xl bg-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-lg sm:p-7"
          >
            <h3 id={`${baseId}-em-title`} className="text-xl font-semibold leading-snug text-foreground">
              {dict.ui.emergency.title}
            </h3>
            <p id={`${baseId}-em-desc`} className="mt-2 text-base leading-relaxed text-muted-foreground">
              {dict.ui.emergency.description}
            </p>
            <p className="mt-3 text-base text-foreground">
              <span className="font-medium">{dict.ui.emergency.whyEmergencyPrefix}</span> {urgentSymptom.title}
            </p>
            <div className="mt-6 grid gap-2 sm:grid-cols-[1fr_auto]">
              <a
                data-autofocus
                href="tel:112"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-base font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                <PhoneIcon className="h-5 w-5" />
                {dict.ui.emergency.call112Now}
              </a>
              <button type="button" onClick={closeModal} className={secondaryBtn}>
                {dict.ui.emergency.continueReview}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
