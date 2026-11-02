import { DemoPageContent } from "@/components/demo/DemoPageContent";
import { createPageMetadata } from "@/lib/i18n/page-metadata";

export const generateMetadata = createPageMetadata(
  "demo",
  "Demo - RediHealth",
  "See RediHealth in action: the AI health assistant answering questions in real time, and the prescription decipher turning a photo of a prescription into clear instructions.",
);

export default function DemoPage() {
  return <DemoPageContent />;
}
