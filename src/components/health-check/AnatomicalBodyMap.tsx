"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { ArrowLeftIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { ListenButton } from "@/components/ui/ListenButton";
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
  FullScreenIcon,
  MusclesIcon,
  OrgansIcon,
  ResetViewIcon,
  SkinIcon,
  SlidersIcon,
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
function subscribeDesktopLayout(onChange: () => void) {
  const mql = window.matchMedia("(min-width: 1024px)");
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}
function readDesktopLayout() {
  return window.matchMedia("(min-width: 1024px)").matches;
}
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
  /** Tells the parent when the body fills the screen, so a tap there selects without moving on. */
  onFullScreenChange?: (fullScreen: boolean) => void;
  /** "Save selection" in full screen: the parent moves on with the chosen area. */
  onConfirmSelection?: () => void;
  /** Driven visceral X-ray mode on desktop when a visceral symptom is active. */
  forcedLayerMode?: LayerModeId | null;
  /** Driven sub-region focus on desktop when a visceral symptom maps to an internal organ. */
  focusSubRegion?: SubRegionId | null;
  focusSide?: Side;
  lang?: Lang;
  compact?: boolean;
  /** Suppress the extra mobile literacy block below the stage when an Assistant step card docks directly beneath it. */
  hideMobileLiteracyCard?: boolean;
  /** When true (phones in List mode), render nothing and avoid mounting AnatomicalViewport3D or fetching 3D assets. */
  deferred?: boolean;
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
    moveUp: string;
    moveDown: string;
    resetView: string;
    close: string;
    liteNote: string;
    liteLoad: string;
    options: string;
    layer: string;
    inside: string;
    turnBody: string;
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
    dismissInfo: string;
    whatItDoes: string;
    referredTo: string;
  }
