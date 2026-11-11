import {
  FEMALE_ONLY_SUB_REGIONS,
  SUB_REGION_INFO,
  type BodyAnatomyProfile,
  type SubRegionId,
} from "@/components/health-check/anatomy-3d-data";
import {
  getHealthCheckTranslations,
  type BodyPartId,
  type DurationId,
  type SeverityId,
} from "@/lib/i18n/health-check-translations";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

export type TriageSide = "Left" | "Right" | "Center";
export type TriageForWhom = "self" | "child";

const VALID_PARTS = new Set<BodyPartId>(["head", "chest", "stomach", "pelvis", "back", "arm", "leg"]);
const VALID_SIDES = new Set<TriageSide>(["Left", "Right", "Center"]);
const VALID_SEVERITIES = new Set<SeverityId>(["mild", "moderate", "severe"]);
const VALID_DURATIONS = new Set<DurationId>(["today", "days", "weeks", "chronic"]);

export interface TriagePermalinkState {
  part: BodyPartId;
  subRegion?: SubRegionId | null;
  side?: TriageSide;
  symptomId: string;
  extraSymptomIds?: string[];
  severity?: SeverityId | null;
  duration?: DurationId | null;
  forWhom?: TriageForWhom;
  bodyProfile?: BodyAnatomyProfile;
}

function buildTriageQueryParams(state: TriagePermalinkState, dateIso?: string): URLSearchParams {
  const params = new URLSearchParams();
  params.set("qr", "1");
  params.set("p", state.part);
  if (state.subRegion) {
    params.set("sr", state.subRegion);
    if (state.side && state.side !== "Center") {
      params.set("sd", state.side);
    }
  }
  params.set("sy", state.symptomId);
  if (state.extraSymptomIds && state.extraSymptomIds.length > 0) {
    params.set("ex", state.extraSymptomIds.join(","));
  }
  if (state.severity) params.set("sv", state.severity);
  if (state.duration) params.set("du", state.duration);
  if (state.forWhom === "child") params.set("fw", "child");
  if (state.bodyProfile === "female") params.set("bp", "female");
  if (dateIso && /^\d{4}-\d{2}-\d{2}$/.test(dateIso)) {
    params.set("dt", dateIso);
  }
  return params;
}

/**
 * Builds a compact, deterministic URL that reproduces the exact Step 4 triage result when scanned via QR.
 */
export function buildTriageReproductionUrl(
  origin: string,
  lang: Lang,
  state: TriagePermalinkState
): string {
  const params = buildTriageQueryParams(state);
  const basePath = withLangPrefix("/health-check", lang);
  const cleanOrigin = origin.replace(/\/+$/, "");
  return `${cleanOrigin}${basePath}?${params.toString()}`;
}

/**
 * Builds a compact URL to the distraction-free clinical note card opened when scanning a QR code
 * on iPhone (Safari) or Samsung / Android (Chrome), avoiding iOS Camera plain-text web-search behavior.
 */
export function buildTriageNoteUrl(
  origin: string,
  lang: Lang,
  state: TriagePermalinkState,
  dateIso?: string
): string {
  const params = buildTriageQueryParams(state, dateIso);
  const basePath = withLangPrefix("/health-check/note", lang);
  const cleanOrigin = origin.replace(/\/+$/, "");
  return `${cleanOrigin}${basePath}?${params.toString()}`;
}

export interface FallbackTriageNotePayload {
  bodyArea: string;
  anatomicalStructure?: string;
  symptoms: string[];
  painLevel?: string;
  duration?: string;
  redFlagNoticed?: boolean;
  recommendationDetail?: string;
  dateIso?: string;
}

/**
 * Builds a compact `/health-check/note` URL when `TriageSummaryCard` is rendered standalone without
 * structured symptom IDs, ensuring QR codes never fall back to raw plain text on iOS Camera.
 */
export function buildFallbackTriageNoteUrl(
  origin: string,
  lang: Lang,
  payload: FallbackTriageNotePayload
): string {
  const params = new URLSearchParams();
  params.set("qr", "1");
  if (payload.bodyArea) params.set("ba", payload.bodyArea.slice(0, 80));
  if (payload.anatomicalStructure) params.set("as", payload.anatomicalStructure.slice(0, 80));
  if (payload.symptoms.length > 0) params.set("syt", payload.symptoms.join(", ").slice(0, 140));
  if (payload.painLevel) params.set("pl", payload.painLevel.slice(0, 50));
  if (payload.duration) params.set("dut", payload.duration.slice(0, 50));
  if (payload.redFlagNoticed) params.set("rf", "1");
  if (payload.recommendationDetail) params.set("rc", payload.recommendationDetail.slice(0, 140));
  if (payload.dateIso && /^\d{4}-\d{2}-\d{2}$/.test(payload.dateIso)) {
    params.set("dt", payload.dateIso);
  }
  const basePath = withLangPrefix("/health-check/note", lang);
  const cleanOrigin = origin.replace(/\/+$/, "");
  return `${cleanOrigin}${basePath}?${params.toString()}`;
}

