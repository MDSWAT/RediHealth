import { DemoPanelScreen } from "@/components/demo/DemoPageContent";
import { createPageMetadata } from "@/lib/i18n/page-metadata";

export const generateMetadata = createPageMetadata(
  "demo",
  "Demo - RediHealth",
  "Try the mediator and doctor panels with made-up data that stays in your browser.",
);

export default function DemoPage() {
  return <DemoPanelScreen />;
}
