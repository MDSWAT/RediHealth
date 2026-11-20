"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  INNER_STARS,
  OUTER_STARS,
  WHEEL_NODE_ORBIT,
  WHEEL_VIEW,
  WHEEL_VIEW_BOX,
  WheelSpokes,
  WheelStars,
} from "./HealthTopicsWheelArt";
import { WHEEL_ICONS } from "./HealthTopicsWheelIcons";
import { WHEEL_ORDER } from "./health-topics-wheel-config";
import styles from "./WheelBackdrop.module.css";

/**
 * The topic wheel as decoration, turning slowly with all eight topic icons riding the outer ring
 * upright as outlines (purely decorative, not buttons).
 * - `hero`: paper-white on the obsidian-navy hero ground on desktop, layered behind the right side.
 * - `hero-top`: standalone centered inline wheel above the hero headline on mobile so it sits on top
 *   of the text rather than behind it.
 * - `footer`: paper-white on the ink footer, a small wheel behind the footer's content.
 * Purely decorative: hidden from assistive technology, never clickable, still under reduced motion.
 */
export function WheelBackdrop({ placement }: { placement: "hero" | "hero-top" | "footer" }) {
  const idPrefix = `${placement}-htw`;
  const backdropRef = useRef<HTMLDivElement>(null);
  const [offscreen, setOffscreen] = useState(false);

  useEffect(() => {
    const node = backdropRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setOffscreen(!entry.isIntersecting);
      },
      { rootMargin: "120px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const placementClass =
    placement === "hero-top" ? styles.heroTop : styles[placement];

  return (
    <div
      ref={backdropRef}
      aria-hidden="true"
      data-offscreen={offscreen ? "" : undefined}
      className={`${styles.backdrop} ${placementClass}`}
    >
      <div className={styles.wheel}>
        <div className={`${styles.layer} ${styles.outer}`}>
          <svg className={styles.layer} viewBox={WHEEL_VIEW_BOX} focusable="false">
            <WheelStars stars={OUTER_STARS} className={styles.star} idPrefix={idPrefix} />
          </svg>
          {WHEEL_ORDER.map((slug, index) => {
            const Icon = WHEEL_ICONS[slug];
            const angle = ((index * 360) / WHEEL_ORDER.length - 90) * (Math.PI / 180);
            const orbit = (WHEEL_NODE_ORBIT / WHEEL_VIEW) * 100;
            return (
              <span
                key={slug}
                className={styles.node}
                style={
                  {
                    "--x": `${(50 + orbit * Math.cos(angle)).toFixed(3)}%`,
                    "--y": `${(50 + orbit * Math.sin(angle)).toFixed(3)}%`,
                  } as CSSProperties
                }
              >
                <span className={styles.face}>{Icon ? <Icon className={styles.icon} /> : null}</span>
              </span>
            );
          })}
        </div>
        <svg className={`${styles.layer} ${styles.inner}`} viewBox={WHEEL_VIEW_BOX} focusable="false">
          <WheelStars stars={INNER_STARS} className={styles.star} idPrefix={idPrefix} />
        </svg>
        <svg className={styles.hub} viewBox="-50 -50 100 100" focusable="false">
          <circle r="47" fill="none" stroke="currentColor" strokeWidth="3" />
          <WheelSpokes fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
