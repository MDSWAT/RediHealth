import type { Metadata } from "next";
import { HealthInformationPageContent } from "@/components/health-information/HealthInformationPageContent";

export const metadata: Metadata = {
  title: "Health Information — RediHealth",
  description:
    "Clear, plain-language health information covering prevention, common conditions, healthy living, and when to seek medical care.",
};

export default function HealthInformationPage() {
  return <HealthInformationPageContent />;
}
