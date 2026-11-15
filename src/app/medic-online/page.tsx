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
    stepsTitle: string;
    stepsSubtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    previewHeading: string;
    smsSender: string;
    smsTime: string;
    smsBody: string;
    smsLinkText: string;
    adviceTitle: string;
    adviceDoctor: string;
    adviceItems: [string, string, string];
    heading: string;
    desc: string;
    privacyTitle: string;
    privacyDesc: string;
  }
> = {
  ru: {
    stepsTitle: "Как это работает",
    stepsSubtitle: "Бесплатно для всех, без банковской карты, страхового полиса и установки приложения.",
    step1Title: "Поговорите сейчас или выберите время",
    step1Desc: "Зайдите сразу в зал ожидания дежурного врача или запишитесь на 20-минутный звонок для себя или близкого.",
    step2Title: "Откройте ссылку из SMS в браузере",
    step2Desc: "Перед звонком мы пришлём прямую ссылку по SMS. Нажмите на неё на любом телефоне, без регистрации.",
    step3Title: "Сохраните письменные рекомендации",
    step3Desc: "После звонка врач отправит следующие шаги по SMS и сохранит их в вашем профиле.",
    previewHeading: "Пример SMS и письменных рекомендаций",
    smsSender: "SMS от RediHealth",
    smsTime: "14:15",
    smsBody: "Звонок с врачом Еленой Попеску начнётся в 14:20. Откройте в браузере:",
    smsLinkText: "redihealth.org/call",
    adviceTitle: "Письменные рекомендации после звонка",
    adviceDoctor: "Д-р Елена Попеску",
    adviceItems: [
      "Отдыхайте сегодня и регулярно пейте воду или тёплый чай.",
      "Парацетамол 500 мг каждые 6–8 часов при температуре выше 38 °C.",
      "Позвоните снова или обратитесь в клинику, если жар держится дольше 3 дней.",
    ],
    heading: "Лицензированные врачи",
    desc: "Врачи RediHealth — семейные врачи, педиатры и терапевты. Они работают как волонтёры и понятно объясняют, что делать.",
    privacyTitle: "Всё сказанное остаётся между вами и врачом",
    privacyDesc: "Звонки шифруются.",
  },

  ro: {
    stepsTitle: "Cum funcționează",
    stepsSubtitle: "Gratuit pentru oricine, fără cont bancar, card de sănătate sau aplicație de instalat.",
    step1Title: "Vorbești acum sau alegi o oră",
    step1Desc: "Intri în sala de așteptare a medicului de gardă sau programezi un apel de 20 de minute, pentru tine sau pentru familie.",
    step2Title: "Deschizi linkul primit prin SMS",
    step2Desc: "Îți trimitem un link direct înainte de apel. Apeși pe el din browser, pe orice telefon, fără cont.",
    step3Title: "Păstrezi sfaturile în scris",
    step3Desc: "După apel, medicul îți trimite pașii următori prin SMS și îi salvează în contul tău.",
    previewHeading: "Exemplu de SMS și sfaturi scrise",
    smsSender: "SMS de la RediHealth",
    smsTime: "14:15",
    smsBody: "Apelul cu dr. Elena Popescu începe la 14:20. Deschide în browser:",
    smsLinkText: "redihealth.org/apel",
    adviceTitle: "Sfaturi scrise după apel",
    adviceDoctor: "Dr. Elena Popescu",
    adviceItems: [
      "Odihnește-te astăzi și bea apă sau ceai cald des.",
      "Paracetamol 500 mg la nevoie, la 6–8 ore, dacă febra depășește 38 °C.",
      "Revino la apel sau la cabinet dacă febra ține mai mult de 3 zile.",
    ],
    heading: "Medici cu drept de practică",
    desc: "Medicii RediHealth sunt medici de familie, pediatri sau medici de medicină internă. Sunt voluntari și îți explică pe înțeles ce ai de făcut.",
    privacyTitle: "Ce spui rămâne între tine și medic",
    privacyDesc: "Apelurile sunt criptate.",
  },
  en: {
    stepsTitle: "How it works",
    stepsSubtitle: "Free for anyone, with no bank account, health card or app to install.",
    step1Title: "Talk now or choose a time",
    step1Desc: "Enter the on\u2011call waiting room right away or book a 20\u2011minute call for yourself or someone in your family.",
    step2Title: "Open the SMS link in your browser",
    step2Desc: "We text you a direct link before the call. Tap it on any phone, with no account needed.",
    step3Title: "Keep the advice in writing",
    step3Desc: "After the call, the doctor sends your next steps by SMS and saves them in your account.",
    previewHeading: "Sample SMS and written advice",
    smsSender: "SMS from RediHealth",
    smsTime: "14:15",
    smsBody: "Your call with Dr. Elena Popescu starts at 14:20. Open in your browser:",
    smsLinkText: "redihealth.org/call",
    adviceTitle: "Written advice after the call",
    adviceDoctor: "Dr. Elena Popescu",
    adviceItems: [
      "Rest today and drink water or warm tea regularly.",
      "Paracetamol 500 mg every 6 to 8 hours if needed for fever over 38 °C.",
      "Call again or visit a clinic if fever lasts longer than 3 days.",
    ],
    heading: "Licensed doctors",
    desc: "RediHealth doctors are family doctors, paediatricians or internal medicine doctors. They are volunteers and explain clearly what to do.",
    privacyTitle: "What you say stays between you and the doctor",
    privacyDesc: "Calls are encrypted.",
  },
  sq: {
    stepsTitle: "Si funksionon",
    stepsSubtitle: "Falas për këdo, pa llogari bankare, kartë shëndetësore apo aplikacion për t'u instaluar.",
    step1Title: "Flit tani ose zgjidh një orar",
    step1Desc: "Hyr menjëherë në dhomën e pritjes së mjekut kujdestar ose cakto një thirrje 20\u2011minutëshe për vete apo familjen.",
    step2Title: "Hap lidhjen me SMS në shfletues",
    step2Desc: "Të dërgojmë një lidhje të drejtpërdrejtë para thirrjes. Shtype në çdo telefon, pa pasur nevojë për llogari.",
    step3Title: "Mbaji këshillat me shkrim",
    step3Desc: "Pas thirrjes, mjeku të dërgon hapat e radhës me SMS dhe i ruan në llogarinë tënde.",
    previewHeading: "Shembull SMS dhe këshillash me shkrim",
    smsSender: "SMS nga RediHealth",
    smsTime: "14:15",
    smsBody: "Thirrja me dr. Elena Popescu fillon në 14:20. Hape në shfletues:",
    smsLinkText: "redihealth.org/call",
    adviceTitle: "Këshilla me shkrim pas thirrjes",
    adviceDoctor: "Dr. Elena Popescu",
    adviceItems: [
      "Pusho sot dhe pi shpesh ujë ose çaj të ngrohtë.",
      "Paracetamol 500 mg çdo 6 deri në 8 orë nëse nevojitet për temperaturë mbi 38 °C.",
      "Telefono përsëri ose shko në klinikë nëse temperatura zgjat më shumë se 3 ditë.",
    ],
    heading: "Mjekë me licencë",
    desc: "Mjekët e RediHealth janë mjekë familjeje, pediatër ose mjekë të sëmundjeve të brendshme. Janë vullnetarë dhe të shpjegojnë qartë çfarë të bësh.",
    privacyTitle: "Çfarë thua mbetet mes teje dhe mjekut",
    privacyDesc: "Thirrjet janë të enkriptuara.",
  },
  it: {
    stepsTitle: "Come funziona",
    stepsSubtitle: "Gratuito per tutti, senza conto in banca, tessera sanitaria né app da installare.",
    step1Title: "Parla ora o scegli un orario",
    step1Desc: "Entra subito nella sala d'attesa del medico di guardia o prenota una chiamata di 20 minuti per te o un familiare.",
    step2Title: "Apri il link SMS nel browser",
    step2Desc: "Prima della chiamata ti mandiamo un link diretto. Toccalo su qualsiasi telefono, senza creare un account.",
    step3Title: "Conserva i consigli per iscritto",
    step3Desc: "Dopo la chiamata, il medico ti invia i prossimi passi via SMS e li salva nel tuo account.",
    previewHeading: "Esempio di SMS e consigli scritti",
    smsSender: "SMS da RediHealth",
    smsTime: "14:15",
    smsBody: "La chiamata con la dott.ssa Elena Popescu inizia alle 14:20. Apri nel browser:",
    smsLinkText: "redihealth.org/call",
    adviceTitle: "Consigli scritti dopo la chiamata",
    adviceDoctor: "Dott.ssa Elena Popescu",
    adviceItems: [
      "Riposa oggi e bevi acqua o tè caldo con regolarità.",
      "Paracetamolo 500 mg ogni 6–8 ore se serve per febbre sopra i 38 °C.",
      "Richiama o vai in ambulatorio se la febbre dura più di 3 giorni.",
    ],
    heading: "Medici abilitati",
    desc: "I medici di RediHealth sono medici di famiglia, pediatri o internisti. Sono volontari e ti spiegano con chiarezza cosa fare.",
    privacyTitle: "Quello che dici resta tra te e il medico",
    privacyDesc: "Le chiamate sono criptate.",
  },
  hr: {
    stepsTitle: "Kako funkcionira",
    stepsSubtitle: "Besplatno za svakoga, bez bankovnog računa, zdravstvene iskaznice HZZO ili aplikacije za preuzimanje.",
    step1Title: "Razgovaraj sada ili odaberi termin",
    step1Desc: "Uđi odmah u čekaonicu dežurnog liječnika ili rezerviraj 20\u2011minutni poziv za sebe ili člana obitelji.",
    step2Title: "Otvori SMS poveznicu u pregledniku",
    step2Desc: "Prije poziva šaljemo ti izravnu poveznicu. Dodirni je na bilo kojem telefonu, bez prijave ili računa.",
    step3Title: "Sačuvaj pisane upute liječnika",
    step3Desc: "Nakon poziva liječnik ti šalje sljedeće korake SMS porukom i sprema ih na tvoj račun.",
    previewHeading: "Primjer SMS poruke i pisanih uputa",
    smsSender: "SMS od RediHealth",
    smsTime: "14:15",
    smsBody: "Poziv s dr. Elenom Popescu počinje u 14:20. Otvori u pregledniku:",
    smsLinkText: "redihealth.org/call",
    adviceTitle: "Pisani savjet nakon poziva",
    adviceDoctor: "Dr. Elena Popescu",
    adviceItems: [
      "Odmori se danas i redovito pij vodu ili topli čaj.",
      "Paracetamol 500 mg svakih 6 do 8 sati po potrebi za temperaturu iznad 38 °C.",
      "Javi se ponovno ili posjeti ambulantu ako temperatura traje dulje od 3 dana.",
    ],
    heading: "Licencirani liječnici",
    desc: "Liječnici na platformi RediHealth su obiteljski liječnici, pedijatri i internisti. Rade volonterski i jasno objašnjavaju što dalje.",
    privacyTitle: "Ono što kažeš ostaje između tebe i liječnika",
    privacyDesc: "Pozivi su šifrirani.",
  },
  rom: {
    stepsTitle: "Sar kerel buchi",
    stepsSubtitle: "Bi lovesko vash sakon, bi bankake kontosko, sastipnaske kartako vay aplikaciyako te thos.",
    step1Title: "De svato akana vay alosar chaso",
    step1Desc: "Khuv akana and-i azhukeripnaski soba e doktoreski vay alosar ekh svato 20 minutengo vash tuke vay chi familiya.",
    step2Title: "Putar o linko katar SMS and-o brauzero",
    step2Desc: "Anglal o svato bichhalas tuke direktno linko. Azba les pe sako telefono, bi kontosko.",
    step3Title: "Inker e sikavimata lekhavde",
    step3Desc: "Palo svato, o doktori bichhalel tuke e pash may dur katar SMS thaj garavel len ande cho konto.",
    previewHeading: "Misal SMS thaj lekhavde sikavimata",
    smsSender: "SMS katar RediHealth",
    smsTime: "14:15",
    smsBody: "O svato e dr. Elena Popescu shirdel ko 14:20. Putar and-o brauzero:",
    smsLinkText: "redihealth.org/call",
    adviceTitle: "Lekhavde sikavimata palo svato",
    adviceDoctor: "Dr. Elena Popescu",
    adviceItems: [
      "Hodisar tut avdive thaj pi may but pani vay tato chayo.",
      "Paracetamol 500 mg sako 6 zhi ko 8 chasurya kana o tatipen nakhel 38 °C.",
      "De svato palem vay zha ki klinika kana o tatipen inkerel may but katar 3 divesa.",
    ],
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
      {/* The two ways to talk to a doctor, with the pharmacy as a single quiet line below. */}
      <MedicOnlineHero />

      {/* How it works: asymmetric 2-column guide paired with an authentic SMS and written advice preview */}
      <section aria-labelledby="medic-steps-heading" className="border-b border-border bg-card py-12 sm:py-16">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-12 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,28rem)]">
            <div className="min-w-0">
              <h2 id="medic-steps-heading" className="text-balance text-section font-semibold text-foreground">
                {c.stepsTitle}
              </h2>
              <p className="mt-2 max-w-(--measure-lead) text-pretty text-body text-muted-foreground">
                {c.stepsSubtitle}
              </p>

              <ol className="mt-8 divide-y divide-border border-t border-border">
                {[
                  { title: c.step1Title, desc: c.step1Desc },
                  { title: c.step2Title, desc: c.step2Desc },
                  { title: c.step3Title, desc: c.step3Desc },
                ].map(({ title, desc }) => (
                  <li key={title} className="py-5 first:pt-5 last:pb-0">
                    <h3 className="text-balance text-title font-semibold text-foreground">
                      {title}
                    </h3>
                    <p className="mt-1.5 max-w-(--measure-reading) text-pretty text-body text-muted-foreground">
                      {desc}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            <aside
              aria-label={c.previewHeading}
              className="min-w-0 divide-y divide-border rounded-xl border border-border bg-background"
            >
              <div className="px-5 py-4 sm:px-6">
                <h3 className="text-balance text-title font-semibold text-foreground">
                  {c.previewHeading}
                </h3>
              </div>

              <div className="px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-meta font-semibold text-foreground">{c.smsSender}</p>
                  <span className="text-meta tabular-nums text-muted-foreground">{c.smsTime}</span>
                </div>
                <p className="mt-2 text-pretty text-body text-foreground">
                  {c.smsBody}{" "}
                  <span className="break-all font-mono text-meta font-medium text-sapphire underline decoration-sapphire/40 underline-offset-4 dark:text-sapphire-border dark:decoration-sapphire-border/40">
                    {c.smsLinkText}
                  </span>
                </p>
              </div>

              <div className="px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-meta font-semibold text-sapphire dark:text-sapphire-border">
                    {c.adviceTitle}
                  </p>
                  <span className="text-meta text-muted-foreground">{c.adviceDoctor}</span>
                </div>
                <ul className="mt-3 space-y-2 border-l border-border pl-3.5 text-body text-foreground">
                  {c.adviceItems.map((item) => (
                    <li key={item} className="text-pretty">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* Who the doctors are, and how the call is protected. */}
      <section aria-labelledby="medic-team-heading" className="border-b border-border bg-background py-12">
        <Container>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:items-start md:gap-12">
            <div className="max-w-xl">
              <h2 id="medic-team-heading" className="text-balance text-section font-semibold text-foreground">
                {c.heading}
              </h2>
              <p className="mt-2 text-body text-muted-foreground">{c.desc}</p>
            </div>

            <div className="border-t border-border pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <p className="text-body font-semibold text-foreground">{c.privacyTitle}</p>
              <p className="mt-0.5 text-body text-muted-foreground">{c.privacyDesc}</p>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
