"use client";

import { useCallback, useId, useState, type ComponentType, type SVGProps } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, CloseIcon, StethoscopeIcon } from "@/components/ui/icons";
import {
  AbdomenRegionIcon,
  BackSpineRegionIcon,
  BonesIcon,
  ChestRegionIcon,
  FemaleBodyIcon,
  HeadNeckRegionIcon,
  LegsFeetRegionIcon,
  MusclesIcon,
  OrgansIcon,
  PelvisRegionIcon,
  WholeBodyIcon,
} from "@/components/health-check/ModelIcons";
import type { CameraViewPreset } from "@/components/health-check/AnatomicalViewport3D";
import type {
  BodyAnatomyProfile,
  LayerModeId,
  SubRegionId,
} from "@/components/health-check/anatomy-3d-data";
import type { BodyPartId } from "@/lib/i18n/health-check-translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { cn } from "@/lib/cn";
import {
  getTopicAnatomyConfig,
  getTopicAnatomyUiCopy,
  type HotspotIconKind,
  type TopicAnatomyConfig,
  type TopicAnatomyHotspot,
} from "./topic-anatomy-config";

// Dynamically imported strictly on demand when the reader opens 3D exploration.
// Initial learning guide loads mount zero WebGL code and fetch zero .bin or .glb assets.
const LazyHumanAtlasPreviewStage = dynamic(
  () =>
    import("@/components/health-check/HumanAtlasPreviewStage").then(
      (mod) => mod.HumanAtlasPreviewStage,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        aria-busy="true"
        className="flex h-[400px] w-full items-center justify-center rounded-2xl border border-border bg-surface-subtle/80 p-6 sm:h-[460px]"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            aria-hidden="true"
            className="h-10 w-10 rounded-xl border border-sapphire/25 bg-sapphire-soft/70 motion-safe:animate-pulse motion-reduce:animate-none"
          />
          <div className="h-3 w-44 rounded-sm bg-border/80 motion-safe:animate-pulse motion-reduce:animate-none" />
        </div>
      </div>
    ),
  },
);

type IconSvg = ComponentType<SVGProps<SVGSVGElement>>;

const HOTSPOT_ICONS: Record<HotspotIconKind, IconSvg> = {
  organs: OrgansIcon,
  bones: BonesIcon,
  muscles: MusclesIcon,
  chest: ChestRegionIcon,
  abdomen: AbdomenRegionIcon,
  pelvis: PelvisRegionIcon,
  spine: BackSpineRegionIcon,
  legs: LegsFeetRegionIcon,
  head: HeadNeckRegionIcon,
  female: FemaleBodyIcon,
  whole: WholeBodyIcon,
};

function Cube3DIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" />
      <path d="M12 12 4 7.5M12 12l8-4.5M12 12v9" />
    </svg>
  );
}

function useSafeLang(propLang?: Lang): Lang {
  let contextLang: Lang = "ro";
  try {
    const ctx = useLanguage();
    if (ctx?.lang) contextLang = ctx.lang;
  } catch {
    // Rendered outside LanguageProvider (e.g. isolated SSR tests)
  }
  return propLang ?? contextLang;
}

export interface TopicAnatomyExplorerProps {
  slug: string;
  lang?: Lang;
  className?: string;
}

/**
 * Editorial, on-demand Human Atlas 3D learning module for RediHealth topic guides.
 * Renders an interactive plain-language anatomy preview with zero WebGL or 3D asset cost
 * until the reader explicitly opens the 3D stage.
 */
export function TopicAnatomyExplorer({
  slug,
  lang,
  className,
}: TopicAnatomyExplorerProps) {
  const activeLang = useSafeLang(lang);
  const config = getTopicAnatomyConfig(slug);
  if (!config) return null;

  return (
    <TopicAnatomyExplorerInner
      key={config.slug}
      config={config}
      lang={activeLang}
      className={className}
    />
  );
}

