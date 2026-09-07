"use client";

import { useRef, useState } from "react";
import { CheckCircleIcon, FileTextIcon, ImageIcon } from "@/components/ui/icons";
import { AssistantNavigation } from "@/components/health-assistant/AssistantNavigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { useLanguage } from "@/lib/i18n/language-context";

type ReviewResponse = { message: string; prescriptionText?: string };

export function PrescriptionReview() {
  const { lang } = useLanguage();
  const t = {
    en: {
      chooseImageErr: "Choose a JPEG, PNG, or WebP image smaller than 8 MB.",
      uploadReqErr: "Upload a prescription image to continue.",
      readErr: "We could not read that image.",
      reviewErr: "We could not review that prescription.",
      title: "Prescription review",
      subtitle: "AI-assisted transcription for clinician discussion",
      previewAlt: "Prescription preview",
      uploadPhoto: "Upload prescription photo",
      uploadHint: "JPEG, PNG or WebP, up to 8 MB",
      whyLabel: "Why was this prescribed?",
      whyHint: "This gives the assistant useful background without asking it to diagnose.",
      whyPh: "For example: I received this after a visit for a sore throat...",
      reviewing: "Reviewing...",
      reviewButton: "Review prescription",
      detected: "Prescription text detected",
      noText: "No text could be read clearly from this image.",
      confirm: "Confirm every medicine name, strength, and instruction with a pharmacist or clinician.",
    },
    ro: {
      chooseImageErr: "Alege o imagine JPEG, PNG sau WebP mai mica de 8 MB.",
      uploadReqErr: "Incarca o imagine a retetei pentru a continua.",
      readErr: "Nu am putut citi aceasta imagine.",
      reviewErr: "Nu am putut analiza aceasta reteta.",
      title: "Revizuire reteta",
      subtitle: "Transcriere asistata AI pentru discutia cu clinicianul",
      previewAlt: "Previzualizare reteta",
      uploadPhoto: "Incarca fotografia retetei",
      uploadHint: "JPEG, PNG sau WebP, pana la 8 MB",
      whyLabel: "De ce a fost prescrisa?",
      whyHint: "Ofera context util asistentului, fara a-i cere un diagnostic.",
      whyPh: "De exemplu: Am primit aceasta reteta dupa o consultatie pentru durere in gat...",
      reviewing: "Se analizeaza...",
      reviewButton: "Analizeaza reteta",
      detected: "Text detectat din reteta",
      noText: "Nu s-a putut citi clar textul din aceasta imagine.",
      confirm: "Confirma fiecare medicament, concentratie si instructiune cu farmacistul sau clinicianul.",
    },
    sq: {
      chooseImageErr: "Zgjidh nje imazh JPEG, PNG ose WebP me te vogel se 8 MB.",
      uploadReqErr: "Ngarko nje imazh te recetes per te vazhduar.",
      readErr: "Nuk mund ta lexonim kete imazh.",
      reviewErr: "Nuk mund ta shqyrtonim kete recete.",
      title: "Shqyrtim recete",
      subtitle: "Transkriptim i asistuar nga AI per diskutim me klinicistin",
      previewAlt: "Parapamje recete",
      uploadPhoto: "Ngarko foton e recetes",
      uploadHint: "JPEG, PNG ose WebP, deri ne 8 MB",
      whyLabel: "Pse u pershkrua kjo?",
      whyHint: "Kjo i jep asistentit kontekst te dobishem pa i kerkuar diagnoze.",
      whyPh: "Per shembull: E mora kete pas nje vizite per dhimbje fyti...",
      reviewing: "Duke shqyrtuar...",
      reviewButton: "Shqyrto receten",
      detected: "Tekst i zbuluar nga receta",
      noText: "Nuk u lexua qarte tekst nga kjo figure.",
      confirm: "Konfirmo cdo ilac, doze dhe udhezim me farmacistin ose klinicistin.",
    },
    it: {
      chooseImageErr: "Scegli un'immagine JPEG, PNG o WebP inferiore a 8 MB.",
      uploadReqErr: "Carica un'immagine della prescrizione per continuare.",
      readErr: "Non siamo riusciti a leggere questa immagine.",
      reviewErr: "Non siamo riusciti ad analizzare questa prescrizione.",
      title: "Revisione prescrizione",
      subtitle: "Trascrizione assistita da AI per il confronto con il clinico",
      previewAlt: "Anteprima prescrizione",
      uploadPhoto: "Carica foto prescrizione",
      uploadHint: "JPEG, PNG o WebP, fino a 8 MB",
      whyLabel: "Perche e stata prescritta?",
      whyHint: "Questo fornisce all'assistente un contesto utile senza chiedere una diagnosi.",
      whyPh: "Per esempio: L'ho ricevuta dopo una visita per mal di gola...",
      reviewing: "Analisi in corso...",
      reviewButton: "Analizza prescrizione",
      detected: "Testo della prescrizione rilevato",
      noText: "Nessun testo leggibile rilevato chiaramente in questa immagine.",
      confirm: "Conferma ogni farmaco, dosaggio e istruzione con un farmacista o clinico.",
    },
  }[lang];

  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [context, setContext] = useState("");
  const [result, setResult] = useState<ReviewResponse | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setError("");
    if (!selected) return;
    if (!selected.type.startsWith("image/") || selected.size > 8 * 1024 * 1024) {
      setFile(null);
      setPreview(null);
      setError(t.chooseImageErr);
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError(t.uploadReqErr);
      return;
    }
    setError("");
    setResult(null);
    setIsSubmitting(true);
    try {
      const prescription = await new Promise<{ mimeType: string; data: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = typeof reader.result === "string" ? reader.result : "";
          const data = dataUrl.split(",")[1];
          if (data) resolve({ mimeType: file.type, data });
          else reject(new Error(t.readErr));
        };
        reader.onerror = () => reject(new Error(t.readErr));
        reader.readAsDataURL(file);
      });
      const response = await fetch("/api/health-assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prescriptionContext: context, prescription, lang }) });
      const data = await response.json() as ReviewResponse & { error?: string };
      if (!response.ok) throw new Error(data.error ?? t.reviewErr);
      setResult(data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t.reviewErr);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main id="main-content" className="flex-1 bg-muted/40 py-8 sm:py-12">
      <Container><div className="mx-auto max-w-3xl"><AssistantNavigation />
        <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-5 sm:px-7"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary"><FileTextIcon className="h-5 w-5" /></span><div><h1 className="text-lg font-semibold text-foreground">{t.title}</h1><p className="text-sm text-muted-foreground">{t.subtitle}</p></div></div></div>
          <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-7">
            <input ref={fileInput} id="prescription" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="sr-only" />
            <button type="button" onClick={() => fileInput.current?.click()} className="flex min-h-60 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 p-5 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ImageIcon className="h-7 w-7 text-primary" />{preview ? <img src={preview} alt={t.previewAlt} className="h-36 max-w-full rounded border border-border object-contain" /> : <span>{t.uploadPhoto}</span>}<span className="text-xs font-normal text-muted-foreground">{t.uploadHint}</span></button>
            {file ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><FileTextIcon className="h-4 w-4 text-primary" /><span className="truncate">{file.name}</span></p> : null}
            <div><label className="text-sm font-semibold text-foreground" htmlFor="prescription-context">{t.whyLabel}</label><p className="mt-1 text-sm text-muted-foreground">{t.whyHint}</p><textarea id="prescription-context" rows={4} value={context} onChange={(event) => setContext(event.target.value)} placeholder={t.whyPh} className="mt-3 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
            {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
            <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? t.reviewing : t.reviewButton}</Button>
          </form>
          {result ? <div aria-live="polite" className="border-t border-border bg-primary-soft/40 p-5 sm:p-7"><h2 className="font-semibold text-foreground">{t.detected}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{result.prescriptionText || t.noText}</p><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{result.message}</p><p className="mt-4 flex gap-2 text-xs leading-relaxed text-muted-foreground"><CheckCircleIcon className="h-4 w-4 flex-none text-primary" />{t.confirm}</p></div> : null}
        </section>
      </div></Container>
    </main>
  );
}