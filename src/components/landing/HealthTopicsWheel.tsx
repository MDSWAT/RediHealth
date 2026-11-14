import Link from "next/link";
import { getHealthTopicsList } from "@/lib/i18n/health-information-topics";
import { getRequestLang, withLangPrefix } from "@/lib/i18n/server-routing";
import { HIGHLIGHT_ANGLE, WHEEL_ORDER } from "./health-topics-wheel-config";
import { INNER_STARS, OUTER_STARS, WHEEL_NODE_ORBIT, WHEEL_VIEW, WHEEL_VIEW_BOX, WheelSpokes, WheelStars } from "./HealthTopicsWheelArt";
import { WHEEL_ICONS } from "./HealthTopicsWheelIcons";
import styles from "./HealthTopicsWheel.module.css";

/* Geometry is in the artwork's own pixels, centred on 0,0. */
const VIEW = WHEEL_VIEW;
const NODE_ORBIT = WHEEL_NODE_ORBIT;

/**
 * Animated topic wheel: the outer star ring (carrying the eight topic buttons)
 * turns clockwise, the inner star ring turns counter-clockwise and the Roma
 * wheel at the centre spins. Each button lights up as it passes the upper-left
 * position. Pure CSS, so it stays a Server Component.
 */
export async function HealthTopicsWheel({ className, label = "Health topics" }: { className?: string; label?: string }) {
  const lang = await getRequestLang();
  const topics = getHealthTopicsList(lang);
  const ordered = WHEEL_ORDER.map((slug) => topics.find((topic) => topic.slug === slug)).filter(
    (topic) => topic !== undefined,
  );
  const viewBox = WHEEL_VIEW_BOX;

  return (
    <nav className={[styles.wheel, className].filter(Boolean).join(" ")} aria-label={label}>
      <div className={`${styles.layer} ${styles.outer}`} data-wheel-ring="">
        <svg className={styles.layer} viewBox={viewBox} aria-hidden="true" focusable="false">
          <WheelStars stars={OUTER_STARS} className={styles.star} />
        </svg>
        <ul className={styles.list}>
          {ordered.map(({ slug, title, icon }, index) => {
            const Icon = WHEEL_ICONS[slug] ?? icon;
            const degrees = (index * 360) / ordered.length;
            const angle = ((degrees - 90) * Math.PI) / 180;
            const x = 50 + (NODE_ORBIT / VIEW) * 100 * Math.cos(angle);
            const y = 50 + (NODE_ORBIT / VIEW) * 100 * Math.sin(angle);
            /* Fraction of a turn until this button reaches the highlight angle. */
            const untilHighlight = (((HIGHLIGHT_ANGLE - degrees) % 360) + 360) % 360 / 360;
            return (
              <li key={slug}>
                <Link
                  href={withLangPrefix(`/health-information/${slug}`, lang)}
                  className={styles.node}
                  data-topic={slug}
                  style={
                    {
                      "--x": `${x.toFixed(3)}%`,
                      "--y": `${y.toFixed(3)}%`,
                      "--hl-phase": (1 - untilHighlight).toFixed(4),
                    } as React.CSSProperties
                  }
                  aria-label={title}
                >
                  <span className={styles.face} data-wheel-clock="">
                    <span className={styles.rest}>
                      <Icon className={styles.icon} />
                    </span>
                    <span className={styles.lit} data-wheel-clock="">
                      <Icon className={styles.icon} />
                    </span>
                    <span className={styles.label} aria-hidden="true">
                      {title}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <svg
        className={`${styles.layer} ${styles.inner}`}
        viewBox={viewBox}
        aria-hidden="true"
        focusable="false"
      >
        <WheelStars stars={INNER_STARS} className={styles.star} />
      </svg>

      <svg className={styles.hub} viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
        <circle r="50" className={styles.hubDisc} />
        <WheelSpokes fill="#fff" />
        <circle r="6" className={styles.hubDisc} />
      </svg>
    </nav>
  );
}
