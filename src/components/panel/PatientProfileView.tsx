"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const [patient, setPatient] = useState<PatientItem>(initialPatient);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [status, setStatus] = useState<PatientStatus>(patient.status);
  const [priority, setPriority] = useState<PatientPriority>(patient.priority || "moderate");
  const [assignedWorkerId, setAssignedWorkerId] = useState<string>(patient.assigned_worker_id || "");
  const [assignedWorkerName, setAssignedWorkerName] = useState<string | null>(patient.assigned_worker_name || null);
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
  const [showAddFollowup, setShowAddFollowup] = useState(false);

  const [photos, setPhotos] = useState<PatientPhoto[]>(patient.photos || []);
  const [newPhotoName, setNewFollowPhotoName] = useState("");
  const [newPhotoNote, setNewFollowPhotoNote] = useState("");
  const [newPhotoData, setNewPhotoData] = useState<string | null>(null);

  const [isPrintMode, setIsPrintMode] = useState(false);
  const [copiedPortalLink, setCopiedPortalLink] = useState(false);

  function handleCopyPortalLink() {
    if (!patient.access_token) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const link = `${origin}/patient-portal/${patient.access_token}`;
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
        setErrorMessage(data.error || "Failed to update profile.");
        return false;
      }

      setPatient((prev) => ({ ...prev, ...updates }));
      return true;
    } catch {
      setErrorMessage("An error occurred while saving.");
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

  async function handleWorkerChange(newWorkerId: string) {
    setAssignedWorkerId(newWorkerId);
    setIsUpdatingWorker(true);
    const matched = workersList.find((w) => w.id === newWorkerId);
    const ok = await savePatientField({
      assigned_worker_id: newWorkerId || null,
    });
    if (ok) {
      setAssignedWorkerName(matched ? matched.full_name : null);
    } else {
      setAssignedWorkerId(patient.assigned_worker_id || "");
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

      router.push("/panel/patients");
    } catch {
      setErrorMessage("Failed to delete patient profile.");
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

    const newItem: FollowupItem = {
      id: String(Date.now()),
      title: newFollowupTitle.trim(),
      date: newFollowupDate,
      notes: newFollowupNotes.trim() || undefined,
      status: "scheduled",
      reminder_set: newFollowupReminder,
    };

    const nextFollowups = [newItem, ...followups];
    setFollowups(nextFollowups);
    setNewFollowupTitle("");
    setNewFollowupDate("");
    setNewFollowupNotes("");
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

  async function handleDeleteFollowup(id: string) {
    const nextFollowups = followups.filter((f) => f.id !== id);
    setFollowups(nextFollowups);
    await savePatientField({ followups: nextFollowups });
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Photo size must be under 5MB.");
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
      setErrorMessage("Photo size must be under 5MB.");
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
            href="/panel/patients"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-2"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>Back to Patients Directory</span>
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
              {status} Care
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
            Patient Record ID: #{patient.id}{" "}
            {patient.request_id ? `(Converted from Request #${patient.request_id})` : ""} &bull;{" "}
            Assigned Worker: <span className="font-bold text-foreground">{assignedWorkerName || "Unassigned"}</span> &bull;{" "}
            Registered on {new Date(patient.created_at).toLocaleDateString("en-US", { dateStyle: "long" })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-sm"
          >
            <EditIcon className="h-4 w-4 text-primary" />
            <span>Edit Demographics</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrintMode(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition-colors shadow-sm"
          >
            <PrinterIcon className="h-4 w-4" />
            <span>Compile & Print PDF</span>
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
              <span>Patient Portal Access Link</span>
            </p>
            <p className="text-muted-foreground mt-0.5">
              The patient received an email with this link to view their care plan, report symptoms, add photos, and request follow-ups.
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
                  <span className="text-emerald-600">Link Copied!</span>
                </>
              ) : (
                <>
                  <CopyIcon className="h-3.5 w-3.5 text-primary" />
                  <span>Copy Portal Link</span>
                </>
              )}
            </button>
            <a
              href={`/patient-portal/${patient.access_token}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover transition-colors"
            >
              <GlobeIcon className="h-3.5 w-3.5" />
              <span>Open Portal View</span>
            </a>
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-1 border-b border-border overflow-x-auto text-xs font-semibold">
        {[
          { id: "overview", label: "Patient Profile", icon: UserIcon },
          { id: "treatment", label: "Treatment Plan", icon: EditIcon },
          { id: "followups", label: `Follow-ups (${followups.length})`, icon: CalendarIcon },
          { id: "photos", label: `Photos & Files (${photos.length})`, icon: ImageIcon },
          { id: "timeline", label: "Medical History Timeline", icon: ClockIcon },
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
            assignedWorkerId={assignedWorkerId}
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
            onAddFollowup={handleAddFollowup}
            onToggleFollowupStatus={handleToggleFollowupStatus}
            onDeleteFollowup={handleDeleteFollowup}
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
              Permanently delete patient record?
            </span>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(false)}
              className="rounded-lg border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10"
          >
            <TrashIcon className="h-4 w-4" />
            <span>Delete Patient Profile</span>
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
