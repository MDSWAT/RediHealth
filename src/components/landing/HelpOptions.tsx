"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { IconTile } from "@/components/ui/IconTile";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
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
  ru: {
    title: "Чем мы можем помочь?",
    subtitle: "Выберите нужный шаг для себя или близких.",
    options: [
      {
        title: "Справочник о здоровье",
        description: "Простые объяснения, опасные симптомы и разбор частых мифов.",
        cta: "Читать справочник",
      },
      {
        title: "Узнать, что делать",
        description: "Проверьте симптомы и узнайте, куда обратиться дальше.",
        cta: "Открыть помощник",
      },
      {
        title: "Поговорить с врачом онлайн",
        description: "Бесплатный телефонный звонок дежурному врачу.",
        cta: "Смотреть врачей",
      },
      {
        title: "Найти, куда пойти",
        description: "Поликлиники, больницы и скорая помощь рядом, даже без полиса.",
        cta: "Открыть карту",
      },
    ],
  },

  ro: {
    title: "Cum te putem ajuta?",
    subtitle: "Alege pasul potrivit pentru tine sau familia ta.",
    options: [
      {
        title: "Ghiduri de sănătate",
        description: "Explicații simple, semne de alarmă și mituri lămurite.",
        cta: "Citește ghidurile",
      },
      {
        title: "Află ce poți face",
        description: "Verifică simptomele și vezi încotro să mergi.",
        cta: "Deschide asistentul",
      },
      {
        title: "Vorbește cu un medic online",
        description: "Apel gratuit la telefon cu medicul de gardă.",
        cta: "Vezi medicii",
      },
      {
        title: "Găsește unde să mergi",
        description: "Cabinete, spitale și camere de gardă aproape, și fără asigurare.",
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
        description: "Plain answers, warning signs and common myths explained.",
        cta: "Read guides",
      },
      {
        title: "Find out what to do",
        description: "Check your symptoms and see where to go next.",
        cta: "Open assistant",
      },
      {
        title: "Talk to a doctor online",
        description: "Free phone call with an on-call doctor.",
        cta: "See doctors",
      },
      {
        title: "Find where to go",
        description: "Clinics, hospitals and emergency care near you, even without insurance.",
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
        description: "Përgjigje të thjeshta, shenja alarmi dhe mite të sqaruara.",
        cta: "Lexo udhëzuesit",
      },
      {
        title: "Mëso çfarë të bësh",
        description: "Kontrollo simptomat dhe shiko ku të drejtohesh më tej.",
        cta: "Hap asistentin",
      },
      {
        title: "Fol me një mjek online",
        description: "Telefonatë falas me mjekun kujdestar.",
        cta: "Shiko mjekët",
      },
      {
        title: "Gjej ku të shkosh",
        description: "Ambulanca, spitale dhe urgjenca afër teje, edhe pa sigurim.",
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
        description: "Spiegazioni semplici, segnali di allarme e miti chiariti.",
        cta: "Leggi le guide",
      },
      {
        title: "Capisci cosa fare",
        description: "Controlla i sintomi e vedi a chi rivolgerti.",
        cta: "Apri l'assistente",
      },
      {
        title: "Parla con un medico online",
        description: "Chiamata gratuita con un medico di guardia.",
        cta: "Vedi i medici",
      },
      {
        title: "Trova dove andare",
        description: "Ambulatori, ospedali e pronto soccorso vicino a te, anche senza tessera.",
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
        description: "Jednostavni odgovori, znakovi upozorenja i razjašnjeni mitovi.",
        cta: "Pročitaj vodiče",
      },
      {
        title: "Saznaj što možeš učiniti",
        description: "Provjeri simptome i vidi kamo dalje.",
        cta: "Otvori asistenta",
      },
      {
        title: "Razgovaraj s liječnikom online",
        description: "Besplatan telefonski poziv s dežurnim liječnikom.",
        cta: "Pogledaj liječnike",
      },
      {
        title: "Pronađi kamo otići",
        description: "Ambulante, bolnice i hitne službe u blizini, i bez osiguranja.",
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
        description: "Lokhe xaljarimata, znakoja vash dar thaj xoxamne vorbe hajarne.",
        cta: "Ginav sikavimata",
      },
      {
        title: "Dzan so shaj keres",
        description: "Kontrolir chire simptome thaj dikh kaj te djas.",
        cta: "Phuter o azhutitori",
      },
      {
        title: "Vorbin jekhe doktorestar online",
        description: "Bi lovengo akharimos pe telefono e doktoresa pe straza.",
        cta: "Dikh doktoren",
      },
      {
        title: "Arakh kaj te djas",
        description: "Klinike, bolnitse thaj sigardiari buchi pasha tute, vi bi siguripnasko.",
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
    <Section id="help-options" tone="paper" className="scroll-mt-20">
      <Container>
        <Reveal>
          <SectionHeading
            as="h2"
            align="left"
            title={copy.title}
            subtitle={copy.subtitle}
          />
        </Reveal>

        {/* The lead card arrives first, the three rows a beat after it, then the mediator band. */}
        <Reveal stagger="editorial" delay={0.06} className="mt-7 grid gap-5 lg:mt-10 lg:grid-cols-12 lg:gap-6">
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

              <span className="mt-7 inline-flex min-h-11 self-start items-center gap-2.5 whitespace-nowrap rounded-(--radius-control) bg-paper px-5 py-2.5 text-base font-semibold text-ink-950 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) group-hover:bg-white">
                <span className="link-draw">{lead.cta}</span>
                <ArrowRightIcon className="arrow-travel h-4 w-4 shrink-0" />
              </span>
            </Link>
          </div>

          <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-(--radius-surface) border border-border bg-card shadow-(--shadow-card-rest) lg:col-span-7 dark:divide-white/10 dark:border-white/10 dark:bg-ink-800">
            {rows.map(({ href, title, description, cta }) => (
              <li key={href} className="flex-1">
                <Link
                  href={withLangPrefix(href, lang)}
                  className="press-row group relative flex h-full min-h-19 flex-col justify-between gap-3.5 px-5 py-5 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-sapphire-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none sm:flex-row sm:items-center sm:gap-6 sm:px-6 lg:py-6 dark:hover:bg-ink-900 dark:focus-visible:ring-paper"
                >
                  {/* A sapphire rule at the row's leading edge opens from its middle on hover or focus. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-3 start-0 w-0.5 bg-sapphire transition-[clip-path] duration-(--dur-base) ease-(--ease-out-calm) [clip-path:inset(50%_0_50%_0)] group-hover:[clip-path:inset(0)] group-focus-visible:[clip-path:inset(0)] motion-reduce:transition-none dark:bg-sapphire-border"
                  />
                  <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
                    <IconTile icon={NAV_LINK_ICONS[href]} tone="sapphire-soft" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-balance text-title text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) group-hover:text-sapphire dark:text-paper dark:group-hover:text-paper">
                        <span className="min-w-0 wrap-break-word">{title}</span>
                      </h3>
                      <p className="mt-1 text-pretty text-body leading-relaxed text-muted-foreground dark:text-mist">
                        {description}
                      </p>
                    </div>
                  </div>

                  <span className="ml-15.5 inline-flex min-h-11 shrink-0 self-start items-center gap-1.5 whitespace-nowrap rounded-(--radius-control) bg-sapphire-soft px-3.5 py-2 text-base font-semibold text-sapphire transition-colors duration-(--dur-fast) ease-(--ease-out-calm) group-hover:text-sapphire-light sm:ml-0 sm:min-h-11 sm:self-center sm:bg-transparent sm:px-0 sm:py-0 dark:bg-white/10 dark:text-sapphire-border dark:group-hover:text-paper dark:sm:bg-transparent">
                    <span className="link-draw">{cta}</span>
                    <ArrowRightIcon className="arrow-travel h-4 w-4 shrink-0" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="mt-5" delay={0.18}>
          <HelpOptionsMediatorBand />
        </Reveal>
      </Container>
    </Section>
  );
}
