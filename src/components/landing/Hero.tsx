"use client";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ListenButton } from "@/components/ui/ListenButton";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { heroCopy, localHref } from "@/lib/i18n/hero-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import { WheelBackdrop } from "./WheelBackdrop";
import { HeroPhotos } from "./hero/HeroPhotos";

/**
 * Landing hero:
 * - Extends beneath the transparent-on-load sticky header (and its 112 line) by --site-header-h
 *   over the obsidian-navy editorial ground with filtered consultation photos (HeroPhotos).
 * - Rotating geometric chakra wheel (WheelBackdrop) rising above and fading subtly behind the
 *   headline on mobile, and layered behind the right-side photography on desktop, dissolving as
 *   the next stacked sheet slides up.
 * - Strictly one single primary entry CTA straight to /health-check (plus read-aloud when enabled).
 */
export function Hero() {
  const { lang } = useLanguage();
  const copy = heroCopy[lang];
  const { panel } = copy;
  const voiceEnabled = isVoiceEnabled(lang);

  return (
    <section
      aria-labelledby="hero-title"
      className="hero relative isolate flex flex-1 flex-col justify-center overflow-hidden bg-ink-950 pt-(--site-header-h) text-paper min-h-svh lg:min-h-[calc(100svh-3.5rem)]"
    >
      <HeroPhotos />
      <div aria-hidden="true" className="hero-wheel-dissolve pointer-events-none absolute inset-0 -z-10 hidden lg:block">
        <WheelBackdrop placement="hero" />
      </div>

      <Container className="hero-grid flex flex-1 flex-col items-center justify-center py-8 text-center lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:content-center lg:items-center lg:gap-x-12 lg:py-14 lg:text-left xl:gap-x-20 [&>*]:min-w-0">
        <div className="relative flex w-full max-w-xl flex-col items-center pt-30 sm:pt-36 lg:col-start-1 lg:block lg:max-w-2xl lg:pt-0">
          <div
            aria-hidden="true"
            className="hero-in pointer-events-none absolute inset-x-0 top-0 z-0 flex justify-center [--in:40ms] lg:hidden"
          >
            <WheelBackdrop placement="hero-top" />
          </div>

          <div className="hero-phone-drift relative z-10">
            <h1 id="hero-title" className="hero-title max-w-2xl text-balance font-bold text-paper">
              <span className="lg:hidden">
                <span className="hero-in block [--in:60ms]">{copy.mobileTitle[0]}</span>
                <span className="hero-title-warm hero-in block [--in:140ms]">{copy.mobileTitle[1]}</span>
              </span>
              <span className="hero-in hidden [--in:60ms] lg:inline-block">{copy.title}</span>
            </h1>

            <p className="hero-in mx-auto mt-4 max-w-(--measure-lead) [--in:180ms] text-pretty text-lead text-mist lg:mx-0 lg:mt-5">
              {copy.trustLine}
            </p>
          </div>

          <div aria-hidden="true" className="hero-mobile-stage h-8 sm:h-10 lg:hidden" />

          <div
            id="triage"
            className="hero-in relative z-10 w-full scroll-mt-24 [--in:260ms] lg:mt-9 lg:w-auto"
          >
            <div className="btn-row flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Button
                variant="action"
                size="lg"
                href={localHref("/health-check", lang)}
                className="hero-focus min-h-14 justify-center bg-paper! px-7 text-ink-950! shadow-lg shadow-black/25! hover:bg-paper/90! active:bg-paper/80!"
              >
                <span>{copy.primaryCta}</span>
              </Button>

              {voiceEnabled && (
                <ListenButton
                  uiLang={lang}
                  autoRead
                  getText={() =>
                    [copy.title, copy.trustLine, copy.primaryCta].join(" ")
                  }
                  label={panel.listen}
                  stopLabel={panel.stopListening}
                  className="hero-focus min-h-14 shrink-0 border-paper/24! bg-paper/[0.06]! text-paper! shadow-none! backdrop-blur-sm hover:border-paper/45! hover:bg-paper/[0.12]! [&_svg]:text-paper!"
                />
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