> = {
  ru: {
"moveUp": "Выше",
"moveDown": "Ниже",
"listen": "Слушать",
"stopListen": "Стоп",

"left": "Слева",
"right": "Справа",
"whyHurt": "Почему здесь может болеть?",
"hideWhy": "Скрыть объяснение",
"dismissInfo": "Закрыть сведения",
"whatItDoes": "Для чего это нужно",
"referredTo": "Боль может отдавать",









"bodyType": "Модель тела",
"bodyGeneral": "Мужская",
"bodyFemale": "Женская",

    views: "Посмотреть",
    open: "Опции",
    camera: "Камера",
    zoomIn: "Увеличить масштаб",
    zoomOut: "Уменьшить масштаб",
    turnLeft: "Поверните налево",
    turnRight: "Поверните направо",
    resetView: "Начальный вид",
    close: "Закрыть параметры",
    liteNote: "3D-тело отключено для сохранения данных. Выберите регион из списка.",
    liteLoad: "Показать 3D-тело",
    options: "Варианты модели",
    layer: "Что показать",
    inside: "Внутри",
    turnBody: "Повернуть тело",
    layers: {
"skeletal": "Кости",


 hybrid: "Все тело", muscular: "Мышцы", organs: "Органы", surface: "Только кожа" },
    search: "Найдите часть тела",
    searchPlaceholder: "например сердце, колено",
    noResults: "Ничего не найдено. Попробуйте другое слово.",


  },

  ro: {
    views: "Unghi",
    bodyType: "Anatomie afișată",
    bodyGeneral: "Masculină",
    bodyFemale: "Feminină",
    open: "Caută și opțiuni",
    camera: "Apropiere",
    zoomIn: "Apropie",
    zoomOut: "Depărtează",
    turnLeft: "Rotește la stânga",
    turnRight: "Rotește la dreapta",
    moveUp: "Mută în sus",
    moveDown: "Mută în jos",
    resetView: "Vedere inițială",
    close: "Închide opțiunile",
    liteNote: "Corpul 3D e oprit ca să economisești date. Alege zona din listă.",
    liteLoad: "Arată corpul 3D",
    options: "Caută și opțiuni model",
    layer: "Ce se vede",
    inside: "Interior",
    turnBody: "Rotește corpul",
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
    dismissInfo: "Închide explicația",
    whatItDoes: "Ce face în corp",
    referredTo: "Durerea se poate simți și în",
  },
  en: {
    views: "View",
    bodyType: "Body model",
    bodyGeneral: "Male",
    bodyFemale: "Female",
    open: "Search and options",
    camera: "Zoom",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    turnLeft: "Turn left",
    turnRight: "Turn right",
    moveUp: "Move up",
    moveDown: "Move down",
    resetView: "Starting view",
    close: "Close options",
    liteNote: "The 3D body is off to save data. Choose the area from the list.",
    liteLoad: "Show the 3D body",
    options: "Search and model options",
    layer: "What to show",
    inside: "Inside",
    turnBody: "Turn the body",
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
    dismissInfo: "Close this explanation",
    whatItDoes: "What it does",
    referredTo: "Pain can also travel to",
  },
  sq: {
    views: "Pamja",
    bodyType: "Modeli i trupit",
    bodyGeneral: "Mashkullor",
    bodyFemale: "Femëror",
    open: "Kërko dhe opsione",
    camera: "Zmadhimi",
    zoomIn: "Afro",
    zoomOut: "Largo",
    turnLeft: "Rrotullo majtas",
    turnRight: "Rrotullo djathtas",
    moveUp: "Lëviz lart",
    moveDown: "Lëviz poshtë",
    resetView: "Pamja fillestare",
    close: "Mbyll opsionet",
    liteNote: "Trupi 3D është i fikur për të kursyer të dhëna. Zgjidh zonën nga lista.",
    liteLoad: "Shfaq trupin 3D",
    options: "Kërko dhe opsione të modelit",
    layer: "Çfarë shfaqet",
    inside: "Brenda",
    turnBody: "Rrotullo trupin",
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
    dismissInfo: "Mbyll shpjegimin",
    whatItDoes: "Çfarë bën në trup",
    referredTo: "Dhimbja mund të ndihet edhe në",
  },
  it: {
    views: "Vista",
    bodyType: "Modello del corpo",
    bodyGeneral: "Maschile",
    bodyFemale: "Femminile",
    open: "Cerca e opzioni",
    camera: "Zoom",
    zoomIn: "Avvicina",
    zoomOut: "Allontana",
    turnLeft: "Gira a sinistra",
    turnRight: "Gira a destra",
    moveUp: "Sposta in alto",
    moveDown: "Sposta in basso",
    resetView: "Vista iniziale",
    close: "Chiudi opzioni",
    liteNote: "Il corpo 3D è spento per risparmiare dati. Scegli la zona dall'elenco.",
    liteLoad: "Mostra il corpo 3D",
    options: "Cerca e opzioni del modello",
    layer: "Cosa mostrare",
    inside: "Dentro",
    turnBody: "Gira il corpo",
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
    dismissInfo: "Chiudi la spiegazione",
    whatItDoes: "Cosa fa nel corpo",
    referredTo: "Il dolore può irradiarsi anche a",
  },
  hr: {
    views: "Pogled",
    bodyType: "Model tijela",
    bodyGeneral: "Muški",
    bodyFemale: "Ženski",
    open: "Pretraži i opcije",
    camera: "Zumiranje",
    zoomIn: "Približi",
    zoomOut: "Udalji",
    turnLeft: "Okreni ulijevo",
    turnRight: "Okreni udesno",
    moveUp: "Pomakni gore",
    moveDown: "Pomakni dolje",
    resetView: "Početni prikaz",
    close: "Zatvori opcije",
    liteNote: "3D prikaz tijela je isključen radi uštede podatkovnog prometa. Odaberi područje s popisa.",
    liteLoad: "Prikaži 3D tijelo",
    options: "Pretraži i opcije modela",
    layer: "Što prikazati",
    inside: "Unutra",
    turnBody: "Okreni tijelo",
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
    dismissInfo: "Zatvori objašnjenje",
    whatItDoes: "Uloga u tijelu",
    referredTo: "Bol se može osjetiti i u",
  },
  rom: {
    views: "Dikhimos",
    bodyType: "Modelo e truposko",
    bodyGeneral: "Murshikano",
    bodyFemale: "Dzhuvlikano",
    open: "Rode thaj opcie",
    camera: "Kamera",
    zoomIn: "An maj pasha",
    zoomOut: "Ingar maj dur",
    turnLeft: "Ambold pe stingo",
    turnRight: "Ambold pe chacho",
    moveUp: "Ingar opre",
    moveDown: "Ingar tele",
    resetView: "Angluno dikhimos",
    close: "Phandav le opcie",
    liteNote: "O 3D trupo si mudardo te arakhes interneteske date. Alosar o than katar i lista.",
    liteLoad: "Sikav o 3D trupo",
    options: "Rode thaj opcie e modeloske",
    layer: "So dikljol",
    inside: "Andre",
    turnBody: "Bolde o trupo",
    layers: { surface: "Morti", muscular: "Muskulura", skeletal: "Kokala", organs: "Organura", hybrid: "Sasto trupo" },
    search: "Rode jekh kotor e truposko",
    searchPlaceholder: "misal chuchi, ilo, chang",
    noResults: "Na arakhlam khanchi. Zumav aver vorba.",
    left: "stingo",
    right: "chacho",
    listen: "Ashun",
    stopListen: "Achav",
    whyHurt: "Sostar shaj te dukhal?",
    hideWhy: "Garav",
    dismissInfo: "Phandav",
    whatItDoes: "So kerel and-o trupo",
    referredTo: "I dukh shaj te djal vi ko",
  },
};

export const BODY_MAP_COPY = COPY;

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

type PadMove = "up" | "down" | "left" | "right";

/**
 * Fixed direction pad inside the 3D stage: up/down glide along the body, left/right turn it, the
 * middle goes back to the starting view. Holding a button keeps gliding at a calm pace.
 */
