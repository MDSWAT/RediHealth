"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type SVGProps,
} from "react";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, ChevronRightIcon, CopyIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { findHelpHref, findHelpLinks } from "@/lib/i18n/find-help-links";
import type { InstituteCategory } from "@/lib/medical-institutes";
import { AssistantNavigation } from "@/components/health-assistant/AssistantNavigation";
import { AnatomicalBodyMap } from "@/components/health-check/AnatomicalBodyMap";
import {
  AbdomenRegionIcon,
  ArmsHandsRegionIcon,
  BackSpineRegionIcon,
  ChestRegionIcon,
  HeadNeckRegionIcon,
  LegsFeetRegionIcon,
  PelvisRegionIcon,
} from "@/components/health-check/ModelIcons";
import type { BodyPartId } from "@/lib/i18n/health-check-translations";
import { getTopicForSymptom } from "@/components/health-check/SymptomToTopicMapper";
import { TriageSummaryCard, type SummaryRow } from "@/components/health-check/TriageSummaryCard";
import { useDialogFocus } from "@/components/health-check/useDialogFocus";
import { useLargeText, useReadAloud } from "@/components/health-check/readingTools";
import { COPY, type Copy } from "@/components/health-check/health-check-copy";
import {
  FEMALE_ONLY_SUB_REGIONS,
  QUICK_SPOTS_BY_MACRO,
  SUB_REGION_INFO,
  getLocalizedSubRegion,
  type BodyAnatomyProfile,
  type LayerModeId,
  type SubRegionId,
} from "@/components/health-check/anatomy-3d-data";
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
const BODY_PARTS: readonly BodyPartId[] = ["head", "chest", "stomach", "pelvis", "back", "arm", "leg"] as const;
/** Pause after a tap before moving on, so the person sees what they chose. */
const AUTO_ADVANCE_MS = 320;

