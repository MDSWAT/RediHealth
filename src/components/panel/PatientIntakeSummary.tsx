"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { patientIntakeTranslations } from "@/lib/i18n/patient-intake-translations";
import { documentBytes } from "@/lib/patient-intake";
import type { PatientDocument, PatientIntake } from "@/lib/types/patient";
import { PatientPhotoTrigger } from "./PatientMedia";

export function PatientIntakeSummary({ intake }: { intake?: PatientIntake | null }) {
  const { lang } = useLanguage();
  const t = patientIntakeTranslations[lang];
  const [error, setError] = useState("");

  function download(document: PatientDocument) {
    setError("");
    if (documentBytes(document.data_url) === null) { setError(t.fileError); return; }
    const [prefix, base64] = document.data_url.split(",");
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: prefix.slice(5, -7) }));
    const link = window.document.createElement("a");
    link.href = url;
    link.download = document.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (!intake || (!intake.location && !intake.has_documents)) return null;
  return <section className="crm-card space-y-4">
    {intake.location && <div>
      <h2>{t.location}</h2>
      <p className="text-sm font-display tabular-nums text-[var(--panel-ink)]">{intake.location.latitude.toFixed(6)}, {intake.location.longitude.toFixed(6)}</p>
      <p className="mt-0.5 text-xs font-display tabular-nums text-[var(--panel-muted)]">{t.accuracy}: {Math.round(intake.location.accuracy)} m</p>
    </div>}
    {intake.has_documents && <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="!mb-0">{t.documents}</h2>
        <span className="text-sm font-display tabular-nums text-[var(--panel-muted)]">{intake.documents.length}</span>
      </div>
      {intake.documents.length === 0 ? (
        <p className="text-sm text-[var(--panel-muted)]">{t.hasDocuments}</p>
      ) : (
        <ul className="divide-y divide-[var(--panel-line)] border-t border-[var(--panel-line)]">{intake.documents.map((document) => <li key={document.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 last:pb-0">
          <div className="patient-document-identity">{/^data:image\/(png|jpeg|webp|gif);base64,/i.test(document.data_url) && <div className="patient-document-preview"><PatientPhotoTrigger photo={{ id: document.id, name: document.name, data_url: document.data_url, date: "" }} /></div>}<div className="min-w-0"><p className="break-all text-sm font-medium text-[var(--panel-ink)]">{document.name}</p><p className="text-xs text-[var(--panel-muted)]">{document.category === "identity" ? t.identity : t.medical}</p></div></div>
          <button type="button" onClick={() => download(document)} className="inline-flex min-h-11 items-center whitespace-nowrap px-2 text-sm font-semibold text-primary hover:underline dark:text-[#bad7fa]">{t.download}</button>
        </li>)}</ul>
      )}
    </div>}
    {error && <p role="alert" className="text-sm text-[#b91c1c] dark:text-[#ffb4b4]">{error}</p>}
  </section>;
}
