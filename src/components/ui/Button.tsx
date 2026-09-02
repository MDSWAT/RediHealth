import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold " +
  "transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 " +
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary:
    "bg-foreground text-white hover:bg-foreground/90",
  outline:
    "border border-border bg-card text-foreground hover:bg-muted",
  ghost: "text-foreground hover:bg-muted",
};

const sizes: Record<Size, string> = {
  md: "min-h-[44px] px-5 text-base",
  lg: "min-h-[52px] px-7 text-base sm:text-lg",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(
    base,
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchorProps } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
