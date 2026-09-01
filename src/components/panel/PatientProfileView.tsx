/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CopyIcon,
  EditIcon,
  GlobeIcon,
  ImageIcon,
  MailIcon,
  PhoneIcon,
  PlusIcon,
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

  function handleTriggerPrint() {
    window.print();
  }

  if (isPrintMode) {
    return (
      <div className="min-h-screen bg-background p-6 print:p-0 print:static">
        <div className="mx-auto max-w-4xl mb-6 flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm print:hidden">
          <div className="flex items-center gap-2">
            <PrinterIcon className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground text-sm">
              Printable Medical Report
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPrintMode(false)}
              className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Back to Profile
            </button>
            <button
              type="button"
              onClick={handleTriggerPrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm"
            >
              <PrinterIcon className="h-4 w-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-white p-8 sm:p-12 text-slate-900 shadow-lg print:border-none print:shadow-none print:p-0">
          <div className="flex items-start justify-between border-b-2 border-primary pb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-primary">
                RediHealth Clinical Center
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Official Patient Medical Profile & Health History Report
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p className="font-bold text-slate-800">CONFIDENTIAL MEDICAL RECORD</p>
              <p className="mt-0.5">
                Report Date: {new Date().toLocaleDateString("en-US", { dateStyle: "full" })}
              </p>
              <p>Patient Record ID: #{patient.id}</p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-3">
              1. Patient Identification & Demographics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="text-slate-500 font-semibold">Full Name:</p>
                <p className="font-bold text-slate-900 text-sm">{patient.full_name}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold">Phone Number:</p>
                <p className="font-medium text-slate-800">{patient.phone}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold">Email Address:</p>
                <p className="font-medium text-slate-800">{patient.email}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold">Date of Birth:</p>
                <p className="font-medium text-slate-800">{patient.date_of_birth || "Not specified"}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold">Gender:</p>
                <p className="font-medium text-slate-800">{patient.gender || "Not specified"}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold">Care Status:</p>
                <p className="font-bold uppercase text-primary">{status} Care</p>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <p className="text-slate-500 font-semibold">Location / Address:</p>
                <p className="font-medium text-slate-800">{patient.address || "Not specified"}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-3">
              2. Clinical Treatment Plan & Directives
            </h2>
            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-800 mb-0.5">Primary Diagnosis / Clinical Findings:</p>
                <p className="text-slate-700 whitespace-pre-wrap">
                  {treatmentPlan.diagnosis || "No primary diagnosis recorded."}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <p className="font-bold text-slate-800 mb-0.5">Treatment Goals:</p>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {treatmentPlan.goals || "No goals recorded."}
                  </p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <p className="font-bold text-slate-800 mb-0.5">Prescribed Medications:</p>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {treatmentPlan.medications || "No medications specified."}
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-800 mb-0.5">Care Instructions & Advice:</p>
                <p className="text-slate-700 whitespace-pre-wrap">
                  {treatmentPlan.care_instructions || "No specific instructions specified."}
                </p>
              </div>
              {treatmentPlan.photos && treatmentPlan.photos.length > 0 ? (
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <p className="font-bold text-slate-800 mb-2">Attached Treatment Plan Photos / Prescriptions ({treatmentPlan.photos.length}):</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {treatmentPlan.photos.map((photo) => (
                      <div key={photo.id} className="border border-slate-200 rounded p-1.5 bg-white">
                        <img
                          src={photo.data_url}
                          alt={photo.name}
                          className="h-20 w-full object-cover rounded border border-slate-200 mb-1"
                        />
                        <p className="font-semibold text-[10px] text-slate-800 truncate">{photo.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-3">
              3. Scheduled Follow-ups & Care Log
            </h2>
            {followups.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No follow-ups recorded.</p>
            ) : (
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2 border-b">Scheduled Date</th>
                    <th className="p-2 border-b">Follow-up Goal</th>
                    <th className="p-2 border-b">Status</th>
                    <th className="p-2 border-b">Clinical Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {followups.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2 font-medium">{item.date}</td>
                      <td className="p-2 font-semibold">{item.title}</td>
                      <td className="p-2 capitalize font-bold text-slate-700">{item.status}</td>
                      <td className="p-2 text-slate-600">{item.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-3">
              4. Patient Symptoms & Medical History
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-bold text-slate-800 mb-1">Initial Enquiry / Symptoms Notes:</p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 whitespace-pre-wrap">
                  {patient.condition_notes || "None recorded."}
                </div>
              </div>
              <div>
                <p className="font-bold text-slate-800 mb-1">Medical History & Allergies:</p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 whitespace-pre-wrap">
                  {patient.medical_history || "None recorded."}
                </div>
              </div>
            </div>
          </div>

          {photos.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-3">
                5. Attached Medical Images & Documentation ({photos.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                    <img
                      src={photo.data_url}
                      alt={photo.name}
                      className="h-28 w-full object-cover rounded border border-slate-200 mb-1.5"
                    />
                    <p className="font-bold text-[11px] text-slate-800 truncate">{photo.name}</p>
                    <p className="text-[10px] text-slate-500">{photo.date}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-12 border-t border-slate-300 pt-6 flex items-end justify-between text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-700">RediHealth Staff Signature:</p>
              <div className="mt-6 border-b border-slate-400 w-48" />
              <p className="mt-1 text-[10px]">Authorized Healthcare Worker</p>
            </div>
            <div className="text-right text-[10px] text-slate-400">
              <p>Generated by RediHealth Platform</p>
              <p>Document strictly confidential</p>
            </div>
          </div>
        </div>
      </div>
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-5">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Phone Contact
                </p>
                <a
                  href={`tel:${patient.phone}`}
                  className="mt-1 inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline"
                >
                  <PhoneIcon className="h-4 w-4" />
                  <span>{patient.phone}</span>
                </a>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Email Contact
                </p>
                <a
                  href={`mailto:${patient.email}`}
                  className="mt-1 inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline"
                >
                  <MailIcon className="h-4 w-4" />
                  <span>{patient.email}</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl border border-border bg-card p-5">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Date of Birth
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {patient.date_of_birth || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Gender
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {patient.gender || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Address / Location
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {patient.address || "Not provided"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  Update Care Status
                </label>
                <select
                  value={status}
                  disabled={isUpdatingStatus}
                  onChange={(e) => handleStatusChange(e.target.value as PatientStatus)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="active">Active Care</option>
                  <option value="inactive">Inactive Care</option>
                  <option value="archived">Archived Record</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  Update Urgency Priority Level
                </label>
                <select
                  value={priority}
                  disabled={isUpdatingPriority}
                  onChange={(e) => handlePriorityChange(e.target.value as PatientPriority)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="critical">🔴 Critical Priority (Follow-up &lt; 24h)</option>
                  <option value="high">🟠 High Priority (Follow-up &lt; 3 days)</option>
                  <option value="moderate">🟡 Moderate Priority (Follow-up &lt; 7 days)</option>
                  <option value="low">🟢 Low Priority (Follow-up &lt; 14 days)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  Assigned Healthcare Worker
                </label>
                <select
                  value={assignedWorkerId}
                  disabled={isUpdatingWorker}
                  onChange={(e) => handleWorkerChange(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="">-- Unassigned --</option>
                  {workersList.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.full_name} ({w.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <EditIcon className="h-4 w-4 text-primary" />
                <span>Condition & Symptoms Summary</span>
              </h3>
              <div className="rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {patient.condition_notes || "No condition notes recorded."}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <CheckCircleIcon className="h-4 w-4 text-primary" />
                <span>Medical History Notes</span>
              </h3>
              <div className="rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {patient.medical_history || "No medical history recorded."}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <EditIcon className="h-4 w-4 text-primary" />
                  <span>Current Active Treatment Plan</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("treatment")}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {hasTreatmentPlan ? "Edit Treatment Plan" : "Set Up Treatment Plan"}
                </button>
              </div>

              {hasTreatmentPlan ? (
                <div className="rounded-2xl border border-primary/20 bg-primary-soft/30 p-5 space-y-4">
                  {treatmentPlan.diagnosis ? (
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                        Primary Diagnosis & Findings
                      </p>
                      <p className="mt-1 text-sm text-foreground whitespace-pre-wrap font-medium">
                        {treatmentPlan.diagnosis}
                      </p>
                    </div>
                  ) : null}

                  {treatmentPlan.goals ? (
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                        Care Goals & Objectives
                      </p>
                      <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                        {treatmentPlan.goals}
                      </p>
                    </div>
                  ) : null}

                  {treatmentPlan.medications ? (
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                        Prescribed Medications & Therapies
                      </p>
                      <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                        {treatmentPlan.medications}
                      </p>
                    </div>
                  ) : null}

                  {treatmentPlan.care_instructions ? (
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                        Care Instructions
                      </p>
                      <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                        {treatmentPlan.care_instructions}
                      </p>
                    </div>
                  ) : null}

                  {treatmentPlan.photos && treatmentPlan.photos.length > 0 ? (
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                        Treatment Plan Photos & Documents ({treatmentPlan.photos.length})
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {treatmentPlan.photos.map((photo) => (
                          <div
                            key={photo.id}
                            className="rounded-xl border border-border bg-card p-2 text-xs"
                          >
                            <img
                              src={photo.data_url}
                              alt={photo.name}
                              className="h-20 w-full object-cover rounded-lg border border-border mb-1"
                            />
                            <p className="font-semibold text-foreground truncate" title={photo.name}>
                              {photo.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card p-6 text-center text-xs text-muted-foreground">
                  <span>
                    No treatment plan set up yet. Click below to add diagnosis, medications, care instructions, and photos.
                  </span>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("treatment")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Set Up Treatment Plan</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {activeTab === "treatment" ? (
          <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
            {treatmentSavedMsg ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircleIcon className="h-4 w-4" />
                <span>Treatment plan saved successfully!</span>
              </div>
            ) : null}

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Primary Diagnosis & Clinical Findings
              </label>
              <textarea
                rows={3}
                value={treatmentPlan.diagnosis || ""}
                onChange={(e) =>
                  setTreatmentPlan({ ...treatmentPlan, diagnosis: e.target.value })
                }
                placeholder="Record primary clinical diagnosis, symptoms severity, or findings..."
                className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  Care Goals & Objectives
                </label>
                <textarea
                  rows={3}
                  value={treatmentPlan.goals || ""}
                  onChange={(e) =>
                    setTreatmentPlan({ ...treatmentPlan, goals: e.target.value })
                  }
                  placeholder="Short & long term health targets..."
                  className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  Prescribed Medications / Therapies
                </label>
                <textarea
                  rows={3}
                  value={treatmentPlan.medications || ""}
                  onChange={(e) =>
                    setTreatmentPlan({ ...treatmentPlan, medications: e.target.value })
                  }
                  placeholder="List medications, dosage, or recommended therapy..."
                  className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Care Instructions & Patient Directives
              </label>
              <textarea
                rows={3}
                value={treatmentPlan.care_instructions || ""}
                onChange={(e) =>
                  setTreatmentPlan({
                    ...treatmentPlan,
                    care_instructions: e.target.value,
                  })
                }
                placeholder="Specific lifestyle, diet, rest, or follow-up instructions..."
                className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="border-t border-border pt-5 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <span>Attach Photo to Treatment Plan</span>
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upload prescription scans, therapy diagrams, or treatment images directly to this plan.
                </p>
              </div>

              <form
                onSubmit={handleAddTpPhoto}
                className="rounded-xl border border-border bg-muted/30 p-4 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Select Image File
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleTpPhotoUpload}
                      className="w-full text-xs text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Photo Title / Description
                    </label>
                    <input
                      type="text"
                      value={tpPhotoName}
                      onChange={(e) => setTpPhotoName(e.target.value)}
                      placeholder="e.g. Prescription Scan, Treatment Diagram"
                      className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                {tpPhotoData ? (
                  <div className="flex items-center gap-3 bg-card p-2 rounded-lg border border-border">
                    <img
                      src={tpPhotoData}
                      alt="Preview"
                      className="h-12 w-12 object-cover rounded border border-border"
                    />
                    <span className="text-xs text-emerald-600 font-semibold">
                      Photo ready to attach
                    </span>
                  </div>
                ) : null}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!tpPhotoData}
                    className="rounded-lg bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-50"
                  >
                    Attach Photo to Treatment Plan
                  </button>
                </div>
              </form>

              {treatmentPlan.photos && treatmentPlan.photos.length > 0 ? (
                <div>
                  <p className="text-xs font-bold text-foreground mb-2">
                    Attached Treatment Plan Photos ({treatmentPlan.photos.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {treatmentPlan.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative flex flex-col justify-between rounded-xl border border-border bg-background p-2 shadow-sm"
                      >
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
                          <img
                            src={photo.data_url}
                            alt={photo.name}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteTpPhoto(photo.id)}
                            className="absolute right-1.5 top-1.5 rounded bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                            title="Remove photo"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p
                          className="mt-1.5 text-xs font-bold text-foreground truncate"
                          title={photo.name}
                        >
                          {photo.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={isSavingTreatment}
                onClick={handleSaveTreatmentPlan}
                className="rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-60 shadow-sm"
              >
                {isSavingTreatment ? "Saving Plan..." : "Save Treatment Plan"}
              </button>
            </div>
          </div>
        ) : null}

        {activeTab === "followups" ? (
          <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Care Follow-ups & Reminders
                </h3>
                <p className="text-xs text-muted-foreground">
                  Schedule check-ins, call reminders, or consultation appointments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddFollowup(!showAddFollowup)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-hover"
              >
                <PlusIcon className="h-4 w-4" />
                <span>New Follow-up</span>
              </button>
            </div>

            {showAddFollowup ? (
              <form
                onSubmit={handleAddFollowup}
                className="rounded-xl border border-border bg-muted/30 p-4 space-y-3"
              >
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                  Schedule New Follow-Up
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Title / Purpose <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newFollowupTitle}
                      onChange={(e) => setNewFollowupTitle(e.target.value)}
                      placeholder="e.g. Call to check symptom progress"
                      className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Scheduled Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={newFollowupDate}
                      onChange={(e) => setNewFollowupDate(e.target.value)}
                      className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Staff Notes
                  </label>
                  <input
                    type="text"
                    value={newFollowupNotes}
                    onChange={(e) => setNewFollowupNotes(e.target.value)}
                    placeholder="Special instructions or phone script for worker..."
                    className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newFollowupReminder}
                      onChange={(e) => setNewFollowupReminder(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Set staff notification reminder</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddFollowup(false)}
                      className="rounded-lg border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-4 py-1 text-xs font-semibold text-white hover:bg-primary-hover"
                    >
                      Add Follow-up
                    </button>
                  </div>
                </div>
              </form>
            ) : null}

            {followups.length === 0 ? (
              <div className="rounded-xl border border-border bg-background p-8 text-center text-xs text-muted-foreground">
                <CalendarIcon className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                <span>No follow-ups scheduled yet. Click &quot;New Follow-up&quot; to add one.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {followups.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-background p-3.5 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleFollowupStatus(
                            item.id,
                            item.status === "completed" ? "scheduled" : "completed",
                          )
                        }
                        className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                          item.status === "completed"
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-border hover:border-primary"
                        }`}
                        title="Toggle completion"
                      >
                        {item.status === "completed" ? (
                          <CheckCircleIcon className="h-3.5 w-3.5" />
                        ) : null}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-bold ${
                              item.status === "completed"
                                ? "line-through text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {item.title}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold capitalize ${
                              item.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : item.status === "cancelled"
                                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {item.status}
                          </span>
                          {item.reminder_set ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                              <BellIcon className="h-3 w-3" />
                              Reminder Set
                            </span>
                          ) : null}
                        </div>

                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Date: <span className="font-semibold text-foreground">{item.date}</span>
                          {item.notes ? ` &bull; ${item.notes}` : ""}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteFollowup(item.id)}
                      className="self-end sm:self-auto rounded p-1 text-red-600 hover:bg-red-500/10"
                      title="Delete follow-up"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {activeTab === "photos" ? (
          <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Medical Photos & Document Attachments
              </h3>
              <p className="text-xs text-muted-foreground">
                Attach clinical photos, lab results, or prescribed documentation.
              </p>
            </div>

            <form
              onSubmit={handleAddPhoto}
              className="rounded-xl border border-border bg-muted/30 p-4 space-y-3"
            >
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                Attach New Photo / Document
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Select Image File <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-xs text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Title / Label
                  </label>
                  <input
                    type="text"
                    value={newPhotoName}
                    onChange={(e) => setNewFollowPhotoName(e.target.value)}
                    placeholder="e.g. Skin Rash Photo, Blood Test Result"
                    className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Caption / Staff Notes
                </label>
                <input
                  type="text"
                  value={newPhotoNote}
                  onChange={(e) => setNewFollowPhotoNote(e.target.value)}
                  placeholder="Short description or clinical findings regarding this photo..."
                  className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {newPhotoData ? (
                <div className="flex items-center gap-3 bg-card p-2 rounded-lg border border-border">
                  <img
                    src={newPhotoData}
                    alt="Preview"
                    className="h-12 w-12 object-cover rounded border border-border"
                  />
                  <span className="text-xs text-emerald-600 font-semibold">
                    Image ready to attach
                  </span>
                </div>
              ) : null}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={!newPhotoData}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
                >
                  Attach Photo
                </button>
              </div>
            </form>

            {photos.length === 0 ? (
              <div className="rounded-xl border border-border bg-background p-8 text-center text-xs text-muted-foreground">
                <ImageIcon className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                <span>No medical photos attached. Use the form above to upload images.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative flex flex-col justify-between rounded-xl border border-border bg-background p-2.5 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
                      <img
                        src={photo.data_url}
                        alt={photo.name}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute right-1.5 top-1.5 rounded bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                        title="Remove photo"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-2 text-xs">
                      <p className="font-bold text-foreground truncate" title={photo.name}>
                        {photo.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{photo.date}</p>
                      {photo.notes ? (
                        <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                          {photo.notes}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {activeTab === "timeline" ? (
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Unified Medical History & Activity Log
              </h3>
              <p className="text-xs text-muted-foreground">
                Chronological record of patient enquiries, care plans, follow-ups, and attachments.
              </p>
            </div>

            <div className="relative pl-6 border-l-2 border-border space-y-6 pt-2">
              <div className="relative">
                <span className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs">
                  <UserIcon className="h-3.5 w-3.5" />
                </span>
                <div className="rounded-xl border border-border bg-background p-4 text-xs">
                  <p className="font-bold text-foreground text-sm">
                    Initial Request / Enquiry Received
                  </p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    {new Date(patient.created_at).toLocaleString()}
                  </p>
                  <div className="mt-2 p-2.5 rounded-lg bg-muted/40 text-foreground whitespace-pre-wrap">
                    {patient.condition_notes || "No initial enquiry text recorded."}
                  </div>
                </div>
              </div>

              {followups.map((item) => (
                <div key={item.id} className="relative">
                  <span className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs">
                    <CalendarIcon className="h-3.5 w-3.5" />
                  </span>
                  <div className="rounded-xl border border-border bg-background p-4 text-xs">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-foreground text-sm">{item.title}</p>
                      <span className="capitalize font-bold text-amber-600 dark:text-amber-400">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Scheduled Date: {item.date}
                    </p>
                    {item.notes ? (
                      <p className="mt-2 text-foreground">{item.notes}</p>
                    ) : null}
                  </div>
                </div>
              ))}

              {photos.map((photo) => (
                <div key={photo.id} className="relative">
                  <span className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-white text-xs">
                    <ImageIcon className="h-3.5 w-3.5" />
                  </span>
                  <div className="rounded-xl border border-border bg-background p-4 text-xs flex gap-3">
                    <img
                      src={photo.data_url}
                      alt={photo.name}
                      className="h-14 w-14 object-cover rounded border border-border flex-none"
                    />
                    <div>
                      <p className="font-bold text-foreground text-sm">{photo.name}</p>
                      <p className="text-muted-foreground text-[11px]">Attached on {photo.date}</p>
                      {photo.notes ? <p className="mt-1 text-foreground">{photo.notes}</p> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
