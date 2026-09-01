"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type {
  FollowupItem,
  PatientItem,
  PatientPhoto,
  PatientPriority,
} from "@/lib/types/patient";
import { getPriorityMeta } from "@/lib/patient-helpers";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const SAVED_MESSAGE_TIMEOUT_MS = 3_000;

interface UsePatientPortalArgs {
  initialPatient: PatientItem;
  token: string;
}

async function patchPortal(token: string, payload: unknown): Promise<void> {
  const response = await fetch(`/api/patient-portal/${encodeURIComponent(token)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "The request could not be completed.");
  }
}

/**
 * Owns all state, side effects, and API calls for the patient portal so the view
 * component stays presentational. Handlers optimistically update local state only
 * after the server confirms the change.
 */
export function usePatientPortal({ initialPatient, token }: UsePatientPortalArgs) {
  const [patient, setPatient] = useState<PatientItem>(initialPatient);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [symptomsText, setSymptomsText] = useState(patient.condition_notes || "");
  const [selectedPriority, setSelectedPriority] = useState<PatientPriority>(
    patient.priority || "moderate",
  );
  const [isSavingSymptoms, setIsSavingSymptoms] = useState(false);
  const [symptomsSavedMsg, setSymptomsSavedMsg] = useState(false);

  const [showAddFollowup, setShowAddFollowup] = useState(false);
  const [newFollowupTitle, setNewFollowupTitle] = useState("");
  const [newFollowupDate, setNewFollowupDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [newFollowupNotes, setNewFollowupNotes] = useState("");
  const [isSavingFollowup, setIsSavingFollowup] = useState(false);

  const [newPhotoName, setNewPhotoName] = useState("");
  const [newPhotoNote, setNewPhotoNote] = useState("");
  const [newPhotoData, setNewPhotoData] = useState<string | null>(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  const priorityMeta = useMemo(
    () => getPriorityMeta(patient.priority),
    [patient.priority],
  );

  async function handleUpdateSymptoms(event: FormEvent) {
    event.preventDefault();
    setIsSavingSymptoms(true);
    setErrorMessage(null);
    setSymptomsSavedMsg(false);

    const condition_notes = symptomsText.trim();
    try {
      await patchPortal(token, { condition_notes, priority: selectedPriority });
      setPatient((prev) => ({ ...prev, condition_notes, priority: selectedPriority }));
      setSymptomsSavedMsg(true);
      setTimeout(() => setSymptomsSavedMsg(false), SAVED_MESSAGE_TIMEOUT_MS);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update symptoms.",
      );
    } finally {
      setIsSavingSymptoms(false);
    }
  }

  async function handleAddFollowup(event: FormEvent) {
    event.preventDefault();
    if (!newFollowupTitle.trim() || !newFollowupDate.trim()) return;

    setIsSavingFollowup(true);
    setErrorMessage(null);

    const newFollowup: FollowupItem = {
      id: String(Date.now()),
      title: newFollowupTitle.trim(),
      date: newFollowupDate,
      notes: newFollowupNotes.trim() || undefined,
      status: "scheduled",
      reminder_set: true,
    };

    try {
      await patchPortal(token, { new_followup: newFollowup });
      setPatient((prev) => ({
        ...prev,
        followups: [newFollowup, ...(prev.followups || [])],
      }));
      setShowAddFollowup(false);
      setNewFollowupTitle("");
      setNewFollowupNotes("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to schedule follow-up.",
      );
    } finally {
      setIsSavingFollowup(false);
    }
  }

  function handlePhotoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_PHOTO_BYTES) {
      setErrorMessage("File size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      setNewPhotoData(dataUrl);
      if (!newPhotoName) {
        setNewPhotoName(file.name);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleUploadPhoto(event: FormEvent) {
    event.preventDefault();
    if (!newPhotoData) return;

    setIsSavingPhoto(true);
    setErrorMessage(null);

    const photo: PatientPhoto = {
      id: String(Date.now()),
      name: newPhotoName.trim() || "Patient Attachment",
      data_url: newPhotoData,
      date: new Date().toISOString().slice(0, 10),
      notes: newPhotoNote.trim() || undefined,
    };

    try {
      await patchPortal(token, { new_photo: photo });
      setPatient((prev) => ({ ...prev, photos: [photo, ...(prev.photos || [])] }));
      setNewPhotoData(null);
      setNewPhotoName("");
      setNewPhotoNote("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to upload photo.",
      );
    } finally {
      setIsSavingPhoto(false);
    }
  }

  return {
    patient,
    priorityMeta,
    errorMessage,
    symptoms: {
      text: symptomsText,
      setText: setSymptomsText,
      priority: selectedPriority,
      setPriority: setSelectedPriority,
      isSaving: isSavingSymptoms,
      savedMessage: symptomsSavedMsg,
      submit: handleUpdateSymptoms,
    },
    followup: {
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
    },
    photo: {
      name: newPhotoName,
      setName: setNewPhotoName,
      note: newPhotoNote,
      setNote: setNewPhotoNote,
      data: newPhotoData,
      isSaving: isSavingPhoto,
      onFileChange: handlePhotoFileChange,
      submit: handleUploadPhoto,
    },
  };
}
