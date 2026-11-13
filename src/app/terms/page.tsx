import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { getLegalCopy } from "@/lib/i18n/legal-translations";

export async function generateMetadata() {
  const copy = getLegalCopy(await getRequestLang()).terms;
  return { title: `${copy.title} - RediHealth`, description: copy.description };
}

export default async function TermsPage() {
  const copy = getLegalCopy(await getRequestLang()).terms;
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-10 sm:py-14">
        <Container>
          <SectionHeading as="h1" title={copy.title} subtitle={copy.description} titleClassName="text-page" />
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <div className="max-w-2xl space-y-6 text-base leading-relaxed text-muted-foreground">
            {copy.sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-title text-foreground">{section.title}</h2>
                <p className="mt-2">{section.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
