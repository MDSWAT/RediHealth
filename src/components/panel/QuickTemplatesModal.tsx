"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { REQUEST_LANG_HEADER } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import type { MedicalHelpRequestItem } from "@/lib/types/medical-request";
import { usePanelRuntime } from "./PanelRuntime";
import { helpReplyContent, type ReplyTemplateId } from "@/lib/i18n/email-translations";

interface QuickTemplatesModalProps {
  request: MedicalHelpRequestItem;
  onClose: () => void;
}

type ModalCopy = {
  title: string;
  sendErr: string;
  copyErr: string;
  sendEmail: string;
  sending: string;
  sent: string;
  copied: string;
  copyBody: string;
  close: string;
  t1: string;
  t2: string;
  t3: string;
};

const MODAL_COPY: Record<Lang, ModalCopy> = {
  en: {
    title: "Email templates",
    sendErr: "Could not send the email.",
    copyErr: "Could not copy text.",
    sendEmail: "Send email",
    sending: "Sending…",
    sent: "Sent",
    copied: "Copied",
    copyBody: "Copy text",
    close: "Close",
    t1: "Request received",
    t2: "Call or visit",
    t3: "Where to get care",
  },
  ro: {
    title: "Șabloane de email",
    sendErr: "Emailul nu a putut fi trimis.",
    copyErr: "Textul nu a putut fi copiat.",
    sendEmail: "Trimite email",
    sending: "Se trimite…",
    sent: "Trimis",
    copied: "Copiat",
    copyBody: "Copiază textul",
    close: "Închide",
    t1: "Solicitare primită",
    t2: "Apel sau vizită",
    t3: "Unde găsești îngrijire",
  },
  sq: {
    title: "Modele emaili",
    sendErr: "Emaili nuk u dërgua.",
    copyErr: "Teksti nuk u kopjua.",
    sendEmail: "Dërgo email",
    sending: "Duke dërguar…",
    sent: "Dërguar",
    copied: "U kopjua",
    copyBody: "Kopjo tekstin",
    close: "Mbyll",
    t1: "Kërkesa u mor",
    t2: "Telefonatë ose vizitë",
    t3: "Ku të marrësh kujdes",
  },
  it: {
    title: "Modelli di email",
    sendErr: "Impossibile inviare l'email.",
    copyErr: "Impossibile copiare il testo.",
    sendEmail: "Invia email",
    sending: "Invio…",
    sent: "Inviata",
    copied: "Copiata",
    copyBody: "Copia testo",
    close: "Chiudi",
    t1: "Richiesta ricevuta",
    t2: "Chiamata o visita",
    t3: "Dove trovare cure",
  },
  hr: {
    title: "Predlošci emailova",
    sendErr: "Slanje emaila nije uspjelo.",
    copyErr: "Kopiranje teksta nije uspjelo.",
    sendEmail: "Pošalji email",
    sending: "Slanje…",
    sent: "Poslano",
    copied: "Kopirano",
    copyBody: "Kopiraj tekst",
    close: "Zatvori",
    t1: "Zahtjev primljen",
    t2: "Poziv ili posjet",
    t3: "Kamo otići na pregled",
  },
  rom: {
    title: "Shablonurya emailoske",
    sendErr: "Nashti bichhaldo o email.",
    copyErr: "O teksto nashti kopisardilo.",
    sendEmail: "Bichhal email",
    sending: "Bichhalel…",
    sent: "Bichhaldo",
    copied: "Kopisardo",
    copyBody: "Kopisar o teksto",
    close: "Phandav",
    t1: "Mangimos lino",
    t2: "Telefono vay vizita",
    t3: "Kaj te zhal vash zhutimos",
  },
  ru: {
    title: "Шаблоны электронных писем",
    sendErr: "Не удалось отправить письмо.",
    copyErr: "Не удалось скопировать текст.",
    sendEmail: "Отправить письмо",
    sending: "Отправка…",
    sent: "Отправлено",
    copied: "Скопировано",
    copyBody: "Копировать текст",
    close: "Закрыть",
    t1: "Запрос получен",
    t2: "Звонок или визит",
    t3: "Куда обратиться",
  },
};

