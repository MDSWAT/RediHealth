"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { Container } from "@/components/ui/Container";
import { CheckIcon } from "@/components/ui/icons";
import { heroCopy, localHref } from "@/lib/i18n/hero-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import { EmergencyBar } from "./hero/EmergencyBar";
import { Spotlight } from "./hero/Spotlight";
import { TriagePanel } from "./hero/TriagePanel";

/**
 * Landing hero, built from the platform concept (03.11 and 04.11):
 * the 112 line, one headline, one sentence, one action, and the
 * "What worries you?" instrument as the thing the page is about.
 */
export function Hero() {
  const { lang } = useLanguage();
  const copy = heroCopy[lang];

  // Jump to the instrument and hand focus to its question, so keyboard and
  // screen reader users land where sighted users are looking.
  const goToTriage = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("triage");
    if (!target) return;
    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    document.getElementById("triage-heading")?.focus({ preventScroll: true });
  };

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-ink-950 text-paper">
      <EmergencyBar copy={copy.emergency} />

      <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0 -z-10" />
      <Spotlight className="-left-40 -top-56 -z-10 h-[150%] w-[150%] text-paper sm:-left-10 md:-top-32 lg:left-24 lg:w-[90%]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 top-1/3 -z-10 h-[36rem] w-[36rem] rounded-full bg-sapphire/45 blur-[140px]"
      />

      <Container className="grid gap-y-12 pb-16 pt-12 sm:pb-20 sm:pt-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-x-16 lg:gap-y-12 lg:pb-20 lg:pt-16 xl:gap-x-24">
        <div className="lg:col-start-1 lg:row-start-1 lg:self-start lg:pt-4">
          <h1 id="hero-title" className="hero-title max-w-[20ch] text-balance font-semibold text-paper">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-[50ch] text-pretty text-[17px] leading-relaxed text-mist sm:text-[19px]">
            {copy.lead}
          </p>

          <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <a
              href="#triage"
              onClick={goToTriage}
              className="hero-focus inline-flex min-h-[54px] items-center justify-center rounded-xl bg-primary px-7 text-[17px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(198,47,60,0.8)] transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-primary-hover active:translate-y-0 motion-reduce:transform-none"
            >
              {copy.primaryCta}
            </a>
            <Link
              href={localHref("/health-information", lang)}
              className="hero-focus self-center rounded text-[16px] font-medium text-paper underline decoration-paper/35 underline-offset-[6px] transition-colors hover:decoration-paper sm:self-auto"
            >
              {copy.secondaryCta}
            </Link>
          </div>
        </div>

        <div id="triage" className="scroll-mt-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <TriagePanel copy={copy.panel} alarmSigns={copy.emergency.alarmSigns} lang={lang} />
        </div>

        <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
          <ul className="flex flex-col gap-3 border-t border-white/10 pt-7 sm:flex-row sm:flex-wrap sm:gap-x-7">
            {copy.facts.map((fact) => (
              <li key={fact} className="flex items-center gap-2 text-[15px] text-paper/85">
                <CheckIcon className="h-4 w-4 shrink-0 text-amber-300" />
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
