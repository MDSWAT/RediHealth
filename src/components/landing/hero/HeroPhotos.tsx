"use client";

import { getImageProps } from "next/image";
import { useEffect, useState } from "react";
import styles from "./HeroPhotos.module.css";

interface HeroPhotoSpec {
  src: string;
  objectPosition: string;
  photoClass: string;
}

const HERO_PHOTOS: readonly HeroPhotoSpec[] = [
  {
    src: "/images/hero-care.jpg",
    objectPosition: "58% 46%",
    photoClass: styles.photo1,
  },
  {
    src: "/images/hero-consultation.jpg",
    objectPosition: "62% 45%",
    photoClass: styles.photo2,
  },
  {
    src: "/images/health-topics/heart-health-care.jpg",
    objectPosition: "64% 42%",
    photoClass: styles.photo3,
  },
  {
    src: "/images/hero-desk.jpg",
    objectPosition: "52% 46%",
    photoClass: styles.photo4,
  },
];

export function HeroPhotos() {
  const [extraMounted, setExtraMounted] = useState(false);

  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === "function") {
      const id = win.requestIdleCallback(() => setExtraMounted(true), { timeout: 900 });
      return () => win.cancelIdleCallback?.(id);
    }

    const timer = window.setTimeout(() => setExtraMounted(true), 450);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div aria-hidden="true" className={styles.ground}>
      {HERO_PHOTOS.map(({ src, objectPosition, photoClass }, index) => {
        if (index > 0 && !extraMounted) {
          return null;
        }

        const { style, className, ...restProps } = getImageProps({
          src,
          alt: "",
          fill: true,
          sizes: "100vw",
          loading: index === 0 ? "eager" : "lazy",
          decoding: "async",
          fetchPriority: index === 0 ? "high" : "low",
        }).props;

        return (
          /* getImageProps delivers Next-optimized srcSet/sizes without wrapper spans that constrain keyframes. */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={src}
            {...restProps}
            alt=""
            style={{ ...style, objectPosition }}
            className={[styles.photo, photoClass, className].filter(Boolean).join(" ")}
          />
        );
      })}
      <div className={styles.tint} />
      <div className={styles.veil} />
    </div>
  );
}
