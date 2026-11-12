import type { Lang } from "@/lib/i18n/translations";

type SiteMetadata = {
  title: string;
  description: string;
  skipLink: string;
  openGraphLocale: string;
};

export const siteMetadata: Record<Lang, SiteMetadata> = {
  ru: {
    title: "RediHealth: медицинская информация и помощь в поиске медицинской помощи",
    description:
      "Бесплатная медицинская информация простыми словами. Проверьте свои симптомы, найдите аптеку или врача и обратитесь за помощью к медицинскому посреднику.",
    skipLink: "Перейти к основному содержанию",
    openGraphLocale: "ru_RU",
  },

  en: {
    title: "RediHealth: health information and help finding care",
    description:
      "Free, clear health information. Check your symptoms, find a pharmacy or doctor, and get help from a health mediator.",
    skipLink: "Skip to main content",
    openGraphLocale: "en_US",
  },
  ro: {
    title: "RediHealth: informații de sănătate și ajutor să ajungi la medic",
    description:
      "Informații de sănătate gratuite, pe înțelesul tău. Verifică-ți simptomele, găsește o farmacie sau un medic și cere ajutor de la un mediator sanitar.",
    skipLink: "Sari la conținutul principal",
    openGraphLocale: "ro_RO",
  },
  sq: {
    title: "RediHealth: informacion për shëndetin dhe ndihmë për të gjetur mjekun",
    description:
      "Informacion falas dhe i qartë për shëndetin. Kontrollo simptomat, gjej një farmaci ose mjek dhe kërko ndihmë nga një mediator shëndetësor.",
    skipLink: "Kalo te përmbajtja kryesore",
    openGraphLocale: "sq_AL",
  },
  it: {
    title: "RediHealth: informazioni sulla salute e aiuto per trovare le cure",
    description:
      "Informazioni gratuite e chiare sulla salute. Controlla i sintomi, trova una farmacia o un medico e chiedi aiuto a un mediatore sanitario.",
    skipLink: "Vai al contenuto principale",
    openGraphLocale: "it_IT",
  },
  hr: {
    title: "RediHealth: informacije o zdravlju i pomoć pri dolasku do liječnika",
    description:
      "Besplatne i jasne informacije o zdravlju. Provjeri simptome, pronađi ljekarnu ili liječnika i zatraži pomoć zdravstvenog medijatora.",
    skipLink: "Preskoči na glavni sadržaj",
    openGraphLocale: "hr_HR",
  },
  rom: {
    title: "RediHealth: sastipnaske informaciye thaj zhutimos te areses ko doktori",
    description:
      "Chache sastipnaske informaciye bi lovesko. Dikh che simptome, arakh ekh farmaciya vay doktori thaj mang zhutimos katar ekh sastipnasko mediatori.",
    skipLink: "Nakhsav ko sherutno kotor",
    openGraphLocale: "rom_RO",
  },
};
