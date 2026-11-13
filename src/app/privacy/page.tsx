import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
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
  const copy = getLegalCopy(await getRequestLang()).privacy;
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-10 sm:py-14">
        <Container>
          <SectionHeading as="h1" title={copy.title} subtitle={copy.description} titleClassName="text-page" />
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          {/* Same clause rhythm as the terms: hairline, heading rail, readable measure. */}
          <div className="max-w-4xl text-base leading-relaxed text-muted-foreground">
            <Reveal className="border-t border-border py-7 first:border-t-0 first:pt-0 last:pb-0 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
              <h2 className="text-title text-foreground">{copy.botTitle}</h2>
              <div className="max-w-[62ch]">
                <p className="mt-2 lg:mt-0">{copy.botBody}</p>
                <RecaptchaNotice />
              </div>
            </Reveal>
            <Reveal className="border-t border-border py-7 first:border-t-0 first:pt-0 last:pb-0 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
              <h2 className="text-title text-foreground">{copy.collectTitle}</h2>
              <p className="mt-2 max-w-[62ch] lg:mt-0">
                {copy.collectBody}
              </p>
            </Reveal>

            <Reveal className="border-t border-border py-7 first:border-t-0 first:pt-0 last:pb-0 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
              <h2 className="text-title text-foreground">{copy.useTitle}</h2>
              <p className="mt-2 max-w-[62ch] lg:mt-0">
                {copy.useBody}
              </p>
            </Reveal>

            <Reveal className="border-t border-border py-7 first:border-t-0 first:pt-0 last:pb-0 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
              <h2 className="text-title text-foreground">{copy.accessTitle}</h2>
              <p className="mt-2 max-w-[62ch] lg:mt-0">
                {copy.accessBody}
              </p>
            </Reveal>

            <Reveal className="border-t border-border py-7 first:border-t-0 first:pt-0 last:pb-0 lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
              <h2 className="text-title text-foreground">{copy.choicesTitle}</h2>
              <p className="mt-2 max-w-[62ch] lg:mt-0">
                {copy.choicesBody}{" "}
                <a href="mailto:support@redihealth.app" className="rounded-sm text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  support@redihealth.app
                </a>
                .
              </p>
            </Reveal>
          </div>
        </Container>
      </section>
    </main>
  );
}
