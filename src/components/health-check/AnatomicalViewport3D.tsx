"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DEFAULT_LANG } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { getHealthCheckTranslations, type BodyPartId } from "@/lib/i18n/health-check-translations";
import { DURATION, EASE_IN_OUT, EASE_OUT } from "@/lib/motion/tokens";
import {
  SUB_REGION_INFO,
  getLocalizedSubRegion,
  type LayerModeId,
  type SubRegionId,
  type TissueKind,
} from "./anatomy-3d-data";

export type CameraViewPreset = "front" | "back" | "three-quarter" | "side";

/** Camera actions the page's control panel can call. */
export interface ViewportCameraApi {
  zoomIn: () => void;
  zoomOut: () => void;
  rotateLeft: () => void;
  rotateRight: () => void;
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

interface CachedAnatomyAssets {
  scene: THREE.Group;
  atlasManifest: AtlasLayersManifest;
  atlasBuffer: ArrayBuffer;
  muscleBump: THREE.CanvasTexture;
  tendonBump: THREE.CanvasTexture;
}

// Module-level asset and geometry cache (DEF-10) to prevent costly re-allocation and re-fetching on unmount/remount
let globalAssetCache: CachedAnatomyAssets | null = null;
let globalAssetPromise: Promise<CachedAnatomyAssets> | null = null;

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
/** Turning round the body: starts and settles gently, never a jolt. */
const easeOrbit = cubicBezier(EASE_IN_OUT);
/** Small nudges (rotate buttons): decelerate into place. */
const easeNudge = cubicBezier(EASE_OUT);

// Color palette inspired by kelpikz/body-pain-explorer and ashemag/human-atlas
const MUSCLE_COLOR = new THREE.Color(0x9f241f);
const MUSCLE_LIGHT = new THREE.Color(0xc74434);
const TENDON_COLOR = new THREE.Color(0xe4cda0);
const SURFACE_ACCENT_COLOR = new THREE.Color(0xc8b39e);
const SELECTED_COLOR = new THREE.Color(0x2f6fd6);
const HOVER_COLOR = new THREE.Color(0xff9a66);
/** Once an area is chosen, everything outside it fades towards this warm grey. */
const DIM_COLOR = new THREE.Color(0xd3cdc6);
const DIM_AMOUNT = 0.62;

const ORGAN_COLORS: Record<string, THREE.Color> = {
  heart: new THREE.Color(0xc0392b),
  lungs: new THREE.Color(0xc98895),
  stomach_organ: new THREE.Color(0xd1885c),
  liver: new THREE.Color(0x8f4338),
  colon: new THREE.Color(0xc4956a),
  kidneys: new THREE.Color(0x9e5347),
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
          Math.min(230, Math.round(128 + longFiber * 32 + fineFiber * 10))
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

const VIEWPORT_LABELS: Record<
  Lang,
  { canvasAria: string; loadingTitle: string; left: string; right: string; webglError: string; loadError: string }
> = {
  ro: {
    canvasAria: "Corp 3D. Folosește săgețile stânga și dreapta ca să îl rotești. Alege zona din listă.",
    loadingTitle: "Se încarcă corpul 3D",
    left: "Stânga",
    right: "Dreapta",
    webglError: "Corpul 3D nu se poate deschide pe acest dispozitiv. Alege zona din listă.",
    loadError: "Corpul 3D nu s-a încărcat. Alege zona din listă.",
  },
  en: {
    canvasAria: "3D body. Use the left and right arrow keys to turn it. Choose the area from the list.",
    loadingTitle: "Loading the 3D body",
    left: "Left",
    right: "Right",
    webglError: "The 3D body cannot open on this device. Choose the area from the list.",
    loadError: "The 3D body did not load. Choose the area from the list.",
  },
  sq: {
    canvasAria: "Trupi 3D. Përdor shigjetat majtas dhe djathtas për ta rrotulluar. Zgjidh zonën nga lista.",
    loadingTitle: "Po ngarkohet trupi 3D",
    left: "Majtas",
    right: "Djathtas",
    webglError: "Trupi 3D nuk hapet në këtë pajisje. Zgjidh zonën nga lista.",
    loadError: "Trupi 3D nuk u ngarkua. Zgjidh zonën nga lista.",
  },
  it: {
    canvasAria: "Corpo 3D. Usa le frecce sinistra e destra per girarlo. Scegli la zona dall'elenco.",
    loadingTitle: "Caricamento del corpo 3D",
    left: "Sinistra",
    right: "Destra",
    webglError: "Il corpo 3D non si apre su questo dispositivo. Scegli la zona dall'elenco.",
    loadError: "Il corpo 3D non si è caricato. Scegli la zona dall'elenco.",
  },
};

function loadAnatomyAssets(
  gltfLoader: GLTFLoader,
  onProgress?: (pct: number) => void
): Promise<CachedAnatomyAssets> {
  if (globalAssetCache) {
    onProgress?.(100);
    return Promise.resolve(globalAssetCache);
  }
  if (globalAssetPromise) {
    return globalAssetPromise;
  }

  const gltfPromise = new Promise<THREE.Group>((resolve, reject) => {
    gltfLoader.load(
      "/models/muscular.glb",
      (gltf) => {
        onProgress?.(65);
        resolve(gltf.scene);
      },
      (evt) => {
        if (evt.total > 0) {
          const pct = Math.round((evt.loaded / evt.total) * 55);
          onProgress?.(15 + pct);
        }
      },
      reject
    );
  });

  const atlasPromise = (async () => {
    const [manifestRes, binRes] = await Promise.all([
      fetch("/models/human-atlas-layers.json"),
      fetch("/models/human-atlas-layers.bin"),
    ]);
    if (!manifestRes.ok || !binRes.ok) {
      throw new Error("Could not load supplementary anatomical layers.");
    }
    const manifest = (await manifestRes.json()) as AtlasLayersManifest;
    const buffer = await binRes.arrayBuffer();
    return { manifest, buffer };
  })();

  globalAssetPromise = Promise.all([gltfPromise, atlasPromise])
    .then(([gltfScene, { manifest, buffer }]) => {
      const muscleBump = createFiberTexture("muscle");
      const tendonBump = createFiberTexture("tendon");
      globalAssetCache = {
        scene: gltfScene,
        atlasManifest: manifest,
        atlasBuffer: buffer,
        muscleBump,
        tendonBump,
      };
      onProgress?.(100);
      return globalAssetCache;
    })
    .catch((err) => {
      globalAssetPromise = null;
      throw err;
    });

  return globalAssetPromise;
}

export function AnatomicalViewport3D({
  selectedPart,
  selectedSubRegion,
  selectedSide,
  viewAngle,
  layerMode,
  isolateSelected,
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
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize with cached state if available (DEF-10) to avoid flashing loading spinner
  const [loadProgress, setLoadProgress] = useState<number>(globalAssetCache ? 100 : 12);
  const [modelReady, setModelReady] = useState<boolean>(Boolean(globalAssetCache));
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
      onSelectAnatomy,
      compact,
      lang,
      decorative,
      onFreeRotate,
    };
  });

