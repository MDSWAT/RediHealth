"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, CheckIcon, VideoIcon, VolumeIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { playSoundCheck } from "./sound-check";
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

const queueCopy = {
  ro: {
    doctorWillTakeYou: "Medicul de gardă vine în curând",
    stayOnPage: "Nu închide pagina. Auzi un sunet scurt când medicul e gata.",
    doctorReady: "Medicul te așteaptă",
    pressButtonBelow: "Apasă butonul de mai jos ca să începi apelul.",
    positionText: (pos: number) => (pos > 0 ? `Ești persoana numărul ${pos} la rând` : "Urmezi acum"),
    estimatedTime: (pos: number) => `Mai ai de așteptat ${pos > 1 ? "cam 3–5 minute" : "sub un minut"}`,
    enterNow: "Intră la medic",
    connectVideo: "Intră în apel",
    soundSuccess: "Sunetul merge",
    checkVolume: "Dă volumul mai tare",
    testSoundButton: "Testează sunetul",
    prepHeading: "Ce pregătești cât aștepți",
    steps: [
      ["Pregătește actul de identitate sau rețeta", "Le poți arăta medicului la camera telefonului."],
      ["Verifică microfonul și camera", "Stai într-un loc luminos și cât mai liniștit."],
      ["Gândește-te ce îi spui medicului", "De când ai simptomele și ce medicamente ai luat deja."],
    ],
  },
  en: {
    doctorWillTakeYou: "The on-call doctor will see you soon",
    stayOnPage: "Keep this page open. You will hear a short sound when the doctor is ready.",
    doctorReady: "The doctor is waiting for you",
    pressButtonBelow: "Press the button below to start the call.",
    positionText: (pos: number) => (pos > 0 ? `You are number ${pos} in line` : "You are next"),
    estimatedTime: (pos: number) => `Wait time: ${pos > 1 ? "about 3–5 minutes" : "under a minute"}`,
    enterNow: "See the doctor",
    connectVideo: "Join the call",
    soundSuccess: "Sound works",
    checkVolume: "Turn your volume up",
    testSoundButton: "Test sound",
    prepHeading: "What to get ready while you wait",
    steps: [
      ["Get your ID or prescription ready", "You can show them to the doctor on your phone camera."],
      ["Check your microphone and camera", "Sit somewhere bright and as quiet as you can."],
      ["Think about what to tell the doctor", "When your symptoms started and which medicines you have taken."],
    ],
  },
  sq: {
    doctorWillTakeYou: "Mjeku kujdestar vjen së shpejti",
    stayOnPage: "Mos e mbyll faqen. Do të dëgjosh një zë të shkurtër kur mjeku të jetë gati.",
    doctorReady: "Mjeku të pret",
    pressButtonBelow: "Shtyp butonin më poshtë që të fillosh thirrjen.",
    positionText: (pos: number) => (pos > 0 ? `Je numri ${pos} në radhë` : "Tani e ke radhën"),
    estimatedTime: (pos: number) => `Do të presësh ${pos > 1 ? "rreth 3–5 minuta" : "më pak se një minutë"}`,
    enterNow: "Hyr te mjeku",
    connectVideo: "Hyr në thirrje",
    soundSuccess: "Zëri punon",
    checkVolume: "Ngrije zërin e telefonit",
    testSoundButton: "Provo zërin",
    prepHeading: "Çfarë të përgatitësh ndërsa pret",
    steps: [
      ["Mbaj gati letërnjoftimin ose recetën", "Mund t'ia tregosh mjekut në kamerën e telefonit."],
      ["Kontrollo mikrofonin dhe kamerën", "Rri në një vend me dritë dhe sa më të qetë."],
      ["Mendo çfarë do t'i thuash mjekut", "Kur filluan shqetësimet dhe çfarë ilaçesh ke marrë."],
    ],
  },
  it: {
    doctorWillTakeYou: "Il medico di turno arriva a breve",
    stayOnPage: "Non chiudere la pagina. Sentirai un breve suono quando il medico è pronto.",
    doctorReady: "Il medico ti aspetta",
    pressButtonBelow: "Premi il pulsante qui sotto per iniziare la chiamata.",
    positionText: (pos: number) => (pos > 0 ? `Sei il numero ${pos} in fila` : "Ora tocca a te"),
    estimatedTime: (pos: number) => `Attesa: ${pos > 1 ? "circa 3–5 minuti" : "meno di un minuto"}`,
    enterNow: "Entra dal medico",
    connectVideo: "Entra nella chiamata",
    soundSuccess: "L'audio funziona",
    checkVolume: "Alza il volume",
    testSoundButton: "Prova l'audio",
    prepHeading: "Cosa preparare mentre aspetti",
    steps: [
      ["Tieni pronti il documento o la ricetta", "Puoi mostrarli al medico con la fotocamera del telefono."],
      ["Controlla microfono e fotocamera", "Mettiti in un posto luminoso e il più possibile tranquillo."],
      ["Pensa a cosa dire al medico", "Da quando hai i sintomi e quali medicine hai già preso."],
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

  // Demo queue: one step forward after 8 s, the doctor joins after 16 s with a short tone.
  useEffect(() => {
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
  }, []);

  const progress = doctorConnected ? 1 : position >= 2 ? 0.35 : position === 1 ? 0.75 : 0.95;

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">{copy.doctorWillTakeYou}</h1>
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

          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
            <div
              className="h-full w-full origin-left rounded-full bg-sapphire transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-calm)] motion-reduce:transition-none"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push(withLangPrefix(`/medic-online/meet/${roomId.current}`, lang))}
          className={cn(
            "mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white transition-colors duration-[var(--dur-base)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            doctorConnected ? "bg-primary hover:bg-primary-hover" : "bg-sapphire hover:bg-sapphire-light",
          )}
        >
          <VideoIcon className="h-5 w-5" />
          {doctorConnected ? copy.enterNow : copy.connectVideo}
        </button>

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
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <VolumeIcon className="h-4 w-4 text-sapphire" />
            {copy.testSoundButton}
          </button>
        </div>
      </section>

      <section aria-labelledby="queue-prep-heading" className="mt-8">
        <h2 id="queue-prep-heading" className="text-base font-semibold text-foreground">
          {copy.prepHeading}
        </h2>
        <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
          {copy.steps.map(([title, desc], i) => (
            <li key={title}>
              <label className="flex cursor-pointer items-start gap-3 p-4 transition-colors duration-[var(--dur-fast)] hover:bg-muted/40">
                <input
                  type="checkbox"
                  checked={prepChecks[i]}
                  onChange={() => setPrepChecks((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-border accent-sapphire"
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
    </main>
  );
}
