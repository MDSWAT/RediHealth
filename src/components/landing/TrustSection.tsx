"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";

type SourceOrPartner = {
  id: string;
  name: string;
  role: string;
  /** Public page for the source, opened in a new tab. */
  href?: string;
  hrefLabel?: string;
};

type TrustCopy = {
  title: string;
  subtitle: string;
  /** Heading over the four commitments, below the sources. */
  commitmentsTitle: string;
  /** Screen-reader hint on links that open in a new tab. */
  newTab: string;
  sources: SourceOrPartner[];
};

// Wording is limited to what is true without written permission: no emblems, no accreditation claims.
const COPY: Record<Lang, TrustCopy> = {
  ro: {
    title: "Cu cine lucrăm",
    subtitle:
      "RediHealth te pune în legătură cu medici de familie, spitale și mediatori sanitari. Fiecare om e tratat cu respect.",
    commitmentsTitle: "Ce îți promitem",
    newTab: "se deschide într-o filă nouă",
    sources: [
      {
        id: "oms",
        name: "Organizația Mondială a Sănătății",
        role: "Informațiile noastre urmează ghidurile publice ale OMS despre sănătate și prevenție.",
        href: "https://www.who.int/health-topics/health-promotion",
        hrefLabel: "who.int",
      },
      {
        id: "mediatori",
        name: "Mediatori sanitari comunitari",
        role: "Lucrăm cu mediatori sanitari din comunitățile rurale și vulnerabile.",
      },
      {
        id: "redi",
        name: "REDI",
        role: "Proiect european care te ajută să ajungi mai ușor la medic.",
      },
    ],
  },
  en: {
    title: "Who we work with",
    subtitle:
      "RediHealth puts you in touch with family doctors, hospitals and health mediators. Everyone is treated with respect.",
    commitmentsTitle: "What we promise",
    newTab: "opens in a new tab",
    sources: [
      {
        id: "oms",
        name: "World Health Organization",
        role: "Our information follows public WHO guidance on health and prevention.",
        href: "https://www.who.int/health-topics/health-promotion",
        hrefLabel: "who.int",
      },
      {
        id: "mediatori",
        name: "Community health mediators",
        role: "We work with health mediators in rural and vulnerable communities.",
      },
      {
        id: "redi",
        name: "REDI",
        role: "A European project that helps people reach a doctor more easily.",
      },
    ],
  },
  sq: {
    title: "Me kë punojmë",
    subtitle:
      "RediHealth të lidh me mjekë familjeje, spitale dhe mediatorë shëndetësorë. Çdo njeri trajtohet me respekt.",
    commitmentsTitle: "Çfarë të premtojmë",
    newTab: "hapet në një skedë të re",
    sources: [
      {
        id: "oms",
        name: "Organizata Botërore e Shëndetësisë",
        role: "Informacioni ynë ndjek udhëzimet publike të OBSH-së për shëndetin dhe parandalimin.",
        href: "https://www.who.int/health-topics/health-promotion",
        hrefLabel: "who.int",
      },
      {
        id: "mediatori",
        name: "Mediatorë shëndetësorë komunitarë",
        role: "Punojmë me mediatorë shëndetësorë në komunitetet rurale dhe të cenueshme.",
      },
      {
        id: "redi",
        name: "REDI",
        role: "Projekt evropian që të ndihmon të arrish më lehtë te mjeku.",
      },
    ],
  },
  it: {
    title: "Con chi lavoriamo",
    subtitle:
      "RediHealth ti mette in contatto con medici di famiglia, ospedali e mediatori sanitari. Ogni persona è trattata con rispetto.",
    commitmentsTitle: "Cosa ti promettiamo",
    newTab: "si apre in una nuova scheda",
    sources: [
      {
        id: "oms",
        name: "Organizzazione Mondiale della Sanità",
        role: "Le nostre informazioni seguono le linee guida pubbliche dell'OMS su salute e prevenzione.",
        href: "https://www.who.int/health-topics/health-promotion",
        hrefLabel: "who.int",
      },
      {
        id: "mediatori",
        name: "Mediatori sanitari di comunità",
        role: "Lavoriamo con mediatori sanitari nelle comunità rurali e vulnerabili.",
      },
      {
        id: "redi",
        name: "REDI",
        role: "Progetto europeo che ti aiuta a raggiungere un medico più facilmente.",
      },
    ],
  },
};

/**
 * Who we work with, then what we promise, set as plain type: hairline rules,
 * no icons, no labels above names, no emblems or seals (none are licensed).
 */
export function TrustSection() {
  const { lang, t } = useLanguage();
  const copy = COPY[lang] ?? COPY.ro;

  return (
    <section className="bg-background py-16 sm:py-20">
      <Container>
        <SectionHeading as="h2" align="center" title={copy.title} subtitle={copy.subtitle} className="mx-auto" />

        <ul className="mt-12 grid gap-x-8 sm:grid-cols-3">
          {copy.sources.map((item) => (
            <li key={item.id} className="flex flex-col border-t border-border pt-5 pb-7 sm:pb-0">
              <h3 className="text-base font-semibold leading-snug text-foreground text-balance">{item.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.role}</p>
              {item.href && (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex min-h-11 items-center self-start rounded text-sm font-medium text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.hrefLabel}
                  <span className="sr-only"> ({copy.newTab})</span>
                </a>
              )}
            </li>
          ))}
        </ul>

        <h3 className="mt-6 text-lg font-semibold text-foreground sm:mt-14">{copy.commitmentsTitle}</h3>
        <ul className="mt-5 grid gap-x-8 sm:grid-cols-3">
          {t.landing.trustSection.commitments.map(({ title, description }) => (
            <li key={title} className="border-t border-border pt-4 pb-6 sm:pb-0">
              <p className="text-base font-semibold leading-snug text-foreground">{title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
