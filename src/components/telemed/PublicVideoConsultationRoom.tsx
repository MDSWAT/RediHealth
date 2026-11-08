"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircleIcon, CheckIcon, PhoneIcon } from "@/components/ui/icons";
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
    statusLine: (patient: string, room: string) => `Apel criptat · Pacient: ${patient} · Sala: ${room}`,
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
    statusLine: (patient: string, room: string) => `Encrypted call · Patient: ${patient} · Room: ${room}`,
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
    statusLine: (patient: string, room: string) => `Thirrje e enkriptuar · Pacienti: ${patient} · Dhoma: ${room}`,
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
    statusLine: (patient: string, room: string) => `Chiamata criptata · Paziente: ${patient} · Stanza: ${room}`,
    callTitle: "Chiamata con il medico",
    voiceOnly: "Solo voce, usa pochi dati",
    emergency: "Emergenza? Chiama il 112",
    endCall: "Chiudi la chiamata",
  },
};

interface PublicVideoConsultationRoomProps {
  roomId: string;
  patientName?: string;
  /** The doctor's real name when the booking carries one; otherwise the room is simply "Call with the doctor". */
  doctorName?: string;
}

/** Jitsi toolbar limited to the microphone, hang-up and device settings: the consultation is voice only. */
const JITSI_TOOLBAR = encodeURIComponent(JSON.stringify(["microphone", "hangup", "settings"]));

/**
 * The patient's call room. RediHealth consultations are voice only: a microphone permission step,
 * the call (Jitsi, started audio-only with no camera button), and a short ending screen.
 * During the call the room covers the screen (with a 112 link in its header) so "End call" never falls below the fold.
 */
export function PublicVideoConsultationRoom({ roomId, patientName: patientNameProp, doctorName }: PublicVideoConsultationRoomProps) {
  const { lang } = useSafeLanguage();
  const copy = roomCopy[lang] ?? roomCopy.ro;
  const patientName = patientNameProp ?? copy.patient;
  const [hasPermissions, setHasPermissions] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  // During the call the room covers the whole screen, so "End call" is always in reach; the page behind stays still.
  const inCall = hasPermissions && !callEnded;
  useEffect(() => {
    if (!inCall) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [inCall]);

  const sanitizedRoom = roomId.replace(/[^a-zA-Z0-9-_]/g, "");
  const jitsiUrl =
    `https://meet.jit.si/redihealth-${sanitizedRoom}#config.prejoinPageEnabled=false&config.disableDeepLinking=true` +
    `&config.startAudioOnly=true&config.startWithVideoMuted=true&config.toolbarButtons=${JITSI_TOOLBAR}`;

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
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-sapphire" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">{copy.endedTitle}</h1>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{copy.endedDesc}</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <Link
              href={withLangPrefix("/contul-meu", lang)}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-sapphire px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {copy.seeAdvice}
            </Link>
            <Link
              href={withLangPrefix("/medic-online", lang)}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copy.backHome}
            </Link>
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
          <h1 className="mt-4 text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{copy.permTitle}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.permDesc}</p>

          <ul className="mt-6 space-y-2 border-t border-border pt-5 text-sm text-muted-foreground">
            {[copy.permFree, copy.permNoRecording, copy.permHeadphones].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-sapphire" />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={requestMediaPermissions}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-sapphire px-5 py-3 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {copy.permAllow}
            </button>
            <Link
              href={withLangPrefix("/medic-online", lang)}
              className="inline-flex min-h-[44px] items-center rounded-sm px-2 text-sm text-muted-foreground underline underline-offset-4 transition-colors duration-[var(--dur-fast)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
      className="fixed inset-0 z-[60] flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-950 text-white"
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-slate-950 px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <span aria-hidden="true" className="inline-block h-2 w-2 shrink-0 rounded-full bg-live-sage" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold text-white">{doctorName ?? copy.callTitle}</h1>
          <p className="truncate text-xs text-slate-400">{copy.statusLine(patientName, roomId)}</p>
        </div>
        <a
          href="tel:112"
          className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-red-300 transition-colors duration-[var(--dur-fast)] hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <PhoneIcon className="h-4 w-4" />
          {copy.emergency}
        </a>
      </header>

      <main id="main-content" className="relative min-h-0 flex-1 bg-slate-950">
        <iframe
          src={jitsiUrl}
          title={copy.callTitle}
          allow="microphone; autoplay"
          className="h-full w-full border-0"
        />
      </main>

      <div
        data-room-dock
        className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 bg-slate-950 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]"
      >
        <p className="flex min-w-0 items-center gap-2 text-xs text-slate-400">
          <PhoneIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span>{copy.voiceOnly}</span>
        </p>
        <button
          type="button"
          onClick={() => setCallEnded(true)}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-slate-950 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          {copy.endCall}
        </button>
      </div>
    </div>
  );
}
