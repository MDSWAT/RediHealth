import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ContainerSize = "default" | "narrow";

type ContainerProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
  className?: string;
  as?: ElementType;
  size?: ContainerSize;
  [key: `data-${string}`]: string | number | boolean | undefined;
};

const MAX_WIDTHS: Record<ContainerSize, string> = {
  narrow: "max-w-[48rem]",
  default: "max-w-[80rem]",
};

export function Container({
  children,
  className,
  as: Tag = "div",
  size = "default",
  ...props
}: ContainerProps) {
  const hasCustomMaxWidth = Boolean(className && /\bmax-w-/.test(className));

  return (
    <Tag
      {...props}
      className={cn(
        "mx-auto w-full px-5 sm:px-6 lg:px-8",
        !hasCustomMaxWidth && MAX_WIDTHS[size],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
