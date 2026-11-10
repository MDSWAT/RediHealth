import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ContainerSize = "default" | "wide" | "narrow";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  size?: ContainerSize;
};

const MAX_WIDTHS: Record<ContainerSize, string> = {
  narrow: "max-w-4xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
};

export function Container({
  children,
  className,
  as: Tag = "div",
  size = "default",
}: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full px-5 sm:px-6 lg:px-8", MAX_WIDTHS[size], className)}>
      {children}
    </Tag>
  );
}
