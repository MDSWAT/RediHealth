import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MailIcon, PhoneIcon } from "@/components/ui/icons";
import Link from "next/link";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { getLegalCopy } from "@/lib/i18n/legal-translations";
import { withLangPrefix } from "@/lib/i18n/routing";

export async function generateMetadata() {
  const copy = getLegalCopy(await getRequestLang()).contact;
  return { title: `${copy.title} - RediHealth`, description: copy.description };
}

export default async function ContactPage() {
  const lang = await getRequestLang();
  const copy = getLegalCopy(lang).contact;
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <MailIcon className="h-6 w-6" />
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
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">{copy.enquiries}</h2>
              <a
                href="mailto:support@redihealth.app"
                className="mt-2 inline-flex items-center gap-2 text-primary hover:underline"
              >
                <MailIcon className="h-4 w-4" />
                support@redihealth.app
              </a>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">{copy.emergencies}</h2>
              <p className="mt-2 flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-primary" />
                {copy.emergencyBody}
              </p>
            </div>

            <p>
              {copy.helpBefore}{" "}
              <Link href={withLangPrefix("/get-help", lang)} className="text-primary hover:underline">
                {copy.helpLink}
              </Link>{" "}
              {copy.helpAfter}
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
