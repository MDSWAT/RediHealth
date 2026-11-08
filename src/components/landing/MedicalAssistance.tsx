"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRightIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { FindHelpPrompt } from "@/components/find-help/FindHelpPrompt";

type JourneyStep = { title: string; description: string; cta: string };

type JourneyCopy = {
  title: string;
  subtitle: string;
  steps: [JourneyStep, JourneyStep, JourneyStep];
};

const STEP_LINKS = ["/health-assistant", "/health-information", "/medic-online"] as const;

/**
 * The same three steps as the hero's care path, in every locale. Every locale
 * defines every string, so nothing falls back to another language.
 */
const COPY: Record<Lang, JourneyCopy> = {
  ro: {
    title: "Cum funcționează",
    subtitle: "De la prima îngrijorare până la sfatul unui medic, fără hârtii și fără drumuri inutile.",
    steps: [
      {
        title: "Spune ce te îngrijorează",
        description: "Alege o parte a corpului sau scrie problema cu cuvintele tale.",
        cta: "Deschide asistentul",
      },
      {
        title: "Afli ce ai de făcut",
        description: "Vezi dacă e urgent, ce poți face acasă și dacă ai nevoie de medic.",
        cta: "Citește ghidurile",
      },
      {
        title: "Vorbești cu un medic online",
        description: "Dacă e nevoie, te punem gratuit în legătură cu un medic de gardă, prin video sau la telefon.",
        cta: "Vezi medicii de gardă",
      },
    ],
  },
  en: {
    title: "How it works",
    subtitle: "From your first worry to a doctor's advice, with no paperwork.",
    steps: [
      {
        title: "Tell us what worries you",
        description: "Pick a part of the body or describe the problem in your own words.",
        cta: "Open the assistant",
      },
      {
        title: "Find out what to do",
        description: "See if it is urgent, what you can do at home and whether you need a doctor.",
        cta: "Read the guides",
      },
      {
        title: "Talk to a doctor online",
        description: "If you need one, we put you in touch with an on-call doctor for free, by video or phone.",
        cta: "See on-call doctors",
      },
    ],
  },
  sq: {
    title: "Si funksionon",
    subtitle: "Nga shqetësimi i parë te këshilla e mjekut, pa letra dhe pa burokraci.",
    steps: [
      {
        title: "Na thuaj çfarë të shqetëson",
        description: "Zgjidh një pjesë të trupit ose shkruaj problemin me fjalët e tua.",
        cta: "Hap asistentin",
      },
      {
        title: "Mëso çfarë të bësh",
        description: "Shiko nëse është urgjente, çfarë mund të bësh në shtëpi dhe nëse të duhet mjek.",
        cta: "Lexo udhëzuesit",
      },
      {
        title: "Fol me një mjek online",
        description: "Nëse duhet, të lidhim falas me një mjek kujdestar, me video ose me telefon.",
        cta: "Shiko mjekët kujdestarë",
      },
    ],
  },
  it: {
    title: "Come funziona",
    subtitle: "Dalla prima preoccupazione al consiglio di un medico, senza burocrazia.",
    steps: [
      {
        title: "Dicci cosa ti preoccupa",
        description: "Scegli una parte del corpo o descrivi il problema con parole tue.",
        cta: "Apri l'assistente",
      },
      {
        title: "Capisci cosa fare",
        description: "Vedi se è urgente, cosa puoi fare a casa e se ti serve un medico.",
        cta: "Leggi le guide",
      },
      {
        title: "Parla con un medico online",
        description: "Se serve, ti mettiamo in contatto gratis con un medico di guardia, in video o al telefono.",
        cta: "Vedi i medici di guardia",
      },
    ],
  },
};

/**
 * Three steps as one ruled sequence: a number, a title, one line, one link.
 * No cards, no double badges, no connector graphics.
 */
export function MedicalAssistance() {
  const { lang } = useLanguage();
  const copy = COPY[lang] ?? COPY.ro;

  return (
    <section className="border-y border-border bg-background py-16 sm:py-20">
      <Container>
        <SectionHeading as="h2" align="center" title={copy.title} subtitle={copy.subtitle} className="mx-auto" />

        <ol className="mt-12 grid gap-x-10 md:grid-cols-3">
          {copy.steps.map(({ title, description, cta }, index) => (
            <li key={STEP_LINKS[index]} className="flex flex-col border-t border-border pt-5 pb-7 md:pb-0">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center self-start rounded-full border border-sapphire/30 text-sm font-semibold tabular-nums text-sapphire"
              >
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold leading-snug text-foreground">
                <span className="sr-only">{index + 1}. </span>
                {title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{description}</p>
              <Link
                href={withLangPrefix(STEP_LINKS[index], lang)}
                className="group mt-auto inline-flex min-h-11 items-center gap-1.5 self-start rounded-lg pt-3 text-sm font-semibold text-sapphire transition-colors hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {cta}
                <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
            </li>
          ))}
        </ol>

        <FindHelpPrompt lang={lang} className="mt-10" />
      </Container>
    </section>
  );
}
