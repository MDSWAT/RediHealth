"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { DEFAULT_LANG } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { getHealthCheckTranslations, type BodyPartId } from "@/lib/i18n/health-check-translations";
import { DURATION, EASE_OUT } from "@/lib/motion/tokens";
import { WEBGL_ERROR, hasWebGL } from "./webgl-support";
import {
  REFERRED_PAIN_BY_SUB_REGION,
  SUB_REGION_INFO,
  getLocalizedSubRegion,
  type BodyAnatomyProfile,
  type LayerModeId,
  type SubRegionId,
  type TissueKind,
} from "./anatomy-3d-data";
import {
  bakeAndTuckMuscularScene,
  buildSkinVoxelIndex,
  classifySkinVertexSubRegions,
  computeFloat32Normals,
  computeVertexSculptAO,
  decodeSkeletonPartBinary,
  extractOuterManifold,
  morphFemaleCoordinate,
  smoothPelvicGroinContour,
  tuckPositionsInsideSkin,
  type DecodedSkeletonPart,
  type MuscleDonorInput,
  type SkeletonBundleManifest,
  type SkinSubRegionMaps,
} from "./anatomy-geometry";

export type CameraViewPreset = "front" | "back" | "three-quarter" | "side";

/** Camera actions the page's control panel can call. */
export interface ViewportCameraApi {
  zoomIn: () => void;
  zoomOut: () => void;
  rotateLeft: () => void;
  rotateRight: () => void;
  /** Glide the view up or down the body (direction pad). */
  panUp: () => void;
  panDown: () => void;
  resetCamera: () => void;
}

export interface AnatomicalViewport3DProps {
  selectedPart: BodyPartId | null;
  /** The exact structure, or null when only the area is chosen (list, or a coarse tap on a phone). */
  selectedSubRegion: SubRegionId | null;
  selectedSide: "Left" | "Right" | "Center";
  viewAngle: CameraViewPreset;
  layerMode: LayerModeId;
  isolateSelected: boolean;
  /** Body contour and female-specific regions ("general" by default, "female" adds breast and uterus/ovaries). */
  bodyProfile?: BodyAnatomyProfile;
  /** `subRegion` is null when the tap only picks the area. */
  onSelectAnatomy: (
    macroPart: BodyPartId,
    subRegion: SubRegionId | null,
    side: "Left" | "Right" | "Center"
  ) => void;
  /** Called once if the 3D body cannot run here (no WebGL) or its files fail to load. */
  onUnavailable?: (message: string) => void;
  lang?: Lang;
  compact?: boolean;
  /** Height utilities for the stage; the parent owns the layout. */
  className?: string;
  /** Overlays drawn on the stage (view switch, selection label). */
  children?: ReactNode;
  /** Context only: canvas leaves the Tab order and the accessibility tree. */
  decorative?: boolean;
  /** Bumped each time a view button is pressed, so pressing "Front" again still turns the body. */
  viewRequest?: number;
  /** Called when the person turns the body by hand (drag, arrows, rotate buttons). */
  onFreeRotate?: () => void;
  /** Filled with the camera actions once the scene is ready. */
  cameraRef?: { current: ViewportCameraApi | null };
}

interface AtlasLayerPartManifest {
  id: string;
  system: string;
  vertexCount: number;
  indexCount: number;
  positions: number;
  normals: number;
  indices: number;
  bounds: [number[], number[]];
}

interface AtlasLayersManifest {
  totalBytes: number;
  parts: AtlasLayerPartManifest[];
}

interface CleanAtlasPartData {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  sculptAO: Float32Array;
}

interface CachedCoreAtlasAssets {
  atlasManifest: AtlasLayersManifest;
  cleanAtlasParts: Map<string, CleanAtlasPartData>;
  generalSkinPositions: Float32Array;
  generalSkinNormals: Float32Array;
  generalTuckNormals: Float32Array;
  skinSculptAO: Float32Array;
  femaleSkinPositions: Float32Array;
  femaleSkinNormals: Float32Array;
  femaleTuckNormals: Float32Array;
  skinIndices: Uint32Array;
  skinBaseVertexCount: number;
  femaleSkinVoxelIndex: Int16Array | null;
  muscleBump: THREE.CanvasTexture;
  tendonBump: THREE.CanvasTexture;
  boneBump: THREE.CanvasTexture;
}

interface CachedMuscularAssets {
  scene: THREE.Group;
  muscleDonors: MuscleDonorInput[];
}

interface CachedSkeletonAssets {
  manifest: SkeletonBundleManifest;
  parts: DecodedSkeletonPart[];
}

// 3-tier module-level asset caches:
// 1. Core atlas (skin + surface caps + visceral organs)
// 2. Muscular GLB (loaded lazily ONLY when muscular or hybrid layer is active)
// 3. Real BodyParts3D skeleton (loaded lazily ONLY when skeletal/hybrid or a skeletal sub-region is active)
let globalCoreCache: CachedCoreAtlasAssets | null = null;
let globalCorePromise: Promise<CachedCoreAtlasAssets> | null = null;

let globalMuscularCache: CachedMuscularAssets | null = null;
let globalMuscularPromise: Promise<CachedMuscularAssets> | null = null;

let globalSkeletonCache: CachedSkeletonAssets | null = null;
let globalSkeletonPromise: Promise<CachedSkeletonAssets> | null = null;

const SKELETAL_TRIGGER_SUB_REGIONS = new Set<SubRegionId>([
  "skull",
  "cervical_spine",
  "thoracic_spine",
  "lumbar_spine",
  "sacroiliac_coccyx",
  "rib_cage",
]);

const TORSO_WALL_SUB_REGIONS = new Set<SubRegionId>([
  "pectoral",
  "abdominals",
  "obliques",
  "upper_back",
  "lower_back",
]);

function needsMuscularLayer(layerMode: LayerModeId): boolean {
  return layerMode === "muscular" || layerMode === "hybrid";
}

function needsSkeletonLayer(layerMode: LayerModeId, subRegion: SubRegionId | null): boolean {
  if (layerMode === "skeletal" || layerMode === "hybrid") return true;
  if (subRegion && SKELETAL_TRIGGER_SUB_REGIONS.has(subRegion)) return true;
  return false;
}

/**
 * CSS cubic-bezier easing, so camera moves follow the site's shared motion curves
 * (src/lib/motion/tokens.ts) instead of an ad-hoc polynomial.
 */
function cubicBezier([x1, y1, x2, y2]: readonly [number, number, number, number]): (x: number) => number {
  const bez = (t: number, a: number, b: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0;
    let hi = 1;
    let t = x;
    for (let i = 0; i < 24; i += 1) {
      t = (lo + hi) / 2;
      if (bez(t, x1, x2) < x) lo = t;
      else hi = t;
    }
    return bez(t, y1, y2);
  };
}

/**
 * Turning round the body: a soft start and a long, gentle settle. Softer than the site's
 * symmetric EASE_IN_OUT, whose steep middle reads as a lurch on a large 3D move.
 */
const easeOrbit = cubicBezier([0.45, 0, 0.2, 1]);
/** Small nudges (rotate buttons): decelerate into place. */
const easeNudge = cubicBezier(EASE_OUT);
/** A move that takes over from one still in flight: already moving, so it only decelerates. */
const easeHandOff = cubicBezier([0.2, 0.6, 0.25, 1]);
/** Base and longest duration of a camera move. */
const CALM_MOVE_MS = 760;
const CALM_MOVE_MAX_MS = 1300;

// Refined clinical medical-atlas palette aligned with RediHealth warm paper, deep sapphire (#1d3557),
// decoloured rose (#8c323b / #f8ecec), and warm sculptural ivory ceramic bones.
const MUSCLE_COLOR = new THREE.Color(0x984044);
const MUSCLE_LIGHT = new THREE.Color(0xb05356);
const TENDON_COLOR = new THREE.Color(0xe4dac9);
const BONE_COLOR = new THREE.Color(0xe2d8c5);
const BONE_AXIAL_COLOR = new THREE.Color(0xd7ccb5);
const BONE_CRANIAL_PELVIC_COLOR = new THREE.Color(0xe6ddc9);
const JOINT_CARTILAGE_COLOR = new THREE.Color(0xcfd8e2);
const SURFACE_ACCENT_COLOR = new THREE.Color(0xddcfc0);
const SKIN_BASE_COLOR = new THREE.Color(0xe3d5c6);
const SKIN_GHOST_COOL_COLOR = new THREE.Color(0xd9e1ec);
const SKIN_GHOST_WARM_COLOR = new THREE.Color(0xe2d8ce);
/** Deep clinical sapphire highlight harmonizing with RediHealth #1d3557 UI chrome. */
const SELECTED_COLOR = new THREE.Color(0x245596);
/** Secondary warm amber-ochre highlight for clinically linked referred-pain zones. */
const REFERRED_COLOR = new THREE.Color(0xc98a3b);
/** Calm sapphire mist preview on hover (never reads as inflamed tissue). */
const HOVER_COLOR = new THREE.Color(0x7aa3d4);
/** Once an area is chosen, outside structures recede gently towards warm stone. */
const DIM_COLOR = new THREE.Color(0xd9d6d0);
const DIM_AMOUNT = 0.62;

const AXIAL_BONE_PARTS = new Set([
  "cervical_spine",
  "thoracic_spine",
  "lumbar_spine",
  "sacrum_coccyx",
  "rib_cage",
]);

const CRANIAL_PELVIC_BONE_PARTS = new Set(["skull_cranium", "mandible", "pelvis"]);

/**
 * Structures that sit wholly under an opaque part of the head: on their own they never show, so
 * choosing one lights the surface that covers it.
 */
const SHOWN_ON_SURFACE: Partial<Record<SubRegionId, readonly SubRegionId[]>> = {
  skull: ["head_face", "cranium_occipital"],
  brain: ["head_face", "cranium_occipital"],
};

/** Overlying skin zones used when an internal organ or spinal segment is active on the skin view. */
const SURFACE_ORGAN_PROJECTION: Partial<Record<SubRegionId, readonly SubRegionId[]>> = {
  skull: ["head_face", "cranium_occipital"],
  brain: ["head_face", "cranium_occipital"],
  heart: ["pectoral", "breast"],
  lungs: ["pectoral", "breast", "rib_cage"],
  stomach_organ: ["abdominals", "obliques"],
  liver: ["abdominals", "obliques"],
  colon: ["abdominals", "obliques"],
  kidneys: ["lower_back"],
};

const ORGAN_COLORS: Record<string, THREE.Color> = {
  heart: new THREE.Color(0xa63a40),
  lungs: new THREE.Color(0xc48b94),
  stomach_organ: new THREE.Color(0xc88b64),
  liver: new THREE.Color(0x7e423b),
  colon: new THREE.Color(0xb9906e),
  kidneys: new THREE.Color(0x8c4d49),
  uterus_ovaries: new THREE.Color(0xb76878),
  bladder: new THREE.Color(0xc7996b),
};

const REGION_BY_GLB_NODE: Record<string, SubRegionId> = {
  rhomboids: "upper_back",
  lats: "upper_back",
  trap_lower: "trapezius",
  trap_upper: "trapezius",
  trap_mid: "trapezius",
  erectors: "lower_back",
  pec_minor: "pectoral",
  serratus: "obliques",
  pec_major_upper: "pectoral",
  pec_major_mid: "pectoral",
  pec_major_lower: "pectoral",
  rectus_upper: "abdominals",
  rectus_lower: "abdominals",
  obliques: "obliques",
  transverse: "obliques",
  teres_major: "rotator_cuff",
  delt_side: "deltoid",
  delt_front: "deltoid",
  delt_rear: "deltoid",
  teres_minor: "rotator_cuff",
  infraspinatus: "rotator_cuff",
  brachialis: "biceps",
  bicep_long: "biceps",
  bicep_short: "biceps",
  tricep_medial: "triceps",
  tricep_lateral: "triceps",
  tricep_long: "triceps",
  forearm_flexors: "forearm_flexor",
  brachioradialis: "forearm_extensor",
  forearm_extensors: "forearm_extensor",
  rectus_femoris: "quadriceps",
  vastus_lateralis: "quadriceps",
  vastus_medialis: "quadriceps",
  vastus_intermedius: "quadriceps",
  biceps_femoris_long: "hamstrings",
  biceps_femoris_short: "hamstrings",
  semimembranosus: "hamstrings",
  semitendinosus: "hamstrings",
  adductors: "hip_flexor",
  tibialis_anterior: "calves",
  gastroc_lateral: "calves",
  gastroc_medial: "calves",
  soleus: "calves",
  hip_flexors: "hip_flexor",
  glute_med: "gluteal",
  glute_max: "gluteal",
  glute_min: "gluteal",
};

const SHOULDER_NODES = new Set([
  "delt_side",
  "delt_front",
  "delt_rear",
  "teres_major",
  "teres_minor",
  "infraspinatus",
]);
const UPPER_ARM_NODES = new Set([
  "brachialis",
  "bicep_long",
  "bicep_short",
  "tricep_medial",
  "tricep_lateral",
  "tricep_long",
]);
const FOREARM_NODES = new Set([
  "forearm_flexors",
  "brachioradialis",
  "forearm_extensors",
]);
const QUAD_NODES = new Set([
  "rectus_femoris",
  "vastus_lateralis",
  "vastus_medialis",
  "vastus_intermedius",
]);
const CALF_NODES = new Set(["gastroc_lateral", "gastroc_medial", "soleus"]);

const ATLAS_PART_TO_SUB_REGION: Record<
  string,
  { subRegion: SubRegionId; tissue: TissueKind; isOrgan?: boolean; isSurfaceCap?: boolean }
> = {
  head_face: { subRegion: "head_face", tissue: "Surface", isSurfaceCap: true },
  cranium_occipital: { subRegion: "cranium_occipital", tissue: "Surface", isSurfaceCap: true },
  neck_throat: { subRegion: "neck", tissue: "Muscle", isSurfaceCap: true },
  hands_wrists: { subRegion: "wrist_tendon", tissue: "Tendon", isSurfaceCap: true },
  feet_ankles: { subRegion: "achilles", tissue: "Tendon", isSurfaceCap: true },
  heart: { subRegion: "heart", tissue: "Organ", isOrgan: true },
  lungs: { subRegion: "lungs", tissue: "Organ", isOrgan: true },
  stomach_organ: { subRegion: "stomach_organ", tissue: "Organ", isOrgan: true },
  liver: { subRegion: "liver", tissue: "Organ", isOrgan: true },
  colon: { subRegion: "colon", tissue: "Organ", isOrgan: true },
  kidneys: { subRegion: "kidneys", tissue: "Organ", isOrgan: true },
};

