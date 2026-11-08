import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";

/** Brand mark and name. Change them here: the header, footer and printed summaries all read these. */
export const LOGO_SRC = "/Icons/Logo.svg";
export const BRAND_NAME = "RediHealth";

type LogoProps = {
  className?: string;
  muted?: boolean;
  tone?: "default" | "light";
  href?: string;
  /** Localized accessible name, starting with the brand (e.g. "RediHealth, home page"). Defaults to the brand name. */
  label?: string;
};

export function Logo({ className, muted = false, tone = "default", href = "/", label }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-md font-semibold",
        className,
      )}
      aria-label={label || undefined}
    >
      <Image src={LOGO_SRC} alt="" width={40} height={40} />
      <span
        className={cn(
          "text-lg tracking-tight transition-colors duration-(--dur-base) ease-(--ease-out-calm)",
          tone === "light" ? "text-paper" : muted ? "text-foreground" : "text-foreground",
        )}
      >
        {BRAND_NAME}
      </span>
    </Link>
  );
}
