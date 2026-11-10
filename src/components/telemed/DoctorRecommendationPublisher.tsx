"use client";

import { useState } from "react";
import { CheckCircleIcon, AlertCircleIcon, FileTextIcon } from "@/components/ui/icons";
import type { CareRecommendationRecord } from "@/lib/types/telemetry";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";

function useSafeLanguage() {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

const publisherCopy = {
  ro: {
    patient: "Pacient",
    defaultSteps: ["Ia tratamentul la orele scrise pe rețetă.", "Bea cel puțin 2 litri de lichide pe zi."],
    defaultWarnings: ["Febră care nu scade după 48 de ore", "Respiri greu la cel mai mic efort"],
    errDiagnosis: "Scrie diagnosticul în cuvinte simple.",
    errSteps: "Adaugă cel puțin un pas pentru pacient.",
    errPublish: "Recomandările nu s-au trimis.",
    published: "Recomandările au ajuns în contul pacientului și prin SMS.",
    errGeneric: "Ceva nu a mers. Încearcă din nou.",
    title: "Recomandări după consultație",
    subtitle: (name: string) => `Pacient: ${name}. Le primește în cont și prin SMS.`,
    diagnosisLabel: "1. Diagnostic principal, în cuvinte simple *",
    diagnosisPlaceholder: "ex.: răceală ușoară",
    stepsLabel: "2. Pași de urmat pentru pacient *",
    removeStep: "Șterge pasul",
    newStepPlaceholder: "Scrie un pas nou…",
    addStep: "Adaugă pasul",
    warningsLabel: "3. Semne de alarmă pentru spital",
    warningsHelp: "Când pacientul trebuie să sune la 112 sau să meargă la Urgențe:",
    removeWarning: "Șterge semnul",
    controlLabel: "4. Data pentru control",
    channelLabel: "Anunță pacientul",
    smsLabel: "Trimite SMS pacientului",
    sending: "Se trimite…",
    submit: "Trimite pacientului",
  },
  en: {
    patient: "Patient",
    defaultSteps: ["Take the medicine at the times on the prescription.", "Drink at least 2 litres of fluids a day."],
    defaultWarnings: ["Fever that does not go down after 48 hours", "Short of breath with the slightest effort"],
    errDiagnosis: "Write the diagnosis in plain words.",
    errSteps: "Add at least one step for the patient.",
    errPublish: "The advice was not sent.",
    published: "The advice reached the patient's account and was sent by text message.",
    errGeneric: "Something went wrong. Try again.",
    title: "Advice after the appointment",
    subtitle: (name: string) => `Patient: ${name}. They get it in their account and by text message.`,
    diagnosisLabel: "1. Main diagnosis, in plain words *",
    diagnosisPlaceholder: "e.g. mild cold",
    stepsLabel: "2. Steps for the patient *",
    removeStep: "Remove step",
    newStepPlaceholder: "Write a new step…",
    addStep: "Add step",
    warningsLabel: "3. Warning signs for hospital",
    warningsHelp: "When the patient must call 112 or go to A&E:",
    removeWarning: "Remove sign",
    controlLabel: "4. Check-up date",
    channelLabel: "Tell the patient",
    smsLabel: "Send the patient a text message",
    sending: "Sending…",
    submit: "Send to patient",
  },
  sq: {
    patient: "Pacient",
    defaultSteps: ["Merr ilaçet në orët e shkruara në recetë.", "Pi të paktën 2 litra lëngje në ditë."],
    defaultWarnings: ["Temperaturë që nuk bie pas 48 orësh", "Merr frymë me vështirësi me lodhjen më të vogël"],
    errDiagnosis: "Shkruaj diagnozën me fjalë të thjeshta.",
    errSteps: "Shto të paktën një hap për pacientin.",
    errPublish: "Këshillat nuk u dërguan.",
    published: "Këshillat arritën në llogarinë e pacientit dhe me SMS.",
    errGeneric: "Diçka nuk shkoi. Provo përsëri.",
    title: "Këshilla pas vizitës",
    subtitle: (name: string) => `Pacienti: ${name}. I merr në llogari dhe me SMS.`,
    diagnosisLabel: "1. Diagnoza kryesore, me fjalë të thjeshta *",
    diagnosisPlaceholder: "p.sh. ftohje e lehtë",
    stepsLabel: "2. Hapat për pacientin *",
    removeStep: "Fshi hapin",
    newStepPlaceholder: "Shkruaj një hap të ri…",
    addStep: "Shto hapin",
    warningsLabel: "3. Shenja rreziku për spital",
    warningsHelp: "Kur pacienti duhet të telefonojë 112 ose të shkojë në Urgjencë:",
    removeWarning: "Fshi shenjën",
    controlLabel: "4. Data e kontrollit",
    channelLabel: "Njofto pacientin",
    smsLabel: "Dërgoji pacientit SMS",
    sending: "Po dërgohet…",
    submit: "Dërgoja pacientit",
  },
  it: {
    patient: "Paziente",
    defaultSteps: ["Prendi le medicine agli orari scritti sulla ricetta.", "Bevi almeno 2 litri di liquidi al giorno."],
    defaultWarnings: ["Febbre che non scende dopo 48 ore", "Fiato corto al minimo sforzo"],
    errDiagnosis: "Scrivi la diagnosi con parole semplici.",
    errSteps: "Aggiungi almeno un passo per il paziente.",
    errPublish: "I consigli non sono stati inviati.",
    published: "I consigli sono arrivati nell'account del paziente e via SMS.",
    errGeneric: "Qualcosa non ha funzionato. Riprova.",
    title: "Consigli dopo la visita",
    subtitle: (name: string) => `Paziente: ${name}. Li riceve nell'account e via SMS.`,
    diagnosisLabel: "1. Diagnosi principale, con parole semplici *",
    diagnosisPlaceholder: "es. raffreddore leggero",
    stepsLabel: "2. Cosa deve fare il paziente *",
    removeStep: "Togli il passo",
    newStepPlaceholder: "Scrivi un nuovo passo…",
    addStep: "Aggiungi",
    warningsLabel: "3. Segnali per andare in ospedale",
    warningsHelp: "Quando il paziente deve chiamare il 112 o andare al Pronto soccorso:",
    removeWarning: "Togli il segnale",
    controlLabel: "4. Data del controllo",
    channelLabel: "Avvisa il paziente",
    smsLabel: "Manda un SMS al paziente",
    sending: "Invio…",
    submit: "Invia al paziente",
  },
  hr: {
    patient: "Pacijent",
    defaultSteps: ["Uzimaj lijekove u vrijeme navedeno na receptu.", "Pij najmanje 2 litre tekućine dnevno."],
    defaultWarnings: ["Povišena tjelesna temperatura koja ne pada nakon 48 sati", "Otežano disanje već pri najmanjem naporu"],
    errDiagnosis: "Upiši dijagnozu jednostavnim riječima.",
    errSteps: "Dodaj barem jednu uputu za pacijenta.",
    errPublish: "Upute nisu poslane.",
    published: "Upute su poslane na račun pacijenta i putem SMS poruke.",
    errGeneric: "Nešto nije uspjelo. Pokušaj ponovno.",
    title: "Upute nakon pregleda",
    subtitle: (name: string) => `Pacijent: ${name}. Prima ih na račun i putem SMS poruke.`,
    diagnosisLabel: "1. Glavna dijagnoza jednostavnim riječima *",
    diagnosisPlaceholder: "npr. blaga prehlada",
    stepsLabel: "2. Upute za pacijenta *",
    removeStep: "Ukloni korak",
    newStepPlaceholder: "Upiši novu uputu…",
    addStep: "Dodaj uputu",
    warningsLabel: "3. Znakovi uzbune za odlazak u bolnicu",
    warningsHelp: "Kada pacijent mora nazvati 112 ili otići na hitni prijem:",
    removeWarning: "Ukloni znak",
    controlLabel: "4. Datum kontrolnog pregleda",
    channelLabel: "Obavijesti pacijenta",
    smsLabel: "Pošalji SMS poruku pacijentu",
    sending: "Slanje…",
    submit: "Pošalji pacijentu",
  },
  rom: {
    patient: "Paciento",
    defaultSteps: ["Le e draba (medikamente) ko chasurya lekhavde pe recepta.", "Pi nay-zalag 2 litre pani vay chayo ko dives."],
    defaultWarnings: ["Tatipen kay na hulel palo 48 chasurya", "Pharo phurdipe vi ko nay-cikno zor"],
    errDiagnosis: "Lekhav e diagnoza lokhe lavenca.",
    errSteps: "Tho nay-zalag ekh sikavipe vash o paciento.",
    errPublish: "E sikavimata na bichhaldile.",
    published: "E sikavimata resle and-o konto e pacientesko thaj katar SMS.",
    errGeneric: "Vareso na kerdili mishto. Zumav palem.",
    title: "Sikavimata pali vizita",
    subtitle: (name: string) => `Paciento: ${name}. Lel len and-o konto thaj katar SMS.`,
    diagnosisLabel: "1. Angluni diagnoza, lokhe lavenca *",
    diagnosisPlaceholder: "misal: lokhi shil (raceala)",
    stepsLabel: "2. Sikavimata vash o paciento *",
    removeStep: "Kos o sikavipe",
    newStepPlaceholder: "Lekhav nevo sikavipe…",
    addStep: "Tho sikavipe",
    warningsLabel: "3. Daravne semnya vash shpitalo",
    warningsHelp: "Kana o paciento musay te marel 112 vay te zhal ko sigo zhutipen:",
    removeWarning: "Kos o semno",
    controlLabel: "4. Data vash kontrola",
    channelLabel: "Phen e pacienteske",
    smsLabel: "Bichhal SMS e pacienteske",
    sending: "Bichhalel pes…",
    submit: "Bichhal e pacienteske",
  },
};

interface DoctorRecommendationPublisherProps {
  meetingId: string | number;
  patientName?: string;
  onPublished?: (recommendation: CareRecommendationRecord) => void;
}

export function DoctorRecommendationPublisher({
  meetingId,
  patientName: patientNameProp,
  onPublished,
}: DoctorRecommendationPublisherProps) {
  const { lang } = useSafeLanguage();
  const copy = publisherCopy[lang] ?? publisherCopy.ro;
  const patientName = patientNameProp ?? copy.patient;
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState("");
  const [steps, setSteps] = useState<string[]>(() => [...copy.defaultSteps]);
  const [newStepText, setNewStepText] = useState("");
  const [warningSigns, setWarningSigns] = useState<string[]>(() => [...copy.defaultWarnings]);
  const [controlDate, setControlDate] = useState("");
  const [notes] = useState("");
  const [sendSms, setSendSms] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleAddStep = () => {
    if (!newStepText.trim()) return;
    setSteps((prev) => [...prev, newStepText.trim()]);
    setNewStepText("");
  };

  const handleRemoveStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryDiagnosis.trim()) {
      setErrorMessage(copy.errDiagnosis);
      return;
    }
    if (steps.length === 0) {
      setErrorMessage(copy.errSteps);
      return;
    }

    setErrorMessage("");
    setStatusMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/meetings/${meetingId}/publish-recommendation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryDiagnosis: primaryDiagnosis.trim(),
          actionSteps: steps,
          warningSigns,
          controlDate: controlDate || null,
          additionalNotes: notes || null,
          sendSms,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || copy.errPublish);
      }

      setStatusMessage(copy.published);
      if (onPublished && data.recommendation) {
        onPublished(data.recommendation);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : copy.errGeneric);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <FileTextIcon className="h-5 w-5 text-sapphire" />
        <div>
          <h2 className="text-sm font-bold text-foreground">
            {copy.title}
          </h2>
          <p className="text-xs text-muted-foreground">
            {copy.subtitle(patientName)}
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 rounded-lg bg-sapphire-soft border border-sapphire-border/40 p-3 text-xs text-sapphire font-medium flex items-center gap-2">
          <CheckCircleIcon className="h-4 w-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 font-medium flex items-center gap-2">
          <AlertCircleIcon className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Diagnostic */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            {copy.diagnosisLabel}
          </label>
          <input
            type="text"
            required
            value={primaryDiagnosis}
            onChange={(e) => setPrimaryDiagnosis(e.target.value)}
            placeholder={copy.diagnosisPlaceholder}
            className="w-full min-h-[44px] rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sapphire"
          />
        </div>

        {/* Action steps */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            {copy.stepsLabel}
          </label>
          <div className="space-y-2 mb-2">
            {steps.map((st, i) => (
              <div key={i} className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-2 text-xs">
                <span className="font-bold text-sapphire">{i + 1}.</span>
                <span className="flex-1 text-foreground">{st}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveStep(i)}
                  className="text-muted-foreground hover:text-red-600 px-1"
                  aria-label={copy.removeStep}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newStepText}
              onChange={(e) => setNewStepText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddStep())}
              placeholder={copy.newStepPlaceholder}
              className="flex-1 min-h-[44px] rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sapphire"
            />
            <button
              type="button"
              onClick={handleAddStep}
              className="min-h-[44px] rounded-lg border border-border bg-muted px-4 text-xs font-semibold text-foreground hover:bg-card"
            >
              {copy.addStep}
            </button>
          </div>
        </div>

        {/* Warning signs */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            {copy.warningsLabel}
          </label>
          <p className="text-[11px] text-muted-foreground mb-1.5">
            {copy.warningsHelp}
          </p>
          <div className="flex flex-wrap gap-2">
            {warningSigns.map((sign, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-800 dark:text-amber-300 font-medium"
              >
                {sign}
                <button
                  type="button"
                  onClick={() => setWarningSigns((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-amber-700 hover:text-amber-900 ml-1 font-bold"
                  aria-label={copy.removeWarning}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Control Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {copy.controlLabel}
            </label>
            <input
              type="date"
              value={controlDate}
              onChange={(e) => setControlDate(e.target.value)}
              className="w-full min-h-[44px] rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sapphire"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {copy.channelLabel}
            </label>
            <div className="flex items-center gap-2 min-h-[44px] pt-1">
              <input
                id="sendSmsRec"
                type="checkbox"
                checked={sendSms}
                onChange={(e) => setSendSms(e.target.checked)}
                className="h-4 w-4 rounded border-border text-sapphire focus:ring-sapphire"
              />
              <label htmlFor="sendSmsRec" className="text-xs text-foreground font-medium cursor-pointer">
                {copy.smsLabel}
              </label>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-sapphire px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-sapphire-light disabled:opacity-60 transition-colors"
          >
            {isSubmitting ? copy.sending : copy.submit}
          </button>
        </div>
      </form>
    </div>
  );
}
