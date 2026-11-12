"use client";

import { UniversalEmergencyBanner } from "@/components/layout/UniversalEmergencyBanner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSession } from "next-auth/react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { IconTile } from "@/components/ui/IconTile";
import { Logo } from "@/components/ui/Logo";
import {
  AlertCircleIcon,
  CloseIcon,
  ExternalLinkIcon,
  GlobeIcon,
  MenuIcon,
  MessageDotsIcon,
  PhoneIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserIcon,
} from "@/components/ui/icons";
import { openSiteFeedback } from "@/components/layout/FeedbackWidget";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { openReportIssue, reportIssueCopy } from "@/components/layout/ReportIssueWidget";
import { NAV_LINK_ICONS, type NavLinkHref } from "@/components/layout/nav-links";
import { getChromeCopy } from "@/components/layout/chrome-copy";
import { EmergencyDialerGate } from "@/components/emergency/EmergencyDialerGate";
import { cn } from "@/lib/cn";
import { feedbackWidgetCopy } from "@/lib/i18n/feedback-translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix, stripLangFromPathname } from "@/lib/i18n/routing";
import { translations } from "@/lib/i18n/translations";
import { findHelpLinks } from "@/lib/i18n/find-help-links";

const FOCUSABLE_SELECTOR =
  'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';

/** Shared focus ring of the phone menu rows: sapphire on paper, paper on ink. */
const DRAWER_FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring dark:focus-visible:ring-paper";
const DRAWER_ROW_MOTION =
  "press-row transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none";

/**
 * Site header: five patient-first destinations on xl+, compact utility actions
 * (language ISO selector, 44px account link, and split "Start here" CTA with
 * keyboard/touch mediator toggle) from md+ upward, and below xl a focus-trapped menu
 * that opens under the bar: 112 card, language row, destinations, "Start here",
 * health mediators, account.
 */
