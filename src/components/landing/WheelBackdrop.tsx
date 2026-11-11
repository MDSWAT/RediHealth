import type { CSSProperties } from "react";
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
 * The topic wheel as decoration on an ink ground: paper-white and faint, turning slowly.
 * In the footer the eight topic icons ride the outer ring and stay upright, as outlines only:
 * they are not buttons. The hero shows the stars and the chakra alone. Put it inside a positioned element that makes its own stacking context.
 * - `hero`: on phones and tablets it sits in the right corridor of the ink ground below the photo
 *   band, keeping the chakra whole and clear of the photograph and CTA; on desktop it is larger
 *   than the hero and centred behind the triage panel, fading out toward the headline.
 * - `footer`: a small wheel on the left, behind the brand block.
 * Purely decorative: hidden from assistive technology, never clickable, still under reduced motion.
 */
export function WheelBackdrop({ placement }: { placement: "hero" | "footer" }) {
  const idPrefix = `${placement}-htw`;
  return (
    <div aria-hidden="true" className={`${styles.backdrop} ${styles[placement]}`}>
      <div className={styles.wheel}>
        <div className={`${styles.layer} ${styles.outer}`}>
          <svg className={styles.layer} viewBox={WHEEL_VIEW_BOX} focusable="false">
            <WheelStars stars={OUTER_STARS} className={styles.star} idPrefix={idPrefix} />
          </svg>
          {placement === "footer" && WHEEL_ORDER.map((slug, index) => {
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
