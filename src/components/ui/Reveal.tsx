import type { ReactNode } from "react";

type RevealProps = {
  children?: ReactNode;
  className?: string;
  /** Retained for caller compatibility; sections render immediately visible without scroll delay. */
  delay?: number;
  /** Retained for caller compatibility; sections render immediately visible without scroll animation. */
  variant?: RevealVariant;
  /** Retained for caller compatibility; children render immediately visible without scroll stagger. */
  stagger?: boolean | "ui" | "editorial";
  /** The element to render, so a semantic container can stay a `div`, `ul`, `ol`, `section`, or `dl`. */
  as?: "div" | "ul" | "ol" | "section" | "dl";
};

export type RevealVariant = "rise" | "mask" | "fade";

/**
 * Semantic layout wrapper. Renders immediately visible at opacity: 1 with zero scroll-triggered
 * hiding or fade-in animation.
 */
export function Reveal({ children, className, as: Tag = "div" }: RevealProps) {
  return <Tag className={className}>{children}</Tag>;
}
