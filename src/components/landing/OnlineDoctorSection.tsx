import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { ArrowRightIcon } from "@/components/ui/icons";
import { OnCallLine } from "@/components/landing/OnCallLine";
import { homeSectionsCopy } from "@/lib/i18n/home-sections-copy";
import { getRequestLang, withLangPrefix } from "@/lib/i18n/server-routing";

/**
 * The online doctor, brought forward from /medic-online: the platform's main service.
 * - Left: the promise in one heading and one lead, a live line saying whether the on-call doctor
 *   is there now, the three steps from /medic-online as hairline rows, and the two ways in
 *   (talk now, book a time) as whole buttons that wrap as a row.
 * - Right: a doctor at the keyboard, cropped to the text column's height from lg, with who the
 *   doctors are laid over it as a short note.
 * Phones: the same order, the photo last at 4:3.
 */
export async function OnlineDoctorSection() {
  const lang = await getRequestLang();
  const copy = homeSectionsCopy[lang].doctor;

  return (
    <Section tone="paper" aria-labelledby="home-doctor-title">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-stretch lg:gap-14">
          <Reveal className="lg:col-span-6">
            <h2 id="home-doctor-title" className="text-balance text-page text-foreground dark:text-paper">
              {copy.title}
            </h2>
            <p className="mt-4 max-w-(--measure-lead) text-pretty text-lead text-muted-foreground dark:text-mist">
              {copy.lead}
            </p>
            <OnCallLine onDuty={copy.onDuty} offDuty={copy.offDuty} />

            <ol className="mt-7 border-t border-border dark:border-white/10">
              {copy.steps.map((step, index) => (
                <li
                  key={step.title}
                  className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 border-b border-border py-4 dark:border-white/10"
                >
                  <span aria-hidden="true" className="text-title font-bold tabular-nums leading-snug text-sapphire dark:text-sapphire-border">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-balance text-body font-semibold text-foreground dark:text-paper">{step.title}</h3>
                    <p className="mt-0.5 text-pretty text-body text-muted-foreground dark:text-mist">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={withLangPrefix("/medic-online", lang)} variant="action" size="lg">
                {copy.talkNow}
                <ArrowRightIcon className="arrow-travel h-5 w-5 shrink-0" />
              </Button>
              <Button href={withLangPrefix("/medic-online/programare", lang)} variant="outline" size="lg">
                {copy.book}
              </Button>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-6">
            <figure className="relative aspect-4/3 overflow-hidden rounded-(--radius-surface) bg-surface-subtle sm:aspect-16/10 lg:aspect-auto lg:h-full lg:min-h-112">
              <Image
                src="/images/hero-desk.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover object-[35%_50%]"
              />
              <figcaption className="absolute inset-x-3 bottom-3 rounded-(--radius-surface) bg-card/95 p-4 text-foreground shadow-(--shadow-card-hover) backdrop-blur-sm sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-80 sm:p-5 dark:bg-ink-900/95 dark:text-paper">
                <p className="text-body font-semibold">{copy.teamTitle}</p>
                <p className="mt-1 text-pretty text-body text-muted-foreground dark:text-mist">{copy.teamText}</p>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
