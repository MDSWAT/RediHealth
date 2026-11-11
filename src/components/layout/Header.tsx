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
  CloseIcon,
  MenuIcon,
  PhoneIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserIcon,
} from "@/components/ui/icons";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { NAV_LINK_ICONS, type NavLinkHref } from "@/components/layout/nav-links";
import { getChromeCopy } from "@/components/layout/chrome-copy";
import { EmergencyDialerGate } from "@/components/emergency/EmergencyDialerGate";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix, stripLangFromPathname } from "@/lib/i18n/routing";
import { translations } from "@/lib/i18n/translations";
import { findHelpLinks } from "@/lib/i18n/find-help-links";

const FOCUSABLE_SELECTOR =
  'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';

/** A row of the desktop "Start here" dropdown: icon tile, text, pressed colour. */
const MENU_ROW =
  "group flex items-center gap-3 p-3 press-row focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring dark:focus-visible:ring-paper transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none";
const MENU_ROW_LABEL = "block text-body font-semibold leading-snug text-foreground dark:text-paper";
const MENU_ROW_TEXT = "mt-0.5 block text-body leading-snug text-muted-foreground dark:text-mist";

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
        <UniversalEmergencyBanner tone={isTransparent ? "dark" : "light"} />
        <Container>
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

        {/* Phone/tablet menu: opens under the bar, traps Tab focus, and scrolls independently. */}
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          role="dialog"
          aria-modal={mobileOpen ? "true" : undefined}
          aria-label={chrome.primaryNav}
          inert={!mobileOpen}
          style={{ maxHeight: drawerHeight ?? "calc(100dvh - var(--site-header-h, 4rem))" }}
          className={cn(
            "absolute inset-x-0 top-full z-50 overflow-y-auto overscroll-contain border-t border-border bg-background text-foreground shadow-(--shadow-card-hover) dark:border-white/10 dark:bg-ink-950 dark:text-paper print:hidden xl:hidden",
            "transition-[opacity,translate,visibility] duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
            mobileOpen
              ? "visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-2 opacity-0",
          )}
        >
          <Container className="flex flex-col gap-4 py-4 pb-[calc(2rem+env(safe-area-inset-bottom))]">
            {/* 112 card: always the first thing in the menu. The button wraps below the text on narrow screens. */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-(--radius-surface) border border-primary/25 bg-primary-soft p-4 dark:border-ruby-300/30 dark:bg-primary-soft/15">
              <div className="min-w-40 flex-1 wrap-break-word">
                <p className="text-body font-semibold leading-snug text-foreground dark:text-paper">
                  {tHeader.emergencyTitle}
                </p>
                <p className="mt-0.5 text-body leading-snug text-muted-foreground dark:text-mist">
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
                className="shrink-0 dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink-950"
              >
                <PhoneIcon className="h-5 w-5" />
                <span>{tHeader.call112}</span>
              </Button>
            </div>

            <LanguageSelector variant="drawer" onNavigate={closeMobile} />

            {/* Five patient destinations as one divided list. */}
            <nav aria-label={chrome.primaryNav}>
              <ul className="divide-y divide-border border-y border-border dark:divide-white/10 dark:border-white/10">
                {primaryLinks.map((link) => {
                  const isActive = isActiveHref(link.href);

                  return (
                    <li key={link.href}>
                      <Link
                        href={withLangPrefix(link.href, lang)}
                        aria-current={isActive ? "page" : undefined}
                        onClick={closeMobile}
                        className={cn(
                          "relative flex min-h-16 items-center gap-3.5 px-3 py-3",
                          DRAWER_ROW_MOTION,
                          DRAWER_FOCUS,
                          isActive
                            ? "bg-sapphire-soft dark:bg-white/10"
                            : "hover:bg-muted dark:hover:bg-white/5",
                        )}
                      >
                        {isActive && (
                          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.75 bg-sapphire dark:bg-paper" />
                        )}
                        <IconTile
                          icon={NAV_LINK_ICONS[link.href]}
                          tone={isActive ? "sapphire-solid" : "sapphire-soft"}
                          size={40}
                        />
                        <span className="min-w-0 flex-1 wrap-break-word">
                          <span
                            className={cn(
                              "block text-[17px] font-semibold leading-snug",
                              isActive ? "text-sapphire dark:text-paper" : "text-foreground dark:text-paper",
                            )}
                          >
                            {link.label}
                          </span>
                          <span className="mt-0.5 block text-body leading-snug text-muted-foreground dark:text-mist">
                            {link.subtext}
                          </span>
                        </span>
                        <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted-foreground dark:text-mist" />
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
              className="min-h-12 dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink-950"
            >
              <span>{tHeader.startHere}</span>
              <ArrowRightIcon className="h-5 w-5" />
            </Button>

            {/* Health mediators: amber, the colour of a person who helps. */}
            <Link
              href={withLangPrefix("/mediatori", lang)}
              aria-current={isMediatorsActive ? "page" : undefined}
              onClick={closeMobile}
              className={cn(
                "flex min-h-16 items-center gap-3.5 rounded-(--radius-control) border px-3 py-3",
                DRAWER_ROW_MOTION,
                DRAWER_FOCUS,
                isMediatorsActive
                  ? "border-amber-care bg-amber-care-soft dark:bg-amber-care/25"
                  : "border-amber-care-border bg-amber-care-soft/60 hover:bg-amber-care-soft dark:border-amber-care/35 dark:bg-amber-care/12 dark:hover:bg-amber-care/20",
              )}
            >
              <IconTile icon={NAV_LINK_ICONS["/mediatori"]} tone="amber" size={40} />
              <span className="min-w-0 flex-1 wrap-break-word">
                <span className="block text-body font-semibold leading-snug text-foreground dark:text-paper">
                  {tHeader.forMediators}
                </span>
                <span className="mt-0.5 block text-body leading-snug text-muted-foreground dark:text-mist">
                  {tHeader.mediatorDrawerDescription}
                </span>
              </span>
              <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted-foreground dark:text-mist" />
            </Link>

            <Link
              href={withLangPrefix(portalLink.href, lang)}
              aria-current={isPortalActive ? "page" : undefined}
              onClick={closeMobile}
              className={cn(
                "flex min-h-14 items-center gap-3.5 rounded-(--radius-control) border bg-card px-3 py-2 dark:bg-ink-900",
                DRAWER_ROW_MOTION,
                DRAWER_FOCUS,
                isPortalActive
                  ? "border-sapphire dark:border-paper"
                  : "border-border-control hover:bg-muted dark:border-white/40 dark:hover:bg-white/10",
              )}
            >
              <IconTile icon={UserIcon} tone={isPortalActive ? "sapphire-solid" : "neutral"} size={40} />
              <span className="min-w-0 flex-1 wrap-break-word text-body font-semibold leading-snug text-foreground dark:text-paper">
                {portalLink.label}
              </span>
              <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted-foreground dark:text-mist" />
            </Link>
          </Container>
        </div>
      </header>

      <EmergencyDialerGate open={dialerOpen} onOpenChange={setDialerOpen} />
    </>
  );
}
