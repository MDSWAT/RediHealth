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
  AiAssistantIcon,
  ChevronRightIcon,
  CloseIcon,
  DownloadIcon,
  HomeIcon,
  MenuIcon,
  PhoneIcon,
  RefreshIcon,
  SearchIcon,
  UserIcon,
  VideoIcon,
} from "@/components/ui/icons";
import { AI_CHAT_COPY } from "@/components/health-assistant/ai-chat-copy";
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
import { errorTranslations } from "@/lib/i18n/error-translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { getPwaCopy } from "@/lib/i18n/pwa-copy";
import { withLangPrefix, stripLangFromPathname } from "@/lib/i18n/routing";
import { findHelpLinks } from "@/lib/i18n/find-help-links";
import { applyPwaUpdate, openPwaInstall, usePwaSnapshot } from "@/lib/pwa/pwa-state";
import { useOnlineStatus } from "@/lib/pwa/use-online-status";

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
const DRAWER_CARD =
  "border border-border/90 bg-card shadow-[0_1px_2px_rgb(15_23_42/0.04),0_4px_12px_-6px_rgb(29_53_87/0.09)] dark:border-white/12 dark:bg-ink-900 dark:shadow-none";

/**
 * Site header: six clear, non-overlapping destinations in both the desktop bar and
 * the mobile drawer primary list, plus compact utility actions inside the capsule.
 */
