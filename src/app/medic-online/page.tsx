import type { Metadata } from "next";
import { MedicOnlineHero } from "@/components/telemed/MedicOnlineHero";
import { Container } from "@/components/ui/Container";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { localizedPageTitle } from "@/lib/i18n/page-metadata";
import type { Lang } from "@/lib/i18n/translations";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const descriptions: Record<Lang, string> = {
    ru: "Поговорите с врачом-волонтером бесплатно с телефона. Устанавливать приложение не нужно.",
    ro: "Vorbește gratuit cu un medic voluntar, de pe telefon. Nu trebuie să instalezi nicio aplicație.",
    en: "Talk to a volunteer doctor for free, on your phone. You do not need to install an app.",
    sq: "Fol falas me një mjek vullnetar, nga telefoni. Nuk të duhet të instalosh asnjë aplikacion.",
    it: "Parla gratis con un medico volontario, dal telefono. Non devi installare nessuna app.",
    hr: "Razgovaraj besplatno s liječnikom volonterom putem telefona. Ne trebaš instalirati aplikaciju.",
    rom: "De svato bi lovesko ekhe doktoresa volonteri katar cho telefono. Na trebul te thos niyekh aplikacia.",
  };

  return {
    title: localizedPageTitle(lang, "medic-online", "Doctor online - RediHealth"),
    description: descriptions[lang] ?? descriptions.en,
  };
}

const copy: Record<
  Lang,
  {
    stepsBadge: string;
    stepsTitle: string;
    stepsSubtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    heading: string;
    desc: string;
    privacyTitle: string;
    privacyDesc: string;
  }
> = {
  ru: {
    stepsBadge: "Три простых шага",
    stepsTitle: "Как это работает",
    stepsSubtitle: "Банковская карта, страховой полис и приложение не нужны.",
    step1Title: "Выберите время звонка",
    step1Desc: "Поговорите с дежурным врачом сейчас или запишитесь на удобное время.",
    step2Title: "Получите ссылку по SMS",
    step2Desc: "Нажмите на ссылку — звонок откроется в браузере.",
    step3Title: "Получите рекомендации в письменном виде",
    step3Desc: "После звонка врач пришлёт рекомендации. Они останутся в вашем профиле и придут по SMS.",
    heading: "Лицензированные врачи",
    desc: "Врачи RediHealth — семейные врачи, педиатры и терапевты. Они работают как волонтёры и понятно объясняют, что делать.",
    privacyTitle: "Всё сказанное остаётся между вами и врачом",
    privacyDesc: "Звонки шифруются.",
  },

  ro: {
    stepsBadge: "Trei pași simpli",
    stepsTitle: "Cum funcționează",
    stepsSubtitle: "Nu ai nevoie de cont bancar, card de sănătate sau aplicație.",
    step1Title: "Alegi când vorbești",
    step1Desc: "Intri acum la medicul de gardă sau îți alegi o oră potrivită.",
    step2Title: "Primești un link prin SMS",
    step2Desc: "Apeși pe link. Apelul se deschide în browser.",
    step3Title: "Primești sfaturile în scris",
    step3Desc: "După apel, medicul îți trimite ce ai de făcut. Găsești totul în cont și prin SMS.",
    heading: "Medici cu drept de practică",
    desc: "Medicii RediHealth sunt medici de familie, pediatri sau medici de medicină internă. Sunt voluntari și îți explică pe înțeles ce ai de făcut.",
    privacyTitle: "Ce spui rămâne între tine și medic",
    privacyDesc: "Apelurile sunt criptate.",
  },
  en: {
    stepsBadge: "Three simple steps",
    stepsTitle: "How it works",
    stepsSubtitle: "No bank account, health card or app needed.",
    step1Title: "Choose when to talk",
    step1Desc: "Talk to the on-call doctor now or book a time that suits you.",
    step2Title: "Get a link by SMS",
    step2Desc: "Tap the link. The call opens in your browser.",
    step3Title: "Get the advice in writing",
    step3Desc: "After the call, the doctor sends your next steps. Find them in your account and by SMS.",
    heading: "Licensed doctors",
    desc: "RediHealth doctors are family doctors, paediatricians or internal medicine doctors. They are volunteers and explain clearly what to do.",
    privacyTitle: "What you say stays between you and the doctor",
    privacyDesc: "Calls are encrypted.",
  },
  sq: {
    stepsBadge: "Tre hapa të thjeshtë",
    stepsTitle: "Si funksionon",
    stepsSubtitle: "Nuk të duhet llogari bankare, kartë shëndetësore apo aplikacion.",
    step1Title: "Zgjidh kur flet",
    step1Desc: "Fol tani me mjekun kujdestar ose zgjidh një orar që të përshtatet.",
    step2Title: "Merr një lidhje me SMS",
    step2Desc: "Shtyp lidhjen. Thirrja hapet në shfletues.",
    step3Title: "Merr këshillat me shkrim",
    step3Desc: "Pas thirrjes, mjeku të dërgon hapat e radhës. I gjen në llogari dhe me SMS.",
    heading: "Mjekë me licencë",
    desc: "Mjekët e RediHealth janë mjekë familjeje, pediatër ose mjekë të sëmundjeve të brendshme. Janë vullnetarë dhe të shpjegojnë qartë çfarë të bësh.",
    privacyTitle: "Çfarë thua mbetet mes teje dhe mjekut",
    privacyDesc: "Thirrjet janë të enkriptuara.",
  },
  it: {
    stepsBadge: "Tre semplici passi",
    stepsTitle: "Come funziona",
    stepsSubtitle: "Non ti servono conto in banca, tessera sanitaria o app.",
    step1Title: "Scegli quando parlare",
    step1Desc: "Parla subito con il medico di guardia o prenota un orario che ti va bene.",
    step2Title: "Ricevi un link via SMS",
    step2Desc: "Tocca il link. La chiamata si apre nel browser.",
    step3Title: "Ricevi i consigli per iscritto",
    step3Desc: "Dopo la chiamata, il medico ti manda cosa fare. Lo trovi nel tuo account e via SMS.",
    heading: "Medici abilitati",
    desc: "I medici di RediHealth sono medici di famiglia, pediatri o internisti. Sono volontari e ti spiegano con chiarezza cosa fare.",
    privacyTitle: "Quello che dici resta tra te e il medico",
    privacyDesc: "Le chiamate sono criptate.",
  },
  hr: {
    stepsBadge: "Tri jednostavna koraka",
    stepsTitle: "Kako funkcionira",
    stepsSubtitle: "Ne trebaš bankovni račun, zdravstvenu iskaznicu HZZO ni aplikaciju.",
    step1Title: "Odaberi kada želiš razgovarati",
    step1Desc: "Javi se odmah dežurnom liječniku ili rezerviraj termin koji ti odgovara.",
    step2Title: "Primi poveznicu SMS porukom",
    step2Desc: "Dodirni poveznicu. Poziv se otvara u tvojem pregledniku.",
    step3Title: "Primi pisane upute",
    step3Desc: "Nakon poziva liječnik ti šalje upute što dalje. Sve pronalaziš na svojem računu i putem SMS poruke.",
    heading: "Licencirani liječnici",
    desc: "Liječnici na platformi RediHealth su obiteljski liječnici, pedijatri i internisti. Rade volonterski i jasno objašnjavaju što dalje.",
    privacyTitle: "Ono što kažeš ostaje između tebe i liječnika",
    privacyDesc: "Pozivi su šifrirani.",
  },
  rom: {
    stepsBadge: "Trin lokhe pash",
    stepsTitle: "Sar kerel buchi",
    stepsSubtitle: "Na trebul tuke bankako konto, sastipnaski karta vay aplikacia.",
    step1Title: "Alosar kana kames te des svato",
    step1Desc: "De svato akana e doktoresa kay si pe buchi vay alosar vrama kay avel tuke mishto.",
    step2Title: "Le ekh linko katar SMS",
    step2Desc: "Azba o linko. O svato putrel pes and-o brauzero.",
    step3Title: "Le e sikavimata lekhavde",
    step3Desc: "Palo svato, o doktori bichhalel tuke so te keres may dur. Arakhes sa ande cho konto thaj katar SMS.",
    heading: "Doktorya licenciyasa",
    desc: "E doktorya ko RediHealth si familiyake doktorya, chhavorenge doktorya vay doktorya vash andrutni medicina. Von keren buchi bi lovesko thaj phenen tuke chaches so te keres.",
    privacyTitle: "So phenes achel mashkar tute thaj o doktori",
    privacyDesc: "E svaturya si garavde (enkriptisarde).",
  },
};

