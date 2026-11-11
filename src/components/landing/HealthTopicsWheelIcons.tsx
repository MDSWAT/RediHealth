import type { ReactNode, SVGProps } from "react";

/*
 * Pictograms for the topic wheel, drawn on a 48px grid to follow the brand artwork.
 * "Cut-out" details use --wheel-face-bg so they invert with the button state.
 */

type IconProps = SVGProps<SVGSVGElement>;

const CUT = "var(--wheel-face-bg, #fff)";

function Glyph({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false" {...props}>
      {children}
    </svg>
  );
}

const line = {
  stroke: "currentColor",
  strokeWidth: 3.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function DropGlyph(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M24 5C24 5 10 20.2 10 29.6a14 14 0 0 0 28 0C38 20.2 24 5 24 5Z" fill="currentColor" />
    </Glyph>
  );
}

function LemonGlyph(props: IconProps) {
  return (
    <Glyph {...props}>
      <path
        transform="rotate(-38 24 24)"
        d="M3.5 24c0-1.3 1.6-1.9 3.4-3C9.2 13.300 16 8.800 24 8.800S38.800 13.300 41.100 21c1.800 1.100 3.400 1.700 3.400 3s-1.600 1.900-3.400 3C38.800 34.700 32 39.200 24 39.200S9.200 34.700 6.900 27c-1.800-1.100-3.400-1.700-3.400-3Z"
        fill="currentColor"
      />
      <path d="M14.200 22.500a9 9 0 0 1 7.300-8" stroke={CUT} strokeWidth="2.600" strokeLinecap="round" />
    </Glyph>
  );
}

function PulseGlyph(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M5 25h10l3.200-8.500L23.500 36l5.700-25 5.300 14H43" {...line} strokeWidth={3.8} />
    </Glyph>
  );
}

function BrainGlyph(props: IconProps) {
  const lobe =
    "M21.500 9.200c-3.600-2.400-8.200-.6-8.800 3.300-3.700.5-5.700 4.200-4.300 7.500-2.900 2.100-2.900 6.300 0 8.400-1.300 3.400.9 7 4.500 7.300 1 3.800 5.500 5.200 8.600 3Z";
  return (
    <Glyph {...props}>
      <path d={lobe} {...line} />
      <path d={lobe} {...line} transform="matrix(-1 0 0 1 48 0)" />
    </Glyph>
  );
}

function NoSmokingGlyph(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="24" cy="24" r="18" {...line} />
      <rect x="10.500" y="20.800" width="27" height="6.400" rx="1.200" fill={CUT} {...line} strokeWidth={2.200} />
      <rect x="17" y="20.800" width="20.500" height="6.400" fill="currentColor" />
      <path d="M36.700 11.300 11.300 36.700" stroke={CUT} strokeWidth="6.400" />
      <path d="M36.700 11.300 11.300 36.700" {...line} />
    </Glyph>
  );
}

function ScreeningGlyph(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M9.500 35V9.500a3 3 0 0 1 3-3H27" {...line} />
      <path
        d="M17.500 12h10.800l9.200 9.200V39a2 2 0 0 1-2 2h-18a2 2 0 0 1-2-2V14a2 2 0 0 1 2-2Z"
        fill="currentColor"
        opacity="0.550"
      />
      <path d="M17.500 12h10.800l9.200 9.200V39a2 2 0 0 1-2 2h-18a2 2 0 0 1-2-2V14a2 2 0 0 1 2-2Z" {...line} />
      <path d="M36.500 37.500 43 44" stroke={CUT} strokeWidth="7" strokeLinecap="round" />
      <circle cx="31" cy="32" r="7" fill={CUT} {...line} />
      <path d="M36.200 37.200 42.500 43.500" {...line} strokeWidth={3.400} />
    </Glyph>
  );
}

function WomensHealthGlyph(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M14.500 21.500V14a9.500 9.500 0 0 1 19 0v9.500" {...line} />
      <path d="M21 10.500c4.800-1.800 8 3.200 4.200 6.300-2.600 2.100-4.900 2.300-5.700 5.200" {...line} strokeWidth={2.600} />
      <path d="M20.500 25.500c-5.200 2.200-8.500 6.300-9 12.200L11 42.500h13.500" {...line} />
      <path d="M26.500 25.500c2.300 1 4 2.300 5.200 3.900" {...line} />
      <circle cx="35.500" cy="37.500" r="7.500" fill="currentColor" />
      <path d="M35.500 33.500v8M31.500 37.500h8" stroke={CUT} strokeWidth="2.400" strokeLinecap="round" />
    </Glyph>
  );
}

function HeartOrganGlyph(props: IconProps) {
  return (
    <Glyph {...props}>
      <path
        d="M21 15.500c-6.800-.8-11.800 4.900-10.800 13 1 8 7.600 14 14.900 15 7.800-1 13.300-8.700 12.600-17-.5-6.100-4.600-10.600-10.200-11Z"
        fill="currentColor"
      />
      <path d="M20 17V8.500a3 3 0 0 1 6 0V17Z" fill="currentColor" />
      <path d="M27.500 17V5.500h5V10c4.300.2 6.500 3 6.500 7.500h-4.800c0-1.800-.6-2.600-1.700-2.800V17Z" fill="currentColor" />
      <path d="M11.500 11.500h5.500v5.200l-5.500 2Z" fill="currentColor" />
      <path d="M8.300 17.500c-2.300 4.600-2.300 10.600.2 15.200" stroke="currentColor" strokeWidth="2.400" strokeLinecap="round" />
      <path d="M20 17v-5.500M26 17v-5.500M27.500 17v-6M32.500 14.700V17" stroke={CUT} strokeWidth="1.200" opacity="0.700" />
    </Glyph>
  );
}

export const WHEEL_ICONS: Record<string, (props: IconProps) => ReactNode> = {
  "healthy-eating": LemonGlyph,
  "physical-activity": PulseGlyph,
  "mental-wellbeing": BrainGlyph,
  smoking: NoSmokingGlyph,
  "preventive-screening": ScreeningGlyph,
  "womens-health": WomensHealthGlyph,
  "heart-health": HeartOrganGlyph,
  diabetes: DropGlyph,
};
