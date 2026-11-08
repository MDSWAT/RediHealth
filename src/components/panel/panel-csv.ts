/**
 * CSV export for staff lists. Every cell is quoted, spreadsheet formulas are neutralised
 * (phone numbers such as "+40 712 345 678" stay intact), and a BOM keeps diacritics readable in Excel.
 */
export function csvCell(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  const risky = /^[=@\t\r]/.test(text) || /^[+-](?![\d\s().-]*$)/.test(text);
  return `"${(risky ? "'" : "") + text.replaceAll('"', '""')}"`;
}

/** Local, sortable timestamp ("2026-11-07 09:05") that spreadsheets parse in every locale. */
export function csvTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function toCsv(header: string[], rows: Array<Array<string | number | null | undefined>>): string {
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function downloadCsv(filename: string, header: string[], rows: Array<Array<string | number | null | undefined>>): void {
  const url = URL.createObjectURL(new Blob(["﻿", toCsv(header, rows)], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
