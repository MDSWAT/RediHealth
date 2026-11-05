"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon, BookIcon, ClipboardCheckIcon, PinIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";

const optionIcons = [
  { Icon: BookIcon, tone: "bg-red-50 text-red-600" },
  { Icon: ClipboardCheckIcon, tone: "bg-blue-50 text-slate-800" },
  { Icon: PinIcon, tone: "bg-green-50 text-green-700" },
];

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
          {t.landing.helpOptions.options.map(({ title, description, cta, href }, index) => (
            <Reveal key={href} delay={index * 100} className="h-full">
              <li className="h-full list-none">
                <Link
                  href={href}
                  className="hover-lift group flex h-full flex-col rounded-xl border border-border bg-card p-7 transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {(() => {
                    const { Icon, tone } = optionIcons[index];
                    return (
                      <span className={`flex h-14 w-14 items-center justify-center rounded-full ${tone}`}>
                        <Icon className="h-8 w-8" />
                      </span>
                    );
                  })()}
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

        <Reveal className="mt-8">
          <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-muted/40 px-5 py-3 text-center text-sm sm:flex-row sm:gap-3">
            <span className="text-muted-foreground">{t.landing.helpOptions.mediatorBand.text}</span>
            <Link
              href="/panel"
              className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {t.landing.helpOptions.mediatorBand.cta}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
