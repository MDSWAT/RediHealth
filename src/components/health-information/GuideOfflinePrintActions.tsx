"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n/translations";
import { cn } from "@/lib/cn";
import { DownloadIcon, PrinterIcon } from "@/components/ui/icons";

const GUIDES_CACHE_NAME = "redihealth-guides-v1";
const GUIDE_ROUTE_REGEX =
  /^(\/(ro|en|sq|it|hr|rom|ru))?\/health-information(\/|$)/;

interface OfflinePrintCopy {
  printLabel: string;
  printAria: string;
  saveLabel: string;
  savingLabel: string;
  savedLabel: string;
  savedStatus: string;
  downloadedStatus: string;
  errorStatus: string;
}

export const GUIDE_OFFLINE_PRINT_COPY: Record<Lang, OfflinePrintCopy> = {
  ro: {
    printLabel: "Tipărește sau salvează",
    printAria: "Tipărește ghidul sau salvează-l ca PDF",
    saveLabel: "Salvează offline",
    savingLabel: "Se salvează...",
    savedLabel: "Salvat offline",
    savedStatus: "Ghid salvat pentru citire fără internet.",
    downloadedStatus: "Ghidul a fost descărcat ca fișier text.",
    errorStatus: "Nu s-a putut salva automat. Folosește Tipărește sau salvează PDF.",
  },
  en: {
    printLabel: "Print or save PDF",
    printAria: "Print this guide or save it as PDF",
    saveLabel: "Save offline",
    savingLabel: "Saving...",
    savedLabel: "Saved offline",
    savedStatus: "Guide saved for offline reading.",
    downloadedStatus: "Guide downloaded as a text file.",
    errorStatus: "Could not save automatically. Use Print or save PDF instead.",
  },
  sq: {
    printLabel: "Printo ose ruaj PDF",
    printAria: "Printo këtë udhëzues ose ruaje si PDF",
    saveLabel: "Ruaj jashtë linje",
    savingLabel: "Po ruhet...",
    savedLabel: "Ruajtur jashtë linje",
    savedStatus: "Udhëzuesi u ruajt për lexim jashtë linje.",
    downloadedStatus: "Udhëzuesi u shkarkua si skedar tekst.",
    errorStatus: "Nuk u ruajt dot automatikisht. Përdor Printo ose ruaj PDF.",
  },
  it: {
    printLabel: "Stampa o salva PDF",
    printAria: "Stampa questa guida o salvala come PDF",
    saveLabel: "Salva offline",
    savingLabel: "Salvataggio...",
    savedLabel: "Salvato offline",
    savedStatus: "Guida salvata per la lettura offline.",
    downloadedStatus: "Guida scaricata come file di testo.",
    errorStatus: "Impossibile salvare automaticamente. Usa Stampa o salva PDF.",
  },
  hr: {
    printLabel: "Ispiši ili spremi PDF",
    printAria: "Ispiši ovaj vodič ili ga spremi kao PDF",
    saveLabel: "Spremi izvan mreže",
    savingLabel: "Spremanje...",
    savedLabel: "Spremljeno offline",
    savedStatus: "Vodič je spremljen za čitanje izvan mreže.",
    downloadedStatus: "Vodič je preuzet kao tekstualna datoteka.",
    errorStatus: "Automatsko spremanje nije uspjelo. Upotrijebi Ispiši ili spremi PDF.",
  },
  rom: {
    printLabel: "Printisardes vaj garav",
    printAria: "Printisardes kado drom vaj garav les sar PDF",
    saveLabel: "Garav bi-internetesko",
    savingLabel: "Garavel pes...",
    savedLabel: "Garavdo offline",
    savedStatus: "O drom si garavdo te drabares bi-internetesko.",
    downloadedStatus: "O drom si telardo sar tekstosko fajlo.",
    errorStatus: "Naštisajlo te garavel pes korkoro. Lelab Printisardes vaj garav.",
  },
  ru: {
    printLabel: "Печать или PDF",
    printAria: "Распечатать памятку или сохранить в PDF",
    saveLabel: "Сохранить офлайн",
    savingLabel: "Сохранение...",
    savedLabel: "Сохранено офлайн",
    savedStatus: "Памятка сохранена для чтения без интернета.",
    downloadedStatus: "Памятка скачана в виде текстового файла.",
    errorStatus: "Не удалось сохранить автоматически. Используйте Печать или PDF.",
  },
};

function sanitizeFilename(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f\u0400-\u04ff]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "redihealth-guide";
}

