"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { getHealthCheckTranslations, type BodyPartId } from "@/lib/i18n/health-check-translations";
import {
  AnatomicalViewport3D,
  type CameraViewPreset,
  type ViewportCameraApi,
} from "./AnatomicalViewport3D";
import { BODY_MAP_COPY } from "./AnatomicalBodyMap";
import {
  FEMALE_ONLY_SUB_REGIONS,
  SUB_REGION_INFO,
  getLocalizedSubRegion,
  type BodyAnatomyProfile,
  type LayerModeId,
  type SubRegionId,
} from "./anatomy-3d-data";
import {
  BackViewIcon,
  BonesIcon,
  FemaleBodyIcon,
  FrontViewIcon,
  MusclesIcon,
  OrgansIcon,
  ResetViewIcon,
  SkinIcon,
  WholeBodyIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "./ModelIcons";
import { WEBGL_ERROR, hasWebGL } from "./webgl-support";

export type { CameraViewPreset };

type Side = "Left" | "Right" | "Center";

export interface HumanAtlasPreviewStageProps {
  /** Active anatomical layer to display. */
  layerMode: LayerModeId;
  /** Optional callback when the user switches layer inside the stage toolbar. */
  onLayerModeChange?: (layer: LayerModeId) => void;
  /** Optional list of layers to expose in the compact toolbar; omit to hide the layer switcher. */
  availableLayers?: readonly LayerModeId[];
  /** Optional macro body part override; derived automatically from selectedSubRegion when omitted. */
  selectedPart?: BodyPartId | null;
  /** Focused sub-region to highlight and frame smoothly. */
  selectedSubRegion: SubRegionId | null;
  /** Optional anatomical side for bilateral structures. */
  selectedSide?: Side;
  /** Body contour ("general" by default, "female" for female-specific structures). */
  bodyProfile?: BodyAnatomyProfile;
  /** Optional callback when the user toggles the body model. */
  onBodyProfileChange?: (profile: BodyAnatomyProfile) => void;
  /** Show a compact body model toggle inside the stage controls. */
  allowBodyProfileToggle?: boolean;
  /** Preferred camera view preset; defaults from selectedSubRegion.defaultView when omitted. */
  viewAngle?: CameraViewPreset;
  /** Callback when the user taps or clicks a structure directly on the 3D body. */
  onSelectSubRegion?: (subRegion: SubRegionId | null, macroPart: BodyPartId, side: Side) => void;
  /** Called if WebGL is unavailable or 3D assets fail to load. */
  onUnavailable?: (message: string) => void;
  /** Active UI locale (falls back to LanguageContext / DEFAULT_LANG). */
  lang?: Lang;
  /** Stage height and framing utilities (default: "h-[380px] sm:h-[440px]"). */
  className?: string;
  /** Show compact view, zoom, reset, and optional layer controls (default: true). */
  showControls?: boolean;
}

const LAYER_ICON: Record<LayerModeId, (props: { className?: string }) => ReactNode> = {
  surface: SkinIcon,
  muscular: MusclesIcon,
  skeletal: BonesIcon,
  organs: OrgansIcon,
  hybrid: WholeBodyIcon,
};

const subscribeNoop = () => () => {};

function useSafeLanguage(propLang?: Lang): Lang {
  let contextLang: Lang = DEFAULT_LANG;
  try {
    const ctx = useLanguage();
    contextLang = ctx?.lang || DEFAULT_LANG;
  } catch {
    contextLang = DEFAULT_LANG;
  }
  return propLang || contextLang;
}

/**
 * Focused, lightweight 3D Human Atlas stage for learning guides.
 * Dynamically import this module with `{ ssr: false }` so WebGL and model bytes
 * load strictly on demand when the reader opens 3D exploration.
 */
export function HumanAtlasPreviewStage({
  layerMode,
  onLayerModeChange,
  availableLayers,
  selectedPart = null,
  selectedSubRegion,
  selectedSide = "Center",
  bodyProfile,
  onBodyProfileChange,
  allowBodyProfileToggle = false,
  viewAngle,
  onSelectSubRegion,
  onUnavailable,
  lang,
  className = "h-[380px] sm:h-[440px]",
  showControls = true,
}: HumanAtlasPreviewStageProps) {
  const activeLang = useSafeLanguage(lang);
  const dict = getHealthCheckTranslations(activeLang);
  const t = BODY_MAP_COPY[activeLang] ?? BODY_MAP_COPY[DEFAULT_LANG];
  const cameraRef = useRef<ViewportCameraApi | null>(null);

  const [internalLayer, setInternalLayer] = useState<LayerModeId>(layerMode);
  const [prevPropLayer, setPrevPropLayer] = useState<LayerModeId>(layerMode);
  if (prevPropLayer !== layerMode) {
    setPrevPropLayer(layerMode);
    setInternalLayer(layerMode);
  }
  const activeLayer: LayerModeId = onLayerModeChange ? layerMode : internalLayer;

  const [internalProfile, setInternalProfile] = useState<BodyAnatomyProfile>(bodyProfile ?? "general");
  const [prevPropProfile, setPrevPropProfile] = useState<BodyAnatomyProfile | undefined>(bodyProfile);
  if (prevPropProfile !== bodyProfile) {
    setPrevPropProfile(bodyProfile);
    if (bodyProfile) setInternalProfile(bodyProfile);
  }
  const activeProfile: BodyAnatomyProfile =
    selectedSubRegion && FEMALE_ONLY_SUB_REGIONS.has(selectedSubRegion)
      ? "female"
      : (bodyProfile ?? internalProfile);

  const [userAngle, setUserAngle] = useState<CameraViewPreset | null>(null);
  const [freeView, setFreeView] = useState(false);
  const [viewRequest, setViewRequest] = useState(0);
  const [prevFocusKey, setPrevFocusKey] = useState<string>(`${selectedSubRegion ?? ""}:${viewAngle ?? ""}`);
  const focusKey = `${selectedSubRegion ?? ""}:${viewAngle ?? ""}`;
  if (prevFocusKey !== focusKey) {
    setPrevFocusKey(focusKey);
    setUserAngle(null);
    setFreeView(false);
  }

  const noWebGL = useSyncExternalStore(subscribeNoop, () => !hasWebGL(), () => false);
  const [loadFailure, setLoadFailure] = useState<string | null>(null);
  const unavailable = noWebGL ? (WEBGL_ERROR[activeLang] ?? WEBGL_ERROR[DEFAULT_LANG]) : loadFailure;

  const onUnavailableRef = useRef(onUnavailable);
  useEffect(() => {
    onUnavailableRef.current = onUnavailable;
  });
  useEffect(() => {
    if (unavailable) onUnavailableRef.current?.(unavailable);
  }, [unavailable]);

  const subInfo = selectedSubRegion ? SUB_REGION_INFO[selectedSubRegion] : null;
  const effectivePart: BodyPartId | null = selectedPart ?? subInfo?.macroPart ?? null;
  const derivedAngle: CameraViewPreset =
    viewAngle ??
    (subInfo?.defaultView === "back"
      ? "back"
      : effectivePart === "back"
        ? "back"
        : "front");
  const activeAngle: CameraViewPreset = userAngle ?? derivedAngle;

  const localizedSub = selectedSubRegion ? getLocalizedSubRegion(selectedSubRegion, activeLang) : null;
  const sideLabel =
    subInfo?.bilateral && selectedSide !== "Center"
      ? `, ${selectedSide === "Left" ? t.left : t.right}`
      : "";

  const handleLayerSelect = (next: LayerModeId) => {
    if (!onLayerModeChange) setInternalLayer(next);
    onLayerModeChange?.(next);
  };

  const handleProfileSelect = (next: BodyAnatomyProfile) => {
    setInternalProfile(next);
    onBodyProfileChange?.(next);
  };

  if (unavailable) {
    return (
      <div
        role="status"
        className="rounded-xl border border-border bg-card p-4 text-body text-muted-foreground"
      >
        {unavailable}
      </div>
    );
  }

  const showLayerSwitcher = Boolean(availableLayers && availableLayers.length > 1);

  return (
    <div
      data-atlas-preview-stage
      className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className={`relative isolate w-full overflow-hidden bg-surface-subtle ${className}`}>
        {(localizedSub || (showControls && allowBodyProfileToggle)) && (
          <div className="pointer-events-none absolute inset-x-2.5 top-2.5 z-30 flex flex-wrap items-start justify-between gap-2 sm:inset-x-3 sm:top-3">
            {localizedSub ? (
              <div
                aria-live="polite"
                className="max-w-full rounded-xl border border-border/90 bg-card/94 px-3 py-1.5 shadow-2xs backdrop-blur-md"
              >
                <p className="truncate text-meta font-semibold leading-snug text-foreground">
                  {localizedSub.label}
                  {sideLabel}
                </p>
                <p className="truncate text-meta text-muted-foreground">{localizedSub.tissueLabel}</p>
              </div>
            ) : (
              <span />
            )}

            {showControls && allowBodyProfileToggle && (
              <div
                role="group"
                aria-label={t.bodyType}
                className="pointer-events-auto inline-flex items-center gap-1 rounded-xl border border-border/90 bg-card/94 p-1 shadow-2xs backdrop-blur-md"
              >
                {(
                  [
                    { id: "general", label: t.bodyGeneral, Icon: WholeBodyIcon },
                    { id: "female", label: t.bodyFemale, Icon: FemaleBodyIcon },
                  ] as const
                ).map(({ id, label, Icon }) => {
                  const active = activeProfile === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => handleProfileSelect(id)}
                      className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 text-meta font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        active
                          ? "border-rose-border bg-rose-tint text-rose-ink"
                          : "border-transparent text-foreground/80 hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <AnatomicalViewport3D
          selectedPart={effectivePart}
          selectedSubRegion={selectedSubRegion}
          selectedSide={selectedSide}
          viewAngle={activeAngle}
          layerMode={activeLayer}
          isolateSelected={false}
          bodyProfile={activeProfile}
          onSelectAnatomy={(macroPart, subRegion, side) => {
            if (subRegion && FEMALE_ONLY_SUB_REGIONS.has(subRegion) && activeProfile !== "female") {
              handleProfileSelect("female");
            }
            onSelectSubRegion?.(subRegion, macroPart, side);
          }}
          onUnavailable={setLoadFailure}
          lang={activeLang}
          compact
          className="h-full w-full"
          viewRequest={viewRequest}
          onFreeRotate={() => setFreeView(true)}
          cameraRef={cameraRef}
        >
          {(selectedSubRegion || effectivePart) && (
            <span
              aria-hidden="true"
              style={{ left: "var(--anchor-x, 50%)", top: "var(--anchor-y, 40%)" }}
              className="pointer-events-none absolute z-20 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sapphire ring-2 ring-white shadow-xs [[data-anchor-active=false]_&]:hidden"
            />
          )}
        </AnatomicalViewport3D>
      </div>

      {showControls && (
        <div
          role="toolbar"
          aria-label={`${t.views}, ${t.camera}, ${t.layer}`}
          className="border-t border-border bg-card px-2.5 py-2"
        >
          <div
            className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${
              showLayerSwitcher ? "justify-between" : "justify-center"
            }`}
          >
            <div className="flex flex-wrap items-center gap-1">
              {(["front", "back"] as const).map((preset) => {
                const active = !freeView && activeAngle === preset;
                const label = preset === "front" ? dict.ui.viewer3D.front : dict.ui.viewer3D.back;
                const Icon = preset === "front" ? FrontViewIcon : BackViewIcon;
                return (
                  <button
                    key={preset}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setUserAngle(preset);
                      setFreeView(false);
                      setViewRequest((n) => n + 1);
                    }}
                    className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-meta font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      active
                        ? "bg-sapphire-soft text-sapphire"
                        : "text-foreground/80 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                );
              })}

              <span aria-hidden="true" className="mx-0.5 h-4 w-px shrink-0 bg-border" />

              <button
                type="button"
                aria-label={t.zoomOut}
                title={t.zoomOut}
                onClick={() => cameraRef.current?.zoomOut()}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-foreground/80 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ZoomOutIcon className="h-4 w-4 shrink-0" />
              </button>
              <button
                type="button"
                aria-label={t.zoomIn}
                title={t.zoomIn}
                onClick={() => cameraRef.current?.zoomIn()}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-foreground/80 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ZoomInIcon className="h-4 w-4 shrink-0" />
              </button>
              <button
                type="button"
                aria-label={t.resetView}
                title={t.resetView}
                onClick={() => {
                  setUserAngle(null);
                  setFreeView(false);
                  cameraRef.current?.resetCamera();
                }}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-foreground/80 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ResetViewIcon className="h-4 w-4 shrink-0" />
              </button>
            </div>

            {showLayerSwitcher && (
              <div className="flex flex-wrap items-center gap-1.5">
                {availableLayers!.map((id) => {
                  const active = activeLayer === id;
                  const label = t.layers[id];
                  const Icon = LAYER_ICON[id];
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => handleLayerSelect(id)}
                      className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 text-meta font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        active
                          ? "border-sapphire-border bg-sapphire-soft text-sapphire"
                          : "border-border-control/60 bg-card text-foreground/80 hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
