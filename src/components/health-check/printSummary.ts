"use client";

import { BRAND_NAME, LOGO_SRC } from "@/components/ui/Logo";

export interface PrintableSummary {
  lang: string;
  /** Line under the title, e.g. "Pentru medic · 8 noiembrie 2026". */
  meta: string;
  title: string;
  rows: { label: string; value: string }[];
  notes: string[];
  /** Emergency / no-emergency line; shown in red when `urgent`. */
  status: string;
  urgent: boolean;
  /** Footer line, e.g. the disclaimer. */
  footer?: string;
  /** Used by "Save as PDF" as the file name. */
  fileName: string;
}

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

/**
 * Prints the doctor summary as its own clean A4 document (with the site logo) instead of the
 * live page, so the PDF never depends on overlays, scroll position or page styles.
 */
export function printSummary(summary: PrintableSummary) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(frame);

  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) {
    frame.remove();
    return;
  }

  const logoUrl = new URL(LOGO_SRC, window.location.origin).href;
  const rows = summary.rows
    .map((r) => `<div class="row"><dt>${escape(r.label)}</dt><dd>${escape(r.value)}</dd></div>`)
    .join("");
  const notes = summary.notes.map((n) => `<p class="note">${escape(n)}</p>`).join("");

  doc.open();
  doc.write(`<!doctype html>
<html lang="${escape(summary.lang)}">
<head>
<meta charset="utf-8">
<title>${escape(summary.fileName)}</title>
<style>
  /* Zero page margin hides the browser's own date / URL / page-number lines; spacing lives on body. */
  @page { size: A4; margin: 0; }
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  html { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; padding: 18mm 16mm; background: #fff; color: #0b132b; font: 12pt/1.45 -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
  header { display: flex; align-items: center; gap: 10px; padding-bottom: 12px; border-bottom: 1.5px solid #0b132b; }
  header img { width: 32px; height: 32px; }
  header span { font-size: 15pt; font-weight: 600; letter-spacing: -0.01em; }
  h1 { margin: 18px 0 2px; font-size: 20pt; line-height: 1.2; }
  .meta { margin: 0 0 14px; color: #475569; font-size: 10.5pt; }
  dl { margin: 0; border-top: 1px solid #e2e8f0; }
  .row { display: grid; grid-template-columns: 34% 1fr; gap: 12px; padding: 9px 0; border-bottom: 1px solid #e2e8f0; break-inside: avoid; }
  dt { color: #475569; font-size: 10.5pt; }
  dd { margin: 0; font-weight: 600; }
  .note { margin: 12px 0 0; }
  .status { margin: 14px 0 0; font-weight: 600; color: #475569; }
  .status.urgent { color: #c62f3c; }
  footer { margin-top: 22px; padding-top: 10px; border-top: 1px solid #e2e8f0; color: #475569; font-size: 9.5pt; }
</style>
</head>
<body>
  <header><img src="${escape(logoUrl)}" alt=""><span>${escape(BRAND_NAME)}</span></header>
  <h1>${escape(summary.title)}</h1>
  <p class="meta">${escape(summary.meta)}</p>
  <dl>${rows}</dl>
  ${notes}
  <p class="status${summary.urgent ? " urgent" : ""}">${escape(summary.status)}</p>
  ${summary.footer ? `<footer>${escape(summary.footer)}</footer>` : ""}
</body>
</html>`);
  doc.close();

  const cleanup = () => setTimeout(() => frame.remove(), 500);
  const run = () => {
    win.addEventListener("afterprint", cleanup, { once: true });
    win.focus();
    win.print();
    // Some browsers never fire afterprint for iframes; remove the frame anyway.
    setTimeout(() => frame.isConnected && frame.remove(), 60_000);
  };

  // Print once the logo has loaded (or failed), so it is on the page.
  const img = doc.querySelector("img");
  if (img && !img.complete) {
    img.addEventListener("load", run, { once: true });
    img.addEventListener("error", run, { once: true });
  } else {
    run();
  }
}
