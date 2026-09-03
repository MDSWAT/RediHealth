import type { Metadata } from "next";
import { DemoPageContent } from "@/components/demo/DemoPageContent";

export const metadata: Metadata = {
  title: "Demo — RediHealth",
  description:
    "See RediHealth in action: the AI health assistant answering questions in real time, and the prescription decipher turning a photo of a prescription into clear instructions.",
};

export default function DemoPage() {
  return <DemoPageContent />;
}
