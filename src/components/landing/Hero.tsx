"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { heroCopy } from "@/lib/i18n/hero-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import { CarePath } from "./hero/CarePath";
import { TriagePanel } from "./hero/TriagePanel";
import { useDialogFocus } from "@/components/health-check/useDialogFocus";
import { CloseIcon } from "@/components/ui/icons";

/**
 * Landing hero:
 * - Extends beneath the transparent-on-load sticky header (-mt-16 pt-16 lg:-mt-20 lg:pt-20).
 * - Two columns on a shared grid: headline and steps align to the panel's question and footer.
 * - Full-bleed photo (object-cover) under ink gradient scrims so the copy keeps its contrast.
 * - Entrance: the copy and the panel fade in once (globals.css `.hero-enter`), nothing staggers.
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
      {/* Full-bleed consultation photo, filling the hero behind an ink gradient so the copy keeps its contrast. */}
      <Image
        src="/images/hero-consultation.jpg"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        className="pointer-events-none -z-30 object-cover object-[65%_center] select-none"
      />
      {/* Horizontal scrim: near-solid ink under the headline, easing off toward the panel side. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-ink-950/85 lg:bg-transparent lg:bg-[linear-gradient(90deg,rgba(10,18,38,0.96)_0%,rgba(10,18,38,0.9)_38%,rgba(10,18,38,0.62)_68%,rgba(10,18,38,0.5)_100%)]"
      />
      {/* Vertical scrim: blends the photo into the header above and the ribbon below. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(10,18,38,0.85)_0%,rgba(10,18,38,0)_22%,rgba(10,18,38,0)_70%,rgba(10,18,38,0.95)_100%)]"
      />

      <Container className="grid flex-1 content-center gap-y-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-stretch lg:content-center lg:gap-x-14 lg:py-12 xl:gap-x-20">
        {/* Desktop: the headline lines up with the panel question, the steps with the panel footer. */}
        <div className="hero-enter flex flex-col lg:justify-between lg:pb-7 lg:pt-[80px]">
          <div>
            <h1 id="hero-title" className="hero-title max-w-[22ch] text-balance font-bold text-paper">
              {copy.title}
            </h1>
            {/* Who it is for, then the promise. Desktop sets the promise on its own line. */}
            <p className="mt-5 text-pretty text-[17px] leading-relaxed text-mist sm:text-[19px]">
              <span className="lg:block">{who}</span>
              {promise ? (
                <>
                  {" "}
                  <span className="font-medium text-paper/90 lg:mt-1.5 lg:block">{promise}</span>
                </>
              ) : null}
            </p>

            <a
              href="#triage"
              onClick={goToTriage}
              className="hero-focus mt-7 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-primary px-6 text-[15.5px] font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-primary-hover active:scale-[0.98] sm:w-auto lg:hidden"
            >
              {copy.primaryCta}
            </a>
          </div>

          <CarePath steps={copy.journey} className="mt-10 lg:mt-12" />
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
                className="hero-sheet fixed inset-x-0 bottom-0 z-[81] max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-[20px] bg-paper pb-[env(safe-area-inset-bottom)] text-ink-950"
              >
                <div className="sticky top-0 z-10 flex items-center justify-end bg-paper px-4 pt-2">
                  <span aria-hidden="true" className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-stone-300" />
                  <button
                    type="button"
                    onClick={closeSheet}
                    aria-label={copy.emergency.close}
                    className="mt-2 flex h-11 w-11 items-center justify-center rounded-full text-stone-600 hover:bg-stone-200/70 focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <CloseIcon className="h-5 w-5" />
                  </button>
                </div>
                <TriagePanel copy={copy.panel} alarmSigns={copy.emergency.alarmSigns} lang={lang} />
              </div>
            </>,
            document.body,
          )}
      </Container>
    </section>
  );
}
