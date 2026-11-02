"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { patientIntakeTranslations } from "@/lib/i18n/patient-intake-translations";
import { documentBytes } from "@/lib/patient-intake";
import type { PatientDocument, PatientIntake } from "@/lib/types/patient";

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

  if (!intake) return null;
  return <section className="crm-card space-y-4">
    {intake.location && <div>
      <h2>{t.location}</h2>
      <p className="text-sm">{intake.location.latitude.toFixed(6)}, {intake.location.longitude.toFixed(6)}</p>
      <p className="text-xs text-muted-foreground">{t.accuracy}: {Math.round(intake.location.accuracy)} m</p>
    </div>}
    <div><h2>{t.documents}</h2>
      <p className="text-sm text-muted-foreground">{intake.has_documents ? t.hasDocuments : t.noDocuments}</p>
      {intake.has_documents && <ul className="mt-3 space-y-2">{intake.documents.map((document) => <li key={document.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3">
        <div className="min-w-0"><p className="break-all text-sm font-medium">{document.name}</p><p className="text-xs text-muted-foreground">{document.category === "identity" ? t.identity : t.medical}</p></div>
        <button type="button" onClick={() => download(document)} className="min-h-11 px-2 text-sm font-semibold text-primary">{t.download}</button>
      </li>)}</ul>}
    </div>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </section>;
}
