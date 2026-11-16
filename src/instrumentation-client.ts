import { reportClientError } from "@/lib/client-error-report";

// Runs before the app becomes interactive: report every uncaught browser error to the site's alert addresses.
try {
  window.addEventListener("error", (event) => {
    reportClientError(event.error ?? event.message, "error");
  });
  window.addEventListener("unhandledrejection", (event) => {
    reportClientError(event.reason, "unhandledrejection");
  });
} catch {
  // Monitoring must never stop the page from loading.
}
