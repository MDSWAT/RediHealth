"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, PinIcon, StethoscopeIcon } from "@/components/ui/icons";
import { findHelpHref, findHelpLinks } from "@/lib/i18n/find-help-links";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { DOCTOR_BANNER_COPY } from "./TopicDoctorExitBanner";
import { MedicalSafetyDisclaimer } from "./MedicalSafetyDisclaimer";

export interface TopicNextStepsProps {
  lang: Lang;
  /** Passes the topic to the online doctor, so the call starts with context. */
  topicSlug?: string;
  topicTitle?: string;
  className?: string;
}

/**
 * The end of a guide: one quiet surface with hairline rows. Talk to a doctor (a voice
 * call), or ask at a pharmacy, then the reminder that the guide does not replace a
 * doctor. 112 is not repeated here: the warning card, the top bar and the footer carry it.
 */
export function TopicNextSteps({ lang, topicSlug, topicTitle, className = "" }: TopicNextStepsProps) {
  const doctor = DOCTOR_BANNER_COPY[lang] ?? DOCTOR_BANNER_COPY.ro;
  const findHelp = findHelpLinks(lang);

  const query = new URLSearchParams();
  if (topicSlug) query.set("context", `topic_${topicSlug}`);
  if (topicTitle) query.set("title", topicTitle);
  const queryString = query.toString();
  const doctorHref = withLangPrefix(`/medic-online${queryString ? `?${queryString}` : ""}`, lang);

  return (
    <section
      aria-labelledby="next-steps-heading"
      className={`divide-y divide-border rounded-xl border border-border bg-card print:divide-y-0 print:border-0 ${className}`}
    >
      <div className="flex flex-col gap-5 p-6 sm:p-8 md:flex-row md:items-center md:justify-between print:hidden">
        <div className="max-w-xl">
          <h2 id="next-steps-heading" className="text-section font-semibold text-foreground text-balance">
            {doctor.title}
          </h2>
          <p className="mt-1.5 text-body text-muted-foreground">{doctor.description}</p>
        </div>
        <Button
          href={doctorHref}
          variant="action"
          size="lg"
          className="shrink-0"
        >
          <StethoscopeIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 truncate">{doctor.buttonText}</span>
        </Button>
      </div>

      <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 print:hidden">
        <div>
          <p className="text-body font-semibold text-foreground">{findHelp.noDoctorNeeded}</p>
          <p className="mt-0.5 text-body text-muted-foreground">{findHelp.pharmacyFirstHint}</p>
        </div>
        <Link
          href={withLangPrefix(findHelpHref("pharmacy"), lang)}
          className="group inline-flex min-h-12 max-w-full items-center gap-2 self-start whitespace-nowrap rounded-lg border border-sapphire/25 bg-sapphire-soft/55 px-3.5 py-2 text-body font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-sapphire/45 hover:bg-sapphire-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:shrink-0 sm:self-auto dark:border-sapphire-border/30 dark:bg-white/[0.06] dark:text-sapphire-border dark:hover:bg-white/[0.1]"
        >
          <PinIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 truncate">{findHelp.nearestPharmacy}</span>
          <ArrowRightIcon className="arrow-travel h-4 w-4 shrink-0" aria-hidden="true" />
        </Link>
      </div>

      <div className="px-6 py-4 sm:px-8 print:px-0" data-print-guide-section>
        <MedicalSafetyDisclaimer lang={lang} variant="plain" />
      </div>
    </section>
  );
}
