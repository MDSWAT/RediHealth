"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { IconTile } from "@/components/ui/IconTile";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRightIcon } from "@/components/ui/icons";
import { HelpOptionsMediatorBand } from "@/components/landing/HelpOptionsMediatorBand";
import { CarePath } from "@/components/landing/hero/CarePath";
import { heroCopy } from "@/lib/i18n/hero-copy";
import { NAV_LINK_ICONS, type NavLinkHref } from "@/components/layout/nav-links";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

type HelpOption = { title: string; description: string; cta: string };

type HelpOptionsCopy = {
  title: string;
  subtitle: string;
  options: [HelpOption, HelpOption, HelpOption, HelpOption];
};

/** Index-coupled to `options` in every locale of COPY. */
const OPTION_HREFS = [
  "/health-information",
  "/health-assistant",
  "/medic-online",
  "/find-help",
] as const satisfies readonly NavLinkHref[];

/** Display order over `options`: the assistant leads, then guides, doctor and finder. Copy order stays as written. */
const ORDER = [1, 0, 2, 3] as const;

/** Every locale defines every string, so no locale falls back to another language. */
const COPY: Record<Lang, HelpOptionsCopy> = {
  ro: {
    title: "Cum te putem ajuta?",
    subtitle: "Alege pasul potrivit pentru tine sau familia ta.",
    options: [
      {
        title: "Ghiduri de sănătate",
        description: "Explicații clare, semne de alarmă și mituri verificate.",
        cta: "Citește ghidurile",
      },
      {
        title: "Află ce poți face",
        description: "Înțelege simptomele și află încotro să mergi.",
        cta: "Deschide asistentul",
      },
      {
        title: "Vorbește cu un medic online",
        description: "Sfat gratuit prin telefon de la medicul de gardă.",
        cta: "Vezi medicii",
      },
      {
        title: "Găsește unde să mergi",
        description: "Dispensare, spitale și urgențe apropiate, chiar și fără card.",
        cta: "Deschide harta",
      },
    ],
  },
  en: {
    title: "How can we help?",
    subtitle: "Pick the right step for you or your family.",
    options: [
      {
        title: "Health guides",
        description: "Plain answers, alarm signs, and common myths checked.",
        cta: "Read guides",
      },
      {
        title: "Find out what to do",
        description: "Understand your symptoms and where to go next.",
        cta: "Open assistant",
      },
      {
        title: "Talk to a doctor online",
        description: "Free phone advice from an on-call doctor.",
        cta: "See doctors",
      },
      {
        title: "Find where to go",
        description: "Nearby clinics, hospitals, and emergency care, even uninsured.",
        cta: "Open map",
      },
    ],
  },
  sq: {
    title: "Si mund të të ndihmojmë?",
    subtitle: "Zgjidh hapin e duhur për ty ose familjen tënde.",
    options: [
      {
        title: "Udhëzues për shëndetin",
        description: "Shpjegime të qarta, shenja alarmi dhe mite të kontrolluara.",
        cta: "Lexo udhëzuesit",
      },
      {
        title: "Mëso çfarë të bësh",
        description: "Kupto simptomat dhe mëso ku të drejtohesh.",
        cta: "Hap asistentin",
      },
      {
        title: "Fol me një mjek online",
        description: "Këshillë falas me telefon nga mjeku kujdestar.",
        cta: "Shiko mjekët",
      },
      {
        title: "Gjej ku të shkosh",
        description: "Ambulanca, spitale dhe urgjenca afër teje, edhe pa kartë.",
        cta: "Hap hartën",
      },
    ],
  },
  it: {
    title: "Come possiamo aiutarti?",
    subtitle: "Scegli il passo giusto per te o la tua famiglia.",
    options: [
      {
        title: "Guide sulla salute",
        description: "Spiegazioni chiare, segnali di allarme e miti verificati.",
        cta: "Leggi le guide",
      },
      {
        title: "Capisci cosa fare",
        description: "Comprendi i sintomi e scopri a chi rivolgerti.",
        cta: "Apri l'assistente",
      },
      {
        title: "Parla con un medico online",
        description: "Consiglio telefonico gratuito dal medico di guardia.",
        cta: "Vedi i medici",
      },
      {
        title: "Trova dove andare",
        description: "Ambulatori, ospedali e pronto soccorso vicini, anche senza tessera.",
        cta: "Apri la mappa",
      },
    ],
  },
  hr: {
    title: "Kako ti možemo pomoći?",
    subtitle: "Odaberi pravi korak za sebe ili svoju obitelj.",
    options: [
      {
        title: "Zdravstveni vodiči",
        description: "Jasna objašnjenja, znakovi uzbune i provjereni mitovi.",
        cta: "Pročitaj vodiče",
      },
      {
        title: "Saznaj što možeš učiniti",
        description: "Razumij simptome i saznaj kamo se uputiti.",
        cta: "Otvori asistenta",
      },
      {
        title: "Razgovaraj s liječnikom online",
        description: "Besplatan telefonski savjet dežurnog liječnika.",
        cta: "Pogledaj liječnike",
      },
      {
        title: "Pronađi kamo otići",
        description: "Ambulante, bolnice i hitne službe u blizini, i bez iskaznice.",
        cta: "Otvori kartu",
      },
    ],
  },
  rom: {
    title: "Sar shaj azhutinas tut?",
    subtitle: "Alosar o lacho pash vash tute vaj chiri familija.",
    options: [
      {
        title: "Sastipnaske sikavimata",
        description: "Chache sikavimata, znakoja vash dar thaj xoxamne vorbe kontrolirime.",
        cta: "Ginav sikavimata",
      },
      {
        title: "Dzan so shaj keres",
        description: "Haljar chire simptome thaj dzan kaj te djas.",
        cta: "Phuter o azhutitori",
      },
      {
        title: "Vorbin jekhe doktorestar online",
        description: "Bi lovengo svato pe telefono katar o doktori pe straza.",
        cta: "Dikh doktoren",
      },
      {
        title: "Arakh kaj te djas",
        description: "Klinike, bolnitse thaj sigardiari buchi pasha tute, vi bi kartako.",
        cta: "Phuter i harta",
      },
    ],
  },
};

