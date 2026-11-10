"use client";

import { useState } from "react";
import { CheckCircleIcon, AlertCircleIcon } from "@/components/ui/icons";
import { validateVitals, type VitalsTelemetryRecord } from "@/lib/types/telemetry";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";

function useSafeLanguage() {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

// validateVitals() returns Romanian text. These maps translate it for display only;
// thresholds stay in src/lib/types/telemetry.ts.
const VITALS_MESSAGE_TRANSLATIONS: Record<Exclude<Lang, "ro">, Record<string, string>> = {
  en: {
    "Tensiune sistolică sever scăzută (<90 mmHg). Risc de șoc.": "Systolic pressure very low (<90 mmHg). Risk of shock.",
    "Tensiune sistolică sever crescută (>180 mmHg).": "Systolic pressure very high (>180 mmHg).",
    "Tensiune diastolică sever crescută (>110 mmHg).": "Diastolic pressure very high (>110 mmHg).",
    "Saturație oxigen scăzută sub 92%. Risc respirator.": "Oxygen saturation below 92%. Breathing risk.",
    "Puls în afara limitelor normale de repaus.": "Pulse outside the normal resting range.",
    "Hipoglicemie severă (<50 mg/dL). Risc de pierdere a conștienței.": "Severe low blood sugar (<50 mg/dL). Risk of losing consciousness.",
    "Glicemie în afara intervalului țintă.": "Blood sugar outside the target range.",
    "Hipotermie marcată (<35.0°C). Risc de afectare metabolică.": "Marked hypothermia (<35.0°C). Risk to metabolism.",
    "Febră moderată sau ridicată.": "Moderate or high fever.",
    "Valoare în afara limitelor normale. Trimite către medicul online.": "Value outside normal limits. Send to the online doctor.",
  },
  sq: {
    "Tensiune sistolică sever scăzută (<90 mmHg). Risc de șoc.": "Tensioni sistolik shumë i ulët (<90 mmHg). Rrezik shoku.",
    "Tensiune sistolică sever crescută (>180 mmHg).": "Tensioni sistolik shumë i lartë (>180 mmHg).",
    "Tensiune diastolică sever crescută (>110 mmHg).": "Tensioni diastolik shumë i lartë (>110 mmHg).",
    "Saturație oxigen scăzută sub 92%. Risc respirator.": "Oksigjeni në gjak nën 92%. Rrezik për frymëmarrjen.",
    "Puls în afara limitelor normale de repaus.": "Pulsi jashtë vlerave normale në qetësi.",
    "Hipoglicemie severă (<50 mg/dL). Risc de pierdere a conștienței.": "Sheqer shumë i ulët në gjak (<50 mg/dL). Rrezik humbjeje të vetëdijes.",
    "Glicemie în afara intervalului țintă.": "Sheqeri në gjak jashtë vlerave të synuara.",
    "Hipotermie marcată (<35.0°C). Risc de afectare metabolică.": "Hipotermi e theksuar (<35.0°C). Rrezik për metabolizmin.",
    "Febră moderată sau ridicată.": "Temperaturë e moderuar ose e lartë.",
    "Valoare în afara limitelor normale. Trimite către medicul online.": "Vlerë jashtë kufijve normalë. Dërgoja mjekut online.",
  },
  it: {
    "Tensiune sistolică sever scăzută (<90 mmHg). Risc de șoc.": "Pressione sistolica molto bassa (<90 mmHg). Rischio di shock.",
    "Tensiune sistolică sever crescută (>180 mmHg).": "Pressione sistolica molto alta (>180 mmHg).",
    "Tensiune diastolică sever crescută (>110 mmHg).": "Pressione diastolica molto alta (>110 mmHg).",
    "Saturație oxigen scăzută sub 92%. Risc respirator.": "Saturazione di ossigeno sotto il 92%. Rischio respiratorio.",
    "Puls în afara limitelor normale de repaus.": "Polso fuori dai valori normali a riposo.",
    "Hipoglicemie severă (<50 mg/dL). Risc de pierdere a conștienței.": "Ipoglicemia grave (<50 mg/dL). Rischio di perdere conoscenza.",
    "Glicemie în afara intervalului țintă.": "Glicemia fuori dai valori obiettivo.",
    "Hipotermie marcată (<35.0°C). Risc de afectare metabolică.": "Ipotermia marcata (<35.0°C). Rischio per il metabolismo.",
    "Febră moderată sau ridicată.": "Febbre moderata o alta.",
    "Valoare în afara limitelor normale. Trimite către medicul online.": "Valore fuori dai limiti normali. Invia al medico online.",
  },
  hr: {
    "Tensiune sistolică sever scăzută (<90 mmHg). Risc de șoc.": "Izrazito nizak sistolički krvni tlak (<90 mmHg). Rizik od šoka.",
    "Tensiune sistolică sever crescută (>180 mmHg).": "Izrazito povišen sistolički krvni tlak (>180 mmHg).",
    "Tensiune diastolică sever crescută (>110 mmHg).": "Izrazito povišen dijastolički krvni tlak (>110 mmHg).",
    "Saturație oxigen scăzută sub 92%. Risc respirator.": "Zasićenost kisikom ispod 92%. Rizik za disanje.",
    "Puls în afara limitelor normale de repaus.": "Puls izvan normalnih vrijednosti u mirovanju.",
    "Hipoglicemie severă (<50 mg/dL). Risc de pierdere a conștienței.": "Teška hipoglikemija (<50 mg/dL). Rizik od gubitka svijesti.",
    "Glicemie în afara intervalului țintă.": "Glukoza u krvi izvan ciljnog raspona.",
    "Hipotermie marcată (<35.0°C). Risc de afectare metabolică.": "Izražena hipotermija (<35.0°C). Metabolički rizik.",
    "Febră moderată sau ridicată.": "Umjereno ili visoko povišena tjelesna temperatura.",
    "Valoare în afara limitelor normale. Trimite către medicul online.": "Vrijednost izvan normalnih granica. Pošalji liječniku na mreži.",
  },
  rom: {
    "Tensiune sistolică sever scăzută (<90 mmHg). Risc de șoc.": "Sistolikano phurdimos e ratesko but tele (<90 mmHg). Dar katar shoko.",
    "Tensiune sistolică sever crescută (>180 mmHg).": "Sistolikano phurdimos e ratesko but opral (>180 mmHg).",
    "Tensiune diastolică sever crescută (>110 mmHg).": "Diastolikano phurdimos e ratesko but opral (>110 mmHg).",
    "Saturație oxigen scăzută sub 92%. Risc respirator.": "Oksigeno and-o rat tela 92%. Dar vash o phurdipe.",
    "Puls în afara limitelor normale de repaus.": "Pulso avri katar e normalne gina ko hodinipe.",
    "Hipoglicemie severă (<50 mg/dL). Risc de pierdere a conștienței.": "Zaharo and-o rat but tele (<50 mg/dL). Dar te xasarel o godjipe.",
    "Glicemie în afara intervalului țintă.": "Zaharo and-o rat avri katar e normalne gina.",
    "Hipotermie marcată (<35.0°C). Risc de afectare metabolică.": "Tatipen e truposko but tele (<35.0°C). Dar vash o metabolizmo.",
    "Febră moderată sau ridicată.": "Mashkarutno vay baro tatipen.",
    "Valoare în afara limitelor normale. Trimite către medicul online.": "Gin avri katar o normalno. Bichhal ko online doktori.",
  },
};

function localizeVitalsMessage(message: string, lang: Lang): string {
  if (lang === "ro") return message;
  return VITALS_MESSAGE_TRANSLATIONS[lang]?.[message] ?? message;
}

const kitCopy = {
  ro: {
    kitBadge: "Kit de teren #04",
    title: "Măsurători la pacient",
    subtitle: "Pentru tensiometru, pulsoximetru, glucometru și termometru.",
    connectSensor: "Conectează senzorul",
    searchingSensor: "Se caută senzorul…",
    btUnsupported: "Browserul nu suportă Bluetooth. Introdu valorile cu butoanele + și -.",
    btConnected: "Senzor conectat. Introdu valorile citite pe aparat.",
    btFailed: "Conectarea a eșuat. Introdu valorile manual.",
    saveError: "Datele nu s-au salvat. Încearcă din nou.",
    saveSuccess: "Datele au fost trimise medicului online.",
    outOfRange: "Valori în afara limitelor normale",
    bloodPressure: "1. Tensiune arterială (mmHg)",
    systolic: "Sistolică (mare)",
    diastolic: "Diastolică (mică)",
    spo2Pulse: "2. Oxigen în sânge (SpO2) și puls",
    spo2: "SpO2 (%)",
    pulse: "Puls (bpm)",
    glucose: "3. Glicemie (mg/dL)",
    glucoseContext: "Când s-a măsurat glicemia",
    glucoseRandom: "Oricând",
    glucoseFasting: "Pe nemâncate",
    glucosePostprandial: "După masă",
    temperature: "4. Temperatură corporală (°C)",
    decrease: (name: string) => `Scade ${name}`,
    increase: (name: string) => `Crește ${name}`,
    nameSystolic: "tensiunea sistolică",
    nameDiastolic: "tensiunea diastolică",
    nameSpo2: "SpO2",
    namePulse: "pulsul",
    nameGlucose: "glicemia",
    nameTemperature: "temperatura",
    notesLabel: "Observații (opțional)",
    notesPlaceholder: "ex.: nu a vrut să-și măsoare glicemia azi-dimineață",
    submit: "Trimite medicului",
    submitting: "Se trimit datele…",
  },
  en: {
    kitBadge: "Field kit #04",
    title: "Patient measurements",
    subtitle: "For the blood pressure monitor, pulse oximeter, glucose meter and thermometer.",
    connectSensor: "Connect sensor",
    searchingSensor: "Looking for sensor…",
    btUnsupported: "This browser does not support Bluetooth. Enter the values with the + and - buttons.",
    btConnected: "Sensor connected. Enter the values shown on the device.",
    btFailed: "Connection failed. Enter the values by hand.",
    saveError: "The data was not saved. Try again.",
    saveSuccess: "Data sent to the online doctor.",
    outOfRange: "Values outside normal limits",
    bloodPressure: "1. Blood pressure (mmHg)",
    systolic: "Systolic (top)",
    diastolic: "Diastolic (bottom)",
    spo2Pulse: "2. Blood oxygen (SpO2) and pulse",
    spo2: "SpO2 (%)",
    pulse: "Pulse (bpm)",
    glucose: "3. Blood sugar (mg/dL)",
    glucoseContext: "When blood sugar was measured",
    glucoseRandom: "Any time",
    glucoseFasting: "Fasting",
    glucosePostprandial: "After a meal",
    temperature: "4. Body temperature (°C)",
    decrease: (name: string) => `Lower ${name}`,
    increase: (name: string) => `Raise ${name}`,
    nameSystolic: "systolic pressure",
    nameDiastolic: "diastolic pressure",
    nameSpo2: "SpO2",
    namePulse: "pulse",
    nameGlucose: "blood sugar",
    nameTemperature: "temperature",
    notesLabel: "Notes (optional)",
    notesPlaceholder: "e.g. did not want blood sugar measured this morning",
    submit: "Send to doctor",
    submitting: "Sending data…",
  },
  sq: {
    kitBadge: "Kiti në terren #04",
    title: "Matjet e pacientit",
    subtitle: "Për aparatin e tensionit, oksimetrin, glukometrin dhe termometrin.",
    connectSensor: "Lidh sensorin",
    searchingSensor: "Po kërkohet sensori…",
    btUnsupported: "Ky shfletues nuk mbështet Bluetooth. Fut vlerat me butonat + dhe -.",
    btConnected: "Sensori u lidh. Fut vlerat që shfaq aparati.",
    btFailed: "Lidhja dështoi. Fut vlerat me dorë.",
    saveError: "Të dhënat nuk u ruajtën. Provo përsëri.",
    saveSuccess: "Të dhënat iu dërguan mjekut online.",
    outOfRange: "Vlera jashtë kufijve normalë",
    bloodPressure: "1. Tensioni i gjakut (mmHg)",
    systolic: "Sistolik (i madhi)",
    diastolic: "Diastolik (i vogli)",
    spo2Pulse: "2. Oksigjeni në gjak (SpO2) dhe pulsi",
    spo2: "SpO2 (%)",
    pulse: "Pulsi (bpm)",
    glucose: "3. Sheqeri në gjak (mg/dL)",
    glucoseContext: "Kur u mat sheqeri në gjak",
    glucoseRandom: "Në çdo kohë",
    glucoseFasting: "Esëll",
    glucosePostprandial: "Pas ngrënies",
    temperature: "4. Temperatura e trupit (°C)",
    decrease: (name: string) => `Ul ${name}`,
    increase: (name: string) => `Rrit ${name}`,
    nameSystolic: "tensionin sistolik",
    nameDiastolic: "tensionin diastolik",
    nameSpo2: "SpO2",
    namePulse: "pulsin",
    nameGlucose: "sheqerin në gjak",
    nameTemperature: "temperaturën",
    notesLabel: "Shënime (opsionale)",
    notesPlaceholder: "p.sh. nuk deshi të matë sheqerin këtë mëngjes",
    submit: "Dërgoja mjekut",
    submitting: "Po dërgohen të dhënat…",
  },
  it: {
    kitBadge: "Kit sul campo #04",
    title: "Misurazioni del paziente",
    subtitle: "Per misuratore di pressione, saturimetro, glucometro e termometro.",
    connectSensor: "Collega il sensore",
    searchingSensor: "Ricerca del sensore…",
    btUnsupported: "Questo browser non supporta il Bluetooth. Inserisci i valori con i tasti + e -.",
    btConnected: "Sensore collegato. Inserisci i valori letti sull'apparecchio.",
    btFailed: "Collegamento non riuscito. Inserisci i valori a mano.",
    saveError: "I dati non sono stati salvati. Riprova.",
    saveSuccess: "Dati inviati al medico online.",
    outOfRange: "Valori fuori dai limiti normali",
    bloodPressure: "1. Pressione arteriosa (mmHg)",
    systolic: "Sistolica (massima)",
    diastolic: "Diastolica (minima)",
    spo2Pulse: "2. Ossigeno nel sangue (SpO2) e polso",
    spo2: "SpO2 (%)",
    pulse: "Polso (bpm)",
    glucose: "3. Glicemia (mg/dL)",
    glucoseContext: "Quando è stata misurata la glicemia",
    glucoseRandom: "In qualsiasi momento",
    glucoseFasting: "A digiuno",
    glucosePostprandial: "Dopo il pasto",
    temperature: "4. Temperatura corporea (°C)",
    decrease: (name: string) => `Diminuisci ${name}`,
    increase: (name: string) => `Aumenta ${name}`,
    nameSystolic: "la pressione sistolica",
    nameDiastolic: "la pressione diastolica",
    nameSpo2: "la SpO2",
    namePulse: "il polso",
    nameGlucose: "la glicemia",
    nameTemperature: "la temperatura",
    notesLabel: "Note (facoltative)",
    notesPlaceholder: "es. non ha voluto misurare la glicemia stamattina",
    submit: "Invia al medico",
    submitting: "Invio dei dati…",
  },
  hr: {
    kitBadge: "Terenski komplet #04",
    title: "Mjerenja kod pacijenta",
    subtitle: "Za tlakomjer, pulsni oksimetar, glukometar i toplomjer.",
    connectSensor: "Poveži senzor",
    searchingSensor: "Traženje senzora…",
    btUnsupported: "Ovaj preglednik ne podržava Bluetooth. Unesite vrijednosti gumbima + i -.",
    btConnected: "Senzor je povezan. Unesite vrijednosti očitane na uređaju.",
    btFailed: "Povezivanje nije uspjelo. Unesite vrijednosti ručno.",
    saveError: "Podatci nisu spremljeni. Pokušajte ponovno.",
    saveSuccess: "Podatci su poslani liječniku na mreži.",
    outOfRange: "Vrijednosti izvan normalnih granica",
    bloodPressure: "1. Krvni tlak (mmHg)",
    systolic: "Sistolički (gornji)",
    diastolic: "Dijastolički (donji)",
    spo2Pulse: "2. Zasićenost kisikom (SpO2) i puls",
    spo2: "SpO2 (%)",
    pulse: "Puls (BPM)",
    glucose: "3. Glukoza u krvi (mg/dL)",
    glucoseContext: "Kada je mjerena glukoza u krvi",
    glucoseRandom: "Bilo kada",
    glucoseFasting: "Natašte",
    glucosePostprandial: "Nakon obroka",
    temperature: "4. Tjelesna temperatura (°C)",
    decrease: (name: string) => `Smanji ${name}`,
    increase: (name: string) => `Povećaj ${name}`,
    nameSystolic: "sistolički krvni tlak",
    nameDiastolic: "dijastolički krvni tlak",
    nameSpo2: "SpO2",
    namePulse: "puls",
    nameGlucose: "glukozu u krvi",
    nameTemperature: "tjelesnu temperaturu",
    notesLabel: "Bilješke (nije obvezno)",
    notesPlaceholder: "npr. jutros nije želio izmjeriti glukozu u krvi",
    submit: "Pošalji liječniku",
    submitting: "Slanje podataka…",
  },
  rom: {
    kitBadge: "Terensko kito #04",
    title: "Merimata ko paciento",
    subtitle: "Vash aparati e tensiyonako, pulsoksimetro, glukometro thaj termometro.",
    connectSensor: "Phand o senzoro",
    searchingSensor: "Rodel pes o senzoro…",
    btUnsupported: "Kadava brauzero na zhutil Bluetooth. Tho e gina e butonenca + thaj -.",
    btConnected: "O senzoro phandilo. Tho e gina dikhle pe aparati.",
    btFailed: "O phandipe na kerdili. Tho e gina vastesa.",
    saveError: "E date na arakhadyile. Zumav palem.",
    saveSuccess: "E date bichhaldile ko online doktori.",
    outOfRange: "Gina avri katar o normalno",
    bloodPressure: "1. Phurdimos e ratesko (mmHg)",
    systolic: "Sistolikano (opralutno)",
    diastolic: "Diastolikano (telutno)",
    spo2Pulse: "2. Oksigeno and-o rat (SpO2) thaj pulso",
    spo2: "SpO2 (%)",
    pulse: "Pulso (BPM)",
    glucose: "3. Zaharo and-o rat (mg/dL)",
    glucoseContext: "Kana merisardilo o zaharo and-o rat",
    glucoseRandom: "Bilo kana",
    glucoseFasting: "Bi xabasko",
    glucosePostprandial: "Palo xaben",
    temperature: "4. Tatipen e truposko (°C)",
    decrease: (name: string) => `Hulyar ${name}`,
    increase: (name: string) => `Vazde ${name}`,
    nameSystolic: "sistolikano phurdimos e ratesko",
    nameDiastolic: "diastolikano phurdimos e ratesko",
    nameSpo2: "SpO2",
    namePulse: "o pulso",
    nameGlucose: "o zaharo and-o rat",
    nameTemperature: "o tatipen",
    notesLabel: "Noturya (nay musay)",
    notesPlaceholder: "misal: na kamlya te merisarel o zaharo tosara",
    submit: "Bichhal ko doktori",
    submitting: "Bichhalen pes e date…",
  },
};

interface HardwareKitTelemetryPanelProps {
  meetingId?: string | number | null;
  patientId?: string | number | null;
  onSaved?: (record: VitalsTelemetryRecord) => void;
}

export function HardwareKitTelemetryPanel({
  meetingId,
  patientId,
  onSaved,
}: HardwareKitTelemetryPanelProps) {
  const { lang } = useSafeLanguage();
  const copy = kitCopy[lang] ?? kitCopy.ro;

  // Biometric state values
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [pulse, setPulse] = useState<number>(72);
  const [spo2, setSpo2] = useState<number>(98);
  const [glucose, setGlucose] = useState<number>(95);
  const [glucoseContext, setGlucoseContext] = useState<"fasting" | "postprandial" | "random">("random");
  const [temperature, setTemperature] = useState<number>(36.6);
  const [notes, setNotes] = useState("");

  const [bluetoothConnecting, setBluetoothConnecting] = useState(false);
  const [bluetoothStatus, setBluetoothStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Validate in real time
  const validation = validateVitals({
    bloodPressureSystolic: systolic,
    bloodPressureDiastolic: diastolic,
    pulseBpm: pulse,
    oxygenSaturationPct: spo2,
    bloodGlucoseMgDl: glucose,
    bodyTemperatureC: temperature,
  });

  const handlePairBluetooth = async () => {
    setBluetoothStatus("");
    if (typeof navigator === "undefined" || !("bluetooth" in navigator)) {
      setBluetoothStatus(copy.btUnsupported);
      return;
    }

    setBluetoothConnecting(true);
    try {
      // Attempt standard Bluetooth Health Device Profile or generic sensor request
      const navBluetooth = (navigator as unknown as { bluetooth: { requestDevice: (opt: unknown) => Promise<unknown> } }).bluetooth;
      await navBluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["heart_rate", "health_thermometer", "blood_pressure"],
      });
      setBluetoothStatus(copy.btConnected);
    } catch {
      setBluetoothStatus(copy.btFailed);
    } finally {
      setBluetoothConnecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId,
          patientId,
          deviceKitId: "kit-teren-galati-04",
          bloodPressureSystolic: systolic,
          bloodPressureDiastolic: diastolic,
          pulseBpm: pulse,
          oxygenSaturationPct: spo2,
          bloodGlucoseMgDl: glucose,
          glucoseContext,
          bodyTemperatureC: temperature,
          notes: notes || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || copy.saveError);
      }

      setSuccessMessage(copy.saveSuccess);
      if (onSaved && data.record) {
        onSaved(data.record);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : copy.saveError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2.5 py-1 text-xs font-semibold text-foreground">
            {copy.kitBadge}
          </span>
          <h2 className="mt-1.5 text-base sm:text-lg font-bold text-foreground">
            {copy.title}
          </h2>
          <p className="text-xs text-muted-foreground">
            {copy.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePairBluetooth}
          disabled={bluetoothConnecting}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted shadow-xs transition-colors shrink-0"
        >
          {bluetoothConnecting ? copy.searchingSensor : copy.connectSensor}
        </button>
      </div>

      {bluetoothStatus && (
        <div className="mt-3 rounded-lg bg-muted p-2.5 text-xs text-muted-foreground">
          {bluetoothStatus}
        </div>
      )}

      {/* Critical range warnings banner (Clinical Ruby) */}
      {validation.isOutOfRange && (
        <div className="mt-4 rounded-lg border-2 border-red-600 bg-red-500/10 p-3.5 text-red-700 dark:text-red-300">
          <div className="flex items-start gap-2.5">
            <AlertCircleIcon className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">
                {validation.criticalAlert ? localizeVitalsMessage(validation.criticalAlert, lang) : copy.outOfRange}
              </p>
              <ul className="mt-1 list-disc pl-4 space-y-0.5">
                {validation.warnings.map((w, idx) => (
                  <li key={idx}>{localizeVitalsMessage(w, lang)}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 rounded-lg bg-sapphire-soft border border-sapphire-border/40 p-3 text-xs text-sapphire font-medium flex items-center gap-2">
          <CheckCircleIcon className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Blood Pressure */}
          <div className={`rounded-lg border p-4 ${
            systolic > 180 || diastolic > 110
              ? "border-red-600 bg-red-500/5"
              : "border-border bg-card"
          }`}>
            <p className="text-xs font-bold text-foreground">
              {copy.bloodPressure}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex-1">
                <span className="block text-[11px] text-muted-foreground">{copy.systolic}</span>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    aria-label={copy.decrease(copy.nameSystolic)}
                    onClick={() => setSystolic((v) => Math.max(60, v - 5))}
                    className="min-h-[44px] min-w-[44px] rounded-md border border-border bg-muted text-base font-bold text-foreground hover:bg-card"
                  >
                    -
                  </button>
                  <span className="font-mono text-lg font-bold min-w-[3rem] text-center text-foreground">
                    {systolic}
                  </span>
                  <button
                    type="button"
                    aria-label={copy.increase(copy.nameSystolic)}
                    onClick={() => setSystolic((v) => Math.min(260, v + 5))}
                    className="min-h-[44px] min-w-[44px] rounded-md border border-border bg-muted text-base font-bold text-foreground hover:bg-card"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <span className="block text-[11px] text-muted-foreground">{copy.diastolic}</span>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    aria-label={copy.decrease(copy.nameDiastolic)}
                    onClick={() => setDiastolic((v) => Math.max(40, v - 5))}
                    className="min-h-[44px] min-w-[44px] rounded-md border border-border bg-muted text-base font-bold text-foreground hover:bg-card"
                  >
                    -
                  </button>
                  <span className="font-mono text-lg font-bold min-w-[3rem] text-center text-foreground">
                    {diastolic}
                  </span>
                  <button
                    type="button"
                    aria-label={copy.increase(copy.nameDiastolic)}
                    onClick={() => setDiastolic((v) => Math.min(150, v + 5))}
                    className="min-h-[44px] min-w-[44px] rounded-md border border-border bg-muted text-base font-bold text-foreground hover:bg-card"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: SpO2 and Pulse */}
          <div className={`rounded-lg border p-4 ${
            spo2 < 92 ? "border-red-600 bg-red-500/5" : "border-border bg-card"
          }`}>
            <p className="text-xs font-bold text-foreground">
              {copy.spo2Pulse}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex-1">
                <span className="block text-[11px] text-muted-foreground">{copy.spo2}</span>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    aria-label={copy.decrease(copy.nameSpo2)}
                    onClick={() => setSpo2((v) => Math.max(50, v - 1))}
                    className="min-h-[44px] min-w-[44px] rounded-md border border-border bg-muted text-base font-bold text-foreground hover:bg-card"
                  >
                    -
                  </button>
                  <span className={`font-mono text-lg font-bold min-w-[3rem] text-center ${spo2 < 92 ? "text-red-600" : "text-foreground"}`}>
                    {spo2}%
                  </span>
                  <button
                    type="button"
                    aria-label={copy.increase(copy.nameSpo2)}
                    onClick={() => setSpo2((v) => Math.min(100, v + 1))}
                    className="min-h-[44px] min-w-[44px] rounded-md border border-border bg-muted text-base font-bold text-foreground hover:bg-card"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <span className="block text-[11px] text-muted-foreground">{copy.pulse}</span>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    aria-label={copy.decrease(copy.namePulse)}
                    onClick={() => setPulse((v) => Math.max(30, v - 2))}
                    className="min-h-[44px] min-w-[44px] rounded-md border border-border bg-muted text-base font-bold text-foreground hover:bg-card"
                  >
                    -
                  </button>
                  <span className="font-mono text-lg font-bold min-w-[3rem] text-center text-foreground">
                    {pulse}
                  </span>
                  <button
                    type="button"
                    aria-label={copy.increase(copy.namePulse)}
                    onClick={() => setPulse((v) => Math.min(220, v + 2))}
                    className="min-h-[44px] min-w-[44px] rounded-md border border-border bg-muted text-base font-bold text-foreground hover:bg-card"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Blood Glucose */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-foreground">
                {copy.glucose}
              </p>
              <select
                aria-label={copy.glucoseContext}
                value={glucoseContext}
                onChange={(e) => setGlucoseContext(e.target.value as "fasting" | "postprandial" | "random")}
                className="text-xs rounded-md border border-border bg-background px-2 py-1 text-foreground"
              >
                <option value="random">{copy.glucoseRandom}</option>
                <option value="fasting">{copy.glucoseFasting}</option>
                <option value="postprandial">{copy.glucosePostprandial}</option>
              </select>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                aria-label={copy.decrease(copy.nameGlucose)}
                onClick={() => setGlucose((v) => Math.max(20, v - 5))}
                className="min-h-[44px] min-w-[44px] rounded-md border border-border bg-muted text-base font-bold text-foreground hover:bg-card"
              >
                -
              </button>
              <span className="font-mono text-lg font-bold min-w-[4rem] text-center text-foreground">
                {glucose} mg/dL
              </span>
              <button
                type="button"
                aria-label={copy.increase(copy.nameGlucose)}
                onClick={() => setGlucose((v) => Math.min(600, v + 5))}
                className="min-h-[44px] min-w-[44px] rounded-md border border-border bg-muted text-base font-bold text-foreground hover:bg-card"
              >
                +
              </button>
            </div>
          </div>

          {/* Card 4: Temperature */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-bold text-foreground">
              {copy.temperature}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                aria-label={copy.decrease(copy.nameTemperature)}
                onClick={() => setTemperature((v) => Number((Math.max(32, v - 0.2)).toFixed(1)))}
                className="min-h-[44px] min-w-[44px] rounded-md border border-border bg-muted text-base font-bold text-foreground hover:bg-card"
              >
                -
              </button>
              <span className={`font-mono text-lg font-bold min-w-[4rem] text-center ${temperature >= 38.5 ? "text-amber-700" : "text-foreground"}`}>
                {temperature.toFixed(1)} °C
              </span>
              <button
                type="button"
                aria-label={copy.increase(copy.nameTemperature)}
                onClick={() => setTemperature((v) => Number((Math.min(43, v + 0.2)).toFixed(1)))}
                className="min-h-[44px] min-w-[44px] rounded-md border border-border bg-muted text-base font-bold text-foreground hover:bg-card"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            {copy.notesLabel}
          </label>
          <input
            type="text"
            aria-label={copy.notesLabel}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={copy.notesPlaceholder}
            className="w-full min-h-[44px] rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sapphire"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-sapphire px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-sapphire-light disabled:opacity-60 transition-colors"
        >
          {isSubmitting ? copy.submitting : copy.submit}
        </button>
      </form>
    </div>
  );
}
