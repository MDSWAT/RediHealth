import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ContainerSize = "default" | "wide" | "narrow" | "workspace";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  size?: ContainerSize;
};

const MAX_WIDTHS: Record<ContainerSize, string> = {
  narrow: "max-w-4xl",
  default: "max-w-none xl:px-10 2xl:px-12",
  wide: "max-w-none xl:px-10 2xl:px-12",
  workspace: "max-w-none xl:px-10 2xl:px-12",
};

export function Container({
  children,
  className,
  as: Tag = "div",
  size = "default",
}: ContainerProps) {
  const hasCustomMaxWidth = Boolean(className && /\bmax-w-/.test(className));

  return (
    <Tag
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
