"use client";

import { useEffect, useState } from "react";
import { CheckCircleIcon, CloseIcon, UserIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { MedicalHelpRequestItem } from "@/lib/types/medical-request";
import type { PatientItem, PatientPriority, PatientStatus } from "@/lib/types/patient";
import type { WorkerItem } from "@/lib/types/worker";

interface PatientModalProps {
  request?: MedicalHelpRequestItem;
  patient?: PatientItem;
  workers?: WorkerItem[];
  onClose: () => void;
  onSuccess?: (patient: PatientItem) => void;
}

export function CreatePatientModal({
  request,
  patient,
  workers: initialWorkers,
  onClose,
  onSuccess,
}: PatientModalProps) {
  const { lang } = useLanguage();
  const t = {
    en: {
      errSave: "Failed to save patient profile.",
      errUnexpected: "An unexpected error occurred while saving.",
      titleEdit: "Edit Patient Profile",
      titleCreate: "Create Patient Profile",
      convertedFrom: (id: string) => `Converted from Request #${id}`,
      subtitleCreate: "Enter medical profile details for staff record",
      successEdit: "Patient profile saved successfully!",
      successCreate: "Patient profile created and portal link emailed to patient!",
      fullName: "Full Name",
      fullNamePh: "e.g. Maria Popescu",
      phone: "Phone Number",
      phonePh: "e.g. 0721 234 567",
      email: "Email Address",
      emailPh: "you@example.com",
      dob: "Date of Birth",
      gender: "Gender",
      selectGender: "Select gender",
      female: "Female",
      male: "Male",
      other: "Other",
      preferNot: "Prefer not to say",
      patientStatus: "Patient Status",
      activeCare: "Active Care",
      inactive: "Inactive",
      archived: "Archived Record",
      assignedWorker: "Assigned Healthcare Worker",
      unassigned: "-- Unassigned --",
      priority: "Priority / Urgency Level",
      pCritical: "Critical (< 24h)",
      pHigh: "High (< 3 days)",
      pModerate: "Moderate (< 7 days)",
      pLow: "Low (< 14 days)",
      address: "Address / Location",
      addressPh: "e.g. Main Street no. 12, Bucharest",
      condition: "Condition and Symptoms Notes",
      conditionPh: "Details regarding current symptoms, request notes, or initial findings...",
      history: "Medical History / Care Plan",
      historyPh: "Known allergies, ongoing treatments, or recommended health steps...",
      cancel: "Cancel",
      saving: "Saving...",
      update: "Update Patient Profile",
      create: "Create Patient Profile",
    },
    ro: {
      errSave: "Salvarea profilului pacientului a esuat.",
      errUnexpected: "A aparut o eroare neasteptata la salvare.",
      titleEdit: "Editeaza profil pacient",
      titleCreate: "Creeaza profil pacient",
      convertedFrom: (id: string) => `Convertit din cererea #${id}`,
      subtitleCreate: "Introdu detaliile profilului medical",
      successEdit: "Profilul pacientului a fost salvat!",
      successCreate: "Profilul pacientului a fost creat si linkul portalului a fost trimis!",
      fullName: "Nume complet",
      fullNamePh: "ex. Maria Popescu",
      phone: "Numar telefon",
      phonePh: "ex. 0721 234 567",
      email: "Adresa email",
      emailPh: "tu@exemplu.com",
      dob: "Data nasterii",
      gender: "Gen",
      selectGender: "Selecteaza genul",
      female: "Feminin",
      male: "Masculin",
      other: "Altul",
      preferNot: "Prefer sa nu spun",
      patientStatus: "Status pacient",
      activeCare: "Ingrijire activa",
      inactive: "Inactiv",
      archived: "Dosar arhivat",
      assignedWorker: "Lucrator medical alocat",
      unassigned: "-- Nealocat --",
      priority: "Prioritate / Urgenta",
      pCritical: "Critic (< 24h)",
      pHigh: "Ridicata (< 3 zile)",
      pModerate: "Moderata (< 7 zile)",
      pLow: "Scazuta (< 14 zile)",
      address: "Adresa / Locatie",
      addressPh: "ex. Strada Principala nr. 12, Bucuresti",
      condition: "Notite despre afectiune si simptome",
      conditionPh: "Detalii despre simptomele curente, cerere sau observatii initiale...",
      history: "Istoric medical / Plan de ingrijire",
      historyPh: "Alergii cunoscute, tratamente in curs sau recomandari...",
      cancel: "Anuleaza",
      saving: "Se salveaza...",
      update: "Actualizeaza profilul",
      create: "Creeaza profilul",
    },
    sq: {
      errSave: "Ruajtja e profilit te pacientit deshtoi.",
      errUnexpected: "Ndodhi nje gabim i papritur gjate ruajtjes.",
      titleEdit: "Ndrysho profilin e pacientit",
      titleCreate: "Krijo profil pacienti",
      convertedFrom: (id: string) => `Konvertuar nga kerkesa #${id}`,
      subtitleCreate: "Vendos detajet e profilit mjekesor",
      successEdit: "Profili i pacientit u ruajt me sukses!",
      successCreate: "Profili i pacientit u krijua dhe lidhja e portalit u dergua me email!",
      fullName: "Emri i plote",
      fullNamePh: "p.sh. Maria Popescu",
      phone: "Numri i telefonit",
      phonePh: "p.sh. 0721 234 567",
      email: "Adresa email",
      emailPh: "ti@shembull.com",
      dob: "Datelindja",
      gender: "Gjinia",
      selectGender: "Zgjidh gjinine",
      female: "Femer",
      male: "Mashkull",
      other: "Tjeter",
      preferNot: "Preferoj te mos them",
      patientStatus: "Statusi i pacientit",
      activeCare: "Kujdes aktiv",
      inactive: "Joaktiv",
      archived: "Dosje e arkivuar",
      assignedWorker: "Punonjesi i caktuar",
      unassigned: "-- Pacaktuar --",
      priority: "Prioritet / Urgjence",
      pCritical: "Kritik (< 24h)",
      pHigh: "I larte (< 3 dite)",
      pModerate: "Mesatar (< 7 dite)",
      pLow: "I ulet (< 14 dite)",
      address: "Adresa / Vendndodhja",
      addressPh: "p.sh. Rruga Kryesore nr. 12, Bukuresht",
      condition: "Shenime mbi gjendjen dhe simptomat",
      conditionPh: "Detaje mbi simptomat aktuale, kerkesen ose gjetjet fillestare...",
      history: "Historia mjekesore / Plani i kujdesit",
      historyPh: "Alergji te njohura, trajtime ne vazhdim ose hapa te rekomanduar...",
      cancel: "Anulo",
      saving: "Duke ruajtur...",
      update: "Perditeso profilin",
      create: "Krijo profilin",
    },
    it: {
      errSave: "Salvataggio profilo paziente non riuscito.",
      errUnexpected: "Si e verificato un errore imprevisto durante il salvataggio.",
      titleEdit: "Modifica profilo paziente",
      titleCreate: "Crea profilo paziente",
      convertedFrom: (id: string) => `Convertito dalla richiesta #${id}`,
      subtitleCreate: "Inserisci i dettagli del profilo medico",
      successEdit: "Profilo paziente salvato con successo!",
      successCreate: "Profilo paziente creato e link del portale inviato via email!",
      fullName: "Nome completo",
      fullNamePh: "es. Maria Popescu",
      phone: "Numero di telefono",
      phonePh: "es. 0721 234 567",
      email: "Indirizzo email",
      emailPh: "tuo@esempio.com",
      dob: "Data di nascita",
      gender: "Genere",
      selectGender: "Seleziona genere",
      female: "Femmina",
      male: "Maschio",
      other: "Altro",
      preferNot: "Preferisco non dirlo",
      patientStatus: "Stato paziente",
      activeCare: "Cura attiva",
      inactive: "Inattivo",
      archived: "Scheda archiviata",
      assignedWorker: "Operatore assegnato",
      unassigned: "-- Non assegnato --",
      priority: "Priorita / Urgenza",
      pCritical: "Critica (< 24h)",
      pHigh: "Alta (< 3 giorni)",
      pModerate: "Moderata (< 7 giorni)",
      pLow: "Bassa (< 14 giorni)",
      address: "Indirizzo / Localita",
      addressPh: "es. Via Principale 12, Bucarest",
      condition: "Note su condizione e sintomi",
      conditionPh: "Dettagli su sintomi attuali, richiesta o rilievi iniziali...",
      history: "Storia clinica / Piano di cura",
      historyPh: "Allergie note, trattamenti in corso o passi consigliati...",
      cancel: "Annulla",
      saving: "Salvataggio...",
      update: "Aggiorna profilo",
      create: "Crea profilo",
    },
  }[lang];

  const isEditing = Boolean(patient);

  const [fullName, setFullName] = useState(
    patient?.full_name || request?.full_name || "",
  );
  const [phone, setPhone] = useState(patient?.phone || request?.phone || "");
  const [email, setEmail] = useState(patient?.email || request?.email || "");
  const [dateOfBirth, setDateOfBirth] = useState(patient?.date_of_birth || "");
  const [gender, setGender] = useState(patient?.gender || "");
  const [address, setAddress] = useState(patient?.address || "");
  const [conditionNotes, setConditionNotes] = useState(
    patient?.condition_notes ||
      (request
        ? `Request: ${request.description}${
            request.internal_notes ? `\n\nNotes: ${request.internal_notes}` : ""
          }`
        : ""),
  );
  const [medicalHistory, setMedicalHistory] = useState(
    patient?.medical_history || "",
  );
  const [status, setStatus] = useState<PatientStatus>(
    patient?.status || "active",
  );
  const [priority, setPriority] = useState<PatientPriority>(
    patient?.priority || "moderate",
  );
  const [assignedWorkerId, setAssignedWorkerId] = useState<string>(
    patient?.assigned_worker_id || "",
  );
  const [workersList, setWorkersList] = useState<WorkerItem[]>(
    initialWorkers || [],
  );

  useEffect(() => {
    if (!initialWorkers || initialWorkers.length === 0) {
      void fetch("/api/workers")
        .then((res) => res.json())
        .then((data: { workers?: WorkerItem[] }) => {
          if (Array.isArray(data.workers)) {
            setWorkersList(data.workers);
          }
        })
        .catch(() => {});
    }
  }, [initialWorkers]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    const payload = {
      id: patient?.id,
      request_id: request?.id || patient?.request_id,
      assigned_worker_id: assignedWorkerId || undefined,
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      date_of_birth: dateOfBirth.trim() || undefined,
      gender: gender.trim() || undefined,
      address: address.trim() || undefined,
      condition_notes: conditionNotes.trim() || undefined,
      medical_history: medicalHistory.trim() || undefined,
      status,
      priority,
    };

    try {
      const url = "/api/patients";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        error?: string;
        id?: number;
        access_token?: string;
        success?: boolean;
      };

      if (!response.ok) {
        setErrorMessage(data.error || t.errSave);
        return;
      }

      setSaveSuccess(true);

      const matchedWorker = workersList.find((w) => w.id === assignedWorkerId);

      const savedPatient: PatientItem = {
        id: String(data.id || patient?.id || "0"),
        request_id: payload.request_id ? String(payload.request_id) : null,
        assigned_worker_id: assignedWorkerId || null,
        assigned_worker_name: matchedWorker?.full_name || null,
        access_token: data.access_token || patient?.access_token || null,
        full_name: payload.full_name,
        phone: payload.phone,
        email: payload.email,
        date_of_birth: payload.date_of_birth || null,
        gender: payload.gender || null,
        address: payload.address || null,
        condition_notes: payload.condition_notes || null,
        medical_history: payload.medical_history || null,
        status: payload.status,
        priority: payload.priority,
        created_at: patient?.created_at || new Date().toISOString(),
      };

      if (onSuccess) {
        onSuccess(savedPatient);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch {
      setErrorMessage(t.errUnexpected);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <UserIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isEditing ? t.titleEdit : t.titleCreate}
              </h2>
              <p className="text-xs text-muted-foreground">
                {request
                  ? t.convertedFrom(String(request.id))
                  : t.subtitleCreate}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 dark:text-red-400">
            {errorMessage}
          </div>
        ) : null}

        {saveSuccess ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircleIcon className="h-4 w-4" />
            <span>
              {isEditing
                ? t.successEdit
                : t.successCreate}
            </span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                {t.fullName} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.fullNamePh}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                {t.phone} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePh}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                {t.email} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPh}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                {t.dob}
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                {t.gender}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">{t.selectGender}</option>
                <option value="Female">{t.female}</option>
                <option value="Male">{t.male}</option>
                <option value="Other">{t.other}</option>
                <option value="Prefer not to say">{t.preferNot}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                {t.patientStatus}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PatientStatus)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="active">{t.activeCare}</option>
                <option value="inactive">{t.inactive}</option>
                <option value="archived">{t.archived}</option>
              </select>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                {t.assignedWorker}
              </label>
              <select
                value={assignedWorkerId}
                onChange={(e) => setAssignedWorkerId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">{t.unassigned}</option>
                {workersList.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.full_name} ({w.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                {t.priority}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PatientPriority)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="critical">🔴 {t.pCritical}</option>
                <option value="high">🟠 {t.pHigh}</option>
                <option value="moderate">🟡 {t.pModerate}</option>
                <option value="low">🟢 {t.pLow}</option>
              </select>
            </div>
          </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              {t.address}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t.addressPh}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              {t.condition}
            </label>
            <textarea
              rows={3}
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              placeholder={t.conditionPh}
              className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              {t.history}
            </label>
            <textarea
              rows={3}
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder={t.historyPh}
              className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
            >
              {isSubmitting
                ? t.saving
                : isEditing
                ? t.update
                : t.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
