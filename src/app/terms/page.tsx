import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageListenAction } from "@/components/ui/PageListenAction";
import {
  LegalDocumentLayout,
  LegalSection,
  type TocSection,
} from "@/components/legal/LegalDocumentPrimitives";
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

  const toc: TocSection[] = doc.sections.map((section, index) => ({
    id: `clauza-${index + 1}`,
    title: section.title,
  }));

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

        <LegalDocumentLayout
          lang={lang}
          currentPath="/terms"
          versionMeta={legal.versionMeta}
          sections={toc}
        >
          {doc.sections.map((section, index) => (
            <LegalSection
              key={section.title}
              id={`clauza-${index + 1}`}
              number={index + 1}
              title={section.title}
            >
              <div className="max-w-(--measure-reading) space-y-3">
                {section.items?.length ? (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </LegalSection>
          ))}
        </LegalDocumentLayout>
      </Container>
    </main>
  );
}
