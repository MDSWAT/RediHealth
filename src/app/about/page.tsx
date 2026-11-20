import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageListenAction } from "@/components/ui/PageListenAction";
import { LEGAL_LINK_CLASS } from "@/components/legal/LegalDocumentPrimitives";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { getLegalCopy } from "@/lib/i18n/legal-translations";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import { withLangPrefix } from "@/lib/i18n/routing";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const copy = getLegalCopy(lang).about;
  return {
    title: localizedPageTitle(lang, "about", copy.title),
    description: copy.description,
  };
}

export default async function AboutPage() {
  const lang = await getRequestLang();
  const legal = getLegalCopy(lang);
  const copy = legal.about;
  return (
    <main id="main-content" className="flex-1 pb-12 sm:pb-16">
      <Container>
        <PageHeader
          title={copy.title}
          lead={copy.description}
          actions={
            <PageListenAction
              lang={lang}
              segments={[copy.title, copy.description, ...copy.paragraphs, copy.operatorHeading, copy.operatorBody]}
            />
          }
        />

        <div className="mt-8 max-w-3xl space-y-6 text-body text-muted-foreground">
          <div className="max-w-(--measure-reading) space-y-4">
            {copy.paragraphs.map((paragraph, index) => (
              <p
                key={paragraph}
                className={index === 0 ? "text-title text-foreground sm:leading-relaxed" : undefined}
              >
                {paragraph}
              </p>
            ))}
          </div>

          <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-title text-foreground">{copy.operatorHeading}</h2>
            <p className="mt-2 max-w-(--measure-reading)">{copy.operatorBody}</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
              <Link
                href={withLangPrefix("/contact", lang)}
                className={`inline-flex min-h-11 items-center ${LEGAL_LINK_CLASS}`}
              >
                {legal.contact.title}
              </Link>
              <Link
                href={withLangPrefix("/privacy", lang)}
                className={`inline-flex min-h-11 items-center ${LEGAL_LINK_CLASS}`}
              >
                {legal.contact.privacyLink}
              </Link>
              <Link
                href={withLangPrefix("/terms", lang)}
                className={`inline-flex min-h-11 items-center ${LEGAL_LINK_CLASS}`}
              >
                {legal.contact.termsLink}
              </Link>
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
