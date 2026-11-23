import type { Lang } from "@/lib/i18n/translations";

export const cabinetTranslations: Record<Lang, { overview: string; private: string; intro: string; teamHint: string }> = {
  en: { overview: "Overview", private: "Private health record", intro: "Your care, in one place.", teamHint: "The people supporting your care." },
  ro: { overview: "Pe scurt", private: "Dosar medical privat", intro: "Îngrijirea ta, într-un singur loc.", teamHint: "Oamenii care te sprijină în îngrijire." },
  sq: { overview: "Përmbledhje", private: "Dosje shëndetësore private", intro: "Kujdesi yt, në një vend.", teamHint: "Njerëzit që mbështesin kujdesin tënd." },
  it: { overview: "Panoramica", private: "Cartella sanitaria privata", intro: "Le tue cure, in un solo posto.", teamHint: "Le persone che ti aiutano nelle cure." },
  hr: { overview: "Pregled", private: "Privatni zdravstveni karton", intro: "Tvoja skrb, na jednom mjestu.", teamHint: "Ljudi koji ti pomažu u skrbi." },
  rom: { overview: "Pe skurto", private: "Privato sastipnasko dosaro", intro: "Tiri grizha, and-ekh than.", teamHint: "Le manusha save azhutinen tiri grizha." },
  ru: { overview: "Обзор", private: "Личная медицинская карта", intro: "Ваша помощь в одном месте.", teamHint: "Люди, которые помогают вам заботиться о здоровье." },
};
