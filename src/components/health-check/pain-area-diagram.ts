import type { BodyAnatomyProfile, SubRegionId } from "@/components/health-check/anatomy-3d-data";
import type { BodyPartId } from "@/lib/i18n/health-check-translations";
import type { Lang } from "@/lib/i18n/translations";

export type PainDiagramSide = "Left" | "Right" | "Center";

export interface PainAreaDiagramInput {
  part: BodyPartId;
  subRegion?: SubRegionId | null;
  side?: PainDiagramSide;
  bodyProfile?: BodyAnatomyProfile;
  urgent?: boolean;
  lang?: Lang;
}

interface PainDiagramCopy {
  heading: string;
  front: string;
  back: string;
  rightShort: string;
  leftShort: string;
}

export const PAIN_DIAGRAM_COPY: Record<Lang, PainDiagramCopy> = {
"ru": {"heading":"Область боли","front":"Спереди","back":"Сзади","rightShort":"П","leftShort":"Л"},

  ro: {
    heading: "Zona dureroasă pe corp",
    front: "Față",
    back: "Spate",
    rightShort: "Dr",
    leftShort: "St",
  },
  en: {
    heading: "Pain location on the body",
    front: "Front",
    back: "Back",
    rightShort: "R",
    leftShort: "L",
  },
  sq: {
    heading: "Vendi i dhimbjes në trup",
    front: "Përpara",
    back: "Prapa",
    rightShort: "Dj",
    leftShort: "Mj",
  },
  it: {
    heading: "Zona del dolore sul corpo",
    front: "Fronte",
    back: "Schiena",
    rightShort: "Dx",
    leftShort: "Sx",
  },
  hr: {
    heading: "Mjesto boli na tijelu",
    front: "Sprijeda",
    back: "Straga",
    rightShort: "D",
    leftShort: "L",
  },
  rom: {
    heading: "Thano kaj dukhal pe trupo",
    front: "Anglal",
    back: "Palal",
    rightShort: "Ch",
    leftShort: "St",
  },
};

interface LocusSpec {
  view: "front" | "back";
  /** Relative offset from silhouette midline (0 = midline, > 0 = anatomical side distance in SVG units). */
  dx: number;
  /** Y coordinate inside the 0..150 body silhouette coordinate system. */
  y: number;
  rx: number;
  ry: number;
  /** True when "Center" on a limb/paired structure should show symmetric bilateral markers. */
  pairedLimb?: boolean;
}

const MACRO_LOCUS: Record<BodyPartId, LocusSpec> = {
  head: { view: "front", dx: 0, y: 20, rx: 9, ry: 11 },
  chest: { view: "front", dx: 0, y: 49, rx: 14, ry: 11 },
  stomach: { view: "front", dx: 0, y: 69, rx: 12.5, ry: 11 },
  pelvis: { view: "front", dx: 0, y: 86, rx: 12, ry: 8.5 },
  back: { view: "back", dx: 0, y: 66, rx: 12.5, ry: 14 },
  arm: { view: "front", dx: 23, y: 62, rx: 6, ry: 20, pairedLimb: true },
  leg: { view: "front", dx: 10, y: 115, rx: 6.5, ry: 24, pairedLimb: true },
};

