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
      <section className="border-b border-border bg-muted/40 py-10 sm:py-14">
        <Container>
          <SectionHeading as="h1" title={copy.title} subtitle={copy.description} titleClassName="text-page" />
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <div className="max-w-[65ch] space-y-8 text-base leading-relaxed text-muted-foreground">
            <div>
              <h2 className="text-title text-foreground">{copy.enquiries}</h2>
              {/* The address is the page's main action: a full-height target whose underline draws in. */}
              <a
                href="mailto:support@redihealth.app"
                className="group press-row mt-1 inline-flex min-h-11 items-center gap-2.5 rounded-sm text-lg font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:text-sapphire-light dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border"
              >
                <MailIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>support@redihealth.app</span>
              </a>
            </div>

            <div>
              <h2 className="text-title text-foreground">{copy.emergencies}</h2>
              <p className="mt-2 flex items-start gap-2">
                <PhoneIcon className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {copy.emergencyBody}
              </p>
            </div>

            <p>
              {copy.helpBefore}{" "}
              <Link href={withLangPrefix("/get-help", lang)} className="rounded-sm text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light dark:hover:text-white hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
