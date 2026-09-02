"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";

const optionHrefs = ["/health-information", "/health-check", "/find-help"];
const optionIcons = ["/Icons/Learn.svg", "/Icons/Check.svg", "/Icons/Map.svg"];

export function HelpOptions() {
  const { t } = useLanguage();

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Reveal>
          <SectionHeading
            as="h2"
            align="center"
            title={t.landing.helpOptions.title}
            subtitle={t.landing.helpOptions.subtitle}
            titleClassName="text-3xl sm:text-4xl"
            className="mx-auto"
          />
        </Reveal>

        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {t.landing.helpOptions.options.map(({ title, description, cta }, index) => (
            <Reveal key={optionHrefs[index]} delay={index * 100} className="h-full">
              <li className="h-full list-none">
                <Link
                  href={optionHrefs[index]}
                  className="hover-lift group flex h-full flex-col rounded-xl border border-border bg-card p-7 transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <img
                    src={optionIcons[index]}
                    alt=""
                    className="h-14 w-14 object-contain"
                  />
                  <h3 className="mt-5 text-xl font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 flex-1 text-base leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-base font-semibold text-primary">
                    {cta}
                    <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