const SUB_REGION_LOCUS: Record<SubRegionId, LocusSpec> = {
  // Head and neck — neck is anatomically distinct at y=33 vs cranium y=17
  brain: { view: "front", dx: 0, y: 16, rx: 8.5, ry: 7.5 },
  skull: { view: "front", dx: 0, y: 15, rx: 8.5, ry: 7 },
  head_face: { view: "front", dx: 0, y: 20, rx: 8, ry: 7.5 },
  jaw_ear: { view: "front", dx: 6.5, y: 24, rx: 4.5, ry: 4.5, pairedLimb: true },
  cranium_occipital: { view: "back", dx: 0, y: 21, rx: 8, ry: 6.5 },
  neck: { view: "front", dx: 0, y: 33, rx: 6.5, ry: 5 },
  cervical_spine: { view: "back", dx: 0, y: 33, rx: 6.5, ry: 5.5 },

  // Chest
  heart: { view: "front", dx: 4.5, y: 49, rx: 6.5, ry: 6.5 },
  lungs: { view: "front", dx: 7.5, y: 48, rx: 6.5, ry: 9, pairedLimb: true },
  breast: { view: "front", dx: 7.5, y: 51, rx: 6, ry: 5.5, pairedLimb: true },
  axilla: { view: "front", dx: 15, y: 47, rx: 4.5, ry: 5, pairedLimb: true },
  rib_cage: { view: "front", dx: 8, y: 55, rx: 7, ry: 7.5, pairedLimb: true },
  pectoral: { view: "front", dx: 7.5, y: 46, rx: 7, ry: 6, pairedLimb: true },

  // Stomach and abdomen
  stomach_organ: { view: "front", dx: 3.5, y: 63, rx: 7.5, ry: 6.5 },
  liver: { view: "front", dx: 6.5, y: 62, rx: 7, ry: 6 },
  colon: { view: "front", dx: 0, y: 73, rx: 11.5, ry: 8.5 },
  abdominals: { view: "front", dx: 0, y: 68, rx: 10.5, ry: 10 },
  obliques: { view: "front", dx: 10.5, y: 70, rx: 5, ry: 8.5, pairedLimb: true },

  // Pelvis
  uterus_ovaries: { view: "front", dx: 5.5, y: 85, rx: 6.5, ry: 5.5, pairedLimb: true },
  bladder: { view: "front", dx: 0, y: 86, rx: 6.5, ry: 5.5 },
  pelvic_floor: { view: "front", dx: 0, y: 91, rx: 6.5, ry: 4.5 },
  hip_groin: { view: "front", dx: 9.5, y: 87, rx: 5.5, ry: 5.5, pairedLimb: true },

  // Back and spine
  trapezius: { view: "back", dx: 8, y: 39, rx: 7.5, ry: 5.5, pairedLimb: true },
  upper_back: { view: "back", dx: 0, y: 48, rx: 12, ry: 8.5 },
  thoracic_spine: { view: "back", dx: 0, y: 50, rx: 5.5, ry: 10 },
  kidneys: { view: "back", dx: 7, y: 64, rx: 5.5, ry: 6.5, pairedLimb: true },
  lumbar_spine: { view: "back", dx: 0, y: 70, rx: 6.5, ry: 8 },
  lower_back: { view: "back", dx: 0, y: 71, rx: 11.5, ry: 8 },
  sacroiliac_coccyx: { view: "back", dx: 0, y: 82, rx: 8, ry: 6 },
  gluteal: { view: "back", dx: 7.5, y: 87, rx: 6.5, ry: 6.5, pairedLimb: true },

  // Arms and hands
  deltoid: { view: "front", dx: 19, y: 43, rx: 5.5, ry: 6, pairedLimb: true },
  rotator_cuff: { view: "back", dx: 18, y: 44, rx: 5.5, ry: 5.5, pairedLimb: true },
  biceps: { view: "front", dx: 22, y: 55, rx: 5, ry: 7.5, pairedLimb: true },
  triceps: { view: "back", dx: 22, y: 55, rx: 5, ry: 7.5, pairedLimb: true },
  elbow_tendon: { view: "front", dx: 24, y: 65, rx: 5, ry: 5, pairedLimb: true },
  forearm_flexor: { view: "front", dx: 26, y: 74, rx: 4.5, ry: 7.5, pairedLimb: true },
  forearm_extensor: { view: "back", dx: 26, y: 74, rx: 4.5, ry: 7.5, pairedLimb: true },
  wrist_tendon: { view: "front", dx: 28, y: 84, rx: 4.5, ry: 4.5, pairedLimb: true },
  hands_fingers: { view: "front", dx: 29.5, y: 92, rx: 5, ry: 6, pairedLimb: true },

  // Legs and feet
  hip_flexor: { view: "front", dx: 10, y: 92, rx: 6, ry: 6.5, pairedLimb: true },
  quadriceps: { view: "front", dx: 10, y: 103, rx: 6, ry: 10, pairedLimb: true },
  hamstrings: { view: "back", dx: 10, y: 104, rx: 6, ry: 10, pairedLimb: true },
  patellar_tendon: { view: "front", dx: 10, y: 116, rx: 5.5, ry: 5.5, pairedLimb: true },
  calves: { view: "back", dx: 10, y: 127, rx: 5.5, ry: 9, pairedLimb: true },
  achilles: { view: "back", dx: 10, y: 138, rx: 4.5, ry: 5, pairedLimb: true },
  feet_soles: { view: "front", dx: 10.5, y: 144, rx: 5.5, ry: 4.5, pairedLimb: true },
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resolvePointsForFigure(
  midX: number,
  view: "front" | "back",
  spec: LocusSpec,
  side: PainDiagramSide,
  subRegion?: SubRegionId | null,
  isFemale = false
): Array<{ cx: number; cy: number; rx: number; ry: number }> {
  // Anatomical orientation:
  // On FRONT view: patient's Right is viewer-left (-dx), patient's Left is viewer-right (+dx).
  // On BACK view: patient's Left is viewer-left (-dx), patient's Right is viewer-right (+dx).
  const rightSign = view === "front" ? -1 : 1;
  const leftSign = -rightSign;
  const effectiveDx = isFemale && spec.dx >= 18 ? Number((spec.dx * 0.89).toFixed(2)) : spec.dx;

  // Fixed unilateral visceral organs when side === "Center"
  if (subRegion === "heart" || subRegion === "stomach_organ") {
    return [{ cx: midX + leftSign * effectiveDx, cy: spec.y, rx: spec.rx, ry: spec.ry }];
  }
  if (subRegion === "liver") {
    return [{ cx: midX + rightSign * effectiveDx, cy: spec.y, rx: spec.rx, ry: spec.ry }];
  }

  if (side === "Left") {
    const offset = effectiveDx > 0 ? effectiveDx : 5.5;
    return [{ cx: midX + leftSign * offset, cy: spec.y, rx: spec.rx, ry: spec.ry }];
  }
  if (side === "Right") {
    const offset = effectiveDx > 0 ? effectiveDx : 5.5;
    return [{ cx: midX + rightSign * offset, cy: spec.y, rx: spec.rx, ry: spec.ry }];
  }

  if (spec.pairedLimb && effectiveDx > 0) {
    return [
      { cx: midX - effectiveDx, cy: spec.y, rx: spec.rx, ry: spec.ry },
      { cx: midX + effectiveDx, cy: spec.y, rx: spec.rx, ry: spec.ry },
    ];
  }

  return [{ cx: midX, cy: spec.y, rx: spec.rx, ry: spec.ry }];
}

function buildSilhouettePaths(midX: number, isBack: boolean, isFemale = false): string {
  if (isFemale) {
    // Clean proportional clinical female silhouette centered at midX over y=7..146
    const head = `<ellipse cx="${midX}" cy="18.2" rx="8.8" ry="10.9" />`;
    const body = `<path d="M ${midX - 4.0} 28.5 L ${midX - 4.6} 35.2 C ${midX - 12.5} 36.6 ${midX - 17.5} 39.5 ${midX - 19.2} 46 L ${midX - 26.8} 86.5 C ${midX - 27.5} 90.2 ${midX - 24.3} 92.5 ${midX - 22.5} 89 L ${midX - 16.0} 53 L ${midX - 12.8} 53 C ${midX - 12.2} 62 ${midX - 11.2} 69 ${midX - 11.2} 75 C ${midX - 11.2} 81 ${midX - 16.2} 84 ${midX - 16.2} 92 L ${midX - 14.0} 141 C ${midX - 14.0} 145.5 ${midX - 6.5} 145.5 ${midX - 6.2} 141 L ${midX - 3.0} 94 L ${midX + 3.0} 94 L ${midX + 6.2} 141 C ${midX + 6.5} 145.5 ${midX + 14.0} 145.5 ${midX + 14.0} 141 L ${midX + 16.2} 92 C ${midX + 16.2} 84 ${midX + 11.2} 81 ${midX + 11.2} 75 C ${midX + 11.2} 69 ${midX + 12.2} 62 ${midX + 12.8} 53 L ${midX + 16.0} 53 L ${midX + 22.5} 89 C ${midX + 24.3} 92.5 ${midX + 27.5} 90.2 ${midX + 26.8} 86.5 L ${midX + 19.2} 46 C ${midX + 17.5} 39.5 ${midX + 12.5} 36.6 ${midX + 4.6} 35.2 L ${midX + 4.0} 28.5 Z" />`;
    const landmarks = isBack
      ? `<line x1="${midX}" y1="32" x2="${midX}" y2="83" stroke="#cbd5e1" stroke-width="0.9" stroke-dasharray="2 2" />
         <path d="M ${midX - 7.8} 43 Q ${midX - 4.4} 48.5 ${midX - 2.6} 44 M ${midX + 7.8} 43 Q ${midX + 4.4} 48.5 ${midX + 2.6} 44" fill="none" stroke="#cbd5e1" stroke-width="0.9" />`
      : `<path d="M ${midX - 9.5} 38 Q ${midX} 41 ${midX + 9.5} 38" fill="none" stroke="#cbd5e1" stroke-width="0.9" />
         <line x1="${midX - 4.0}" y1="35" x2="${midX + 4.0}" y2="35" stroke="#cbd5e1" stroke-width="0.8" />
         <path d="M ${midX - 9.6} 50.5 Q ${midX - 5.5} 54.5 ${midX - 1.6} 50.5 M ${midX + 1.6} 50.5 Q ${midX + 5.5} 54.5 ${midX + 9.6} 50.5" fill="none" stroke="#cbd5e1" stroke-width="0.8" />`;
    return `${head}${body}${landmarks}`;
  }

  // Clean clinical human silhouette centered at midX over y=8..148
  const head = `<ellipse cx="${midX}" cy="18" rx="9.2" ry="11.2" />`;
  const body = `<path d="M ${midX - 4.5} 28.5 L ${midX - 5.2} 35 C ${midX - 15} 36.5 ${midX - 20.5} 39.5 ${midX - 22.5} 46 L ${midX - 30.5} 87 C ${midX - 31.3} 91 ${midX - 27.5} 93.5 ${midX - 25.5} 90 L ${midX - 18.2} 53 L ${midX - 14.5} 53 L ${midX - 13.2} 76 L ${midX - 15.2} 91 L ${midX - 14.5} 141 C ${midX - 14.5} 145.5 ${midX - 6.5} 145.5 ${midX - 6.2} 141 L ${midX - 3.2} 94 L ${midX + 3.2} 94 L ${midX + 6.2} 141 C ${midX + 6.5} 145.5 ${midX + 14.5} 145.5 ${midX + 14.5} 141 L ${midX + 15.2} 91 L ${midX + 13.2} 76 L ${midX + 14.5} 53 L ${midX + 18.2} 53 L ${midX + 25.5} 90 C ${midX + 27.5} 93.5 ${midX + 31.3} 91 ${midX + 30.5} 87 L ${midX + 22.5} 46 C ${midX + 20.5} 39.5 ${midX + 15} 36.5 ${midX + 5.2} 35 L ${midX + 4.5} 28.5 Z" />`;
  const landmarks = isBack
    ? `<line x1="${midX}" y1="32" x2="${midX}" y2="83" stroke="#cbd5e1" stroke-width="0.9" stroke-dasharray="2 2" />
       <path d="M ${midX - 9} 43 Q ${midX - 5} 49 ${midX - 3} 44 M ${midX + 9} 43 Q ${midX + 5} 49 ${midX + 3} 44" fill="none" stroke="#cbd5e1" stroke-width="0.9" />`
    : `<path d="M ${midX - 11} 38 Q ${midX} 41 ${midX + 11} 38" fill="none" stroke="#cbd5e1" stroke-width="0.9" />
       <line x1="${midX - 4.5}" y1="35" x2="${midX + 4.5}" y2="35" stroke="#cbd5e1" stroke-width="0.8" />`;
  return `${head}${body}${landmarks}`;
}

/**
 * Generates a self-contained inline vector SVG showing both Front and Back clinical silhouettes
 * with the exact pain region shaded and pinpointed for A4 PDF printing and doctor handoff.
 */
export function buildPainAreaDiagramSvg(input: PainAreaDiagramInput): string {
  const lang = input.lang ?? "ro";
  const copy = PAIN_DIAGRAM_COPY[lang] ?? PAIN_DIAGRAM_COPY.en;
  const side = input.side ?? "Center";
  const isFemale =
    input.bodyProfile === "female" ||
    input.subRegion === "breast" ||
    input.subRegion === "uterus_ovaries";
  const spec =
    (input.subRegion ? SUB_REGION_LOCUS[input.subRegion] : undefined) ?? MACRO_LOCUS[input.part];

  const accentStroke = input.urgent ? "#b91c1c" : "#1d4ed8";
  const accentFill = input.urgent ? "#fecaca" : "#bfdbfe";
  const accentCore = input.urgent ? "#dc2626" : "#1e40af";

  const frontMid = 50;
  const backMid = 146;
  const activeMid = spec.view === "front" ? frontMid : backMid;
  const points = resolvePointsForFigure(activeMid, spec.view, spec, side, input.subRegion, isFemale);

  const highlightMarkup = points
    .map(
      (pt) => `
      <ellipse cx="${pt.cx}" cy="${pt.cy}" rx="${pt.rx}" ry="${pt.ry}" fill="${accentFill}" fill-opacity="0.78" stroke="${accentStroke}" stroke-width="1.4" />
      <line x1="${pt.cx - 5.5}" y1="${pt.cy}" x2="${pt.cx + 5.5}" y2="${pt.cy}" stroke="${accentCore}" stroke-width="1.1" />
      <line x1="${pt.cx}" y1="${pt.cy - 5.5}" x2="${pt.cx}" y2="${pt.cy + 5.5}" stroke="${accentCore}" stroke-width="1.1" />
      <rect x="${pt.cx - 2.2}" y="${pt.cy - 2.2}" width="4.4" height="4.4" rx="1" fill="${accentCore}" stroke="#ffffff" stroke-width="1" />`
    )
    .join("");

  const frontActive = spec.view === "front";
  const backActive = spec.view === "back";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 196 168" width="184" height="158" role="img" aria-label="${escapeXml(copy.heading)}">
    <rect x="0.5" y="0.5" width="195" height="167" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
    <line x1="98" y1="10" x2="98" y2="158" stroke="#e2e8f0" stroke-width="1" />

    <g opacity="${frontActive ? "1" : "0.48"}">
      <g fill="#ffffff" stroke="${frontActive ? "#334155" : "#94a3b8"}" stroke-width="1.25" stroke-linejoin="round">
        ${buildSilhouettePaths(frontMid, false, isFemale)}
      </g>
      <text x="14" y="18" font-family="system-ui,-apple-system,sans-serif" font-size="8.5" font-weight="700" fill="#64748b">${escapeXml(copy.rightShort)}</text>
      <text x="80" y="18" font-family="system-ui,-apple-system,sans-serif" font-size="8.5" font-weight="700" fill="#64748b">${escapeXml(copy.leftShort)}</text>
      <text x="${frontMid}" y="160" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="9.5" font-weight="${frontActive ? "700" : "600"}" fill="${frontActive ? "#0f172a" : "#64748b"}">${escapeXml(copy.front)}</text>
    </g>

    <g opacity="${backActive ? "1" : "0.48"}">
      <g fill="#ffffff" stroke="${backActive ? "#334155" : "#94a3b8"}" stroke-width="1.25" stroke-linejoin="round">
        ${buildSilhouettePaths(backMid, true, isFemale)}
      </g>
      <text x="110" y="18" font-family="system-ui,-apple-system,sans-serif" font-size="8.5" font-weight="700" fill="#64748b">${escapeXml(copy.leftShort)}</text>
      <text x="176" y="18" font-family="system-ui,-apple-system,sans-serif" font-size="8.5" font-weight="700" fill="#64748b">${escapeXml(copy.rightShort)}</text>
      <text x="${backMid}" y="160" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="9.5" font-weight="${backActive ? "700" : "600"}" fill="${backActive ? "#0f172a" : "#64748b"}">${escapeXml(copy.back)}</text>
    </g>

    ${highlightMarkup}
  </svg>`;
}
