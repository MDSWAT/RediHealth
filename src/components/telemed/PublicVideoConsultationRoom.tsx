"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircleIcon, CheckIcon, MessageDotsIcon, PhoneIcon, VideoIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { AdaptiveBandwidthGuard } from "./AdaptiveBandwidthGuard";
import { InCallConsultationChat } from "./InCallConsultationChat";
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
    endedTitle: "Consultația s-a încheiat",
    endedDesc: "Mulțumim. Sfaturile scrise de medic apar în contul tău.",
    seeAdvice: "Vezi sfaturile",
    backHome: "Înapoi",
    permTitle: "Lasă browserul să folosească camera și microfonul",
    permDesc: (doctor: string) => `Ca să vorbești cu ${doctor}, telefonul îți cere voie pentru imagine și sunet.`,
    permFree: "Apelul este gratuit",
    permNoRecording: "Apelul nu se înregistrează fără acordul tău",
    permAllow: "Permite și intră",
    permCancel: "Renunță",
    statusLine: (patient: string, room: string) => `Apel criptat · Pacient: ${patient} · Camera: ${room}`,
    iframeTitle: "Consultație video",
    audioOnlyTitle: "Doar voce (consumă mai puține date)",
    audioOnlyActive: "Doar voce",
    chat: "Mesaje și poze",
    endCall: "Închide apelul",
  },
  en: {
    patient: "Patient",
    endedTitle: "The appointment has ended",
    endedDesc: "Thank you. The doctor's written advice will appear in your account.",
    seeAdvice: "See the advice",
    backHome: "Back",
    permTitle: "Let your browser use the camera and microphone",
    permDesc: (doctor: string) => `To talk to ${doctor}, your phone will ask permission to use video and sound.`,
    permFree: "The call is free",
    permNoRecording: "The call is not recorded without your consent",
    permAllow: "Allow and join",
    permCancel: "Cancel",
    statusLine: (patient: string, room: string) => `Encrypted call · Patient: ${patient} · Room: ${room}`,
    iframeTitle: "Video appointment",
    audioOnlyTitle: "Voice only (uses less data)",
    audioOnlyActive: "Voice only",
    chat: "Messages and photos",
    endCall: "End call",
  },
  sq: {
    patient: "Pacient",
    endedTitle: "Vizita mbaroi",
    endedDesc: "Faleminderit. Këshillat me shkrim të mjekut do të dalin në llogarinë tënde.",
    seeAdvice: "Shiko këshillat",
    backHome: "Kthehu",
    permTitle: "Lejo shfletuesin të përdorë kamerën dhe mikrofonin",
    permDesc: (doctor: string) => `Që të flasësh me ${doctor}, telefoni të kërkon leje për figurën dhe zërin.`,
    permFree: "Thirrja është falas",
    permNoRecording: "Thirrja nuk regjistrohet pa pëlqimin tënd",
    permAllow: "Lejo dhe hyr",
    permCancel: "Anulo",
    statusLine: (patient: string, room: string) => `Thirrje e enkriptuar · Pacienti: ${patient} · Dhoma: ${room}`,
    iframeTitle: "Vizitë me video",
    audioOnlyTitle: "Vetëm zë (harxhon më pak të dhëna)",
    audioOnlyActive: "Vetëm zë",
    chat: "Mesazhe dhe foto",
    endCall: "Mbyll thirrjen",
  },
  it: {
    patient: "Paziente",
    endedTitle: "La visita è finita",
    endedDesc: "Grazie. I consigli scritti del medico compariranno nel tuo account.",
    seeAdvice: "Vedi i consigli",
    backHome: "Indietro",
    permTitle: "Fai usare al browser fotocamera e microfono",
    permDesc: (doctor: string) => `Per parlare con ${doctor}, il telefono ti chiede il permesso per video e audio.`,
    permFree: "La chiamata è gratuita",
    permNoRecording: "La chiamata non viene registrata senza il tuo consenso",
    permAllow: "Consenti ed entra",
    permCancel: "Annulla",
    statusLine: (patient: string, room: string) => `Chiamata criptata · Paziente: ${patient} · Stanza: ${room}`,
    iframeTitle: "Visita in video",
    audioOnlyTitle: "Solo voce (usa meno dati)",
    audioOnlyActive: "Solo voce",
    chat: "Messaggi e foto",
    endCall: "Chiudi la chiamata",
  },
};

