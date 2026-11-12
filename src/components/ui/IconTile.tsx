import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/cn";

export type IconTileTone = "sapphire-soft" | "sapphire-solid" | "amber" | "neutral" | "on-dark";
export type IconTileSize = 36 | 40 | 48;

const TONES: Record<IconTileTone, string> = {
  "sapphire-soft": "bg-sapphire-soft text-sapphire dark:bg-white/10 dark:text-paper",
  "sapphire-solid": "bg-sapphire text-white",
  // Amber marks a health mediator. White on amber-care is 5:1.
  amber: "bg-amber-care text-white",
  neutral: "bg-muted text-muted-foreground dark:bg-ink-800 dark:text-mist",
  // For solid sapphire and ink grounds.
  "on-dark": "bg-white/10 text-paper",
};

const SIZES: Record<IconTileSize, { tile: string; glyph: string }> = {
  36: { tile: "h-9 w-9", glyph: "h-4.5 w-4.5" },
  40: { tile: "h-10 w-10", glyph: "h-5 w-5" },
  48: { tile: "h-12 w-12", glyph: "h-6 w-6" },
};

type IconTileProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone?: IconTileTone;
  size?: IconTileSize;
  className?: string;
};

/**
 * A decorative icon on a small coloured plate, placed next to the text that names the thing.
 * The glyph scales with the plate (20px in 40, 24px in 48). Server-safe.
 */
export function IconTile({ icon: Icon, tone = "sapphire-soft", size = 48, className }: IconTileProps) {
  const { tile, glyph } = SIZES[size];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-(--radius-control)",
        tile,
        TONES[tone],
        className,
      )}
    >
      <Icon className={glyph} />
    </span>
  );
}
