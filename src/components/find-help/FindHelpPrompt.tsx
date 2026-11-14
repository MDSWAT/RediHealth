"use client";

import Link from "next/link";
import { ArrowRightIcon, PinIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { findHelpHref, findHelpLinks } from "@/lib/i18n/find-help-links";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

/**
 * "Don't need a doctor?" A quiet band that sends people to the nearest pharmacy first,
 * with a second link to every nearby practice and hospital. Used wherever the page
 * otherwise only offers a doctor.
 */
export function FindHelpPrompt({ lang: langProp, className }: { lang?: Lang; className?: string }) {
  const { lang: ctxLang } = useLanguage();
  const lang = langProp ?? ctxLang;
  const copy = findHelpLinks(lang);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6",
        className,
      )}
    >
      <div className="max-w-2xl">
        <p className="text-base font-semibold text-foreground">{copy.noDoctorNeeded}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{copy.pharmacyFirstHint}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <Link
          href={withLangPrefix(findHelpHref("pharmacy"), lang)}
          className="press-row inline-flex min-h-11 max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-sapphire/30 bg-sapphire-soft px-4 py-2.5 text-sm font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:border-sapphire/60 hover:bg-sapphire-soft/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-[0.9375rem]"
        >
          <PinIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 truncate">{copy.nearestPharmacy}</span>
        </Link>
        <Link
          href={withLangPrefix(findHelpHref(), lang)}
          className="group press-row inline-flex min-h-11 max-w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border-control bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-[0.9375rem]"
        >
          <span className="min-w-0 truncate">{copy.nearbyPlace}</span>
          <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-colors duration-[var(--dur-fast)] group-hover:text-sapphire motion-reduce:transition-none" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
