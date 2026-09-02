"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import {
  HeartIcon,
  LockIcon,
  ShieldIcon,
  StethoscopeIcon,
} from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";

const commitmentIcons = [HeartIcon, LockIcon, ShieldIcon, StethoscopeIcon];

export function TrustSection() {
  const { t } = useLanguage();

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Reveal>
          <SectionHeading
            as="h2"
            align="center"
            title={t.landing.trustSection.title}
            subtitle={t.landing.trustSection.subtitle}
            className="mx-auto"
          />
        </Reveal>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.landing.trustSection.commitments.map(({ title, description }, index) => {
            const Icon = commitmentIcons[index];
            return (
              <Reveal key={title} delay={index * 100} className="h-full">
                <li className="hover-lift flex h-full list-none flex-col rounded-xl border border-border bg-card p-6 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </li>
              </Reveal>
            );
          })}
        </ul>

        <Reveal className="mt-12">
          <div className="rounded-xl border border-dashed border-border bg-muted/40 p-8">
            <p className="text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {t.landing.trustSection.partnersLabel}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="flex h-16 items-center justify-center rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground"
                >
                  {t.landing.trustSection.partnerLogo}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
