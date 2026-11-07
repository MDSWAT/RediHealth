import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Soft light cone, adapted from Aceternity UI's Spotlight.
 *
 * It fades in once on load (CSS, `.hero-spotlight` in globals.css), then stays
 * still. It sits behind content (`-z-10`, pointer-events none) and is a low
 * opacity blur, so it never covers or competes with text. Under
 * `prefers-reduced-motion` it simply appears.
 */
export function Spotlight({ className }: { className?: string }) {
  // useId returns values like ":r1:"; colons are not safe inside url(#...).
  const filterId = `spotlight-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <svg
      aria-hidden="true"
      className={cn("hero-spotlight pointer-events-none absolute", className)}
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter={`url(#${filterId})`}>
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill="currentColor"
          fillOpacity="0.16"
        />
      </g>
      <defs>
        <filter
          id={filterId}
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  );
}
