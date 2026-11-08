"use client";

import type { MythCategory } from "@/lib/i18n/health-myths";
import { useLanguage } from "@/lib/i18n/language-context";

export interface MythCategoryProgress {
  total: number;
  answered: number;
}

export interface MythCategoryFilterProps {
  categories: MythCategory[];
  activeCategory: string;
  onSelect: (categorySlug: string) => void;
  /** Per-category totals and answered counts, shown as a small tally. */
  progress?: Record<string, MythCategoryProgress>;
  className?: string;
}

/**
 * Wrapping filter buttons instead of a scrolling tab strip: every label stays
 * fully visible at any width. A group of toggle buttons (aria-pressed), since
 * they filter one shared quiz rather than switch between tab panels.
 */
export function MythCategoryFilter({
  categories,
  activeCategory,
  onSelect,
  progress,
  className = "",
}: MythCategoryFilterProps) {
  const { t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t.quiz.filterAriaLabel}
      className={`flex flex-wrap items-center justify-center gap-2 ${className}`}
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat.slug;
        const tally = progress?.[cat.slug];
        return (
          <button
            key={cat.slug}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(cat.slug)}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 ${
              isActive
                ? "border-sapphire bg-sapphire text-white"
                : "border-border bg-card text-muted-foreground hover:border-sapphire/40 hover:text-foreground"
            }`}
          >
            <span>{cat.label}</span>
            {tally && tally.answered > 0 && (
              <span className={`text-xs tabular-nums ${isActive ? "text-white/80" : "text-muted-foreground"}`}>
                {tally.answered}/{tally.total}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
