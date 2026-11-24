"use client";

import { WheelBackdrop } from "@/components/landing/WheelBackdrop";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { CheckIcon, ChevronDownIcon, GlobeIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { getChromeCopy } from "@/components/layout/chrome-copy";
import { languageSelectorCopy, orderedLanguages } from "@/components/layout/LanguageSelector";
import { AI_CHAT_COPY } from "@/components/health-assistant/ai-chat-copy";
import {
  feedbackTriggerCopy,
  openReportIssue,
  openSiteFeedback,
} from "@/components/layout/chrome-widget-events";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n/language-context";
import { markManualLocaleSelection } from "@/lib/i18n/locale-detection";
import { getPwaCopy } from "@/lib/i18n/pwa-copy";
import { withLangPrefix } from "@/lib/i18n/routing";
import { applyPwaUpdate, openPwaInstall, usePwaSnapshot } from "@/lib/pwa/pwa-state";
import { useOnlineStatus } from "@/lib/pwa/use-online-status";
import { cookieConsentCopy } from "@/components/security/cookie-consent-copy";
import { RecaptchaNotice } from "@/components/security/RecaptchaProvider";
import { openCookiePreferences } from "@/lib/privacy/cookie-consent";
import { LEGAL_OPERATOR } from "@/lib/legal-config";

const FOOTER_UTILITY_LINK_CLASS =
  "hero-focus -mx-2 -my-1.5 inline-flex min-h-11 items-center whitespace-nowrap rounded-(--radius-control) px-2 text-meta text-mist press-on-dark transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-paper hover:underline hover:decoration-paper/45 hover:underline-offset-4 motion-reduce:transition-none";

const EmergencySignsModal = dynamic(
  () => import("@/components/emergency/EmergencySignsModal").then((mod) => mod.EmergencySignsModal),
  { ssr: false },
);
const EmergencyDialerGate = dynamic(
  () => import("@/components/emergency/EmergencyDialerGate").then((mod) => mod.EmergencyDialerGate),
  { ssr: false },
);

/**
 * Footer: the ink ground that closes every page, mirroring the ink hero. A short statement of
 * what RediHealth is, four link columns with 44px rows, a calm 112 reminder (with the
 * alarm-signs guide), every language by its own name, and the legal line. Sentence case, no
 * ampersands in prose.
 * The two dialogs render beside the footer, not inside it, so they keep their own text colour.
 */
export function Footer() {
  const { lang, t, setLang } = useLanguage();
  const pathname = usePathname() || "/";
  const tFooter = t.footer;
  const chrome = getChromeCopy(lang);
  const cookieCopy = cookieConsentCopy[lang] ?? cookieConsentCopy.ro;
  const isOnline = useOnlineStatus();
  const pwa = usePwaSnapshot();
  const pwaCopy = getPwaCopy(lang);
  const showInstallTrigger = !pwa.isStandalone && !pwa.hasUpdate;
  const pwaTriggerLabel = showInstallTrigger
    ? pwaCopy.installButton
    : pwa.isRefreshing
      ? pwaCopy.refreshingApp
      : pwa.hasUpdate
        ? pwaCopy.updateNow
        : pwaCopy.refreshApp;
  const [emergencySignsOpen, setEmergencySignsOpen] = useState(false);
  const [dialerOpen, setDialerOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!langMenuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!langMenuRef.current?.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLangMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [langMenuOpen]);

  const currentLangItem = orderedLanguages.find((item) => item.code === lang) ?? orderedLanguages[0];

  const columns: { heading: string; links: { label: string; href: string }[] }[] = [
    {
      heading: tFooter.col1Heading,
      links: [
        { label: tFooter.col1Link1, href: "/health-information" },
        { label: tFooter.col1Link2, href: "/health-check" },
        { label: tFooter.col1Link3, href: "/prescription-review" },
        ...(isOnline
          ? [{ label: (AI_CHAT_COPY[lang] ?? AI_CHAT_COPY.ro).navLabel, href: "/ai-assistant" }]
          : []),
      ],
    },
    {
      heading: tFooter.col2Heading,
      links: [
        { label: chrome.liveDoctor, href: "/medic-online" },
        { label: tFooter.col2Link1, href: "/find-help" },
        { label: tFooter.col2Link2, href: "/stiri" },
        { label: tFooter.col2Link3, href: "/contul-meu" },
      ],
    },
    {
      heading: tFooter.col3Heading,
      links: [
        { label: tFooter.col3Link1, href: "/mediatori" },
        { label: tFooter.col3Link2, href: "/mediatori#solicita" },
        { label: tFooter.col3Link3, href: "/mediatori#protocol" },
        { label: tFooter.col4Link2, href: "/contact" },
      ],
    },
    {
      heading: tFooter.col4Heading,
      links: [
        { label: tFooter.col4Link1, href: "/about" },
        { label: tFooter.col4Link3, href: "/accessibility" },
        { label: tFooter.col4Link4, href: "/privacy" },
        { label: tFooter.col4Link5, href: "/terms" },
      ],
    },
  ];

  return (
    <>
      <footer className="relative z-10 bg-ink-950 text-paper">
        {/* The topic wheel with its eight icons, soft, behind the footer's content at every width. */}
        <div aria-hidden="true">
          <WheelBackdrop placement="footer" />
        </div>
        <Container className="pt-12 pb-10 sm:pt-16 sm:pb-12">
          <div className="grid gap-10 xl:grid-cols-[1.1fr_2.9fr] xl:gap-12">
            <div className="max-w-sm space-y-4">
              <Logo className="hero-focus" tone="light" href={withLangPrefix("/", lang)} label={chrome.homeLink} />
              <p className="text-body text-mist">{tFooter.brandDescription}</p>
              <p className="text-meta text-mist/85">
                {LEGAL_OPERATOR.name}, {LEGAL_OPERATOR.streetAddress}, {LEGAL_OPERATOR.cityCountry[lang] ?? LEGAL_OPERATOR.cityCountry.en}, BCE {LEGAL_OPERATOR.bceNumber}
              </p>
            </div>

            <nav aria-label={chrome.footerNav}>
              {/* The four columns arrive one after another as the footer comes into view. */}
              <Reveal stagger className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
                {columns.map((column) => (
                  <div key={column.heading} className="min-w-0">
                    <h2 className="text-body font-semibold leading-snug text-paper">{column.heading}</h2>
                    <ul className="mt-2">
                      {column.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={withLangPrefix(link.href, lang)}
                            className="group hero-focus -mx-2 flex min-h-11 items-center rounded-(--radius-control) px-2 py-2.5 text-body leading-snug break-words text-mist press-on-dark hover:text-paper transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none"
                          >
                            <span className="min-w-0 [overflow-wrap:anywhere]">{link.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </Reveal>
            </nav>
          </div>

          {/* 112 reminder + compact footer language dropdown aligned cleanly on the same row from lg */}
          <div className="mt-12 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1 text-body text-mist lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-4">
              <p className="font-semibold leading-snug text-paper">{tFooter.emergency112Title}</p>
              {/* Same gate as the header's 112 line: keypad on a phone, the number and guidance on a computer. */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-0">
                <button
                  type="button"
                  onClick={() => setDialerOpen(true)}
                  className="hero-focus press-on-dark -mx-1.5 -my-1.5 inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-1.5 font-semibold text-paper underline decoration-paper/40 underline-offset-4 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:decoration-paper motion-reduce:transition-none"
                >
                  {tFooter.call112Button}
                </button>
                <button
                  type="button"
                  onClick={() => setEmergencySignsOpen(true)}
                  className="hero-focus press-on-dark -mx-1.5 -my-1.5 inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-1.5 text-mist underline decoration-mist/40 underline-offset-4 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-paper hover:decoration-paper motion-reduce:transition-none"
                >
                  {tFooter.seeAlarmSigns}
                </button>
              </div>
            </div>

            <div ref={langMenuRef} className="relative inline-block self-start lg:self-auto">
              <button
                type="button"
                aria-expanded={langMenuOpen}
                aria-haspopup="menu"
                aria-label={(languageSelectorCopy[lang] ?? languageSelectorCopy.ro).label}
                onClick={() => setLangMenuOpen((open) => !open)}
                className="hero-focus press-on-dark inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl border border-paper/16 bg-paper/[0.05] px-3.5 text-meta font-medium text-paper transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:border-paper/30 hover:bg-paper/[0.1] motion-reduce:transition-none"
              >
                <GlobeIcon className="h-4 w-4 shrink-0 text-mist" aria-hidden="true" />
                <span>{currentLangItem.label}</span>
                <ChevronDownIcon
                  className={cn(
                    "h-4 w-4 shrink-0 text-mist transition-transform duration-(--dur-fast)",
                    langMenuOpen && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>

              {langMenuOpen && (
                <ul
                  role="menu"
                  aria-label={(languageSelectorCopy[lang] ?? languageSelectorCopy.ro).label}
                  className="absolute left-0 bottom-full z-30 mb-2 min-w-44 rounded-xl border border-paper/14 bg-ink-900 p-1.5 text-meta shadow-xl shadow-black/40 lg:right-0 lg:left-auto"
                >
                  {orderedLanguages.map((item) => {
                    const isCurrent = item.code === lang;
                    return (
                      <li key={item.code} role="none">
                        <a
                          role="menuitem"
                          href={withLangPrefix(pathname, item.code)}
                          hrefLang={item.code}
                          lang={item.code}
                          aria-current={isCurrent ? "true" : undefined}
                          onClick={(event) => {
                            markManualLocaleSelection();
                            setLangMenuOpen(false);
                            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                            event.preventDefault();
                            setLang(item.code);
                          }}
                          className={cn(
                            "hero-focus flex min-h-10 items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-1.5 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none",
                            isCurrent
                              ? "bg-paper/12 font-semibold text-paper"
                              : "font-medium text-mist hover:bg-paper/8 hover:text-paper",
                          )}
                        >
                          <span>{item.label}</span>
                          {isCurrent && <CheckIcon className="h-4 w-4 shrink-0 text-paper" aria-hidden="true" />}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-paper/12 pt-6 text-meta text-mist">
            {/* Row 1: anchored copyright on the left, calm single-line utility links on the right */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
              <p className="shrink-0 font-medium text-paper/90">{tFooter.copyrightLine}</p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 lg:justify-end lg:gap-x-6">
                <Link
                  href={withLangPrefix("/cookies", lang)}
                  className={FOOTER_UTILITY_LINK_CLASS}
                >
                  {cookieCopy.policyLinkLabel}
                </Link>
                <button
                  type="button"
                  onClick={openCookiePreferences}
                  className={FOOTER_UTILITY_LINK_CLASS}
                >
                  {cookieCopy.footerSettingsLink}
                </button>
                <button
                  type="button"
                  disabled={!showInstallTrigger && pwa.isRefreshing}
                  onClick={() => {
                    if (showInstallTrigger) {
                      void openPwaInstall();
                    } else {
                      void applyPwaUpdate();
                    }
                  }}
                  className={cn(FOOTER_UTILITY_LINK_CLASS, "disabled:cursor-wait disabled:opacity-70")}
                >
                  {pwaTriggerLabel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openSiteFeedback();
                  }}
                  className={FOOTER_UTILITY_LINK_CLASS}
                >
                  {(feedbackTriggerCopy[lang] ?? feedbackTriggerCopy.ro).footerLink}
                </button>
                {/* Opens the report form in place (it records this page); the floating button is desktop-only. */}
                <Link
                  href={withLangPrefix("/report-issue", lang)}
                  onClick={(event) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                    if (openReportIssue()) event.preventDefault();
                  }}
                  className={FOOTER_UTILITY_LINK_CLASS}
                >
                  {tFooter.reportIssueFallback}
                </Link>
              </div>
            </div>

            {/* Row 2: legal fine print — medical disclaimer paired with Google reCAPTCHA attribution */}
            <div className="mt-4 flex flex-col gap-2 border-t border-paper/[0.07] pt-4 text-mist/80 xl:flex-row xl:items-baseline xl:justify-between xl:gap-8">
              <p className="text-pretty leading-relaxed">{tFooter.nonEmergencyWarning}</p>
              <RecaptchaNotice tone="dark" className="mt-0 xl:shrink-0 xl:text-right" />
            </div>
          </div>
        </Container>
      </footer>

      {emergencySignsOpen ? <EmergencySignsModal open={emergencySignsOpen} onOpenChange={setEmergencySignsOpen} /> : null}
      {dialerOpen ? <EmergencyDialerGate open={dialerOpen} onOpenChange={setDialerOpen} /> : null}
    </>
  );
}
