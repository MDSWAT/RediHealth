/**
 * Shared hex palette mirroring `src/app/globals.css` `@theme` tokens.
 *
 * Used strictly by standalone outputs without CSS token stylesheets (print HTML,
 * serialized SVGs) and as SSR fallbacks for runtime `getComputedStyle` lookups.
 */
export const PALETTE = {
  background: "#fcfbf9",
  foreground: "#0b132b",
  obsidianNavy: "#0b132b",
  surfaceSubtle: "#f3f4f7",
  surfaceCard: "#f8f9fa",
  surfaceElevated: "#ffffff",
  muted: "#f0f2f6",
  mutedForeground: "#475569",
  border: "#e2e8f0",
  borderControl: "#8a94a6",
  borderSubtle: "#edf2f7",
  card: "#ffffff",
  primary: "#c62f3c",
  primaryHover: "#a8242f",
  primaryActive: "#8f1d27",
  primarySoft: "#fde8ea",
  ring: "#1d3557",
  ruby300: "#f3a0a7",
  ink950: "#0a1226",
  ink900: "#101a33",
  ink800: "#1b2744",
  paper: "#fbfaf6",
  mist: "#a9b3c6",
  sand: "#f5eee3",
  sandLine: "#e7d9c3",
  sapphire: "#1d3557",
  sapphireLight: "#2a4d7c",
  sapphireSoft: "#eff6ff",
  sapphireBorder: "#bfdbfe",
  onSapphireMuted: "#dbe4f0",
  amberCare: "#b45309",
  amberCareHover: "#92400e",
  amberCareSoft: "#fef3c7",
  amberCareBorder: "#fde68a",
  liveSage: "#059669",
  liveSageSoft: "#ecfdf5",
} as const;

export function readCssToken(tokenName: string, fallback: string): string {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(tokenName)
    .trim();
  return value || fallback;
}
