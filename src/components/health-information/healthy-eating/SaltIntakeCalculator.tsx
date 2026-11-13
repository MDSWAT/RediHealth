"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n/translations";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/icons";
import { SALT_CALCULATOR_COPY, type SaltFoodItem } from "./healthy-eating-copy";
import { ROW_CLASS, ROW_LIST_CLASS, tickBoxClass } from "../diabetes/choice-styles";

export interface SaltIntakeCalculatorProps {
  lang: Lang;
  className?: string;
}

/** WHO: less than 5 g of salt a day for adults. */
const WHO_LIMIT_G = 5;
/** Above this the zone turns from "over the limit" to "well over the limit". */
const HIGH_G = 8;
/** Right end of the gauge. */
const GAUGE_MAX_G = 12;

/**
 * Grams with at most one decimal and the locale's decimal mark (comma in ro, sq, it, hr, rom; period in en).
 * Formatted by hand so server and browser always agree, even where a browser has no
 * Albanian or Romani number data.
 */
function formatGrams(value: number, lang: Lang): string {
  const text = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return lang === "en" ? text : text.replace(".", ",");
}

type Zone = "optimal" | "caution" | "high";

/** Red stays reserved for 112 and emergencies, so "well over the limit" is a deeper amber. */
const ZONE_STYLE: Record<Zone, { badge: string; bar: string }> = {
  optimal: {
    badge: "text-foreground",
    bar: "bg-live-sage",
  },
  caution: {
    badge: "text-amber-care-hover",
    bar: "bg-amber-care",
  },
  high: {
    badge: "text-amber-care-hover",
    bar: "bg-amber-care-hover",
  },
};

export function SaltIntakeCalculator({ lang, className = "" }: SaltIntakeCalculatorProps) {
  const copy = SALT_CALCULATOR_COPY[lang] ?? SALT_CALCULATOR_COPY.ro;
  const grams = { format: (value: number) => formatGrams(value, lang) };

  // Default: three everyday sources of hidden salt (bread, salty cheese, cured meats).
  const [selectedIds, setSelectedIds] = useState<string[]>(["bread", "telemea", "mezeluri"]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedItems = copy.items.filter((item) => selectedIds.includes(item.id));
  const totalSalt = Math.round(selectedItems.reduce((acc, item) => acc + item.saltGrams, 0) * 10) / 10;
  const percentageOfWho = Math.round((totalSalt / WHO_LIMIT_G) * 100);

  const zone: Zone = totalSalt > HIGH_G ? "high" : totalSalt > WHO_LIMIT_G ? "caution" : "optimal";
  const zoneTitle =
    zone === "high" ? copy.zoneHazardTitle : zone === "caution" ? copy.zoneCautionTitle : copy.zoneOptimalTitle;
  const zoneDesc =
    zone === "high" ? copy.zoneHazardDesc : zone === "caution" ? copy.zoneCautionDesc : copy.zoneOptimalDesc;
  const style = ZONE_STYLE[zone];
  const fill = Math.min(1, totalSalt / GAUGE_MAX_G);

  return (
    <section
      className={className}
      aria-label={copy.title}
      data-testid="salt-intake-calculator"
    >
      <h3 className="text-lg font-semibold text-foreground">{copy.title}</h3>
      <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">{copy.subtitle}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{copy.whoLimitLabel}</p>

      {/* Running total, status, and gauge */}
      <div className="mt-5 border-t border-border pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{copy.currentIntakeLabel}</p>
            <div className="mt-0.5 flex items-baseline gap-2" aria-live="polite" aria-atomic="true">
              <span className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                {grams.format(totalSalt)}
              </span>
              <span className="text-sm font-medium text-muted-foreground">{copy.unitPerDay}</span>
              <span className="text-xs text-muted-foreground">
                ({copy.teaspoonFullLabel.replace("{percent}", String(percentageOfWho))})
              </span>
            </div>
          </div>

          <span className={`self-start text-sm font-semibold sm:self-auto ${style.badge}`}>
            {zoneTitle}
          </span>
        </div>

        <div className="mt-3.5">
          <div
            className="relative h-2.5 w-full overflow-hidden rounded-xs bg-surface-subtle"
            role="meter"
            aria-valuenow={totalSalt}
            aria-valuemin={0}
            aria-valuemax={GAUGE_MAX_G}
            aria-valuetext={`${grams.format(totalSalt)} ${copy.unitPerDay}`}
            aria-label={copy.currentIntakeLabel}
          >
            <div
              className={`absolute inset-y-0 left-0 w-full origin-left rounded-xs ${style.bar}`}
              style={{
                transform: `scaleX(${fill})`,
                transition: "transform var(--dur-base) var(--ease-out-calm), background-color var(--dur-base) var(--ease-out-calm)",
              }}
            />
            <div
              className="absolute inset-y-0 w-0.5 bg-foreground/70"
              style={{ left: `${(WHO_LIMIT_G / GAUGE_MAX_G) * 100}%` }}
              aria-hidden="true"
            />
          </div>
          <div className="relative mt-1.5 flex items-center justify-between text-xs tabular-nums text-muted-foreground" aria-hidden="true">
            <span>0 g</span>
            <span className="absolute -translate-x-1/2 whitespace-nowrap font-medium text-foreground/80" style={{ left: `${(WHO_LIMIT_G / GAUGE_MAX_G) * 100}%` }}>
              {copy.limitMarkerLabel}
            </span>
            <span>{GAUGE_MAX_G} g</span>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{zoneDesc}</p>
      </div>

      {/* Foods */}
      <div className="mt-6 border-t border-border pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-foreground">{copy.foodsHeading}</h4>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="inline-flex min-h-[44px] items-center whitespace-nowrap rounded-lg px-2 text-sm font-semibold text-sapphire underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copy.resetLabel}
            </button>
          )}
        </div>

        <div className={`mt-2.5 ${ROW_LIST_CLASS}`}>
          {copy.items.map((item: SaltFoodItem) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item.id)}
                aria-pressed={isSelected}
                className={`${ROW_CLASS} items-start`}
              >
                <span className={`mt-0.5 ${tickBoxClass(isSelected)}`} aria-hidden="true">
                  {isSelected && <CheckIcon className="h-3 w-3" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-snug text-foreground">{item.name}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{item.portion}</span>
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                  +{grams.format(item.saltGrams)} g
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Swaps for what was chosen */}
      {selectedItems.length > 0 && (
        <div className="mt-6 border-t border-border pt-5">
          <h4 className="text-sm font-semibold text-foreground">{copy.swapsSectionTitle}</h4>
          <p className="mt-0.5 text-sm text-muted-foreground">{copy.swapsSectionSubtitle}</p>

          <ul className="mt-3 divide-y divide-border">
            {selectedItems.map((item) => (
              <li key={`swap-${item.id}`} className="py-3 first:pt-0 last:pb-0">
                <p className="text-xs text-muted-foreground">
                  {copy.swapInsteadOf}: {item.name} (+{grams.format(item.saltGrams)} g)
                </p>
                <p className="mt-1 flex items-start gap-1.5 text-sm font-semibold leading-snug text-foreground">
                  <ArrowRightIcon className="mt-0.5 h-4 w-4 shrink-0 text-live-sage" />
                  <span>
                    {item.swapName} (+{grams.format(item.swapSaltGrams)} g)
                  </span>
                </p>
                <p className="mt-1 pl-[22px] text-sm leading-relaxed text-muted-foreground">{item.swapSavingsDesc}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
