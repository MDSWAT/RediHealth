"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import {
  CloseIcon,
  MenuIcon,
  PhoneIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  UserIcon,
  UsersIcon,
  ActivityIcon,
} from "@/components/ui/icons";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { getChromeCopy } from "@/components/layout/chrome-copy";
import { EmergencyDialerGate } from "@/components/emergency/EmergencyDialerGate";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix, stripLangFromPathname } from "@/lib/i18n/routing";
import { translations } from "@/lib/i18n/translations";
import { findHelpLinks } from "@/lib/i18n/find-help-links";

/**
 * Site header: five patient-first destinations, a utility cluster (language, account,
 * "Start here" with the mediator entry) and, on phones, a menu that opens under the bar.
 * The phone menu fades and settles 8px (opacity and transform only), is inert while
 * closed and is sized to the space left on screen so its last item is always reachable.
 */
export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Publish the header's height while it is pinned, so in-page sticky columns sit below it.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const root = document.documentElement;
    const publish = () => {
      const pinned = getComputedStyle(el).position === "sticky";
      root.style.setProperty("--site-header-h", pinned ? `${el.getBoundingClientRect().height}px` : "0px");
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    window.addEventListener("resize", publish);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", publish);
      root.style.removeProperty("--site-header-h");
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
      if (event.key === "Escape") setStartMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [startMenuOpen]);

  useEffect(() => {
    if (typeof document === "undefined" || !document.cookie.includes("session-token")) {
      return;
    }
    void getSession()
      .then((session) => setAuthenticated(Boolean(session)))
      .catch(() => setAuthenticated(false));
  }, []);

  // Phone menu: lock the page behind it, fit it to the screen, close on Escape or on a wide screen.
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileOpen(false);
      menuButtonRef.current?.focus();
    };
    fit();
    window.addEventListener("resize", fit);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("resize", fit);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  const primaryLinks = [
    {
      label: tHeader.navAfla,
      href: "/health-information",
      subtext: tHeader.navAflaSub,
    },
    {
      label: tHeader.navCere,
      href: "/health-assistant",
      subtext: tHeader.navCereSub,
    },
    {
      // Pharmacies first: for many people the pharmacy is the first stop, before a doctor.
      label: findHelpLinks(lang).nav,
      href: "/find-help",
      subtext: findHelpLinks(lang).navDescription,
    },
    {
      label: tHeader.navMedic,
      href: "/medic-online",
      subtext: tHeader.navMedicSub,
    },
    {
      label: tHeader.navStiri,
      href: "/stiri",
      subtext: tHeader.navStiriSub,
    },
  ];

  const isActiveHref = (href: string) =>
    currentPath === href || (href !== "/" && currentPath.startsWith(`${href}/`));

  const portalLink = authenticated
    ? { href: "/panel", label: tHeader.medicalPanel }
    : { href: "/contul-meu", label: tHeader.myAccount };

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "site-header sticky top-[var(--emergency-bar-h,0px)] z-50 transition-[background-color,border-color,box-shadow] duration-(--dur-base) ease-(--ease-out-calm)",
          isTransparent
            ? "border-b border-transparent bg-transparent text-paper"
            : mobileOpen
              ? "border-b border-border bg-background text-foreground shadow-2xs"
              : "border-b border-border/80 bg-background/95 text-foreground shadow-2xs backdrop-blur-md supports-[backdrop-filter]:bg-background/85"
        )}
      >
        <Container>
          <div className="flex h-16 items-center justify-between gap-4 xl:h-20">
            <Logo
              className="shrink-0 whitespace-nowrap"
              tone={isTransparent ? "light" : "default"}
              href={withLangPrefix("/", lang)}
              label={chrome.homeLink}
            />

            {/* Desktop destinations (from 1280px: five links, language and "Start here" do not fit in Italian or English below that) */}
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
                          "relative flex min-h-[40px] flex-col justify-center rounded-lg px-3.5 py-1.5 transition-colors duration-(--dur-fast) focus-visible:outline-none focus-visible:ring-2",
                          isTransparent
                            ? isActive
                              ? "font-semibold text-white focus-visible:ring-paper/70"
                              : "font-medium text-paper/80 hover:bg-white/10 hover:text-white focus-visible:ring-paper/70"
                            : isActive
                              ? "font-semibold text-sapphire focus-visible:ring-ring"
                              : "font-medium text-foreground/85 hover:bg-muted hover:text-foreground focus-visible:ring-ring"
                        )}
                      >
                        <span className="text-sm">{link.label}</span>
                        <span className="sr-only">{link.subtext}</span>
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className={cn(
                              "absolute bottom-0 left-3.5 right-3.5 h-0.5",
                              isTransparent ? "bg-paper" : "bg-sapphire"
                            )}
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Utility cluster: language, account, "Start here" (with the mediator entry) */}
            <div className="hidden shrink-0 items-center gap-2 xl:flex">
              <LanguageSelector tone={isTransparent ? "light" : "default"} />

              <Link
                href={withLangPrefix(portalLink.href, lang)}
                title={portalLink.label}
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-(--dur-fast) focus-visible:outline-none focus-visible:ring-2",
                  isTransparent
                    ? "text-paper/85 hover:bg-white/10 hover:text-white focus-visible:ring-paper/70"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground focus-visible:ring-ring"
                )}
              >
                <UserIcon className="h-5 w-5" />
                <span className="sr-only">{portalLink.label}</span>
              </Link>

              <div
                className="relative"
                onMouseEnter={() => setStartMenuOpen(true)}
                onMouseLeave={() => setStartMenuOpen(false)}
                onFocus={() => setStartMenuOpen(true)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setStartMenuOpen(false);
                  }
                }}
              >
                <Link
                  href={withLangPrefix("/health-assistant#triage", lang)}
                  onClick={() => setStartMenuOpen(false)}
                  className="inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white shadow-xs transition-colors duration-(--dur-fast) hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span>{tHeader.startHere}</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>

                <div
                  className={cn(
                    "absolute right-0 top-full z-50 pt-2 transition-[opacity,translate,visibility] duration-(--dur-fast) ease-(--ease-out-calm)",
                    startMenuOpen
                      ? "visible translate-y-0 opacity-100"
                      : "pointer-events-none invisible -translate-y-1 opacity-0"
                  )}
                >
                  <div className="w-72 rounded-xl border border-border bg-card p-1.5 text-foreground shadow-lg">
                    <Link
                      href={withLangPrefix("/health-assistant#triage", lang)}
                      onClick={() => setStartMenuOpen(false)}
                      className="flex items-start gap-3 rounded-lg p-3 text-left transition-colors duration-(--dur-fast) hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <ActivityIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-foreground">{tHeader.navCere}</span>
                        <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">{tHeader.navCereSub}</span>
                      </span>
                    </Link>

                    <Link
                      href={withLangPrefix("/mediatori", lang)}
                      onClick={() => setStartMenuOpen(false)}
                      className="flex items-start gap-3 rounded-lg p-3 text-left transition-colors duration-(--dur-fast) hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <UsersIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-care" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-foreground">{tHeader.forMediators}</span>
                        <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">{tHeader.mediatorProfessionals}</span>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu button (phones, tablets and small laptops) */}
            <button
              ref={menuButtonRef}
              type="button"
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors duration-(--dur-fast) focus-visible:outline-none focus-visible:ring-2 xl:hidden",
                isTransparent
                  ? "text-paper hover:bg-white/10 focus-visible:ring-paper/70"
                  : "text-foreground hover:bg-muted focus-visible:ring-ring"
              )}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? tHeader.closeMenu : tHeader.openMenu}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </Container>

        {/* Phone menu: opens under the bar, covers the rest of the screen, scrolls on its own. */}
        <div
          id="mobile-menu"
          inert={!mobileOpen}
          style={drawerHeight ? { height: drawerHeight } : { height: "calc(100dvh - var(--chrome-h, 4rem))" }}
          className={cn(
            "absolute inset-x-0 top-full z-50 overflow-y-auto overscroll-contain border-t border-border bg-background shadow-xl xl:hidden",
            "transition-[opacity,translate,visibility] duration-(--dur-base) ease-(--ease-out-calm)",
            mobileOpen
              ? "visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-2 opacity-0"
          )}
        >
          <Container className="flex flex-col gap-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4">
            {/* 112 first: the one thing someone in an emergency needs from this menu. */}
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <div className="flex min-w-0 items-start gap-3">
                <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{tHeader.emergencyTitle}</p>
                  <p className="text-sm text-muted-foreground">{tHeader.emergencyCallPrompt}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setDialerOpen(true);
                }}
                className="inline-flex min-h-[44px] shrink-0 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors duration-(--dur-fast) hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {tHeader.call112}
              </button>
            </div>

            <nav aria-label={chrome.primaryNav}>
              <ul className="divide-y divide-border border-y border-border">
                {primaryLinks.map((link) => {
                  const isActive = isActiveHref(link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={withLangPrefix(link.href, lang)}
                        aria-current={isActive ? "page" : undefined}
                        onClick={closeMobile}
                        className="flex min-h-[60px] items-center justify-between gap-4 py-3 transition-colors duration-(--dur-fast) hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                      >
                        <span className="min-w-0">
                          <span className={cn("block text-base font-semibold", isActive ? "text-sapphire" : "text-foreground")}>
                            {link.label}
                          </span>
                          <span className="mt-0.5 block text-sm text-muted-foreground">{link.subtext}</span>
                        </span>
                        <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <Link
              href={withLangPrefix("/health-assistant#triage", lang)}
              onClick={closeMobile}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-base font-semibold text-white transition-colors duration-(--dur-fast) hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span>{tHeader.startHere}</span>
              <ArrowRightIcon className="h-5 w-5" />
            </Link>

            <div className="grid gap-2">
              <Link
                href={withLangPrefix(portalLink.href, lang)}
                onClick={closeMobile}
                className="flex min-h-[52px] items-center gap-3 rounded-lg border border-border bg-card px-4 text-base font-semibold text-foreground transition-colors duration-(--dur-fast) hover:bg-muted"
              >
                <UserIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span>{portalLink.label}</span>
              </Link>

              <Link
                href={withLangPrefix("/mediatori", lang)}
                onClick={closeMobile}
                className="flex min-h-[52px] items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-(--dur-fast) hover:bg-muted"
              >
                <UsersIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-care" />
                <span className="min-w-0">
                  <span className="block text-base font-semibold text-foreground">{tHeader.forMediators}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{tHeader.mediatorDrawerDescription}</span>
                </span>
              </Link>
            </div>

            <LanguageSelector variant="drawer" />
          </Container>
        </div>
      </header>

      <EmergencyDialerGate open={dialerOpen} onOpenChange={setDialerOpen} />
    </>
  );
}
