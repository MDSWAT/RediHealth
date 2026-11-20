"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  GlobeIcon,
  HandHelpingIcon,
  HeartIcon,
  LockIcon,
  MessageDotsIcon,
} from "@/components/ui/icons";
import type { NavIcon } from "@/components/layout/nav-links";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import { useIsPhone } from "@/lib/use-is-phone";

/** The promises, in order: free for everyone, data stays private, clear guidance. */
const PROMISE_ICONS = [HeartIcon, LockIcon, MessageDotsIcon];

const COMMITMENT_ACCENTS = [
  {
    rule: "bg-ink-950 dark:bg-paper",
    plate: "border border-border bg-surface-subtle text-foreground dark:border-white/12 dark:bg-white/[0.06] dark:text-paper",
  },
  {
    rule: "bg-wellness dark:bg-wellness-border",
    plate: "border border-border bg-surface-subtle text-foreground dark:border-white/12 dark:bg-white/[0.06] dark:text-paper",
  },
  {
    rule: "bg-amber-care dark:bg-amber-care-border",
    plate: "border border-border bg-surface-subtle text-foreground dark:border-white/12 dark:bg-white/[0.06] dark:text-paper",
  },
] as const;

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

const SOURCE_TILES: Record<SourceId, { icon: NavIcon; plate: string; rule: string }> = {
  oms: {
    icon: GlobeIcon,
    plate: "bg-sapphire-soft text-sapphire dark:bg-white/10 dark:text-sapphire-border",
    rule: "bg-sapphire dark:bg-sapphire-border",
  },
  redi: {
    icon: HandHelpingIcon,
    plate: "bg-amber-care-soft text-amber-care dark:bg-amber-care/20 dark:text-amber-care-border",
    rule: "bg-amber-care dark:bg-amber-care-border",
  },
};

/**
 * Who we work with (editorial partner cards) and what we promise (framed commitment showcase
 * using sapphire, wellness teal, and amber-care semantic accents) on the paper ground.
 */
