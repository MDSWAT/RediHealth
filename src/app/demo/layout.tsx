import type { ReactNode } from "react";
import { DemoPageContent } from "@/components/demo/DemoPageContent";

export default function DemoLayout({ children }: { children: ReactNode }) {
  return <DemoPageContent>{children}</DemoPageContent>;
}
