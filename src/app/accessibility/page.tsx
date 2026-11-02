import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { UsersIcon } from "@/components/ui/icons";
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
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <UsersIcon className="h-6 w-6" />
          </span>
          <SectionHeading
            as="h1"
            className="mt-5 max-w-none"
            title={copy.title}
            subtitle={copy.description}
          />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="max-w-2xl space-y-4 text-base leading-relaxed text-muted-foreground">
            {copy.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <p>
              {copy.contact.startsWith("to ") ? "Contact us" : "Contactează-ne"}{" "}
              <a href="mailto:support@redihealth.app" className="text-primary hover:underline">
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