export function TrustSection() {
  const { lang, t } = useLanguage();
  const copy = COPY[lang] ?? COPY.ro;
  const isPhone = useIsPhone();
  const [openPartner, setOpenPartner] = useState<string | null>(null);
  const [openCommitment, setOpenCommitment] = useState<number | null>(null);

  return (
    <Section tone="paper">
      <Container>
        <Reveal>
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
            <div className="lg:col-span-5">
              <span aria-hidden="true" className="rule-draw mb-3.5 block h-0.5 w-10 bg-sapphire dark:bg-sapphire-border sm:mb-4" />
              <SectionHeading
                as="h2"
                align="left"
                title={copy.title}
                subtitle={copy.subtitle}
              />
            </div>

            <div className="lg:col-span-7">
              <Reveal as="ul" stagger="editorial" className="grid gap-2.5 sm:grid-cols-2 sm:gap-4 lg:gap-5">
                {copy.sources.map((item) => {
                  const tile = SOURCE_TILES[item.id];
                  const PartnerIcon = tile.icon;
                  const expanded = !isPhone || openPartner === item.id;
                  return (
                    <li
                      key={item.id}
                      className="card-interactive flex flex-col justify-between rounded-2xl border border-border bg-card p-4 sm:p-6 dark:border-white/10 dark:bg-ink-900 dark:hover:border-white/25"
                    >
                      <div>
                        {/* Phone: compact tappable info header */}
                        <button
                          type="button"
                          aria-expanded={expanded}
                          onClick={() => setOpenPartner((prev) => (prev === item.id ? null : item.id))}
                          className="flex min-h-11 w-full items-center gap-3 text-left sm:hidden"
                        >
                          <span
                            aria-hidden="true"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-subtle text-foreground dark:border-white/12 dark:bg-white/[0.06] dark:text-paper"
                          >
                            <PartnerIcon className="h-4.5 w-4.5" />
                          </span>
                          <span className="min-w-0 flex-1 text-body font-semibold text-foreground dark:text-paper">
                            {item.name}
                          </span>
                          <ChevronDownIcon
                            className={cn(
                              "h-4.5 w-4.5 shrink-0 text-muted-foreground transition-transform duration-(--dur-fast)",
                              expanded && "rotate-180",
                            )}
                            aria-hidden="true"
                          />
                        </button>

                        {/* Desktop: editorial header */}
                        <div className="hidden items-center justify-between gap-3 sm:flex">
                          <span
                            aria-hidden="true"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-subtle text-foreground dark:border-white/12 dark:bg-white/[0.06] dark:text-paper"
                          >
                            <PartnerIcon className="h-5 w-5" />
                          </span>
                          <span aria-hidden="true" className={cn("rule-draw block h-0.5 w-8", tile.rule)} />
                        </div>

                        <h3 className="mt-5 hidden text-balance text-title font-semibold text-foreground sm:block dark:text-paper">
                          {item.name}
                        </h3>

                        <div
                          className={cn(
                            "grid transition-[grid-template-rows,opacity] duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
                            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                          )}
                        >
                          <div className="overflow-hidden">
                            <p className="mt-2.5 max-w-(--measure-reading) text-pretty text-body leading-relaxed text-muted-foreground sm:mt-2 dark:text-mist">
                              {item.role}
                            </p>

                            {item.href ? (
                              <div className="mt-3.5 border-t border-border/70 pt-2.5 sm:mt-5 sm:pt-3 dark:border-white/10">
                                <a
                                  href={item.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group -mx-2 -my-1 inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-body font-semibold text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none dark:text-paper dark:hover:bg-white/10 dark:focus-visible:ring-paper"
                                >
                                  <span className="link-draw">{item.hrefLabel}</span>
                                  <ArrowRightIcon
                                    aria-hidden="true"
                                    className="h-3.5 w-3.5 shrink-0 -rotate-45 transition-transform duration-(--dur-fast) ease-(--ease-out-calm) group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                                  />
                                  <span className="sr-only"> ({copy.newTab})</span>
                                </a>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </Reveal>
            </div>
          </div>

          <div className="mt-10 border-t border-border/80 pt-8 sm:mt-16 sm:pt-12 dark:border-white/10">
            <h3 className="text-balance text-title font-semibold text-foreground dark:text-paper">
              {copy.commitmentsTitle}
            </h3>

            <Reveal as="ul" stagger="editorial" className="mt-4 grid gap-2.5 sm:mt-6 sm:grid-cols-3 sm:gap-4 lg:gap-6">
              {t.landing.trustSection.commitments.map(({ title, description }, index) => {
                const Icon = PROMISE_ICONS[index] ?? CheckCircleIcon;
                const accent = COMMITMENT_ACCENTS[index % COMMITMENT_ACCENTS.length];
                const expanded = !isPhone || openCommitment === index;
                return (
                  <li
                    key={title}
                    className="card-interactive flex flex-col rounded-2xl border border-border bg-card p-4 sm:p-6 dark:border-white/10 dark:bg-ink-900 dark:hover:border-white/25"
                  >
                    {/* Phone: compact tappable info box */}
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setOpenCommitment((prev) => (prev === index ? null : index))}
                      className="flex min-h-11 w-full items-center gap-3 text-left sm:hidden"
                    >
                      <span
                        aria-hidden="true"
                        className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", accent.plate)}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <span className="min-w-0 flex-1 text-body font-semibold text-foreground dark:text-paper">
                        {title}
                      </span>
                      <ChevronDownIcon
                        className={cn(
                          "h-4.5 w-4.5 shrink-0 text-muted-foreground transition-transform duration-(--dur-fast)",
                          expanded && "rotate-180",
                        )}
                        aria-hidden="true"
                      />
                    </button>

                    {/* Desktop: architectural card header */}
                    <div className="hidden items-center justify-between gap-3 sm:flex">
                      <span
                        aria-hidden="true"
                        className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", accent.plate)}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span aria-hidden="true" className={cn("rule-draw block h-0.5 w-8", accent.rule)} />
                    </div>

                    <p className="mt-5 hidden text-balance text-title font-semibold text-foreground sm:block dark:text-paper">
                      {title}
                    </p>

                    <div
                      className={cn(
                        "grid transition-[grid-template-rows,opacity] duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
                        expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="mt-2.5 text-pretty text-body leading-relaxed text-muted-foreground sm:mt-2 dark:text-mist">
                          {description}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </Reveal>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
