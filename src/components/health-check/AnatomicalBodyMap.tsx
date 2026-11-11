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
  BonesIcon,
  CloseIcon,
  FemaleBodyIcon,
  FrontViewIcon,
  ListenIcon,
  MusclesIcon,
  OrgansIcon,
  ResetViewIcon,
  SkinIcon,
  SlidersIcon,
  StopListenIcon,
  TurnLeftIcon,
  TurnRightIcon,
  WholeBodyIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "./ModelIcons";
import { useReadAloud } from "./readingTools";

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
  REFERRED_PAIN_BY_SUB_REGION,
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
    listen: string;
    stopListen: string;
    whyHurt: string;
    hideWhy: string;
    whatItDoes: string;
    referredTo: string;
  }
> = {
  ro: {
    views: "Unghi",
    bodyType: "Anatomie afișată",
    bodyGeneral: "Generală",
    bodyFemale: "Feminină",
    open: "Caută și opțiuni",
    camera: "Apropiere",
    zoomIn: "Apropie",
    zoomOut: "Depărtează",
    turnLeft: "Rotește la stânga",
    turnRight: "Rotește la dreapta",
    resetView: "Vedere inițială",
    close: "Închide opțiunile",
    liteNote: "Corpul 3D e oprit ca să economisești date. Alege zona din listă.",
    liteLoad: "Arată corpul 3D",
    options: "Caută și opțiuni model",
    layer: "Ce se vede",
    layers: { surface: "Piele", muscular: "Mușchi", skeletal: "Oase", organs: "Organe", hybrid: "Tot corpul" },
    search: "Caută o parte a corpului",
    searchPlaceholder: "de exemplu sân, ovar, inimă, genunchi",
    noResults: "Nu am găsit nimic. Încearcă alt cuvânt.",
    left: "stânga",
    right: "dreapta",
    listen: "Ascultă",
    stopListen: "Oprește",
    whyHurt: "De ce poate durea?",
    hideWhy: "Ascunde explicația",
    whatItDoes: "Ce face în corp",
    referredTo: "Durerea se poate simți și în",
  },
  en: {
    views: "View",
    bodyType: "Body model",
    bodyGeneral: "General",
    bodyFemale: "Female",
    open: "Search and options",
    camera: "Zoom",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    turnLeft: "Turn left",
    turnRight: "Turn right",
    resetView: "Starting view",
    close: "Close options",
    liteNote: "The 3D body is off to save data. Choose the area from the list.",
    liteLoad: "Show the 3D body",
    options: "Search and model options",
    layer: "What to show",
    layers: { surface: "Skin", muscular: "Muscles", skeletal: "Bones", organs: "Organs", hybrid: "Whole body" },
    search: "Find a body part",
    searchPlaceholder: "for example breast, ovary, heart, knee",
    noResults: "Nothing found. Try another word.",
    left: "left",
    right: "right",
    listen: "Listen",
    stopListen: "Stop",
    whyHurt: "Why it may hurt",
    hideWhy: "Hide details",
    whatItDoes: "What it does",
    referredTo: "Pain can also travel to",
  },
  sq: {
    views: "Pamja",
    bodyType: "Modeli i trupit",
    bodyGeneral: "I përgjithshëm",
    bodyFemale: "Femëror",
    open: "Kërko dhe opsione",
    camera: "Zmadhimi",
    zoomIn: "Afro",
    zoomOut: "Largo",
    turnLeft: "Rrotullo majtas",
    turnRight: "Rrotullo djathtas",
    resetView: "Pamja fillestare",
    close: "Mbyll opsionet",
    liteNote: "Trupi 3D është i fikur për të kursyer të dhëna. Zgjidh zonën nga lista.",
    liteLoad: "Shfaq trupin 3D",
    options: "Kërko dhe opsione të modelit",
    layer: "Çfarë shfaqet",
    layers: { surface: "Lëkura", muscular: "Muskujt", skeletal: "Kockat", organs: "Organet", hybrid: "I gjithë trupi" },
    search: "Kërko një pjesë të trupit",
    searchPlaceholder: "për shembull gji, vezore, zemra, gjuri",
    noResults: "Nuk u gjet asgjë. Provo një fjalë tjetër.",
    left: "majtas",
    right: "djathtas",
    listen: "Dëgjo",
    stopListen: "Ndalo",
    whyHurt: "Pse mund të dhembë?",
    hideWhy: "Fshih shpjegimin",
    whatItDoes: "Çfarë bën në trup",
    referredTo: "Dhimbja mund të ndihet edhe në",
  },
  it: {
    views: "Vista",
    bodyType: "Modello del corpo",
    bodyGeneral: "Generale",
    bodyFemale: "Femminile",
    open: "Cerca e opzioni",
    camera: "Zoom",
    zoomIn: "Avvicina",
    zoomOut: "Allontana",
    turnLeft: "Gira a sinistra",
    turnRight: "Gira a destra",
    resetView: "Vista iniziale",
    close: "Chiudi opzioni",
    liteNote: "Il corpo 3D è spento per risparmiare dati. Scegli la zona dall'elenco.",
    liteLoad: "Mostra il corpo 3D",
    options: "Cerca e opzioni del modello",
    layer: "Cosa mostrare",
    layers: { surface: "Pelle", muscular: "Muscoli", skeletal: "Ossa", organs: "Organi", hybrid: "Tutto il corpo" },
    search: "Cerca una parte del corpo",
    searchPlaceholder: "per esempio seno, ovaio, cuore, ginocchio",
    noResults: "Nessun risultato. Prova un'altra parola.",
    left: "sinistra",
    right: "destra",
    listen: "Ascolta",
    stopListen: "Ferma",
    whyHurt: "Perché può far male?",
    hideWhy: "Nascondi dettagli",
    whatItDoes: "Cosa fa nel corpo",
    referredTo: "Il dolore può irradiarsi anche a",
  },
  hr: {
    views: "Pogled",
    bodyType: "Model tijela",
    bodyGeneral: "Opći",
    bodyFemale: "Ženski",
    open: "Pretraži i opcije",
    camera: "Zumiranje",
    zoomIn: "Približi",
    zoomOut: "Udalji",
    turnLeft: "Okreni ulijevo",
    turnRight: "Okreni udesno",
    resetView: "Početni prikaz",
    close: "Zatvori opcije",
    liteNote: "3D prikaz tijela je isključen radi uštede podatkovnog prometa. Odaberi područje s popisa.",
    liteLoad: "Prikaži 3D tijelo",
    options: "Pretraži i opcije modela",
    layer: "Što prikazati",
    layers: { surface: "Koža", muscular: "Mišići", skeletal: "Kosti", organs: "Organi", hybrid: "Cijelo tijelo" },
    search: "Potraži dio tijela",
    searchPlaceholder: "na primjer dojka, jajnik, srce, koljeno",
    noResults: "Nema rezultata. Pokušaj s drugom riječju.",
    left: "lijevo",
    right: "desno",
    listen: "Poslušaj",
    stopListen: "Zaustavi",
    whyHurt: "Zašto može boljeti?",
    hideWhy: "Sakrij objašnjenje",
    whatItDoes: "Uloga u tijelu",
    referredTo: "Bol se može osjetiti i u",
  },
  rom: {
    views: "Dikhimos",
    bodyType: "Modelo e truposko",
    bodyGeneral: "Generalno",
    bodyFemale: "Dzhuvlikano",
    open: "Rode thaj opcie",
    camera: "Kamera",
    zoomIn: "An maj pasha",
    zoomOut: "Ingar maj dur",
    turnLeft: "Ambold pe stingo",
    turnRight: "Ambold pe chacho",
    resetView: "Angluno dikhimos",
    close: "Phandav le opcie",
    liteNote: "O 3D trupo si mudardo te arakhes interneteske date. Alosar o than katar i lista.",
    liteLoad: "Sikav o 3D trupo",
    options: "Rode thaj opcie e modeloske",
    layer: "So dikljol",
    layers: { surface: "Morti", muscular: "Muskulura", skeletal: "Kokala", organs: "Organura", hybrid: "Sasto trupo" },
    search: "Rode jekh kotor e truposko",
    searchPlaceholder: "misal chuchi, ilo, chang",
    noResults: "Na arakhlam khanchi. Zumav aver vorba.",
    left: "stingo",
    right: "chacho",
    listen: "Ashun",
    stopListen: "Achhav",
    whyHurt: "Sostar shaj te dukhal?",
    hideWhy: "Garav",
    whatItDoes: "So kerel and-o trupo",
    referredTo: "I dukh shaj te djal vi ko",
  },
};

