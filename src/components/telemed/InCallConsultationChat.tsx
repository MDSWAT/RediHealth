"use client";

import { useEffect, useRef, useState } from "react";
import { CameraIcon, CloseIcon, VolumeIcon } from "@/components/ui/icons";
import { useVoiceEnabled } from "@/lib/audio/voice-availability";
import { speechEngine, formatSpeechText } from "@/lib/audio/speech-engine";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";

function useSafeLanguage() {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

const SPEECH_LANG: Record<Lang, string> = { ro: "ro-RO", en: "en-GB", sq: "sq-AL", it: "it-IT" };

const chatCopy = {
  ro: {
    welcome: "Bună ziua. Te aud și te văd bine. Dacă vrei să-mi arăți o rețetă sau o problemă de piele, trimite o poză aici.",
    oneMinAgo: "acum 1 min",
    now: "acum",
    you: "Tu",
    title: "Mesaje și poze",
    subtitle: (doctor: string) => `Doar tu și ${doctor} le vedeți`,
    close: "Închide mesajele",
    imageAlt: "Poză trimisă medicului",
    listen: "Ascultă",
    photo: "Fă o poză sau alege din galerie",
    placeholder: "Scrie medicului…",
    send: "Trimite",
  },
  en: {
    welcome: "Hello. I can see and hear you well. If you want to show me a prescription or a skin problem, send a photo here.",
    oneMinAgo: "1 min ago",
    now: "now",
    you: "You",
    title: "Messages and photos",
    subtitle: (doctor: string) => `Only you and ${doctor} can see them`,
    close: "Close messages",
    imageAlt: "Photo sent to the doctor",
    listen: "Listen",
    photo: "Take a photo or choose one from your gallery",
    placeholder: "Write to the doctor…",
    send: "Send",
  },
  sq: {
    welcome: "Mirëdita. Të shoh dhe të dëgjoj mirë. Nëse do të më tregosh një recetë apo një problem në lëkurë, dërgo një foto këtu.",
    oneMinAgo: "para 1 min",
    now: "tani",
    you: "Ti",
    title: "Mesazhe dhe foto",
    subtitle: (doctor: string) => `I shihni vetëm ti dhe ${doctor}`,
    close: "Mbyll mesazhet",
    imageAlt: "Foto e dërguar mjekut",
    listen: "Dëgjo",
    photo: "Bëj një foto ose zgjidh nga galeria",
    placeholder: "Shkruaji mjekut…",
    send: "Dërgo",
  },
  it: {
    welcome: "Buongiorno. Ti vedo e ti sento bene. Se vuoi mostrarmi una ricetta o un problema della pelle, manda una foto qui.",
    oneMinAgo: "1 min fa",
    now: "ora",
    you: "Tu",
    title: "Messaggi e foto",
    subtitle: (doctor: string) => `Li vedete solo tu e ${doctor}`,
    close: "Chiudi i messaggi",
    imageAlt: "Foto mandata al medico",
    listen: "Ascolta",
    photo: "Scatta una foto o scegline una dalla galleria",
    placeholder: "Scrivi al medico…",
    send: "Invia",
  },
};

interface ChatMessage {
  id: string;
  sender: "patient" | "doctor";
  senderName: string;
  text?: string;
  imageUrl?: string;
  timestamp: string;
}

interface InCallConsultationChatProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName?: string;
}

/**
 * Messages and photos during the call: a bottom sheet over the video. Text and photos only;
 * the patient can listen to the doctor's messages where read-aloud is available.
 */
export function InCallConsultationChat({ isOpen, onClose, doctorName = "Dr. Mihai Ionescu" }: InCallConsultationChatProps) {
  const voiceEnabled = useVoiceEnabled();
  const { lang } = useSafeLanguage();
  const copy = chatCopy[lang] ?? chatCopy.ro;
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: "msg-1", sender: "doctor", senderName: doctorName, text: copy.welcome, timestamp: copy.oneMinAgo },
  ]);
  const [inputVal, setInputVal] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  // Escape closes the sheet; focus goes to the message field when it opens.
  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Keep the newest message in view.
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const handleReadAloud = (text: string) => {
    if (!voiceEnabled || typeof window === "undefined") return;
    const targetLang = SPEECH_LANG[lang] ?? "ro-RO";
    speechEngine.speak(formatSpeechText(text, targetLang), {
      lang: targetLang,
      rate: 0.95,
    });
  };

  const addMessage = (msg: Omit<ChatMessage, "id" | "sender" | "senderName" | "timestamp">) =>
    setMessages((prev) => [...prev, { id: `msg-${Date.now()}`, sender: "patient", senderName: copy.you, timestamp: copy.now, ...msg }]);

  const handleSendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputVal.trim()) return;
    addMessage({ text: inputVal.trim() });
    setInputVal("");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => addMessage({ imageUrl: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="call-chat-title" className="fixed inset-0 z-50 flex items-end justify-center sm:p-4">
      <div className="news-sheet-backdrop fixed inset-0 -z-10 bg-slate-950/45" onClick={onClose} aria-hidden="true" />
      <div className="news-sheet flex h-[72dvh] max-h-[560px] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl bg-card text-foreground shadow-[0_24px_48px_-12px_rgb(15_23_42/0.35)] sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h2 id="call-chat-title" className="text-base font-semibold text-foreground">
              {copy.title}
            </h2>
            <p className="text-sm text-muted-foreground">{copy.subtitle(doctorName)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.close}
            className="-mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4" aria-live="polite">
          {messages.map((msg) => {
            const isMe = msg.sender === "patient";
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <span className="mb-1 text-xs text-muted-foreground">
                  {msg.senderName} · {msg.timestamp}
                </span>
                <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${isMe ? "bg-sapphire text-white" : "bg-muted text-foreground"}`}>
                  {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                  {msg.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={msg.imageUrl} alt={copy.imageAlt} className="mt-1 max-h-48 w-auto rounded-md object-contain" />
                  )}
                  {voiceEnabled && !isMe && msg.text && (
                    <button
                      type="button"
                      onClick={() => handleReadAloud(msg.text || "")}
                      className="mt-2 inline-flex min-h-[36px] items-center gap-1.5 rounded-md px-1 text-xs font-medium text-sapphire hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <VolumeIcon className="h-4 w-4" />
                      {copy.listen}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={listEndRef} />
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" tabIndex={-1} />

        <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t border-border bg-background p-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title={copy.photo}
            aria-label={copy.photo}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-sapphire transition-colors duration-[var(--dur-fast)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CameraIcon className="h-5 w-5" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={copy.placeholder}
            aria-label={copy.placeholder}
            className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-border bg-card px-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
          />
          <button
            type="submit"
            className="min-h-[44px] shrink-0 rounded-lg bg-sapphire px-4 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {copy.send}
          </button>
        </form>
      </div>
    </div>
  );
}
