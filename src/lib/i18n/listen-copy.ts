import type { Lang } from "./translations";

export type ListenCopy = {
  listen: string;
  stop: string;
};

/**
 * Canonical 7-language Listen / Stop control copy (P08 / LIT-30).
 * Single source of truth for the visible button word across all surfaces.
 * Native speaker check recommended for `rom` and `ru`.
 */
export const LISTEN_COPY: Record<Lang, ListenCopy> = {
  ro: { listen: "Ascultă", stop: "Oprește" },
  en: { listen: "Listen", stop: "Stop" },
  sq: { listen: "Dëgjo", stop: "Ndalo" },
  it: { listen: "Ascolta", stop: "Ferma" },
  hr: { listen: "Poslušaj", stop: "Zaustavi" },
  rom: { listen: "Ashun", stop: "Achav" },
  ru: { listen: "Слушать", stop: "Стоп" },
};
