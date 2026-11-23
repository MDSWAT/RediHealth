"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  buildJitsiEmbedUrl,
  MEDIATOR_VIDEO_TOOLBAR,
  subscribeJitsiCallEnd,
} from "@/lib/jitsi-embed";
import { usePanelRuntime } from "@/components/panel/PanelRuntime";
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
  ru: {
    liveStatus: "Дежурный врач на связи",
    endCall: "Завершить звонок",
    iframeTitle: "Видеозвонок с врачом",
    sidePanelLabel: "Поддержка во время звонка",
    patientLine: (name: string, age: string) => (age ? `${name} (${age})` : name),
    translation: "Перевод:",
    translationLanguage: "романи (романес)",
    bp: "АД",
    pulse: "Пульс",
    glucose: "Глюкоза",
    temp: "Температура",
    liveNotesLabel: "Заметки во время звонка",
    tabletTip: "Держите планшет лицом к пациенту, чтобы врач хорошо его видел.",
    subtitle: "Врач увидит эти данные до начала видеозвонка.",
    nameLabel: "Имя пациента",
    namePlaceholder: "Имя и фамилия пациента",
    ageLabel: "Возраст",
    agePlaceholder: "Например: 68 лет",
    vitalsLabel: "Показания, измеренные на визите",
    reasonLabel: "Причина звонка",
    reasonPlaceholder: "Основные жалобы и симптомы",
    languageBarrier: "Требуется перевод",
    languageHelp: "Медиатор переводит на язык романи (романес).",
    notesLabel: "Другие заметки",
    notesPlaceholder: "Текущее лечение, наблюдения",
    submitting: "Отправка данных…",
    submit: "Начать видеозвонок",
    sendError: "Данные не были отправлены. Попробуйте ещё раз.",
    connectError: "Не удалось подключить врача. Попробуйте ещё раз.",
    demoAge: "68 лет",
    demoReason: "Головокружение по утрам, боль в затылке при нагрузке.",
    demoNotes: "Контактна. Вчера утром приняла последнюю таблетку эналаприла.",
  },
  ro: {
    liveStatus: "Medicul de gardă e conectat",
    endCall: "Închide apelul",
    iframeTitle: "Apel video cu medicul",
    sidePanelLabel: "Sprijin în timpul apelului",
    patientLine: (name: string, age: string) => (age ? `${name} (${age})` : name),
    translation: "Traducere:",
    translationLanguage: "romani (romanes)",
    bp: "TA",
    pulse: "Puls",
    glucose: "Glicemie",
    temp: "Temp.",
    liveNotesLabel: "Notițe din apel",
    tabletTip: "Ține tableta spre pacient, ca medicul să-l vadă bine.",
    subtitle: "Medicul vede aceste date înainte să înceapă apelul video.",
    nameLabel: "Nume pacient",
    namePlaceholder: "Numele pacientului",
    ageLabel: "Vârstă",
    agePlaceholder: "ex.: 68 ani",
    vitalsLabel: "Valori măsurate la pacient",
    reasonLabel: "Motivul apelului",
    reasonPlaceholder: "Simptomele principale",
    languageBarrier: "Are nevoie de traducere",
    languageHelp: "Mediatorul traduce în limba romani (romanes).",
    notesLabel: "Alte observații",
    notesPlaceholder: "Tratament luat, observații",
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
    patientLine: (name: string, age: string) => (age ? `${name} (${age})` : name),
    translation: "Translation:",
    translationLanguage: "Romani (Romanes)",
    bp: "BP",
    pulse: "Pulse",
    glucose: "Blood sugar",
    temp: "Temp",
    liveNotesLabel: "Call notes",
    tabletTip: "Keep the tablet facing the patient so the doctor can see them well.",
    subtitle: "The doctor sees this before the video call starts.",
    nameLabel: "Patient name",
    namePlaceholder: "Patient full name",
    ageLabel: "Age",
    agePlaceholder: "e.g. 68 years",
    vitalsLabel: "Values measured at the visit",
    reasonLabel: "Reason for the call",
    reasonPlaceholder: "Main symptoms and concerns",
    languageBarrier: "Needs translation",
    languageHelp: "The mediator translates into Romani (Romanes).",
    notesLabel: "Other notes",
    notesPlaceholder: "Current medication and observations",
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
    patientLine: (name: string, age: string) => (age ? `${name} (${age})` : name),
    translation: "Përkthim:",
    translationLanguage: "gjuha rome (romanes)",
    bp: "TA",
    pulse: "Pulsi",
    glucose: "Glicemia",
    temp: "Temp.",
    liveNotesLabel: "Shënime nga thirrja",
    tabletTip: "Mbaje tabletin drejt pacientit që mjeku ta shohë mirë.",
    subtitle: "Mjeku i sheh këto të dhëna para se të nisë thirrja video.",
    nameLabel: "Emri i pacientit",
    namePlaceholder: "Emri i plotë i pacientit",
    ageLabel: "Mosha",
    agePlaceholder: "p.sh. 68 vjeç",
    vitalsLabel: "Vlerat e matura te pacienti",
    reasonLabel: "Arsyeja e thirrjes",
    reasonPlaceholder: "Simptomat kryesore",
    languageBarrier: "Ka nevojë për përkthim",
    languageHelp: "Mediatori shëndetësor përkthen në gjuhën rome (romanes).",
    notesLabel: "Shënime të tjera",
    notesPlaceholder: "Trajtimi aktual dhe vëzhgimet",
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
    endCall: "Chiudi chiamata",
    iframeTitle: "Videochiamata con il medico",
    sidePanelLabel: "Supporto durante la chiamata",
    patientLine: (name: string, age: string) => (age ? `${name} (${age})` : name),
    translation: "Traduzione:",
    translationLanguage: "romanì (romanes)",
    bp: "PA",
    pulse: "Polso",
    glucose: "Glicemia",
    temp: "Temp.",
    liveNotesLabel: "Note della chiamata",
    tabletTip: "Tieni il tablet rivolto al paziente, così il medico lo vede bene.",
    subtitle: "Il medico vede questi dati prima della videochiamata.",
    nameLabel: "Nome del paziente",
    namePlaceholder: "Nome e cognome",
    ageLabel: "Età",
    agePlaceholder: "es. 68 anni",
    vitalsLabel: "Valori misurati alla visita",
    reasonLabel: "Motivo della chiamata",
    reasonPlaceholder: "Sintomi principali",
    languageBarrier: "Serve la traduzione",
    languageHelp: "Il mediatore traduce in romanì (romanes).",
    notesLabel: "Altre note",
    notesPlaceholder: "Terapie in corso e osservazioni",
    submitting: "Invio dei dati…",
    submit: "Avvia videochiamata",
    sendError: "I dati non sono stati inviati. Riprova.",
    connectError: "Impossibile collegare il medico. Riprova.",
    demoAge: "68 anni",
    demoReason: "Capogiri al mattino e dolore alla nuca sotto sforzo",
    demoNotes: "Collabora. Ha preso l'ultima compressa di enalapril ieri mattina.",
  },
  hr: {
    liveStatus: "Dežurni liječnik je spojen",
    endCall: "Završi poziv",
    iframeTitle: "Videokonzultacija s liječnikom",
    sidePanelLabel: "Podrška tijekom poziva",
    patientLine: (name: string, age: string) => (age ? `${name} (${age})` : name),
    translation: "Prijevod:",
    translationLanguage: "romski (romani)",
    bp: "Krvni tlak",
    pulse: "Puls",
    glucose: "Glukoza",
    temp: "Temp.",
    liveNotesLabel: "Bilješke iz poziva",
    tabletTip: "Držite tablet okrenut prema pacijentu kako bi ga liječnik dobro vidio.",
    subtitle: "Liječnik vidi ove podatke prije početka videokonzultacije.",
    nameLabel: "Ime pacijenta",
    namePlaceholder: "Ime i prezime pacijenta",
    ageLabel: "Dob",
    agePlaceholder: "npr. 68 god.",
    vitalsLabel: "Izmjerene vrijednosti kod pacijenta",
    reasonLabel: "Razlog poziva",
    reasonPlaceholder: "Glavne tegobe i simptomi",
    languageBarrier: "Potreban je prijevod",
    languageHelp: "Zdravstveni medijator prevodi na romski jezik.",
    notesLabel: "Ostale napomene",
    notesPlaceholder: "Terapija i zapažanja",
    submitting: "Slanje podataka…",
    submit: "Pokreni video poziv",
    sendError: "Podatci nisu poslani. Pokušajte ponovno.",
    connectError: "Nije moguće spojiti liječnika. Pokušajte ponovno.",
    demoAge: "68 god.",
    demoReason: "Jutarnja vrtoglavica i bol u zatiljku pri naporu",
    demoNotes: "Surađuje. Zadnju tabletu enalaprila uzela je jučer ujutro.",
  },
  rom: {
    liveStatus: "O doktori si phandino",
    endCall: "Phand o svato",
    iframeTitle: "Video-svato e doktoresa",
    sidePanelLabel: "Zhutipen and-o svato",
    patientLine: (name: string, age: string) => (age ? `${name} (${age})` : name),
    translation: "Nakhavipe:",
    translationLanguage: "romani chhib (romanes)",
    bp: "Tensiyona",
    pulse: "Pulso",
    glucose: "Zaharo",
    temp: "Tatipen",
    liveNotesLabel: "Noturya katar o svato",
    tabletTip: "Inker o tableto karing o paciento te dikhel les o doktori mishto.",
    subtitle: "O doktori dikhel kadale date angla te nachel o video-svato.",
    nameLabel: "Anav e pacientesko",
    namePlaceholder: "Anav e pacientesko",
    ageLabel: "Borsha",
    agePlaceholder: "misal: 68 borsha",
    vitalsLabel: "Merimata ko paciento",
    reasonLabel: "Soske kerel pes o svato",
    reasonPlaceholder: "Anglune simptomurya",
    languageBarrier: "Trebul nakhavipe pe chhib",
    languageHelp: "O sastipnasko mediatori nakhavel pe romani chhib (romanes).",
    notesLabel: "Aver noturya",
    notesPlaceholder: "Draba thaj dikhimata",
    submitting: "Bichhalen pes e date…",
    submit: "Nachav video-svato",
    sendError: "E date na bichhaldile. Zumav palem.",
    connectError: "O doktori nashti te phandel pes. Zumav palem.",
    demoAge: "68 borsha",
    demoReason: "Phiravel pes lako shero tosara thaj dukhal e men ko zor",
    demoNotes: "Zhutil. Lya e palutni draba enalapril icheri tosara.",
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

const DEMO_VITALS = {
  bloodPressure: "155/95 mmHg",
  pulse: "82 bpm",
  spo2: "95%",
  glucose: "142 mg/dL",
  temp: "37.1 °C",
};

const inputClass =
  "min-h-11 w-full rounded-lg border border-[#8a94a6] bg-[var(--panel-surface)] px-3 py-2 text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:border-[var(--panel-line)] dark:focus-visible:outline-[#bad7fa]";

export function MediatorDoctorHandoverProtocol({
  initialPatientName,
  initialAge,
  initialVitals,
  meetingId = "handover-live-01",
  onConnected,
}: MediatorDoctorHandoverProtocolProps) {
  const { lang } = useSafeLanguage();
  const { demo } = usePanelRuntime();
  const copy = handoverCopy[lang] ?? handoverCopy.ro;
  const baseId = useId();

  const resolvedVitals = initialVitals ?? (demo ? DEMO_VITALS : undefined);

  const [patientName, setPatientName] = useState(
    initialPatientName ?? (demo ? "Maria Demo" : ""),
  );
  const [age, setAge] = useState(initialAge ?? (demo ? copy.demoAge : ""));
  const [reason, setReason] = useState(demo ? copy.demoReason : "");
  const [languageBarrier, setLanguageBarrier] = useState(false);
  const translationLanguage = copy.translationLanguage;
  const [mediatorNotes, setMediatorNotes] = useState(demo ? copy.demoNotes : "");

  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const handoverIframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!isCallActive) return;
    return subscribeJitsiCallEnd(handoverIframeRef.current, 2, () => {
      setIsCallActive(false);
    });
  }, [isCallActive]);

  const sanitizedMeetingId = String(meetingId).replace(/[^a-zA-Z0-9-_]/g, "");
  const handoverJitsiUrl = buildJitsiEmbedUrl({
    baseRoomUrl: `https://meet.jit.si/redihealth-handover-${sanitizedMeetingId}`,
    apiId: 2,
    toolbarButtons: MEDIATOR_VIDEO_TOOLBAR,
  });

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
          vitals: resolvedVitals,
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
    return (
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-ink-950 text-paper">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper/10 bg-ink-900 px-4 py-3">
          <span className="text-sm font-semibold text-white">
            {copy.liveStatus}
          </span>

          <button
            type="button"
            onClick={() => setIsCallActive(false)}
            className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-white/30 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {copy.endCall}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-0 lg:grid-cols-3">
          <div className="relative h-[50dvh] overflow-hidden bg-ink-950 lg:col-span-2 lg:h-[60dvh]">
            <iframe
              ref={handoverIframeRef}
              src={handoverJitsiUrl}
              title={copy.iframeTitle}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              scrolling="no"
              style={{ colorScheme: "dark" }}
              className="block h-full w-full overflow-hidden border-0 bg-ink-950"
            />
          </div>

          <div className="flex flex-col justify-between border-t border-paper/10 bg-ink-900 p-4 lg:border-l lg:border-t-0">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-mist">
                  {copy.sidePanelLabel}
                </p>
                {patientName && (
                  <h3 className="mt-1 text-base font-semibold text-paper">
                    {copy.patientLine(patientName, age)}
                  </h3>
                )}
                {languageBarrier && (
                  <p className="mt-1.5 text-sm font-medium text-[#f5c58e]">
                    {copy.translation} {translationLanguage}
                  </p>
                )}
              </div>

              {resolvedVitals && (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-y border-paper/12 py-3 text-xs tabular-nums">
                  <div>
                    <dt className="text-mist">{copy.bp}</dt>
                    <dd className="font-semibold text-paper">{resolvedVitals.bloodPressure || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-mist">{copy.pulse}</dt>
                    <dd className="font-semibold text-paper">{resolvedVitals.pulse || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-mist">SpO2</dt>
                    <dd className="font-semibold text-paper">{resolvedVitals.spo2 || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-mist">{copy.glucose}</dt>
                    <dd className="font-semibold text-paper">{resolvedVitals.glucose || "—"}</dd>
                  </div>
                </dl>
              )}

              <div>
                <label
                  htmlFor={`${baseId}-live-notes`}
                  className="mb-1.5 block text-xs font-semibold text-mist"
                >
                  {copy.liveNotesLabel}
                </label>
                <textarea
                  id={`${baseId}-live-notes`}
                  rows={4}
                  value={mediatorNotes}
                  onChange={(e) => setMediatorNotes(e.target.value)}
                  className="w-full rounded-lg border border-paper/20 bg-ink-950/60 p-2.5 text-sm text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                />
              </div>
            </div>

            <p className="mt-4 border-t border-paper/10 pt-3 text-xs text-mist">
              {copy.tabletTip}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5">
      <p className="text-sm text-[var(--panel-muted)]">{copy.subtitle}</p>

      {errorMessage && (
        <p
          role="alert"
          className="rounded-lg border border-[#b91c1c]/35 bg-[#b91c1c]/10 px-3.5 py-2.5 text-sm font-medium text-[#b91c1c] dark:border-[#ffb4b4]/35 dark:bg-[#b91c1c]/20 dark:text-[#ffb4b4]"
        >
          {errorMessage}
        </p>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`${baseId}-patient-name`}
              className="mb-1.5 block text-sm font-medium text-[var(--panel-ink)]"
            >
              {copy.nameLabel}
            </label>
            <input
              id={`${baseId}-patient-name`}
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder={copy.namePlaceholder}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor={`${baseId}-age`}
              className="mb-1.5 block text-sm font-medium text-[var(--panel-ink)]"
            >
              {copy.ageLabel}
            </label>
            <input
              id={`${baseId}-age`}
              type="text"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder={copy.agePlaceholder}
              className={inputClass}
            />
          </div>
        </div>

        {/* Flat tabular vitals strip (zero pill chips, zero nested card) */}
        {resolvedVitals && (
          <div className="border-y border-[var(--panel-line)] py-3.5">
            <p className="text-xs font-medium text-[var(--panel-muted)]">
              {copy.vitalsLabel}
            </p>
            <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-5">
              <div>
                <dt className="text-xs text-[var(--panel-muted)]">{copy.bp}</dt>
                <dd className="text-sm font-semibold tabular-nums text-[var(--panel-ink)]">
                  {resolvedVitals.bloodPressure || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--panel-muted)]">{copy.pulse}</dt>
                <dd className="text-sm font-semibold tabular-nums text-[var(--panel-ink)]">
                  {resolvedVitals.pulse || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--panel-muted)]">SpO2</dt>
                <dd className="text-sm font-semibold tabular-nums text-[var(--panel-ink)]">
                  {resolvedVitals.spo2 || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--panel-muted)]">{copy.glucose}</dt>
                <dd className="text-sm font-semibold tabular-nums text-[var(--panel-ink)]">
                  {resolvedVitals.glucose || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--panel-muted)]">{copy.temp}</dt>
                <dd className="text-sm font-semibold tabular-nums text-[var(--panel-ink)]">
                  {resolvedVitals.temp || "—"}
                </dd>
              </div>
            </dl>
          </div>
        )}

        <div>
          <label
            htmlFor={`${baseId}-reason`}
            className="mb-1.5 block text-sm font-medium text-[var(--panel-ink)]"
          >
            {copy.reasonLabel}
          </label>
          <input
            id={`${baseId}-reason`}
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={copy.reasonPlaceholder}
            className={inputClass}
          />
        </div>

        <label
          htmlFor={`${baseId}-lang-barrier`}
          className="flex min-h-11 cursor-pointer items-center justify-between gap-4 border-y border-[var(--panel-line)] py-3"
        >
          <div>
            <span className="block text-sm font-medium text-[var(--panel-ink)]">
              {copy.languageBarrier}
            </span>
            <span className="block text-xs text-[var(--panel-muted)]">
              {copy.languageHelp}
            </span>
          </div>
          <input
            id={`${baseId}-lang-barrier`}
            type="checkbox"
            checked={languageBarrier}
            onChange={(e) => setLanguageBarrier(e.target.checked)}
            className="h-5 w-5 shrink-0 rounded border-[#8a94a6] accent-sapphire focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire"
          />
        </label>

        <div>
          <label
            htmlFor={`${baseId}-notes`}
            className="mb-1.5 block text-sm font-medium text-[var(--panel-ink)]"
          >
            {copy.notesLabel}
          </label>
          <textarea
            id={`${baseId}-notes`}
            rows={2}
            value={mediatorNotes}
            onChange={(e) => setMediatorNotes(e.target.value)}
            placeholder={copy.notesPlaceholder}
            className={`${inputClass} min-h-[76px]`}
          />
        </div>

        <div className="pt-1">
          <button
            type="button"
            disabled={isTransmitting}
            onClick={handleStartHandover}
            className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-sapphire bg-sapphire px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#28476f] disabled:cursor-default disabled:border-[var(--panel-line)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:focus-visible:outline-[#bad7fa]"
          >
            {isTransmitting ? copy.submitting : copy.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
