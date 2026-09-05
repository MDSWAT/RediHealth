import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
  muted?: boolean;
  href?: string;
};

export function Logo({ className, muted = false, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-md font-semibold",
        className,
      )}
      aria-label="RediHealth home"
    >
      <Image src="/Icons/Logo.svg" alt="" width={48} height={48} />
      <span
        className={cn(
          "text-lg tracking-tight",
          muted ? "text-foreground" : "text-foreground",
        )}
      >
        RediHealth
      </span>
    </Link>
  );
}
