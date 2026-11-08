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
import type { CountryCode } from "@/lib/countries";
import { useRecaptcha } from "@/components/security/RecaptchaProvider";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";

function useSafeLang(): Lang {
  try {
    return useLanguage().lang;
  } catch {
    return "ro";
  }
}

const portalMessages: Record<Lang, { symptoms: string; followup: string; photo: string; complete: string; tooBig: string; photoName: string }> = {
  ro: {
    symptoms: "Simptomele nu s-au salvat. Încearcă din nou.",
    followup: "Controlul nu s-a salvat. Încearcă din nou.",
    photo: "Poza nu s-a încărcat. Încearcă din nou.",
    complete: "Nu am putut marca vizita ca făcută. Încearcă din nou.",
    tooBig: "Fișierul e prea mare. Alege unul sub 5 MB.",
    photoName: "Poză de la pacient",
  },
  en: {
    symptoms: "Your symptoms were not saved. Try again.",
    followup: "The check-up was not saved. Try again.",
    photo: "The photo did not upload. Try again.",
    complete: "We could not mark the visit as done. Try again.",
    tooBig: "The file is too big. Choose one under 5 MB.",
    photoName: "Photo from patient",
  },
  sq: {
    symptoms: "Shqetësimet nuk u ruajtën. Provo përsëri.",
    followup: "Kontrolli nuk u ruajt. Provo përsëri.",
    photo: "Fotoja nuk u ngarkua. Provo përsëri.",
    complete: "Nuk e shënuam vizitën si të bërë. Provo përsëri.",
    tooBig: "Skedari është shumë i madh. Zgjidh një nën 5 MB.",
    photoName: "Foto nga pacienti",
  },
  it: {
    symptoms: "I sintomi non sono stati salvati. Riprova.",
    followup: "Il controllo non è stato salvato. Riprova.",
    photo: "La foto non è stata caricata. Riprova.",
    complete: "Non siamo riusciti a segnare la visita come fatta. Riprova.",
    tooBig: "Il file è troppo grande. Scegline uno sotto i 5 MB.",
    photoName: "Foto del paziente",
  },
};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const SAVED_MESSAGE_TIMEOUT_MS = 3_000;

interface UsePatientPortalArgs {
  initialPatient: PatientItem;
  token: string;
  country: CountryCode;
}

async function patchPortal(token: string, country: CountryCode, payload: unknown): Promise<void> {
  const response = await fetch(`/api/patient-portal/${encodeURIComponent(token)}?c=${country.toLowerCase()}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "");
  }
}

/**
 * Owns all state, side effects, and API calls for the patient portal so the view
 * component stays presentational. Handlers optimistically update local state only
 * after the server confirms the change.
 */
export function usePatientPortal({ initialPatient, token, country }: UsePatientPortalArgs) {
  const executeCaptcha = useRecaptcha();
  const messages = portalMessages[useSafeLang()] ?? portalMessages.ro;
  const errorText = (error: unknown, fallback: string) =>
    error instanceof Error && error.message ? error.message : fallback;
  const patch = async (payload: object) => {
    const captchaToken = await executeCaptcha("patient_portal");
    return patchPortal(token, country, { ...payload, captchaToken });
  };
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

  const [completingFollowupId, setCompletingFollowupId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [completionPhotoName, setCompletionPhotoName] = useState("");
  const [completionPhotoNote, setCompletionPhotoNote] = useState("");
  const [completionPhotoData, setCompletionPhotoData] = useState<string | null>(null);
  const [completionPhotos, setCompletionPhotos] = useState<PatientPhoto[]>([]);
  const [isSavingCompletion, setIsSavingCompletion] = useState(false);

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
      await patch({ condition_notes, priority: selectedPriority });
      setPatient((prev) => ({ ...prev, condition_notes, priority: selectedPriority }));
      setSymptomsSavedMsg(true);
      setTimeout(() => setSymptomsSavedMsg(false), SAVED_MESSAGE_TIMEOUT_MS);
    } catch (error) {
      setErrorMessage(errorText(error, messages.symptoms));
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
      await patch({ new_followup: newFollowup });
      setPatient((prev) => ({
        ...prev,
        followups: [newFollowup, ...(prev.followups || [])],
      }));
      setShowAddFollowup(false);
      setNewFollowupTitle("");
      setNewFollowupNotes("");
    } catch (error) {
      setErrorMessage(errorText(error, messages.followup));
    } finally {
      setIsSavingFollowup(false);
    }
  }

  function handlePhotoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_PHOTO_BYTES) {
      setErrorMessage(messages.tooBig);
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
      name: newPhotoName.trim() || messages.photoName,
      data_url: newPhotoData,
      date: new Date().toISOString().slice(0, 10),
      notes: newPhotoNote.trim() || undefined,
    };

    try {
      await patch({ new_photo: photo });
      setPatient((prev) => ({ ...prev, photos: [photo, ...(prev.photos || [])] }));
      setNewPhotoData(null);
      setNewPhotoName("");
      setNewPhotoNote("");
    } catch (error) {
      setErrorMessage(errorText(error, messages.photo));
    } finally {
      setIsSavingPhoto(false);
    }
  }

  function handleCompletionPhotoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_PHOTO_BYTES) {
      setErrorMessage(messages.tooBig);
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      setCompletionPhotoData(dataUrl);
      if (!completionPhotoName) {
        setCompletionPhotoName(file.name);
      }
    };
    reader.readAsDataURL(file);
  }

  function addCompletionPhotoDraft() {
    if (!completionPhotoData) return;

    const draft: PatientPhoto = {
      id: String(Date.now()),
      name: completionPhotoName.trim() || "Follow-up Attachment",
      data_url: completionPhotoData,
      date: new Date().toISOString().slice(0, 10),
      notes: completionPhotoNote.trim() || undefined,
    };

    setCompletionPhotos((prev) => [...prev, draft]);
    setCompletionPhotoData(null);
    setCompletionPhotoName("");
    setCompletionPhotoNote("");
  }

  function removeCompletionPhotoDraft(photoId: string) {
    setCompletionPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  }

  function openCompletionForm(followupId: string) {
    setCompletingFollowupId(followupId);
    setCompletionNotes("");
    setCompletionPhotos([]);
    setCompletionPhotoData(null);
    setCompletionPhotoName("");
    setCompletionPhotoNote("");
    setErrorMessage(null);
  }

  function closeCompletionForm() {
    setCompletingFollowupId(null);
    setCompletionNotes("");
    setCompletionPhotos([]);
    setCompletionPhotoData(null);
    setCompletionPhotoName("");
    setCompletionPhotoNote("");
  }

  async function handleCompleteFollowup(event: FormEvent) {
    event.preventDefault();
    if (!completingFollowupId) return;

    setIsSavingCompletion(true);
    setErrorMessage(null);

    const payload = {
      complete_followup: {
        followup_id: completingFollowupId,
        completion_notes: completionNotes.trim() || undefined,
        completion_photos: completionPhotos,
        completed_at: new Date().toISOString().slice(0, 10),
      },
    };

    try {
      await patch(payload);
      setPatient((prev) => ({
        ...prev,
        followups: (prev.followups || []).map((item) =>
          item.id === completingFollowupId
            ? {
                ...item,
                status: "completed",
                completion_notes: completionNotes.trim() || undefined,
                completed_at: new Date().toISOString().slice(0, 10),
                completion_photos: completionPhotos,
              }
            : item,
        ),
      }));
      closeCompletionForm();
    } catch (error) {
      setErrorMessage(errorText(error, messages.complete));
    } finally {
      setIsSavingCompletion(false);
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