function createFiberTexture(kind: "muscle" | "tendon" = "muscle"): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const image = ctx.createImageData(canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const i = (y * canvas.width + x) * 4;
        const longFiber = Math.sin(
          x * (kind === "muscle" ? 0.42 : 0.25) + Math.sin(y * 0.035) * 4
        );
        const fineFiber = Math.sin(x * 1.65 + y * 0.025);
        const value = Math.max(
          25,
          Math.min(230, Math.round(128 + longFiber * 30 + fineFiber * 10))
        );
        image.data[i] = value;
        image.data[i + 1] = value;
        image.data[i + 2] = value;
        image.data[i + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(kind === "muscle" ? 5 : 8, kind === "muscle" ? 2 : 3);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

/** Subtle matte cortical-bone mineral micro-grain texture (zero network bytes). */
function createBoneGrainTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const image = ctx.createImageData(canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const i = (y * canvas.width + x) * 4;
        // Deterministic multi-frequency cortical grain + subtle longitudinal Haversian striation
        const h1 = Math.sin(x * 0.28 + Math.sin(y * 0.09) * 2.2) * 10;
        const h2 = Math.sin((x * 1.13 + y * 0.71) * 0.45) * 8;
        const micro = (((x * 73856093) ^ (y * 19349663)) & 255) / 255;
        const value = Math.max(85, Math.min(180, Math.round(128 + h1 + h2 + (micro - 0.5) * 18)));
        image.data[i] = value;
        image.data[i + 1] = value;
        image.data[i + 2] = value;
        image.data[i + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

function createStageCalibrationTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as HTMLCanvasElement);
  }
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 256, 256);
    const cx = 128;
    const cy = 128;
    // Soft grounded contact shadow
    const grad = ctx.createRadialGradient(cx, cy, 8, cx, cy, 108);
    grad.addColorStop(0, "rgba(15, 23, 42, 0.20)");
    grad.addColorStop(0.45, "rgba(15, 23, 42, 0.08)");
    grad.addColorStop(1, "rgba(15, 23, 42, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Subtle architectural calibration rings and axes in RediHealth deep sapphire
    ctx.strokeStyle = "rgba(29, 53, 87, 0.12)";
    ctx.lineWidth = 1;
    for (const r of [56, 92, 118]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(29, 53, 87, 0.08)";
    ctx.beginPath();
    ctx.moveTo(cx - 120, cy);
    ctx.lineTo(cx + 120, cy);
    ctx.moveTo(cx, cy - 120);
    ctx.lineTo(cx, cy + 120);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function resolveGlbSubRegion(nodeName: string, tissue: TissueKind): SubRegionId {
  const base = REGION_BY_GLB_NODE[nodeName] || "upper_back";
  if (tissue !== "Tendon") return base;
  if (SHOULDER_NODES.has(nodeName)) return "rotator_cuff";
  if (UPPER_ARM_NODES.has(nodeName)) return "elbow_tendon";
  if (FOREARM_NODES.has(nodeName)) return "wrist_tendon";
  if (QUAD_NODES.has(nodeName)) return "patellar_tendon";
  if (CALF_NODES.has(nodeName)) return "achilles";
  return base;
}

function sideForVertex(x: number): "Left" | "Right" {
  // In BodyParts3D, negative X is anatomical Right, positive X is anatomical Left
  return x < 0 ? "Right" : "Left";
}

/**
 * Extracts a compact indexed sub-geometry from an existing BodyParts3D mesh using a triangle
 * centroid predicate — zero extra network bytes, minimal vertex allocation.
 */
function extractSubGeometry(
  source: THREE.BufferGeometry,
  predicate: (cx: number, cy: number, cz: number) => boolean,
  normalOffset = 0
): THREE.BufferGeometry | null {
  const posAttr = source.getAttribute("position") as THREE.BufferAttribute | undefined;
  const normAttr = source.getAttribute("normal") as THREE.BufferAttribute | undefined;
  const idxAttr = source.getIndex();
  if (!posAttr || !idxAttr) return null;

  const remap = new Map<number, number>();
  const outPos: number[] = [];
  const outNorm: number[] = [];
  const outIdx: number[] = [];

  const getVertex = (srcIdx: number): number => {
    const existing = remap.get(srcIdx);
    if (existing !== undefined) return existing;
    const nextIdx = outPos.length / 3;
    remap.set(srcIdx, nextIdx);
    const x = posAttr.getX(srcIdx);
    const y = posAttr.getY(srcIdx);
    const z = posAttr.getZ(srcIdx);
    const nx = normAttr ? normAttr.getX(srcIdx) : 0;
    const ny = normAttr ? normAttr.getY(srcIdx) : 0;
    const nz = normAttr ? normAttr.getZ(srcIdx) : 1;
    outPos.push(x + nx * normalOffset, y + ny * normalOffset, z + nz * normalOffset);
    outNorm.push(nx, ny, nz);
    return nextIdx;
  };

  for (let i = 0; i < idxAttr.count; i += 3) {
    const a = idxAttr.getX(i);
    const b = idxAttr.getX(i + 1);
    const c = idxAttr.getX(i + 2);
    const cx = (posAttr.getX(a) + posAttr.getX(b) + posAttr.getX(c)) / 3;
    const cy = (posAttr.getY(a) + posAttr.getY(b) + posAttr.getY(c)) / 3;
    const cz = (posAttr.getZ(a) + posAttr.getZ(b) + posAttr.getZ(c)) / 3;
    if (!predicate(cx, cy, cz)) continue;
    outIdx.push(getVertex(a), getVertex(b), getVertex(c));
  }

  if (outIdx.length === 0) return null;
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(outPos, 3));
  geom.setAttribute("normal", new THREE.Float32BufferAttribute(outNorm, 3));
  geom.setIndex(outIdx);
  geom.computeBoundingSphere();
  return geom;
}

function mergeProceduralGeometries(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  let vertexOffset = 0;

  for (const part of parts) {
    const pos = part.getAttribute("position") as THREE.BufferAttribute;
    const norm = part.getAttribute("normal") as THREE.BufferAttribute | undefined;
    const idx = part.getIndex();
    for (let i = 0; i < pos.count; i += 1) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      normals.push(norm ? norm.getX(i) : 0, norm ? norm.getY(i) : 0, norm ? norm.getZ(i) : 1);
    }
    if (idx) {
      for (let i = 0; i < idx.count; i += 1) {
        indices.push(idx.getX(i) + vertexOffset);
      }
    } else {
      for (let i = 0; i < pos.count; i += 1) {
        indices.push(i + vertexOffset);
      }
    }
    vertexOffset += pos.count;
    part.dispose();
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  merged.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  merged.setIndex(indices);
  merged.computeBoundingSphere();
  return merged;
}

/** Lightweight (~750 vertices) internal uterus, fallopian tubes, and ovaries in BodyParts3D meter space. */
function buildUterusOvariesGeometry(): THREE.BufferGeometry {
  const pieces: THREE.BufferGeometry[] = [];

  // Pear-shaped anteverted uterus at midline (X = 0, Y = 0.896, Z = 0.036)
  const uterus = new THREE.SphereGeometry(1, 18, 14);
  const uPos = uterus.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < uPos.count; i += 1) {
    const x = uPos.getX(i);
    const y = uPos.getY(i);
    const z = uPos.getZ(i);
    const fundusTaper = THREE.MathUtils.lerp(0.42, 1.08, (y + 1) * 0.5);
    const px = x * 0.022 * fundusTaper;
    const py = 0.896 + y * 0.029;
    const pz = 0.036 + z * 0.014 * fundusTaper + y * 0.005;
    uPos.setXYZ(i, px, py, pz);
  }
  uterus.computeVertexNormals();
  pieces.push(uterus);

  // Left (+X) and right (-X) fallopian tubes and ovaries
  for (const sign of [-1, 1]) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sign * 0.018, 0.915, 0.038),
      new THREE.Vector3(sign * 0.036, 0.919, 0.034),
      new THREE.Vector3(sign * 0.052, 0.911, 0.03),
      new THREE.Vector3(sign * 0.056, 0.9, 0.028),
    ]);
    const tube = new THREE.TubeGeometry(curve, 12, 0.0036, 8, false);
    pieces.push(tube);

    const ovary = new THREE.SphereGeometry(1, 14, 10);
    ovary.scale(0.013, 0.009, 0.008);
    ovary.translate(sign * 0.053, 0.895, 0.028);
    pieces.push(ovary);
  }

  return mergeProceduralGeometries(pieces);
}

/** Lightweight bilateral mammary contour aligned to the morphed female chest for hybrid/muscular overlays. */
function buildMammaryGeometry(
  femaleSkinPositions: Float32Array,
  femaleSkinNormals: Float32Array,
  femaleVoxel: Int16Array
): THREE.BufferGeometry {
  const pieces: THREE.BufferGeometry[] = [];
  for (const s of [-1, 1]) {
    const gland = new THREE.SphereGeometry(1, 26, 20);
    const gPos = gland.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < gPos.count; i += 1) {
      const ux = gPos.getX(i);
      const uy = gPos.getY(i);
      const uz = gPos.getZ(i);
      const lowerFullness = uy < 0 ? 1 + 0.10 * (-uy) : 1 - 0.08 * uy;
      const tailShiftX = uy > 0.15 && ux * s > 0.15 ? s * 0.009 * uy * Math.abs(ux) : 0;
      const tailShiftY = uy > 0.15 && ux * s > 0.15 ? 0.007 * uy * Math.abs(ux) : 0;
      const px = s * 0.057 + ux * 0.046 * lowerFullness + tailShiftX;
      const py = 1.246 + uy * 0.052 - (uz > 0 ? 0.005 * uz : 0) + tailShiftY;
      const lateralWrap = -0.014 * (ux * ux) - 0.006 * (uy * uy);
      const depth = uz >= 0 ? uz * 0.036 : uz * 0.012;
      const pz = 0.112 + depth + lateralWrap;
      gPos.setXYZ(i, px, py, pz);
    }
    const posArr = gPos.array as Float32Array;
    tuckPositionsInsideSkin(posArr, femaleSkinPositions, femaleSkinNormals, femaleVoxel, 0.0022);
    gland.computeVertexNormals();
    pieces.push(gland);
  }
  return mergeProceduralGeometries(pieces);
}

function buildBladderGeometry(): THREE.BufferGeometry {
  const bladder = new THREE.SphereGeometry(1, 18, 14);
  const bPos = bladder.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < bPos.count; i += 1) {
    const x = bPos.getX(i);
    const y = bPos.getY(i);
    const z = bPos.getZ(i);
    const neckTaper = THREE.MathUtils.lerp(0.58, 1.04, (y + 1) * 0.5);
    bPos.setXYZ(i, x * 0.028 * neckTaper, 0.858 + y * 0.022, 0.056 + z * 0.024 * neckTaper);
  }
  bladder.computeVertexNormals();
  bladder.computeBoundingSphere();
  return bladder;
}

interface FallbackSkeletalPartSpec {
  nodeName: string;
  subRegion: SubRegionId;
  geometry: THREE.BufferGeometry;
  isJoint?: boolean;
  showInHybrid?: boolean;
}

function buildTubeBone(points: [number, number, number][], radius: number, tubularSegments = 10): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  return new THREE.TubeGeometry(curve, tubularSegments, radius, 8, false);
}

/**
 * Offline / fetch-failure fallback skeletal representation if `human-atlas-skeleton.bin`
 * cannot be retrieved over the network. Never rendered when the real BodyParts3D skeleton loads.
 */
function buildFallbackSkeletalParts(): FallbackSkeletalPartSpec[] {
  const specs: FallbackSkeletalPartSpec[] = [];

  const skullDome = new THREE.SphereGeometry(1, 18, 14);
  skullDome.scale(0.068, 0.088, 0.082);
  skullDome.translate(0, 1.605, -0.012);
  const maxilla = new THREE.BoxGeometry(0.082, 0.055, 0.062);
  maxilla.translate(0, 1.525, 0.032);
  specs.push({
    nodeName: "fallback_skull_bone",
    subRegion: "skull",
    geometry: mergeProceduralGeometries([skullDome, maxilla]),
  });

  const cVerts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 7; i += 1) {
    const t = i / 6;
    const y = THREE.MathUtils.lerp(1.488, 1.392, t);
    const z = -0.026 - Math.sin(t * Math.PI) * 0.006 - t * 0.014;
    const body = new THREE.CylinderGeometry(0.015 + t * 0.003, 0.016 + t * 0.003, 0.0105, 10);
    body.translate(0, y, z);
    cVerts.push(body);
  }
  specs.push({
    nodeName: "fallback_cervical_spine",
    subRegion: "cervical_spine",
    geometry: mergeProceduralGeometries(cVerts),
    showInHybrid: true,
  });

  const tVerts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 12; i += 1) {
    const t = i / 11;
    const y = THREE.MathUtils.lerp(1.372, 1.125, t);
    const z = -0.042 - Math.sin(t * Math.PI) * 0.022;
    const r = THREE.MathUtils.lerp(0.018, 0.023, t);
    const body = new THREE.CylinderGeometry(r, r * 1.03, 0.0155, 10);
    body.translate(0, y, z);
    tVerts.push(body);
  }
  specs.push({
    nodeName: "fallback_thoracic_spine",
    subRegion: "thoracic_spine",
    geometry: mergeProceduralGeometries(tVerts),
    showInHybrid: true,
  });

  const ribParts: THREE.BufferGeometry[] = [];
  const sternum = new THREE.BoxGeometry(0.024, 0.15, 0.01);
  sternum.translate(0, 1.295, 0.082);
  ribParts.push(sternum);
  for (const s of [-1, 1]) {
    for (let r = 0; r < 8; r += 1) {
      const rt = r / 7;
      const yBack = THREE.MathUtils.lerp(1.368, 1.165, rt);
      const yFront = yBack - 0.022 - rt * 0.018;
      const width = 0.095 + Math.sin(rt * Math.PI * 0.85) * 0.036;
      const frontX = rt < 0.72 ? s * 0.016 : s * (0.025 + (rt - 0.72) * 0.16);
      const frontZ = rt < 0.72 ? 0.081 : 0.068 - (rt - 0.72) * 0.08;
      ribParts.push(
        buildTubeBone(
          [
            [s * 0.018, yBack, -0.046 - Math.sin(rt * Math.PI) * 0.018],
            [s * (width * 0.78), yBack - 0.006, -0.028],
            [s * width, (yBack + yFront) * 0.5, 0.022],
            [frontX, yFront, frontZ],
          ],
          0.0046,
          10
        )
      );
    }
  }
  specs.push({
    nodeName: "fallback_rib_cage",
    subRegion: "rib_cage",
    geometry: mergeProceduralGeometries(ribParts),
    showInHybrid: true,
  });

  const lVerts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 5; i += 1) {
    const t = i / 4;
    const y = THREE.MathUtils.lerp(1.095, 0.958, t);
    const z = -0.046 + Math.sin(t * Math.PI) * 0.01;
    const body = new THREE.CylinderGeometry(0.025, 0.026, 0.021, 12);
    body.translate(0, y, z);
    lVerts.push(body);
  }
  specs.push({
    nodeName: "fallback_lumbar_spine",
    subRegion: "lumbar_spine",
    geometry: mergeProceduralGeometries(lVerts),
    showInHybrid: true,
  });

  const sacrum = new THREE.ConeGeometry(0.042, 0.095, 10);
  sacrum.rotateX(Math.PI);
  sacrum.scale(1, 1, 0.45);
  sacrum.translate(0, 0.892, -0.052);
  specs.push({
    nodeName: "fallback_sacrum_coccyx",
    subRegion: "sacroiliac_coccyx",
    geometry: sacrum,
    showInHybrid: true,
  });

  const pelvisParts: THREE.BufferGeometry[] = [];
  const humerusBones: THREE.BufferGeometry[] = [];
  const forearmBones: THREE.BufferGeometry[] = [];
  const femurBones: THREE.BufferGeometry[] = [];
  const shinBones: THREE.BufferGeometry[] = [];
  for (const s of [-1, 1]) {
    pelvisParts.push(
      buildTubeBone(
        [
          [s * 0.032, 0.925, -0.045],
          [s * 0.112, 0.952, -0.008],
          [s * 0.118, 0.895, 0.032],
          [s * 0.088, 0.855, 0.022],
          [s * 0.018, 0.842, 0.048],
        ],
        0.012,
        12
      )
    );
    humerusBones.push(
      buildTubeBone(
        [
          [s * 0.172, 1.365, -0.004],
          [s * 0.194, 1.245, -0.006],
          [s * 0.214, 1.132, -0.004],
        ],
        0.012,
        8
      )
    );
    forearmBones.push(
      buildTubeBone(
        [
          [s * 0.212, 1.098, 0.004],
          [s * 0.252, 0.902, 0.026],
        ],
        0.0075,
        8
      )
    );
    femurBones.push(
      buildTubeBone(
        [
          [s * 0.096, 0.858, 0.006],
          [s * 0.106, 0.835, 0.008],
          [s * 0.094, 0.665, 0.012],
          [s * 0.086, 0.498, 0.01],
        ],
        0.016,
        10
      )
    );
    shinBones.push(
      buildTubeBone(
        [
          [s * 0.083, 0.45, 0.01],
          [s * 0.08, 0.118, -0.004],
        ],
        0.013,
        8
      )
    );
  }
  specs.push(
    { nodeName: "fallback_pelvis", subRegion: "hip_groin", geometry: mergeProceduralGeometries(pelvisParts) },
    { nodeName: "fallback_humerus", subRegion: "biceps", geometry: mergeProceduralGeometries(humerusBones) },
    { nodeName: "fallback_forearm", subRegion: "forearm_extensor", geometry: mergeProceduralGeometries(forearmBones) },
    { nodeName: "fallback_femur", subRegion: "quadriceps", geometry: mergeProceduralGeometries(femurBones) },
    { nodeName: "fallback_tibia_fibula", subRegion: "calves", geometry: mergeProceduralGeometries(shinBones) }
  );

  return specs;
}

const VIEWPORT_LABELS: Record<
  Lang,
  {
    canvasAria: string;
    loadingTitle: string;
    loadingBones: string;
    loadingMuscles: string;
    left: string;
    right: string;
    loadError: string;
  }
