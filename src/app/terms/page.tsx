import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { getLegalCopy } from "@/lib/i18n/legal-translations";

export async function generateMetadata() {
  const copy = getLegalCopy(await getRequestLang()).terms;
  return { title: `${copy.title} - RediHealth`, description: copy.description };
}

export default async function TermsPage() {
  const copy = getLegalCopy(await getRequestLang()).terms;
  return (
    <main id="main-content" className="flex-1 pb-12 sm:pb-16">
      <Container>
        <PageHeader title={copy.title} lead={copy.description} />

        {/* Each clause on its own hairline: the heading in a left rail on wide screens, the text at a
            readable measure beside it. */}
        <div className="mt-8 max-w-4xl text-body text-muted-foreground">
          {copy.sections.map((section) => (
            <div key={section.title} className="border-t border-border py-7 first:border-t-0 first:pt-0 last:pb-0 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
              <h2 className="text-title text-foreground">{section.title}</h2>
              <p className="mt-2 max-w-(--measure-reading) lg:mt-0">{section.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