export function Header({ emergencyDismissed = false }: { emergencyDismissed?: boolean } = {}) {
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { trackRef: glideTrackRef, plateRef: glidePlateRef } = useCapsuleGlide<HTMLDivElement>();

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const root = document.documentElement;
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
  const aiCopy = AI_CHAT_COPY[lang] ?? AI_CHAT_COPY.ro;
  const isLiveDoctorActive = currentPath === "/medic-online" || currentPath.startsWith("/medic-online/");
  const isAiAssistantActive = currentPath === "/ai-assistant" || currentPath.startsWith("/ai-assistant/");
  const searchCopy = getSmartSearchTriggerCopy(lang);
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

  // Transparent over the dark landing hero at the top of the page; transitions to the solid
  // blurred bar on scroll, on inner pages, or while the white mobile drawer is open.
  const isTransparent = currentPath === "/" && !scrolled && !mobileOpen;
  const onDarkBar = isTransparent;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPath]);

  useEffect(() => {
    if (typeof document === "undefined" || !document.cookie.includes("session-token")) {
      return;
    }
    void getSession()
      .then((session) => setAuthenticated(Boolean(session)))
      .catch(() => setAuthenticated(false));
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    if (mobileMenuRef.current) {
      mobileMenuRef.current.scrollTop = 0;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const fit = () => {
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
    { label: tHeader.navSymptoms, href: "/health-check", subtext: tHeader.navSymptomsSub },
    { label: tHeader.navMedicine, href: "/prescription-review", subtext: tHeader.navMedicineSub },
    { label: findHelpLinks(lang).nav, href: "/find-help", subtext: findHelpLinks(lang).navDescription },
    { label: tHeader.forMediators, href: "/mediatori", subtext: tHeader.forMediatorsSub },
    { label: tHeader.navStiri, href: "/stiri", subtext: tHeader.navStiriSub },
  ];

  const isActiveHref = (href: string) => {
    if (href === "/stiri") {
      return (
        currentPath === "/stiri" ||
        currentPath.startsWith("/stiri/") ||
        currentPath === "/news" ||
        currentPath.startsWith("/news/")
      );
    }
    return currentPath === href || (href !== "/" && currentPath.startsWith(`${href}/`));
  };

  const portalLink = authenticated
    ? { href: "/panel", label: tHeader.medicalPanel }
    : { href: "/contul-meu", label: tHeader.myAccount };

  const isPortalActive = isActiveHref(portalLink.href);
  const isHomeActive = currentPath === "/";
  // The phone menu's Home row reuses the error page's wording, already written in all seven languages.
  const homeLabel = (errorTranslations[lang] ?? errorTranslations.ro).home;
  const containerSize = "default";

  return (
    <>
      <header
        ref={headerRef}
        data-transparent={isTransparent ? "true" : undefined}
        className={cn(
          "site-header sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter,box-shadow] duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none dark:[--color-border:rgb(255_255_255/0.1)]",
          isTransparent
            ? "border-b border-transparent bg-transparent text-paper shadow-none"
            : mobileOpen
              ? "border-b border-border/80 bg-white text-foreground shadow-none dark:border-white/10 dark:bg-ink-950 dark:text-paper"
              : "shadow-2xs scroll-edge border-b border-border/85 bg-background/90 text-foreground backdrop-blur-xl supports-[backdrop-filter]:bg-background/82 dark:border-white/10 dark:bg-ink-950/90 dark:text-paper",
        )}
      >
        {!mobileOpen && (
          <UniversalEmergencyBanner tone={isTransparent ? "dark" : "light"} size={containerSize} initiallyDismissed={emergencyDismissed} />
        )}
        <Container
          size={containerSize}
          data-header-bar=""
          className="max-w-[80rem] pt-2.5 max-md:pt-1 max-sm:px-3 max-[359px]:px-2 2xl:max-w-[96rem] 2xl:px-5"
        >
          <div className="flex h-16 items-center justify-between gap-1 max-md:h-14 sm:gap-3 2xl:gap-2">
            <Logo
              className="min-h-11 shrink-0 whitespace-nowrap"
              tone={isTransparent ? "light" : "default"}
              href={withLangPrefix("/", lang)}
              label={chrome.homeLink}
              onClick={closeMobile}
            />

            {/* Desktop destinations (lg+): six clear tabs aligned with #mobile-menu */}
            <nav aria-label={chrome.primaryNav} data-desktop-nav="" className="hidden min-w-0 lg:block">
              <ul className="flex items-center gap-0.5">
                {primaryLinks.map((link) => {
                  const isActive = isActiveHref(link.href);
                  const shortLabel = (NAV_SHORT_LABELS[lang] ?? NAV_SHORT_LABELS.ro)[link.href];
                  const wideLabel = NAV_FULL_NAME_ON_WIDE.includes(link.href) ? link.label : shortLabel;

                  return (
                    <li key={link.href}>
                      <Link
                        href={withLangPrefix(link.href, lang)}
                        onClick={() => setOpenHeaderMenu(null)}
                        aria-current={isActive ? "page" : undefined}
                        title={link.label}
                        className={cn(
                          "tab-ink relative flex min-h-11 flex-col justify-center rounded-lg px-2 py-1.5 xl:px-2.5 2xl:px-2 min-[1600px]:px-3 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2",
                          isTransparent
                            ? isActive
                              ? "font-semibold text-white focus-visible:ring-paper/70"
                              : "font-medium text-paper/85 hover:bg-white/10 hover:text-white focus-visible:ring-paper/70"
                            : isActive
                              ? "font-semibold text-rose-ink focus-visible:ring-ring dark:text-paper dark:focus-visible:ring-paper"
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
            <div
              ref={glideTrackRef}
              className={cn(
                capsuleSurface(onDarkBar),
                "shrink-0",
                mobileOpen && "max-md:border-transparent max-md:p-0 max-md:shadow-none max-md:before:hidden",
              )}
            >
              {!mobileOpen ? <CapsuleGlidePlate plateRef={glidePlateRef} onHero={onDarkBar} /> : null}
              <div className="hidden shrink-0 items-center gap-0.5 md:flex">
                {isOnline && (
                  <>
                    <Link
                      href={withLangPrefix("/ai-assistant", lang)}
                      onClick={() => setOpenHeaderMenu(null)}
                      aria-current={isAiAssistantActive ? "page" : undefined}
                      aria-label={aiCopy.title}
                      title={aiCopy.title}
                      data-capsule-item=""
                      className={cn(capsuleItem(onDarkBar, isAiAssistantActive), "px-3 text-[0.9375rem]")}
                    >
                      <AiAssistantIcon className="h-4.5 w-4.5 shrink-0 opacity-90" aria-hidden="true" />
                      <span>{aiCopy.shortLabel}</span>
                    </Link>
                    <span aria-hidden="true" className={capsuleDivider(onDarkBar)} />
                  </>
                )}
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
                    className={cn(capsuleItem(onDarkBar), "w-11")}
                  >
                    <SearchIcon className="h-4.5 w-4.5 shrink-0 opacity-85" aria-hidden="true" />
                    <span className="sr-only">{searchCopy.triggerLabel}</span>
                  </button>
                  <ComfortMenu tone={onDarkBar ? "light" : "default"} />
                  <span
                    aria-hidden="true"
                    className={cn(capsuleDivider(onDarkBar), "max-[359px]:hidden")}
                  />
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
                  mobileOpen ? capsuleCloseItem() : capsuleItem(onDarkBar, false),
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

        {/* Phone/tablet menu: full screen below the bar. */}
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          role="dialog"
          aria-modal={mobileOpen ? "true" : undefined}
          aria-label={chrome.primaryNav}
          inert={!mobileOpen}
          style={{ height: drawerHeight ?? "calc(100dvh - var(--site-header-h, 4rem))" }}
          className={cn(
            "absolute inset-x-0 top-full z-50 overflow-y-auto overscroll-contain bg-white text-foreground dark:bg-ink-950 dark:text-paper print:hidden lg:hidden",
            "transition-[opacity,translate,visibility] duration-(--dur-base) ease-(--ease-out-expo) motion-reduce:transition-none",
            mobileOpen
              ? "visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-2 opacity-0",
          )}
        >
          <Container className="flex min-h-full flex-col gap-1.5 pt-1.5">
            {/* Language first: floating white bar so a reader finds their language right away. */}
            <div
              style={{ "--i": 0 } as CSSProperties}
              data-menu-card=""
              className={cn(
                mobileOpen && "list-in",
                "rounded-[0.875rem] md:hidden",
                DRAWER_CARD,
              )}
            >
              <LanguageSelector
                variant="drawer"
                listRow
                open={openDrawerSection === "language"}
                onOpenChange={(next) =>
                  setOpenDrawerSection((prev) => (next ? "language" : prev === "language" ? null : prev))
                }
                onNavigate={closeMobile}
              />
            </div>

            {/* Featured care pair: two-column sapphire video doctor and crisp white AI assistant */}
            <div
              style={{ "--i": 1 } as CSSProperties}
              className={cn(
                mobileOpen && "list-in",
                isOnline ? "grid grid-cols-2 gap-2" : "grid grid-cols-1 gap-2",
              )}
            >
              <Link
                href={withLangPrefix("/medic-online", lang)}
                aria-current={isLiveDoctorActive ? "page" : undefined}
                onClick={closeMobile}
                className={cn(
                  "btn-sheen press-row group flex min-h-21 min-w-0 flex-col justify-between rounded-(--radius-surface) bg-linear-to-br from-sapphire to-sapphire-light p-3 text-white shadow-[0_6px_16px_-6px_rgb(29_53_87/0.38)] ring-1 ring-inset ring-white/12 transition-[background-color,box-shadow,filter] duration-(--dur-fast) ease-(--ease-out-calm) hover:brightness-106 motion-reduce:transition-none max-[359px]:p-2.5",
                  DRAWER_FOCUS,
                  isLiveDoctorActive && "ring-2 ring-white/50 ring-inset",
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white"
                  >
                    <VideoIcon className="h-4.5 w-4.5" />
                  </span>
                  <ChevronRightIcon className="arrow-travel h-4 w-4 shrink-0 text-white/80" aria-hidden="true" />
                </span>
                <span className="mt-2 block min-w-0">
                  <span className="block font-display text-[0.9375rem] font-semibold leading-tight tracking-[-0.015em] text-white">
                    {chrome.liveDoctor}
                  </span>
                  <span className="mt-0.5 block text-[0.8125rem] leading-snug text-on-sapphire-muted [overflow-wrap:break-word] max-[359px]:text-[0.75rem]">
                    {chrome.liveDoctorSub}
                  </span>
                </span>
              </Link>

              {isOnline && (
                <Link
                  href={withLangPrefix("/ai-assistant", lang)}
                  aria-current={isAiAssistantActive ? "page" : undefined}
                  onClick={closeMobile}
                  data-menu-card=""
                  className={cn(
                    "press-row group flex min-h-21 min-w-0 flex-col justify-between rounded-(--radius-surface) p-3 text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none max-[359px]:p-2.5",
                    DRAWER_CARD,
                    DRAWER_FOCUS,
                    isAiAssistantActive
                      ? "border-sapphire-border/80 bg-sapphire-soft/90 dark:border-white/25 dark:bg-sapphire/25 dark:text-paper"
                      : "hover:border-sapphire-border/75 hover:bg-sapphire-soft/45 dark:text-paper dark:hover:bg-white/[0.06]",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sapphire-soft text-sapphire dark:bg-sapphire/25 dark:text-sapphire-border"
                    >
                      <AiAssistantIcon className="h-4.5 w-4.5" />
                    </span>
                    <ChevronRightIcon
                      className="arrow-travel h-4 w-4 shrink-0 text-muted-foreground/75 dark:text-mist/75"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-2 block min-w-0">
                    <span className="block font-display text-[0.9375rem] font-semibold leading-tight tracking-[-0.015em] text-foreground dark:text-paper">
                      {aiCopy.navLabel}
                    </span>
                    <span className="mt-0.5 block text-[0.8125rem] font-normal leading-snug text-muted-foreground [overflow-wrap:break-word] max-[359px]:text-[0.75rem] dark:text-mist">
                      {chrome.aiAssistantSub}
                    </span>
                  </span>
                </Link>
              )}
            </div>

            {/* 6 core destinations: single-column editorial list inside one floating white card */}
            <nav
              aria-label={chrome.primaryNav}
              style={{ "--i": 2 } as CSSProperties}
              className={cn(mobileOpen && "list-in")}
            >
              <ul
                data-menu-card=""
                className={cn(
                  "divide-y divide-border/75 overflow-hidden rounded-(--radius-surface) dark:divide-white/10",
                  DRAWER_CARD,
                )}
              >
                {primaryLinks.map((link) => {
                  const isActive = isActiveHref(link.href);
                  const NavIcon = NAV_LINK_ICONS[link.href];
                  const shortLabel = (NAV_SHORT_LABELS[lang] ?? NAV_SHORT_LABELS.ro)[link.href];
                  const isMediatorLink = link.href === "/mediatori";

                  return (
                    <li key={link.href}>
                      <Link
                        href={withLangPrefix(link.href, lang)}
                        aria-current={isActive ? "page" : undefined}
                        onClick={closeMobile}
                        className={cn(
                          "group flex min-h-11 w-full items-center gap-2.5 px-3 py-1",
                          DRAWER_ROW_MOTION,
                          DRAWER_FOCUS,
                          isActive
                            ? "bg-sapphire-soft/75 font-bold text-sapphire dark:bg-sapphire/25 dark:text-sapphire-border"
                            : "font-semibold text-foreground hover:bg-sapphire-soft/40 dark:text-paper/92 dark:hover:bg-white/[0.05]",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg transition-colors duration-(--dur-fast)",
                            isMediatorLink && !isActive
                              ? "bg-amber-care-soft text-amber-care dark:bg-amber-care/20 dark:text-amber-care-border"
                              : isActive
                                ? "bg-sapphire text-white dark:bg-sapphire-border dark:text-ink-950"
                                : "bg-sapphire-soft/85 text-sapphire group-hover:bg-sapphire-soft dark:bg-white/[0.07] dark:text-sapphire-border",
                          )}
                        >
                          <NavIcon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1 font-display text-[0.9375rem] leading-tight tracking-[-0.015em]">
                          {shortLabel}
                        </span>
                        <ChevronRightIcon
                          className="arrow-travel h-4 w-4 shrink-0 text-muted-foreground/65 group-hover:text-sapphire dark:text-mist/65 dark:group-hover:text-paper"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Personal and settings cluster: Home + Wellness Teal account row over Install + Accessibility */}
            <div
              style={{ "--i": 3 } as CSSProperties}
              className={cn(mobileOpen && "list-in", "space-y-1.5 md:hidden")}
            >
              <div className="flex flex-wrap gap-2">
                <Link
                  href={withLangPrefix("/", lang)}
                  aria-label={homeLabel}
                  aria-current={isHomeActive ? "page" : undefined}
                  onClick={closeMobile}
                  data-menu-card=""
                  className={cn(
                    "flex min-h-11 flex-[1_1_7rem] items-center gap-2 rounded-[0.875rem] px-3 py-1 text-[0.9375rem]",
                    DRAWER_CARD,
                    DRAWER_ROW_MOTION,
                    DRAWER_FOCUS,
                    isHomeActive
                      ? "border-sapphire-border/80 bg-sapphire-soft/90 font-semibold text-sapphire dark:border-white/25 dark:bg-sapphire/25 dark:text-sapphire-border"
                      : "font-semibold text-foreground hover:bg-sapphire-soft/40 dark:text-paper dark:hover:bg-white/[0.06]",
                  )}
                >
                  <HomeIcon
                    className={cn(
                      "h-4.5 w-4.5 shrink-0",
                      isHomeActive ? "text-sapphire dark:text-sapphire-border" : "text-muted-foreground dark:text-mist",
                    )}
                    aria-hidden="true"
                  />
                  <span className="whitespace-nowrap leading-snug">{chrome.homeShort}</span>
                </Link>

                <Link
                  href={withLangPrefix(portalLink.href, lang)}
                  onClick={closeMobile}
                  aria-current={isPortalActive ? "page" : undefined}
                  data-mobile-account-trigger=""
                  data-menu-card=""
                  className={cn(
                    "group flex min-h-11 flex-[1.45_1_12rem] items-center justify-between gap-2 rounded-[0.875rem] px-3 py-1 text-[0.9375rem] font-semibold",
                    DRAWER_CARD,
                    DRAWER_ROW_MOTION,
                    DRAWER_FOCUS,
                    isPortalActive
                      ? "border-wellness bg-wellness text-white shadow-2xs dark:border-wellness-border dark:bg-wellness dark:text-white"
                      : "text-foreground hover:bg-wellness-soft/45 dark:text-paper dark:hover:bg-white/[0.06]",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        isPortalActive
                          ? "bg-white/18 text-white"
                          : "bg-wellness-soft text-wellness dark:bg-wellness/25 dark:text-wellness-border",
                      )}
                    >
                      <UserIcon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 whitespace-nowrap leading-snug">{portalLink.label}</span>
                  </span>
                  <ChevronRightIcon className="arrow-travel h-4 w-4 shrink-0 opacity-75" aria-hidden="true" />
                </Link>
              </div>

              <div
                data-menu-card=""
                className={cn(
                  "divide-y divide-border/75 overflow-hidden rounded-[0.875rem] dark:divide-white/10",
                  DRAWER_CARD,
                )}
              >
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
                    "flex min-h-11 w-full items-center gap-2.5 px-3 py-1 text-left text-[0.9375rem] font-medium text-foreground hover:bg-sapphire-soft/40 disabled:cursor-wait disabled:opacity-75 dark:text-paper dark:hover:bg-white/[0.06]",
                    DRAWER_ROW_MOTION,
                    DRAWER_FOCUS,
                  )}
                >
                  {showInstallTrigger ? (
                    <DownloadIcon className="h-4.5 w-4.5 shrink-0 text-muted-foreground dark:text-mist" aria-hidden="true" />
                  ) : (
                    <RefreshIcon className="h-4.5 w-4.5 shrink-0 text-muted-foreground dark:text-mist" aria-hidden="true" />
                  )}
                  <span className="leading-snug">{pwaTriggerLabel}</span>
                </button>

                <div className="px-0.5">
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
            </div>

            {/* Feedback and report links: quiet row directly above the sticky 112 card */}
            <div
              style={{ "--i": 4 } as CSSProperties}
              className={cn(
                mobileOpen && "list-in",
                "mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-0 px-1 text-[0.875rem] text-muted-foreground dark:text-mist",
              )}
            >
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
                {(feedbackTriggerCopy[lang] ?? feedbackTriggerCopy.ro).footerLink}
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

            {/* 112 emergency card: last in the flow and stuck to the bottom edge */}
            <div
              style={{ "--i": 5 } as CSSProperties}
              className={cn(
                mobileOpen && "list-in",
                "sticky bottom-0 z-10 -mx-1 bg-white/95 px-1 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-md dark:bg-ink-950/95",
              )}
            >
              <div
                data-menu-card=""
                className="flex min-h-12.5 items-center justify-between gap-2.5 rounded-(--radius-surface) border border-rose-border/80 bg-card px-3 py-1.5 shadow-[0_2px_10px_-3px_rgb(29_53_87/0.09)] dark:border-[#ff8f98]/25 dark:bg-ink-900"
              >
                <p className="font-display text-[0.9375rem] font-semibold text-foreground dark:text-paper">
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
                  className="btn-sheen min-h-11 shrink-0 rounded-lg border-primary! bg-primary! px-3 py-1 text-[0.9375rem] font-semibold whitespace-nowrap text-white! shadow-[0_4px_12px_-4px_rgb(198_47_60/0.45)]! hover:border-primary-hover! hover:bg-primary-hover! dark:border-[#c62f3c]! dark:bg-[#c62f3c]! dark:text-white! dark:hover:bg-[#a8242f]! dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink-950"
                >
                  <PhoneIcon className="h-4 w-4" />
                  <span>{tHeader.call112}</span>
                </Button>
              </div>
            </div>
          </Container>
        </div>
      </header>

      {dialerOpen ? <EmergencyDialerGate open={dialerOpen} onOpenChange={setDialerOpen} /> : null}
    </>
  );
}
