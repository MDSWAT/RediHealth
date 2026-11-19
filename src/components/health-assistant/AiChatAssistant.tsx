"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { AssistantNavigation } from "@/components/health-assistant/AssistantNavigation";
import { AI_CHAT_COPY, AI_CHAT_MAX_LENGTH } from "@/components/health-assistant/ai-chat-copy";
import { dangerPanel, textInput } from "@/components/health-assistant/step-ui";
import { captchaErrorMessage, useRecaptcha } from "@/components/security/RecaptchaProvider";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG } from "@/lib/i18n/routing";
import type { AssistantResponse } from "@/lib/health-assistant";

type CareLevel = AssistantResponse["careLevel"];

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  careLevel?: CareLevel;
  possibleCause?: string;
  questions?: string[];
};

// The server keeps the last 12 turns of at most 1,000 characters each.
const HISTORY_ITEMS = 12;
const HISTORY_ITEM_LENGTH = 1000;

/** Free-text AI health assistant: the person describes symptoms, the assistant suggests how soon to see a doctor. */
export function AiChatAssistant() {
  const { lang } = useLanguage();
  const t = AI_CHAT_COPY[lang] ?? AI_CHAT_COPY[DEFAULT_LANG];
  const executeCaptcha = useRecaptcha();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    endRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" });
  }, [messages, isSubmitting]);

  async function send() {
    const text = draft.trim();
    if (!text || isSubmitting) return;
    if (text.length > AI_CHAT_MAX_LENGTH) {
      setError(t.tooLong);
      return;
    }

    // Earlier turns only; the new message travels as `symptoms`.
    const history = messages
      .slice(-HISTORY_ITEMS)
      .map(({ role, content }) => ({ role, content: content.slice(0, HISTORY_ITEM_LENGTH) }));

    setError("");
    setIsSubmitting(true);
    setMessages((current) => [...current, { id: nextId.current++, role: "user", content: text }]);
    setDraft("");

    try {
      const captchaToken = await executeCaptcha("health_assistant");
      const response = await fetch("/api/health-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: text, history, lang, captchaToken }),
      });
      if (!response.ok) {
        // Server errors are written in English; the person always sees a message in their language.
        setError(response.status === 429 ? t.errors.busy : response.status === 503 ? t.errors.unavailable : t.errors.generic);
        return;
      }
      const data = (await response.json()) as AssistantResponse;
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: "assistant",
          content: data.message,
          careLevel: data.careLevel,
          possibleCause: data.possibleCause,
          questions: Array.isArray(data.questions) ? data.questions.filter(Boolean) : [],
        },
      ]);
    } catch (caught) {
      setError(captchaErrorMessage(caught, t.errors.generic));
    } finally {
      setIsSubmitting(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send();
  }

  // Enter sends, Shift+Enter starts a new line.
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send();
    }
  }

  function startOver() {
    setMessages([]);
    setDraft("");
    setError("");
    inputRef.current?.focus();
  }

  return (
    <main id="main-content" className="flex-1 pt-2 pb-10 sm:pt-3 sm:pb-14">
      <Container>
        <AssistantNavigation />
        <PageHeader title={t.title} lead={t.lead} />

        <section
          aria-label={t.title}
          className="mt-5 max-w-4xl min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-(--shadow-card-rest) sm:mt-6 dark:border-ink-800"
        >
          <div className="space-y-5 p-5 sm:p-7" aria-live="polite" aria-busy={isSubmitting}>
            <AssistantBubble label={t.assistant} text={t.welcome} />

            {messages.map((message) =>
              message.role === "user" ? (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-sapphire px-4 py-3 text-body text-white">
                    <span className="sr-only">{t.you}: </span>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ) : (
                <div key={message.id} className="space-y-3">
                  <AssistantBubble label={t.assistant} text={message.content} />
                  {message.careLevel && (
                    <div className={message.careLevel === "emergency" ? dangerPanel : "rounded-xl border border-border p-4 sm:p-5 dark:border-ink-800"}>
                      <p className="text-meta font-medium text-muted-foreground">{t.careLevelLabel}</p>
                      <p className="mt-1 text-body font-semibold text-foreground">{t.careLevels[message.careLevel]}</p>
                      {message.possibleCause && (
                        <>
                          <p className="mt-3 text-meta font-medium text-muted-foreground">{t.possibleCause}</p>
                          <p className="mt-1 text-body text-foreground">{message.possibleCause}</p>
                        </>
                      )}
                      {message.questions && message.questions.length > 0 && (
                        <>
                          <p className="mt-3 text-meta font-medium text-muted-foreground">{t.questionsHeading}</p>
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-body text-foreground">
                            {message.questions.map((question) => (
                              <li key={question}>{question}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      {message.careLevel === "emergency" && (
                        <div className="mt-4">
                          <Button href="tel:112" variant="primary" size="lg">
                            <span className="whitespace-nowrap">{t.call112}</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ),
            )}

            {isSubmitting && <p className="text-body text-muted-foreground">{t.thinking}</p>}
            <div ref={endRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-border p-5 sm:p-7 dark:border-ink-800">
            <label htmlFor="ai-chat-input" className="text-body font-semibold text-foreground">
              {t.inputLabel}
            </label>
            <textarea
              id="ai-chat-input"
              ref={inputRef}
              rows={3}
              value={draft}
              maxLength={AI_CHAT_MAX_LENGTH}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              aria-describedby="ai-chat-disclaimer"
              className={`${textInput} mt-2 resize-y`}
            />
            {error && (
              <p role="alert" className="mt-3 text-body text-primary">
                {error}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button type="submit" variant="action" size="lg" disabled={isSubmitting || !draft.trim()}>
                <span className="whitespace-nowrap">{isSubmitting ? t.thinking : t.send}</span>
              </Button>
              {messages.length > 0 && (
                <Button type="button" variant="outline" size="lg" onClick={startOver} disabled={isSubmitting}>
                  <span className="whitespace-nowrap">{t.newChat}</span>
                </Button>
              )}
            </div>
            <p id="ai-chat-disclaimer" className="mt-4 text-meta text-muted-foreground">
              {t.disclaimer}
            </p>
            <p className="mt-2 text-meta text-foreground">{t.emergencyNote}</p>
          </form>
        </section>
      </Container>
    </main>
  );
}

function AssistantBubble({ label, text }: { label: string; text: string }) {
  return (
    <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-muted/60 px-4 py-3 text-body text-foreground dark:bg-ink-800/60">
      <span className="sr-only">{label}: </span>
      <p className="whitespace-pre-wrap">{text}</p>
    </div>
  );
}
