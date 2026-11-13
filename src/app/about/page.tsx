import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { getLegalCopy } from "@/lib/i18n/legal-translations";

export async function generateMetadata() {
  const copy = getLegalCopy(await getRequestLang()).about;
  return { title: copy.title, description: copy.description };
}

export default async function AboutPage() {
  const copy = getLegalCopy(await getRequestLang()).about;
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-10 sm:py-14">
        <Container>
          <SectionHeading as="h1" title={copy.title} subtitle={copy.description} titleClassName="text-page" />
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          {/* The opening paragraph leads at a larger size in the body colour; the rest follow at a
              comfortable measure. */}
          <div className="max-w-[65ch] space-y-4 text-base leading-relaxed text-muted-foreground">
            {copy.paragraphs.map((paragraph, index) => (
              <p
                key={paragraph}
                className={index === 0 ? "mb-6 text-lg leading-relaxed text-foreground sm:text-xl sm:leading-relaxed" : undefined}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
