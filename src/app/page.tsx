import { Hero } from "@/components/landing/Hero";
import { MythBuster } from "@/components/landing/MythBuster";
import { HelpOptions } from "@/components/landing/HelpOptions";
import { HealthTopics } from "@/components/landing/HealthTopics";
import { MedicalAssistance } from "@/components/landing/MedicalAssistance";
import { TrustSection } from "@/components/landing/TrustSection";
import { EmergencyNotice } from "@/components/landing/EmergencyNotice";

export default function Home() {
  return (
    <main id="main-content" className="flex-1">
      <Hero />
      <MythBuster />
      <HelpOptions />
      <HealthTopics />
      <MedicalAssistance />
      <TrustSection />
      <EmergencyNotice />
    </main>
  );
}
