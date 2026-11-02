import type { Lang } from "@/lib/i18n/translations";

type SiteMetadata = {
  title: string;
  description: string;
  skipLink: string;
  openGraphLocale: string;
};

export const siteMetadata: Record<Lang, SiteMetadata> = {
  en: {
    title: "RediHealth - Better health starts with knowing what to do next",
    description:
      "Understand your health risks, learn how to protect your health, and get help accessing the medical care you need.",
    skipLink: "Skip to main content",
    openGraphLocale: "en_US",
  },
  ro: {
    title: "RediHealth - O sănătate mai bună începe cu a ști ce ai de făcut mai departe",
    description:
      "Înțelege-ți riscurile pentru sănătate, află cum să te protejezi și primește ajutor pentru a accesa îngrijirea medicală de care ai nevoie.",
    skipLink: "Sari la conținutul principal",
    openGraphLocale: "ro_RO",
  },
  sq: {
    title: "RediHealth - Shëndeti më i mirë fillon me dijen se çfarë të bësh më pas",
    description:
      "Kupto rreziqet për shëndetin tënd, mëso si të mbrohesh dhe merr ndihmë për të hyrë te kujdesi mjekësor që të nevojitet.",
    skipLink: "Kalo te përmbajtja kryesore",
    openGraphLocale: "sq_AL",
  },
  it: {
    title: "RediHealth - Una salute migliore inizia sapendo cosa fare dopo",
    description:
      "Comprendi i tuoi rischi per la salute, scopri come proteggerti e ricevi aiuto per accedere alle cure mediche di cui hai bisogno.",
    skipLink: "Vai al contenuto principale",
    openGraphLocale: "it_IT",
  },
};
