"use client";

import { Container } from "@/components/ui/Container";
import { FindHelpExplorer } from "@/components/find-help/FindHelpExplorer";
import type { CountryCode, InstituteCategory } from "@/lib/medical-institutes";

export function FindHelpPageContent({
  initialCountry,
  initialCategory = null,
  detectedIpCountry = null,
}: {
  initialCountry: CountryCode;
  initialCategory?: InstituteCategory | null;
  detectedIpCountry?: CountryCode | null;
}) {
  return (
    <main id="main-content" className="flex-1">
      <section className="pt-2 pb-6 sm:pt-3 sm:pb-10">
        <Container>
          <FindHelpExplorer
            initialCountry={initialCountry}
            initialCategory={initialCategory}
            detectedIpCountry={detectedIpCountry}
          />
        </Container>
      </section>
    </main>
  );
}