  // Expose imperative camera zoom/reset/rotate methods for floating buttons
  const controlsApiRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    rotateLeft: () => void;
    rotateRight: () => void;
    rotateBy: (deltaRad: number) => void;
    resetCamera: () => void;
    focusSubRegion: (subRegion: SubRegionId, side?: "Left" | "Right" | "Center") => void;
    focusArea: (macroPart: BodyPartId) => void;
    syncVisuals: () => void;
    animateToPreset: (preset: CameraViewPreset) => void;
  } | null>(null);

  useEffect(() => {
    const wrapEl = wrapRef.current;
    const canvasEl = canvasRef.current;
    if (!wrapEl || !canvasEl) return;

    let disposed = false;
    let renderRequested = false;
    let isAnimating = false;
    let pointerMoveRafId: number | null = null;
    let pendingPointer: { clientX: number; clientY: number } | null = null;
    let idealDistance = compact ? 16.5 : 17.2;

    // Shared BodyParts3D transform constants (meters: Y in [0, 1.72] -> scaled to [-3.85, +3.85])
    const MODEL_SCALE = 7.7 / 1.72;
    const CENTER_Y = 0.86;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.05, idealDistance);

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
          setLoadError(labels.webglError);
        }
      });
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const controls = new OrbitControls(camera, canvasEl);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.enablePan = false;
    controls.minDistance = 6.2;
    controls.maxDistance = 22;
    controls.target.set(0, 0.1, 0);
    controls.rotateSpeed = 0.68;
    controls.zoomSpeed = 0.85;
    // The body turns like a turntable and stays upright: a little tilt, never tumbling over.
    controls.minPolarAngle = Math.PI * 0.38;
    controls.maxPolarAngle = Math.PI * 0.62;

    // DEF-07: Eliminate mobile touch trapping
    // Set touch-action to pan-y so single-finger vertical swipes scroll the browser naturally.
    // Two fingers rotate and dolly-zoom the 3D model.
    controls.touches = {
      ONE: null,
      TWO: THREE.TOUCH.DOLLY_ROTATE,
    };
    canvasEl.style.touchAction = "pan-y";

    // DEF-25: Demand-driven rendering engine
    // Render only on interaction, state changes, or active animations rather than continuous 60/120fps loop.
    function requestRender() {
      if (!renderRequested && !disposed) {
        renderRequested = true;
        requestAnimationFrame(renderFrame);
      }
    }

    function renderFrame() {
      renderRequested = false;
      if (disposed) return;
      // The body never turns by itself; frames are drawn only while something changes.
      controls.update();
      renderer.render(scene, camera);
      if (isAnimating) requestRender();
    }

    controls.addEventListener("change", requestRender);
    // A drag takes over from any camera move in flight, so the two never fight.
    const onControlsStart = () => {
      cancelCameraMove();
      stateRef.current.onFreeRotate?.();
    };
    controls.addEventListener("start", onControlsStart);

    // Even, neutral studio light: a warm key, a soft back light and a quiet fill. No coloured casts.
    scene.add(new THREE.HemisphereLight(0xfff7e8, 0x1e293b, 2.35));
    const keyLight = new THREE.DirectionalLight(0xfff2da, 4.8);
    keyLight.position.set(-5, 8.5, 9.5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xfff0e6, 2.2);
    rimLight.position.set(6, 2.5, -6.5);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xf1f4fa, 1.2, 22);
    fillLight.position.set(-4.5, -1.8, 5.5);
    scene.add(fillLight);

    // Root anatomy group
    const anatomyRoot = new THREE.Group();
    anatomyRoot.name = "RediHealth 3D Anatomy";
    scene.add(anatomyRoot);

    const selectableMeshes: THREE.Mesh[] = [];
    let skinShellMesh: THREE.Mesh | null = null;

    // Materials with procedural muscle/tendon fiber textures
    const muscleBump = globalAssetCache?.muscleBump || createFiberTexture("muscle");
    const tendonBump = globalAssetCache?.tendonBump || createFiberTexture("tendon");

    const muscleMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.46,
      metalness: 0.02,
      bumpMap: muscleBump,
      bumpScale: 0.017,
      clearcoat: 0.09,
      clearcoatRoughness: 0.6,
      sheen: 0.18,
      sheenColor: new THREE.Color(0x7a1716),
      side: THREE.DoubleSide,
    });

    const tendonMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.38,
      metalness: 0.02,
      bumpMap: tendonBump,
      bumpScale: 0.011,
      clearcoat: 0.14,
      clearcoatRoughness: 0.52,
      side: THREE.DoubleSide,
    });

    const organMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.34,
      metalness: 0.04,
      clearcoat: 0.25,
      clearcoatRoughness: 0.35,
      sheen: 0.22,
      side: THREE.DoubleSide,
    });

    const surfaceCapMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      vertexColors: true,
      roughness: 0.52,
      metalness: 0.02,
      clearcoat: 0.08,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
    });

    const skinShellMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd6c7b8,
      roughness: 0.42,
      metalness: 0.03,
      transmission: 0.12,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.FrontSide,
    });

    // Paint vertex colors based on selection and hover state
    function paintMesh(mesh: THREE.Mesh) {
      const position = mesh.geometry.attributes.position;
      if (!position) return;
      const data = mesh.userData as {
        subRegion: SubRegionId;
        macroPart: BodyPartId;
        tissue: TissueKind;
        bilateral: boolean;
        baseColor: THREE.Color;
        hoverSide: "Left" | "Right" | "Center" | null;
      };

      let colors = mesh.geometry.getAttribute("color") as THREE.BufferAttribute | undefined;
      if (!colors || colors.count !== position.count) {
        colors = new THREE.BufferAttribute(new Float32Array(position.count * 3), 3);
        mesh.geometry.setAttribute("color", colors);
      }

      const activeSub = stateRef.current.selectedSubRegion;
      const activePart = stateRef.current.selectedPart;
      const activeSide = stateRef.current.selectedSide;

      const isSubMatch = activeSub
        ? data.subRegion === activeSub
        : activePart !== null && data.macroPart === activePart;
      // The chosen area keeps its colours and the rest of the body fades, so the area reads at a
      // glance without mixing hues; the exact spot stays full blue.
      const outsideArea = activePart !== null && data.macroPart !== activePart;
      const dimmedColor = outsideArea ? data.baseColor.clone().lerp(DIM_COLOR, DIM_AMOUNT) : null;

      for (let i = 0; i < position.count; i += 1) {
        const vSide = data.bilateral ? sideForVertex(position.getX(i)) : "Center";
        const isVertexSelected =
          isSubMatch &&
          (!activeSub ||
            !data.bilateral ||
            activeSide === "Center" ||
            activeSide === vSide);
        const isVertexHovered =
          data.hoverSide === vSide || data.hoverSide === "Center";

        const c = isVertexSelected
          ? SELECTED_COLOR
          : isVertexHovered
            ? HOVER_COLOR
            : dimmedColor ?? data.baseColor;
        colors.setXYZ(i, c.r, c.g, c.b);
      }
      colors.needsUpdate = true;
    }

    function applyLayerVisibility() {
      const mode = stateRef.current.layerMode;
      const isolate = stateRef.current.isolateSelected;
      const activeSub = stateRef.current.selectedSubRegion;
      const activePart = stateRef.current.selectedPart;

      if (skinShellMesh) {
        if (isolate && (activeSub || activePart)) {
          skinShellMesh.visible = false;
        } else if (mode === "surface") {
          skinShellMesh.visible = true;
          skinShellMaterial.opacity = 0.72;
        } else if (mode === "organs") {
          skinShellMesh.visible = true;
          skinShellMaterial.opacity = 0.24;
        } else if (mode === "hybrid") {
          skinShellMesh.visible = true;
          skinShellMaterial.opacity = 0.2;
        } else {
          // Muscular mode: subtle ghost outline so head/hands/feet remain contextualized
          skinShellMesh.visible = true;
          skinShellMaterial.opacity = 0.14;
        }
      }

      selectableMeshes.forEach((mesh) => {
        const d = mesh.userData as {
          subRegion: SubRegionId;
          macroPart: BodyPartId;
          isOrgan?: boolean;
          isSurfaceCap?: boolean;
          isMuscleGlb?: boolean;
        };

        if (isolate && (activeSub || activePart)) {
          const matchesIsolate = activeSub
            ? d.subRegion === activeSub
            : d.macroPart === activePart;
          mesh.visible = matchesIsolate;
          return;
        }

        if (mode === "organs") {
          // Show internal organs + head/neck/hands/feet caps; dim or hide external muscles covering thorax/abdomen
          if (d.isOrgan || d.isSurfaceCap) {
            mesh.visible = true;
          } else {
            const coversViscera =
              d.subRegion === "pectoral" ||
              d.subRegion === "abdominals" ||
              d.subRegion === "obliques" ||
              d.subRegion === "upper_back" ||
              d.subRegion === "lower_back";
            mesh.visible = !coversViscera;
          }
        } else if (mode === "muscular") {
          mesh.visible = !d.isOrgan;
        } else {
          // Hybrid or surface: everything selectable is active
          mesh.visible = true;
        }
      });
    }

    function syncAllVisuals() {
      applyLayerVisibility();
      selectableMeshes.forEach((m) => paintMesh(m));
      requestRender();
    }

    /*
     * Camera moves orbit round the body (spherical interpolation around the target), so turning
     * from front to back swings round at a steady distance instead of flying through the chest.
     * Timing comes from the shared motion tokens and grows a little with the angle turned.
     */
    let animationToken = 0;
    let inFlight: { toPos: THREE.Vector3; toTarget: THREE.Vector3 } | null = null;
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const UP = new THREE.Vector3(0, 1, 0);

    function cancelCameraMove() {
      animationToken += 1;
      inFlight = null;
      isAnimating = false;
    }

    function animateCamera(
      destination: THREE.Vector3,
      target: THREE.Vector3,
      { ease = easeOrbit, duration }: { ease?: (t: number) => number; duration?: number } = {}
    ) {
      // The same move asked for twice (a tap, then the state update it causes) keeps its course.
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
      // Always the short way round.
      const dTheta = THREE.MathUtils.euclideanModulo(to.theta - from.theta + Math.PI, Math.PI * 2) - Math.PI;
      const turn = Math.abs(dTheta) / Math.PI;
      const zoom = Math.min(Math.abs(to.radius - from.radius) / Math.max(from.radius, 0.001), 1);
      const pan = Math.min(fromTarget.distanceTo(toTarget) / 4, 1);
      const token = ++animationToken;
      if (turn < 0.002 && zoom < 0.002 && pan < 0.002 && Math.abs(to.phi - from.phi) < 0.002) {
        inFlight = null;
        isAnimating = false;
        return;
      }

      const ms = reduceMotionQuery.matches
        ? 0
        : (duration ?? DURATION.slow * 1000 * (1 + 0.6 * turn + 0.3 * Math.max(zoom, pan)));
      inFlight = { toPos: destination.clone(), toTarget };
      isAnimating = true;
      const start = performance.now();
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
        controls.update();
        renderer.render(scene, camera);
      }
      function finish() {
        inFlight = null;
        isAnimating = false;
        requestRender();
      }
      // Reduced motion: the camera is simply in its new place.
      if (ms <= 0) {
        apply(1);
        finish();
        return;
      }
      function step(now: number) {
        if (disposed || token !== animationToken) return;
        const raw = Math.min((now - start) / ms, 1);
        apply(ease(raw));
        if (raw < 1) requestAnimationFrame(step);
        else finish();
      }
      requestAnimationFrame(step);
    }

    function animateToPreset(preset: CameraViewPreset) {
      const d = idealDistance;
      const target = new THREE.Vector3(0, 0.05, 0);
      const position =
        preset === "back"
          ? new THREE.Vector3(0, 0.05, -d)
          : preset === "side"
            ? new THREE.Vector3(d, 0.05, 0)
            : preset === "three-quarter"
              ? new THREE.Vector3(d * 0.58, 0.35, d * 0.82)
              : new THREE.Vector3(0, 0.05, d);
      animateCamera(position, target);
    }

    /** Where the camera is heading (or is): repeated presses build on the move in flight. */
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

    // A tap keeps the camera on the side the person is looking at; list and search choices may turn it.
    let tapSide: { sign: number; at: number } | null = null;

    /** Frames a set of meshes with some context around them, from the front or the back. */
    function frameMeshes(
      meshes: THREE.Mesh[],
      preferBack: boolean,
      side: "Left" | "Right" | "Center",
      context: { height: number; width: number }
    ) {
      if (!meshes.length) return;
      const box = new THREE.Box3();
      meshes.forEach((m) => box.expandByObject(m));
      const worldCenter = box.getCenter(new THREE.Vector3());
      if (side === "Left") worldCenter.x = THREE.MathUtils.lerp(worldCenter.x, box.max.x, 0.55);
      if (side === "Right") worldCenter.x = THREE.MathUtils.lerp(worldCenter.x, box.min.x, 0.55);

      const zSign =
        tapSide && performance.now() - tapSide.at < 1200 ? tapSide.sign : preferBack ? -1 : 1;
      // Fit the box instead of using a fixed distance, so small organs (stomach, heart) fill the
      // stage and large areas still fit.
      const size = box.getSize(new THREE.Vector3());
      const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const fitHeight = Math.max(size.y * context.height, 2.6);
      const fitWidth = Math.max(size.x * context.width, 2.0);
      const fitDistance =
        Math.max(fitHeight / (2 * tanHalfFov), fitWidth / (2 * tanHalfFov * camera.aspect)) + size.z * 0.5;
      const distance = THREE.MathUtils.clamp(fitDistance, controls.minDistance + 0.3, idealDistance * 0.8);

      animateCamera(
        new THREE.Vector3(worldCenter.x * 0.6, worldCenter.y + 0.12, worldCenter.z + zSign * distance),
        worldCenter
      );
    }

    /** One exact structure (a precise tap or a search result). */
    function focusSubRegion(subRegion: SubRegionId, side: "Left" | "Right" | "Center" = "Center") {
      const matching = selectableMeshes.filter((m) => m.userData.subRegion === subRegion);
      frameMeshes(matching, SUB_REGION_INFO[subRegion]?.defaultView === "back", side, { height: 2.4, width: 2.0 });
    }

    /** A whole area (chosen from the list, or a first tap on a phone). */
    function focusArea(macroPart: BodyPartId) {
      const all = selectableMeshes.filter((m) => m.userData.macroPart === macroPart);
      const visible = all.filter((m) => m.visible);
      frameMeshes(visible.length ? visible : all, macroPart === "back", "Center", { height: 1.5, width: 1.3 });
    }

    controlsApiRef.current = {
      zoomIn: () => zoomBy(0.82),
      zoomOut: () => zoomBy(1.22),
      rotateLeft: () => rotateByAngle(-Math.PI / 4),
      rotateRight: () => rotateByAngle(Math.PI / 4),
      rotateBy: (deltaRad: number) => rotateByAngle(deltaRad, DURATION.base * 1000),
      resetCamera: () => animateToPreset("front"),
      focusSubRegion,
      focusArea,
      syncVisuals: syncAllVisuals,
      animateToPreset,
    };

    // Load assets via global cache
    // muscular.glb is meshopt-compressed and quantized (one scene-wide volume, so mesh-local X keeps the body midline at 0).
    const gltfLoader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    loadAnatomyAssets(gltfLoader, (pct) => {
      if (!disposed) setLoadProgress(pct);
    })
      .then((assets) => {
        if (disposed) return;

        // 1. Setup Muscular GLTF model from cached scene
        const model = assets.scene.clone(true);
        Object.keys(REGION_BY_GLB_NODE).forEach((nodeName, index) => {
          const node = model.getObjectByName(nodeName);
          if (!node) return;
          node.traverse((child) => {
            if (!(child as THREE.Mesh).isMesh) return;
            const mesh = child as THREE.Mesh;
            const matName =
              (mesh.material as THREE.Material | undefined)?.name?.toLowerCase() || "";
            const tissue: TissueKind = matName === "tendon" ? "Tendon" : "Muscle";
            const subRegion = resolveGlbSubRegion(nodeName, tissue);
            const subInfo = SUB_REGION_INFO[subRegion];

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
              hoverSide: null,
              isMuscleGlb: true,
              selectable: true,
            };
            paintMesh(mesh);
            selectableMeshes.push(mesh);
          });
        });

        model.scale.setScalar(MODEL_SCALE);
        model.position.set(0, -CENTER_Y * MODEL_SCALE, 0);
        anatomyRoot.add(model);

        // 2. Setup Atlas Layers from cached manifest and binary buffer
        const atlasGroup = new THREE.Group();
        atlasGroup.scale.setScalar(MODEL_SCALE);
        atlasGroup.position.set(0, -CENTER_Y * MODEL_SCALE, 0);

        assets.atlasManifest.parts.forEach((part) => {
          const geom = new THREE.BufferGeometry();
          geom.setAttribute(
            "position",
            new THREE.BufferAttribute(
              new Float32Array(assets.atlasBuffer, part.positions, part.vertexCount * 3),
              3
            )
          );
          geom.setAttribute(
            "normal",
            new THREE.BufferAttribute(
              new Int16Array(assets.atlasBuffer, part.normals, part.vertexCount * 3),
              3,
              true
            )
          );
          geom.setIndex(
            new THREE.BufferAttribute(
              new Uint32Array(assets.atlasBuffer, part.indices, part.indexCount),
              1
            )
          );
          geom.computeBoundingSphere();

          if (part.id === "skin_shell") {
            const shellMesh = new THREE.Mesh(geom, skinShellMaterial);
            shellMesh.renderOrder = 2;
            skinShellMesh = shellMesh;
            atlasGroup.add(shellMesh);
            return;
          }

          const mapping = ATLAS_PART_TO_SUB_REGION[part.id];
          if (!mapping) return;

          const subInfo = SUB_REGION_INFO[mapping.subRegion];
          const baseColor =
            ORGAN_COLORS[part.id] ||
            (mapping.tissue === "Tendon" ? TENDON_COLOR : SURFACE_ACCENT_COLOR);

          const mesh = new THREE.Mesh(
            geom,
            mapping.isOrgan ? organMaterial : surfaceCapMaterial
          );
          mesh.userData = {
            nodeName: part.id,
            subRegion: mapping.subRegion,
            macroPart: subInfo.macroPart,
            tissue: mapping.tissue,
            bilateral: subInfo.bilateral,
            baseColor,
            hoverSide: null,
            isOrgan: Boolean(mapping.isOrgan),
            isSurfaceCap: Boolean(mapping.isSurfaceCap),
            selectable: true,
          };
          paintMesh(mesh);
          selectableMeshes.push(mesh);
          atlasGroup.add(mesh);
        });

        anatomyRoot.add(atlasGroup);
        syncAllVisuals();
        setModelReady(true);
        requestRender();
      })
      .catch((err) => {
        if (disposed) return;
        console.error("3D anatomy load error:", err);
        setLoadError(labels.loadError);
      });

    // Responsive framing & Aspect Ratio Synchronization (DEF-09)
    const handleResize = () => {
      if (!wrapEl || disposed) return;
      const rect = wrapEl.getBoundingClientRect();
      // Hidden stage (display:none) reports 0x0: keep the last good framing.
      if (rect.width < 1 || rect.height < 1) return;
      const w = rect.width;
      const h = rect.height;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;

      // Ensure full mannequin (7.7m height, ~2.6m width) fits into frustum with safe margin on all screens
      const halfFovRad = THREE.MathUtils.degToRad(camera.fov / 2);
      const tanHalfFov = Math.tan(halfFovRad);
      const reqDistY = (7.7 * 1.15) / (2 * tanHalfFov);
      const reqDistX = (2.6 * 1.25) / (2 * tanHalfFov * camera.aspect);
      idealDistance = Math.max(reqDistY, reqDistX, compact ? 16.5 : 17.2);

      camera.updateProjectionMatrix();
      requestRender();

      // Re-frame once the stage settles at its new size (e.g. tall on step 1, short on step 2).
      if (lastSize && (Math.abs(lastSize.w - w) > 24 || Math.abs(lastSize.h - h) > 24)) {
        if (reframeTimer) clearTimeout(reframeTimer);
        reframeTimer = setTimeout(() => {
          if (disposed) return;
          const st = stateRef.current;
          if (st.selectedSubRegion) focusSubRegion(st.selectedSubRegion, st.selectedSide);
          else if (st.selectedPart) focusArea(st.selectedPart);
          else animateToPreset(st.viewAngle);
        }, 140);
      }
      lastSize = { w, h };
    };
    let lastSize: { w: number; h: number } | null = null;
    let reframeTimer: ReturnType<typeof setTimeout> | null = null;

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(wrapEl);
    handleResize();

    // Pointer raycasting with requestAnimationFrame throttling (DEF-25)
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos: { x: number; y: number } | null = null;
    let hoveredState: { mesh: THREE.Mesh; side: "Left" | "Right" | "Center" } | null = null;

    function hitTest(clientX: number, clientY: number) {
      if (!canvasEl) return null;
      const rect = canvasEl.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const visibleSelectables = selectableMeshes.filter((m) => m.visible);
      const hits = raycaster.intersectObjects(visibleSelectables, false);
      // Only the half of the body facing the camera counts, so a tap on the belly never
      // lands on a back muscle seen through a gap between front structures.
      const nearLimit = camera.position.distanceTo(controls.target) + 0.6;
      return hits.find((h) => h.distance <= nearLimit) ?? null;
    }

    function resolveHitSelection(hit: THREE.Intersection) {
      const mesh = hit.object as THREE.Mesh;
      const d = mesh.userData as {
        subRegion: SubRegionId;
        macroPart: BodyPartId;
        bilateral: boolean;
      };
      let side: "Left" | "Right" | "Center" = "Center";
      if (d.bilateral) {
        const localPoint = anatomyRoot.worldToLocal(hit.point.clone());
        side = localPoint.x < 0 ? "Right" : "Left";
      }
      return { mesh, subRegion: d.subRegion, macroPart: d.macroPart, side };
    }

    /*
     * What a person points at is the side of the body they are looking at. A ray through a gap
     * in the front muscles can reach the kidneys or spine; seen from the front that tap still
     * means chest or belly, and seen from behind a front structure means the back.
     */
    function intendedArea(macroPart: BodyPartId, point: THREE.Vector3): BodyPartId {
      const view = camera.position.clone().sub(controls.target).normalize();
      if (view.z > 0.5 && macroPart === "back") {
        return point.y >= chestFloorY() ? "chest" : "stomach";
      }
      if (view.z < -0.5 && (macroPart === "chest" || macroPart === "stomach")) return "back";
      return macroPart;
    }

    let cachedChestFloor: number | null = null;
    function chestFloorY(): number {
      if (cachedChestFloor !== null) return cachedChestFloor;
      const box = new THREE.Box3();
      selectableMeshes.filter((m) => m.userData.macroPart === "chest").forEach((m) => box.expandByObject(m));
      cachedChestFloor = box.isEmpty() ? 0.9 : box.min.y;
      return cachedChestFloor;
    }

    // One-finger horizontal drag turns the body; vertical swipes stay with the page (touch-action: pan-y).
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

    const onPointerUp = (e: PointerEvent) => {
      if (
        stateRef.current.decorative ||
        !pointerDownPos ||
        Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y) > 12
      ) {
        return;
      }
      touchDrag = null;
      const hit = hitTest(e.clientX, e.clientY);
      if (!hit) return;
      const sel = resolveHitSelection(hit);
      tapSide = { sign: camera.position.z - controls.target.z >= 0 ? 1 : -1, at: performance.now() };
      // On a phone the first tap picks the whole area; fine structures only once zoomed in.
      const zoomedIn = camera.position.distanceTo(controls.target) < 13;
      const macroPart = intendedArea(sel.macroPart, hit.point);
      const remapped = macroPart !== sel.macroPart;
      const coarse = (e.pointerType === "touch" && !zoomedIn) || remapped;
      if (e.isTrusted) navigator.vibrate?.(12);
      // A coarse tap names the area only; it never claims an exact structure the person did not pick.
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

    function handleThrottledPointerMove() {
      pointerMoveRafId = null;
      if (!pendingPointer || disposed || !wrapEl || !canvasEl) return;
      const { clientX, clientY } = pendingPointer;
      pendingPointer = null;

      const hit = hitTest(clientX, clientY);
      if (!hit) {
        if (hoveredState) {
          hoveredState.mesh.userData.hoverSide = null;
          paintMesh(hoveredState.mesh);
          hoveredState = null;
          requestRender();
        }
        canvasEl.style.cursor = "grab";
        setHoverBadge((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }

      const sel = resolveHitSelection(hit);
      if (
        hoveredState &&
        (hoveredState.mesh !== sel.mesh || hoveredState.side !== sel.side)
      ) {
        hoveredState.mesh.userData.hoverSide = null;
        paintMesh(hoveredState.mesh);
      }
      hoveredState = { mesh: sel.mesh, side: sel.side };
      sel.mesh.userData.hoverSide = sel.side;
      paintMesh(sel.mesh);
      requestRender();

      const activeLang = stateRef.current.lang || DEFAULT_LANG;
      const info = getLocalizedSubRegion(sel.subRegion, activeLang);
      const areaTitle = getHealthCheckTranslations(activeLang).bodyParts[info.macroPart]?.title ?? "";
      const sideText =
        sel.side !== "Center"
          ? ` (${sel.side === "Left" ? labels.left : labels.right})`
          : "";
      const rect = wrapEl.getBoundingClientRect();
      canvasEl.style.cursor = "pointer";
      setHoverBadge({
        visible: true,
        x: Math.min(Math.max(clientX - rect.left + 14, 12), rect.width - 230),
        y: Math.min(Math.max(clientY - rect.top + 14, 12), rect.height - 68),
        name: `${info.label}${sideText}`,
        // The area this structure belongs to: what a tap here will choose.
        areaLabel: areaTitle,
      });
    }

    const onPointerLeave = () => {
      if (hoveredState) {
        hoveredState.mesh.userData.hoverSide = null;
        paintMesh(hoveredState.mesh);
        hoveredState = null;
        requestRender();
      }
      setHoverBadge((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    };

    canvasEl.addEventListener("pointerdown", onPointerDown);
    canvasEl.addEventListener("pointerup", onPointerUp);
    canvasEl.addEventListener("pointermove", onPointerMove);
    canvasEl.addEventListener("pointerleave", onPointerLeave);
    canvasEl.addEventListener("pointercancel", onPointerEnd);

    // Initial render call
    requestRender();

    return () => {
      disposed = true;
      if (reframeTimer) clearTimeout(reframeTimer);
      if (pointerMoveRafId !== null) cancelAnimationFrame(pointerMoveRafId);
      resizeObserver.disconnect();
      canvasEl.removeEventListener("pointerdown", onPointerDown);
      canvasEl.removeEventListener("pointerup", onPointerUp);
      canvasEl.removeEventListener("pointermove", onPointerMove);
      canvasEl.removeEventListener("pointerleave", onPointerLeave);
      canvasEl.removeEventListener("pointercancel", onPointerEnd);
      controls.removeEventListener("change", requestRender);
      controls.removeEventListener("start", onControlsStart);
      controls.dispose();
      muscleMaterial.dispose();
      tendonMaterial.dispose();
      organMaterial.dispose();
      surfaceCapMaterial.dispose();
      skinShellMaterial.dispose();
      renderer.dispose();
    };
  }, [labels.webglError, labels.loadError, compact, labels.left, labels.right]);

  // Synchronize prop changes (selection, layerMode, viewAngle) with the live 3D scene
  useEffect(() => {
    controlsApiRef.current?.syncVisuals();
  }, [selectedPart, selectedSubRegion, selectedSide, layerMode, isolateSelected]);

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
      resetCamera: () => controlsApiRef.current?.resetCamera(),
    };
    return () => {
      cameraRef.current = null;
    };
  }, [cameraRef]);

  // Frame what is chosen: the exact structure, else the whole area, else the starting view.
  useEffect(() => {
    if (!modelReady) return;
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
        className="block h-full w-full cursor-grab touch-pan-y outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sapphire"
      />

      {!modelReady && !loadError && (
        <div
          role="status"
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-surface-subtle p-6 text-center"
        >
          <div className="h-1 w-40 overflow-hidden rounded-full bg-border">
            <div
              className="h-full w-full origin-left bg-foreground transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none"
              style={{ transform: `scaleX(${loadProgress / 100})` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">{labels.loadingTitle}</p>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-x-3 top-3 z-20 rounded-lg border border-border bg-card p-3 text-sm text-foreground">
          {loadError}
        </div>
      )}

      {hoverBadge.visible && (
        <div
          role="tooltip"
          style={{ left: `${hoverBadge.x}px`, top: `${hoverBadge.y}px` }}
          className="pointer-events-none absolute z-30 max-w-[235px] rounded-lg bg-foreground px-3 py-2 text-white shadow-lg"
        >
          <span className="block text-sm font-semibold leading-snug">{hoverBadge.name}</span>
          {hoverBadge.areaLabel && (
            <span className="mt-0.5 block text-sm text-mist">{hoverBadge.areaLabel}</span>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
