"use client";

import { Button } from "@/components/ui/Button";
import { PhoneIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageListenAction } from "@/components/ui/PageListenAction";
import { useLanguage } from "@/lib/i18n/language-context";
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
  ru: {
    title: "Медицинские медиаторы могут вам помочь",
    subtitle:
      "Медицинский посредник поможет записаться к семейному врачу, оформить документы для страхования и найти местные службы здравоохранения.",
    ctaCallback: "Заказать звонок",
    card1Title: "Запись и практические шаги",
    card1Desc:
      "Помогает с записью к семейному врачу и организационными шагами, не заменяя медицинскую консультацию по лечению.",
    card2Title: "Документы и страховка",
    card2Desc:
      "Подсказывает, какие шаги нужны для свидетельства о рождении, удостоверения личности и медицинской страховки.",
    card3Title: "Связь со службами на месте",
    card3Desc:
      "Направляет к семейным врачам, участковым медсестрам и программам профилактики и может прийти на встречу по местной договоренности.",
  },
  ro: {
    title: "Mediatorii sanitari sunt aici să te ajute",
    subtitle:
      "Un mediator sanitar te ajută să te înscrii la medicul de familie, să pregătești actele pentru asigurare și să găsești serviciile de sănătate din zona ta.",
    ctaCallback: "Cere un apel",
    card1Title: "Înscriere și programări",
    card1Desc:
      "Te ajută cu înscrierea la medicul de familie, programările și pașii administrativi, fără să ofere recomandări clinice despre rețete.",
    card2Title: "Acte și asigurare",
    card2Desc:
      "Îți explică ce acte sunt necesare pentru certificatul de naștere, buletin și asigurarea CNAS.",
    card3Title: "Legătură cu serviciile din zonă",
    card3Desc:
      "Te pune în legătură cu medicii de familie, asistenții comunitari și campaniile locale de prevenție, și te poate însoți atunci când este disponibil local.",
  },
  en: {
    title: "Health mediators are here to help you",
    subtitle:
      "A health mediator helps you register with a family doctor, sort out paperwork and insurance steps, and connect with local health services.",
    ctaCallback: "Request a callback",
    card1Title: "Registration and appointments",
    card1Desc:
      "Helps you register with a family doctor, book visits, and follow administrative steps, without giving clinical advice on prescriptions.",
    card2Title: "Documents and insurance",
    card2Desc:
      "Guides you on what paperwork is needed for birth certificates, ID cards, and public health insurance.",
    card3Title: "Bridge to local care",
    card3Desc:
      "Connects you with family doctors, community nurses, and prevention programmes, and joins appointments only when available locally.",
  },
  sq: {
    title: "Mediatorët shëndetësorë mund të të ndihmojnë",
    subtitle:
      "Një mediator shëndetësor të ndihmon të regjistrohesh te mjeku i familjes, të përgatitësh dokumentet për sigurimin dhe të gjesh shërbimet lokale.",
    ctaCallback: "Kërko një telefonatë",
    card1Title: "Regjistrimi dhe takimet",
    card1Desc:
      "Të ndihmon me regjistrimin te mjeku i familjes, takimet dhe hapat administrativë, pa dhënë këshilla klinike për recetat.",
    card2Title: "Dokumentet dhe sigurimi",
    card2Desc:
      "Të orienton se çfarë dokumentesh duhen për certifikatën e lindjes, letërnjoftimin dhe sigurimin shëndetësor.",
    card3Title: "Urë lidhëse me shërbimet lokale",
    card3Desc:
      "Të lidh me mjekët e familjes, infermierët e komunitetit dhe programet e parandalimit, dhe mund të të shoqërojë kur është e mundur në zonë.",
  },
  it: {
    title: "I mediatori sanitari possono aiutarti",
    subtitle:
      "Un mediatore sanitario ti aiuta a iscriverti dal medico di famiglia, orientarti tra documenti e tessera sanitaria e trovare i servizi locali.",
    ctaCallback: "Fatti richiamare",
    card1Title: "Iscrizione e appuntamenti",
    card1Desc:
      "Ti aiuta con iscrizione dal medico di famiglia, prenotazioni e passaggi amministrativi, senza dare indicazioni cliniche sulle ricette.",
    card2Title: "Documenti e tessera sanitaria",
    card2Desc:
      "Ti orienta sui documenti richiesti per certificato di nascita, carta d'identità e iscrizione sanitaria.",
    card3Title: "Ponte con i servizi locali",
    card3Desc:
      "Ti mette in contatto con medici di famiglia, infermieri di comunità e prevenzione, accompagnandoti solo quando disponibile sul territorio.",
  },
  hr: {
    title: "Zdravstveni medijatori ti mogu pomoći",
    subtitle:
      "Zdravstveni medijator pomaže ti upisati se kod obiteljskog liječnika, pripremiti dokumente za osiguranje i povezati se s lokalnim službama.",
    ctaCallback: "Zatraži poziv",
    card1Title: "Upis i naručivanje",
    card1Desc:
      "Pomaže oko upisa kod obiteljskog liječnika, naručivanja i administrativnih koraka, bez davanja kliničkih savjeta o receptima.",
    card2Title: "Dokumenti i osiguranje",
    card2Desc:
      "Upućuje te koji su papiri potrebni za rodni list, osobnu iskaznicu i zdravstveno osiguranje.",
    card3Title: "Veza s lokalnim službama",
    card3Desc:
      "Povezuje te s obiteljskim liječnicima, patronažnim sestrama i preventivnim programima, uz pratnju kada je to lokalno dostupno.",
  },
  rom: {
    title: "Sastipnaske mediatorya šaj te ažutin tut",
    subtitle:
      "Jekh sastipnasko mediatori ažutil tut te lekhaves tut ko familiyako doktori, te lačhares e lila vaš e siguranciya thaj te arakhes e thaneske službe.",
    ctaCallback: "Mang ekh akharipe",
    card1Title: "Lekhavipe thaj programime",
    card1Desc:
      "Ažutil tut e lekhavipnase thaj e vramenca ko doktori, bi te del doktoresko sfato vaš e recepte.",
    card2Title: "Lila thaj siguranciya",
    card2Desc:
      "Sikavel tuke save lila trubul vaš bijandipnasko lil, buletino thaj sastipnaski siguranciya.",
    card3Title: "Phandipe e lokalne službenca",
    card3Desc:
      "Phandel tut e familiyake doktorenca, asistentenca thaj prevenciyake akciyenca, thaj šaj te džal tusa kana si thanesko ažutipen.",
  },
};

