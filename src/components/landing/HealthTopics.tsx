import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRightIcon } from "@/components/ui/icons";
import { HealthTopicsSpotlight } from "@/components/landing/HealthTopicsSpotlight";
import { HealthTopicsWheel } from "@/components/landing/HealthTopicsWheel";
import { WHEEL_ICONS } from "@/components/landing/HealthTopicsWheelIcons";
import { WHEEL_ORDER } from "@/components/landing/health-topics-wheel-config";
import { cn } from "@/lib/cn";
import { getHealthTopicsList } from "@/lib/i18n/health-information-topics";
import { getRequestLang, withLangPrefix } from "@/lib/i18n/server-routing";
import { translations } from "@/lib/i18n/translations";

/** The link to every guide. It renders below the grid on phones and beside the heading from sm. */
function ViewAllLink({ href, label, className }: { href: string; label: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "press-solid group min-h-12 max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-(--radius-control) bg-sapphire px-4 py-2 text-center text-sm font-semibold text-white transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sand motion-reduce:transition-none sm:px-5 sm:text-base dark:bg-paper dark:text-ink-950 dark:hover:bg-paper/90 dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink-900",
        className,
      )}
    >
      <span className="min-w-0 overflow-hidden text-ellipsis">{label}</span>
      <ArrowRightIcon className="h-5 w-5 shrink-0 transition-transform duration-(--dur-fast) ease-(--ease-out-calm) group-hover:translate-x-0.5 motion-reduce:transition-none" />
    </Link>
  );
}

/**
 * Eight health topics on the sand ground. Phones: two columns of photo tiles,
 * a rounded photo with the title beneath it straight on the sand, no card.
 * From sm: three columns of bordered cards with the blurb. From lg the grid
 * gives way to the topic wheel beside one card that follows it
 * (`HealthTopicsSpotlight`). The heading and each tile settle in as they
 * scroll into view.
 * Titles, blurbs and photos come from `getHealthTopicsList(lang)` in a Server
 * Component, so the guide dictionary never ships to the browser here.
 */
export async function HealthTopics() {
  const lang = await getRequestLang();
  const { title, subtitle, viewAll } = translations[lang].landing.healthTopics;
  const topics = getHealthTopicsList(lang);
  const viewAllHref = withLangPrefix("/health-information", lang);

  const spotlightTopics = WHEEL_ORDER.flatMap((slug) => {
    const topic = topics.find((item) => item.slug === slug);
    if (!topic) return [];
    const Icon = WHEEL_ICONS[slug] ?? topic.icon;
    return [
      {
        slug,
        title: topic.title,
        description: topic.description,
        image: topic.image,
        href: withLangPrefix(`/health-information/${slug}`, lang),
        icon: <Icon />,
      },
    ];
  });

  return (
    <Section tone="sand" className="lg:py-[clamp(1.5rem,5svh,4rem)]!">
      <Container size="wide">
        <HealthTopicsSpotlight
          topics={spotlightTopics}
          wheel={
            <div>
              <HealthTopicsWheel label={title} className="lg:max-w-[min(42.5rem,calc(100svh-var(--site-header-h)-4rem))]!" />
            </div>
          }
          heading={
            // Short desktop screens (under 760px tall) drop the subtitle, so the section fits.
            <div className="lg:[@media(max-height:760px)]:[&_p]:hidden">
              <SectionHeading
                as="h2"
                title={title}
                subtitle={subtitle}
                action={<ViewAllLink href={viewAllHref} label={viewAll} className="hidden sm:inline-flex lg:hidden" />}
              />
            </div>
          }
        >
          {/* Phones: the heading's empty action slot already adds a 16px gap, so the grid adds the other 16px. */}
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-3 lg:hidden">
            {topics.map(({ slug, title: topicTitle, description, image }) => (
              <li key={slug}>
                <div className="h-full">
                  <Link
                    href={withLangPrefix(`/health-information/${slug}`, lang)}
                    className="press-row group flex h-full flex-col rounded-(--radius-surface) transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:overflow-hidden sm:border sm:border-sand-line sm:bg-card sm:hover:border-sapphire/35 dark:focus-visible:ring-paper dark:sm:border-white/10 dark:sm:bg-ink-800 dark:sm:hover:border-white/25"
                  >
                    <div className="relative aspect-4/3 overflow-hidden rounded-(--radius-surface) bg-surface-subtle sm:rounded-none">
                      <Image src={image} alt="" fill sizes="(min-width: 640px) 33vw, 50vw" className="object-cover" />
                    </div>
                    <div className="min-w-0 px-1 pb-1 pt-2 sm:p-4">
                      <h3 className="text-balance wrap-break-word text-base font-semibold leading-snug text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) group-hover:text-sapphire motion-reduce:transition-none dark:text-paper dark:group-hover:text-sapphire-border">
                        {topicTitle}
                      </h3>
                      <p className="mt-1 hidden text-pretty text-body text-muted-foreground sm:block dark:text-mist">
                        {description}
                      </p>
                    </div>
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 sm:hidden lg:mt-[clamp(1rem,2.5svh,1.5rem)] lg:block">
            <ViewAllLink href={viewAllHref} label={viewAll} className="inline-flex w-full lg:w-auto" />
          </div>
        </HealthTopicsSpotlight>
      </Container>
    </Section>
  );
}
