import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { HealthCheckExplorer } from "@/components/health-check/HealthCheckExplorer";

export const metadata: Metadata = {
  title: "Health Check - RediHealth",
  description:
    "Tap where it hurts, answer a few quick questions, and get plain-language guidance on possible next steps.",
};

export default function HealthCheckPage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="py-16 sm:py-20">
        <Container>
          <HealthCheckExplorer />
        </Container>
      </section>
    </main>
  );
}
