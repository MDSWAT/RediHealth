"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { SearchIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { getHealthCheckTranslations } from "@/lib/i18n/health-check-translations";
import type { CameraViewPreset, ViewportCameraApi } from "./AnatomicalViewport3D";
import { WEBGL_ERROR, hasWebGL } from "./webgl-support";
import {
  BackViewIcon,
  CloseIcon,
  FemaleBodyIcon,
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
  FEMALE_ONLY_SUB_REGIONS,
  SUB_REGION_INFO,
  getLocalizedSubRegion,
  type BodyAnatomyProfile,
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
  bodyProfile?: BodyAnatomyProfile;
  onBodyProfileChange?: (profile: BodyAnatomyProfile) => void;
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
  /** Told whether the 3D body is on screen (false: data saver, no WebGL, or it failed to load). */
  onBodyShownChange?: (shown: boolean) => void;
  /** Driven visceral X-ray mode on desktop when a visceral symptom is active. */
  forcedLayerMode?: LayerModeId | null;
  /** Driven sub-region focus on desktop when a visceral symptom maps to an internal organ. */
  focusSubRegion?: SubRegionId | null;
  focusSide?: Side;
  lang?: Lang;
  compact?: boolean;
}

const COPY: Record<
  Lang,
  {
    views: string;
    bodyType: string;
    bodyGeneral: string;
    bodyFemale: string;
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
    bodyType: "Anatomie afișată",
    bodyGeneral: "Generală",
    bodyFemale: "Feminină",
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
    layers: { hybrid: "Tot corpul", muscular: "Mușchi", organs: "Organe", surface: "Piele" },
    search: "Caută o parte a corpului",
    searchPlaceholder: "de exemplu sân, ovar, inimă, genunchi",
    noResults: "Nu am găsit nimic. Încearcă alt cuvânt.",
    left: "stânga",
    right: "dreapta",
  },
  en: {
    views: "View",
    bodyType: "Body model",
    bodyGeneral: "General",
    bodyFemale: "Female",
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
    layers: { hybrid: "Whole body", muscular: "Muscles", organs: "Organs", surface: "Skin" },
    search: "Find a body part",
    searchPlaceholder: "for example breast, ovary, heart, knee",
    noResults: "Nothing found. Try another word.",
    left: "left",
    right: "right",
  },
  sq: {
    views: "Pamja",
    bodyType: "Modeli i trupit",
    bodyGeneral: "I përgjithshëm",
    bodyFemale: "Femëror",
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
    layers: { hybrid: "I gjithë trupi", muscular: "Muskujt", organs: "Organet", surface: "Lëkura" },
    search: "Kërko një pjesë të trupit",
    searchPlaceholder: "për shembull gji, vezore, zemra, gjuri",
    noResults: "Nuk u gjet asgjë. Provo një fjalë tjetër.",
    left: "majtas",
    right: "djathtas",
  },
  it: {
    views: "Vista",
    bodyType: "Modello del corpo",
    bodyGeneral: "Generale",
    bodyFemale: "Femminile",
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
    layers: { hybrid: "Tutto il corpo", muscular: "Muscoli", organs: "Organi", surface: "Pelle" },
    search: "Cerca una parte del corpo",
    searchPlaceholder: "per esempio seno, ovaio, cuore, ginocchio",
    noResults: "Nessun risultato. Prova un'altra parola.",
    left: "sinistra",
    right: "destra",
  },
  hr: {
    views: "Pogled",
    bodyType: "Model tijela",
    bodyGeneral: "Opći",
    bodyFemale: "Ženski",
    open: "Opcije",
    camera: "Kamera",
    zoomIn: "Približi",
    zoomOut: "Udalji",
    turnLeft: "Okreni ulijevo",
    turnRight: "Okreni udesno",
    resetView: "Početni prikaz",
    close: "Zatvori opcije",
    liteNote: "3D prikaz tijela je isključen radi uštede podatkovnog prometa. Odaberi područje s popisa.",
    liteLoad: "Prikaži 3D tijelo",
    options: "Opcije modela",
    layer: "Što prikazati",
    layers: { hybrid: "Cijelo tijelo", muscular: "Mišići", organs: "Organi", surface: "Koža" },
    search: "Potraži dio tijela",
    searchPlaceholder: "na primjer dojka, jajnik, srce, koljeno",
    noResults: "Nema rezultata. Pokušaj s drugom riječju.",
    left: "lijevo",
    right: "desno",
  },
  rom: {
    views: "Dikhimos",
    bodyType: "Modelo e truposko",
    bodyGeneral: "Generalno",
    bodyFemale: "Dzhuvlikano",
    open: "Opcie",
    camera: "Kamera",
    zoomIn: "An maj pasha",
    zoomOut: "Ingar maj dur",
    turnLeft: "Ambold pe stingo",
    turnRight: "Ambold pe chacho",
    resetView: "Angluno dikhimos",
    close: "Phandav le opcie",
    liteNote: "O 3D trupo si mudardo te arakhes interneteske date. Alosar o than katar i lista.",
    liteLoad: "Sikav o 3D trupo",
    options: "Opcie e modeloske",
    layer: "So dikljol",
    layers: { hybrid: "Sasto trupo", muscular: "Muskulura", organs: "Organura", surface: "Morti" },
    search: "Rode jekh kotor e truposko",
    searchPlaceholder: "misal chuchi, ilo, chang",
    noResults: "Na arakhlam khanchi. Zumav aver vorba.",
    left: "stingo",
    right: "chacho",
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
  bodyProfile,
  onBodyProfileChange,
  className = "",
  stageClassName,
  showTools = true,
  toolsClassName = "",
  controlsClassName,
  selectionLabel,
  decorative = false,
  onBodyShownChange,
  forcedLayerMode = null,
  focusSubRegion = null,
  focusSide,
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
  const [internalProfile, setInternalProfile] = useState<BodyAnatomyProfile>("general");
  const activeBodyProfile: BodyAnatomyProfile =
    focusSubRegion && FEMALE_ONLY_SUB_REGIONS.has(focusSubRegion)
      ? "female"
      : (bodyProfile ?? internalProfile);
  const setBodyProfile = (next: BodyAnatomyProfile) => {
    setInternalProfile(next);
    onBodyProfileChange?.(next);
  };

  const [userAngle, setUserAngle] = useState<CameraViewPreset | null>(null);
  const [viewRequest, setViewRequest] = useState(0);
  const [freeView, setFreeView] = useState(false);
  const autoLite = useSyncExternalStore(subscribeNoop, prefersLiteBody, () => false);
  const [forceBody, setForceBody] = useState(false);
  const lite = autoLite && !forceBody;
  // Known before the three.js chunk loads, so a device without WebGL never downloads it.
  const noWebGL = useSyncExternalStore(subscribeNoop, () => !hasWebGL(), () => false);
  /** Set when the 3D body failed to start or load. */
  const [loadFailure, setLoadFailure] = useState<string | null>(null);
  const unavailable = noWebGL ? (WEBGL_ERROR[activeLang] ?? WEBGL_ERROR[DEFAULT_LANG]) : loadFailure;
  const bodyShown = !lite && !unavailable;
  const onBodyShownRef = useRef(onBodyShownChange);
  useEffect(() => {
    onBodyShownRef.current = onBodyShownChange;
  });
  // Before paint, so the page never shows the two-column layout around a missing body.
  useLayoutEffect(() => {
    onBodyShownRef.current?.(bodyShown);
  }, [bodyShown]);
  const [layerMode, setLayerMode] = useState<LayerModeId>("hybrid");
  const [userOverrodeLayer, setUserOverrodeLayer] = useState(false);
  const [prevForcedKey, setPrevForcedKey] = useState<string | null>(null);
  const forcedKey = forcedLayerMode || focusSubRegion ? `${forcedLayerMode ?? ""}:${focusSubRegion ?? ""}` : null;
  if (prevForcedKey !== forcedKey) {
    setPrevForcedKey(forcedKey);
    setUserOverrodeLayer(false);
    if (forcedKey) setUserAngle(null);
  }
  const effectiveLayerMode: LayerModeId =
    !userOverrodeLayer && forcedLayerMode ? forcedLayerMode : layerMode;
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
      setUserOverrodeLayer(false);
      setInternalSubRegion(null);
      setInternalSide("Center");
    }
  }

  // With a parent that records the exact point, its value is the truth; otherwise keep our own.
  const controlled = onSelectDetailedAnatomy !== undefined;
  const activeSubRegion = controlled ? selectedSubRegion : internalSubRegion;
  const activeSide = controlled ? selectedSide : internalSide;

  const targetViewSubRegion = focusSubRegion ?? activeSubRegion;
  const derivedView: CameraViewPreset =
    targetViewSubRegion && SUB_REGION_INFO[targetViewSubRegion]?.defaultView === "back"
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
    if (subRegion && FEMALE_ONLY_SUB_REGIONS.has(subRegion) && activeBodyProfile !== "female") {
      setBodyProfile("female");
    }
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

  // The exact structure only when it belongs to the chosen area, or when driven by visceral X-ray focus.
  const effectiveSubRegion: SubRegionId | null =
    focusSubRegion ??
    (activeSubRegion && selectedPart && SUB_REGION_INFO[activeSubRegion]?.macroPart === selectedPart
      ? activeSubRegion
      : null);
  const effectiveSide: Side = focusSubRegion ? (focusSide ?? "Center") : effectiveSubRegion ? activeSide : "Center";

  const hudRaw = effectiveSubRegion ? SUB_REGION_INFO[effectiveSubRegion] : null;
  const hudLocalized = effectiveSubRegion ? getLocalizedSubRegion(effectiveSubRegion, activeLang) : null;
  const hudSideLabel =
    hudRaw?.bilateral && effectiveSide !== "Center"
      ? `, ${effectiveSide === "Left" ? t.left : t.right}`
      : "";

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
    `flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-lg border px-1.5 py-2 text-center text-sm font-medium leading-tight transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
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
      className="flex h-11 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted active:bg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
    >
      <Icon className="h-5 w-5" />
    </button>
  );

  const sectionTitle = "mb-2 text-sm font-semibold text-foreground";

  return (
    <div className={`w-full ${className}`}>
      {!bodyShown ? (
        // No 3D body (data saver, or a device that cannot draw it): one plain line above the list.
        <p className="flex flex-wrap items-baseline gap-x-3 text-sm leading-relaxed text-muted-foreground">
          <span>{unavailable ?? t.liteNote}</span>
          {lite && !unavailable && (
            <button
              type="button"
              onClick={() => setForceBody(true)}
              className="inline-flex min-h-11 items-center rounded-sm px-1 font-medium text-foreground underline underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:min-h-9"
            >
              {t.liteLoad}
            </button>
          )}
        </p>
      ) : (
        <div ref={stageRef} className={`relative overflow-hidden bg-surface-subtle ${stageClassName ?? "h-[460px]"}`}>
          {hudRaw && hudLocalized ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-3 z-30 max-w-[calc(100%-9rem)] rounded-lg border border-border bg-card/90 px-3.5 py-2.5 shadow-sm backdrop-blur-md"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold leading-snug text-foreground">
                  {hudLocalized.label}
                  {hudSideLabel}
                </p>
                <span className="rounded-md bg-sapphire-soft px-2 py-0.5 text-xs font-medium text-sapphire">
                  {hudLocalized.tissueLabel}
                </span>
              </div>
              <p className="mt-0.5 text-xs italic leading-snug text-muted-foreground">
                {hudRaw.latinName} · {hudRaw.fmaId}
              </p>
            </div>
          ) : selectionLabel ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-3 z-30 max-w-[calc(100%-9rem)] rounded-lg border border-border bg-card/90 px-3.5 py-2 text-sm font-semibold leading-snug text-foreground shadow-sm backdrop-blur-md"
            >
              {selectionLabel}
            </div>
          ) : null}
          {showTools && (
            <button
              ref={openerRef}
              type="button"
              aria-expanded={panelOpen}
              aria-controls={panelId}
              onClick={() => setPanelOpen((v) => !v)}
              className={`absolute right-3 top-3 z-30 min-h-11 items-center gap-2 rounded-xl border border-border/90 bg-card/95 px-3 text-sm font-medium text-foreground shadow-sm backdrop-blur-md transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${controlsClassName ?? "flex"}`}
            >
              <SlidersIcon className="h-4 w-4 text-muted-foreground" />
              <span>{t.open}</span>
              {activeBodyProfile === "female" && (
                <span className="rounded-md bg-sapphire-soft px-1.5 py-0.5 text-xs font-semibold text-sapphire">
                  {t.bodyFemale}
                </span>
              )}
            </button>
          )}
          {showTools && panelOpen && (
            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-label={t.options}
              className="hc-sheet fixed inset-x-0 bottom-0 z-40 max-h-[62dvh] overflow-y-auto rounded-t-xl border-t border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.25)] sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-2 sm:top-2 sm:w-[22rem] sm:max-h-[calc(100%-1rem)] sm:rounded-xl sm:border sm:shadow-lg"
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
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              <div role="group" aria-label={t.bodyType}>
                <p className={sectionTitle}>{t.bodyType}</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    aria-pressed={activeBodyProfile === "general"}
                    onClick={() => setBodyProfile("general")}
                    className={tile(activeBodyProfile === "general")}
                  >
                    <WholeBodyIcon className="h-9 w-9 shrink-0" />
                    {t.bodyGeneral}
                  </button>
                  <button
                    type="button"
                    aria-pressed={activeBodyProfile === "female"}
                    onClick={() => setBodyProfile("female")}
                    className={tile(activeBodyProfile === "female")}
                  >
                    <FemaleBodyIcon className="h-9 w-9 shrink-0" />
                    {t.bodyFemale}
                  </button>
                </div>
              </div>

              <div role="group" aria-label={t.views} className="mt-4">
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
                        aria-pressed={effectiveLayerMode === id}
                        onClick={() => {
                          setUserOverrodeLayer(true);
                          setLayerMode(id);
                        }}
                        className={tile(effectiveLayerMode === id)}
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
                            className="flex min-h-11 w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sapphire"
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

          {showTools && (
            <div
              role="toolbar"
              aria-label={t.options}
              className="hidden lg:flex absolute inset-x-3 bottom-3 z-30 mx-auto w-fit max-w-[calc(100%-1.5rem)] flex-wrap items-center justify-center gap-1 rounded-xl border border-border/90 bg-card/95 p-1 shadow-sm backdrop-blur-md"
            >
              {(["front", "back"] as const).map((preset) => {
                const active = !freeView && viewAngle === preset;
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
                    className={`inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-xs font-semibold whitespace-nowrap transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                      active
                        ? "bg-sapphire-soft text-sapphire"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                );
              })}
              <span aria-hidden="true" className="mx-0.5 h-4 w-px shrink-0 bg-border" />
              {LAYER_ORDER.map((id) => {
                const active = effectiveLayerMode === id;
                const Icon = LAYER_ICON[id];
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setUserOverrodeLayer(true);
                      setLayerMode(id);
                    }}
                    className={`inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium whitespace-nowrap transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                      active
                        ? "bg-sapphire-soft font-semibold text-sapphire"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{t.layers[id]}</span>
                  </button>
                );
              })}
            </div>
          )}

          <AnatomicalViewport3D
            selectedPart={selectedPart}
            selectedSubRegion={effectiveSubRegion}
            selectedSide={effectiveSide}
            viewAngle={viewAngle}
            layerMode={effectiveLayerMode}
            isolateSelected={false}
            bodyProfile={activeBodyProfile}
            onSelectAnatomy={(macroPart, subRegion, side) => handleSelect3D(macroPart, subRegion, side, true)}
            onUnavailable={setLoadFailure}
            lang={activeLang}
            compact={compact}
            className="h-full w-full"
            decorative={decorative}
            viewRequest={viewRequest}
            onFreeRotate={() => setFreeView(true)}
            cameraRef={cameraRef}
          >
            {(effectiveSubRegion || selectedPart) && (
              <span
                aria-hidden="true"
                style={{ left: "var(--anchor-x, 50%)", top: "var(--anchor-y, 40%)" }}
                className="pointer-events-none absolute z-20 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sapphire ring-2 ring-white shadow-xs"
              />
            )}
          </AnatomicalViewport3D>
        </div>
      )}

      {showTools && bodyShown && (
        <p className={`mt-3 text-sm leading-snug text-muted-foreground ${toolsClassName}`}>
          {dict.ui.viewer3D.tip}
        </p>
      )}
    </div>
  );
}
