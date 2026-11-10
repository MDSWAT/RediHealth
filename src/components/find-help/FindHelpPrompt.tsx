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
      <div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          href={withLangPrefix(findHelpHref("pharmacy"), lang)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-sapphire/30 bg-sapphire-soft px-4 py-2.5 text-sm font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2"
        >
          <PinIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{copy.nearestPharmacy}</span>
        </Link>
        <Link
          href={withLangPrefix(findHelpHref(), lang)}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2"
        >
          <span>{copy.nearbyPlace}</span>
          <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
