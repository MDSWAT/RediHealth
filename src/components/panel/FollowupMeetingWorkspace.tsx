"use client";

import { PanelLink as Link, usePanelRuntime } from "./PanelRuntime";
import { useEffect, useId, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { REQUEST_LANG_HEADER, withLangPrefix } from "@/lib/i18n/routing";
import { AdminShell } from "./AdminShell";
import { Container } from "@/components/ui/Container";
import { CameraIcon, CheckCircleIcon, FileTextIcon, MailIcon } from "@/components/ui/icons";
import { demoPanelTranslations } from "@/lib/i18n/demo-panel-translations";
import { meetingWorkspaceTranslations } from "@/lib/i18n/meeting-workspace-translations";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { ConsultationVitalsStreamOverlay } from "./ConsultationVitalsStreamOverlay";
import { DoctorRecommendationPublisher } from "@/components/telemed/DoctorRecommendationPublisher";

type Meeting = {
  id: number;
  title: string;
  meeting_url: string;
  transcript: string | null;
  notes: string | null;
  patient_id: number | null;
};

type SpeechRecognitionEvent = Event & {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: { [index: number]: { transcript: string }; isFinal: boolean };
  };
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
};

type SpeechRecognitionErrorEvent = Event & {
  error:
    | "aborted"
    | "audio-capture"
    | "network"
    | "not-allowed"
    | "service-not-allowed"
    | "no-speech"
    | "language-not-supported";
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type BrowserMediaRecorder = {
  start(): void;
  stop(): void;
  state: "inactive" | "recording" | "paused";
  ondataavailable: ((event: BlobEvent) => void) | null;
  onstop: (() => void) | null;
  onerror: (() => void) | null;
};

type BrowserMediaRecorderConstructor = new (stream: MediaStream) => BrowserMediaRecorder;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    MediaRecorder?: BrowserMediaRecorderConstructor;
  }
}

type FollowupMeetingWorkspaceProps = {
  meetingId: string;
  patientId: string;
  userEmail: string;
  userRole: string;
  isAdmin: boolean;
};

function toStableMeetingUrl(rawUrl: string, meetingId: string) {
  const fallback = `https://meet.jit.si/redihealth-${meetingId}`;
  const value = rawUrl.trim();
  if (!value) return fallback;

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    // Avoid short-lived provider links (vpaas-style) by using a stable Jitsi room.
    if (host.includes("8x8.vc") || value.includes("vpaas-magic-cookie")) {
      return fallback;
    }
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return fallback;
  }
}

