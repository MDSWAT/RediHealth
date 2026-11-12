import type { Metadata } from "next";
import { getRequestLang } from "@/lib/i18n/server-routing";
import type { Lang } from "@/lib/i18n/translations";

const TITLES: Record<"waiting" | "room", Record<Lang, { title: string; description: string }>> = {
  waiting: {
  ru: { title: "Зал ожидания - RediHealth", description: "Вы ждете, пока дежурный врач начнет ваш звонок." },

    ro: { title: "Sala de așteptare - RediHealth", description: "Aștepți medicul de gardă pentru apel." },
    en: { title: "Waiting room - RediHealth", description: "You are waiting for the on-call doctor to start your call." },
    sq: { title: "Dhoma e pritjes - RediHealth", description: "Po pret mjekun kujdestar për thirrjen." },
    it: { title: "Sala d'attesa - RediHealth", description: "Stai aspettando il medico di guardia per la chiamata." },
    hr: { title: "Čekaonica - RediHealth", description: "Čekaš dežurnog liječnika za početak poziva." },
    rom: { title: "Azhukeripnaski soba - RediHealth", description: "Azhukeres e doktores vash o svato." },
  },
  room: {
  ru: { title: "Вызов врача - RediHealth", description: "Ваш голосовой звонок врачу-волонтеру RediHealth." },

    ro: { title: "Apel cu medicul - RediHealth", description: "Apelul tău cu un medic voluntar RediHealth, doar prin voce." },
    en: { title: "Call with the doctor - RediHealth", description: "Your voice call with a RediHealth volunteer doctor." },
    sq: { title: "Thirrje me mjekun - RediHealth", description: "Thirrja jote me zë me një mjek vullnetar të RediHealth." },
    it: { title: "Chiamata con il medico - RediHealth", description: "La tua chiamata vocale con un medico volontario RediHealth." },
    hr: { title: "Poziv s liječnikom - RediHealth", description: "Tvoj glasovni poziv s liječnikom volonterom na platformi RediHealth." },
    rom: { title: "Svato e doktoresa - RediHealth", description: "Cho avazesko svato ekhe doktoresa volonteri katar RediHealth." },
  },
};

/** Localized title and description for the telemedicine waiting room and call room (not indexed). */
export function telemedMetadata(page: "waiting" | "room"): () => Promise<Metadata> {
  return async () => {
    const lang = await getRequestLang();
    const copy = TITLES[page][lang] ?? TITLES[page].ro;
    return { title: copy.title, description: copy.description, robots: { index: false, follow: false } };
  };
}
