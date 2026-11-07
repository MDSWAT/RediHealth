/**
 * Hand-authored Lottie (Bodymovin 5.7) animation: a single heartbeat trace.
 *
 * A faint baseline stays put while a ruby pulse travels along it, using trim
 * paths only (no expressions), so it runs on lottie-web's light player without
 * `eval` and stays compatible with the production CSP. 72 frames at 30 fps
 * gives a calm 2.4 s loop, roughly a resting heart rate.
 */

/** ECG vertices in a 120 x 40 composition. Also used by the static SVG fallback. */
export const HEARTBEAT_POINTS: ReadonlyArray<readonly [number, number]> = [
  [2, 22],
  [34, 22],
  [40, 17],
  [46, 22],
  [54, 22],
  [58, 27],
  [64, 6],
  [70, 34],
  [74, 22],
  [84, 22],
  [91, 15],
  [98, 22],
  [118, 22],
];

// lottie-web mutates the data it is given, so every layer builds its own path
// objects and callers should pass a fresh copy (see createHeartbeatAnimation).
function tracePath() {
  return {
    ty: "sh",
    nm: "trace",
    ks: {
      a: 0,
      k: {
        i: HEARTBEAT_POINTS.map(() => [0, 0]),
        o: HEARTBEAT_POINTS.map(() => [0, 0]),
        v: HEARTBEAT_POINTS.map(([x, y]) => [x, y]),
        c: false,
      },
    },
  };
}

function groupTransform() {
  return {
    ty: "tr",
    p: { a: 0, k: [0, 0] },
    a: { a: 0, k: [0, 0] },
    s: { a: 0, k: [100, 100] },
    r: { a: 0, k: 0 },
    o: { a: 0, k: 100 },
    sk: { a: 0, k: 0 },
    sa: { a: 0, k: 0 },
  };
}

function layerTransform() {
  return {
    o: { a: 0, k: 100 },
    r: { a: 0, k: 0 },
    p: { a: 0, k: [0, 0, 0] },
    a: { a: 0, k: [0, 0, 0] },
    s: { a: 0, k: [100, 100, 100] },
  };
}

function eased(t: number, value: number) {
  return { t, s: [value], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } };
}

function strokeLayer(index: number, name: string, color: [number, number, number], width: number, animated: boolean) {
  const items: unknown[] = [tracePath()];
  if (animated) {
    items.push({
      ty: "tm",
      nm: "pulse",
      s: { a: 1, k: [eased(16, 0), { t: 62, s: [100] }] },
      e: { a: 1, k: [eased(0, 0), { t: 44, s: [100] }] },
      o: { a: 0, k: 0 },
      m: 1,
    });
  }
  items.push(
    { ty: "st", nm: "stroke", c: { a: 0, k: [...color, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: width }, lc: 2, lj: 2 },
    groupTransform(),
  );

  return {
    ddd: 0,
    ind: index,
    ty: 4,
    nm: name,
    sr: 1,
    ks: layerTransform(),
    ao: 0,
    shapes: [{ ty: "gr", nm: name, it: items }],
    ip: 0,
    op: 72,
    st: 0,
    bm: 0,
  };
}

/** Returns a fresh animation object; lottie-web must never receive the same one twice. */
export function createHeartbeatAnimation() {
  // Ruby #c62f3c and stone #d6d3d1, as 0..1 RGB.
  return {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 72,
    w: 120,
    h: 40,
    nm: "redi-heartbeat",
    ddd: 0,
    assets: [],
    layers: [
      strokeLayer(1, "pulse", [0.776, 0.184, 0.235], 2.5, true),
      strokeLayer(2, "baseline", [0.839, 0.827, 0.82], 1.5, false),
    ],
  };
}