export function MediatorPublicHero({ lang: langProp }: { lang?: Lang }) {
  const { lang: ctxLang } = useSafeLanguage();
  const lang = langProp ?? ctxLang;
  const copy = heroCopy[lang] ?? heroCopy.ro;
  const services = [
    { title: copy.card1Title, body: copy.card1Desc },
    { title: copy.card2Title, body: copy.card2Desc },
    { title: copy.card3Title, body: copy.card3Desc },
  ];

  return (
    <section className="border-b border-border bg-background pb-10 sm:pb-16">
      <Container>
        <PageHeader
          title={copy.title}
          lead={copy.subtitle}
          actions={
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                href="#solicita"
                variant="action"
                size="lg"
                className="whitespace-nowrap px-6"
              >
                <PhoneIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{copy.ctaCallback}</span>
              </Button>
              <PageListenAction
                lang={lang}
                segments={[copy.title, copy.subtitle, copy.ctaCallback]}
              />
            </div>
          }
        />

        {/* What a mediator does: open-canvas asymmetric hairline list. */}
        <ul className="mt-8 divide-y divide-border border-t border-border lg:mt-10 dark:divide-white/10 dark:border-white/10">
          {services.map(({ title, body }) => (
            <li
              key={title}
              className="grid gap-2 py-5 sm:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] sm:items-baseline sm:gap-10 sm:py-6"
            >
              <h2 className="text-balance text-title font-semibold text-foreground dark:text-paper">
                {title}
              </h2>
              <p className="max-w-(--measure-lead) text-pretty text-body leading-relaxed text-muted-foreground dark:text-mist">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
