"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n/translations";
import { BalancedPlateExplainer } from "./BalancedPlateExplainer";
import { SaltIntakeCalculator } from "./SaltIntakeCalculator";
import { BALANCED_PLATE_COPY } from "./healthy-eating-copy";

type HubTab = "plate" | "salt";

export interface HealthyEatingInteractiveHubProps {
  lang: Lang;
  className?: string;
  initialTab?: HubTab;
}

export function HealthyEatingInteractiveHub({
  lang,
  className = "",
  initialTab = "plate",
}: HealthyEatingInteractiveHubProps) {
  const [activeTab, setActiveTab] = useState<HubTab>(initialTab);
  const copy = BALANCED_PLATE_COPY[lang] ?? BALANCED_PLATE_COPY.ro;
  const tabs: { id: HubTab; label: string }[] = [
    { id: "plate", label: copy.tabPlate },
    { id: "salt", label: copy.tabCalculator },
  ];

  return (
    <div className={`space-y-4 ${className}`} data-testid="healthy-eating-hub">
      <div role="tablist" aria-label={copy.title} className="flex rounded-lg border border-border bg-card p-1 shadow-xs">
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`healthy-eating-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls="healthy-eating-panel"
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[44px] flex-1 rounded-md px-3 py-2 text-center text-sm font-semibold leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                selected ? "bg-sapphire text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div id="healthy-eating-panel" role="tabpanel" aria-labelledby={`healthy-eating-tab-${activeTab}`}>
        {activeTab === "plate" ? <BalancedPlateExplainer lang={lang} /> : <SaltIntakeCalculator lang={lang} />}
      </div>
    </div>
  );
}
