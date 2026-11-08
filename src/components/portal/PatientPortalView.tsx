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
import { followupLabel, sortFollowups } from "@/lib/panel-dates";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { usePatientPortal } from "@/components/portal/usePatientPortal";
import { useLanguage } from "@/lib/i18n/language-context";
import { TreatmentPlansView } from "@/components/panel/TreatmentPlansView";
import { treatmentTranslations } from "@/lib/i18n/treatment-translations";
import type { CountryCode } from "@/lib/countries";

interface PatientPortalViewProps {
  initialPatient: PatientItem;
  token: string;
  country: CountryCode;
}

type PortalTab = "home" | "actions" | "plan" | "photos" | "notes";
type PortalAction = "symptoms" | "followups";

const portalTranslations = {
  en: {
    homeTitle: "Your health page",
    homeIntro: "Choose what you want to do.",
    actionSymptomsTitle: "Tell us how you feel",
    actionSymptomsHint: "Tell your care team about a new symptom or a change.",
    actionFollowupTitle: "Check-ups",
    actionFollowupHint: "Ask your care team to call you or book a check-up.",
    actionPlanTitle: "See your treatment plan",
    actionPlanHint: "Your medicines and what to do at home.",
    actionPhotosTitle: "Add photos",
    actionPhotosHint: "Send photos or documents to your care team.",
    moreOptions: "More",
    backHome: "Back",
    contactDetails: "Your details and contacts",
    emergencyTitle: "In an emergency:",
    emergencyBody:
      "This page is for everyday contact with your care team. If someone's life is in danger, call 112 or go to the nearest A&E.",
    assignedStaff: "Your care team",
    fallbackTeam: "RediHealth care team",
    phone: "Phone:",
    email: "Email:",
    location: "Place:",
    notSpecified: "Not given",
    treatmentTitle: "Treatment plan",
    diagnosis: "Main diagnosis",
    goals: "What the treatment aims for",
    meds: "Medicines and therapies",
    instructions: "What to do at home",
    attached: "Test results and prescriptions",
    noTreatment:
      "There is no treatment plan yet. Your care team will add it here after they see you.",
    symptomsTitle: "Tell us how you feel",
    symptomsSaved: "We saved what you told us. Your care team has been told.",
    howFeeling: "How do you feel?",
    symptomsPlaceholder:
      "Write new symptoms, how bad the pain is, side effects, or how you are getting better…",
    priorityLevel: "How urgent is it",
    priorityCritical: "Very urgent",
    priorityHigh: "Urgent",
    priorityModerate: "Medium",
    priorityLow: "Can wait",
    saving: "Saving…",
    updateSymptoms: "Send",
    followupsTitle: "Appointments and check-ups",
    requestFollowup: "Ask for a check-up",
    followupTitle: "What the check-up is about",
    followupTitlePlaceholder: "Check-up after treatment",
    preferredDate: "Date you prefer",
    notes: "Notes",
    notesPlaceholder: "When you are free, or questions for the team",
    cancel: "Cancel",
    submitting: "Sending…",
    submitRequest: "Send request",
    date: "Date:",
    noFollowups: "No check-up requests yet. Use the button above to ask for one.",
    photosTitle: "Photos and medical documents",
    selectImage: "Choose a photo",
    photoTitle: "Photo name",
    photoTitlePlaceholder: "Skin photo, blood test results",
    photoNotesPlaceholder: "Write what the photo shows",
    readyPhoto: "Photo ready to send",
    uploading: "Uploading…",
    attachPhoto: "Send photo",
    noPhotos: "No photos yet.",
    stepUpdate: "1. Tell us how you feel",
    stepFollowups: "2. Appointments and check-ups",
    actionHint: "Start here so your care team quickly sees what is most urgent.",
    noNotes: "No other notes",
    completeFollowup: "Close check-up",
    completionNotes: "Closing notes",
    completionNotesPlaceholder: "What happened at this check-up?",
    completionPhotoTitle: "Attachment name",
    completionPhotoTitlePlaceholder: "Photo or document from the check-up",
    completionPhotoNote: "Attachment note",
    completionPhotoNotePlaceholder: "Describe the attachment",
    addAttachment: "Add attachment",
    attachments: "Attachments",
    markCompleted: "Mark as done",
    completing: "Closing…",
    completedOn: "Done on",
    notesTabTitle: "Your notes",
    noNoteEntries: "No notes yet.",
    noteFromSymptoms: "How I feel",
    noteFromPhoto: "Photo note",
    noteFromFollowup: "Check-up note",
    noteFromFollowupCompletion: "Check-up closed",
    tabs: {
      actions: "What I can do",
      plan: "Treatment plan",
      photos: "Photos",
      notes: "Notes",
    },
  },
  ro: {
    homeTitle: "Pagina ta de sănătate",
    homeIntro: "Alege ce vrei să faci.",
    actionSymptomsTitle: "Spune-ne cum te simți",
    actionSymptomsHint: "Spune-i echipei medicale dacă ai un simptom nou sau ce s-a schimbat.",
    actionFollowupTitle: "Controale",
    actionFollowupHint: "Cere echipei medicale să te sune sau să-ți facă o programare la control.",
    actionPlanTitle: "Vezi planul de tratament",
    actionPlanHint: "Medicamentele și ce ai de făcut acasă.",
    actionPhotosTitle: "Adaugă poze",
    actionPhotosHint: "Trimite poze sau acte echipei medicale.",
    moreOptions: "Mai mult",
    backHome: "Înapoi",
    contactDetails: "Datele tale și contacte",
    emergencyTitle: "Dacă e o urgență:",
    emergencyBody:
      "Pagina asta e pentru legătura obișnuită cu echipa medicală. Dacă viața cuiva e în pericol, sună la 112 sau mergi la cea mai apropiată Urgență.",
    assignedStaff: "Echipa ta medicală",
    fallbackTeam: "Echipa medicală RediHealth",
    phone: "Telefon:",
    email: "Email:",
    location: "Locul:",
    notSpecified: "Nu e trecut",
    treatmentTitle: "Planul de tratament",
    diagnosis: "Diagnostic principal",
    goals: "Ce urmărește tratamentul",
    meds: "Medicamente și terapii",
    instructions: "Ce ai de făcut acasă",
    attached: "Analize și rețete",
    noTreatment:
      "Încă nu ai un plan de tratament. Echipa medicală îl pune aici după ce te vede.",
    symptomsTitle: "Spune-ne cum te simți",
    symptomsSaved: "Am salvat ce ne-ai spus. Echipa medicală a aflat.",
    howFeeling: "Cum te simți?",
    symptomsPlaceholder:
      "Scrie simptomele noi, cât de tare te doare, ce efecte are tratamentul sau cum îți revii…",
    priorityLevel: "Cât de urgent e",
    priorityCritical: "Foarte urgent",
    priorityHigh: "Urgent",
    priorityModerate: "Mediu",
    priorityLow: "Poate aștepta",
    saving: "Se salvează…",
    updateSymptoms: "Trimite",
    followupsTitle: "Programări și controale",
    requestFollowup: "Cere un control",
    followupTitle: "Despre ce este controlul",
    followupTitlePlaceholder: "Control după tratament",
    preferredDate: "Data preferată",
    notes: "Note",
    notesPlaceholder: "Când ești disponibil sau ce întrebări ai pentru echipă",
    cancel: "Anulează",
    submitting: "Se trimite…",
    submitRequest: "Trimite cererea",
    date: "Data:",
    noFollowups: "Nu ai cerut încă un control. Apasă butonul de mai sus ca să ceri unul.",
    photosTitle: "Poze și acte medicale",
    selectImage: "Alege o poză",
    photoTitle: "Numele pozei",
    photoTitlePlaceholder: "Poză cu pielea, buletin de analize",
    photoNotesPlaceholder: "Scrie ce se vede în poză",
    readyPhoto: "Poza e gata de trimis",
    uploading: "Se încarcă…",
    attachPhoto: "Trimite poza",
    noPhotos: "Nu ai încărcat încă poze.",
    stepUpdate: "1. Spune cum te simți",
    stepFollowups: "2. Programări și controale",
    actionHint: "Începe de aici, ca echipa medicală să vadă repede ce e mai urgent.",
    noNotes: "Fără alte note",
    completeFollowup: "Încheie controlul",
    completionNotes: "Note la încheiere",
    completionNotesPlaceholder: "Ce s-a întâmplat la acest control?",
    completionPhotoTitle: "Numele fișierului",
    completionPhotoTitlePlaceholder: "Poză sau act de la control",
    completionPhotoNote: "Notă la fișier",
    completionPhotoNotePlaceholder: "Ce e în fișier",
    addAttachment: "Adaugă un fișier",
    attachments: "Fișiere",
    markCompleted: "Gata, s-a făcut",
    completing: "Se salvează…",
    completedOn: "Făcut la",
    notesTabTitle: "Notele tale",
    noNoteEntries: "Încă nu ai note.",
    noteFromSymptoms: "Cum mă simt",
    noteFromPhoto: "Notă la poză",
    noteFromFollowup: "Notă la control",
    noteFromFollowupCompletion: "Control încheiat",
    tabs: {
      actions: "Ce pot face",
      plan: "Plan de tratament",
      photos: "Poze",
      notes: "Note",
    },
  },
  sq: {
    homeTitle: "Faqja jote e shëndetit",
    homeIntro: "Zgjidh çfarë do të bësh.",
    actionSymptomsTitle: "Na trego si ndihesh",
    actionSymptomsHint: "Tregoji ekipit mjekësor për një shqetësim të ri ose një ndryshim.",
    actionFollowupTitle: "Kontrollet",
    actionFollowupHint: "Kërko që ekipi mjekësor të të telefonojë ose të caktojë një kontroll.",
    actionPlanTitle: "Shiko planin e trajtimit",
    actionPlanHint: "Ilaçet dhe çfarë duhet të bësh në shtëpi.",
    actionPhotosTitle: "Shto foto",
    actionPhotosHint: "Dërgoji ekipit mjekësor foto ose dokumente.",
    moreOptions: "Më shumë",
    backHome: "Kthehu",
    contactDetails: "Të dhënat e tua dhe kontaktet",
    emergencyTitle: "Në rast urgjence:",
    emergencyBody:
      "Ky portal është për lidhjen e zakonshme me ekipin mjekësor. Nëse jeta e dikujt është në rrezik, telefono 112 ose shko te urgjenca më e afërt.",
    assignedStaff: "Ekipi yt mjekësor",
    fallbackTeam: "Ekipi mjekësor i RediHealth",
    phone: "Telefoni:",
    email: "Email:",
    location: "Vendndodhja:",
    notSpecified: "E pacaktuar",
    treatmentTitle: "Plani i trajtimit",
    diagnosis: "Diagnoza kryesore",
    goals: "Çfarë synon trajtimi",
    meds: "Ilaçe dhe terapi",
    instructions: "Çfarë të bësh në shtëpi",
    attached: "Analiza dhe receta",
    noTreatment:
      "Ende nuk ke plan trajtimi. Ekipi mjekësor do ta vendosë këtu pasi të të shohë.",
    symptomsTitle: "Na trego si ndihesh",
    symptomsSaved: "E ruajtëm atë që na tregove. Ekipi mjekësor u njoftua.",
    howFeeling: "Si ndihesh?",
    symptomsPlaceholder:
      "Shkruaj shqetësimet e reja, sa të dhemb, çfarë efekti ka trajtimi ose si po shërohesh…",
    priorityLevel: "Sa urgjente është",
    priorityCritical: "Shumë urgjente",
    priorityHigh: "Urgjente",
    priorityModerate: "Mesatare",
    priorityLow: "Mund të presë",
    saving: "Po ruhet…",
    updateSymptoms: "Dërgo",
    followupsTitle: "Takime dhe kontrolle",
    requestFollowup: "Kërko një kontroll",
    followupTitle: "Për çfarë është kontrolli",
    followupTitlePlaceholder: "Kontroll pas trajtimit",
    preferredDate: "Data që preferon",
    notes: "Shënime",
    notesPlaceholder: "Kur je i lirë ose çfarë pyetjesh ke për ekipin",
    cancel: "Anulo",
    submitting: "Po dërgohet…",
    submitRequest: "Dërgo kërkesën",
    date: "Data:",
    noFollowups: "Ende nuk ke kërkuar kontroll. Shtyp butonin më lart që të kërkosh një.",
    photosTitle: "Foto dhe dokumente mjekësore",
    selectImage: "Zgjidh një foto",
    photoTitle: "Titulli i fotos",
    photoTitlePlaceholder: "Foto e lëkurës, fletë analizash",
    photoNotesPlaceholder: "Shkruaj çfarë shihet në foto",
    readyPhoto: "Fotoja është gati për t'u dërguar",
    uploading: "Po ngarkohet…",
    attachPhoto: "Dërgo foton",
    noPhotos: "Ende nuk ke ngarkuar foto.",
    stepUpdate: "1. Trego si ndihesh",
    stepFollowups: "2. Takime dhe kontrolle",
    actionHint: "Fillo këtu, që ekipi mjekësor të shohë shpejt çfarë është më urgjente.",
    noNotes: "Pa shënime të tjera",
    completeFollowup: "Mbyll kontrollin",
    completionNotes: "Shënime në mbyllje",
    completionNotesPlaceholder: "Çfarë ndodhi në këtë kontroll?",
    completionPhotoTitle: "Emri i skedarit",
    completionPhotoTitlePlaceholder: "Foto ose dokument nga kontrolli",
    completionPhotoNote: "Shënim për skedarin",
    completionPhotoNotePlaceholder: "Çfarë ka në skedar",
    addAttachment: "Shto skedar",
    attachments: "Skedarë",
    markCompleted: "U bë",
    completing: "Po ruhet…",
    completedOn: "Bërë më",
    notesTabTitle: "Shënimet e tua",
    noNoteEntries: "Ende nuk ka shënime.",
    noteFromSymptoms: "Si ndihem",
    noteFromPhoto: "Shënim për foton",
    noteFromFollowup: "Shënim për kontrollin",
    noteFromFollowupCompletion: "Kontroll i mbyllur",
    tabs: {
      actions: "Çfarë mund të bëj",
      plan: "Plani i trajtimit",
      photos: "Foto",
      notes: "Shënime",
    },
  },
  it: {
    homeTitle: "La tua pagina della salute",
    homeIntro: "Scegli cosa vuoi fare.",
    actionSymptomsTitle: "Dicci come ti senti",
    actionSymptomsHint: "Racconta al team sanitario un sintomo nuovo o cosa è cambiato.",
    actionFollowupTitle: "Controlli",
    actionFollowupHint: "Chiedi al team sanitario di chiamarti o di fissare un controllo.",
    actionPlanTitle: "Vedi il piano di cura",
    actionPlanHint: "Le medicine e cosa fare a casa.",
    actionPhotosTitle: "Aggiungi foto",
    actionPhotosHint: "Manda foto o documenti al team sanitario.",
    moreOptions: "Altro",
    backHome: "Indietro",
    contactDetails: "I tuoi dati e i contatti",
    emergencyTitle: "In caso di emergenza:",
    emergencyBody:
      "Questo portale serve per il contatto abituale con il team sanitario. Se la vita di qualcuno è in pericolo, chiama il 112 o vai al pronto soccorso più vicino.",
    assignedStaff: "Il team sanitario che ti segue",
    fallbackTeam: "Team sanitario RediHealth",
    phone: "Telefono:",
    email: "Email:",
    location: "Luogo:",
    notSpecified: "Non indicato",
    treatmentTitle: "Piano di cura",
    diagnosis: "Diagnosi principale",
    goals: "A cosa serve la cura",
    meds: "Medicine e terapie",
    instructions: "Cosa fare a casa",
    attached: "Esami e ricette",
    noTreatment:
      "Non hai ancora un piano di cura. Il team sanitario lo metterà qui dopo averti visto.",
    symptomsTitle: "Dicci come ti senti",
    symptomsSaved: "Abbiamo salvato quello che ci hai scritto. Il team sanitario lo sa.",
    howFeeling: "Come ti senti?",
    symptomsPlaceholder:
      "Scrivi i nuovi sintomi, quanto è forte il dolore, effetti della cura o come procede la guarigione…",
    priorityLevel: "Quanto è urgente",
    priorityCritical: "Molto urgente",
    priorityHigh: "Urgente",
    priorityModerate: "Medio",
    priorityLow: "Può aspettare",
    saving: "Salvo…",
    updateSymptoms: "Invia",
    followupsTitle: "Appuntamenti e controlli",
    requestFollowup: "Chiedi un controllo",
    followupTitle: "Motivo del controllo",
    followupTitlePlaceholder: "Controllo dopo la cura",
    preferredDate: "Data preferita",
    notes: "Note",
    notesPlaceholder: "Quando sei disponibile o che domande hai per il team",
    cancel: "Annulla",
    submitting: "Invio…",
    submitRequest: "Invia la richiesta",
    date: "Data:",
    noFollowups: "Non hai ancora chiesto un controllo. Premi il pulsante qui sopra per chiederne uno.",
    photosTitle: "Foto e documenti medici",
    selectImage: "Scegli una foto",
    photoTitle: "Nome della foto",
    photoTitlePlaceholder: "Foto della pelle, risultati degli esami",
    photoNotesPlaceholder: "Scrivi cosa si vede nella foto",
    readyPhoto: "Foto pronta da inviare",
    uploading: "Caricamento…",
    attachPhoto: "Invia la foto",
    noPhotos: "Non hai ancora caricato foto.",
    stepUpdate: "1. Di' come ti senti",
    stepFollowups: "2. Appuntamenti e controlli",
    actionHint: "Inizia da qui, così il team sanitario vede subito cosa è più urgente.",
    noNotes: "Nessun'altra nota",
    completeFollowup: "Chiudi il controllo",
    completionNotes: "Note di chiusura",
    completionNotesPlaceholder: "Cosa è successo in questo controllo?",
    completionPhotoTitle: "Nome dell'allegato",
    completionPhotoTitlePlaceholder: "Foto o documento del controllo",
    completionPhotoNote: "Nota sull'allegato",
    completionPhotoNotePlaceholder: "Cosa c'è nell'allegato",
    addAttachment: "Aggiungi allegato",
    attachments: "Allegati",
    markCompleted: "Fatto",
    completing: "Salvo…",
    completedOn: "Fatto il",
    notesTabTitle: "Le tue note",
    noNoteEntries: "Ancora nessuna nota.",
    noteFromSymptoms: "Come mi sento",
    noteFromPhoto: "Nota sulla foto",
    noteFromFollowup: "Nota sul controllo",
    noteFromFollowupCompletion: "Controllo chiuso",
    tabs: {
      actions: "Cosa posso fare",
      plan: "Piano di cura",
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

export function PatientPortalView({
  initialPatient,
  token,
  country,
}: PatientPortalViewProps) {
  const { lang } = useLanguage();
  const t = portalTranslations[lang];
  const [activeTab, setActiveTab] = useState<PortalTab>("home");
  const [activeAction, setActiveAction] = useState<PortalAction>("symptoms");
  const { patient, errorMessage, symptoms, followup, photo } =
    usePatientPortal({ initialPatient, token, country });
  const sortedFollowups = useMemo(
    () => sortFollowups(patient.followups || []),
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
            {activeTab !== "home" ? (
              <button
                type="button"
                onClick={() => setActiveTab("home")}
                className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span aria-hidden="true">←</span>
                {t.backHome}
              </button>
            ) : null}

            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <UserIcon className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {patient.full_name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeTab === "home"
                    ? t.homeTitle
                    : activeTab === "actions"
                      ? activeAction === "symptoms" ? t.symptomsTitle : t.followupsTitle
                      : activeTab === "plan" ? t.tabs.plan
                        : activeTab === "photos" ? t.tabs.photos : t.tabs.notes}
                </p>
              </div>
            </div>

            <details className="mt-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">
                {t.contactDetails}
              </summary>
              <div className="mt-3 grid gap-3 border-t border-border pt-3 text-sm sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 flex-none text-primary" />
                  <span className="text-muted-foreground">{t.phone}</span>
                  <strong className="text-foreground">{patient.phone}</strong>
                </p>
                <p className="flex items-center gap-2">
                  <MailIcon className="h-4 w-4 flex-none text-primary" />
                  <span className="text-muted-foreground">{t.email}</span>
                  <strong className="break-all text-foreground">{patient.email}</strong>
                </p>
                <p className="flex items-center gap-2">
                  <ShieldIcon className="h-4 w-4 flex-none text-primary" />
                  <span className="text-muted-foreground">{t.location}</span>
                  <strong className="break-words text-foreground">{patient.address || t.notSpecified}</strong>
                </p>
                <p>
                  <span className="text-muted-foreground">{t.assignedStaff}: </span>
                  <strong className="text-primary">{patient.assigned_worker_name || t.fallbackTeam}</strong>
                </p>
              </div>
            </details>
          </header>

          {errorMessage ? (
            <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-700 dark:text-red-300 sm:px-8 sm:text-sm">
              {errorMessage}
            </div>
          ) : null}

          {activeTab === "home" ? (
            <section className="px-4 py-6 sm:px-8 sm:py-8">
              <p className="text-sm text-muted-foreground">{t.homeIntro}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveAction("symptoms");
                    setActiveTab("actions");
                  }}
                  className="group flex min-h-36 items-start gap-4 rounded-2xl border border-border bg-white p-5 text-left transition hover:border-primary/50 hover:bg-primary-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <BellIcon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-bold text-foreground">{t.actionSymptomsTitle}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{t.actionSymptomsHint}</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveAction("followups");
                    setShowAddFollowup(true);
                    setActiveTab("actions");
                  }}
                  className="group flex min-h-36 items-start gap-4 rounded-2xl border border-border bg-white p-5 text-left transition hover:border-primary/50 hover:bg-primary-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <CalendarIcon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-bold text-foreground">{t.actionFollowupTitle}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{t.actionFollowupHint}</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("plan")}
                  className="group flex min-h-36 items-start gap-4 rounded-2xl border border-border bg-white p-5 text-left transition hover:border-primary/50 hover:bg-primary-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <EditIcon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-bold text-foreground">{t.actionPlanTitle}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{t.actionPlanHint}</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("photos")}
                  className="group flex min-h-36 items-start gap-4 rounded-2xl border border-border bg-white p-5 text-left transition hover:border-primary/50 hover:bg-primary-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <ImageIcon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-bold text-foreground">{t.actionPhotosTitle}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{t.actionPhotosHint}</span>
                  </span>
                </button>
              </div>

              <div className="mt-8 border-t border-border pt-5">
                <h3 className="text-sm font-bold text-foreground">{t.moreOptions}</h3>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button type="button" onClick={() => setActiveTab("notes")} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {t.tabs.notes}
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === "actions" ? (
            <section className="grid grid-cols-1 gap-0">
              {activeAction === "symptoms" ? (
              <div className="px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
                <SectionTitle icon={<BellIcon className="h-4 w-4" />} title={t.stepUpdate} />
                <p className="mb-4 text-xs text-muted-foreground sm:text-sm">{t.actionHint}</p>

                {symptomsSavedMsg ? (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-sapphire/20 bg-sapphire-soft/60 px-3 py-2 text-xs text-sapphire dark:text-blue-300 sm:text-sm">
                    <CheckCircleIcon className="h-4 w-4 text-sapphire" />
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
              ) : null}

              {activeAction === "followups" ? (
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
                            <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-primary-soft text-primary">
                              <ClockIcon className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground">{item.title}</p>
                              <p className="text-muted-foreground">
                                {t.date} <strong className="text-foreground">{followupLabel(item, langToLocale[lang], crmTranslations[lang].allDay)}</strong>
                              </p>
                              <p className="break-words text-muted-foreground">{item.notes || t.noNotes}</p>
                            </div>
                          </div>
                          <span
                            className={`inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-bold capitalize ${
                              item.status === "completed"
                                ? "bg-sapphire-soft text-sapphire dark:text-blue-300"
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
                                className="rounded-lg bg-sapphire px-3 py-2 text-xs font-semibold text-white hover:bg-sapphire/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
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
                                    <p className="truncate px-2 py-1 text-xs text-foreground">{photoItem.name}</p>
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
              ) : null}
            </section>
          ) : null}

          {activeTab === "plan" ? (
            <section className="px-4 py-5 sm:px-8 sm:py-6">
              <SectionTitle icon={<EditIcon className="h-4 w-4" />} title={treatmentTranslations[lang].title} />

              <TreatmentPlansView plan={patient.treatment_plan} />
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
                    <span className="text-xs font-semibold text-sapphire dark:text-blue-300">{t.readyPhoto}</span>
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
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                        {item.notes ? (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.notes}</p>
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
                        <p className="text-xs text-muted-foreground">{entry.date}</p>
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
