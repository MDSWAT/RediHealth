"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckCircleIcon, CloseIcon, CopyIcon, MailIcon, PhoneIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { REQUEST_LANG_HEADER } from "@/lib/i18n/routing";
import type { MedicalHelpRequestItem } from "@/lib/types/medical-request";
import { usePanelRuntime } from "./PanelRuntime";

interface QuickTemplatesModalProps {
  request: MedicalHelpRequestItem;
  onClose: () => void;
}

export function QuickTemplatesModal({ request, onClose }: QuickTemplatesModalProps) {
  const { lang } = useLanguage();
  const { request: fetch } = usePanelRuntime();
  // Greeting line: "Bună, Maria," or just "Bună," when the name is missing.
  const greet = (hello: string, name: string) => (name ? `${hello}, ${name},` : `${hello},`);
  // Quote the start of the request; add an ellipsis only when the text was actually cut.
  // A full stop follows the closing quote, so a trailing one inside the quote is dropped (never two full stops).
  const excerpt = (text: string) => (text.length > 100 ? `${text.slice(0, 100).trimEnd()}…` : text.trim().replace(/\.+$/, ""));
  const ui = {
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

  const templates = [
    {
      id: "acknowledgment",
      title: ui.t1,
      body: (req: MedicalHelpRequestItem) => {
        const name = req.full_name?.trim() || "";
        if (lang === "ro") {
          return `${greet("Bună", name)}\n\nAm primit mesajul tău: „${excerpt(req.description)}”. Un coleg din echipă îl citește acum și te sună în curând la ${req.phone}.\n\nToate cele bune,\nEchipa RediHealth`;
        }
        if (lang === "sq") {
          return `${greet("Përshëndetje", name)}\n\nE morëm mesazhin tënd: "${excerpt(req.description)}". Një koleg nga ekipi po e lexon dhe do të të telefonojë së shpejti në ${req.phone}.\n\nMe respekt,\nEkipi RediHealth`;
        }
        if (lang === "it") {
          return `${greet("Ciao", name)}\n\nAbbiamo ricevuto il tuo messaggio: «${excerpt(req.description)}». Un operatore lo sta leggendo e ti chiamerà presto al numero ${req.phone}.\n\nUn saluto,\nIl team RediHealth`;
        }
        if (lang === "hr") {
          return `${greet("Pozdrav", name)}\n\nPrimili smo tvoju poruku: „${excerpt(req.description)}”. Član našeg tima sada je čita i uskoro će te nazvati na broj ${req.phone}.\n\nSrdačan pozdrav,\nRediHealth tim`;
        }
        if (lang === "rom") {
          return `${greet("Mishto avilyan", name)}\n\nLiyam cho mesazho: „${excerpt(req.description)}”. Ekh manush katar amari ekipa drabarel les akana thaj sigo ka akharel tut pe ${req.phone}.\n\nSastipnasa,\nI ekipa RediHealth`;
        }
        return `${greet("Hello", name)}\n\nWe got your message: "${excerpt(req.description)}". Someone from our team is reading it now and will call you soon at ${req.phone}.\n\nBest wishes,\nThe RediHealth team`;
      },
    },
    {
      id: "consultation",
      title: ui.t2,
      body: (req: MedicalHelpRequestItem) => {
        const name = req.full_name?.trim() || "";
        if (lang === "ro") {
          return `${greet("Bună", name)}\n\nÎți mulțumim că ne-ai scris. Putem să te sunăm pentru o discuție scurtă sau să-ți spunem unde e cel mai apropiat medic. Scrie-ne când poți vorbi.\n\nTelefonul tău: ${req.phone}\n\nToate cele bune,\nEchipa RediHealth`;
        }
        if (lang === "sq") {
          return `${greet("Përshëndetje", name)}\n\nFaleminderit që na shkrove. Mund të të telefonojmë për një bisedë të shkurtër ose të të tregojmë mjekun më të afërt. Na shkruaj kur mund të flasësh.\n\nTelefoni yt: ${req.phone}\n\nMe respekt,\nEkipi RediHealth`;
        }
        if (lang === "it") {
          return `${greet("Ciao", name)}\n\nGrazie per averci scritto. Possiamo chiamarti per parlare un momento o dirti dov'è il medico più vicino. Scrivici quando puoi parlare.\n\nIl tuo telefono: ${req.phone}\n\nUn saluto,\nIl team RediHealth`;
        }
        if (lang === "hr") {
          return `${greet("Pozdrav", name)}\n\nHvala što si nam se javio. Možemo te nazvati na kratak razgovor ili ti reći gdje je najbliži obiteljski liječnik. Javi nam kada možeš razgovarati.\n\nTvoj telefon: ${req.phone}\n\nSrdačan pozdrav,\nRediHealth tim`;
        }
        if (lang === "rom") {
          return `${greet("Mishto avilyan", name)}\n\nNais tuke ke lekhardyan amenge. Shaj te akharas tut vash ekh kharno vakerimos vay te phenas tuke kaj si o may pashutno doktori. Lekhar amenge kana shaj te des duma.\n\nCho telefono: ${req.phone}\n\nSastipnasa,\nI ekipa RediHealth`;
        }
        return `${greet("Hello", name)}\n\nThank you for writing to us. We can call you for a short talk, or tell you where the nearest doctor is. Let us know when you can talk.\n\nYour phone: ${req.phone}\n\nBest wishes,\nThe RediHealth team`;
      },
    },
    {
      id: "referral",
      title: ui.t3,
      body: (req: MedicalHelpRequestItem) => {
        const name = req.full_name?.trim() || "";
        if (lang === "ro") {
          return `${greet("Bună", name)}\n\nPentru ce ne-ai scris, cel mai bine este să mergi la medicul de familie sau la clinica din zona ta. Găsești clinici și farmacii aproape de tine pe harta noastră: https://redihealth.org/find-help.\n\nToate cele bune,\nEchipa RediHealth`;
        }
        if (lang === "sq") {
          return `${greet("Përshëndetje", name)}\n\nPër atë që na shkrove, më mirë shko te mjeku i familjes ose te klinika në zonën tënde. Klinika dhe farmaci afër teje gjen në hartën tonë: https://redihealth.org/find-help.\n\nMe respekt,\nEkipi RediHealth`;
        }
        if (lang === "it") {
          return `${greet("Ciao", name)}\n\nPer quello che ci hai scritto, la cosa migliore è andare dal tuo medico di base o da una clinica della tua zona. Trovi cliniche e farmacie vicino a te sulla nostra mappa: https://redihealth.org/find-help.\n\nUn saluto,\nIl team RediHealth`;
        }
        if (lang === "hr") {
          return `${greet("Pozdrav", name)}\n\nZa ono o čemu si nam pisao najbolje je javiti se svom obiteljskom liječniku ili ambulanti u blizini. Klinike i ljekarne blizu tebe možeš pronaći na našoj karti: https://redihealth.org/find-help.\n\nSrdačan pozdrav,\nRediHealth tim`;
        }
        if (lang === "rom") {
          return `${greet("Mishto avilyan", name)}\n\nVash kodya so lekhardyan amenge, may mishto si te zhas ko cho familijako doktori vay ki klinika and-i chi zona. Arakhes klinike thaj farmaciye pasha tute pe amari mapa: https://redihealth.org/find-help.\n\nSastipnasa,\nI ekipa RediHealth`;
        }
        return `${greet("Hello", name)}\n\nFor what you wrote to us, it is best to see your family doctor or a local clinic. You can find clinics and pharmacies near you on our map: https://redihealth.org/find-help.\n\nBest wishes,\nThe RediHealth team`;
      },
    },
  ];

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
