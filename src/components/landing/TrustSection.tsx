"use client";

import { useId, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
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
  { rule: "bg-sapphire dark:bg-sapphire-border" },
  { rule: "bg-wellness dark:bg-wellness-border" },
  { rule: "bg-amber-care dark:bg-amber-care-border" },
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

const SOURCE_TILES: Record<SourceId, { icon: NavIcon; rule: string }> = {
  oms: { icon: GlobeIcon, rule: "bg-sapphire dark:bg-sapphire-border" },
  redi: { icon: HandHelpingIcon, rule: "bg-amber-care dark:bg-amber-care-border" },
};

/**
 * Who we work with and what we promise unified inside one modernist hairline sheet on the
 * paper ground: an aligned 3-column architectural ledger (intro | WHO | REDI above three
 * commitments under a hairline strip), collapsing cleanly into compact rows on phones.
 */
export function TrustSection() {
  const { lang, t } = useLanguage();
  const copy = COPY[lang] ?? COPY.ro;
  const isPhone = useIsPhone();
  const [openPartner, setOpenPartner] = useState<string | null>(null);
  const [openCommitment, setOpenCommitment] = useState<number | null>(null);
  const baseId = useId();

  return (
    <Section tone="paper" aria-labelledby="home-trust-title" className="py-10! sm:py-14! lg:py-16!">
      <Container>
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-border bg-card dark:border-white/10 dark:bg-ink-900">
            <div className="grid lg:grid-cols-3">
              <div className="border-b border-border/80 p-5 sm:p-6 lg:border-r lg:border-b-0 lg:p-7 dark:border-white/10">
                <span aria-hidden="true" className="rule-draw mb-3.5 block h-0.5 w-8 bg-sapphire dark:bg-sapphire-border" />
                <h2 id="home-trust-title" className="text-balance text-section text-foreground [overflow-wrap:break-word] dark:text-paper">
                  {copy.title}
                </h2>
                <p className="mt-2.5 text-pretty text-body leading-relaxed text-muted-foreground dark:text-mist">
                  {copy.subtitle}
                </p>
              </div>

              <Reveal
                as="ul"
                stagger="editorial"
                className="grid divide-y divide-border/80 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:col-span-2 dark:divide-white/10"
              >
                {copy.sources.map((item) => {
                  const tile = SOURCE_TILES[item.id];
                  const PartnerIcon = tile.icon;
                  const expanded = !isPhone || openPartner === item.id;
                  const panelId = `${baseId}-partner-${item.id}`;

                  return (
                    <li
                      key={item.id}
                      className="flex min-w-0 flex-col px-5 py-1 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-surface-subtle/45 sm:p-6 lg:p-7 dark:hover:bg-white/[0.025] motion-reduce:transition-none"
                    >
                      {/* Phone: compact hairline accordion header */}
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={panelId}
                        onClick={() => setOpenPartner((prev) => (prev === item.id ? null : item.id))}
                        className="flex min-h-12 w-full items-center gap-3 rounded-lg py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hidden dark:focus-visible:ring-paper"
                      >
                        <PartnerIcon
                          aria-hidden="true"
                          className="h-4.5 w-4.5 shrink-0 text-muted-foreground dark:text-mist"
                        />
                        <span className="min-w-0 flex-1 text-body font-semibold text-foreground dark:text-paper">
                          {item.name}
                        </span>
                        <ChevronDownIcon
                          className={cn(
                            "h-4.5 w-4.5 shrink-0 text-muted-foreground transition-transform duration-(--dur-fast) dark:text-mist",
                            expanded && "rotate-180",
                          )}
                          aria-hidden="true"
                        />
                      </button>

                      {/* Desktop: hairline accent rule and quiet stroke icon */}
                      <div className="hidden items-center justify-between sm:flex">
                        <span aria-hidden="true" className={cn("rule-draw h-0.5 w-6", tile.rule)} />
                        <PartnerIcon
                          aria-hidden="true"
                          className="h-4.5 w-4.5 shrink-0 text-muted-foreground/75 dark:text-mist/75"
                        />
                      </div>

                      <h3 className="mt-4 hidden text-balance text-title font-semibold text-foreground [overflow-wrap:break-word] sm:block dark:text-paper">
                        {item.name}
                      </h3>

                      <div
                        id={panelId}
                        inert={!expanded}
                        className={cn(
                          "grid transition-[grid-template-rows,opacity] duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
                          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <div className="overflow-hidden">
                          <p className="pb-3.5 pl-7.5 text-pretty text-body leading-relaxed text-muted-foreground sm:mt-2 sm:pb-0 sm:pl-0 dark:text-mist">
                            {item.role}
                          </p>

                          {item.href ? (
                            <div className="pb-2 pl-7.5 sm:mt-2.5 sm:pb-0 sm:pl-0">
                              <a
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group -mx-2 inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-body font-semibold text-sapphire transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-sapphire-soft/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none dark:text-paper dark:hover:bg-white/10 dark:focus-visible:ring-paper"
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
                    </li>
                  );
                })}
              </Reveal>
            </div>

            <div className="border-t border-border/80 dark:border-white/10">
              <div className="border-b border-border/80 bg-surface-subtle/50 px-5 py-2.5 sm:px-6 lg:px-7 dark:border-white/10 dark:bg-white/[0.025]">
                <h3 className="text-meta font-semibold text-muted-foreground dark:text-mist">
                  {copy.commitmentsTitle}
                </h3>
              </div>

              <Reveal as="ul" stagger="editorial" className="grid divide-y divide-border/80 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-white/10">
                {t.landing.trustSection.commitments.map(({ title, description }, index) => {
                  const Icon = PROMISE_ICONS[index] ?? CheckCircleIcon;
                  const accent = COMMITMENT_ACCENTS[index % COMMITMENT_ACCENTS.length];
                  const expanded = !isPhone || openCommitment === index;
                  const panelId = `${baseId}-commitment-${index}`;

                  return (
                    <li
                      key={title}
                      className="flex min-w-0 flex-col px-5 py-1 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-surface-subtle/45 sm:p-6 lg:p-7 dark:hover:bg-white/[0.025] motion-reduce:transition-none"
                    >
                      {/* Phone: compact hairline accordion row */}
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={panelId}
                        onClick={() => setOpenCommitment((prev) => (prev === index ? null : index))}
                        className="flex min-h-12 w-full items-center gap-3 rounded-lg py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hidden dark:focus-visible:ring-paper"
                      >
                        <Icon
                          aria-hidden="true"
                          className="h-4.5 w-4.5 shrink-0 text-muted-foreground dark:text-mist"
                        />
                        <span className="min-w-0 flex-1 text-body font-semibold text-foreground dark:text-paper">
                          {title}
                        </span>
                        <ChevronDownIcon
                          className={cn(
                            "h-4.5 w-4.5 shrink-0 text-muted-foreground transition-transform duration-(--dur-fast) dark:text-mist",
                            expanded && "rotate-180",
                          )}
                          aria-hidden="true"
                        />
                      </button>

                      {/* Desktop: hairline accent rule and quiet stroke icon */}
                      <div className="hidden items-center justify-between sm:flex">
                        <span aria-hidden="true" className={cn("rule-draw h-0.5 w-6", accent.rule)} />
                        <Icon
                          aria-hidden="true"
                          className="h-4.5 w-4.5 shrink-0 text-muted-foreground/75 dark:text-mist/75"
                        />
                      </div>

                      <h4 className="mt-4 hidden text-balance text-title font-semibold text-foreground [overflow-wrap:break-word] sm:block dark:text-paper">
                        {title}
                      </h4>

                      <div
                        id={panelId}
                        inert={!expanded}
                        className={cn(
                          "grid transition-[grid-template-rows,opacity] duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
                          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <div className="overflow-hidden">
                          <p className="pb-4 pl-7.5 text-pretty text-body leading-relaxed text-muted-foreground sm:mt-2 sm:pb-0 sm:pl-0 dark:text-mist">
                            {description}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </Reveal>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