export function FollowupMeetingWorkspace({ meetingId, patientId, userEmail, userRole, isAdmin }: FollowupMeetingWorkspaceProps) {
  const { lang } = useLanguage();
  const t = meetingWorkspaceTranslations[lang];
  const { request: fetch, demo } = usePanelRuntime();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"notes" | "transcript" | "recommendations">("notes");
  const sidebarId = useId();
  const [savedRecord, setSavedRecord] = useState({ notes: "", transcript: "" });
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [isRecordingFallback, setIsRecordingFallback] = useState(false);
  const [isTranscribingFallback, setIsTranscribingFallback] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const recorderRef = useRef<BrowserMediaRecorder | null>(null);
  const recorderStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const roomUrl = meeting ? toStableMeetingUrl(meeting.meeting_url, meetingId) : "";
  const dirty = notes !== savedRecord.notes || transcript !== savedRecord.transcript;

  useEffect(() => {
    async function loadMeeting() {
      try {
        const response = await fetch(`/api/meetings?id=${meetingId}`);
        const data = (await response.json()) as { meeting?: Meeting; error?: string };
        if (!response.ok || !data.meeting) throw new Error(data.error || t.loadError);
        setMeeting(data.meeting);
        setTranscript(data.meeting.transcript || "");
        setNotes(data.meeting.notes || "");
        setSavedRecord({ notes: data.meeting.notes || "", transcript: data.meeting.transcript || "" });
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : t.loadError);
      }
    }
    void loadMeeting();
  }, [meetingId, fetch, t.loadError]);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    recorderStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  function mapTranscriptionError(errorCode: SpeechRecognitionErrorEvent["error"]) {
    switch (errorCode) {
      case "not-allowed":
      case "service-not-allowed":
        return t.speech.micBlocked;
      case "audio-capture":
        return t.speech.noMic;
      case "network":
        return t.speech.network;
      case "no-speech":
        return t.speech.noSpeech;
      case "language-not-supported":
        return t.speech.languageUnsupported;
      case "aborted":
        return t.speech.stopped;
      default:
        return t.speech.stoppedGeneric;
    }
  }

  async function toggleTranscription() {
    if (demo) { setTranscript((current) => `${current}${current ? "\n" : ""}${demoPanelTranslations[lang].transcript}`); return; }
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (!window.isSecureContext && !isLocalhost) {
      setError(t.speech.needsHttps);
      return;
    }

    if (navigator.permissions?.query) {
      try {
        const micPermission = await navigator.permissions.query({ name: "microphone" as PermissionName });
        if (micPermission.state === "denied") {
          setError(t.speech.micDenied);
          return;
        }
      } catch {
        // Continue if the browser does not fully support microphone permissions API.
      }
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError(t.speech.unsupported);
      return;
    }

    setError("");
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = langToLocale[lang];
    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let index = event.resultIndex; index < event.results.length; index++) {
        const result = event.results[index];
        if (result.isFinal) finalText += result[0].transcript;
        else interimText += result[0].transcript;
      }
      if (finalText) setTranscript((current) => `${current}${current ? " " : ""}${finalText.trim()}`);
      setInterimTranscript(interimText);
    };
    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      setError(mapTranscriptionError(event.error));
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
      setError(t.speech.startFailed);
    }
  }

  async function transcribeRecordedAudio(blob: Blob) {
    setIsTranscribingFallback(true);
    setError("");
    setStatus("");

    const payload = new FormData();
    payload.append("audio", blob, "meeting-audio.webm");
    payload.append("language", lang);

    try {
      const response = await fetch("/api/meetings/transcribe", {
        method: "POST",
        body: payload,
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string; text?: string };
      if (!response.ok || !data.text) {
        setError(data.error || t.speech.serverFailed);
        return;
      }

      setTranscript((current) => `${current}${current ? " " : ""}${data.text}`.trim());
      setStatus(t.speech.transcribed);
    } catch {
      setError(t.speech.serverFailedConnection);
    } finally {
      setIsTranscribingFallback(false);
    }
  }

  async function toggleFallbackRecording() {
    if (demo) { setTranscript((current) => `${current}${current ? "\n" : ""}${demoPanelTranslations[lang].transcript}`); return; }
    if (isRecordingFallback) {
      recorderRef.current?.stop();
      setIsRecordingFallback(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(t.speech.recordingUnsupported);
      return;
    }

    const Recorder = window.MediaRecorder;
    if (!Recorder) {
      setError(t.speech.recordingUnsupported);
      return;
    }

    setError("");
    setStatus("");
    recordedChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorderStreamRef.current = stream;

      const recorder = new Recorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      recorder.onerror = () => {
        setIsRecordingFallback(false);
        setError(t.speech.recordingFailed);
      };
      recorder.onstop = () => {
        setIsRecordingFallback(false);
        recorderStreamRef.current?.getTracks().forEach((track) => track.stop());
        recorderStreamRef.current = null;

        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        recordedChunksRef.current = [];
        if (blob.size > 0) {
          void transcribeRecordedAudio(blob);
        }
      };

      recorderRef.current = recorder;
      recorder.start();
      setIsRecordingFallback(true);
      setStatus(t.speech.recordingForServer);
    } catch {
      setError(t.speech.micAccess);
    }
  }

  async function saveMeetingRecord() {
    if (!meeting) return;
    setIsSaving(true);
    setError("");
    setStatus("");
    const record = { transcript, notes };
    try {
      const response = await fetch("/api/meetings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: String(meeting.id), ...record }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || t.saveError);
      setSavedRecord(record);
      setStatus(t.saved);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.saveError);
    } finally { setIsSaving(false); }
  }

  async function invitePatient() {
    if (!meeting) return;
    setIsInviting(true);
    setError("");
    setStatus("");
    try {
      const response = await fetch(`/api/meetings/${meeting.id}/invite`, { method: "POST", headers: { [REQUEST_LANG_HEADER]: lang } });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || t.inviteError);
      setStatus(t.invited);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.inviteError);
    } finally { setIsInviting(false); }
  }

  return (
    <AdminShell userEmail={userEmail} userRole={userRole} isAdmin={isAdmin}>
      <main id="main-content" className="py-4 sm:py-6">
        <Container className="max-w-[1600px]">
          <Link
            href={withLangPrefix(`/panel/patients/${patientId}`, lang)}
            className="inline-flex text-xs font-semibold text-primary hover:underline mb-3"
          >
            &larr; {t.back}
          </Link>
          <header className="flex flex-wrap items-center justify-between gap-4 py-2">
            <div className="min-w-0">
              <h1 className="break-words text-xl font-bold tracking-tight sm:text-2xl">{meeting?.title || t.loading}</h1>
            </div>
            {meeting && <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void invitePatient()} disabled={isInviting} className="crm-button inline-flex items-center gap-2">
                <MailIcon className="h-4 w-4" />{isInviting ? t.sending : t.invite}
              </button>
              <button type="button" aria-expanded={sidebarOpen} aria-controls={sidebarId} onClick={() => setSidebarOpen((open) => !open)} className="crm-button inline-flex items-center gap-2">
                <FileTextIcon className="h-4 w-4" />{sidebarOpen ? t.hide : t.show}
                {dirty && <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />}
              </button>
            </div>}
          </header>

          {error ? (
            <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-medium text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          {status ? (
            <p className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-700" role="status">
              {status}
            </p>
          ) : null}

          {meeting ? (
            <section className={`mt-4 grid min-w-0 gap-4 ${sidebarOpen ? "lg:grid-cols-[minmax(0,1fr)_22rem]" : "grid-cols-1"}`}>
              <div className="flex flex-col gap-3 min-w-0">
                <ConsultationVitalsStreamOverlay
                  meetingId={meeting.id}
                  patientId={meeting.patient_id}
                  onInsertToNotes={(vitalsSummary) => {
                    setNotes((curr) => curr ? curr + "\n\n" + vitalsSummary : vitalsSummary);
                  }}
                />
                <section aria-label={t.video} className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold"><CameraIcon className="h-4 w-4 text-slate-400" />{t.heading}</span>
                  <span role="status" className="inline-flex items-center gap-2 text-xs text-slate-300">
                    <span className={`h-2 w-2 rounded-full ${isListening || isRecordingFallback ? "bg-red-400" : "bg-slate-500"}`} />
                    {isListening ? t.listening : isRecordingFallback ? t.recording : isTranscribingFallback ? t.transcribing : t.idle}
                  </span>
                </div>
                {demo ? <div className="flex h-[55dvh] min-h-80 flex-col items-center justify-center gap-5 p-6 text-center lg:h-[68dvh]">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5"><CameraIcon className="h-9 w-9 text-slate-300" /></div>
                  <p className="max-w-sm text-sm leading-relaxed text-slate-300">{demoPanelTranslations[lang].video}</p>
                </div> : <iframe
                  src={`${roomUrl}#config.prejoinPageEnabled=false`}
                  title={meeting.title}
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                  allowFullScreen
                  className="block h-[55dvh] min-h-80 w-full border-0 lg:h-[68dvh]"
                />}
                <p className="border-t border-white/10 px-4 py-3 text-xs leading-relaxed text-slate-400">{t.callHelp}</p>
              </section>
              </div>

              <aside id={sidebarId} aria-label={t.workspace} hidden={!sidebarOpen} className="min-w-0 rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border p-4">
                  <h2 className="text-sm font-bold">{t.workspace}</h2>
                  <p className={`mt-1 text-xs ${dirty ? "text-amber-700" : "text-muted-foreground"}`}>{dirty ? t.unsaved : t.saved}</p>
                </div>
                <div role="tablist" aria-label={t.workspace} className="m-4 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
                  {(["notes", "transcript", "recommendations"] as const).map((tab) => <button key={tab} type="button" role="tab" id={`${sidebarId}-${tab}-tab`} aria-selected={activeTab === tab} aria-controls={`${sidebarId}-${tab}`} tabIndex={activeTab === tab ? 0 : -1}
                    onClick={() => setActiveTab(tab)} onKeyDown={(event) => {
                      if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
                        event.preventDefault();
                        const next = event.key === "Home" ? "notes" : event.key === "End" ? "recommendations" : tab === "notes" ? "transcript" : tab === "transcript" ? "recommendations" : "notes";
                        setActiveTab(next); document.getElementById(`${sidebarId}-${next}-tab`)?.focus();
                      }
                    }} className={`min-h-10 min-w-0 rounded-lg px-1.5 py-1 text-xs font-semibold leading-tight hyphens-auto break-words ${activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{t[tab]}</button>)}
                </div>
                <div role="tabpanel" id={`${sidebarId}-notes`} aria-labelledby={`${sidebarId}-notes-tab`} hidden={activeTab !== "notes"} className="space-y-3 px-4 pb-4">
                  <p id={`${sidebarId}-notes-help`} className="text-xs leading-relaxed text-muted-foreground">{t.notesHelp}</p>
                  <label htmlFor={`${sidebarId}-notes-input`} className="sr-only">{t.notes}</label>
                  <textarea id={`${sidebarId}-notes-input`} aria-describedby={`${sidebarId}-notes-help`} value={notes} onChange={(event) => { setNotes(event.target.value); setStatus(""); }} rows={12} maxLength={4000} placeholder={t.notesPlaceholder} className="crm-input min-h-64 resize-y text-sm" />
                  <p className="text-right text-xs text-muted-foreground">{notes.length} / 4000</p>
                </div>
                <div role="tabpanel" id={`${sidebarId}-transcript`} aria-labelledby={`${sidebarId}-transcript-tab`} hidden={activeTab !== "transcript"} className="space-y-3 px-4 pb-4">
                  <p id={`${sidebarId}-transcript-help`} className="text-xs leading-relaxed text-muted-foreground">{t.transcriptHelp}</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => void toggleTranscription()} disabled={isRecordingFallback || isTranscribingFallback} className="crm-button text-xs">{isListening ? t.stop : t.start}</button>
                    <button type="button" onClick={() => void toggleFallbackRecording()} disabled={isListening || isTranscribingFallback} className="crm-button text-xs">{isTranscribingFallback ? t.transcribing : isRecordingFallback ? t.stopRecording : t.record}</button>
                  </div>
                  <label htmlFor={`${sidebarId}-transcript-input`} className="sr-only">{t.transcript}</label>
                  <textarea id={`${sidebarId}-transcript-input`} aria-describedby={`${sidebarId}-transcript-help`} value={transcript} onChange={(event) => { setTranscript(event.target.value); setStatus(""); }} rows={10} placeholder={t.transcriptPlaceholder} className="crm-input min-h-56 resize-y text-sm" />
                  {interimTranscript && <p className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">{interimTranscript}</p>}
                </div>
                <div role="tabpanel" id={`${sidebarId}-recommendations`} aria-labelledby={`${sidebarId}-recommendations-tab`} hidden={activeTab !== "recommendations"} className="space-y-3 px-4 pb-4">
                  <DoctorRecommendationPublisher
                    meetingId={meeting.id}
                    patientName={meeting.title}
                    onPublished={(rec) => {
                      setStatus(t.recommendationsPublished);
                      const summaryText = `[${t.recommendationNote}: ${rec.primaryDiagnosis} | ${t.recommendationSteps}: ${rec.actionSteps.map((s) => s.text).join("; ")}]`;
                      setNotes((curr) => curr ? curr + "\n\n" + summaryText : summaryText);
                    }}
                  />
                </div>
                <div className="border-t border-border p-4">
                  <button type="button" onClick={() => void saveMeetingRecord()} disabled={isSaving} className="crm-button crm-primary inline-flex w-full items-center justify-center gap-2">
                    <CheckCircleIcon className="h-4 w-4" />{isSaving ? t.saving : t.save}
                  </button>
                </div>
              </aside>
            </section>
          ) : null}
        </Container>
      </main>
    </AdminShell>
  );
}