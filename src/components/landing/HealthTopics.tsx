import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRightIcon } from "@/components/ui/icons";
import { getHealthTopicsList } from "@/lib/i18n/health-information-topics";
import { getRequestLang, withLangPrefix } from "@/lib/i18n/server-routing";
import { translations } from "@/lib/i18n/translations";

/**
 * Eight health topics as a ruled index (a hairline above each entry), not a
 * grid of identical cards. Titles, descriptions and icons come from the guide
 * index (`getHealthTopicsList`), so the landing and /health-information never
 * describe a guide two different ways. A server component, so the guide
 * dictionary never ships to the browser for this one list.
 */
export async function HealthTopics() {
  const lang = await getRequestLang();
  const { title, subtitle, viewAll } = translations[lang].landing.healthTopics;
  const topics = getHealthTopicsList(lang);

  return (
    <section className="border-y border-border bg-muted/40 py-16 sm:py-20">
      <Container>
        <SectionHeading as="h2" title={title} subtitle={subtitle} />

        <ul className="mt-10 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map(({ slug, title: topicTitle, description, icon: Icon }) => {
            const href = `/health-information/${slug}`;
            return (
              <li key={slug} className="border-t border-border">
                <Link
                  href={withLangPrefix(href, lang)}
                  className="group flex h-full gap-3.5 rounded-sm py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-sapphire" />
                  <span>
                    <span className="block text-base font-semibold leading-snug text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire">
                      {topicTitle}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{description}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href={withLangPrefix("/health-information", lang)}
          className="mt-6 inline-flex min-h-11 items-center gap-1.5 rounded-lg text-base font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {viewAll}
          <ArrowRightIcon className="h-5 w-5" />
        </Link>
      </Container>
    </section>
  );
}
