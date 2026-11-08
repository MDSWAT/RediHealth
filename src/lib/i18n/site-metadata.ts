import type { Lang } from "@/lib/i18n/translations";

type SiteMetadata = {
  title: string;
  description: string;
  skipLink: string;
  openGraphLocale: string;
};

export const siteMetadata: Record<Lang, SiteMetadata> = {
  en: {
    title: "RediHealth: health information and help finding care",
    description:
      "Free health information in plain words. Check your symptoms, find a pharmacy or doctor, and get help from a health mediator.",
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
      "Informacion falas për shëndetin, me fjalë të thjeshta. Kontrollo simptomat, gjej një farmaci ose mjek dhe kërko ndihmë nga një ndërmjetës shëndetësor.",
    skipLink: "Kalo te përmbajtja kryesore",
    openGraphLocale: "sq_AL",
  },
  it: {
    title: "RediHealth: informazioni sulla salute e aiuto per trovare le cure",
    description:
      "Informazioni gratuite sulla salute, in parole semplici. Controlla i sintomi, trova una farmacia o un medico e chiedi aiuto a un mediatore sanitario.",
    skipLink: "Vai al contenuto principale",
    openGraphLocale: "it_IT",
  },
};
