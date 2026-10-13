import { headers } from "next/headers";
import { Hero } from "@/components/landing/Hero";
import { HelpOptions } from "@/components/landing/HelpOptions";
import { HealthTopics } from "@/components/landing/HealthTopics";
import { MedicalAssistance } from "@/components/landing/MedicalAssistance";
import { TrustSection } from "@/components/landing/TrustSection";
import { EmergencyNotice } from "@/components/landing/EmergencyNotice";
import { countryFromHeaders } from "@/lib/medical-institutes";

export default async function Home() {
  const showAssistantCta = countryFromHeaders(await headers()) !== "RO";

  return (
    <main id="main-content" className="flex-1">
      <Hero showAssistantCta={showAssistantCta} />
      <HelpOptions />
      <HealthTopics />
      <MedicalAssistance />
      <TrustSection />
      <EmergencyNotice />
    </main>
  );
}
