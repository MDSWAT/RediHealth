import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageListenAction } from "@/components/ui/PageListenAction";
import { CookiePreferencesManager } from "@/components/security/CookiePreferencesManager";
import { RecaptchaNotice } from "@/components/security/RecaptchaProvider";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { getLegalCopy } from "@/lib/i18n/legal-translations";
import { getPrivacyDoc } from "@/lib/i18n/legal-docs-copy";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import { withLangPrefix } from "@/lib/i18n/routing";
import { LEGAL_OPERATOR } from "@/lib/legal-config";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const doc = getPrivacyDoc(lang);
  return {
    title: localizedPageTitle(lang, "privacy", `${doc.title} - RediHealth`),
    description: doc.description,
  };
}

const linkClass =
  "rounded-sm text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border";

const sectionClass =
  "border-t border-border py-7 first:border-t-0 first:pt-0 last:pb-0 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10";

export default async function PrivacyPage() {
  const lang = await getRequestLang();
  const legal = getLegalCopy(lang);
  const doc = getPrivacyDoc(lang);

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
                doc.controllerTitle,
                doc.controllerBody,
                doc.noSaleNote,
                doc.rightsTitle,
                ...doc.rightsItems,
              ]}
            />
          }
        />

        <p className="mt-3 text-meta text-muted-foreground">{legal.versionMeta}</p>

        <div className="mt-8 max-w-5xl text-body text-muted-foreground">
          <section className={sectionClass}>
            <h2 className="text-title text-foreground">{doc.controllerTitle}</h2>
            <div className="mt-2 max-w-(--measure-reading) space-y-3 lg:mt-0">
              <p>{doc.controllerBody}</p>
              <p>
                {doc.controllerContactLead}{" "}
                <a href={`mailto:${LEGAL_OPERATOR.privacyEmail}`} className={linkClass}>
                  {LEGAL_OPERATOR.privacyEmail}
                </a>
                .
              </p>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-title text-foreground">{doc.collectTitle}</h2>
            <div className="mt-2 max-w-(--measure-reading) space-y-5 lg:mt-0">
              <div>
                <h3 className="text-body font-semibold text-foreground">{doc.ordinaryTitle}</h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-5">
                  {doc.ordinaryItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-body font-semibold text-foreground">{doc.healthTitle}</h3>
                <p className="mt-1.5">{doc.healthLead}</p>
                <ul className="mt-2 list-disc space-y-1.5 pl-5">
                  {doc.healthItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-title text-foreground">{doc.purposesTitle}</h2>
            <div className="mt-2 min-w-0 space-y-4 lg:mt-0">
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[34rem] border-collapse text-left text-meta">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-foreground">
                      {doc.purposesColumns.map((col) => (
                        <th key={col} scope="col" className="px-4 py-3 font-semibold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {doc.purposesRows.map(([purpose, data, basis]) => (
                      <tr key={purpose}>
                        <td className="px-4 py-3 font-medium text-foreground">{purpose}</td>
                        <td className="px-4 py-3">{data}</td>
                        <td className="px-4 py-3">{basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="max-w-(--measure-reading) font-medium text-foreground">{doc.noSaleNote}</p>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-title text-foreground">{doc.accessTitle}</h2>
            <ul className="mt-2 max-w-(--measure-reading) list-disc space-y-1.5 pl-5 lg:mt-0">
              {doc.accessItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="text-title text-foreground">{doc.processorsTitle}</h2>
            <div className="mt-2 min-w-0 space-y-4 lg:mt-0">
              <p className="max-w-(--measure-reading)">{doc.processorsIntro}</p>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[34rem] border-collapse text-left text-meta">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-foreground">
                      {doc.processorsColumns.map((col) => (
                        <th key={col} scope="col" className="px-4 py-3 font-semibold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {doc.processorsRows.map(([provider, purpose, data]) => (
                      <tr key={provider}>
                        <td className="px-4 py-3 font-medium text-foreground">{provider}</td>
                        <td className="px-4 py-3">{purpose}</td>
                        <td className="px-4 py-3">{data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="max-w-(--measure-reading) space-y-2">
                {doc.processorsNotes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-title text-foreground">{doc.cookiesTitle}</h2>
            <div className="mt-2 max-w-(--measure-reading) space-y-3 lg:mt-0">
              <ul className="list-disc space-y-1.5 pl-5">
                {doc.cookiesItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>
                <Link href={withLangPrefix("/cookies", lang)} className={linkClass}>
                  {doc.cookiesLinkLabel}
                </Link>
              </p>
              <CookiePreferencesManager inline={false} />
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-title text-foreground">{doc.locationTitle}</h2>
            <ul className="mt-2 max-w-(--measure-reading) list-disc space-y-1.5 pl-5 lg:mt-0">
              {doc.locationItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="text-title text-foreground">{doc.callsTitle}</h2>
            <p className="mt-2 max-w-(--measure-reading) lg:mt-0">{doc.callsBody}</p>
          </section>

          <section className={sectionClass}>
            <h2 className="text-title text-foreground">{doc.retentionTitle}</h2>
            <div className="mt-2 min-w-0 overflow-x-auto rounded-lg border border-border lg:mt-0">
              <table className="w-full min-w-[28rem] border-collapse text-left text-meta">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-foreground">
                    {doc.retentionColumns.map((col) => (
                      <th key={col} scope="col" className="px-4 py-3 font-semibold">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {doc.retentionRows.map(([category, period]) => (
                    <tr key={category}>
                      <td className="px-4 py-3 font-medium text-foreground">{category}</td>
                      <td className="px-4 py-3">{period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-title text-foreground">{doc.rightsTitle}</h2>
            <div className="mt-2 max-w-(--measure-reading) space-y-3 lg:mt-0">
              <p>{doc.rightsLead}</p>
              <ul className="list-disc space-y-1.5 pl-5">
                {doc.rightsItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>
                {doc.rightsContactBefore}{" "}
                <a href={`mailto:${LEGAL_OPERATOR.privacyEmail}`} className={linkClass}>
                  {LEGAL_OPERATOR.privacyEmail}
                </a>
                . {doc.rightsContactAfter}
              </p>
              <p>{doc.authoritiesBody}</p>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-title text-foreground">{doc.deletionTitle}</h2>
            <p className="mt-2 max-w-(--measure-reading) lg:mt-0">{doc.deletionBody}</p>
          </section>

          <section className={sectionClass}>
            <h2 className="text-title text-foreground">{doc.childrenTitle}</h2>
            <p className="mt-2 max-w-(--measure-reading) lg:mt-0">{doc.childrenBody}</p>
          </section>

          <section className={sectionClass}>
            <h2 className="text-title text-foreground">{doc.botTitle}</h2>
            <div className="mt-2 max-w-(--measure-reading) lg:mt-0">
              <p>{doc.botBody}</p>
              <RecaptchaNotice />
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-title text-foreground">{doc.changesTitle}</h2>
            <p className="mt-2 max-w-(--measure-reading) lg:mt-0">{doc.changesBody}</p>
          </section>
        </div>
      </Container>
    </main>
  );
}
