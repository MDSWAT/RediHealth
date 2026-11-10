import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "md" | "lg";

// Calm feedback: colour and subtle top-edge hairline refraction only, zero scale or bounce.
// Disabled is neutral (muted ground, muted text), never a washed-out brand colour.
const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold " +
  "transition-[background-color,border-color,color,box-shadow,opacity] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none " +
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:pointer-events-none disabled:text-muted-foreground disabled:shadow-none";

// Red ("primary") is reserved for 112 and emergency actions: pass it explicitly.
// Everything else uses ink ("secondary", the default) or the quieter outline and ghost.
const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-(--hairline-refraction) hover:bg-primary-hover active:bg-primary-active disabled:bg-muted",
  secondary:
    "bg-foreground text-white shadow-(--hairline-refraction) hover:bg-foreground/90 active:bg-foreground/85 disabled:bg-muted",
  outline:
    "border border-border bg-card text-foreground shadow-(--shadow-card-rest) hover:border-foreground/25 hover:bg-muted/70 hover:shadow-(--shadow-card-hover) active:bg-muted disabled:bg-muted",
  ghost: "text-foreground hover:bg-muted active:bg-muted/80",
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
  variant = "secondary",
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
