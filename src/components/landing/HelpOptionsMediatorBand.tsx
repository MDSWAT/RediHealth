"use client";

import Link from "next/link";
import { IconTile } from "@/components/ui/IconTile";
import { ArrowRightIcon } from "@/components/ui/icons";
import { NAV_LINK_ICONS } from "@/components/layout/nav-links";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";

export type HelpOptionsMediatorBandProps = {
  className?: string;
};

const MEDIATOR_HREF = "/mediatori";

/**
 * Band for community health mediators beneath the patient options: amber
 * ground and amber icon plate, because amber marks a mediator. The link stays
 * sapphire like every other link. Phones: the band runs edge to edge with no
 * side borders or radius, and the link fills the row. From sm it is a rounded
 * card with the link at the end of the row.
 */
export function HelpOptionsMediatorBand({ className }: HelpOptionsMediatorBandProps) {
  const { lang, t } = useLanguage();
  const mb = t.mediatorBand;

  return (
    <div className={className}>
      <div className="flex flex-col gap-4 rounded-(--radius-surface) border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 dark:border-white/10 dark:bg-ink-800">
        <div className="flex min-w-0 items-start gap-3.5 sm:items-center sm:gap-4">
          <IconTile icon={NAV_LINK_ICONS[MEDIATOR_HREF]} tone="amber" size={40} />
          <div className="min-w-0 flex-1">
            <h3 className="text-balance text-title text-foreground dark:text-paper">
              {mb.question}
            </h3>
            <p className="mt-0.5 text-pretty text-body text-muted-foreground dark:text-mist">
              {mb.description}
            </p>
          </div>
        </div>

        <Link
          href={withLangPrefix(MEDIATOR_HREF, lang)}
          className="press-row group inline-flex min-h-11 shrink-0 self-start items-center justify-center gap-2 whitespace-nowrap rounded-(--radius-control) border border-border-control bg-card px-4 py-2 text-base font-semibold text-sapphire transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:border-sapphire hover:bg-sapphire-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:self-center dark:border-white/40 dark:bg-ink-800 dark:text-sapphire-border dark:hover:border-white/60 dark:hover:bg-white/10 dark:focus-visible:ring-paper"
        >
          <span>{mb.cta}</span>
          <ArrowRightIcon aria-hidden="true" className="arrow-travel h-4 w-4 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