/** Organs that already read on the skin view: they have their own zone on the body surface. */
const SURFACE_ORGANS: ReadonlySet<SubRegionId> = new Set<SubRegionId>([
  "breast",
  "brain",
  "bladder",
  "uterus_ovaries",
]);
/** The spine lies under the back muscles: it shows only on the bones view. */
const SPINE_SUB_REGIONS: ReadonlySet<SubRegionId> = new Set<SubRegionId>([
  "cervical_spine",
  "thoracic_spine",
  "lumbar_spine",
]);

const LAYER_ORDER: LayerModeId[] = ["surface", "muscular", "skeletal", "organs", "hybrid"];
const LAYER_ICON: Record<LayerModeId, (props: { className?: string }) => ReactNode> = {
  surface: SkinIcon,
  muscular: MusclesIcon,
  skeletal: BonesIcon,
  organs: OrgansIcon,
  hybrid: WholeBodyIcon,
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
  const [layerMode, setLayerMode] = useState<LayerModeId>("surface");
  const [userOverrodeLayer, setUserOverrodeLayer] = useState(false);
  const [prevForcedKey, setPrevForcedKey] = useState<string | null>(null);
  const forcedKey = forcedLayerMode || focusSubRegion ? `${forcedLayerMode ?? ""}:${focusSubRegion ?? ""}` : null;
  if (prevForcedKey !== forcedKey) {
    setPrevForcedKey(forcedKey);
    setUserOverrodeLayer(false);
    if (forcedKey) setUserAngle(null);
  }
  const [searchQuery, setSearchQuery] = useState("");
  const [internalSubRegion, setInternalSubRegion] = useState<SubRegionId | null>(null);
  const [internalSide, setInternalSide] = useState<Side>("Center");
  const [literacyOpen, setLiteracyOpen] = useState(false);
  const [mobileHint, setMobileHint] = useState<{ text: string; visible: boolean } | null>(null);
  const hintFadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voice = useReadAloud(activeLang);

  useEffect(() => {
    return () => {
      if (hintFadeTimerRef.current) clearTimeout(hintFadeTimerRef.current);
      if (hintClearTimerRef.current) clearTimeout(hintClearTimerRef.current);
    };
  }, []);

  /** Briefly surfaces the pressed control's label in the stage safe zone on phone screens (< sm). */
  function announceMobileHint(label: string) {
    if (hintFadeTimerRef.current) clearTimeout(hintFadeTimerRef.current);
    if (hintClearTimerRef.current) clearTimeout(hintClearTimerRef.current);
    setMobileHint({ text: label, visible: true });
    hintFadeTimerRef.current = setTimeout(() => {
      setMobileHint((prev) => (prev ? { ...prev, visible: false } : null));
    }, 1800);
    hintClearTimerRef.current = setTimeout(() => {
      setMobileHint(null);
    }, 2100);
  }

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
      setLiteracyOpen(false);
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
    setLiteracyOpen(false);
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

  // An inner organ sits behind muscle and ribs: under the skin view it would not show at all, so
  // the body opens to the organs for it. A layer picked by hand wins until the spot changes.
  const autoOrganLayer: LayerModeId | null = !effectiveSubRegion
    ? null
    : SPINE_SUB_REGIONS.has(effectiveSubRegion)
      ? "skeletal"
      : SUB_REGION_INFO[effectiveSubRegion]?.tissue === "Organ" && !SURFACE_ORGANS.has(effectiveSubRegion)
        ? "organs"
        : null;
  const [prevLayerSpot, setPrevLayerSpot] = useState<SubRegionId | null>(effectiveSubRegion);
  if (prevLayerSpot !== effectiveSubRegion) {
    setPrevLayerSpot(effectiveSubRegion);
    setUserOverrodeLayer(false);
  }
  const effectiveLayerMode: LayerModeId = userOverrodeLayer
    ? layerMode
    : (forcedLayerMode ?? autoOrganLayer ?? layerMode);

  const hudRaw = effectiveSubRegion ? SUB_REGION_INFO[effectiveSubRegion] : null;
  const hudLocalized = effectiveSubRegion ? getLocalizedSubRegion(effectiveSubRegion, activeLang) : null;
  const hudSideLabel =
    hudRaw?.bilateral && effectiveSide !== "Center"
      ? `, ${effectiveSide === "Left" ? t.left : t.right}`
      : "";
  const referredLabels = useMemo(() => {
    if (!effectiveSubRegion) return [];
    return (REFERRED_PAIN_BY_SUB_REGION[effectiveSubRegion] ?? [])
      .filter((id) => activeBodyProfile === "female" || !FEMALE_ONLY_SUB_REGIONS.has(id))
      .map((id) => {
        const raw = getLocalizedSubRegion(id, activeLang).label;
        const secondUpper =
          raw.length > 1 && raw[1] === raw[1].toUpperCase() && raw[1] !== raw[1].toLowerCase();
        return secondUpper ? raw : raw.charAt(0).toLowerCase() + raw.slice(1);
      });
  }, [effectiveSubRegion, activeBodyProfile, activeLang]);

  // Panel: Escape or outside click closes, focus moves to search input on open and back to opener on close.
  useEffect(() => {
    if (!panelOpen) return;
    panelRef.current?.querySelector<HTMLElement>("input, button")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPanelOpen(false);
        openerRef.current?.focus();
      }
    };
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target) || openerRef.current?.contains(target)) return;
      setPanelOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [panelOpen]);

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

  /** A choice made in the options panel is the end of that visit: close it and hand focus back. */
  const closePanel = () => {
    setPanelOpen(false);
    openerRef.current?.focus({ preventScroll: true });
  };

  const sectionTitle = "mb-2 text-sm font-semibold text-foreground";

  const renderLiteracyCard = (variant: "floating" | "stacked") => {
    if (!hudRaw || !hudLocalized) return null;
    const speechParts = [
      `${hudLocalized.label}${hudSideLabel}`,
      hudLocalized.summary,
      hudLocalized.functionDescription,
      hudLocalized.clinicalNotes,
    ];
    return (
      <div
        className={
          variant === "floating"
            ? `hidden sm:block pointer-events-auto absolute left-3 top-3 z-30 rounded-xl border border-border/90 bg-card/95 p-3 shadow-sm backdrop-blur-md ${
                literacyOpen ? "w-[min(20.5rem,calc(100%-5.5rem))]" : "w-fit max-w-[min(20.5rem,calc(100%-5.5rem))]"
              }`
            : "sm:hidden mt-2.5 rounded-xl border border-border bg-card p-3.5 shadow-xs"
        }
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-snug text-foreground">
              {hudLocalized.label}
              {hudSideLabel}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {hudLocalized.tissueLabel}
            </p>
          </div>
          {voice.available && (
            <button
              type="button"
              onClick={() => (voice.speaking ? voice.stop() : voice.speak(speechParts))}
              aria-label={`${voice.speaking ? t.stopListen : t.listen}: ${hudLocalized.label}`}
              aria-pressed={voice.speaking}
              className={`inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border px-2 text-xs font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                voice.speaking
                  ? "border-sapphire bg-sapphire-soft text-sapphire"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {voice.speaking ? (
                <StopListenIcon className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <ListenIcon className="h-3.5 w-3.5 shrink-0 text-sapphire" />
              )}
              <span>{voice.speaking ? t.stopListen : t.listen}</span>
            </button>
          )}
        </div>

        {/* On the stage the card starts as a name tag so it does not cover the body. */}
        {(variant === "stacked" || literacyOpen) && (
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {hudLocalized.summary}
          </p>
        )}

        <button
          type="button"
          aria-expanded={literacyOpen}
          onClick={() => setLiteracyOpen((v) => !v)}
          className="mt-1.5 inline-flex min-h-7 items-center gap-1 rounded-md text-xs font-semibold text-sapphire underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
        >
          <span>{literacyOpen ? t.hideWhy : t.whyHurt}</span>
        </button>

        {literacyOpen && (
          <div className="mt-2 space-y-2 border-t border-border/80 pt-2 text-xs leading-relaxed text-foreground">
            <p>
              <span className="font-semibold text-foreground">{t.whatItDoes}: </span>
              <span className="text-muted-foreground">{hudLocalized.functionDescription}</span>
            </p>
            <p className="text-muted-foreground">{hudLocalized.clinicalNotes}</p>
            {referredLabels.length > 0 && (
              <p className="border-l-2 border-border pl-2.5 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{t.referredTo}: </span>
                <span>{referredLabels.join(", ")}.</span>
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

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
        <>
          <div className="relative isolate">
            <div ref={stageRef} className={`relative isolate overflow-hidden bg-surface-subtle ${stageClassName ?? "h-[460px]"}`}>
            {hudRaw && hudLocalized ? (
              <>
                {/* Mobile compact label pill inside stage; full Body Literacy Card renders directly below */}
                <div
                  aria-hidden="true"
                  className="sm:hidden pointer-events-none absolute left-2.5 top-2.5 z-30 max-w-[calc(100%-9.5rem)] rounded-lg border border-border/90 bg-card/92 px-2.5 py-1.5 text-xs font-semibold leading-snug text-foreground shadow-xs backdrop-blur-md"
                >
                  {hudLocalized.label}
                  {hudSideLabel}
                </div>
                {renderLiteracyCard("floating")}
              </>
            ) : selectionLabel ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-3 z-30 max-w-[calc(100%-11rem)] rounded-lg border border-border bg-card/90 px-3 py-1.5 text-sm font-semibold leading-snug text-foreground shadow-sm backdrop-blur-md"
              >
                {selectionLabel}
              </div>
            ) : null}

            {showTools && (
              <div
                className={`absolute right-2.5 top-2.5 z-30 items-center gap-1.5 ${controlsClassName ?? "flex"}`}
              >
                <button
                  ref={openerRef}
                  type="button"
                  aria-expanded={panelOpen}
                  aria-controls={panelId}
                  aria-label={t.open}
                  title={t.open}
                  onClick={() => {
                    const nextOpen = !panelOpen;
                    setPanelOpen(nextOpen);
                    if (nextOpen) announceMobileHint(t.open);
                  }}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border/90 bg-card/95 px-2.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-md transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
                >
                  <SearchIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <SlidersIcon className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            )}

            {mobileHint && (
              <div
                role="status"
                aria-live="polite"
                className={`sm:hidden pointer-events-none absolute bottom-2.5 left-3 z-30 max-w-[calc(100%-1.5rem)] transition-all duration-200 ease-out motion-reduce:transition-none ${
                  mobileHint.visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                }`}
              >
                <span className="inline-block max-w-full truncate rounded-md border border-border/90 bg-card/95 px-2.5 py-1 text-xs font-semibold text-foreground shadow-xs backdrop-blur-md">
                  {mobileHint.text}
                </span>
              </div>
            )}

            {showTools && panelOpen && (
              <div
                ref={panelRef}
                id={panelId}
                role="dialog"
                aria-label={t.options}
                className="hc-sheet absolute right-2.5 top-14 z-40 w-[min(20.5rem,calc(100%-1.25rem))] max-h-[calc(100%-4.25rem)] overflow-y-auto rounded-xl border border-border bg-card p-3.5 shadow-lg"
              >
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{t.options}</p>
                  <button
                    type="button"
                    aria-label={t.close}
                    onClick={() => {
                      setPanelOpen(false);
                      openerRef.current?.focus();
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative">
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
                      className="min-h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-sapphire focus:outline-none"
                    />
                  </div>
                  {searchQuery.trim().length >= 2 && (
                    <ul className="mt-2 divide-y divide-border overflow-hidden rounded-lg border border-border">
                      {searchResults.length === 0 ? (
                        <li className="px-3 py-2 text-xs text-muted-foreground">{t.noResults}</li>
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
                              className="flex min-h-10 w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sapphire"
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

                <div role="group" aria-label={t.bodyType} className="mt-3">
                  <p className={sectionTitle}>{t.bodyType}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: "general", label: t.bodyGeneral, Icon: WholeBodyIcon },
                        { id: "female", label: t.bodyFemale, Icon: FemaleBodyIcon },
                      ] as const
                    ).map(({ id, label, Icon }) => {
                      const active = activeBodyProfile === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => {
                            setBodyProfile(id);
                            closePanel();
                          }}
                          className={`flex min-h-11 items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm font-medium leading-tight transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                            active
                              ? "border-sapphire bg-sapphire-soft/50 text-foreground shadow-[inset_0_0_0_1px_var(--color-sapphire)]"
                              : "border-border bg-card text-foreground hover:bg-muted"
                          }`}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div role="group" aria-label={t.layer} className="mt-3">
                  <p className={sectionTitle}>{t.layer}</p>
                  <div className="grid grid-cols-2 gap-2">
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
                            closePanel();
                          }}
                          className={`flex min-h-11 items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm font-medium leading-tight transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                            active
                              ? "border-sapphire bg-sapphire-soft/50 text-foreground shadow-[inset_0_0_0_1px_var(--color-sapphire)]"
                              : "border-border bg-card text-foreground hover:bg-muted"
                          }`}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span>{t.layers[id]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div role="group" aria-label={t.camera} className="mt-3">
                  <p className={sectionTitle}>{t.camera}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {cameraButton(t.zoomOut, ZoomOutIcon, "zoomOut")}
                    {cameraButton(t.zoomIn, ZoomInIcon, "zoomIn")}
                    {cameraButton(t.resetView, ResetViewIcon, "resetCamera")}
                  </div>
                </div>
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
                  className="pointer-events-none absolute z-20 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sapphire ring-2 ring-white shadow-xs [[data-anchor-active=false]_&]:hidden"
                />
              )}
            </AnatomicalViewport3D>
            </div>

            {showTools && (
              <div
                role="toolbar"
                aria-label={`${t.views}, ${t.layer}`}
                className="mt-2 rounded-xl border border-border/90 bg-card/95 p-1 shadow-xs backdrop-blur-md sm:absolute sm:inset-x-2.5 sm:bottom-2.5 sm:z-30 sm:mx-auto sm:mt-0 sm:w-fit sm:max-w-[calc(100%-1.25rem)] sm:shadow-sm"
              >
                {/* Phone (< sm): icon-only buttons with transient safe-zone label on press; Desktop (sm+): icon + text. */}
                <div className="flex flex-nowrap items-center justify-center gap-0.5 sm:flex-wrap sm:gap-1">
                  <button
                    type="button"
                    aria-label={t.turnLeft}
                    title={t.turnLeft}
                    onClick={() => {
                      cameraRef.current?.rotateLeft();
                      announceMobileHint(t.turnLeft);
                    }}
                    className="lg:hidden inline-flex h-9 max-w-9 flex-1 sm:h-8 sm:w-8 sm:max-w-none sm:flex-initial shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
                  >
                    <TurnLeftIcon className="h-4 w-4 shrink-0" />
                  </button>
                  {(["front", "back"] as const).map((preset) => {
                    const active = !freeView && viewAngle === preset;
                    const label = preset === "front" ? dict.ui.viewer3D.front : dict.ui.viewer3D.back;
                    const Icon = preset === "front" ? FrontViewIcon : BackViewIcon;
                    return (
                      <button
                        key={preset}
                        type="button"
                        aria-label={label}
                        title={label}
                        aria-pressed={active}
                        onClick={() => {
                          setUserAngle(preset);
                          setFreeView(false);
                          setViewRequest((n) => n + 1);
                          announceMobileHint(label);
                        }}
                        className={`inline-flex h-9 max-w-9 flex-1 justify-center items-center gap-1 rounded-md px-0 text-xs font-semibold whitespace-nowrap transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire sm:h-auto sm:min-h-8 sm:max-w-none sm:flex-initial sm:px-2 ${
                          active
                            ? "bg-sapphire-soft text-sapphire"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    aria-label={t.turnRight}
                    title={t.turnRight}
                    onClick={() => {
                      cameraRef.current?.rotateRight();
                      announceMobileHint(t.turnRight);
                    }}
                    className="lg:hidden inline-flex h-9 max-w-9 flex-1 sm:h-8 sm:w-8 sm:max-w-none sm:flex-initial shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
                  >
                    <TurnRightIcon className="h-4 w-4 shrink-0" />
                  </button>

                  <span aria-hidden="true" className="mx-0.5 h-4 w-px shrink-0 bg-border" />

                  {LAYER_ORDER.map((id) => {
                    const active = effectiveLayerMode === id;
                    const label = t.layers[id];
                    const Icon = LAYER_ICON[id];
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-label={label}
                        title={label}
                        aria-pressed={active}
                        onClick={() => {
                          setUserOverrodeLayer(true);
                          setLayerMode(id);
                          announceMobileHint(label);
                        }}
                        className={`inline-flex h-9 max-w-9 flex-1 justify-center items-center gap-1 rounded-md px-0 text-xs font-semibold whitespace-nowrap transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire sm:h-auto sm:min-h-8 sm:max-w-none sm:flex-initial sm:px-2 ${
                          active
                            ? "bg-sapphire-soft text-sapphire"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {renderLiteracyCard("stacked")}
        </>
      )}

      {showTools && bodyShown && (
        <p className={`mt-3 text-sm leading-snug text-muted-foreground ${toolsClassName}`}>
          {dict.ui.viewer3D.tip}
        </p>
      )}
    </div>
  );
}
