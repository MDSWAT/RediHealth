"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { ROMANIAN_COUNTIES } from "@/lib/romanian-counties";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { foldForSearch, placeName, quoteTerm } from "@/components/news/news-format";
import { useSheetDialog } from "@/components/news/use-sheet-dialog";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations } from "@/lib/i18n/translations";

function useSafeLanguage() {
  try {
    const ctx = useLanguage();
    const lang = ctx?.lang || "ro";
    return { lang, t: ctx?.t ?? translations[lang] ?? translations.ro };
  } catch {
    return { lang: "ro" as const, t: translations.ro };
  }
}

export type CountyOverrideModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCounty: string;
  onSelectCounty: (county: string) => void;
};

const NATIONAL = "Toate județele";

/**
 * CountyOverrideModal: pick the county by hand (mobile carriers often route every phone
 * through Bucharest, so the detected county can be wrong). Searchable list of all counties.
 * Bottom sheet on phones, centred dialog from sm up; the same calm entrance as the news sheet.
 */
export function CountyOverrideModal({ open, onOpenChange, currentCounty, onSelectCounty }: CountyOverrideModalProps) {
  const { lang, t } = useSafeLanguage();
  const nr = t.newsRibbon;
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  useSheetDialog(open, panelRef, close, searchRef);

  const filteredCounties = useMemo(() => {
    // Diacritics are optional: most phones type "iasi", not "Iași". English names find their county too.
    const query = foldForSearch(searchTerm);
    const all = ROMANIAN_COUNTIES as readonly string[];
    return query
      ? all.filter((county) => foldForSearch(county).includes(query) || foldForSearch(placeName(county, lang)).includes(query))
      : all;
  }, [searchTerm, lang]);

  function handleSelect(county: string) {
    onSelectCounty(county);
    setSearchTerm("");
    onOpenChange(false);
  }

  if (!open) return null;

  // One choice from a list: radio rows split by hairlines, not a grid of bordered boxes.
  const option = (county: string, label: string) => {
    const selected = currentCounty === county;
    return (
      <li key={county}>
        <button
          type="button"
          onClick={() => handleSelect(county)}
          aria-pressed={selected}
          className={cn(
            "flex min-h-[48px] w-full items-center gap-3 px-5 py-2.5 text-left text-sm text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            selected && "font-semibold",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
              selected ? "border-foreground" : "border-muted-foreground/50",
            )}
          >
            {selected && <span className="h-2 w-2 rounded-full bg-foreground" />}
          </span>
          <span>{label}</span>
        </button>
      </li>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="county-modal-title"
      aria-describedby="county-modal-subtitle"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
    >
      <div className="news-sheet-backdrop fixed inset-0 -z-10 bg-slate-950/45" onClick={close} aria-hidden="true" />

      <div ref={panelRef} className="news-sheet relative flex max-h-[88dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-xl bg-card shadow-[0_24px_48px_-12px_rgb(15_23_42/0.25)] sm:max-h-[80dvh] sm:rounded-xl">
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 pb-4 pt-5">
          <div>
            <h2 id="county-modal-title" className="text-lg font-semibold text-foreground">
              {nr.modalTitle}
            </h2>
            <p id="county-modal-subtitle" className="mt-0.5 text-sm text-muted-foreground">
              {nr.modalSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label={nr.closeModal}
            className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-border px-5 py-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={nr.searchPlaceholder}
              aria-label={nr.searchPlaceholder}
              className="min-h-[44px] w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <ul className="divide-y divide-border">
            {!searchTerm.trim() && option(NATIONAL, nr.allCountiesNational)}
            {filteredCounties.map((county) => option(county, placeName(county, lang)))}
          </ul>

          {filteredCounties.length === 0 && (
            <p role="status" className="px-5 py-8 text-center text-sm text-muted-foreground">
              {nr.noCountyFound} {quoteTerm(searchTerm.trim(), lang)}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
