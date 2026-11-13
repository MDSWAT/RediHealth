import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
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
          {/* Each clause on its own hairline: the heading in a left rail on wide screens, the text at a
              readable measure beside it; clauses below the fold rise in as they are reached. */}
          <div className="max-w-4xl text-base leading-relaxed text-muted-foreground">
            {copy.sections.map((section) => (
              <Reveal key={section.title} className="border-t border-border py-7 first:border-t-0 first:pt-0 last:pb-0 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
                <h2 className="text-title text-foreground">{section.title}</h2>
                <p className="mt-2 max-w-[62ch] lg:mt-0">{section.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
