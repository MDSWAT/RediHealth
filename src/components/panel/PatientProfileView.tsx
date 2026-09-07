"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CopyIcon,
  EditIcon,
  GlobeIcon,
  ImageIcon,
  PrinterIcon,
  TrashIcon,
  UserIcon,
} from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type {
  FollowupItem,
  PatientItem,
  PatientPhoto,
  PatientPriority,
  PatientStatus,
  TreatmentPlan,
} from "@/lib/types/patient";
import {
  getPriorityMeta,
} from "@/lib/patient-helpers";
import { DEFAULT_LANG, getLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";
import { CreatePatientModal } from "./CreatePatientModal";
import { PatientPrintReport } from "./PatientPrintReport";
import { PatientOverviewTab } from "./PatientOverviewTab";
import { PatientTreatmentTab } from "./PatientTreatmentTab";
import { PatientFollowupsTab } from "./PatientFollowupsTab";
import { PatientPhotosTab } from "./PatientPhotosTab";
import { PatientTimelineTab } from "./PatientTimelineTab";

interface PatientProfileViewProps {
  initialPatient: PatientItem;
}

type TabType = "overview" | "treatment" | "followups" | "photos" | "timeline";

export function PatientProfileView({ initialPatient }: PatientProfileViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const lang = getLangFromPathname(pathname) ?? DEFAULT_LANG;
  const { lang: activeLang } = useLanguage();
  const t = {
    en: {
      backToList: "Back to Patients Directory",
      careSuffix: "Care",
      patientRecordId: "Patient Record ID",
      convertedFrom: "Converted from Request",
      assignedWorker: "Assigned Worker",
      unassigned: "Unassigned",
      registeredOn: "Registered on",
      editDemographics: "Edit Demographics",
      printPdf: "Compile & Print PDF",
      portalLinkTitle: "Patient Portal Access Link",
      portalLinkHint: "The patient received an email with this link to view their care plan, report symptoms, add photos, and request follow-ups.",
      linkCopied: "Link Copied!",
      copyPortalLink: "Copy Portal Link",
      openPortal: "Open Portal View",
      tabProfile: "Patient Profile",
      tabTreatment: "Treatment Plan",
      tabFollowups: "Follow-ups",
      tabPhotos: "Photos & Files",
      tabTimeline: "Medical History Timeline",
      deleteConfirm: "Permanently delete patient record?",
      deleting: "Deleting...",
      confirmDelete: "Confirm Delete",
      cancel: "Cancel",
      deleteProfile: "Delete Patient Profile",
      failedUpdate: "Failed to update profile.",
      failedSave: "An error occurred while saving.",
      failedDelete: "Failed to delete patient profile.",
      failedMeeting: "Could not create the meeting.",
      failedDeleteMeeting: "Could not delete the linked meeting.",
      failedDeleteHistory: "Could not delete meeting history.",
      photoSize: "Photo size must be under 5MB.",
    },
    ro: {
      backToList: "Inapoi la lista pacientilor",
      careSuffix: "Ingrijire",
      patientRecordId: "ID dosar pacient",
      convertedFrom: "Convertit din cererea",
      assignedWorker: "Lucrator alocat",
      unassigned: "Nealocat",
      registeredOn: "Inregistrat la",
      editDemographics: "Editeaza datele",
      printPdf: "Genereaza si tipareste PDF",
      portalLinkTitle: "Link acces portal pacient",
      portalLinkHint: "Pacientul a primit email cu acest link pentru planul de ingrijire, simptome, poze si follow-up.",
      linkCopied: "Link copiat!",
      copyPortalLink: "Copiaza link portal",
      openPortal: "Deschide portalul",
      tabProfile: "Profil pacient",
      tabTreatment: "Plan de tratament",
      tabFollowups: "Follow-up-uri",
      tabPhotos: "Poze si fisiere",
      tabTimeline: "Istoric medical",
      deleteConfirm: "Stergi definitiv dosarul pacientului?",
      deleting: "Se sterge...",
      confirmDelete: "Confirma stergerea",
      cancel: "Anuleaza",
      deleteProfile: "Sterge profilul pacientului",
      failedUpdate: "Actualizarea profilului a esuat.",
      failedSave: "A aparut o eroare la salvare.",
      failedDelete: "Stergerea profilului pacientului a esuat.",
      failedMeeting: "Nu s-a putut crea intalnirea.",
      failedDeleteMeeting: "Nu s-a putut sterge intalnirea asociata.",
      failedDeleteHistory: "Nu s-a putut sterge istoricul intalnirii.",
      photoSize: "Dimensiunea pozei trebuie sa fie sub 5MB.",
    },
    sq: {
      backToList: "Kthehu te lista e pacienteve",
      careSuffix: "Kujdes",
      patientRecordId: "ID e dosjes se pacientit",
      convertedFrom: "Konvertuar nga kerkesa",
      assignedWorker: "Punonjes i caktuar",
      unassigned: "Pacaktuar",
      registeredOn: "Regjistruar me",
      editDemographics: "Ndrysho te dhenat",
      printPdf: "Gjenero dhe printo PDF",
      portalLinkTitle: "Lidhje e portalit te pacientit",
      portalLinkHint: "Pacienti mori email me kete lidhje per planin e kujdesit, simptoma, foto dhe follow-up.",
      linkCopied: "Lidhja u kopjua!",
      copyPortalLink: "Kopjo lidhjen e portalit",
      openPortal: "Hap portalin",
      tabProfile: "Profil pacienti",
      tabTreatment: "Plani i trajtimit",
      tabFollowups: "Ndjekjet",
      tabPhotos: "Foto dhe skedare",
      tabTimeline: "Historiku mjekesor",
      deleteConfirm: "Ta fshijme pergjithmone dosjen e pacientit?",
      deleting: "Duke fshire...",
      confirmDelete: "Konfirmo fshirjen",
      cancel: "Anulo",
      deleteProfile: "Fshij profilin e pacientit",
      failedUpdate: "Perditesimi i profilit deshtoi.",
      failedSave: "Ndodhi nje gabim gjate ruajtjes.",
      failedDelete: "Fshirja e profilit te pacientit deshtoi.",
      failedMeeting: "Takimi nuk u krijua.",
      failedDeleteMeeting: "Nuk u fshi takimi i lidhur.",
      failedDeleteHistory: "Nuk u fshi historiku i takimit.",
      photoSize: "Madhesia e fotos duhet te jete nen 5MB.",
    },
    it: {
      backToList: "Torna all'elenco pazienti",
      careSuffix: "Assistenza",
      patientRecordId: "ID scheda paziente",
      convertedFrom: "Convertito dalla richiesta",
      assignedWorker: "Operatore assegnato",
      unassigned: "Non assegnato",
      registeredOn: "Registrato il",
      editDemographics: "Modifica anagrafica",
      printPdf: "Genera e stampa PDF",
      portalLinkTitle: "Link accesso portale paziente",
      portalLinkHint: "Il paziente ha ricevuto un'email con questo link per piano cure, sintomi, foto e follow-up.",
      linkCopied: "Link copiato!",
      copyPortalLink: "Copia link portale",
      openPortal: "Apri portale",
      tabProfile: "Profilo paziente",
      tabTreatment: "Piano di trattamento",
      tabFollowups: "Follow-up",
      tabPhotos: "Foto e file",
      tabTimeline: "Cronologia medica",
      deleteConfirm: "Eliminare definitivamente la scheda paziente?",
      deleting: "Eliminazione...",
      confirmDelete: "Conferma eliminazione",
      cancel: "Annulla",
      deleteProfile: "Elimina profilo paziente",
      failedUpdate: "Aggiornamento profilo non riuscito.",
      failedSave: "Si e verificato un errore durante il salvataggio.",
      failedDelete: "Eliminazione profilo paziente non riuscita.",
      failedMeeting: "Impossibile creare la riunione.",
      failedDeleteMeeting: "Impossibile eliminare la riunione collegata.",
      failedDeleteHistory: "Impossibile eliminare la cronologia riunione.",
      photoSize: "La foto deve essere inferiore a 5MB.",
    },
  }[activeLang];
  const [patient, setPatient] = useState<PatientItem>(initialPatient);
  const portalPath = patient.access_token
    ? withLangPrefix(`/patient-portal/${patient.access_token}`, lang)
    : null;
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [status, setStatus] = useState<PatientStatus>(patient.status);
  const [priority, setPriority] = useState<PatientPriority>(patient.priority || "moderate");
  const [assignedWorkerIds, setAssignedWorkerIds] = useState<string[]>(
    patient.assigned_worker_ids && patient.assigned_worker_ids.length > 0
      ? patient.assigned_worker_ids
      : patient.assigned_worker_id
      ? [patient.assigned_worker_id]
      : [],
  );
  const [assignedWorkerNames, setAssignedWorkerNames] = useState<string[]>(
    patient.assigned_worker_names && patient.assigned_worker_names.length > 0
      ? patient.assigned_worker_names
      : patient.assigned_worker_name
      ? [patient.assigned_worker_name]
      : [],
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);
  const [isUpdatingWorker, setIsUpdatingWorker] = useState(false);
  const [workersList, setWorkersList] = useState<{ id: string; full_name: string; role: string }[]>([]);

  useEffect(() => {
    void fetch("/api/workers")
      .then((res) => res.json())
      .then((data: { workers?: { id: string; full_name: string; role: string }[] }) => {
        if (Array.isArray(data.workers)) {
          setWorkersList(data.workers);
        }
      })
      .catch(() => {});
  }, []);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan>(
    patient.treatment_plan || {
      diagnosis: "",
      goals: "",
      medications: "",
      care_instructions: "",
      photos: [],
    },
  );
  const [isSavingTreatment, setIsSavingTreatment] = useState(false);
  const [treatmentSavedMsg, setTreatmentSavedMsg] = useState(false);

  const [tpPhotoName, setTpPhotoName] = useState("");
  const [tpPhotoData, setTpPhotoData] = useState<string | null>(null);

  const [followups, setFollowups] = useState<FollowupItem[]>(
    patient.followups || [],
  );
  const [newFollowupTitle, setNewFollowupTitle] = useState("");
  const [newFollowupDate, setNewFollowupDate] = useState("");
  const [newFollowupNotes, setNewFollowupNotes] = useState("");
  const [newFollowupReminder, setNewFollowupReminder] = useState(true);
  const [newFollowupCreateMeeting, setNewFollowupCreateMeeting] = useState(false);
  const [showAddFollowup, setShowAddFollowup] = useState(false);

  const [photos, setPhotos] = useState<PatientPhoto[]>(patient.photos || []);
  const [newPhotoName, setNewFollowPhotoName] = useState("");
  const [newPhotoNote, setNewFollowPhotoNote] = useState("");
  const [newPhotoData, setNewPhotoData] = useState<string | null>(null);

  const [isPrintMode, setIsPrintMode] = useState(false);
  const [copiedPortalLink, setCopiedPortalLink] = useState(false);

  function handleCopyPortalLink() {
    if (!portalPath) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const link = `${origin}${portalPath}`;
    void navigator.clipboard.writeText(link);
    setCopiedPortalLink(true);
    setTimeout(() => setCopiedPortalLink(false), 2500);
  }

  async function savePatientField(
    updates: Partial<PatientItem>,
  ): Promise<boolean> {
    setErrorMessage(null);
    try {
      const response = await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: patient.id,
          ...updates,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setErrorMessage(data.error || t.failedUpdate);
        return false;
      }

      setPatient((prev) => ({ ...prev, ...updates }));
      return true;
    } catch {
      setErrorMessage(t.failedSave);
      return false;
    }
  }

  async function handleStatusChange(newStatus: PatientStatus) {
    setStatus(newStatus);
    setIsUpdatingStatus(true);
    const ok = await savePatientField({ status: newStatus });
    if (!ok) {
      setStatus(patient.status);
    }
    setIsUpdatingStatus(false);
  }

  async function handlePriorityChange(newPriority: PatientPriority) {
    setPriority(newPriority);
    setIsUpdatingPriority(true);
    const ok = await savePatientField({ priority: newPriority });
    if (!ok) {
      setPriority(patient.priority || "moderate");
    }
    setIsUpdatingPriority(false);
  }

  async function handleWorkerChange(newWorkerIds: string[]) {
    setAssignedWorkerIds(newWorkerIds);
    setIsUpdatingWorker(true);
    const matchedNames = workersList
      .filter((w) => newWorkerIds.includes(w.id))
      .map((w) => w.full_name);
    const ok = await savePatientField({
      assigned_worker_id: newWorkerIds[0] || null,
      assigned_worker_ids: newWorkerIds,
      assigned_worker_name: matchedNames[0] || null,
      assigned_worker_names: matchedNames,
    });
    if (ok) {
      setAssignedWorkerNames(matchedNames);
    } else {
      setAssignedWorkerIds(
        patient.assigned_worker_ids && patient.assigned_worker_ids.length > 0
          ? patient.assigned_worker_ids
          : patient.assigned_worker_id
          ? [patient.assigned_worker_id]
          : [],
      );
    }
    setIsUpdatingWorker(false);
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/patients?id=${encodeURIComponent(patient.id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setErrorMessage(data.error || "Failed to delete patient profile.");
        setIsDeleting(false);
        return;
      }

      router.push(withLangPrefix("/panel/patients", lang));
    } catch {
      setErrorMessage(t.failedDelete);
      setIsDeleting(false);
    }
  }

  async function handleSaveTreatmentPlan() {
    setIsSavingTreatment(true);
    const ok = await savePatientField({ treatment_plan: treatmentPlan });
    setIsSavingTreatment(false);
    if (ok) {
      setTreatmentSavedMsg(true);
      setTimeout(() => setTreatmentSavedMsg(false), 2500);
    }
  }

  async function handleAddFollowup(e: React.FormEvent) {
    e.preventDefault();
    if (!newFollowupTitle.trim() || !newFollowupDate.trim()) return;

    const followupId = String(Date.now());
    let meetingId: string | undefined;
    let meetingUrl: string | undefined;
    if (newFollowupCreateMeeting) {
      const meetingResponse = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newFollowupTitle.trim(),
          patientId: patient.id,
          followupId,
        }),
      });
      const meetingData = (await meetingResponse.json()) as { id?: string; meetingUrl?: string; error?: string };
      if (!meetingResponse.ok || !meetingData.id || !meetingData.meetingUrl) {
        setErrorMessage(meetingData.error || t.failedMeeting);
        return;
      }
      meetingId = meetingData.id;
      meetingUrl = meetingData.meetingUrl;
    }

    const newItem: FollowupItem = {
      id: followupId,
      title: newFollowupTitle.trim(),
      date: newFollowupDate,
      notes: newFollowupNotes.trim() || undefined,
      status: "scheduled",
      reminder_set: newFollowupReminder,
      meeting_id: meetingId,
      meeting_url: meetingUrl,
    };

    const nextFollowups = [newItem, ...followups];
    setFollowups(nextFollowups);
    setNewFollowupTitle("");
    setNewFollowupDate("");
    setNewFollowupNotes("");
    setNewFollowupCreateMeeting(false);
    setShowAddFollowup(false);

    await savePatientField({ followups: nextFollowups });
  }

  async function handleToggleFollowupStatus(
    id: string,
    newStatus: FollowupItem["status"],
  ) {
    const nextFollowups = followups.map((f) =>
      f.id === id ? { ...f, status: newStatus } : f,
    );
    setFollowups(nextFollowups);
    await savePatientField({ followups: nextFollowups });
  }

  async function handleDeleteFollowup(followup: FollowupItem) {
    if (followup.meeting_id) {
      const response = await fetch(`/api/meetings?id=${followup.meeting_id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setErrorMessage(data.error || t.failedDeleteMeeting);
        return;
      }
    }

    const nextFollowups = followups.filter((item) => item.id !== followup.id);
    setFollowups(nextFollowups);
    await savePatientField({ followups: nextFollowups });
  }

  async function handleDeleteMeetingHistory(followup: FollowupItem) {
    if (!followup.meeting_id || !window.confirm(t.deleteConfirm)) return;

    const response = await fetch(`/api/meetings?id=${followup.meeting_id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setErrorMessage(data.error || t.failedDeleteHistory);
      return;
    }

    setFollowups((current) => current.map((item) => {
      if (item.id !== followup.id) return item;
      const remainingFollowup = { ...item };
      delete remainingFollowup.meeting_id;
      delete remainingFollowup.meeting_url;
      delete remainingFollowup.meeting_transcript;
      delete remainingFollowup.meeting_notes;
      return remainingFollowup;
    }));
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(t.photoSize);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setNewPhotoData(dataUrl);
      if (!newPhotoName) {
        setNewFollowPhotoName(file.name);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleAddPhoto(e: React.FormEvent) {
    e.preventDefault();
    if (!newPhotoData) return;

    const newPhoto: PatientPhoto = {
      id: String(Date.now()),
      name: newPhotoName.trim() || "Medical Document / Photo",
      data_url: newPhotoData,
      date: new Date().toISOString().slice(0, 10),
      notes: newPhotoNote.trim() || undefined,
    };

    const nextPhotos = [newPhoto, ...photos];
    setPhotos(nextPhotos);
    setNewPhotoData(null);
    setNewFollowPhotoName("");
    setNewFollowPhotoNote("");

    await savePatientField({ photos: nextPhotos });
  }

  async function handleDeletePhoto(id: string) {
    const nextPhotos = photos.filter((p) => p.id !== id);
    setPhotos(nextPhotos);
    await savePatientField({ photos: nextPhotos });
  }

  function handleTpPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(t.photoSize);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setTpPhotoData(dataUrl);
      if (!tpPhotoName) {
        setTpPhotoName(file.name);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleAddTpPhoto(e: React.FormEvent) {
    e.preventDefault();
    if (!tpPhotoData) return;

    const newPhoto: PatientPhoto = {
      id: String(Date.now()),
      name: tpPhotoName.trim() || "Treatment Plan Photo",
      data_url: tpPhotoData,
      date: new Date().toISOString().slice(0, 10),
    };

    const nextPhotos = [...(treatmentPlan.photos || []), newPhoto];
    setTreatmentPlan((prev) => ({ ...prev, photos: nextPhotos }));
    setTpPhotoData(null);
    setTpPhotoName("");
  }

  function handleDeleteTpPhoto(photoId: string) {
    const nextPhotos = (treatmentPlan.photos || []).filter((p) => p.id !== photoId);
    setTreatmentPlan((prev) => ({ ...prev, photos: nextPhotos }));
  }

  const hasTreatmentPlan = Boolean(
    treatmentPlan.diagnosis?.trim() ||
      treatmentPlan.goals?.trim() ||
      treatmentPlan.medications?.trim() ||
      treatmentPlan.care_instructions?.trim() ||
      (treatmentPlan.photos && treatmentPlan.photos.length > 0),
  );

  if (isPrintMode) {
    return (
      <PatientPrintReport
        patient={patient}
        status={status}
        treatmentPlan={treatmentPlan}
        followups={followups}
        photos={photos}
        onClose={() => setIsPrintMode(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <Link
            href={withLangPrefix("/panel/patients", lang)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-2"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>{t.backToList}</span>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {patient.full_name}
            </h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold capitalize ${
                status === "active"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : status === "inactive"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
              }`}
            >
              {status} {t.careSuffix}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                getPriorityMeta(priority).badgeClass
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${getPriorityMeta(priority).dotClass}`} />
              <span>{getPriorityMeta(priority).label}</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t.patientRecordId}: #{patient.id}{" "}
            {patient.request_id ? `(${t.convertedFrom} #${patient.request_id})` : ""} &bull;{" "}
            {t.assignedWorker}: <span className="font-bold text-foreground">{assignedWorkerNames.length > 0 ? assignedWorkerNames.join(", ") : t.unassigned}</span> &bull;{" "}
            {t.registeredOn} {new Date(patient.created_at).toLocaleDateString(activeLang, { dateStyle: "long" })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-sm"
          >
            <EditIcon className="h-4 w-4 text-primary" />
            <span>{t.editDemographics}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrintMode(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition-colors shadow-sm"
          >
            <PrinterIcon className="h-4 w-4" />
            <span>{t.printPdf}</span>
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-600 dark:text-red-400">
          {errorMessage}
        </div>
      ) : null}

      {patient.access_token ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary-soft/30 p-4">
          <div className="text-xs">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              <GlobeIcon className="h-4 w-4 text-primary" />
              <span>{t.portalLinkTitle}</span>
            </p>
            <p className="text-muted-foreground mt-0.5">
              {t.portalLinkHint}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleCopyPortalLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              {copiedPortalLink ? (
                <>
                  <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">{t.linkCopied}</span>
                </>
              ) : (
                <>
                  <CopyIcon className="h-3.5 w-3.5 text-primary" />
                  <span>{t.copyPortalLink}</span>
                </>
              )}
            </button>
            <a
              href={portalPath ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover transition-colors"
            >
              <GlobeIcon className="h-3.5 w-3.5" />
              <span>{t.openPortal}</span>
            </a>
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-1 border-b border-border overflow-x-auto text-xs font-semibold">
        {[
          { id: "overview", label: t.tabProfile, icon: UserIcon },
          { id: "treatment", label: t.tabTreatment, icon: EditIcon },
          { id: "followups", label: `${t.tabFollowups} (${followups.length})`, icon: CalendarIcon },
          { id: "photos", label: `${t.tabPhotos} (${photos.length})`, icon: ImageIcon },
          { id: "timeline", label: t.tabTimeline, icon: ClockIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`inline-flex items-center gap-1.5 border-b-2 px-4 py-3.5 whitespace-nowrap transition-colors ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-6 pt-2">
        {activeTab === "overview" ? (
          <PatientOverviewTab
            patient={patient}
            status={status}
            priority={priority}
            assignedWorkerIds={assignedWorkerIds}
            workersList={workersList}
            isUpdatingStatus={isUpdatingStatus}
            isUpdatingPriority={isUpdatingPriority}
            isUpdatingWorker={isUpdatingWorker}
            treatmentPlan={treatmentPlan}
            hasTreatmentPlan={hasTreatmentPlan}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onWorkerChange={handleWorkerChange}
            onGoToTreatmentTab={() => setActiveTab("treatment")}
          />
        ) : null}

        {activeTab === "treatment" ? (
          <PatientTreatmentTab
            treatmentPlan={treatmentPlan}
            onChangeTreatmentPlan={setTreatmentPlan}
            treatmentSavedMsg={treatmentSavedMsg}
            isSavingTreatment={isSavingTreatment}
            onSaveTreatmentPlan={handleSaveTreatmentPlan}
            tpPhotoName={tpPhotoName}
            onChangeTpPhotoName={setTpPhotoName}
            tpPhotoData={tpPhotoData}
            onTpPhotoUpload={handleTpPhotoUpload}
            onAddTpPhoto={handleAddTpPhoto}
            onDeleteTpPhoto={handleDeleteTpPhoto}
          />
        ) : null}

        {activeTab === "followups" ? (
          <PatientFollowupsTab
            followups={followups}
            showAddFollowup={showAddFollowup}
            onToggleShowAddFollowup={() => setShowAddFollowup(!showAddFollowup)}
            newFollowupTitle={newFollowupTitle}
            onChangeNewFollowupTitle={setNewFollowupTitle}
            newFollowupDate={newFollowupDate}
            onChangeNewFollowupDate={setNewFollowupDate}
            newFollowupNotes={newFollowupNotes}
            onChangeNewFollowupNotes={setNewFollowupNotes}
            newFollowupReminder={newFollowupReminder}
            onChangeNewFollowupReminder={setNewFollowupReminder}
            newFollowupCreateMeeting={newFollowupCreateMeeting}
            onChangeNewFollowupCreateMeeting={setNewFollowupCreateMeeting}
            onAddFollowup={handleAddFollowup}
            onToggleFollowupStatus={handleToggleFollowupStatus}
            onDeleteFollowup={handleDeleteFollowup}
            onDeleteMeetingHistory={handleDeleteMeetingHistory}
            patientId={patient.id}
          />
        ) : null}

        {activeTab === "photos" ? (
          <PatientPhotosTab
            photos={photos}
            newPhotoName={newPhotoName}
            onChangeNewPhotoName={setNewFollowPhotoName}
            newPhotoNote={newPhotoNote}
            onChangeNewPhotoNote={setNewFollowPhotoNote}
            newPhotoData={newPhotoData}
            onImageUpload={handleImageUpload}
            onAddPhoto={handleAddPhoto}
            onDeletePhoto={handleDeletePhoto}
          />
        ) : null}

        {activeTab === "timeline" ? (
          <PatientTimelineTab patient={patient} followups={followups} photos={photos} />
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-6">
        {isConfirmingDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              {t.deleteConfirm}
            </span>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? t.deleting : t.confirmDelete}
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(false)}
              className="rounded-lg border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              {t.cancel}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10"
          >
            <TrashIcon className="h-4 w-4" />
            <span>{t.deleteProfile}</span>
          </button>
        )}
      </div>

      {showEditModal ? (
        <CreatePatientModal
          patient={patient}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updated) => {
            setPatient(updated);
            setShowEditModal(false);
          }}
        />
      ) : null}
    </div>
  );
}
