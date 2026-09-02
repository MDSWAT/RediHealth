"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import {
  ActivityIcon,
  AppleIcon,
  ArrowRightIcon,
  BookIcon,
  BrainIcon,
  DropletIcon,
  HeartIcon,
  NoSmokingIcon,
  PhoneIcon,
  SearchIcon,
  ShieldIcon,
  StethoscopeIcon,
} from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

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

const topicIcons: IconComponent[] = [
  HeartIcon,
  DropletIcon,
  AppleIcon,
  ActivityIcon,
  BrainIcon,
  NoSmokingIcon,
  SearchIcon,
  ShieldIcon,
];

const usingInfoIcons: IconComponent[] = [BookIcon, ShieldIcon, StethoscopeIcon];

export function HealthInformationPageContent() {
  const { t } = useLanguage();
  const page = t.healthInfoPage;
  const topics = t.landing.healthTopics.topics;

  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow={page.eyebrow}
            title={page.heroTitle}
            subtitle={page.heroSubtitle}
          />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading
            as="h2"
            title={page.browseTitle}
            subtitle={page.browseSubtitle}
          />

          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topics.map(({ title, description }, index) => {
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
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                        {page.readMore}
                        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </li>
                </Reveal>
              );
            })}
          </ul>
        </Container>
      </section>

      <section className="border-y border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <SectionHeading
            as="h2"
            title={page.usingInfoTitle}
            subtitle={page.usingInfoSubtitle}
          />

          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {page.usingInfoSteps.map(({ title, description }, index) => {
              const Icon = usingInfoIcons[index];
              return (
                <Reveal key={title} delay={index * 100} className="h-full">
                  <li className="hover-lift flex h-full list-none flex-col rounded-xl border border-border bg-card p-7">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                        {index + 1}
                      </span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                        <Icon className="h-6 w-6" />
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">
                      {title}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </li>
                </Reveal>
              );
            })}
          </ol>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <Reveal className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-[1.5fr_1fr] lg:items-center">
              <div className="max-w-xl">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <StethoscopeIcon className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {page.ctaTitle}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  {page.ctaBody}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button href="/get-help" size="lg">
                    {t.landing.medicalAssistance.requestHelp}
                  </Button>
                  <Button href="/find-help" size="lg" variant="outline">
                    {t.landing.medicalAssistance.findServices}
                  </Button>
                </div>

                <p className="mt-6 rounded-lg bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                  {page.ctaDisclaimer}
                </p>
              </div>

              <div
                className="hidden rounded-xl bg-muted/60 p-8 lg:block"
                aria-hidden="true"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary text-white">
                    <PhoneIcon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      {t.landing.emergencyNotice.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {t.landing.emergencyNotice.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
