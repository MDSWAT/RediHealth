import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { getLegalCopy } from "@/lib/i18n/legal-translations";

export async function generateMetadata() {
  const copy = getLegalCopy(await getRequestLang()).about;
  return { title: copy.title, description: copy.description };
}

export default async function AboutPage() {
  const copy = getLegalCopy(await getRequestLang()).about;
  return (
    <main id="main-content" className="flex-1 pb-12 sm:pb-16">
      <Container>
        <PageHeader title={copy.title} lead={copy.description} />

        {/* The opening paragraph leads at a larger size in the body colour; the rest follow at a
            comfortable measure. */}
        <div className="mt-8 max-w-(--measure-reading) space-y-4 text-body text-muted-foreground">
          {copy.paragraphs.map((paragraph, index) => (
            <p
              key={paragraph}
              className={index === 0 ? "mb-6 text-title text-foreground sm:leading-relaxed" : undefined}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </Container>
    </main>
  );
}
