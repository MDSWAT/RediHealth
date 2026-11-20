"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PhoneIcon, StethoscopeIcon } from "@/components/ui/icons";
import {
  buildJitsiEmbedUrl,
  PATIENT_VOICE_TOOLBAR,
  subscribeJitsiCallEnd,
} from "@/lib/jitsi-embed";
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

const roomCopy = {
  ru: {
    patient: "Пациент",
    endedTitle: "Звонок завершен",
    endedDesc: "Спасибо. Письменная консультация врача появится в вашем аккаунте.",
    seeAdvice: "Посмотреть совет",
    backHome: "Назад",
    permTitle: "Разрешите вашему браузеру использовать микрофон",
    permDesc: "Вы разговариваете с врачом только голосом, как по телефону. Ваш браузер попросит использовать микрофон.",
    permFree: "Звонок бесплатный",
    permNoRecording: "Звонок не записывается без вашего согласия",
    permHeadphones: "Если у вас есть наушники, наденьте их, чтобы лучше слышать",
    permAllow: "Разрешите и присоединяйтесь",
    permCancel: "Отмена",
    encryptedCall: "Шифрованный голосовой звонок",
    statusLine: (patient: string) => `Шифрованный звонок, ${patient}`,
    callTitle: "Позвонить врачу",
    voiceOnly: "Только голос, использует мало данных",
    emergency: "Чрезвычайная ситуация? Позвоните 112",
    endCall: "Завершить вызов",
  },

  ro: {
    patient: "Pacient",
    endedTitle: "Apelul s-a încheiat",
    endedDesc: "Mulțumim. Sfaturile scrise de medic apar în contul tău.",
    seeAdvice: "Vezi sfaturile",
    backHome: "Înapoi",
    permTitle: "Lasă browserul să folosească microfonul",
    permDesc: "Vorbești cu medicul doar prin voce, ca la telefon. Browserul îți cere voie să folosească microfonul.",
    permFree: "Apelul este gratuit",
    permNoRecording: "Apelul nu se înregistrează fără acordul tău",
    permHeadphones: "Dacă ai căști, pune-le: auzi mai bine",
    permAllow: "Permite și intră",
    permCancel: "Renunță",
    encryptedCall: "Apel vocal criptat",
    statusLine: (patient: string) => `Apel criptat, ${patient}`,
    callTitle: "Apel cu medicul",
    voiceOnly: "Doar voce, consumă puține date",
    emergency: "Urgență? Sună la 112",
    endCall: "Închide apelul",
  },
  en: {
    patient: "Patient",
    endedTitle: "The call has ended",
    endedDesc: "Thank you. The doctor's written advice will appear in your account.",
    seeAdvice: "See the advice",
    backHome: "Back",
    permTitle: "Let your browser use the microphone",
    permDesc: "You talk to the doctor by voice only, like on the phone. Your browser will ask to use the microphone.",
    permFree: "The call is free",
    permNoRecording: "The call is not recorded without your consent",
    permHeadphones: "If you have headphones, put them on to hear better",
    permAllow: "Allow and join",
    permCancel: "Cancel",
    encryptedCall: "Encrypted voice call",
    statusLine: (patient: string) => `Encrypted call, ${patient}`,
    callTitle: "Call with the doctor",
    voiceOnly: "Voice only, uses little data",
    emergency: "Emergency? Call 112",
    endCall: "End call",
  },
  sq: {
    patient: "Pacient",
    endedTitle: "Thirrja mbaroi",
    endedDesc: "Faleminderit. Këshillat me shkrim të mjekut do të dalin në llogarinë tënde.",
    seeAdvice: "Shiko këshillat",
    backHome: "Kthehu",
    permTitle: "Lejo shfletuesin të përdorë mikrofonin",
    permDesc: "Me mjekun flet vetëm me zë, si në telefon. Shfletuesi të kërkon leje për mikrofonin.",
    permFree: "Thirrja është falas",
    permNoRecording: "Thirrja nuk regjistrohet pa pëlqimin tënd",
    permHeadphones: "Nëse ke kufje, vendosi që të dëgjosh më mirë",
    permAllow: "Lejo dhe hyr",
    permCancel: "Anulo",
    encryptedCall: "Thirrje zanore e enkriptuar",
    statusLine: (patient: string) => `Thirrje e enkriptuar, ${patient}`,
    callTitle: "Thirrje me mjekun",
    voiceOnly: "Vetëm zë, harxhon pak të dhëna",
    emergency: "Urgjencë? Telefono 112",
    endCall: "Mbyll thirrjen",
  },
  it: {
    patient: "Paziente",
    endedTitle: "La chiamata è finita",
    endedDesc: "Grazie. I consigli scritti del medico compariranno nel tuo account.",
    seeAdvice: "Vedi i consigli",
    backHome: "Indietro",
    permTitle: "Fai usare al browser il microfono",
    permDesc: "Parli con il medico solo a voce, come al telefono. Il browser ti chiede il permesso di usare il microfono.",
    permFree: "La chiamata è gratuita",
    permNoRecording: "La chiamata non viene registrata senza il tuo consenso",
    permHeadphones: "Se hai le cuffie, mettile: senti meglio",
    permAllow: "Consenti ed entra",
    permCancel: "Annulla",
    encryptedCall: "Chiamata vocale criptata",
    statusLine: (patient: string) => `Chiamata criptata, ${patient}`,
    callTitle: "Chiamata con il medico",
    voiceOnly: "Solo voce, usa pochi dati",
    emergency: "Emergenza? Chiama il 112",
    endCall: "Chiudi la chiamata",
  },
  hr: {
    patient: "Pacijent",
    endedTitle: "Poziv je završen",
    endedDesc: "Hvala ti. Pisane upute liječnika pojavit će se na tvojem računu.",
    seeAdvice: "Pogledaj upute",
    backHome: "Natrag",
    permTitle: "Dopusti pregledniku korištenje mikrofona",
    permDesc: "S liječnikom razgovaraš isključivo glasom, kao na telefonu. Preglednik će zatražiti dopuštenje za mikrofon.",
    permFree: "Poziv je besplatan",
    permNoRecording: "Poziv se ne snima bez tvoje privole",
    permHeadphones: "Ako imaš slušalice, stavi ih kako bi bolje čuo",
    permAllow: "Dopusti i pridruži se",
    permCancel: "Odustani",
    encryptedCall: "Šifrirani glasovni poziv",
    statusLine: (patient: string) => `Šifrirani poziv, ${patient}`,
    callTitle: "Poziv s liječnikom",
    voiceOnly: "Samo glas, troši malo podatkovnog prometa",
    emergency: "Hitno stanje? Nazovi 112",
    endCall: "Završi poziv",
  },
  rom: {
    patient: "Paciento",
    endedTitle: "O svato getosardilo",
    endedDesc: "Nais tuke. E lekhavde sikavimata katar o doktori ka dikhlyon ande cho konto.",
    seeAdvice: "Dikh e sikavimata",
    backHome: "Palpale",
    permTitle: "Muk o brauzero te labarel o mikrofono",
    permDesc: "Des svato e doktoresa numay avazesa, sar ko telefono. O brauzero ka mangel muklipe vash o mikrofono.",
    permFree: "O svato si bi lovesko",
    permNoRecording: "O svato na arakhel pes bi che muklipnasko",
    permHeadphones: "Te si tut kanenge kufiye, tho len te shunes may mishto",
    permAllow: "Muk thaj khuves",
    permCancel: "Mekh",
    encryptedCall: "Garavdo avazesko svato",
    statusLine: (patient: string) => `Garavdo svato, ${patient}`,
    callTitle: "Svato e doktoresa",
    voiceOnly: "Numay avazi, xal zalag interneto",
    emergency: "Sigo pharipe? Mar 112",
    endCall: "Phand o svato",
  },
};

