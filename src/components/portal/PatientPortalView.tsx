/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  AlertCircleIcon,
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  EditIcon,
  ImageIcon,
  MailIcon,
  PhoneIcon,
  PlusIcon,
  ShieldIcon,
  UserIcon,
} from "@/components/ui/icons";
import type { PatientItem, PatientPriority } from "@/lib/types/patient";
import { usePatientPortal } from "@/components/portal/usePatientPortal";
import { useLanguage } from "@/lib/i18n/language-context";

interface PatientPortalViewProps {
  initialPatient: PatientItem;
  token: string;
}

type PortalTab = "actions" | "plan" | "photos" | "notes";

const portalTranslations = {
  en: {
    emergencyTitle: "Medical Emergency Notice:",
    emergencyBody:
      "This portal supports routine communication and care management. For life-threatening emergencies, call 112 or visit the nearest emergency room.",
    careLabel: "care",
    portalRecord: "RediHealth Patient Portal - Record ID",
    assignedStaff: "Assigned healthcare staff",
    fallbackTeam: "RediHealth Clinical Team",
    phone: "Phone:",
    email: "Email:",
    location: "Location:",
    notSpecified: "Not specified",
    treatmentTitle: "Clinical Treatment Plan",
    diagnosis: "Primary Diagnosis",
    goals: "Care Goals",
    meds: "Medications and Therapies",
    instructions: "Care Instructions",
    attached: "Attached Scans and Prescriptions",
    noTreatment:
      "No formal treatment plan has been added yet. The care team will update this section after review.",
    symptomsTitle: "Report Symptoms and Urgency",
    symptomsSaved: "Symptoms and status updated. Your care team has been notified.",
    howFeeling: "How are you feeling?",
    symptomsPlaceholder:
      "Describe new symptoms, pain levels, side effects, or recovery changes...",
    priorityLevel: "Priority level",
    priorityCritical: "Critical priority",
    priorityHigh: "High priority",
    priorityModerate: "Moderate priority",
    priorityLow: "Low priority",
    saving: "Saving...",
    updateSymptoms: "Update symptoms",
    followupsTitle: "Follow-ups and Appointments",
    requestFollowup: "Request follow-up",
    followupTitle: "Follow-up title",
    followupTitlePlaceholder: "Follow-up on recovery progress",
    preferredDate: "Preferred date",
    notes: "Notes",
    notesPlaceholder: "Availability details or questions for staff",
    cancel: "Cancel",
    submitting: "Submitting...",
    submitRequest: "Submit request",
    date: "Date:",
    noFollowups: "No follow-up requests yet. Use the button above to schedule one.",
    photosTitle: "Medical Photos and Documents",
    selectImage: "Select image file",
    photoTitle: "Photo title",
    photoTitlePlaceholder: "Skin photo, blood test report",
    photoNotesPlaceholder: "Describe what this image shows",
    readyPhoto: "Photo ready to attach",
    uploading: "Uploading...",
    attachPhoto: "Attach photo",
    noPhotos: "No photos uploaded yet.",
    stepUpdate: "1. Update your symptoms",
    stepFollowups: "2. Manage your follow-ups",
    actionHint: "Start here so your care team can prioritize your case quickly.",
    noNotes: "No additional notes",
    completeFollowup: "Complete follow-up",
    completionNotes: "Completion notes",
    completionNotesPlaceholder: "What happened during this follow-up?",
    completionPhotoTitle: "Attachment title",
    completionPhotoTitlePlaceholder: "Follow-up image or document",
    completionPhotoNote: "Attachment note",
    completionPhotoNotePlaceholder: "Describe this attachment",
    addAttachment: "Add attachment",
    attachments: "Attachments",
    markCompleted: "Mark completed",
    completing: "Completing...",
    completedOn: "Completed on",
    notesTabTitle: "Patient Notes Log",
    noNoteEntries: "No note entries yet.",
    noteFromSymptoms: "Symptoms update",
    noteFromPhoto: "Photo note",
    noteFromFollowup: "Follow-up note",
    noteFromFollowupCompletion: "Follow-up completion",
    tabs: {
      actions: "My Actions",
      plan: "Treatment Plan",
      photos: "Photos",
      notes: "Notes",
    },
  },
  ro: {
    emergencyTitle: "Atentie urgenta medicala:",
    emergencyBody:
      "Acest portal este pentru comunicare de rutina si managementul ingrijirii. Pentru urgente care pun viata in pericol, sunati la 112 sau mergeti la cea mai apropiata camera de garda.",
    careLabel: "ingrijire",
    portalRecord: "Portal pacient RediHealth - ID dosar",
    assignedStaff: "Personal medical alocat",
    fallbackTeam: "Echipa clinica RediHealth",
    phone: "Telefon:",
    email: "Email:",
    location: "Locatie:",
    notSpecified: "Nespecificat",
    treatmentTitle: "Plan clinic de tratament",
    diagnosis: "Diagnostic principal",
    goals: "Obiective de ingrijire",
    meds: "Medicamente si terapii",
    instructions: "Instructiuni de ingrijire",
    attached: "Scanari si prescriptii atasate",
    noTreatment:
      "Nu exista inca un plan formal de tratament. Echipa medicala va actualiza aceasta sectiune dupa evaluare.",
    symptomsTitle: "Raporteaza simptomele si urgenta",
    symptomsSaved: "Simptomele si statusul au fost actualizate. Echipa medicala a fost notificata.",
    howFeeling: "Cum va simtiti?",
    symptomsPlaceholder:
      "Descrieti simptome noi, nivelul durerii, efecte adverse sau schimbari in recuperare...",
    priorityLevel: "Nivel prioritate",
    priorityCritical: "Prioritate critica",
    priorityHigh: "Prioritate ridicata",
    priorityModerate: "Prioritate moderata",
    priorityLow: "Prioritate scazuta",
    saving: "Se salveaza...",
    updateSymptoms: "Actualizeaza simptomele",
    followupsTitle: "Monitorizari si programari",
    requestFollowup: "Solicita monitorizare",
    followupTitle: "Titlu monitorizare",
    followupTitlePlaceholder: "Monitorizare progres recuperare",
    preferredDate: "Data preferata",
    notes: "Note",
    notesPlaceholder: "Detalii despre disponibilitate sau intrebari pentru personal",
    cancel: "Anuleaza",
    submitting: "Se trimite...",
    submitRequest: "Trimite solicitarea",
    date: "Data:",
    noFollowups: "Nu exista solicitari de monitorizare. Folositi butonul de mai sus pentru a programa una.",
    photosTitle: "Poze si documente medicale",
    selectImage: "Selecteaza fisier imagine",
    photoTitle: "Titlu poza",
    photoTitlePlaceholder: "Poza piele, buletin analize",
    photoNotesPlaceholder: "Descrieti ce se vede in aceasta imagine",
    readyPhoto: "Poza gata de atasat",
    uploading: "Se incarca...",
    attachPhoto: "Ataseaza poza",
    noPhotos: "Nu exista poze incarcate.",
    stepUpdate: "1. Actualizeaza simptomele",
    stepFollowups: "2. Gestioneaza monitorizarile",
    actionHint: "Incepeti aici pentru ca echipa medicala sa va prioritizeze rapid cazul.",
    noNotes: "Fara note suplimentare",
    completeFollowup: "Finalizeaza monitorizarea",
    completionNotes: "Note la finalizare",
    completionNotesPlaceholder: "Ce s-a intamplat in timpul acestei monitorizari?",
    completionPhotoTitle: "Titlu atasament",
    completionPhotoTitlePlaceholder: "Imagine sau document pentru monitorizare",
    completionPhotoNote: "Nota atasament",
    completionPhotoNotePlaceholder: "Descrieti acest atasament",
    addAttachment: "Adauga atasament",
    attachments: "Atasamente",
    markCompleted: "Marcheaza finalizat",
    completing: "Se finalizeaza...",
    completedOn: "Finalizat la",
    notesTabTitle: "Jurnal note pacient",
    noNoteEntries: "Nu exista note inca.",
    noteFromSymptoms: "Actualizare simptome",
    noteFromPhoto: "Nota foto",
    noteFromFollowup: "Nota monitorizare",
    noteFromFollowupCompletion: "Finalizare monitorizare",
    tabs: {
      actions: "Actiunile mele",
      plan: "Plan de tratament",
      photos: "Poze",
      notes: "Note",
    },
  },
  sq: {
    emergencyTitle: "Njoftim per urgence mjekesore:",
    emergencyBody:
      "Ky portal mbeshtet komunikimin rutinor dhe menaxhimin e kujdesit. Per urgjenca qe rrezikojne jeten, telefononi 112 ose shkoni ne urgjencen me te afert.",
    careLabel: "kujdes",
    portalRecord: "Portali i pacientit RediHealth - ID karteles",
    assignedStaff: "Stafi mjekesor i caktuar",
    fallbackTeam: "Ekipi klinik RediHealth",
    phone: "Telefon:",
    email: "Email:",
    location: "Vendndodhja:",
    notSpecified: "E paspecifikuar",
    treatmentTitle: "Plani klinik i trajtimit",
    diagnosis: "Diagnoza kryesore",
    goals: "Qellimet e kujdesit",
    meds: "Ilaçe dhe terapi",
    instructions: "Udhezime kujdesi",
    attached: "Skanime dhe receta te bashkengjitura",
    noTreatment:
      "Ende nuk eshte shtuar nje plan formal trajtimi. Ekipi i kujdesit do ta perditesoje kete seksion pas shqyrtimit.",
    symptomsTitle: "Raporto simptomat dhe urgjencen",
    symptomsSaved: "Simptomat dhe statusi u perditesuan. Ekipi i kujdesit u njoftua.",
    howFeeling: "Si po ndiheni?",
    symptomsPlaceholder:
      "Pershkruani simptoma te reja, nivel dhimbjeje, efekte anesore ose ndryshime ne rikuperim...",
    priorityLevel: "Niveli i prioritetit",
    priorityCritical: "Prioritet kritik",
    priorityHigh: "Prioritet i larte",
    priorityModerate: "Prioritet mesatar",
    priorityLow: "Prioritet i ulet",
    saving: "Duke ruajtur...",
    updateSymptoms: "Perditeso simptomat",
    followupsTitle: "Ndjekje dhe takime",
    requestFollowup: "Kerko ndjekje",
    followupTitle: "Titulli i ndjekjes",
    followupTitlePlaceholder: "Ndjekje e progresit te rikuperimit",
    preferredDate: "Data e preferuar",
    notes: "Shenime",
    notesPlaceholder: "Detaje mbi disponueshmerine ose pyetje per stafin",
    cancel: "Anulo",
    submitting: "Duke derguar...",
    submitRequest: "Dergo kerkesen",
    date: "Data:",
    noFollowups: "Nuk ka ende kerkesa ndjekjeje. Perdorni butonin me lart per te planifikuar nje.",
    photosTitle: "Foto dhe dokumente mjekesore",
    selectImage: "Zgjidh skedarin e fotos",
    photoTitle: "Titulli i fotos",
    photoTitlePlaceholder: "Foto lekure, raport analize gjaku",
    photoNotesPlaceholder: "Pershkruani cfare tregon kjo foto",
    readyPhoto: "Foto gati per ngarkim",
    uploading: "Duke ngarkuar...",
    attachPhoto: "Bashkengjit foton",
    noPhotos: "Nuk ka ende foto te ngarkuara.",
    stepUpdate: "1. Perditeso simptomat",
    stepFollowups: "2. Menaxho ndjekjet",
    actionHint: "Nisni ketu qe ekipi i kujdesit ta prioritetizoje shpejt rastin tuaj.",
    noNotes: "Pa shenime shtese",
    completeFollowup: "Perfundo ndjekjen",
    completionNotes: "Shenime perfundimi",
    completionNotesPlaceholder: "Cfare ndodhi gjate kesaj ndjekjeje?",
    completionPhotoTitle: "Titulli i bashkengjitjes",
    completionPhotoTitlePlaceholder: "Imazh ose dokument i ndjekjes",
    completionPhotoNote: "Shenim i bashkengjitjes",
    completionPhotoNotePlaceholder: "Pershkruani kete bashkengjitje",
    addAttachment: "Shto bashkengjitje",
    attachments: "Bashkengjitje",
    markCompleted: "Sheno te perfunduar",
    completing: "Duke perfunduar...",
    completedOn: "Perfunduar me",
    notesTabTitle: "Regjistri i shenimeve te pacientit",
    noNoteEntries: "Nuk ka ende shenime.",
    noteFromSymptoms: "Perditesim simptomash",
    noteFromPhoto: "Shenim fotoje",
    noteFromFollowup: "Shenim ndjekjeje",
    noteFromFollowupCompletion: "Perfundim ndjekjeje",
    tabs: {
      actions: "Veprimet e mia",
      plan: "Plani i trajtimit",
      photos: "Fotot",
      notes: "Shenime",
    },
  },
  it: {
    emergencyTitle: "Avviso emergenza medica:",
    emergencyBody:
      "Questo portale supporta la comunicazione di routine e la gestione della cura. Per emergenze potenzialmente letali, chiama il 112 o vai al pronto soccorso piu vicino.",
    careLabel: "cura",
    portalRecord: "Portale paziente RediHealth - ID cartella",
    assignedStaff: "Personale sanitario assegnato",
    fallbackTeam: "Team clinico RediHealth",
    phone: "Telefono:",
    email: "Email:",
    location: "Posizione:",
    notSpecified: "Non specificato",
    treatmentTitle: "Piano clinico di trattamento",
    diagnosis: "Diagnosi principale",
    goals: "Obiettivi di cura",
    meds: "Farmaci e terapie",
    instructions: "Istruzioni di cura",
    attached: "Scansioni e prescrizioni allegate",
    noTreatment:
      "Non e stato ancora aggiunto un piano di trattamento formale. Il team di cura aggiornera questa sezione dopo la revisione.",
    symptomsTitle: "Segnala sintomi e urgenza",
    symptomsSaved: "Sintomi e stato aggiornati. Il tuo team di cura e stato avvisato.",
    howFeeling: "Come ti senti?",
    symptomsPlaceholder:
      "Descrivi nuovi sintomi, livello di dolore, effetti collaterali o cambiamenti nel recupero...",
    priorityLevel: "Livello priorita",
    priorityCritical: "Priorita critica",
    priorityHigh: "Priorita alta",
    priorityModerate: "Priorita moderata",
    priorityLow: "Priorita bassa",
    saving: "Salvataggio...",
    updateSymptoms: "Aggiorna sintomi",
    followupsTitle: "Follow-up e appuntamenti",
    requestFollowup: "Richiedi follow-up",
    followupTitle: "Titolo follow-up",
    followupTitlePlaceholder: "Follow-up sul progresso del recupero",
    preferredDate: "Data preferita",
    notes: "Note",
    notesPlaceholder: "Dettagli sulla disponibilita o domande per lo staff",
    cancel: "Annulla",
    submitting: "Invio...",
    submitRequest: "Invia richiesta",
    date: "Data:",
    noFollowups: "Nessuna richiesta di follow-up al momento. Usa il pulsante sopra per programmarne una.",
    photosTitle: "Foto e documenti medici",
    selectImage: "Seleziona file immagine",
    photoTitle: "Titolo foto",
    photoTitlePlaceholder: "Foto pelle, referto esami sangue",
    photoNotesPlaceholder: "Descrivi cosa mostra questa immagine",
    readyPhoto: "Foto pronta da allegare",
    uploading: "Caricamento...",
    attachPhoto: "Allega foto",
    noPhotos: "Nessuna foto caricata.",
    stepUpdate: "1. Aggiorna i sintomi",
    stepFollowups: "2. Gestisci i follow-up",
    actionHint: "Inizia da qui cosi il team di cura puo dare priorita rapidamente al tuo caso.",
    noNotes: "Nessuna nota aggiuntiva",
    completeFollowup: "Completa follow-up",
    completionNotes: "Note di completamento",
    completionNotesPlaceholder: "Cosa e successo durante questo follow-up?",
    completionPhotoTitle: "Titolo allegato",
    completionPhotoTitlePlaceholder: "Immagine o documento follow-up",
    completionPhotoNote: "Nota allegato",
    completionPhotoNotePlaceholder: "Descrivi questo allegato",
    addAttachment: "Aggiungi allegato",
    attachments: "Allegati",
    markCompleted: "Segna completato",
    completing: "Completamento...",
    completedOn: "Completato il",
    notesTabTitle: "Registro note paziente",
    noNoteEntries: "Nessuna nota al momento.",
    noteFromSymptoms: "Aggiornamento sintomi",
    noteFromPhoto: "Nota foto",
    noteFromFollowup: "Nota follow-up",
    noteFromFollowupCompletion: "Completamento follow-up",
    tabs: {
      actions: "Le mie azioni",
      plan: "Piano di trattamento",
      photos: "Foto",
      notes: "Note",
    },
  },
} as const;

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-soft text-primary">
        {icon}
      </span>
      <h2 className="text-base font-bold text-foreground sm:text-lg">{title}</h2>
    </div>
  );
}

