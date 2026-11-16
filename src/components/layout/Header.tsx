"use client";

import { UniversalEmergencyBanner } from "@/components/layout/UniversalEmergencyBanner";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSession } from "next-auth/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import {
  CloseIcon,
  DownloadIcon,
  ExternalLinkIcon,
  MenuIcon,
  MessageDotsIcon,
  PhoneIcon,
  ChevronRightIcon,
  RefreshIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/icons";
import {
  feedbackTriggerCopy,
  openReportIssue,
  openSiteFeedback,
  reportIssueTriggerCopy,
} from "@/components/layout/chrome-widget-events";
import { ComfortMenu } from "@/components/layout/ComfortMenu";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import {
  NAV_FULL_NAME_ON_WIDE,
  NAV_LINK_ICONS,
  NAV_ONLINE_DOCTOR_LABEL,
  NAV_SHORT_LABELS,
  type NavLinkHref,
} from "@/components/layout/nav-links";
import {
  capsuleCloseItem,
  capsuleDivider,
  capsuleItem,
  capsuleSurface,
} from "@/components/layout/chrome-capsule";
import { CapsuleGlidePlate, useCapsuleGlide } from "@/components/layout/CapsuleGlide";
import { getChromeCopy } from "@/components/layout/chrome-copy";
import {
  getSmartSearchTriggerCopy,
  openSmartSearch,
  preloadSmartSearch,
} from "@/components/search/smart-search-events";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n/language-context";
import { getPwaCopy } from "@/lib/i18n/pwa-copy";
import { withLangPrefix, stripLangFromPathname } from "@/lib/i18n/routing";
import { findHelpLinks } from "@/lib/i18n/find-help-links";
import { applyPwaUpdate, openPwaInstall, usePwaSnapshot } from "@/lib/pwa/pwa-state";

const EmergencyDialerGate = dynamic(
  () => import("@/components/emergency/EmergencyDialerGate").then((mod) => mod.EmergencyDialerGate),
  { ssr: false },
);

const FOCUSABLE_SELECTOR =
  'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';

/** Shared focus ring of the phone menu rows: sapphire on paper, paper on ink. */
const DRAWER_FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring dark:focus-visible:ring-paper";
const DRAWER_ROW_MOTION =
  "press-row transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none";

/**
 * Site header: six one-word destinations on xl+ (including health mediators),
 * compact utility actions (search trigger, comfort menu, language ISO selector,
 * 44px account link) from md+ upward, and below lg a focus-trapped menu drawer.
 */
