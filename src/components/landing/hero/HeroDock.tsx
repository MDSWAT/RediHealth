"use client";

import { useEffect, useState } from "react";
import { getImageProps } from "next/image";
import { Button } from "@/components/ui/Button";
import { ListenButton } from "@/components/ui/ListenButton";
import { ArrowRightIcon } from "@/components/ui/icons";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { localHref, type HeroCopy } from "@/lib/i18n/hero-copy";
import type { Lang } from "@/lib/i18n/translations";
import {
  INNER_STARS,
  OUTER_STARS,
  WHEEL_VIEW_BOX,
  WheelSpokes,
  WheelStars,
} from "../HealthTopicsWheelArt";
import styles from "./HeroDock.module.css";

const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const BACKDROP_PHOTOS = ["/images/hero-care.jpg", "/images/hero-consultation.jpg", "/images/hero-desk.jpg"];

/**
 * The hero on phones and tablets (below lg):
 * - Atmospheric consultation photos as a darkened, softly blurred backdrop (phones only)
 *   plus the decorative topic wheel rising behind the dock.
 * - A calm, non-draggable dock holding the SINGLE primary entry CTA straight to /health-check
 *   and the quiet read-aloud trigger (when voice is enabled).
 */
export function HeroDock({ copy, lang }: { copy: HeroCopy; lang: Lang }) {
  const [mountCyclePhotos, setMountCyclePhotos] = useState(false);
  const voiceEnabled = isVoiceEnabled(lang);
  const { panel } = copy;

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;
    const schedule = () => {
      timeoutId = setTimeout(() => setMountCyclePhotos(true), 1200);
    };
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(schedule, { timeout: 2000 });
    } else {
      schedule();
    }
    return () => {
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  const photos = (mountCyclePhotos ? BACKDROP_PHOTOS : BACKDROP_PHOTOS.slice(0, 1)).map((src, index) =>
    getImageProps({
      src,
      alt: "",
      width: 1100,
      height: 619,
      sizes: "100vw",
      loading: index === 0 ? "eager" : "lazy",
      decoding: "async",
      fetchPriority: index === 0 ? "high" : "low",
    }).props,
  );

  return (
    <div className="flex flex-col lg:hidden">
      {/* Decorative ground for the phone hero: photos, ink scrim, and subtle grain. */}
      <div aria-hidden="true" className={styles.backdrop}>
        {photos.map(({ srcSet, sizes, ...photoProps }, index) => (
          <picture key={BACKDROP_PHOTOS[index]}>
            <source media="(max-width: 1023px)" srcSet={srcSet} sizes={sizes} />
            <img {...photoProps} src={TRANSPARENT_PIXEL} alt="" className={styles.photo} />
          </picture>
        ))}
        <div className={styles.scrim} />
        <div className={styles.grain} />
      </div>

      {/* Subtle decorative wheel backdrop rising gently above the dock. */}
      <div aria-hidden="true" className={`${styles.sun} ${styles.sunDissolve}`}>
        <div className={styles.sunStage}>
          <div className={styles.glow} />
          <div className={styles.wheel}>
            <div className={`${styles.layer} ${styles.outer}`}>
              <svg className={styles.layer} viewBox={WHEEL_VIEW_BOX} focusable="false">
                <WheelStars stars={OUTER_STARS} className={styles.star} idPrefix="hero-dock-htw" />
              </svg>
            </div>
            <svg className={`${styles.layer} ${styles.inner}`} viewBox={WHEEL_VIEW_BOX} focusable="false">
              <WheelStars stars={INNER_STARS} className={styles.star} idPrefix="hero-dock-htw" />
            </svg>
            <svg className={styles.hub} viewBox="-50 -50 100 100" focusable="false">
              <circle r="47" fill="none" stroke="currentColor" strokeWidth="3" />
              <WheelSpokes fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>

      {/* Calm, stationary dock with the single entry CTA and read-aloud. */}
      <div className={`hero-dock-in relative -mt-6 rounded-t-3xl border-t border-paper/15 bg-ink-950/85 px-5 pt-5 pb-6 text-paper backdrop-blur-md ${styles.dock}`}>
        <div className="mx-auto max-w-xl">
          <Button
            variant="action"
            size="lg"
            fullWidth
            href={localHref("/health-check", lang)}
            className="min-h-14 justify-between bg-paper! text-ink-950! hover:bg-paper/90! active:bg-paper/80! max-[359px]:px-3"
          >
            <span>{copy.primaryCta}</span>
            <ArrowRightIcon className="arrow-travel h-5 w-5 shrink-0 max-[359px]:hidden" />
          </Button>

          {voiceEnabled && (
            <div className="mt-3 flex justify-center">
              <ListenButton
                uiLang={lang}
                autoRead
                getText={() =>
                  [...copy.mobileTitle, copy.trustLine, copy.primaryCta].join(" ")
                }
                label={panel.listen}
                stopLabel={panel.stopListening}
                className="border-paper/35 bg-transparent text-paper shadow-none hover:border-paper/60 hover:bg-paper/10 active:bg-paper/15 dark:border-paper/35 dark:bg-transparent dark:text-paper dark:hover:bg-paper/10 aria-[pressed=true]:border-paper aria-[pressed=true]:bg-paper/15 aria-[pressed=true]:text-paper dark:aria-[pressed=true]:border-paper dark:aria-[pressed=true]:bg-paper/15 dark:aria-[pressed=true]:text-paper"
                iconClassName="text-paper"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
