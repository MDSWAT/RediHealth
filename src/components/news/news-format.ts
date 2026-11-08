import type { Lang } from "@/lib/i18n/translations";

/**
 * Deterministic date formatting for news items.
 * Intl month names differ between the server's ICU data and some browsers (Albanian is often
 * missing), which made server and client disagree and broke hydration. A fixed table cannot drift.
 */
const MONTHS: Record<Lang, { long: string[]; short: string[] }> = {
  ro: {
    long: ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"],
    short: ["ian.", "feb.", "mar.", "apr.", "mai", "iun.", "iul.", "aug.", "sept.", "oct.", "nov.", "dec."],
  },
  en: {
    long: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
  sq: {
    long: ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"],
    short: ["jan", "shk", "mar", "pri", "maj", "qer", "korr", "gush", "sht", "tet", "nën", "dhj"],
  },
  it: {
    long: ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
    short: ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"],
  },
};

const RO_MONTH_INDEX: Record<string, number> = Object.fromEntries(MONTHS.ro.long.map((m, i) => [m, i]));

/** Reads "2026-11-04" or the Romanian "4 noiembrie 2026"; null for anything else. */
function parseNewsDate(value: string): { y: number; m: number; d: number } | null {
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return { y: Number(iso[1]), m: Number(iso[2]) - 1, d: Number(iso[3]) };
  const ro = value.match(/^(\d{1,2})\s+([a-zăâîșț]+)\s+(\d{4})$/i);
  if (ro) {
    const m = RO_MONTH_INDEX[ro[2].toLowerCase()];
    if (m !== undefined) return { y: Number(ro[3]), m, d: Number(ro[1]) };
  }
  return null;
}

/** "4 noiembrie 2026", "4 November 2026", "4 nëntor 2026", "4 novembre 2026". Unknown formats pass through. */
export function formatNewsDate(value: string, lang: Lang, { short = false, year = true } = {}): string {
  if (!value) return "";
  const parsed = parseNewsDate(value);
  if (!parsed) return value;
  const names = MONTHS[lang] ?? MONTHS.ro;
  const month = (short ? names.short : names.long)[parsed.m];
  return year ? `${parsed.d} ${month} ${parsed.y}` : `${parsed.d} ${month}`;
}