// Acute surgical (appendicitis, peritonitis, ectopic pregnancy) and ischemic emergency presentations (DEF-18)
const ACUTE_RED_FLAG_SYMPTOM_IDS = new Set<string>([
  "stomach_lower_sharp", // Acute appendicitis / peritoneal signs in right lower quadrant
  "stomach_severe_widespread", // Acute abdomen / peritonitis
  "pelvis_pregnancy_bleeding", // Ectopic pregnancy / acute gynecologic hemorrhage or infection
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
  chest_breast_lump: "medium", // new breast/underarm lump or skin change always warrants medical exam
  pelvis_one_sided: "medium", // unilateral pelvic pain warrants clinical/ultrasound evaluation
  pelvis_urinary_burning: "medium", // suspected UTI needs urinalysis / targeted care
  pelvis_pressure_floor: "medium", // pelvic floor prolapse / persistent dyspareunia warrants gynecological exam
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

const STAGE_CONTEXT_COPY: Record<Lang, { showOn3DBody: string; hide3DBody: string }> = {
  ro: { showOn3DBody: "Arată pe corpul 3D", hide3DBody: "Ascunde corpul 3D" },
  en: { showOn3DBody: "Show on 3D body", hide3DBody: "Hide 3D body" },
  sq: { showOn3DBody: "Shfaq në trupin 3D", hide3DBody: "Fshih trupin 3D" },
  it: { showOn3DBody: "Mostra sul corpo 3D", hide3DBody: "Nascondi corpo 3D" },
  hr: { showOn3DBody: "Prikaži na 3D tijelu", hide3DBody: "Sakrij 3D tijelo" },
  rom: { showOn3DBody: "Sikav pe 3D trupo", hide3DBody: "Garav o 3D trupo" },
};

const SYMPTOM_AFFINITY_BY_SUB_REGION: Partial<Record<SubRegionId, readonly string[]>> = {
  breast: ["chest_breast_lump", "chest_breast_pain"],
  axilla: ["chest_breast_lump", "chest_breast_pain", "arm_stiff_joint"],
  rib_cage: ["chest_stitch", "chest_reflux"],
  uterus_ovaries: ["pelvis_period_cramps", "pelvis_one_sided", "pelvis_pregnancy_bleeding"],
  bladder: ["pelvis_urinary_burning", "pelvis_pressure_floor"],
  pelvic_floor: ["pelvis_pressure_floor", "pelvis_urinary_burning"],
  hip_groin: ["pelvis_one_sided", "leg_joint_pain"],
  sacroiliac_coccyx: ["back_chronic", "back_muscle_strain"],
  jaw_ear: ["head_sore_throat", "head_headache"],
  hands_fingers: ["arm_stiff_joint", "arm_numbness"],
  feet_soles: ["leg_joint_pain", "leg_calf_cramp"],
};

const FEMALE_SYMPTOM_IDS = new Set<string>([
  "chest_breast_pain",
  "chest_breast_lump",
  "pelvis_period_cramps",
  "pelvis_pregnancy_bleeding",
]);

function getVisceralFocusForSymptoms(
  symptoms: readonly SymptomChoice[],
  bodyProfile: BodyAnatomyProfile,
  chosenSide: Side = "Center",
): { subRegion: SubRegionId; side: Side; layer: LayerModeId } | null {
  for (const s of symptoms) {
    const id = s.id.toLowerCase();
    if (id === "chest_breast_pain" || id === "chest_breast_lump") {
      return { subRegion: "breast", side: chosenSide, layer: "hybrid" };
    }
    if (id === "pelvis_pregnancy_bleeding" || id === "pelvis_period_cramps") {
      return { subRegion: "uterus_ovaries", side: "Center", layer: "organs" };
    }
    if (id === "pelvis_one_sided") {
      const side = chosenSide !== "Center" ? chosenSide : "Right";
      return bodyProfile === "female"
        ? { subRegion: "uterus_ovaries", side, layer: "organs" }
        : { subRegion: "hip_groin", side, layer: "hybrid" };
    }
    if (id === "pelvis_urinary_burning") {
      return { subRegion: "bladder", side: "Center", layer: "organs" };
    }
    if (id === "pelvis_pressure_floor") {
      return { subRegion: "pelvic_floor", side: "Center", layer: "hybrid" };
    }
    if (id === "chest_warning") return { subRegion: "heart", side: "Left", layer: "organs" };
    if (id === "chest_exertion") return { subRegion: "heart", side: "Center", layer: "organs" };
    if (id === "chest_stitch" || /cough|breath|lung|respir/.test(id)) {
      return { subRegion: "lungs", side: "Center", layer: "organs" };
    }
    if (id === "chest_reflux" || id === "stomach_upper_reflux") {
      return { subRegion: "stomach_organ", side: "Center", layer: "organs" };
    }
    if (id === "stomach_lower_sharp") return { subRegion: "colon", side: "Right", layer: "organs" };
    if (id === "stomach_cramping_mild" || id === "stomach_severe_widespread") {
      return { subRegion: "colon", side: "Center", layer: "organs" };
    }
    if (id === "back_severe_difficulty" || /flank|urin|kidney|renal/.test(id)) {
      return { subRegion: "kidneys", side: "Center", layer: "organs" };
    }
  }
  return null;
}

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

const BODY_PART_ICONS: Record<BodyPartId, ComponentType<SVGProps<SVGSVGElement>>> = {
  head: HeadNeckRegionIcon,
  chest: ChestRegionIcon,
  stomach: AbdomenRegionIcon,
  pelvis: PelvisRegionIcon,
  back: BackSpineRegionIcon,
  arm: ArmsHandsRegionIcon,
  leg: LegsFeetRegionIcon,
};

/** Anatomical region card for Step 1: icon badge, plain-language summary, and clear directional affordance. */
function AreaOptionCard({
  partId,
  checked,
  focusable = false,
  onSelect,
  title,
  description,
}: {
  partId: BodyPartId;
  checked: boolean;
  focusable?: boolean;
  onSelect: (byPointer: boolean) => void;
  title: string;
  description: string;
}) {
  const Icon = BODY_PART_ICONS[partId];
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={checked || focusable ? 0 : -1}
      onClick={(e: ReactMouseEvent<HTMLButtonElement>) => onSelect(e.detail > 0)}
      className={`group flex min-h-14 w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-[border-color,box-shadow,background-color] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 ${
        checked
          ? "border-sapphire bg-sapphire-soft/45 shadow-[inset_0_0_0_1px_var(--color-sapphire)]"
          : "border-border bg-card hover:border-sapphire/35 hover:bg-surface-card active:bg-muted"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] ${
          checked
            ? "border-sapphire bg-sapphire text-white"
            : "border-border/80 bg-surface-subtle text-sapphire group-hover:border-sapphire/25 group-hover:bg-sapphire-soft"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-snug text-foreground">{title}</span>
        <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-muted-foreground">{description}</span>
      </span>
      {checked ? (
        <span
          aria-hidden="true"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sapphire text-white"
        >
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3.5 8.5 2.8 2.8 6.2-6.6" />
          </svg>
        </span>
      ) : (
        <ChevronRightIcon
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-muted-foreground/65 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5 group-hover:text-sapphire motion-reduce:transform-none"
        />
      )}
    </button>
  );
}

/** One answer in a single-choice question: full-width, plain text, a real radio. */
function OptionRow({
  checked,
  onSelect,
  title,
  description,
  note,
  badge,
  leading,
  tone = "default",
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
  leading?: ReactNode;
  tone?: "default" | "urgent";
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
      className={`flex w-full items-start gap-3 rounded-xl border text-left transition-[border-color,box-shadow,background-color] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 ${
        compact ? "min-h-11 px-3.5 py-2.5" : "min-h-12 px-3.5 py-3"
      } ${
        checked
          ? tone === "urgent"
            ? "border-primary bg-primary-soft/45 shadow-[inset_0_0_0_1px_var(--color-primary)]"
            : "border-sapphire bg-sapphire-soft/40 shadow-[inset_0_0_0_1px_var(--color-sapphire)]"
          : tone === "urgent"
            ? "border-primary/25 bg-primary-soft/20 hover:border-primary/45 hover:bg-primary-soft/35 active:bg-primary-soft/50"
            : "border-border bg-card hover:border-sapphire/35 hover:bg-surface-card active:bg-muted"
      }`}
    >
      <span
        aria-hidden="true"
        className={`mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] ${
          checked
            ? tone === "urgent"
              ? "border-primary"
              : "border-sapphire"
            : tone === "urgent"
              ? "border-primary/65"
              : "border-foreground/45"
        }`}
      >
        {checked && (
          <span className={`h-2 w-2 rounded-full ${tone === "urgent" ? "bg-primary" : "bg-sapphire"}`} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-2 text-[15px] font-semibold leading-snug text-foreground">
            {leading}
            <span>{title}</span>
          </span>
          {badge}
        </span>
        {description && (
          <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">{description}</span>
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
  const [mobileStageOpen, setMobileStageOpen] = useState(false);
  if (shownStep !== step) {
    setShownStep(step);
    setStepDir(step > shownStep ? "forward" : "back");
    if (step === 1) setMobileStageOpen(false);
  }
  const [forWhom, setForWhom] = useState<ForWhom>("self");
  const [bodyProfile, setBodyProfile] = useState<BodyAnatomyProfile>("general");
  const [selectedPart, setSelectedPart] = useState<BodyPartId | null>(null);
  const [detail, setDetail] = useState<{ subRegion: SubRegionId; side: Side } | null>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomChoice | null>(null);
  const [extraSymptoms, setExtraSymptoms] = useState<SymptomChoice[]>([]);
  const [otherChosen, setOtherChosen] = useState(false);
  const [severity, setSeverity] = useState<SeverityId | null>(null);
  const [duration, setDuration] = useState<DurationId | null>(null);
  const [showEmergencyOverlay, setShowEmergencyOverlay] = useState(false);
  const [doctorOpen, setDoctorOpen] = useState(false);
  const [sheetCopied, setSheetCopied] = useState(false);
  // Without the 3D body (data saver, no WebGL) the tool is one column: the note, then the list.
  const [bodyShown, setBodyShown] = useState(true);
  const [largeText, toggleLargeText] = useLargeText();
  const voice = useReadAloud(activeLang);

  const headerRef = useRef<HTMLElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const emergencyRef = useRef<HTMLDivElement>(null);
  const summaryFoldRef = useRef<HTMLDetailsElement>(null);
  const isFirstRender = useRef(true);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sheetCopyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sheetSpotRaf = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (sheetCopyTimer.current) clearTimeout(sheetCopyTimer.current);
      if (sheetSpotRaf.current !== null) cancelAnimationFrame(sheetSpotRaf.current);
    };
  }, []);

  function handleSheetPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (sheetSpotRaf.current !== null) return;
    sheetSpotRaf.current = requestAnimationFrame(() => {
      sheetSpotRaf.current = null;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--spot-x", `${Math.round(clientX - rect.left)}px`);
      el.style.setProperty("--spot-y", `${Math.round(clientY - rect.top)}px`);
    });
  }
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
    if (FEMALE_SYMPTOM_IDS.has(symptom.id)) {
      setBodyProfile("female");
    }
    if (isAcuteSurgicalOrEmergency(symptom)) openModal("emergency");
    else if (byPointer) advanceSoon(2);
  }

  function toggleExtra(symptom: SymptomChoice) {
    const adding = !extraSymptoms.some((s) => s.id === symptom.id);
    setExtraSymptoms((prev) => (adding ? [...prev, symptom] : prev.filter((s) => s.id !== symptom.id)));
    if (adding && FEMALE_SYMPTOM_IDS.has(symptom.id)) {
      setBodyProfile("female");
    }
    if (adding && isAcuteSurgicalOrEmergency(symptom)) openModal("emergency");
  }

  function handleSelectQuickSpot(subRegion: SubRegionId | null) {
    if (!subRegion) {
      setDetail(null);
      return;
    }
    if (FEMALE_ONLY_SUB_REGIONS.has(subRegion)) {
      setBodyProfile("female");
    }
    setDetail((prev) => ({
      subRegion,
      side: prev?.subRegion === subRegion ? prev.side : "Center",
    }));
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
    setBodyProfile("general");
    setSelectedPart(null);
    setDetail(null);
    setSelectedSymptom(null);
    setExtraSymptoms([]);
    setOtherChosen(false);
    setSeverity(null);
    setDuration(null);
    setShowEmergencyOverlay(false);
    setMobileStageOpen(false);
  }

  const goBack = () => goToStep((step > 1 ? step - 1 : 1) as Step);

  // Emergency signs first, then symptoms matching the exact 3D spot if chosen.
  const preferredSymptomIds = detail ? SYMPTOM_AFFINITY_BY_SUB_REGION[detail.subRegion] : undefined;
  const symptomsList = [...(selectedPart ? dict.symptoms[selectedPart] || [] : [])].sort((a, b) => {
    const urgDiff = Number(isAcuteSurgicalOrEmergency(b)) - Number(isAcuteSurgicalOrEmergency(a));
    if (urgDiff !== 0) return urgDiff;
    if (preferredSymptomIds) {
      const aMatch = preferredSymptomIds.includes(a.id) ? 1 : 0;
      const bMatch = preferredSymptomIds.includes(b.id) ? 1 : 0;
      if (bMatch !== aMatch) return bMatch - aMatch;
    }
    return 0;
  });
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

  const maxReachableStep: Step = !selectedPart
    ? 1
    : !selectedSymptom
      ? 2
      : isEmergency || (severity && duration)
        ? 4
        : 3;
  const visceralFocus =
    step >= 2 ? getVisceralFocusForSymptoms(allSymptoms, bodyProfile, detail?.side ?? "Center") : null;
  const stageCopy = STAGE_CONTEXT_COPY[activeLang] ?? STAGE_CONTEXT_COPY[DEFAULT_LANG];
  const quickSpots = selectedPart
    ? QUICK_SPOTS_BY_MACRO[selectedPart].filter(
        (sub) => !(forWhom === "child" && bodyProfile !== "female" && FEMALE_ONLY_SUB_REGIONS.has(sub)),
      )
    : [];
  const activeSpotBilateral = Boolean(detail && SUB_REGION_INFO[detail.subRegion]?.bilateral);

  const SelectedAreaIcon = selectedPart ? BODY_PART_ICONS[selectedPart] : null;

  const renderExactSpotControls = () =>
    selectedPart && quickSpots.length > 0 ? (
      <div>
        <p className="text-xs font-medium text-muted-foreground">{c.exactSpot}</p>
        <div role="group" aria-label={c.exactSpot} className="mt-2 flex flex-wrap gap-1.5">
          <button
            type="button"
            aria-pressed={detail === null}
            onClick={() => handleSelectQuickSpot(null)}
            className={`inline-flex min-h-10 items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire lg:min-h-8 ${
              detail === null
                ? "border-sapphire bg-sapphire font-semibold text-white shadow-xs"
                : "border-border bg-card text-foreground hover:border-sapphire/35 hover:bg-muted/60"
            }`}
          >
            {c.exactSpotAny}
          </button>
          {quickSpots.map((sub) => {
            const active = detail?.subRegion === sub;
            const label = getLocalizedSubRegion(sub, activeLang).label;
            return (
              <button
                key={sub}
                type="button"
                aria-pressed={active}
                onClick={() => handleSelectQuickSpot(sub)}
                className={`inline-flex min-h-10 items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire lg:min-h-8 ${
                  active
                    ? "border-sapphire bg-sapphire font-semibold text-white shadow-xs"
                    : "border-border bg-card text-foreground hover:border-sapphire/35 hover:bg-muted/60"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {detail && activeSpotBilateral && (
          <div role="group" aria-label={c.sideLabel} className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">{c.sideLabel}:</span>
            <div className="inline-flex rounded-lg border border-border/80 bg-muted/75 p-0.5">
              {(
                [
                  { id: "Center", label: c.bothSides },
                  { id: "Left", label: c.left.charAt(0).toUpperCase() + c.left.slice(1) },
                  { id: "Right", label: c.right.charAt(0).toUpperCase() + c.right.slice(1) },
                ] as const
              ).map((opt) => {
                const active = detail.side === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setDetail({ subRegion: detail.subRegion, side: opt.id })}
                    className={`inline-flex min-h-9 items-center rounded-md px-2.5 text-xs font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire lg:min-h-7 ${
                      active
                        ? "bg-card font-semibold text-sapphire shadow-xs ring-1 ring-border/80"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    ) : null;

  const renderAreaContextCard = (showQuickSpots: boolean) => {
    if (!areaLabel) return null;
    const hasSpots = showQuickSpots && selectedPart && quickSpots.length > 0;
    return (
      <div className="rounded-xl border border-border/90 bg-surface-subtle/65 p-3.5">
        <div
          className={`items-center justify-between gap-3 ${
            bodyShown ? "hidden lg:flex" : "flex"
          } ${hasSpots ? "mb-3 border-b border-border/70 pb-3" : ""}`}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            {SelectedAreaIcon && (
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-card text-sapphire"
              >
                <SelectedAreaIcon className="h-4 w-4" />
              </span>
            )}
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {c.area}
                {forWhom === "child" ? ` · ${c.childRow}` : ""}
              </p>
              <p className="truncate text-sm font-semibold text-foreground">{detailLabel ?? areaLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => goToStep(1)}
            className="inline-flex min-h-9 shrink-0 items-center rounded-lg border border-border bg-card px-3 text-xs font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          >
            {c.change}
          </button>
        </div>
        {hasSpots && renderExactSpotControls()}
      </div>
    );
  };

  const stageHeight =
    step === 1
      ? "h-[min(46dvh,440px)] min-h-[300px] lg:h-[calc(100dvh-15rem)] lg:min-h-[520px] lg:max-h-[780px]"
      : "h-56 sm:h-64 lg:h-[calc(100dvh-15rem)] lg:min-h-[520px] lg:max-h-[780px]";

  const sectionLabel = "text-sm font-semibold text-foreground";
  const secondaryBtn =
    "inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-card px-5 text-base font-medium text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted";

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
  // Standalone nearby-facility row (used when there are no paired telemedicine links above it).
  const placeLink = (category: InstituteCategory, label: string) => (
    <Link
      href={withLangPrefix(findHelpHref(category), activeLang)}
      className="group mt-3 flex min-h-11 items-center justify-between gap-3 rounded-lg border border-slate-200/95 bg-[#f8f9fb] px-3.5 py-2.5 text-sm font-semibold text-obsidian-navy transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-sapphire/40 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire sm:text-[15px]"
    >
      <span className="inline-flex min-w-0 items-center gap-2.5">
        <PinIcon className="h-4 w-4 shrink-0 text-sapphire" aria-hidden="true" />
        <span className="min-w-0">{label}</span>
      </span>
      <ArrowRightIcon
        className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5 group-hover:text-sapphire motion-reduce:transition-none"
        aria-hidden="true"
      />
    </Link>
  );

  const renderRoutingStack = (placeCategory?: InstituteCategory, placeLabel?: string) => (
    <div className="space-y-2.5">
      <Link
        href={withLangPrefix("/medic-online?source=triage", activeLang)}
        className="group flex min-h-12 w-full items-center justify-between gap-3 rounded-lg bg-obsidian-navy px-4 text-[15px] font-semibold text-white shadow-2xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2"
      >
        <span>{c.doctorBook}</span>
        <ArrowRightIcon
          className="h-4 w-4 shrink-0 text-white/80 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5 group-hover:text-white motion-reduce:transition-none"
          aria-hidden="true"
        />
      </Link>

      <div className="divide-y divide-slate-200/90 overflow-hidden rounded-lg border border-slate-200/95 bg-[#f8f9fb]">
        <Link
          href={withLangPrefix("/medic-online?queue=now&source=triage", activeLang)}
          className="group flex min-h-11 items-center justify-between gap-3 px-3.5 py-2.5 text-sm font-semibold text-obsidian-navy transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sapphire sm:text-[15px]"
        >
          <span className="inline-flex min-w-0 items-center gap-2.5">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-live-sage" />
            <span className="min-w-0">{c.doctorNow}</span>
          </span>
          <ArrowRightIcon
            className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5 group-hover:text-sapphire motion-reduce:transition-none"
            aria-hidden="true"
          />
        </Link>

        {placeCategory && placeLabel && (
          <Link
            href={withLangPrefix(findHelpHref(placeCategory), activeLang)}
            className="group flex min-h-11 items-center justify-between gap-3 px-3.5 py-2.5 text-sm font-semibold text-obsidian-navy transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sapphire sm:text-[15px]"
          >
            <span className="inline-flex min-w-0 items-center gap-2.5">
              <PinIcon className="h-4 w-4 shrink-0 text-sapphire" aria-hidden="true" />
              <span className="min-w-0">{placeLabel}</span>
            </span>
            <ArrowRightIcon
              className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5 group-hover:text-sapphire motion-reduce:transition-none"
              aria-hidden="true"
            />
          </Link>
        )}
      </div>
    </div>
  );

  const doctorLinks = renderRoutingStack();

  async function handleCopyDiagnosticSheet() {
    const lines: string[] = [
      `${questions[3]} — RediHealth`,
      prompts[3],
      "",
    ];
    if (isEmergency) {
      lines.push(`${c.nextStepLabel}: ${dict.ui.emergency.title}`);
      lines.push(dict.ui.emergency.description);
    } else if (careLevel) {
      lines.push(`${c.nextStepLabel}: ${dict.urgency[careLevel].title}`);
      lines.push(dict.urgency[careLevel].intro);
      if (forWhom === "child") lines.push(c.childNote);
      if (careLevel === "low" && selectedSymptom?.selfCareTip) {
        lines.push(`${c.selfCare}: ${selectedSymptom.selfCareTip}`);
      }
    }
    if (selectedSymptom && !isEmergency && careLevel !== "high") {
      lines.push("");
      lines.push(`${c.meaning}: ${selectedSymptom.guidance || selectedSymptom.description}`);
    }
    lines.push("");
    lines.push(`${c.summaryFold}:`);
    if (areaLabel) lines.push(`- ${dict.ui.areaLabel}: ${areaLabel}${forWhom === "child" ? ` (${c.childRow})` : ""}`);
    if (detailLabel) lines.push(`- ${c.exactSpot}: ${detailLabel}`);
    if (allSymptoms.length > 0) lines.push(`- ${dict.ui.symptomLabel}: ${allSymptoms.map((s) => s.title).join(", ")}`);
    if (severity) lines.push(`- ${dict.ui.severityHeading}: ${dict.severity[severity].title}`);
    if (duration) lines.push(`- ${dict.ui.durationHeading}: ${dict.duration[duration].label}`);
    lines.push("");
    lines.push(dict.ui.disclaimer);

    const payload = lines.join("\n");
    let ok = false;
    try {
      await navigator.clipboard.writeText(payload);
      ok = true;
    } catch {
      const area = document.createElement("textarea");
      area.value = payload;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      area.remove();
    }
    if (ok) {
      setSheetCopied(true);
      if (sheetCopyTimer.current) clearTimeout(sheetCopyTimer.current);
      sheetCopyTimer.current = setTimeout(() => setSheetCopied(false), 3000);
    }
  }

  return (
    <div>
      <AssistantNavigation />

      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {`${stepIndicatorText}: ${stepTitles[step - 1]}`}
      </div>

      <header ref={headerRef} className={`scroll-mt-4 pb-4 sm:pb-6 ${bodyShown ? "" : "max-w-2xl"}`}>
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
          <ol aria-label={stepIndicatorText} className="mt-1.5 grid grid-cols-4 gap-2">
            {stepTitles.map((title, i) => {
              const targetStep = (i + 1) as Step;
              const isCurrent = targetStep === step;
              const isCompleted = targetStep < step;
              const isReachable = targetStep <= maxReachableStep;
              return (
                <li key={title} aria-current={isCurrent ? "step" : undefined}>
                  <button
                    type="button"
                    disabled={!isReachable}
                    onClick={() => {
                      if (isReachable && !isCurrent) goToStep(targetStep);
                    }}
                    aria-label={`${dict.ui.stepIndicator.replace("{current}", String(targetStep)).replace("{total}", "4")}: ${title}`}
                    className={`group flex min-h-11 w-full flex-col justify-center gap-1.5 rounded-md px-0.5 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 ${
                      isReachable && !isCurrent ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-full rounded-md transition-colors duration-[var(--dur-base)] ease-[var(--ease-out-calm)] ${
                        isCurrent || isCompleted
                          ? "bg-sapphire group-hover:bg-sapphire/85"
                          : isReachable
                            ? "bg-sapphire/30 group-hover:bg-sapphire/50"
                            : "bg-border"
                      }`}
                    />
                    <span
                      className={`truncate text-xs font-medium leading-tight ${
                        isCurrent
                          ? "text-sapphire"
                          : isCompleted
                            ? "text-foreground group-hover:text-sapphire"
                            : "text-muted-foreground"
                      }`}
                    >
                      <span className="tabular-nums">{targetStep}.</span> {title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </header>

      <div className={bodyShown ? "grid grid-cols-1 gap-x-10 gap-y-5 lg:grid-cols-12" : "grid max-w-2xl grid-cols-1 gap-y-5"}>
        {step > 1 && bodyShown && (
          <div className="flex min-h-12 flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg border border-border bg-card px-3.5 py-2 lg:hidden">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
              <span className="text-muted-foreground">{c.area}:</span>
              <span className="font-semibold text-foreground">{detailLabel ?? areaLabel ?? "—"}</span>
              {forWhom === "child" && <span className="text-muted-foreground">· {c.childRow}</span>}
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="inline-flex min-h-11 items-center px-1 font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
              >
                {c.change}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setMobileStageOpen((open) => !open)}
              aria-expanded={mobileStageOpen}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-sapphire/25 bg-sapphire-soft px-3 text-sm font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2"
            >
              {mobileStageOpen ? stageCopy.hide3DBody : stageCopy.showOn3DBody}
            </button>
          </div>
        )}

        {/* The body stays mounted across steps: one WebGL context, the selection travels with you. */}
        <section
          aria-label={dict.ui.viewer3D.subModelInfo}
          className={
            bodyShown
              ? `lg:col-span-7 lg:row-span-2 lg:sticky lg:top-[calc(var(--chrome-h,0px)+1rem)] lg:self-start ${
                  step > 1 && !mobileStageOpen ? "hidden lg:block" : ""
                }`
              : step === 1 ? "" : "hidden"
          }
        >
          <AnatomicalBodyMap
            selectedPart={selectedPart}
            onSelectPart={handleSelectFromBody}
            selectedSubRegion={detail?.subRegion ?? null}
            selectedSide={detail?.side ?? "Center"}
            onSelectDetailedAnatomy={(_part, subRegion, side) => {
              if (FEMALE_ONLY_SUB_REGIONS.has(subRegion)) setBodyProfile("female");
              setDetail({ subRegion, side });
            }}
            bodyProfile={bodyProfile}
            onBodyProfileChange={(next) => {
              setBodyProfile(next);
              if (next === "general" && detail && FEMALE_ONLY_SUB_REGIONS.has(detail.subRegion)) {
                setDetail(null);
              }
            }}
            forcedLayerMode={visceralFocus ? visceralFocus.layer : null}
            focusSubRegion={visceralFocus?.subRegion ?? null}
            focusSide={visceralFocus?.side}
            lang={activeLang}
            stageClassName={`-mx-5 w-[calc(100%+2.5rem)] sm:mx-0 sm:w-full sm:rounded-xl sm:border sm:border-border ${stageHeight}`}
            /* The "tap the body" tip only where a tap chooses something; later the body is context. */
            toolsClassName={step === 1 ? "" : "hidden"}
            controlsClassName={step === 1 ? "flex" : mobileStageOpen ? "flex lg:flex" : "hidden lg:flex"}
            decorative={step > 1}
            selectionLabel={step === 1 ? (detailLabel ?? areaLabel) : null}
            onBodyShownChange={setBodyShown}
          />
        </section>

        <section aria-labelledby={`${baseId}-q`} className={`min-w-0 ${bodyShown ? "lg:col-span-5" : ""}`}>
          <div key={step} className={stepDir ? "hc-step" : undefined} data-dir={stepDir ?? undefined}>
          {step < 4 && (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2
                  id={`${baseId}-q`}
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="text-xl font-semibold leading-tight tracking-tight text-foreground text-balance outline-none sm:text-[22px]"
                >
                  {questions[step - 1]}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{prompts[step - 1]}</p>
              </div>
              {voice.available && (
                <button
                  type="button"
                  onClick={() => (voice.speaking ? voice.stop() : voice.speak(spokenParts()))}
                  aria-pressed={voice.speaking}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire lg:min-h-9 ${
                    voice.speaking
                      ? "border-sapphire/35 bg-sapphire-soft text-sapphire"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  <SpeakerIcon off={voice.speaking} />
                  <span>{voice.speaking ? c.stopListening : c.listen}</span>
                </button>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="mt-4 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-border/85 bg-surface-subtle/70 px-3.5 py-2">
                <span id={`${baseId}-who`} className="text-[13px] font-medium text-muted-foreground">
                  {c.forWhom}
                </span>
                <div
                  role="radiogroup"
                  aria-labelledby={`${baseId}-who`}
                  onKeyDown={handleRadioKeys}
                  className="inline-grid grid-cols-2 gap-1 rounded-lg border border-border/80 bg-muted/80 p-0.5"
                >
                  {(
                    [
                      { id: "self", label: c.forSelf },
                      { id: "child", label: c.forChild },
                    ] as const
                  ).map((opt) => {
                    const active = forWhom === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        tabIndex={active ? 0 : -1}
                        onClick={() => setForWhom(opt.id)}
                        className={`inline-flex min-h-9 items-center justify-center rounded-md px-3 text-xs font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire lg:min-h-8 ${
                          active
                            ? "bg-card font-semibold text-sapphire shadow-xs ring-1 ring-border/80"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                {bodyShown && <p className={`${sectionLabel} mb-2 lg:hidden`}>{c.orList}</p>}
                <div
                  role="radiogroup"
                  aria-labelledby={`${baseId}-q`}
                  onKeyDown={handleRadioKeys}
                  className={`grid grid-cols-1 gap-2 ${bodyShown ? "sm:grid-cols-2 lg:grid-cols-1" : ""}`}
                >
                  {BODY_PARTS.map((id) => (
                    <AreaOptionCard
                      key={id}
                      partId={id}
                      checked={selectedPart === id}
                      focusable={!selectedPart && id === BODY_PARTS[0]}
                      onSelect={(byPointer) => handleSelectFromList(id, byPointer)}
                      title={dict.bodyParts[id].title}
                      description={dict.bodyParts[id].subtitle}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mt-4 space-y-3.5">
              {renderAreaContextCard(true)}
              <div role="radiogroup" aria-labelledby={`${baseId}-q`} onKeyDown={handleRadioKeys} className="space-y-2">
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
                      tone={urgent ? "urgent" : "default"}
                      badge={
                        urgent ? (
                          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-primary/30 bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
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
              <div className={bodyShown ? "hidden lg:block" : "block"}>
                {renderAreaContextCard(false)}
              </div>
              <fieldset>
                <legend id={`${baseId}-sev`} className={`${sectionLabel} mb-2`}>{dict.ui.severityHeading}</legend>
                <div role="radiogroup" aria-labelledby={`${baseId}-sev`} onKeyDown={handleRadioKeys} className="space-y-2">
                  {SEVERITY_KEYS.map((key, idx) => {
                    const level = idx + 1;
                    return (
                      <OptionRow
                        key={key}
                        checked={severity === key}
                        focusable={!severity && key === SEVERITY_KEYS[0]}
                        onSelect={() => setSeverity(key)}
                        title={dict.severity[key].title}
                        description={dict.severity[key].description}
                        tone={key === "severe" ? "urgent" : "default"}
                        leading={
                          <span aria-hidden="true" className="inline-flex items-end gap-0.5">
                            {[1, 2, 3].map((bar) => (
                              <span
                                key={bar}
                                className={`w-1 rounded-full ${
                                  bar === 1 ? "h-2" : bar === 2 ? "h-3" : "h-4"
                                } ${
                                  bar <= level
                                    ? key === "severe"
                                      ? "bg-primary"
                                      : "bg-sapphire"
                                    : "bg-border"
                                }`}
                              />
                            ))}
                          </span>
                        }
                        compact
                      />
                    );
                  })}
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
                      const urgent = isAcuteSurgicalOrEmergency(symptom);
                      return (
                        <label
                          key={symptom.id}
                          className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] ${
                            checked
                              ? urgent
                                ? "border-primary bg-primary-soft/40 shadow-[inset_0_0_0_1px_var(--color-primary)]"
                                : "border-sapphire bg-sapphire-soft/40 shadow-[inset_0_0_0_1px_var(--color-sapphire)]"
                              : urgent
                                ? "border-primary/25 bg-primary-soft/20 hover:border-primary/45"
                                : "border-border bg-card hover:border-sapphire/35 hover:bg-surface-card"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleExtra(symptom)}
                            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-sapphire)]"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[15px] font-semibold leading-snug text-foreground">{symptom.title}</span>
                            {urgent && (
                              <span className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
                                {dict.ui.urgentBadge}
                              </span>
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
            <div
              onPointerMove={handleSheetPointerMove}
              className="hc-diag-sheet surface-spotlight overflow-hidden rounded-xl border border-slate-300/90 bg-white select-text"
            >
              <div
                aria-hidden="true"
                className={`h-[3px] w-full ${
                  isEmergency
                    ? "bg-primary"
                    : careLevel === "high"
                      ? "bg-amber-care"
                      : "bg-obsidian-navy"
                }`}
              />

              {/* Masthead: archival clinical grid, document tag, and 1-tap copy/listen toolbar */}
              <div className="hc-diag-masthead border-b border-slate-200/90 px-5 py-4 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                  <span className="inline-flex items-center gap-2 rounded-md border border-slate-300/85 bg-white/95 px-2.5 py-1 text-xs font-semibold text-obsidian-navy shadow-2xs">
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 rounded-full ${
                        isEmergency ? "bg-primary" : careLevel === "high" ? "bg-amber-care" : "bg-sapphire"
                      }`}
                    />
                    <span>{c.sheetBadge}</span>
                  </span>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopyDiagnosticSheet}
                      className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-md border px-3 text-xs font-semibold shadow-2xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire lg:min-h-9 ${
                        sheetCopied
                          ? "border-obsidian-navy bg-obsidian-navy text-white"
                          : "border-slate-300/90 bg-white text-obsidian-navy hover:border-sapphire/45 hover:bg-sapphire-soft/50"
                      }`}
                    >
                      {sheetCopied ? (
                        <CheckCircleIcon className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <CopyIcon className="h-3.5 w-3.5 shrink-0" />
                      )}
                      <span aria-live="polite">{sheetCopied ? c.copiedSheet : c.copySheet}</span>
                    </button>

                    {voice.available && (
                      <button
                        type="button"
                        onClick={() => (voice.speaking ? voice.stop() : voice.speak(spokenParts()))}
                        aria-pressed={voice.speaking}
                        className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-3 text-xs font-semibold shadow-2xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire lg:min-h-9 ${
                          voice.speaking
                            ? "border-sapphire bg-sapphire-soft text-sapphire"
                            : "border-slate-300/90 bg-white text-obsidian-navy hover:border-sapphire/45 hover:bg-sapphire-soft/50"
                        }`}
                      >
                        <SpeakerIcon off={voice.speaking} />
                        <span>{voice.speaking ? c.stopListening : c.listen}</span>
                      </button>
                    )}
                  </div>
                </div>

                <h2
                  id={`${baseId}-q`}
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="mt-3.5 text-[21px] font-semibold leading-tight tracking-tight text-obsidian-navy text-balance outline-none sm:text-2xl"
                >
                  {questions[3]}
                </h2>
                <p className="mt-1 text-[13.5px] text-slate-600">{prompts[3]}</p>
              </div>

              {/* Continuous ruled clinical bands (zero nested card clutter) */}
              <div className="divide-y divide-slate-200/90">
                {/* Band 01 — Primary clinical assessment and routing */}
                {isEmergency ? (
                  <div className="hc-diag-band bg-white px-5 py-5 sm:px-6">
                    <div role="alert" className="rounded-lg bg-primary p-4 text-white sm:p-5">
                      <h3 className="text-lg font-semibold leading-snug">{dict.ui.emergency.title}</h3>
                      <p className="mt-1.5 text-base leading-relaxed text-white/95">{dict.ui.emergency.description}</p>
                    </div>
                    <button type="button" onClick={() => openModal("doctor")} className={`${secondaryBtn} mt-3 w-full`}>
                      {dict.ui.showDoctor}
                    </button>
                    {placeLink("hospital", places.hospital)}
                  </div>
                ) : (
                  careLevel && (
                    <div className="hc-diag-band bg-white px-5 py-5 sm:px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-400 tabular-nums">01</span>
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                            careLevel === "high"
                              ? "border border-amber-care/30 bg-amber-care-soft/75 text-amber-care"
                              : "border border-sapphire-border/80 bg-sapphire-soft text-sapphire"
                          }`}
                        >
                          {c.nextStepLabel}
                        </span>
                      </div>

                      <h3 className="mt-2.5 text-[19px] font-semibold leading-[1.28] tracking-tight text-obsidian-navy text-balance sm:text-[21px]">
                        {dict.urgency[careLevel].title}
                      </h3>
                      <p className="mt-2 text-[15.5px] leading-[1.65] text-slate-700">
                        {dict.urgency[careLevel].intro}
                      </p>
                      {forWhom === "child" && (
                        <p className="mt-3 rounded-md border border-amber-care/35 bg-amber-care/10 px-3 py-2 text-sm font-medium leading-relaxed text-obsidian-navy">
                          {c.childNote}
                        </p>
                      )}

                      <div className="mt-4">
                        {careLevel === "low" && selectedSymptom?.selfCareTip ? (
                          <>
                            <h4 className="text-sm font-semibold text-obsidian-navy">{c.selfCare}</h4>
                            <p className="mt-1 text-[15px] leading-[1.6] text-slate-700">
                              {selectedSymptom.selfCareTip}
                            </p>
                            <h4 className="mt-4 text-sm font-semibold text-obsidian-navy">{places.pharmacyFirst}</h4>
                            <p className="mt-1 text-[15px] leading-[1.6] text-slate-700">
                              {places.pharmacyFirstHint}
                            </p>
                            {placeLink("pharmacy", places.nearestPharmacy)}
                          </>
                        ) : careLevel === "low" ? (
                          renderRoutingStack("pharmacy", places.pharmacyFirst)
                        ) : careLevel === "high" ? (
                          renderRoutingStack("hospital", places.hospital)
                        ) : (
                          renderRoutingStack("gp", places.familyDoctor)
                        )}
                      </div>
                    </div>
                  )
                )}

                {/* Band 02 — Warm diagnostic ivory clinical context ("What it may mean") */}
                {selectedSymptom && !isEmergency && careLevel !== "high" && (
                  <div className="hc-diag-band hc-diag-band-1 bg-[#f9f8f3] px-5 py-5 sm:px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-400 tabular-nums">02</span>
                      <h3 className="text-sm font-semibold text-obsidian-navy">{c.meaning}</h3>
                    </div>
                    <p className="mt-2 text-[15.5px] leading-[1.65] text-slate-700">
                      {selectedSymptom.guidance || selectedSymptom.description}
                    </p>
                    {topicMapping && (
                      <Link
                        href={withLangPrefix(`/health-information/${topicMapping.slug}`, activeLang)}
                        className="group mt-3.5 flex min-h-11 items-center justify-between gap-3 rounded-lg border border-slate-200/95 bg-white px-3.5 py-2.5 text-sm font-semibold text-sapphire shadow-2xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-sapphire/45 hover:bg-sapphire-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire sm:text-[15px]"
                      >
                        <span className="min-w-0">
                          {c.readAbout}: {topicMapping.title}
                        </span>
                        <ArrowRightIcon
                          className="h-4 w-4 shrink-0 text-sapphire transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5 motion-reduce:transition-none"
                          aria-hidden="true"
                        />
                      </Link>
                    )}
                  </div>
                )}

                {/* Band 03 — Structured clinical ledger ("Summary for the doctor") */}
                <details
                  ref={summaryFoldRef}
                  open
                  className="hc-diag-band hc-diag-band-2 group bg-white px-5 py-5 sm:px-6"
                >
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-md text-base font-semibold text-obsidian-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire [&::-webkit-details-marker]:hidden">
                    <span className="inline-flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-400 tabular-nums">03</span>
                      <span>{c.summaryFold}</span>
                    </span>
                    <svg
                      viewBox="0 0 20 20"
                      className="h-4 w-4 text-slate-500 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-calm)] group-open:rotate-180 motion-reduce:transition-none"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
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
                  <div className="hc-diag-band hc-diag-band-3 bg-[#f9f8f3] px-5 py-5 sm:px-6">
                    <h3 className="text-base font-semibold text-obsidian-navy">{c.doctorTitle}</h3>
                    <p className="mb-3 mt-1 text-[15px] text-slate-600">{c.doctorBody}</p>
                    {doctorLinks}
                  </div>
                )}
              </div>

              {/* Perforated clinical footnote */}
              <div className="hc-diag-band hc-diag-band-3 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-slate-300 bg-[#f2f5f9] px-5 py-3.5 sm:px-6">
                <p className="text-xs leading-relaxed text-slate-600 sm:text-[13px]">{dict.ui.disclaimer}</p>
                <ResetControl label={dict.ui.resetButton} c={c} onConfirm={handleReset} prominent />
              </div>
            </div>
          )}
          </div>
        </section>

        {/* Action bar: pinned to the bottom on mobile/tablet; static below the options on desktop so it never masks cards. */}
        <div data-sticky-actions className={`sticky bottom-0 z-20 -mx-5 border-t border-border bg-background px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:mx-0 sm:px-0 lg:static lg:bg-transparent lg:pb-0 ${bodyShown ? "lg:col-span-5 lg:col-start-8" : ""}`}>
          {step < 4 && (
            <p className="mb-2 text-sm leading-snug text-muted-foreground" aria-live="polite">
              {isEmergency && step > 1 ? (
                <>
                  <span className="font-medium text-primary">{dict.ui.urgentBadge}.</span>{" "}
                  <button
                    type="button"
                    onClick={() => goToStep(4)}
                    className="inline-flex min-h-11 items-center rounded-sm px-1 font-medium text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {dict.ui.finishButton}
                  </button>
                </>
              ) : canContinue ? (
                <>
                  {c.chosen}:{" "}
                  <span className="font-medium text-foreground">
                    {step === 1
                      ? (detailLabel ?? areaLabel)
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
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 text-base font-medium text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                {dict.ui.backButton}
              </button>
            )}
            {isEmergency && step > 1 ? (
              <a
                href="tel:112"
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-primary-hover"
              >
                <PhoneIcon className="h-5 w-5" />
                {dict.ui.emergency.call112Now}
              </a>
            ) : step < 4 ? (
              <button
                type="button"
                disabled={!canContinue}
                onClick={() => goToStep((step + 1) as Step)}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-lg bg-foreground px-5 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-ink-800 disabled:cursor-not-allowed disabled:bg-border disabled:text-muted-foreground"
              >
                {step === 3 ? dict.ui.finishButton : dict.ui.nextButton}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openModal("doctor")}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg bg-foreground px-5 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-ink-800"
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
            className="hc-sheet w-full max-w-lg rounded-t-xl bg-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-xl sm:p-7"
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
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-primary-hover"
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
