import { DemoPageContent } from "@/components/demo/DemoPageContent";
import { createPageMetadata } from "@/lib/i18n/page-metadata";

export const generateMetadata = createPageMetadata("demo", "Panel Demo - RediHealth", "Explore the mediator and doctor panels with fictional, browser-local data.");

export default function DemoPanelPage() {
  return <DemoPageContent />;
}
