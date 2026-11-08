"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { PhoneIcon } from "@/components/ui/icons";
import { getChromeCopy } from "@/components/layout/chrome-copy";
import { EmergencySignsModal } from "@/components/emergency/EmergencySignsModal";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { translations } from "@/lib/i18n/translations";

/**
 * Footer: a short statement of what RediHealth is, four link columns, a calm 112 reminder
 * (with the alarm-signs guide) and the legal line. Sentence case, no ampersands in prose.
 */
export function Footer() {
  const { lang, t: rawT } = useLanguage();
  const t = rawT ?? translations[lang || "ro"] ?? translations.ro;
  const tFooter = t.footer;
  const chrome = getChromeCopy(lang);
  const [emergencySignsOpen, setEmergencySignsOpen] = useState(false);

  const columns: { heading: string; links: { label: string; href: string }[] }[] = [
    {
      heading: tFooter.col1Heading,
      links: [
        { label: tFooter.col1Link1, href: "/health-information" },
        { label: tFooter.col1Link2, href: "/health-assistant" },
        { label: tFooter.col1Link3, href: "/health-check" },
        { label: tFooter.col1Link4, href: "/stiri" },
      ],
    },
    {
      heading: tFooter.col2Heading,
      links: [
        { label: tFooter.col2Link1, href: "/medic-online" },
        { label: tFooter.col2Link2, href: "/medic-online/programare" },
        { label: tFooter.col2Link3, href: "/find-help" },
        { label: tFooter.col2Link4, href: "/contul-meu" },
      ],
    },
    {
      heading: tFooter.col3Heading,
      links: [
        { label: tFooter.col3Link1, href: "/mediatori" },
        { label: tFooter.col3Link2, href: "/panel/mediator" },
        { label: tFooter.col3Link3, href: "/panel" },
        { label: tFooter.col3Link4, href: "/mediatori#protocol" },
      ],
    },
    {
      heading: tFooter.col4Heading,
      links: [
        { label: tFooter.col4Link1, href: "/about" },
        { label: tFooter.col4Link2, href: "/contact" },
        { label: tFooter.col4Link3, href: "/accessibility" },
        { label: tFooter.col4Link4, href: "/privacy" },
        { label: tFooter.col4Link5, href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-muted/40">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 xl:grid-cols-[1.1fr_2.9fr] xl:gap-12">
          <div className="max-w-sm space-y-4">
            <Logo href={withLangPrefix("/", lang)} label={chrome.homeLink} />
            <p className="text-sm leading-relaxed text-muted-foreground">{tFooter.brandDescription}</p>
          </div>

          <nav aria-label={chrome.footerNav} className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
            {columns.map((column) => (
              <div key={column.heading}>
                <h2 className="text-sm font-semibold leading-snug text-foreground">{column.heading}</h2>
                <ul className="mt-3 space-y-0.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={withLangPrefix(link.href, lang)}
                        className="block rounded-sm py-1.5 text-sm leading-snug text-muted-foreground transition-colors duration-(--dur-fast) hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* 112 reminder: calm and always present, even after the top bar is closed. */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-card p-5 sm:p-6 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-base font-semibold text-foreground">{tFooter.emergency112Title}</p>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">{tFooter.emergency112Text}</p>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 md:w-auto">
            <button
              type="button"
              onClick={() => setEmergencySignsOpen(true)}
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-(--dur-fast) hover:bg-muted sm:flex-1 md:flex-initial"
            >
              {tFooter.seeAlarmSigns}
            </button>
            <a
              href="tel:112"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors duration-(--dur-fast) hover:bg-primary-hover sm:flex-1 md:flex-initial"
            >
              <PhoneIcon className="h-4 w-4" />
              <span>{tFooter.call112Button}</span>
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <p className="max-w-2xl leading-relaxed">{tFooter.nonEmergencyWarning}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:shrink-0">
            <Link
              href={withLangPrefix("/contact#report", lang)}
              className="underline decoration-muted-foreground/40 underline-offset-4 transition-colors duration-(--dur-fast) hover:text-foreground hover:decoration-foreground"
            >
              {tFooter.reportIssueFallback}
            </Link>
            <p>{tFooter.copyrightLine}</p>
          </div>
        </div>
      </Container>

      <EmergencySignsModal open={emergencySignsOpen} onOpenChange={setEmergencySignsOpen} />
    </footer>
  );
}
