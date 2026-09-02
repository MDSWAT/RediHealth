"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import {
  ClipboardCheckIcon,
  HandHelpingIcon,
  StethoscopeIcon,
} from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";

const stepIcons = [ClipboardCheckIcon, HandHelpingIcon, StethoscopeIcon];

export function MedicalAssistance() {
  const { t } = useLanguage();

  return (
    <section className="border-y border-border bg-background py-16 sm:py-20">
      <Container>
        <Reveal>
          <SectionHeading
            as="h2"
            title={t.landing.medicalAssistance.title}
            subtitle={t.landing.medicalAssistance.subtitle}
          />
        </Reveal>

        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {t.landing.medicalAssistance.steps.map(({ title, description }, index) => {
            const Icon = stepIcons[index];
            return (
              <Reveal key={title} delay={index * 100} className="h-full">
                <li className="hover-lift relative flex h-full list-none flex-col rounded-xl border border-border bg-card p-7">
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

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button href="/get-help" size="lg">
            {t.landing.medicalAssistance.requestHelp}
          </Button>
          <Button href="/find-help" size="lg" variant="outline">
            {t.landing.medicalAssistance.findServices}
          </Button>
        </div>
      </Container>
    </section>
  );
}
