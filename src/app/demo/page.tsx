import { DemoPanelScreen } from "@/components/demo/DemoPageContent";
import { createPageMetadata } from "@/lib/i18n/page-metadata";

export const generateMetadata = createPageMetadata(
  "demo",
  "Demo - RediHealth",
  "Explore the mediator and doctor panels with fictional, browser-local data.",
);

export default function DemoPage() {
  return <DemoPanelScreen />;
}
