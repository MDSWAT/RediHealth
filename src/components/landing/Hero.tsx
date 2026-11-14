"use client";

import { getImageProps } from "next/image";
import { Container } from "@/components/ui/Container";
import { heroCopy } from "@/lib/i18n/hero-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import { WheelBackdrop } from "./WheelBackdrop";
import { TriagePanel } from "./hero/TriagePanel";

const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/**
 * Landing hero:
 * - Extends beneath the transparent-on-load sticky header (and its 112 line) by --site-header-h.
 * - Two columns on a shared grid on desktop: headline and steps align to the panel's question and footer.
 * - Phones and tablets: solid ink ground with the vertical fade and no photo or wheel backdrop work on first paint.
 * - Desktop: the consultation photo sits full-bleed behind the ink scrims via <picture> source media="(min-width: 1024px)".
 * - Static on first paint: the headline copy column and triage panel render visibly immediately.
 */
export function Hero() {
  const { lang } = useLanguage();
  const copy = heroCopy[lang];
  const [who, promise] = copy.lead.split(/(?<=\.)\s+/);
  const {
    props: { srcSet: desktopSrcSet, sizes: desktopSizes, ...heroImgProps },
  } = getImageProps({
    src: "/images/hero-consultation.jpg",
    alt: "",
    fill: true,
    sizes: "100vw",
    loading: "eager",
    fetchPriority: "high",
  });

  return (
    <section
      aria-labelledby="hero-title"
      className="hero relative isolate -mt-(--site-header-h) flex min-h-[calc(100svh-var(--site-header-h))] flex-col overflow-hidden bg-ink-950 pt-(--site-header-h) text-paper"
    >
      {/* Desktop-only photo source: below lg phones keep solid ink and the gradient wash without requesting the photo. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-30 h-56 lg:inset-0 lg:h-auto">
        <picture className="pointer-events-none hidden lg:block">
          <source media="(min-width: 1024px)" srcSet={desktopSrcSet} sizes={desktopSizes} />
          <img
            {...heroImgProps}
            src={TRANSPARENT_PIXEL}
            alt=""
            aria-hidden="true"
            className="pointer-events-none object-cover object-[65%_center] select-none"
          />
        </picture>
        {/* Phones: smooth vertical wash easing cleanly into solid ink behind the headline and panel. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-ink-950)_32%,transparent)_0%,color-mix(in_srgb,var(--color-ink-950)_18%,transparent)_24%,color-mix(in_srgb,var(--color-ink-950)_44%,transparent)_56%,color-mix(in_srgb,var(--color-ink-950)_78%,transparent)_80%,var(--color-ink-950)_100%)] lg:hidden"
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
        className="pointer-events-none absolute inset-0 -z-20 hidden bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-ink-950)_85%,transparent)_0%,transparent_22%,transparent_70%,var(--color-ink-950)_100%)] lg:block"
      />
      {/* The topic wheel, faint and slow: framing the panel on desktop only (hidden below lg). */}
      <div aria-hidden="true" className="hidden lg:block">
        <WheelBackdrop placement="hero" />
      </div>
      {/* Subtle bottom inset horizon hairline separating the hero ground from the regional ribbon. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-px bg-linear-to-r from-white/5 via-white/20 to-white/5"
      />

      <Container className="hero-grid grid flex-1 content-start gap-y-5 pb-6 pt-3 sm:gap-y-7 sm:py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:content-center lg:gap-x-12 lg:py-12 xl:gap-x-16">
        {/* Desktop: the headline block sits in the vertical middle of the panel beside it (a touch above
            centre, which reads as centred), whatever the typeface or the language's line count. */}
        <div className="flex flex-col lg:justify-center">
          <div className="max-w-xl">
            <h1 id="hero-title" className="hero-title text-balance font-bold text-paper">
              {copy.title}
            </h1>
            {/* Concise single-line reassurance on phones; full who + promise from sm up. */}
            <p className="mt-3 max-w-md text-pretty text-lead text-mist sm:mt-5 sm:max-w-lg">
              {promise ? <span className="hidden sm:block">{who}</span> : null}
              <span
                className={
                  promise
                    ? "block font-semibold text-paper sm:mt-3 sm:border-t sm:border-paper/15 sm:pt-3"
                    : "block font-semibold text-paper"
                }
              >
                {promise || who}
              </span>
            </p>
          </div>
        </div>

        <div id="triage" className="scroll-mt-24">
          <TriagePanel copy={copy.panel} alarmSigns={copy.emergency.alarmSigns} lang={lang} />
        </div>
      </Container>
    </section>
  );
}
