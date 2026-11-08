"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HeartIcon, LockIcon, ShieldIcon, StethoscopeIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";

type SourceOrPartner = {
  id: string;
  name: string;
  role: string;
  /** What the entry is: a source, a partner, an initiative, a policy. */
  kind: string;
  /** Public page for the source, opened in a new tab. */
  href?: string;
  hrefLabel?: string;
};

type TrustCopy = {
  title: string;
  subtitle: string;
  sourcesTitle: string;
  /** Screen-reader hint on links that open in a new tab. */
  newTab: string;
  sources: SourceOrPartner[];
};

const commitmentIcons = [HeartIcon, LockIcon, ShieldIcon, StethoscopeIcon];

// Wording is limited to what is true without written permission: no emblems, no accreditation claims.
const COPY: Record<Lang, TrustCopy> = {
  ro: {
    title: "Cu cine lucrăm",
    subtitle:
      "RediHealth te pune în legătură cu medici de familie, spitale și mediatori sanitari. Fiecare om e tratat cu respect.",
    sourcesTitle: "Surse și parteneri",
    newTab: "se deschide într-o filă nouă",
    sources: [
      {
        id: "oms",
        kind: "Sursă",
        name: "Organizația Mondială a Sănătății",
        role: "Informațiile noastre urmează ghidurile publice ale OMS despre sănătate și prevenție.",
        href: "https://www.who.int/health-topics/health-promotion",
        hrefLabel: "who.int",
      },
      {
        id: "mediatori",
        kind: "Partener",
        name: "Mediatori sanitari comunitari",
        role: "Lucrăm cu mediatori sanitari din comunitățile rurale și vulnerabile.",
      },
      {
        id: "redi",
        kind: "Inițiativă",
        name: "REDI",
        role: "Proiect european care te ajută să ajungi mai ușor la medic.",
      },
      {
        id: "gdpr",
        kind: "Confidențialitate",
        name: "Protecția datelor (GDPR)",
        role: "Datele tale de sănătate sunt protejate și criptate pe dispozitiv.",
      },
    ],
  },
  en: {
    title: "Who we work with",
    subtitle:
      "RediHealth puts you in touch with family doctors, hospitals and health mediators. Everyone is treated with respect.",
    sourcesTitle: "Sources and partners",
    newTab: "opens in a new tab",
    sources: [
      {
        id: "oms",
        kind: "Source",
        name: "World Health Organization",
        role: "Our information follows public WHO guidance on health and prevention.",
        href: "https://www.who.int/health-topics/health-promotion",
        hrefLabel: "who.int",
      },
      {
        id: "mediatori",
        kind: "Partner",
        name: "Community health mediators",
        role: "We work with health mediators in rural and vulnerable communities.",
      },
      {
        id: "redi",
        kind: "Initiative",
        name: "REDI",
        role: "A European project that helps people reach a doctor more easily.",
      },
      {
        id: "gdpr",
        kind: "Privacy",
        name: "Data protection (GDPR)",
        role: "Your health data is protected and encrypted on the device.",
      },
    ],
  },
  sq: {
    title: "Me kë punojmë",
    subtitle:
      "RediHealth të lidh me mjekë familjeje, spitale dhe ndërmjetës shëndetësorë. Çdo njeri trajtohet me respekt.",
    sourcesTitle: "Burime dhe partnerë",
    newTab: "hapet në një skedë të re",
    sources: [
      {
        id: "oms",
        kind: "Burim",
        name: "Organizata Botërore e Shëndetësisë",
        role: "Informacioni ynë ndjek udhëzimet publike të OBSH-së për shëndetin dhe parandalimin.",
        href: "https://www.who.int/health-topics/health-promotion",
        hrefLabel: "who.int",
      },
      {
        id: "mediatori",
        kind: "Partner",
        name: "Ndërmjetës shëndetësorë komunitarë",
        role: "Punojmë me ndërmjetës shëndetësorë në komunitetet rurale dhe të cenueshme.",
      },
      {
        id: "redi",
        kind: "Iniciativë",
        name: "REDI",
        role: "Projekt evropian që të ndihmon të arrish më lehtë te mjeku.",
      },
      {
        id: "gdpr",
        kind: "Privatësia",
        name: "Mbrojtja e të dhënave (GDPR)",
        role: "Të dhënat e tua shëndetësore janë të mbrojtura dhe të enkriptuara në pajisje.",
      },
    ],
  },
  it: {
    title: "Con chi lavoriamo",
    subtitle:
      "RediHealth ti mette in contatto con medici di famiglia, ospedali e mediatori sanitari. Ogni persona è trattata con rispetto.",
    sourcesTitle: "Fonti e partner",
    newTab: "si apre in una nuova scheda",
    sources: [
      {
        id: "oms",
        kind: "Fonte",
        name: "Organizzazione Mondiale della Sanità",
        role: "Le nostre informazioni seguono le linee guida pubbliche dell'OMS su salute e prevenzione.",
        href: "https://www.who.int/health-topics/health-promotion",
        hrefLabel: "who.int",
      },
      {
        id: "mediatori",
        kind: "Partner",
        name: "Mediatori sanitari di comunità",
        role: "Lavoriamo con mediatori sanitari nelle comunità rurali e vulnerabili.",
      },
      {
        id: "redi",
        kind: "Iniziativa",
        name: "REDI",
        role: "Progetto europeo che ti aiuta a raggiungere un medico più facilmente.",
      },
      {
        id: "gdpr",
        kind: "Riservatezza",
        name: "Protezione dei dati (GDPR)",
        role: "I tuoi dati sanitari sono protetti e cifrati sul dispositivo.",
      },
    ],
  },
};

/**
 * Trust: four commitments and the sources behind the content, set as plain
 * type. No eyebrow, no card grid, no emblems or seals (none are licensed).
 */
export function TrustSection() {
  const { lang, t } = useLanguage();
  const copy = COPY[lang] ?? COPY.ro;

  return (
    <section className="border-t border-border bg-background py-16 sm:py-20">
      <Container>
        <SectionHeading as="h2" align="center" title={copy.title} subtitle={copy.subtitle} className="mx-auto" />

        <ul className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {t.landing.trustSection.commitments.map(({ title, description }, index) => {
            const Icon = commitmentIcons[index] ?? ShieldIcon;
            return (
              <li key={title} className="flex gap-3.5 lg:block">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-sapphire lg:mt-0 lg:h-6 lg:w-6" />
                <div>
                  <h3 className="text-base font-semibold leading-snug text-foreground lg:mt-3">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Sources and partners: plain type, no emblems or seals (none are licensed for use). */}
        <div className="mt-14 border-t border-border pt-8">
          <h3 className="text-lg font-semibold text-foreground">{copy.sourcesTitle}</h3>
          <ul className="mt-6 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {copy.sources.map((item) => (
              <li key={item.id} className="flex flex-col">
                <p className="text-sm text-muted-foreground">{item.kind}</p>
                <p className="mt-1 text-base font-semibold leading-snug text-foreground text-balance">{item.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.role}</p>
                {item.href && (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex min-h-11 items-center gap-1 self-start rounded text-sm font-medium text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.hrefLabel}
                    <span className="sr-only"> ({copy.newTab})</span>
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5.5 4.5h6v6M11.5 4.5l-7 7" />
                    </svg>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