> = {
  ru: {
    canvasAria: "3D-модель тела. Поворачивайте её стрелками влево и вправо. Выберите область из списка.",
    loadingTitle: "Загрузка 3D-тела",
    loadingBones: "Загрузка скелета",
    loadingMuscles: "Загрузка мышц",
    left: "слева",
    right: "справа",
    loadError: "3D тело не загрузилось. Выберите регион из списка.",
  },
  ro: {
    canvasAria: "Corp 3D. Folosește săgețile stânga și dreapta ca să îl rotești. Alege zona din listă.",
    loadingTitle: "Se încarcă corpul 3D",
    loadingBones: "Se încarcă scheletul",
    loadingMuscles: "Se încarcă mușchii",
    left: "stânga",
    right: "dreapta",
    loadError: "Corpul 3D nu s-a încărcat. Alege zona din listă.",
  },
  en: {
    canvasAria: "3D body. Use the left and right arrow keys to turn it. Choose the area from the list.",
    loadingTitle: "Loading the 3D body",
    loadingBones: "Loading skeleton",
    loadingMuscles: "Loading muscles",
    left: "left",
    right: "right",
    loadError: "The 3D body did not load. Choose the area from the list.",
  },
  sq: {
    canvasAria: "Trupi 3D. Përdor shigjetat majtas dhe djathtas për ta rrotulluar. Zgjidh zonën nga lista.",
    loadingTitle: "Po ngarkohet trupi 3D",
    loadingBones: "Po ngarkohet skeleti",
    loadingMuscles: "Po ngarkohen muskujt",
    left: "majtas",
    right: "djathtas",
    loadError: "Trupi 3D nuk u ngarkua. Zgjidh zonën nga lista.",
  },
  it: {
    canvasAria: "Corpo 3D. Usa le frecce sinistra e destra per girarlo. Scegli la zona dall'elenco.",
    loadingTitle: "Caricamento del corpo 3D",
    loadingBones: "Caricamento dello scheletro",
    loadingMuscles: "Caricamento dei muscoli",
    left: "sinistra",
    right: "destra",
    loadError: "Il corpo 3D non si è caricato. Scegli la zona dall'elenco.",
  },
  hr: {
    canvasAria: "3D tijelo. Koristi tipke sa strelicama lijevo i desno za okretanje. Odaberi područje s popisa.",
    loadingTitle: "Učitavanje 3D prikaza tijela",
    loadingBones: "Učitavanje kostura",
    loadingMuscles: "Učitavanje mišića",
    left: "lijevo",
    right: "desno",
    loadError: "3D prikaz tijela nije se učitao. Odaberi područje s popisa.",
  },
  rom: {
    canvasAria: "3D trupo. Lestar le sagi stingo thaj chacho te amboldes les. Alosar o than katar i lista.",
    loadingTitle: "Pharel pe o 3D trupo",
    loadingBones: "Pharel pe o skeleti",
    loadingMuscles: "Pharen pe le muskulura",
    left: "stingo",
    right: "chacho",
    loadError: "O 3D trupo na pherdilo. Alosar o than katar i lista.",
  },
};

function getFemaleSkinVoxelIndex(core: CachedCoreAtlasAssets): Int16Array {
  if (!core.femaleSkinVoxelIndex) {
    core.femaleSkinVoxelIndex = buildSkinVoxelIndex(core.femaleSkinPositions);
  }
  return core.femaleSkinVoxelIndex;
}

/** Tier 1: Core BodyParts3D outer skin, surface caps, and internal organs. */
function loadCoreAtlasAssets(onProgress?: (pct: number) => void): Promise<CachedCoreAtlasAssets> {
  if (globalCoreCache) {
    onProgress?.(60);
    return Promise.resolve(globalCoreCache);
  }
  if (globalCorePromise) {
    return globalCorePromise;
  }

  globalCorePromise = (async () => {
    const [manifestRes, binRes] = await Promise.all([
      fetch("/models/human-atlas-layers.json"),
      fetch("/models/human-atlas-layers.bin"),
    ]);
    if (!manifestRes.ok || !binRes.ok) {
      throw new Error("Could not load anatomical layers.");
    }
    const manifest = (await manifestRes.json()) as AtlasLayersManifest;
    const buffer = await binRes.arrayBuffer();
    onProgress?.(52);

    const cleanAtlasParts = new Map<string, CleanAtlasPartData>();
    let generalSkinPositions: Float32Array = new Float32Array(0);
    let generalSkinNormals: Float32Array = new Float32Array(0);
    let generalTuckNormals: Float32Array = new Float32Array(0);
    let femaleSkinPositions: Float32Array = new Float32Array(0);
    let femaleSkinNormals: Float32Array = new Float32Array(0);
    let femaleTuckNormals: Float32Array = new Float32Array(0);
    let skinIndices: Uint32Array = new Uint32Array(0);
    let skinBaseVertexCount = 0;

    for (const part of manifest.parts) {
      const rawPositions = new Float32Array(buffer, part.positions, part.vertexCount * 3);
      const rawNormals = new Int16Array(buffer, part.normals, part.vertexCount * 3);
      const rawIndices = new Uint32Array(buffer, part.indices, part.indexCount);

      if (part.id === "skin_shell") {
        const outerSkin = extractOuterManifold(rawPositions, rawNormals, rawIndices, {
          closeSmallBoundaryLoops: true,
          reconstructClinicalManifold: true,
        });
        skinIndices = outerSkin.indices;
        skinBaseVertexCount = outerSkin.baseVertexCount;
        generalSkinPositions = smoothPelvicGroinContour(outerSkin.positions, skinIndices, "general");
        generalSkinNormals = computeFloat32Normals(generalSkinPositions, skinIndices);
        generalTuckNormals = computeFloat32Normals(generalSkinPositions, outerSkin.baseIndices);

        const femaleRaw = new Float32Array(outerSkin.positions.length);
        const tmp: [number, number, number] = [0, 0, 0];
        for (let i = 0; i < outerSkin.positions.length / 3; i += 1) {
          morphFemaleCoordinate(
            outerSkin.positions[i * 3],
            outerSkin.positions[i * 3 + 1],
            outerSkin.positions[i * 3 + 2],
            tmp
          );
          femaleRaw[i * 3] = tmp[0];
          femaleRaw[i * 3 + 1] = tmp[1];
          femaleRaw[i * 3 + 2] = tmp[2];
        }
        femaleSkinPositions = smoothPelvicGroinContour(femaleRaw, skinIndices, "female");
        femaleSkinNormals = computeFloat32Normals(femaleSkinPositions, skinIndices);
        femaleTuckNormals = computeFloat32Normals(femaleSkinPositions, outerSkin.baseIndices);
      } else if (part.system === "integumentary") {
        const outerCap = extractOuterManifold(rawPositions, rawNormals, rawIndices, {
          closeSmallBoundaryLoops: false,
        });
        const normals = computeFloat32Normals(outerCap.positions, outerCap.indices);
        cleanAtlasParts.set(part.id, {
          positions: outerCap.positions,
          normals,
          indices: outerCap.indices,
          sculptAO: computeVertexSculptAO(outerCap.positions, normals, outerCap.indices, 0.55),
        });
      } else {
        const posCopy = new Float32Array(rawPositions);
        const normCopy = new Float32Array(rawNormals.length);
        for (let i = 0; i < rawNormals.length; i += 1) {
          normCopy[i] = rawNormals[i] / 32767;
        }
        const idxCopy = new Uint32Array(rawIndices);
        cleanAtlasParts.set(part.id, {
          positions: posCopy,
          normals: normCopy,
          indices: idxCopy,
          sculptAO: computeVertexSculptAO(posCopy, normCopy, idxCopy, 0.85),
        });
      }
    }

    const skinSculptAO = computeVertexSculptAO(generalSkinPositions, generalSkinNormals, skinIndices, 0.52);
    const muscleBump = createFiberTexture("muscle");
    const tendonBump = createFiberTexture("tendon");
    const boneBump = createBoneGrainTexture();

    globalCoreCache = {
      atlasManifest: manifest,
      cleanAtlasParts,
      generalSkinPositions,
      generalSkinNormals,
      generalTuckNormals,
      skinSculptAO,
      femaleSkinPositions,
      femaleSkinNormals,
      femaleTuckNormals,
      skinIndices,
      skinBaseVertexCount,
      femaleSkinVoxelIndex: null,
      muscleBump,
      tendonBump,
      boneBump,
    };
    onProgress?.(68);
    return globalCoreCache;
  })().catch((err) => {
    globalCorePromise = null;
    throw err;
  });

  return globalCorePromise;
}

/** Tier 2: Muscular GLB, loaded strictly on demand when muscular or hybrid layer is requested. */
function loadMuscularAssets(
  corePromise: Promise<CachedCoreAtlasAssets>,
  onProgress?: (pct: number) => void
): Promise<CachedMuscularAssets> {
  if (globalMuscularCache) {
    onProgress?.(100);
    return Promise.resolve(globalMuscularCache);
  }
  if (globalMuscularPromise) {
    return globalMuscularPromise;
  }

  const gltfLoader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltfPromise = new Promise<THREE.Group>((resolve, reject) => {
    gltfLoader.load(
      "/models/muscular.glb",
      (gltf) => {
        onProgress?.(88);
        resolve(gltf.scene);
      },
      (evt) => {
        if (evt.total > 0) {
          const pct = Math.round((evt.loaded / evt.total) * 32);
          onProgress?.(55 + pct);
        }
      },
      reject
    );
  });

  globalMuscularPromise = Promise.all([corePromise, gltfPromise])
    .then(([core, gltfScene]) => {
      bakeAndTuckMuscularScene(
        gltfScene,
        core.generalSkinPositions,
        core.generalTuckNormals,
        core.femaleSkinPositions,
        core.femaleTuckNormals,
        core.skinBaseVertexCount
      );

      const muscleDonors: MuscleDonorInput[] = [];
      Object.keys(REGION_BY_GLB_NODE).forEach((nodeName) => {
        const node = gltfScene.getObjectByName(nodeName);
        if (!node) return;
        node.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh) return;
          const matName = (mesh.material as THREE.Material | undefined)?.name?.toLowerCase() || "";
          const tissue: TissueKind = matName === "tendon" ? "Tendon" : "Muscle";
          const subRegion = resolveGlbSubRegion(nodeName, tissue);
          const posAttr = mesh.geometry.getAttribute("position") as THREE.BufferAttribute | undefined;
          const normAttr = mesh.geometry.getAttribute("normal") as THREE.BufferAttribute | undefined;
          const idxAttr = mesh.geometry.getIndex();
          if (posAttr) {
            const posArr = posAttr.array as Float32Array;
            muscleDonors.push({ nodeName, subRegion, positions: posArr });
            // Precompute lightweight sculptural AO once per cached GLB primitive
            const normFloats = new Float32Array(posAttr.count * 3);
            if (normAttr) {
              for (let i = 0; i < posAttr.count; i += 1) {
                normFloats[i * 3] = normAttr.getX(i);
                normFloats[i * 3 + 1] = normAttr.getY(i);
                normFloats[i * 3 + 2] = normAttr.getZ(i);
              }
            }
            mesh.userData.bakedSculptAO = computeVertexSculptAO(
              posArr,
              normFloats,
              idxAttr ? (idxAttr.array as ArrayLike<number>) : null,
              0.72
            );
          }
        });
      });

      globalMuscularCache = { scene: gltfScene, muscleDonors };
      onProgress?.(100);
      return globalMuscularCache;
    })
    .catch((err) => {
      globalMuscularPromise = null;
      throw err;
    });

  return globalMuscularPromise;
}

/** Tier 3: Real BodyParts3D skeletal bundle, loaded strictly on demand (ZERO bytes on initial load). */
function loadSkeletonAssets(): Promise<CachedSkeletonAssets> {
  if (globalSkeletonCache) {
    return Promise.resolve(globalSkeletonCache);
  }
  if (globalSkeletonPromise) {
    return globalSkeletonPromise;
  }

  globalSkeletonPromise = (async () => {
    const [manifestRes, binRes] = await Promise.all([
      fetch("/models/human-atlas-skeleton.json"),
      fetch("/models/human-atlas-skeleton.bin"),
    ]);
    if (!manifestRes.ok || !binRes.ok) {
      throw new Error("Could not load skeletal atlas bundle.");
    }
    const manifest = (await manifestRes.json()) as SkeletonBundleManifest;
    const buffer = await binRes.arrayBuffer();

    const parts: DecodedSkeletonPart[] = [];
    for (const part of manifest.parts) {
      const decoded = decodeSkeletonPartBinary(part, buffer);
      if (decoded) parts.push(decoded);
    }
    if (parts.length === 0) {
      throw new Error("Skeletal atlas bundle contained no valid parts.");
    }

    globalSkeletonCache = { manifest, parts };
    return globalSkeletonCache;
  })().catch((err) => {
    globalSkeletonPromise = null;
    throw err;
  });

  return globalSkeletonPromise;
}