export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const startMenuWrapperRef = useRef<HTMLDivElement>(null);
  const startToggleRef = useRef<HTMLButtonElement>(null);
  const startMenuId = useId();

  // Publish the header's height while it is pinned, so in-page sticky columns sit below it.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const root = document.documentElement;
    // The bar slims down once the page scrolls. Layout uses the full height (--site-header-h), so
    // nothing below jumps as it changes; things that hold under the bar while the page is scrolled
    // use the slim one (--site-header-slim-h).
    const publish = () => {
      const pinned = getComputedStyle(el).position === "sticky";
      const strip = el.querySelector<HTMLElement>(".emergency-banner")?.offsetHeight ?? 0;
      const wide = window.matchMedia("(min-width: 1280px)").matches;
      root.style.setProperty("--site-header-h", pinned ? `${strip + (wide ? 80 : 64)}px` : "0px");
      root.style.setProperty("--site-header-slim-h", pinned ? `${strip + (wide ? 64 : 56)}px` : "0px");
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    window.addEventListener("resize", publish);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", publish);
      root.style.removeProperty("--site-header-h");
      root.style.removeProperty("--site-header-slim-h");
    };
  }, []);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerHeight, setDrawerHeight] = useState<number | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [dialerOpen, setDialerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const pathname = usePathname();
  const currentPath = stripLangFromPathname(pathname);
  const { lang, t: rawT } = useLanguage();
  const t = rawT ?? translations[lang || "ro"] ?? translations.ro;
  const tHeader = t.header;
  const chrome = getChromeCopy(lang);

  const isTransparent = currentPath === "/" && !scrolled && !mobileOpen;


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!startMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setStartMenuOpen(false);
        startToggleRef.current?.focus();
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (startMenuWrapperRef.current && !startMenuWrapperRef.current.contains(event.target as Node)) {
        setStartMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [startMenuOpen]);

  useEffect(() => {
    if (typeof document === "undefined" || !document.cookie.includes("session-token")) {
      return;
    }
    void getSession()
      .then((session) => setAuthenticated(Boolean(session)))
      .catch(() => setAuthenticated(false));
  }, []);

  // Phone/tablet menu: lock the page behind it, fit it to the screen, move initial focus inside,
  // trap Tab/Shift+Tab, and close on Escape, browser back/forward, or resizing to xl+.
  useEffect(() => {
    if (!mobileOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const fit = () => {
      if (window.innerWidth >= 1280) {
        setMobileOpen(false);
        return;
      }
      const bottom = headerRef.current?.getBoundingClientRect().bottom ?? 0;
      setDrawerHeight(Math.max(0, Math.ceil(window.innerHeight - bottom) + 1));
    };

    const handlePopState = () => {
      setMobileOpen(false);
    };

    const focusRaf = window.requestAnimationFrame(() => {
      const container = mobileMenuRef.current;
      if (!container) return;
      const firstFocusable = container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      firstFocusable?.focus({ preventScroll: true });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const container = mobileMenuRef.current;
      if (!container) return;
      const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.closest("[inert]") && el.offsetParent !== null,
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!active || active === first || !container.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (!active || active === last || !container.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    fit();
    window.addEventListener("resize", fit);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusRaf);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("resize", fit);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  // Link clicks navigate, so they only close. A close that stays on the page hands focus back to the toggle.
  const closeMobile = () => setMobileOpen(false);
  const closeMobileAndRestoreFocus = () => {
    setMobileOpen(false);
    menuButtonRef.current?.focus();
  };

  const primaryLinks: { label: string; href: NavLinkHref; subtext: string }[] = [
    { label: tHeader.navAfla, href: "/health-information", subtext: tHeader.navAflaSub },
    { label: tHeader.navCere, href: "/health-assistant", subtext: tHeader.navCereSub },
    // Pharmacies first: for many people the pharmacy is the first stop, before a doctor.
    { label: findHelpLinks(lang).nav, href: "/find-help", subtext: findHelpLinks(lang).navDescription },
    { label: tHeader.navMedic, href: "/medic-online", subtext: tHeader.navMedicSub },
    { label: tHeader.navStiri, href: "/stiri", subtext: tHeader.navStiriSub },
  ];

  const isActiveHref = (href: string) =>
    currentPath === href || (href !== "/" && currentPath.startsWith(`${href}/`));

  const portalLink = authenticated
    ? { href: "/panel", label: tHeader.medicalPanel }
    : { href: "/contul-meu", label: tHeader.myAccount };

  const isMediatorsActive = isActiveHref("/mediatori");
  const isPortalActive = isActiveHref(portalLink.href);
  const containerSize = currentPath === "/health-check" ? "workspace" : "default";

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "site-header sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
          // Solid ground once the page moves under it: no translucent glass.
          isTransparent
            ? "border-b border-transparent bg-transparent text-paper"
            : "border-b border-border bg-background text-foreground shadow-2xs dark:border-white/10 dark:bg-ink-950 dark:text-paper",
        )}
      >
        {/* The 112 line rides on top of the bar, so it stays in view while the page scrolls. */}
        <UniversalEmergencyBanner tone={isTransparent ? "dark" : "light"} size={containerSize} />
        <Container size={containerSize}>
          <div
            className={cn(
              "flex items-center justify-between gap-3 transition-[height] duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none xl:gap-4",
              scrolled ? "h-14 xl:h-16" : "h-16 xl:h-20",
            )}
          >
            <Logo
              className="shrink-0 whitespace-nowrap"
              tone={isTransparent ? "light" : "default"}
              href={withLangPrefix("/", lang)}
              label={chrome.homeLink}
            />

            {/* Desktop destinations (from 1280px: five links fit comfortably alongside utilities) */}
            <nav aria-label={chrome.primaryNav} className="hidden shrink-0 xl:block">
              <ul className="flex items-center gap-1">
                {primaryLinks.map((link) => {
                  const isActive = isActiveHref(link.href);

                  return (
                    <li key={link.href}>
                      <Link
                        href={withLangPrefix(link.href, lang)}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "relative flex min-h-11 flex-col justify-center rounded-lg px-3.5 py-1.5 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2",
                          isTransparent
                            ? isActive
                              ? "font-semibold text-white focus-visible:ring-paper/70"
                              : "font-medium text-paper/80 hover:bg-white/10 hover:text-white focus-visible:ring-paper/70"
                            : isActive
                              ? "font-semibold text-sapphire focus-visible:ring-ring dark:text-paper dark:focus-visible:ring-paper"
                              : "font-medium text-foreground/85 hover:bg-muted hover:text-foreground focus-visible:ring-ring dark:text-paper/80 dark:hover:bg-white/10 dark:hover:text-paper dark:focus-visible:ring-paper",
                        )}
                      >
                        <span className="text-sm">{link.label}</span>
                        <span className="sr-only">{link.subtext}</span>
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className={cn(
                              "absolute bottom-0 left-3.5 right-3.5 h-0.5",
                              isTransparent ? "bg-paper" : "bg-sapphire dark:bg-paper",
                            )}
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex shrink-0 items-center gap-1.5 xl:gap-2">
              {/* Compact utility cluster surfaced from md (768px) upward */}
              <div className="hidden shrink-0 items-center gap-1.5 md:flex xl:gap-2">
                <LanguageSelector tone={isTransparent ? "light" : "default"} />

                <Link
                  href={withLangPrefix(portalLink.href, lang)}
                  title={portalLink.label}
                  className={cn(
                    "inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-lg transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2",
                    isTransparent
                      ? "text-paper/85 hover:bg-white/10 hover:text-white focus-visible:ring-paper/70"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground focus-visible:ring-ring dark:text-paper/80 dark:hover:bg-white/10 dark:hover:text-paper dark:focus-visible:ring-paper",
                  )}
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="sr-only">{portalLink.label}</span>
                </Link>

                {/* Split "Start here" CTA + accessible mediator disclosure toggle */}
                <div
                  ref={startMenuWrapperRef}
                  className="relative inline-flex items-center"
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      setStartMenuOpen(false);
                    }
                  }}
                >
                  <div
                    className={cn(
                      "inline-flex items-center rounded-full border shadow-xs transition-all duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:shadow-md",
                      isTransparent
                        ? "border-transparent bg-paper text-foreground hover:bg-white"
                        : "border-ink-950/10 bg-ink-950 text-white hover:bg-ink-900 dark:border-white/10 dark:bg-paper dark:text-ink-950 dark:hover:bg-white",
                    )}
                  >
                    <Link
                      href={withLangPrefix("/health-assistant#triage", lang)}
                      onClick={() => setStartMenuOpen(false)}
                      className={cn(
                        "group/cta inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-l-full pl-4 pr-2 text-sm font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire",
                        isTransparent
                          ? "hover:text-sapphire"
                          : "hover:text-white/85 dark:hover:text-ink-950/80",
                      )}
                    >
                      <span>{tHeader.startHere}</span>
                      <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover/cta:translate-x-0.5" />
                    </Link>

                    {/* Integrated hair-width vertical divider */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-4 w-px shrink-0 transition-opacity duration-[var(--dur-fast)]",
                        isTransparent ? "bg-foreground/15" : "bg-white/20 dark:bg-ink-950/20",
                      )}
                    />

                    <button
                      ref={startToggleRef}
                      type="button"
                      aria-expanded={startMenuOpen}
                      aria-controls={startMenuId}
                      aria-label={tHeader.forMediators}
                      onClick={() => setStartMenuOpen((prev) => !prev)}
                      className={cn(
                        "inline-flex min-h-10 w-9 items-center justify-center rounded-r-full pr-1.5 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire",
                        isTransparent
                          ? "hover:text-sapphire"
                          : "hover:text-white/85 dark:hover:text-ink-950/80",
                      )}
                    >
                      <ChevronDownIcon
                        className={cn(
                          "h-3.5 w-3.5 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none",
                          startMenuOpen && "rotate-180",
                        )}
                      />
                    </button>
                  </div>

                  <div
                    id={startMenuId}
                    inert={!startMenuOpen}
                    className={cn(
                      "absolute right-0 top-full z-50 pt-2 transition-[opacity,transform,visibility] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none",
                      startMenuOpen
                        ? "visible translate-y-0 opacity-100"
                        : "pointer-events-none invisible -translate-y-1.5 opacity-0",
                    )}
                  >
                    <div className="w-80 rounded-2xl border border-stone-200/90 bg-card/95 p-2 text-left text-foreground shadow-xl shadow-ink-950/10 backdrop-blur-md dark:border-stone-800 dark:bg-ink-900/95 dark:shadow-black/40">
                      <Link
                        href={withLangPrefix("/health-assistant#triage", lang)}
                        onClick={() => setStartMenuOpen(false)}
                        className="group flex items-center gap-3.5 rounded-xl p-2.5 transition-all duration-[var(--dur-fast)] hover:bg-muted/80 dark:hover:bg-white/5"
                      >
                        <IconTile
                          icon={NAV_LINK_ICONS["/health-assistant"]}
                          size={40}
                          className="transition-transform duration-[var(--dur-fast)] group-hover:scale-105"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] group-hover:text-sapphire dark:group-hover:text-sapphire-light">
                            {tHeader.navCere}
                          </span>
                          <span className="mt-0.5 block text-xs leading-normal text-muted-foreground">
                            {tHeader.navCereSub}
                          </span>
                        </span>
                        <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform duration-[var(--dur-fast)] group-hover:translate-x-0.5 group-hover:text-sapphire" />
                      </Link>

                      <Link
                        href={withLangPrefix("/mediatori", lang)}
                        onClick={() => setStartMenuOpen(false)}
                        className="group mt-1 flex items-center gap-3.5 rounded-xl p-2.5 transition-all duration-[var(--dur-fast)] hover:bg-muted/80 dark:hover:bg-white/5"
                      >
                        <IconTile
                          icon={NAV_LINK_ICONS["/mediatori"]}
                          tone="amber"
                          size={40}
                          className="transition-transform duration-[var(--dur-fast)] group-hover:scale-105"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] group-hover:text-amber-700 dark:group-hover:text-amber-400">
                            {tHeader.forMediators}
                          </span>
                          <span className="mt-0.5 block text-xs leading-normal text-muted-foreground">
                            {tHeader.forMediatorsSub}
                          </span>
                        </span>
                        <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform duration-[var(--dur-fast)] group-hover:translate-x-0.5 group-hover:text-amber-600" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu button (phones, tablets and small laptops below xl) */}
              <button
                ref={menuButtonRef}
                type="button"
                className={cn(
                  "inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-(--radius-control) transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 xl:hidden",
                  isTransparent
                    ? "text-paper press-on-dark hover:bg-white/10 focus-visible:ring-paper/70"
                    : "text-foreground press-row hover:bg-muted focus-visible:ring-ring dark:text-paper dark:hover:bg-white/10 dark:focus-visible:ring-paper",
                )}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                aria-label={mobileOpen ? tHeader.closeMenu : tHeader.openMenu}
                onClick={() => setMobileOpen((open) => !open)}
              >
                {mobileOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </Container>

        {/* Scrim behind the phone/tablet menu, anchored below the header. */}
        <div
          aria-hidden="true"
          onClick={closeMobileAndRestoreFocus}
          style={{ top: "var(--site-header-h, 4rem)" }}
          className={cn(
            "fixed inset-x-0 bottom-0 z-40 bg-ink-950/45 transition-[opacity,visibility] duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none print:hidden xl:hidden",
            mobileOpen ? "visible opacity-100" : "pointer-events-none invisible opacity-0",
          )}
        />

        {/* Phone/tablet menu: full-screen below the bar, traps Tab focus, and scrolls independently. */}
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          role="dialog"
          aria-modal={mobileOpen ? "true" : undefined}
          aria-label={chrome.primaryNav}
          inert={!mobileOpen}
          style={{ height: drawerHeight ?? "calc(100dvh - var(--site-header-h, 4rem))" }}
          className={cn(
            "absolute inset-x-0 top-full z-50 overflow-y-auto overscroll-contain border-t border-border bg-background text-foreground shadow-(--shadow-card-hover) dark:border-white/10 dark:bg-ink-950 dark:text-paper print:hidden xl:hidden",
            "transition-[opacity,translate,visibility] duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
            mobileOpen
              ? "visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-2 opacity-0",
          )}
        >
          <Container className="flex min-h-full flex-col gap-2.5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            {/* 112 strip: calm, high-clarity emergency row at the top. */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-primary/15 bg-primary-soft/65 px-3.5 py-2.5 dark:border-ruby-300/25 dark:bg-primary-soft/12">
              <div className="min-w-36 flex-1 wrap-break-word">
                <p className="text-[13.5px] font-semibold leading-tight text-foreground dark:text-paper">
                  {tHeader.emergencyTitle}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground dark:text-mist">
                  {tHeader.emergencyCallPrompt}
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  setMobileOpen(false);
                  setDialerOpen(true);
                }}
                className="min-h-9.5 shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-none dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink-950"
              >
                <PhoneIcon className="h-3.5 w-3.5" />
                <span>{tHeader.call112}</span>
              </Button>
            </div>

            {/* Minimalist top utility pair: Language + Account side-by-side; language list expands full-width below. */}
            <div className="grid grid-cols-2 gap-2">
              <LanguageSelector variant="drawer" gridPaired onNavigate={closeMobile} />

              <Link
                href={withLangPrefix(portalLink.href, lang)}
                aria-current={isPortalActive ? "page" : undefined}
                onClick={closeMobile}
                className={cn(
                  "order-2 flex min-h-10 items-center gap-2 rounded-xl border px-3 py-1.5 text-[13.5px] font-medium text-foreground dark:text-paper",
                  DRAWER_ROW_MOTION,
                  DRAWER_FOCUS,
                  isPortalActive
                    ? "border-sapphire bg-sapphire-soft/45 font-semibold text-sapphire dark:border-paper dark:bg-white/10 dark:text-paper"
                    : "border-border/75 bg-muted/40 hover:bg-muted/75 dark:border-white/12 dark:bg-white/5 dark:hover:bg-white/10",
                )}
              >
                <UserIcon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isPortalActive ? "text-sapphire dark:text-paper" : "text-muted-foreground dark:text-mist",
                  )}
                />
                <span className="min-w-0 flex-1 truncate">{portalLink.label}</span>
                <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted-foreground/65 dark:text-mist/70" />
              </Link>
            </div>

            {/* Five patient destinations: clean hairline list with understated monochrome icons. */}
            <nav aria-label={chrome.primaryNav}>
              <ul className="divide-y divide-border/65 border-y border-border/65 dark:divide-white/10 dark:border-white/10">
                {primaryLinks.map((link) => {
                  const isActive = isActiveHref(link.href);
                  const NavIcon = NAV_LINK_ICONS[link.href];

                  return (
                    <li key={link.href}>
                      <Link
                        href={withLangPrefix(link.href, lang)}
                        aria-current={isActive ? "page" : undefined}
                        onClick={closeMobile}
                        className={cn(
                          "group relative flex min-h-13 items-center gap-3 px-2 py-2",
                          DRAWER_ROW_MOTION,
                          DRAWER_FOCUS,
                          isActive
                            ? "bg-sapphire-soft/55 dark:bg-white/10"
                            : "hover:bg-muted/55 dark:hover:bg-white/5",
                        )}
                      >
                        {isActive && (
                          <span aria-hidden="true" className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-sapphire dark:bg-paper" />
                        )}
                        <span
                          aria-hidden="true"
                          className={cn(
                            "flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg transition-colors duration-(--dur-fast)",
                            isActive
                              ? "bg-sapphire text-white"
                              : "bg-muted/70 text-foreground/75 group-hover:bg-muted group-hover:text-foreground dark:bg-white/8 dark:text-paper/80",
                          )}
                        >
                          <NavIcon className="h-4.5 w-4.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block text-[15px] leading-tight",
                              isActive
                                ? "font-semibold text-sapphire dark:text-paper"
                                : "font-medium text-foreground dark:text-paper",
                            )}
                          >
                            {link.label}
                          </span>
                          <span className="mt-0.5 block line-clamp-1 text-xs leading-snug text-muted-foreground dark:text-mist">
                            {link.subtext}
                          </span>
                        </span>
                        <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted-foreground/55 transition-transform duration-(--dur-fast) group-hover:translate-x-0.5 dark:text-mist/60" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <Button
              href={withLangPrefix("/health-assistant#triage", lang)}
              onClick={closeMobile}
              variant="action"
              fullWidth
              className="min-h-11 rounded-xl text-sm font-semibold shadow-none dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink-950"
            >
              <span>{tHeader.startHere}</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Button>

            {/* Health mediators: quiet neutral card with a restrained amber icon accent. */}
            <Link
              href={withLangPrefix("/mediatori", lang)}
              aria-current={isMediatorsActive ? "page" : undefined}
              onClick={closeMobile}
              className={cn(
                "group flex min-h-12.5 items-center gap-3 rounded-xl border px-3 py-2",
                DRAWER_ROW_MOTION,
                DRAWER_FOCUS,
                isMediatorsActive
                  ? "border-amber-care/50 bg-amber-care-soft/65 dark:bg-amber-care/20"
                  : "border-border/75 bg-muted/30 hover:bg-muted/65 dark:border-white/12 dark:bg-white/5 dark:hover:bg-white/10",
              )}
            >
              <span
                aria-hidden="true"
                className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg bg-amber-care/14 text-amber-care dark:bg-amber-care/25 dark:text-amber-200"
              >
                {(() => {
                  const MediatorIcon = NAV_LINK_ICONS["/mediatori"];
                  return <MediatorIcon className="h-4.5 w-4.5" />;
                })()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium leading-tight text-foreground dark:text-paper">
                  {tHeader.forMediators}
                </span>
                <span className="mt-0.5 block line-clamp-1 text-xs leading-snug text-muted-foreground dark:text-mist">
                  {tHeader.forMediatorsSub}
                </span>
              </span>
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted-foreground/55 transition-transform duration-(--dur-fast) group-hover:translate-x-0.5 dark:text-mist/60" />
            </Link>

            {/* Minimalist bottom utility bar: clean monochrome inline actions separated by hairlines. */}
            <div className="mt-auto border-t border-border/65 pt-2.5 dark:border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-x-1 gap-y-1">
                <a
                  href="https://www.redi-ngo.eu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobile}
                  className={cn(
                    "group inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/70 hover:text-foreground dark:text-mist dark:hover:bg-white/8 dark:hover:text-paper",
                    DRAWER_ROW_MOTION,
                    DRAWER_FOCUS,
                  )}
                >
                  <GlobeIcon className="h-4 w-4 shrink-0 text-foreground/65 transition-colors duration-(--dur-fast) group-hover:text-sapphire dark:text-paper/70 dark:group-hover:text-paper" />
                  <span>redi-ngo.eu</span>
                  <ExternalLinkIcon className="h-3 w-3 shrink-0 opacity-55 transition-opacity duration-(--dur-fast) group-hover:opacity-100" />
                </a>

                <span aria-hidden="true" className="h-3.5 w-px bg-border/80 max-[374px]:hidden dark:bg-white/12" />

                <button
                  type="button"
                  onClick={() => {
                    closeMobile();
                    openSiteFeedback();
                  }}
                  className={cn(
                    "group inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/70 hover:text-foreground dark:text-mist dark:hover:bg-white/8 dark:hover:text-paper",
                    DRAWER_ROW_MOTION,
                    DRAWER_FOCUS,
                  )}
                >
                  <MessageDotsIcon className="h-4 w-4 shrink-0 text-foreground/65 transition-colors duration-(--dur-fast) group-hover:text-sapphire dark:text-paper/70 dark:group-hover:text-paper" />
                  <span>{(feedbackWidgetCopy[lang] ?? feedbackWidgetCopy.ro).compactTriggerLabel}</span>
                </button>

                <span aria-hidden="true" className="h-3.5 w-px bg-border/80 max-[374px]:hidden dark:bg-white/12" />

                <Link
                  href={withLangPrefix("/report-issue", lang)}
                  onClick={(event) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
                      closeMobile();
                      return;
                    }
                    closeMobile();
                    if (openReportIssue()) {
                      event.preventDefault();
                    }
                  }}
                  className={cn(
                    "group inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/70 hover:text-foreground dark:text-mist dark:hover:bg-white/8 dark:hover:text-paper",
                    DRAWER_ROW_MOTION,
                    DRAWER_FOCUS,
                  )}
                >
                  <AlertCircleIcon className="h-4 w-4 shrink-0 text-foreground/65 transition-colors duration-(--dur-fast) group-hover:text-primary dark:text-paper/70 dark:group-hover:text-ruby-300" />
                  <span>{(reportIssueCopy[lang] ?? reportIssueCopy.ro).trigger}</span>
                </Link>
              </div>
            </div>
          </Container>
        </div>
      </header>

      <EmergencyDialerGate open={dialerOpen} onOpenChange={setDialerOpen} />
    </>
  );
}
