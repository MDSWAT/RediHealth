"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { SearchIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { getHealthCheckTranslations } from "@/lib/i18n/health-check-translations";
import type { CameraViewPreset, ViewportCameraApi } from "./AnatomicalViewport3D";
import {
  BackViewIcon,
  CloseIcon,
  FrontViewIcon,
  MusclesIcon,
  OrgansIcon,
  ResetViewIcon,
  SkinIcon,
  SlidersIcon,
  TurnLeftIcon,
  TurnRightIcon,
  WholeBodyIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "./ModelIcons";

// Three.js is the heaviest part of the page: load it after the list is usable.
const AnatomicalViewport3D = dynamic(
  () => import("./AnatomicalViewport3D").then((m) => m.AnatomicalViewport3D),
  { ssr: false, loading: () => null },
);

type NetworkInformationLike = { saveData?: boolean; effectiveType?: string };

/** Data saver, very slow networks or tiny-memory phones start without the 3D body. */
function prefersLiteBody(): boolean {
  const nav = navigator as Navigator & { connection?: NetworkInformationLike; deviceMemory?: number };
  const conn = nav.connection;
  if (conn?.saveData) return true;
  if (conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") return true;
  return typeof nav.deviceMemory === "number" && nav.deviceMemory <= 1;
}
const subscribeNoop = () => () => {};
import type { BodyPartId } from "@/lib/i18n/health-check-translations";
import {
  SUB_REGION_INFO,
  getLocalizedSubRegion,
  type LayerModeId,
  type SubRegionId,
} from "./anatomy-3d-data";

type Side = "Left" | "Right" | "Center";

export interface AnatomicalBodyMapProps {
  selectedPart: BodyPartId | null;
  onSelectPart: (partId: BodyPartId) => void;
  selectedSubRegion?: SubRegionId | null;
  selectedSide?: Side;
  onSelectDetailedAnatomy?: (partId: BodyPartId, subRegion: SubRegionId, side: Side) => void;
  className?: string;
  /** Height utilities for the 3D stage. */
  stageClassName?: string;
  /** Show the view switch, hint and options below the stage. */
  showTools?: boolean;
  toolsClassName?: string;
  controlsClassName?: string;
  /** Plain name of the chosen area, shown on the stage after a tap. */
  selectionLabel?: string | null;
  /** The body is context only (later steps): hide the canvas from keyboard and screen readers. */
  decorative?: boolean;
  lang?: Lang;
  compact?: boolean;
}

const COPY: Record<
  Lang,
  {
    views: string;
    open: string;
    camera: string;
    zoomIn: string;
    zoomOut: string;
    turnLeft: string;
    turnRight: string;
    resetView: string;
    close: string;
    liteNote: string;
    liteLoad: string;
    options: string;
    layer: string;
    layers: Record<LayerModeId, string>;
    search: string;
    searchPlaceholder: string;
    noResults: string;
    left: string;
    right: string;
  }
> = {
  ro: {
    views: "Unghi",
    open: "Opțiuni",
    camera: "Cameră",
    zoomIn: "Apropie",
    zoomOut: "Depărtează",
    turnLeft: "Rotește la stânga",
    turnRight: "Rotește la dreapta",
    resetView: "Vedere inițială",
    close: "Închide opțiunile",
    liteNote: "Corpul 3D e oprit ca să economisești date. Alege zona din listă.",
    liteLoad: "Arată corpul 3D",
    options: "Opțiuni model",
    layer: "Ce se vede",
    layers: { hybrid: "Tot corpul", muscular: "Mușchi", organs: "Organe", surface: "Doar pielea" },
    search: "Caută o parte a corpului",
    searchPlaceholder: "de exemplu inimă, genunchi",
    noResults: "Nu am găsit nimic. Încearcă alt cuvânt.",
    left: "stânga",
    right: "dreapta",
  },
  en: {
    views: "View",
    open: "Options",
    camera: "Camera",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    turnLeft: "Turn left",
    turnRight: "Turn right",
    resetView: "Starting view",
    close: "Close options",
    liteNote: "The 3D body is off to save data. Choose the area from the list.",
    liteLoad: "Show the 3D body",
    options: "Model options",
    layer: "What to show",
    layers: { hybrid: "Whole body", muscular: "Muscles", organs: "Organs", surface: "Skin only" },
    search: "Find a body part",
    searchPlaceholder: "for example heart, knee",
    noResults: "Nothing found. Try another word.",
    left: "left",
    right: "right",
  },
  sq: {
    views: "Pamja",
    open: "Opsionet",
    camera: "Kamera",
    zoomIn: "Afro",
    zoomOut: "Largo",
    turnLeft: "Rrotullo majtas",
    turnRight: "Rrotullo djathtas",
    resetView: "Pamja fillestare",
    close: "Mbyll opsionet",
    liteNote: "Trupi 3D është i fikur për të kursyer të dhëna. Zgjidh zonën nga lista.",
    liteLoad: "Shfaq trupin 3D",
    options: "Opsionet e modelit",
    layer: "Çfarë shfaqet",
    layers: { hybrid: "I gjithë trupi", muscular: "Muskujt", organs: "Organet", surface: "Vetëm lëkura" },
    search: "Kërko një pjesë të trupit",
    searchPlaceholder: "për shembull zemra, gjuri",
    noResults: "Nuk u gjet asgjë. Provo një fjalë tjetër.",
    left: "majtas",
    right: "djathtas",
  },
  it: {
    views: "Vista",
    open: "Opzioni",
    camera: "Vista",
    zoomIn: "Avvicina",
    zoomOut: "Allontana",
    turnLeft: "Gira a sinistra",
    turnRight: "Gira a destra",
    resetView: "Vista iniziale",
    close: "Chiudi opzioni",
    liteNote: "Il corpo 3D è spento per risparmiare dati. Scegli la zona dall'elenco.",
    liteLoad: "Mostra il corpo 3D",
    options: "Opzioni del modello",
    layer: "Cosa mostrare",
    layers: { hybrid: "Tutto il corpo", muscular: "Muscoli", organs: "Organi", surface: "Solo la pelle" },
    search: "Cerca una parte del corpo",
    searchPlaceholder: "per esempio cuore, ginocchio",
    noResults: "Nessun risultato. Prova un'altra parola.",
    left: "sinistra",
    right: "destra",
  },
};

const LAYER_ORDER: LayerModeId[] = ["hybrid", "muscular", "organs", "surface"];
const LAYER_ICON: Record<LayerModeId, (props: { className?: string }) => ReactNode> = {
  hybrid: WholeBodyIcon,
  muscular: MusclesIcon,
  organs: OrgansIcon,
  surface: SkinIcon,
};

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

export function AnatomicalBodyMap({
  selectedPart,
  onSelectPart,
  selectedSubRegion = null,
  selectedSide = "Center",
  onSelectDetailedAnatomy,
  className = "",
  stageClassName,
  showTools = true,
  toolsClassName = "",
  controlsClassName,
  selectionLabel,
  decorative = false,
  lang,
  compact = false,
}: AnatomicalBodyMapProps) {
  const activeLang = useSafeLanguage(lang);
  const dict = getHealthCheckTranslations(activeLang);
  const t = COPY[activeLang] ?? COPY[DEFAULT_LANG];
  const searchId = useId();
  const panelId = useId();
  const cameraRef = useRef<ViewportCameraApi | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const [userAngle, setUserAngle] = useState<CameraViewPreset | null>(null);
  const [viewRequest, setViewRequest] = useState(0);
  const [freeView, setFreeView] = useState(false);
  const autoLite = useSyncExternalStore(subscribeNoop, prefersLiteBody, () => false);
  const [forceBody, setForceBody] = useState(false);
  const lite = autoLite && !forceBody;
  /** Set when the 3D body cannot run on this device (no WebGL) or failed to load. */
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const [layerMode, setLayerMode] = useState<LayerModeId>("hybrid");
  const [searchQuery, setSearchQuery] = useState("");
  const [internalSubRegion, setInternalSubRegion] = useState<SubRegionId | null>(null);
  const [internalSide, setInternalSide] = useState<Side>("Center");

  // A reset (no area) puts the body back to its starting view.
  const [prevPart, setPrevPart] = useState(selectedPart);
  if (prevPart !== selectedPart) {
    setPrevPart(selectedPart);
    if (!selectedPart) {
      setUserAngle(null);
      setFreeView(false);
      setInternalSubRegion(null);
      setInternalSide("Center");
    }
  }

  // With a parent that records the exact point, its value is the truth; otherwise keep our own.
  const controlled = onSelectDetailedAnatomy !== undefined;
  const activeSubRegion = controlled ? selectedSubRegion : internalSubRegion;
  const activeSide = controlled ? selectedSide : internalSide;

  const derivedView: CameraViewPreset =
    activeSubRegion && SUB_REGION_INFO[activeSubRegion]?.defaultView === "back"
      ? "back"
      : selectedPart === "back"
        ? "back"
        : "front";
  const viewAngle: CameraViewPreset = userAngle ?? derivedView;

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const matches: { subRegion: SubRegionId; macroPart: BodyPartId; label: string; side: Side }[] = [];
    (Object.keys(SUB_REGION_INFO) as SubRegionId[]).forEach((id) => {
      const info = getLocalizedSubRegion(id, activeLang);
      const haystack = `${info.label} ${info.commonConditions.join(" ")} ${(info.searchKeywords || []).join(" ")}`.toLowerCase();
      if (!haystack.includes(q)) return;
      if (info.bilateral) {
        matches.push({ subRegion: id, macroPart: info.macroPart, label: `${info.label}, ${t.left}`, side: "Left" });
        matches.push({ subRegion: id, macroPart: info.macroPart, label: `${info.label}, ${t.right}`, side: "Right" });
      } else {
        matches.push({ subRegion: id, macroPart: info.macroPart, label: info.label, side: "Center" });
      }
    });
    return matches.slice(0, 6);
  }, [searchQuery, activeLang, t.left, t.right]);

  /** `subRegion` is null when a tap only picks the area (first tap on a phone). */
  function handleSelect3D(macroPart: BodyPartId, subRegion: SubRegionId | null, side: Side, fromTap = false) {
    setInternalSubRegion(subRegion);
    setInternalSide(side);
    const info = subRegion ? SUB_REGION_INFO[subRegion] : null;
    if (fromTap) {
      // Pin the current view so a back-side structure does not swing the camera round.
      setUserAngle(viewAngle);
    } else {
      setFreeView(false);
      if (info?.defaultView === "back") setUserAngle("back");
      else if (info?.defaultView === "front") setUserAngle("front");
    }
    onSelectPart(macroPart);
    if (subRegion) onSelectDetailedAnatomy?.(macroPart, subRegion, side);
  }

  // The exact structure only when it belongs to the chosen area; otherwise the whole area is shown.
  const effectiveSubRegion =
    activeSubRegion && selectedPart && SUB_REGION_INFO[activeSubRegion]?.macroPart === selectedPart
      ? activeSubRegion
      : null;

  // Panel: Escape closes, focus moves in on open and back to the button on close.
  useEffect(() => {
    if (!panelOpen) return;
    if (window.matchMedia("(max-width: 639px)").matches && stageRef.current) {
      const banner = document.querySelector<HTMLElement>(".emergency-banner")?.getBoundingClientRect().height ?? 0;
      const top = stageRef.current.getBoundingClientRect().top + window.scrollY - banner;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    }
    panelRef.current?.querySelector<HTMLElement>("button, input")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPanelOpen(false);
        openerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panelOpen]);

  const tile = (active: boolean) =>
    `flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-lg border px-1.5 py-2 text-center text-sm font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
      active
        ? "border-sapphire bg-card text-foreground shadow-[inset_0_0_0_1px_var(--color-sapphire)]"
        : "border-border bg-card text-foreground hover:bg-muted"
    }`;

  const viewButton = (preset: CameraViewPreset, label: string, Icon: typeof FrontViewIcon) => (
    <button
      type="button"
      onClick={() => {
        setUserAngle(preset);
        setFreeView(false);
        setViewRequest((n) => n + 1);
      }}
      aria-pressed={!freeView && viewAngle === preset}
      className={tile(!freeView && viewAngle === preset)}
    >
      <Icon className="h-9 w-9 shrink-0" />
      {label}
    </button>
  );

  const cameraButton = (label: string, Icon: typeof ZoomInIcon, action: keyof ViewportCameraApi) => (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => cameraRef.current?.[action]()}
      className="flex h-11 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted active:bg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
    >
      <Icon className="h-5 w-5" />
    </button>
  );

  const sectionTitle = "mb-2 text-sm font-semibold text-foreground";

  return (
    <div className={`w-full ${className}`}>
      {lite || unavailable ? (
        // No 3D body (data saver, or a device that cannot draw it): a short note, not an empty stage.
        <div className="flex flex-col items-start gap-3 border-y border-border bg-surface-subtle px-5 py-4 sm:rounded-lg sm:border">
          <p className="text-base text-foreground">{unavailable ?? t.liteNote}</p>
          {lite && !unavailable && (
            <button
              type="button"
              onClick={() => setForceBody(true)}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-card px-4 text-base font-medium text-foreground hover:bg-muted"
            >
              {t.liteLoad}
            </button>
          )}
        </div>
      ) : (
        <div ref={stageRef} className={`relative overflow-hidden bg-surface-subtle ${stageClassName ?? "h-[460px]"}`}>
          {selectionLabel && (
            <p
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-3 z-30 max-w-[calc(100%-9rem)] rounded-lg bg-foreground px-3 py-2 text-sm font-medium leading-snug text-white shadow-sm"
            >
              {selectionLabel}
            </p>
          )}
          {showTools && (
            <button
              ref={openerRef}
              type="button"
              aria-expanded={panelOpen}
              aria-controls={panelId}
              onClick={() => setPanelOpen((v) => !v)}
              className={`absolute right-3 top-3 z-30 min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${controlsClassName ?? "flex"}`}
            >
              <SlidersIcon className="h-5 w-5" />
              {t.open}
            </button>
          )}
          {showTools && (
            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-label={t.options}
              hidden={!panelOpen}
              className="hc-sheet fixed inset-x-0 bottom-0 z-40 max-h-[62dvh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.25)] sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-2 sm:top-2 sm:w-[22rem] sm:max-h-[calc(100%-1rem)] sm:rounded-lg sm:border sm:shadow-lg"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-base font-semibold text-foreground">{t.options}</p>
                <button
                  type="button"
                  aria-label={t.close}
                  onClick={() => {
                    setPanelOpen(false);
                    openerRef.current?.focus();
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              <div role="group" aria-label={t.views}>
                <p className={sectionTitle}>{t.views}</p>
                <div className="grid grid-cols-2 gap-2">
                  {viewButton("front", dict.ui.viewer3D.front, FrontViewIcon)}
                  {viewButton("back", dict.ui.viewer3D.back, BackViewIcon)}
                </div>
              </div>

              <div role="group" aria-label={t.layer} className="mt-4">
                <p className={sectionTitle}>{t.layer}</p>
                <div className="grid grid-cols-4 gap-2">
                  {LAYER_ORDER.map((id) => {
                    const Icon = LAYER_ICON[id];
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={layerMode === id}
                        onClick={() => setLayerMode(id)}
                        className={tile(layerMode === id)}
                      >
                        <Icon className="h-9 w-9 shrink-0" />
                        {t.layers[id]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div role="group" aria-label={t.camera} className="mt-4">
                <p className={sectionTitle}>{t.camera}</p>
                <div className="grid grid-cols-5 gap-2">
                  {cameraButton(t.turnLeft, TurnLeftIcon, "rotateLeft")}
                  {cameraButton(t.turnRight, TurnRightIcon, "rotateRight")}
                  {cameraButton(t.zoomOut, ZoomOutIcon, "zoomOut")}
                  {cameraButton(t.zoomIn, ZoomInIcon, "zoomIn")}
                  {cameraButton(t.resetView, ResetViewIcon, "resetCamera")}
                </div>
              </div>

              <div className="relative mt-4">
                <label htmlFor={searchId} className={`block ${sectionTitle}`}>
                  {t.search}
                </label>
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id={searchId}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    autoComplete="off"
                    className="min-h-11 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-base text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                  />
                </div>
                {searchQuery.trim().length >= 2 && (
                  <ul className="mt-2 divide-y divide-border overflow-hidden rounded-lg border border-border">
                    {searchResults.length === 0 ? (
                      <li className="px-3 py-2.5 text-sm text-muted-foreground">{t.noResults}</li>
                    ) : (
                      searchResults.map((item) => (
                        <li key={`${item.subRegion}-${item.side}`}>
                          <button
                            type="button"
                            onClick={() => {
                              handleSelect3D(item.macroPart, item.subRegion, item.side);
                              setSearchQuery("");
                              setPanelOpen(false);
                            }}
                            className="flex min-h-11 w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sapphire"
                          >
                            <span className="font-medium text-foreground">{item.label}</span>
                            <span className="text-muted-foreground">{dict.bodyParts[item.macroPart].title}</span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}
          <AnatomicalViewport3D
            selectedPart={selectedPart}
            selectedSubRegion={effectiveSubRegion}
            selectedSide={effectiveSubRegion ? activeSide : "Center"}
            viewAngle={viewAngle}
            layerMode={layerMode}
            isolateSelected={false}
            onSelectAnatomy={(macroPart, subRegion, side) => handleSelect3D(macroPart, subRegion, side, true)}
            onUnavailable={setUnavailable}
            lang={activeLang}
            compact={compact}
            className="h-full w-full"
            decorative={decorative}
            viewRequest={viewRequest}
            onFreeRotate={() => setFreeView(true)}
            cameraRef={cameraRef}
          />
        </div>
      )}

      {showTools && !lite && !unavailable && (
        <p className={`mt-3 text-sm leading-snug text-muted-foreground ${toolsClassName}`}>
          {dict.ui.viewer3D.tip}
        </p>
      )}
    </div>
  );
}
