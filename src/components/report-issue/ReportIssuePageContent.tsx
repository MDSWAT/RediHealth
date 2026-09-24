"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AlertCircleIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/language-context";

type Copy = {
  title: string;
  subtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  issueLabel: string;
  issuePlaceholder: string;
  send: string;
  sending: string;
  success: string;
  genericError: string;
  detailError: string;
};

const copyByLang: Record<"en" | "ro" | "sq" | "it", Copy> = {
  en: {
    title: "Report an issue",
    subtitle: "Tell us what happened and we will send it to our team for investigation.",
    emailLabel: "Your email (optional)",
    emailPlaceholder: "you@example.com",
    issueLabel: "Issue details",
    issuePlaceholder: "Describe what happened, what you expected, and what happened instead.",
    send: "Send report",
    sending: "Sending...",
    success: "Thanks. Your issue was sent successfully.",
    genericError: "We could not send your issue. Please try again.",
    detailError: "Please include at least 10 characters so we can investigate.",
  },
  ro: {
    title: "Raportează o problemă",
    subtitle: "Spune-ne ce s-a întâmplat și vom trimite sesizarea echipei noastre pentru investigație.",
    emailLabel: "Emailul tău (opțional)",
    emailPlaceholder: "tu@exemplu.com",
    issueLabel: "Detalii problemă",
    issuePlaceholder: "Descrie ce s-a întâmplat, ce te așteptai și ce s-a întâmplat în schimb.",
    send: "Trimite raportul",
    sending: "Se trimite...",
    success: "Mulțumim. Problema a fost trimisă cu succes.",
    genericError: "Nu am putut trimite problema. Te rugăm să încerci din nou.",
    detailError: "Te rugăm să scrii cel puțin 10 caractere pentru a putea investiga.",
  },
  sq: {
    title: "Raporto një problem",
    subtitle: "Na tregoni çfarë ndodhi dhe ne do t'ia dërgojmë ekipit për hetim.",
    emailLabel: "Emaili juaj (opsional)",
    emailPlaceholder: "ju@shembull.com",
    issueLabel: "Detajet e problemit",
    issuePlaceholder: "Përshkruani çfarë ndodhi, çfarë prisnit dhe çfarë ndodhi në vend të kësaj.",
    send: "Dërgo raportin",
    sending: "Duke u dërguar...",
    success: "Faleminderit. Problemi u dërgua me sukses.",
    genericError: "Nuk mundëm ta dërgojmë problemin. Ju lutemi provoni përsëri.",
    detailError: "Ju lutemi shkruani të paktën 10 karaktere që të mund të hetojmë.",
  },
  it: {
    title: "Segnala un problema",
    subtitle: "Raccontaci cosa è successo e lo invieremo al nostro team per la verifica.",
    emailLabel: "La tua email (opzionale)",
    emailPlaceholder: "tu@esempio.com",
    issueLabel: "Dettagli del problema",
    issuePlaceholder: "Descrivi cosa è successo, cosa ti aspettavi e cosa è successo invece.",
    send: "Invia segnalazione",
    sending: "Invio in corso...",
    success: "Grazie. La segnalazione è stata inviata con successo.",
    genericError: "Non siamo riusciti a inviare la segnalazione. Riprova.",
    detailError: "Inserisci almeno 10 caratteri per consentirci di verificare.",
  },
};

export function ReportIssuePageContent() {
  const { lang } = useLanguage();
  const t = useMemo(() => copyByLang[lang], [lang]);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (message.trim().length < 10) {
      setError(t.detailError);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/report-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim(),
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error || t.genericError);
        return;
      }

      setEmail("");
      setMessage("");
      setSuccess(t.success);
    } catch {
      setError(t.genericError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <AlertCircleIcon className="h-6 w-6" />
          </span>
          <SectionHeading as="h1" className="mt-5 max-w-none" title={t.title} subtitle={t.subtitle} />
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">{t.emailLabel}</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">{t.issueLabel}</label>
              <textarea
                required
                minLength={10}
                rows={8}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={t.issuePlaceholder}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
            {success ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t.sending : t.send}
              </Button>
            </div>
          </form>
        </Container>
      </section>
    </main>
  );
}