interface PublicVideoConsultationRoomProps {
  roomId: string;
  patientName?: string;
  doctorName?: string;
}

const dockButton =
  "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:text-sm";

/**
 * The patient's video room: a permission step, the call (Jitsi, which brings its own
 * microphone, camera and hang-up controls), and a short ending screen.
 * Our dock only adds what the call itself does not: voice-only mode, messages, ending the visit.
 * No fake controls: microphone and camera are switched inside the call, where they actually work.
 */
export function PublicVideoConsultationRoom({
  roomId,
  patientName: patientNameProp,
  doctorName = "Dr. Mihai Ionescu",
}: PublicVideoConsultationRoomProps) {
  const { lang } = useSafeLanguage();
  const copy = roomCopy[lang] ?? roomCopy.ro;
  const patientName = patientNameProp ?? copy.patient;
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  // No bandwidth probe yet: the guard only reacts once one reports a weak connection.
  const [isLowBandwidth] = useState(false);

  const sanitizedRoom = roomId.replace(/[^a-zA-Z0-9-_]/g, "");
  // Voice-only really stops video: the call rejoins with Jitsi's audio-only start option.
  const jitsiUrl =
    `https://meet.jit.si/redihealth-${sanitizedRoom}#config.prejoinPageEnabled=false&config.disableDeepLinking=true` +
    (isAudioOnly ? "&config.startAudioOnly=true" : "");

  const requestMediaPermissions = async () => {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
      <main id="main-content" className="flex min-h-[100dvh] items-center justify-center bg-slate-950 p-4 text-white">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 sm:p-8">
          <VideoIcon className="h-7 w-7 text-sapphire-border" />
          <h1 className="mt-4 text-balance text-xl font-semibold tracking-tight text-white sm:text-2xl">{copy.permTitle}</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{copy.permDesc(doctorName)}</p>

          <ul className="mt-6 space-y-2 border-t border-white/10 pt-5 text-sm text-slate-300">
            {[copy.permFree, copy.permNoRecording].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-sapphire-border" />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={requestMediaPermissions}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-sapphire px-5 py-3 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              {copy.permAllow}
            </button>
            <Link
              href={withLangPrefix("/medic-online", lang)}
              className="inline-flex min-h-[44px] items-center rounded-sm px-2 text-sm text-slate-400 underline underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              {copy.permCancel}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-950 text-white">
      <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-slate-950 px-4 py-2.5">
        <span aria-hidden="true" className="inline-block h-2 w-2 shrink-0 rounded-full bg-live-sage" />
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-white">{doctorName}</h1>
          <p className="truncate text-xs text-slate-400">{copy.statusLine(patientName, roomId)}</p>
        </div>
      </header>

      <main id="main-content" className="relative min-h-0 flex-1 bg-slate-950">
        <iframe
          key={isAudioOnly ? "audio" : "video"}
          src={jitsiUrl}
          title={copy.iframeTitle}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          allowFullScreen
          className="h-full w-full border-0"
        />
        <AdaptiveBandwidthGuard isLowBandwidth={isLowBandwidth} audioOnlyMode={isAudioOnly} onToggleAudioOnly={setIsAudioOnly} />
      </main>

      <footer className="flex shrink-0 justify-center border-t border-white/10 bg-slate-950 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-pressed={isAudioOnly}
            title={copy.audioOnlyTitle}
            onClick={() => setIsAudioOnly((v) => !v)}
            className={cn(dockButton, isAudioOnly ? "bg-sapphire text-white" : "bg-white/10 text-white hover:bg-white/15")}
          >
            <PhoneIcon className="h-4 w-4" />
            {copy.audioOnlyActive}
          </button>
          <button
            type="button"
            aria-expanded={isChatOpen}
            onClick={() => setIsChatOpen((v) => !v)}
            className={cn(dockButton, "bg-white/10 text-white hover:bg-white/15")}
          >
            <MessageDotsIcon className="h-4 w-4" />
            {copy.chat}
          </button>
          <button type="button" onClick={() => setCallEnded(true)} className={cn(dockButton, "bg-red-600 px-4 text-white hover:bg-red-700")}>
            {copy.endCall}
          </button>
        </div>
      </footer>

      <InCallConsultationChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} doctorName={doctorName} />
    </div>
  );
}
