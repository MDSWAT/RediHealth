"use client";

import { useState } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { Lang } from "@/lib/i18n/translations";
import { InlineAudioNarratorButton } from "./InlineAudioNarratorButton";

export interface ComicSlide {
  panel: 1 | 2 | 3;
  title: string;
  copy: string;
  iconType: "problem" | "action" | "healthy";
}

export interface VisualComicFallbackCardProps {
  topicTitle?: string;
  slides?: ComicSlide[];
  onSwitchToVideo?: () => void;
  className?: string;
  lang?: Lang;
}

interface FallbackCopy {
  label: string;
  switchToVideo: string;
  /** Use {current} and {total}. */
  stepOf: string;
  previous: string;
  next: string;
  /** Use {n}. */
  listenStep: string;
  /** Use {topic}. */
  ariaLabel: string;
  slides: ComicSlide[];
}

const SPEECH_LANG: Record<Lang, string> = { ro: "ro-RO", en: "en-GB", sq: "sq-AL", it: "it-IT" };

const COPY: Record<Lang, FallbackCopy> = {
  ro: {
    label: "Fără video, consumă puține date",
    switchToVideo: "Vezi video",
    stepOf: "Pasul {current} din {total}",
    previous: "Pasul anterior",
    next: "Pasul următor",
    listenStep: "Ascultă pasul {n}",
    ariaLabel: "În 3 pași: {topic}",
    slides: [
      {
        panel: 1,
        title: "Ceva nu e în regulă",
        copy: "Ești foarte obosit, ți-e sete des sau simți o apăsare în piept. Așa îți arată corpul că are o problemă.",
        iconType: "problem",
      },
      {
        panel: 2,
        title: "Mergi la medic",
        copy: "Medicul sau mediatorul sanitar îți ia o picătură de sânge din deget. Îți măsoară și tensiunea. Durează câteva minute.",
        iconType: "action",
      },
      {
        panel: 3,
        title: "Urmezi sfaturile medicului",
        copy: "Iei tratamentul la timp, mănânci proaspăt și te plimbi în fiecare zi. Așa ai mai multă putere.",
        iconType: "healthy",
      },
    ],
  },
  en: {
    label: "No video, uses less data",
    switchToVideo: "Watch video",
    stepOf: "Step {current} of {total}",
    previous: "Previous step",
    next: "Next step",
    listenStep: "Listen to step {n}",
    ariaLabel: "In 3 steps: {topic}",
    slides: [
      {
        panel: 1,
        title: "Something is not right",
        copy: "You feel very tired, you are often thirsty or you feel pressure in your chest. This is your body telling you something is wrong.",
        iconType: "problem",
      },
      {
        panel: 2,
        title: "Go to the doctor",
        copy: "The doctor or health mediator takes a drop of blood from your finger. They also check your blood pressure. It takes a few minutes.",
        iconType: "action",
      },
      {
        panel: 3,
        title: "Follow the doctor's advice",
        copy: "Take your treatment on time, eat fresh food and walk every day. You will feel stronger.",
        iconType: "healthy",
      },
    ],
  },
  sq: {
    label: "Pa video, harxhon pak internet",
    switchToVideo: "Shiko videon",
    stepOf: "Hapi {current} nga {total}",
    previous: "Hapi i mëparshëm",
    next: "Hapi tjetër",
    listenStep: "Dëgjo hapin {n}",
    ariaLabel: "Në 3 hapa: {topic}",
    slides: [
      {
        panel: 1,
        title: "Diçka nuk shkon",
        copy: "Je shumë i lodhur, ke shpesh etje ose ndien shtrëngim në gjoks. Kështu trupi të tregon që ka një problem.",
        iconType: "problem",
      },
      {
        panel: 2,
        title: "Shko te mjeku",
        copy: "Mjeku ose ndërmjetësi shëndetësor të merr një pikë gjak nga gishti. Të mat edhe tensionin. Zgjat pak minuta.",
        iconType: "action",
      },
      {
        panel: 3,
        title: "Ndiq këshillat e mjekut",
        copy: "Merr mjekimin në kohë, ha ushqim të freskët dhe ec çdo ditë. Kështu ke më shumë fuqi.",
        iconType: "healthy",
      },
    ],
  },
  it: {
    label: "Senza video, consuma pochi dati",
    switchToVideo: "Guarda il video",
    stepOf: "Passo {current} di {total}",
    previous: "Passo precedente",
    next: "Passo successivo",
    listenStep: "Ascolta il passo {n}",
    ariaLabel: "In 3 passi: {topic}",
    slides: [
      {
        panel: 1,
        title: "Qualcosa non va",
        copy: "Sei molto stanco, hai spesso sete o senti un peso sul petto. Così il corpo ti dice che c'è un problema.",
        iconType: "problem",
      },
      {
        panel: 2,
        title: "Vai dal medico",
        copy: "Il medico o il mediatore sanitario ti prende una goccia di sangue dal dito. Ti misura anche la pressione. Ci vogliono pochi minuti.",
        iconType: "action",
      },
      {
        panel: 3,
        title: "Segui i consigli del medico",
        copy: "Prendi la terapia all'ora giusta, mangia cibo fresco e cammina ogni giorno. Così hai più forza.",
        iconType: "healthy",
      },
    ],
  },
};

