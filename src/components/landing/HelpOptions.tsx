"use client";

import Link from "next/link";
import { useEffect, useRef, type ComponentType, type PointerEvent as ReactPointerEvent, type SVGProps } from "react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRightIcon, BookIcon, ClipboardCheckIcon, PinIcon, StethoscopeIcon } from "@/components/ui/icons";
import { HelpOptionsMediatorBand } from "@/components/landing/HelpOptionsMediatorBand";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { useCalmReducedMotion } from "@/lib/motion/tokens";

type HelpOption = { title: string; description: string; cta: string };

type HelpOptionsCopy = {
  title: string;
  subtitle: string;
  options: [HelpOption, HelpOption, HelpOption, HelpOption];
};

const OPTION_LINKS: { href: string; spanClass: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { href: "/health-information", spanClass: "lg:col-span-7", Icon: BookIcon },
  { href: "/health-assistant", spanClass: "lg:col-span-5", Icon: ClipboardCheckIcon },
  { href: "/medic-online", spanClass: "lg:col-span-5", Icon: StethoscopeIcon },
  { href: "/find-help", spanClass: "lg:col-span-7", Icon: PinIcon },
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
        description: "Sfat gratuit de la medicul de gardă, printr-un apel.",
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
        description: "Free advice from the on-call doctor, over a call.",
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
        description: "Këshillë falas nga mjeku kujdestar, me një thirrje.",
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
        description: "Consigli gratuiti dal medico di guardia, con una chiamata.",
        cta: "Vedi i medici di guardia",
      },
      {
        title: "Trova dove andare",
        description: "Una mappa di ambulatori, ospedali e servizi di emergenza della tua provincia. Puoi andarci anche senza tessera sanitaria.",
        cta: "Apri la mappa",
      },
    ],
  },
  hr: {
    title: "Kako ti možemo pomoći?",
    subtitle: "Odaberi ono što trebaš, za sebe ili za svoju obitelj. Sve je besplatno, a tvoji podaci ostaju privatni.",
    options: [
      {
        title: "Zdravstveni vodiči",
        description: "Jednostavni vodiči, znakovi uzbune koje trebaš znati i česti mitovi provjereni dokazima.",
        cta: "Pročitaj vodiče",
      },
      {
        title: "Saznaj što možeš učiniti",
        description: "Asistent ti pomaže razumjeti simptome i sljedeći korak u najviše 3 koraka.",
        cta: "Otvori asistenta",
      },
      {
        title: "Razgovaraj s liječnikom online",
        description: "Besplatan savjet dežurnog liječnika putem poziva.",
        cta: "Pogledaj dežurne liječnike",
      },
      {
        title: "Pronađi kamo otići",
        description: "Karta ambulanti, bolnica i hitnih službi u tvojoj blizini. Možeš otići i bez zdravstvene iskaznice.",
        cta: "Otvori kartu",
      },
    ],
  },
  rom: {
    title: "Sar shaj azhutinas tut?",
    subtitle: "Alosar so trebul tuke, vash tute vaj vash chiri familija. Sa si bi lovengo, thaj chire date achon garavde.",
    options: [
      {
        title: "Sastipnaske sikavimata",
        description: "Lokhe sikavimata, znakoja vash dar so trebul te dzanes thaj xoxamne vorbe kontrolirime.",
        cta: "Ginav le sikavimata",
      },
      {
        title: "Dzan so shaj keres",
        description: "O azhutitori azhutinel tut te haljares chire simptome thaj so te keres maj dur, ande 3 pashura vaj maj xantsi.",
        cta: "Phuter o azhutitori",
      },
      {
        title: "Vorbin jekhe doktorestar online",
        description: "Bi lovengo svato katar o doktori pe straza, prekal jekh akharimos.",
        cta: "Dikh le doktoren pe straza",
      },
      {
        title: "Arakh kaj te djas",
        description: "Harta le klinikensa, bolnitsensa thaj sigardiari bukjensa pasha tute. Shaj djas vi bi sastipnaske kartako.",
        cta: "Phuter i harta",
      },
    ],
  },
};

/**
 * "How can we help?": asymmetric 12-column ruled bento (7/5, then 5/7) with
 * unified p-6 sm:p-7 card architecture, an 8px live-sage indicator on the
 * on-call doctor pathway, and an anchored sapphire mediator band below.
 */
export function HelpOptions() {
  const { lang } = useLanguage();
  const copy = COPY[lang] ?? COPY.ro;
  const reducedMotion = useCalmReducedMotion();
  const spotRafRef = useRef<number>(0);
  const pendingSpotRef = useRef<{ el: HTMLElement; x: number; y: number } | null>(null);

  useEffect(() => {
    return () => {
      if (spotRafRef.current !== 0) {
        window.cancelAnimationFrame(spotRafRef.current);
      }
    };
  }, []);

  const handleCardPointerMove = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (reducedMotion || event.pointerType === "touch") return;
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    pendingSpotRef.current = {
      el,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    if (spotRafRef.current === 0) {
      spotRafRef.current = window.requestAnimationFrame(() => {
        spotRafRef.current = 0;
        const next = pendingSpotRef.current;
        if (!next) return;
        next.el.style.setProperty("--spot-x", `${next.x.toFixed(1)}px`);
        next.el.style.setProperty("--spot-y", `${next.y.toFixed(1)}px`);
      });
    }
  };

  return (
    <section className="bg-background py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            as="h2"
            align="left"
            title={copy.title}
            subtitle={copy.subtitle}
          />

          <ul className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border shadow-(--shadow-card-rest) sm:grid-cols-2 lg:grid-cols-12">
            {copy.options.map(({ title, description, cta }, index) => {
              const { href, spanClass, Icon } = OPTION_LINKS[index];
              const isLiveDoctor = href === "/medic-online";
              const indexCode = String(index + 1).padStart(2, "0");

              return (
                <li key={href} className={cn("bg-card", spanClass)}>
                  <Link
                    href={withLangPrefix(href, lang)}
                    onPointerMove={handleCardPointerMove}
                    className="surface-spotlight group flex h-full flex-col p-6 transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-surface-subtle/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none sm:p-7"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-sapphire-border/70 bg-sapphire-soft text-sapphire transition-colors duration-(--dur-fast) ease-(--ease-out-calm) group-hover:bg-sapphire group-hover:text-white motion-reduce:transition-none">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="flex items-center gap-2">
                        {isLiveDoctor && (
                          <span
                            aria-hidden="true"
                            className="inline-block h-2 w-2 shrink-0 rounded-full bg-live-sage"
                          />
                        )}
                        <span
                          aria-hidden="true"
                          className="font-mono text-xs font-medium tabular-nums text-muted-foreground/80"
                        >
                          {indexCode}
                        </span>
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-semibold leading-snug tracking-[-0.015em] text-foreground sm:text-[22px]">
                      {title}
                    </h3>

                    <p className="mt-2 max-w-[56ch] text-pretty text-[15px] leading-relaxed text-muted-foreground">
                      {description}
                    </p>

                    <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[14.5px] font-semibold text-sapphire">
                      <span>{cta}</span>
                      <ArrowRightIcon className="h-4 w-4 transition-transform duration-(--dur-fast) ease-(--ease-out-calm) group-hover:translate-x-0.5 motion-reduce:transition-none" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <HelpOptionsMediatorBand className="mt-4" />
        </Reveal>
      </Container>
    </section>
  );
}
