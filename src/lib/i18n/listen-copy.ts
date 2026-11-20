import type { Lang } from "./translations";

export type ListenCopy = {
  listen: string;
  stop: string;
  /** Shown on the button between the tap and the first sound, while the voice is fetched. */
  loading: string;
};

/**
 * Canonical 7-language Listen / Stop control copy (P08 / LIT-30).
 * Single source of truth for the visible button word across all surfaces.
 * Native speaker check recommended for `rom` and `ru`.
 */
export const LISTEN_COPY: Record<Lang, ListenCopy> = {
  ro: { listen: "Ascultă", stop: "Oprește", loading: "Se încarcă…" },
  en: { listen: "Listen", stop: "Stop", loading: "Loading…" },
  sq: { listen: "Dëgjo", stop: "Ndalo", loading: "Po ngarkohet…" },
  it: { listen: "Ascolta", stop: "Ferma", loading: "Caricamento…" },
  hr: { listen: "Poslušaj", stop: "Zaustavi", loading: "Učitavanje…" },
  rom: { listen: "Ashun", stop: "Achav", loading: "Phardel pes…" },
  ru: { listen: "Слушать", stop: "Стоп", loading: "Загрузка…" },
};
