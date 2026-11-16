"use client";

import { Button } from "@/components/ui/Button";
import { PhoneIcon, UsersIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageListenAction } from "@/components/ui/PageListenAction";
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
  ru: {
    title: "Медицинские медиаторы могут вам помочь",
    subtitle: "Медицинский посредник поможет вам обратиться к врачу, получить документы, удостоверяющие личность и медицинскую страховку, а также присмотреть за вашими детьми, бабушками и дедушками.",
    ctaRequest: "Попросите посредника",
    ctaCallback: "Заказать звонок",
    card1Title: "Запись и посещение врача",
    card1Desc: "Они идут с вами к семейному врачу, помогают записаться на прием и объясняют ваши рецепты.",
    card2Title: "Документы и страховка",
    card2Desc: "Они помогают со свидетельствами о рождении, удостоверениями личности и медицинской страховкой для всей семьи.",
    card3Title: "Поговорите с врачом из дома",
    card3Desc: "Приносят планшет и приборы для измерения артериального давления, кислорода и сахара в крови. Вы разговариваете с врачом по телефону.",
  },

  ro: {
    title: "Mediatori sanitari te ajută",
    subtitle: "Mediatorul sanitar te ajută să ajungi la medic, să faci buletinul și asigurarea și să ai grijă de copii și de bunici.",
    ctaRequest: "Cere un mediator",
    ctaCallback: "Cere un apel",
    card1Title: "Înscriere și vizite la medic",
    card1Desc: "Merge cu tine la medicul de familie, te ajută cu programările și îți explică rețetele.",
    card2Title: "Acte și asigurare",
    card2Desc: "Te ajută cu certificatul de naștere, buletinul și asigurarea CNAS pentru toată familia.",
    card3Title: "Vorbești cu un medic, de acasă",
    card3Desc: "Vine cu o tabletă și aparate pentru tensiune, oxigen și zahăr în sânge. Vorbești cu un medic la telefon.",
  },
  en: {
    title: "Health mediators can help you",
    subtitle: "A health mediator helps you see a doctor, get ID papers and health insurance, and look after your children and grandparents.",
    ctaRequest: "Ask for a mediator",
    ctaCallback: "Request a callback",
    card1Title: "Registering and doctor visits",
    card1Desc: "They go with you to the family doctor, help with appointments and explain your prescriptions.",
    card2Title: "Documents and insurance",
    card2Desc: "They help with birth certificates, ID cards and health insurance for the whole family.",
    card3Title: "Talk to a doctor from home",
    card3Desc: "They bring a tablet and devices for blood pressure, oxygen and blood sugar. You talk to a doctor by phone.",
  },
  sq: {
    title: "Mediatorët shëndetësorë të ndihmojnë",
    subtitle: "Mediatori shëndetësor të ndihmon të shkosh te mjeku, të nxjerrësh letërnjoftimin dhe sigurimin, dhe të kujdesesh për fëmijët dhe gjyshërit.",
    ctaRequest: "Kërko një mediator",
    ctaCallback: "Kërko një telefonatë",
    card1Title: "Regjistrimi dhe vizitat te mjeku",
    card1Desc: "Vjen me ty te mjeku i familjes, të ndihmon me takimet dhe të shpjegon recetat.",
    card2Title: "Dokumentet dhe sigurimi",
    card2Desc: "Të ndihmon me certifikatën e lindjes, letërnjoftimin dhe sigurimin shëndetësor për gjithë familjen.",
    card3Title: "Flet me një mjek nga shtëpia",
    card3Desc: "Vjen me një tabletë dhe aparate për tensionin, oksigjenin dhe sheqerin në gjak. Flet me një mjek në telefon.",
  },
  it: {
    title: "Mediatori sanitari per aiutarti",
    subtitle: "Il mediatore sanitario ti aiuta ad andare dal medico, a fare documenti e tessera sanitaria e a prenderti cura di bambini e nonni.",
    ctaRequest: "Chiedi un mediatore",
    ctaCallback: "Fatti richiamare",
    card1Title: "Iscrizione e visite dal medico",
    card1Desc: "Viene con te dal medico di famiglia, ti aiuta con gli appuntamenti e ti spiega le ricette.",
    card2Title: "Documenti e tessera sanitaria",
    card2Desc: "Ti aiuta con certificato di nascita, carta d'identità e iscrizione al servizio sanitario per tutta la famiglia.",
    card3Title: "Parli con un medico da casa",
    card3Desc: "Porta un tablet e gli apparecchi per pressione, ossigeno e zucchero nel sangue. Parli con un medico al telefono.",
  },
  hr: {
    title: "Zdravstveni medijatori ti mogu pomoći",
    subtitle: "Zdravstveni medijator pomaže ti otići liječniku, riješiti osobne dokumente i zdravstveno osiguranje te brinuti o djeci i starijima.",
    ctaRequest: "Zatraži medijatora",
    ctaCallback: "Zatraži poziv",
    card1Title: "Upis i posjeti liječniku",
    card1Desc: "Ide s tobom obiteljskom liječniku, pomaže oko naručivanja i objašnjava ti recepte i upute.",
    card2Title: "Dokumenti i zdravstveno osiguranje",
    card2Desc: "Pomaže oko rodnog lista, osobne iskaznice i zdravstvenog osiguranja HZZO za cijelu obitelj.",
    card3Title: "Razgovor s liječnikom od kuće",
    card3Desc: "Dolazi s tabletom i uređajima za mjerenje krvnog tlaka, zasićenosti kisikom (SpO2) i glukoze u krvi. S liječnikom razgovaraš telefonom.",
  },
  rom: {
    title: "Sastipnaske mediatorya zhutin tut",
    subtitle: "O sastipnasko mediatori zhutil tut te zhas ko doktori, te keres che lila thaj e sastipnaski siguranciya, thaj te arakhes e chhavoren thaj e phuren.",
    ctaRequest: "Mang ekhe mediatores",
    ctaCallback: "Mang ekh akharipe",
    card1Title: "Lekhavipe thaj vizite ko doktori",
    card1Desc: "Zhal tusa ko familiyako doktori, zhutil tut e vramenca thaj phenel tuke lokhes e recepte thaj sikavimata.",
    card2Title: "Lila thaj sastipnaski siguranciya",
    card2Desc: "Zhutil tut e bijandipnaske lilesa, buletinesa thaj sastipnaske siguranciyasa vash sasti familiya.",
    card3Title: "Des svato ekhe doktoresa katar khere",
    card3Desc: "Avel tabletesa thaj aparatenca vash phurdimos e ratesko (tensiyona), oksigeno and-o rat (SpO2) thaj zaharo and-o rat. Des svato e doktoresa ko telefono.",
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
                href={withLangPrefix("/get-help?mode=mediator", lang)}
                variant="action"
                size="lg"
                className="px-6"
              >
                <UsersIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{copy.ctaRequest}</span>
              </Button>
              <Button
                href="#solicita"
                variant="outline"
                size="lg"
                className="px-5"
              >
                <PhoneIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{copy.ctaCallback}</span>
              </Button>
              <PageListenAction
                lang={lang}
                segments={[copy.title, copy.subtitle, copy.ctaRequest, copy.ctaCallback]}
              />
            </div>
          }
        />

        {/* What a mediator does: three columns, each under its own hairline. */}
        <div className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-3">
          {services.map((service) => (
            <div key={service.title}>
              <span aria-hidden="true" className="block h-px w-full bg-border" />
              <h2 className="mt-5 text-balance text-body font-semibold text-foreground">{service.title}</h2>
              <p className="mt-2 max-w-(--measure-lead) text-body text-muted-foreground">{service.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
