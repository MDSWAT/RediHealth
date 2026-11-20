"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ListenButton } from "@/components/ui/ListenButton";
import { ArrowRightIcon } from "@/components/ui/icons";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { heroCopy, localHref } from "@/lib/i18n/hero-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import { useCalmReducedMotion } from "@/lib/motion/tokens";
import { WheelBackdrop } from "./WheelBackdrop";
import { HeroPhotos } from "./hero/HeroPhotos";

/**
 * Landing hero:
 * - Full-width white paper editorial ground with multiple calm clinical photos fading cleanly
 *   through a luminous daylight window on mobile and on the right side on desktop (HeroPhotos).
 * - Rotating geometric chakra wheel (WheelBackdrop) centered inside the open mobile visual stage
 *   and layered behind the right-side photography on desktop, dissolving as the next stacked
 *   sheet slides up, with rAF-smoothed subtle pointer parallax on fine desktop pointers.
 * - Strictly one single primary entry CTA straight to /health-check (plus quiet read-aloud when enabled).
 */
export function Hero() {
  const { lang } = useLanguage();
  const copy = heroCopy[lang];
  const { panel } = copy;
  const voiceEnabled = isVoiceEnabled(lang);
  const reducedMotion = useCalmReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reducedMotion || typeof window === "undefined") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let rafId = 0;
    let targetPx = 0;
    let targetPy = 0;
    let currentPx = 0;
    let currentPy = 0;
    let targetMx = 50;
    let targetMy = 50;

    const tick = () => {
      currentPx += (targetPx - currentPx) * 0.12;
      currentPy += (targetPy - currentPy) * 0.12;
      el.style.setProperty("--hero-px", currentPx.toFixed(4));
      el.style.setProperty("--hero-py", currentPy.toFixed(4));
      el.style.setProperty("--hero-mx", `${targetMx.toFixed(1)}%`);
      el.style.setProperty("--hero-my", `${targetMy.toFixed(1)}%`);
      if (Math.abs(targetPx - currentPx) > 0.002 || Math.abs(targetPy - currentPy) > 0.002) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        rafId = 0;
      }
    };

    const schedule = () => {
      if (rafId === 0) rafId = window.requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = (event.clientY - rect.top) / rect.height;
      targetPx = (nx - 0.5) * 2;
      targetPy = (ny - 0.5) * 2;
      targetMx = nx * 100;
      targetMy = ny * 100;
      el.style.setProperty("--hero-aura", "1");
      schedule();
    };

    const onPointerLeave = () => {
      targetPx = 0;
      targetPy = 0;
      el.style.setProperty("--hero-aura", "0");
      schedule();
    };

    el.addEventListener("pointermove", onPointerMove, { passive: true });
    el.addEventListener("pointerleave", onPointerLeave, { passive: true });
    return () => {
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      el.style.removeProperty("--hero-px");
      el.style.removeProperty("--hero-py");
      el.style.removeProperty("--hero-mx");
      el.style.removeProperty("--hero-my");
      el.style.removeProperty("--hero-aura");
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-title"
      className="hero relative isolate flex flex-1 flex-col justify-center overflow-hidden bg-background text-foreground min-h-[calc(100svh-var(--site-header-h)-6.5rem)] lg:min-h-[calc(100svh-var(--site-header-h)-3.5rem)]"
    >
      <HeroPhotos />
      <div aria-hidden="true" className="hero-pointer-aura pointer-events-none absolute inset-0 -z-10 hidden lg:block" />
      <div aria-hidden="true" className="hero-wheel-dissolve pointer-events-none absolute inset-0 -z-10">
        <div className="hero-parallax-wheel absolute inset-0">
          <WheelBackdrop placement="hero" />
        </div>
      </div>

      <Container className="hero-grid flex flex-1 flex-col justify-between pt-6 pb-0 sm:pt-9 lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:content-center lg:items-center lg:gap-x-12 lg:py-14 xl:gap-x-20 [&>*]:min-w-0">
        <div className="flex flex-1 flex-col justify-between lg:col-start-1 lg:block lg:max-w-2xl">
          <div className="hero-phone-drift">
            <h1 id="hero-title" className="hero-title max-w-2xl text-balance font-bold text-foreground">
              <span className="lg:hidden">
                <span className="hero-in block [--in:60ms]">{copy.mobileTitle[0]}</span>
                <span className="hero-title-warm hero-in block [--in:140ms]">{copy.mobileTitle[1]}</span>
              </span>
              <span className="hero-in hidden [--in:60ms] lg:inline-block">{copy.title}</span>
            </h1>

            <p className="hero-in mt-3 max-w-(--measure-lead) [--in:180ms] text-pretty text-lead text-muted-foreground lg:mt-5">
              {copy.trustLine}
            </p>
          </div>

          <div aria-hidden="true" className="hero-mobile-stage min-h-36 flex-1 sm:min-h-44 lg:hidden" />

          <div
            id="triage"
            className="hero-in -mx-4 scroll-mt-24 rounded-t-2xl border-t border-sand-line/85 bg-background/94 px-4 pt-4 pb-5 shadow-(--shadow-card-hover) backdrop-blur-xl [--in:260ms] sm:-mx-6 sm:px-6 lg:mx-0 lg:mt-9 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none"
          >
            <div className="btn-row flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Button
                variant="action"
                size="lg"
                href={localHref("/health-check", lang)}
                className="min-h-13 justify-between gap-4 max-sm:flex-1 sm:min-h-14 sm:px-6"
              >
                <span>{copy.primaryCta}</span>
                <ArrowRightIcon className="arrow-travel h-5 w-5 shrink-0" aria-hidden="true" />
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
                  className="min-h-13 shrink-0 bg-card/95 backdrop-blur-sm sm:min-h-14"
                />
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
