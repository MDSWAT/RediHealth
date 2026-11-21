import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageListenAction } from "@/components/ui/PageListenAction";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { getLegalCopy } from "@/lib/i18n/legal-translations";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import { RecaptchaNotice } from "@/components/security/RecaptchaProvider";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const copy = getLegalCopy(lang).privacy;
  return {
    title: localizedPageTitle(lang, "privacy", "Privacy notice - RediHealth"),
    description: copy.description,
  };
}

export default async function PrivacyPage() {
  const lang = await getRequestLang();
  const copy = getLegalCopy(lang).privacy;
  return (
    <main id="main-content" className="flex-1 pb-12 sm:pb-16">
      <Container>
        <PageHeader
          title={copy.title}
          lead={copy.description}
          actions={
            <PageListenAction
              lang={lang}
              segments={[copy.title, copy.description, copy.botTitle, copy.botBody, copy.collectTitle, copy.collectBody]}
            />
          }
        />

        {/* Same clause rhythm as the terms: hairline, heading rail, readable measure. */}
        <div className="mt-8 max-w-4xl text-body text-muted-foreground">
            <div className="border-t border-border py-7 first:border-t-0 first:pt-0 last:pb-0 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
              <h2 className="text-title text-foreground">{copy.botTitle}</h2>
              <div className="max-w-(--measure-reading)">
                <p className="mt-2 lg:mt-0">{copy.botBody}</p>
                <RecaptchaNotice />
              </div>
            </div>
            <div className="border-t border-border py-7 first:border-t-0 first:pt-0 last:pb-0 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
              <h2 className="text-title text-foreground">{copy.collectTitle}</h2>
              <p className="mt-2 max-w-(--measure-reading) lg:mt-0">
                {copy.collectBody}
              </p>
            </div>

            <div className="border-t border-border py-7 first:border-t-0 first:pt-0 last:pb-0 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
              <h2 className="text-title text-foreground">{copy.useTitle}</h2>
              <p className="mt-2 max-w-(--measure-reading) lg:mt-0">
                {copy.useBody}
              </p>
            </div>

            <div className="border-t border-border py-7 first:border-t-0 first:pt-0 last:pb-0 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
              <h2 className="text-title text-foreground">{copy.analyticsTitle}</h2>
              <p className="mt-2 max-w-(--measure-reading) lg:mt-0">
                {copy.analyticsBody}
              </p>
            </div>

            <div className="border-t border-border py-7 first:border-t-0 first:pt-0 last:pb-0 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
              <h2 className="text-title text-foreground">{copy.accessTitle}</h2>
              <p className="mt-2 max-w-(--measure-reading) lg:mt-0">
                {copy.accessBody}
              </p>
            </div>

            <div className="border-t border-border py-7 first:border-t-0 first:pt-0 last:pb-0 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
              <h2 className="text-title text-foreground">{copy.choicesTitle}</h2>
              <p className="mt-2 max-w-(--measure-reading) lg:mt-0">
                {copy.choicesBody}{" "}
                <a href="mailto:support@redihealth.app" className="rounded-sm text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  support@redihealth.app
                </a>
                .
              </p>
            </div>
          </div>
      </Container>
    </main>
  );
}
