"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckCircleIcon, CloseIcon, CopyIcon, MailIcon, PhoneIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { REQUEST_LANG_HEADER } from "@/lib/i18n/routing";
import type { MedicalHelpRequestItem } from "@/lib/types/medical-request";
import { usePanelRuntime } from "./PanelRuntime";
import { helpReplyContent, type ReplyTemplateId } from "@/lib/i18n/email-translations";

interface QuickTemplatesModalProps {
  request: MedicalHelpRequestItem;
  onClose: () => void;
}

export function QuickTemplatesModal({ request, onClose }: QuickTemplatesModalProps) {
  const { lang } = useLanguage();
  const { request: fetch } = usePanelRuntime();
  const ui = {
  ru: {
      title: "Шаблоны электронных писем",
      subtitle: "Готовые сообщения для",
      email: "Email",
      call: "Позвонить",
      sendErr: "Не удалось отправить письмо.",
      sendEmail: "Отправить письмо",
      sending: "Отправка...",
      sent: "Отправлено",
      copied: "Скопировано",
      copyBody: "Копировать текст",
      close: "Закрыть",
      t1: "Мы получили ваш запрос",
      t2: "Предложите позвонить или посетить",
      t3: "Куда обратиться за уходом",
    },

    en: {
      title: "Email templates",
      subtitle: "Ready messages for",
      email: "Email",
      call: "Call",
      sendErr: "Could not send the email.",
      sendEmail: "Send email",
      sending: "Sending...",
      sent: "Sent",
      copied: "Copied",
      copyBody: "Copy text",
      close: "Close",
      t1: "We got your request",
      t2: "Offer a call or a visit",
      t3: "Where to go for care",
    },
    ro: {
      title: "Șabloane de email",
      subtitle: "Mesaje gata scrise pentru",
      email: "Email",
      call: "Sună",
      sendErr: "Emailul nu a putut fi trimis.",
      sendEmail: "Trimite email",
      sending: "Se trimite...",
      sent: "Trimis",
      copied: "Copiat",
      copyBody: "Copiază textul",
      close: "Închide",
      t1: "Am primit solicitarea",
      t2: "Propune un apel sau o vizită",
      t3: "Unde să meargă pentru îngrijire",
    },
    sq: {
      title: "Modele emaili",
      subtitle: "Mesazhe të gatshme për",
      email: "Email",
      call: "Telefono",
      sendErr: "Emaili nuk u dërgua.",
      sendEmail: "Dërgo email",
      sending: "Duke dërguar...",
      sent: "Dërguar",
      copied: "U kopjua",
      copyBody: "Kopjo tekstin",
      close: "Mbyll",
      t1: "E morëm kërkesën",
      t2: "Propozo telefonatë ose vizitë",
      t3: "Ku të shkojë për kujdes",
    },
    it: {
      title: "Modelli di email",
      subtitle: "Messaggi pronti per",
      email: "Email",
      call: "Chiama",
      sendErr: "Impossibile inviare l'email.",
      sendEmail: "Invia email",
      sending: "Invio...",
      sent: "Inviata",
      copied: "Copiata",
      copyBody: "Copia testo",
      close: "Chiudi",
      t1: "Abbiamo ricevuto la richiesta",
      t2: "Proponi una chiamata o una visita",
      t3: "Dove andare per le cure",
    },
    hr: {
      title: "Predlošci emailova",
      subtitle: "Spremne poruke za",
      email: "Email",
      call: "Nazovi",
      sendErr: "Slanje emaila nije uspjelo.",
      sendEmail: "Pošalji email",
      sending: "Slanje...",
      sent: "Poslano",
      copied: "Kopirano",
      copyBody: "Kopiraj tekst",
      close: "Zatvori",
      t1: "Primili smo tvoj zahtjev",
      t2: "Ponudi poziv ili posjet",
      t3: "Kamo otići na pregled",
    },
    rom: {
      title: "Shablonurya emailoske",
      subtitle: "Gata mesazhurya vash",
      email: "Email",
      call: "Akhar",
      sendErr: "Nashti bichhaldo o email.",
      sendEmail: "Bichhal email",
      sending: "Bichhalel...",
      sent: "Bichhaldo",
      copied: "Kopisardo",
      copyBody: "Kopisar o teksto",
      close: "Phandav",
      t1: "Liyam cho mangimos",
      t2: "Phen ekh telefono vay vizita",
      t3: "Kaj te zhal vash sastipnasko zhutimos",
    },
  }[lang];

  const templates = ([
    {id: "acknowledgment", title: ui.t1},
    {id: "consultation", title: ui.t2},
    {id: "referral", title: ui.t3},
  ] satisfies {id: ReplyTemplateId; title: string}[]).map(template => ({...template, body: (req: MedicalHelpRequestItem) => helpReplyContent({templateId: template.id, name: req.full_name ?? "", phone: req.phone, description: req.description, lang}).text}));

  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement;
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) { if (event.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [onClose]);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [sendingIndex, setSendingIndex] = useState<number | null>(null);
  const [sentIndex, setSentIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function copyToClipboard(text: string, index: number) {
    void navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  async function sendTemplate(templateId: string, index: number) {
    setSendingIndex(index);
    setSentIndex(null);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/medical-help-requests/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json", [REQUEST_LANG_HEADER]: lang },
        body: JSON.stringify({ requestId: request.id, templateId }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setErrorMessage(result.error || ui.sendErr);
        return;
      }

      setSentIndex(index);
    } catch {
      setErrorMessage(ui.sendErr);
    } finally {
      setSendingIndex(null);
    }
  }

  return (
    <div className="panel-scrim fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 p-0 sm:p-4">
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="app-sheet-slide-up relative w-full max-w-2xl rounded-t-xl sm:rounded-xl border-t sm:border border-border bg-card p-5 sm:p-6 shadow-xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto care-panel-bottom-bar">
        {/* Mobile bottom sheet drag handle */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border sm:hidden" />
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 id={titleId} className="text-base font-bold text-foreground sm:text-lg">
              {ui.title}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {ui.subtitle} <span className="font-semibold text-foreground">{request.full_name || request.email}</span>
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={ui.close}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <CloseIcon aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <a
            href={`mailto:${request.email}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-1.5 font-medium text-foreground hover:bg-muted transition-colors"
          >
            <MailIcon className="h-4 w-4 text-primary" />
            <span>{ui.email}: {request.email}</span>
          </a>
          <a
            href={`tel:${request.phone}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-1.5 font-medium text-foreground hover:bg-muted transition-colors"
          >
            <PhoneIcon className="h-4 w-4 text-primary" />
            <span>{ui.call}: {request.phone}</span>
          </a>
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-2 divide-y divide-border">
          {templates.map((tmpl, idx) => {
            const bodyText = tmpl.body(request);
            const isCopied = copiedIndex === idx;
            const isSending = sendingIndex === idx;
            const isSent = sentIndex === idx;

            return (
              <section key={tmpl.id} aria-labelledby={`${titleId}-${tmpl.id}`} className="py-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h3 id={`${titleId}-${tmpl.id}`} className="text-sm font-semibold text-foreground">
                    {tmpl.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isSending}
                      onClick={() => void sendTemplate(tmpl.id, idx)}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground shadow-2xs transition-colors"
                    >
                      {isSent ? <CheckCircleIcon className="h-3.5 w-3.5" /> : <MailIcon className="h-3.5 w-3.5" />}
                      <span>{isSending ? ui.sending : isSent ? ui.sent : ui.sendEmail}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bodyText, idx)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      {isCopied ? (
                        <>
                          <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{ui.copied}</span>
                        </>
                      ) : (
                        <>
                          <CopyIcon className="h-3.5 w-3.5 text-primary" />
                          <span>{ui.copyBody}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3.5 font-sans text-xs leading-relaxed text-foreground/80">
                  {bodyText}
                </pre>
              </section>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            {ui.close}
          </button>
        </div>
      </div>
    </div>
  );
}