function DirectionPad({
  labels,
  onMove,
  onReset,
  onAnnounce,
  size = "desktop",
  className = "",
}: {
  labels: Record<PadMove | "reset", string>;
  onMove: (move: PadMove) => void;
  onReset: () => void;
  onAnnounce?: (label: string) => void;
  size?: "desktop" | "panel";
  className?: string;
}) {
  const repeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => {
    if (repeatRef.current) clearInterval(repeatRef.current);
    repeatRef.current = null;
  };
  useEffect(() => stop, []);

  const isPanel = size === "panel";
  const btn = isPanel
    ? "relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border-control bg-card text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted active:bg-sapphire-soft active:text-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-none select-none"
    : "relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted hover:text-foreground active:bg-sapphire-soft active:text-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-none select-none";
  const iconSize = isPanel ? "h-5 w-5" : "h-4 w-4";

  const moveButton = (move: PadMove, Icon: typeof ChevronLeftIcon, iconClass: string, area: string) => (
    <button
      type="button"
      aria-label={labels[move]}
      style={{ gridArea: area }}
      className={btn}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // Pointer already gone: holding still works until pointerup/leave.
        }
        onMove(move);
        onAnnounce?.(labels[move]);
        stop();
        repeatRef.current = setInterval(() => onMove(move), 520);
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
      // Keyboard (Enter/Space) arrives as a click with no pointer.
      onClick={(e) => {
        if (e.detail === 0) onMove(move);
      }}
    >
      <Icon className={`${iconSize} ${iconClass}`} aria-hidden="true" />
    </button>
  );

  return (
    <div
      role="group"
      aria-label={`${labels.up}, ${labels.down}, ${labels.left}, ${labels.right}`}
      className={
        isPanel
          ? `inline-grid w-fit grid-cols-3 grid-rows-3 gap-2 rounded-2xl border border-border bg-muted/40 p-1.5 [grid-template-areas:'._up_.'_'left_mid_right'_'._down_.'] ${className}`
          : `grid grid-cols-3 grid-rows-3 rounded-2xl border border-border/90 bg-card/92 p-0.5 shadow-xs backdrop-blur-md [grid-template-areas:'._up_.'_'left_mid_right'_'._down_.'] ${className}`
      }
    >
      {moveButton("up", ChevronDownIcon, "rotate-180", "up")}
      {moveButton("left", ChevronLeftIcon, "", "left")}
      <button
        type="button"
        aria-label={labels.reset}
        style={{ gridArea: "mid" }}
        className={btn}
        onClick={() => {
          onReset();
          onAnnounce?.(labels.reset);
        }}
      >
        <ResetViewIcon className={isPanel ? "h-4.5 w-4.5" : "h-3.5 w-3.5"} aria-hidden="true" />
      </button>
      {moveButton("right", ChevronRightIcon, "", "right")}
      {moveButton("down", ChevronDownIcon, "", "down")}
    </div>
  );
}

function LayerSelectorRows({
  activeLayer,
  labels,
  onSelect,
}: {
  activeLayer: LayerModeId;
  labels: Record<LayerModeId, string>;
  onSelect: (id: LayerModeId) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {LAYER_ORDER.map((id) => {
        const active = activeLayer === id;
        const Icon = LAYER_ICON[id];
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(id)}
            className={`flex min-h-11 w-full items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 text-left text-body font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              active
                ? "border-sapphire bg-sapphire-soft/50 text-foreground shadow-[inset_0_0_0_1px_var(--color-sapphire)]"
                : "border-border-control bg-card text-foreground hover:bg-muted"
            }`}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            <span>{labels[id]}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Full screen body: the label of the button that opens it and of the one that saves the choice.
 * Back uses the page's own back label. Romani has no reviewed wording for "save", so it falls
 * back to the page's "next" label there.
 */
export const FULL_SCREEN_COPY: Record<Lang, { open: string; save: string | null }> = {
  ro: { open: "Ecran complet", save: "Salvează selecția" },
  en: { open: "Full screen", save: "Save selection" },
  sq: { open: "Ekran i plotë", save: "Ruaj zgjedhjen" },
  it: { open: "Schermo intero", save: "Salva la selezione" },
  hr: { open: "Cijeli zaslon", save: "Spremi odabir" },
  rom: { open: "Baro ekrano", save: null },
  ru: { open: "На весь экран", save: "Сохранить выбор" },
};

function StageOverlayPortal({ portal, children }: { portal: boolean; children: ReactNode }) {
  if (portal && typeof document !== "undefined") return createPortal(children, document.body);
  return <>{children}</>;
}

/** Closes a floating stage panel on Escape or outside pointer down, restoring opener focus. */
function useDismissiblePanel(
  open: boolean,
  panelRef: RefObject<HTMLDivElement | null>,
  openerRef: RefObject<HTMLButtonElement | null>,
  onDismiss: () => void,
) {
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("input, button")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDismiss();
        openerRef.current?.focus();
      }
    };
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target) || openerRef.current?.contains(target)) return;
      onDismiss();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open, panelRef, openerRef, onDismiss]);
}

