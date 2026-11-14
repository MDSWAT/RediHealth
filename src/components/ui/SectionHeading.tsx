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
  size?: "section" | "page";
  action?: ReactNode;
  className?: string;
  titleClassName?: string;
};

/**
 * Section title (700, fluid `text-section` unless `size="page"` or `titleClassName` specifies `text-page`)
 * with an optional lead (`text-lead`, `--measure-lead` 34rem) and an optional action beside it from `sm`.
 * Inside a Section it follows the ground: paper and mist on the ink tone, and on every tone
 * once `.dark` turns the grounds dark.
 */
export function SectionHeading({
  title,
  subtitle,
  align = "left",
  as: Heading = "h2",
  size = "section",
  action,
  className,
  titleClassName,
}: SectionHeadingProps) {
  const hasExplicitSize =
    size === "page" || Boolean(titleClassName && /\btext-(display|page|section|title|lead|reading|body|meta)\b/.test(titleClassName));
  const sizeClass = hasExplicitSize ? (size === "page" && !titleClassName?.includes("text-") ? "text-page" : undefined) : "text-section";
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
          "text-balance text-foreground in-data-[tone=ink]:text-paper dark:in-data-tone:text-paper",
          sizeClass,
          titleClassName,
        )}
      >
        {title}
      </Heading>
      {subtitle ? (
        <p
          className={cn(
            "mt-3.5 max-w-(--measure-lead) text-pretty text-lead text-muted-foreground in-data-[tone=ink]:text-mist dark:in-data-tone:text-mist",
            align === "center" && "mx-auto",
          )}
        >
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