/**
 * "How can we help?": one sapphire lead card for the triage assistant, three
 * clean editorial rows (guides, on-call doctor, clinic finder), and the
 * community mediator card below.
 */
export function HelpOptions() {
  const { lang } = useLanguage();
  const copy = COPY[lang] ?? COPY.ro;
  const [lead, ...rows] = ORDER.map((index) => ({ ...copy.options[index], href: OPTION_HREFS[index] }));

  return (
    <Section tone="paper">
      <Container>
        <div>
          <SectionHeading
            as="h2"
            align="left"
            title={copy.title}
            subtitle={copy.subtitle}
          />
        </div>

        <div className="mt-7 grid gap-5 lg:mt-10 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-5">
            <Link
              href={withLangPrefix(lead.href, lang)}
              className="press-solid group relative flex h-full flex-col justify-between overflow-hidden rounded-(--radius-surface) bg-sapphire p-6 text-white shadow-(--shadow-card-rest) transition-[background-color,box-shadow,filter] duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-sapphire-light hover:shadow-(--shadow-card-hover) focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-paper motion-reduce:transition-none lg:p-8 dark:bg-ink-800"
            >
              <div>
                <IconTile icon={NAV_LINK_ICONS[lead.href]} tone="on-dark" />
                <h3 className="mt-5 text-balance text-title text-white lg:text-section">
                  {lead.title}
                </h3>
                <p className="mt-2 text-pretty text-body leading-relaxed text-on-sapphire-muted">
                  {lead.description}
                </p>
                <CarePath steps={(heroCopy[lang] ?? heroCopy.ro).journey} className="mt-5" />
              </div>

              <span className="mt-7 inline-flex min-h-11 self-start items-center gap-2.5 rounded-(--radius-control) bg-paper px-5 py-2.5 text-base font-semibold text-ink-950 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) group-hover:bg-white">
                <span>{lead.cta}</span>
                <ArrowRightIcon className="h-4 w-4 shrink-0 transition-transform duration-(--dur-fast) ease-(--ease-out-calm) group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </span>
            </Link>
          </div>

          <ul className="flex flex-col divide-y divide-border border-y border-border lg:col-span-7 dark:divide-white/10 dark:border-white/10">
            {rows.map(({ href, title, description, cta }) => (
              <li key={href} className="flex-1">
                <Link
                  href={withLangPrefix(href, lang)}
                  className="press-row group relative flex h-full min-h-19 flex-col justify-between gap-3 px-2 py-5 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-sapphire-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none sm:flex-row sm:items-center sm:gap-6 sm:px-4 lg:py-6 dark:hover:bg-ink-900 dark:focus-visible:ring-paper"
                >
                  <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
                    <IconTile icon={NAV_LINK_ICONS[href]} tone="sapphire-soft" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-title text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) group-hover:text-sapphire dark:text-paper dark:group-hover:text-paper">
                        <span className="min-w-0 wrap-break-word">{title}</span>
                      </h3>
                      <p className="mt-1 text-pretty text-body leading-relaxed text-muted-foreground dark:text-mist">
                        {description}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex min-h-10 shrink-0 items-center gap-1.5 pl-14 text-base font-semibold text-sapphire transition-colors duration-(--dur-fast) ease-(--ease-out-calm) group-hover:text-sapphire-light sm:self-center sm:pl-0 dark:text-sapphire-border dark:group-hover:text-paper">
                    <span className="underline decoration-sapphire/30 underline-offset-4 group-hover:decoration-sapphire dark:decoration-white/30 dark:group-hover:decoration-white">
                      {cta}
                    </span>
                    <ArrowRightIcon className="h-4 w-4 shrink-0 transition-transform duration-(--dur-fast) ease-(--ease-out-calm) group-hover:translate-x-0.5 motion-reduce:transition-none" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <HelpOptionsMediatorBand className="mt-5" />
      </Container>
    </Section>
  );
}
