"use client";

import { WheelBackdrop } from "@/components/landing/WheelBackdrop";
import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { PhoneIcon } from "@/components/ui/icons";
import { getChromeCopy } from "@/components/layout/chrome-copy";
import { EmergencySignsModal } from "@/components/emergency/EmergencySignsModal";
import { EmergencyDialerGate } from "@/components/emergency/EmergencyDialerGate";
import { openSiteFeedback } from "@/components/layout/FeedbackWidget";
import { openReportIssue } from "@/components/layout/ReportIssueWidget";
import { feedbackWidgetCopy } from "@/lib/i18n/feedback-translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { translations } from "@/lib/i18n/translations";

/**
 * Footer: the ink ground that closes every page, mirroring the ink hero. A short statement of
 * what RediHealth is, four link columns with 44px rows, a calm 112 reminder (with the
 * alarm-signs guide) and the legal line. Sentence case, no ampersands in prose.
 * The two dialogs render beside the footer, not inside it, so they keep their own text colour.
 */
export function Footer() {
  const { lang, t: rawT } = useLanguage();
  const t = rawT ?? translations[lang || "ro"] ?? translations.ro;
  const tFooter = t.footer;
  const chrome = getChromeCopy(lang);
  const [emergencySignsOpen, setEmergencySignsOpen] = useState(false);
  const [dialerOpen, setDialerOpen] = useState(false);

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
    <>
      <footer className="relative z-10 bg-ink-950 text-paper">
        {/* The topic wheel, small and faint, behind the brand block. */}
        <WheelBackdrop placement="footer" />
        <Container className="py-12 sm:py-16">
          <div className="grid gap-10 xl:grid-cols-[1.1fr_2.9fr] xl:gap-12">
            <div className="max-w-sm space-y-4">
              <Logo className="hero-focus" tone="light" href={withLangPrefix("/", lang)} label={chrome.homeLink} />
              <p className="text-body text-mist">{tFooter.brandDescription}</p>
            </div>

            <nav aria-label={chrome.footerNav} className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
              {columns.map((column) => (
                <div key={column.heading} className="min-w-0">
                  <h2 className="text-body font-semibold leading-snug text-paper">{column.heading}</h2>
                  <ul className="mt-2">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={withLangPrefix(link.href, lang)}
                          className="hero-focus -mx-2 flex min-h-11 items-center rounded-(--radius-control) px-2 py-2.5 text-body leading-snug break-words text-mist press-on-dark hover:text-paper transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none"
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

          {/* 112 reminder: one plain line, present even after the header's 112 line is closed. */}
          <p className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-1 text-body text-mist">
            <PhoneIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-ruby-300" />
            <span className="font-semibold text-paper">{tFooter.emergency112Title}</span>
            {/* Same gate as the header's 112 line: keypad on a phone, the number and guidance on a computer. */}
            <button
              type="button"
              onClick={() => setDialerOpen(true)}
              className="hero-focus press-on-dark -my-2 inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-1.5 font-semibold text-paper underline decoration-paper/40 underline-offset-4 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:decoration-paper motion-reduce:transition-none"
            >
              {tFooter.call112Button}
            </button>
            <button
              type="button"
              onClick={() => setEmergencySignsOpen(true)}
              className="hero-focus press-on-dark -my-2 inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-1.5 text-mist underline decoration-mist/40 underline-offset-4 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-paper hover:decoration-paper motion-reduce:transition-none"
            >
              {tFooter.seeAlarmSigns}
            </button>
          </p>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-meta text-mist lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <p className="text-pretty leading-relaxed">
              <span className="font-medium text-paper/85">{tFooter.copyrightLine}</span>
              <span aria-hidden="true" className="mx-2.5 inline-block h-3 w-px align-middle bg-white/20" />
              <span>{tFooter.nonEmergencyWarning}</span>
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 lg:shrink-0">
              <button
                type="button"
                onClick={() => {
                  openSiteFeedback();
                }}
                className="hero-focus -mx-2 -my-1.5 inline-flex min-h-11 items-center rounded-(--radius-control) px-2 text-meta underline decoration-mist/40 underline-offset-4 press-on-dark hover:text-paper hover:decoration-paper transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none whitespace-nowrap"
              >
                {(feedbackWidgetCopy[lang] ?? feedbackWidgetCopy.ro).footerLink}
              </button>
              {/* Opens the report form in place (it records this page); the floating button is desktop-only. */}
              <Link
                href={withLangPrefix("/report-issue", lang)}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                  if (openReportIssue()) event.preventDefault();
                }}
                className="hero-focus -mx-2 -my-1.5 inline-flex min-h-11 items-center rounded-(--radius-control) px-2 text-meta underline decoration-mist/40 underline-offset-4 press-on-dark hover:text-paper hover:decoration-paper transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none whitespace-nowrap"
              >
                {tFooter.reportIssueFallback}
              </Link>
            </div>
          </div>
        </Container>
      </footer>

      <EmergencySignsModal open={emergencySignsOpen} onOpenChange={setEmergencySignsOpen} />
      <EmergencyDialerGate open={dialerOpen} onOpenChange={setDialerOpen} />
    </>
  );
}
