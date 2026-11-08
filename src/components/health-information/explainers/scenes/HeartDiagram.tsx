"use client";

import { useId, useRef, type CSSProperties } from "react";
import { useInView } from "motion/react";
import { BEAT_SECONDS } from "@/lib/motion/tokens";
import type { HeartPartId } from "../../heart-health/heart-anatomy-copy";

/*
 * Front view of the heart as a clean medical diagram, with an ECG strip below.
 *
 * Motion (CSS, see the "hh-" block in globals.css):
 * - one heartbeat every BEAT_SECONDS (64 bpm);
 * - the whole heart muscle (atria and ventricles together, so nothing detaches)
 *   shortens towards the base: scale on one fixed origin, eased systole then
 *   diastole, no overshoot; the atria add a small kick just before;
 * - a monitor-style gap sweeps across the ECG trace, two beats per sweep, so each
 *   QRS spike is drawn at the moment the ventricles start to contract.
 * - Animates transform only, stops off-screen and under prefers-reduced-motion,
 *   where the full trace and the resting heart are shown.
 *
 * The drawing holds no words; labels live in the surrounding DOM.
 */

/** ECG geometry: one beat is 108 units wide, the R peak sits 38.5 units in. */
const ECG_X0 = 12;
const ECG_BEAT_WIDTH = 108;
const ECG_R_OFFSET = 38.5;
const ECG_BASELINE = 238;
/** Fraction of a beat between the sweep reaching the start of a beat and its R peak. */
const R_PHASE = ECG_R_OFFSET / ECG_BEAT_WIDTH;

function ecgBeat(ox: number): string {
  const y = ECG_BASELINE;
  return [
    `L${ox + 12} ${y}`,
    `C${ox + 15} ${y - 5} ${ox + 21} ${y - 5} ${ox + 24} ${y}`, // P wave
    `L${ox + 33} ${y}`,
    `L${ox + 35} ${y + 2}`, // Q
    `L${ox + ECG_R_OFFSET} ${y - 24}`, // R
    `L${ox + 42} ${y + 6}`, // S
    `L${ox + 44.5} ${y}`,
    `L${ox + 56} ${y}`,
    `C${ox + 61} ${y - 8} ${ox + 69} ${y - 8} ${ox + 74} ${y}`, // T wave
    `L${ox + ECG_BEAT_WIDTH} ${y}`,
  ].join(" ");
}

const ECG_PATH = `M${ECG_X0} ${ECG_BASELINE} ${ecgBeat(ECG_X0)} ${ecgBeat(ECG_X0 + ECG_BEAT_WIDTH)}`;
const ECG_WIDTH = ECG_BEAT_WIDTH * 2;

const VENTRICLES_OUTLINE =
  "M98 100 C86 116 81 142 88 162 C104 178 126 190 146 198 C154 201 160 198 162 191 C172 166 180 136 177 110 C175 98 168 91 159 88 C140 84 116 90 98 100 Z";
const LEFT_VENTRICLE =
  "M134 92 C140 124 148 164 155 197 C158 199 161 196 162 191 C172 166 180 136 177 110 C175 98 168 91 159 88 C150 87 142 89 134 92 Z";

interface Marker {
  id: HeartPartId;
  n: number;
  x: number;
  y: number;
}

/**
 * Numbered markers. They sit on a still layer above the drawing, so the numbers never
 * pulse with the beat (the muscle moves under them by about 3 units at most).
 */
const MARKERS: Marker[] = [
  { id: "aorta", n: 1, x: 150, y: 39.5 },
  { id: "left-ventricle", n: 2, x: 164, y: 150 },
  { id: "coronary-arteries", n: 3, x: 142, y: 136 },
  { id: "vena-cava", n: 4, x: 83, y: 54 },
];

export interface HeartDiagramProps {
  playing: boolean;
  /** Dims every other structure so this one stands out. */
  highlight?: HeartPartId | null;
  /** Draws numbered markers 1 to 4 (aorta, left ventricle, coronaries, vena cava). */
  showMarkers?: boolean;
  /** Pointer shortcut for the markers; keyboard users choose from the list beside the diagram. */
  onMarkerSelect?: (id: HeartPartId) => void;
  className?: string;
}

