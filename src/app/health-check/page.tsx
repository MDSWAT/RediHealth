import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { HealthCheckExplorer } from "@/components/health-check/HealthCheckExplorer";
import { ClipboardCheckIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Health Check — RediHealth",
  description:
    "Tap where it hurts, answer a few quick questions, and get plain-language guidance on possible next steps.",
};

export default function HealthCheckPage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <Reveal className="max-w-2xl">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <ClipboardCheckIcon className="h-6 w-6" />
            </span>
            <SectionHeading
              as="h1"
              className="mt-5 max-w-none"
              title="Not sure where to start? Show us where it hurts."
              subtitle="Tap a part of the body, answer a few simple questions, and we'll suggest what your next step could be."
            />
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <HealthCheckExplorer />
        </Container>
      </section>
    </main>
  );
}
