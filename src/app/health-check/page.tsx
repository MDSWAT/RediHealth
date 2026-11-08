import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { HealthCheckExplorer } from "@/components/health-check/HealthCheckExplorer";
import { getHealthCheckTranslations } from "@/lib/i18n/health-check-translations";
import { createPageMetadata } from "@/lib/i18n/page-metadata";
import { getRequestLang } from "@/lib/i18n/server-routing";

/** Title from the shared page titles; the description is the page's own subtitle, in the page language. */
export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return createPageMetadata(
    "health-check",
    "Check your symptoms - RediHealth",
    getHealthCheckTranslations(lang).ui.subtitle,
  )();
}

export default function HealthCheckPage() {
  return (
    <main id="main-content" className="flex-1">
      <section className="pt-0.5 sm:pt-2 pb-3 sm:pb-4">
        <Container>
          <HealthCheckExplorer />
        </Container>
      </section>
    </main>
  );
}
