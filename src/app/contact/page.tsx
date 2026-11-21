import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageListenAction } from "@/components/ui/PageListenAction";
import { ExternalLinkIcon, MailIcon, PhoneIcon } from "@/components/ui/icons";
import { LEGAL_LINK_CLASS } from "@/components/legal/LegalDocumentPrimitives";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { getLegalCopy } from "@/lib/i18n/legal-translations";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import { withLangPrefix } from "@/lib/i18n/routing";
import { LEGAL_OPERATOR, getOperatorFullAddress } from "@/lib/legal-config";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const copy = getLegalCopy(lang).contact;
  return {
    title: localizedPageTitle(lang, "contact", `${copy.title} - RediHealth`),
    description: copy.description,
  };
}

export default async function ContactPage() {
  const lang = await getRequestLang();
  const legal = getLegalCopy(lang);
  const copy = legal.contact;
  const address = getOperatorFullAddress(lang);

  return (
    <main id="main-content" className="flex-1 pb-12 sm:pb-16">
      <Container>
        <PageHeader
          title={copy.title}
          lead={copy.description}
          actions={
            <PageListenAction
              lang={lang}
              segments={[
                copy.title,
                copy.description,
                copy.operatorHeading,
                `${LEGAL_OPERATOR.name}, ${address}, BCE ${LEGAL_OPERATOR.bceNumber}`,
                copy.dataProtectionHeading,
                copy.dataProtectionBody,
                copy.emergencies,
                copy.emergencyBody,
              ]}
            />
          }
        />

        <div className="mt-8 max-w-4xl space-y-8 text-body text-muted-foreground">
          {/* Primary email channels side by side on desktop, stacked cleanly on mobile */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-6">
              <div>
                <h2 className="text-title text-foreground">{copy.enquiries}</h2>
                <p className="mt-2 text-body text-muted-foreground">{copy.enquiriesHint}</p>
              </div>
              <a
                href={`mailto:${LEGAL_OPERATOR.contactEmail}`}
                className="group press-row mt-5 inline-flex min-h-11 items-center gap-2.5 rounded-sm text-body font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border dark:hover:text-white"
              >
                <MailIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="break-all">{LEGAL_OPERATOR.contactEmail}</span>
              </a>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 sm:p-6">
              <div>
                <h2 className="text-title text-foreground">{copy.dataProtectionHeading}</h2>
                <p className="mt-2 text-body text-muted-foreground">{copy.dataProtectionBody}</p>
              </div>
              <div className="mt-5 space-y-2.5">
                <a
                  href={`mailto:${LEGAL_OPERATOR.privacyEmail}`}
                  className="group press-row inline-flex min-h-11 items-center gap-2.5 rounded-sm text-body font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border dark:hover:text-white"
                >
                  <MailIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="break-all">{LEGAL_OPERATOR.privacyEmail}</span>
                </a>
                <p className="text-meta text-muted-foreground">{copy.supervisoryNote}</p>
              </div>
            </div>
          </section>

          {/* Emergency notice with calm ruby left accent (112 visual grammar) */}
          <section className="rounded-xl border border-border border-l-4 border-l-primary bg-card p-5 sm:p-6">
            <h2 className="text-title text-foreground">{copy.emergencies}</h2>
            <p className="mt-2 flex items-start gap-2.5 text-foreground">
              <PhoneIcon className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{copy.emergencyBody}</span>
            </p>
            <p className="mt-3 text-body text-muted-foreground">
              {copy.helpBefore}{" "}
              <Link href={withLangPrefix("/get-help", lang)} className={LEGAL_LINK_CLASS}>
                {copy.helpLink}
              </Link>{" "}
              {copy.helpAfter}
            </p>
          </section>

          {/* Operator legal details */}
          <section className="border-t border-border pt-7">
            <h2 className="text-title text-foreground">{copy.operatorHeading}</h2>
            <dl className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
              <div className="px-5 py-3.5 sm:grid sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-6">
                <dt className="text-meta font-semibold text-foreground">{copy.operatorNameLabel}</dt>
                <dd className="mt-1 text-body text-muted-foreground sm:mt-0">{LEGAL_OPERATOR.name}</dd>
              </div>
              <div className="px-5 py-3.5 sm:grid sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-6">
                <dt className="text-meta font-semibold text-foreground">{copy.addressLabel}</dt>
                <dd className="mt-1 text-body text-muted-foreground sm:mt-0">{address}</dd>
              </div>
              <div className="px-5 py-3.5 sm:grid sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-6">
                <dt className="text-meta font-semibold text-foreground">{copy.registrationLabel}</dt>
                <dd className="mt-1 font-mono text-meta tabular-nums text-foreground sm:mt-0">
                  {LEGAL_OPERATOR.bceNumber}
                </dd>
              </div>
              <div className="px-5 py-3.5 sm:grid sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-6">
                <dt className="text-meta font-semibold text-foreground">{copy.websiteLabel}</dt>
                <dd className="mt-1 sm:mt-0">
                  <a
                    href={LEGAL_OPERATOR.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 ${LEGAL_LINK_CLASS}`}
                  >
                    <span>{LEGAL_OPERATOR.websiteLabel}</span>
                    <ExternalLinkIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          {/* Legal links */}
          <nav aria-label={copy.legalLinksHeading} className="border-t border-border pt-7">
            <h2 className="text-body font-semibold text-foreground">{copy.legalLinksHeading}</h2>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
              <li>
                <Link
                  href={withLangPrefix("/privacy", lang)}
                  className={`inline-flex min-h-11 items-center ${LEGAL_LINK_CLASS}`}
                >
                  {copy.privacyLink}
                </Link>
              </li>
              <li>
                <Link
                  href={withLangPrefix("/cookies", lang)}
                  className={`inline-flex min-h-11 items-center ${LEGAL_LINK_CLASS}`}
                >
                  {copy.cookiesLink}
                </Link>
              </li>
              <li>
                <Link
                  href={withLangPrefix("/terms", lang)}
                  className={`inline-flex min-h-11 items-center ${LEGAL_LINK_CLASS}`}
                >
                  {copy.termsLink}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </Container>
    </main>
  );
}
