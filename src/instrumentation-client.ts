import { reloadForNewVersion } from "@/lib/chunk-reload";
import { reportClientError } from "@/lib/client-error-report";

// Runs before the app becomes interactive: report every uncaught browser error to the site's alert addresses.
try {
  // Code files of an older deployment that are gone: reload once into the new version (lib/chunk-reload.ts).
  window.addEventListener("error", (event) => {
    const error = event.error ?? event.message;
    if (reloadForNewVersion(error)) return;
    reportClientError(error, "error");
  });
  window.addEventListener("unhandledrejection", (event) => {
    if (reloadForNewVersion(event.reason)) return;
    reportClientError(event.reason, "unhandledrejection");
  });
} catch {
  // Monitoring must never stop the page from loading.
}