function sendWorkerGuideCache(worker: ServiceWorker, path: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof MessageChannel === "undefined") {
      resolve(false);
      return;
    }
    const channel = new MessageChannel();
    const timer = window.setTimeout(() => resolve(false), 3000);
    channel.port1.onmessage = (event) => {
      window.clearTimeout(timer);
      resolve(Boolean(event.data?.ok));
    };
    try {
      worker.postMessage({ type: "CACHE_GUIDE", url: path }, [channel.port2]);
    } catch {
      window.clearTimeout(timer);
      resolve(false);
    }
  });
}

async function saveGuideToOfflineCache(pathname: string): Promise<boolean> {
  if (!GUIDE_ROUTE_REGEX.test(pathname)) return false;

  if ("serviceWorker" in navigator) {
    try {
      let reg = await navigator.serviceWorker.getRegistration("/");
      if (!reg) {
        reg = await navigator.serviceWorker.register("/offline-worker.js", { scope: "/" });
      }
      const worker = reg.active ?? navigator.serviceWorker.controller ?? reg.waiting ?? reg.installing;
      if (worker && worker.state === "activated") {
        const ok = await sendWorkerGuideCache(worker, pathname);
        if (ok) return true;
      }
    } catch {
      // Fall through to direct Cache Storage fallback for non-PHI guide routes
    }
  }

  if (typeof window !== "undefined" && "caches" in window) {
    try {
      const response = await fetch(pathname, { credentials: "omit", cache: "no-store" });
      if (!response.ok) return false;
      const cc = (response.headers.get("cache-control") || "").toLowerCase();
      if (cc.includes("no-store") || cc.includes("private")) return false;
      const cache = await window.caches.open(GUIDES_CACHE_NAME);
      await cache.put(pathname, response);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

export interface GuideOfflinePrintActionsProps {
  lang: Lang;
  title?: string;
  saveText?: string;
  className?: string;
}

export function GuideOfflinePrintActions({
  lang,
  title = "",
  saveText,
  className = "",
}: GuideOfflinePrintActionsProps) {
  const copy = GUIDE_OFFLINE_PRINT_COPY[lang] ?? GUIDE_OFFLINE_PRINT_COPY.ro;
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "downloaded" | "error">(
    "idle",
  );

  const handlePrint = () => {
    if (typeof window === "undefined") return;
    window.print();
  };

  const handleSaveOffline = async () => {
    if (typeof window === "undefined" || saveState === "saving") return;
    setSaveState("saving");

    const pathname = window.location.pathname;
    const cached = await saveGuideToOfflineCache(pathname);
    if (cached) {
      setSaveState("saved");
      return;
    }

    if (saveText && saveText.trim().length > 0 && typeof Blob !== "undefined") {
      try {
        const content = title ? `${title}\n\n${saveText}` : saveText;
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `${sanitizeFilename(title)}.txt`;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
        setSaveState("downloaded");
        return;
      } catch {
        // Fall through to gentle status note
      }
    }

    setSaveState("error");
  };

  const saveButtonText =
    saveState === "saving"
      ? copy.savingLabel
      : saveState === "saved"
        ? copy.savedLabel
        : copy.saveLabel;

  const statusMessage =
    saveState === "saved"
      ? copy.savedStatus
      : saveState === "downloaded"
        ? copy.downloadedStatus
        : saveState === "error"
          ? copy.errorStatus
          : null;

  return (
    <div className={cn("print:hidden flex flex-wrap items-center gap-2.5", className)}>
      <button
        type="button"
        onClick={handlePrint}
        aria-label={copy.printAria}
        className="press-row inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-border-control bg-card px-4 py-2 text-body font-semibold text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <PrinterIcon className="h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border" />
        <span>{copy.printLabel}</span>
      </button>

      <button
        type="button"
        onClick={() => void handleSaveOffline()}
        disabled={saveState === "saving"}
        className={cn(
          "press-row inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2 text-body font-semibold transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          saveState === "saved"
            ? "border-sapphire/50 bg-sapphire-soft/70 text-sapphire dark:text-sapphire-border"
            : "border-border-control bg-card text-foreground hover:bg-muted",
        )}
      >
        <DownloadIcon className="h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border" />
        <span>{saveButtonText}</span>
      </button>

      {statusMessage && (
        <p role="status" aria-live="polite" className="text-meta text-muted-foreground">
          {statusMessage}
        </p>
      )}
    </div>
  );
}
