"use client";

import { useRef, type KeyboardEvent } from "react";
import { BookIcon, GlobeIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { Lang } from "@/lib/i18n/translations";
import { markDictionaryTabHandoff, type DictionaryTabKind } from "./DictionaryParts";

export const DICTIONARY_TAB_LABELS: Record<
  Lang,
  {
    dictionary: string;
    romanes: string;
    tablistAria: string;
  }
> = {
"ru": {"dictionary":"Словарь","romanes":"На романи","tablistAria":"Выберите медицинский словарь"},

  ro: {
    dictionary: "Dicționar",
    romanes: "În romani",
    tablistAria: "Alege glosarul medical",
  },
  en: {
    dictionary: "Dictionary",
    romanes: "In Romani",
    tablistAria: "Choose medical glossary",
  },
  sq: {
    dictionary: "Fjalori",
    romanes: "Në romisht",
    tablistAria: "Zgjidh fjalorin mjekësor",
  },
  it: {
    dictionary: "Dizionario",
    romanes: "In romanì",
    tablistAria: "Scegli il glossario medico",
  },
  hr: {
    dictionary: "Rječnik",
    romanes: "Na romskom",
    tablistAria: "Odaberi medicinski rječnik",
  },
  rom: {
    dictionary: "Lavustik",
    romanes: "Romane",
    tablistAria: "Alosar o sastipnasko alavari",
  },
};

export interface DictionaryTabsProps {
  active: DictionaryTabKind;
  dictionaryLabel: string;
  romanesLabel: string;
  tablistAriaLabel?: string;
  dictionaryCount?: number;
  romanesCount?: number;
  onSelect: (tab: DictionaryTabKind) => void;
}

/**
 * Segmented WAI-ARIA tablist switching between the dual-register medical dictionary
 * and the Romanes community lexicon within a single calm drawer surface.
 */
export function DictionaryTabs({
  active,
  dictionaryLabel,
  romanesLabel,
  tablistAriaLabel,
  dictionaryCount,
  romanesCount,
  onSelect,
}: DictionaryTabsProps) {
  const dictTabRef = useRef<HTMLButtonElement | null>(null);
  const romanesTabRef = useRef<HTMLButtonElement | null>(null);

  const selectTab = (next: DictionaryTabKind) => {
    if (next === active) return;
    markDictionaryTabHandoff(active, next);
    onSelect(next);
    // Fallback focus if rendered inside a single persistent host without remounting
    const targetRef = next === "dictionary" ? dictTabRef : romanesTabRef;
    targetRef.current?.focus({ preventScroll: true });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      selectTab(active === "dictionary" ? "romanes" : "dictionary");
    } else if (e.key === "Home") {
      e.preventDefault();
      selectTab("dictionary");
    } else if (e.key === "End") {
      e.preventDefault();
      selectTab("romanes");
    }
  };

  const tabItems: {
    id: DictionaryTabKind;
    label: string;
    count?: number;
    Icon: typeof BookIcon;
    ref: typeof dictTabRef;
  }[] = [
    {
      id: "dictionary",
      label: dictionaryLabel,
      count: dictionaryCount,
      Icon: BookIcon,
      ref: dictTabRef,
    },
    {
      id: "romanes",
      label: romanesLabel,
      count: romanesCount,
      Icon: GlobeIcon,
      ref: romanesTabRef,
    },
  ];

  return (
    <div
      role="tablist"
      aria-label={tablistAriaLabel ?? DICTIONARY_TAB_LABELS.ro.tablistAria}
      className="relative grid grid-cols-2 rounded-xl border border-border bg-surface-subtle p-1"
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-sapphire shadow-xs transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none",
          active === "romanes" ? "translate-x-full" : "translate-x-0",
        )}
      />

      {tabItems.map(({ id, label, count, Icon, ref }) => {
        const isSelected = active === id;
        return (
          <button
            key={id}
            ref={ref}
            type="button"
            role="tab"
            tabIndex={isSelected ? 0 : -1}
            aria-selected={isSelected}
            onClick={() => selectTab(id)}
            onKeyDown={handleKeyDown}
            className={cn(
              "relative z-10 inline-flex min-h-11 min-w-0 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 sm:gap-2 sm:px-3 sm:text-sm",
              isSelected
                ? "text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{label}</span>
            {typeof count === "number" && (
              <span
                className={cn(
                  "shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums leading-none transition-colors duration-(--dur-fast) motion-reduce:transition-none",
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-card text-muted-foreground ring-1 ring-inset ring-border/70",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