interface TopicAnatomyExplorerInnerProps {
  config: TopicAnatomyConfig;
  lang: Lang;
  className?: string;
}

function TopicAnatomyExplorerInner({
  config,
  lang,
  className,
}: TopicAnatomyExplorerInnerProps) {
  const ui = getTopicAnatomyUiCopy(lang);
  const baseId = useId();
  const headingId = `${baseId}-heading`;
  const structuresLabelId = `${baseId}-structures`;
  const stagePanelId = `${baseId}-stage`;

  const defaultHotspot =
    config.hotspots.find((h) => h.id === config.defaultHotspotId) ??
    config.hotspots[0];

  const [selectedHotspotId, setSelectedHotspotId] = useState<string>(
    defaultHotspot.id,
  );
  const [activeLayer, setActiveLayer] = useState<LayerModeId>(
    config.defaultLayerMode,
  );
  const [activeBodyProfile, setActiveBodyProfile] = useState<BodyAnatomyProfile>(
    config.defaultBodyProfile,
  );
  const [activeViewAngle, setActiveViewAngle] = useState<CameraViewPreset>(
    defaultHotspot.viewAngle,
  );
  const [selectedPart, setSelectedPart] = useState<BodyPartId>(
    defaultHotspot.macroPart,
  );
  const [selectedSubRegion, setSelectedSubRegion] = useState<SubRegionId>(
    defaultHotspot.subRegion,
  );
  const [custom3DFocus, setCustom3DFocus] = useState<boolean>(false);
  const [is3DOpen, setIs3DOpen] = useState<boolean>(false);
  const [unavailableMessage, setUnavailableMessage] = useState<string | null>(
    null,
  );

  const activeHotspot: TopicAnatomyHotspot =
    config.hotspots.find((h) => h.id === selectedHotspotId) ?? defaultHotspot;

  const EyebrowIcon = HOTSPOT_ICONS[config.eyebrowIcon];
  const hotspotGridClass =
    config.hotspots.length === 4
      ? "grid grid-cols-1 gap-2.5 sm:grid-cols-2"
      : "grid grid-cols-1 gap-2.5 sm:grid-cols-3";

  const handleSelectHotspot = useCallback(
    (hotspot: TopicAnatomyHotspot) => {
      setSelectedHotspotId(hotspot.id);
      setSelectedSubRegion(hotspot.subRegion);
      setSelectedPart(hotspot.macroPart);
      setActiveLayer(hotspot.layerMode);
      setActiveViewAngle(hotspot.viewAngle);
      setCustom3DFocus(false);
      if (hotspot.bodyProfile) {
        setActiveBodyProfile(hotspot.bodyProfile);
      } else if (config.defaultBodyProfile === "female") {
        setActiveBodyProfile("female");
      }
    },
    [config.defaultBodyProfile],
  );

  const handleStageSelect = useCallback(
    (subRegion: SubRegionId | null, macroPart: BodyPartId) => {
      if (!subRegion) return;
      const matchingHotspot = config.hotspots.find(
        (h) => h.subRegion === subRegion,
      );
      if (matchingHotspot) {
        setSelectedHotspotId(matchingHotspot.id);
        setSelectedSubRegion(matchingHotspot.subRegion);
        setSelectedPart(matchingHotspot.macroPart);
        setCustom3DFocus(false);
        return;
      }
      setSelectedSubRegion(subRegion);
      setSelectedPart(macroPart);
      setCustom3DFocus(true);
    },
    [config.hotspots],
  );

  const handleUnavailable = useCallback((message: string) => {
    setUnavailableMessage(message);
  }, []);

  const healthCheckHref = withLangPrefix("/health-check", lang);

  return (
    <section
      id="section-anatomy"
      aria-labelledby={headingId}
      data-topic-anatomy-explorer={config.slug}
      data-anatomy-3d-open={is3DOpen ? "true" : "false"}
      className={cn("scroll-mt-6 print:hidden", className)}
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-(--shadow-card-rest)">
        {/* Calm editorial ceramic header band */}
        <div className="border-b border-border/80 bg-sand/45 px-5 py-5 sm:px-7 sm:py-6 dark:bg-white/[0.03]">
          <div className="flex flex-wrap items-center gap-2.5 text-meta">
            <span className="inline-flex items-center gap-1.5 font-semibold text-wellness dark:text-wellness-border">
              <EyebrowIcon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              <span>{ui.eyebrow}</span>
            </span>
            <span
              aria-hidden="true"
              className="h-3.5 w-px bg-border-control/45"
            />
            <span className="font-medium text-muted-foreground">
              {ui.layers[activeLayer]}
            </span>
          </div>

          <h2
            id={headingId}
            className="mt-2.5 text-section font-semibold leading-snug text-foreground text-balance"
          >
            {config.heading[lang]}
          </h2>

          <p className="mt-2 max-w-(--measure-reading) text-body text-muted-foreground text-pretty">
            {config.intro[lang]}
          </p>
        </div>

        {/* Interactive structure selector, immediate clinical note, and lazy 3D atlas stage */}
        <div className="space-y-5 p-5 sm:p-7">
          <div>
            <p
              id={structuresLabelId}
              className="text-meta font-semibold text-foreground/85"
            >
              {ui.structuresLabel}
            </p>
            <div
              role="group"
              aria-labelledby={structuresLabelId}
              className={cn("mt-3", hotspotGridClass)}
            >
              {config.hotspots.map((hotspot) => {
                const isSelected =
                  !custom3DFocus && activeHotspot.id === hotspot.id;
                const HotspotIcon = HOTSPOT_ICONS[hotspot.icon];
                return (
                  <button
                    key={hotspot.id}
                    type="button"
                    aria-pressed={isSelected}
                    data-anatomy-hotspot={hotspot.id}
                    onClick={() => handleSelectHotspot(hotspot)}
                    className={cn(
                      "press-row flex min-h-12 w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                      isSelected
                        ? "border-rose-border bg-rose-tint text-rose-ink shadow-2xs"
                        : "border-border-control/75 bg-card text-foreground hover:border-sapphire/45 hover:bg-sapphire-soft/35 dark:hover:border-white/25 dark:hover:bg-white/[0.06]",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none",
                        isSelected
                          ? "border-rose-border/75 bg-card/85 text-rose-ink dark:bg-ink-900/50"
                          : "border-border bg-surface-subtle text-sapphire dark:bg-white/[0.05] dark:text-sapphire-border",
                      )}
                    >
                      <HotspotIcon className="h-4.5 w-4.5 shrink-0" />
                    </span>
                    <span className="min-w-0 flex-1 text-body font-semibold leading-snug text-pretty">
                      {hotspot.label[lang]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Immediate plain-language anatomy card (available before opening 3D) */}
          <div
            aria-live="polite"
            data-anatomy-fact-panel
            className="rounded-xl border border-border bg-surface-subtle/55 p-4 sm:p-5 dark:bg-white/[0.03]"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-title font-semibold text-foreground">
                {activeHotspot.label[lang]}
              </h3>
              <span className="text-meta font-medium text-wellness dark:text-wellness-border">
                {ui.layers[activeHotspot.layerMode]}
              </span>
            </div>

            <p className="mt-2.5 max-w-(--measure-reading) text-reading text-foreground text-pretty">
              {activeHotspot.fact[lang]}
            </p>

            <p className="mt-3.5 border-t border-border/80 pt-3 text-body text-muted-foreground text-pretty">
              <strong className="font-semibold text-foreground">
                {ui.whatToNoticeLabel}:
              </strong>{" "}
              {activeHotspot.whatToNotice[lang]}
            </p>
          </div>

          {/* On-demand 3D Human Atlas stage (only mounted after user clicks Explore in 3D) */}
          {is3DOpen && (
            <div
              id={stagePanelId}
              data-anatomy-3d-panel
              className="space-y-3 rounded-2xl border border-border bg-background/80 p-3 sm:p-4 dark:bg-ink-950/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <p className="text-meta text-muted-foreground">
                  {ui.stageCaption}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {custom3DFocus && (
                    <button
                      type="button"
                      onClick={() => handleSelectHotspot(activeHotspot)}
                      className="press-row inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-border-control bg-card px-3 text-meta font-semibold text-sapphire transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:border-sapphire/45 hover:bg-sapphire-soft/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none dark:text-sapphire-border"
                    >
                      {ui.backToGuideFocus}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIs3DOpen(false)}
                    data-anatomy-stage-close
                    className="press-row inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border-control bg-card px-3 text-meta font-semibold text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:border-rose-border hover:bg-rose-tint hover:text-rose-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                  >
                    <CloseIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{ui.hide3d}</span>
                  </button>
                </div>
              </div>

              {unavailableMessage ? (
                <div
                  role="status"
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <p className="text-body font-semibold text-foreground">
                    {ui.unavailableTitle}
                  </p>
                  <p className="mt-1 text-body text-muted-foreground">
                    {ui.unavailableBody}
                  </p>
                </div>
              ) : (
                <LazyHumanAtlasPreviewStage
                  layerMode={activeLayer}
                  onLayerModeChange={setActiveLayer}
                  availableLayers={config.availableLayers}
                  selectedPart={selectedPart}
                  selectedSubRegion={selectedSubRegion}
                  bodyProfile={activeBodyProfile}
                  onBodyProfileChange={setActiveBodyProfile}
                  allowBodyProfileToggle={config.allowBodyProfileToggle}
                  viewAngle={activeViewAngle}
                  onSelectSubRegion={handleStageSelect}
                  onUnavailable={handleUnavailable}
                  lang={lang}
                  className="h-[400px] sm:h-[460px]"
                  showControls
                />
              )}

              <p className="px-1 text-meta text-muted-foreground">
                {ui.attributionPrefix} Human Atlas (BodyParts3D, CC BY 4.0)
              </p>
            </div>
          )}

          {/* Action footer: Explore in 3D trigger and direct symptom check link */}
          <div className="space-y-2.5 border-t border-border/80 pt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant={is3DOpen ? "outline" : "action"}
                size="lg"
                onClick={() => setIs3DOpen((open) => !open)}
                aria-expanded={is3DOpen}
                aria-controls={is3DOpen ? stagePanelId : undefined}
                data-anatomy-open-3d={!is3DOpen ? "" : undefined}
                data-anatomy-close-3d={is3DOpen ? "" : undefined}
                className="w-full shrink-0 sm:w-auto"
              >
                {is3DOpen ? (
                  <CloseIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <Cube3DIcon className="h-4.5 w-4.5 shrink-0" />
                )}
                <span>{is3DOpen ? ui.hide3d : ui.explore3d}</span>
              </Button>

              <Link
                href={healthCheckHref}
                title={ui.checkSymptomsPrompt}
                className="press-row group inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-(--radius-control) border border-border-control bg-card px-4 py-2 text-body font-semibold text-foreground shadow-(--shadow-card-rest) transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:border-sapphire/45 hover:bg-sapphire-soft/35 hover:text-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:w-auto dark:hover:border-white/30 dark:hover:bg-white/[0.08] dark:hover:text-sapphire-border"
              >
                <StethoscopeIcon
                  className="h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border"
                  aria-hidden="true"
                />
                <span>{ui.checkSymptomsCta}</span>
                <ArrowRightIcon
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-(--dur-fast) ease-(--ease-out-calm) group-hover:translate-x-0.5 group-hover:text-sapphire motion-reduce:transform-none motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </Link>
            </div>

            {!is3DOpen && (
              <p className="text-meta text-muted-foreground">
                {ui.loadsOnDemandHint}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
