"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReadAloud } from "@/components/health-check/readingTools";
import { Container } from "@/components/ui/Container";
import { ArrowLeftIcon, CalendarIcon, CheckCircleIcon, CheckIcon, ClockIcon, PhoneIcon, VolumeIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { playSoundCheck } from "./sound-check";
import { useOnCallStatus } from "./OnCallStatusBanner";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { translations, type Lang } from "@/lib/i18n/translations";

function useSafeLanguage() {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

export const queueCopy = {
  ru: {
    listen: "Слушать",
    stop: "Остановить",
    back: "Назад",
    doctorWillTakeYou: "Дежурный врач скоро примет вас",
    stayOnPage: "Держите эту страницу открытой. Когда врач будет готов, вы услышите короткий звук.",
    doctorReady: "Доктор ждет вас",
    pressButtonBelow: "Нажмите кнопку ниже, чтобы начать вызов.",
    positionText: (pos: number) => (pos > 0 ? `Ты номер ${pos} в очереди` : "Ты следующий"),
    estimatedTime: (pos: number) => `Время ожидания: ${pos > 1 ? "около 3–5 минут" : "меньше минуты"}`,
    enterNow: "Обратитесь к врачу",
    connectCall: "Войти в звонок",
    soundSuccess: "Звук работает",
    checkVolume: "Увеличьте громкость",
    testSoundButton: "Тестовый звук",
    closedTitle: "Ни один врач сейчас не на связи",
    closedBody: "Дежурный врач отвечает каждый день с 08:00 до 20:00. А пока вы можете записаться на прием к врачу.",
    book: "Забронировать звонок",
    prepHeading: "Что приготовить, пока ждешь",
    steps: [
      ["Держите коробки с рецептами или лекарствами рядом", "Врач может попросить вас прочитать название и дозу."],
      ["Проверьте свой микрофон", "Сядьте где-нибудь тихо. Если у вас есть наушники, наденьте их."],
      ["Подумайте, что сказать врачу", "Когда у вас появились симптомы и какие лекарства вы принимали."],
    ],
  },

  ro: {
    listen: "Ascultă",
    stop: "Oprește",
    back: "Înapoi",
    doctorWillTakeYou: "Medicul de gardă vine în curând",
    stayOnPage: "Nu închide pagina. Auzi un sunet scurt când medicul e gata.",
    doctorReady: "Medicul te așteaptă",
    pressButtonBelow: "Apasă butonul de mai jos ca să începi apelul.",
    positionText: (pos: number) => (pos > 0 ? `Ești persoana numărul ${pos} la rând` : "Urmezi acum"),
    estimatedTime: (pos: number) => `Mai ai de așteptat ${pos > 1 ? "cam 3–5 minute" : "sub un minut"}`,
    enterNow: "Intră la medic",
    connectCall: "Intră în apel",
    soundSuccess: "Sunetul merge",
    checkVolume: "Dă volumul mai tare",
    testSoundButton: "Testează sunetul",
    closedTitle: "Acum nu e niciun medic de gardă",
    closedBody: "Medicul de gardă răspunde zilnic, între 08:00 și 20:00. Până atunci, îți poți programa un apel cu medicul.",
    book: "Programează un apel",
    prepHeading: "Ce pregătești cât aștepți",
    steps: [
      ["Ține la îndemână rețeta sau cutiile de medicamente", "Medicul te poate ruga să-i citești numele și doza."],
      ["Verifică microfonul", "Stai într-un loc liniștit. Dacă ai căști, pune-le."],
      ["Gândește-te ce îi spui medicului", "De când ai simptomele și ce medicamente ai luat deja."],
    ],
  },
  en: {
    listen: "Listen",
    stop: "Stop",
    back: "Back",
    doctorWillTakeYou: "The on-call doctor will see you soon",
    stayOnPage: "Keep this page open. You will hear a short sound when the doctor is ready.",
    doctorReady: "The doctor is waiting for you",
    pressButtonBelow: "Press the button below to start the call.",
    positionText: (pos: number) => (pos > 0 ? `You are number ${pos} in line` : "You are next"),
    estimatedTime: (pos: number) => `Wait time: ${pos > 1 ? "about 3–5 minutes" : "under a minute"}`,
    enterNow: "See the doctor",
    connectCall: "Join the call",
    soundSuccess: "Sound works",
    checkVolume: "Turn your volume up",
    testSoundButton: "Test sound",
    closedTitle: "No doctor is on call right now",
    closedBody: "The on-call doctor answers every day from 08:00 to 20:00. Until then, you can book a call with a doctor.",
    book: "Book a call",
    prepHeading: "What to get ready while you wait",
    steps: [
      ["Keep your prescription or medicine boxes close", "The doctor may ask you to read out the name and dose."],
      ["Check your microphone", "Sit somewhere quiet. If you have headphones, put them on."],
      ["Think about what to tell the doctor", "When your symptoms started and which medicines you have taken."],
    ],
  },
  sq: {
    listen: "Dëgjo",
    stop: "Ndalo",
    back: "Kthehu",
    doctorWillTakeYou: "Mjeku kujdestar vjen së shpejti",
    stayOnPage: "Mos e mbyll faqen. Do të dëgjosh një zë të shkurtër kur mjeku të jetë gati.",
    doctorReady: "Mjeku të pret",
    pressButtonBelow: "Shtyp butonin më poshtë që të fillosh thirrjen.",
    positionText: (pos: number) => (pos > 0 ? `Je numri ${pos} në radhë` : "Tani e ke radhën"),
    estimatedTime: (pos: number) => `Do të presësh ${pos > 1 ? "rreth 3–5 minuta" : "më pak se një minutë"}`,
    enterNow: "Hyr te mjeku",
    connectCall: "Hyr në thirrje",
    soundSuccess: "Zëri punon",
    checkVolume: "Ngrije zërin e telefonit",
    testSoundButton: "Provo zërin",
    closedTitle: "Tani nuk ka mjek kujdestar",
    closedBody: "Mjeku kujdestar përgjigjet çdo ditë nga ora 08:00 deri në 20:00. Deri atëherë mund të caktosh një thirrje me mjekun.",
    book: "Cakto një thirrje",
    prepHeading: "Çfarë të përgatitësh ndërsa pret",
    steps: [
      ["Mbaj pranë recetën ose kutitë e ilaçeve", "Mjeku mund të të kërkojë të lexosh emrin dhe dozën."],
      ["Kontrollo mikrofonin", "Rri në një vend të qetë. Nëse ke kufje, vendosi."],
      ["Mendo çfarë do t'i thuash mjekut", "Kur filluan shqetësimet dhe çfarë ilaçesh ke marrë."],
    ],
  },
  it: {
    listen: "Ascolta",
    stop: "Ferma",
    back: "Indietro",
    doctorWillTakeYou: "Il medico di guardia arriva a breve",
    stayOnPage: "Non chiudere la pagina. Sentirai un breve suono quando il medico è pronto.",
    doctorReady: "Il medico ti aspetta",
    pressButtonBelow: "Premi il pulsante qui sotto per iniziare la chiamata.",
    positionText: (pos: number) => (pos > 0 ? `Sei il numero ${pos} in fila` : "Ora tocca a te"),
    estimatedTime: (pos: number) => `Attesa: ${pos > 1 ? "circa 3–5 minuti" : "meno di un minuto"}`,
    enterNow: "Entra dal medico",
    connectCall: "Entra nella chiamata",
    soundSuccess: "L'audio funziona",
    checkVolume: "Alza il volume",
    testSoundButton: "Prova l'audio",
    closedTitle: "Ora non c'è nessun medico di guardia",
    closedBody: "Il medico di guardia risponde tutti i giorni dalle 08:00 alle 20:00. Intanto puoi prenotare una chiamata con il medico.",
    book: "Prenota una chiamata",
    prepHeading: "Cosa preparare mentre aspetti",
    steps: [
      ["Tieni vicino la ricetta o le scatole dei farmaci", "Il medico può chiederti di leggere il nome e la dose."],
      ["Controlla il microfono", "Mettiti in un posto tranquillo. Se hai le cuffie, mettile."],
      ["Pensa a cosa dire al medico", "Da quando hai i sintomi e quali medicine hai già preso."],
    ],
  },
  hr: {
    listen: "Slušaj",
    stop: "Zaustavi",
    back: "Natrag",
    doctorWillTakeYou: "Dežurni liječnik uskoro će te primiti",
    stayOnPage: "Ne zatvaraj ovu stranicu. Čut ćeš kratak zvuk kada liječnik bude spreman.",
    doctorReady: "Liječnik te čeka",
    pressButtonBelow: "Pritisni gumb niže kako bi započeo poziv.",
    positionText: (pos: number) => (pos > 0 ? `U redu čekanja si broj ${pos}` : "Sada si na redu"),
    estimatedTime: (pos: number) => `Očekivano čekanje: ${pos > 1 ? "oko 3–5 minuta" : "manje od minute"}`,
    enterNow: "Javi se liječniku",
    connectCall: "Pridruži se pozivu",
    soundSuccess: "Zvuk radi",
    checkVolume: "Pojačaj glasnoću uređaja",
    testSoundButton: "Isprobaj zvuk",
    closedTitle: "Trenutačno nema dežurnog liječnika",
    closedBody: "Dežurni liječnik dostupan je svaki dan od 08:00 do 20:00. Do tada možeš rezervirati poziv s liječnikom.",
    book: "Rezerviraj poziv",
    prepHeading: "Što pripremiti dok čekaš",
    steps: [
      ["Pripremi recept ili kutije lijekova", "Liječnik te može zamoliti da pročitaš naziv i dozu."],
      ["Provjeri mikrofon", "Smjesti se na mirno mjesto. Ako imaš slušalice, stavi ih."],
      ["Razmisli što želiš reći liječniku", "Kada su simptomi počeli i koje si lijekove već uzeo."],
    ],
  },
  rom: {
    listen: "Shun",
    stop: "Ushtav",
    back: "Palpale",
    doctorWillTakeYou: "O doktori kay si pe buchi ka lel tut sigo",
    stayOnPage: "Ma phand kadi rig. Ka shunes xarno avazi kana o doktori si gata.",
    doctorReady: "O doktori azhukerel tut",
    pressButtonBelow: "Azba o butono tele te naches and-o svato.",
    positionText: (pos: number) => (pos > 0 ? `Tu san o gin ${pos} and-o rendo` : "Akana avel cho rendo"),
    estimatedTime: (pos: number) => `Azhukeripe: ${pos > 1 ? "pashe 3–5 minute" : "tela ekh minuta"}`,
    enterNow: "Khuves ko doktori",
    connectCall: "Khuves and-o svato",
    soundSuccess: "O avazi kerel buchi",
    checkVolume: "Vazde o avazi may zurales",
    testSoundButton: "Zumav o avazi",
    closedTitle: "Akana nane doktori pe buchi",
    closedBody: "O doktori del palpale sako dives katar 08:00 zhi ko 20:00. Zhi atunchi shay te alosares vrama vash svato e doktoresa.",
    book: "Alosar vrama vash svato",
    prepHeading: "So te getosares zhi kay azhukeres",
    steps: [
      ["Inker pashe e recepta vay e kutiye e drabenge", "O doktori shay te mangel te ginaves o anav thaj kobor les."],
      ["Dikh cho mikrofono", "Besh ko chiti than. Te si tut kanenge kufiye, tho len."],
      ["Gindisar so ka phenes e doktoreske", "Katar kana naches e simptome thaj save draba lyan vorta."],
    ],
  },
};

interface OnCallQueueLauncherProps {
  queueToken?: string;
  initialPosition?: number;
}

/**
 * Virtual waiting room. Shows the place in line (announced politely to screen readers),
 * a calm progress bar that eases forward with each step (transform only, no loop),
 * a sound check, and a short checklist of what to prepare.
 */
export function OnCallQueueLauncher({ queueToken = "ONCALL-102", initialPosition = 2 }: OnCallQueueLauncherProps) {
  const router = useRouter();
  const { lang } = useSafeLanguage();
  const copy = queueCopy[lang] ?? queueCopy.ro;
  const [position, setPosition] = useState(initialPosition);
  const [doctorConnected, setDoctorConnected] = useState(false);
  const [soundTested, setSoundTested] = useState(false);
  const [prepChecks, setPrepChecks] = useState<boolean[]>([false, false, false]);
  const roomId = useRef(`oncall-${queueToken.toLowerCase()}`);
  const { isOnDuty } = useOnCallStatus();
  const voice = useReadAloud(lang);

  // Demo queue: one step forward after 8 s, the doctor joins after 16 s with a short tone.
  // Outside duty hours nobody is on call, so the line does not move and the hours are shown instead.
  useEffect(() => {
    if (!isOnDuty) return;
    const stepTimer = setTimeout(() => setPosition(1), 8000);
    const callTimer = setTimeout(() => {
      setPosition(0);
      setDoctorConnected(true);
      playSoundCheck();
    }, 16000);
    return () => {
      clearTimeout(stepTimer);
      clearTimeout(callTimer);
    };
  }, [isOnDuty]);

  const readParts = [
    ...(isOnDuty ? [copy.doctorWillTakeYou, copy.stayOnPage] : [copy.closedTitle, copy.closedBody]),
    copy.prepHeading,
    ...copy.steps.flatMap(([title, desc]) => [title, desc]),
  ];

  const progress = doctorConnected ? 1 : position >= 2 ? 0.35 : position === 1 ? 0.75 : 0.95;

  return (
    <main id="main-content" className="flex-1 bg-background py-8 sm:py-12">
      <Container>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={withLangPrefix("/medic-online", lang)}
            className="press-row inline-flex min-h-11 max-w-full items-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-sm font-semibold text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeftIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 truncate">{copy.back}</span>
          </Link>
          {voice.available ? (
            <button
              type="button"
              onClick={() => (voice.speaking ? voice.stop() : voice.speak(readParts))}
              aria-pressed={voice.speaking}
              className="press-row inline-flex min-h-11 max-w-full items-center gap-1.5 whitespace-nowrap rounded-lg border border-border-control bg-background px-3 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <VolumeIcon className="h-4 w-4 shrink-0 text-sapphire" />
              <span className="min-w-0 truncate">{voice.speaking ? copy.stop : copy.listen}</span>
            </button>
          ) : null}
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start lg:gap-10">
          <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
            {isOnDuty ? (
              <>
                <h1 className="text-balance text-page text-foreground">{copy.doctorWillTakeYou}</h1>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{copy.stayOnPage}</p>

                <div className="mt-6 border-t border-border pt-6">
                  <div role="status" aria-live="polite" aria-atomic="true">
                    {doctorConnected ? (
                      <div className="flex items-start gap-3">
                        <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-sapphire" />
                        <div>
                          <p className="text-lg font-semibold text-foreground">{copy.doctorReady}</p>
                          <p className="mt-0.5 text-sm text-muted-foreground">{copy.pressButtonBelow}</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-semibold text-foreground tabular-nums">{copy.positionText(position)}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">{copy.estimatedTime(position)}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 h-1 w-full overflow-hidden rounded-sm bg-muted" aria-hidden="true">
                    <div
                      className="h-full w-full origin-left rounded-sm bg-sapphire transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-calm)] motion-reduce:transition-none"
                      style={{ transform: `scaleX(${progress})` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push(withLangPrefix(`/medic-online/meet/${roomId.current}`, lang))}
                  className={cn(
                    "press-solid mt-6 inline-flex min-h-12 w-full max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 text-sm font-semibold text-white transition-colors duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-5 sm:text-[0.9375rem]",
                    "bg-sapphire hover:bg-sapphire-light",
                  )}
                >
                  <PhoneIcon className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 truncate">{doctorConnected ? copy.enterNow : copy.connectCall}</span>
                </button>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <ClockIcon aria-hidden="true" className="mt-1.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <h1 className="text-balance text-page text-foreground">{copy.closedTitle}</h1>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground tabular-nums sm:text-base">{copy.closedBody}</p>
                  </div>
                </div>
                <Link
                  href={withLangPrefix("/medic-online/programare", lang)}
                  className="press-solid mt-6 inline-flex min-h-12 w-full max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-sapphire px-4 py-3 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-5 sm:text-[0.9375rem]"
                >
                  <CalendarIcon className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 truncate">{copy.book}</span>
                </Link>
              </>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <span className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
                {soundTested ? <CheckIcon className="h-4 w-4 text-sapphire" /> : null}
                {soundTested ? copy.soundSuccess : copy.checkVolume}
              </span>
              <button
                type="button"
                onClick={() => {
                  playSoundCheck();
                  setSoundTested(true);
                }}
                className="press-row inline-flex min-h-11 max-w-full items-center gap-1.5 whitespace-nowrap rounded-lg border border-border-control bg-background px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <VolumeIcon className="h-4 w-4 shrink-0 text-sapphire" />
                <span className="min-w-0 truncate">{copy.testSoundButton}</span>
              </button>
            </div>
          </section>

          <section aria-labelledby="queue-prep-heading" className="lg:sticky lg:top-[calc(var(--chrome-h,0px)+1.5rem)]">
            <h2 id="queue-prep-heading" className="text-balance text-title text-foreground">
              {copy.prepHeading}
            </h2>
            <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
              {copy.steps.map(([title, desc], i) => (
                <li key={title}>
                  <label className="press-row flex min-h-12 cursor-pointer items-start gap-3 p-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted/40">
                    <input
                      type="checkbox"
                      checked={prepChecks[i]}
                      onChange={() => setPrepChecks((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-border-control accent-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <span>
                      <span className={cn("block text-sm font-semibold", prepChecks[i] ? "text-muted-foreground" : "text-foreground")}>{title}</span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">{desc}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Container>
    </main>
  );
}
