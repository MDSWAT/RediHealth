"use client";

import { readPublicOrigin, SERVER_PUBLIC_ORIGIN } from "@/components/health-check/public-origin";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type SVGProps,
} from "react";
import Link from "next/link";
import { flushSync } from "react-dom";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  CopyIcon,
  PhoneIcon,
  PinIcon,
  StethoscopeIcon,
} from "@/components/ui/icons";
import {
  dangerPanel,
  emergencyButton,
  primaryButton,
  secondaryButton,
  softPanel,
  stepHeading,
  stepLead,
  subHeading,
} from "@/components/health-assistant/step-ui";
import { findHelpHref, findHelpLinks } from "@/lib/i18n/find-help-links";
import { prefersCalmOrReducedMotion, useTextScale } from "@/lib/comfort-preferences";
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
import { getTopicForSymptom } from "@/components/health-check/SymptomToTopicMapper";
import { predictSymptomsForSelection } from "@/components/health-check/symptom-prediction";
import {
  buildTriageNoteUrl,
  buildTriageReproductionUrl,
  parseTriageReproductionSearch,
} from "@/components/health-check/triage-permalink";
import {
  getCareLevel as computeTriageCareLevel,
  isAcuteSurgicalOrEmergency as checkAcuteSurgicalOrEmergency,
} from "@/components/health-check/triage-clinical-rules";
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
  type BodyPartId,
  type DurationId,
  type SeverityId,
  type SymptomChoice,
  type UrgencyLevel,
} from "@/lib/i18n/health-check-translations";

type StepId = "area" | "spot" | "symptom" | "severity" | "duration" | "extras" | "result";
type Side = "Left" | "Right" | "Center";
type ForWhom = "self" | "child";

const STEP_RANK: Record<StepId, number> = {
  area: 0,
  spot: 1,
  symptom: 2,
  severity: 3,
  duration: 4,
  extras: 5,
  result: 6,
};

/**
 * Desktop asks four things (where, what, how strong + since when, result), one screen each, like a
 * form. Phones keep one small question per screen and drill down like a settings menu.
 */
const DESKTOP_GROUP: Record<StepId, number> = {
  area: 0,
  spot: 0,
  symptom: 1,
  severity: 2,
  duration: 2,
  extras: 2,
  result: 3,
};
const DESKTOP_QUERY = "(min-width: 1024px)";
function subscribeDesktop(onChange: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

/**
 * The first comma-separated phrases that fit one phone line ("Headaches, jaw or ear pain"), so a
 * list row stays short without cutting a word in half. Falls back to the first phrase.
 */
function shortPhrases(text: string, maxChars = 30): string {
  const parts = text.split(/,\s+/);
  let out = parts[0];
  for (const part of parts.slice(1)) {
    if (out.length + 2 + part.length > maxChars) break;
    out = `${out}, ${part}`;
  }
  return out;
}

/** First sentence only, for the desktop subtitle. */
function firstSentence(text: string): string {
  const match = text.match(/^.*?[.!?。](?=\s|$)/);
  return match ? match[0] : text;
}

/** Key letter badge (desktop): replaces the radio circle, like a form's A/B/C keys. */
function KeyBadge({ letter, checked, urgent = false }: { letter: string; checked: boolean; urgent?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`hidden h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold tabular-nums transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] lg:inline-flex ${
        checked
          ? urgent
            ? "border-primary bg-primary text-white"
            : "border-sapphire bg-sapphire text-white"
          : urgent
            ? "border-primary/40 bg-card text-primary"
            : "border-border-control/60 bg-card text-muted-foreground"
      }`}
    >
      {letter}
    </span>
  );
}

