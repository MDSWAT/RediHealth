/*
 * The topic wheel's artwork: two rings of three 8-point stars and the Roma wheel's spokes.
 * No data and no hooks, so both Server and Client Components can draw it. Strokes take
 * `currentColor`, so the parent sets the colour.
 */

/* Geometry is in the artwork's own pixels, centred on 0,0. */
export const WHEEL_VIEW = 1060;
export const WHEEL_VIEW_BOX = `${-WHEEL_VIEW / 2} ${-WHEEL_VIEW / 2} ${WHEEL_VIEW} ${WHEEL_VIEW}`;
/** Radius of the circle the topic buttons sit on. */
export const WHEEL_NODE_ORBIT = 437;
const SPOKES = 16;

type Star = {
  id: string;
  /** Degrees clockwise from the top for the first tip. */
  offset: number;
  /** Gradient axis and the stroke opacity at each end. */
  from: [number, number, number];
  to: [number, number, number];
};

type StarRing = { stars: Star[]; outer: number; inner: number };

/* Three 8-point stars 15° apart. The first one's tips sit under the buttons. */
export const OUTER_STARS: StarRing = {
  outer: 452,
  inner: 310,
  stars: [
    { id: "o0", offset: 0, from: [400, -190, 0.9], to: [-380, 190, 0.1] },
    { id: "o1", offset: 14, from: [-230, -380, 0.9], to: [240, 380, 0.06] },
    { id: "o2", offset: 29, from: [-420, -160, 0.9], to: [400, 230, 0.12] },
  ],
};

export const INNER_STARS: StarRing = {
  outer: 254,
  inner: 161,
  stars: [
    { id: "i2", offset: 37.5, from: [150, -200, 0.38], to: [-150, 200, 0.06] },
    { id: "i1", offset: 22.5, from: [-230, 60, 0.6], to: [230, -40, 0.12] },
    { id: "i0", offset: 7.5, from: [-210, -150, 0.9], to: [220, 190, 0.22] },
  ],
};

/** Zigzag star outline centred on 0,0. */
function starPoints(tips: number, outer: number, inner: number, offset: number): string {
  const points: string[] = [];
  for (let i = 0; i < tips * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = ((offset + (i * 180) / tips - 90) * Math.PI) / 180;
    points.push(`${(radius * Math.cos(angle)).toFixed(1)},${(radius * Math.sin(angle)).toFixed(1)}`);
  }
  return points.join(" ");
}

/**
 * One ring of stars, for use inside an `<svg viewBox={WHEEL_VIEW_BOX}>`. `idPrefix` keeps the
 * gradient ids apart when the wheel is drawn more than once on a page.
 */
export function WheelStars({
  stars: { stars, outer, inner },
  className,
  idPrefix = "htw",
}: {
  stars: StarRing;
  className?: string;
  idPrefix?: string;
}) {
  return (
    <>
      <defs>
        {stars.map(({ id, from, to }) => (
          <linearGradient
            key={id}
            id={`${idPrefix}-${id}`}
            gradientUnits="userSpaceOnUse"
            x1={from[0]}
            y1={from[1]}
            x2={to[0]}
            y2={to[1]}
          >
            <stop offset="0" stopColor="currentColor" stopOpacity={from[2]} />
            <stop offset="1" stopColor="currentColor" stopOpacity={to[2]} />
          </linearGradient>
        ))}
      </defs>
      {stars.map(({ id, offset }) => (
        <polygon
          key={id}
          className={className}
          stroke={`url(#${idPrefix}-${id})`}
          points={starPoints(8, outer, inner, offset)}
        />
      ))}
    </>
  );
}

/** The Roma wheel's sixteen spokes, for use inside an `<svg viewBox="-50 -50 100 100">`. */
export function WheelSpokes({ fill }: { fill: string }) {
  return (
    <>
      {Array.from({ length: SPOKES }, (_, index) => (
        <path
          key={index}
          d="M0 -9 L-5.100 -38.600 A5.100 5.100 0 0 1 5.100 -38.600 Z"
          fill={fill}
          transform={`rotate(${(index * 360) / SPOKES})`}
        />
      ))}
    </>
  );
}
