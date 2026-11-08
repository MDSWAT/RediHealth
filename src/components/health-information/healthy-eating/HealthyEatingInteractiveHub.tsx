"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n/translations";
import { BalancedPlateExplainer } from "./BalancedPlateExplainer";
import { SaltIntakeCalculator } from "./SaltIntakeCalculator";
import { BALANCED_PLATE_COPY } from "./healthy-eating-copy";
import { HUB_CARD_CLASS, TAB_LIST_CLASS, tabClass, handleTabKey } from "../diabetes/choice-styles";

type HubTab = "plate" | "builder" | "salt";

const HUB_TABS: readonly HubTab[] = ["plate", "builder", "salt"];

export interface HealthyEatingInteractiveHubProps {
  lang: Lang;
  className?: string;
  initialTab?: HubTab;
}

/**
 * Healthy-eating explainer: one card with an underline tab band. The plate guide,
 * the plate builder and the salt calculator are sibling tabs, so no panel carries
 * a second switch of its own.
 */
export function HealthyEatingInteractiveHub({
  lang,
  className = "",
  initialTab = "plate",
}: HealthyEatingInteractiveHubProps) {
  const [activeTab, setActiveTab] = useState<HubTab>(initialTab);
  const copy = BALANCED_PLATE_COPY[lang] ?? BALANCED_PLATE_COPY.ro;
  const labels: Record<HubTab, string> = {
    plate: copy.tabPlate,
    builder: copy.builderTitle,
    salt: copy.tabCalculator,
  };

  return (
    <div className={`${HUB_CARD_CLASS} ${className}`} data-testid="healthy-eating-hub">
      <div role="tablist" aria-label={copy.title} className={`${TAB_LIST_CLASS} grid-cols-3`}>
        {HUB_TABS.map((tab) => {
          const selected = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              id={`healthy-eating-tab-${tab}`}
              aria-selected={selected}
              aria-controls="healthy-eating-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(tab)}
              onKeyDown={(event) => handleTabKey(event, HUB_TABS, activeTab, setActiveTab)}
              className={tabClass(selected)}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      <div
        id="healthy-eating-panel"
        role="tabpanel"
        aria-labelledby={`healthy-eating-tab-${activeTab}`}
        className="pt-6 sm:pt-7"
      >
        {activeTab === "salt" ? (
          <SaltIntakeCalculator lang={lang} />
        ) : (
          <BalancedPlateExplainer lang={lang} mode={activeTab === "builder" ? "builder" : "sectors"} />
        )}
      </div>
    </div>
  );
}
