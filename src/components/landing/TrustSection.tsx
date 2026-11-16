"use client";

import { Container } from "@/components/ui/Container";
import { IconTile, type IconTileTone } from "@/components/ui/IconTile";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon, GlobeIcon, HandHelpingIcon, CheckCircleIcon, HeartIcon, LockIcon, MessageDotsIcon } from "@/components/ui/icons";
import type { NavIcon } from "@/components/layout/nav-links";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";

/** The promises, in order: free for everyone, data stays private, clear guidance. */
const PROMISE_ICONS = [HeartIcon, LockIcon, MessageDotsIcon];

type SourceId = "oms" | "redi";

type SourceOrPartner = {
  id: SourceId;
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
  ru: {
    title: "С кем мы работаем",
    subtitle:
      "Связываем вас с семейными врачами, больницами и медицинскими медиаторами. К каждому человеку относятся с уважением.",
    commitmentsTitle: "Что мы обещаем",
    newTab: "открывается в новой вкладке",
    sources: [
      {
        id: "oms",
        name: "Всемирная организация здравоохранения",
        role: "Мы опираемся на открытые рекомендации ВОЗ о здоровье и профилактике.",
        href: "https://www.who.int/health-topics/health-promotion",
        hrefLabel: "who.int",
      },
      {
        id: "redi",
        name: "REDI",
        role: "Европейский проект, который помогает людям проще попасть к врачу.",
      },
    ],
  },

  ro: {
    title: "Cu cine lucrăm",
    subtitle:
      "Te punem în legătură cu medici de familie, spitale și mediatori sanitari. Fiecare om e tratat cu respect.",
    commitmentsTitle: "Ce îți promitem",
    newTab: "se deschide într-o filă nouă",
    sources: [
      {
        id: "oms",
        name: "Organizația Mondială a Sănătății",
        role: "Folosim recomandările publice OMS pentru sănătate și prevenție.",
        href: "https://www.who.int/health-topics/health-promotion",
        hrefLabel: "who.int",
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
      "We connect you with family doctors, hospitals and health mediators. Everyone is treated with respect.",
    commitmentsTitle: "What we promise",
    newTab: "opens in a new tab",
    sources: [
      {
        id: "oms",
        name: "World Health Organization",
        role: "We use public WHO guidance on health and prevention.",
        href: "https://www.who.int/health-topics/health-promotion",
        hrefLabel: "who.int",
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
      "Të lidhim me mjekë familjeje, spitale dhe mediatorë shëndetësorë. Çdo njeri trajtohet me respekt.",
    commitmentsTitle: "Çfarë të premtojmë",
    newTab: "hapet në një skedë të re",
    sources: [
      {
        id: "oms",
        name: "Organizata Botërore e Shëndetësisë",
        role: "Mbështetemi në udhëzimet publike të OBSH-së për shëndetin dhe parandalimin.",
        href: "https://www.who.int/health-topics/health-promotion",
        hrefLabel: "who.int",
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
      "Ti mettiamo in contatto con medici di famiglia, ospedali e mediatori sanitari. Ogni persona è trattata con rispetto.",
    commitmentsTitle: "Cosa ti promettiamo",
    newTab: "si apre in una nuova scheda",
    sources: [
      {
        id: "oms",
        name: "Organizzazione Mondiale della Sanità",
        role: "Seguiamo le indicazioni pubbliche dell'OMS su salute e prevenzione.",
        href: "https://www.who.int/health-topics/health-promotion",
        hrefLabel: "who.int",
      },
      {
        id: "redi",
        name: "REDI",
        role: "Progetto europeo che ti aiuta ad andare dal medico più facilmente.",
      },
    ],
  },
  hr: {
    title: "S kim surađujemo",
    subtitle:
      "Povezujemo te s obiteljskim liječnicima, bolnicama i zdravstvenim medijatorima. Prema svakome se odnosimo s poštovanjem.",
    commitmentsTitle: "Što ti obećavamo",
    newTab: "otvara se u novoj kartici",
    sources: [
      {
        id: "oms",
        name: "Svjetska zdravstvena organizacija",
        role: "Pratimo javne smjernice SZO-a o zdravlju i prevenciji.",
        href: "https://www.who.int/health-topics/health-promotion",
        hrefLabel: "who.int",
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
      "Phandas tut familijake doktorensa, bolnitsensa thaj sastipnaske mediatorensa. Svako manush si dikhlo pakivasa.",
    commitmentsTitle: "So shinavas tuke",
    newTab: "phuterel pe ande jekh nevi rig",
    sources: [
      {
        id: "oms",
        name: "Lumjaki organizacia vash o sastipen",
        role: "Lijas le puterde sikavimata katar WHO vash o sastipen thaj o arakhimos.",
        href: "https://www.who.int/health-topics/health-promotion",
        hrefLabel: "who.int",
      },
      {
        id: "redi",
        name: "REDI",
        role: "Europako projekto so azhutinel le manushen te aresen maj lokhes ko doktori.",
      },
    ],
  },
};

// The health mediators have their own section on the homepage, so the ledger lists the partners only.
const SOURCE_TILES: Record<SourceId, { icon: NavIcon; tone: IconTileTone }> = {
  oms: { icon: GlobeIcon, tone: "sapphire-soft" },
  redi: { icon: HandHelpingIcon, tone: "sapphire-soft" },
};

/**
 * Who we work with (a 4/8 split: heading beside a ledger of partners, each with the same blue icon
 * tile) and what we promise (three commitments, the icon beside each title, under a heavy top rule), on the paper ground
 * with no emblems or seals. On phones the ledger is plain divided rows on the ground; from sm
 * it is one card. The heading blocks and each row settle in as they are scrolled to.
 */
export function TrustSection() {
  const { lang, t } = useLanguage();
  const copy = COPY[lang] ?? COPY.ro;

  return (
    <Section tone="paper">
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
              <ul className="divide-y divide-border border-y border-border sm:overflow-hidden sm:rounded-(--radius-surface) sm:border sm:bg-card sm:shadow-(--shadow-card-rest) dark:divide-white/10 dark:border-white/10 dark:sm:bg-ink-800">
                {copy.sources.map((item) => (
                  <li key={item.id} className="py-5 sm:p-6">
                    {/* Every row the same: blue tile, name, one line. A partner's website, where there is
                        one, is a plain link under that line rather than a button only one row has. */}
                    <div className="flex min-w-0 items-start gap-4">
                      <IconTile size={40} {...SOURCE_TILES[item.id]} />
                      <div className="min-w-0">
                        <h3 className="text-balance text-title">{item.name}</h3>
                        <p className="mt-1.5 max-w-(--measure-reading) text-pretty text-body text-muted-foreground dark:text-mist">
                          {item.role}
                        </p>
                        {item.href && (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group -my-2 -mx-2 inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-md px-2 text-body font-semibold text-sapphire transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none dark:text-sapphire-border dark:hover:bg-white/10 dark:focus-visible:ring-paper"
                          >
                            <span>{item.hrefLabel}</span>
                            <ArrowRightIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 -rotate-45" />
                            <span className="sr-only"> ({copy.newTab})</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-14 sm:mt-16">
            <h3 className="text-balance text-title font-bold">{copy.commitmentsTitle}</h3>
            {/* Three promises, not steps: an icon each, no numbers. */}
            <ul className="mt-6 grid gap-8 sm:grid-cols-3 lg:gap-10">
              {t.landing.trustSection.commitments.map(({ title, description }, index) => {
                const Icon = PROMISE_ICONS[index] ?? CheckCircleIcon;
                return (
                <li key={title}>
                  <span
                    aria-hidden="true"
                    className="block h-0.5 bg-foreground/80 dark:bg-paper/80"
                  />
                  <div className="pt-5">
                    {/* The icon sits beside the title, on its first line, not on a line of its own. */}
                    <p className="flex items-start gap-2.5 text-lead font-semibold tabular-nums">
                      <Icon aria-hidden="true" className="mt-[0.2em] h-5.5 w-5.5 shrink-0 text-sapphire dark:text-sapphire-border" />
                      <span className="min-w-0 text-balance">{title}</span>
                    </p>
                    <p className="mt-2 text-pretty text-body tabular-nums text-muted-foreground dark:text-mist">
                      {description}
                    </p>
                  </div>
                </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
