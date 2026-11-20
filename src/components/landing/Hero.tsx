"use client";

import { BrandCross } from "@/components/ui/BrandCross";
import { Container } from "@/components/ui/Container";
import { ListenButton } from "@/components/ui/ListenButton";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { heroCopy } from "@/lib/i18n/hero-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import { WheelBackdrop } from "./WheelBackdrop";
import { HeroDock } from "./hero/HeroDock";
import { HeroPhotos } from "./hero/HeroPhotos";
import { HeroRoutes } from "./hero/HeroRoutes";

/**
 * Landing hero:
 * - Extends beneath the transparent-on-load sticky header (and its 112 line) by --site-header-h.
 * - Below lg it fills the viewport so the calm dock anchors cleanly at the bottom edge.
 * - Desktop: consultation photos cross-fade under a sapphire tint and ink scrims (HeroPhotos).
 *   On the left sit the brand cross, headline, one short plain trust line, and read-aloud;
 *   on the right sits the single entry CTA to /health-check (HeroRoutes).
 * - Phones and tablets: headline and plain trust line above atmospheric consultation photos,
 *   the decorative wheel, and a grounded dock with the same single entry CTA and read-aloud (HeroDock).
 * - Static on first paint: headline and CTA render visibly at once with zero hero popups.
 */
export function Hero() {
  const { lang } = useLanguage();
  const copy = heroCopy[lang];
  const { panel } = copy;
  const voiceEnabled = isVoiceEnabled(lang);

  return (
    <section
      aria-labelledby="hero-title"
      className="hero relative isolate -mt-(--site-header-h) flex min-h-svh flex-col lg:min-h-[calc(100svh-var(--site-header-h))] overflow-hidden bg-ink-950 pt-(--site-header-h) text-paper"
    >
      <HeroPhotos />
      {/* The topic wheel, turning slowly behind the headline on the left (desktop only). */}
      <div aria-hidden="true" className="hero-wheel-dissolve hidden lg:block">
        <WheelBackdrop placement="hero" />
      </div>
      {/* Subtle bottom inset horizon hairline separating the hero ground from the next section. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-px bg-linear-to-r from-white/5 via-white/20 to-white/5"
      />

      <Container className="hero-grid grid grid-cols-1 content-start max-lg:flex-1 max-lg:content-center gap-y-5 py-6 sm:gap-y-7 sm:py-10 lg:flex-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:content-center lg:gap-x-16 lg:py-10 xl:gap-x-24 [&>*]:min-w-0">
        <div className="flex min-w-0 flex-col lg:justify-center">
          <div className="hero-phone-drift max-w-xl max-lg:relative max-lg:mx-auto max-lg:text-center">
            <span className="hero-cross-slot relative mb-5 block w-fit max-lg:mx-auto lg:mb-6">
              <span aria-hidden="true" className="hero-cross-halo" />
              <BrandCross sheen className="hero-cross hero-cross-in relative block h-11 w-11 text-paper lg:h-13 lg:w-13" />
            </span>

            <h1 id="hero-title" className="hero-title text-balance font-bold text-paper">
              <span className="lg:hidden">
                <span className="hero-in block [--in:140ms]">{copy.mobileTitle[0]}</span>
                <span className="hero-title-warm hero-in block [--in:230ms]">{copy.mobileTitle[1]}</span>
              </span>
              <span className="hero-in hidden [--in:140ms] lg:inline-block">{copy.title}</span>
            </h1>

            <p className="hero-in mx-auto mt-4 max-w-[22rem] [--in:330ms] text-pretty text-body text-paper/80 lg:mx-0 lg:mt-5 lg:max-w-lg lg:text-lead lg:text-mist">
              {copy.trustLine}
            </p>

            {voiceEnabled && (
              <div className="hero-in mt-6 hidden [--in:420ms] lg:flex">
                <ListenButton
                  uiLang={lang}
                  autoRead
                  getText={() =>
                    [copy.title, copy.trustLine, panel.needs.risk.title, panel.needs.risk.body, copy.primaryCta].join(" ")
                  }
                  label={panel.listen}
                  stopLabel={panel.stopListening}
                  className="shrink-0 border-paper/35 bg-transparent text-paper shadow-none hover:border-paper/60 hover:bg-paper/10 active:bg-paper/15 dark:border-paper/35 dark:bg-transparent dark:text-paper dark:hover:bg-paper/10 aria-[pressed=true]:border-paper aria-[pressed=true]:bg-paper/15 aria-[pressed=true]:text-paper dark:aria-[pressed=true]:border-paper dark:aria-[pressed=true]:bg-paper/15 dark:aria-[pressed=true]:text-paper"
                  iconClassName="text-paper"
                />
              </div>
            )}
          </div>
        </div>

        {/* Desktop: single unified primary entry CTA beside the headline. */}
        <div id="triage" className="hero-in hidden scroll-mt-24 [--in:300ms] lg:block">
          <HeroRoutes copy={copy} lang={lang} />
        </div>
      </Container>

      <HeroDock copy={copy} lang={lang} />
    </section>
  );
}
