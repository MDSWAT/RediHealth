"use client";

import { useEffect, useState } from "react";
import { getImageProps } from "next/image";
import styles from "./HeroPhotos.module.css";

const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/** The same three photos as the phone hero, from one consultation shoot (hands only, no faces). */
const PHOTOS = ["/images/hero-care.jpg", "/images/hero-consultation.jpg", "/images/hero-desk.jpg"];

/**
 * Desktop hero ground: the consultation photos, cross-fading slowly under a sapphire tint and
 * ink scrims (see HeroPhotos.module.css). The first photo loads with the page; the other two are
 * added once the browser is idle, fetched last. Phones and tablets never request them: the
 * only source is for screens from 1024px, and the phone hero has its own backdrop in HeroDock.
 */
export function HeroPhotos() {
  const [mountCycle, setMountCycle] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;
    const schedule = () => {
      timeoutId = setTimeout(() => setMountCycle(true), 1200);
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

  const photos = (mountCycle ? PHOTOS : PHOTOS.slice(0, 1)).map((src, index) =>
    getImageProps({
      src,
      alt: "",
      fill: true,
      sizes: "100vw",
      loading: index === 0 ? "eager" : "lazy",
      decoding: "async",
      fetchPriority: index === 0 ? "high" : "low",
    }).props,
  );

  return (
    <div aria-hidden="true" className={`${styles.ground} hidden lg:block`}>
      {photos.map(({ srcSet, sizes, ...photoProps }, index) => (
        <picture key={PHOTOS[index]}>
          <source media="(min-width: 1024px)" srcSet={srcSet} sizes={sizes} />
          <img {...photoProps} src={TRANSPARENT_PIXEL} alt="" className={styles.photo} />
        </picture>
      ))}
      <div className={styles.tint} />
      <div className={styles.scrim} />
    </div>
  );
}
