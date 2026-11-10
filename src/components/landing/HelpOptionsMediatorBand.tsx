"use client";

import Link from "next/link";
import { ArrowRightIcon, UsersIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";

export type HelpOptionsMediatorBandProps = {
  className?: string;
};

/**
 * Anchored band for community health mediators directly beneath the patient
 * bento grid: matching p-6 sm:p-7 horizontal alignment, sapphire icon plate
 * and interactive link.
 */
export function HelpOptionsMediatorBand({ className }: HelpOptionsMediatorBandProps) {
  const { lang, t } = useLanguage();
  const mb = t.mediatorBand;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-surface-subtle/55 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-7",
        className,
      )}
    >
      <p className="flex items-start gap-3.5 text-[15px] leading-relaxed text-muted-foreground sm:items-center">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sapphire-border/70 bg-sapphire-soft text-sapphire sm:mt-0"
        >
          <UsersIcon className="h-4 w-4" />
        </span>
        <span>
          <span className="font-semibold text-foreground">{mb.question}</span> {mb.description}
        </span>
      </p>

      <Link
        href={withLangPrefix("/mediatori", lang)}
        className="group inline-flex min-h-11 shrink-0 items-center gap-1.5 self-start rounded-lg px-2.5 -ml-2.5 text-[14.5px] font-semibold text-sapphire underline decoration-sapphire/30 underline-offset-4 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-sapphire-soft/60 hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:ml-0 sm:self-auto"
      >
        <span>{mb.cta}</span>
        <ArrowRightIcon className="h-4 w-4 transition-transform duration-(--dur-fast) ease-(--ease-out-calm) group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </Link>
    </div>
  );
}
