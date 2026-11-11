"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
  type SVGProps,
} from "react";
import Link from "next/link";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  CopyIcon,
  PhoneIcon,
  PinIcon,
  StethoscopeIcon,
} from "@/components/ui/icons";
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
import { predictSymptomsForSelection } from "@/components/health-check/symptom-prediction";
import {
  buildTriageReproductionUrl,
  parseTriageReproductionSearch,
} from "@/components/health-check/triage-permalink";
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
/** Calm pause before revealing the next inline beat in Step 3. */
const BEAT_REVEAL_MS = 220;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollBeatIntoView(el: HTMLElement | null) {
  if (!el || typeof el.scrollIntoView !== "function") return;
  const reduce = prefersReducedMotion();
  requestAnimationFrame(() => {
    el.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
    });
  });
}

// Acute surgical (appendicitis, peritonitis, ectopic pregnancy) and ischemic emergency presentations (DEF-18)
const ACUTE_RED_FLAG_SYMPTOM_IDS = new Set<string>([
  "stomach_lower_sharp", // Acute appendicitis / peritoneal signs in right lower quadrant
  "stomach_severe_widespread", // Acute abdomen / peritonitis
  "pelvis_pregnancy_bleeding", // Ectopic pregnancy / acute gynecologic hemorrhage or infection
  "chest_warning", // Acute coronary syndrome / myocardial infarction
  "head_sudden_severe", // Thunderclap headache / intracranial emergency
  "head_neck_red_flag", // Meningeal stiffness with fever or confusion
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
  head_jaw_ear: "medium", // possible otitis, dental infection, or TMJ pathology
  arm_numbness: "medium",
  back_chronic: "medium",
  back_flank_kidney: "high", // suspected pyelonephritis or renal colic: same-day medical evaluation
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
    if (id === "head_neck_stiff" || id === "head_neck_red_flag" || id === "head_throat_swallow") {
      return { subRegion: "neck", side: "Center", layer: "hybrid" };
    }
    if (id === "head_jaw_ear") {
      return { subRegion: "jaw_ear", side: chosenSide, layer: "surface" };
    }
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
    if (id === "back_upper_blades") {
      return { subRegion: "upper_back", side: "Center", layer: "muscular" };
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
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-sapphire text-white"
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

/** Smooth slide+fade wrapper for progressive Typeform beats; honors prefers-reduced-motion. */
function ProgressiveBeat({
  beatRef,
  animateEntrance,
  children,
  className = "",
}: {
  beatRef?: RefObject<HTMLDivElement | null>;
  animateEntrance: boolean;
  children: ReactNode;
  className?: string;
}) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (!animateEntrance) return;
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [animateEntrance]);

  const isShown = !animateEntrance || entered;

  return (
    <div
      ref={beatRef}
      className={`transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
        isShown ? "translate-y-0 opacity-100" : "translate-y-2.5 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** Semantic sensation pictogram derived from symptom ID/keywords for low-literacy recognition. */
function SymptomPictogram({
  symptomId,
  urgent = false,
  checked = false,
}: {
  symptomId: string;
  urgent?: boolean;
  checked?: boolean;
}) {
  const id = symptomId.toLowerCase();
  let icon: ReactNode;

  if (urgent) {
    icon = (
      <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2.2 10.5h3.1l1.8-4.3 2.7 7.6 2.1-5.3 1.5 2h4.4" />
        <circle cx="16.4" cy="4.4" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    );
  } else if (id === "other") {
    icon = (
      <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3.8 5.8A2.3 2.3 0 0 1 6.1 3.5h7.8a2.3 2.3 0 0 1 2.3 2.3v5.1a2.3 2.3 0 0 1-2.3 2.3H9.2l-3.1 2.5v-2.5H6.1a2.3 2.3 0 0 1-2.3-2.3z" />
        <circle cx="7.4" cy="8.4" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="10" cy="8.4" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="12.6" cy="8.4" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  } else if (/reflux|burn|acid|urinary/.test(id)) {
    icon = (
      <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.3 2.8c1.9 2.3 4.2 4.7 4.2 7.9a4.5 4.5 0 1 1-9 0c0-2 1-3.8 2.3-5.3.3 1.2 1 1.9 1.9 2.1-.2-1.5.2-3.1 1.1-4.7z" />
      </svg>
    );
  } else if (/fever|temp/.test(id)) {
    icon = (
      <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11.5 11.2V4.7a1.5 1.5 0 0 0-3 0v6.5a3.1 3.1 0 1 0 3 0z" />
        <path d="M10 7.5v5.2" />
        <circle cx="10" cy="13.7" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    );
  } else if (/dehydrat|water|thirst/.test(id)) {
    icon = (
      <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 3c2.7 3.4 4.8 6 4.8 8.6a4.8 4.8 0 0 1-9.6 0C5.2 9 7.3 6.4 10 3z" />
        <path d="M8.1 12.4a2.1 2.1 0 0 0 1.9 1.8" />
      </svg>
    );
  } else if (/exertion|breath|lung|cough|respir/.test(id)) {
    icon = (
      <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3.2 8.2h8a2 2 0 1 0-1.9-2.6" />
        <path d="M3.2 11.4h10.8a2.1 2.1 0 1 1-2 2.8" />
        <path d="M5.2 14.5h4.2" />
      </svg>
    );
  } else if (/sharp|stitch|sprain|strain|cramp|one_sided/.test(id)) {
    icon = (
      <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11.1 2.8 5.6 10.4h4l-.7 6.8 5.5-7.6h-4z" />
      </svg>
    );
  } else if (/lump|swelling|nodul/.test(id)) {
    icon = (
      <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="10" cy="10" r="6" />
        <circle cx="10" cy="10" r="2" fill="currentColor" stroke="none" />
      </svg>
    );
  } else if (/neck|cervical|blades/.test(id)) {
    icon = (
      <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7.5 3.5h5M8 7h4M7.5 10.5h5M8 14h4M10 3.5v13" />
      </svg>
    );
  } else if (/throat|swallow/.test(id)) {
    icon = (
      <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6.5 4.2c1.2 2.4 1.2 9.2 0 11.6M13.5 4.2c-1.2 2.4-1.2 9.2 0 11.6" />
        <path d="M10 7.2v5.6M8.2 10h3.6" />
      </svg>
    );
  } else if (/jaw|ear/.test(id)) {
    icon = (
      <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6.8 8.2a3.8 3.8 0 1 1 6.4 2.8c-.9.9-1.4 1.8-1.6 3a1.6 1.6 0 0 1-3.1-.4" />
        <path d="M9.6 8.2a1.3 1.3 0 0 1 2 1.1" />
      </svg>
    );
  } else if (/numb|tingl/.test(id)) {
    icon = (
      <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3.8 10c1.5-2 3.1-2 4.6 0s3.1 2 4.6 0 2.1-1.3 3.2-.4" />
        <circle cx="5.8" cy="5.6" r="1" fill="currentColor" stroke="none" />
        <circle cx="10" cy="4.8" r="1" fill="currentColor" stroke="none" />
        <circle cx="14.2" cy="5.6" r="1" fill="currentColor" stroke="none" />
        <circle cx="7.8" cy="14.4" r="1" fill="currentColor" stroke="none" />
        <circle cx="12.4" cy="14.4" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  } else {
    icon = (
      <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2.8 8.2c1.8-2 3.6-2 5.4 0s3.6 2 5.4 0 2.4-1.3 3.6-.4" />
        <path d="M2.8 12.4c1.8-2 3.6-2 5.4 0s3.6 2 5.4 0 2.4-1.3 3.6-.4" />
      </svg>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] ${
        urgent
          ? checked
            ? "border-primary bg-primary text-white"
            : "border-primary/30 bg-primary-soft text-primary"
          : checked
            ? "border-sapphire bg-sapphire text-white"
            : "border-sapphire/20 bg-sapphire-soft/75 text-sapphire"
      }`}
    >
      {icon}
    </span>
  );
}

/** Comfort-scale visual for Step 3A: expressive face + 1/2/3 intensity bars. */
function SeverityComfortVisual({
  severityKey,
  checked,
}: {
  severityKey: SeverityId;
  checked: boolean;
}) {
  const level = severityKey === "mild" ? 1 : severityKey === "moderate" ? 2 : 3;
  const urgent = severityKey === "severe";

  return (
    <span aria-hidden="true" className="inline-flex shrink-0 items-center gap-2">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] ${
          urgent
            ? checked
              ? "border-primary bg-primary text-white"
              : "border-primary/30 bg-primary-soft text-primary"
            : checked
              ? "border-sapphire bg-sapphire text-white"
              : "border-sapphire/20 bg-sapphire-soft/75 text-sapphire"
        }`}
      >
        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="7" />
          {severityKey === "mild" && (
            <>
              <circle cx="7.6" cy="8.6" r="0.85" fill="currentColor" stroke="none" />
              <circle cx="12.4" cy="8.6" r="0.85" fill="currentColor" stroke="none" />
              <path d="M7.5 12.1c.7 1 1.5 1.4 2.5 1.4s1.8-.4 2.5-1.4" />
            </>
          )}
          {severityKey === "moderate" && (
            <>
              <path d="M6.8 8.3h2M11.2 8.3h2" />
              <path d="M7.3 12.8c.9-.5 1.8.5 2.7 0s1.8-.5 2.7 0" />
            </>
          )}
          {severityKey === "severe" && (
            <>
              <path d="M6.6 7.6l2 1M13.4 7.6l-2 1" />
              <circle cx="7.8" cy="9.6" r="0.75" fill="currentColor" stroke="none" />
              <circle cx="12.2" cy="9.6" r="0.75" fill="currentColor" stroke="none" />
              <path d="M7.4 13.7c.7-1.1 1.6-1.6 2.6-1.6s1.9.5 2.6 1.6" />
            </>
          )}
        </svg>
      </span>
      <span className="inline-flex items-end gap-0.5">
        {[1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={`w-1 rounded-full ${
              bar === 1 ? "h-2" : bar === 2 ? "h-3.5" : "h-5"
            } ${
              bar <= level
                ? urgent
                  ? "bg-primary"
                  : "bg-sapphire"
                : "bg-border"
            }`}
          />
        ))}
      </span>
    </span>
  );
}

/** Time-horizon visual for Step 3B: sunrise today, 3-day dots, calendar grid, or long-term clock. */
function DurationHorizonVisual({
  durationKey,
  checked,
}: {
  durationKey: DurationId;
  checked: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] ${
        checked
          ? "border-sapphire bg-sapphire text-white"
          : "border-sapphire/20 bg-sapphire-soft/75 text-sapphire"
      }`}
    >
      {durationKey === "today" && (
        <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.2 14.2h13.6" />
          <path d="M6.5 14.2a3.5 3.5 0 0 1 7 0" />
          <path d="M10 4.5v1.8M5.2 6.8l1.2 1.2M14.8 6.8l-1.2 1.2" />
        </svg>
      )}
      {durationKey === "days" && (
        <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 10h11" opacity="0.45" />
          <circle cx="5" cy="10" r="1.9" fill="currentColor" stroke="none" />
          <circle cx="10" cy="10" r="1.9" fill="currentColor" stroke="none" />
          <circle cx="15" cy="10" r="1.9" fill="currentColor" stroke="none" />
        </svg>
      )}
      {durationKey === "weeks" && (
        <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3.5" y="4.5" width="13" height="12" rx="2" />
          <path d="M6.8 3v2.5M13.2 3v2.5M3.5 8.2h13" />
          <circle cx="7" cy="11.2" r="0.85" fill="currentColor" stroke="none" />
          <circle cx="10" cy="11.2" r="0.85" fill="currentColor" stroke="none" />
          <circle cx="13" cy="11.2" r="0.85" fill="currentColor" stroke="none" />
          <circle cx="7" cy="13.8" r="0.85" fill="currentColor" stroke="none" />
          <circle cx="10" cy="13.8" r="0.85" fill="currentColor" stroke="none" />
        </svg>
      )}
      {durationKey === "chronic" && (
        <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.3 8.2A6 6 0 1 1 4 11.5" />
          <path d="M3.2 5.4v3.1h3.1" />
          <path d="M10 6.8v3.4l2.3 1.4" />
        </svg>
      )}
    </span>
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
  iconBadge,
  tone = "default",
  compact = false,
  focusable = false,
  onSpeak,
  speakingThis = false,
  speakLabel,
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
  /** Optional pictogram / comfort badge rendered beside the radio indicator. */
  iconBadge?: ReactNode;
  tone?: "default" | "urgent";
  compact?: boolean;
  /** Roving tab stop: only one radio per group is in the Tab order. */
  focusable?: boolean;
  /** Optional per-card read-aloud handler rendered as a sibling button (never nested!). */
  onSpeak?: () => void;
  speakingThis?: boolean;
  speakLabel?: string;
}) {
  const radioButton = (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={checked || focusable ? 0 : -1}
      onClick={(e: ReactMouseEvent<HTMLButtonElement>) => onSelect(e.detail > 0)}
      className={`flex w-full items-start gap-3 rounded-xl border text-left transition-[border-color,box-shadow,background-color] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 ${
        compact ? "min-h-11 px-3.5 py-2.5" : "min-h-12 px-3.5 py-3"
      } ${onSpeak ? "pr-13 sm:pr-14" : ""} ${
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
      {iconBadge}
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

  if (!onSpeak) return radioButton;

  return (
    <div className="relative">
      {radioButton}
      <button
        type="button"
        onClick={onSpeak}
        aria-pressed={speakingThis}
        aria-label={speakLabel}
        className={`absolute right-2.5 top-2.5 z-10 inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
          speakingThis
            ? "border-sapphire bg-sapphire-soft text-sapphire"
            : "border-border/85 bg-card/95 text-muted-foreground hover:border-sapphire/40 hover:bg-sapphire-soft/50 hover:text-sapphire"
        }`}
      >
        <SpeakerIcon off={speakingThis} />
      </button>
    </div>
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
  const [forWhom, setForWhom] = useState<ForWhom>("self");
  const [bodyProfile, setBodyProfile] = useState<BodyAnatomyProfile>("general");
  const [selectedPart, setSelectedPart] = useState<BodyPartId | null>(null);
  const [detail, setDetail] = useState<{ subRegion: SubRegionId; side: Side } | null>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomChoice | null>(null);
  const [extraSymptoms, setExtraSymptoms] = useState<SymptomChoice[]>([]);
  const [otherChosen, setOtherChosen] = useState(false);
  const [severity, setSeverity] = useState<SeverityId | null>(null);
  const [duration, setDuration] = useState<DurationId | null>(null);
  const [beat3BReady, setBeat3BReady] = useState(false);
  const [beat3BAnimate, setBeat3BAnimate] = useState(false);
  const [beat3CReady, setBeat3CReady] = useState(false);
  const [beat3CAnimate, setBeat3CAnimate] = useState(false);
  const [autoVoiceGuide, setAutoVoiceGuide] = useState(false);
  const [speakingCardId, setSpeakingCardId] = useState<string | null>(null);
  const [showEmergencyOverlay, setShowEmergencyOverlay] = useState(false);
  const [doctorOpen, setDoctorOpen] = useState(false);
  const [sheetCopied, setSheetCopied] = useState(false);
  const [restoredFromQr, setRestoredFromQr] = useState(false);
  const originUrl = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  const [showAllAreaSymptoms, setShowAllAreaSymptoms] = useState(false);
  // Without the 3D body (data saver, no WebGL) the tool is one column: the note, then the list.
  const [bodyShown, setBodyShown] = useState(true);
  const [largeText, toggleLargeText] = useLargeText();
  const voice = useReadAloud(activeLang);

  // Direction of the last step change: the new question slides in 8px from that side. Null on first load.
  const [shownStep, setShownStep] = useState<Step>(1);
  const [stepDir, setStepDir] = useState<"forward" | "back" | null>(null);
  const [mobileStageOpen, setMobileStageOpen] = useState(false);
  // "Who is this for" and the body model are one quiet line until the person asks to change them.
  const [setupOpen, setSetupOpen] = useState(false);
  if (shownStep !== step) {
    setShownStep(step);
    setStepDir(step > shownStep ? "forward" : "back");
    if (step === 1) setMobileStageOpen(false);
    if (step === 3) {
      setBeat3BReady(severity !== null);
      setBeat3BAnimate(false);
      setBeat3CReady(severity !== null && duration !== null);
      setBeat3CAnimate(false);
    }
  }

  const headerRef = useRef<HTMLElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const emergencyRef = useRef<HTMLDivElement>(null);
  const summaryFoldRef = useRef<HTMLDetailsElement>(null);
  const beat2BRef = useRef<HTMLDivElement>(null);
  const beat3BRef = useRef<HTMLDivElement>(null);
  const beat3CRef = useRef<HTMLDivElement>(null);
  const pendingBeatRevealRef = useRef<"3B" | "3C" | null>(null);
  const isFirstRender = useRef(true);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beat3BTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beat3CTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSpeakTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sheetCopyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sheetSpotRaf = useRef<number | null>(null);
  const autoVoiceGuideRef = useRef(autoVoiceGuide);
  const voiceAvailableRef = useRef(voice.available);
  const spokenPartsRef = useRef<() => string[]>(() => []);

  useEffect(() => {
    autoVoiceGuideRef.current = autoVoiceGuide;
    voiceAvailableRef.current = voice.available;
  }, [autoVoiceGuide, voice.available]);

  useEffect(() => {
    return () => {
      if (sheetCopyTimer.current) clearTimeout(sheetCopyTimer.current);
      if (beat3BTimer.current) clearTimeout(beat3BTimer.current);
      if (beat3CTimer.current) clearTimeout(beat3CTimer.current);
      if (autoSpeakTimer.current) clearTimeout(autoSpeakTimer.current);
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
    let cancelled = false;
    const parsed = parseTriageReproductionSearch(window.location.search, activeLang);
    if (parsed) {
      const regionSyms = getHealthCheckTranslations(activeLang).symptoms[parsed.part] ?? [];
      const primarySym = regionSyms.find((s) => s.id === parsed.symptomId) ?? null;
      const extraSyms = parsed.extraSymptomIds
        .map((id) => regionSyms.find((s) => s.id === id) ?? null)
        .filter((s): s is SymptomChoice => Boolean(s));
      if (primarySym) {
        const isEm = [primarySym, ...extraSyms].some((s) => isAcuteSurgicalOrEmergency(s));
        const targetStep: Step = isEm || (parsed.severity && parsed.duration) ? 4 : 3;
        stackRef.current = targetStep === 4 ? [1, 2, 3, 4] : [1, 2, 3];
        posRef.current = stackRef.current.length - 1;
        answersRef.current = {
          part: true,
          symptom: true,
          emergency: isEm,
          severity: Boolean(parsed.severity),
          duration: Boolean(parsed.duration),
        };
        window.history.replaceState(
          { ...(window.history.state ?? {}), hcStep: targetStep, hcIdx: posRef.current, hcModal: false },
          "",
        );
        queueMicrotask(() => {
          if (cancelled) return;
          setForWhom(parsed.forWhom);
          setBodyProfile(parsed.bodyProfile);
          setSelectedPart(parsed.part);
          setDetail(parsed.subRegion ? { subRegion: parsed.subRegion, side: parsed.side } : null);
          setSelectedSymptom(primarySym);
          setExtraSymptoms(extraSyms);
          setSeverity(parsed.severity);
          setDuration(parsed.duration);
          if (parsed.severity) setBeat3BReady(true);
          if (parsed.severity && parsed.duration) setBeat3CReady(true);
          if (parsed.fromQr) setRestoredFromQr(true);
          setShownStep(targetStep);
          setStep(targetStep);
        });
      } else {
        window.history.replaceState({ ...(window.history.state ?? {}), hcStep: 1, hcIdx: 0 }, "");
      }
    } else {
      window.history.replaceState({ ...(window.history.state ?? {}), hcStep: 1, hcIdx: 0 }, "");
    }
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
    return () => {
      cancelled = true;
      window.removeEventListener("popstate", onPop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on mount
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

  /*
   * Two measurements for sizing the 3D stage on desktop (see stageHeight):
   *   --hc-stage-top  how far down the page the stage starts when the page is at its very top
   *   --hc-head-h     the height of this page's own heading (title + step bar)
   * The largest values seen are kept: later steps have a shorter heading, and the body must stay
   * one size from step to step.
   */
  useEffect(() => {
    const header = headerRef.current;
    const host = header?.parentElement;
    if (!header || !host || typeof ResizeObserver === "undefined") return;
    let lowest = 0;
    let tallest = 0;
    const apply = () => {
      tallest = Math.max(tallest, header.offsetHeight);
      lowest = Math.max(lowest, header.getBoundingClientRect().top + window.scrollY + header.offsetHeight);
      host.style.setProperty("--hc-head-h", `${Math.round(tallest)}px`);
      host.style.setProperty("--hc-stage-top", `${Math.round(lowest)}px`);
    };
    const onWindowResize = () => {
      lowest = 0;
      tallest = 0;
      apply();
    };
    const observer = new ResizeObserver(apply);
    observer.observe(header);
    window.addEventListener("resize", onWindowResize);
    apply();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

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
    if (autoSpeakTimer.current) clearTimeout(autoSpeakTimer.current);
    voice.stop();
    setSpeakingCardId(null);
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
        const reduce = prefersReducedMotion();
        window.scrollTo({ top: window.scrollY + top - covered - 8, behavior: reduce ? "auto" : "smooth" });
      }
    }
    stepHeadingRef.current?.focus({ preventScroll: true });

    // Sticky audio guide: auto-read new question + options when advancing into Steps 2, 3, or 4.
    if (autoVoiceGuideRef.current && voiceAvailableRef.current && (step === 2 || step === 3 || step === 4)) {
      autoSpeakTimer.current = setTimeout(() => {
        autoSpeakTimer.current = null;
        if (!autoVoiceGuideRef.current || !voiceAvailableRef.current || modalOpenRef.current) return;
        voice.speak(spokenPartsRef.current());
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs on step change only
  }, [step]);

  function handleBodyProfileChange(next: BodyAnatomyProfile) {
    setBodyProfile(next);
    if (next === "general" && detail && FEMALE_ONLY_SUB_REGIONS.has(detail.subRegion)) {
      setDetail(null);
    }
  }

  function handleSelectPart(partId: BodyPartId) {
    if (partId !== selectedPart) {
      // A new complaint starts clean: no answers carried over from the previous area.
      if (beat3BTimer.current) clearTimeout(beat3BTimer.current);
      if (beat3CTimer.current) clearTimeout(beat3CTimer.current);
      pendingBeatRevealRef.current = null;
      setSelectedSymptom(null);
      setExtraSymptoms([]);
      setOtherChosen(false);
      setSeverity(null);
      setDuration(null);
      setBeat3BReady(false);
      setBeat3BAnimate(false);
      setBeat3CReady(false);
      setBeat3CAnimate(false);
      setShowAllAreaSymptoms(false);
      setRestoredFromQr(false);
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

  function applySubRegionDetail(partId: BodyPartId | null, subRegion: SubRegionId | null, side: Side) {
    setShowAllAreaSymptoms(false);
    if (!subRegion) {
      setDetail(null);
      return;
    }
    if (FEMALE_ONLY_SUB_REGIONS.has(subRegion)) {
      setBodyProfile("female");
    }
    setDetail({ subRegion, side });
    if (partId) {
      const regionSyms = dict.symptoms[partId] ?? [];
      const partition = predictSymptomsForSelection(partId, subRegion, regionSyms, isAcuteSurgicalOrEmergency);
      const validPrimaryIds = new Set(partition.primary.map((s) => s.id));
      if (selectedSymptom && !validPrimaryIds.has(selectedSymptom.id)) {
        setSelectedSymptom(null);
        setExtraSymptoms((prev) => prev.filter((s) => validPrimaryIds.has(s.id)));
      }
    }
  }

  function handleSelectQuickSpot(subRegion: SubRegionId | null) {
    // The chips and the left/right choice stay where they are: no scroll on a spot change.
    if (!subRegion) {
      applySubRegionDetail(selectedPart, null, "Center");
      return;
    }
    const nextSide: Side = detail?.subRegion === subRegion ? detail.side : "Center";
    applySubRegionDetail(selectedPart, subRegion, nextSide);
  }

  function handleSelectSpotSide(subRegion: SubRegionId, side: Side) {
    setDetail({ subRegion, side });
  }

  function handleReset() {
    if (step === 1 && !restoredFromQr) return;
    // "Start over" never walks the browser history, so it can never leave the page. Later Back
    // presses land on old entries, which the popstate guard clamps to step 1.
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (beat3BTimer.current) clearTimeout(beat3BTimer.current);
    if (beat3CTimer.current) clearTimeout(beat3CTimer.current);
    if (autoSpeakTimer.current) clearTimeout(autoSpeakTimer.current);
    pendingBeatRevealRef.current = null;
    voice.stop();
    setSpeakingCardId(null);
    setAutoVoiceGuide(false);
    setRestoredFromQr(false);
    setShowAllAreaSymptoms(false);
    stackRef.current[posRef.current] = 1;
    window.history.replaceState(
      { ...(window.history.state ?? {}), hcStep: 1, hcIdx: posRef.current, hcModal: false },
      "",
      window.location.pathname,
    );
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
    setBeat3BReady(false);
    setBeat3BAnimate(false);
    setBeat3CReady(false);
    setBeat3CAnimate(false);
    setShowEmergencyOverlay(false);
    setMobileStageOpen(false);
    setSetupOpen(false);
  }

  const goBack = () => goToStep((step > 1 ? step - 1 : 1) as Step);

  // Predict symptoms tailored to the exact 3D sub-region (e.g., neck -> cervical/throat, never migraine).
  const predictedPartition = predictSymptomsForSelection(
    selectedPart,
    detail?.subRegion ?? null,
    selectedPart ? dict.symptoms[selectedPart] || [] : [],
    isAcuteSurgicalOrEmergency,
  );
  const symptomsList = showAllAreaSymptoms
    ? [...predictedPartition.primary, ...predictedPartition.secondary]
    : predictedPartition.primary;
  const extraCandidates = predictedPartition.primary.filter((s) => s.id !== selectedSymptom?.id);
  const topicMapping = selectedPart
    ? getTopicForSymptom(selectedPart, selectedSymptom?.id, activeLang, detail?.subRegion)
    : null;
  const careLevel =
    severity && duration ? getCareLevel(severity, duration, allSymptoms.map((s) => s.id), forWhom) : null;

  const showBeat3B = severity !== null && beat3BReady;
  const showBeat3C = severity !== null && duration !== null && beat3CReady && extraCandidates.length > 0;
  const step3TotalBeats = extraCandidates.length > 0 ? 3 : 2;
  const step3CurrentBeat = !severity ? 1 : !duration ? 2 : step3TotalBeats;
  const step3ProgressText = c.questionProgress
    .replace("{current}", String(step3CurrentBeat))
    .replace("{total}", String(step3TotalBeats));

  function handleSelectSeverity(key: SeverityId, byPointer: boolean) {
    setSeverity(key);
    if (!beat3BReady) {
      if (beat3BTimer.current) clearTimeout(beat3BTimer.current);
      beat3BTimer.current = setTimeout(() => {
        beat3BTimer.current = null;
        pendingBeatRevealRef.current = "3B";
        setBeat3BAnimate(!prefersReducedMotion());
        setBeat3BReady(true);
      }, BEAT_REVEAL_MS);
    } else if (byPointer && !duration) {
      if (beat3BTimer.current) clearTimeout(beat3BTimer.current);
      beat3BTimer.current = setTimeout(() => {
        beat3BTimer.current = null;
        scrollBeatIntoView(beat3BRef.current);
      }, BEAT_REVEAL_MS);
    }
  }

  function handleSelectDuration(key: DurationId, byPointer: boolean) {
    setDuration(key);
    if (extraCandidates.length === 0) return;
    if (!beat3CReady) {
      if (beat3CTimer.current) clearTimeout(beat3CTimer.current);
      beat3CTimer.current = setTimeout(() => {
        beat3CTimer.current = null;
        pendingBeatRevealRef.current = "3C";
        setBeat3CAnimate(!prefersReducedMotion());
        setBeat3CReady(true);
      }, BEAT_REVEAL_MS);
    } else if (byPointer) {
      if (beat3CTimer.current) clearTimeout(beat3CTimer.current);
      beat3CTimer.current = setTimeout(() => {
        beat3CTimer.current = null;
        scrollBeatIntoView(beat3CRef.current);
      }, BEAT_REVEAL_MS);
    }
  }

  // Smoothly scroll newly unlocked Step 3 beats into viewport center and auto-read if sticky audio is active.
  useEffect(() => {
    const target = pendingBeatRevealRef.current;
    if (!target) return;
    if (target === "3B" && beat3BReady) {
      pendingBeatRevealRef.current = null;
      scrollBeatIntoView(beat3BRef.current);
      if (autoVoiceGuideRef.current && voiceAvailableRef.current && !modalOpenRef.current) {
        setSpeakingCardId(null);
        voice.speak([dict.ui.durationHeading, ...DURATION_KEYS.map((k) => dict.duration[k].label)]);
      }
    } else if (target === "3C" && beat3CReady) {
      pendingBeatRevealRef.current = null;
      scrollBeatIntoView(beat3CRef.current);
      if (autoVoiceGuideRef.current && voiceAvailableRef.current && !modalOpenRef.current) {
        setSpeakingCardId(null);
        voice.speak([
          c.alsoFeel,
          c.alsoFeelHint,
          c.noExtraFinish,
          ...extraCandidates.map((s) => s.title),
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- triggers strictly on newly unlocked beat commit
  }, [beat3BReady, beat3CReady]);

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

  // Answers given on the steps before this one, shown in the action bar as one-click ways back.
  const answerTrail: { step: Step; label: string }[] = [];
  if (step > 1 && areaLabel) answerTrail.push({ step: 1, label: detailLabel ?? areaLabel });
  if (step > 2 && selectedSymptom) answerTrail.push({ step: 2, label: selectedSymptom.title });
  if (step > 3 && severity && duration) {
    answerTrail.push({ step: 3, label: `${dict.severity[severity].title} · ${dict.duration[duration].label}` });
  }

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
            className={`inline-flex min-h-10 items-center rounded-lg border px-3 py-1 text-xs font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire lg:min-h-8 ${
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
                className={`inline-flex min-h-10 items-center rounded-lg border px-3 py-1 text-xs font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire lg:min-h-8 ${
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
                    onClick={() => handleSelectSpotSide(detail.subRegion, opt.id)}
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
      <div
        className={`rounded-xl border border-border/90 bg-surface-subtle/65 p-3.5 ${
          hasSpots ? "" : bodyShown ? "hidden" : "lg:hidden"
        }`}
      >
        {/* The chosen area sits in the action bar on desktop and in the top card on a phone with the
            3D body, so this row is only for the one-column layout without the body. */}
        <div
          className={`items-center justify-between gap-3 ${
            bodyShown ? "hidden" : "flex lg:hidden"
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

  /*
   * Desktop stage height, one value for every step:
   *  - tall window: the room left under the stage at the very top of the page, so the whole body
   *    and its toolbar are on screen from the first paint;
   *  - shorter window: that would be too small, so up to 30rem of the room there is once a step
   *    has opened (site header + this page's heading above it), which is where steps 2-4 sit;
   *  - never under 22rem or over 48rem.
   */
  const stageHeight =
    step === 1
      ? "h-[clamp(15.5rem,36dvh,20rem)] sm:h-[min(46dvh,440px)] sm:min-h-[300px] lg:h-[clamp(22rem,max(calc(100dvh-var(--hc-stage-top,25rem)-1rem),min(calc(100dvh-var(--chrome-h,0px)-var(--hc-head-h,11rem)-2rem),30rem)),48rem)]"
      : "h-56 sm:h-64 lg:h-[clamp(22rem,max(calc(100dvh-var(--hc-stage-top,25rem)-1rem),min(calc(100dvh-var(--chrome-h,0px)-var(--hc-head-h,11rem)-2rem),30rem)),48rem)]";

  const sectionLabel = "text-sm font-semibold text-foreground";
  const secondaryBtn =
    "inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-card px-5 text-base font-medium text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted";

  /* What "Listen" reads on each step: the question, then what is currently visible on screen. */
  // One entry per recorded clip (see spoken-segments.ts), read in order.
  function spokenParts(): string[] {
    const parts = [questions[step - 1], prompts[step - 1]];
    if (step === 1) parts.push(...BODY_PARTS.map((id) => dict.bodyParts[id].title));
    if (step === 2) parts.push(...symptomsList.map((s) => s.title), c.otherTitle);
    if (step === 3) {
      parts.push(dict.ui.severityHeading, ...SEVERITY_KEYS.map((k) => dict.severity[k].title));
      if (showBeat3B) {
        parts.push(dict.ui.durationHeading, ...DURATION_KEYS.map((k) => dict.duration[k].label));
      }
      if (showBeat3C) {
        parts.push(c.alsoFeel, c.alsoFeelHint, c.noExtraFinish, ...extraCandidates.map((s) => s.title));
      }
    }
    if (step === 4) {
      if (isEmergency) parts.push(dict.ui.emergency.title, dict.ui.emergency.description);
      else if (careLevel) parts.push(dict.urgency[careLevel].title, dict.urgency[careLevel].intro);
      if (forWhom === "child") parts.push(c.childNote);
    }
    return parts.filter(Boolean);
  }
  useEffect(() => {
    spokenPartsRef.current = spokenParts;
  });

  function handleToggleStepVoice() {
    if (autoSpeakTimer.current) {
      clearTimeout(autoSpeakTimer.current);
      autoSpeakTimer.current = null;
    }
    if (voice.speaking) {
      voice.stop();
      setSpeakingCardId(null);
      setAutoVoiceGuide(false);
    } else {
      setSpeakingCardId(null);
      setAutoVoiceGuide(true);
      voice.speak(spokenParts());
    }
  }

  function handleTurnOffAutoVoice() {
    if (autoSpeakTimer.current) {
      clearTimeout(autoSpeakTimer.current);
      autoSpeakTimer.current = null;
    }
    voice.stop();
    setSpeakingCardId(null);
    setAutoVoiceGuide(false);
  }

  function handleSpeakCard(cardId: string, textParts: (string | undefined)[]) {
    if (autoSpeakTimer.current) {
      clearTimeout(autoSpeakTimer.current);
      autoSpeakTimer.current = null;
    }
    if (voice.speaking && speakingCardId === cardId) {
      voice.stop();
      setSpeakingCardId(null);
    } else {
      setSpeakingCardId(cardId);
      voice.speak(textParts.filter((p): p is string => Boolean(p)));
    }
  }

  type Dict = ReturnType<typeof getHealthCheckTranslations>;
  function findIn(d: Dict, symptom: SymptomChoice | null) {
    return symptom && selectedPart ? d.symptoms[selectedPart]?.find((x) => x.id === symptom.id) ?? null : null;
  }

  function doctorNotes(d: Dict, recLabel: string, child: string): string[] {
    const notes: string[] = [];
    const urgent = findIn(d, urgentSymptom);
    if (isEmergency) {
      notes.push(`${recLabel}: ${d.ui.emergency.title}`);
      if (urgent) notes.push(`${d.ui.urgentBadge}: ${urgent.label || urgent.title}.`);
    } else if (careLevel) {
      notes.push(`${recLabel}: ${d.urgency[careLevel].title}`);
    }
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
    return { rows, notes: doctorNotes(ro, COPY.ro.recommendationGiven, COPY.ro.childRow) };
  }

  const roDict = getHealthCheckTranslations("ro");
  const recommendationTitle = isEmergency
    ? dict.ui.emergency.title
    : careLevel
      ? dict.urgency[careLevel].title
      : "";
  const recommendationDetail = recommendationTitle
    ? `${c.recommendationGiven}: ${recommendationTitle}`
    : undefined;
  const romanianRecommendationTitle = isEmergency
    ? roDict.ui.emergency.title
    : careLevel
      ? roDict.urgency[careLevel].title
      : "";
  const romanianRecommendationDetail = romanianRecommendationTitle
    ? `${COPY.ro.recommendationGiven}: ${romanianRecommendationTitle}`
    : undefined;

  const permalinkState =
    selectedPart && selectedSymptom
      ? {
          part: selectedPart,
          subRegion: detail?.subRegion ?? null,
          side: detail?.side ?? "Center",
          symptomId: selectedSymptom.id,
          extraSymptomIds: extraSymptoms.map((s) => s.id),
          severity,
          duration,
          forWhom,
          bodyProfile,
        }
      : null;
  const reproduceUrl =
    originUrl && permalinkState ? buildTriageReproductionUrl(originUrl, activeLang, permalinkState) : undefined;
  const romanianReproduceUrl =
    originUrl && permalinkState ? buildTriageReproductionUrl(originUrl, "ro", permalinkState) : undefined;

  const stageVisibleInLayout = bodyShown && step < 4;

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
            <StethoscopeIcon className="h-4 w-4 shrink-0 text-sapphire" aria-hidden="true" />
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
      lines.push(`${c.recommendationGiven}: ${dict.ui.emergency.title}`);
      lines.push(dict.ui.emergency.description);
    } else if (careLevel) {
      lines.push(`${c.recommendationGiven}: ${dict.urgency[careLevel].title}`);
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
    if (reproduceUrl) {
      lines.push("");
      lines.push(reproduceUrl);
    }
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

      <header ref={headerRef} className={`scroll-mt-4 pb-4 sm:pb-6 ${step === 4 || bodyShown ? "" : "max-w-2xl"}`}>
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

      <div
        className={
          stageVisibleInLayout
            ? "grid grid-cols-1 gap-x-10 gap-y-5 lg:grid-cols-12"
            : step === 4
              ? "grid w-full grid-cols-1 gap-y-5"
              : "grid max-w-2xl grid-cols-1 gap-y-5"
        }
      >
        {step > 1 && step < 4 && bodyShown && (
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

        {/* The body stays mounted across steps: one WebGL context, hidden on Step 4 so results render full width. */}
        <section
          aria-label={dict.ui.viewer3D.subModelInfo}
          className={
            step === 4
              ? "hidden"
              : bodyShown
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
            onSelectDetailedAnatomy={(part, subRegion, side) => {
              applySubRegionDetail(part, subRegion, side);
            }}
            bodyProfile={bodyProfile}
            onBodyProfileChange={handleBodyProfileChange}
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

        <section aria-labelledby={`${baseId}-q`} className={`min-w-0 ${stageVisibleInLayout ? "lg:col-span-5" : ""}`}>
          <div key={step} className={stepDir ? "hc-step" : undefined} data-dir={stepDir ?? undefined}>
          {step < 4 && (
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
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
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                  {autoVoiceGuide && (
                    <button
                      type="button"
                      onClick={handleTurnOffAutoVoice}
                      aria-pressed={autoVoiceGuide}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-sapphire/30 bg-sapphire-soft/80 px-2.5 text-xs font-medium text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire lg:min-h-9"
                    >
                      <SpeakerIcon off={false} />
                      <span>{c.autoVoiceActive}</span>
                      <span aria-hidden="true" className="text-sapphire/75">×</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleToggleStepVoice}
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
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="mt-4 space-y-3.5">
              <div className="rounded-xl border border-border/85 bg-surface-subtle/70 px-3.5">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-1.5">
                  <p className="min-w-0 text-[13px] text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {forWhom === "child" ? c.forChild : c.forSelf}
                    </span>
                    <span aria-hidden="true"> · </span>
                    {c.bodyTypeLabel}:{" "}
                    <span className="font-semibold text-foreground">
                      {bodyProfile === "female" ? c.bodyFemale : c.bodyGeneral}
                    </span>
                  </p>
                  <button
                    type="button"
                    aria-expanded={setupOpen}
                    aria-controls={`${baseId}-setup`}
                    onClick={() => setSetupOpen((open) => !open)}
                    className="inline-flex min-h-11 shrink-0 items-center rounded-md px-1.5 text-[13px] font-semibold text-sapphire underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire lg:min-h-9"
                  >
                    {c.change}
                  </button>
                </div>
                {setupOpen && (
                <div id={`${baseId}-setup`} className="divide-y divide-border/65 border-t border-border/65">
                <div className="flex flex-wrap items-center justify-between gap-2.5 py-2">
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

                  <div className="flex flex-wrap items-center justify-between gap-2.5 py-2">
                    <span id={`${baseId}-anat`} className="text-[13px] font-medium text-muted-foreground">
                      {c.bodyTypeLabel}
                    </span>
                    <div
                      role="radiogroup"
                      aria-labelledby={`${baseId}-anat`}
                      onKeyDown={handleRadioKeys}
                      className="inline-grid grid-cols-2 gap-1 rounded-lg border border-border/80 bg-muted/80 p-0.5"
                    >
                      {(
                        [
                          { id: "general", label: c.bodyGeneral },
                          { id: "female", label: c.bodyFemale },
                        ] as const
                      ).map((opt) => {
                        const active = bodyProfile === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            tabIndex={active ? 0 : -1}
                            onClick={() => handleBodyProfileChange(opt.id)}
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
                </div>
                )}
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
            <div className="mt-4 space-y-4">
              {renderAreaContextCard(true)}
              <div ref={beat2BRef} className="space-y-2">
                {detail && predictedPartition.secondary.length > 0 && !showAllAreaSymptoms ? (
                  <p className={sectionLabel}>
                    {c.showingSpotSymptoms.replace(
                      "{spot}",
                      getLocalizedSubRegion(detail.subRegion, activeLang).label,
                    )}
                  </p>
                ) : (
                  quickSpots.length > 0 && (
                    <p className={sectionLabel}>{c.whatItFeelsLike}</p>
                  )
                )}
                <div role="radiogroup" aria-labelledby={`${baseId}-q`} onKeyDown={handleRadioKeys} className="space-y-2">
                  {symptomsList.map((symptom, index) => {
                    const urgent = isAcuteSurgicalOrEmergency(symptom);
                    const isChecked = !otherChosen && selectedSymptom?.id === symptom.id;
                    return (
                      <OptionRow
                        key={symptom.id}
                        checked={isChecked}
                        focusable={!selectedSymptom && !otherChosen && index === 0}
                        onSelect={(byPointer) => handleSelectSymptom(symptom, byPointer)}
                        title={symptom.title}
                        description={symptom.description}
                        tone={urgent ? "urgent" : "default"}
                        iconBadge={<SymptomPictogram symptomId={symptom.id} urgent={urgent} checked={isChecked} />}
                        onSpeak={
                          voice.available
                            ? () => handleSpeakCard(symptom.id, [symptom.title, symptom.description])
                            : undefined
                        }
                        speakingThis={voice.speaking && speakingCardId === symptom.id}
                        speakLabel={`${c.listen}: ${symptom.title}`}
                        badge={
                          urgent ? (
                            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
                              <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              <span>{dict.ui.urgentBadge}</span>
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
                    iconBadge={<SymptomPictogram symptomId="other" checked={otherChosen} />}
                    onSpeak={
                      voice.available
                        ? () => handleSpeakCard("other", [c.otherTitle, c.otherDescription])
                        : undefined
                    }
                    speakingThis={voice.speaking && speakingCardId === "other"}
                    speakLabel={`${c.listen}: ${c.otherTitle}`}
                  />
                </div>

                {!showAllAreaSymptoms && predictedPartition.secondary.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAllAreaSymptoms(true)}
                    className="mt-1 inline-flex min-h-10 w-full items-center justify-between gap-2 rounded-lg border border-border/85 bg-surface-subtle/60 px-3.5 py-2 text-left text-xs font-semibold text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-sapphire/35 hover:bg-sapphire-soft/45 hover:text-obsidian-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire sm:text-[13px]"
                  >
                    <span>
                      {c.showAllAreaSymptoms} ({predictedPartition.secondary.length})
                    </span>
                    <svg
                      viewBox="0 0 20 20"
                      className="h-4 w-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m5 7.5 5 5 5-5" />
                    </svg>
                  </button>
                )}
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
              {renderAreaContextCard(false)}

              {/* Micro-progress indicator for Step 3 progressive Typeform rail */}
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border/75 bg-surface-subtle/60 px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground" aria-live="polite">
                  {step3ProgressText}
                </span>
                <span aria-hidden="true" className="inline-flex items-center gap-1.5">
                  {Array.from({ length: step3TotalBeats }, (_, idx) => {
                    const beatNum = idx + 1;
                    const activeOrDone = beatNum <= step3CurrentBeat;
                    return (
                      <span
                        key={beatNum}
                        className={`h-1 rounded-xs transition-all duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none ${
                          beatNum === step3CurrentBeat
                            ? "w-6 bg-sapphire"
                            : activeOrDone
                              ? "w-3.5 bg-sapphire/65"
                              : "w-3 bg-border"
                        }`}
                      />
                    );
                  })}
                </span>
              </div>

              {/* Beat 3A — Severity */}
              <fieldset>
                <legend id={`${baseId}-sev`} className="mb-2 block w-full">
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className={sectionLabel}>{dict.ui.severityHeading}</span>
                    {severity && (
                      <span
                        aria-hidden="true"
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          severity === "severe"
                            ? "text-primary"
                            : "text-sapphire"
                        }`}
                      >
                        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m3.5 8.5 2.8 2.8 6.2-6.6" />
                        </svg>
                        <span>{dict.severity[severity].title}</span>
                      </span>
                    )}
                  </span>
                </legend>
                <div role="radiogroup" aria-labelledby={`${baseId}-sev`} onKeyDown={handleRadioKeys} className="space-y-2">
                  {SEVERITY_KEYS.map((key) => (
                    <OptionRow
                      key={key}
                      checked={severity === key}
                      focusable={!severity && key === SEVERITY_KEYS[0]}
                      onSelect={(byPointer) => handleSelectSeverity(key, byPointer)}
                      title={dict.severity[key].title}
                      description={dict.severity[key].description}
                      tone={key === "severe" ? "urgent" : "default"}
                      iconBadge={<SeverityComfortVisual severityKey={key} checked={severity === key} />}
                      compact
                    />
                  ))}
                </div>
              </fieldset>

              {/* Beat 3B — Duration (progressively revealed once severity is chosen) */}
              {showBeat3B && (
                <ProgressiveBeat beatRef={beat3BRef} animateEntrance={beat3BAnimate}>
                  <fieldset>
                    <legend id={`${baseId}-dur`} className="mb-2 block w-full">
                      <span className="flex flex-wrap items-center justify-between gap-2">
                        <span className={sectionLabel}>{dict.ui.durationHeading}</span>
                        {duration && (
                          <span
                            aria-hidden="true"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-sapphire"
                          >
                            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m3.5 8.5 2.8 2.8 6.2-6.6" />
                            </svg>
                            <span>{dict.duration[duration].label}</span>
                          </span>
                        )}
                      </span>
                    </legend>
                    <div
                      role="radiogroup"
                      aria-labelledby={`${baseId}-dur`}
                      onKeyDown={handleRadioKeys}
                      className={`grid grid-cols-1 gap-2 ${stageVisibleInLayout ? "sm:grid-cols-2 lg:grid-cols-1" : "sm:grid-cols-2"}`}
                    >
                      {DURATION_KEYS.map((key) => (
                        <OptionRow
                          key={key}
                          checked={duration === key}
                          focusable={!duration && key === DURATION_KEYS[0]}
                          onSelect={(byPointer) => handleSelectDuration(key, byPointer)}
                          title={dict.duration[key].label}
                          description={dict.duration[key].hint}
                          iconBadge={<DurationHorizonVisual durationKey={key} checked={duration === key} />}
                          compact
                        />
                      ))}
                    </div>
                  </fieldset>
                </ProgressiveBeat>
              )}

              {/* Beat 3C — Companion symptoms + prominent 1-tap fast-finish (revealed once both severity and duration are chosen) */}
              {showBeat3C && (
                <ProgressiveBeat beatRef={beat3CRef} animateEntrance={beat3CAnimate}>
                  <fieldset>
                    <legend className={sectionLabel}>{c.alsoFeel}</legend>
                    <p className="mb-2.5 text-sm text-muted-foreground">{c.alsoFeelHint}</p>

                    <button
                      type="button"
                      onClick={() => goToStep(4)}
                      className="group mb-3 flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-sapphire/35 bg-sapphire-soft/65 px-3.5 py-2.5 text-left text-[15px] font-semibold text-obsidian-navy transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-sapphire hover:bg-sapphire-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2"
                    >
                      <span className="inline-flex min-w-0 items-center gap-2.5">
                        <span
                          aria-hidden="true"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sapphire text-white"
                        >
                          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m3.5 8.5 2.8 2.8 6.2-6.6" />
                          </svg>
                        </span>
                        <span className="min-w-0 leading-snug">
                          {extraSymptoms.length === 0
                            ? c.noExtraFinish
                            : `${dict.ui.finishButton} (${extraSymptoms.length})`}
                        </span>
                      </span>
                      <ArrowRightIcon
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-sapphire transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5 motion-reduce:transform-none"
                      />
                    </button>

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
                              className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-sapphire)]"
                            />
                            <SymptomPictogram symptomId={symptom.id} urgent={urgent} checked={checked} />
                            <span className="min-w-0 flex-1">
                              <span className="block text-[15px] font-semibold leading-snug text-foreground">{symptom.title}</span>
                              {urgent && (
                                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                                  <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                  <span>{dict.ui.urgentBadge}</span>
                                </span>
                              )}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                </ProgressiveBeat>
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
                  <span className="text-xs font-semibold tracking-tight text-obsidian-navy">
                    {c.sheetBadge}
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

                    {voice.available && autoVoiceGuide && (
                      <button
                        type="button"
                        onClick={handleTurnOffAutoVoice}
                        aria-pressed={autoVoiceGuide}
                        className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-md border border-sapphire/30 bg-sapphire-soft/85 px-2.5 text-xs font-medium text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire lg:min-h-9"
                      >
                        <SpeakerIcon off={false} />
                        <span>{c.autoVoiceActive}</span>
                        <span aria-hidden="true" className="text-sapphire/75">×</span>
                      </button>
                    )}

                    {voice.available && (
                      <button
                        type="button"
                        onClick={handleToggleStepVoice}
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

                {restoredFromQr && recommendationDetail && (
                  <div
                    role="status"
                    className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-sapphire/30 bg-sapphire-soft/70 px-3.5 py-2.5"
                  >
                    <span className="text-xs font-semibold text-sapphire">{c.qrRestoredBadge}</span>
                    <span className="text-xs font-semibold text-obsidian-navy sm:text-[13px]">
                      {recommendationDetail}
                    </span>
                  </div>
                )}
              </div>

              {/* Full-width two-pane clinical sheet on desktop (3D model hidden on Step 4) */}
              <div className="divide-y divide-slate-200/90 lg:grid lg:grid-cols-12 lg:divide-x lg:divide-y-0">
                <div className="divide-y divide-slate-200/90 lg:col-span-7">
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

                  {/* Home care can still end in a doctor's call if the person wants one. */}
                  {!isEmergency && careLevel === "low" && (
                    <div className="hc-diag-band hc-diag-band-3 bg-[#f9f8f3] px-5 py-5 sm:px-6">
                      <h3 className="text-base font-semibold text-obsidian-navy">{c.doctorTitle}</h3>
                      <p className="mb-3 mt-1 text-[15px] text-slate-600">{c.doctorBody}</p>
                      {doctorLinks}
                    </div>
                  )}
                </div>

                {/* Right pane on desktop — Structured clinical ledger ("Summary for the doctor"), pain diagram, and QR handoff */}
                <div className="bg-[#fafbfd] lg:col-span-5">
                  <details
                    ref={summaryFoldRef}
                    open
                    className="hc-diag-band hc-diag-band-2 group px-5 py-5 sm:px-6"
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
                      painLocation={
                        selectedPart
                          ? {
                              part: selectedPart,
                              subRegion: detail?.subRegion ?? null,
                              side: detail?.side ?? "Center",
                            }
                          : undefined
                      }
                      symptoms={allSymptoms.map((s) => s.title)}
                      painLevel={severity ? dict.severity[severity].title : undefined}
                      duration={duration ? dict.duration[duration].label : undefined}
                      redFlagNoticed={isEmergency}
                      recommendationDetail={recommendationDetail}
                      romanianRecommendationDetail={romanianRecommendationDetail}
                      reproduceUrl={reproduceUrl}
                      romanianReproduceUrl={romanianReproduceUrl}
                      doctorNotes={doctorNotes(dict, c.recommendationGiven, c.childRow)}
                      doctorSymptom={allSymptoms.map((s) => s.label || s.title).join("; ") || undefined}
                      romanian={activeLang === "ro" ? undefined : romanianSummary()}
                      doctorOpen={doctorOpen}
                      onDoctorOpenChange={(open) => (open ? openModal("doctor") : closeModal())}
                      lang={activeLang}
                    />
                  </details>
                </div>
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

        {/*
          Action bar: pinned to the bottom of the screen at every size, so Continue is always in
          reach however long the list above it is. At the end of the list it rests in its own place.
        */}
        <div data-sticky-actions className={`sticky bottom-0 z-20 -mx-5 border-t border-border bg-background px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:mx-0 sm:px-0 lg:pb-3 ${stageVisibleInLayout ? "lg:col-span-5 lg:col-start-8" : ""}`}>
          {/* The answers so far, each one a way back to its question (the step bar is off screen by now). */}
          {step > 1 && answerTrail.length > 0 && (
            <ul className="mb-2 hidden flex-wrap items-center gap-1 lg:flex">
              {answerTrail.map((item) => (
                <li key={item.step} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => goToStep(item.step)}
                    aria-label={`${stepTitles[item.step - 1]}: ${item.label}. ${c.change}`}
                    title={`${stepTitles[item.step - 1]}: ${item.label}`}
                    className="inline-flex min-h-7 max-w-[13rem] items-center rounded-md border border-border bg-card px-2.5 text-xs font-medium text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-sapphire/40 hover:bg-sapphire-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
                  >
                    <span className="truncate">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {/* Desktop: the hint on the left, the buttons on the right, so the bar stays one line tall. */}
          <div className="lg:flex lg:items-center lg:gap-3">
          <div className="min-w-0 lg:flex-1">
          {step < 4 && (
            <p className="mb-2 text-sm leading-snug text-muted-foreground lg:mb-0 lg:line-clamp-2" aria-live="polite">
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
          </div>
          <div className="flex items-center gap-2 lg:shrink-0">
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
                className="inline-flex min-h-12 flex-1 lg:min-w-[9.5rem] lg:flex-none items-center justify-center gap-2 rounded-lg bg-primary px-5 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-primary-hover"
              >
                <PhoneIcon className="h-5 w-5" />
                {dict.ui.emergency.call112Now}
              </a>
            ) : step < 4 ? (
              <button
                type="button"
                disabled={!canContinue}
                onClick={() => goToStep((step + 1) as Step)}
                className="inline-flex min-h-12 flex-1 lg:min-w-[9.5rem] lg:flex-none items-center justify-center gap-1.5 rounded-lg bg-foreground px-5 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-ink-800 disabled:cursor-not-allowed disabled:bg-border disabled:text-muted-foreground"
              >
                {step === 3 ? dict.ui.finishButton : dict.ui.nextButton}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openModal("doctor")}
                className="inline-flex min-h-12 flex-1 lg:min-w-[9.5rem] lg:flex-none items-center justify-center rounded-lg bg-foreground px-5 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-ink-800"
              >
                {dict.ui.showDoctor}
              </button>
            )}
          </div>
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
