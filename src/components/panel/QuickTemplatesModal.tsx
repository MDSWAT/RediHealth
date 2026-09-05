"use client";

import { useState } from "react";
import { CheckCircleIcon, CloseIcon, CopyIcon, MailIcon, PhoneIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { MedicalHelpRequestItem } from "@/lib/types/medical-request";

interface QuickTemplatesModalProps {
  request: MedicalHelpRequestItem;
  onClose: () => void;
}

export function QuickTemplatesModal({ request, onClose }: QuickTemplatesModalProps) {
  const { lang } = useLanguage();
  const nameFallback = {
    en: "Valued Customer",
    ro: "Stimate pacient",
    sq: "I nderuar pacient",
    it: "Gentile paziente",
  }[lang];
  const ui = {
    en: {
      title: "Quick Communication Templates",
      subtitle: "Pre-formatted messages for",
      email: "Email",
      call: "Call",
      sendErr: "We could not send the email.",
      sendEmail: "Send Email",
      sending: "Sending...",
      sent: "Sent",
      copied: "Copied",
      copyBody: "Copy Body",
      close: "Close",
      t1: "1. Acknowledgment & Contact Pending",
      t2: "2. Appointment / Consultation Options",
      t3: "3. Referral & Direct Contact Info",
    },
    ro: {
      title: "Sabloane rapide de comunicare",
      subtitle: "Mesaje preformatate pentru",
      email: "Email",
      call: "Apel",
      sendErr: "Nu am putut trimite emailul.",
      sendEmail: "Trimite email",
      sending: "Se trimite...",
      sent: "Trimis",
      copied: "Copiat",
      copyBody: "Copiaza mesajul",
      close: "Inchide",
      t1: "1. Confirmare primire & contact in asteptare",
      t2: "2. Optiuni programare / consultatie",
      t3: "3. Trimitere si date de contact",
    },
    sq: {
      title: "Modele te shpejta komunikimi",
      subtitle: "Mesazhe te gatshme per",
      email: "Email",
      call: "Telefono",
      sendErr: "Nuk mund te dergonim emailin.",
      sendEmail: "Dergo email",
      sending: "Duke derguar...",
      sent: "Derguar",
      copied: "Kopjuar",
      copyBody: "Kopjo mesazhin",
      close: "Mbyll",
      t1: "1. Konfirmim marrjeje & kontakt ne pritje",
      t2: "2. Opsione takimi / konsultimi",
      t3: "3. Referim dhe informacion kontakti",
    },
    it: {
      title: "Modelli rapidi di comunicazione",
      subtitle: "Messaggi precompilati per",
      email: "Email",
      call: "Chiama",
      sendErr: "Non siamo riusciti a inviare l'email.",
      sendEmail: "Invia email",
      sending: "Invio in corso...",
      sent: "Inviata",
      copied: "Copiata",
      copyBody: "Copia testo",
      close: "Chiudi",
      t1: "1. Conferma ricezione e contatto in attesa",
      t2: "2. Opzioni appuntamento / consulenza",
      t3: "3. Invio e contatti utili",
    },
  }[lang];

  const templates = [
    {
      id: "acknowledgment",
      title: ui.t1,
      body: (req: MedicalHelpRequestItem) => {
        const name = req.full_name?.trim() || nameFallback;
        if (lang === "ro") {
          return `Buna, ${name},\n\nAm primit cererea ta de ajutor medical legata de: "${req.description.slice(0, 100)}...". Un lucrator de sprijin medical revizuieste cererea si te va suna in curand la ${req.phone}.\n\nCu stima,\nEchipa RediHealth`;
        }
        if (lang === "sq") {
          return `Pershendetje, ${name},\n\nKemi marre kerkesen tuaj per ndihme mjekesore ne lidhje me: "${req.description.slice(0, 100)}...". Nje punonjes shendetesor po e shqyrton kerkesen dhe do t'ju telefonoje se shpejti ne ${req.phone}.\n\nMe respekt,\nEkipi RediHealth`;
        }
        if (lang === "it") {
          return `Buongiorno ${name},\n\nAbbiamo ricevuto la tua richiesta di aiuto medico riguardo: "${req.description.slice(0, 100)}...". Un operatore sanitario sta esaminando la richiesta e ti chiamera presto al numero ${req.phone}.\n\nCordiali saluti,\nTeam RediHealth`;
        }
        return `Hello ${name},\n\nWe have received your medical help request regarding: "${req.description.slice(0, 100)}...". A healthcare support worker is reviewing your request and will call you at ${req.phone} shortly.\n\nBest regards,\nRediHealth Staff`;
      },
    },
    {
      id: "consultation",
      title: ui.t2,
      body: (req: MedicalHelpRequestItem) => {
        const name = req.full_name?.trim() || nameFallback;
        if (lang === "ro") {
          return `Buna, ${name},\n\nIti multumim ca ai contactat RediHealth. Pe baza solicitarii tale, putem programa un apel scurt sau te putem indruma catre o institutie medicala apropiata. Spune-ne te rugam cand iti este convenabil sa vorbim.\n\nTelefon contact: ${req.phone}\n\nCu stima,\nEchipa RediHealth`;
        }
        if (lang === "sq") {
          return `Pershendetje, ${name},\n\nFaleminderit qe kontaktuat RediHealth. Sipas kerkeses suaj, mund te planifikojme nje telefonate te shkurter ose t'ju drejtojme tek nje institucion mjekesor afer jush. Na njoftoni kur ju pershtatet te flasim.\n\nTelefon kontakti: ${req.phone}\n\nMe respekt,\nEkipi RediHealth`;
        }
        if (lang === "it") {
          return `Buongiorno ${name},\n\nGrazie per aver contattato RediHealth. In base alla tua richiesta, possiamo organizzare una breve chiamata o indirizzarti verso una struttura sanitaria vicina. Facci sapere quando preferisci essere contattato.\n\nTelefono di contatto: ${req.phone}\n\nCordiali saluti,\nTeam RediHealth`;
        }
        return `Hello ${name},\n\nThank you for reaching out to RediHealth. Based on your enquiry, we would like to schedule a quick call or direct you to a nearby health institute. Please let us know your preferred time to speak.\n\nContact phone: ${req.phone}\n\nBest regards,\nRediHealth Staff`;
      },
    },
    {
      id: "referral",
      title: ui.t3,
      body: (req: MedicalHelpRequestItem) => {
        const name = req.full_name?.trim() || nameFallback;
        if (lang === "ro") {
          return `Buna, ${name},\n\nIn legatura cu solicitarea ta, iti recomandam sa contactezi medicul de familie sau clinica locala. Daca ai nevoie de ajutor pentru a gasi institutii medicale in zona ta, foloseste harta noastra la https://redihealth.org/find-help.\n\nCu stima,\nEchipa RediHealth`;
        }
        if (lang === "sq") {
          return `Pershendetje, ${name},\n\nLidhur me kerkesen tuaj, ju rekomandojme te kontaktoni mjekun e familjes ose kliniken lokale. Nese ju duhet ndihme per te gjetur institucione mjekesore ne zonen tuaj, perdorni harten tone ne https://redihealth.org/find-help.\n\nMe respekt,\nEkipi RediHealth`;
        }
        if (lang === "it") {
          return `Buongiorno ${name},\n\nIn merito alla tua richiesta, ti consigliamo di contattare il tuo medico di base o la clinica locale. Se hai bisogno di aiuto per trovare strutture mediche nella tua zona, consulta la nostra mappa su https://redihealth.org/find-help.\n\nCordiali saluti,\nTeam RediHealth`;
        }
        return `Hello ${name},\n\nRegarding your enquiry, we recommend contacting your primary healthcare provider or local clinic. If you need assistance finding medical institutes in your area, please visit our Find Help map at https://redihealth.org/find-help.\n\nBest regards,\nRediHealth Staff`;
      },
    },
  ];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {ui.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {ui.subtitle} {request.full_name || request.email}
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
            <span>{ui.email}: {request.email}</span>
          </a>
          <a
            href={`tel:${request.phone}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 font-medium text-foreground hover:bg-muted"
          >
            <PhoneIcon className="h-4 w-4 text-primary" />
            <span>{ui.call}: {request.phone}</span>
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
                      <span>{isSending ? ui.sending : isSent ? ui.sent : ui.sendEmail}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bodyText, idx)}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      {isCopied ? (
                        <>
                          <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400">{ui.copied}</span>
                        </>
                      ) : (
                        <>
                          <CopyIcon className="h-3.5 w-3.5" />
                          <span>{ui.copyBody}</span>
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
            {ui.close}
          </button>
        </div>
      </div>
    </div>
  );
}
