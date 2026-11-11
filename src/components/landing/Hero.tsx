"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { heroCopy } from "@/lib/i18n/hero-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import { PhoneIcon } from "@/components/ui/icons";
import { CarePath } from "./hero/CarePath";
import { TriagePanel } from "./hero/TriagePanel";
import { useDialogFocus } from "@/components/health-check/useDialogFocus";

/**
 * Landing hero:
 * - Extends beneath the transparent-on-load sticky header (-mt-16 pt-16 lg:-mt-20 lg:pt-20).
 * - Two columns on a shared grid: headline and steps align to the panel's question and footer.
 * - Phones and tablets: the photo is an in-flow band under the header zone that fades into the
 *   ink ground, so every line of text sits on solid ink. Desktop: the same photo is full-bleed behind ink scrims. It never moves.
 * - Entrance: the copy column settles once (globals.css `.hero-enter`), nothing staggers.
 */
export function Hero() {
  const { lang } = useLanguage();
  const copy = heroCopy[lang];
  const [who, promise] = copy.lead.split(/(?<=\.)\s+/);

  // Phones and tablets: the panel opens as a bottom sheet from the primary button.
  // Desktop: it stays beside the headline. The sheet is one history entry, so Back closes it.
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const closeSheet = useCallback(() => {
    if (window.history.state?.heroSheet) window.history.back();
    else setSheetOpen(false);
  }, []);

  useDialogFocus(sheetRef, sheetOpen, closeSheet);

  useEffect(() => {
    if (!sheetOpen) return;
    const onPop = () => setSheetOpen(false);
    // Growing the window to desktop width puts the panel back in the page.
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onWide = () => desktop.matches && closeSheet();
    window.addEventListener("popstate", onPop);
    desktop.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("popstate", onPop);
      desktop.removeEventListener("change", onWide);
    };
  }, [sheetOpen, closeSheet]);

  const goToTriage = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.history.pushState({ ...window.history.state, heroSheet: true }, "");
    setSheetOpen(true);
  };

  return (
    <section
      aria-labelledby="hero-title"
      className="hero relative isolate -mt-16 flex min-h-[calc(100svh-65px)] flex-col overflow-hidden bg-ink-950 pt-16 text-paper lg:-mt-20 lg:pt-20 xl:min-h-[calc(100svh-81px)]"
    >
      {/* One photo, two placements: a band in the flow below lg, full-bleed behind the scrims from lg. */}
      <div className="relative h-[clamp(180px,30svh,300px)] shrink-0 lg:absolute lg:inset-0 lg:-z-30 lg:h-auto">
        <Image
          src="/images/hero-consultation.jpg"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          className="pointer-events-none object-cover object-[60%_35%] select-none lg:object-[65%_center]"
        />
        {/* Phones: a light ink tint joins the photo to the header zone, then from 40% of its height
            the photo eases into the ink ground the headline sits on. Many stops, so no band shows. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-ink-950)_28%,transparent)_0%,transparent_22%,transparent_40%,color-mix(in_srgb,var(--color-ink-950)_8%,transparent)_50%,color-mix(in_srgb,var(--color-ink-950)_24%,transparent)_60%,color-mix(in_srgb,var(--color-ink-950)_46%,transparent)_70%,color-mix(in_srgb,var(--color-ink-950)_70%,transparent)_80%,color-mix(in_srgb,var(--color-ink-950)_90%,transparent)_90%,var(--color-ink-950)_100%)] lg:hidden"
        />
      </div>
      {/* Horizontal scrim: near-solid ink under the headline, easing off toward the panel side. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 hidden bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-ink-950)_96%,transparent)_0%,color-mix(in_srgb,var(--color-ink-950)_90%,transparent)_38%,color-mix(in_srgb,var(--color-ink-950)_62%,transparent)_68%,color-mix(in_srgb,var(--color-ink-950)_50%,transparent)_100%)] lg:block"
      />
      {/* Vertical scrim: blends the photo into the header above and the ribbon below. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 hidden bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-ink-950)_85%,transparent)_0%,transparent_22%,transparent_70%,color-mix(in_srgb,var(--color-ink-950)_95%,transparent)_100%)] lg:block"
      />
      {/* Subtle bottom inset horizon hairline separating the hero ground from the regional ribbon. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-px bg-linear-to-r from-white/5 via-white/20 to-white/5"
      />

      <Container className="grid flex-1 content-center gap-y-10 pb-10 pt-5 sm:py-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-stretch lg:content-center lg:gap-x-14 lg:py-12 xl:gap-x-20">
        {/* Desktop: the headline lines up with the panel question, the steps with the panel footer. */}
        <div className="hero-enter flex flex-col lg:justify-between lg:pb-7 lg:pt-[80px]">
          <div>
            <h1 id="hero-title" className="hero-title max-w-[22ch] text-balance font-bold text-paper">
              {copy.title}
            </h1>
            {/* Who it is for, then the promise. Desktop sets the promise on its own line. */}
            <p className="mt-4 max-w-[34ch] text-pretty text-lead text-mist sm:mt-5 sm:max-w-[52ch]">
              <span className="lg:block">{who}</span>
              {promise ? (
                <>
                  {" "}
                  <span className="font-semibold text-paper lg:mt-1.5 lg:block">{promise}</span>
                </>
              ) : null}
            </p>
            {/* The page's one 112 line: calm, under the promise, tappable on phones. */}
            <p className="mt-3 flex items-center gap-2 text-body text-mist sm:mt-4">
              <PhoneIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-paper/70" />
              <span>
                {copy.emergency.callLead}{" "}
                <a
                  href="tel:112"
                  className="hero-focus -my-2 inline-flex min-h-11 items-center rounded-sm font-semibold text-paper underline decoration-paper/40 underline-offset-4 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:decoration-paper"
                >
                  {copy.emergency.callLink}
                </a>
                .
              </span>
            </p>

            <a
              href="#triage"
              onClick={goToTriage}
              className="hero-focus press-solid mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-(--radius-control) bg-paper px-6 text-base font-semibold text-ink-950 shadow-(--hairline-refraction) transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-paper/90 sm:mt-7 sm:w-auto lg:hidden"
            >
              {copy.primaryCta}
            </a>
          </div>

          <CarePath steps={copy.journey} className="hidden lg:grid lg:mt-12" />
        </div>

        {/* Desktop: the panel in the page. Phones: it opens as a sheet, rendered on <body> so it
            sits above the sticky header (the hero's `isolate` would otherwise trap its z-index). */}
        <div id="triage" className="hidden scroll-mt-24 lg:block">
          {!sheetOpen && <TriagePanel copy={copy.panel} alarmSigns={copy.emergency.alarmSigns} lang={lang} />}
        </div>
        {sheetOpen &&
          createPortal(
            <>
              <div aria-hidden="true" onClick={closeSheet} className="hero-sheet-backdrop fixed inset-0 z-[80] bg-ink-950/60" />
              <div
                ref={sheetRef}
                role="dialog"
                aria-modal="true"
                aria-label={copy.panel.label}
                className="hero-sheet fixed inset-x-0 bottom-0 z-[81] max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-(--radius-surface) bg-paper pb-[env(safe-area-inset-bottom)] text-ink-950"
              >
                {/* One header row: the panel's own, with the close button beside the voice control. */}
                <span aria-hidden="true" className="absolute left-1/2 top-1.5 z-20 h-1 w-10 -translate-x-1/2 rounded-full bg-ink-950/20" />
                <TriagePanel
                  copy={copy.panel}
                  alarmSigns={copy.emergency.alarmSigns}
                  lang={lang}
                  onClose={closeSheet}
                  closeLabel={copy.emergency.close}
                />
              </div>
            </>,
            document.body,
          )}
      </Container>
    </section>
  );
}