interface PublicVideoConsultationRoomProps {
  roomId: string;
  patientName?: string;
  /** The doctor's real name when the booking carries one; otherwise the room is simply "Call with the doctor". */
  doctorName?: string;
}

/**
 * The patient's call room. RediHealth consultations are voice only: a microphone permission step,
 * the call (Jitsi, started audio-only with no camera or duplicate hang-up button), and a short ending screen.
 * During the call the room covers the screen (with a 112 link in its header) so "End call" never falls below the fold.
 */
export function PublicVideoConsultationRoom({ roomId, patientName: patientNameProp, doctorName }: PublicVideoConsultationRoomProps) {
  const { lang } = useSafeLanguage();
  const copy = roomCopy[lang] ?? roomCopy.ro;
  const trimmedPatientName = patientNameProp?.trim();
  const statusSubtitle =
    trimmedPatientName && trimmedPatientName.toLowerCase() !== copy.patient.toLowerCase()
      ? copy.statusLine(trimmedPatientName)
      : copy.encryptedCall;
  const [hasPermissions, setHasPermissions] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // During the call the room covers the whole screen, so "End call" is always in reach; the page behind stays still.
  const inCall = hasPermissions && !callEnded;
  useEffect(() => {
    if (!inCall) return;
    window.scrollTo(0, 0);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [inCall]);

  useEffect(() => {
    if (!inCall) return;
    return subscribeJitsiCallEnd(iframeRef.current, 1, () => {
      setCallEnded(true);
    });
  }, [inCall]);

  const sanitizedRoom = roomId.replace(/[^a-zA-Z0-9-_]/g, "");
  const jitsiUrl = buildJitsiEmbedUrl({
    baseRoomUrl: `https://meet.jit.si/redihealth-${sanitizedRoom}`,
    apiId: 1,
    audioOnly: true,
    toolbarButtons: PATIENT_VOICE_TOOLBAR,
  });

  const requestMediaPermissions = async () => {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch {
      // A refused prompt must not lock the patient out: the call can still ask again.
    }
    setHasPermissions(true);
  };

  if (callEnded) {
    return (
      <main id="main-content" className="flex min-h-[100dvh] items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 sm:p-8">
          <h1 className="text-page font-semibold text-foreground">{copy.endedTitle}</h1>
          <p className="mt-1.5 text-body text-muted-foreground">{copy.endedDesc}</p>
          <div className="mt-6 space-y-3">
            <Button
              href={withLangPrefix("/contul-meu", lang)}
              variant="action"
              size="md"
              fullWidth
            >
              {copy.seeAdvice}
            </Button>
            <Button
              href={withLangPrefix("/medic-online", lang)}
              variant="outline"
              size="md"
              fullWidth
            >
              {copy.backHome}
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (!hasPermissions) {
    return (
      <main id="main-content" className="flex min-h-[70dvh] items-center justify-center bg-background px-4 py-10 sm:py-16">
        <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 sm:p-8">
          <PhoneIcon className="h-6 w-6 text-sapphire" />
          <h1 className="mt-4 text-balance text-page font-semibold text-foreground">{copy.permTitle}</h1>
          <p className="mt-2 text-body text-muted-foreground">{copy.permDesc}</p>

          <ul className="mt-6 list-disc space-y-2 border-t border-border pl-5 pt-5 text-body text-muted-foreground">
            {[copy.permFree, copy.permNoRecording, copy.permHeadphones].map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-center gap-2">
            <Button
              type="button"
              variant="action"
              size="lg"
              fullWidth
              onClick={requestMediaPermissions}
            >
              {copy.permAllow}
            </Button>
            <Link
              href={withLangPrefix("/medic-online", lang)}
              className="inline-flex min-h-[44px] items-center whitespace-nowrap rounded-sm px-2 text-body text-muted-foreground underline underline-offset-4 transition-colors duration-[var(--dur-fast)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copy.permCancel}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.callTitle}
      className="fixed inset-0 z-[60] flex h-[100dvh] w-full flex-col overflow-hidden bg-ink-950 text-paper"
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-paper/10 bg-ink-950 px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <StethoscopeIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-live-sage" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-body font-semibold text-paper">{doctorName ?? copy.callTitle}</h1>
          <p className="truncate text-meta text-mist">{statusSubtitle}</p>
        </div>
        <a
          href="tel:112"
          aria-label={copy.emergency}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-body font-semibold text-ruby-300 transition-colors duration-[var(--dur-fast)] hover:text-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/70"
        >
          <PhoneIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span className="sm:hidden">112</span>
          <span className="hidden sm:inline">{copy.emergency}</span>
        </a>
      </header>

      <main id="main-content" className="relative min-h-0 flex-1 overflow-hidden bg-ink-950">
        <iframe
          ref={iframeRef}
          src={jitsiUrl}
          title={copy.callTitle}
          allow="microphone; autoplay"
          scrolling="no"
          style={{ colorScheme: "dark" }}
          className="block h-full w-full overflow-hidden border-0 bg-ink-950"
        />
      </main>

      <div
        data-room-dock
        className="flex shrink-0 items-center justify-between gap-3 border-t border-paper/10 bg-ink-950 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]"
      >
        <p className="flex min-w-0 items-center gap-2 text-meta text-mist">
          <PhoneIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span>{copy.voiceOnly}</span>
        </p>
        <button
          type="button"
          onClick={() => setCallEnded(true)}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-card px-4 text-body font-semibold text-ink-950 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
        >
          {copy.endCall}
        </button>
      </div>
    </div>
  );
}
