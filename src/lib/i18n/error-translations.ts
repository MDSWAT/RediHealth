import type { Lang } from "@/lib/i18n/translations";

type ErrorCopy = {
  title: string;
  body: string;
  retry: string;
  home: string;
};

export const errorTranslations: Record<Lang, ErrorCopy> = {
  en: {
    title: "Something went wrong",
    body: "This page did not load. Try again. If it still does not work, come back in a few minutes.",
    retry: "Try again",
    home: "Go to home page",
  },
  ro: {
    title: "Ceva n-a mers",
    body: "Pagina nu s-a încărcat. Încearcă din nou. Dacă tot nu merge, revino peste câteva minute.",
    retry: "Încearcă din nou",
    home: "Mergi la prima pagină",
  },
  sq: {
    title: "Diçka shkoi keq",
    body: "Faqja nuk u hap. Provo përsëri. Nëse ende nuk funksionon, kthehu pas disa minutash.",
    retry: "Provo përsëri",
    home: "Shko te faqja kryesore",
  },
  it: {
    title: "Qualcosa è andato storto",
    body: "La pagina non si è caricata. Riprova. Se ancora non funziona, torna tra qualche minuto.",
    retry: "Riprova",
    home: "Vai alla pagina iniziale",
  },
  hr: {
    title: "Nešto je pošlo po zlu",
    body: "Stranica se nije učitala. Pokušaj ponovno. Ako i dalje ne radi, vrati se za nekoliko minuta.",
    retry: "Pokušaj ponovno",
    home: "Idi na početnu stranicu",
  },
  rom: {
    title: "Vareso na gelo mishto",
    body: "I rig na putardili. Zumav palem. Te inke na kerel buchi, av palpale palo nekobor minute.",
    retry: "Zumav palem",
    home: "Zha ki angluni rig",
  },
};
