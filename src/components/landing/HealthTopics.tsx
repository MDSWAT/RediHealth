"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
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

const topicHrefs = [
  "/health-information/heart-health",
  "/health-information/diabetes",
  "/health-information/healthy-eating",
  "/health-information/physical-activity",
  "/health-information/mental-wellbeing",
  "/health-information/smoking",
  "/health-information/preventive-screening",
  "/health-information/womens-health",
];

const topicIcons: ComponentType<SVGProps<SVGSVGElement>>[] = [
  HeartIcon,
  DropletIcon,
  AppleIcon,
  ActivityIcon,
  BrainIcon,
  NoSmokingIcon,
  SearchIcon,
  ShieldIcon,
];

export function HealthTopics() {
  const { t } = useLanguage();

  return (
    <section className="border-y border-border bg-muted/40 py-16 sm:py-20">
      <Container>
        <Reveal>
          <SectionHeading
            as="h2"
            title={t.landing.healthTopics.title}
            subtitle={t.landing.healthTopics.subtitle}
          />
        </Reveal>

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.landing.healthTopics.topics.map(({ title, description }, index) => {
            const Icon = topicIcons[index];
            return (
              <Reveal key={topicHrefs[index]} delay={(index % 4) * 80} className="h-full">
                <li className="h-full list-none">
                  <Link
                    href={topicHrefs[index]}
                    className="hover-lift group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </Link>
                </li>
              </Reveal>
            );
          })}
        </ul>

        <div className="mt-8">
          <Link
            href="/health-information"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg text-base font-semibold text-primary hover:text-primary-hover"
          >
            {t.landing.healthTopics.viewAll}
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
