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
 * A quiet line for community health mediators under the help options:
 * one sentence and one link, so it never competes with the patient paths.
 * Link colour is amber-care-hover (#92400e), 7:1 on white.
 */
export function HelpOptionsMediatorBand({ className }: HelpOptionsMediatorBandProps) {
  const { lang, t } = useLanguage();
  const mb = t.mediatorBand;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6",
        className,
      )}
    >
      <p className="flex items-start gap-3 text-[15px] leading-relaxed text-muted-foreground">
        <UsersIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-care" />
        <span>
          <span className="font-semibold text-foreground">{mb.question}</span> {mb.description}
        </span>
      </p>

      <Link
        href={withLangPrefix("/mediatori", lang)}
        className="group inline-flex min-h-11 shrink-0 items-center gap-1.5 self-start rounded-lg text-sm font-semibold text-amber-care-hover underline decoration-amber-care/30 underline-offset-4 transition-colors hover:decoration-amber-care-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-auto"
      >
        {mb.cta}
        <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </Link>
    </div>
  );
}
