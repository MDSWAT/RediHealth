import type { ComponentType, SVGProps } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import {
  ActivityIcon,
  AppleIcon,
  ArrowRightIcon,
  BrainIcon,
  DropletIcon,
  HeartIcon,
  NoSmokingIcon,
  PhoneIcon,
  SearchIcon,
  ShieldIcon,
} from "@/components/ui/icons";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { withLangPrefix } from "@/lib/i18n/routing";
import { translations } from "@/lib/i18n/translations";
import {
  getHealthInformationDictionary,
  getHealthTopicBySlug,
  healthTopicSlugs,
} from "@/lib/i18n/health-information-topics";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const iconsBySlug: Record<string, IconComponent> = {
  "heart-health": HeartIcon,
  diabetes: DropletIcon,
  "healthy-eating": AppleIcon,
  "physical-activity": ActivityIcon,
  "mental-wellbeing": BrainIcon,
  smoking: NoSmokingIcon,
  "preventive-screening": SearchIcon,
  "womens-health": ShieldIcon,
};

export function generateStaticParams() {
  return healthTopicSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/health-information/[slug]">): Promise<Metadata> {
  const lang = await getRequestLang();
  const { slug } = await params;
  const topic = getHealthTopicBySlug(lang, slug);

  if (!topic) {
    return { title: "Health Information - RediHealth" };
  }

  return {
    title: topic.title + " - RediHealth",
    description: topic.description,
  };
}

export default async function HealthTopicPage({
  params,
}: PageProps<"/health-information/[slug]">) {
  const lang = await getRequestLang();
  const common = translations[lang];
  const dictionary = getHealthInformationDictionary(lang);
  const { slug } = await params;
  const topic = getHealthTopicBySlug(lang, slug);

  if (!topic) {
    notFound();
  }

  const Icon = iconsBySlug[topic.slug];
  if (!Icon) {
    notFound();
  }
  const related = dictionary.topics.filter((item) => item.slug !== topic.slug).slice(0, 3);

  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href={withLangPrefix("/health-information", lang)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
            >
              <ArrowRightIcon className="h-4 w-4 rotate-180" />
              {dictionary.labels.allTopics}
            </Link>
          </nav>

          <div className="max-w-2xl">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Icon className="h-6 w-6" />
            </span>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {topic.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {topic.intro}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {dictionary.labels.whyItMatters}
              </h2>
              <ul className="mt-6 space-y-4">
                {topic.keyFacts.map((fact) => (
                  <li key={fact} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 flex-none rounded-full bg-primary" />
                    <span className="text-base leading-relaxed text-muted-foreground">
                      {fact}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {dictionary.labels.practicalSteps}
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {topic.recommendations.map(({ title: stepTitle, description }) => (
                  <li
                    key={stepTitle}
                    className="flex h-full flex-col rounded-xl border border-border bg-card p-6"
                  >
                    <h3 className="text-lg font-semibold text-foreground">
                      {stepTitle}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-border bg-primary-soft py-16 sm:py-20">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {dictionary.labels.seekAdviceTitle}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-foreground/80">
              {dictionary.labels.seekAdviceBody}
            </p>
            <ul className="mt-6 space-y-4">
              {topic.warningSigns.map((sign) => (
                <li key={sign} className="flex gap-3">
                  <span className="mt-1 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary text-white">
                    <PhoneIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-base leading-relaxed text-foreground">
                    {sign}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={withLangPrefix("/get-help", lang)} size="lg">
                {common.landing.medicalAssistance.requestHelp}
              </Button>
              <Button href={withLangPrefix("/find-help", lang)} size="lg" variant="outline">
                {common.landing.medicalAssistance.findServices}
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {dictionary.labels.relatedTopics}
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map(({ slug: relSlug, title: relTitle, description }) => {
              const RelIcon = iconsBySlug[relSlug];
              if (!RelIcon) {
                return null;
              }
              return (
              <li key={relSlug}>
                <Link
                  href={withLangPrefix(`/health-information/${relSlug}`, lang)}
                  className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <RelIcon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {relTitle}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    {dictionary.labels.readMore}
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
              );
            })}
          </ul>

          <p className="mt-10 rounded-lg bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            {dictionary.labels.disclaimer}
          </p>
        </Container>
      </section>
    </main>
  );
}
