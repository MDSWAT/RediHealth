import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
          <SectionHeading as="h1" title={copy.title} subtitle={copy.description} />
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <div className="max-w-2xl space-y-6 text-base leading-relaxed text-muted-foreground">
            <div>
              <h2 className="text-base font-semibold text-foreground">{copy.botTitle}</h2>
              <p className="mt-2">{copy.botBody}</p>
              <RecaptchaNotice />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">{copy.collectTitle}</h2>
              <p className="mt-2">
                {copy.collectBody}
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-foreground">{copy.useTitle}</h2>
              <p className="mt-2">
                {copy.useBody}
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-foreground">{copy.accessTitle}</h2>
              <p className="mt-2">
                {copy.accessBody}
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-foreground">{copy.choicesTitle}</h2>
              <p className="mt-2">
                {copy.choicesBody}{" "}
                <a href="mailto:support@redihealth.app" className="text-primary hover:underline">
                  support@redihealth.app
                </a>
                .
              </p>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
