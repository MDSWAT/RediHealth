import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageListenAction } from "@/components/ui/PageListenAction";
import { CookiePreferencesManager } from "@/components/security/CookiePreferencesManager";
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

const linkClass =
  "rounded-sm text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border";

const sectionClass =
  "border-t border-border py-7 first:border-t-0 first:pt-0 last:pb-0 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10";

export default async function CookiesPage() {
  const lang = await getRequestLang();
  const legal = getLegalCopy(lang);
  const doc = getCookiesDoc(lang);

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
                doc.pixelTitle,
                doc.pixelBody,
              ]}
            />
          }
        />

        <p className="mt-3 text-meta text-muted-foreground">{legal.versionMeta}</p>

        <div className="mt-8 max-w-4xl text-body text-muted-foreground">
          <section className={sectionClass}>
            <h2 className="text-title text-foreground">{doc.preferencesTitle}</h2>
            <div className="mt-2 max-w-(--measure-reading) lg:mt-0">
              <p>{doc.preferencesBody}</p>
              <CookiePreferencesManager inline />
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-title text-foreground">{doc.categoriesTitle}</h2>
            <div className="mt-2 max-w-(--measure-reading) space-y-6 lg:mt-0">
              {doc.categories.map((category) => (
                <div key={category.title} className="space-y-2">
                  <h3 className="text-body font-semibold text-foreground">{category.title}</h3>
                  <p className="text-meta text-muted-foreground">{category.legalBasis}</p>
                  <p>{category.body}</p>
                  <ul className="list-disc space-y-1.5 pl-5">
                    {category.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-title text-foreground">{doc.pixelTitle}</h2>
            <div className="mt-2 max-w-(--measure-reading) space-y-3 lg:mt-0">
              <p>{doc.pixelBody}</p>
              <ul className="list-disc space-y-1.5 pl-5">
                {doc.pixelSafeguards.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-title text-foreground">{doc.manageTitle}</h2>
            <div className="mt-2 max-w-(--measure-reading) space-y-3 lg:mt-0">
              <p>{doc.manageBody}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
                <Link href={withLangPrefix("/privacy", lang)} className={`inline-flex min-h-11 items-center ${linkClass}`}>
                  {doc.privacyLinkLabel}
                </Link>
                <Link href={withLangPrefix("/contact", lang)} className={`inline-flex min-h-11 items-center ${linkClass}`}>
                  {doc.contactLinkLabel}
                </Link>
              </div>
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
