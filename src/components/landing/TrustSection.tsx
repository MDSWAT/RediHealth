"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRightIcon } from "@/components/ui/icons";
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
  /** Heading over the commitments manifesto, below the partner ledger. */
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
  hr: {
    title: "S kim surađujemo",
    subtitle:
      "RediHealth te povezuje s obiteljskim liječnicima, bolnicama i zdravstvenim medijatorima. Prema svakoj se osobi postupa s poštovanjem.",
    commitmentsTitle: "Što ti obećavamo",
    newTab: "otvara se u novoj kartici",
    sources: [
      {
        id: "oms",
        name: "Svjetska zdravstvena organizacija",
        role: "Naše informacije prate javne smjernice SZO-a o zdravlju i prevenciji.",
        href: "https://www.who.int/health-topics/health-promotion",
        hrefLabel: "who.int",
      },
      {
        id: "mediatori",
        name: "Zdravstveni medijatori u zajednici",
        role: "Surađujemo sa zdravstvenim medijatorima u ruralnim i ranjivim zajednicama.",
      },
      {
        id: "redi",
        name: "REDI",
        role: "Europski projekt koji ti pomaže lakše doći do liječnika.",
      },
    ],
  },
  rom: {
    title: "Kasa keras buchi",
    subtitle:
      "RediHealth phandel tut familijake doktorensa, bolnitsensa thaj sastipnaske mediatorensa. Svako manush si dikhlo pakivasa.",
    commitmentsTitle: "So shinavas tuke",
    newTab: "phuterel pe ande jekh nevi rig",
    sources: [
      {
        id: "oms",
        name: "Lumjaki organizacia vash o sastipen",
        role: "Amari informacia djal pala le puterde sikavimata katar WHO vash o sastipen thaj o arakhimos.",
        href: "https://www.who.int/health-topics/health-promotion",
        hrefLabel: "who.int",
      },
      {
        id: "mediatori",
        name: "Sastipnaske mediatorura and-i komuniteta",
        role: "Keras buchi sastipnaske mediatorensa and-e gavutne thaj kovle komunitete.",
      },
      {
        id: "redi",
        name: "REDI",
        role: "Europako projekto so azhutinel le manushen te aresen maj lokhes ko doktori.",
      },
    ],
  },
};

/**
 * Who we work with (asymmetric 4/8 partner ledger) and what we promise
 * (numbered 01-03 heavy-ruled manifesto), set on a warm subtle ground with
 * zero unlicensed emblems or seals.
 */
export function TrustSection() {
  const { lang, t } = useLanguage();
  const copy = COPY[lang] ?? COPY.ro;

  return (
    <section className="bg-surface-subtle/55 py-16 sm:py-24">
      <Container>
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
            <div className="lg:col-span-4">
              <SectionHeading
                as="h2"
                align="left"
                title={copy.title}
                subtitle={copy.subtitle}
              />
            </div>

            <div className="lg:col-span-8">
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-(--shadow-card-rest)">
                {copy.sources.map((item, idx) => (
                  <li
                    key={item.id}
                    className="flex flex-col gap-3 p-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:p-7"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span
                          aria-hidden="true"
                          className="font-mono text-xs font-medium tabular-nums text-muted-foreground/80"
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <h3 className="text-balance text-lg font-semibold leading-snug tracking-[-0.01em] text-foreground">
                          {item.name}
                        </h3>
                      </div>
                      <p className="mt-2 max-w-[58ch] text-pretty text-[15px] leading-relaxed text-muted-foreground">
                        {item.role}
                      </p>
                    </div>

                    {item.href && (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex min-h-11 shrink-0 items-center gap-1.5 self-start rounded-lg border border-border bg-surface-subtle/60 px-3 text-sm font-semibold text-sapphire transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:border-sapphire/35 hover:bg-sapphire-soft/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                      >
                        <span>{item.hrefLabel}</span>
                        <ArrowRightIcon className="h-3.5 w-3.5 -rotate-45 transition-transform duration-(--dur-fast) ease-(--ease-out-calm) group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
                        <span className="sr-only"> ({copy.newTab})</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-14 sm:mt-16">
            <h3 className="text-xl font-semibold tracking-[-0.02em] text-foreground sm:text-2xl">
              {copy.commitmentsTitle}
            </h3>
            <ol className="mt-6 grid gap-8 sm:grid-cols-3">
              {t.landing.trustSection.commitments.map(({ title, description }, index) => (
                <li
                  key={title}
                  className="border-t-2 border-foreground/80 pt-5"
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-xs font-semibold tabular-nums text-sapphire"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-2.5 text-lg font-semibold leading-snug tracking-[-0.015em] text-foreground">
                    {title}
                  </p>
                  <p className="mt-2 text-pretty text-[15px] leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
