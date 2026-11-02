import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HeartIcon } from "@/components/ui/icons";
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
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <HeartIcon className="h-6 w-6" />
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
          </div>
        </Container>
      </section>
    </main>
  );
}
