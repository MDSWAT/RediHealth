"use client";

import { Container } from "@/components/ui/Container";
import { BrandCross } from "@/components/ui/BrandCross";
import { ListenButton } from "@/components/ui/ListenButton";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { HERO_NEED_ORDER, heroCopy } from "@/lib/i18n/hero-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import { WheelBackdrop } from "./WheelBackdrop";
import { useState } from "react";
import { HeroDock, type WheelTopicNote } from "./hero/HeroDock";
import { HeroPhotos } from "./hero/HeroPhotos";
import { HeroRoutes } from "./hero/HeroRoutes";

/**
 * Landing hero:
 * - Extends beneath the transparent-on-load sticky header (and its 112 line) by --site-header-h.
 * - Below lg it is one full screen tall, so the dock ends at the bottom edge of the phone.
 * - Desktop: consultation photos cross-fade under a sapphire tint and ink scrims (HeroPhotos).
 *   On the left the topic wheel turns slowly behind a large headline, the lead, three trust words
 *   and read-aloud; on the right the quick options (HeroRoutes): a search that opens from a
 *   button, the six needs and the mediator route.
 * - Phones and tablets: the headline (two sentences, the second in a warm tint) and one short line
 *   on who it is for, centred in the space above HeroDock: a low band where the wheel rises over a
 *   dock with the one main action. The chooser opens from the dock as a bottom sheet.
 * - Static on first paint: the headline and every control render visibly at once.
 */
export function Hero({ wheelTopics = [] }: { wheelTopics?: WheelTopicNote[] }) {
  const { lang } = useLanguage();
  // The phone wheel's easter egg: the topic its caption names, or null while the icons are hidden.
  const [note, setNote] = useState<WheelTopicNote | null>(null);
  const copy = heroCopy[lang];
  const { panel } = copy;
  const [who] = copy.lead.split(/(?<=\.)\s+/);
  const voiceEnabled = isVoiceEnabled(lang);

  return (
    <section
      aria-labelledby="hero-title"
      className="hero relative isolate -mt-(--site-header-h) flex min-h-svh flex-col lg:min-h-[calc(100svh-var(--site-header-h))] overflow-hidden bg-ink-950 pt-(--site-header-h) text-paper"
    >
      <HeroPhotos />
      {/* The topic wheel, turning slowly behind the headline on the left (desktop only). */}
      <div aria-hidden="true" className="hero-wheel-dissolve hidden lg:block">
        <WheelBackdrop placement="hero" />
      </div>
      {/* Subtle bottom inset horizon hairline separating the hero ground from the regional ribbon. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-px bg-linear-to-r from-white/5 via-white/20 to-white/5"
      />

      <Container className="hero-grid grid grid-cols-1 content-start max-lg:flex-1 max-lg:content-center gap-y-5 py-6 sm:gap-y-7 sm:py-10 lg:flex-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:content-center lg:gap-x-16 lg:py-10 xl:gap-x-24 [&>*]:min-w-0">
        <div className="flex min-w-0 flex-col lg:justify-center">
          {/* Below lg the headline and lead are centred over the wheel; from lg they sit flush left. */}
          <div className="hero-phone-drift max-w-xl max-lg:relative max-lg:mx-auto max-lg:text-center">
            {/* The brand cross in white over the headline: centred on phones, flush left from lg. */}
            {/* The cross: it turns into place on load, a warm halo blooms behind it and a glint of
                light crosses it once; as the hero scrolls away it grows. */}
            <span className="hero-cross-slot relative mb-5 block w-fit max-lg:mx-auto lg:mb-6">
              <span aria-hidden="true" className="hero-cross-halo" />
              <BrandCross sheen className="hero-cross hero-cross-in relative block h-11 w-11 text-paper lg:h-13 lg:w-13" />
            </span>
            <h1 id="hero-title" className="hero-title text-balance font-bold text-paper">
              {/* Below lg: two short sentences, the second set quieter. From lg: the concept's one sentence. */}
              <span className="lg:hidden">
                <span className="hero-in block [--in:140ms]">{copy.mobileTitle[0]}</span>
                {/* The second sentence in a warm light, from the site's blue toward the mediators' amber. */}
                <span className="hero-title-warm hero-in block [--in:230ms]">{copy.mobileTitle[1]}</span>
              </span>
              <span className="hero-in hidden [--in:140ms] lg:inline-block">{copy.title}</span>
            </h1>
            {/* Who the platform is for: one short line on phones (where "Free" is already in the
                headline, so there is no facts row), the lead on desktop. */}
            <p className="hero-in mx-auto mt-4 max-w-[21rem] [--in:330ms] text-pretty text-body text-paper/75 lg:mx-0 lg:mt-5 lg:max-w-lg lg:text-lead lg:text-mist">{who}</p>
            {/* Phones, after a tap on the chakra: what the topic at the top of the ring is about. Small
                and quiet, hanging under the subtitle so nothing above it moves. Decorative: the
                topics are all on the page below. */}
            {note ? (
              <p
                key={note.slug}
                aria-hidden="true"
                className="hero-topic-note pointer-events-none absolute inset-x-0 top-full mx-auto mt-3 max-w-[20rem] text-pretty text-meta leading-snug text-paper/70 lg:hidden"
              >
                <span className="font-semibold text-amber-care-border">{note.title}</span>
                <span className="text-paper/60"> · </span>
                {note.description}
              </p>
            ) : null}
            {/* Three plain facts (the hairlines between them are borders, not characters), and read-aloud. */}
            <div className="hero-in mt-6 hidden flex-wrap items-center gap-x-6 gap-y-3 [--in:420ms] lg:flex">
              <div className="overflow-hidden">
                <ul className="-ml-3.5 flex flex-wrap items-center gap-y-1.5 text-body font-semibold text-paper">
                  {copy.trust.map((fact) => (
                    <li key={fact} className="whitespace-nowrap border-l border-paper/25 px-3.5">
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>
              {voiceEnabled && (
                <ListenButton
                  uiLang={lang}
                  getText={() =>
                    [copy.title, who, panel.question, ...HERO_NEED_ORDER.map((id) => panel.needs[id].label), panel.mediators].join(" ")
                  }
                  label={panel.listen}
                  stopLabel={panel.stopListening}
                  className="shrink-0 border-paper/35 bg-transparent text-paper shadow-none hover:border-paper/60 hover:bg-paper/10 active:bg-paper/15 dark:border-paper/35 dark:bg-transparent dark:text-paper dark:hover:bg-paper/10 aria-[pressed=true]:border-paper aria-[pressed=true]:bg-paper/15 aria-[pressed=true]:text-paper dark:aria-[pressed=true]:border-paper dark:aria-[pressed=true]:bg-paper/15 dark:aria-[pressed=true]:text-paper"
                  iconClassName="text-paper"
                />
              )}
            </div>
          </div>
        </div>

        {/* Desktop: the quick options beside the headline. Below lg they open from the dock as a sheet. */}
        <div id="triage" className="hero-in hidden scroll-mt-24 [--in:300ms] lg:block">
          <HeroRoutes copy={copy} lang={lang} />
        </div>
      </Container>

      <HeroDock copy={copy} lang={lang} topics={wheelTopics} onNote={setNote} />
    </section>
  );
}
