"use client";

import { useRef, useState } from "react";
import { CheckCircleIcon, FileTextIcon, ImageIcon } from "@/components/ui/icons";
import { AssistantNavigation } from "@/components/health-assistant/AssistantNavigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type ReviewResponse = { message: string; prescriptionText?: string };

export function PrescriptionReview() {
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
      setError("Choose a JPEG, PNG, or WebP image smaller than 8 MB.");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Upload a prescription image to continue.");
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
          else reject(new Error("We could not read that image."));
        };
        reader.onerror = () => reject(new Error("We could not read that image."));
        reader.readAsDataURL(file);
      });
      const response = await fetch("/api/health-assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prescriptionContext: context, prescription }) });
      const data = await response.json() as ReviewResponse & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "We could not review that prescription.");
      setResult(data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "We could not review that prescription.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main id="main-content" className="flex-1 bg-muted/40 py-8 sm:py-12">
      <Container><div className="mx-auto max-w-3xl"><AssistantNavigation />
        <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-5 sm:px-7"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary"><FileTextIcon className="h-5 w-5" /></span><div><h1 className="text-lg font-semibold text-foreground">Prescription review</h1><p className="text-sm text-muted-foreground">AI-assisted transcription for clinician discussion</p></div></div></div>
          <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-7">
            <input ref={fileInput} id="prescription" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="sr-only" />
            <button type="button" onClick={() => fileInput.current?.click()} className="flex min-h-60 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 p-5 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ImageIcon className="h-7 w-7 text-primary" />{preview ? <img src={preview} alt="Prescription preview" className="h-36 max-w-full rounded border border-border object-contain" /> : <span>Upload prescription photo</span>}<span className="text-xs font-normal text-muted-foreground">JPEG, PNG or WebP, up to 8 MB</span></button>
            {file ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><FileTextIcon className="h-4 w-4 text-primary" /><span className="truncate">{file.name}</span></p> : null}
            <div><label className="text-sm font-semibold text-foreground" htmlFor="prescription-context">Why was this prescribed?</label><p className="mt-1 text-sm text-muted-foreground">This gives the assistant useful background without asking it to diagnose.</p><textarea id="prescription-context" rows={4} value={context} onChange={(event) => setContext(event.target.value)} placeholder="For example: I received this after a visit for a sore throat..." className="mt-3 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
            {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
            <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? "Reviewing..." : "Review prescription"}</Button>
          </form>
          {result ? <div aria-live="polite" className="border-t border-border bg-primary-soft/40 p-5 sm:p-7"><h2 className="font-semibold text-foreground">Prescription text detected</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{result.prescriptionText || "No text could be read clearly from this image."}</p><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{result.message}</p><p className="mt-4 flex gap-2 text-xs leading-relaxed text-muted-foreground"><CheckCircleIcon className="h-4 w-4 flex-none text-primary" />Confirm every medicine name, strength, and instruction with a pharmacist or clinician.</p></div> : null}
        </section>
      </div></Container>
    </main>
  );
}