import type { Metadata } from "next";
import { HealthAssistant } from "@/components/health-assistant/HealthAssistant";

export const metadata: Metadata = {
  title: "Health Assistant — RediHealth",
  description: "Share symptoms, their timeline, and a prescription image to prepare for clinical care.",
};

export default function HealthAssistantPage() {
  return <HealthAssistant />;
}