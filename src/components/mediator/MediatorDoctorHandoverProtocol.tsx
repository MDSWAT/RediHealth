"use client";

import { useState } from "react";
import { VideoIcon, AlertCircleIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";

function useSafeLanguage() {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

const handoverCopy = {
  ro: {
    liveStatus: "Medicul de gardă e conectat",
    endCall: "Închide apelul",
    iframeTitle: "Apel video cu medicul",
    sidePanelLabel: "Sprijin în timpul apelului",
    patientLine: (name: string, age: string) => `Pacient: ${name} (${age})`,
    translation: "Traducere:",
    translationLanguage: "romani (romanes)",
    bp: "TA",
    pulse: "Puls",
    glucose: "Glicemie",
    temp: "Temp",
    liveNotesLabel: "Notițe din apel",
    tabletTip: "Ține tableta spre pacient, ca medicul să-l vadă bine.",
    title: "Predare către medicul de gardă",
    subtitle: "Medicul vede aceste date înainte să înceapă apelul video.",
    nameLabel: "Nume pacient",
    ageLabel: "Vârstă",
    vitalsLabel: "Valori măsurate la pacient",
    reasonLabel: "Motivul apelului",
    languageBarrier: "Are nevoie de traducere",
    languageHelp: "Mediatorul traduce în limba romani (romanes).",
    notesLabel: "Alte observații",
    submitting: "Se trimit datele…",
    submit: "Pornește apelul video",
    sendError: "Datele nu s-au trimis. Încearcă din nou.",
    connectError: "Medicul nu s-a putut conecta. Încearcă din nou.",
    demoAge: "68 ani",
    demoReason: "Amețeli dimineața și durere de ceafă la efort",
    demoNotes: "Colaborează. A luat ultima pastilă de enalapril ieri dimineață.",
  },
  en: {
    liveStatus: "Doctor on call connected",
    endCall: "End call",
    iframeTitle: "Video call with the doctor",
    sidePanelLabel: "Support during the call",
    patientLine: (name: string, age: string) => `Patient: ${name} (${age})`,
    translation: "Translation:",
    translationLanguage: "Romani (Romanes)",
    bp: "BP",
    pulse: "Pulse",
    glucose: "Blood sugar",
    temp: "Temp",
    liveNotesLabel: "Call notes",
    tabletTip: "Keep the tablet facing the patient so the doctor can see them well.",
    title: "Handover to the doctor on call",
    subtitle: "The doctor sees this before the video call starts.",
    nameLabel: "Patient name",
    ageLabel: "Age",
    vitalsLabel: "Values measured at the visit",
    reasonLabel: "Reason for the call",
    languageBarrier: "Needs translation",
    languageHelp: "The mediator translates into Romani (Romanes).",
    notesLabel: "Other notes",
    submitting: "Sending data…",
    submit: "Start video call",
    sendError: "The data was not sent. Try again.",
    connectError: "Could not connect the doctor. Try again.",
    demoAge: "68 years",
    demoReason: "Dizzy in the mornings, pain at the back of the neck on effort",
    demoNotes: "Cooperative. Took her last enalapril tablet yesterday morning.",
  },
  sq: {
    liveStatus: "Mjeku i turnit është lidhur",
    endCall: "Mbyll thirrjen",
    iframeTitle: "Thirrje video me mjekun",
    sidePanelLabel: "Ndihmë gjatë thirrjes",
    patientLine: (name: string, age: string) => `Pacienti: ${name} (${age})`,
    translation: "Përkthim:",
    translationLanguage: "gjuha rome (romanes)",
    bp: "TA",
    pulse: "Pulsi",
    glucose: "Sheqeri në gjak",
    temp: "Temp",
    liveNotesLabel: "Shënime nga thirrja",
    tabletTip: "Mbaje tabletin drejt pacientit që mjeku ta shohë mirë.",
    title: "Dorëzimi te mjeku i turnit",
    subtitle: "Mjeku i sheh këto të dhëna para se të nisë thirrja video.",
    nameLabel: "Emri i pacientit",
    ageLabel: "Mosha",
    vitalsLabel: "Vlerat e matura te pacienti",
    reasonLabel: "Arsyeja e thirrjes",
    languageBarrier: "Ka nevojë për përkthim",
    languageHelp: "Ndërmjetësi përkthen në gjuhën rome (romanes).",
    notesLabel: "Shënime të tjera",
    submitting: "Po dërgohen të dhënat…",
    submit: "Nis thirrjen video",
    sendError: "Të dhënat nuk u dërguan. Provo përsëri.",
    connectError: "Mjeku nuk u lidh dot. Provo përsëri.",
    demoAge: "68 vjeç",
    demoReason: "Marramendje në mëngjes dhe dhimbje në zverk kur lodhet",
    demoNotes: "Bashkëpunon. Pilulën e fundit të enalaprilit e mori dje në mëngjes.",
  },
  it: {
    liveStatus: "Medico di turno collegato",
    endCall: "Chiudi la chiamata",
    iframeTitle: "Videochiamata con il medico",
    sidePanelLabel: "Supporto durante la chiamata",
    patientLine: (name: string, age: string) => `Paziente: ${name} (${age})`,
    translation: "Traduzione:",
    translationLanguage: "romanì (romanes)",
    bp: "PA",
    pulse: "Polso",
    glucose: "Glicemia",
    temp: "Temp",
    liveNotesLabel: "Note della chiamata",
    tabletTip: "Tieni il tablet rivolto al paziente, così il medico lo vede bene.",
    title: "Passaggio al medico di turno",
    subtitle: "Il medico vede questi dati prima della videochiamata.",
    nameLabel: "Nome del paziente",
    ageLabel: "Età",
    vitalsLabel: "Valori misurati alla visita",
    reasonLabel: "Motivo della chiamata",
    languageBarrier: "Serve la traduzione",
    languageHelp: "Il mediatore traduce in romanì (romanes).",
    notesLabel: "Altre note",
    submitting: "Invio dei dati…",
    submit: "Avvia la videochiamata",
    sendError: "I dati non sono stati inviati. Riprova.",
    connectError: "Impossibile collegare il medico. Riprova.",
    demoAge: "68 anni",
    demoReason: "Capogiri al mattino e dolore alla nuca sotto sforzo",
    demoNotes: "Collabora. Ha preso l'ultima compressa di enalapril ieri mattina.",
  },
};

interface MediatorDoctorHandoverProtocolProps {
  initialPatientName?: string;
  initialAge?: string;
  initialVitals?: {
    bloodPressure?: string;
    pulse?: string | number;
    spo2?: string | number;
    glucose?: string | number;
    temp?: string | number;
  };
  meetingId?: string | number;
  onConnected?: (roomId: string) => void;
}

export function MediatorDoctorHandoverProtocol({
  initialPatientName = "Maria Căldăraru",
  initialAge,
  initialVitals = {
    bloodPressure: "155/95 mmHg",
    pulse: "82 bpm",
    spo2: "95%",
    glucose: "142 mg/dL",
    temp: "37.1 °C",
  },
  meetingId = "handover-live-01",
  onConnected,
}: MediatorDoctorHandoverProtocolProps) {
  const { lang } = useSafeLanguage();
  const copy = handoverCopy[lang] ?? handoverCopy.ro;

  const [patientName, setPatientName] = useState(initialPatientName);
  const [age, setAge] = useState(initialAge ?? copy.demoAge);
  // Demo seed text, shown in the active language.
  const [reason, setReason] = useState(copy.demoReason);
  const [languageBarrier, setLanguageBarrier] = useState(true);
  const translationLanguage = copy.translationLanguage;
  const [mediatorNotes, setMediatorNotes] = useState(copy.demoNotes);

  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleStartHandover = async () => {
    setIsTransmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/meetings/mediator-handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId,
          patientName,
          patientAge: age,
          vitals: initialVitals,
          reasonForVisit: reason,
          languageBarrier,
          notes: mediatorNotes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || copy.sendError);
      }

      setIsCallActive(true);
      if (onConnected) {
        onConnected(String(meetingId));
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : copy.connectError);
    } finally {
      setIsTransmitting(false);
    }
  };

  if (isCallActive) {
    // Split tablet view: Top/Left video call with online physician, Bottom/Right mediator translation aid & live notes
    return (
      <div className="rounded-xl border border-border bg-slate-950 text-white overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-slate-900">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-sage opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-live-sage" />
            </span>
            <span className="text-xs font-bold text-white">
              {copy.liveStatus}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCallActive(false)}
            className="rounded-md border border-white/20 bg-red-600/80 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
          >
            {copy.endCall}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Main video area */}
          <div className="lg:col-span-2 h-[50dvh] lg:h-[60dvh] bg-black relative">
            <iframe
              src={`https://meet.jit.si/redihealth-handover-${meetingId}#config.prejoinPageEnabled=false`}
              title={copy.iframeTitle}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="h-full w-full border-0"
            />
          </div>

          {/* Mediator side-dock for translation & notes */}
          <div className="border-t lg:border-t-0 lg:border-l border-white/10 bg-slate-900 p-4 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-sapphire-border">
                {copy.sidePanelLabel}
              </p>
              <h3 className="mt-1 text-sm font-bold text-white">
                {copy.patientLine(patientName, age)}
              </h3>

              {languageBarrier && (
                <div className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-200">
                  {copy.translation} <strong>{translationLanguage}</strong>
                </div>
              )}

              <div className="mt-3 space-y-1 text-xs text-slate-300 font-mono bg-white/5 p-2.5 rounded-md border border-white/10">
                <p>{copy.bp}: {initialVitals.bloodPressure || "--"}</p>
                <p>{copy.pulse}: {initialVitals.pulse || "--"} | SpO2: {initialVitals.spo2 || "--"}</p>
                <p>{copy.glucose}: {initialVitals.glucose || "--"}</p>
              </div>

              <div className="mt-3">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  {copy.liveNotesLabel}
                </label>
                <textarea
                  aria-label={copy.liveNotesLabel}
                  rows={4}
                  value={mediatorNotes}
                  onChange={(e) => setMediatorNotes(e.target.value)}
                  className="w-full rounded-md border border-white/20 bg-black/40 p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>

            <p className="mt-4 text-[11px] text-slate-400 leading-relaxed border-t border-white/10 pt-2">
              {copy.tabletTip}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-xs">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-border">
        <VideoIcon className="h-5 w-5 text-sapphire" />
        <div>
          <h2 className="text-base font-bold text-foreground">
            {copy.title}
          </h2>
          <p className="text-xs text-muted-foreground">
            {copy.subtitle}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 font-medium flex items-center gap-2">
          <AlertCircleIcon className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Clinical Vignette Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {copy.nameLabel}
            </label>
            <input
              type="text"
              aria-label={copy.nameLabel}
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {copy.ageLabel}
            </label>
            <input
              type="text"
              aria-label={copy.ageLabel}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
            />
          </div>
        </div>

        {/* Vitals Summary Pill Row */}
        <div className="rounded-lg border border-border bg-muted/30 p-3.5">
          <span className="text-[11px] font-semibold text-muted-foreground">
            {copy.vitalsLabel}
          </span>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-mono font-bold text-foreground">
            <span className="rounded-md border border-border bg-background px-2.5 py-1">
              {copy.bp}: {initialVitals.bloodPressure || "--"}
            </span>
            <span className="rounded-md border border-border bg-background px-2.5 py-1">
              {copy.pulse}: {initialVitals.pulse || "--"}
            </span>
            <span className="rounded-md border border-border bg-background px-2.5 py-1">
              SpO2: {initialVitals.spo2 || "--"}
            </span>
            <span className="rounded-md border border-border bg-background px-2.5 py-1">
              {copy.glucose}: {initialVitals.glucose || "--"}
            </span>
            <span className="rounded-md border border-border bg-background px-2.5 py-1">
              {copy.temp}: {initialVitals.temp || "--"}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            {copy.reasonLabel}
          </label>
          <input
            type="text"
            aria-label={copy.reasonLabel}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full min-h-[44px] rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
          />
        </div>

        {/* Language barrier toggle */}
        <div className="rounded-lg border border-border bg-background p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-foreground">
              {copy.languageBarrier}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {copy.languageHelp}
            </p>
          </div>
          <input
            type="checkbox"
            aria-label={copy.languageBarrier}
            checked={languageBarrier}
            onChange={(e) => setLanguageBarrier(e.target.checked)}
            className="h-4 w-4 rounded border-border text-sapphire focus:ring-sapphire"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            {copy.notesLabel}
          </label>
          <textarea
            aria-label={copy.notesLabel}
            rows={2}
            value={mediatorNotes}
            onChange={(e) => setMediatorNotes(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
          />
        </div>

        <div className="pt-2">
          <button
            type="button"
            disabled={isTransmitting}
            onClick={handleStartHandover}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-sapphire px-5 py-3 text-sm font-semibold text-white shadow-xs hover:bg-sapphire-light disabled:opacity-60 transition-colors"
          >
            <VideoIcon className="h-4 w-4" />
            {isTransmitting ? copy.submitting : copy.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
