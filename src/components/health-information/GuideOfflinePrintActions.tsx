"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n/translations";
import { cn } from "@/lib/cn";
import { DownloadIcon, PrinterIcon } from "@/components/ui/icons";
import {
  GUIDES_CACHE_NAME,
  GUIDE_ROUTE_REGEX,
  addSavedGuide,
  announceSavedGuidesChanged,
  readSavedGuides,
} from "@/lib/pwa/saved-guides";

/** Kept by the service worker under "redihealth-guides-v1"; see `@/lib/pwa/saved-guides`. */
const WORKER_SAVE_TIMEOUT_MS = 45_000;
const WORKER_READY_TIMEOUT_MS = 8_000;

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

/*
 * One "save" only: the first button prints, the second keeps the page on the phone.
 * Both labels are short enough to stay on one line at 320px in every language.
 */
export const GUIDE_OFFLINE_PRINT_COPY: Record<Lang, OfflinePrintCopy> = {
  ro: {
    printLabel: "Tipărește",
    printAria: "Tipărește ghidul sau salvează-l ca PDF",
    saveLabel: "Salvează pe telefon",
    savingLabel: "Se salvează...",
    savedLabel: "Salvat pe telefon",
    savedStatus:
      "Salvat. Îl poți deschide fără internet. Îl găsești pe pagina Învață și testează-te, la Salvate pe telefon.",
    downloadedStatus: "Ghidul a fost descărcat ca fișier text.",
    errorStatus: "Nu s-a putut salva. Verifică internetul și încearcă din nou.",
  },
  en: {
    printLabel: "Print",
    printAria: "Print this guide or save it as PDF",
    saveLabel: "Save on this phone",
    savingLabel: "Saving...",
    savedLabel: "Saved on this phone",
    savedStatus:
      "Saved. You can open it without internet. Find it on the page Learn and test yourself, under Saved on this phone.",
    downloadedStatus: "Guide downloaded as a text file.",
    errorStatus: "Could not save. Check your internet and try again.",
  },
  sq: {
    printLabel: "Printo",
    printAria: "Printo këtë udhëzues ose ruaje si PDF",
    saveLabel: "Ruaj në telefon",
    savingLabel: "Po ruhet...",
    savedLabel: "Ruajtur në telefon",
    savedStatus:
      "U ruajt. Mund ta hapësh pa internet. E gjen te faqja Mëso dhe testo veten, te Ruajtur në telefon.",
    downloadedStatus: "Udhëzuesi u shkarkua si skedar tekst.",
    errorStatus: "Nuk u ruajt dot. Kontrollo internetin dhe provo përsëri.",
  },
  it: {
    printLabel: "Stampa",
    printAria: "Stampa questa guida o salvala come PDF",
    saveLabel: "Salva sul telefono",
    savingLabel: "Salvataggio...",
    savedLabel: "Salvata sul telefono",
    savedStatus:
      "Salvata. Puoi aprirla senza internet. La trovi nella pagina Impara e mettiti alla prova, in Salvate sul telefono.",
    downloadedStatus: "Guida scaricata come file di testo.",
    errorStatus: "Salvataggio non riuscito. Controlla internet e riprova.",
  },
  hr: {
    printLabel: "Ispiši",
    printAria: "Ispiši ovaj vodič ili ga spremi kao PDF",
    saveLabel: "Spremi na mobitel",
    savingLabel: "Spremanje...",
    savedLabel: "Spremljeno na mobitelu",
    savedStatus:
      "Spremljeno. Možeš ga otvoriti bez interneta. Naći ćeš ga na stranici Uči i testiraj se, pod Spremljeno na mobitelu.",
    downloadedStatus: "Vodič je preuzet kao tekstualna datoteka.",
    errorStatus: "Spremanje nije uspjelo. Provjeri internet i pokušaj ponovno.",
  },
  rom: {
    printLabel: "Printisardes",
    printAria: "Printisardes kado drom vaj garav les sar PDF",
    saveLabel: "Garav po telefono",
    savingLabel: "Garavel pes...",
    savedLabel: "Garavdo po telefono",
    savedStatus:
      "Garavdo. Shaj putres les bi internetesko. Arakhes les pe rig Sikljov thaj proba tu, tela Garavde po telefono.",
    downloadedStatus: "O drom si telardo sar tekstosko fajlo.",
    errorStatus: "Naštisajlo te garavel pes. Dikh o interneto thaj zumav palem.",
  },
  ru: {
    printLabel: "Печать",
    printAria: "Распечатать памятку или сохранить в PDF",
    saveLabel: "Сохранить на телефон",
    savingLabel: "Сохранение...",
    savedLabel: "Сохранено на телефоне",
    savedStatus:
      "Сохранено. Можно открыть без интернета. Найти можно на странице Учись и проверяй себя, в разделе Сохранено на телефоне.",
    downloadedStatus: "Памятка скачана в виде текстового файла.",
    errorStatus: "Не удалось сохранить. Проверьте интернет и попробуйте ещё раз.",
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

/** Script and style files this page has loaded, so the worker also keeps the parts that load late (the tools). */
function loadedStaticAssets(): string[] {
  try {
    return performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((name) => {
        try {
          const url = new URL(name);
          return url.origin === window.location.origin && url.pathname.startsWith("/_next/static/");
        } catch {
          return false;
        }
      });
  } catch {
    return [];
  }
}

function sendWorkerGuideCache(worker: ServiceWorker, path: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof MessageChannel === "undefined") {
      resolve(false);
      return;
    }
    const channel = new MessageChannel();
    // A slow phone on a weak signal needs time to fetch the page and its files.
    const timer = window.setTimeout(() => resolve(false), WORKER_SAVE_TIMEOUT_MS);
    channel.port1.onmessage = (event) => {
      window.clearTimeout(timer);
      resolve(Boolean(event.data?.ok));
    };
    try {
      worker.postMessage({ type: "CACHE_GUIDE", url: path, assets: loadedStaticAssets() }, [
        channel.port2,
      ]);
    } catch {
      window.clearTimeout(timer);
      resolve(false);
    }
  });
}

