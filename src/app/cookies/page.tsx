import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageListenAction } from "@/components/ui/PageListenAction";
import { CookiePreferencesManager } from "@/components/security/CookiePreferencesManager";
import {
  LEGAL_LINK_CLASS,
  LegalDocumentLayout,
  LegalSection,
  ResponsiveLegalTable,
  type TocSection,
} from "@/components/legal/LegalDocumentPrimitives";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { getLegalCopy } from "@/lib/i18n/legal-translations";
import { getCookiesDoc } from "@/lib/i18n/legal-docs-copy";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import { withLangPrefix } from "@/lib/i18n/routing";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const doc = getCookiesDoc(lang);
  return {
    title: localizedPageTitle(lang, "cookies", `${doc.title} - RediHealth`),
    description: doc.description,
  };
}

export default async function CookiesPage() {
  const lang = await getRequestLang();
  const legal = getLegalCopy(lang);
  const doc = getCookiesDoc(lang);

  const toc: TocSection[] = [
    { id: "stare", title: doc.preferencesTitle },
    { id: "categorii", title: doc.categoriesTitle },
    { id: "lista-cookie-uri", title: doc.inventoryTitle },
    { id: "protectie", title: doc.safeguardsTitle },
    { id: "control", title: doc.manageTitle },
  ];

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
                doc.preferencesBody,
                doc.safeguardsTitle,
                doc.safeguardsBody,
              ]}
            />
          }
        />

        <LegalDocumentLayout
          lang={lang}
          currentPath="/cookies"
          versionMeta={legal.versionMeta}
          sections={toc}
        >
          <LegalSection id="stare" number={1} title={doc.preferencesTitle}>
            <p className="max-w-(--measure-reading)">{doc.preferencesBody}</p>
            <CookiePreferencesManager inline />
          </LegalSection>

          <LegalSection id="categorii" number={2} title={doc.categoriesTitle}>
            <div className="space-y-4">
              {doc.categories.map((category) => (
                <article
                  key={category.title}
                  className="rounded-xl border border-border bg-card p-5 space-y-2.5"
                >
                  <h3 className="text-body font-semibold text-foreground">{category.title}</h3>
                  <p className="text-meta text-muted-foreground">{category.legalBasis}</p>
                  <p className="text-body text-muted-foreground">{category.body}</p>
                  <ul className="list-disc space-y-1.5 pl-5 text-meta leading-relaxed">
                    {category.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </LegalSection>

          <LegalSection id="lista-cookie-uri" number={3} title={doc.inventoryTitle}>
            <ResponsiveLegalTable
              columns={doc.inventoryColumns}
              rows={doc.inventoryRows}
              monoFirstColumn
            />
          </LegalSection>

          <LegalSection id="protectie" number={4} title={doc.safeguardsTitle}>
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <p className="max-w-(--measure-reading) text-foreground">{doc.safeguardsBody}</p>
              <ul className="max-w-(--measure-reading) list-disc space-y-1.5 pl-5">
                {doc.safeguardsItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </LegalSection>

          <LegalSection id="control" number={5} title={doc.manageTitle}>
            <p className="max-w-(--measure-reading)">{doc.manageBody}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              <Link
                href={withLangPrefix("/privacy", lang)}
                className={`inline-flex min-h-11 items-center ${LEGAL_LINK_CLASS}`}
              >
                {doc.privacyLinkLabel}
              </Link>
              <Link
                href={withLangPrefix("/contact", lang)}
                className={`inline-flex min-h-11 items-center ${LEGAL_LINK_CLASS}`}
              >
                {doc.contactLinkLabel}
              </Link>
            </div>
          </LegalSection>
        </LegalDocumentLayout>
      </Container>
    </main>
  );
}