export function AnatomicalViewport3D({
  selectedPart,
  selectedSubRegion,
  selectedSide,
  viewAngle,
  layerMode,
  isolateSelected,
  bodyProfile = "general",
  onSelectAnatomy,
  onUnavailable,
  lang = DEFAULT_LANG,
  compact = false,
  className,
  children,
  decorative = false,
  viewRequest = 0,
  onFreeRotate,
  cameraRef,
}: AnatomicalViewport3DProps) {
  const labels = VIEWPORT_LABELS[lang] ?? VIEWPORT_LABELS[DEFAULT_LANG];
  const webglError = WEBGL_ERROR[lang] ?? WEBGL_ERROR[DEFAULT_LANG];
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const initiallyCached = Boolean(
    globalCoreCache &&
      (!needsMuscularLayer(layerMode) || globalMuscularCache) &&
      (!needsSkeletonLayer(layerMode, selectedSubRegion) || globalSkeletonCache)
  );
  const [loadProgress, setLoadProgress] = useState<number>(initiallyCached ? 100 : 14);
  const [modelReady, setModelReady] = useState<boolean>(initiallyCached);
  const [layerLoading, setLayerLoading] = useState<"skeletal" | "muscular" | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hoverBadge, setHoverBadge] = useState<{
    visible: boolean;
    x: number;
    y: number;
    name: string;
    areaLabel: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    name: "",
    areaLabel: "",
  });

  const onUnavailableRef = useRef(onUnavailable);
  useEffect(() => {
    onUnavailableRef.current = onUnavailable;
  });
  useEffect(() => {
    if (loadError) onUnavailableRef.current?.(loadError);
  }, [loadError]);

  // Mutable ref to sync React props into the Three.js loop without re-creating the WebGL context
  const stateRef = useRef({
    selectedPart,
    selectedSubRegion,
    selectedSide,
    viewAngle,
    layerMode,
    isolateSelected,
    bodyProfile,
    onSelectAnatomy,
    compact,
    lang,
    decorative,
    onFreeRotate,
  });
  useEffect(() => {
    stateRef.current = {
      selectedPart,
      selectedSubRegion,
      selectedSide,
      viewAngle,
      layerMode,
      isolateSelected,
      bodyProfile,
      onSelectAnatomy,
      compact,
      lang,
      decorative,
      onFreeRotate,
    };
  });

  // Expose imperative camera and layer synchronization methods
  const controlsApiRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    rotateLeft: () => void;
    rotateRight: () => void;
    rotateBy: (deltaRad: number) => void;
    panUp: () => void;
    panDown: () => void;
    resetCamera: () => void;
    focusSubRegion: (subRegion: SubRegionId, side?: "Left" | "Right" | "Center") => void;
    focusArea: (macroPart: BodyPartId) => void;
    syncVisuals: () => void;
    ensureLayerAssets: () => void;
    animateToPreset: (preset: CameraViewPreset) => void;
  } | null>(null);

  useEffect(() => {
    const wrapEl = wrapRef.current;
    const canvasEl = canvasRef.current;
    if (!wrapEl || !canvasEl) return;

    let disposed = false;
    let renderRequested = false;
    let isAnimating = false;
    /** Advances the camera move in flight; called by the render loop so each frame is drawn once. */
    let cameraTick: ((now: number) => void) | null = null;
    let pointerMoveRafId: number | null = null;
    let pendingPointer: { clientX: number; clientY: number } | null = null;
    let idealDistance = compact ? 16.8 : 17.8;

    // Shared BodyParts3D transform constants (meters: Y in [0, 1.72] -> scaled to [-3.85, +3.85])
    const MODEL_SCALE = 7.7 / 1.72;
    const CENTER_Y = 0.86;
    const REST_TARGET_Y = -0.25;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, REST_TARGET_Y, idealDistance);

    if (!hasWebGL()) {
      queueMicrotask(() => {
        if (!disposed) setLoadError(webglError);
      });
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvasEl,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      queueMicrotask(() => {
        if (!disposed) {
          setLoadError(webglError);
        }
      });
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;

    // Soft studio PMREM environment for ceramic bone, skin, and visceral realism (zero external HDRI bytes)
    let envRenderTarget: THREE.WebGLRenderTarget | null = null;
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      envRenderTarget = pmremGenerator.fromScene(roomEnv, 0.04);
      scene.environment = envRenderTarget.texture;
      scene.environmentIntensity = 0.36;
      roomEnv.dispose();
      pmremGenerator.dispose();
    } catch {
      // Safe fallback to direct studio lights on constrained GPUs
    }

    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const controls = new OrbitControls(camera, canvasEl);
    controls.enableDamping = !reduceMotionQuery.matches;
    controls.dampingFactor = 0.075;
    const onReduceMotionChange = () => {
      controls.enableDamping = !reduceMotionQuery.matches;
    };
    reduceMotionQuery.addEventListener("change", onReduceMotionChange);
    controls.enablePan = false;
    controls.minDistance = 5.8;
    controls.maxDistance = 22;
    controls.target.set(0, REST_TARGET_Y, 0);
    controls.rotateSpeed = 0.68;
    controls.zoomSpeed = 0.85;
    controls.minPolarAngle = Math.PI * 0.36;
    controls.maxPolarAngle = Math.PI * 0.64;

    controls.touches = {
      ONE: null,
      TWO: THREE.TOUCH.DOLLY_ROTATE,
    };
    canvasEl.style.touchAction = "pan-y";

    function requestRender() {
      if (!renderRequested && !disposed) {
        renderRequested = true;
        requestAnimationFrame(renderFrame);
      }
    }

    function renderFrame(now: number = performance.now()) {
      renderRequested = false;
      if (disposed) return;
      cameraTick?.(now);
      controls.update();
      renderer.render(scene, camera);
      if (wrapEl) {
        if (activeAnchorWorld) {
          projectedAnchor.copy(activeAnchorWorld).project(camera);
          const pctX = Math.min(88, Math.max(12, (projectedAnchor.x * 0.5 + 0.5) * 100));
          const pctY = Math.min(86, Math.max(12, (-projectedAnchor.y * 0.5 + 0.5) * 100));
          wrapEl.style.setProperty("--anchor-x", `${pctX.toFixed(2)}%`);
          wrapEl.style.setProperty("--anchor-y", `${pctY.toFixed(2)}%`);
          wrapEl.dataset.anchorActive = projectedAnchor.z <= 1 ? "true" : "false";
        } else {
          wrapEl.dataset.anchorActive = "false";
        }
      }
      if (isAnimating) requestRender();
    }

    controls.addEventListener("change", requestRender);
    const onControlsStart = () => {
      cancelCameraMove();
      stateRef.current.onFreeRotate?.();
    };
    controls.addEventListener("start", onControlsStart);

    // Calibrated 3-point clinical studio lighting: sculptural modeling without blowing out warm ivory bone
    scene.add(new THREE.HemisphereLight(0xfcf9f2, 0x5c6d82, 0.82));

    const keyLight = new THREE.DirectionalLight(0xfff7ec, 1.9);
    keyLight.position.set(-4.8, 7.6, 8.8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd9e6f6, 1.05);
    rimLight.position.set(5.8, 3.8, -7.2);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xf6efe7, 0.62);
    fillLight.position.set(5.6, -1.2, 5.0);
    scene.add(fillLight);

    // Root anatomy group
    const anatomyRoot = new THREE.Group();
    anatomyRoot.name = "RediHealth 3D Anatomy";
    scene.add(anatomyRoot);

    const atlasGroup = new THREE.Group();
    atlasGroup.scale.setScalar(MODEL_SCALE);
    atlasGroup.position.set(0, -CENTER_Y * MODEL_SCALE, 0);
    anatomyRoot.add(atlasGroup);

    const skeletonGroup = new THREE.Group();
    skeletonGroup.name = "Human Atlas Skeleton";
    atlasGroup.add(skeletonGroup);

    // Subtle grounded contact-shadow and architectural calibration plane beneath anatomyRoot
    const stagePlaneTexture = createStageCalibrationTexture();
    const stagePlaneGeometry = new THREE.PlaneGeometry(4.8, 4.8);
    const stagePlaneMaterial = new THREE.MeshBasicMaterial({
      map: stagePlaneTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.9,
    });
    const stagePlaneMesh = new THREE.Mesh(stagePlaneGeometry, stagePlaneMaterial);
    stagePlaneMesh.rotation.x = -Math.PI / 2;
    stagePlaneMesh.position.set(0, -CENTER_Y * MODEL_SCALE - 0.02, 0);
    stagePlaneMesh.renderOrder = -1;
    scene.add(stagePlaneMesh);

    interface MorphableMeshEntry {
      mesh: THREE.Mesh;
      basePositions: Float32Array;
      baseNormals?: Float32Array;
      femalePositions?: Float32Array;
      femaleNormals?: Float32Array;
      recomputeNormals?: boolean;
    }

    const selectableMeshes: THREE.Mesh[] = [];
    const morphableMeshes: MorphableMeshEntry[] = [];
    const skeletonMeshes: THREE.Mesh[] = [];

    let coreAssets: CachedCoreAtlasAssets | null = null;
    let musclesMounted = false;
    let muscularFetchInFlight = false;
    let realSkeletonMounted = false;
    let fallbackSkeletonMounted = false;
    let skeletonFetchInFlight = false;

    let skinSubRegions: SkinSubRegionMaps | null = null;
    let skinHover: { subRegion: SubRegionId; side: "Left" | "Right" | "Center" } | null = null;
    let appliedFemaleMorph: boolean | null = null;
    let skinShellMesh: THREE.Mesh | null = null;
    let cachedChestFloor: number | null = null;
    let activeAnchorWorld: THREE.Vector3 | null = null;
    const projectedAnchor = new THREE.Vector3();

    // Shared PBR textures (reused from core cache once ready)
    const ownedTextures: THREE.CanvasTexture[] = [];
    const muscleBump = globalCoreCache?.muscleBump ?? (() => {
      const tex = createFiberTexture("muscle");
      ownedTextures.push(tex);
      return tex;
    })();
    const tendonBump = globalCoreCache?.tendonBump ?? (() => {
      const tex = createFiberTexture("tendon");
      ownedTextures.push(tex);
      return tex;
    })();
    const boneBump = globalCoreCache?.boneBump ?? (() => {
      const tex = createBoneGrainTexture();
      ownedTextures.push(tex);
      return tex;
    })();

    const muscleMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.54,
      metalness: 0.02,
      bumpMap: muscleBump,
      bumpScale: 0.014,
      clearcoat: 0.06,
      clearcoatRoughness: 0.64,
      sheen: 0.16,
      sheenRoughness: 0.7,
      sheenColor: new THREE.Color(0xc47e81),
      side: THREE.DoubleSide,
    });

    // Translucent torso-wall muscle material used exclusively in "hybrid" (Whole body) cutaway mode
    const hybridTorsoMuscleMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.56,
      metalness: 0.01,
      bumpMap: muscleBump,
      bumpScale: 0.01,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      side: THREE.FrontSide,
    });

    const tendonMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.44,
      metalness: 0.02,
      bumpMap: tendonBump,
      bumpScale: 0.009,
      clearcoat: 0.09,
      clearcoatRoughness: 0.56,
      side: THREE.DoubleSide,
    });

    const organMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.4,
      metalness: 0.03,
      clearcoat: 0.16,
      clearcoatRoughness: 0.4,
      sheen: 0.18,
      sheenRoughness: 0.6,
      sheenColor: new THREE.Color(0xecd8dc),
      side: THREE.DoubleSide,
    });

    // Opaque sculpted alabaster caps for head, neck, hands, and feet in muscular/hybrid modes
    const surfaceCapMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.62,
      metalness: 0.01,
      clearcoat: 0.03,
      clearcoatRoughness: 0.78,
      sheen: 0.18,
      sheenRoughness: 0.74,
      sheenColor: new THREE.Color(0xf6ede4),
      transparent: false,
      opacity: 1,
      depthWrite: true,
      side: THREE.FrontSide,
    });

    const surfaceZoneBaseMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.56,
      metalness: 0.01,
      clearcoat: 0.04,
      transparent: true,
      opacity: 0.04,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const skinShellMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.64,
      metalness: 0.01,
      clearcoat: 0.03,
      clearcoatRoughness: 0.78,
      sheen: 0.24,
      sheenRoughness: 0.68,
      sheenColor: new THREE.Color(0xf6ede4),
      transparent: false,
      opacity: 1,
      depthWrite: true,
      side: THREE.FrontSide,
    });

    // Warm ivory-bone matte ceramic PBR material (not glossy plastic!)
    const boneMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.62,
      metalness: 0.015,
      bumpMap: boneBump,
      bumpScale: 0.0055,
      clearcoat: 0.05,
      clearcoatRoughness: 0.76,
      sheen: 0.14,
      sheenRoughness: 0.72,
      sheenColor: new THREE.Color(0xf8f2e6),
      side: THREE.DoubleSide,
    });

    /*
     * Two broad sheets hide the muscles people actually name. The oblique mesh carries the flat
     * sheath in front of the straight belly muscles, and the lat mesh spreads over the lumbar
     * muscles. Those vertices count as what they cover.
     */
    let rectusBox: THREE.Box3 | null = null;
    let lumbarWindow: { maxY: number; maxX: number } | null = null;
    function coveredSubRegion(nodeName: string | undefined, x: number, y: number, z: number): SubRegionId | null {
      if (
        nodeName === "obliques" &&
        rectusBox !== null &&
        Math.abs(x) <= rectusBox.max.x &&
        y >= rectusBox.min.y &&
        y <= rectusBox.max.y &&
        z >= rectusBox.min.z
      ) {
        return "abdominals";
      }
      if (nodeName === "lats" && lumbarWindow !== null && y <= lumbarWindow.maxY && Math.abs(x) <= lumbarWindow.maxX) {
        return "lower_back";
      }
      return null;
    }

    const tmpColor = new THREE.Color();

    // Paint vertex colors with subtle sculptural AO modulation so selected/resting anatomy stays deeply 3D
    function paintMesh(mesh: THREE.Mesh) {
      const position = mesh.geometry.attributes.position;
      if (!position) return;
      const data = mesh.userData as {
        nodeName?: string;
        subRegion: SubRegionId;
        macroPart: BodyPartId;
        tissue: TissueKind;
        bilateral: boolean;
        baseColor: THREE.Color;
        sculptAO?: Float32Array;
        hoverSide: "Left" | "Right" | "Center" | null;
        hoverSub?: SubRegionId;
        isSurfaceZone?: boolean;
        ownsMaterial?: boolean;
      };

      let colors = mesh.geometry.getAttribute("color") as THREE.BufferAttribute | undefined;
      if (!colors || colors.count !== position.count) {
        colors = new THREE.BufferAttribute(new Float32Array(position.count * 3), 3);
        mesh.geometry.setAttribute("color", colors);
      }

      const activeSub = stateRef.current.selectedSubRegion;
      const activePart = stateRef.current.selectedPart;
      const activeSide = stateRef.current.selectedSide;
      const mode = stateRef.current.layerMode;

      const isExactSubSelected =
        activeSub !== null &&
        (data.subRegion === activeSub || Boolean(SHOWN_ON_SURFACE[activeSub]?.includes(data.subRegion)));
      const isSubMatch = activeSub
        ? isExactSubSelected
        : activePart !== null && data.macroPart === activePart;
      const referredList = activeSub ? REFERRED_PAIN_BY_SUB_REGION[activeSub] : undefined;
      const isReferredMatch = Boolean(
        !isSubMatch && referredList && referredList.includes(data.subRegion)
      );

      if (data.isSurfaceZone && data.ownsMaterial) {
        const mat = mesh.material as THREE.MeshPhysicalMaterial;
        if (isExactSubSelected) {
          mat.opacity = 0.84;
        } else if (isReferredMatch) {
          mat.opacity = 0.52;
        } else if (data.hoverSide !== null) {
          mat.opacity = 0.68;
        } else if (data.subRegion === "breast") {
          mat.opacity = mode === "surface" ? 0.62 : 0.34;
        } else if (activePart !== null && data.macroPart === activePart && activePart === "pelvis") {
          mat.opacity = mode === "surface" ? 0.42 : 0.24;
        } else {
          mat.opacity = mode === "surface" ? 0.18 : 0.03;
        }
      }

      const surfaceSoftenedBase =
        mode === "surface" && data.tissue === "Muscle"
          ? data.baseColor.clone().lerp(SURFACE_ACCENT_COLOR, 0.78)
          : data.baseColor;

      const outsideArea = activePart !== null && data.macroPart !== activePart && !isReferredMatch;
      const dimmedColor = outsideArea ? surfaceSoftenedBase.clone().lerp(DIM_COLOR, DIM_AMOUNT) : null;
      const referredColor = isReferredMatch
        ? surfaceSoftenedBase.clone().lerp(REFERRED_COLOR, 0.56)
        : null;

      const aoArr = data.sculptAO;
      const hasAO = Boolean(aoArr && aoArr.length === position.count);

      for (let i = 0; i < position.count; i += 1) {
        const vSide = data.bilateral ? sideForVertex(position.getX(i)) : "Center";
        const covered = coveredSubRegion(data.nodeName, position.getX(i), position.getY(i), position.getZ(i));
        const isVertexSelected =
          covered && activeSub !== null
            ? activeSub === covered
            : isSubMatch &&
              (!activeSub ||
                !data.bilateral ||
                activeSide === "Center" ||
                activeSide === vSide);
        const isVertexHovered =
          (data.hoverSide === vSide || data.hoverSide === "Center") &&
          (data.hoverSub === undefined || data.hoverSub === (covered ?? data.subRegion));

        const ao = hasAO ? aoArr![i] : 1;
        if (isVertexSelected) {
          // Keep subtle sculptural shading on selected anatomy so bones & organs stay richly 3D
          const shade = 0.86 + 0.14 * ao;
          tmpColor.copy(SELECTED_COLOR).multiplyScalar(shade);
        } else if (isVertexHovered) {
          const shade = 0.88 + 0.12 * ao;
          tmpColor.copy(HOVER_COLOR).multiplyScalar(shade);
        } else {
          const base = referredColor ?? dimmedColor ?? surfaceSoftenedBase;
          tmpColor.copy(base).multiplyScalar(ao);
        }
        colors.setXYZ(i, tmpColor.r, tmpColor.g, tmpColor.b);
      }
      colors.needsUpdate = true;
    }

    function recomputeAnatomyBounds() {
      const rectusMeshes = selectableMeshes.filter((m) => m.userData.subRegion === "abdominals");
      if (rectusMeshes.length) {
        const box = new THREE.Box3();
        rectusMeshes.forEach((m) => {
          m.geometry.computeBoundingBox();
          if (m.geometry.boundingBox) box.union(m.geometry.boundingBox);
        });
        rectusBox = box;
      }
      const geometryBox = (nodeName: string) => {
        const box = new THREE.Box3();
        selectableMeshes
          .filter((m) => m.userData.nodeName === nodeName)
          .forEach((m) => {
            m.geometry.computeBoundingBox();
            if (m.geometry.boundingBox) box.union(m.geometry.boundingBox);
          });
        return box.isEmpty() ? null : box;
      };
      const latsBox = geometryBox("lats");
      const erectorsBox = geometryBox("erectors");
      if (latsBox && erectorsBox) {
        lumbarWindow = {
          maxY: latsBox.min.y + (latsBox.max.y - latsBox.min.y) * 0.52,
          maxX: erectorsBox.max.x * 1.3,
        };
      }
      cachedChestFloor = null;
    }

    function applyProfileToMorphEntry(entry: MorphableMeshEntry, wantFemale: boolean) {
      const pos = entry.mesh.geometry.getAttribute("position") as THREE.BufferAttribute | undefined;
      if (!pos) return;
      const base = entry.basePositions;
      const arr = pos.array as Float32Array;
      const tmp: [number, number, number] = [0, 0, 0];

      if (wantFemale) {
        if (entry.femalePositions && entry.femalePositions.length === arr.length) {
          arr.set(entry.femalePositions);
        } else {
          for (let i = 0; i < pos.count; i += 1) {
            const j = i * 3;
            morphFemaleCoordinate(base[j], base[j + 1], base[j + 2], tmp);
            arr[j] = tmp[0];
            arr[j + 1] = tmp[1];
            arr[j + 2] = tmp[2];
          }
        }
      } else {
        arr.set(base);
      }
      pos.needsUpdate = true;

      const norm = entry.mesh.geometry.getAttribute("normal") as THREE.BufferAttribute | undefined;
      if (norm && entry.baseNormals && entry.femaleNormals) {
        const targetNorm = wantFemale ? entry.femaleNormals : entry.baseNormals;
        if (norm.array.length === targetNorm.length) {
          (norm.array as Float32Array).set(targetNorm);
          norm.needsUpdate = true;
        }
      } else if (entry.recomputeNormals) {
        entry.mesh.geometry.computeVertexNormals();
      }
      entry.mesh.geometry.computeBoundingBox();
      entry.mesh.geometry.computeBoundingSphere();
    }

    function applyBodyProfileMorph(force = false) {
      const wantFemale = stateRef.current.bodyProfile === "female";
      if (!force && appliedFemaleMorph === wantFemale) return;
      appliedFemaleMorph = wantFemale;

      if (skinShellMesh && coreAssets) {
        const pos = skinShellMesh.geometry.getAttribute("position") as THREE.BufferAttribute | undefined;
        const norm = skinShellMesh.geometry.getAttribute("normal") as THREE.BufferAttribute | undefined;
        const targetPos = wantFemale
          ? coreAssets.femaleSkinPositions
          : coreAssets.generalSkinPositions;
        const targetNorm = wantFemale
          ? coreAssets.femaleSkinNormals
          : coreAssets.generalSkinNormals;
        if (pos && pos.array.length === targetPos.length) {
          (pos.array as Float32Array).set(targetPos);
          pos.needsUpdate = true;
        }
        if (norm && norm.array.length === targetNorm.length) {
          (norm.array as Float32Array).set(targetNorm);
          norm.needsUpdate = true;
        }
        skinShellMesh.geometry.computeBoundingSphere();
      }

      for (const entry of morphableMeshes) {
        applyProfileToMorphEntry(entry, wantFemale);
      }
      recomputeAnatomyBounds();
    }

    function paintSkinShell() {
      if (!skinShellMesh) return;
      const position = skinShellMesh.geometry.getAttribute("position") as THREE.BufferAttribute | undefined;
      if (!position) return;

      let colors = skinShellMesh.geometry.getAttribute("color") as THREE.BufferAttribute | undefined;
      if (!colors || colors.count !== position.count) {
        colors = new THREE.BufferAttribute(new Float32Array(position.count * 3), 3);
        skinShellMesh.geometry.setAttribute("color", colors);
      }

      const mode = stateRef.current.layerMode;
      const isolate = stateRef.current.isolateSelected;
      const skinAO = coreAssets?.skinSculptAO;
      const hasAO = Boolean(skinAO && skinAO.length === position.count);

      if (mode !== "surface" || !skinSubRegions) {
        const ghostColor =
          mode === "skeletal" || mode === "organs" ? SKIN_GHOST_COOL_COLOR : SKIN_GHOST_WARM_COLOR;
        for (let i = 0; i < position.count; i += 1) {
          colors.setXYZ(i, ghostColor.r, ghostColor.g, ghostColor.b);
        }
        colors.needsUpdate = true;
        return;
      }

      const activeSub = stateRef.current.selectedSubRegion;
      const activePart = stateRef.current.selectedPart;
      const activeSide = stateRef.current.selectedSide;
      const wantFemale = stateRef.current.bodyProfile === "female";
      const subMap = wantFemale ? skinSubRegions.female : skinSubRegions.general;
      const referredList = activeSub ? REFERRED_PAIN_BY_SUB_REGION[activeSub] : undefined;
      const projectedList = activeSub ? SURFACE_ORGAN_PROJECTION[activeSub] : undefined;

      const dimmedBase = SKIN_BASE_COLOR.clone().lerp(DIM_COLOR, isolate ? 0.78 : DIM_AMOUNT);
      const referredBase = SKIN_BASE_COLOR.clone().lerp(REFERRED_COLOR, 0.56);

      for (let i = 0; i < position.count; i += 1) {
        const vSub = subMap[i];
        const vInfo = SUB_REGION_INFO[vSub];
        const vSide = vInfo.bilateral ? sideForVertex(position.getX(i)) : "Center";

        const isProjectedMatch = Boolean(projectedList?.includes(vSub));
        const isExactSub = activeSub !== null && (vSub === activeSub || isProjectedMatch);
        const sideMatches =
          !activeSub ||
          !vInfo.bilateral ||
          (activeSide === "Center"
            ? activeSub === "heart" || activeSub === "stomach_organ"
              ? vSide === "Left"
              : activeSub === "liver"
                ? vSide === "Right"
                : true
            : activeSide === vSide);

        const isSelected = activeSub
          ? isExactSub && sideMatches
          : activePart !== null && vInfo.macroPart === activePart;

        const isHovered =
          !isSelected &&
          skinHover !== null &&
          skinHover.subRegion === vSub &&
          (skinHover.side === "Center" || skinHover.side === vSide);

        const isReferred = !isSelected && Boolean(referredList?.includes(vSub));
        const isOutsideArea =
          (activePart !== null && vInfo.macroPart !== activePart && !isReferred && !isSelected) ||
          (isolate && Boolean(activeSub || activePart) && !isSelected);

        const ao = hasAO ? skinAO![i] : 1;
        if (isSelected) {
          tmpColor.copy(SELECTED_COLOR).multiplyScalar(0.86 + 0.14 * ao);
        } else if (isHovered) {
          tmpColor.copy(HOVER_COLOR).multiplyScalar(0.88 + 0.12 * ao);
        } else {
          const base = isReferred ? referredBase : isOutsideArea ? dimmedBase : SKIN_BASE_COLOR;
          tmpColor.copy(base).multiplyScalar(ao);
        }
        colors.setXYZ(i, tmpColor.r, tmpColor.g, tmpColor.b);
      }
      colors.needsUpdate = true;
    }

    function isProfileActiveMesh(d: { femaleOnly?: boolean; generalOnly?: boolean }): boolean {
      const isFemale = stateRef.current.bodyProfile === "female";
      if (d.femaleOnly && !isFemale) return false;
      if (d.generalOnly && isFemale) return false;
      return true;
    }

    function applyLayerVisibility() {
      const mode = stateRef.current.layerMode;
      const isolate = stateRef.current.isolateSelected;
      const activeSub = stateRef.current.selectedSubRegion;
      const activePart = stateRef.current.selectedPart;

      if (skinShellMesh) {
        const isSurfaceMode = mode === "surface" || (mode === "muscular" && !musclesMounted);
        const wantTransparent = !isSurfaceMode;
        if (skinShellMaterial.transparent !== wantTransparent) {
          skinShellMaterial.transparent = wantTransparent;
          skinShellMaterial.needsUpdate = true;
        }
        if (isSurfaceMode) {
          skinShellMesh.visible = true;
          skinShellMaterial.opacity = 1;
          skinShellMaterial.depthWrite = true;
          skinShellMaterial.roughness = 0.64;
          skinShellMaterial.sheen = 0.24;
          skinShellMaterial.sheenColor.setHex(0xf6ede4);
        } else if (isolate && (activeSub || activePart)) {
          skinShellMesh.visible = false;
        } else {
          skinShellMesh.visible = true;
          skinShellMaterial.depthWrite = false;
          skinShellMaterial.roughness = 0.44;
          skinShellMaterial.sheen = 0.38;
          skinShellMaterial.sheenColor.setHex(
            mode === "skeletal" || mode === "organs" ? 0x99afc9 : 0xddd0c4
          );
          skinShellMaterial.opacity =
            mode === "skeletal"
              ? 0.13
              : mode === "organs"
                ? 0.17
                : mode === "hybrid"
                  ? 0.14
                  : 0.1;
        }
      }

      selectableMeshes.forEach((mesh) => {
        const d = mesh.userData as {
          subRegion: SubRegionId;
          macroPart: BodyPartId;
          tissue?: TissueKind;
          isOrgan?: boolean;
          isBone?: boolean;
          showBoneInHybrid?: boolean;
          isSurfaceCap?: boolean;
          isSurfaceZone?: boolean;
          isMuscleGlb?: boolean;
          femaleOnly?: boolean;
          generalOnly?: boolean;
          coversViscera?: boolean;
          hideInOrgans?: boolean;
        };

        if (!isProfileActiveMesh(d) || mode === "surface") {
          mesh.visible = false;
          return;
        }

        // Swap torso-wall muscles to translucent cutaway material ONLY in hybrid mode
        if (d.isMuscleGlb && d.tissue === "Muscle" && TORSO_WALL_SUB_REGIONS.has(d.subRegion)) {
          const wantHybridWall = mode === "hybrid";
          const targetMat = wantHybridWall ? hybridTorsoMuscleMaterial : muscleMaterial;
          if (mesh.material !== targetMat) {
            mesh.material = targetMat;
          }
          mesh.renderOrder = wantHybridWall ? 1 : 0;
        }

        if (isolate && (activeSub || activePart)) {
          const matchesIsolate = activeSub
            ? d.subRegion === activeSub && !(mode === "organs" && d.hideInOrgans)
            : d.macroPart === activePart;
          mesh.visible = matchesIsolate;
          return;
        }

        if (mode === "skeletal") {
          // Real BodyParts3D skeleton stands cleanly inside the translucent skin silhouette
          // without opaque head/neck/hand/foot skin caps obscuring the skull, jaw, spine, hands, or feet.
          mesh.visible = Boolean(d.isBone);
        } else if (mode === "organs") {
          if (d.isOrgan) {
            mesh.visible = true;
          } else if (d.isBone) {
            // If the user explicitly focuses a skeletal structure (e.g. rib_cage) while in organs view, reveal it
            mesh.visible = activeSub !== null && d.subRegion === activeSub;
          } else if (d.isSurfaceCap || d.isSurfaceZone) {
            // Reveal a specific surface cap or zone (e.g. neck, feet_soles, breast, pelvic_floor) when focused
            mesh.visible =
              activeSub !== null &&
              d.subRegion === activeSub &&
              !(d.subRegion === "rib_cage" && realSkeletonMounted);
          } else {
            // Keep organs view clean and clinical without disembodied limb muscles
            mesh.visible = false;
          }
        } else if (mode === "muscular") {
          if (d.isOrgan || d.isBone) {
            mesh.visible = false;
          } else if (d.isSurfaceZone && d.coversViscera && d.subRegion !== "breast") {
            mesh.visible = activeSub === d.subRegion;
          } else {
            mesh.visible = true;
          }
        } else {
          // Hybrid ("Whole body"): solid limb muscles + translucent torso cutaway + organs + axial skeleton
          mesh.visible = d.isBone ? Boolean(d.showBoneInHybrid || activeSub === d.subRegion) : true;
        }
      });
    }

    function computeSkinSubRegionWorldBox(
      subRegion: SubRegionId | null,
      macroPart: BodyPartId | null,
      side: "Left" | "Right" | "Center"
    ): THREE.Box3 | null {
      if (!skinShellMesh || !skinSubRegions) return null;
      const pos = skinShellMesh.geometry.getAttribute("position") as THREE.BufferAttribute | undefined;
      if (!pos) return null;
      const wantFemale = stateRef.current.bodyProfile === "female";
      const subMap = wantFemale ? skinSubRegions.female : skinSubRegions.general;
      const projectedList = subRegion ? SURFACE_ORGAN_PROJECTION[subRegion] : undefined;
      const box = new THREE.Box3();
      const probe = new THREE.Vector3();
      skinShellMesh.updateWorldMatrix(true, false);

      for (let i = 0; i < pos.count; i += 2) {
        const vSub = subMap[i];
        const vInfo = SUB_REGION_INFO[vSub];
        const matches = subRegion
          ? vSub === subRegion || Boolean(projectedList?.includes(vSub))
          : macroPart !== null && vInfo.macroPart === macroPart;
        if (!matches) continue;
        if (subRegion && vInfo.bilateral && side !== "Center" && sideForVertex(pos.getX(i)) !== side) {
          continue;
        }
        probe.fromBufferAttribute(pos, i).applyMatrix4(skinShellMesh.matrixWorld);
        box.expandByPoint(probe);
      }
      return box.isEmpty() ? null : box;
    }

    function updateActiveAnchor() {
      const activeSub = stateRef.current.selectedSubRegion;
      const activePart = stateRef.current.selectedPart;
      const activeSide = stateRef.current.selectedSide;
      if (!activeSub && !activePart) {
        activeAnchorWorld = null;
        return;
      }
      const candidates = activeSub
        ? selectableMeshes.filter((m) => m.userData.subRegion === activeSub && m.visible)
        : selectableMeshes.filter((m) => m.userData.macroPart === activePart && m.visible);
      const fallback =
        candidates.length > 0
          ? candidates
          : selectableMeshes.filter((m) =>
              activeSub
                ? m.userData.subRegion === activeSub && isProfileActiveMesh(m.userData)
                : m.userData.macroPart === activePart && isProfileActiveMesh(m.userData)
            );

      if (!fallback.length) {
        const skinBox = computeSkinSubRegionWorldBox(activeSub, activePart, activeSide);
        activeAnchorWorld = skinBox ? skinBox.getCenter(new THREE.Vector3()) : null;
        return;
      }

      const box = new THREE.Box3();
      fallback.forEach((m) => box.expandByObject(m));
      if (box.isEmpty()) {
        activeAnchorWorld = null;
        return;
      }
      const center = box.getCenter(new THREE.Vector3());
      if (!activeSub || activeSide === "Center") {
        const reach = (box.max.x - box.min.x) * 0.08;
        const probe = new THREE.Vector3();
        const coversMiddle = fallback.some((m) => {
          const pos = m.geometry.getAttribute("position") as THREE.BufferAttribute | undefined;
          if (!pos) return false;
          m.updateWorldMatrix(true, false);
          for (let i = 0; i < pos.count; i += 3) {
            probe.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
            if (Math.abs(probe.x - center.x) <= reach) return true;
          }
          return false;
        });
        if (!coversMiddle) {
          activeAnchorWorld = null;
          return;
        }
      }
      if (activeSub && activeSide !== "Center") {
        const sideBox = new THREE.Box3();
        const probe = new THREE.Vector3();
        fallback.forEach((m) => {
          const pos = m.geometry.getAttribute("position") as THREE.BufferAttribute | undefined;
          if (!pos) return;
          m.updateWorldMatrix(true, false);
          for (let i = 0; i < pos.count; i += 3) {
            if (sideForVertex(pos.getX(i)) !== activeSide) continue;
            sideBox.expandByPoint(probe.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld));
          }
        });
        if (!sideBox.isEmpty()) sideBox.getCenter(center);
      }
      activeAnchorWorld = center;
    }

    function syncAllVisuals() {
      applyBodyProfileMorph();
      applyLayerVisibility();
      paintSkinShell();
      selectableMeshes.forEach((m) => paintMesh(m));
      updateActiveAnchor();
      requestRender();
    }

    const registerAtlasMesh = (
      geom: THREE.BufferGeometry | null,
      nodeName: string,
      subRegion: SubRegionId,
      opts: {
        tissue?: TissueKind;
        isOrgan?: boolean;
        isBone?: boolean;
        showBoneInHybrid?: boolean;
        isSurfaceCap?: boolean;
        isSurfaceZone?: boolean;
        femaleOnly?: boolean;
        generalOnly?: boolean;
        coversViscera?: boolean;
        hideInOrgans?: boolean;
        morphable?: boolean;
        recomputeNormals?: boolean;
        baseColor?: THREE.Color;
        sculptAO?: Float32Array;
        femalePositions?: Float32Array;
        femaleNormals?: Float32Array;
        renderOrder?: number;
        parentGroup?: THREE.Group;
      } = {}
    ): THREE.Mesh | null => {
      if (!geom) return null;
      const subInfo = SUB_REGION_INFO[subRegion];
      const tissue = opts.tissue ?? subInfo.tissue;
      const baseColor =
        opts.baseColor ||
        ORGAN_COLORS[nodeName] ||
        ORGAN_COLORS[subRegion] ||
        (opts.isBone ? BONE_COLOR : tissue === "Tendon" ? TENDON_COLOR : SURFACE_ACCENT_COLOR);

      let mat: THREE.Material = surfaceCapMaterial;
      let ownsMaterial = false;
      if (opts.isBone) {
        mat = boneMaterial;
      } else if (opts.isOrgan) {
        mat = organMaterial;
      } else if (opts.isSurfaceZone) {
        const zoneMat = surfaceZoneBaseMaterial.clone();
        mat = zoneMat;
        ownsMaterial = true;
      }

      const posAttr = geom.getAttribute("position") as THREE.BufferAttribute | undefined;
      const normAttr = geom.getAttribute("normal") as THREE.BufferAttribute | undefined;
      const idxAttr = geom.getIndex();
      let sculptAO = opts.sculptAO;
      if (!sculptAO && posAttr && normAttr && !opts.isSurfaceZone) {
        sculptAO = computeVertexSculptAO(
          posAttr.array as ArrayLike<number>,
          normAttr.array as ArrayLike<number>,
          idxAttr ? (idxAttr.array as ArrayLike<number>) : null,
          opts.isBone ? 1.0 : opts.isOrgan ? 0.82 : 0.55
        );
      }

      const mesh = new THREE.Mesh(geom, mat);
      if (opts.renderOrder !== undefined) {
        mesh.renderOrder = opts.renderOrder;
      }
      mesh.userData = {
        nodeName,
        subRegion,
        macroPart: subInfo.macroPart,
        tissue,
        bilateral: subInfo.bilateral,
        baseColor,
        sculptAO,
        hoverSide: null,
        isOrgan: Boolean(opts.isOrgan),
        isBone: Boolean(opts.isBone),
        showBoneInHybrid: Boolean(opts.showBoneInHybrid),
        isSurfaceCap: Boolean(opts.isSurfaceCap),
        isSurfaceZone: Boolean(opts.isSurfaceZone),
        ownsMaterial,
        femaleOnly: Boolean(opts.femaleOnly ?? subInfo.femaleOnly),
        generalOnly: Boolean(opts.generalOnly),
        coversViscera: Boolean(opts.coversViscera),
        hideInOrgans: Boolean(opts.hideInOrgans),
        selectable: true,
      };
      if (opts.morphable && posAttr) {
        const entry: MorphableMeshEntry = {
          mesh,
          basePositions: new Float32Array(posAttr.array as Float32Array),
          baseNormals: normAttr ? new Float32Array(normAttr.array as Float32Array) : undefined,
          femalePositions: opts.femalePositions,
          femaleNormals: opts.femaleNormals,
          recomputeNormals: opts.recomputeNormals,
        };
        morphableMeshes.push(entry);
        if (appliedFemaleMorph === true) {
          applyProfileToMorphEntry(entry, true);
        }
      }
      paintMesh(mesh);
      selectableMeshes.push(mesh);
      (opts.parentGroup ?? atlasGroup).add(mesh);
      return mesh;
    };

    function clearSkeletonMeshes() {
      for (const mesh of skeletonMeshes) {
        skeletonGroup.remove(mesh);
        const sIdx = selectableMeshes.indexOf(mesh);
        if (sIdx >= 0) selectableMeshes.splice(sIdx, 1);
        const mIdx = morphableMeshes.findIndex((e) => e.mesh === mesh);
        if (mIdx >= 0) morphableMeshes.splice(mIdx, 1);
        mesh.geometry.dispose();
      }
      skeletonMeshes.length = 0;
    }

    function mountRealSkeleton(assets: CachedSkeletonAssets) {
      if (disposed || realSkeletonMounted) return;
      clearSkeletonMeshes();
      fallbackSkeletonMounted = false;

      for (const part of assets.parts) {
        const geom = new THREE.BufferGeometry();
        geom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(part.positions), 3));
        geom.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(part.normals), 3));
        geom.setIndex(new THREE.BufferAttribute(part.indices, 1));
        geom.computeBoundingBox();
        geom.computeBoundingSphere();

        const baseColor = AXIAL_BONE_PARTS.has(part.id)
          ? BONE_AXIAL_COLOR
          : CRANIAL_PELVIC_BONE_PARTS.has(part.id)
            ? BONE_CRANIAL_PELVIC_COLOR
            : BONE_COLOR;

        const mesh = registerAtlasMesh(geom, part.id, part.subRegion, {
          tissue: "Bone",
          isBone: true,
          showBoneInHybrid: part.showInHybrid,
          morphable: true,
          baseColor,
          sculptAO: part.sculptAO,
          femalePositions: part.femalePositions,
          femaleNormals: part.femaleNormals,
          parentGroup: skeletonGroup,
        });
        if (mesh) skeletonMeshes.push(mesh);
      }

      realSkeletonMounted = true;
    }

    function mountFallbackSkeleton() {
      if (disposed || realSkeletonMounted || fallbackSkeletonMounted) return;
      clearSkeletonMeshes();
      buildFallbackSkeletalParts().forEach((boneSpec) => {
        const mesh = registerAtlasMesh(boneSpec.geometry, boneSpec.nodeName, boneSpec.subRegion, {
          tissue: "Bone",
          isBone: true,
          showBoneInHybrid: boneSpec.showInHybrid,
          morphable: true,
          baseColor: boneSpec.isJoint ? JOINT_CARTILAGE_COLOR : BONE_COLOR,
          parentGroup: skeletonGroup,
        });
        if (mesh) skeletonMeshes.push(mesh);
      });
      fallbackSkeletonMounted = true;
    }

    function mountMuscularScene(muscular: CachedMuscularAssets) {
      if (disposed || musclesMounted) return;
      const model = muscular.scene.clone(true);
      Object.keys(REGION_BY_GLB_NODE).forEach((nodeName, index) => {
        const node = model.getObjectByName(nodeName);
        if (!node) return;
        node.traverse((child) => {
          if (!(child as THREE.Mesh).isMesh) return;
          const mesh = child as THREE.Mesh;
          const matName = (mesh.material as THREE.Material | undefined)?.name?.toLowerCase() || "";
          const tissue: TissueKind = matName === "tendon" ? "Tendon" : "Muscle";
          const subRegion = resolveGlbSubRegion(nodeName, tissue);
          const subInfo = SUB_REGION_INFO[subRegion];

          const bakedFemale = mesh.userData?.bakedFemalePositions as Float32Array | undefined;
          const bakedAO = mesh.userData?.bakedSculptAO as Float32Array | undefined;
          mesh.geometry = mesh.geometry.clone();
          mesh.material = tissue === "Tendon" ? tendonMaterial : muscleMaterial;

          const baseColor =
            tissue === "Tendon"
              ? TENDON_COLOR
              : index % 4 === 0
                ? MUSCLE_LIGHT
                : MUSCLE_COLOR;

          mesh.userData = {
            nodeName,
            subRegion,
            macroPart: subInfo.macroPart,
            tissue,
            bilateral: subInfo.bilateral,
            baseColor,
            sculptAO: bakedAO,
            hoverSide: null,
            isMuscleGlb: true,
            selectable: true,
          };

          const posAttr = mesh.geometry.getAttribute("position") as THREE.BufferAttribute | undefined;
          if (posAttr) {
            const baseCopy = new Float32Array(posAttr.array as Float32Array);
            const entry: MorphableMeshEntry = {
              mesh,
              basePositions: baseCopy,
              femalePositions: bakedFemale ? new Float32Array(bakedFemale) : undefined,
              recomputeNormals: false,
            };
            morphableMeshes.push(entry);
            if (appliedFemaleMorph === true) {
              applyProfileToMorphEntry(entry, true);
            }
          }

          paintMesh(mesh);
          selectableMeshes.push(mesh);
        });
      });

      model.scale.setScalar(MODEL_SCALE);
      model.position.set(0, -CENTER_Y * MODEL_SCALE, 0);
      anatomyRoot.add(model);
      musclesMounted = true;

      recomputeAnatomyBounds();
      if (coreAssets) {
        skinSubRegions = classifySkinVertexSubRegions(
          coreAssets.generalSkinPositions,
          muscular.muscleDonors,
          rectusBox,
          lumbarWindow
        );
      }
    }

    function ensureLayerAssets() {
      if (disposed || !coreAssets) return;
      const mode = stateRef.current.layerMode;
      const activeSub = stateRef.current.selectedSubRegion;

      if (needsSkeletonLayer(mode, activeSub) && !realSkeletonMounted && !skeletonFetchInFlight) {
        if (globalSkeletonCache) {
          mountRealSkeleton(globalSkeletonCache);
          syncAllVisuals();
        } else {
          skeletonFetchInFlight = true;
          setLayerLoading("skeletal");
          loadSkeletonAssets()
            .then((skeleton) => {
              skeletonFetchInFlight = false;
              if (disposed) return;
              mountRealSkeleton(skeleton);
              setLayerLoading(null);
              syncAllVisuals();
              const sub = stateRef.current.selectedSubRegion;
              if (sub && SKELETAL_TRIGGER_SUB_REGIONS.has(sub)) {
                focusSubRegion(sub, stateRef.current.selectedSide);
              }
            })
            .catch(() => {
              skeletonFetchInFlight = false;
              if (disposed) return;
              mountFallbackSkeleton();
              setLayerLoading(null);
              syncAllVisuals();
            });
        }
      }

      if (needsMuscularLayer(mode) && !musclesMounted && !muscularFetchInFlight) {
        if (globalMuscularCache) {
          mountMuscularScene(globalMuscularCache);
          syncAllVisuals();
        } else {
          muscularFetchInFlight = true;
          setLayerLoading("muscular");
          loadMuscularAssets(Promise.resolve(coreAssets))
            .then((muscular) => {
              muscularFetchInFlight = false;
              if (disposed) return;
              mountMuscularScene(muscular);
              setLayerLoading(null);
              syncAllVisuals();
            })
            .catch(() => {
              muscularFetchInFlight = false;
              if (disposed) return;
              setLayerLoading(null);
              syncAllVisuals();
            });
        }
      }
    }

    /*
     * Camera moves orbit round the body (spherical interpolation around the target), so turning
     * from front to back swings round at a steady distance instead of flying through the chest.
     */
    let animationToken = 0;
    let inFlight: { toPos: THREE.Vector3; toTarget: THREE.Vector3; endsAt: number } | null = null;
    const UP = new THREE.Vector3(0, 1, 0);

    function cancelCameraMove() {
      animationToken += 1;
      inFlight = null;
      cameraTick = null;
      isAnimating = false;
    }

    function animateCamera(
      destination: THREE.Vector3,
      target: THREE.Vector3,
      { ease: askedEase, duration }: { ease?: (t: number) => number; duration?: number } = {}
    ) {
      if (
        inFlight &&
        inFlight.toPos.distanceTo(destination) < 0.05 &&
        inFlight.toTarget.distanceTo(target) < 0.05
      ) {
        return;
      }
      const fromTarget = controls.target.clone();
      const toTarget = target.clone();
      const from = new THREE.Spherical().setFromVector3(camera.position.clone().sub(fromTarget));
      const to = new THREE.Spherical().setFromVector3(destination.clone().sub(toTarget));
      const dTheta = THREE.MathUtils.euclideanModulo(to.theta - from.theta + Math.PI, Math.PI * 2) - Math.PI;
      const turn = Math.abs(dTheta) / Math.PI;
      const zoom = Math.min(Math.abs(to.radius - from.radius) / Math.max(from.radius, 0.001), 1);
      const pan = Math.min(fromTarget.distanceTo(toTarget) / 4, 1);
      const ease = askedEase ?? (inFlight ? easeHandOff : easeOrbit);
      const token = ++animationToken;
      if (turn < 0.002 && zoom < 0.002 && pan < 0.002 && Math.abs(to.phi - from.phi) < 0.002) {
        inFlight = null;
        cameraTick = null;
        isAnimating = false;
        return;
      }

      const ms = reduceMotionQuery.matches
        ? 0
        : (duration ?? Math.min(CALM_MOVE_MS * (1 + 0.5 * turn + 0.35 * Math.max(zoom, pan)), CALM_MOVE_MAX_MS));
      const start = performance.now();
      inFlight = { toPos: destination.clone(), toTarget, endsAt: start + ms };
      isAnimating = true;
      const sph = new THREE.Spherical();
      const tgt = new THREE.Vector3();

      function apply(t: number) {
        tgt.lerpVectors(fromTarget, toTarget, t);
        sph.set(
          THREE.MathUtils.lerp(from.radius, to.radius, t),
          THREE.MathUtils.lerp(from.phi, to.phi, t),
          from.theta + dTheta * t
        );
        camera.position.setFromSpherical(sph).add(tgt);
        controls.target.copy(tgt);
      }
      function finish() {
        inFlight = null;
        cameraTick = null;
        isAnimating = false;
      }
      if (ms <= 0) {
        apply(1);
        finish();
        requestRender();
        return;
      }
      cameraTick = (now: number) => {
        if (token !== animationToken) return;
        const raw = Math.min(Math.max((now - start) / ms, 0), 1);
        apply(ease(raw));
        if (raw >= 1) finish();
      };
      requestRender();
    }

    type MoveOptions = { ease?: (t: number) => number; duration?: number };

    function animateToPreset(preset: CameraViewPreset, opts?: MoveOptions) {
      const d = idealDistance;
      const target = new THREE.Vector3(0, REST_TARGET_Y, 0);
      const position =
        preset === "back"
          ? new THREE.Vector3(0, REST_TARGET_Y, -d)
          : preset === "side"
            ? new THREE.Vector3(d, REST_TARGET_Y, 0)
            : preset === "three-quarter"
              ? new THREE.Vector3(d * 0.58, REST_TARGET_Y + 0.3, d * 0.82)
              : new THREE.Vector3(0, REST_TARGET_Y, d);
      animateCamera(position, target, opts);
    }

    function cameraGoal() {
      return {
        position: (inFlight?.toPos ?? camera.position).clone(),
        target: (inFlight?.toTarget ?? controls.target).clone(),
      };
    }

    function rotateByAngle(deltaRad: number, duration = DURATION.slow * 1000) {
      const { position, target } = cameraGoal();
      const offset = position.sub(target).applyAxisAngle(UP, deltaRad);
      animateCamera(offset.add(target), target, { ease: easeNudge, duration });
    }

    function panVertical(direction: 1 | -1) {
      const { position, target } = cameraGoal();
      const step = THREE.MathUtils.clamp(position.distanceTo(target) * 0.11, 0.55, 2);
      const nextY = THREE.MathUtils.clamp(target.y + direction * step, -3.3, 3.3);
      const dy = nextY - target.y;
      if (Math.abs(dy) < 0.01) return;
      const shift = new THREE.Vector3(0, dy, 0);
      animateCamera(position.add(shift), target.add(shift), { ease: easeNudge, duration: CALM_MOVE_MS });
    }

    function zoomBy(factor: number) {
      const { position, target } = cameraGoal();
      const offset = position.sub(target);
      offset.setLength(
        THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance + 0.3, controls.maxDistance - 0.5)
      );
      animateCamera(offset.add(target), target, { ease: easeNudge, duration: DURATION.base * 1000 });
    }

    function rotateInstant(deltaRad: number) {
      const offset = camera.position.clone().sub(controls.target);
      offset.applyAxisAngle(UP, deltaRad);
      camera.position.copy(controls.target).add(offset);
      controls.update();
      requestRender();
    }

    let tapSide: { sign: number; at: number } | null = null;

    function frameBox(
      box: THREE.Box3,
      preferBack: boolean,
      side: "Left" | "Right" | "Center",
      context: { height: number; width: number },
      opts?: MoveOptions
    ) {
      if (box.isEmpty()) return;
      const worldCenter = box.getCenter(new THREE.Vector3());
      if (side === "Left") worldCenter.x = THREE.MathUtils.lerp(worldCenter.x, box.max.x, 0.55);
      if (side === "Right") worldCenter.x = THREE.MathUtils.lerp(worldCenter.x, box.min.x, 0.55);

      const zSign =
        tapSide && performance.now() - tapSide.at < 1200 ? tapSide.sign : preferBack ? -1 : 1;
      const size = box.getSize(new THREE.Vector3());
      const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const fitHeight = Math.max(size.y * context.height, 2.5);
      const fitWidth = Math.max(size.x * context.width, 2.0);
      const fitDistance =
        Math.max(fitHeight / (2 * tanHalfFov), fitWidth / (2 * tanHalfFov * camera.aspect)) + size.z * 0.5;
      const distance = THREE.MathUtils.clamp(fitDistance, controls.minDistance + 0.3, idealDistance * 0.8);

      animateCamera(
        new THREE.Vector3(worldCenter.x * 0.6, worldCenter.y + 0.12, worldCenter.z + zSign * distance),
        worldCenter,
        opts
      );
    }

    function frameMeshes(
      meshes: THREE.Mesh[],
      preferBack: boolean,
      side: "Left" | "Right" | "Center",
      context: { height: number; width: number },
      opts?: MoveOptions
    ) {
      if (!meshes.length) return;
      const box = new THREE.Box3();
      meshes.forEach((m) => box.expandByObject(m));
      frameBox(box, preferBack, side, context, opts);
    }

    function focusSubRegion(subRegion: SubRegionId, side: "Left" | "Right" | "Center" = "Center", opts?: MoveOptions) {
      const visibleMatching = selectableMeshes.filter((m) => m.userData.subRegion === subRegion && m.visible);
      const matching =
        visibleMatching.length > 0
          ? visibleMatching
          : selectableMeshes.filter(
              (m) => m.userData.subRegion === subRegion && isProfileActiveMesh(m.userData)
            );
      const preferBack = SUB_REGION_INFO[subRegion]?.defaultView === "back";
      if (matching.length > 0) {
        frameMeshes(matching, preferBack, side, { height: 3.3, width: 2.7 }, opts);
        return;
      }
      const skinBox = computeSkinSubRegionWorldBox(subRegion, null, side);
      if (skinBox) {
        frameBox(skinBox, preferBack, side, { height: 3.3, width: 2.7 }, opts);
      }
    }

    function focusArea(macroPart: BodyPartId, opts?: MoveOptions) {
      const all = selectableMeshes.filter(
        (m) => m.userData.macroPart === macroPart && isProfileActiveMesh(m.userData)
      );
      const visible = all.filter((m) => m.visible);
      const list = visible.length ? visible : all;
      if (list.length > 0) {
        frameMeshes(list, macroPart === "back", "Center", { height: 1.9, width: 1.6 }, opts);
        return;
      }
      const skinBox = computeSkinSubRegionWorldBox(null, macroPart, "Center");
      if (skinBox) {
        frameBox(skinBox, macroPart === "back", "Center", { height: 1.9, width: 1.6 }, opts);
      }
    }

    controlsApiRef.current = {
      zoomIn: () => zoomBy(0.82),
      zoomOut: () => zoomBy(1.22),
      rotateLeft: () => rotateByAngle(-Math.PI / 6, CALM_MOVE_MS),
      rotateRight: () => rotateByAngle(Math.PI / 6, CALM_MOVE_MS),
      panUp: () => panVertical(1),
      panDown: () => panVertical(-1),
      rotateBy: (deltaRad: number) => rotateByAngle(deltaRad, DURATION.base * 1000),
      resetCamera: () => animateToPreset("front"),
      focusSubRegion,
      focusArea,
      syncVisuals: syncAllVisuals,
      ensureLayerAssets,
      animateToPreset,
    };

    // Progressive, strictly on-demand asset initialization:
    // - Always loads core atlas (skin, surface caps, organs)
    // - Loads muscular.glb ONLY if starting in muscular/hybrid
    // - Loads human-atlas-skeleton.bin ONLY if starting in skeletal/hybrid or on a skeletal sub-region
    const initLayer = stateRef.current.layerMode;
    const initSub = stateRef.current.selectedSubRegion;
    const corePromise = loadCoreAtlasAssets((pct) => {
      if (!disposed) setLoadProgress(pct);
    });
    const initMusclePromise = needsMuscularLayer(initLayer)
      ? loadMuscularAssets(corePromise, (pct) => {
          if (!disposed) setLoadProgress(pct);
        }).catch(() => null)
      : Promise.resolve(globalMuscularCache);

    Promise.all([corePromise, initMusclePromise])
      .then(async ([core, initialMuscles]) => {
        if (disposed) return;
        coreAssets = core;

        // Swap shared bump maps to core cache textures if created locally before cache populated
        muscleMaterial.bumpMap = core.muscleBump;
        hybridTorsoMuscleMaterial.bumpMap = core.muscleBump;
        tendonMaterial.bumpMap = core.tendonBump;
        boneMaterial.bumpMap = core.boneBump;

        // 1. Watertight outer skin shell with smooth clinical pelvic contour
        const skinGeom = new THREE.BufferGeometry();
        skinGeom.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(core.generalSkinPositions), 3)
        );
        skinGeom.setAttribute(
          "normal",
          new THREE.BufferAttribute(new Float32Array(core.generalSkinNormals), 3)
        );
        skinGeom.setIndex(new THREE.BufferAttribute(core.skinIndices, 1));
        skinGeom.computeBoundingSphere();

        const shellMesh = new THREE.Mesh(skinGeom, skinShellMaterial);
        shellMesh.renderOrder = 2;
        skinShellMesh = shellMesh;
        atlasGroup.add(shellMesh);

        // Compute immediate skin sub-region map (refined with exact muscle donors if/when muscular.glb mounts)
        skinSubRegions = classifySkinVertexSubRegions(core.generalSkinPositions, [], null, null);

        // 2. Smooth bilateral mammary overlay + aligned clinical surface zones
        const SURFACE_OFFSET = 0;
        const femaleVoxel = getFemaleSkinVoxelIndex(core);
        registerAtlasMesh(
          buildMammaryGeometry(core.femaleSkinPositions, core.femaleSkinNormals, femaleVoxel),
          "breast_zone",
          "breast",
          {
            isSurfaceZone: true,
            femaleOnly: true,
            coversViscera: true,
            hideInOrgans: true,
            baseColor: new THREE.Color(0xd8c3b2),
            renderOrder: 3,
          }
        );
        registerAtlasMesh(
          extractSubGeometry(
            skinGeom,
            (cx, cy, cz) =>
              Math.abs(cx) >= 0.105 &&
              Math.abs(cx) <= 0.168 &&
              cy >= 1.245 &&
              cy <= 1.355 &&
              cz >= -0.055 &&
              cz <= 0.065,
            SURFACE_OFFSET
          ),
          "axilla_zone",
          "axilla",
          { isSurfaceZone: true, morphable: true, recomputeNormals: true, renderOrder: 3 }
        );
        registerAtlasMesh(
          extractSubGeometry(
            skinGeom,
            (cx, cy, cz) =>
              (Math.abs(cx) < 0.022 && cy >= 1.19 && cy <= 1.34 && cz > 0.075) ||
              (Math.abs(cx) >= 0.062 &&
                Math.abs(cx) <= 0.152 &&
                cy >= 1.105 &&
                cy < 1.205 &&
                cz > 0.035),
            SURFACE_OFFSET
          ),
          "rib_cage_zone",
          "rib_cage",
          {
            isSurfaceZone: true,
            coversViscera: true,
            hideInOrgans: true,
            morphable: true,
            recomputeNormals: true,
            renderOrder: 3,
          }
        );
        registerAtlasMesh(
          extractSubGeometry(
            skinGeom,
            (cx, cy, cz) =>
              Math.abs(cx) >= 0.068 &&
              Math.abs(cx) <= 0.168 &&
              cy >= 0.84 &&
              cy <= 0.945 &&
              cz > -0.025,
            SURFACE_OFFSET
          ),
          "hip_groin_zone",
          "hip_groin",
          { isSurfaceZone: true, morphable: true, recomputeNormals: true, renderOrder: 3 }
        );
        registerAtlasMesh(
          extractSubGeometry(
            skinGeom,
            (cx, cy, cz) => Math.abs(cx) <= 0.068 && cy >= 0.878 && cy <= 0.925 && cz > 0.045,
            SURFACE_OFFSET
          ),
          "uterus_ovaries_surface_zone",
          "uterus_ovaries",
          {
            isSurfaceZone: true,
            femaleOnly: true,
            coversViscera: true,
            hideInOrgans: true,
            morphable: true,
            recomputeNormals: true,
            renderOrder: 3,
          }
        );
        registerAtlasMesh(
          extractSubGeometry(
            skinGeom,
            (cx, cy, cz) => Math.abs(cx) <= 0.055 && cy >= 0.846 && cy < 0.878 && cz > 0.045,
            SURFACE_OFFSET
          ),
          "bladder_female_surface_zone",
          "bladder",
          {
            isSurfaceZone: true,
            femaleOnly: true,
            coversViscera: true,
            hideInOrgans: true,
            morphable: true,
            recomputeNormals: true,
            renderOrder: 3,
          }
        );
        registerAtlasMesh(
          extractSubGeometry(
            skinGeom,
            (cx, cy, cz) => Math.abs(cx) <= 0.058 && cy >= 0.846 && cy <= 0.916 && cz > 0.045,
            SURFACE_OFFSET
          ),
          "bladder_general_surface_zone",
          "bladder",
          {
            isSurfaceZone: true,
            generalOnly: true,
            coversViscera: true,
            hideInOrgans: true,
            renderOrder: 3,
          }
        );
        registerAtlasMesh(
          extractSubGeometry(
            skinGeom,
            (cx, cy, cz) =>
              Math.abs(cx) <= 0.06 && cy >= 0.795 && cy < 0.846 && cz >= -0.065 && cz <= 0.08,
            SURFACE_OFFSET
          ),
          "pelvic_floor_zone",
          "pelvic_floor",
          { isSurfaceZone: true, morphable: true, recomputeNormals: true, renderOrder: 3 }
        );
        registerAtlasMesh(
          extractSubGeometry(
            skinGeom,
            (cx, cy, cz) => Math.abs(cx) <= 0.075 && cy >= 0.845 && cy <= 0.965 && cz < -0.075,
            SURFACE_OFFSET
          ),
          "sacroiliac_coccyx_zone",
          "sacroiliac_coccyx",
          { isSurfaceZone: true, morphable: true, recomputeNormals: true, renderOrder: 3 }
        );

        // 3. Cleaned outer-manifold surface caps & real BodyParts3D visceral organs
        core.atlasManifest.parts.forEach((part) => {
          if (part.id === "skin_shell") return;
          const clean = core.cleanAtlasParts.get(part.id);
          if (!clean) return;

          const geom = new THREE.BufferGeometry();
          geom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(clean.positions), 3));
          geom.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(clean.normals), 3));
          geom.setIndex(new THREE.BufferAttribute(clean.indices, 1));
          geom.computeBoundingSphere();

          if (part.id === "head_face") {
            registerAtlasMesh(extractSubGeometry(geom, (_cx, cy) => cy >= 1.555), "head_face_upper", "head_face", {
              isSurfaceCap: true,
              morphable: true,
              recomputeNormals: true,
            });
            registerAtlasMesh(
              extractSubGeometry(geom, (_cx, cy) => cy >= 1.492 && cy < 1.555),
              "jaw_ear_lower",
              "jaw_ear",
              { isSurfaceCap: true, morphable: true, recomputeNormals: true }
            );
            registerAtlasMesh(extractSubGeometry(geom, (_cx, cy) => cy < 1.492), "neck_submental_cap", "neck", {
              isSurfaceCap: true,
              morphable: true,
              recomputeNormals: true,
            });
            geom.dispose();
            return;
          }

          if (part.id === "hands_wrists") {
            registerAtlasMesh(extractSubGeometry(geom, (_cx, cy) => cy >= 0.855), "wrist_upper", "wrist_tendon", {
              isSurfaceCap: true,
              morphable: true,
              recomputeNormals: true,
            });
            registerAtlasMesh(
              extractSubGeometry(geom, (_cx, cy) => cy < 0.855),
              "hands_fingers_distal",
              "hands_fingers",
              { isSurfaceCap: true, morphable: true, recomputeNormals: true }
            );
            geom.dispose();
            return;
          }

          if (part.id === "feet_ankles") {
            registerAtlasMesh(
              extractSubGeometry(geom, (_cx, cy, cz) => cz < -0.025 && cy > 0.022),
              "achilles_posterior",
              "achilles",
              { isSurfaceCap: true, morphable: true, recomputeNormals: true }
            );
            registerAtlasMesh(
              extractSubGeometry(geom, (_cx, cy, cz) => !(cz < -0.025 && cy > 0.022)),
              "feet_soles_distal",
              "feet_soles",
              { isSurfaceCap: true, morphable: true, recomputeNormals: true }
            );
            geom.dispose();
            return;
          }

          const mapping = ATLAS_PART_TO_SUB_REGION[part.id];
          if (!mapping) {
            geom.dispose();
            return;
          }

          registerAtlasMesh(geom, part.id, mapping.subRegion, {
            tissue: mapping.tissue,
            isOrgan: mapping.isOrgan,
            isSurfaceCap: mapping.isSurfaceCap,
            morphable: true,
            recomputeNormals: Boolean(mapping.isSurfaceCap),
            sculptAO: clean.sculptAO,
          });
        });

        // 4. Lightweight pelvic visceral organs
        registerAtlasMesh(buildUterusOvariesGeometry(), "uterus_ovaries", "uterus_ovaries", {
          tissue: "Organ",
          isOrgan: true,
          femaleOnly: true,
          morphable: true,
        });
        registerAtlasMesh(buildBladderGeometry(), "bladder", "bladder", {
          tissue: "Organ",
          isOrgan: true,
          morphable: true,
        });

        // 5. Mount muscles if loaded (or already cached)
        if (initialMuscles) {
          mountMuscularScene(initialMuscles);
        }

        // 6. Mount real BodyParts3D skeleton ONLY if active now (or already cached)
        if (globalSkeletonCache) {
          mountRealSkeleton(globalSkeletonCache);
        } else if (needsSkeletonLayer(stateRef.current.layerMode, stateRef.current.selectedSubRegion) || needsSkeletonLayer(initLayer, initSub)) {
          try {
            skeletonFetchInFlight = true;
            const skel = await loadSkeletonAssets();
            skeletonFetchInFlight = false;
            if (!disposed) mountRealSkeleton(skel);
          } catch {
            skeletonFetchInFlight = false;
            if (!disposed) mountFallbackSkeleton();
          }
        }

        if (disposed) return;
        setLoadProgress(100);
        syncAllVisuals();
        setModelReady(true);
        if (initialMuscles || !needsMuscularLayer(stateRef.current.layerMode)) {
          ensureLayerAssets();
        }
        requestRender();
      })
      .catch((err) => {
        if (disposed) return;
        console.error("3D anatomy load error:", err);
        setLoadError(labels.loadError);
      });

    // Responsive framing & Aspect Ratio Synchronization
    const handleResize = () => {
      if (!wrapEl || disposed) return;
      const rect = wrapEl.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const w = rect.width;
      const h = rect.height;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;

      const halfFovRad = THREE.MathUtils.degToRad(camera.fov / 2);
      const tanHalfFov = Math.tan(halfFovRad);
      const reqDistY = (7.7 * 1.18) / (2 * tanHalfFov);
      const reqDistX = (2.6 * 1.25) / (2 * tanHalfFov * camera.aspect);
      idealDistance = Math.max(reqDistY, reqDistX, compact ? 16.8 : 17.8);

      camera.updateProjectionMatrix();

      if (!lastSize && !inFlight) {
        camera.position.sub(controls.target).setLength(idealDistance).add(controls.target);
        controls.update();
      }
      renderer.render(scene, camera);
      requestRender();

      if (lastSize && (Math.abs(lastSize.w - w) > 24 || Math.abs(lastSize.h - h) > 24)) {
        if (reframeRafId !== null) cancelAnimationFrame(reframeRafId);
        if (inFlight) {
          reframe({ ease: easeNudge, duration: Math.max(inFlight.endsAt - performance.now(), DURATION.base * 1000) });
        } else {
          reframeRafId = requestAnimationFrame(() => {
            reframeRafId = null;
            if (!disposed) reframe();
          });
        }
      }
      lastSize = { w, h };
    };
    function reframe(opts?: MoveOptions) {
      const st = stateRef.current;
      if (st.selectedSubRegion) focusSubRegion(st.selectedSubRegion, st.selectedSide, opts);
      else if (st.selectedPart) focusArea(st.selectedPart, opts);
      else animateToPreset(st.viewAngle, opts);
    }
    let lastSize: { w: number; h: number } | null = null;
    let reframeRafId: number | null = null;

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(wrapEl);
    handleResize();

    // Pointer raycasting with rAF throttling
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos: { x: number; y: number } | null = null;
    let hoveredState: { mesh: THREE.Mesh; subRegion: SubRegionId; side: "Left" | "Right" | "Center" } | null = null;

    function hitTest(clientX: number, clientY: number) {
      if (!canvasEl) return null;
      const rect = canvasEl.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const mode = stateRef.current.layerMode;
      const camDist = camera.position.distanceTo(controls.target);

      if (mode === "surface") {
        if (!skinShellMesh || !skinShellMesh.visible) return null;
        const hits = raycaster.intersectObject(skinShellMesh, false);
        return hits.find((h) => h.distance <= camDist + 0.9) ?? null;
      }

      const visibleTargets = selectableMeshes.filter((m) => m.visible);
      if (visibleTargets.length > 0) {
        const hits = raycaster.intersectObjects(visibleTargets, false);
        const nearLimit = mode === "skeletal" || mode === "organs" ? camDist + 1.9 : camDist + 1.05;
        // In hybrid cutaway mode, prefer opaque internal organs/bones behind translucent torso-wall muscles
        if (mode === "hybrid") {
          const deepHit = hits.find(
            (h) =>
              h.distance <= camDist + 1.65 &&
              ((h.object as THREE.Mesh).userData.isOrgan || (h.object as THREE.Mesh).userData.isBone)
          );
          if (deepHit) return deepHit;
        }
        const primary = hits.find((h) => h.distance <= nearLimit);
        if (primary) return primary;
      }

      // In organs or skeletal modes, allow clicking anywhere on the translucent body silhouette
      if ((mode === "skeletal" || mode === "organs") && skinShellMesh && skinShellMesh.visible) {
        const shellHits = raycaster.intersectObject(skinShellMesh, false);
        return shellHits.find((h) => h.distance <= camDist + 0.9) ?? null;
      }

      return null;
    }

    function seenThroughGap(mesh: THREE.Mesh): boolean {
      return stateRef.current.layerMode === "surface" && Boolean(mesh.userData.isOrgan);
    }

    function resolveHitSelection(hit: THREE.Intersection) {
      const mesh = hit.object as THREE.Mesh;
      if (mesh === skinShellMesh && skinSubRegions) {
        const meshPoint = mesh.worldToLocal(hit.point.clone());
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        const candidates = hit.face ? [hit.face.a, hit.face.b, hit.face.c] : [0];
        let bestIdx = candidates[0];
        let bestD2 = Infinity;
        for (const vi of candidates) {
          const dx = pos.getX(vi) - meshPoint.x;
          const dy = pos.getY(vi) - meshPoint.y;
          const dz = pos.getZ(vi) - meshPoint.z;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < bestD2) {
            bestD2 = d2;
            bestIdx = vi;
          }
        }
        const subMap =
          stateRef.current.bodyProfile === "female"
            ? skinSubRegions.female
            : skinSubRegions.general;
        const subRegion = subMap[bestIdx] ?? "pectoral";
        const info = SUB_REGION_INFO[subRegion];
        const side: "Left" | "Right" | "Center" = info.bilateral ? sideForVertex(meshPoint.x) : "Center";
        return { mesh, subRegion, macroPart: info.macroPart, side };
      }

      const d = mesh.userData as {
        nodeName?: string;
        subRegion: SubRegionId;
        macroPart: BodyPartId;
        bilateral: boolean;
      };
      const meshPoint = mesh.worldToLocal(hit.point.clone());
      const covered = coveredSubRegion(d.nodeName, meshPoint.x, meshPoint.y, meshPoint.z);
      if (covered) {
        return { mesh, subRegion: covered, macroPart: d.macroPart, side: "Center" as const };
      }
      let side: "Left" | "Right" | "Center" = "Center";
      if (d.bilateral) {
        const localPoint = anatomyRoot.worldToLocal(hit.point.clone());
        side = localPoint.x < 0 ? "Right" : "Left";
      }
      return { mesh, subRegion: d.subRegion, macroPart: d.macroPart, side };
    }

    function intendedArea(macroPart: BodyPartId, point: THREE.Vector3, mesh: THREE.Mesh): BodyPartId {
      // Direct clicks on visible bones or internal organs in skeletal/organs views always keep their exact region
      const mode = stateRef.current.layerMode;
      if ((mode === "skeletal" && mesh.userData.isBone) || (mode === "organs" && mesh.userData.isOrgan)) {
        return macroPart;
      }
      const view = camera.position.clone().sub(controls.target).normalize();
      const pelvisCeilingY = (0.93 - CENTER_Y) * MODEL_SCALE;
      if (view.z > 0.5 && macroPart === "back") {
        if (point.y >= chestFloorY()) return "chest";
        if (point.y < pelvisCeilingY) return "pelvis";
        return "stomach";
      }
      if (view.z < -0.5 && (macroPart === "chest" || macroPart === "stomach" || macroPart === "pelvis")) {
        return "back";
      }
      return macroPart;
    }

    function chestFloorY(): number {
      if (cachedChestFloor !== null) return cachedChestFloor;
      const box = new THREE.Box3();
      selectableMeshes
        .filter((m) => m.userData.macroPart === "chest" && isProfileActiveMesh(m.userData))
        .forEach((m) => box.expandByObject(m));
      cachedChestFloor = box.isEmpty() ? 0.9 : box.min.y;
      return cachedChestFloor;
    }

    let touchDrag: { lastX: number; startX: number; startY: number; rotating: boolean } | null = null;

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
      if (e.pointerType === "touch" && e.isPrimary) {
        touchDrag = { lastX: e.clientX, startX: e.clientX, startY: e.clientY, rotating: false };
      }
    };

    const onTouchRotateMove = (e: PointerEvent) => {
      if (!touchDrag || e.pointerType !== "touch" || !e.isPrimary) return false;
      const dx = e.clientX - touchDrag.startX;
      const dy = e.clientY - touchDrag.startY;
      if (!touchDrag.rotating && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        touchDrag.rotating = true;
        cancelCameraMove();
        stateRef.current.onFreeRotate?.();
      }
      if (touchDrag.rotating) {
        rotateInstant(-(e.clientX - touchDrag.lastX) * 0.012);
      }
      touchDrag.lastX = e.clientX;
      return true;
    };

    const onPointerEnd = () => {
      touchDrag = null;
    };

    const DIRECT_TOUCH_SUB_REGIONS = new Set<SubRegionId>([
      "neck",
      "cervical_spine",
      "thoracic_spine",
      "lumbar_spine",
      "sacroiliac_coccyx",
      "skull",
      "rib_cage",
      "jaw_ear",
      "cranium_occipital",
      "head_face",
      "breast",
      "heart",
      "lungs",
      "stomach_organ",
      "liver",
      "colon",
      "kidneys",
      "lower_back",
      "upper_back",
      "hands_fingers",
      "feet_soles",
    ]);

    const onPointerUp = (e: PointerEvent) => {
      touchDrag = null;
      if (
        stateRef.current.decorative ||
        !pointerDownPos ||
        Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y) > 12
      ) {
        return;
      }
      const hit = hitTest(e.clientX, e.clientY);
      if (!hit) return;
      const sel = resolveHitSelection(hit);
      tapSide = { sign: camera.position.z - controls.target.z >= 0 ? 1 : -1, at: performance.now() };
      const zoomedIn = camera.position.distanceTo(controls.target) < 13;
      const macroPart = intendedArea(sel.macroPart, hit.point, sel.mesh);
      const remapped = macroPart !== sel.macroPart;
      const directSurfaceRegion =
        !remapped && !seenThroughGap(sel.mesh) && DIRECT_TOUCH_SUB_REGIONS.has(sel.subRegion);
      const coarse =
        (e.pointerType === "touch" && !zoomedIn && !directSurfaceRegion) ||
        remapped ||
        seenThroughGap(sel.mesh);
      if (e.isTrusted) navigator.vibrate?.(12);
      if (coarse) {
        stateRef.current.onSelectAnatomy(macroPart, null, "Center");
        focusArea(macroPart);
      } else {
        stateRef.current.onSelectAnatomy(macroPart, sel.subRegion, sel.side);
        focusSubRegion(sel.subRegion, sel.side);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (onTouchRotateMove(e)) return;
      if (e.buttons > 0) {
        setHoverBadge((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }
      pendingPointer = { clientX: e.clientX, clientY: e.clientY };
      if (pointerMoveRafId === null) {
        pointerMoveRafId = requestAnimationFrame(handleThrottledPointerMove);
      }
    };

    function clearHoveredVisual() {
      if (!hoveredState) return;
      if (hoveredState.mesh === skinShellMesh) {
        skinHover = null;
        paintSkinShell();
      } else {
        hoveredState.mesh.userData.hoverSide = null;
        hoveredState.mesh.userData.hoverSub = undefined;
        paintMesh(hoveredState.mesh);
      }
      hoveredState = null;
    }

    function handleThrottledPointerMove() {
      pointerMoveRafId = null;
      if (!pendingPointer || disposed || !wrapEl || !canvasEl) return;
      const { clientX, clientY } = pendingPointer;
      pendingPointer = null;

      const hit = hitTest(clientX, clientY);
      if (!hit) {
        if (hoveredState) {
          clearHoveredVisual();
          requestRender();
        }
        canvasEl.style.cursor = "grab";
        setHoverBadge((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }

      const sel = resolveHitSelection(hit);
      const gap = seenThroughGap(sel.mesh);
      if (
        hoveredState &&
        (gap ||
          hoveredState.mesh !== sel.mesh ||
          hoveredState.side !== sel.side ||
          hoveredState.subRegion !== sel.subRegion)
      ) {
        clearHoveredVisual();
      }
      if (!gap) {
        hoveredState = { mesh: sel.mesh, subRegion: sel.subRegion, side: sel.side };
        if (sel.mesh === skinShellMesh) {
          skinHover = { subRegion: sel.subRegion, side: sel.side };
          paintSkinShell();
        } else {
          sel.mesh.userData.hoverSide = sel.side;
          sel.mesh.userData.hoverSub = sel.subRegion;
          paintMesh(sel.mesh);
        }
      }
      requestRender();

      const activeLang = stateRef.current.lang || DEFAULT_LANG;
      const info = getLocalizedSubRegion(sel.subRegion, activeLang);
      const areaTitle = getHealthCheckTranslations(activeLang).bodyParts[info.macroPart]?.title ?? "";
      const sideText = sel.side !== "Center" ? `, ${sel.side === "Left" ? labels.left : labels.right}` : "";
      const rect = wrapEl.getBoundingClientRect();
      canvasEl.style.cursor = "pointer";
      setHoverBadge({
        visible: true,
        x: Math.min(Math.max(clientX - rect.left + 14, 12), Math.max(12, rect.width - 230)),
        y: Math.min(Math.max(clientY - rect.top + 14, 12), Math.max(12, rect.height - 68)),
        name: gap ? areaTitle : `${info.label}${sideText}`,
        areaLabel: gap ? "" : areaTitle,
      });
    }

    const onPointerLeave = () => {
      if (hoveredState) {
        clearHoveredVisual();
        requestRender();
      }
      setHoverBadge((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    };

    canvasEl.addEventListener("pointerdown", onPointerDown);
    canvasEl.addEventListener("pointerup", onPointerUp);
    canvasEl.addEventListener("pointermove", onPointerMove);
    canvasEl.addEventListener("pointerleave", onPointerLeave);
    canvasEl.addEventListener("pointercancel", onPointerEnd);

    requestRender();

    return () => {
      disposed = true;
      if (reframeRafId !== null) cancelAnimationFrame(reframeRafId);
      if (pointerMoveRafId !== null) cancelAnimationFrame(pointerMoveRafId);
      resizeObserver.disconnect();
      canvasEl.removeEventListener("pointerdown", onPointerDown);
      canvasEl.removeEventListener("pointerup", onPointerUp);
      canvasEl.removeEventListener("pointermove", onPointerMove);
      canvasEl.removeEventListener("pointerleave", onPointerLeave);
      canvasEl.removeEventListener("pointercancel", onPointerEnd);
      controls.removeEventListener("change", requestRender);
      controls.removeEventListener("start", onControlsStart);
      reduceMotionQuery.removeEventListener("change", onReduceMotionChange);
      controls.dispose();
      for (const mesh of selectableMeshes) {
        mesh.geometry.dispose();
        if (mesh.userData?.ownsMaterial && mesh.material) {
          (mesh.material as THREE.Material).dispose();
        }
      }
      selectableMeshes.length = 0;
      morphableMeshes.length = 0;
      skeletonMeshes.length = 0;
      if (skinShellMesh) {
        skinShellMesh.geometry.dispose();
        skinShellMesh = null;
      }
      stagePlaneGeometry.dispose();
      stagePlaneMaterial.dispose();
      stagePlaneTexture.dispose();
      muscleMaterial.dispose();
      hybridTorsoMuscleMaterial.dispose();
      tendonMaterial.dispose();
      organMaterial.dispose();
      boneMaterial.dispose();
      surfaceCapMaterial.dispose();
      surfaceZoneBaseMaterial.dispose();
      skinShellMaterial.dispose();
      ownedTextures.forEach((tex) => tex.dispose());
      if (envRenderTarget) {
        scene.environment = null;
        envRenderTarget.dispose();
      }
      renderer.renderLists?.dispose();
      renderer.dispose();
    };
  }, [webglError, labels.loadError, compact, labels.left, labels.right]);

  // Synchronize prop changes (selection, layerMode, bodyProfile) and trigger lazy layer loads on demand
  useEffect(() => {
    controlsApiRef.current?.ensureLayerAssets();
    controlsApiRef.current?.syncVisuals();
  }, [selectedPart, selectedSubRegion, selectedSide, layerMode, isolateSelected, bodyProfile]);

  useEffect(() => {
    controlsApiRef.current?.animateToPreset(viewAngle);
  }, [viewAngle, viewRequest]);

  useEffect(() => {
    if (!cameraRef) return;
    cameraRef.current = {
      zoomIn: () => controlsApiRef.current?.zoomIn(),
      zoomOut: () => controlsApiRef.current?.zoomOut(),
      rotateLeft: () => {
        stateRef.current.onFreeRotate?.();
        controlsApiRef.current?.rotateLeft();
      },
      rotateRight: () => {
        stateRef.current.onFreeRotate?.();
        controlsApiRef.current?.rotateRight();
      },
      panUp: () => controlsApiRef.current?.panUp(),
      panDown: () => controlsApiRef.current?.panDown(),
      resetCamera: () => controlsApiRef.current?.resetCamera(),
    };
    return () => {
      cameraRef.current = null;
    };
  }, [cameraRef]);

  useEffect(() => {
    if (!modelReady) return;
    controlsApiRef.current?.ensureLayerAssets();
    controlsApiRef.current?.syncVisuals();
    if (selectedSubRegion) controlsApiRef.current?.focusSubRegion(selectedSubRegion, selectedSide);
    else if (selectedPart) controlsApiRef.current?.focusArea(selectedPart);
    else controlsApiRef.current?.animateToPreset(stateRef.current.viewAngle);
  }, [selectedPart, selectedSubRegion, selectedSide, modelReady]);

  function handleKeyDown(e: KeyboardEvent<HTMLCanvasElement>) {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") onFreeRotate?.();
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      controlsApiRef.current?.rotateBy(0.26);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      controlsApiRef.current?.rotateBy(-0.26);
    } else if (e.key === "+" || e.key === "=") {
      controlsApiRef.current?.zoomIn();
    } else if (e.key === "-") {
      controlsApiRef.current?.zoomOut();
    }
  }

  return (
    <div
      ref={wrapRef}
      data-model-ready={modelReady ? "true" : "false"}
      className={`relative overflow-hidden bg-surface-subtle select-none ${
        className ?? (compact ? "w-full h-[340px] sm:h-[360px]" : "w-full h-[460px] sm:h-[520px]")
      }`}
    >
      <canvas
        ref={canvasRef}
        tabIndex={decorative ? -1 : 0}
        aria-hidden={decorative || undefined}
        aria-label={decorative ? undefined : labels.canvasAria}
        onKeyDown={handleKeyDown}
        className={`block h-full w-full cursor-grab touch-pan-y outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
          modelReady ? "hc-reveal" : "opacity-0"
        }`}
      />

      {!modelReady && !loadError && (
        <div
          role="status"
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-surface-subtle p-6 text-center"
        >
          <div aria-hidden="true" className="flex flex-col items-center gap-1">
            <div className="skeleton-sheen h-7 w-6 rounded-lg" />
            <div className="skeleton-sheen h-14 w-12 rounded-xl" />
            <div className="flex gap-1">
              <div className="skeleton-sheen h-14 w-4 rounded-md" />
              <div className="skeleton-sheen h-14 w-4 rounded-md" />
            </div>
          </div>
          <div className="h-1.5 w-40 overflow-hidden rounded-md bg-border">
            <div
              className="h-full w-full origin-left bg-sapphire transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none"
              style={{ transform: `scaleX(${loadProgress / 100})` }}
            />
          </div>
          <p className="text-body text-muted-foreground">{labels.loadingTitle}</p>
        </div>
      )}

      {layerLoading && modelReady && !loadError && (
        <div
          role="status"
          aria-live="polite"
          data-layer-loading={layerLoading}
          className="pointer-events-none absolute left-1/2 top-3 z-30 inline-flex -translate-x-1/2 items-center gap-2 rounded-lg border border-border/90 bg-card/94 px-3 py-1.5 text-meta font-medium text-foreground shadow-xs backdrop-blur-md"
        >
          <span>{layerLoading === "skeletal" ? labels.loadingBones : labels.loadingMuscles}</span>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-x-3 top-3 z-20 rounded-xl border border-border bg-card p-3 text-body text-foreground">
          {loadError}
        </div>
      )}

      {hoverBadge.visible && (
        <div
          role="tooltip"
          style={{ left: `${hoverBadge.x}px`, top: `${hoverBadge.y}px` }}
          className="popover-in pointer-events-none absolute z-30 max-w-[235px] rounded-lg bg-foreground px-3 py-2 text-white shadow-lg"
        >
          <span className="block text-body font-semibold leading-snug">{hoverBadge.name}</span>
          {hoverBadge.areaLabel && (
            <span className="mt-0.5 block text-body text-mist">{hoverBadge.areaLabel}</span>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
