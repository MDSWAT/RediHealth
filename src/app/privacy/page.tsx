import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LockIcon } from "@/components/ui/icons";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { getLegalCopy } from "@/lib/i18n/legal-translations";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const copy = getLegalCopy(lang).privacy;
  return {
    title: localizedPageTitle(lang, "privacy", "Privacy Notice - RediHealth"),
    description: copy.description,
  };
}

export default async function PrivacyPage() {
  const copy = getLegalCopy(await getRequestLang()).privacy;
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <LockIcon className="h-6 w-6" />
          </span>
          <SectionHeading
            as="h1"
            className="mt-5 max-w-none"
            title={copy.title}
            subtitle={copy.description}
          />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="max-w-2xl space-y-6 text-base leading-relaxed text-muted-foreground">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">{copy.collectTitle}</h2>
              <p className="mt-2">
                {copy.collectBody}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">{copy.useTitle}</h2>
              <p className="mt-2">
                {copy.useBody}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">{copy.accessTitle}</h2>
              <p className="mt-2">
                {copy.accessBody}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">{copy.choicesTitle}</h2>
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
