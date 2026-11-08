"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { Lang } from "@/lib/i18n/translations";
import { cn } from "@/lib/cn";
import { CessationRecoveryTimeline } from "./CessationRecoveryTimeline";
import { SmokingHabitCoach } from "./SmokingHabitCoach";
import { SMOKING_COACH_COPY } from "./smoking-copy";

export interface SmokingInteractiveHubProps {
  lang: Lang;
  className?: string;
  initialTab?: "timeline" | "coach";
}

type Tab = "timeline" | "coach";
const TABS: Tab[] = ["timeline", "coach"];

/** Smoking explainer: one card, two tabs (how the body recovers, getting through a craving). */
export function SmokingInteractiveHub({
  lang,
  className = "",
  initialTab = "timeline",
}: SmokingInteractiveHubProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const copy = SMOKING_COACH_COPY[lang] ?? SMOKING_COACH_COPY.ro;
  const id = useId();
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ timeline: null, coach: null });

  const labels: Record<Tab, string> = { timeline: copy.tabTimeline, coach: copy.tabCoach };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next = TABS[(TABS.indexOf(activeTab) + (event.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
    setActiveTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div
      className={cn("rounded-xl border border-border bg-card p-5 sm:p-7", className)}
      data-testid="smoking-interactive-hub"
    >
      <div
        role="tablist"
        aria-label={copy.tabsLabel}
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
      >
        {TABS.map((tab) => {
          const selected = activeTab === tab;
          return (
            <button
              key={tab}
              ref={(node) => {
                tabRefs.current[tab] = node;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${tab}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(tab)}
              onKeyDown={onTabKeyDown}
              className={cn(
                "flex min-h-[52px] items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire",
                selected
                  ? "border-foreground bg-surface-subtle text-foreground"
                  : "border-border bg-card text-foreground hover:border-foreground/30 hover:bg-surface-subtle/50",
              )}
            >
              <span>{labels[tab]}</span>
            </button>
          );
        })}
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${activeTab}`} className="pt-6">
        {activeTab === "timeline" ? (
          <CessationRecoveryTimeline lang={lang} />
        ) : (
          <SmokingHabitCoach lang={lang} />
        )}
      </div>
    </div>
  );
}