export default async function MedicOnlinePage() {
  const lang = await getRequestLang();
  const c = copy[lang] ?? copy.en;

  return (
    <main id="main-content" className="min-h-screen bg-background">
      {/* The two ways to talk to a doctor, with the pharmacy as the last row of the same surface. */}
      <MedicOnlineHero />

      {/* How it works: editorial 3-step sequence with tactile step cards */}
      <section aria-labelledby="medic-steps-heading" className="border-b border-border bg-card py-14 sm:py-20">
        <Container>
          <div className="max-w-2xl">
            <h2 id="medic-steps-heading" className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {c.stepsTitle}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">{c.stepsSubtitle}</p>
          </div>

          <ol className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
            {[
              { num: "01", title: c.step1Title, desc: c.step1Desc },
              { num: "02", title: c.step2Title, desc: c.step2Desc },
              { num: "03", title: c.step3Title, desc: c.step3Desc },
            ].map(({ num, title, desc }) => (
              <li
                key={title}
                className="rounded-xl border border-border bg-background p-6"
              >
                <span className="text-sm font-semibold tabular-nums text-sapphire">{num}</span>
                <h3 className="mt-3 text-balance text-lg font-semibold tracking-tight text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Who the doctors are, and how the call is protected. */}
      <section aria-labelledby="medic-team-heading" className="border-b border-border bg-background py-12">
        <Container>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:items-start md:gap-12">
            <div className="max-w-xl">
              <h2 id="medic-team-heading" className="text-balance text-xl font-semibold text-foreground">
                {c.heading}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{c.desc}</p>
            </div>

            <div className="border-t border-border pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <p className="text-sm font-semibold text-foreground">{c.privacyTitle}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{c.privacyDesc}</p>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
