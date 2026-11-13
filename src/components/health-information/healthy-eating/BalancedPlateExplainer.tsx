"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n/translations";
import { CheckIcon } from "@/components/ui/icons";
import { NutritionScene } from "./NutritionScene";
import { BALANCED_PLATE_COPY } from "./healthy-eating-copy";
import { STAGE_CREDIT_CLASS } from "../explainers/stage-styles";
import { ROW_CLASS, ROW_LIST_CLASS, radioDotClass, tickBoxClass } from "../diabetes/choice-styles";

export interface BalancedPlateExplainerProps {
  lang: Lang;
  className?: string;
  /** "sectors": what goes in each part of the plate. "builder": tick foods and check the plate. */
  mode?: "sectors" | "builder";
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

export function BalancedPlateExplainer({ lang, className = "", mode = "sectors" }: BalancedPlateExplainerProps) {
  const copy = BALANCED_PLATE_COPY[lang] ?? BALANCED_PLATE_COPY.ro;
  const [selectedSector, setSelectedSector] = useState<SectorKey>("vegetables");
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
  const builderFeedback = !has.vegetables
    ? copy.builderStatusNeedsVeg
    : !has.protein
    ? copy.builderStatusNeedsProtein
    : !has.grains
    ? copy.builderStatusNeedsGrains
    : copy.builderStatusBalanced;

  return (
    <section
      className={className}
      aria-label={copy.title}
      data-testid="balanced-plate-explainer"
    >
      <div className="max-w-prose">
        <h3 className="text-lg font-semibold text-foreground">{copy.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{copy.subtitle}</p>
      </div>

      <div className="mx-auto my-6 aspect-[7/5] w-full max-w-[22rem]">
        <div role="img" aria-label={copy.ariaPlateLabel} className="h-full w-full">
          <NutritionScene
            step={SECTOR_ORDER.indexOf(selectedSector)}
            litParts={mode === "builder" ? [has.vegetables, has.grains, has.protein, true] : undefined}
          />
        </div>
      </div>

      {mode === "sectors" ? (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">{copy.interactiveHelper}</p>

          <div role="radiogroup" aria-label={copy.ariaPlateLabel} className={ROW_LIST_CLASS}>
            {SECTOR_ORDER.map((key) => {
              const sec = copy.sectors[key];
              const isSelected = selectedSector === key;
              return (
                <label key={key} className={`${ROW_CLASS} cursor-pointer`}>
                  <input
                    type="radio"
                    name="plate-sector"
                    value={key}
                    checked={isSelected}
                    onChange={() => setSelectedSector(key)}
                    className="sr-only"
                  />
                  <span className={radioDotClass(isSelected)} aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-snug text-foreground">{sec.name}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{sec.handRuleTitle}</span>
                  </span>
                </label>
              );
            })}
          </div>

          <div aria-live="polite">
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
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-xs bg-muted-foreground" aria-hidden="true" />
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

          <div className={ROW_LIST_CLASS}>
            {BUILDER_FOODS.map((food) => {
              const isChecked = selectedFoodIds.includes(food.id);
              const name = copy.sectors[food.category].culturalStaples[food.staple];
              return (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => toggleFood(food.id)}
                  aria-pressed={isChecked}
                  className={ROW_CLASS}
                >
                  <span className={tickBoxClass(isChecked)} aria-hidden="true">
                    {isChecked && <CheckIcon className="h-3 w-3" />}
                  </span>
                  <span className="text-sm leading-snug text-foreground">{name}</span>
                </button>
              );
            })}
          </div>

          <div aria-live="polite">
            <p className="text-sm font-semibold text-foreground">{builderFeedback}</p>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-foreground">
              {(["vegetables", "grains", "protein"] as BuilderCategory[]).map((key) => (
                <li key={key} className="flex items-center gap-1.5">
                  {has[key] ? (
                    <CheckIcon className="h-3.5 w-3.5 text-live-sage" />
                  ) : (
                    <span className="h-3 w-3 rounded-xs border border-muted-foreground/60" aria-hidden="true" />
                  )}
                  <span className={has[key] ? "font-semibold" : "text-muted-foreground"}>{copy.builderChecklist[key]}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => setSelectedFoodIds([])}
            className="inline-flex min-h-[44px] items-center whitespace-nowrap rounded-lg px-2 text-sm font-semibold text-sapphire underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {copy.builderReset}
          </button>
        </div>
      )}

      <p className={STAGE_CREDIT_CLASS}>{copy.credit}</p>
    </section>
  );
}
