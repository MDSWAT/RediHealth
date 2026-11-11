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

/** The page has no footer (SiteChrome), so it ends just under the step's Continue button. */
export default function HealthCheckPage() {
  return (
    <main id="main-content" className="flex-1 pt-0.5 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pt-2 sm:pb-6">
      <Container>
        <HealthCheckExplorer />
      </Container>
    </main>
  );
}