export function AnatomicalBodyMap({
  deferred = false,
  ...props
}: AnatomicalBodyMapProps) {
  if (deferred) return null;
  return <AnatomicalBodyMapContent {...props} />;
}

function AnatomicalBodyMapContent({
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
  onFullScreenChange,
  onConfirmSelection,
  forcedLayerMode = null,
  focusSubRegion = null,
  focusSide,
  lang,
  compact = false,
  hideMobileLiteracyCard = false,
}: Omit<AnatomicalBodyMapProps, "deferred">) {
  const activeLang = useSafeLanguage(lang);
  const dict = getHealthCheckTranslations(activeLang);
  const t = COPY[activeLang] ?? COPY[DEFAULT_LANG];
  const searchId = useId();
  const panelId = useId();
  const layerMenuId = useId();
  const cameraRef = useRef<ViewportCameraApi | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const layerPanelRef = useRef<HTMLDivElement>(null);
  const insideOpenerRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [layerOpen, setLayerOpen] = useState(false);
  const isDesktopLayout = useSyncExternalStore(subscribeDesktopLayout, readDesktopLayout, () => true);
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
  /** The body opens on the muscles, like an anatomy atlas; skin, bones and organs are one tap away. */
  const [layerMode, setLayerMode] = useState<LayerModeId>("muscular");
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
  /** The spot whose explanation the reader closed. Picking another spot brings the card back. */
  const [dismissedSpot, setDismissedSpot] = useState<SubRegionId | null>(null);
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

  // A reset (no area) puts the body back to its starting view; a prop-driven spot change releases any pinned tap angle.
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
  const [prevPropSubRegion, setPrevPropSubRegion] = useState(selectedSubRegion);
  if (prevPropSubRegion !== selectedSubRegion) {
    setPrevPropSubRegion(selectedSubRegion);
    setUserAngle(null);
    setFreeView(false);
    setLiteracyOpen(false);
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

  const dismissPanel = useCallback(() => setPanelOpen(false), []);
  const dismissLayerMenu = useCallback(() => setLayerOpen(false), []);
  useDismissiblePanel(panelOpen, panelRef, openerRef, dismissPanel);
  useDismissiblePanel(layerOpen, layerPanelRef, insideOpenerRef, dismissLayerMenu);

  // Full screen: the body fills the phone, with the turn, move and zoom buttons laid over it and
  // Back and Save selection always in view. A CSS full screen (not the browser's), so it also works on iPhones.
  const [fullScreen, setFullScreen] = useState(false);
  const fullScreenCopy = FULL_SCREEN_COPY[activeLang] ?? FULL_SCREEN_COPY[DEFAULT_LANG];
  const onFullScreenChangeRef = useRef(onFullScreenChange);
  useEffect(() => {
    onFullScreenChangeRef.current = onFullScreenChange;
  });
  useEffect(() => {
    onFullScreenChangeRef.current?.(fullScreen);
    // The canvas follows its box; nudge anything that listens to the window instead.
    const raf = window.requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    if (!fullScreen) return () => window.cancelAnimationFrame(raf);
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullScreen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(raf);
      root.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [fullScreen]);

  const handlePadMove = (move: PadMove) => {
    const cam = cameraRef.current;
    if (!cam) return;
    if (move === "up") cam.panUp();
    else if (move === "down") cam.panDown();
    else {
      setFreeView(true);
      if (move === "left") cam.rotateLeft();
      else cam.rotateRight();
    }
  };
  const handlePadReset = () => {
    setUserAngle(null);
    setFreeView(false);
    cameraRef.current?.resetCamera();
  };

  const cameraButton = (label: string, Icon: typeof ZoomInIcon, action: keyof ViewportCameraApi) => (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => cameraRef.current?.[action]()}
      className="flex min-h-11 items-center justify-center rounded-xl border border-border-control bg-card text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted active:bg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon className="h-5 w-5" />
    </button>
  );

  /** A choice made in the options panel is the end of that visit: close it and hand focus back. */
  const closePanel = () => {
    setPanelOpen(false);
    openerRef.current?.focus({ preventScroll: true });
  };

  const closeLayerMenu = () => {
    setLayerOpen(false);
    insideOpenerRef.current?.focus({ preventScroll: true });
  };

  /**
   * Phones: Front, Back, Inside (and zoom in full screen). Under the body on the page; in full screen
   * it sits in one column with the turn buttons above the Save bar.
   */
  const mobileViewBar =
    showTools && !isDesktopLayout ? (
      <div
        role="toolbar"
        aria-label={`${t.views}, ${t.camera}, ${t.layer}`}
        className={`z-30 mx-auto w-fit max-w-[calc(100%-0.5rem)] rounded-xl border border-border/90 bg-card/95 p-0.5 shadow-xs backdrop-blur-md sm:max-w-[calc(100%-1rem)] sm:p-1 ${
          // In full screen it sits in the column above the Save bar, under the turn buttons.
          fullScreen ? "pointer-events-auto relative" : "absolute inset-x-1 bottom-5 sm:inset-x-2"
        }`}
      >
        <div className="flex flex-wrap items-center justify-center gap-2">
          {(["front", "back"] as const).map((preset) => {
            const active = !freeView && viewAngle === preset;
            const label = preset === "front" ? dict.ui.viewer3D.front : dict.ui.viewer3D.back;
            return (
              <button
                key={preset}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setUserAngle(preset);
                  setFreeView(false);
                  setViewRequest((n) => n + 1);
                  announceMobileHint(label);
                }}
                className={`inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-3 text-body font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active
                    ? "bg-sapphire-soft text-sapphire"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}

          <button
            ref={insideOpenerRef}
            type="button"
            aria-expanded={layerOpen}
            aria-controls={layerMenuId}
            onClick={() => {
              setPanelOpen(false);
              setLayerOpen((open) => !open);
            }}
            className={`inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-3 text-body font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              layerOpen || effectiveLayerMode !== "surface"
                ? "bg-sapphire-soft text-sapphire"
                : "text-foreground/80 hover:bg-muted hover:text-foreground"
            }`}
          >
            {t.inside}
          </button>

          {fullScreen && (
            <>
          <button
            type="button"
            aria-label={t.zoomOut}
            title={t.zoomOut}
            onClick={() => {
              cameraRef.current?.zoomOut();
              announceMobileHint(t.zoomOut);
            }}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-foreground/80 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ZoomOutIcon className="h-5 w-5 shrink-0" />
          </button>
          <button
            type="button"
            aria-label={t.zoomIn}
            title={t.zoomIn}
            onClick={() => {
              cameraRef.current?.zoomIn();
              announceMobileHint(t.zoomIn);
            }}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-foreground/80 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ZoomInIcon className="h-5 w-5 shrink-0" />
          </button>
            </>
          )}
        </div>
      </div>
    ) : null;

  const sectionTitle = "mb-1.5 text-body font-semibold text-foreground";

  /**
   * Body Literacy Card. From lg it is a bar above the stage ("bar"), so it never covers the
   * body; below lg it sits under the stage ("stacked"). It starts as a name tag: "Why it may
   * hurt" opens the explanation, and the close button puts the card away for this spot.
   */
  const renderLiteracyCard = (variant: "bar" | "stacked") => {
    if (!hudRaw || !hudLocalized || dismissedSpot === effectiveSubRegion) return null;
    const speechParts = [
      `${hudLocalized.label}${hudSideLabel}`,
      hudLocalized.summary,
      hudLocalized.functionDescription,
      hudLocalized.clinicalNotes,
    ];
    const bar = variant === "bar";
    return (
      <div
        className={
          bar
            ? "hidden border-b border-border bg-card px-4 py-3 lg:block"
            : "lg:hidden mt-2.5 rounded-xl border border-border bg-card p-3.5 shadow-xs"
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-body font-semibold leading-snug text-foreground">
              {hudLocalized.label}
              {hudSideLabel}
            </p>
            <p className="mt-0.5 text-meta text-muted-foreground">
              {hudLocalized.tissueLabel}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
            <button
              type="button"
              aria-expanded={literacyOpen}
              onClick={() => setLiteracyOpen((v) => !v)}
              className="inline-flex h-8 max-w-full items-center gap-1 whitespace-nowrap rounded-lg px-2 text-body font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="min-w-0 truncate">{literacyOpen ? t.hideWhy : t.whyHurt}</span>
              <ChevronDownIcon
                className={`h-3.5 w-3.5 shrink-0 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none ${literacyOpen ? "rotate-180" : ""}`}
              />
            </button>
            {voice.available && (
              <ListenButton
                uiLang={activeLang}
                isPlaying={voice.speaking}
                onToggle={() => (voice.speaking ? voice.stop() : voice.speak(speechParts))}
                ariaLabel={`${voice.speaking ? t.stopListen : t.listen}: ${hudLocalized.label}`}
              />
            )}
            <button
              type="button"
              onClick={() => {
                voice.stop();
                setLiteracyOpen(false);
                setDismissedSpot(effectiveSubRegion);
              }}
              aria-label={`${t.dismissInfo}: ${hudLocalized.label}`}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {literacyOpen && (
          <div className="mt-2 max-w-(--measure-reading) space-y-2 border-t border-border/80 pt-2 text-meta text-foreground">
            <p className="text-muted-foreground">{hudLocalized.summary}</p>
            <p>
              <span className="font-semibold text-foreground">{t.whatItDoes}: </span>
              <span className="text-muted-foreground">{hudLocalized.functionDescription}</span>
            </p>
            <p className="text-muted-foreground">{hudLocalized.clinicalNotes}</p>
            {referredLabels.length > 0 && (
              <p className="text-meta text-muted-foreground">
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
        <p className="flex flex-wrap items-baseline gap-x-3 text-body text-muted-foreground">
          <span>{unavailable ?? t.liteNote}</span>
          {lite && !unavailable && (
            <button
              type="button"
              onClick={() => setForceBody(true)}
              className="inline-flex min-h-11 items-center whitespace-nowrap rounded-sm px-1 font-medium text-foreground underline underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:min-h-9"
            >
              {t.liteLoad}
            </button>
          )}
        </p>
      ) : (
        <>
          <div
            data-hc-fullscreen={fullScreen ? "" : undefined}
            className={fullScreen ? "fixed inset-0 z-[70] isolate flex flex-col bg-surface-subtle" : "relative isolate"}
          >
            {!fullScreen && renderLiteracyCard("bar")}
            <div
              ref={stageRef}
              data-hc-stage
              className={`relative isolate overflow-hidden bg-surface-subtle ${
                fullScreen ? "min-h-0 flex-1" : (stageClassName ?? "h-[460px]")
              }`}
            >
            {fullScreen && (
              <button
                type="button"
                onClick={() => setFullScreen(false)}
                className="absolute left-2.5 top-[max(0.625rem,env(safe-area-inset-top))] z-30 inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-xl border border-border-control bg-card/95 px-3 text-body font-semibold text-foreground shadow-xs backdrop-blur-md transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ArrowLeftIcon className="h-4 w-4 shrink-0" />
                <span>{dict.ui.backButton}</span>
              </button>
            )}
            {fullScreen ? null : hudRaw && hudLocalized ? (
              <>
                {/* Compact label pill inside the stage below lg; from lg the card is a bar above the stage. */}
                <div
                  aria-hidden="true"
                  className="lg:hidden pointer-events-none absolute left-2.5 top-2.5 z-30 max-w-[calc(100%-6.5rem)] rounded-xl border border-border/90 bg-card/92 px-2.5 py-1.5 text-meta font-semibold leading-snug text-foreground shadow-xs backdrop-blur-md"
                >
                  {hudLocalized.label}
                  {hudSideLabel}
                </div>
              </>
            ) : selectionLabel ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-2.5 top-2.5 z-30 max-w-[calc(100%-6.5rem)] rounded-xl border border-border bg-card/92 px-2.5 py-1.5 text-body font-semibold leading-snug text-foreground shadow-xs backdrop-blur-md lg:left-3 lg:top-3 lg:max-w-[calc(100%-11rem)] lg:px-3"
              >
                {selectionLabel}
              </div>
            ) : null}

            {showTools && !fullScreen && (
              <div
                // Whole buttons wrap onto a second row when the stage is narrow, so none is cut off.
                className={`absolute left-2.5 right-2.5 top-2.5 z-30 pointer-events-none flex-wrap items-center justify-end gap-1.5 [&>*]:pointer-events-auto ${controlsClassName ?? "flex"}`}
              >
                {/* One tap to a body that fills the screen, with every control laid over it. */}
                <button
                  type="button"
                  onClick={() => {
                    setPanelOpen(false);
                    setLayerOpen(false);
                    setFullScreen(true);
                  }}
                  className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-xl border border-border-control bg-card/95 px-3 text-body font-semibold text-foreground shadow-xs backdrop-blur-md transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <FullScreenIcon className="h-4 w-4 shrink-0 text-sapphire" />
                  <span>{fullScreenCopy.open}</span>
                </button>
                {/* Search and options is a desktop tool: on phones its controls sit on the body in full screen. */}
                <button
                  ref={openerRef}
                  hidden={!isDesktopLayout}
                  type="button"
                  aria-expanded={panelOpen}
                  aria-controls={panelId}
                  aria-label={t.open}
                  title={t.open}
                  onClick={() => {
                    setLayerOpen(false);
                    setPanelOpen((open) => !open);
                  }}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border/90 bg-card/95 px-3 text-body font-semibold text-foreground shadow-xs backdrop-blur-md transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <SearchIcon className="h-3.5 w-3.5 shrink-0 text-sapphire" />
                  <span className="whitespace-nowrap">{t.open}</span>
                  <SlidersIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </button>
              </div>
            )}

            {mobileHint && (
              <div
                role="status"
                aria-live="polite"
                className={`lg:hidden pointer-events-none absolute left-1/2 top-13 z-30 max-w-[calc(100%-2rem)] -translate-x-1/2 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
                  mobileHint.visible ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
                }`}
              >
                <span className="inline-block max-w-full truncate rounded-lg border border-border/90 bg-card/95 px-2.5 py-1 text-meta font-semibold text-foreground shadow-xs backdrop-blur-md">
                  {mobileHint.text}
                </span>
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

            {fullScreen && (
              // Always in view: what is selected, and one button that saves it and carries on.
              <div className="flex items-center justify-between gap-3 border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <p aria-live="polite" className="min-w-0 text-body font-semibold leading-snug text-foreground">
                  {hudLocalized ? `${hudLocalized.label}${hudSideLabel}` : (selectionLabel ?? "")}
                </p>
                <Button
                  type="button"
                  variant="action"
                  size="lg"
                  disabled={!selectedPart}
                  onClick={() => {
                    setFullScreen(false);
                    onConfirmSelection?.();
                  }}
                  className="shrink-0"
                >
                  {fullScreenCopy.save ?? dict.ui.nextButton}
                </Button>
              </div>
            )}

            {showTools && panelOpen && (
              <StageOverlayPortal portal={!isDesktopLayout}>
                <div
                  onClick={(e) => {
                    if (e.target === e.currentTarget) closePanel();
                  }}
                  className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-3 sm:items-center lg:pointer-events-none lg:static lg:inset-auto lg:z-auto lg:block lg:bg-transparent lg:p-0"
                >
                  <div
                    ref={panelRef}
                    id={panelId}
                    role="dialog"
                    aria-label={t.options}
                    className="hc-sheet pointer-events-auto w-full max-w-md max-h-[min(42rem,88dvh)] overflow-y-auto rounded-2xl border border-border bg-card p-3.5 shadow-xl sm:max-w-lg sm:p-4 lg:absolute lg:right-3 lg:top-13 lg:z-40 lg:w-[min(27.5rem,calc(100%-1.5rem))] lg:max-h-[calc(100%-3.75rem)] lg:p-3.5"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-body font-semibold text-foreground">{t.options}</p>
                      <button
                        type="button"
                        aria-label={t.close}
                        onClick={closePanel}
                        className="press-row -my-1.5 -mr-1.5 flex h-11 w-11 items-center justify-center rounded-xl text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                          className="field-focus min-h-11 w-full rounded-xl border border-border-control bg-card pl-9 pr-3 text-body text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                      </div>
                      {searchQuery.trim().length >= 2 && (
                        <ul className="popover-in mt-2 max-h-44 divide-y divide-border overflow-y-auto rounded-xl border border-border bg-card">
                          {searchResults.length === 0 ? (
                            <li className="px-3 py-2 text-body text-muted-foreground">{t.noResults}</li>
                          ) : (
                            searchResults.map((item, index) => (
                              <li
                                key={`${item.subRegion}-${item.side}`}
                                className="list-in"
                                style={{ "--i": index } as CSSProperties}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSelect3D(item.macroPart, item.subRegion, item.side);
                                    setSearchQuery("");
                                    setPanelOpen(false);
                                  }}
                                  className="press-row flex min-h-11 w-full items-center justify-between gap-2 whitespace-nowrap px-3 py-2 text-left text-body transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                                >
                                  <span className="min-w-0 truncate font-medium text-foreground">{item.label}</span>
                                  <span className="shrink-0 text-muted-foreground">{dict.bodyParts[item.macroPart].title}</span>
                                </button>
                              </li>
                            ))
                          )}
                        </ul>
                      )}
                    </div>

                    <div role="group" aria-label={t.bodyType} className="mt-2.5">
                      <p className={sectionTitle}>{t.bodyType}</p>
                      <div className="flex flex-wrap gap-2">
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
                              className={`flex min-h-11 flex-1 items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 text-left text-body font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                active
                                  ? "border-sapphire bg-sapphire-soft/50 text-foreground shadow-[inset_0_0_0_1px_var(--color-sapphire)]"
                                  : "border-border-control bg-card text-foreground hover:bg-muted"
                              }`}
                            >
                              <Icon className="h-5 w-5 shrink-0" />
                              <span>{label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div role="group" aria-label={t.layer} className="mt-2.5">
                      <p className={sectionTitle}>{t.layer}</p>
                      <LayerSelectorRows
                        activeLayer={effectiveLayerMode}
                        labels={t.layers}
                        onSelect={(id) => {
                          setUserOverrodeLayer(true);
                          setLayerMode(id);
                          announceMobileHint(t.layers[id]);
                          closePanel();
                        }}
                      />
                    </div>

                    <div role="group" aria-label={t.camera} className="mt-2.5">
                      <p className={sectionTitle}>{t.camera}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {cameraButton(t.zoomOut, ZoomOutIcon, "zoomOut")}
                        {cameraButton(t.zoomIn, ZoomInIcon, "zoomIn")}
                        {cameraButton(t.resetView, ResetViewIcon, "resetCamera")}
                      </div>
                    </div>

                    {!isDesktopLayout && (
                      <div role="group" aria-label={t.turnBody} className="mt-2.5">
                        <p className={sectionTitle}>{t.turnBody}</p>
                        <DirectionPad
                          size="panel"
                          labels={{ up: t.moveUp, down: t.moveDown, left: t.turnLeft, right: t.turnRight, reset: t.resetView }}
                          onMove={handlePadMove}
                          onReset={handlePadReset}
                          onAnnounce={announceMobileHint}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </StageOverlayPortal>
            )}

            {showTools && layerOpen && !isDesktopLayout && (
              <StageOverlayPortal portal>
                <div
                  onClick={(e) => {
                    if (e.target === e.currentTarget) closeLayerMenu();
                  }}
                  // Above the full screen body (z-70), and only lightly dimmed so the body stays in view.
                  className="fixed inset-0 z-[80] flex items-end justify-center bg-black/25 p-3 sm:items-center"
                >
                  <div
                    ref={layerPanelRef}
                    id={layerMenuId}
                    role="dialog"
                    aria-modal="true"
                    aria-label={t.layer}
                    className="hc-sheet pointer-events-auto w-full max-w-md max-h-[min(32rem,80dvh)] overflow-y-auto rounded-2xl border border-border bg-card p-3.5 shadow-xl sm:max-w-lg sm:p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-body font-semibold text-foreground">{t.layer}</p>
                      <button
                        type="button"
                        aria-label={t.close}
                        onClick={closeLayerMenu}
                        className="press-row -my-1.5 -mr-1.5 flex h-11 w-11 items-center justify-center rounded-xl text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <CloseIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <LayerSelectorRows
                      activeLayer={effectiveLayerMode}
                      labels={t.layers}
                      onSelect={(id) => {
                        setUserOverrodeLayer(true);
                        setLayerMode(id);
                        announceMobileHint(t.layers[id]);
                        closeLayerMenu();
                      }}
                    />
                  </div>
                </div>
              </StageOverlayPortal>
            )}

            {showTools && isDesktopLayout && (
              <DirectionPad
                size="desktop"
                className="hidden lg:grid absolute right-2.5 top-1/2 z-30 -translate-y-1/2 lg:right-3"
                labels={{ up: t.moveUp, down: t.moveDown, left: t.turnLeft, right: t.turnRight, reset: t.resetView }}
                onMove={handlePadMove}
                onReset={handlePadReset}
                onAnnounce={announceMobileHint}
              />
            )}

            {showTools && !isDesktopLayout && fullScreen && (
              // Full screen: the turn buttons stack above the view buttons, above the Save bar. One column,
              // so however many rows the view buttons take (large text), nothing covers anything else.
              <div className="pointer-events-none absolute inset-x-1 bottom-[5.75rem] z-30 flex flex-col items-center gap-2 sm:inset-x-2">
                <div role="group" aria-label={t.turnBody} className="pointer-events-auto mr-1.5 self-end">
                  <DirectionPad
                    size="panel"
                    className="grid rounded-2xl border border-border/90 bg-card/90 p-1.5 shadow-xs backdrop-blur-md"
                    labels={{ up: t.moveUp, down: t.moveDown, left: t.turnLeft, right: t.turnRight, reset: t.resetView }}
                    onMove={handlePadMove}
                    onReset={handlePadReset}
                    onAnnounce={announceMobileHint}
                  />
                </div>
                {mobileViewBar}
              </div>
            )}

            {!fullScreen && mobileViewBar}

            {showTools && isDesktopLayout && (
              <div
                role="toolbar"
                aria-label={`${t.views}, ${t.camera}, ${t.layer}`}
                className="absolute inset-x-2 bottom-3 z-30 mx-auto w-fit max-w-[calc(100%-1rem)] rounded-xl border border-border/90 bg-card/95 p-1 shadow-sm backdrop-blur-md"
              >
                <div className="flex flex-wrap items-center justify-center gap-1">
                  <div className="flex shrink-0 items-center gap-1">
                    {(["front", "back"] as const).map((preset) => {
                      const active = !freeView && viewAngle === preset;
                      const label = preset === "front" ? dict.ui.viewer3D.front : dict.ui.viewer3D.back;
                      const Icon = preset === "front" ? FrontViewIcon : BackViewIcon;
                      return (
                        <button
                          key={preset}
                          type="button"
                          aria-label={label}
                          aria-pressed={active}
                          onClick={() => {
                            setUserAngle(preset);
                            setFreeView(false);
                            setViewRequest((n) => n + 1);
                            announceMobileHint(label);
                          }}
                          className={`inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-body font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
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
                      onClick={() => {
                        cameraRef.current?.zoomOut();
                        announceMobileHint(t.zoomOut);
                      }}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground/80 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <ZoomOutIcon className="h-4 w-4 shrink-0" />
                    </button>
                    <button
                      type="button"
                      aria-label={t.zoomIn}
                      title={t.zoomIn}
                      onClick={() => {
                        cameraRef.current?.zoomIn();
                        announceMobileHint(t.zoomIn);
                      }}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground/80 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <ZoomInIcon className="h-4 w-4 shrink-0" />
                    </button>
                  </div>

                  <span aria-hidden="true" className="mx-0.5 hidden h-4 w-px shrink-0 bg-border sm:block" />

                  <div className="flex shrink-0 items-center gap-1">
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
                          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            active
                              ? "bg-sapphire-soft text-sapphire"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          {!hideMobileLiteracyCard && renderLiteracyCard("stacked")}
        </>
      )}

      {showTools && bodyShown && (
        <p className={`mt-3 text-body leading-snug text-muted-foreground ${toolsClassName}`}>
          {dict.ui.viewer3D.tip}
        </p>
      )}
    </div>
  );
}
