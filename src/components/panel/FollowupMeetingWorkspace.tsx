"use client";

import { PanelLink as Link, usePanelRuntime } from "./PanelRuntime";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import { REQUEST_LANG_HEADER, withLangPrefix } from "@/lib/i18n/routing";
import { AdminShell } from "./AdminShell";
import { ChevronLeftIcon } from "@/components/ui/icons";
import { demoPanelTranslations } from "@/lib/i18n/demo-panel-translations";
import { meetingWorkspaceTranslations } from "@/lib/i18n/meeting-workspace-translations";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { ConsultationVitalsStreamOverlay } from "./ConsultationVitalsStreamOverlay";
import { DoctorRecommendationPublisher } from "@/components/telemed/DoctorRecommendationPublisher";
import {
  buildJitsiEmbedUrl,
  DOCTOR_WORKSPACE_TOOLBAR,
  subscribeJitsiCallEnd,
} from "@/lib/jitsi-embed";

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
  callEndedNotice: string;
  rejoinCallBtn: string;
};

const COCKPIT_COPY: Record<Lang, CockpitCopy> = {
  ru: {
    presetsAria: "Режим рабочего пространства",
    presetStandard: "Обычный",
    presetWideNotes: "Широкие заметки",
    presetFocusVideo: "Фокус на видео",
    sessionTimerAria: "Время консультации",
    micLevelAria: "Уровень микрофона",
    stampNotesBtn: "Метка времени",
    stampTranscriptBtn: "Метка времени",
    sendToNotesBtn: "Вставить в заметки",
    sentToNotesStatus: "Фрагмент расшифровки со временем добавлен в медицинские заметки.",
    draftRecoveredNotice: "Восстановлен несохранённый медицинский черновик из этого сеанса браузера.",
    discardDraftBtn: "Удалить черновик",
    saveShortcutHint: "Ctrl+S / ⌘S",
    callEndedNotice: "Звонок завершён. Вы можете продолжить работу с заметками или вернуться к звонку.",
    rejoinCallBtn: "Вернуться к звонку",
  },
  en: {
    presetsAria: "Workspace layout preset",
    presetStandard: "Standard",
    presetWideNotes: "Wide notes",
    presetFocusVideo: "Focus video",
    sessionTimerAria: "Consultation elapsed time",
    micLevelAria: "Microphone voice level",
    stampNotesBtn: "Add timestamp",
    stampTranscriptBtn: "Stamp time",
    sendToNotesBtn: "Send to notes",
    sentToNotesStatus: "Timestamped transcript excerpt added to clinical notes.",
    draftRecoveredNotice: "Unsaved clinical draft recovered from this browser session.",
    discardDraftBtn: "Discard draft",
    saveShortcutHint: "Ctrl+S / ⌘S",
    callEndedNotice: "The call has ended. You can keep editing clinical notes or rejoin the room.",
    rejoinCallBtn: "Rejoin call",
  },
  ro: {
    presetsAria: "Mod de afișare pentru consultație",
    presetStandard: "Standard",
    presetWideNotes: "Notițe extinse",
    presetFocusVideo: "Focus video",
    sessionTimerAria: "Durata sesiunii curente",
    micLevelAria: "Nivelul vocii în microfon",
    stampNotesBtn: "Marcaj timp",
    stampTranscriptBtn: "Marcaj timp",
    sendToNotesBtn: "Trimite în notițe",
    sentToNotesStatus: "Transcrierea marcată temporal a fost adăugată în notițele clinice.",
    draftRecoveredNotice: "Ciorna nesalvată a fost recuperată din această sesiune.",
    discardDraftBtn: "Renunță la ciornă",
    saveShortcutHint: "Ctrl+S / ⌘S",
    callEndedNotice: "Apelul s-a încheiat. Poți continua notițele clinice sau poți reveni în apel.",
    rejoinCallBtn: "Revino în apel",
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
    sendToNotesBtn: "Kalo te shënimet",
    sentToNotesStatus: "Transkriptimi me orar iu shtua shënimeve klinike.",
    draftRecoveredNotice: "Drafti i paruajtur u rikthye nga ky sesion shfletuesi.",
    discardDraftBtn: "Hiq draftin",
    saveShortcutHint: "Ctrl+S / ⌘S",
    callEndedNotice: "Thirrja përfundoi. Mund të vazhdoni shënimet klinike ose të hyni sërish në thirrje.",
    rejoinCallBtn: "Hyr sërish",
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
    sendToNotesBtn: "Inserisci nelle note",
    sentToNotesStatus: "Trascrizione con orario aggiunta alle note cliniche.",
    draftRecoveredNotice: "Bozza non salvata recuperata da questa sessione.",
    discardDraftBtn: "Scarta bozza",
    saveShortcutHint: "Ctrl+S / ⌘S",
    callEndedNotice: "La chiamata è terminata. Puoi continuare a scrivere le note cliniche o rientrare.",
    rejoinCallBtn: "Rientra in chiamata",
  },
  hr: {
    presetsAria: "Raspored radnog prostora",
    presetStandard: "Standardno",
    presetWideNotes: "Široke bilješke",
    presetFocusVideo: "Fokus na video",
    sessionTimerAria: "Trajanje konzultacije",
    micLevelAria: "Razina glasa na mikrofonu",
    stampNotesBtn: "Označi vrijeme",
    stampTranscriptBtn: "Označi vrijeme",
    sendToNotesBtn: "Dodaj u bilješke",
    sentToNotesStatus: "Prijepis s vremenskom oznakom dodan je u kliničke bilješke.",
    draftRecoveredNotice: "Nespremljeni nacrt vraćen je iz ove sesije preglednika.",
    discardDraftBtn: "Odbaci nacrt",
    saveShortcutHint: "Ctrl+S / ⌘S",
    callEndedNotice: "Poziv je završen. Možete nastaviti uređivati bilješke ili se ponovno uključiti.",
    rejoinCallBtn: "Ponovno uđi",
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
    sendToNotesBtn: "Tho and-e noticye",
    sentToNotesStatus: "O lekhavipe vramasa sas thodino and-e klinikane noticye.",
    draftRecoveredNotice: "Bi-arakhlo lekhavipe sas palpale lino katar kadi sesia.",
    discardDraftBtn: "Muk lekhavipe",
    saveShortcutHint: "Ctrl+S / ⌘S",
    callEndedNotice: "O akharipen getosardilo. Shai te lekhaves maj dur vaj te khuves palpale.",
    rejoinCallBtn: "Khuv palpale",
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
  const [jitsiCallEnded, setJitsiCallEnded] = useState(false);

  const jitsiIframeRef = useRef<HTMLIFrameElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const recorderRef = useRef<BrowserMediaRecorder | null>(null);
  const recorderStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const meterBarRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const loadedDraftRef = useRef(false);

  const draftStorageKey = useMemo(
    () => `redihealth_meeting_draft_${meetingId}_${patientId}`,
    [meetingId, patientId],
  );

  const sidebarOpen = preset !== "focus_video";
  const roomUrl = meeting ? toStableMeetingUrl(meeting.meeting_url, meetingId) : "";
  const jitsiEmbedUrl = roomUrl
    ? buildJitsiEmbedUrl({
        baseRoomUrl: roomUrl,
        apiId: 3,
        toolbarButtons: DOCTOR_WORKSPACE_TOOLBAR,
      })
    : "";
  const dirty = notes !== savedRecord.notes || transcript !== savedRecord.transcript;
  const formattedClock = formatSessionClock(elapsedSeconds);
  const activeMicCapture = isListening || isRecordingFallback;

  useEffect(() => {
    if (demo || !jitsiEmbedUrl || jitsiCallEnded) return;
    return subscribeJitsiCallEnd(jitsiIframeRef.current, 3, () => {
      setJitsiCallEnded(true);
    });
  }, [demo, jitsiEmbedUrl, jitsiCallEnded]);

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

  const outlineBtn =
    "inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[#8a94a6] bg-[var(--panel-surface)] px-3.5 py-2 text-sm font-medium text-[var(--panel-ink)] transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-[var(--panel-selection)] disabled:cursor-default disabled:border-[var(--panel-line)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:border-[var(--panel-line)] dark:focus-visible:outline-[#bad7fa]";

  const primaryBtn =
    "inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-sapphire bg-sapphire px-4 py-2 text-sm font-medium text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-[#28476f] disabled:cursor-default disabled:border-[var(--panel-line)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:focus-visible:outline-[#bad7fa]";

  return (
    <AdminShell userEmail={userEmail} userRole={userRole} isAdmin={isAdmin}>
      <main
        id="main-content"
        className="min-h-dvh bg-[var(--panel-surface)] px-4 py-4 pb-24 text-[var(--panel-ink)] sm:px-6 sm:py-5"
      >
        <div className="mx-auto max-w-[1600px]">
          <Link
            href={withLangPrefix(`/panel/patients/${patientId}`, lang)}
            className="mb-2 inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-lg text-sm font-medium text-sapphire hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:text-[#bad7fa] dark:focus-visible:outline-[#bad7fa]"
          >
            <ChevronLeftIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>{t.back}</span>
          </Link>

          <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--panel-line)] pb-4">
            <div className="min-w-0">
              <h1 className="break-words font-display text-xl font-bold tracking-[-0.025em] text-[var(--panel-ink)] sm:text-2xl">
                {meeting?.title || t.loading}
              </h1>
              {meeting ? (
                <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-sm text-[var(--panel-muted)]">
                  <span aria-label={cockpit.sessionTimerAria} className="tabular-nums">
                    {formattedClock}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span
                    role="status"
                    className={
                      dirty ? "font-semibold text-[#9a4d0b] dark:text-[#f5c58e]" : ""
                    }
                  >
                    {dirty ? t.unsaved : t.saved}
                  </span>
                </p>
              ) : null}
            </div>

            {meeting ? (
              <div className="flex flex-wrap items-center gap-2">
                <div
                  role="group"
                  aria-label={cockpit.presetsAria}
                  className="inline-flex flex-wrap items-center gap-1"
                >
                  {presetButtons.map((item) => {
                    const active = preset === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        aria-pressed={active}
                        aria-controls={sidebarId}
                        onClick={() => setPreset(item.key)}
                        className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:focus-visible:outline-[#bad7fa] ${
                          active
                            ? "border-sapphire bg-[var(--panel-selection)] font-semibold text-sapphire dark:border-[#bad7fa] dark:text-[#bad7fa]"
                            : "border-[#8a94a6] bg-[var(--panel-surface)] text-[var(--panel-muted)] hover:bg-[var(--panel-subtle)] hover:text-[var(--panel-ink)] dark:border-[var(--panel-line)]"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => void invitePatient()}
                  disabled={isInviting}
                  className={outlineBtn}
                >
                  {isInviting ? t.sending : t.invite}
                </button>
              </div>
            ) : null}
          </header>

          {hasRecoveredDraft ? (
            <div
              role="status"
              className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-[#9a4d0b]/35 bg-[#9a4d0b]/10 px-4 py-3 text-sm text-[var(--panel-ink)] dark:border-[#f5c58e]/35 dark:bg-[#9a4d0b]/20"
            >
              <span className="font-medium text-[#9a4d0b] dark:text-[#f5c58e]">
                {cockpit.draftRecoveredNotice}
              </span>
              <button
                type="button"
                onClick={discardRecoveredDraft}
                className={outlineBtn}
              >
                {cockpit.discardDraftBtn}
              </button>
            </div>
          ) : null}

          {error ? (
            <p
              className="mt-4 rounded-lg border border-[#b91c1c]/35 bg-[#b91c1c]/10 px-4 py-3 text-sm font-medium text-[#b91c1c] dark:border-[#ffb4b4]/35 dark:bg-[#b91c1c]/20 dark:text-[#ffb4b4]"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          {status ? (
            <p
              className="mt-4 rounded-lg border border-[var(--panel-line)] bg-[var(--panel-selection)] px-4 py-3 text-sm font-medium text-sapphire dark:text-[#bad7fa]"
              role="status"
            >
              {status}
            </p>
          ) : null}

          {meeting ? (
            <section className={`mt-5 grid min-w-0 gap-6 ${gridLayoutClass}`}>
              <div className="flex min-w-0 flex-col gap-4">
                <ConsultationVitalsStreamOverlay
                  meetingId={meeting.id}
                  patientId={meeting.patient_id}
                  onInsertToNotes={(vitalsSummary) => {
                    setNotes((curr) =>
                      (
                        curr
                          ? `${curr}\n\n[${formattedClock}] ${vitalsSummary}`
                          : `[${formattedClock}] ${vitalsSummary}`
                      ).slice(0, 4000),
                    );
                  }}
                />
                <section
                  aria-label={t.video}
                  className="min-w-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-white"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
                    <span className="text-sm font-semibold text-white">{t.heading}</span>
                    <span role="status" className="text-xs font-medium text-slate-300">
                      {isListening
                        ? t.listening
                        : isRecordingFallback
                          ? t.recording
                          : isTranscribingFallback
                            ? t.transcribing
                            : t.idle}
                    </span>
                  </div>
                  {demo ? (
                    <div className="flex min-h-48 items-center justify-center p-6 text-center lg:min-h-64">
                      <p className="max-w-sm text-sm leading-relaxed text-slate-300">
                        {demoPanelTranslations[lang].video}
                      </p>
                    </div>
                  ) : jitsiCallEnded ? (
                    <div className="flex h-[55dvh] min-h-80 flex-col items-center justify-center gap-4 p-6 text-center lg:h-[68dvh]">
                      <p className="max-w-md text-sm leading-relaxed text-slate-200">
                        {cockpit.callEndedNotice}
                      </p>
                      <button
                        type="button"
                        onClick={() => setJitsiCallEnded(false)}
                        className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      >
                        {cockpit.rejoinCallBtn}
                      </button>
                    </div>
                  ) : (
                    <iframe
                      ref={jitsiIframeRef}
                      src={jitsiEmbedUrl}
                      title={meeting.title}
                      allow="camera; microphone; fullscreen; display-capture; autoplay"
                      allowFullScreen
                      scrolling="no"
                      style={{ colorScheme: "dark" }}
                      className="block h-[55dvh] min-h-80 w-full overflow-hidden border-0 bg-ink-950 lg:h-[68dvh]"
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
                className="min-w-0 self-start border-t border-[var(--panel-line)] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-base font-semibold text-[var(--panel-ink)]">
                    {t.workspace}
                  </h2>
                  <span className="text-xs text-[var(--panel-muted)]">
                    {cockpit.saveShortcutHint}
                  </span>
                </div>

                <div
                  role="tablist"
                  aria-label={t.workspace}
                  className="mb-4 mt-3 flex flex-nowrap gap-5 overflow-x-auto border-b border-[var(--panel-line)]"
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
                      className={`-mb-px inline-flex min-h-12 shrink-0 items-center whitespace-nowrap border-b-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:focus-visible:outline-[#bad7fa] ${
                        activeTab === tab
                          ? "border-sapphire font-semibold text-sapphire dark:border-[#bad7fa] dark:text-[#bad7fa]"
                          : "border-transparent font-medium text-[var(--panel-muted)] hover:text-[var(--panel-ink)]"
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
                  className="space-y-3 pb-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      id={`${sidebarId}-notes-help`}
                      className="text-xs leading-relaxed text-[var(--panel-muted)]"
                    >
                      {t.notesHelp}
                    </p>
                    <button type="button" onClick={stampTimeIntoNotes} className={outlineBtn}>
                      <span>{cockpit.stampNotesBtn}</span>
                      <span className="tabular-nums text-xs text-[var(--panel-muted)]">
                        {formattedClock}
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
                    className="min-h-64 w-full resize-y rounded-lg border border-[#8a94a6] bg-[var(--panel-surface)] px-3 py-2 text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:border-[var(--panel-line)] dark:focus-visible:outline-[#bad7fa]"
                  />
                  <p className="text-right text-xs tabular-nums text-[var(--panel-muted)]">
                    {notes.length} / 4000
                  </p>
                </div>

                <div
                  role="tabpanel"
                  id={`${sidebarId}-transcript`}
                  aria-labelledby={`${sidebarId}-transcript-tab`}
                  hidden={activeTab !== "transcript"}
                  className="space-y-3 pb-4"
                >
                  <p
                    id={`${sidebarId}-transcript-help`}
                    className="text-xs leading-relaxed text-[var(--panel-muted)]"
                  >
                    {t.transcriptHelp}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleTranscription()}
                      disabled={isRecordingFallback || isTranscribingFallback}
                      className={outlineBtn}
                    >
                      {isListening ? t.stop : t.start}
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleFallbackRecording()}
                      disabled={isListening || isTranscribingFallback}
                      className={outlineBtn}
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
                      className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-[var(--panel-line)] bg-[var(--panel-subtle)] px-3"
                    >
                      {[0, 1, 2, 3, 4].map((idx) => (
                        <span
                          key={idx}
                          ref={(node) => {
                            meterBarRefs.current[idx] = node;
                          }}
                          aria-hidden="true"
                          className={`telemed-meter-bar block h-4 w-1 rounded-xs ${
                            activeMicCapture ? "bg-live-sage" : "bg-[var(--panel-muted)]/40"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={stampTimeIntoTranscript}
                      className={outlineBtn}
                    >
                      <span>{cockpit.stampTranscriptBtn}</span>
                      <span className="tabular-nums text-xs text-[var(--panel-muted)]">
                        {formattedClock}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={insertTimestampedTranscriptIntoNotes}
                      disabled={!transcript.trim()}
                      className={outlineBtn}
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
                    className="min-h-56 w-full resize-y rounded-lg border border-[#8a94a6] bg-[var(--panel-surface)] px-3 py-2 text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:border-[var(--panel-line)] dark:focus-visible:outline-[#bad7fa]"
                  />
                  {interimTranscript ? (
                    <p className="border-t border-[var(--panel-line)] pt-2 text-xs text-[var(--panel-muted)]">
                      {interimTranscript}
                    </p>
                  ) : null}
                </div>

                <div
                  role="tabpanel"
                  id={`${sidebarId}-recommendations`}
                  aria-labelledby={`${sidebarId}-recommendations-tab`}
                  hidden={activeTab !== "recommendations"}
                  className="space-y-3 pb-4"
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

                <div className="border-t border-[var(--panel-line)] pt-4">
                  <button
                    type="button"
                    onClick={() => void saveMeetingRecord()}
                    disabled={isSaving}
                    className={`${primaryBtn} w-full`}
                  >
                    {isSaving ? t.saving : t.save}
                  </button>
                </div>
              </aside>
            </section>
          ) : null}
        </div>
      </main>
    </AdminShell>
  );
}
