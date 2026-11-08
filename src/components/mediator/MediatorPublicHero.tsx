"use client";

import { useState } from "react";
import Link from "next/link";
import { UsersIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { RequestMediatorModal } from "./RequestMediatorModal";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { translations, type Lang } from "@/lib/i18n/translations";

function useSafeLanguage() {
  try {
    const ctx = useLanguage();
    return ctx;
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

export const heroCopy = {
  ro: {
    title: "Un mediator sanitar te ajută",
    subtitle: "Mediatorul sanitar te ajută să ajungi la medic, să faci buletinul și asigurarea și să ai grijă de copii și de bunici.",
    ctaRequest: "Cere un mediator",
    ctaSignIn: "Intră în contul de mediator",
    card1Title: "Înscriere și vizite la medic",
    card1Desc: "Merge cu tine la medicul de familie, te ajută cu programările și îți explică rețetele.",
    card2Title: "Acte și asigurare",
    card2Desc: "Te ajută cu certificatul de naștere, buletinul și asigurarea CNAS pentru toată familia.",
    card3Title: "Vorbești cu un medic, de acasă",
    card3Desc: "Vine cu o tabletă și aparate pentru tensiune, oxigen și zahăr în sânge. Vorbești cu un medic la telefon.",
  },
  en: {
    title: "A health mediator can help you",
    subtitle: "A health mediator helps you see a doctor, get ID papers and health insurance, and look after your children and grandparents.",
    ctaRequest: "Ask for a mediator",
    ctaSignIn: "Mediator sign-in",
    card1Title: "Registering and doctor visits",
    card1Desc: "They go with you to the family doctor, help with appointments and explain your prescriptions.",
    card2Title: "Documents and insurance",
    card2Desc: "They help with birth certificates, ID cards and health insurance for the whole family.",
    card3Title: "Talk to a doctor from home",
    card3Desc: "They bring a tablet and devices for blood pressure, oxygen and blood sugar. You talk to a doctor by phone.",
  },
  sq: {
    title: "Një mediator shëndetësor të ndihmon",
    subtitle: "Mediatori shëndetësor të ndihmon të shkosh te mjeku, të nxjerrësh letërnjoftimin dhe sigurimin, dhe të kujdesesh për fëmijët dhe gjyshërit.",
    ctaRequest: "Kërko një mediator",
    ctaSignIn: "Hyr si mediator",
    card1Title: "Regjistrimi dhe vizitat te mjeku",
    card1Desc: "Vjen me ty te mjeku i familjes, të ndihmon me takimet dhe të shpjegon recetat.",
    card2Title: "Dokumentet dhe sigurimi",
    card2Desc: "Të ndihmon me certifikatën e lindjes, letërnjoftimin dhe sigurimin shëndetësor për gjithë familjen.",
    card3Title: "Flet me një mjek nga shtëpia",
    card3Desc: "Vjen me një tabletë dhe aparate për tensionin, oksigjenin dhe sheqerin në gjak. Flet me një mjek në telefon.",
  },
  it: {
    title: "Un mediatore sanitario ti aiuta",
    subtitle: "Il mediatore sanitario ti aiuta ad andare dal medico, a fare documenti e tessera sanitaria e a prenderti cura di bambini e nonni.",
    ctaRequest: "Chiedi un mediatore",
    ctaSignIn: "Accesso mediatori",
    card1Title: "Iscrizione e visite dal medico",
    card1Desc: "Viene con te dal medico di famiglia, ti aiuta con gli appuntamenti e ti spiega le ricette.",
    card2Title: "Documenti e tessera sanitaria",
    card2Desc: "Ti aiuta con certificato di nascita, carta d'identità e iscrizione al servizio sanitario per tutta la famiglia.",
    card3Title: "Parli con un medico da casa",
    card3Desc: "Porta un tablet e gli apparecchi per pressione, ossigeno e zucchero nel sangue. Parli con un medico al telefono.",
  },
};

export function MediatorPublicHero() {
  const [modalOpen, setModalOpen] = useState(false);
  const { lang } = useSafeLanguage();
  const copy = heroCopy[lang] ?? heroCopy.ro;
  const services = [
    { title: copy.card1Title, body: copy.card1Desc },
    { title: copy.card2Title, body: copy.card2Desc },
    { title: copy.card3Title, body: copy.card3Desc },
  ];

  return (
    <>
      <section className="border-b border-border bg-background py-10 sm:py-16">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{copy.subtitle}</p>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                aria-haspopup="dialog"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-sapphire px-6 py-3 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2"
              >
                <UsersIcon className="h-4 w-4" aria-hidden="true" />
                <span>{copy.ctaRequest}</span>
              </button>

              <Link
                href={withLangPrefix("/sign-in", lang)}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-card px-5 py-3 text-center text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {copy.ctaSignIn}
              </Link>
            </div>
          </div>

          <ul className="mt-12 grid gap-x-10 gap-y-6 border-t border-border pt-8 md:grid-cols-3">
            {services.map((service) => (
              <li key={service.title}>
                <h2 className="text-base font-semibold text-foreground">{service.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <RequestMediatorModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
