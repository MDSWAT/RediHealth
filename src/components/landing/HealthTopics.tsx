import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRightIcon } from "@/components/ui/icons";
import { getHealthTopicsList } from "@/lib/i18n/health-information-topics";
import { getRequestLang, withLangPrefix } from "@/lib/i18n/server-routing";
import { translations } from "@/lib/i18n/translations";

/**
 * Eight health topics as a sealed Swiss ruled-index matrix (1px hairlines,
 * 01-08 tabular indices, sapphire icon plates, and GPU-composited hover arrows).
 * Titles, descriptions and icons come from `getHealthTopicsList(lang)` in a
 * Server Component so the guide dictionary never ships to the browser here.
 */
export async function HealthTopics() {
  const lang = await getRequestLang();
  const { title, subtitle, viewAll } = translations[lang].landing.healthTopics;
  const topics = getHealthTopicsList(lang);

  return (
    <section className="border-y border-border bg-surface-subtle/50 py-16 sm:py-24">
      <Container>
        <SectionHeading
          as="h2"
          title={title}
          subtitle={subtitle}
          action={
            <Link
              href={withLangPrefix("/health-information", lang)}
              className="group inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-sapphire shadow-(--shadow-card-rest) transition-[background-color,border-color,color,box-shadow] duration-(--dur-fast) ease-(--ease-out-calm) hover:border-sapphire/35 hover:bg-sapphire-soft/50 hover:shadow-(--shadow-card-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              <span>{viewAll}</span>
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-(--dur-fast) ease-(--ease-out-calm) group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </Link>
          }
        />

        <ol className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border shadow-(--shadow-card-rest) sm:grid-cols-2 lg:grid-cols-4">
          {topics.map(({ slug, title: topicTitle, description, icon: Icon }, index) => {
            const href = `/health-information/${slug}`;
            const indexCode = String(index + 1).padStart(2, "0");
            return (
              <li key={slug} className="bg-card">
                <Link
                  href={withLangPrefix(href, lang)}
                  className="surface-spotlight group flex h-full flex-col p-6 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-surface-subtle/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none sm:p-7"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-sapphire-border/70 bg-sapphire-soft text-sapphire transition-colors duration-(--dur-fast) ease-(--ease-out-calm) group-hover:bg-sapphire group-hover:text-white motion-reduce:transition-none">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span
                      aria-hidden="true"
                      className="font-mono text-xs font-medium tabular-nums text-muted-foreground/80"
                    >
                      {indexCode}
                    </span>
                  </div>

                  <span className="mt-5 flex items-start justify-between gap-2">
                    <span className="text-lg font-semibold leading-snug tracking-[-0.015em] text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) group-hover:text-sapphire motion-reduce:transition-none">
                      {topicTitle}
                    </span>
                    <ArrowRightIcon className="mt-1 h-4 w-4 shrink-0 -translate-x-1 text-sapphire opacity-0 transition-[opacity,transform] duration-(--dur-fast) ease-(--ease-out-calm) group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none" />
                  </span>

                  <span className="mt-2 block text-pretty text-[14.5px] leading-relaxed text-muted-foreground">
                    {description}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
