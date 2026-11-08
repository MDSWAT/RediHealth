"use client";

import { useState } from "react";
import { LazyMotion, domAnimation } from "motion/react";
import type { Lang } from "@/lib/i18n/translations";
import { CheckIcon, PlusIcon } from "@/components/ui/icons";
import { NutritionScene } from "./NutritionScene";
import { BALANCED_PLATE_COPY } from "./healthy-eating-copy";
import {
  STAGE_CARD_CLASS,
  STAGE_CANVAS_CLASS,
  STAGE_CREDIT_CLASS,
} from "../explainers/stage-styles";

export interface BalancedPlateExplainerProps {
  lang: Lang;
  className?: string;
}

type SectorKey = "vegetables" | "grains" | "protein" | "water";
type BuilderCategory = Exclude<SectorKey, "water">;

const SECTOR_ORDER: SectorKey[] = ["vegetables", "grains", "protein", "water"];

const BUILDER_FOODS: { id: string; category: BuilderCategory; staple: number }[] = [
  { id: "cabbage", category: "vegetables", staple: 0 },
  { id: "beans_green", category: "vegetables", staple: 1 },
  { id: "roots", category: "vegetables", staple: 2 },
  { id: "polenta", category: "grains", staple: 0 },
  { id: "rye_bread", category: "grains", staple: 1 },
  { id: "oats", category: "grains", staple: 2 },
  { id: "beans", category: "protein", staple: 0 },
  { id: "egg", category: "protein", staple: 1 },
  { id: "urda", category: "protein", staple: 2 },
];

const SEGMENT_CLASS =
  "min-h-[44px] rounded-md px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire";

export function BalancedPlateExplainer({ lang, className = "" }: BalancedPlateExplainerProps) {
  const copy = BALANCED_PLATE_COPY[lang] ?? BALANCED_PLATE_COPY.ro;
  const [selectedSector, setSelectedSector] = useState<SectorKey>("vegetables");
  const [mode, setMode] = useState<"sectors" | "builder">("sectors");
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>(["cabbage", "polenta", "beans"]);

  const activeSector = copy.sectors[selectedSector];

  const toggleFood = (id: string) => {
    setSelectedFoodIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const chosen = new Set(
    selectedFoodIds.map((id) => BUILDER_FOODS.find((f) => f.id === id)?.category)
  );
  const has: Record<BuilderCategory, boolean> = {
    vegetables: chosen.has("vegetables"),
    grains: chosen.has("grains"),
    protein: chosen.has("protein"),
  };
  const balanced = has.vegetables && has.grains && has.protein;
  const builderFeedback = !has.vegetables
    ? copy.builderStatusNeedsVeg
    : !has.protein
    ? copy.builderStatusNeedsProtein
    : !has.grains
    ? copy.builderStatusNeedsGrains
    : copy.builderStatusBalanced;

  return (
    <section
      className={`${STAGE_CARD_CLASS} ${className}`}
      aria-label={copy.title}
      data-testid="balanced-plate-explainer"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-prose">
          <h3 className="text-lg font-semibold text-foreground">{copy.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{copy.subtitle}</p>
        </div>
        <div className="flex shrink-0 self-start rounded-lg border border-border bg-surface-subtle p-1">
          <button
            type="button"
            aria-pressed={mode === "sectors"}
            onClick={() => setMode("sectors")}
            className={`${SEGMENT_CLASS} ${
              mode === "sectors" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {copy.handRuleSectionTitle}
          </button>
          <button
            type="button"
            aria-pressed={mode === "builder"}
            onClick={() => setMode("builder")}
            className={`${SEGMENT_CLASS} ${
              mode === "builder" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {copy.builderTitle}
          </button>
        </div>
      </div>

      <div className={STAGE_CANVAS_CLASS}>
        <div role="img" aria-label={copy.ariaPlateLabel} className="h-full w-full">
          <LazyMotion features={domAnimation} strict>
            <NutritionScene step={SECTOR_ORDER.indexOf(selectedSector)} playing={false} />
          </LazyMotion>
        </div>
      </div>

      {mode === "sectors" ? (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">{copy.interactiveHelper}</p>

          <div
            role="group"
            aria-label={copy.ariaPlateLabel}
            className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
          >
            {SECTOR_ORDER.map((key) => {
              const sec = copy.sectors[key];
              const isSelected = selectedSector === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedSector(key)}
                  className={`flex min-h-[56px] flex-col justify-center rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                    isSelected
                      ? "border-sapphire bg-sapphire-soft"
                      : "border-border bg-card hover:bg-surface-subtle"
                  }`}
                >
                  <span className="block text-sm font-semibold leading-snug text-foreground">
                    {sec.name}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                    {sec.handRuleTitle}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-border pt-5">
            <p className="max-w-prose text-sm font-medium leading-relaxed text-foreground">
              {activeSector.handRuleDesc}
            </p>
            <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground">
              {activeSector.clinicalWhy}
            </p>

            <h4 className="mt-5 text-sm font-semibold text-foreground">{copy.staplesTitle}</h4>
            <ul className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {activeSector.culturalStaples.map((staple) => (
                <li key={staple} className="flex items-start gap-2 text-sm leading-snug text-foreground">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
                  <span>{staple}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t border-border pt-4">
              <p className="text-sm font-semibold text-foreground">{copy.smartTipTitle}</p>
              <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
                {activeSector.smartTip}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{copy.builderSubtitle}</p>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {BUILDER_FOODS.map((food) => {
              const isChecked = selectedFoodIds.includes(food.id);
              const name = copy.sectors[food.category].culturalStaples[food.staple];
              return (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => toggleFood(food.id)}
                  aria-pressed={isChecked}
                  className={`flex min-h-[44px] items-start justify-between gap-3 rounded-lg border p-3 text-left text-sm leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                    isChecked
                      ? "border-sapphire bg-sapphire-soft text-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{name}</span>
                  {isChecked ? (
                    <CheckIcon className="h-4 w-4 shrink-0 text-sapphire" />
                  ) : (
                    <PlusIcon className="h-4 w-4 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div
            className={`rounded-lg border p-4 ${
              balanced ? "border-live-sage/40 bg-live-sage-soft" : "border-amber-care-border bg-amber-care-soft"
            }`}
            aria-live="polite"
          >
            <p className="text-sm font-semibold text-foreground">{builderFeedback}</p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground">
              {(["vegetables", "grains", "protein"] as BuilderCategory[]).map((key) => (
                <li key={key} className="flex items-center gap-1.5">
                  {has[key] ? (
                    <CheckIcon className="h-3.5 w-3.5 text-live-sage" />
                  ) : (
                    <span className="h-3 w-3 rounded-full border border-amber-care" aria-hidden="true" />
                  )}
                  <span className={has[key] ? "font-semibold" : ""}>{copy.builderChecklist[key]}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => setSelectedFoodIds([])}
            className="min-h-[44px] text-sm font-semibold text-sapphire underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire rounded-md"
          >
            {copy.builderReset}
          </button>
        </div>
      )}

      <p className={STAGE_CREDIT_CLASS}>{copy.credit}</p>
    </section>
  );
}
