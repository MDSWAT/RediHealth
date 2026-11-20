import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageListenAction } from "@/components/ui/PageListenAction";
import { ExternalLinkIcon, MailIcon, PhoneIcon } from "@/components/ui/icons";
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

const linkClass =
  "rounded-sm text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border dark:hover:text-white";

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

        <div className="mt-8 max-w-4xl text-body text-muted-foreground">
          <div className="border-t border-border py-7 first:border-t-0 first:pt-0 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
            <h2 className="text-title text-foreground">{copy.enquiries}</h2>
            <div className="mt-2 max-w-(--measure-reading) space-y-2 lg:mt-0">
              <p>{copy.enquiriesHint}</p>
              <a
                href={`mailto:${LEGAL_OPERATOR.contactEmail}`}
                className="group press-row inline-flex min-h-11 items-center gap-2.5 rounded-sm text-title font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border dark:hover:text-white"
              >
                <MailIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{LEGAL_OPERATOR.contactEmail}</span>
              </a>
            </div>
          </div>

          <div className="border-t border-border py-7 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
            <h2 className="text-title text-foreground">{copy.dataProtectionHeading}</h2>
            <div className="mt-2 max-w-(--measure-reading) space-y-3 lg:mt-0">
              <p>{copy.dataProtectionBody}</p>
              <a
                href={`mailto:${LEGAL_OPERATOR.privacyEmail}`}
                className="group press-row inline-flex min-h-11 items-center gap-2.5 rounded-sm text-title font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border dark:hover:text-white"
              >
                <MailIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{LEGAL_OPERATOR.privacyEmail}</span>
              </a>
              <p className="text-meta text-muted-foreground">{copy.supervisoryNote}</p>
            </div>
          </div>

          <div className="border-t border-border py-7 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
            <h2 className="text-title text-foreground">{copy.operatorHeading}</h2>
            <dl className="mt-2 max-w-(--measure-reading) divide-y divide-border border-y border-border lg:mt-0">
              <div className="py-3 sm:grid sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:gap-4">
                <dt className="font-medium text-foreground">{copy.operatorNameLabel}</dt>
                <dd className="mt-0.5 sm:mt-0">{LEGAL_OPERATOR.name}</dd>
              </div>
              <div className="py-3 sm:grid sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:gap-4">
                <dt className="font-medium text-foreground">{copy.addressLabel}</dt>
                <dd className="mt-0.5 sm:mt-0">{address}</dd>
              </div>
              <div className="py-3 sm:grid sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:gap-4">
                <dt className="font-medium text-foreground">{copy.registrationLabel}</dt>
                <dd className="mt-0.5 font-mono text-meta tabular-nums sm:mt-0">{LEGAL_OPERATOR.bceNumber}</dd>
              </div>
              <div className="py-3 sm:grid sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:gap-4">
                <dt className="font-medium text-foreground">{copy.websiteLabel}</dt>
                <dd className="mt-0.5 sm:mt-0">
                  <a
                    href={LEGAL_OPERATOR.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 ${linkClass}`}
                  >
                    <span>{LEGAL_OPERATOR.websiteLabel}</span>
                    <ExternalLinkIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-border py-7 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
            <h2 className="text-title text-foreground">{copy.emergencies}</h2>
            <div className="mt-2 max-w-(--measure-reading) space-y-4 lg:mt-0">
              <p className="flex items-start gap-2.5 text-foreground">
                <PhoneIcon className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{copy.emergencyBody}</span>
              </p>
              <p>
                {copy.helpBefore}{" "}
                <Link href={withLangPrefix("/get-help", lang)} className={linkClass}>
                  {copy.helpLink}
                </Link>{" "}
                {copy.helpAfter}
              </p>
            </div>
          </div>

          <div className="border-t border-border py-7 last:pb-0 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
            <h2 className="text-title text-foreground">{copy.legalLinksHeading}</h2>
            <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2 lg:mt-0">
              <li>
                <Link href={withLangPrefix("/privacy", lang)} className={`inline-flex min-h-11 items-center ${linkClass}`}>
                  {copy.privacyLink}
                </Link>
              </li>
              <li>
                <Link href={withLangPrefix("/cookies", lang)} className={`inline-flex min-h-11 items-center ${linkClass}`}>
                  {copy.cookiesLink}
                </Link>
              </li>
              <li>
                <Link href={withLangPrefix("/terms", lang)} className={`inline-flex min-h-11 items-center ${linkClass}`}>
                  {copy.termsLink}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </main>
  );
}