function PortalTabButton({
  isActive,
  label,
  onClick,
}: {
  isActive: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
        isActive
          ? "bg-primary text-white"
          : "border border-border bg-white text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );
}

export function PatientPortalView({
  initialPatient,
  token,
}: PatientPortalViewProps) {
  const { lang } = useLanguage();
  const t = portalTranslations[lang];
  const [activeTab, setActiveTab] = useState<PortalTab>("actions");
  const { patient, priorityMeta, errorMessage, symptoms, followup, photo } =
    usePatientPortal({ initialPatient, token });
  const sortedFollowups = useMemo(
    () => [...(patient.followups || [])].sort((a, b) => a.date.localeCompare(b.date)),
    [patient.followups],
  );
  const notesLog = useMemo(() => {
    const entries: Array<{ id: string; date: string; title: string; text: string }> = [];

    if (patient.condition_notes?.trim()) {
      entries.push({
        id: `symptoms-${patient.id}`,
        date: new Date().toISOString().slice(0, 10),
        title: t.noteFromSymptoms,
        text: patient.condition_notes,
      });
    }

    for (const photoEntry of patient.photos || []) {
      if (photoEntry.notes?.trim()) {
        entries.push({
          id: `photo-${photoEntry.id}`,
          date: photoEntry.date,
          title: t.noteFromPhoto,
          text: photoEntry.notes,
        });
      }
    }

    for (const followupEntry of patient.followups || []) {
      if (followupEntry.notes?.trim()) {
        entries.push({
          id: `followup-${followupEntry.id}`,
          date: followupEntry.date,
          title: t.noteFromFollowup,
          text: followupEntry.notes,
        });
      }

      if (followupEntry.completion_notes?.trim()) {
        entries.push({
          id: `followup-complete-${followupEntry.id}`,
          date: followupEntry.completed_at || followupEntry.date,
          title: t.noteFromFollowupCompletion,
          text: followupEntry.completion_notes,
        });
      }

      for (const completionPhoto of followupEntry.completion_photos || []) {
        if (completionPhoto.notes?.trim()) {
          entries.push({
            id: `followup-photo-${completionPhoto.id}`,
            date: completionPhoto.date,
            title: t.noteFromFollowupCompletion,
            text: completionPhoto.notes,
          });
        }
      }
    }

    return entries.sort((a, b) => b.date.localeCompare(a.date));
  }, [patient, t.noteFromFollowup, t.noteFromFollowupCompletion, t.noteFromPhoto, t.noteFromSymptoms]);

  const {
    text: symptomsText,
    setText: setSymptomsText,
    priority: selectedPriority,
    setPriority: setSelectedPriority,
    isSaving: isSavingSymptoms,
    savedMessage: symptomsSavedMsg,
    submit: handleUpdateSymptoms,
  } = symptoms;

  const {
    showForm: showAddFollowup,
    setShowForm: setShowAddFollowup,
    title: newFollowupTitle,
    setTitle: setNewFollowupTitle,
    date: newFollowupDate,
    setDate: setNewFollowupDate,
    notes: newFollowupNotes,
    setNotes: setNewFollowupNotes,
    isSaving: isSavingFollowup,
    submit: handleAddFollowup,
    completingId: completingFollowupId,
    completionNotes,
    setCompletionNotes,
    completionPhotoName,
    setCompletionPhotoName,
    completionPhotoNote,
    setCompletionPhotoNote,
    completionPhotoData,
    completionPhotos,
    openCompletionForm,
    closeCompletionForm,
    onCompletionPhotoFileChange: handleCompletionPhotoFileChange,
    addCompletionPhotoDraft,
    removeCompletionPhotoDraft,
    completeSubmit: handleCompleteFollowup,
    isSavingCompletion,
  } = followup;

  const {
    name: newPhotoName,
    setName: setNewPhotoName,
    note: newPhotoNote,
    setNote: setNewPhotoNote,
    data: newPhotoData,
    isSaving: isSavingPhoto,
    onFileChange: handlePhotoFileChange,
    submit: handleUploadPhoto,
  } = photo;

  return (
    <div className="min-h-screen bg-white py-6 sm:py-10">
      <main className="mx-auto w-full max-w-6xl px-3 sm:px-6">
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-700/20 bg-red-600 p-4 text-white">
          <AlertCircleIcon className="mt-0.5 h-5 w-5 flex-none" />
          <p className="text-xs leading-relaxed sm:text-sm">
            <strong>{t.emergencyTitle}</strong> {t.emergencyBody}
          </p>
        </div>

        <article className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
          <header className="border-b border-border/80 bg-white px-4 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <UserIcon className="h-6 w-6" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {patient.full_name}
                    </h1>
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold capitalize text-emerald-700 dark:text-emerald-400">
                      {patient.status} {t.careLabel}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${priorityMeta.badgeClass}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${priorityMeta.dotClass}`} />
                      <span>{priorityMeta.label}</span>
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    {t.portalRecord} #{patient.id}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs sm:text-right">
                <p className="font-semibold text-foreground">{t.assignedStaff}</p>
                <p className="font-bold text-primary">
                  {patient.assigned_worker_name || t.fallbackTeam}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3 sm:gap-4 sm:text-sm">
              <p className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{t.phone}</span>
                <strong className="text-foreground">{patient.phone}</strong>
              </p>
              <p className="flex items-center gap-2">
                <MailIcon className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{t.email}</span>
                <strong className="break-all text-foreground">{patient.email}</strong>
              </p>
              <p className="flex items-center gap-2">
                <ShieldIcon className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{t.location}</span>
                <strong className="break-words text-foreground">{patient.address || t.notSpecified}</strong>
              </p>
            </div>

            <div className="no-scrollbar mt-5 flex items-center gap-2 overflow-x-auto border-t border-border pb-1 pt-4">
              <PortalTabButton
                isActive={activeTab === "actions"}
                label={t.tabs.actions}
                onClick={() => setActiveTab("actions")}
              />
              <PortalTabButton
                isActive={activeTab === "plan"}
                label={t.tabs.plan}
                onClick={() => setActiveTab("plan")}
              />
              <PortalTabButton
                isActive={activeTab === "photos"}
                label={t.tabs.photos}
                onClick={() => setActiveTab("photos")}
              />
              <PortalTabButton
                isActive={activeTab === "notes"}
                label={t.tabs.notes}
                onClick={() => setActiveTab("notes")}
              />
            </div>
          </header>

          {errorMessage ? (
            <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-700 dark:text-red-300 sm:px-8 sm:text-sm">
              {errorMessage}
            </div>
          ) : null}

          {activeTab === "actions" ? (
            <section className="grid grid-cols-1 gap-0 lg:grid-cols-2">
              <div className="border-b border-border/70 px-4 py-5 sm:px-6 lg:border-b-0 lg:border-r lg:px-8">
                <SectionTitle icon={<BellIcon className="h-4 w-4" />} title={t.stepUpdate} />
                <p className="mb-4 text-xs text-muted-foreground sm:text-sm">{t.actionHint}</p>

                {symptomsSavedMsg ? (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300 sm:text-sm">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>{t.symptomsSaved}</span>
                  </div>
                ) : null}

                <form onSubmit={handleUpdateSymptoms} className="grid grid-cols-1 gap-4 text-xs sm:text-sm">
                  <div>
                    <label className="mb-1 block font-semibold text-foreground">{t.howFeeling}</label>
                    <textarea
                      rows={5}
                      value={symptomsText}
                      onChange={(e) => setSymptomsText(e.target.value)}
                      placeholder={t.symptomsPlaceholder}
                      className="w-full rounded-xl border border-border bg-white p-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold text-foreground">{t.priorityLevel}</label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value as PatientPriority)}
                      className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="critical">{t.priorityCritical}</option>
                      <option value="high">{t.priorityHigh}</option>
                      <option value="moderate">{t.priorityModerate}</option>
                      <option value="low">{t.priorityLow}</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingSymptoms}
                    className="w-full rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60 sm:w-auto"
                  >
                    {isSavingSymptoms ? t.saving : t.updateSymptoms}
                  </button>
                </form>
              </div>

              <div className="px-4 py-5 sm:px-6 lg:px-8">
                <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <SectionTitle
                    icon={<CalendarIcon className="h-4 w-4" />}
                    title={`${t.stepFollowups} (${sortedFollowups.length})`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddFollowup(!showAddFollowup)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-primary-hover sm:w-auto"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>{t.requestFollowup}</span>
                  </button>
                </div>

                {showAddFollowup ? (
                  <form onSubmit={handleAddFollowup} className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-border bg-muted/40 p-4 text-xs sm:text-sm">
                    <div>
                      <label className="mb-1 block font-semibold text-foreground">{t.followupTitle}</label>
                      <input
                        type="text"
                        required
                        value={newFollowupTitle}
                        onChange={(e) => setNewFollowupTitle(e.target.value)}
                        placeholder={t.followupTitlePlaceholder}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block font-semibold text-foreground">{t.preferredDate}</label>
                        <input
                          type="date"
                          required
                          value={newFollowupDate}
                          onChange={(e) => setNewFollowupDate(e.target.value)}
                          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block font-semibold text-foreground">{t.notes}</label>
                        <input
                          type="text"
                          value={newFollowupNotes}
                          onChange={(e) => setNewFollowupNotes(e.target.value)}
                          placeholder={t.notesPlaceholder}
                          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddFollowup(false)}
                        className="rounded-lg border border-border bg-white px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingFollowup}
                        className="rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
                      >
                        {isSavingFollowup ? t.submitting : t.submitRequest}
                      </button>
                    </div>
                  </form>
                ) : null}

                {sortedFollowups.length > 0 ? (
                  <div className="divide-y divide-border rounded-xl border border-border/80 bg-white">
                    {sortedFollowups.map((item) => (
                      <div key={item.id}>
                        <div className="flex flex-col gap-2 p-4 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary-soft text-primary">
                              <ClockIcon className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground">{item.title}</p>
                              <p className="text-muted-foreground">
                                {t.date} <strong className="text-foreground">{item.date}</strong>
                              </p>
                              <p className="break-words text-muted-foreground">{item.notes || t.noNotes}</p>
                            </div>
                          </div>
                          <span
                            className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${
                              item.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        {item.status !== "completed" ? (
                          <div className="border-t border-border/70 p-4">
                            {completingFollowupId === item.id ? (
                              <form onSubmit={handleCompleteFollowup} className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="mb-1 block text-xs font-semibold text-foreground">{t.completionNotes}</label>
                              <textarea
                                rows={3}
                                value={completionNotes}
                                onChange={(e) => setCompletionNotes(e.target.value)}
                                placeholder={t.completionNotesPlaceholder}
                                className="w-full rounded-lg border border-border bg-white p-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              />
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-xs font-semibold text-foreground">{t.completionPhotoTitle}</label>
                                <input
                                  type="text"
                                  value={completionPhotoName}
                                  onChange={(e) => setCompletionPhotoName(e.target.value)}
                                  placeholder={t.completionPhotoTitlePlaceholder}
                                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-semibold text-foreground">{t.completionPhotoNote}</label>
                                <input
                                  type="text"
                                  value={completionPhotoNote}
                                  onChange={(e) => setCompletionPhotoNote(e.target.value)}
                                  placeholder={t.completionPhotoNotePlaceholder}
                                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleCompletionPhotoFileChange}
                                className="w-full text-xs text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
                              />
                              <button
                                type="button"
                                disabled={!completionPhotoData}
                                onClick={addCompletionPhotoDraft}
                                className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                              >
                                {t.addAttachment}
                              </button>
                            </div>

                            {completionPhotos.length > 0 ? (
                              <div>
                                <p className="mb-1 text-xs font-semibold text-foreground">{t.attachments}</p>
                                <div className="space-y-1">
                                  {completionPhotos.map((photoItem) => (
                                    <div key={photoItem.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-2.5 py-2 text-xs">
                                      <span className="truncate text-foreground">{photoItem.name}</span>
                                      <button
                                        type="button"
                                        onClick={() => removeCompletionPhotoDraft(photoItem.id)}
                                        className="font-semibold text-red-600 hover:underline"
                                      >
                                        {t.cancel}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}

                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                              <button
                                type="button"
                                onClick={closeCompletionForm}
                                className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                              >
                                {t.cancel}
                              </button>
                              <button
                                type="submit"
                                disabled={isSavingCompletion}
                                className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
                              >
                                {isSavingCompletion ? t.completing : t.markCompleted}
                              </button>
                            </div>
                              </form>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openCompletionForm(item.id)}
                                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                              >
                                {t.completeFollowup}
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="border-t border-border/70 p-4 text-xs text-muted-foreground">
                            {item.completed_at ? `${t.completedOn} ${item.completed_at}` : null}
                            {item.completion_notes ? (
                              <p className="mt-1 break-words text-foreground">{item.completion_notes}</p>
                            ) : null}
                            {item.completion_photos && item.completion_photos.length > 0 ? (
                              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {item.completion_photos.map((photoItem) => (
                                  <div key={photoItem.id} className="overflow-hidden rounded-lg border border-border bg-white">
                                    <img src={photoItem.data_url} alt={photoItem.name} className="h-16 w-full object-cover" />
                                    <p className="truncate px-2 py-1 text-[11px] text-foreground">{photoItem.name}</p>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground sm:text-sm">{t.noFollowups}</p>
                )}
              </div>
            </section>
          ) : null}

          {activeTab === "plan" ? (
            <section className="px-4 py-5 sm:px-8 sm:py-6">
              <SectionTitle icon={<EditIcon className="h-4 w-4" />} title={t.treatmentTitle} />

              {patient.treatment_plan ? (
                <div className="grid grid-cols-1 gap-5 text-xs sm:text-sm">
                  {patient.treatment_plan.diagnosis ? (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-primary sm:text-xs">{t.diagnosis}</p>
                      <p className="mt-1 whitespace-pre-wrap text-foreground">{patient.treatment_plan.diagnosis}</p>
                    </div>
                  ) : null}

                  {patient.treatment_plan.goals ? (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs">{t.goals}</p>
                      <p className="mt-1 whitespace-pre-wrap text-foreground">{patient.treatment_plan.goals}</p>
                    </div>
                  ) : null}

                  {patient.treatment_plan.medications ? (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs">{t.meds}</p>
                      <p className="mt-1 whitespace-pre-wrap text-foreground">{patient.treatment_plan.medications}</p>
                    </div>
                  ) : null}

                  {patient.treatment_plan.care_instructions ? (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs">{t.instructions}</p>
                      <p className="mt-1 whitespace-pre-wrap text-foreground">{patient.treatment_plan.care_instructions}</p>
                    </div>
                  ) : null}

                  {patient.treatment_plan.photos && patient.treatment_plan.photos.length > 0 ? (
                    <div>
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs">{t.attached}</p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {patient.treatment_plan.photos.map((item) => (
                          <div key={item.id} className="overflow-hidden rounded-xl border border-border/80 bg-white">
                            <img src={item.data_url} alt={item.name} className="h-24 w-full object-cover" />
                            <p className="truncate px-2 py-1 text-[11px] font-semibold text-foreground" title={item.name}>
                              {item.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground sm:text-sm">{t.noTreatment}</p>
              )}
            </section>
          ) : null}

          {activeTab === "photos" ? (
            <section className="px-4 py-5 sm:px-8 sm:py-6">
              <SectionTitle icon={<ImageIcon className="h-4 w-4" />} title={`${t.photosTitle} (${patient.photos?.length || 0})`} />

              <form onSubmit={handleUploadPhoto} className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-border bg-muted/40 p-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-semibold text-foreground">{t.selectImage}</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileChange}
                      className="w-full text-xs text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold text-foreground">{t.photoTitle}</label>
                    <input
                      type="text"
                      value={newPhotoName}
                      onChange={(e) => setNewPhotoName(e.target.value)}
                      placeholder={t.photoTitlePlaceholder}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-foreground">{t.notes}</label>
                  <input
                    type="text"
                    value={newPhotoNote}
                    onChange={(e) => setNewPhotoNote(e.target.value)}
                    placeholder={t.photoNotesPlaceholder}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                {newPhotoData ? (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-2">
                    <img src={newPhotoData} alt="Preview" className="h-12 w-12 rounded border border-border object-cover" />
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{t.readyPhoto}</span>
                  </div>
                ) : null}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newPhotoData || isSavingPhoto}
                    className="w-full rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-50 sm:w-auto"
                  >
                    {isSavingPhoto ? t.uploading : t.attachPhoto}
                  </button>
                </div>
              </form>

              {patient.photos && patient.photos.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {patient.photos.map((item) => (
                    <div key={item.id} className="overflow-hidden rounded-xl border border-border/80 bg-white">
                      <div className="aspect-square w-full overflow-hidden bg-muted">
                        <img src={item.data_url} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="p-2 text-xs">
                        <p className="truncate font-semibold text-foreground" title={item.name}>{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">{item.date}</p>
                        {item.notes ? (
                          <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{item.notes}</p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground sm:text-sm">{t.noPhotos}</p>
              )}
            </section>
          ) : null}

          {activeTab === "notes" ? (
            <section className="px-4 py-5 sm:px-8 sm:py-6">
              <SectionTitle icon={<EditIcon className="h-4 w-4" />} title={t.notesTabTitle} />

              {notesLog.length > 0 ? (
                <div className="space-y-2">
                  {notesLog.map((entry) => (
                    <article key={entry.id} className="rounded-xl border border-border bg-white p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-foreground">{entry.title}</p>
                        <p className="text-[11px] text-muted-foreground">{entry.date}</p>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground">{entry.text}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground sm:text-sm">{t.noNoteEntries}</p>
              )}
            </section>
          ) : null}
        </article>
      </main>
    </div>
  );
}
