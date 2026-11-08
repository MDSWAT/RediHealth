"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  ActivityIcon,
  AppleIcon,
  ArrowRightIcon,
  BrainIcon,
  DropletIcon,
  HeartIcon,
  NoSmokingIcon,
  SearchIcon,
  ShieldIcon,
} from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";

const TOPICS: { href: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { href: "/health-information/heart-health", Icon: HeartIcon },
  { href: "/health-information/diabetes", Icon: DropletIcon },
  { href: "/health-information/healthy-eating", Icon: AppleIcon },
  { href: "/health-information/physical-activity", Icon: ActivityIcon },
  { href: "/health-information/mental-wellbeing", Icon: BrainIcon },
  { href: "/health-information/smoking", Icon: NoSmokingIcon },
  { href: "/health-information/preventive-screening", Icon: SearchIcon },
  { href: "/health-information/womens-health", Icon: ShieldIcon },
];

/**
 * Eight health topics as a ruled index (a hairline above each entry), not a
 * grid of identical cards. Titles and descriptions come from
 * `translations[lang].landing.healthTopics`, defined in every locale.
 */
export function HealthTopics() {
  const { lang, t } = useLanguage();
  const { title, subtitle, viewAll, topics } = t.landing.healthTopics;

  return (
    <section className="border-y border-border bg-muted/40 py-16 sm:py-20">
      <Container>
        <SectionHeading as="h2" title={title} subtitle={subtitle} />

        <ul className="mt-10 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map(({ title: topicTitle, description }, index) => {
            const topic = TOPICS[index];
            if (!topic) return null;
            const { href, Icon } = topic;
            return (
              <li key={href} className="border-t border-border">
                <Link
                  href={withLangPrefix(href, lang)}
                  className="group flex h-full gap-3.5 rounded-sm py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-sapphire" />
                  <span>
                    <span className="block text-base font-semibold leading-snug text-foreground transition-colors duration-150 group-hover:text-sapphire">
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
          className="group mt-6 inline-flex min-h-11 items-center gap-1.5 rounded-lg text-base font-semibold text-sapphire transition-colors hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {viewAll}
          <ArrowRightIcon className="h-5 w-5 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </Link>
      </Container>
    </section>
  );
}
