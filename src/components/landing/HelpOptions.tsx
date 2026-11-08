"use client";

import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRightIcon, BookIcon, ClipboardCheckIcon, PinIcon, StethoscopeIcon } from "@/components/ui/icons";
import { HelpOptionsMediatorBand } from "@/components/landing/HelpOptionsMediatorBand";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

type HelpOption = { title: string; description: string; cta: string };

type HelpOptionsCopy = {
  title: string;
  subtitle: string;
  options: [HelpOption, HelpOption, HelpOption, HelpOption];
};

const OPTION_LINKS: { href: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { href: "/health-information", Icon: BookIcon },
  { href: "/health-assistant", Icon: ClipboardCheckIcon },
  { href: "/medic-online", Icon: StethoscopeIcon },
  { href: "/find-help", Icon: PinIcon },
];

/** Every locale defines every string, so no locale falls back to another language. */
const COPY: Record<Lang, HelpOptionsCopy> = {
  ro: {
    title: "Cum te putem ajuta?",
    subtitle: "Alege ce ai nevoie, pentru tine sau pentru familia ta. Totul este gratuit, iar datele tale rămân private.",
    options: [
      {
        title: "Ghiduri de sănătate",
        description: "Ghiduri simple, semnele de alarmă pe care trebuie să le știi și mituri des auzite, verificate cu dovezi.",
        cta: "Citește ghidurile",
      },
      {
        title: "Află ce poți face",
        description: "Asistentul te ajută să-ți înțelegi simptomele și ce faci mai departe, în cel mult 3 pași.",
        cta: "Deschide asistentul",
      },
      {
        title: "Vorbește cu un medic online",
        description: "Sfat gratuit de la medicul de gardă, prin video sau la telefon.",
        cta: "Vezi medicii de gardă",
      },
      {
        title: "Găsește unde să mergi",
        description: "Hartă cu dispensare, spitale și servicii de urgență din județul tău. Poți merge și fără card de sănătate.",
        cta: "Deschide harta",
      },
    ],
  },
  en: {
    title: "How can we help?",
    subtitle: "Pick what you need, for you or your family. It is all free, and your data stays private.",
    options: [
      {
        title: "Health guides",
        description: "Simple guides, the alarm signs to know, and common myths checked against the evidence.",
        cta: "Read the guides",
      },
      {
        title: "Find out what to do",
        description: "The assistant helps you understand your symptoms and what to do next, in 3 steps or fewer.",
        cta: "Open the assistant",
      },
      {
        title: "Talk to a doctor online",
        description: "Free advice from the on-call doctor, by video or phone.",
        cta: "See on-call doctors",
      },
      {
        title: "Find where to go",
        description: "A map of clinics, hospitals and emergency services in your county. You can go without a health card.",
        cta: "Open the map",
      },
    ],
  },
  sq: {
    title: "Si mund të të ndihmojmë?",
    subtitle: "Zgjidh atë që të duhet, për ty ose për familjen tënde. Gjithçka është falas dhe të dhënat e tua mbeten private.",
    options: [
      {
        title: "Udhëzues për shëndetin",
        description: "Udhëzues të thjeshtë, shenjat e alarmit që duhet të dish dhe mite të zakonshme, të kontrolluara me prova.",
        cta: "Lexo udhëzuesit",
      },
      {
        title: "Mëso çfarë të bësh",
        description: "Asistenti të ndihmon të kuptosh simptomat dhe çfarë të bësh më pas, në 3 hapa ose më pak.",
        cta: "Hap asistentin",
      },
      {
        title: "Fol me një mjek online",
        description: "Këshillë falas nga mjeku kujdestar, me video ose me telefon.",
        cta: "Shiko mjekët kujdestarë",
      },
      {
        title: "Gjej ku të shkosh",
        description: "Hartë me ambulanca, spitale dhe shërbime urgjence në qarkun tënd. Mund të shkosh edhe pa kartë shëndetësore.",
        cta: "Hap hartën",
      },
    ],
  },
  it: {
    title: "Come possiamo aiutarti?",
    subtitle: "Scegli quello che ti serve, per te o per la tua famiglia. È tutto gratuito e i tuoi dati restano riservati.",
    options: [
      {
        title: "Guide sulla salute",
        description: "Guide semplici, i segnali di allarme da conoscere e i miti più comuni, verificati con le prove.",
        cta: "Leggi le guide",
      },
      {
        title: "Capisci cosa fare",
        description: "L'assistente ti aiuta a capire i sintomi e cosa fare dopo, in 3 passi al massimo.",
        cta: "Apri l'assistente",
      },
      {
        title: "Parla con un medico online",
        description: "Consigli gratuiti dal medico di guardia, in video o al telefono.",
        cta: "Vedi i medici di guardia",
      },
      {
        title: "Trova dove andare",
        description: "Una mappa di ambulatori, ospedali e servizi di emergenza della tua provincia. Puoi andarci anche senza tessera sanitaria.",
        cta: "Apri la mappa",
      },
    ],
  },
};

/**
 * "How can we help?": one index of the four ways in, set as a single
 * ruled panel (1px dividers) rather than four floating cards. Calm hover:
 * the cell tints and the arrow moves 2px.
 */
export function HelpOptions() {
  const { lang } = useLanguage();
  const copy = COPY[lang] ?? COPY.ro;

  return (
    <section className="bg-background py-16 sm:py-20">
      <Container>
        <SectionHeading
          as="h2"
          align="center"
          title={copy.title}
          subtitle={copy.subtitle}
          titleClassName="text-3xl sm:text-4xl"
          className="mx-auto"
        />

        <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {copy.options.map(({ title, description, cta }, index) => {
            const { href, Icon } = OPTION_LINKS[index];
            return (
              <li key={href} className="bg-card">
                <Link
                  href={withLangPrefix(href, lang)}
                  className="group flex h-full flex-col p-5 transition-colors duration-150 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none sm:p-6"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="mt-px h-[22px] w-[22px] shrink-0 text-sapphire" />
                    <h3 className="text-lg font-semibold leading-snug text-foreground">{title}</h3>
                  </div>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">{description}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-sapphire">
                    {cta}
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <HelpOptionsMediatorBand className="mt-6" />
      </Container>
    </section>
  );
}
