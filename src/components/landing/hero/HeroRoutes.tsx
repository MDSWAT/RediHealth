"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { localHref, type HeroCopy } from "@/lib/i18n/hero-copy";
import type { Lang } from "@/lib/i18n/translations";
import styles from "./HeroRoutes.module.css";

/**
 * Desktop (lg and up): a single, calm entry card on the right of the hero headline
 * leading directly to /health-check with zero competing links, search bars, or modals.
 */
export function HeroRoutes({ copy, lang }: { copy: HeroCopy; lang: Lang }) {
  const symptomGuide = copy.panel.needs.risk;

  return (
    <div
      className={cn(
        styles.entryCard,
        "rounded-(--radius-surface) border border-paper/18 border-t-2 border-t-sapphire-border bg-ink-900/90 p-7 shadow-(--shadow-card-hover) lg:ml-auto lg:max-w-[29rem]",
      )}
    >
      <h2 className="text-balance text-title font-bold leading-snug text-paper">
        {symptomGuide.title}
      </h2>
      {symptomGuide.body ? (
        <p className="mt-2.5 max-w-(--measure-reading) text-pretty text-body text-mist">
          {symptomGuide.body}
        </p>
      ) : null}

      <Button
        variant="action"
        size="lg"
        fullWidth
        href={localHref("/health-check", lang)}
        className="mt-6 min-h-14 justify-between bg-paper! text-ink-950! hover:bg-paper/90! active:bg-paper/80!"
      >
        <span>{copy.primaryCta}</span>
        <ArrowRightIcon className="arrow-travel h-5 w-5 shrink-0" />
      </Button>
    </div>
  );
}