export function HeartDiagram({
  playing,
  highlight = null,
  showMarkers = false,
  onMarkerSelect,
  className = "",
}: HeartDiagramProps) {
  const ref = useRef<SVGSVGElement | null>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gridId = `hh-grid-${uid}`;
  const fadeId = `hh-fade-${uid}`;
  const maskId = `hh-mask-${uid}`;

  const dim = (id: HeartPartId | "other") =>
    highlight !== null && highlight !== id ? "true" : undefined;

  const style = {
    "--hh-beat": `${BEAT_SECONDS}s`,
    "--hh-ecg-width": `${ECG_WIDTH}px`,
    // Starts the beat so its contraction lines up with the first R peak of the sweep.
    "--hh-phase": `${-(1 - R_PHASE)}`,
  } as CSSProperties;

  const renderMarker = (m: Marker) => {
    const active = highlight === m.id;
    return (
      <g
        key={m.id}
        className={onMarkerSelect ? "hh-marker cursor-pointer" : "hh-marker"}
        onClick={onMarkerSelect ? () => onMarkerSelect(m.id) : undefined}
      >
        <circle cx={m.x} cy={m.y} r={11} fill="transparent" />
        <circle
          cx={m.x}
          cy={m.y}
          r={7}
          fill={active ? "var(--hh-ink)" : "#ffffff"}
          stroke="var(--hh-ink)"
          strokeWidth={1.25}
        />
        <text
          x={m.x}
          y={m.y + 2.8}
          textAnchor="middle"
          fontSize={8}
          fontWeight={600}
          fill={active ? "#ffffff" : "var(--hh-ink)"}
        >
          {m.n}
        </text>
      </g>
    );
  };

  return (
    <svg
      ref={ref}
      viewBox="0 -6 240 258"
      className={`hh-diagram block h-auto w-full select-none ${className}`}
      data-playing={playing && inView ? "true" : "false"}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id={gridId} width="6" height="6" patternUnits="userSpaceOnUse" x={ECG_X0} y="202">
          <path d="M6 0V6H0" fill="none" stroke="var(--hh-grid)" strokeWidth="0.6" />
        </pattern>
        <linearGradient id={fadeId} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.45" stopColor="#000" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="200" width="240" height="52">
          <rect x="0" y="200" width="240" height="52" fill="#fff" />
          {/* At rest the gap sits past the end of the trace, so the whole trace shows. */}
          <rect className="hh-sweep" x={ECG_X0 + ECG_WIDTH} y="200" width="22" height="52" fill={`url(#${fadeId})`} />
        </mask>
      </defs>

      <g strokeLinejoin="round" strokeLinecap="round" strokeWidth={1.35}>
        {/* Right pulmonary artery: runs under the arch, behind the aorta and the vena cava. */}
        <g className="hh-part" data-dim={dim("other")} fill="var(--hh-vein)" stroke="var(--hh-vein-ink)">
          <path d="M146 62 C128 61 104 62 80 66 L80 79 C104 76 128 75 146 76 Z" />
        </g>

        {/* Aorta and its three branches (oxygen-rich). The descending part goes behind the pulmonary artery. */}
        <g className="hh-part" data-dim={dim("aorta")} fill="var(--hh-artery)" stroke="var(--hh-ink)">
          <path d="M121 46 L115 18 L124 16 L130 41 Z" />
          <ellipse cx="119.5" cy="17" rx="4.6" ry="1.6" transform="rotate(-12 119.5 17)" />
          <path d="M140 34 L139 9 L147 9 L148 33 Z" />
          <ellipse cx="143" cy="9" rx="4" ry="1.5" />
          <path d="M157 34 L160 11 L168 12 L165 37 Z" />
          <ellipse cx="164" cy="11.5" rx="4" ry="1.5" transform="rotate(8 164 11.5)" />
          <path d="M106 106 C104 86 104 68 110 55 C118 39 134 30 150 31 C166 32 178 42 180 58 L181 74 L164 74 L163 61 C162 53 156 48 149 48 C139 48 131 55 127 65 C124 75 124 92 126 106 Z" />
        </g>

        {/*
          Pulmonary trunk (oxygen-poor): rises from the right ventricle in front of the
          aortic root and divides under the arch. Its left branch is drawn here; the right
          branch is the vessel behind the aorta above.
        */}
        <g className="hh-part" data-dim={dim("other")} fill="var(--hh-vein)" stroke="var(--hh-vein-ink)">
          <path d="M121 108 C120 94 124 82 131 74 C136 68 143 63 151 61 C165 58 181 61 192 67 C197 70 198 77 194 80 C190 83 185 81 181 79 C172 75 163 74 157 76 C151 78 147 85 146 94 L146 108 Z" />
        </g>

        {/* Superior vena cava. */}
        <g className="hh-part" data-dim={dim("vena-cava")} fill="var(--hh-vein)" stroke="var(--hh-vein-ink)">
          <path d="M72 26 C72 50 72 76 74 96 L94 100 C92 76 92 50 92 26 Z" />
          <ellipse cx="82" cy="26" rx="10" ry="3" />
        </g>

        {/*
          The beating heart: atria, auricles and ventricles share one transform, scaled
          from a fixed point on the base (121.6, 91) so no seam can open between them.
          The invisible frame pins the fill-box to the viewBox origin, so the origin below
          is in drawing units. The atria add their own small kick just before systole.
        */}
        <g className="hh-heart">
          <rect x="0" y="0" width="240" height="210" fill="none" stroke="none" />

          {/* Right atrium. */}
          <g className="hh-atria hh-part" data-dim={dim("vena-cava")}>
            <path
              d="M82 88 C64 90 56 108 59 126 C62 142 71 155 88 163 L100 150 C94 132 96 114 106 102 C100 94 92 88 82 88 Z"
              fill="var(--hh-atrium)"
              stroke="var(--hh-ink)"
            />
          </g>

          {/* Ventricles. The left anterior descending artery runs in the groove between them. */}
          <path className="hh-part" data-dim={dim("other")} d={VENTRICLES_OUTLINE} fill="var(--hh-muscle)" />
          <path className="hh-part" data-dim={dim("left-ventricle")} d={LEFT_VENTRICLE} fill="var(--hh-muscle-deep)" />
          <path d={VENTRICLES_OUTLINE} fill="none" stroke="var(--hh-ink)" />
          <g
            className="hh-part"
            data-dim={dim("coronary-arteries")}
            fill="none"
            stroke="var(--hh-coronary)"
            strokeWidth={1.25}
          >
            <path d="M134 93 C140 124 148 164 154.5 195" />
            <path d="M140 122 C150 128 159 138 167 152" />
            <path d="M137 93 C150 91 164 95 172 103" />
          </g>

          {/* Right and left auricles (part of the atria). */}
          <g className="hh-atria hh-part" data-dim={dim("vena-cava")}>
            <path d="M93 99 C92 89 101 84 110 90 C108 97 103 102 97 104 Z" fill="var(--hh-atrium)" stroke="var(--hh-ink)" />
          </g>
          <g className="hh-atria-left hh-part" data-dim={dim("other")}>
            <path
              d="M168 95 C176 88 188 92 188 102 C188 110 181 114 175 112 C178 106 176 100 168 99 Z"
              fill="var(--hh-atrium)"
              stroke="var(--hh-ink)"
            />
          </g>
        </g>
      </g>

      {/* ECG strip on a light grid. */}
      <rect x={ECG_X0} y="202" width={ECG_WIDTH} height="46" fill={`url(#${gridId})`} />
      <path
        d={ECG_PATH}
        mask={`url(#${maskId})`}
        fill="none"
        stroke="var(--hh-ecg)"
        strokeWidth={1.75}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {showMarkers && <g>{MARKERS.map(renderMarker)}</g>}
    </svg>
  );
}