export function Header({ emergencyDismissed = false }: { emergencyDismissed?: boolean } = {}) {
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { trackRef: glideTrackRef, plateRef: glidePlateRef } = useCapsuleGlide<HTMLDivElement>();

  // Publish the header's height while it is pinned, so in-page sticky columns sit below it.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const root = document.documentElement;
    // Measure the sticky header's full border-box height (including its 1px bottom border and optional 112 strip)
    // so `--site-header-h` matches to the subpixel whether the emergency banner is shown or dismissed.
    const publish = () => {
      const pinned = getComputedStyle(el).position === "sticky";
      const measured = el.getBoundingClientRect().height;
      const height = pinned && measured > 0 ? `${measured}px` : "0px";
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
  const [openHeaderMenu, setOpenHeaderMenu] = useState<"comfort" | "language" | null>(null);
  const [drawerHeight, setDrawerHeight] = useState<number | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [dialerOpen, setDialerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname() || "/";
  const currentPath = stripLangFromPathname(pathname);
  const { lang, t } = useLanguage();
  const tHeader = t.header;
  const chrome = getChromeCopy(lang);
  const searchCopy = getSmartSearchTriggerCopy(lang);
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

  const isTransparent = currentPath === "/" && !scrolled && !mobileOpen;
  const onDarkBar = isTransparent || mobileOpen;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || !document.cookie.includes("session-token")) {
      return;
    }
    void getSession()
      .then((session) => setAuthenticated(Boolean(session)))
      .catch(() => setAuthenticated(false));
  }, []);

  // Phone/tablet menu: lock the page behind it, fit it to the screen, move initial focus inside,
  // trap Tab/Shift+Tab, and close on Escape, browser back/forward, or resizing to lg+.
  useEffect(() => {
    if (!mobileOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const fit = () => {
      // With larger comfort text the bar keeps the menu up to 1280px (see globals.css).
      const largeText = ["large", "xl"].includes(document.documentElement.dataset.textScale ?? "");
      if (window.innerWidth >= (largeText ? 1280 : 1024)) {
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
      const container = headerRef.current;
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

  // Ordered by need: get help now, find care nearby, talk to a doctor, then reading.
  // Pharmacies come before the doctor: for many people the pharmacy is the first stop.
  const helpLinks: { label: string; href: NavLinkHref; subtext: string }[] = [
    { label: tHeader.navCere, href: "/health-assistant", subtext: tHeader.navCereSub },
    { label: findHelpLinks(lang).nav, href: "/find-help", subtext: findHelpLinks(lang).navDescription },
    { label: tHeader.navMedic, href: "/medic-online", subtext: tHeader.navMedicSub },
  ];
  const readingLinks: { label: string; href: NavLinkHref; subtext: string }[] = [
    { label: tHeader.navAfla, href: "/health-information", subtext: tHeader.navAflaSub },
    { label: tHeader.navStiri, href: "/stiri", subtext: tHeader.navStiriSub },
  ];

  const primaryLinks = [...helpLinks, ...readingLinks];

  // The desktop bar keeps the people who help together: mediators sit with the help links, before reading.
  const desktopLinks: { label: string; href: NavLinkHref; subtext: string }[] = [
    ...helpLinks,
    { label: tHeader.forMediators, href: "/mediatori", subtext: tHeader.forMediatorsSub },
    ...readingLinks,
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
  const containerSize = "default";

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          // scroll-edge: the hairline and soft shadow build as the page scrolls under the bar (scroll-linked, so
          // it holds still for anyone not scrolling). In dark the hairline token follows the bar's own edge.
          "site-header shadow-2xs scroll-edge sticky top-0 z-50 transition-[background-color,border-color] duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none dark:[--color-border:rgb(255_255_255/0.1)]",
          // Solid ground once the page moves under it: no translucent glass.
          isTransparent
            ? "border-b border-transparent bg-transparent text-paper"
            : "border-b border-border bg-background text-foreground dark:border-white/10 dark:bg-ink-950 dark:text-paper",
          // While the phone menu is open the whole header (112 line, bar and menu) takes its deep blue
          // styling, so the open menu is one calm full-screen surface under the button that opened it.
          mobileOpen && "dark",
        )}
      >
        {/* The 112 line rides on top of the bar, so it stays in view while the page scrolls. */}
        <UniversalEmergencyBanner tone={isTransparent || mobileOpen ? "dark" : "light"} size={containerSize} initiallyDismissed={emergencyDismissed} />
        <Container
          size={containerSize}
          data-header-bar=""
          className="max-w-[80rem] pt-2.5 max-sm:px-3 max-[359px]:px-2 2xl:max-w-[96rem] 2xl:px-5"
        >
          <div className="flex h-16 items-center justify-between gap-1 sm:gap-3 2xl:gap-2">
            <Logo
              className="shrink-0 whitespace-nowrap"
              tone={isTransparent || mobileOpen ? "light" : "default"}
              href={withLangPrefix("/", lang)}
              label={chrome.homeLink}
            />

            {/* Desktop destinations (from 1024px: six one-word links fit alongside the utilities in all 7 locales,
                because search drops to its icon until xl) */}
            <nav aria-label={chrome.primaryNav} data-desktop-nav="" className="hidden min-w-0 lg:block">
              <ul className="flex items-center gap-0.5">
                {desktopLinks.map((link) => {
                  const isActive = isActiveHref(link.href);
                  const shortLabel = (NAV_SHORT_LABELS[lang] ?? NAV_SHORT_LABELS.ro)[link.href];
                  // One word from 1024px; from 1536px the unclear names get their second word.
                  const wideLabel =
                    link.href === "/medic-online"
                      ? (NAV_ONLINE_DOCTOR_LABEL[lang] ?? NAV_ONLINE_DOCTOR_LABEL.ro)
                      : NAV_FULL_NAME_ON_WIDE.includes(link.href)
                        ? link.label
                        : shortLabel;

                  return (
                    <li key={link.href}>
                      <Link
                        href={withLangPrefix(link.href, lang)}
                        onClick={() => setOpenHeaderMenu(null)}
                        aria-current={isActive ? "page" : undefined}
                        title={link.label}
                        className={cn(
                          "tab-ink relative flex min-h-11 flex-col justify-center rounded-lg px-2 py-1.5 xl:px-2.5 min-[1400px]:px-3 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2",
                          isTransparent
                            ? isActive
                              ? "font-semibold text-white focus-visible:ring-paper/70"
                              : "font-medium text-paper/80 hover:bg-white/10 hover:text-white focus-visible:ring-paper/70"
                            : isActive
                              ? "font-semibold text-sapphire focus-visible:ring-ring dark:text-paper dark:focus-visible:ring-paper"
                              : "font-medium text-foreground/85 hover:bg-muted hover:text-foreground focus-visible:ring-ring dark:text-paper/80 dark:hover:bg-white/10 dark:hover:text-paper dark:focus-visible:ring-paper",
                        )}
                      >
                        <span aria-hidden="true" className="whitespace-nowrap text-[0.9375rem] 2xl:hidden">
                          {shortLabel}
                        </span>
                        <span aria-hidden="true" className="hidden whitespace-nowrap text-[0.9375rem] 2xl:inline">
                          {wideLabel}
                        </span>
                        <span className="sr-only">
                          {link.label} — {link.subtext}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* One capsule holds every utility: no control carries a box of its own. */}
            <div ref={glideTrackRef} className={cn(capsuleSurface(onDarkBar), "shrink-0")}>
              {!mobileOpen ? <CapsuleGlidePlate plateRef={glidePlateRef} onHero={isTransparent} /> : null}
              <div className="hidden shrink-0 items-center gap-0.5 md:flex">
                <button
                  type="button"
                  onPointerEnter={preloadSmartSearch}
                  onFocus={preloadSmartSearch}
                  onClick={() => {
                    setOpenHeaderMenu(null);
                    openSmartSearch();
                  }}
                  aria-keyshortcuts="Meta+k Control+k /"
                  aria-label={`${searchCopy.triggerLabel} (Ctrl+K)`}
                  title={`${searchCopy.triggerLabel} (Ctrl+K)`}
                  data-capsule-item=""
                  data-search-trigger=""
                  data-testid="header-search-trigger"
                  className={cn(capsuleItem(onDarkBar), "pl-3.5 pr-3 text-[0.9375rem] lg:max-xl:w-11 lg:max-xl:px-0")}
                >
                  <SearchIcon className="h-4.5 w-4.5 shrink-0 opacity-85" aria-hidden="true" />
                  {/* From lg to xl the six links need the room, so search shows its icon alone (the label stays in aria-label). */}
                  <span className="lg:max-xl:hidden">{searchCopy.triggerLabel}</span>
                  <kbd
                    aria-hidden="true"
                    className={cn(
                      "hidden min-w-5 items-center justify-center rounded border px-1 py-0.5 font-sans text-meta font-medium leading-none xl:inline-flex",
                      onDarkBar
                        ? "border-white/20 bg-white/10 text-paper/75"
                        : "border-ink-950/12 bg-white/80 text-foreground/65 dark:border-white/15 dark:bg-white/10 dark:text-paper/75",
                    )}
                  >
                    /
                  </kbd>
                </button>
                <span aria-hidden="true" className={capsuleDivider(onDarkBar)} />
                <ComfortMenu
                  tone={onDarkBar ? "light" : "default"}
                  open={openHeaderMenu === "comfort"}
                  onOpenChange={(next) =>
                    setOpenHeaderMenu((prev) => (next ? "comfort" : prev === "comfort" ? null : prev))
                  }
                  onDone={() => setOpenHeaderMenu(null)}
                />
                <LanguageSelector
                  tone={onDarkBar ? "light" : "default"}
                  open={openHeaderMenu === "language"}
                  onOpenChange={(next) =>
                    setOpenHeaderMenu((prev) => (next ? "language" : prev === "language" ? null : prev))
                  }
                  onNavigate={() => setOpenHeaderMenu(null)}
                />
                <span aria-hidden="true" className={capsuleDivider(onDarkBar)} />

                {/* Account is one click away. Install lives on the account screen and in the menu, not in the bar. */}
                <Link
                  href={withLangPrefix(portalLink.href, lang)}
                  onClick={() => {
                    setOpenHeaderMenu(null);
                    if (mobileOpen) closeMobile();
                  }}
                  aria-current={isPortalActive ? "page" : undefined}
                  aria-label={portalLink.label}
                  title={portalLink.label}
                  data-capsule-item=""
                  className={cn(capsuleItem(onDarkBar, isPortalActive), "w-11")}
                >
                  <UserIcon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                </Link>
              </div>

              {/* Mobile utilities: search and accessibility sit beside the menu button while closed */}
              {!mobileOpen && (
                <div className="flex items-center gap-0.5 md:hidden">
                  <button
                    type="button"
                    onPointerEnter={preloadSmartSearch}
                    onFocus={preloadSmartSearch}
                    onClick={() => {
                      setOpenHeaderMenu(null);
                      openSmartSearch();
                    }}
                    aria-label={searchCopy.triggerLabel}
                    title={searchCopy.triggerLabel}
                    data-capsule-item=""
                    data-search-trigger=""
                    className={cn(capsuleItem(isTransparent), "w-11")}
                  >
                    <SearchIcon className="h-4.5 w-4.5 shrink-0 opacity-85" aria-hidden="true" />
                    <span className="sr-only">{searchCopy.triggerLabel}</span>
                  </button>
                  <ComfortMenu tone={isTransparent ? "light" : "default"} />
                  <span
                    aria-hidden="true"
                    className={cn(capsuleDivider(isTransparent), "max-[359px]:hidden")}
                  />
                </div>
              )}

              {/* While the phone menu is open, surface Account directly next to Close */}
              {mobileOpen && (
                <div className="flex items-center gap-1 md:hidden">
                  <Link
                    href={withLangPrefix(portalLink.href, lang)}
                    onClick={closeMobile}
                    aria-current={isPortalActive ? "page" : undefined}
                    aria-label={portalLink.label}
                    title={portalLink.label}
                    data-capsule-item=""
                    data-mobile-account-trigger=""
                    className={cn(capsuleItem(true, isPortalActive), "w-11")}
                  >
                    <UserIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  </Link>
                </div>
              )}

              {/* Menu / Close button (phones and portrait tablets, below lg) */}
              <button
                ref={menuButtonRef}
                type="button"
                data-capsule-item=""
                data-header-trigger=""
                title={mobileOpen ? tHeader.closeMenu : tHeader.openMenu}
                className={cn(
                  mobileOpen ? capsuleCloseItem() : capsuleItem(isTransparent, false),
                  "gap-1.5 px-3 whitespace-nowrap text-meta font-semibold max-[359px]:gap-1 max-[359px]:px-2.5 lg:hidden",
                )}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => {
                  setOpenHeaderMenu(null);
                  setMobileOpen((open) => {
                    if (open) setOpenDrawerSection(null);
                    return !open;
                  });
                }}
              >
                {/* The glyph hands over in place (keyed, so each swap replays a short settle). */}
                {mobileOpen ? (
                  <CloseIcon key="close" className="h-5 w-5 shrink-0" aria-hidden="true" />
                ) : (
                  <MenuIcon key="menu" className="h-5 w-5 shrink-0" aria-hidden="true" />
                )}
                <span>{mobileOpen ? chrome.closeWord : chrome.menuWord}</span>
              </button>
            </div>
          </div>
        </Container>

        {/* Scrim behind the phone/tablet menu, anchored below the header. */}
        <div
          aria-hidden="true"
          data-menu-scrim=""
          onClick={closeMobileAndRestoreFocus}
          style={{ top: "var(--site-header-h, 4rem)" }}
          className={cn(
            "fixed inset-x-0 bottom-0 z-40 bg-ink-950/45 transition-[opacity,visibility] duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none print:hidden lg:hidden",
            mobileOpen ? "visible opacity-100" : "pointer-events-none invisible opacity-0",
          )}
        />

        {/* Phone/tablet menu: full screen below the bar, in the same deep blue as the bar while it is open.
            It opens downward from the Menu button that owns it (a short fade and settle, nothing flying
            in), traps Tab focus, and scrolls independently. The same button, now Close, shuts it. */}
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          role="dialog"
          aria-modal={mobileOpen ? "true" : undefined}
          aria-label={chrome.primaryNav}
          inert={!mobileOpen}
          style={{ height: drawerHeight ?? "calc(100dvh - var(--site-header-h, 4rem))" }}
          className={cn(
            "absolute inset-x-0 top-full z-50 overflow-y-auto overscroll-contain border-t border-border bg-paper text-foreground dark:border-white/10 dark:bg-ink-950 dark:text-paper print:hidden lg:hidden",
            "transition-[opacity,translate,visibility] duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
            mobileOpen
              ? "visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-2 opacity-0",
          )}
        >
          {/* Same width and side padding as the bar, so the rows line up under the logo instead of
              sitting in a narrow centred column on tablets. */}
          <Container className="flex min-h-full flex-col gap-2 py-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <button
              type="button"
              onPointerEnter={preloadSmartSearch}
              onFocus={preloadSmartSearch}
              onClick={() => {
                closeMobile();
                openSmartSearch();
              }}
              style={{ "--i": 0 } as CSSProperties}
              className={cn(
                mobileOpen && "list-in",
                "flex min-h-11 w-full max-w-full items-center gap-2.5 whitespace-nowrap rounded-xl md:hidden bg-ink-950/[0.05] px-3 py-1.5 text-left text-ink-900 press-row transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-ink-950/[0.09] dark:bg-white/8 dark:text-paper dark:hover:bg-white/12",
                DRAWER_FOCUS,
              )}
            >
              <SearchIcon className="h-4.5 w-4.5 shrink-0 text-ink-900/50 dark:text-paper/55" aria-hidden="true" />
              <span className="min-w-0 flex-1 overflow-hidden text-ellipsis text-body text-ink-900/65 dark:text-paper/65">
                {searchCopy.triggerPlaceholder}
              </span>
            </button>

            {/* Primary destinations */}
            <nav aria-label={chrome.primaryNav}>
              <ul className="divide-y divide-ink-900/8 dark:divide-white/10">
                {primaryLinks.map((link, index) => {
                  const isActive = isActiveHref(link.href);
                  const NavIcon = NAV_LINK_ICONS[link.href];

                  return (
                    <li
                      key={link.href}
                      style={{ "--i": index + 1 } as CSSProperties}
                      className={cn(mobileOpen && "list-in")}
                    >
                      <Link
                        href={withLangPrefix(link.href, lang)}
                        aria-current={isActive ? "page" : undefined}
                        onClick={closeMobile}
                        className={cn(
                          "group flex min-h-12 items-center gap-3 rounded-lg px-2.5 py-1.5",
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
                              : "text-ink-900/55 group-hover:text-foreground dark:text-paper/60 dark:group-hover:text-paper",
                          )}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block text-body leading-snug",
                              isActive
                                ? "font-semibold text-sapphire dark:text-paper"
                                : "font-medium text-foreground dark:text-paper",
                            )}
                          >
                            {link.label}
                          </span>
                          <span className="block whitespace-nowrap text-meta font-normal leading-snug text-muted-foreground dark:text-mist">
                            {link.subtext}
                          </span>
                        </span>
                        <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-900/35 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) group-hover:text-sapphire motion-reduce:transition-none dark:text-paper/35 dark:group-hover:text-paper" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Secondary & Preferences */}
            <div
              style={{ "--i": primaryLinks.length + 1 } as CSSProperties}
              className={cn(mobileOpen && "list-in", "border-t border-ink-900/10 pt-1.5 dark:border-white/10")}
            >
              {/* Language, accessibility and install sit in the bar from md up, so they are phone-only here. */}
              <ul>
                <li>
                <Link
                  href={withLangPrefix("/mediatori", lang)}
                  aria-current={isMediatorsActive ? "page" : undefined}
                  onClick={closeMobile}
                  className={cn(
                    "group flex min-h-12 items-center gap-3 rounded-lg px-2.5 py-1.5",
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
                        className="h-4.5 w-4.5 shrink-0 text-amber-care dark:text-amber-care-border"
                        aria-hidden="true"
                      />
                    );
                  })()}
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-body leading-snug text-foreground dark:text-paper",
                        isMediatorsActive ? "font-semibold" : "font-medium",
                      )}
                    >
                      {tHeader.forMediators}
                    </span>
                    <span className="block text-meta font-normal leading-snug text-muted-foreground dark:text-mist">
                      {tHeader.forMediatorsSub}
                    </span>
                  </span>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-900/35 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) group-hover:text-foreground motion-reduce:transition-none dark:text-paper/35 dark:group-hover:text-paper" />
                </Link>
                </li>

                <li className="border-t border-ink-900/8 dark:border-white/10 md:hidden">
                <LanguageSelector
                  variant="drawer"
                  listRow
                  open={openDrawerSection === "language"}
                  onOpenChange={(next) =>
                    setOpenDrawerSection((prev) => (next ? "language" : prev === "language" ? null : prev))
                  }
                  onNavigate={closeMobile}
                />
                </li>

                <li className="border-t border-ink-900/8 dark:border-white/10 md:hidden">
                <ComfortMenu
                  variant="drawer"
                  collapsible
                  open={openDrawerSection === "comfort"}
                  onOpenChange={(next) =>
                    setOpenDrawerSection((prev) => (next ? "comfort" : prev === "comfort" ? null : prev))
                  }
                  onDone={closeMobile}
                />
                </li>

                <li className="border-t border-ink-900/8 dark:border-white/10 md:hidden">
                <button
                  type="button"
                  disabled={!showInstallTrigger && pwa.isRefreshing}
                  onClick={() => {
                    closeMobile();
                    if (showInstallTrigger) {
                      void openPwaInstall();
                    } else {
                      void applyPwaUpdate();
                    }
                  }}
                  className={cn(
                    "group flex min-h-11 w-full items-center gap-3 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-left",
                    DRAWER_ROW_MOTION,
                    DRAWER_FOCUS,
                    "hover:bg-ink-900/[0.035] dark:hover:bg-white/[0.05] disabled:cursor-wait disabled:opacity-75",
                  )}
                >
                  {showInstallTrigger ? (
                    <DownloadIcon
                      className="h-4.5 w-4.5 shrink-0 text-ink-900/50 transition-colors duration-(--dur-fast) group-hover:text-foreground dark:text-paper/55 dark:group-hover:text-paper"
                      aria-hidden="true"
                    />
                  ) : (
                    <RefreshIcon
                      className="h-4.5 w-4.5 shrink-0 text-ink-900/50 transition-colors duration-(--dur-fast) group-hover:text-foreground dark:text-paper/55 dark:group-hover:text-paper"
                      aria-hidden="true"
                    />
                  )}
                  <span className="min-w-0 flex-1 text-body font-medium leading-snug text-foreground dark:text-paper">
                    {pwaTriggerLabel}
                  </span>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-900/35 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) group-hover:text-foreground motion-reduce:transition-none dark:text-paper/35 dark:group-hover:text-paper" />
                </button>
                </li>

                <li className="border-t border-ink-900/8 pt-1 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    closeMobile();
                    openSiteFeedback();
                  }}
                  className={cn(
                    "group flex min-h-12 w-full items-center gap-3 rounded-lg bg-sapphire/[0.06] px-2.5 py-2 text-left hover:bg-sapphire/[0.11] dark:bg-white/[0.07] dark:hover:bg-white/[0.12]",
                    DRAWER_ROW_MOTION,
                    DRAWER_FOCUS,
                  )}
                >
                  <MessageDotsIcon
                    className="h-4.5 w-4.5 shrink-0 text-sapphire dark:text-sapphire-border"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-body font-semibold leading-snug text-sapphire dark:text-paper">
                      {(feedbackTriggerCopy[lang] ?? feedbackTriggerCopy.ro).footerLink}
                    </span>
                    <span className="block text-meta font-normal leading-snug text-muted-foreground dark:text-mist">
                      {(feedbackTriggerCopy[lang] ?? feedbackTriggerCopy.ro).mobileDrawerSub}
                    </span>
                  </span>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-sapphire/60 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) group-hover:text-sapphire motion-reduce:transition-none dark:text-paper/55 dark:group-hover:text-paper" />
                </button>
                </li>
              </ul>
            </div>

            {/* Bottom 112 emergency row and single-line quiet colophon */}
            <div
              style={{ "--i": primaryLinks.length + 2 } as CSSProperties}
              className={cn(mobileOpen && "list-in", "mt-auto space-y-1.5 border-t border-ink-900/10 pt-2 dark:border-white/10")}
            >
              <div className="flex min-h-11 items-center justify-between gap-3 px-2.5 py-0.5">
                <p className="text-body font-medium text-foreground dark:text-paper">
                  {chrome.emergencyQuestion}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpenDrawerSection(null);
                    setMobileOpen(false);
                    setDialerOpen(true);
                  }}
                  className="min-h-11 shrink-0 rounded-lg border-primary/35! bg-primary/[0.06]! px-3.5 py-1.5 text-body font-semibold whitespace-nowrap text-primary! shadow-none! hover:border-primary/55! hover:bg-primary/[0.12]! dark:border-[#ff8f98]/35! dark:bg-white/[0.05]! dark:text-[#ffccd0]! dark:hover:border-[#ff8f98]/55! dark:hover:bg-[#c62f3c]/18! dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink-950"
                >
                  <PhoneIcon className="h-4 w-4" />
                  <span>{tHeader.call112}</span>
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0 border-t border-ink-900/8 px-2.5 pt-0.5 text-meta text-muted-foreground dark:border-white/10 dark:text-mist">
                <a
                  href="https://www.redi-ngo.eu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobile}
                  className={cn(
                    "-mx-1.5 inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-md px-1.5 font-medium hover:text-foreground dark:hover:text-paper",
                    DRAWER_ROW_MOTION,
                    DRAWER_FOCUS,
                  )}
                >
                  <span>redi-ngo.eu</span>
                  <ExternalLinkIcon className="h-3.5 w-3.5 shrink-0 opacity-65" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    closeMobile();
                    openSiteFeedback();
                  }}
                  className={cn(
                    "-mx-1.5 inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-1.5 font-medium hover:text-foreground dark:hover:text-paper",
                    DRAWER_ROW_MOTION,
                    DRAWER_FOCUS,
                  )}
                >
                  {(feedbackTriggerCopy[lang] ?? feedbackTriggerCopy.ro).compactTriggerLabel}
                </button>

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
                    "-mx-1.5 inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-1.5 font-medium hover:text-foreground dark:hover:text-paper",
                    DRAWER_ROW_MOTION,
                    DRAWER_FOCUS,
                  )}
                >
                  {(reportIssueTriggerCopy[lang] ?? reportIssueTriggerCopy.ro).trigger}
                </Link>
              </div>
            </div>
          </Container>
        </div>
      </header>

      {dialerOpen ? <EmergencyDialerGate open={dialerOpen} onOpenChange={setDialerOpen} /> : null}
    </>
  );
}
