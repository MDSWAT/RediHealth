"use client";

import { PanelLink as Link, usePanelRuntime } from "./PanelRuntime";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import { REQUEST_LANG_HEADER, withLangPrefix } from "@/lib/i18n/routing";
import { AdminShell } from "./AdminShell";
import { Container } from "@/components/ui/Container";
import {
  CameraIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  FileTextIcon,
  MailIcon,
} from "@/components/ui/icons";
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

type WorkspacePreset = "standard" | "wide_notes" | "focus_video";

type CockpitCopy = {
  presetsAria: string;
  presetStandard: string;
  presetWideNotes: string;
  presetFocusVideo: string;
  sessionTimerAria: string;
  micLevelAria: string;
  stampNotesBtn: string;
  stampTranscriptBtn: string;
  sendToNotesBtn: string;
  sentToNotesStatus: string;
  draftRecoveredNotice: string;
  discardDraftBtn: string;
  saveShortcutHint: string;
};

const COCKPIT_COPY: Record<Lang, CockpitCopy> = {




"ru": {"presetsAria":"Режим рабочего пространства","presetStandard":"Обычный","presetWideNotes":"Широкие заметки","presetFocusVideo":"Основное видео","sessionTimerAria":"Время консультации","micLevelAria":"Уровень микрофона","stampNotesBtn":"Добавить время","stampTranscriptBtn":"Отметить время","sendToNotesBtn":"Вставить в заметки со временем","sentToNotesStatus":"Фрагмент расшифровки со временем добавлен в медицинские заметки.","draftRecoveredNotice":"Восстановлен несохраненный медицинский черновик из этого сеанса браузера.","discardDraftBtn":"Удалить черновик","saveShortcutHint":"Ctrl+S / ⌘S"},

  en: {
    presetsAria: "Workspace layout preset",
    presetStandard: "Standard",
    presetWideNotes: "Wide notes",
    presetFocusVideo: "Focus video",
    sessionTimerAria: "Consultation elapsed time",
    micLevelAria: "Microphone voice level",
    stampNotesBtn: "Add timestamp",
    stampTranscriptBtn: "Stamp time",
    sendToNotesBtn: "Insert timestamped into notes",
    sentToNotesStatus: "Timestamped transcript excerpt added to clinical notes.",
    draftRecoveredNotice: "Unsaved clinical draft recovered from this browser session.",
    discardDraftBtn: "Discard local draft",
    saveShortcutHint: "Ctrl+S / ⌘S",
  },
  ro: {
    presetsAria: "Mod de afișare pentru consultație",
    presetStandard: "Standard",
    presetWideNotes: "Notițe extinse",
    presetFocusVideo: "Focus video",
    sessionTimerAria: "Durata sesiunii curente",
    micLevelAria: "Nivelul vocii în microfon",
    stampNotesBtn: "Adaugă marcaj de timp",
    stampTranscriptBtn: "Marcaj timp",
    sendToNotesBtn: "Trimite cu marcaj în notițe",
    sentToNotesStatus: "Transcrierea marcată temporal a fost adăugată în notițele clinice.",
    draftRecoveredNotice: "Ciorna nesalvată a fost recuperată din această sesiune.",
    discardDraftBtn: "Renunță la ciorna locală",
    saveShortcutHint: "Ctrl+S / ⌘S",
  },
  sq: {
    presetsAria: "Pamja e hapësirës së vizitës",
    presetStandard: "Standard",
    presetWideNotes: "Shënime të gjera",
    presetFocusVideo: "Fokus video",
    sessionTimerAria: "Koha e kaluar në vizitë",
    micLevelAria: "Niveli i zërit në mikrofon",
    stampNotesBtn: "Shto kohën",
    stampTranscriptBtn: "Shëno kohën",
    sendToNotesBtn: "Kalo me orar te shënimet",
    sentToNotesStatus: "Transkriptimi me orar iu shtua shënimeve klinike.",
    draftRecoveredNotice: "Drafti i paruajtur u rikthye nga ky sesion shfletuesi.",
    discardDraftBtn: "Hiq draftin lokal",
    saveShortcutHint: "Ctrl+S / ⌘S",
  },
  it: {
    presetsAria: "Disposizione dello spazio visita",
    presetStandard: "Standard",
    presetWideNotes: "Note ampie",
    presetFocusVideo: "Focus video",
    sessionTimerAria: "Durata della sessione",
    micLevelAria: "Livello vocale del microfono",
    stampNotesBtn: "Aggiungi orario",
    stampTranscriptBtn: "Segna orario",
    sendToNotesBtn: "Inserisci con orario nelle note",
    sentToNotesStatus: "Trascrizione con orario aggiunta alle note cliniche.",
    draftRecoveredNotice: "Bozza non salvata recuperata da questa sessione.",
    discardDraftBtn: "Scarta bozza locale",
    saveShortcutHint: "Ctrl+S / ⌘S",
  },
  hr: {
    presetsAria: "Raspored radnog prostora",
    presetStandard: "Standardno",
    presetWideNotes: "Široke bilješke",
    presetFocusVideo: "Fokus na video",
    sessionTimerAria: "Trajanje konzultacije",
    micLevelAria: "Razina glasa na mikrofonu",
    stampNotesBtn: "Dodaj oznaku vremena",
    stampTranscriptBtn: "Označi vrijeme",
    sendToNotesBtn: "Umetni s vremenom u bilješke",
    sentToNotesStatus: "Prijepis s vremenskom oznakom dodan je u kliničke bilješke.",
    draftRecoveredNotice: "Nespremljeni nacrt vraćen je iz ove sesije preglednika.",
    discardDraftBtn: "Odbaci lokalni nacrt",
    saveShortcutHint: "Ctrl+S / ⌘S",
  },
  rom: {
    presetsAria: "Dikhiben e bukyako",
    presetStandard: "Standard",
    presetWideNotes: "Bare noticye",
    presetFocusVideo: "Video fokuso",
    sessionTimerAria: "Vrama e svatoski",
    micLevelAria: "Glaso and-o mikrofono",
    stampNotesBtn: "Tho vrama",
    stampTranscriptBtn: "Lekhav vrama",
    sendToNotesBtn: "Tho vramasa and-e noticye",
    sentToNotesStatus: "O lekhavipe vramasa sas thodino and-e klinikane noticye.",
    draftRecoveredNotice: "Bi-arakhlo lekhavipe sas palpale lino katar kadi sesia.",
    discardDraftBtn: "Muk lokalno lekhavipe",
    saveShortcutHint: "Ctrl+S / ⌘S",
  },
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
    webkitAudioContext?: typeof AudioContext;
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

function formatSessionClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export function FollowupMeetingWorkspace({
  meetingId,
  patientId,
  userEmail,
  userRole,
  isAdmin,
}: FollowupMeetingWorkspaceProps) {
  const { lang } = useLanguage();
  const t = meetingWorkspaceTranslations[lang];
  const cockpit = COCKPIT_COPY[lang] ?? COCKPIT_COPY.en;
  const { request: fetch, demo } = usePanelRuntime();
  const [preset, setPreset] = useState<WorkspacePreset>("standard");
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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hasRecoveredDraft, setHasRecoveredDraft] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const recorderRef = useRef<BrowserMediaRecorder | null>(null);
  const recorderStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const meterBarRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const meterBarSecondaryRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const loadedDraftRef = useRef(false);

  const draftStorageKey = useMemo(
    () => `redihealth_meeting_draft_${meetingId}_${patientId}`,
    [meetingId, patientId],
  );

  const sidebarOpen = preset !== "focus_video";
  const roomUrl = meeting ? toStableMeetingUrl(meeting.meeting_url, meetingId) : "";
  const dirty = notes !== savedRecord.notes || transcript !== savedRecord.transcript;
  const formattedClock = formatSessionClock(elapsedSeconds);
  const activeMicCapture = isListening || isRecordingFallback;

  useEffect(() => {
    loadedDraftRef.current = false;
    async function loadMeeting() {
      try {
        const response = await fetch(`/api/meetings?id=${meetingId}`);
        const data = (await response.json()) as { meeting?: Meeting; error?: string };
        if (!response.ok || !data.meeting) throw new Error(data.error || t.loadError);
        const serverNotes = data.meeting.notes || "";
        const serverTranscript = data.meeting.transcript || "";
        setMeeting(data.meeting);
        setSavedRecord({ notes: serverNotes, transcript: serverTranscript });

        let restored = false;
        try {
          const rawDraft = window.sessionStorage.getItem(draftStorageKey);
          if (rawDraft) {
            const parsed = JSON.parse(rawDraft) as {
              notes?: unknown;
              transcript?: unknown;
            };
            const draftNotes = typeof parsed.notes === "string" ? parsed.notes : serverNotes;
            const draftTranscript =
              typeof parsed.transcript === "string" ? parsed.transcript : serverTranscript;
            const differs = draftNotes !== serverNotes || draftTranscript !== serverTranscript;
            const nonEmpty = Boolean(draftNotes.trim() || draftTranscript.trim());
            if (differs && nonEmpty) {
              setNotes(draftNotes);
              setTranscript(draftTranscript);
              setHasRecoveredDraft(true);
              restored = true;
            } else {
              window.sessionStorage.removeItem(draftStorageKey);
            }
          }
        } catch {
          // Ignore sessionStorage restrictions in private contexts.
        }

        if (!restored) {
          setNotes(serverNotes);
          setTranscript(serverTranscript);
          setHasRecoveredDraft(false);
        }
        loadedDraftRef.current = true;
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : t.loadError);
      }
    }
    void loadMeeting();
  }, [meetingId, fetch, t.loadError, draftStorageKey]);

  // Session elapsed timer once meeting is active
  useEffect(() => {
    if (!meeting) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [meeting]);

  // Crash-safe sessionStorage draft persistence
  useEffect(() => {
    if (!meeting || !loadedDraftRef.current) return;
    try {
      if (dirty) {
        window.sessionStorage.setItem(
          draftStorageKey,
          JSON.stringify({ notes, transcript, updatedAt: Date.now() }),
        );
      } else {
        window.sessionStorage.removeItem(draftStorageKey);
      }
    } catch {
      // Ignore storage quota / privacy errors.
    }
  }, [meeting, dirty, notes, transcript, draftStorageKey]);

  // Unsaved-notes beforeunload protection
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Clean up speech recognition & fallback recorder on unmount
  useEffect(
    () => () => {
      recognitionRef.current?.stop();
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
      recorderStreamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  // Web Audio AnalyserNode + rAF 5-bar scaleY voice meter during active mic capture
  useEffect(() => {
    const setStaticScale = (scale: number) => {
      for (let i = 0; i < 5; i += 1) {
        const bar = meterBarRefs.current[i];
        if (bar) {
          bar.style.transform = `scaleY(${scale})`;
        }
        const secondaryBar = meterBarSecondaryRefs.current[i];
        if (secondaryBar) {
          secondaryBar.style.transform = `scaleY(${scale})`;
        }
      }
    };

    if (!activeMicCapture || demo) {
      setStaticScale(0.22);
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

    if (prefersReducedMotion) {
      setStaticScale(0.58);
      return () => setStaticScale(0.22);
    }

    let cancelled = false;
    let rafId = 0;
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let sourceNode: MediaStreamAudioSourceNode | null = null;
    let ownedStream: MediaStream | null = null;

    async function attachAnalyser() {
      try {
        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextCtor || !navigator.mediaDevices?.getUserMedia) {
          setStaticScale(0.5);
          return;
        }

        let stream = recorderStreamRef.current;
        const hasLiveTrack = Boolean(
          stream?.getAudioTracks().some((track) => track.readyState === "live"),
        );

        if (!stream || !hasLiveTrack) {
          ownedStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (cancelled) {
            ownedStream.getTracks().forEach((track) => track.stop());
            return;
          }
          stream = ownedStream;
        }

        audioCtx = new AudioContextCtor();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.72;
        sourceNode = audioCtx.createMediaStreamSource(stream);
        sourceNode.connect(analyser);

        const bins = new Uint8Array(analyser.frequencyBinCount);
        const bandRanges: Array<[number, number]> = [
          [1, 3],
          [3, 6],
          [6, 10],
          [10, 15],
          [15, 22],
        ];

        const updateMeter = () => {
          if (cancelled || !analyser) return;
          analyser.getByteFrequencyData(bins);
          for (let barIdx = 0; barIdx < 5; barIdx += 1) {
            const [startBin, endBin] = bandRanges[barIdx];
            let sum = 0;
            let count = 0;
            for (let b = startBin; b < Math.min(endBin, bins.length); b += 1) {
              sum += bins[b];
              count += 1;
            }
            const avg = count > 0 ? sum / count : 0;
            const normalized = Math.min(1, avg / 185);
            const scale = 0.22 + normalized * 0.78;
            const el = meterBarRefs.current[barIdx];
            if (el) {
              el.style.transform = `scaleY(${scale.toFixed(3)})`;
            }
            const secondaryEl = meterBarSecondaryRefs.current[barIdx];
            if (secondaryEl) {
              secondaryEl.style.transform = `scaleY(${scale.toFixed(3)})`;
            }
          }
          rafId = window.requestAnimationFrame(updateMeter);
        };

        rafId = window.requestAnimationFrame(updateMeter);
      } catch {
        if (!cancelled) {
          setStaticScale(0.5);
        }
      }
    }

    void attachAnalyser();

    return () => {
      cancelled = true;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      try {
        sourceNode?.disconnect();
      } catch {
        // Ignore already-disconnected nodes.
      }
      try {
        analyser?.disconnect();
      } catch {
        // Ignore already-disconnected analyser.
      }
      if (audioCtx && audioCtx.state !== "closed") {
        void audioCtx.close().catch(() => {});
      }
      ownedStream?.getTracks().forEach((track) => track.stop());
      setStaticScale(0.22);
    };
  }, [activeMicCapture, demo]);

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
    if (demo) {
      setTranscript(
        (current) =>
          `${current}${current ? "\n" : ""}[${formattedClock}] ${demoPanelTranslations[lang].transcript}`,
      );
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const isLocalhost =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (!window.isSecureContext && !isLocalhost) {
      setError(t.speech.needsHttps);
      return;
    }

    if (navigator.permissions?.query) {
      try {
        const micPermission = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
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
      if (finalText) {
        setTranscript((current) => `${current}${current ? " " : ""}${finalText.trim()}`);
      }
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
    if (demo) {
      setTranscript(
        (current) =>
          `${current}${current ? "\n" : ""}[${formattedClock}] ${demoPanelTranslations[lang].transcript}`,
      );
      return;
    }
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

  const saveMeetingRecord = useCallback(async () => {
    if (!meeting || isSaving) return;
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
      setHasRecoveredDraft(false);
      try {
        window.sessionStorage.removeItem(draftStorageKey);
      } catch {
        // Ignore storage restrictions.
      }
      setStatus(t.saved);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.saveError);
    } finally {
      setIsSaving(false);
    }
  }, [meeting, isSaving, transcript, notes, fetch, t.saveError, t.saved, draftStorageKey]);

  // Cmd+S / Ctrl+S save shortcut
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveMeetingRecord();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saveMeetingRecord]);

  function discardRecoveredDraft() {
    setNotes(savedRecord.notes);
    setTranscript(savedRecord.transcript);
    setHasRecoveredDraft(false);
    try {
      window.sessionStorage.removeItem(draftStorageKey);
    } catch {
      // Ignore storage restrictions.
    }
  }

  function stampTimeIntoNotes() {
    const stamp = `[${formattedClock}] `;
    setNotes((curr) => {
      if (!curr) return stamp;
      const needsNewline = !curr.endsWith("\n") && !curr.endsWith(" ");
      return `${curr}${needsNewline ? "\n" : ""}${stamp}`.slice(0, 4000);
    });
    setStatus("");
  }

  function stampTimeIntoTranscript() {
    const stamp = `[${formattedClock}] `;
    setTranscript((curr) => {
      if (!curr) return stamp;
      const needsNewline = !curr.endsWith("\n") && !curr.endsWith(" ");
      return `${curr}${needsNewline ? "\n" : ""}${stamp}`;
    });
    setStatus("");
  }

  function insertTimestampedTranscriptIntoNotes() {
    const clean = transcript.trim();
    if (!clean) return;
    const block = `[${formattedClock}] ${clean}`;
    setNotes((curr) => {
      const next = curr ? `${curr}\n\n${block}` : block;
      return next.slice(0, 4000);
    });
    setStatus(cockpit.sentToNotesStatus);
  }

  async function invitePatient() {
    if (!meeting) return;
    setIsInviting(true);
    setError("");
    setStatus("");
    try {
      const response = await fetch(`/api/meetings/${meeting.id}/invite`, {
        method: "POST",
        headers: { [REQUEST_LANG_HEADER]: lang },
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || t.inviteError);
      setStatus(t.invited);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.inviteError);
    } finally {
      setIsInviting(false);
    }
  }

  const gridLayoutClass =
    preset === "focus_video"
      ? "grid-cols-1"
      : preset === "wide_notes"
        ? "lg:grid-cols-[minmax(0,1fr)_minmax(26rem,46%)]"
        : "lg:grid-cols-[minmax(0,1fr)_23rem]";

  const presetButtons: Array<{ key: WorkspacePreset; label: string }> = [
    { key: "standard", label: cockpit.presetStandard },
    { key: "wide_notes", label: cockpit.presetWideNotes },
    { key: "focus_video", label: cockpit.presetFocusVideo },
  ];

  return (
    <AdminShell userEmail={userEmail} userRole={userRole} isAdmin={isAdmin}>
      <main id="main-content" className="py-4 sm:py-6">
        <Container className="max-w-[1600px]">
          <Link
            href={withLangPrefix(`/panel/patients/${patientId}`, lang)}
            className="mb-3 inline-flex min-h-[44px] items-center gap-1 rounded-lg px-2 text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeftIcon aria-hidden="true" className="h-4 w-4" />
            {t.back}
          </Link>

          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 pt-1">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                {meeting ? (
                  <span
                    aria-label={cockpit.sessionTimerAria}
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full bg-live-sage" aria-hidden="true" />
                    <span className="tabular-nums font-mono">{formattedClock}</span>
                  </span>
                ) : null}

                {meeting ? (
                  <span
                    role="status"
                    className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-medium ${
                      dirty
                        ? "border-amber-care/35 bg-amber-care/10 text-foreground"
                        : "border-border bg-muted/50 text-foreground"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        dirty ? "bg-amber-care" : "bg-live-sage"
                      }`}
                      aria-hidden="true"
                    />
                    <span>{dirty ? t.unsaved : t.saved}</span>
                  </span>
                ) : null}
              </div>

              <h1 className="break-words text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {meeting?.title || t.loading}
              </h1>
            </div>

            {meeting ? (
              <div className="flex flex-wrap items-center gap-2.5">
                <div
                  role="group"
                  aria-label={cockpit.presetsAria}
                  className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/50 p-1"
                >
                  {presetButtons.map((item) => {
                    const active = preset === item.key;
                    const showDirtyDot =
                      dirty && preset === "focus_video" && item.key === "standard";
                    return (
                      <button
                        key={item.key}
                        type="button"
                        aria-pressed={active}
                        aria-controls={sidebarId}
                        onClick={() => setPreset(item.key)}
                        className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          active
                            ? "bg-card text-sapphire shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <FileTextIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{item.label}</span>
                        {showDirtyDot ? (
                          <span
                            className="h-2 w-2 shrink-0 rounded-full bg-amber-care"
                            aria-hidden="true"
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => void invitePatient()}
                  disabled={isInviting}
                  className="crm-button inline-flex min-h-[44px] items-center gap-2 rounded-lg"
                >
                  <MailIcon className="h-4 w-4" aria-hidden="true" />
                  {isInviting ? t.sending : t.invite}
                </button>
              </div>
            ) : null}
          </header>

          {hasRecoveredDraft ? (
            <div
              role="status"
              className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-care/35 bg-amber-care/10 px-4 py-3 text-xs text-foreground"
            >
              <div className="flex items-center gap-2.5 font-medium">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-care" aria-hidden="true" />
                <span>{cockpit.draftRecoveredNotice}</span>
              </div>
              <button
                type="button"
                onClick={discardRecoveredDraft}
                className="inline-flex min-h-[44px] items-center rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {cockpit.discardDraftBtn}
              </button>
            </div>
          ) : null}

          {error ? (
            <p
              className="mt-4 rounded-xl border border-primary/25 bg-primary-soft px-4 py-3 text-xs font-medium text-foreground"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          {status ? (
            <p
              className="mt-4 rounded-xl border border-border bg-sapphire-soft px-4 py-3 text-xs font-medium text-sapphire"
              role="status"
            >
              {status}
            </p>
          ) : null}

          {meeting ? (
            <section className={`mt-4 grid min-w-0 gap-4 ${gridLayoutClass}`}>
              <div className="flex min-w-0 flex-col gap-3">
                <ConsultationVitalsStreamOverlay
                  meetingId={meeting.id}
                  patientId={meeting.patient_id}
                  onInsertToNotes={(vitalsSummary) => {
                    setNotes((curr) =>
                      (curr ? `${curr}\n\n[${formattedClock}] ${vitalsSummary}` : `[${formattedClock}] ${vitalsSummary}`).slice(
                        0,
                        4000,
                      ),
                    );
                  }}
                />
                <section
                  aria-label={t.video}
                  className="min-w-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-white"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold">
                      <CameraIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                      {t.heading}
                    </span>

                    <div className="flex items-center gap-3">
                      <div
                        role="img"
                        aria-label={cockpit.micLevelAria}
                        className="inline-flex h-4 items-end gap-0.5 rounded-md border border-white/10 bg-white/5 px-2 py-0.5"
                      >
                        {[0, 1, 2, 3, 4].map((barIdx) => (
                          <span
                            key={barIdx}
                            ref={(node) => {
                              meterBarRefs.current[barIdx] = node;
                            }}
                            aria-hidden="true"
                            className={`telemed-meter-bar block h-3 w-1 rounded-xs ${
                              activeMicCapture ? "bg-live-sage" : "bg-slate-600"
                            }`}
                          />
                        ))}
                      </div>

                      <span role="status" className="inline-flex items-center gap-2 text-xs text-slate-300">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            activeMicCapture ? "bg-live-sage" : "bg-slate-500"
                          }`}
                          aria-hidden="true"
                        />
                        {isListening
                          ? t.listening
                          : isRecordingFallback
                            ? t.recording
                            : isTranscribingFallback
                              ? t.transcribing
                              : t.idle}
                      </span>
                    </div>
                  </div>
                  {demo ? (
                    <div className="flex min-h-48 items-center justify-center p-6 text-center lg:min-h-64">
                      <p className="max-w-sm text-sm leading-relaxed text-slate-300">
                        {demoPanelTranslations[lang].video}
                      </p>
                    </div>
                  ) : (
                    <iframe
                      src={`${roomUrl}#config.prejoinPageEnabled=false`}
                      title={meeting.title}
                      allow="camera; microphone; fullscreen; display-capture; autoplay"
                      allowFullScreen
                      className="block h-[55dvh] min-h-80 w-full border-0 lg:h-[68dvh]"
                    />
                  )}
                  <p className="border-t border-white/10 px-4 py-3 text-xs leading-relaxed text-slate-400">
                    {t.callHelp}
                  </p>
                </section>
              </div>

              <aside
                id={sidebarId}
                aria-label={t.workspace}
                hidden={!sidebarOpen}
                className="min-w-0 self-start rounded-xl border border-border bg-card"
              >
                <div className="flex items-start justify-between gap-3 px-4 pt-4">
                  <div>
                    <h2 className="text-sm font-bold text-foreground">{t.workspace}</h2>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          dirty ? "bg-amber-care" : "bg-live-sage"
                        }`}
                        aria-hidden="true"
                      />
                      <span className={dirty ? "font-semibold text-foreground" : ""}>
                        {dirty ? t.unsaved : t.saved}
                      </span>
                    </p>
                  </div>
                  <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
                    {cockpit.saveShortcutHint}
                  </kbd>
                </div>

                <div
                  role="tablist"
                  aria-label={t.workspace}
                  className="mb-4 mt-3 flex gap-5 overflow-x-auto border-b border-border px-4"
                >
                  {(["notes", "transcript", "recommendations"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      id={`${sidebarId}-${tab}-tab`}
                      aria-selected={activeTab === tab}
                      aria-controls={`${sidebarId}-${tab}`}
                      tabIndex={activeTab === tab ? 0 : -1}
                      onClick={() => setActiveTab(tab)}
                      onKeyDown={(event) => {
                        if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
                          event.preventDefault();
                          const order: Array<"notes" | "transcript" | "recommendations"> = [
                            "notes",
                            "transcript",
                            "recommendations",
                          ];
                          const idx = order.indexOf(tab);
                          const next =
                            event.key === "Home"
                              ? "notes"
                              : event.key === "End"
                                ? "recommendations"
                                : event.key === "ArrowLeft"
                                  ? order[(idx + order.length - 1) % order.length]
                                  : order[(idx + 1) % order.length];
                          setActiveTab(next);
                          document.getElementById(`${sidebarId}-${next}-tab`)?.focus();
                        }
                      }}
                      className={`-mb-px min-h-[44px] shrink-0 whitespace-nowrap border-b-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        activeTab === tab
                          ? "border-sapphire font-semibold text-sapphire"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t[tab]}
                    </button>
                  ))}
                </div>

                <div
                  role="tabpanel"
                  id={`${sidebarId}-notes`}
                  aria-labelledby={`${sidebarId}-notes-tab`}
                  hidden={activeTab !== "notes"}
                  className="space-y-3 px-4 pb-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      id={`${sidebarId}-notes-help`}
                      className="text-xs leading-relaxed text-muted-foreground"
                    >
                      {t.notesHelp}
                    </p>
                    <button
                      type="button"
                      onClick={stampTimeIntoNotes}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span>{cockpit.stampNotesBtn}</span>
                      <span className="tabular-nums font-mono text-[11px] text-muted-foreground">
                        [{formattedClock}]
                      </span>
                    </button>
                  </div>
                  <label htmlFor={`${sidebarId}-notes-input`} className="sr-only">
                    {t.notes}
                  </label>
                  <textarea
                    id={`${sidebarId}-notes-input`}
                    aria-describedby={`${sidebarId}-notes-help`}
                    value={notes}
                    onChange={(event) => {
                      setNotes(event.target.value);
                      setStatus("");
                    }}
                    rows={12}
                    maxLength={4000}
                    placeholder={t.notesPlaceholder}
                    className="crm-input min-h-64 resize-y text-sm"
                  />
                  <p className="tabular-nums text-right text-xs text-muted-foreground">
                    {notes.length} / 4000
                  </p>
                </div>

                <div
                  role="tabpanel"
                  id={`${sidebarId}-transcript`}
                  aria-labelledby={`${sidebarId}-transcript-tab`}
                  hidden={activeTab !== "transcript"}
                  className="space-y-3 px-4 pb-4"
                >
                  <p
                    id={`${sidebarId}-transcript-help`}
                    className="text-xs leading-relaxed text-muted-foreground"
                  >
                    {t.transcriptHelp}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleTranscription()}
                      disabled={isRecordingFallback || isTranscribingFallback}
                      className="crm-button min-h-[44px] rounded-lg text-xs"
                    >
                      {isListening ? t.stop : t.start}
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleFallbackRecording()}
                      disabled={isListening || isTranscribingFallback}
                      className="crm-button min-h-[44px] rounded-lg text-xs"
                    >
                      {isTranscribingFallback
                        ? t.transcribing
                        : isRecordingFallback
                          ? t.stopRecording
                          : t.record}
                    </button>

                    <div
                      role="img"
                      aria-label={cockpit.micLevelAria}
                      className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-border bg-muted/50 px-3"
                    >
                      {[0, 1, 2, 3, 4].map((idx) => (
                        <span
                          key={idx}
                          ref={(node) => {
                            meterBarSecondaryRefs.current[idx] = node;
                          }}
                          aria-hidden="true"
                          className={`telemed-meter-bar block h-4 w-1 rounded-xs ${
                            activeMicCapture ? "bg-live-sage" : "bg-muted-foreground/40"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={stampTimeIntoTranscript}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span>{cockpit.stampTranscriptBtn}</span>
                      <span className="tabular-nums font-mono text-[11px] text-muted-foreground">
                        [{formattedClock}]
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={insertTimestampedTranscriptIntoNotes}
                      disabled={!transcript.trim()}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-sapphire/25 bg-sapphire-soft px-3 text-xs font-semibold text-sapphire transition-colors hover:bg-sapphire hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cockpit.sendToNotesBtn}
                    </button>
                  </div>

                  <label htmlFor={`${sidebarId}-transcript-input`} className="sr-only">
                    {t.transcript}
                  </label>
                  <textarea
                    id={`${sidebarId}-transcript-input`}
                    aria-describedby={`${sidebarId}-transcript-help`}
                    value={transcript}
                    onChange={(event) => {
                      setTranscript(event.target.value);
                      setStatus("");
                    }}
                    rows={10}
                    placeholder={t.transcriptPlaceholder}
                    className="crm-input min-h-56 resize-y text-sm"
                  />
                  {interimTranscript ? (
                    <p className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                      {interimTranscript}
                    </p>
                  ) : null}
                </div>

                <div
                  role="tabpanel"
                  id={`${sidebarId}-recommendations`}
                  aria-labelledby={`${sidebarId}-recommendations-tab`}
                  hidden={activeTab !== "recommendations"}
                  className="space-y-3 px-4 pb-4"
                >
                  <DoctorRecommendationPublisher
                    meetingId={meeting.id}
                    patientName={meeting.title}
                    onPublished={(rec) => {
                      setStatus(t.recommendationsPublished);
                      const summaryText = `[${formattedClock}] [${t.recommendationNote}: ${rec.primaryDiagnosis} | ${t.recommendationSteps}: ${rec.actionSteps.map((s) => s.text).join("; ")}]`;
                      setNotes((curr) =>
                        (curr ? `${curr}\n\n${summaryText}` : summaryText).slice(0, 4000),
                      );
                    }}
                  />
                </div>

                <div className="border-t border-border p-4">
                  <button
                    type="button"
                    onClick={() => void saveMeetingRecord()}
                    disabled={isSaving}
                    className="crm-button crm-primary inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg"
                  >
                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                    <span>{isSaving ? t.saving : t.save}</span>
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