function SlideIcon({ type }: { type: ComicSlide["iconType"] }) {
  const common = {
    className: "h-10 w-10",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (type === "problem") {
    return (
      <svg {...common} className="h-10 w-10 text-primary">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4.5M12 16h.01" />
      </svg>
    );
  }
  if (type === "action") {
    return (
      <svg {...common} className="h-10 w-10 text-sapphire">
        <path d="M5 3v5a5 5 0 0 0 10 0V3" />
        <path d="M10 13v2a5 5 0 0 0 10 0v-2" />
        <circle cx="20" cy="11" r="2" />
      </svg>
    );
  }
  return (
    <svg {...common} className="h-10 w-10 text-live-sage">
      <path d="M12 21s7-3.5 7-9V5.5L12 3 5 5.5V12c0 5.5 7 9 7 9Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/** Text-only stand-in for the short video on Save-Data or slow connections. */
export function VisualComicFallbackCard({
  topicTitle,
  slides,
  onSwitchToVideo,
  className = "",
  lang = "ro",
}: VisualComicFallbackCardProps) {
  const copy = COPY[lang] ?? COPY.ro;
  const [active, setActive] = useState(0);
  const currentSlides = slides ?? copy.slides;
  const slide = currentSlides[active] ?? currentSlides[0];
  const total = currentSlides.length;

  return (
    <section
      className={`w-full max-w-[320px] rounded-lg border border-border bg-card p-5 shadow-xs ${className}`}
      aria-label={copy.ariaLabel.replace("{topic}", topicTitle ?? "")}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        <span className="text-sm text-muted-foreground">{copy.label}</span>
        {onSwitchToVideo && (
          <button
            type="button"
            onClick={onSwitchToVideo}
            className="min-h-[44px] shrink-0 text-sm font-semibold text-sapphire underline underline-offset-4 hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          >
            {copy.switchToVideo}
          </button>
        )}
      </div>

      <div className="mt-5" aria-live="polite">
        <SlideIcon type={slide.iconType} />
        <p className="mt-3 text-sm text-muted-foreground tabular-nums">
          {copy.stepOf.replace("{current}", String(active + 1)).replace("{total}", String(total))}
        </p>
        <h4 className="mt-1 text-base font-semibold leading-snug text-foreground">{slide.title}</h4>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{slide.copy}</p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
        <InlineAudioNarratorButton
          textToSpeak={`${slide.title}. ${slide.copy}`}
          label={copy.listenStep.replace("{n}", String(active + 1))}
          lang={SPEECH_LANG[lang] ?? "ro-RO"}
          variant="ghost"
          className="-ml-2"
        />
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActive((p) => Math.max(0, p - 1))}
            disabled={active === 0}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire disabled:cursor-not-allowed disabled:opacity-30"
            aria-label={copy.previous}
          >
            <ArrowRightIcon className="h-4 w-4 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => setActive((p) => Math.min(total - 1, p + 1))}
            disabled={active === total - 1}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire disabled:cursor-not-allowed disabled:opacity-30"
            aria-label={copy.next}
          >
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