export function parseFallbackTriageNoteSearch(search: string): FallbackTriageNotePayload | null {
  if (!search) return null;
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const bodyArea = params.get("ba")?.trim() ?? "";
  const symptomsText = params.get("syt")?.trim() ?? "";
  if (!bodyArea && !symptomsText) return null;
  const dt = params.get("dt")?.trim();
  return {
    bodyArea,
    anatomicalStructure: params.get("as")?.trim() || undefined,
    symptoms: symptomsText ? symptomsText.split(/\s*,\s*/).filter(Boolean) : [],
    painLevel: params.get("pl")?.trim() || undefined,
    duration: params.get("dut")?.trim() || undefined,
    redFlagNoticed: params.get("rf") === "1",
    recommendationDetail: params.get("rc")?.trim() || undefined,
    dateIso: dt && /^\d{4}-\d{2}-\d{2}$/.test(dt) ? dt : undefined,
  };
}

export function parseTriageNoteDate(search: string): Date | null {
  if (!search) return null;
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const dt = params.get("dt")?.trim();
  if (!dt || !/^\d{4}-\d{2}-\d{2}$/.test(dt)) return null;
  const [y, m, d] = dt.split("-").map(Number);
  const parsed = new Date(y, m - 1, d);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export interface ParsedTriageReproduction {
  part: BodyPartId;
  subRegion: SubRegionId | null;
  side: TriageSide;
  symptomId: string;
  extraSymptomIds: string[];
  severity: SeverityId | null;
  duration: DurationId | null;
  forWhom: TriageForWhom;
  bodyProfile: BodyAnatomyProfile;
  fromQr: boolean;
}

/**
 * Validates and parses QR / permalink query parameters into a safe triage state.
 */
export function parseTriageReproductionSearch(
  search: string,
  lang: Lang
): ParsedTriageReproduction | null {
  if (!search) return null;
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const rawPart = params.get("p") as BodyPartId | null;
  const rawSymptom = params.get("sy");
  if (!rawPart || !VALID_PARTS.has(rawPart) || !rawSymptom) {
    return null;
  }

  const dict = getHealthCheckTranslations(lang);
  const regionSymptoms = dict.symptoms[rawPart] ?? [];
  const validIds = new Set(regionSymptoms.map((s) => s.id));
  if (!validIds.has(rawSymptom)) {
    return null;
  }

  const rawSub = params.get("sr") as SubRegionId | null;
  const subRegion =
    rawSub && SUB_REGION_INFO[rawSub] && SUB_REGION_INFO[rawSub].macroPart === rawPart
      ? rawSub
      : null;

  const rawSide = params.get("sd") as TriageSide | null;
  const side: TriageSide = rawSide && VALID_SIDES.has(rawSide) ? rawSide : "Center";

  const rawEx = params.get("ex");
  const extraSymptomIds = rawEx
    ? rawEx
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id !== rawSymptom && validIds.has(id))
    : [];

  const rawSev = params.get("sv") as SeverityId | null;
  const severity: SeverityId | null = rawSev && VALID_SEVERITIES.has(rawSev) ? rawSev : null;

  const rawDur = params.get("du") as DurationId | null;
  const duration: DurationId | null = rawDur && VALID_DURATIONS.has(rawDur) ? rawDur : null;

  const forWhom: TriageForWhom = params.get("fw") === "child" ? "child" : "self";

  let bodyProfile: BodyAnatomyProfile = params.get("bp") === "female" ? "female" : "general";
  if (subRegion && FEMALE_ONLY_SUB_REGIONS.has(subRegion)) {
    bodyProfile = "female";
  }

  return {
    part: rawPart,
    subRegion,
    side,
    symptomId: rawSymptom,
    extraSymptomIds,
    severity,
    duration,
    forWhom,
    bodyProfile,
    fromQr: params.get("qr") === "1",
  };
}
