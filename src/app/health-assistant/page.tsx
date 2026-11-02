import { HealthAssistant } from "@/components/health-assistant/HealthAssistant";
import { createPageMetadata } from "@/lib/i18n/page-metadata";

export const generateMetadata = createPageMetadata(
  "health-assistant",
  "Health Assistant - RediHealth",
  "Share symptoms, their timeline, and a prescription image to prepare for clinical care.",
);

export default function HealthAssistantPage() {
  return <HealthAssistant />;
}