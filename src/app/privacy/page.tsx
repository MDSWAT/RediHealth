import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageListenAction } from "@/components/ui/PageListenAction";
import { CookiePreferencesManager } from "@/components/security/CookiePreferencesManager";
import { RecaptchaNotice } from "@/components/security/RecaptchaProvider";
import {
  LEGAL_LINK_CLASS,
  LegalDocumentLayout,
  LegalSection,
  ResponsiveLegalTable,
  type TocSection,
} from "@/components/legal/LegalDocumentPrimitives";
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

export default async function PrivacyPage() {
  const lang = await getRequestLang();
  const legal = getLegalCopy(lang);
  const doc = getPrivacyDoc(lang);

  const toc: TocSection[] = [
    { id: "operator", title: doc.controllerTitle },
    { id: "date-colectate", title: doc.collectTitle },
    { id: "temei-legal", title: doc.purposesTitle },
    { id: "acces-date", title: doc.accessTitle },
    { id: "furnizori", title: doc.processorsTitle },
    { id: "cookie-uri", title: doc.cookiesTitle },
    { id: "locatie", title: doc.locationTitle },
    { id: "apeluri", title: doc.callsTitle },
    { id: "pastrare", title: doc.retentionTitle },
    { id: "drepturi", title: doc.rightsTitle },
    { id: "stergere", title: doc.deletionTitle },
    { id: "copii", title: doc.childrenTitle },
    { id: "securitate", title: doc.botTitle },
    { id: "schimbari", title: doc.changesTitle },
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
                doc.controllerTitle,
                doc.controllerBody,
                doc.noSaleNote,
                doc.rightsTitle,
                ...doc.rightsItems,
              ]}
            />
          }
        />

        <LegalDocumentLayout
          lang={lang}
          currentPath="/privacy"
          versionMeta={legal.versionMeta}
          sections={toc}
        >
          <LegalSection id="operator" number={1} title={doc.controllerTitle}>
            <p className="max-w-(--measure-reading)">{doc.controllerBody}</p>
            <p className="max-w-(--measure-reading)">
              {doc.controllerContactLead}{" "}
              <a
                href={`mailto:${LEGAL_OPERATOR.privacyEmail}`}
                className={`break-all ${LEGAL_LINK_CLASS}`}
              >
                {LEGAL_OPERATOR.privacyEmail}
              </a>
              .
            </p>
          </LegalSection>

          <LegalSection id="date-colectate" number={2} title={doc.collectTitle}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-body font-semibold text-foreground">{doc.ordinaryTitle}</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-meta leading-relaxed">
                  {doc.ordinaryItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-body font-semibold text-foreground">{doc.healthTitle}</h3>
                <p className="mt-2 text-meta leading-relaxed text-muted-foreground">
                  {doc.healthLead}
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-meta leading-relaxed">
                  {doc.healthItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </LegalSection>

          <LegalSection id="temei-legal" number={3} title={doc.purposesTitle}>
            <ResponsiveLegalTable
              columns={doc.purposesColumns}
              rows={doc.purposesRows}
            />
            <p className="border-l-2 border-sapphire pl-4 text-body font-medium text-foreground dark:border-sapphire-border">
              {doc.noSaleNote}
            </p>
          </LegalSection>

          <LegalSection id="acces-date" number={4} title={doc.accessTitle}>
            <ul className="max-w-(--measure-reading) list-disc space-y-2 pl-5">
              {doc.accessItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </LegalSection>

          <LegalSection id="furnizori" number={5} title={doc.processorsTitle}>
            <p className="max-w-(--measure-reading)">{doc.processorsIntro}</p>
            <ResponsiveLegalTable
              columns={doc.processorsColumns}
              rows={doc.processorsRows}
            />
            <div className="max-w-(--measure-reading) space-y-2">
              {doc.processorsNotes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          </LegalSection>

          <LegalSection id="cookie-uri" number={6} title={doc.cookiesTitle}>
            <ul className="max-w-(--measure-reading) list-disc space-y-2 pl-5">
              {doc.cookiesItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              <Link href={withLangPrefix("/cookies", lang)} className={LEGAL_LINK_CLASS}>
                {doc.cookiesLinkLabel}
              </Link>
            </p>
            <CookiePreferencesManager inline={false} />
          </LegalSection>

          <LegalSection id="locatie" number={7} title={doc.locationTitle}>
            <ul className="max-w-(--measure-reading) list-disc space-y-2 pl-5">
              {doc.locationItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </LegalSection>

          <LegalSection id="apeluri" number={8} title={doc.callsTitle}>
            <p className="max-w-(--measure-reading)">{doc.callsBody}</p>
          </LegalSection>

          <LegalSection id="pastrare" number={9} title={doc.retentionTitle}>
            <ResponsiveLegalTable
              columns={doc.retentionColumns}
              rows={doc.retentionRows}
            />
          </LegalSection>

          <LegalSection id="drepturi" number={10} title={doc.rightsTitle}>
            <p className="max-w-(--measure-reading)">{doc.rightsLead}</p>
            <ul className="max-w-(--measure-reading) list-disc space-y-2 pl-5">
              {doc.rightsItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="rounded-xl border border-border bg-card p-5 space-y-2.5">
              <p className="text-foreground">
                {doc.rightsContactBefore}{" "}
                <a
                  href={`mailto:${LEGAL_OPERATOR.privacyEmail}`}
                  className={`break-all font-semibold ${LEGAL_LINK_CLASS}`}
                >
                  {LEGAL_OPERATOR.privacyEmail}
                </a>
                . {doc.rightsContactAfter}
              </p>
              <p className="text-meta text-muted-foreground">{doc.authoritiesBody}</p>
            </div>
          </LegalSection>

          <LegalSection id="stergere" number={11} title={doc.deletionTitle}>
            <p className="max-w-(--measure-reading)">{doc.deletionBody}</p>
          </LegalSection>

          <LegalSection id="copii" number={12} title={doc.childrenTitle}>
            <p className="max-w-(--measure-reading)">{doc.childrenBody}</p>
          </LegalSection>

          <LegalSection id="securitate" number={13} title={doc.botTitle}>
            <div className="max-w-(--measure-reading)">
              <p>{doc.botBody}</p>
              <RecaptchaNotice />
            </div>
          </LegalSection>

          <LegalSection id="schimbari" number={14} title={doc.changesTitle}>
            <p className="max-w-(--measure-reading)">{doc.changesBody}</p>
          </LegalSection>
        </LegalDocumentLayout>
      </Container>
    </main>
  );
}
