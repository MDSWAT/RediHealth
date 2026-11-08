import type { Metadata } from "next";
import { getRequestLang } from "@/lib/i18n/server-routing";
import type { Lang } from "@/lib/i18n/translations";

const TITLES: Record<"waiting" | "room", Record<Lang, { title: string; description: string }>> = {
  waiting: {
    ro: { title: "Camera de așteptare - RediHealth", description: "Aștepți medicul de gardă pentru consultația video." },
    en: { title: "Waiting room - RediHealth", description: "You are waiting for the on-call doctor for your video consultation." },
    sq: { title: "Dhoma e pritjes - RediHealth", description: "Po prisni mjekun kujdestar për konsultën me video." },
    it: { title: "Sala d'attesa - RediHealth", description: "Stai aspettando il medico di guardia per la visita video." },
  },
  room: {
    ro: { title: "Consultație video - RediHealth", description: "Camera video pentru consultația cu un medic voluntar RediHealth." },
    en: { title: "Video consultation - RediHealth", description: "The video room for your consultation with a RediHealth volunteer doctor." },
    sq: { title: "Konsultë me video - RediHealth", description: "Dhoma e videos për konsultën me një mjek vullnetar të RediHealth." },
    it: { title: "Visita video - RediHealth", description: "La sala video per la visita con un medico volontario RediHealth." },
  },
};

/** Localized title and description for the telemedicine waiting room and video room (not indexed). */
export function telemedMetadata(page: "waiting" | "room"): () => Promise<Metadata> {
  return async () => {
    const lang = await getRequestLang();
    const copy = TITLES[page][lang] ?? TITLES[page].ro;
    return { title: copy.title, description: copy.description, robots: { index: false, follow: false } };
  };
}
