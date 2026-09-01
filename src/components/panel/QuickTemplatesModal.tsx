"use client";

import { useState } from "react";
import { CheckCircleIcon, CloseIcon, CopyIcon, MailIcon, PhoneIcon } from "@/components/ui/icons";
import type { MedicalHelpRequestItem } from "@/lib/types/medical-request";

interface QuickTemplatesModalProps {
  request: MedicalHelpRequestItem;
  onClose: () => void;
}

const templates = [
  {
    id: "acknowledgment",
    title: "1. Acknowledgment & Contact Pending",
    subject: "RediHealth: Medical Request Received",
    body: (req: MedicalHelpRequestItem) =>
      `Hello ${req.full_name?.trim() || "Valued Customer"},\n\nWe have received your medical help request regarding: "${req.description.slice(0, 100)}...". A healthcare support worker is reviewing your request and will call you at ${req.phone} shortly.\n\nBest regards,\nRediHealth Staff`,
  },
  {
    id: "consultation",
    title: "2. Appointment / Consultation Options",
    subject: "RediHealth: Support Consultation Options",
    body: (req: MedicalHelpRequestItem) =>
      `Hello ${req.full_name?.trim() || "Valued Customer"},\n\nThank you for reaching out to RediHealth. Based on your enquiry, we would like to schedule a quick call or direct you to a nearby health institute. Please let us know your preferred time to speak.\n\nContact phone: ${req.phone}\n\nBest regards,\nRediHealth Staff`,
  },
  {
    id: "referral",
    title: "3. Referral & Direct Contact Info",
    subject: "RediHealth: Help & Next Steps",
    body: (req: MedicalHelpRequestItem) =>
      `Hello ${req.full_name?.trim() || "Valued Customer"},\n\nRegarding your enquiry, we recommend contacting your primary healthcare provider or local clinic. If you need assistance finding medical institutes in your area, please visit our Find Help map at https://redihealth.org/find-help.\n\nBest regards,\nRediHealth Staff`,
  },
];

export function QuickTemplatesModal({ request, onClose }: QuickTemplatesModalProps) {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: request.id, templateId }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setErrorMessage(result.error || "We could not send the email.");
        return;
      }

      setSentIndex(index);
    } catch {
      setErrorMessage("We could not send the email.");
    } finally {
      setSendingIndex(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Quick Communication Templates
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pre-formatted messages for {request.full_name || request.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <a
            href={`mailto:${request.email}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 font-medium text-foreground hover:bg-muted"
          >
            <MailIcon className="h-4 w-4 text-primary" />
            <span>Email: {request.email}</span>
          </a>
          <a
            href={`tel:${request.phone}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 font-medium text-foreground hover:bg-muted"
          >
            <PhoneIcon className="h-4 w-4 text-primary" />
            <span>Call: {request.phone}</span>
          </a>
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6 space-y-4">
          {templates.map((tmpl, idx) => {
            const bodyText = tmpl.body(request);
            const isCopied = copiedIndex === idx;
            const isSending = sendingIndex === idx;
            const isSent = sentIndex === idx;

            return (
              <div
                key={tmpl.title}
                className="rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">
                    {tmpl.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isSending}
                      onClick={() => void sendTemplate(tmpl.id, idx)}
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
                    >
                      {isSent ? <CheckCircleIcon className="h-3.5 w-3.5" /> : <MailIcon className="h-3.5 w-3.5" />}
                      <span>{isSending ? "Sending..." : isSent ? "Sent" : "Send Email"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bodyText, idx)}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      {isCopied ? (
                        <>
                          <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <CopyIcon className="h-3.5 w-3.5" />
                          <span>Copy Body</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap rounded-lg border border-border/60 bg-card p-3 font-sans text-xs leading-relaxed text-muted-foreground">
                  {bodyText}
                </pre>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
