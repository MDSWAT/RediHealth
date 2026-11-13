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
  SearchIcon,
  UserIcon,
} from "@/components/ui/icons";
import { openSiteFeedback } from "@/components/layout/FeedbackWidget";
import { ComfortMenu } from "@/components/layout/ComfortMenu";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { openReportIssue, reportIssueCopy } from "@/components/layout/ReportIssueWidget";
import { NAV_LINK_ICONS, type NavLinkHref } from "@/components/layout/nav-links";
import { getChromeCopy } from "@/components/layout/chrome-copy";
import { openSmartSearch } from "@/components/search/smart-search-events";
import { EmergencyDialerGate } from "@/components/emergency/EmergencyDialerGate";
import { cn } from "@/lib/cn";
import { feedbackWidgetCopy } from "@/lib/i18n/feedback-translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix, stripLangFromPathname } from "@/lib/i18n/routing";
import { getSmartSearchCopy } from "@/lib/i18n/smart-search-copy";
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
    // Constant height (h-16) prevents sticky scroll-height oscillation across scroll thresholds.
    const publish = () => {
      const pinned = getComputedStyle(el).position === "sticky";
      const strip = el.querySelector<HTMLElement>(".emergency-banner")?.offsetHeight ?? 0;
      const height = pinned ? `${strip + 64}px` : "0px";
      root.style.setProperty("--site-header-h", height);
      root.style.setProperty("--site-header-slim-h", height);
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
  const [openDrawerSection, setOpenDrawerSection] = useState<"language" | "comfort" | null>(null);
  const [openHeaderMenu, setOpenHeaderMenu] = useState<"comfort" | "language" | "start" | null>(null);
  const [drawerHeight, setDrawerHeight] = useState<number | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [dialerOpen, setDialerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const currentPath = stripLangFromPathname(pathname);
  const { lang, t: rawT } = useLanguage();
  const t = rawT ?? translations[lang || "ro"] ?? translations.ro;
  const tHeader = t.header;
  const chrome = getChromeCopy(lang);
  const searchCopy = getSmartSearchCopy(lang);

  const startMenuOpen = openHeaderMenu === "start";
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
        setOpenHeaderMenu(null);
        startToggleRef.current?.focus();
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (startMenuWrapperRef.current && !startMenuWrapperRef.current.contains(event.target as Node)) {
        setOpenHeaderMenu((prev) => (prev === "start" ? null : prev));
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
        setOpenDrawerSection(null);
        setMobileOpen(false);
        return;
      }
      const bottom = headerRef.current?.getBoundingClientRect().bottom ?? 0;
      setDrawerHeight(Math.max(0, Math.ceil(window.innerHeight - bottom) + 1));
    };

    const handlePopState = () => {
      setOpenDrawerSection(null);
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
        setOpenDrawerSection(null);
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
  const closeMobile = () => {
    setOpenDrawerSection(null);
    setMobileOpen(false);
  };
  const closeMobileAndRestoreFocus = () => {
    setOpenDrawerSection(null);
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

  const isGuidanceRoute =
    currentPath === "/health-assistant" ||
    currentPath.startsWith("/health-assistant/") ||
    currentPath === "/health-check" ||
    currentPath.startsWith("/health-check/") ||
    currentPath === "/prescription-review" ||
    currentPath.startsWith("/prescription-review/");

  const isActiveHref = (href: string) => {
    if (href === "/health-assistant") return isGuidanceRoute;
    return currentPath === href || (href !== "/" && currentPath.startsWith(`${href}/`));
  };

  const portalLink = authenticated
    ? { href: "/panel", label: tHeader.medicalPanel }
    : { href: "/contul-meu", label: tHeader.myAccount };

  const isMediatorsActive = isActiveHref("/mediatori");
  const isPortalActive = isActiveHref(portalLink.href);
  const containerSize = "workspace";

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
          <div className="flex h-16 items-center justify-between gap-3 xl:gap-5">
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
                        onClick={() => setOpenHeaderMenu(null)}
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
                        <span className="whitespace-nowrap text-sm">{link.label}</span>
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

            <div className="flex shrink-0 items-center gap-0.5 md:gap-1.5 xl:gap-2">
              {/* Compact utility cluster surfaced from md (768px) upward */}
              <div className="hidden shrink-0 items-center gap-1.5 md:flex xl:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpenHeaderMenu(null);
                    openSmartSearch();
                  }}
                  aria-label={searchCopy.triggerLabel}
                  className={cn(
                    "inline-flex h-11 min-h-11 min-w-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-2.5 text-[13.5px] font-medium transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 xl:px-3",
                    isTransparent
                      ? "press-on-dark border-white/20 bg-white/10 text-white/95 hover:bg-white/18 focus-visible:ring-paper/70"
                      : "press-row border-border-control/75 bg-card text-foreground hover:border-sapphire/50 hover:bg-sapphire-soft/25 focus-visible:ring-ring dark:border-paper/14 dark:bg-ink-950 dark:text-paper dark:hover:bg-white/10 dark:focus-visible:ring-paper",
                  )}
                >
                  <SearchIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap">{searchCopy.triggerLabel}</span>
                </button>
                <ComfortMenu
                  tone={isTransparent ? "light" : "default"}
                  open={openHeaderMenu === "comfort"}
                  onOpenChange={(next) =>
                    setOpenHeaderMenu((prev) => (next ? "comfort" : prev === "comfort" ? null : prev))
                  }
                  onDone={() => setOpenHeaderMenu(null)}
                />
                <LanguageSelector
                  tone={isTransparent ? "light" : "default"}
                  open={openHeaderMenu === "language"}
                  onOpenChange={(next) =>
                    setOpenHeaderMenu((prev) => (next ? "language" : prev === "language" ? null : prev))
                  }
                  onNavigate={() => setOpenHeaderMenu(null)}
                />

                <Link
                  href={withLangPrefix(portalLink.href, lang)}
                  onClick={() => setOpenHeaderMenu(null)}
                  title={portalLink.label}
                  aria-label={portalLink.label}
                  className={cn(
                    "press-row inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg px-0 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2",
                    isTransparent
                      ? "text-paper/85 hover:bg-white/10 hover:text-white focus-visible:ring-paper/70"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground focus-visible:ring-ring dark:text-paper/80 dark:hover:bg-white/10 dark:hover:text-paper dark:focus-visible:ring-paper",
                  )}
                >
                  <UserIcon className="h-5 w-5 shrink-0" />
                  <span className="sr-only">{portalLink.label}</span>
                </Link>

                {/* Split "Start here" CTA + accessible mediator disclosure toggle */}
                <div
                  ref={startMenuWrapperRef}
                  className="relative inline-flex items-center"
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      setOpenHeaderMenu((prev) => (prev === "start" ? null : prev));
                    }
                  }}
                >
                  <div
                    className={cn(
                      "inline-flex items-center rounded-xl border shadow-xs transition-all duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:shadow-md",
                      isTransparent
                        ? "border-transparent bg-paper text-foreground hover:bg-white"
                        : "border-ink-950/10 bg-ink-950 text-white hover:bg-ink-900 dark:border-white/10 dark:bg-paper dark:text-ink-950 dark:hover:bg-white",
                    )}
                  >
                    <Link
                      href={withLangPrefix("/health-assistant#triage", lang)}
                      onClick={() => setOpenHeaderMenu(null)}
                      className={cn(
                        "inline-flex min-h-11 items-center whitespace-nowrap rounded-l-xl pl-4 pr-3 text-sm font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isTransparent
                          ? "hover:text-sapphire"
                          : "hover:text-white/85 dark:hover:text-ink-950/80",
                      )}
                    >
                      <span>{tHeader.startHere}</span>
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
                      onClick={() =>
                        setOpenHeaderMenu((prev) => (prev === "start" ? null : "start"))
                      }
                      className={cn(
                        "inline-flex min-h-11 w-9 items-center justify-center whitespace-nowrap rounded-r-xl pr-0.5 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
                        onClick={() => setOpenHeaderMenu(null)}
                        className="group flex items-center gap-3.5 rounded-xl p-2.5 transition-colors duration-[var(--dur-fast)] motion-reduce:transition-none hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-white/5"
                      >
                        <IconTile
                          icon={NAV_LINK_ICONS["/health-assistant"]}
                          size={40}
                          className="transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] motion-reduce:transition-none group-hover:text-sapphire dark:group-hover:text-sapphire-light">
                            {tHeader.navCere}
                          </span>
                          <span className="mt-0.5 block text-xs leading-normal text-muted-foreground">
                            {tHeader.navCereSub}
                          </span>
                        </span>
                        <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-[color,transform] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none group-hover:translate-x-0.5 group-hover:text-sapphire" />
                      </Link>

                      <Link
                        href={withLangPrefix("/mediatori", lang)}
                        onClick={() => setOpenHeaderMenu(null)}
                        className="group mt-1 flex items-center gap-3.5 rounded-xl p-2.5 transition-colors duration-[var(--dur-fast)] motion-reduce:transition-none hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-white/5"
                      >
                        <IconTile
                          icon={NAV_LINK_ICONS["/mediatori"]}
                          tone="amber"
                          size={40}
                          className="transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] motion-reduce:transition-none group-hover:text-amber-care dark:group-hover:text-amber-care-border">
                            {tHeader.forMediators}
                          </span>
                          <span className="mt-0.5 block text-xs leading-normal text-muted-foreground">
                            {tHeader.forMediatorsSub}
                          </span>
                        </span>
                        <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-[color,transform] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none group-hover:translate-x-0.5 group-hover:text-amber-care" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile quick search & comfort controls (hidden once the drawer opens) */}
              {!mobileOpen && (
                <div className="flex items-center gap-0.5 md:hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenHeaderMenu(null);
                      openSmartSearch();
                    }}
                    aria-label={searchCopy.triggerLabel}
                    title={searchCopy.triggerLabel}
                    className={cn(
                      "inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center whitespace-nowrap rounded-lg transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2",
                      isTransparent
                        ? "press-on-dark text-paper/90 hover:bg-white/10 hover:text-white focus-visible:ring-paper/70"
                        : "press-row text-foreground/85 hover:bg-muted hover:text-foreground focus-visible:ring-ring dark:text-paper/85 dark:hover:bg-white/10 dark:hover:text-paper dark:focus-visible:ring-paper",
                    )}
                  >
                    <SearchIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  </button>
                  <ComfortMenu tone={isTransparent ? "light" : "default"} />
                </div>
              )}

              {/* Menu button (phones, tablets and small laptops below xl) */}
              <button
                ref={menuButtonRef}
                type="button"
                className={cn(
                  "inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center whitespace-nowrap rounded-lg transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 xl:hidden",
                  isTransparent
                    ? "text-paper/90 press-on-dark hover:bg-white/10 hover:text-white focus-visible:ring-paper/70"
                    : "text-foreground/85 press-row hover:bg-muted hover:text-foreground focus-visible:ring-ring dark:text-paper/85 dark:hover:bg-white/10 dark:hover:text-paper dark:focus-visible:ring-paper",
                )}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                aria-label={mobileOpen ? tHeader.closeMenu : tHeader.openMenu}
                onClick={() => {
                  setOpenHeaderMenu(null);
                  setMobileOpen((open) => {
                    if (open) setOpenDrawerSection(null);
                    return !open;
                  });
                }}
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
            "absolute inset-x-0 top-full z-50 overflow-y-auto overscroll-contain border-t border-border bg-paper text-foreground shadow-(--shadow-card-hover) dark:border-white/10 dark:bg-ink-950 dark:text-paper print:hidden xl:hidden",
            "transition-[opacity,translate,visibility] duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
            mobileOpen
              ? "visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-2 opacity-0",
          )}
        >
          <Container className="mx-auto flex min-h-full w-full max-w-xl flex-col gap-3 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => {
                closeMobile();
                openSmartSearch();
              }}
              className={cn(
                "flex min-h-12 w-full max-w-full items-center gap-3 whitespace-nowrap rounded-xl border border-ink-900/12 bg-white px-3.5 py-2.5 text-left text-ink-900 press-row transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:border-ink-900/20 hover:bg-ink-900/[0.02] dark:border-paper/14 dark:bg-ink-900 dark:text-paper dark:hover:bg-white/[0.06]",
                DRAWER_FOCUS,
              )}
            >
              <SearchIcon className="h-4.5 w-4.5 shrink-0 text-ink-900/50 dark:text-paper/55" aria-hidden="true" />
              <span className="min-w-0 flex-1 overflow-hidden text-ellipsis text-[15px] text-ink-900/65 dark:text-paper/65">
                {searchCopy.triggerPlaceholder}
              </span>
            </button>

            {/* Primary destinations */}
            <nav aria-label={chrome.primaryNav}>
              <ul className="divide-y divide-ink-900/8 dark:divide-white/10">
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
                          "group flex min-h-12 items-center gap-3 rounded-lg px-2.5 py-2.5",
                          DRAWER_ROW_MOTION,
                          DRAWER_FOCUS,
                          isActive
                            ? "bg-sapphire/[0.06] dark:bg-white/[0.07]"
                            : "hover:bg-ink-900/[0.035] dark:hover:bg-white/[0.05]",
                        )}
                      >
                        <NavIcon
                          className={cn(
                            "h-4.5 w-4.5 shrink-0 transition-colors duration-(--dur-fast)",
                            isActive
                              ? "text-sapphire dark:text-sapphire-border"
                              : "text-ink-900/50 group-hover:text-foreground dark:text-paper/55 dark:group-hover:text-paper",
                          )}
                          aria-hidden="true"
                        />
                        <span
                          className={cn(
                            "min-w-0 flex-1 text-[16px] leading-snug",
                            isActive
                              ? "font-semibold text-sapphire dark:text-paper"
                              : "font-medium text-foreground dark:text-paper",
                          )}
                        >
                          {link.label}
                          <span className="sr-only"> — {link.subtext}</span>
                        </span>
                        <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-900/35 transition-transform duration-(--dur-fast) group-hover:translate-x-0.5 dark:text-paper/35" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Secondary & Preferences */}
            <div className="border-t border-ink-900/10 pt-2 dark:border-white/10">
              <div className="divide-y divide-ink-900/8 dark:divide-white/10">
                <Link
                  href={withLangPrefix(portalLink.href, lang)}
                  aria-current={isPortalActive ? "page" : undefined}
                  onClick={closeMobile}
                  className={cn(
                    "group flex min-h-12 items-center gap-3 rounded-lg px-2.5 py-2.5",
                    DRAWER_ROW_MOTION,
                    DRAWER_FOCUS,
                    isPortalActive
                      ? "bg-sapphire/[0.06] dark:bg-white/[0.07]"
                      : "hover:bg-ink-900/[0.035] dark:hover:bg-white/[0.05]",
                  )}
                >
                  <UserIcon
                    className={cn(
                      "h-4.5 w-4.5 shrink-0 transition-colors duration-(--dur-fast)",
                      isPortalActive
                        ? "text-sapphire dark:text-sapphire-border"
                        : "text-ink-900/50 group-hover:text-foreground dark:text-paper/55 dark:group-hover:text-paper",
                    )}
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      "min-w-0 flex-1 text-[15.5px] leading-snug",
                      isPortalActive
                        ? "font-semibold text-sapphire dark:text-paper"
                        : "font-medium text-foreground dark:text-paper",
                    )}
                  >
                    {portalLink.label}
                  </span>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-900/35 transition-transform duration-(--dur-fast) group-hover:translate-x-0.5 dark:text-paper/35" />
                </Link>

                <Link
                  href={withLangPrefix("/mediatori", lang)}
                  aria-current={isMediatorsActive ? "page" : undefined}
                  onClick={closeMobile}
                  className={cn(
                    "group flex min-h-12 items-center gap-3 rounded-lg px-2.5 py-2.5",
                    DRAWER_ROW_MOTION,
                    DRAWER_FOCUS,
                    isMediatorsActive
                      ? "bg-amber-care/[0.08] dark:bg-amber-care/20"
                      : "hover:bg-ink-900/[0.035] dark:hover:bg-white/[0.05]",
                  )}
                >
                  {(() => {
                    const MediatorIcon = NAV_LINK_ICONS["/mediatori"];
                    return (
                      <MediatorIcon
                        className="h-4.5 w-4.5 shrink-0 text-amber-care dark:text-amber-200"
                        aria-hidden="true"
                      />
                    );
                  })()}
                  <span
                    className={cn(
                      "min-w-0 flex-1 text-[15.5px] leading-snug",
                      isMediatorsActive
                        ? "font-semibold text-foreground dark:text-paper"
                        : "font-medium text-foreground dark:text-paper",
                    )}
                  >
                    {tHeader.forMediators}
                    <span className="sr-only"> — {tHeader.forMediatorsSub}</span>
                  </span>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-900/35 transition-transform duration-(--dur-fast) group-hover:translate-x-0.5 dark:text-paper/35" />
                </Link>

                <LanguageSelector
                  variant="drawer"
                  listRow
                  open={openDrawerSection === "language"}
                  onOpenChange={(next) =>
                    setOpenDrawerSection((prev) => (next ? "language" : prev === "language" ? null : prev))
                  }
                  onNavigate={closeMobile}
                />

                <ComfortMenu
                  variant="drawer"
                  collapsible
                  open={openDrawerSection === "comfort"}
                  onOpenChange={(next) =>
                    setOpenDrawerSection((prev) => (next ? "comfort" : prev === "comfort" ? null : prev))
                  }
                  onDone={closeMobile}
                />
              </div>
            </div>

            {/* Bottom 112 emergency row and quiet utility links */}
            <div className="mt-auto space-y-2 border-t border-ink-900/10 pt-3 dark:border-white/10">
              <div className="flex min-h-11 items-center justify-between gap-3 px-2.5 py-1">
                <p className="text-sm font-medium text-foreground dark:text-paper">
                  {chrome.emergencyQuestion}
                </p>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    setOpenDrawerSection(null);
                    setMobileOpen(false);
                    setDialerOpen(true);
                  }}
                  className="min-h-11 shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shadow-none dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink-950"
                >
                  <PhoneIcon className="h-3.5 w-3.5" />
                  <span>{tHeader.call112}</span>
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-1 gap-y-1 border-t border-ink-900/8 pt-2 dark:border-white/10">
                <a
                  href="https://www.redi-ngo.eu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobile}
                  className={cn(
                    "group inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/70 hover:text-foreground dark:text-mist dark:hover:bg-white/8 dark:hover:text-paper",
                    DRAWER_ROW_MOTION,
                    DRAWER_FOCUS,
                  )}
                >
                  <GlobeIcon className="h-4 w-4 shrink-0 text-foreground/65 transition-colors duration-(--dur-fast) group-hover:text-sapphire dark:text-paper/70 dark:group-hover:text-paper" />
                  <span>redi-ngo.eu</span>
                  <ExternalLinkIcon className="h-3 w-3 shrink-0 opacity-55 transition-opacity duration-(--dur-fast) group-hover:opacity-100" />
                </a>

                <span aria-hidden="true" className="h-3 w-px bg-ink-900/15 max-[374px]:hidden dark:bg-white/12" />

                <button
                  type="button"
                  onClick={() => {
                    closeMobile();
                    openSiteFeedback();
                  }}
                  className={cn(
                    "group inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/70 hover:text-foreground dark:text-mist dark:hover:bg-white/8 dark:hover:text-paper",
                    DRAWER_ROW_MOTION,
                    DRAWER_FOCUS,
                  )}
                >
                  <MessageDotsIcon className="h-4 w-4 shrink-0 text-foreground/65 transition-colors duration-(--dur-fast) group-hover:text-sapphire dark:text-paper/70 dark:group-hover:text-paper" />
                  <span>{(feedbackWidgetCopy[lang] ?? feedbackWidgetCopy.ro).compactTriggerLabel}</span>
                </button>

                <span aria-hidden="true" className="h-3 w-px bg-ink-900/15 max-[374px]:hidden dark:bg-white/12" />

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
                    "group inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/70 hover:text-foreground dark:text-mist dark:hover:bg-white/8 dark:hover:text-paper",
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
