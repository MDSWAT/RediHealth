import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageListenAction } from "@/components/ui/PageListenAction";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { getLegalCopy } from "@/lib/i18n/legal-translations";
import { getTermsDoc } from "@/lib/i18n/legal-docs-copy";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const doc = getTermsDoc(lang);
  return {
    title: localizedPageTitle(lang, "terms", `${doc.title} - RediHealth`),
    description: doc.description,
  };
}

export default async function TermsPage() {
  const lang = await getRequestLang();
  const legal = getLegalCopy(lang);
  const doc = getTermsDoc(lang);

  return (
    <main id="main-content" className="flex-1 pb-12 sm:pb-16">
      <Container>
        <PageHeader
          title={doc.title}
          lead={doc.description}
          actions={
            <PageListenAction
              lang={lang}
              segments={[
                doc.title,
                doc.description,
                legal.versionMeta,
                ...doc.sections.slice(0, 4).flatMap((section) => [
                  section.title,
                  ...(section.paragraphs ?? []),
                  ...(section.items ?? []),
                ]),
              ]}
            />
          }
        />

        <p className="mt-3 text-meta text-muted-foreground">{legal.versionMeta}</p>

        <div className="mt-8 max-w-4xl text-body text-muted-foreground">
          {doc.sections.map((section) => (
            <section
              key={section.title}
              className="border-t border-border py-7 first:border-t-0 first:pt-0 last:pb-0 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10"
            >
              <h2 className="text-title text-foreground">{section.title}</h2>
              <div className="mt-2 max-w-(--measure-reading) space-y-3 lg:mt-0">
                {section.items?.length ? (
                  <ul className="list-disc space-y-1.5 pl-5">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </main>
  );
}
