"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircleIcon, StethoscopeIcon } from "@/components/ui/icons";
import { AssistantNavigation } from "@/components/health-assistant/AssistantNavigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { useLanguage } from "@/lib/i18n/language-context";

type Response = {
  urgency: "emergency" | "routine";
  careLevel: "emergency" | "urgent" | "soon" | "routine";
  possibleCause: string;
  message: string;
  questions: string[];
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  questions?: string[];
  urgency?: Response["urgency"];
  careLevel?: Response["careLevel"];
  possibleCause?: string;
};

export function HealthAssistant() {
  const { lang } = useLanguage();
  const t = {
    en: {
      welcome: "Hello. Tell me what you are feeling. I can organise your information for a clinician, but I cannot diagnose or replace urgent care.",
      reviewErr: "We could not review that information.",
      title: "RediHealth assistant",
      subtitle: "Private health intake and prescription review",
      chatTitle: "Chat with your care assistant",
      available: "Available",
      prelim: "Preliminary assessment",
      emergencyNow: "Emergency care now",
      sameDay: "Same-day care",
      within48: "Care within 24-48 hours",
      routine: "Routine care",
      possibleCause: "Possible cause",
      symptomsLabel: "Describe your symptoms",
      symptomsPh: "Describe your symptoms...",
      thinking: "Thinking...",
      send: "Send",
      emergencyNotice: "For chest pain, trouble breathing, stroke symptoms, severe bleeding, overdose, or immediate danger, call",
    },
    ro: {
      welcome: "Buna. Spune-mi ce simptome ai. Pot organiza informatiile pentru clinician, dar nu pot pune diagnostic si nu inlocuiesc ingrijirea urgenta.",
      reviewErr: "Nu am putut analiza aceste informatii.",
      title: "Asistent RediHealth",
      subtitle: "Triaj privat de simptome si revizuire reteta",
      chatTitle: "Discutie cu asistentul tau medical",
      available: "Disponibil",
      prelim: "Evaluare preliminara",
      emergencyNow: "Urgenta imediata",
      sameDay: "Consult in aceeasi zi",
      within48: "Consult in 24-48 de ore",
      routine: "Monitorizare de rutina",
      possibleCause: "Cauza posibila",
      symptomsLabel: "Descrie simptomele tale",
      symptomsPh: "Descrie simptomele...",
      thinking: "Se analizeaza...",
      send: "Trimite",
      emergencyNotice: "Pentru durere toracica, dificultate la respiratie, simptome de AVC, sangerare severa, supradoza sau pericol imediat, suna",
    },
    sq: {
      welcome: "Pershendetje. Me trego si cfare po ndjen. Mund te organizoj informacionin per klinicistin, por nuk mund te vendos diagnoze dhe nuk zevendesoj urgjencen.",
      reviewErr: "Nuk mund ta shqyrtonim kete informacion.",
      title: "Asistenti RediHealth",
      subtitle: "Pranim privat i simptomave dhe rishikim recete",
      chatTitle: "Bisedo me asistentin tend shendetesor",
      available: "I disponueshem",
      prelim: "Vleresim paraprak",
      emergencyNow: "Urgjence tani",
      sameDay: "Kujdes brenda dites",
      within48: "Kujdes brenda 24-48 oreve",
      routine: "Kujdes rutinor",
      possibleCause: "Shkak i mundshem",
      symptomsLabel: "Pershkruaj simptomat",
      symptomsPh: "Pershkruaj simptomat...",
      thinking: "Duke menduar...",
      send: "Dergo",
      emergencyNotice: "Per dhimbje gjoksi, veshtiresi ne frymemarrje, shenja goditjeje, gjakderdhje te rende, mbidoze ose rrezik te menjehershem, telefono",
    },
    it: {
      welcome: "Ciao. Dimmi come ti senti. Posso organizzare le informazioni per il clinico, ma non posso fare diagnosi ne sostituire l'assistenza urgente.",
      reviewErr: "Non siamo riusciti ad analizzare queste informazioni.",
      title: "Assistente RediHealth",
      subtitle: "Triage privato dei sintomi e revisione prescrizione",
      chatTitle: "Chatta con il tuo assistente sanitario",
      available: "Disponibile",
      prelim: "Valutazione preliminare",
      emergencyNow: "Emergenza subito",
      sameDay: "Cura in giornata",
      within48: "Cura entro 24-48 ore",
      routine: "Cura di routine",
      possibleCause: "Possibile causa",
      symptomsLabel: "Descrivi i sintomi",
      symptomsPh: "Descrivi i sintomi...",
      thinking: "Elaborazione...",
      send: "Invia",
      emergencyNotice: "Per dolore al petto, difficolta respiratoria, sintomi di ictus, sanguinamento grave, overdose o pericolo immediato, chiama",
    },
  }[lang];

  const welcomeMessage: ChatMessage = {
    id: "assistant-welcome",
    role: "assistant",
    content: t.welcome,
  };

  const nextMessageIdRef = useRef(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function nextMessageId() {
    nextMessageIdRef.current += 1;
    return `message-${nextMessageIdRef.current}`;
  }

  const [symptoms, setSymptoms] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedMessage = symptoms.trim();
    if (!submittedMessage) return;
    const nextMessages = [...messages, { id: nextMessageId(), role: "user" as const, content: submittedMessage }];
    setError("");
    setMessages(nextMessages);
    setSymptoms("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/health-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: submittedMessage, history: nextMessages.slice(-12), lang }),
      });
      const data = await response.json() as Response & { error?: string };
      if (!response.ok) throw new Error(data.error ?? t.reviewErr);
      setMessages((currentMessages) => [...currentMessages, {
        id: nextMessageId(),
        role: "assistant",
        content: data.message,
        questions: data.questions,
        urgency: data.urgency,
        careLevel: data.careLevel,
        possibleCause: data.possibleCause,
      }]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t.reviewErr);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main id="main-content" className="flex-1 bg-muted/40 py-8 sm:py-12">
      <Container>
        <div className="mx-auto max-w-6xl">
          <AssistantNavigation />
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white"><StethoscopeIcon className="h-5 w-5" /></span>
            <div><h1 className="text-xl font-semibold text-foreground">{t.title}</h1><p className="text-sm text-muted-foreground">{t.subtitle}</p></div>
          </div>

          <form onSubmit={handleSubmit}>
            <section className="flex min-h-[38rem] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-5 py-4"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary"><StethoscopeIcon className="h-4 w-4" /></span><h2 className="text-sm font-semibold text-foreground">{t.chatTitle}</h2></div><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" title={t.available} /></div>
              <div className="flex-1 space-y-5 overflow-y-auto bg-muted/30 p-5">
                {messages.map((message) => message.role === "user" ? <div key={message.id} className="ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-foreground px-4 py-3 text-sm text-white">{message.content}</div> : <div key={message.id} aria-live="polite" className={`max-w-[90%] rounded-lg rounded-tl-none px-4 py-3 text-sm leading-relaxed ${message.urgency === "emergency" ? "bg-red-100 text-red-950" : "bg-primary-soft text-foreground"}`}>{message.careLevel ? <div className="mb-3 border-b border-border/70 pb-3"><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.prelim}</p><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${message.careLevel === "emergency" ? "bg-red-200 text-red-950" : message.careLevel === "urgent" ? "bg-amber-200 text-amber-950" : message.careLevel === "soon" ? "bg-yellow-100 text-yellow-950" : "bg-emerald-100 text-emerald-950"}`}>{message.careLevel === "emergency" ? t.emergencyNow : message.careLevel === "urgent" ? t.sameDay : message.careLevel === "soon" ? t.within48 : t.routine}</span></div><p className="mt-2 font-medium text-foreground">{t.possibleCause}: {message.possibleCause}</p></div> : null}<p>{message.content}</p>{message.questions?.length ? <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">{message.questions.map((question) => <li key={question}>{question}</li>)}</ul> : null}</div>)}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t border-border bg-card p-4">
                <label className="sr-only" htmlFor="symptoms">{t.symptomsLabel}</label>
                <textarea id="symptoms" required rows={3} value={symptoms} onChange={(event) => setSymptoms(event.target.value)} placeholder={t.symptomsPh} className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                <div className="mt-3 flex justify-end"><Button type="submit" className="min-w-28" disabled={isSubmitting}>{isSubmitting ? t.thinking : t.send}</Button></div>
                {error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p> : null}
                <p className="mt-4 flex gap-2 border-t border-border pt-4 text-xs leading-relaxed text-red-800"><AlertCircleIcon className="h-4 w-4 flex-none" />{t.emergencyNotice} <strong>112</strong>.</p>
              </div>
            </section>
          </form>
        </div>
      </Container>
    </main>
  );
}