export function QuickTemplatesModal({ request, onClose }: QuickTemplatesModalProps) {
  const { lang } = useLanguage();
  const { request: fetch } = usePanelRuntime();
  const ui = MODAL_COPY[lang];

  const templates: { id: ReplyTemplateId; title: string; body: string }[] = (
    [
      { id: "acknowledgment", title: ui.t1 },
      { id: "consultation", title: ui.t2 },
      { id: "referral", title: ui.t3 },
    ] satisfies { id: ReplyTemplateId; title: string }[]
  ).map((template) => ({
    ...template,
    body: helpReplyContent({
      templateId: template.id,
      name: request.full_name ?? "",
      phone: request.phone,
      description: request.description,
      lang,
    }).text,
  }));

  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const copyTimerRef = useRef<number | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<ReplyTemplateId | null>(null);
  const [sendingId, setSendingId] = useState<ReplyTemplateId | null>(null);
  const [sentIds, setSentIds] = useState<Partial<Record<ReplyTemplateId, boolean>>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSending = sendingId !== null;
  const activeTemplate = templates[activeIndex];
  const isActiveSent = Boolean(sentIds[activeTemplate.id]);
  const isActiveCopied = copiedId === activeTemplate.id;

  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSending) {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((element) => element.getClientRects().length > 0);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, isSending]);

  function selectTab(nextIndex: number, moveFocus = false) {
    setActiveIndex(nextIndex);
    setErrorMessage(null);
    if (moveFocus) tabRefs.current[nextIndex]?.focus();
  }

  async function copyToClipboard(text: string, templateId: ReplyTemplateId) {
    setErrorMessage(null);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(templateId);
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => {
        setCopiedId((current) => (current === templateId ? null : current));
        copyTimerRef.current = null;
      }, 2400);
    } catch {
      setErrorMessage(ui.copyErr);
    }
  }

  async function sendTemplate(templateId: ReplyTemplateId) {
    setSendingId(templateId);
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

      setSentIds((current) => ({ ...current, [templateId]: true }));
    } catch {
      setErrorMessage(ui.sendErr);
    } finally {
      setSendingId(null);
    }
  }

  return (
    <div
      className="panel-scrim fixed inset-0 z-50 flex items-end justify-center bg-[#0b132b]/70 p-0 sm:items-center sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSending) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="app-sheet-slide-up care-panel-bottom-bar relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-[var(--panel-surface)] text-[var(--panel-ink)] shadow-[0_24px_80px_rgba(11,19,43,0.28)] dark:ring-1 dark:ring-[var(--panel-line)] sm:max-h-[88dvh] sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--panel-line)] px-5 pb-4 pt-5 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold tracking-[-0.015em] text-[var(--panel-ink)]">
              {ui.title}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-[var(--panel-muted)]">
              {request.full_name && (
                <span className="font-medium text-[var(--panel-ink)]">{request.full_name}</span>
              )}
              {request.email && (
                <a
                  href={`mailto:${request.email}`}
                  className="inline-flex min-h-11 items-center break-all text-primary underline underline-offset-3 dark:text-[#bad7fa] dark:decoration-[#bad7fa]/50"
                >
                  {request.email}
                </a>
              )}
              {request.phone && (
                <a
                  href={`tel:${request.phone}`}
                  className="inline-flex min-h-11 items-center font-display tabular-nums text-primary underline underline-offset-3 dark:text-[#bad7fa] dark:decoration-[#bad7fa]/50"
                >
                  {request.phone}
                </a>
              )}
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            disabled={isSending}
            onClick={onClose}
            aria-label={ui.close}
            className="flex h-11 w-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg text-[var(--panel-muted)] transition-colors hover:bg-[var(--panel-selection)] hover:text-[var(--panel-ink)] disabled:opacity-50"
          >
            <CloseIcon aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div
          role="tablist"
          aria-labelledby={titleId}
          className="flex shrink-0 flex-nowrap gap-5 overflow-x-auto border-b border-[var(--panel-line)] px-5 sm:px-6"
        >
          {templates.map((template, index) => {
            const isSelected = index === activeIndex;
            return (
              <button
                key={template.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                id={`${titleId}-tab-${template.id}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={`${titleId}-panel-${template.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => selectTab(index)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    selectTab((index + 1) % templates.length, true);
                  } else if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    selectTab((index - 1 + templates.length) % templates.length, true);
                  } else if (event.key === "Home") {
                    event.preventDefault();
                    selectTab(0, true);
                  } else if (event.key === "End") {
                    event.preventDefault();
                    selectTab(templates.length - 1, true);
                  }
                }}
                className={`relative inline-flex min-h-12 shrink-0 items-center whitespace-nowrap py-3 text-sm transition-colors ${
                  isSelected
                    ? "font-semibold text-primary dark:text-[#bad7fa]"
                    : "font-normal text-[var(--panel-muted)] hover:text-[var(--panel-ink)]"
                }`}
              >
                <span>{template.title}</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-primary transition-opacity dark:bg-[#bad7fa] ${
                    isSelected ? "opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {errorMessage && (
            <p
              className="crm-error mb-4 dark:!border-[#ffb4b4]/30 dark:!bg-[#b91c1c]/15 dark:!text-[#ffb4b4]"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          <div
            role="tabpanel"
            id={`${titleId}-panel-${activeTemplate.id}`}
            aria-labelledby={`${titleId}-tab-${activeTemplate.id}`}
            className="rounded-lg bg-[var(--panel-subtle)] p-4 dark:bg-[var(--panel-canvas)] sm:p-5"
          >
            <div className="max-w-[68ch] whitespace-pre-wrap font-sans text-sm leading-relaxed text-[var(--panel-ink)] [overflow-wrap:break-word]">
              {activeTemplate.body}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[var(--panel-line)] px-5 py-4 sm:px-6">
          <div className="min-h-5 text-sm font-medium text-primary dark:text-[#bad7fa]" role="status">
            {isActiveSent ? ui.sent : isActiveCopied ? ui.copied : ""}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={isSending}
              onClick={onClose}
              className="crm-button whitespace-nowrap"
            >
              {ui.close}
            </button>
            <button
              type="button"
              onClick={() => void copyToClipboard(activeTemplate.body, activeTemplate.id)}
              className="crm-button whitespace-nowrap"
            >
              {ui.copyBody}
            </button>
            <button
              type="button"
              disabled={isSending || !request.email}
              onClick={() => void sendTemplate(activeTemplate.id)}
              className="crm-button crm-primary whitespace-nowrap disabled:!border-[#9aa9bc] disabled:!bg-[var(--panel-subtle)] disabled:!text-[#4b5c70] dark:disabled:!border-[#566b85] dark:disabled:!bg-[var(--panel-subtle)] dark:disabled:!text-[#b8c6d6]"
            >
              {sendingId === activeTemplate.id ? ui.sending : ui.sendEmail}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
