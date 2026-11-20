import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { getHealthTopicsList } from "@/lib/i18n/health-information-topics";
import { getRequestLang, withLangPrefix } from "@/lib/i18n/server-routing";
import { translations } from "@/lib/i18n/translations";

const WELLNESS_TOPIC_SLUGS = new Set([
  "healthy-eating",
  "physical-activity",
  "mental-wellbeing",
  "smoking",
]);

/**
 * Eight health topics and self-check guides on the warm sand ground.
 * Clean, colorful, scannable cards on both mobile and desktop:
 * - Everyday habits & mental wellbeing carry the wellness teal top bar and icon plate.
 * - Clinical prevention & screening guides carry the clinical sapphire top bar and icon plate.
 * - One single action button at the foot takes visitors straight to "Learn and test yourself".
 */
export async function HealthTopics() {
  const lang = await getRequestLang();
  const { title, subtitle, viewAll } = translations[lang].landing.healthTopics;
  const topics = getHealthTopicsList(lang);
  const viewAllHref = withLangPrefix("/health-information", lang);

  return (
    <Section tone="sand">
      <Container>
        <Reveal>
          <SectionHeading as="h2" title={title} subtitle={subtitle} />

          <ul className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {topics.map(({ slug, title: topicTitle, description, image, icon: TopicIcon }) => {
              const isWellness = WELLNESS_TOPIC_SLUGS.has(slug);
              return (
                <li key={slug}>
                  <Link
                    href={withLangPrefix(`/health-information/${slug}`, lang)}
                    className="press-row card-interactive group flex h-full flex-col overflow-hidden rounded-(--radius-surface) border border-sand-line bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/10 dark:bg-ink-800 dark:hover:border-white/25 dark:focus-visible:ring-paper"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "block h-1 w-full shrink-0",
                        isWellness
                          ? "bg-wellness dark:bg-wellness-border"
                          : "bg-sapphire dark:bg-sapphire-border",
                      )}
                    />
                    <div className="flex flex-1 flex-row sm:flex-col">
                      <div className="relative w-28 shrink-0 overflow-hidden bg-surface-subtle sm:aspect-4/3 sm:w-full">
                        <Image
                          src={image}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 112px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-center p-4 sm:justify-start sm:p-5">
                        <div className="flex items-start gap-3">
                          <span
                            aria-hidden="true"
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-(--radius-control)",
                              isWellness
                                ? "bg-wellness-soft text-wellness dark:text-wellness-border"
                                : "bg-sapphire-soft text-sapphire dark:bg-white/10 dark:text-sapphire-border",
                            )}
                          >
                            <TopicIcon className="h-4.5 w-4.5" />
                          </span>
                          <h3
                            className={cn(
                              "min-w-0 flex-1 self-center text-balance wrap-break-word text-body font-semibold leading-snug text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none dark:text-paper",
                              isWellness
                                ? "group-hover:text-wellness dark:group-hover:text-wellness-border"
                                : "group-hover:text-sapphire dark:group-hover:text-sapphire-border",
                            )}
                          >
                            {topicTitle}
                          </h3>
                        </div>

                        <p className="mt-2.5 text-pretty text-meta font-normal text-muted-foreground dark:text-mist">
                          {description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-8">
            <Button
              href={viewAllHref}
              variant="action"
              size="lg"
              className="w-full bg-wellness! text-white! hover:bg-wellness-light! sm:w-auto"
            >
              <span>{viewAll}</span>
              <ArrowRightIcon className="arrow-travel h-5 w-5 shrink-0" />
            </Button>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
