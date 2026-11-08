import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /**
   * @deprecated Ignored. Sections no longer fly in one after another on scroll;
   * content is visible from the first paint. Kept so existing call sites compile.
   */
  delay?: number;
};

/**
 * Plain layout wrapper (formerly a scroll-triggered fade-in).
 * Staggered on-scroll entrances read as busy on a calm medical site and can hide
 * content when scripts fail, so this now renders its children immediately.
 */
export function Reveal({ children, className }: RevealProps) {
  return <div className={className}>{children}</div>;
}