/** The running worker, waiting a little when it was registered a moment ago. */
async function findActiveWorker(): Promise<ServiceWorker | null> {
  let reg = await navigator.serviceWorker.getRegistration("/");
  if (!reg) {
    reg = await navigator.serviceWorker.register("/offline-worker.js", {
      scope: "/",
      updateViaCache: "none",
    });
  }
  if (reg.active?.state === "activated") return reg.active;
  const ready = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => window.setTimeout(() => resolve(null), WORKER_READY_TIMEOUT_MS)),
  ]);
  return ready?.active ?? null;
}

async function saveGuideToOfflineCache(pathname: string, title: string, lang: Lang): Promise<boolean> {
  if (!GUIDE_ROUTE_REGEX.test(pathname)) return false;

  if ("serviceWorker" in navigator) {
    try {
      const worker = await findActiveWorker();
      if (worker) {
        const ok = await sendWorkerGuideCache(worker, pathname);
        if (ok) return true;
      }
    } catch {
      // Fall through: the page keeps itself, for public guide addresses only.
    }
  }

  if (typeof window !== "undefined" && "caches" in window) {
    try {
      // Asked for without cookies, so the copy holds nothing about the reader. Every page of the
      // site is sent "private, no-store", so that header cannot decide; the address check above does.
      const response = await fetch(pathname, { credentials: "omit", cache: "no-store" });
      if (
        !response.ok ||
        response.type === "opaque" ||
        response.redirected ||
        !response.headers.get("content-type")?.includes("text/html")
      ) {
        return false;
      }
      const cache = await window.caches.open(GUIDES_CACHE_NAME);
      await cache.put(pathname, response);
      await addSavedGuide({ path: pathname, title: title || "RediHealth", lang });
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
  // True when this page was saved on an earlier visit: the button says so, with no message.
  const [savedEarlier, setSavedEarlier] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void readSavedGuides().then((list) => {
      if (cancelled) return;
      const here = window.location.pathname;
      setSavedEarlier(list.some((item) => item.path === here));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePrint = () => {
    if (typeof window === "undefined") return;
    window.print();
  };

  const handleSaveOffline = async () => {
    if (typeof window === "undefined" || saveState === "saving") return;
    setSaveState("saving");

    const pathname = window.location.pathname;
    const pageTitle = title || document.title.replace(/\s+[-|]\s+RediHealth\s*$/i, "");
    const cached = await saveGuideToOfflineCache(pathname, pageTitle, lang);
    if (cached) {
      setSaveState("saved");
      setSavedEarlier(true);
      announceSavedGuidesChanged();
      return;
    }

    // Last resort, only for a browser with no service worker and no cache storage at all.
    const canKeepPages = "serviceWorker" in navigator || "caches" in window;
    if (!canKeepPages && saveText && saveText.trim().length > 0 && typeof Blob !== "undefined") {
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

  const showsSaved = saveState === "saved" || (savedEarlier && saveState === "idle");

  const saveButtonText =
    saveState === "saving"
      ? copy.savingLabel
      : showsSaved
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
          showsSaved
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