/** iOS-style check on the right of a chosen row (phones). */
function RowCheck({ urgent = false }: { urgent?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={`h-4.5 w-4.5 shrink-0 self-center lg:hidden ${urgent ? "text-primary" : "text-sapphire"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3.5 8.5 2.8 2.8 6.2-6.6" />
    </svg>
  );
}

/** Letters shown on desktop options; pressing one picks that option. */
const HOTKEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Option list: on phones an inset grouped list (white group, hairline separators, no per-row
 * borders); on desktop separate compact rows.
 */
const optionGroup =
  "max-lg:overflow-hidden max-lg:rounded-xl max-lg:bg-card max-lg:shadow-[0_0_0_1px_var(--color-border)] lg:gap-2";
/** Hairline separator between rows, hidden above the first row (phones only). */
const groupedRow =
  "relative max-lg:before:pointer-events-none max-lg:before:absolute max-lg:before:left-4 max-lg:before:right-0 max-lg:before:top-0 max-lg:before:z-[1] max-lg:before:h-px max-lg:before:bg-border max-lg:first:before:hidden";
/** The same, with the separator starting after the row's icon, as in iOS lists. */
const groupedRowInset =
  "relative max-lg:before:pointer-events-none max-lg:before:absolute max-lg:before:left-[3.75rem] max-lg:before:right-0 max-lg:before:top-0 max-lg:before:z-[1] max-lg:before:h-px max-lg:before:bg-border max-lg:first:before:hidden";

const SEVERITY_KEYS: readonly SeverityId[] = ["mild", "moderate", "severe"] as const;
const DURATION_KEYS: readonly DurationId[] = ["today", "days", "weeks", "chronic"] as const;
const BODY_PARTS: readonly BodyPartId[] = ["head", "chest", "stomach", "pelvis", "back", "arm", "leg"] as const;
/** Calm pause after a pointer tap so the person sees their choice before advancing. */
const AUTO_ADVANCE_MS = 320;

function prefersReducedMotion(): boolean {
  return prefersCalmOrReducedMotion();
}

/** How much of the top of the screen is covered by pinned site chrome once scrolled. */
function pinnedChromeBottom(): number {
  const rootVar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--chrome-h"));
  if (Number.isFinite(rootVar) && rootVar > 0) return rootVar;
  let covered = 0;
  document.querySelectorAll<HTMLElement>("body > *, body > * > *, aside, header").forEach((el) => {
    const style = getComputedStyle(el);
    if (style.position !== "sticky" && style.position !== "fixed") return;
    const cssTop = parseFloat(style.top);
    if (!Number.isFinite(cssTop) || cssTop > 80) return;
    const r = el.getBoundingClientRect();
    if (r.height > 0 && r.height < window.innerHeight / 2) {
      const pinnedEdge = style.position === "sticky" ? Math.max(0, cssTop) + r.height : r.bottom;
      covered = Math.max(covered, pinnedEdge);
    }
  });
  return covered;
}

export function isAcuteSurgicalOrEmergency(symptom: SymptomChoice | null): boolean {
  return checkAcuteSurgicalOrEmergency(symptom);
}

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
  return computeTriageCareLevel(severity, duration, symptomIds, forWhom);
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
    e.key === "Home"
      ? 0
      : e.key === "End"
        ? radios.length - 1
        : e.key === "ArrowDown" || e.key === "ArrowRight"
          ? (i + 1) % radios.length
          : (i - 1 + radios.length) % radios.length;
  radios[next].focus();
  radios[next].click();
}

const ROMANIAN_POINT_LABEL = "Punct ales pe corp";

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

const AREA_VIEW_SWITCH_COPY: Record<Lang, { list: string; body3d: string; groupLabel: string }> = {
  ro: { list: "Listă", body3d: "Corp 3D", groupLabel: "Cum vrei să alegi zona" },
  en: { list: "List", body3d: "3D body", groupLabel: "How to choose the area" },
  sq: { list: "Lista", body3d: "Trupi 3D", groupLabel: "Si dëshiron ta zgjedhësh zonën" },
  it: { list: "Elenco", body3d: "Corpo 3D", groupLabel: "Come scegliere la zona" },
  hr: { list: "Popis", body3d: "3D tijelo", groupLabel: "Način odabira područja" },
  rom: { list: "Lista", body3d: "3D trupo", groupLabel: "Sar kames te alosares o than" },
  ru: { list: "Список", body3d: "3D-модель", groupLabel: "Способ выбора области" },
};

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

/**
 * Body area choice. Phones: a settings-style row (icon, title, subtitle, chevron) inside a grouped
 * list. Desktop: a compact tile with its key letter, two to a row.
 */
function AreaOptionCard({
  partId,
  checked,
  focusable = false,
  onSelect,
  title,
  description,
  hotkey,
}: {
  partId: BodyPartId;
  checked: boolean;
  focusable?: boolean;
  onSelect: (byPointer: boolean) => void;
  title: string;
  description: string;
  hotkey?: string;
}) {
  const Icon = BODY_PART_ICONS[partId];
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-keyshortcuts={hotkey}
      data-hotkey={hotkey}
      tabIndex={checked || focusable ? 0 : -1}
      onClick={(e: ReactMouseEvent<HTMLButtonElement>) => onSelect(e.detail > 0)}
      title={description}
      className={`${groupedRowInset} group flex w-full items-center gap-3 text-left transition-[border-color,background-color] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-lg:min-h-[3.75rem] max-lg:px-4 max-lg:py-2.5 max-lg:focus-visible:ring-inset max-lg:active:bg-muted lg:min-h-12 lg:rounded-xl lg:border lg:px-2.5 lg:py-2 lg:focus-visible:ring-offset-2 ${
        checked
          ? "max-lg:bg-sapphire-soft/40 lg:border-sapphire lg:bg-sapphire-soft/45"
          : "lg:border-border lg:bg-card lg:hover:border-sapphire/50 lg:hover:bg-sapphire-soft/25"
      }`}
    >
      {hotkey && <KeyBadge letter={hotkey} checked={checked} />}
      <span
        aria-hidden="true"
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] ${
          checked ? "bg-sapphire text-white" : "bg-sapphire-soft text-sapphire"
        }`}
      >
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold leading-snug text-foreground lg:text-[0.9375rem] lg:leading-tight">
          {title}
        </span>
        <span className="mt-0.5 line-clamp-1 text-sm leading-snug text-muted-foreground lg:hidden">
          {shortPhrases(description)}
        </span>
        <span className="sr-only max-lg:hidden">{description}</span>
      </span>
      {checked ? (
        <RowCheck />
      ) : (
        <ChevronRightIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground/60 lg:hidden" />
      )}
    </button>
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
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] ${
        urgent
          ? checked
            ? "bg-primary text-white"
            : "bg-primary-soft text-primary"
          : checked
            ? "bg-sapphire text-white"
            : "bg-sapphire-soft text-sapphire"
      }`}
    >
      {icon}
    </span>
  );
}

/** Comfort-scale visual for intensity step: expressive face + 1/2/3 intensity bars. */
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
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] ${
          urgent
            ? checked
              ? "bg-primary text-white"
              : "bg-primary-soft text-primary"
            : checked
              ? "bg-sapphire text-white"
              : "bg-sapphire-soft text-sapphire"
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
            className={`w-1 rounded-sm ${
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

/** Time-horizon visual for duration step. */
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
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] ${
        checked ? "bg-sapphire text-white" : "bg-sapphire-soft text-sapphire"
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

/**
 * Single-choice row. Phones: a grouped-list row with a check on the right when chosen.
 * Desktop: a compact bordered row led by its key letter.
 */
function OptionRow({
  checked,
  onSelect,
  title,
  description,
  badge,
  iconBadge,
  tone = "default",
  focusable = false,
  onSpeak,
  speakingThis = false,
  speakLabel,
  hotkey,
  inset = false,
}: {
  checked: boolean;
  onSelect: (byPointer: boolean) => void;
  title: string;
  description?: string;
  badge?: ReactNode;
  iconBadge?: ReactNode;
  tone?: "default" | "urgent";
  focusable?: boolean;
  onSpeak?: () => void;
  speakingThis?: boolean;
  speakLabel?: string;
  hotkey?: string;
  /** Separator starts after the icon (rows with an icon). */
  inset?: boolean;
}) {
  const urgent = tone === "urgent";
  return (
    <div className={inset ? groupedRowInset : groupedRow}>
      <button
        type="button"
        role="radio"
        aria-checked={checked}
        aria-keyshortcuts={hotkey}
        data-hotkey={hotkey}
        tabIndex={checked || focusable ? 0 : -1}
        onClick={(e: ReactMouseEvent<HTMLButtonElement>) => onSelect(e.detail > 0)}
        className={`flex w-full items-start gap-3 text-left transition-[border-color,background-color] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-lg:min-h-[3.25rem] max-lg:px-4 max-lg:py-3 max-lg:focus-visible:ring-inset max-lg:active:bg-muted lg:min-h-12 lg:rounded-xl lg:border lg:px-3 lg:py-2.5 lg:focus-visible:ring-offset-2 ${
          onSpeak ? "pr-12" : ""
        } ${
          checked
            ? urgent
              ? "max-lg:bg-primary-soft/45 lg:border-primary lg:bg-primary-soft/45"
              : "max-lg:bg-sapphire-soft/40 lg:border-sapphire lg:bg-sapphire-soft/40"
            : urgent
              ? "max-lg:bg-primary-soft/20 lg:border-primary/25 lg:bg-primary-soft/20 lg:hover:border-primary/45 lg:hover:bg-primary-soft/35"
              : "lg:border-border lg:bg-card lg:hover:border-sapphire/50 lg:hover:bg-sapphire-soft/25"
        }`}
      >
        {hotkey ? (
          <span className="mt-0.5 hidden lg:inline-flex">
            <KeyBadge letter={hotkey} checked={checked} urgent={urgent} />
          </span>
        ) : (
          <span
            aria-hidden="true"
            className={`mt-1 hidden h-[18px] w-[18px] shrink-0 items-center justify-center rounded-sm border-[1.5px] lg:flex ${
              checked
                ? urgent
                  ? "border-primary"
                  : "border-sapphire"
                : urgent
                  ? "border-primary/65"
                  : "border-foreground/45"
            }`}
          >
            {checked && <span className={`h-2 w-2 rounded-xs ${urgent ? "bg-primary" : "bg-sapphire"}`} />}
          </span>
        )}
        {iconBadge}
        <span className="min-w-0 flex-1 self-center">
          <span className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
            <span className="text-base font-semibold leading-snug text-foreground lg:text-[0.9375rem]">{title}</span>
            {badge}
          </span>
          {description && (
            <span
              title={checked ? undefined : description}
              className={`mt-0.5 text-sm leading-snug text-muted-foreground ${
                checked ? "block" : "line-clamp-2 lg:line-clamp-1"
              }`}
            >
              {description}
            </span>
          )}
        </span>
        {checked && <RowCheck urgent={urgent} />}
      </button>
      {onSpeak && (
        <button
          type="button"
          onClick={onSpeak}
          aria-pressed={speakingThis}
          aria-label={speakLabel}
          className={`absolute right-2 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:h-8 lg:w-8 ${
            speakingThis
              ? "bg-sapphire-soft text-sapphire"
              : "text-muted-foreground hover:bg-sapphire-soft/60 hover:text-sapphire"
          }`}
        >
          <SpeakerIcon off={speakingThis} />
        </button>
      )}
    </div>
  );
}

/** Continue button; on desktop it sits left with an "Enter" hint, as in a form. */
function ContinueRow({
  label,
  onClick,
  emergency = false,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  emergency?: boolean;
  disabled?: boolean;
}) {
  return (
    // Phones: pinned to the bottom of the screen (above the home indicator) while the list scrolls.
    <div className="flex items-center gap-3 pt-1 max-lg:sticky max-lg:bottom-0 max-lg:z-20 max-lg:-mx-4 max-lg:border-t max-lg:border-border/70 max-lg:bg-muted/90 max-lg:px-4 max-lg:pb-[max(0.75rem,env(safe-area-inset-bottom))] max-lg:pt-3 max-lg:backdrop-blur-md sm:max-lg:-mx-6 sm:max-lg:px-6">
      <button
        type="button"
        data-continue
        disabled={disabled}
        onClick={onClick}
        className={`${emergency ? emergencyButton : primaryButton} w-full lg:min-h-11 lg:w-auto lg:min-w-40`}
      >
        <span>{label}</span>
        <ArrowRightIcon className="h-4.5 w-4.5" aria-hidden="true" />
      </button>
      {!disabled && (
        <span aria-hidden="true" className="hidden items-center gap-1 text-xs text-muted-foreground lg:inline-flex">
          <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-sans text-[0.6875rem] font-semibold text-foreground">
            Enter ↵
          </kbd>
        </span>
      )}
    </div>
  );
}

/** "Start over" with an inline confirmation instead of a browser pop-up. */
function ResetControl({
  label,
  c,
  onConfirm,
}: {
  label: string;
  c: Copy;
  onConfirm: () => void;
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
        className="inline-flex min-h-11 items-center whitespace-nowrap rounded-xl px-2 text-sm font-semibold text-sapphire underline decoration-sapphire/30 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {label}
      </button>
    );
  }
  return (
    <span role="group" aria-label={c.confirmReset} className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span className="font-medium text-foreground">{c.confirmReset}</span>
      <button
        ref={yesRef}
        type="button"
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
        className="inline-flex min-h-11 items-center rounded-xl px-2 font-semibold whitespace-nowrap text-sapphire underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {c.confirmYes}
      </button>
      <button
        type="button"
        onClick={() => setAsking(false)}
        className="inline-flex min-h-11 items-center rounded-xl px-2 font-medium whitespace-nowrap text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

  const [stepId, setStepId] = useState<StepId>("area");
  const [forWhom, setForWhom] = useState<ForWhom>("self");
  const [bodyProfile, setBodyProfile] = useState<BodyAnatomyProfile>("general");
  const [selectedPart, setSelectedPart] = useState<BodyPartId | null>(null);
  const [detail, setDetail] = useState<{ subRegion: SubRegionId; side: Side } | null>(null);
  /** The side came from a tap on the left or right of the body, so it is not asked again. */
  const [sideFromBody, setSideFromBody] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomChoice | null>(null);
  const [extraSymptoms, setExtraSymptoms] = useState<SymptomChoice[]>([]);
  const [otherChosen, setOtherChosen] = useState(false);
  const [severity, setSeverity] = useState<SeverityId | null>(null);
  const [duration, setDuration] = useState<DurationId | null>(null);
  const [autoVoiceGuide, setAutoVoiceGuide] = useState(false);
  const [speakingCardId, setSpeakingCardId] = useState<string | null>(null);
  const [showEmergencyOverlay, setShowEmergencyOverlay] = useState(false);
  const [doctorOpen, setDoctorOpen] = useState(false);
  const [sheetCopied, setSheetCopied] = useState(false);
  const [restoredFromQr, setRestoredFromQr] = useState(false);
  const originUrl = useSyncExternalStore(
    () => () => {},
    readPublicOrigin,
    () => SERVER_PUBLIC_ORIGIN,
  );
  const [showAllAreaSymptoms, setShowAllAreaSymptoms] = useState(false);
  const [bodyShown, setBodyShown] = useState(true);
  const [largeText, toggleLargeText] = useLargeText();
  const voice = useReadAloud(activeLang);

  const [shownStepId, setShownStepId] = useState<StepId>("area");
  const [stepDir, setStepDir] = useState<"forward" | "back" | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  if (shownStepId !== stepId) {
    setStepDir(STEP_RANK[stepId] >= STEP_RANK[shownStepId] ? "forward" : "back");
    setShownStepId(stepId);
  }

  const headerRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  /** Phones: the sheet can be pulled down so the 3D body gets more room, or switched cleanly to list-first. */
  const [stageExpanded, setStageExpanded] = useState(false);
  const [mobileAreaModeOverride, setMobileAreaModeOverride] = useState<"3d" | "list" | null>(null);
  const [textScale] = useTextScale();
  const effectiveMobileAreaMode: "3d" | "list" = mobileAreaModeOverride ?? (textScale === "xl" ? "list" : "3d");
  const mobileListOnly = stepId === "area" && effectiveMobileAreaMode === "list";
  const stageExpandedRef = useRef(false);
  const sheetDragRef = useRef<{ y: number; dy: number } | null>(null);
  useEffect(() => {
    stageExpandedRef.current = stageExpanded;
  }, [stageExpanded]);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const emergencyRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSpeakTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sheetCopyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoVoiceGuideRef = useRef(autoVoiceGuide);
  const voiceAvailableRef = useRef(voice.available);
  const spokenPartsRef = useRef<() => string[]>(() => []);

  useEffect(() => {
    autoVoiceGuideRef.current = autoVoiceGuide;
    voiceAvailableRef.current = voice.available;
  }, [autoVoiceGuide, voice.available]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      if (autoSpeakTimer.current) clearTimeout(autoSpeakTimer.current);
      if (sheetCopyTimer.current) clearTimeout(sheetCopyTimer.current);
    };
  }, []);

  const allSymptoms = [selectedSymptom, ...extraSymptoms].filter(Boolean) as SymptomChoice[];
  const isEmergency = allSymptoms.some((s) => isAcuteSurgicalOrEmergency(s));
  const urgentSymptom = allSymptoms.find((s) => isAcuteSurgicalOrEmergency(s)) ?? null;

  const quickSpots = selectedPart
    ? QUICK_SPOTS_BY_MACRO[selectedPart].filter(
        (sub) => !(forWhom === "child" && bodyProfile !== "female" && FEMALE_ONLY_SUB_REGIONS.has(sub)),
      )
    : [];
  const hasSpotStep = !selectedPart || quickSpots.length > 0;

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
  const hasExtrasStep = !selectedPart || extraCandidates.length > 0;

  const isDesktop = useIsDesktop();
  /** On desktop, strength, duration and "also feeling" are one screen, shown under the "severity" step. */
  const viewStep: StepId =
    isDesktop && (stepId === "duration" || stepId === "extras") ? "severity" : stepId;

  const activeSteps: StepId[] =
    isEmergency && selectedSymptom
      ? ["area", ...(hasSpotStep ? (["spot"] as const) : []), "symptom", "result"]
      : isDesktop
        ? ["area", ...(hasSpotStep ? (["spot"] as const) : []), "symptom", "severity", "result"]
        : [
            "area",
            ...(hasSpotStep ? (["spot"] as const) : []),
            "symptom",
            "severity",
            "duration",
            ...(hasExtrasStep ? (["extras"] as const) : []),
            "result",
          ];

  const stepRef = useRef<StepId>("area");
  useEffect(() => {
    stepRef.current = stepId;
  }, [stepId]);

  const activeStepsRef = useRef<StepId[]>(activeSteps);
  const answersRef = useRef({
    part: false,
    hasSpotStep: true,
    symptom: false,
    emergency: false,
    severity: false,
    duration: false,
    hasExtrasStep: true,
    desktop: false,
  });
  useEffect(() => {
    activeStepsRef.current = activeSteps;
    answersRef.current = {
      part: Boolean(selectedPart),
      hasSpotStep,
      symptom: Boolean(selectedSymptom),
      emergency: isEmergency,
      severity: Boolean(severity),
      duration: Boolean(duration),
      hasExtrasStep,
      desktop: isDesktop,
    };
  });

  function clampAllowedStep(wanted: StepId): StepId {
    const a = answersRef.current;
    if (!a.part) return "area";
    if (wanted === "area") return "area";
    if (wanted === "spot" && a.hasSpotStep) return "spot";
    if (!a.symptom) return wanted === "spot" && a.hasSpotStep ? "spot" : "symptom";
    if (a.emergency) {
      return wanted === "result" ? "result" : "symptom";
    }
    if (wanted === "symptom") return "symptom";
    if (a.desktop) {
      if (!a.severity || !a.duration) return "severity";
      return wanted === "result" ? "result" : "severity";
    }
    if (!a.severity) return "severity";
    if (wanted === "severity") return "severity";
    if (!a.duration) return "duration";
    if (wanted === "duration") return "duration";
    if (wanted === "extras" && a.hasExtrasStep) return "extras";
    return "result";
  }

  /*
   * Browser history sync: every step transition and open dialog pushes one history entry so
   * hardware/browser Back walks cleanly through questions without leaving the page.
   */
  const stackRef = useRef<StepId[]>(["area"]);
  const posRef = useRef(0);
  const pendingTargetRef = useRef<StepId | null>(null);
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
        const spots = QUICK_SPOTS_BY_MACRO[parsed.part].filter(
          (sub) => !(parsed.forWhom === "child" && parsed.bodyProfile !== "female" && FEMALE_ONLY_SUB_REGIONS.has(sub)),
        );
        const partition = predictSymptomsForSelection(
          parsed.part,
          parsed.subRegion,
          regionSyms,
          isAcuteSurgicalOrEmergency,
        );
        const hasEx = partition.primary.filter((s) => s.id !== primarySym.id).length > 0;
        let restoredStack: StepId[];
        if (isEm) {
          restoredStack = ["area", ...(spots.length > 0 ? (["spot"] as const) : []), "symptom", "result"];
        } else if (parsed.severity && parsed.duration) {
          restoredStack = [
            "area",
            ...(spots.length > 0 ? (["spot"] as const) : []),
            "symptom",
            "severity",
            "duration",
            ...(hasEx ? (["extras"] as const) : []),
            "result",
          ];
        } else if (parsed.severity) {
          restoredStack = ["area", ...(spots.length > 0 ? (["spot"] as const) : []), "symptom", "severity", "duration"];
        } else {
          restoredStack = ["area", ...(spots.length > 0 ? (["spot"] as const) : []), "symptom", "severity"];
        }
        const targetStepId = restoredStack[restoredStack.length - 1];
        stackRef.current = restoredStack;
        posRef.current = restoredStack.length - 1;
        answersRef.current = {
          part: true,
          hasSpotStep: spots.length > 0,
          symptom: true,
          emergency: isEm,
          severity: Boolean(parsed.severity),
          duration: Boolean(parsed.duration),
          hasExtrasStep: hasEx,
          desktop: window.matchMedia(DESKTOP_QUERY).matches,
        };
        window.history.replaceState(
          { ...(window.history.state ?? {}), hcStepId: targetStepId, hcIdx: posRef.current, hcModal: false },
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
          if (parsed.fromQr) setRestoredFromQr(true);
          setShownStepId(targetStepId);
          setStepId(targetStepId);
        });
      } else {
        window.history.replaceState({ ...(window.history.state ?? {}), hcStepId: "area", hcIdx: 0 }, "");
      }
    } else {
      window.history.replaceState({ ...(window.history.state ?? {}), hcStepId: "area", hcIdx: 0 }, "");
    }

    const onPop = (e: PopStateEvent) => {
      const state = (e.state ?? {}) as { hcStepId?: StepId; hcIdx?: number };
      const idx = typeof state.hcIdx === "number" ? state.hcIdx : 0;
      posRef.current = idx;
      const wanted = pendingTargetRef.current ?? state.hcStepId ?? "area";
      pendingTargetRef.current = null;
      const next = clampAllowedStep(wanted);
      stackRef.current = stackRef.current.slice(0, idx + 1);
      stackRef.current[idx] = next;
      if (next !== state.hcStepId) {
        window.history.replaceState(
          { ...(window.history.state ?? {}), hcStepId: next, hcIdx: idx, hcModal: false },
          "",
        );
      }
      setShowEmergencyOverlay(false);
      setDoctorOpen(false);
      setStepId(next);
    };
    window.addEventListener("popstate", onPop);
    return () => {
      cancelled = true;
      window.removeEventListener("popstate", onPop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on mount
  }, []);

  function pushEntry(nextStep: StepId, modal = false) {
    posRef.current += 1;
    stackRef.current = stackRef.current.slice(0, posRef.current);
    stackRef.current[posRef.current] = nextStep;
    window.history.pushState(
      { ...(window.history.state ?? {}), hcStepId: nextStep, hcIdx: posRef.current, hcModal: modal },
      "",
    );
  }

  function goToStep(next: StepId) {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    const current = stepRef.current;
    if (next === current) return;
    if (STEP_RANK[next] > STEP_RANK[current]) {
      pushEntry(next);
      setStepId(next);
      return;
    }
    const stack = stackRef.current;
    let i = posRef.current - 1;
    while (i > 0 && STEP_RANK[stack[i]] > STEP_RANK[next]) i -= 1;
    i = Math.max(i, 0);
    const distance = posRef.current - i;
    if (distance > 0 && window.history.state?.hcIdx === posRef.current) {
      pendingTargetRef.current = next;
      window.history.go(-distance);
    } else {
      stackRef.current[posRef.current] = next;
      window.history.replaceState({ ...(window.history.state ?? {}), hcStepId: next, hcIdx: posRef.current }, "");
      setStepId(next);
    }
  }

  function advanceSoon(from: StepId, to: StepId, delayMs = AUTO_ADVANCE_MS) {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null;
      if (stepRef.current !== from || modalOpenRef.current) return;
      pushEntry(to);
      setStepId(to);
    }, delayMs);
  }

  function openModal(which: "emergency" | "doctor") {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    if (!modalOpenRef.current) pushEntry(stepRef.current, true);
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

  function handleContinueFromEmergencyModal() {
    setShowEmergencyOverlay(false);
    setDoctorOpen(false);
    if (window.history.state?.hcModal) {
      // Replace the modal entry directly with the result step so Back returns cleanly to symptom.
      stackRef.current[posRef.current] = "result";
      window.history.replaceState(
        { ...(window.history.state ?? {}), hcStepId: "result", hcIdx: posRef.current, hcModal: false },
        "",
      );
      setStepId("result");
    } else {
      goToStep("result");
    }
  }

  useDialogFocus(emergencyRef, showEmergencyOverlay, closeModal);

  /**
   * Phones: snap the sheet to "body small" or "body large". The layout changes once (so the camera
   * re-frames once) and the sheet glides from wherever the finger left it to its new place.
   */
  function snapSheet(expand: boolean) {
    const card = cardRef.current;
    const before = card?.getBoundingClientRect().top ?? 0;
    if (card) {
      card.style.transition = "none";
      card.style.transform = "";
    }
    if (expand !== stageExpandedRef.current) {
      stageExpandedRef.current = expand;
      flushSync(() => setStageExpanded(expand));
    }
    if (!card) return;
    const offset = before - card.getBoundingClientRect().top;
    if (Math.abs(offset) < 1 || prefersReducedMotion()) {
      card.style.transition = "";
      return;
    }
    card.style.transform = `translateY(${offset}px)`;
    void card.offsetHeight;
    card.style.transition = "transform 380ms cubic-bezier(0.32, 0.72, 0, 1)";
    card.style.transform = "";
    card.addEventListener(
      "transitionend",
      () => {
        card.style.transition = "";
      },
      { once: true },
    );
  }

  /** After a tap on the body, tuck the sheet back up once the camera has settled on the spot. */
  function collapseSheetSoon() {
    if (!stageExpandedRef.current) return;
    setTimeout(() => {
      if (stageExpandedRef.current) snapSheet(false);
    }, 450);
  }

  // Desktop, like a form: a letter (or number) key picks that option and moves on; Enter continues;
  // Backspace goes back a step.
  useEffect(() => {
    if (!isDesktop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.repeat || modalOpenRef.current) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, canvas, [contenteditable='true']")) return;
      const card = cardRef.current;
      if (!card) return;
      if (e.key === "Enter") {
        // Enter on an option that is already chosen moves on (as in a form); on anything else it
        // keeps its own meaning (pick that option, follow that link).
        const onChosenOption = target?.closest("[role='radio'][aria-checked='true']");
        if (!onChosenOption && target && target !== document.body && target.closest("button, a, [role='radio'], label")) {
          return;
        }
        const next = card.querySelector<HTMLButtonElement>("[data-continue]:not([disabled])");
        if (next) {
          e.preventDefault();
          next.click();
        }
        return;
      }
      if (e.key === "Backspace") {
        const back = card.querySelector<HTMLButtonElement>("[data-back]");
        if (back) {
          e.preventDefault();
          back.click();
        }
        return;
      }
      if (e.key.length !== 1) return;
      const option = card.querySelector<HTMLElement>(`[data-hotkey="${e.key.toUpperCase()}"]`);
      if (!option) return;
      e.preventDefault();
      option.focus({ preventScroll: true });
      // detail: 1 so the choice counts like a tap and the step moves on.
      option.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDesktop]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (autoSpeakTimer.current) clearTimeout(autoSpeakTimer.current);
    voice.stop();
    setSpeakingCardId(null);

    // Desktop keeps the title and both columns in view; phones bring the sheet up under the pinned body.
    const keepHeader = stepId === "area" || (isDesktop && stepId !== "result");
    const anchor = keepHeader ? headerRef.current : cardRef.current;
    if (anchor) {
      const covered = pinnedChromeBottom();
      const top = anchor.getBoundingClientRect().top;
      const stageHeight =
        stepId !== "result" && bodyShown ? (stageRef.current?.getBoundingClientRect().height ?? 0) : 0;
      const targetOffset = keepHeader ? 12 : stageHeight > 0 ? stageHeight - 16 : 8;
      const misplaced = keepHeader
        ? top < covered || top > window.innerHeight * 0.45
        : Math.abs(top - covered - targetOffset) > 20;
      if (misplaced) {
        const reduce = prefersReducedMotion();
        window.scrollTo({
          top: Math.max(0, window.scrollY + top - covered - targetOffset),
          behavior: reduce ? "auto" : "smooth",
        });
      }
    }
    stepHeadingRef.current?.focus({ preventScroll: true });

    if (autoVoiceGuideRef.current && voiceAvailableRef.current && stepId !== "area") {
      autoSpeakTimer.current = setTimeout(() => {
        autoSpeakTimer.current = null;
        if (!autoVoiceGuideRef.current || !voiceAvailableRef.current || modalOpenRef.current) return;
        voice.speak(spokenPartsRef.current());
      }, 120);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs strictly on step change
  }, [stepId]);

  function clearQrIfNeeded() {
    if (restoredFromQr) setRestoredFromQr(false);
  }

  function handleForWhomChange(next: ForWhom) {
    clearQrIfNeeded();
    setForWhom(next);
    if (next === "child" && bodyProfile !== "female" && detail && FEMALE_ONLY_SUB_REGIONS.has(detail.subRegion)) {
      setDetail(null);
    }
  }

  function handleBodyProfileChange(next: BodyAnatomyProfile) {
    clearQrIfNeeded();
    setBodyProfile(next);
    if (next === "general") {
      if (detail && FEMALE_ONLY_SUB_REGIONS.has(detail.subRegion)) {
        setDetail(null);
      }
      if (selectedSymptom && FEMALE_SYMPTOM_IDS.has(selectedSymptom.id)) {
        setSelectedSymptom(null);
      }
      setExtraSymptoms((prev) => prev.filter((s) => !FEMALE_SYMPTOM_IDS.has(s.id)));
    }
  }

  function handleSelectPart(partId: BodyPartId) {
    clearQrIfNeeded();
    if (partId !== selectedPart) {
      setDetail(null);
      setSelectedSymptom(null);
      setExtraSymptoms([]);
      setOtherChosen(false);
      setSeverity(null);
      setDuration(null);
      setShowAllAreaSymptoms(false);
    }
    setSelectedPart(partId);
  }

  function nextStepAfterArea(partId: BodyPartId): StepId {
    const spots = QUICK_SPOTS_BY_MACRO[partId].filter(
      (sub) => !(forWhom === "child" && bodyProfile !== "female" && FEMALE_ONLY_SUB_REGIONS.has(sub)),
    );
    return spots.length > 0 ? "spot" : "symptom";
  }

  function handleSelectFromBody(partId: BodyPartId) {
    collapseSheetSoon();
    setDetail(null);
    handleSelectPart(partId);
    if (stepRef.current === "area") {
      advanceSoon("area", nextStepAfterArea(partId));
    }
  }

  function handleSelectFromList(partId: BodyPartId, byPointer: boolean) {
    setDetail(null);
    handleSelectPart(partId);
    if (byPointer) {
      advanceSoon("area", nextStepAfterArea(partId));
    }
  }

  function applySubRegionDetail(
    partId: BodyPartId | null,
    subRegion: SubRegionId | null,
    side: Side,
    cancelAdvance = true,
  ) {
    if (cancelAdvance && advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    clearQrIfNeeded();
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
      }
      setExtraSymptoms((prev) => prev.filter((s) => validPrimaryIds.has(s.id)));
    }
  }

  function handleSelectQuickSpot(subRegion: SubRegionId | null, byPointer: boolean) {
    if (!subRegion) {
      applySubRegionDetail(selectedPart, null, "Center");
      if (byPointer) advanceSoon("spot", "symptom");
      return;
    }
    const bilateral = Boolean(SUB_REGION_INFO[subRegion]?.bilateral);
    if (detail?.subRegion !== subRegion) setSideFromBody(false);
    const nextSide: Side = detail?.subRegion === subRegion ? detail.side : "Center";
    applySubRegionDetail(selectedPart, subRegion, nextSide);
    if (byPointer && !bilateral) {
      advanceSoon("spot", "symptom", 360);
    }
  }

  function handleSelectSpotSide(subRegion: SubRegionId, side: Side) {
    clearQrIfNeeded();
    setSideFromBody(false);
    setDetail({ subRegion, side });
  }

  function handleSelectSymptom(symptom: SymptomChoice, byPointer: boolean) {
    clearQrIfNeeded();
    setOtherChosen(false);
    setSelectedSymptom(symptom);
    setExtraSymptoms((prev) => prev.filter((s) => s.id !== symptom.id));
    if (FEMALE_SYMPTOM_IDS.has(symptom.id)) {
      setBodyProfile("female");
    }
    if (isAcuteSurgicalOrEmergency(symptom)) {
      openModal("emergency");
    } else if (byPointer) {
      advanceSoon("symptom", "severity");
    }
  }

  function handleSelectSeverity(key: SeverityId, byPointer: boolean) {
    clearQrIfNeeded();
    setSeverity(key);
    if (isDesktop) {
      // One screen asks both: move on only once both are answered and nothing optional is left.
      if (byPointer && duration && extraCandidates.length === 0) advanceSoon(stepRef.current, "result", 420);
      return;
    }
    if (byPointer) {
      advanceSoon("severity", "duration");
    }
  }

  function handleSelectDuration(key: DurationId, byPointer: boolean) {
    clearQrIfNeeded();
    setDuration(key);
    if (isDesktop) {
      if (byPointer && severity && extraCandidates.length === 0) advanceSoon(stepRef.current, "result", 420);
      return;
    }
    if (byPointer) {
      advanceSoon("duration", extraCandidates.length > 0 ? "extras" : "result");
    }
  }

  function toggleExtra(symptom: SymptomChoice) {
    clearQrIfNeeded();
    const adding = !extraSymptoms.some((s) => s.id === symptom.id);
    setExtraSymptoms((prev) => (adding ? [...prev, symptom] : prev.filter((s) => s.id !== symptom.id)));
    if (adding && FEMALE_SYMPTOM_IDS.has(symptom.id)) {
      setBodyProfile("female");
    }
    if (adding && isAcuteSurgicalOrEmergency(symptom)) {
      openModal("emergency");
    }
  }

  function handleReset() {
    if (stepId === "area" && !selectedPart && !restoredFromQr) return;
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    if (autoSpeakTimer.current) {
      clearTimeout(autoSpeakTimer.current);
      autoSpeakTimer.current = null;
    }
    voice.stop();
    setSpeakingCardId(null);
    setAutoVoiceGuide(false);
    setRestoredFromQr(false);
    setShowAllAreaSymptoms(false);
    stackRef.current[posRef.current] = "area";
    window.history.replaceState(
      { ...(window.history.state ?? {}), hcStepId: "area", hcIdx: posRef.current, hcModal: false },
      "",
      window.location.pathname,
    );
    setStepId("area");
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
    setDoctorOpen(false);
    setSetupOpen(false);
  }

  const currentIdx = Math.max(0, activeSteps.indexOf(viewStep));
  const emergencyPath = isEmergency && Boolean(selectedSymptom);
  const displayStep = isDesktop
    ? emergencyPath && viewStep === "result"
      ? 3
      : DESKTOP_GROUP[viewStep] + 1
    : currentIdx + 1;
  const totalSteps = isDesktop ? (emergencyPath ? 3 : 4) : activeSteps.length;
  const stepIndicatorText = dict.ui.stepIndicator
    .replace("{current}", String(displayStep))
    .replace("{total}", String(totalSteps));

  const goBack = () => {
    if (currentIdx > 0) {
      goToStep(activeSteps[currentIdx - 1]);
    }
  };

  const topicMapping = selectedPart
    ? getTopicForSymptom(selectedPart, selectedSymptom?.id, activeLang, detail?.subRegion)
    : null;
  const careLevel =
    severity && duration ? getCareLevel(severity, duration, allSymptoms.map((s) => s.id), forWhom) : null;

  const detailLabel =
    detail && selectedPart
      ? `${getLocalizedSubRegion(detail.subRegion, activeLang).label}${
          detail.side === "Left" ? `, ${c.left}` : detail.side === "Right" ? `, ${c.right}` : ""
        }`
      : null;
  const areaLabel = selectedPart ? dict.bodyParts[selectedPart].title : null;

  const visceralFocus =
    STEP_RANK[stepId] >= STEP_RANK.symptom
      ? getVisceralFocusForSymptoms(allSymptoms, bodyProfile, detail?.side ?? "Center")
      : null;
  const activeSpotBilateral = Boolean(detail && SUB_REGION_INFO[detail.subRegion]?.bilateral);

  const currentQuestion =
    viewStep === "area"
      ? dict.ui.step1Question
      : viewStep === "spot"
        ? c.exactSpotHeading
        : viewStep === "symptom"
          ? dict.ui.step2Question
          : viewStep === "severity"
            ? isDesktop
              ? dict.ui.step3Question
              : dict.ui.severityHeading
            : viewStep === "duration"
              ? dict.ui.durationHeading
              : viewStep === "extras"
                ? c.alsoFeel
                : dict.ui.step4Question;

  const currentPrompt =
    viewStep === "area"
      ? bodyShown
        ? dict.ui.step1Prompt
        : c.chooseArea
      : viewStep === "spot"
        ? c.exactSpotLead
        : viewStep === "symptom"
          ? detail && predictedPartition.secondary.length > 0 && !showAllAreaSymptoms
            ? c.showingSpotSymptoms.replace(
                "{spot}",
                (() => {
                  const raw = getLocalizedSubRegion(detail.subRegion, activeLang).label;
                  const isAcronym =
                    raw.length > 1 && raw[1] === raw[1].toUpperCase() && raw[1] !== raw[1].toLowerCase();
                  return isAcronym ? raw : raw.charAt(0).toLowerCase() + raw.slice(1);
                })(),
              )
            : dict.ui.step2Prompt
          : viewStep === "severity"
            ? isDesktop
              ? dict.ui.step3Prompt
              : c.severityLead
            : viewStep === "duration"
              ? c.durationLead
              : viewStep === "extras"
                ? c.alsoFeelHint
                : dict.ui.step4Prompt;

  // Assistant trail chips: every prior decision is a 1-tap return chip with ↺.
  const trailItems: { key: string; label: string; target: StepId }[] = [];
  if (STEP_RANK[stepId] > STEP_RANK.area && areaLabel) {
    trailItems.push({
      key: "area",
      label: forWhom === "child" ? `${areaLabel} (${c.childRow.toLowerCase()})` : areaLabel,
      target: "area",
    });
  }
  if (STEP_RANK[stepId] > STEP_RANK.spot && hasSpotStep && selectedPart) {
    trailItems.push({
      key: "spot",
      label: detailLabel ?? c.exactSpotAny,
      target: "spot",
    });
  }
  if (STEP_RANK[stepId] > STEP_RANK.symptom && selectedSymptom) {
    trailItems.push({
      key: "symptom",
      label: selectedSymptom.title,
      target: "symptom",
    });
  }
  if (isDesktop) {
    // Desktop asks strength and duration together, so they come back as one chip.
    if (viewStep === "result" && severity && duration && !isEmergency) {
      trailItems.push({
        key: "severity",
        label: `${dict.severity[severity].title}, ${dict.duration[duration].label}${
          extraSymptoms.length > 0 ? `, +${extraSymptoms.length}` : ""
        }`,
        target: "severity",
      });
    }
  } else {
    if (STEP_RANK[stepId] > STEP_RANK.severity && severity && !isEmergency) {
      trailItems.push({
        key: "severity",
        label: dict.severity[severity].title,
        target: "severity",
      });
    }
    if (STEP_RANK[stepId] > STEP_RANK.duration && duration && !isEmergency) {
      trailItems.push({
        key: "duration",
        label: dict.duration[duration].label,
        target: "duration",
      });
    }
  }
  if (!isDesktop && stepId === "result" && extraSymptoms.length > 0 && hasExtrasStep && !isEmergency) {
    trailItems.push({
      key: "extras",
      label: `+${extraSymptoms.length}`,
      target: "extras",
    });
  }

  function spokenParts(): string[] {
    const parts: string[] = [currentQuestion, currentPrompt];
    if (stepId === "area") {
      parts.push(...BODY_PARTS.map((id) => dict.bodyParts[id].title));
    } else if (stepId === "spot") {
      parts.push(c.exactSpotAny, ...quickSpots.map((sub) => getLocalizedSubRegion(sub, activeLang).label));
    } else if (stepId === "symptom") {
      parts.push(...symptomsList.map((s) => s.title), c.otherTitle);
    } else if (viewStep === "severity" && isDesktop) {
      parts.push(dict.ui.severityHeading, ...SEVERITY_KEYS.map((k) => dict.severity[k].title));
      parts.push(dict.ui.durationHeading, ...DURATION_KEYS.map((k) => dict.duration[k].label));
    } else if (stepId === "severity") {
      parts.push(...SEVERITY_KEYS.map((k) => dict.severity[k].title));
    } else if (stepId === "duration") {
      parts.push(...DURATION_KEYS.map((k) => dict.duration[k].label));
    } else if (stepId === "extras") {
      parts.push(...extraCandidates.map((s) => s.title));
    } else if (stepId === "result") {
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
        ? [
            {
              label: ROMANIAN_POINT_LABEL,
              value: `${getLocalizedSubRegion(detail.subRegion, "ro").label}${
                detail.side === "Left" ? ", stânga" : detail.side === "Right" ? ", dreapta" : ""
              }`,
            },
          ]
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
  const todayIso = new Date().toISOString().slice(0, 10);
  const reproduceUrl =
    originUrl && permalinkState ? buildTriageReproductionUrl(originUrl, activeLang, permalinkState) : undefined;
  const romanianReproduceUrl =
    originUrl && permalinkState ? buildTriageReproductionUrl(originUrl, "ro", permalinkState) : undefined;
  const noteUrl =
    originUrl && permalinkState ? buildTriageNoteUrl(originUrl, activeLang, permalinkState, todayIso) : undefined;
  const romanianNoteUrl =
    originUrl && permalinkState ? buildTriageNoteUrl(originUrl, "ro", permalinkState, todayIso) : undefined;

  const stageVisibleInLayout = bodyShown && stepId !== "result";

  const places = findHelpLinks(activeLang);

  const placeLink = (category: InstituteCategory, label: string) => (
    <Link
      href={withLangPrefix(findHelpHref(category), activeLang)}
      className="group mt-3 flex min-h-12 items-center justify-between gap-3 whitespace-nowrap rounded-xl border border-border-control bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-sapphire/60 hover:bg-sapphire-soft/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-[0.9375rem]"
    >
      <span className="inline-flex min-w-0 items-center gap-2.5">
        <PinIcon className="h-4.5 w-4.5 shrink-0 text-sapphire" aria-hidden="true" />
        <span className="min-w-0 truncate">{label}</span>
      </span>
      <ArrowRightIcon
        className="h-4.5 w-4.5 shrink-0 text-sapphire transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-safe:group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );

  const routingIconButton =
    "press-row inline-flex h-11 w-[44px] min-h-11 min-w-[44px] sm:h-12 sm:w-12 sm:min-h-12 sm:min-w-12 shrink-0 items-center justify-center rounded-xl border border-border-control bg-card text-sapphire shadow-2xs transition-[background-color,border-color] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-sapphire/50 hover:bg-sapphire-soft/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  const renderRoutingStack = (placeCategory?: InstituteCategory, placeLabel?: string) => (
    <div className="flex flex-nowrap items-center gap-1.5 sm:gap-2">
      <Link
        href={withLangPrefix("/medic-online?source=triage", activeLang)}
        className={`${primaryButton} min-w-0 flex-1 justify-between px-3.5 sm:px-4 text-left whitespace-nowrap`}
      >
        <span className="min-w-0 truncate">{c.doctorBook}</span>
        <ArrowRightIcon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
      </Link>

      <Link
        href={withLangPrefix("/medic-online?queue=now&source=triage", activeLang)}
        aria-label={c.doctorNow}
        title={c.doctorNow}
        className={`${routingIconButton} whitespace-nowrap`}
      >
        <StethoscopeIcon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
        <span className="sr-only">{c.doctorNow}</span>
      </Link>

      {placeCategory && placeLabel && (
        <Link
          href={withLangPrefix(findHelpHref(placeCategory), activeLang)}
          aria-label={placeLabel}
          title={placeLabel}
          className={`${routingIconButton} whitespace-nowrap`}
        >
          <PinIcon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          <span className="sr-only">{placeLabel}</span>
        </Link>
      )}
    </div>
  );

  async function handleCopyDiagnosticSheet() {
    const lines: string[] = [
      `${dict.ui.step4Question} — RediHealth`,
      dict.ui.step4Prompt,
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
        {`${stepIndicatorText}: ${currentQuestion}`}
      </div>

      <div
        ref={gridRef}
        className={
          stageVisibleInLayout
            ? "grid grid-cols-1 lg:grid-cols-[minmax(0,1.12fr)_minmax(30rem,39rem)] xl:grid-cols-[minmax(0,1.18fr)_minmax(34rem,42rem)] 2xl:grid-cols-[minmax(0,1.15fr)_minmax(36rem,0.95fr)] lg:grid-rows-[auto_1fr] lg:gap-x-7 xl:gap-x-10"
            : ""
        }
      >
        <header
          ref={headerRef}
          className={`max-w-3xl ${stageVisibleInLayout ? "lg:col-start-1 lg:row-start-1" : ""}`}
        >
          <h1 className="text-2xl font-semibold tracking-[-0.025em] text-foreground text-balance sm:text-3xl">
            {dict.ui.heading}
          </h1>
          <p className="mt-1.5 max-w-[62ch] text-base leading-relaxed text-muted-foreground">
            <span className="lg:hidden">{dict.ui.subtitle}</span>
            <span className="hidden lg:inline">{firstSentence(dict.ui.subtitle)}</span>
          </p>

          {bodyShown && stepId === "area" && (
            <div
              role="group"
              aria-label={(AREA_VIEW_SWITCH_COPY[activeLang] ?? AREA_VIEW_SWITCH_COPY.ro).groupLabel}
              className="mt-3.5 grid grid-cols-2 gap-1.5 rounded-xl border border-border bg-muted/60 p-1 lg:hidden"
            >
              {(
                [
                  { id: "list", label: (AREA_VIEW_SWITCH_COPY[activeLang] ?? AREA_VIEW_SWITCH_COPY.ro).list },
                  { id: "3d", label: (AREA_VIEW_SWITCH_COPY[activeLang] ?? AREA_VIEW_SWITCH_COPY.ro).body3d },
                ] as const
              ).map((opt) => {
                const active = effectiveMobileAreaMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setMobileAreaModeOverride(opt.id)}
                    className={`min-h-11 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      active
                        ? "bg-card text-sapphire shadow-2xs ring-1 ring-border/70"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
        </header>

        {/* 3D stage: pinned under the site header on phones (unless list-first mode is active); left column on desktop. */}
        <section
          ref={stageRef}
          aria-label={dict.ui.viewer3D.subModelInfo}
          className={
            stepId === "result"
              ? "hidden"
              : bodyShown
                ? `${mobileListOnly ? "max-lg:hidden " : ""}mt-4 sm:mt-5 max-lg:sticky max-lg:top-[var(--chrome-h,0px)] max-lg:z-0 lg:col-start-1 lg:row-start-2 lg:mt-3.5`
                : stepId === "area"
                  ? "mt-5 mb-4"
                  : "hidden"
          }
        >
          <AnatomicalBodyMap
            selectedPart={selectedPart}
            onSelectPart={handleSelectFromBody}
            selectedSubRegion={detail?.subRegion ?? null}
            selectedSide={detail?.side ?? "Center"}
            onSelectDetailedAnatomy={(part, subRegion, side) => {
              collapseSheetSoon();
              setSideFromBody(Boolean(subRegion) && side !== "Center");
              applySubRegionDetail(part, subRegion, side, stepRef.current !== "area");
            }}
            bodyProfile={bodyProfile}
            onBodyProfileChange={handleBodyProfileChange}
            // Only open the body to the organs when the structure is inside; never swap layers just
            // because a symptom was picked (that flashing was the main source of visual overload).
            forcedLayerMode={visceralFocus?.layer === "organs" ? "organs" : null}
            focusSubRegion={visceralFocus?.subRegion ?? null}
            focusSide={visceralFocus?.side}
            lang={activeLang}
            hideMobileLiteracyCard
            stageClassName={`-mx-4 w-[calc(100%+2rem)] sm:mx-0 sm:w-full sm:rounded-2xl sm:border sm:border-border ${
              stageExpanded
                ? "h-[min(66svh,35rem)] sm:h-[min(68svh,38rem)]"
                : "h-[clamp(16rem,38svh,21rem)] sm:h-[clamp(18.5rem,42svh,24rem)]"
            } lg:w-full lg:max-w-none lg:h-[clamp(30rem,calc(100svh-var(--chrome-h,0px)-13rem),46rem)]`}
            toolsClassName={stepId === "area" ? "hidden lg:block" : "hidden"}
            controlsClassName="flex"
            decorative={stepId !== "area" && stepId !== "spot"}
            selectionLabel={detailLabel ?? areaLabel}
            onBodyShownChange={setBodyShown}
          />
        </section>

        {/* Question card: a sheet over the body on phones (or full calm card in list-first mode); pinned beside it on desktop. */}
        <section
          ref={cardRef}
          data-triage-card
          aria-labelledby={`${baseId}-q`}
          className={`min-w-0 rounded-2xl border border-border bg-card ${
            stageVisibleInLayout
              ? mobileListOnly
                ? "max-lg:mt-4 max-lg:p-4 max-lg:pb-6 sm:max-lg:p-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-[calc(var(--chrome-h,0px)+1rem)] lg:flex lg:max-h-[calc(100svh-var(--chrome-h,0px)-2.5rem)] lg:flex-col lg:self-start lg:overflow-hidden lg:p-0"
                : "max-lg:relative max-lg:z-10 max-lg:-mt-4 max-lg:overflow-x-clip max-lg:rounded-t-[1.5rem] max-lg:border-0 max-lg:bg-muted max-lg:px-4 max-lg:pb-6 max-lg:pt-2 max-lg:shadow-[0_-10px_30px_-18px_rgb(15_23_42/0.35)] max-sm:-mx-4 max-sm:rounded-b-none sm:max-lg:px-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-[calc(var(--chrome-h,0px)+1rem)] lg:flex lg:max-h-[calc(100svh-var(--chrome-h,0px)-2.5rem)] lg:flex-col lg:self-start lg:overflow-hidden lg:p-0"
              : "mt-6 w-full p-4 sm:mt-8 sm:p-8"
          }`}
        >
          {stageVisibleInLayout && !mobileListOnly && (
            // Sheet handle (phones): drag down for a bigger body, up (or tap) to bring the questions back.
            <button
              type="button"
              aria-expanded={stageExpanded}
              aria-label={stageExpanded ? c.showLessBody : c.showMoreBody}
              className="mx-auto -mt-1 mb-1 flex h-7 w-24 touch-none items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
              onPointerDown={(e) => {
                sheetDragRef.current = { y: e.clientY, dy: 0 };
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                  // Pointer already gone (or synthetic): the drag still works without capture.
                }
                if (cardRef.current) cardRef.current.style.transition = "none";
              }}
              onPointerMove={(e) => {
                const drag = sheetDragRef.current;
                const card = cardRef.current;
                if (!drag || !card) return;
                const raw = e.clientY - drag.y;
                // Follows the finger in the allowed direction, resists gently in the other.
                drag.dy = stageExpanded
                  ? raw > 0
                    ? raw * 0.25
                    : Math.max(raw, -320)
                  : raw < 0
                    ? raw * 0.25
                    : Math.min(raw, 320);
                card.style.transform = `translateY(${drag.dy}px)`;
              }}
              onPointerUp={() => {
                const drag = sheetDragRef.current;
                sheetDragRef.current = null;
                if (!drag) return;
                if (Math.abs(drag.dy) < 6) snapSheet(!stageExpanded);
                else if (drag.dy > 36) snapSheet(true);
                else if (drag.dy < -36) snapSheet(false);
                else snapSheet(stageExpanded);
              }}
              onPointerCancel={() => {
                sheetDragRef.current = null;
                snapSheet(stageExpanded);
              }}
              onClick={(e) => {
                // Keyboard and screen readers: Enter/Space toggles.
                if (e.detail === 0) snapSheet(!stageExpanded);
              }}
            >
              <span aria-hidden="true" className="h-1 w-9 rounded-sm bg-foreground/20" />
            </button>
          )}
          {/* Top bar: Back + Step X of Y + reading tools + progress + answer chips */}
          <div className={stageVisibleInLayout ? "mb-4 lg:mb-0 lg:shrink-0 lg:px-6 lg:pb-4 lg:pt-4" : "mb-7"}>
            <div className="flex flex-nowrap items-center justify-between gap-1.5 sm:gap-2">
              <div className="flex min-h-11 min-w-0 items-center gap-1.5 sm:gap-2">
                {displayStep > 1 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    data-back
                    aria-keyshortcuts="Backspace"
                    className="-ml-1.5 inline-flex min-h-11 shrink-0 items-center gap-0.5 whitespace-nowrap rounded-xl px-1 sm:px-1.5 text-sm font-medium text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:min-h-9 lg:gap-1.5 lg:px-2 lg:text-sm lg:font-semibold"
                  >
                    <ChevronRightIcon className="h-5 w-5 rotate-180 lg:hidden" aria-hidden="true" />
                    <ArrowLeftIcon className="hidden h-4 w-4 lg:block" aria-hidden="true" />
                    <span>{dict.ui.backButton}</span>
                    {/* Desktop: the key that goes back. */}
                    <kbd
                      aria-hidden="true"
                      className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 font-sans text-[0.6875rem] font-semibold leading-none text-foreground lg:inline"
                    >
                      ⌫
                    </kbd>
                  </button>
                ) : null}
                <p className="shrink-0 whitespace-nowrap text-xs font-medium text-muted-foreground tabular-nums sm:text-sm">
                  <span aria-hidden="true" className="sm:hidden">{displayStep}/{totalSteps}</span>
                  <span className="sr-only sm:not-sr-only">{stepIndicatorText}</span>
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                {stepId === "result" && (
                  <button
                    type="button"
                    onClick={handleCopyDiagnosticSheet}
                    aria-label={sheetCopied ? c.copiedSheet : c.copySheet}
                    title={sheetCopied ? c.copiedSheet : c.copySheet}
                    className={`inline-flex h-[44px] min-h-11 w-[44px] min-w-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border px-0 text-xs font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-11 sm:w-auto sm:min-w-11 sm:px-3 sm:text-sm lg:h-9 lg:min-h-9 lg:min-w-9 ${
                      sheetCopied
                        ? "border-sapphire bg-sapphire text-white"
                        : "border-border-control bg-card text-foreground hover:border-sapphire/60 hover:bg-sapphire-soft/30"
                    }`}
                  >
                    {sheetCopied ? (
                      <CheckCircleIcon className="h-4 w-4 shrink-0" />
                    ) : (
                      <CopyIcon className="h-4 w-4 shrink-0" />
                    )}
                    <span aria-live="polite" className="sr-only sm:not-sr-only">
                      {sheetCopied ? c.copiedSheet : c.copySheet}
                    </span>
                  </button>
                )}

                {voice.available && (
                  <button
                    type="button"
                    onClick={handleToggleStepVoice}
                    aria-pressed={voice.speaking}
                    aria-label={voice.speaking ? c.stopListening : c.listen}
                    title={voice.speaking ? c.stopListening : c.listen}
                    className={`inline-flex h-[44px] min-h-11 w-[44px] min-w-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border px-0 text-xs font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-11 sm:w-auto sm:min-w-11 sm:px-3 sm:text-sm lg:h-9 lg:min-h-9 lg:min-w-9 ${
                      voice.speaking
                        ? "border-sapphire bg-sapphire-soft text-sapphire"
                        : "border-border-control bg-card text-foreground hover:border-sapphire/60 hover:bg-sapphire-soft/30"
                    }`}
                  >
                    <SpeakerIcon off={voice.speaking} />
                    <span className="sr-only sm:not-sr-only">
                      {voice.speaking ? c.stopListening : c.listen}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={toggleLargeText}
                  aria-pressed={largeText}
                  aria-label={c.largeText}
                  title={c.largeText}
                  className={`inline-flex h-[44px] min-h-11 w-[44px] min-w-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border px-0 text-xs font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-11 sm:w-auto sm:min-w-11 sm:px-3 sm:text-sm lg:h-9 lg:min-h-9 lg:min-w-9 ${
                    largeText
                      ? "border-sapphire bg-sapphire-soft text-sapphire"
                      : "border-border-control bg-card text-foreground hover:border-sapphire/60 hover:bg-sapphire-soft/30"
                  }`}
                >
                  <span aria-hidden="true">A+</span>
                  <span className="sr-only">{c.largeText}</span>
                </button>
              </div>
            </div>

            <div
              className="mt-3 flex h-1 w-full gap-1.5"
              role="progressbar"
              aria-label={c.progressLabel}
              aria-valuenow={displayStep}
              aria-valuemin={1}
              aria-valuemax={totalSteps}
              aria-valuetext={stepIndicatorText}
            >
              {Array.from({ length: totalSteps }, (_, idx) => idx + 1).map((segment) => (
                <div
                  key={segment}
                  className={`h-1 flex-1 rounded-sm transition-colors duration-[var(--dur-base)] ease-[var(--ease-out-calm)] ${
                    displayStep >= segment ? "bg-sapphire dark:bg-sapphire-border" : "bg-border"
                  }`}
                />
              ))}
            </div>

            {trailItems.length > 0 && (
              // One quiet line of earlier answers, each a link back to that question. Full labels; when
              // they do not fit, the line scrolls sideways (snapped to the latest) and fades at the edge.
              <nav aria-label={c.selectedTrailLabel} className="mt-2.5">
                <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-muted-foreground sm:text-[0.8125rem]">
                  {trailItems.map((item, index) => (
                    <li key={item.key} className="flex min-w-0 max-w-full items-center">
                      {index > 0 && (
                        <span aria-hidden="true" className="mx-1.5 text-muted-foreground/50">
                          ›
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => goToStep(item.target)}
                        className="-my-1.5 inline-flex min-h-11 items-center rounded-md max-w-full py-1.5 font-medium whitespace-nowrap text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="max-w-[11rem] truncate sm:max-w-[16rem]">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </div>

          {/* Step body: phones push in sideways like a settings menu; desktop rises in like a form. */}
          <div
            className={
              stageVisibleInLayout
                ? "lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-auto lg:px-6 lg:pb-6 lg:pt-1"
                : undefined
            }
          >
          <div key={viewStep} className={stepDir ? "hc-step" : undefined} data-dir={stepDir ?? undefined}>
            <h2
              id={`${baseId}-q`}
              ref={stepHeadingRef}
              tabIndex={-1}
              className={`${stepHeading} outline-none`}
            >
              {currentQuestion}
            </h2>
            <p className={stepLead}>{currentPrompt}</p>

            {/* STEP 1 — Body Area */}
            {viewStep === "area" && (
              <div className="mt-4 space-y-3">
                {/* Phones: a quiet list heading (who it is for, which body) that opens into a small group. */}
                <div
                  className={`rounded-xl px-4 lg:bg-muted/55 lg:px-3.5 lg:py-1 ${
                    setupOpen ? "bg-card py-1 max-lg:shadow-[0_0_0_1px_var(--color-border)]" : "max-lg:-mb-1.5"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <p className="min-w-0 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {forWhom === "child" ? c.forChild : c.forSelf}
                      </span>
                      {", "}
                      {c.bodyTypeLabel.toLowerCase()}:{" "}
                      <span className="font-semibold text-foreground">
                        {bodyProfile === "female" ? c.bodyFemale.toLowerCase() : c.bodyGeneral.toLowerCase()}
                      </span>
                    </p>
                    <button
                      type="button"
                      aria-expanded={setupOpen}
                      aria-controls={`${baseId}-setup`}
                      onClick={() => setSetupOpen((open) => !open)}
                      className="-mr-2 inline-flex min-h-11 shrink-0 items-center rounded-xl px-2 text-sm font-semibold whitespace-nowrap text-sapphire underline decoration-sapphire/30 underline-offset-4 hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-lg:no-underline"
                    >
                      {c.change}
                    </button>
                  </div>

                  {setupOpen && (
                    <div id={`${baseId}-setup`} className="mt-2 divide-y divide-border/70 border-t border-border/70">
                      <div className="flex flex-wrap items-center justify-between gap-2.5 py-2.5">
                        <span id={`${baseId}-who`} className="text-sm font-medium text-muted-foreground">
                          {c.forWhom}
                        </span>
                        <div
                          role="radiogroup"
                          aria-labelledby={`${baseId}-who`}
                          onKeyDown={handleRadioKeys}
                          className="inline-flex flex-wrap gap-1 rounded-xl bg-background/80 p-1 ring-1 ring-border"
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
                                onClick={() => handleForWhomChange(opt.id)}
                                className={`inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-xs font-semibold whitespace-nowrap transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                  active
                                    ? "bg-sapphire text-white"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2.5 py-2.5">
                        <span id={`${baseId}-anat`} className="text-sm font-medium text-muted-foreground">
                          {c.bodyTypeLabel}
                        </span>
                        <div
                          role="radiogroup"
                          aria-labelledby={`${baseId}-anat`}
                          onKeyDown={handleRadioKeys}
                          className="inline-flex flex-wrap gap-1 rounded-xl bg-background/80 p-1 ring-1 ring-border"
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
                                className={`inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-xs font-semibold whitespace-nowrap transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                  active
                                    ? "bg-sapphire text-white"
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

                {bodyShown && (
                  <p className="hidden px-0.5 text-sm font-medium text-muted-foreground lg:block">{c.orList}</p>
                )}

                <div
                  role="radiogroup"
                  aria-labelledby={`${baseId}-q`}
                  onKeyDown={handleRadioKeys}
                  // Desktop: letters run down the left column first (A head … D pelvis), then the right.
                  className={`grid grid-cols-1 ${optionGroup} lg:grid-flow-col lg:grid-cols-2 lg:grid-rows-[repeat(var(--rows),auto)]`}
                  style={{ "--rows": Math.ceil(BODY_PARTS.length / 2) } as CSSProperties}
                >
                  {BODY_PARTS.map((id, index) => (
                    <AreaOptionCard
                      key={id}
                      hotkey={isDesktop ? HOTKEYS[index] : undefined}
                      partId={id}
                      checked={selectedPart === id}
                      focusable={!selectedPart && id === BODY_PARTS[0]}
                      onSelect={(byPointer) => handleSelectFromList(id, byPointer)}
                      title={dict.bodyParts[id].title}
                      description={dict.bodyParts[id].subtitle}
                    />
                  ))}
                </div>

                {selectedPart && (
                  <ContinueRow label={dict.ui.nextButton} onClick={() => goToStep(nextStepAfterArea(selectedPart))} />
                )}
              </div>
            )}

            {/* Exact spot (optional, synced live with the 3D body) */}
            {viewStep === "spot" && selectedPart && (
              <div className="mt-4 space-y-3">
                <div
                  role="radiogroup"
                  aria-labelledby={`${baseId}-q`}
                  onKeyDown={handleRadioKeys}
                  className={`grid grid-cols-1 ${optionGroup} lg:grid-flow-col lg:grid-cols-2 lg:grid-rows-[repeat(var(--rows),auto)]`}
                  style={{ "--rows": Math.ceil((quickSpots.length + 1) / 2) } as CSSProperties}
                >
                  <OptionRow
                    checked={detail === null}
                    focusable={detail === null}
                    hotkey={isDesktop ? HOTKEYS[0] : undefined}
                    onSelect={(byPointer) => handleSelectQuickSpot(null, byPointer)}
                    title={c.exactSpotAny}
                    description={isDesktop ? undefined : c.exactSpotAnyHint}
                  />
                  {quickSpots.map((sub, index) => {
                    const localized = getLocalizedSubRegion(sub, activeLang);
                    const active = detail?.subRegion === sub;
                    return (
                      <OptionRow
                        key={sub}
                        checked={active}
                        hotkey={isDesktop ? HOTKEYS[index + 1] : undefined}
                        onSelect={(byPointer) => handleSelectQuickSpot(sub, byPointer)}
                        title={localized.label}
                        description={isDesktop ? undefined : localized.summary}
                      />
                    );
                  })}
                </div>

                {/* A tap on the left or right of the body already answered this: say so in one line. */}
                {detail && activeSpotBilateral && sideFromBody && detail.side !== "Center" && (
                  <p className="flex min-h-11 items-center justify-between gap-3 rounded-xl bg-card px-3.5 text-sm text-foreground max-lg:shadow-[0_0_0_1px_var(--color-border)] lg:bg-muted/55">
                    <span>
                      {c.sideLabel}: <span className="font-semibold">{detail.side === "Left" ? c.left : c.right}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSideFromBody(false)}
                      className="inline-flex min-h-11 items-center rounded-md px-1.5 font-semibold whitespace-nowrap text-sapphire underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {c.change}
                    </button>
                  </p>
                )}

                {detail && activeSpotBilateral && !(sideFromBody && detail.side !== "Center") && (
                  <div
                    role="group"
                    aria-label={c.sideLabel}
                    className="rounded-xl bg-card p-3.5 max-lg:shadow-[0_0_0_1px_var(--color-border)] lg:bg-muted/55"
                  >
                    <p className="text-sm font-semibold text-foreground">{c.sideLabel}</p>
                    <div className="mt-2 flex flex-wrap gap-1 rounded-xl bg-muted p-1 lg:bg-background/80 lg:ring-1 lg:ring-border">
                      {(
                        [
                          { id: "Center", label: c.bothSides },
                          { id: "Left", label: c.left.charAt(0).toUpperCase() + c.left.slice(1) },
                          { id: "Right", label: c.right.charAt(0).toUpperCase() + c.right.slice(1) },
                        ] as const
                      ).map((opt, index) => {
                        const active = detail.side === opt.id;
                        const hotkey = String(index + 1);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            aria-pressed={active}
                            aria-keyshortcuts={hotkey}
                            data-hotkey={hotkey}
                            onClick={() => handleSelectSpotSide(detail.subRegion, opt.id)}
                            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-2.5 text-sm font-semibold flex-1 whitespace-nowrap sm:px-3 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                              active
                                ? "bg-card text-sapphire shadow-sm ring-1 ring-border lg:bg-sapphire lg:text-white lg:ring-0"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {/* Desktop: the number key that picks this side. */}
                            <kbd
                              aria-hidden="true"
                              className={`hidden rounded-md border px-1.5 py-0.5 font-sans text-[0.6875rem] font-semibold leading-none lg:inline ${
                                active ? "border-white/40 text-white" : "border-border bg-muted text-foreground"
                              }`}
                            >
                              {hotkey}
                            </kbd>
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <ContinueRow label={dict.ui.nextButton} onClick={() => goToStep("symptom")} />
              </div>
            )}

            {/* Main symptom */}
            {viewStep === "symptom" && (
              <div className="mt-4 space-y-3">
                <div
                  role="radiogroup"
                  aria-labelledby={`${baseId}-q`}
                  onKeyDown={handleRadioKeys}
                  className={`grid grid-cols-1 ${optionGroup}`}
                >
                  {symptomsList.map((symptom, index) => {
                    const urgent = isAcuteSurgicalOrEmergency(symptom);
                    const isChecked = !otherChosen && selectedSymptom?.id === symptom.id;
                    return (
                      <OptionRow
                        key={symptom.id}
                        inset
                        checked={isChecked}
                        hotkey={isDesktop ? HOTKEYS[index] : undefined}
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
                            <span className="shrink-0 text-xs font-semibold text-primary">
                              {dict.ui.urgentBadge}
                            </span>
                          ) : null
                        }
                      />
                    );
                  })}

                  <OptionRow
                    inset
                    checked={otherChosen}
                    hotkey={isDesktop ? HOTKEYS[symptomsList.length] : undefined}
                    onSelect={() => {
                      if (advanceTimer.current) {
                        clearTimeout(advanceTimer.current);
                        advanceTimer.current = null;
                      }
                      clearQrIfNeeded();
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
                    className="inline-flex min-h-11 w-full items-center justify-between gap-2 whitespace-nowrap rounded-xl bg-card px-4 py-2.5 text-left text-sm font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-lg:shadow-[0_0_0_1px_var(--color-border)] max-lg:active:bg-muted lg:min-h-11 lg:border lg:border-border-control lg:hover:border-sapphire/60 lg:hover:bg-sapphire-soft/30"
                  >
                    <span className="min-w-0 truncate">
                      {c.showAllAreaSymptoms} ({predictedPartition.secondary.length})
                    </span>
                    <ChevronRightIcon className="h-4 w-4 shrink-0 rotate-90" aria-hidden="true" />
                  </button>
                )}

                {otherChosen ? (
                  <div className={`${softPanel} max-lg:bg-card max-lg:shadow-[0_0_0_1px_var(--color-border)]`}>
                    <p className="text-base font-medium text-foreground">{c.otherBody}</p>
                    <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <Link href={withLangPrefix("/health-assistant", activeLang)} className={`${primaryButton} whitespace-nowrap text-sm sm:text-[0.9375rem]`}>
                        <span className="min-w-0 truncate">{c.otherAssistant}</span>
                        <ArrowRightIcon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                      </Link>
                      <Link href={withLangPrefix("/medic-online?source=triage", activeLang)} className={`${secondaryButton} whitespace-nowrap text-sm sm:text-[0.9375rem]`}>
                        <span className="min-w-0 truncate">{c.otherDoctor}</span>
                      </Link>
                    </div>
                  </div>
                ) : selectedSymptom ? (
                  <ContinueRow
                    label={isEmergency ? dict.ui.finishButton : dict.ui.nextButton}
                    onClick={() => goToStep(isEmergency ? "result" : "severity")}
                    emergency={isEmergency}
                  />
                ) : null}
              </div>
            )}

            {/* Desktop: strength, duration and "also feeling" on one screen */}
            {viewStep === "severity" && isDesktop && (
              <div className="mt-4 space-y-4">
                <div>
                  <p id={`${baseId}-sev`} className="text-sm font-semibold text-foreground">
                    {dict.ui.severityHeading}
                  </p>
                  <div
                    role="radiogroup"
                    aria-labelledby={`${baseId}-sev`}
                    onKeyDown={handleRadioKeys}
                    className="mt-2 flex flex-wrap gap-2"
                  >
                    {SEVERITY_KEYS.map((key, index) => {
                      const checked = severity === key;
                      const urgent = key === "severe";
                      return (
                        <button
                          key={key}
                          type="button"
                          role="radio"
                          aria-checked={checked}
                          aria-keyshortcuts={String(index + 1)}
                          data-hotkey={String(index + 1)}
                          tabIndex={checked || (!severity && index === 0) ? 0 : -1}
                          title={dict.severity[key].description}
                          onClick={(e) => handleSelectSeverity(key, e.detail > 0)}
                          className={`flex min-h-[4.75rem] flex-1 flex-col items-start gap-1.5 whitespace-nowrap rounded-xl border px-3 py-2.5 text-left transition-[border-color,background-color] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                            checked
                              ? urgent
                                ? "border-primary bg-primary-soft/45"
                                : "border-sapphire bg-sapphire-soft/45"
                              : "border-border bg-card hover:border-sapphire/50 hover:bg-sapphire-soft/25"
                          }`}
                        >
                          <span className="flex w-full items-center justify-between gap-2">
                            <SeverityComfortVisual severityKey={key} checked={checked} />
                            <KeyBadge letter={String(index + 1)} checked={checked} urgent={urgent} />
                          </span>
                          <span className="whitespace-nowrap text-sm font-semibold leading-snug text-foreground">
                            {dict.severity[key].title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {severity && (
                    <p className="mt-2 text-sm leading-snug text-muted-foreground">
                      {dict.severity[severity].description}
                    </p>
                  )}
                </div>

                <div>
                  <p id={`${baseId}-dur`} className="text-sm font-semibold text-foreground">
                    {dict.ui.durationHeading}
                  </p>
                  <div
                    role="radiogroup"
                    aria-labelledby={`${baseId}-dur`}
                    onKeyDown={handleRadioKeys}
                    className="mt-2 flex flex-wrap gap-2"
                  >
                    {DURATION_KEYS.map((key, index) => {
                      const checked = duration === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          role="radio"
                          aria-checked={checked}
                          aria-keyshortcuts={HOTKEYS[index]}
                          data-hotkey={HOTKEYS[index]}
                          tabIndex={checked || (!duration && index === 0) ? 0 : -1}
                          title={dict.duration[key].hint}
                          onClick={(e) => handleSelectDuration(key, e.detail > 0)}
                          className={`flex min-h-11 min-w-[13.5rem] flex-1 items-center gap-2.5 whitespace-nowrap rounded-xl border px-3 py-1.5 text-left transition-[border-color,background-color] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                            checked
                              ? "border-sapphire bg-sapphire-soft/45"
                              : "border-border bg-card hover:border-sapphire/50 hover:bg-sapphire-soft/25"
                          }`}
                        >
                          <KeyBadge letter={HOTKEYS[index]} checked={checked} />
                          <DurationHorizonVisual durationKey={key} checked={checked} />
                          <span className="whitespace-nowrap text-sm font-semibold leading-snug text-foreground">
                            {dict.duration[key].label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {extraCandidates.length > 0 && (
                  <div>
                    <p id={`${baseId}-also`} className="text-sm font-semibold text-foreground">
                      {c.alsoFeel}{" "}
                      <span className="font-normal text-muted-foreground">— {c.alsoFeelHint}</span>
                    </p>
                    <div role="group" aria-labelledby={`${baseId}-also`} className="mt-2 flex flex-wrap gap-1.5">
                      {extraCandidates.map((symptom) => {
                        const checked = extraSymptoms.some((s) => s.id === symptom.id);
                        const urgent = isAcuteSurgicalOrEmergency(symptom);
                        return (
                          <button
                            key={symptom.id}
                            type="button"
                            aria-pressed={checked}
                            title={symptom.description}
                            onClick={() => toggleExtra(symptom)}
                            className={`inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-lg whitespace-nowrap border px-3 py-1.5 text-left text-sm font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                              checked
                                ? urgent
                                  ? "border-primary bg-primary text-white press-solid"
                                  : "border-sapphire bg-sapphire text-white press-solid"
                                : urgent
                                  ? "border-primary/40 bg-primary-soft/30 text-primary press-row hover:border-primary/60"
                                  : "border-border-control bg-card text-foreground press-row hover:border-sapphire/50 hover:bg-sapphire-soft/25"
                            }`}
                          >
                            <span aria-hidden="true" className="shrink-0 text-xs">{checked ? "✓" : "+"}</span>
                            <span className="min-w-0 truncate">{symptom.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <ContinueRow
                  label={
                    extraSymptoms.length > 0 ? `${dict.ui.finishButton} (${extraSymptoms.length})` : dict.ui.finishButton
                  }
                  onClick={() => goToStep("result")}
                  emergency={isEmergency}
                  disabled={!severity || !duration}
                />
              </div>
            )}

            {/* Phones: strength */}
            {viewStep === "severity" && !isDesktop && (
              <div className="mt-4 space-y-3">
                <div
                  role="radiogroup"
                  aria-labelledby={`${baseId}-q`}
                  onKeyDown={handleRadioKeys}
                  className={`grid grid-cols-1 ${optionGroup}`}
                >
                  {SEVERITY_KEYS.map((key) => (
                    <OptionRow
                      key={key}
                      inset
                      checked={severity === key}
                      focusable={!severity && key === SEVERITY_KEYS[0]}
                      onSelect={(byPointer) => handleSelectSeverity(key, byPointer)}
                      title={dict.severity[key].title}
                      description={dict.severity[key].description}
                      tone={key === "severe" ? "urgent" : "default"}
                      iconBadge={<SeverityComfortVisual severityKey={key} checked={severity === key} />}
                    />
                  ))}
                </div>

                {severity && <ContinueRow label={dict.ui.nextButton} onClick={() => goToStep("duration")} />}
              </div>
            )}

            {/* Phones: since when */}
            {viewStep === "duration" && (
              <div className="mt-4 space-y-3">
                <div
                  role="radiogroup"
                  aria-labelledby={`${baseId}-q`}
                  onKeyDown={handleRadioKeys}
                  className={`grid grid-cols-1 ${optionGroup}`}
                >
                  {DURATION_KEYS.map((key) => (
                    <OptionRow
                      key={key}
                      inset
                      checked={duration === key}
                      focusable={!duration && key === DURATION_KEYS[0]}
                      onSelect={(byPointer) => handleSelectDuration(key, byPointer)}
                      title={dict.duration[key].label}
                      description={dict.duration[key].hint}
                      iconBadge={<DurationHorizonVisual durationKey={key} checked={duration === key} />}
                    />
                  ))}
                </div>

                {duration && (
                  <ContinueRow
                    label={extraCandidates.length > 0 ? dict.ui.nextButton : dict.ui.finishButton}
                    onClick={() => goToStep(extraCandidates.length > 0 ? "extras" : "result")}
                  />
                )}
              </div>
            )}

            {/* Phones: anything else (optional) */}
            {viewStep === "extras" && (
              <div className="mt-4 space-y-3">
                <div className={`grid grid-cols-1 ${optionGroup}`}>
                  {extraCandidates.map((symptom) => {
                    const checked = extraSymptoms.some((s) => s.id === symptom.id);
                    const urgent = isAcuteSurgicalOrEmergency(symptom);
                    return (
                      <label
                        key={symptom.id}
                        className={`${groupedRowInset} flex min-h-[3.25rem] cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] active:bg-muted has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-ring ${
                          checked ? (urgent ? "bg-primary-soft/40" : "bg-sapphire-soft/40") : urgent ? "bg-primary-soft/15" : ""
                        }`}
                      >
                        <SymptomPictogram symptomId={symptom.id} urgent={urgent} checked={checked} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-base font-semibold leading-snug text-foreground">
                            {symptom.title}
                          </span>
                          {urgent && (
                            <span className="mt-0.5 block text-xs font-semibold text-primary">
                              {dict.ui.urgentBadge}
                            </span>
                          )}
                        </span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleExtra(symptom)}
                          className="h-5 w-5 shrink-0 accent-[var(--color-sapphire)] focus-visible:outline-none"
                        />
                      </label>
                    );
                  })}
                </div>

                <ContinueRow
                  label={
                    extraSymptoms.length > 0 ? `${dict.ui.finishButton} (${extraSymptoms.length})` : dict.ui.finishButton
                  }
                  onClick={() => goToStep("result")}
                  emergency={isEmergency}
                />
              </div>
            )}

            {/* FINAL STEP — Full-Width Results & Clinical Handoff (3D hidden) */}
            {viewStep === "result" && (isEmergency || (severity && duration)) && (
              <div className="mt-6 space-y-6 select-text">
                {restoredFromQr && recommendationDetail && (
                  <div role="status" className={softPanel}>
                    <p className="text-sm font-semibold text-sapphire">{c.qrRestoredBadge}</p>
                    <p className="mt-1 text-base font-semibold text-foreground">{recommendationDetail}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
                  {/* Left column: Primary care guidance, what it may mean, and care routing */}
                  <div className="space-y-6 lg:sticky lg:top-[calc(var(--chrome-h,0px)+1rem)] lg:col-span-7 lg:-mx-1 lg:max-h-[calc(100dvh-var(--chrome-h,0px)-2rem)] lg:overflow-y-auto lg:overscroll-auto lg:px-1 lg:pr-2 lg:pb-3 print:static print:max-h-none print:overflow-visible">
                    {isEmergency ? (
                      <div className={dangerPanel} role="alert">
                        <h3 className="text-xl font-semibold leading-snug text-foreground">
                          {dict.ui.emergency.title}
                        </h3>
                        <p className="mt-2 text-base leading-relaxed text-foreground/90">
                          {dict.ui.emergency.description}
                        </p>
                        {urgentSymptom && (
                          <p className="mt-3 text-sm font-medium text-foreground">
                            <span className="font-semibold text-primary">
                              {dict.ui.emergency.whyEmergencyPrefix}
                            </span>{" "}
                            {urgentSymptom.title}
                          </p>
                        )}
                        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                          <a href="tel:112" className={`${emergencyButton} whitespace-nowrap text-sm sm:text-[0.9375rem]`}>
                            <PhoneIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                            <span className="min-w-0 truncate">{dict.ui.emergency.call112Now}</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => openModal("doctor")}
                            className={`${secondaryButton} whitespace-nowrap text-sm sm:text-[0.9375rem]`}
                          >
                            <span className="min-w-0 truncate">{dict.ui.showDoctor}</span>
                          </button>
                        </div>
                        {placeLink("hospital", places.hospital)}
                      </div>
                    ) : (
                      careLevel && (
                        <div className="space-y-5">
                          <div
                            className={
                              careLevel === "high"
                                ? "rounded-2xl bg-amber-care-soft/55 p-5 sm:p-6 dark:bg-amber-care/15"
                                : softPanel
                            }
                          >
                            <p
                              className={`text-sm font-semibold ${
                                careLevel === "high" ? "text-amber-care" : "text-sapphire"
                              }`}
                            >
                              {c.nextStepLabel}
                            </p>
                            <h3 className="mt-1.5 text-lg font-semibold leading-snug tracking-[-0.015em] text-foreground text-balance sm:text-xl">
                              {dict.urgency[careLevel].title}
                            </h3>
                            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                              {dict.urgency[careLevel].intro}
                            </p>
                            {forWhom === "child" && (
                              <p className="mt-3 rounded-xl bg-amber-care-soft/80 px-3.5 py-2.5 text-sm font-medium leading-relaxed text-foreground dark:bg-amber-care/20">
                                {c.childNote}
                              </p>
                            )}
                          </div>

                          <div>
                            {careLevel === "low" && selectedSymptom?.selfCareTip ? (
                              <div className="space-y-4">
                                <div>
                                  <h4 className={subHeading}>{c.selfCare}</h4>
                                  <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">
                                    {selectedSymptom.selfCareTip}
                                  </p>
                                </div>
                                <div>
                                  <h4 className={subHeading}>{places.pharmacyFirst}</h4>
                                  <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">
                                    {places.pharmacyFirstHint}
                                  </p>
                                  {placeLink("pharmacy", places.nearestPharmacy)}
                                </div>
                              </div>
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

                    {selectedSymptom && !isEmergency && careLevel !== "high" && (
                      <div className="border-t border-border pt-6">
                        <h3 className={subHeading}>{c.meaning}</h3>
                        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                          {selectedSymptom.guidance || selectedSymptom.description}
                        </p>
                        {topicMapping && (
                          <Link
                            href={withLangPrefix(`/health-information/${topicMapping.slug}`, activeLang)}
                            className="group mt-4 flex min-h-12 items-center justify-between gap-3 whitespace-nowrap rounded-xl border border-border-control bg-card px-4 py-2.5 text-sm font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-sapphire/60 hover:bg-sapphire-soft/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-[0.9375rem]"
                          >
                            <span className="min-w-0 truncate">
                              {c.readAbout}: {topicMapping.title}
                            </span>
                            <ArrowRightIcon
                              className="h-4.5 w-4.5 shrink-0 text-sapphire transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-safe:group-hover:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </Link>
                        )}
                      </div>
                    )}

                    {!isEmergency && careLevel === "low" && (
                      <div className="border-t border-border pt-6">
                        <h3 className={subHeading}>{c.doctorTitle}</h3>
                        <p className="mb-3.5 mt-1.5 text-base leading-relaxed text-muted-foreground">
                          {c.doctorBody}
                        </p>
                        {renderRoutingStack()}
                      </div>
                    )}
                  </div>

                  {/* Right column: Doctor Summary, Anatomical Pain Diagram, PDF & QR Handoff */}
                  {/* Desktop: both columns stay in view and scroll on their own when taller than the screen, chaining smoothly to page scroll. */}
                  <div className="border-t border-border pt-6 lg:sticky lg:top-[calc(var(--chrome-h,0px)+1rem)] lg:col-span-5 lg:max-h-[calc(100dvh-var(--chrome-h,0px)-2rem)] lg:overflow-y-auto lg:overscroll-auto lg:border-l lg:border-t-0 lg:pl-8 lg:pr-2 lg:pb-3 lg:pt-0 print:static print:max-h-none print:overflow-visible">
                    <h3 className={subHeading}>{c.summaryFold}</h3>
                    <TriageSummaryCard
                      bare
                      bodyArea={
                        areaLabel
                          ? forWhom === "child"
                            ? `${areaLabel} (${c.childRow.toLowerCase()})`
                            : areaLabel
                          : ""
                      }
                      anatomicalStructure={detailLabel ?? undefined}
                      painLocation={
                        selectedPart
                          ? {
                              part: selectedPart,
                              subRegion: detail?.subRegion ?? null,
                              side: detail?.side ?? "Center",
                              bodyProfile,
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
                      noteUrl={noteUrl}
                      romanianNoteUrl={romanianNoteUrl}
                      doctorNotes={doctorNotes(dict, c.recommendationGiven, c.childRow)}
                      doctorSymptom={allSymptoms.map((s) => s.label || s.title).join("; ") || undefined}
                      romanian={activeLang === "ro" ? undefined : romanianSummary()}
                      doctorOpen={doctorOpen}
                      onDoctorOpenChange={(open) => (open ? openModal("doctor") : closeModal())}
                      lang={activeLang}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
                  <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {dict.ui.disclaimer}
                  </p>
                  <ResetControl label={dict.ui.resetButton} c={c} onConfirm={handleReset} />
                </div>
              </div>
            )}
          </div>
          </div>
        </section>
      </div>

      {/* Emergency 112 Alert Dialog */}
      {showEmergencyOverlay && urgentSymptom && (
        <div className="hc-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
          <div
            ref={emergencyRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`${baseId}-em-title`}
            aria-describedby={`${baseId}-em-desc`}
            className="hc-sheet w-full max-w-lg rounded-t-2xl border border-border bg-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl sm:p-7"
          >
            <h3 id={`${baseId}-em-title`} className="text-xl font-semibold leading-snug text-foreground">
              {dict.ui.emergency.title}
            </h3>
            <p id={`${baseId}-em-desc`} className="mt-2 text-base leading-relaxed text-muted-foreground">
              {dict.ui.emergency.description}
            </p>
            <p className="mt-3 text-base text-foreground">
              <span className="font-semibold text-primary">{dict.ui.emergency.whyEmergencyPrefix}</span>{" "}
              {urgentSymptom.title}
            </p>
            <div className="mt-6 grid gap-2.5 sm:grid-cols-[1fr_auto]">
              <a
                data-autofocus
                href="tel:112"
                className={`${emergencyButton} whitespace-nowrap text-sm sm:text-[0.9375rem]`}
              >
                <PhoneIcon className="h-5 w-5 shrink-0" />
                <span className="min-w-0 truncate">{dict.ui.emergency.call112Now}</span>
              </a>
              <button
                type="button"
                onClick={handleContinueFromEmergencyModal}
                className={`${secondaryButton} whitespace-nowrap text-sm sm:text-[0.9375rem]`}
              >
                <span className="min-w-0 truncate">{dict.ui.emergency.continueReview}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
