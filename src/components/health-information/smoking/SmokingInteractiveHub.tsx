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
        className="grid grid-cols-2 gap-x-4 border-b border-border sm:flex sm:gap-x-0"
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
                "-mb-px flex min-h-11 items-end gap-2 border-b-2 px-1 pb-2.5 pt-2 text-left text-sm font-semibold leading-snug transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sapphire sm:mr-6",
                selected
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
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
