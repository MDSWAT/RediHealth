"use client";

import { useState } from "react";
import { AlertCircleIcon, StethoscopeIcon } from "@/components/ui/icons";
import { AssistantNavigation } from "@/components/health-assistant/AssistantNavigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type Response = {
  urgency: "emergency" | "routine";
  careLevel: "emergency" | "urgent" | "soon" | "routine";
  possibleCause: string;
  message: string;
  questions: string[];
};

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
  questions?: string[];
  urgency?: Response["urgency"];
  careLevel?: Response["careLevel"];
  possibleCause?: string;
};

const welcomeMessage: ChatMessage = {
  role: "assistant",
  content: "Hello. Tell me what you are feeling. I can organise your information for a clinician, but I cannot diagnose or replace urgent care.",
};

export function HealthAssistant() {
  const [symptoms, setSymptoms] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedMessage = symptoms.trim();
    if (!submittedMessage) return;
    const nextMessages = [...messages, { role: "user" as const, content: submittedMessage }];
    setError("");
    setMessages(nextMessages);
    setSymptoms("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/health-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: submittedMessage, history: nextMessages.slice(-12) }),
      });
      const data = await response.json() as Response & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "We could not review that information.");
      setMessages((currentMessages) => [...currentMessages, {
        role: "assistant",
        content: data.message,
        questions: data.questions,
        urgency: data.urgency,
        careLevel: data.careLevel,
        possibleCause: data.possibleCause,
      }]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "We could not review that information.");
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
            <div><h1 className="text-xl font-semibold text-foreground">RediHealth assistant</h1><p className="text-sm text-muted-foreground">Private health intake and prescription review</p></div>
          </div>

          <form onSubmit={handleSubmit}>
            <section className="flex min-h-[38rem] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-5 py-4"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary"><StethoscopeIcon className="h-4 w-4" /></span><h2 className="text-sm font-semibold text-foreground">Chat with your care assistant</h2></div><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" title="Available" /></div>
              <div className="flex-1 space-y-5 overflow-y-auto bg-muted/30 p-5">
                {messages.map((message, index) => message.role === "user" ? <div key={index} className="ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-foreground px-4 py-3 text-sm text-white">{message.content}</div> : <div key={index} aria-live="polite" className={`max-w-[90%] rounded-lg rounded-tl-none px-4 py-3 text-sm leading-relaxed ${message.urgency === "emergency" ? "bg-red-100 text-red-950" : "bg-primary-soft text-foreground"}`}>{message.careLevel ? <div className="mb-3 border-b border-border/70 pb-3"><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preliminary assessment</p><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${message.careLevel === "emergency" ? "bg-red-200 text-red-950" : message.careLevel === "urgent" ? "bg-amber-200 text-amber-950" : message.careLevel === "soon" ? "bg-yellow-100 text-yellow-950" : "bg-emerald-100 text-emerald-950"}`}>{message.careLevel === "emergency" ? "Emergency care now" : message.careLevel === "urgent" ? "Same-day care" : message.careLevel === "soon" ? "Care within 24-48 hours" : "Routine care"}</span></div><p className="mt-2 font-medium text-foreground">Possible cause: {message.possibleCause}</p></div> : null}<p>{message.content}</p>{message.questions?.length ? <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">{message.questions.map((question) => <li key={question}>{question}</li>)}</ul> : null}</div>)}
              </div>
              <div className="border-t border-border bg-card p-4">
                <label className="sr-only" htmlFor="symptoms">Describe your symptoms</label>
                <textarea id="symptoms" required rows={3} value={symptoms} onChange={(event) => setSymptoms(event.target.value)} placeholder="Describe your symptoms..." className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                <div className="mt-3 flex justify-end"><Button type="submit" className="min-w-28" disabled={isSubmitting}>{isSubmitting ? "Thinking..." : "Send"}</Button></div>
                {error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p> : null}
                <p className="mt-4 flex gap-2 border-t border-border pt-4 text-xs leading-relaxed text-red-800"><AlertCircleIcon className="h-4 w-4 flex-none" />For chest pain, trouble breathing, stroke symptoms, severe bleeding, overdose, or immediate danger, call <strong>112</strong>.</p>
              </div>
            </section>
          </form>
        </div>
      </Container>
    </main>
  );
}