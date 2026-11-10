import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  /**
   * @deprecated Not rendered. Kicker labels above headings are noise; the heading carries
   * its own weight. Kept so existing call sites compile; remove it where you pass it.
   */
  eyebrow?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  action?: ReactNode;
  className?: string;
  titleClassName?: string;
};

export function SectionHeading({
  title,
  subtitle,
  align = "left",
  as: Heading = "h2",
  action,
  className,
  titleClassName,
}: SectionHeadingProps) {
  const copyBlock = (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        !action && className,
      )}
    >
      <Heading
        className={cn(
          "text-balance text-3xl font-semibold tracking-[-0.025em] text-foreground sm:text-4xl",
          titleClassName,
        )}
      >
        {title}
      </Heading>
      {subtitle ? (
        <p className="mt-3.5 text-pretty text-lg leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
    </div>
  );

  if (!action) {
    return copyBlock;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8",
        className,
      )}
    >
      {copyBlock}
      <div className="shrink-0">{action}</div>
    </div>
  );
}
