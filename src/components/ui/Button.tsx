import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "action" | "outline" | "ghost";
type Size = "md" | "lg";

// Calm feedback: colour and subtle top-edge hairline refraction only, zero scale or bounce.
// Every variant has a pressed colour, so a tap is answered on phones, where hover never fires.
// Disabled is neutral (muted ground, muted text), never a washed-out brand colour.
const base =
  "group inline-flex items-center justify-center rounded-(--radius-control) text-body font-semibold whitespace-nowrap max-w-full " +
  "transition-[background-color,border-color,color,box-shadow,opacity,filter] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none " +
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:pointer-events-none disabled:text-muted-foreground disabled:shadow-none";

// Red ("primary") is reserved for 112 and emergency actions: pass it explicitly.
// Sapphire ("action") is the one main action of a screen.
// Everything else uses outline (the default) or the quieter ghost for row-level tools.
const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-(--hairline-refraction) press-solid hover:bg-primary-hover active:bg-primary-active disabled:bg-muted",
  action:
    "bg-sapphire text-white shadow-(--hairline-refraction) press-solid hover:bg-sapphire-light disabled:bg-muted",
  outline:
    "border border-border-control bg-card text-foreground shadow-(--shadow-card-rest) press-row hover:border-foreground/40 hover:bg-muted/70 hover:shadow-(--shadow-card-hover) active:bg-muted disabled:bg-muted",
  ghost: "press-row text-foreground hover:bg-muted active:bg-muted/80",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-3.5 py-2 gap-2 sm:px-4",
  lg: "min-h-12 px-4 py-2.5 gap-2 sm:px-5",
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
    ref?: Ref<HTMLButtonElement>;
  };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Shared public action control across RediHealth.
 * - `primary`: red — reserved strictly for 112 and emergency calls.
 * - `action`: sapphire — the one main next step of a screen or form.
 * - `outline` (default): every other button or action link.
 * - `ghost`: quiet secondary row or dialog tools.
 */
export function Button({
  variant = "outline",
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
    if (/^(tel:|mailto:|https?:\/\/)/.test(href)) {
      return (
        <a href={href} className={classes} {...anchorProps}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement> & { ref?: Ref<HTMLButtonElement> })}>
      {children}
    </button>
  );
}
