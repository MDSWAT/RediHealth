import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { getLegalCopy } from "@/lib/i18n/legal-translations";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const copy = getLegalCopy(lang).accessibility;
  return {
    title: localizedPageTitle(lang, "accessibility", "Accessibility - RediHealth"),
    description: copy.description,
  };
}

export default async function AccessibilityPage() {
  const copy = getLegalCopy(await getRequestLang()).accessibility;
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-10 sm:py-14">
        <Container>
          <SectionHeading as="h1" title={copy.title} subtitle={copy.description} />
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <div className="max-w-2xl space-y-4 text-base leading-relaxed text-muted-foreground">
            {copy.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <p>
              {copy.contactLead}{" "}
              <a href="mailto:support@redihealth.app" className="text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light hover:decoration-sapphire">
                support@redihealth.app
              </a>{" "}
              {copy.contact}
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
