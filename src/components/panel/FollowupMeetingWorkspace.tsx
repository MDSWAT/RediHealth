"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AdminShell } from "./AdminShell";
import { Container } from "@/components/ui/Container";
import { CheckCircleIcon, MailIcon } from "@/components/ui/icons";

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

  useEffect(() => {
    async function loadMeeting() {
      const response = await fetch(`/api/meetings?id=${meetingId}`);
      const data = (await response.json()) as { meeting?: Meeting; error?: string };
      if (!response.ok || !data.meeting) {
        setError(data.error || "Could not load this meeting.");
        return;
      }
      setMeeting(data.meeting);
      setTranscript(data.meeting.transcript || "");
      setNotes(data.meeting.notes || "");
    }
    void loadMeeting();
  }, [meetingId]);

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
        return "Microphone access is blocked. Allow microphone permission in your browser settings and try again.";
      case "audio-capture":
        return "No microphone was found. Connect a microphone or check device permissions.";
      case "network":
        return "Speech recognition network error. Check your internet connection and retry.";
      case "no-speech":
        return "No speech was detected. Speak clearly and keep the microphone close.";
      case "language-not-supported":
        return "This browser does not support the selected recognition language.";
      case "aborted":
        return "Transcription was stopped.";
      default:
        return "Live transcription stopped. Check microphone access and try again.";
    }
  }

  async function toggleTranscription() {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (!window.isSecureContext && !isLocalhost) {
      setError("Live transcription needs HTTPS on mobile browsers. Open the site over HTTPS and try again.");
      return;
    }

    if (navigator.permissions?.query) {
      try {
        const micPermission = await navigator.permissions.query({ name: "microphone" as PermissionName });
        if (micPermission.state === "denied") {
          setError("Microphone permission is denied. Enable it in browser settings, then reload this page.");
          return;
        }
      } catch {
        // Continue if the browser does not fully support microphone permissions API.
      }
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Live transcription is not supported in this browser. Use Chrome or Edge on desktop/Android, or type notes manually.");
      return;
    }

    setError("");
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
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
      setError("Could not start transcription. Close other microphone apps/tabs and try again.");
    }
  }

  async function transcribeRecordedAudio(blob: Blob) {
    setIsTranscribingFallback(true);
    setError("");
    setStatus("");

    const payload = new FormData();
    payload.append("audio", blob, "meeting-audio.webm");
    payload.append("language", "en");

    try {
      const response = await fetch("/api/meetings/transcribe", {
        method: "POST",
        body: payload,
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string; text?: string };
      if (!response.ok || !data.text) {
        setError(data.error || "Server transcription failed. Please type notes manually.");
        return;
      }

      setTranscript((current) => `${current}${current ? " " : ""}${data.text}`.trim());
      setStatus("Recording transcribed and added to the transcript.");
    } catch {
      setError("Server transcription failed. Check your connection and try again.");
    } finally {
      setIsTranscribingFallback(false);
    }
  }

  async function toggleFallbackRecording() {
    if (isRecordingFallback) {
      recorderRef.current?.stop();
      setIsRecordingFallback(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Audio recording is not supported in this browser.");
      return;
    }

    const Recorder = window.MediaRecorder;
    if (!Recorder) {
      setError("Audio recording is not supported in this browser. Use Chrome or Edge.");
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
        setError("Recording failed. Check microphone permission and retry.");
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
      setStatus("Recording audio for server transcription...");
    } catch {
      setError("Could not access microphone. Allow permission and try again.");
    }
  }

  async function saveMeetingRecord() {
    if (!meeting) return;
    setIsSaving(true);
    setError("");
    const response = await fetch("/api/meetings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: String(meeting.id), transcript, notes }),
    });
    const data = (await response.json()) as { error?: string };
    setIsSaving(false);
    if (!response.ok) {
      setError(data.error || "Could not save the meeting record.");
      return;
    }
    setStatus("Meeting record saved to the patient follow-up.");
  }

  async function invitePatient() {
    if (!meeting) return;
    setIsInviting(true);
    setError("");
    setStatus("");
    const response = await fetch(`/api/meetings/${meeting.id}/invite`, { method: "POST" });
    const data = (await response.json()) as { error?: string };
    setIsInviting(false);
    if (!response.ok) {
      setError(data.error || "Could not send the meeting invitation.");
      return;
    }
    setStatus("Invitation sent to the patient.");
  }

  return (
    <AdminShell userEmail={userEmail} userRole={userRole} isAdmin={isAdmin}>
      <main id="main-content" className="min-h-screen py-5 sm:py-7">
        <Container className="max-w-6xl">
          <Link href={`/panel/patients/${patientId}`} className="inline-flex text-sm font-semibold text-primary hover:underline">Back to patient profile</Link>
          <div className="mt-3 border border-border border-l-4 border-l-primary bg-card px-5 py-5 shadow-sm sm:px-6">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Follow-up meeting</p>
            <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{meeting?.title || "Loading meeting..."}</h1>
          </div>

          {error ? <p className="mt-4 border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600" role="alert">{error}</p> : null}
          {status ? <p className="mt-4 border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700" role="status">{status}</p> : null}

          {meeting ? (
            <section className="mt-4 border border-border border-t-2 border-t-primary bg-card shadow-sm">
              <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span className={`h-2.5 w-2.5 rounded-full ${isListening ? "bg-red-600 animate-pulse" : "bg-muted-foreground/40"}`} />
                  {isListening ? "Listening" : "Live transcription"}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => void toggleTranscription()} className={`min-h-11 rounded-lg px-4 text-sm font-semibold transition-colors ${isListening ? "bg-foreground text-white hover:bg-foreground/90" : "bg-primary text-white hover:bg-primary-hover"}`}>
                    {isListening ? "Stop transcription" : "Start transcription"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggleFallbackRecording()}
                    disabled={isTranscribingFallback}
                    className={`min-h-11 rounded-lg px-4 text-sm font-semibold transition-colors ${isRecordingFallback ? "bg-amber-600 text-white hover:bg-amber-700" : "bg-card border border-border text-foreground hover:bg-muted"} disabled:opacity-60`}
                  >
                    {isTranscribingFallback
                      ? "Transcribing..."
                      : isRecordingFallback
                      ? "Stop recording"
                      : "Record and transcribe"}
                  </button>
                  <button type="button" onClick={() => void invitePatient()} disabled={isInviting} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60">
                    <MailIcon className="h-4 w-4" /> {isInviting ? "Sending..." : "Email patient"}
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <iframe src={`${roomUrl}#config.prejoinPageEnabled=false`} title={meeting.title} allow="camera; microphone; fullscreen; display-capture; autoplay" className="h-[min(62vw,36rem)] min-h-80 w-full border border-border bg-muted" />
                <label className="mt-5 block text-sm font-semibold text-foreground">Transcript with patient
                  <textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder="Start transcription to capture the consultation transcript." className="mt-2 min-h-48 w-full border border-border bg-muted/30 p-4 text-sm font-normal leading-relaxed text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </label>
                {interimTranscript ? <p className="border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">{interimTranscript}</p> : null}
                <label className="mt-4 block text-sm font-semibold text-foreground">Doctor-only notes
                  <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} maxLength={4000} placeholder="Add private clinical decisions, actions, or sensitive context." className="mt-2 block w-full border border-border bg-background p-3 text-sm font-normal leading-relaxed text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                </label>
                <div className="mt-4 flex justify-end border-t border-border pt-4">
                  <button type="button" onClick={() => void saveMeetingRecord()} disabled={isSaving} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60">
                    <CheckCircleIcon className="h-4 w-4" /> {isSaving ? "Saving..." : "Save to patient follow-up"}
                  </button>
                </div>
              </div>
            </section>
          ) : null}
        </Container>
      </main>
    </AdminShell>
  );
}